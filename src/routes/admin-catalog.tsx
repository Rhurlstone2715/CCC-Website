import { randomBytes } from "node:crypto";
import { Hono, type Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { FC } from "hono/jsx";
import { type AppEnv, currentUser, requireAdmin } from "../auth.js";
import { CATEGORIES, TERMS, TERM_LABELS, orderedRates, type Rates } from "../catalog.js";
import { prisma } from "../db.js";
import type { Product, RiggingOption } from "../generated/prisma/client.js";
import { AdminPage, parseAmount, pendingCount } from "../views/admin-page.js";
import { Notice } from "../views/layout.js";
import { text } from "./account.js";

export const adminCatalog = new Hono<AppEnv>();
adminCatalog.use("*", requireAdmin);

const NOTICES: Record<string, { tone: "success" | "error"; text: string }> = {
  saved: { tone: "success", text: "Saved. The rentals page shows the change straight away." },
  created: { tone: "success", text: "Equipment added. It's listed on the rentals page under its category." },
  "sizes-saved": { tone: "success", text: "Size prices saved." },
  deleted: { tone: "success", text: "Equipment deleted." },
};

const money = (n: number) => `CI$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

type ProductWithSizes = Product & { riggingOptions: RiggingOption[] };

function extraOf(p: Product): Record<string, unknown> {
  return (p.extra ?? {}) as Record<string, unknown>;
}

// Items only offered inside another booking (the man basket, the telehandler operator).
function isAddOnOnly(p: Product): boolean {
  return p.operatorService || Array.isArray(extraOf(p).compatibleWith);
}

function ratesSummary(p: ProductWithSizes): string {
  if (p.riggingOptions.length) {
    const prices = p.riggingOptions.map(o => o.price).filter((v): v is number => v !== null);
    return prices.length ? `${p.riggingOptions.length} sizes from ${money(Math.min(...prices))}/day` : `${p.riggingOptions.length} sizes, priced on request`;
  }
  const rates = orderedRates(p.rates);
  return TERMS.filter(t => rates[t] !== undefined)
    .map(t => `${TERM_LABELS[t]} ${money(rates[t]!)}`)
    .join(" · ");
}

// ---------- List ----------

adminCatalog.get("/", async c => {
  const user = (await currentUser(c))!;
  const [pending, products] = await Promise.all([
    pendingCount(),
    prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { riggingOptions: { orderBy: { sortOrder: "asc" } } } }),
  ]);
  const groups = new Map<string, ProductWithSizes[]>();
  for (const p of products) {
    const key = isAddOnOnly(p) ? "Add-ons offered with other equipment" : p.category;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  const notice = NOTICES[c.req.query("notice") ?? ""];

  return c.html(
    <AdminPage title="Catalog" user={user} pending={pending} active="catalog">
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <div class="page-head">
        <p class="eyebrow">Admin</p>
        <h1>Catalog</h1>
        <p class="lede">Prices, quantities and descriptions on the rentals page. Changes show on the site as soon as you save.</p>
      </div>
      <div class="actions-row mb-4">
        <a class="button primary" href="/admin/catalog/new">
          Add equipment
        </a>
        <a class="button secondary" href="/rentals#catalog" target="_blank" rel="noopener">
          View the rentals page
        </a>
      </div>
      <div class="stack">
        {[...groups].map(([group, items]) => (
          <section class="card table-card" aria-label={group}>
            <h2 class="table-title">{group}</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th scope="col">Equipment</th>
                  <th scope="col">Rates</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">On the site</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr>
                    <td data-label="Equipment">
                      <a href={`/admin/catalog/${encodeURIComponent(p.id)}`}>{p.name}</a>
                      <span class="sub">{p.spec}</span>
                    </td>
                    <td data-label="Rates">{ratesSummary(p) || <span class="muted">None set</span>}</td>
                    <td data-label="Quantity">{p.availableQuantity ?? <span class="muted">Not shown</span>}</td>
                    <td data-label="On the site">
                      {isAddOnOnly(p) ? <span class="badge badge-approved">Add-on</span> : p.hidden ? <span class="badge badge-cancelled">Hidden</span> : <span class="badge badge-paid">Listed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </AdminPage>,
  );
});

// ---------- Uploads ----------

const IMAGE_MAX = 5 * 1024 * 1024;
const PDF_MAX = 15 * 1024 * 1024;

// Checks the file's first bytes, not just its name, before storing it.
function sniff(bytes: Uint8Array): string | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  if (starts(0x25, 0x50, 0x44, 0x46, 0x2d)) return "application/pdf";
  return null;
}

async function storeUpload(value: unknown, kind: "image" | "pdf"): Promise<{ url: string } | { error: string } | null> {
  if (!(value instanceof File) || value.size === 0) return null;
  const bytes = new Uint8Array(await value.arrayBuffer());
  const type = sniff(bytes);
  if (kind === "image" && (!type || type === "application/pdf")) return { error: "The photo must be a JPEG, PNG or WebP image." };
  if (kind === "pdf" && type !== "application/pdf") return { error: "The load chart must be a PDF." };
  if (bytes.length > (kind === "image" ? IMAGE_MAX : PDF_MAX)) {
    return { error: kind === "image" ? "The photo must be 5 MB or smaller." : "The load chart must be 15 MB or smaller." };
  }
  const upload = await prisma.upload.create({ data: { contentType: type!, size: bytes.length, data: bytes } });
  return { url: `/uploads/${upload.id}` };
}

async function deleteUploadIfOurs(url: string | null | undefined): Promise<void> {
  const id = url?.match(/^\/uploads\/([a-z0-9]+)$/)?.[1];
  if (id) await prisma.upload.deleteMany({ where: { id } });
}

// ---------- Form parsing ----------

type ProductFields = {
  name: string;
  category: string;
  spec: string;
  description: string;
  rates: Rates;
  availableQuantity: number | null;
  hidden: boolean;
  delivery: boolean;
  photo: boolean;
  sortOrder: number;
};

// The rentals page writes these values into its HTML, so angle brackets are refused.
function plain(value: unknown, label: string, max: number, required: boolean): string | { error: string } {
  const v = text(value);
  if (!v && required) return { error: `${label} is required.` };
  if (v.length > max) return { error: `${label} is too long (${max} characters at most).` };
  if (/[<>]/.test(v)) return { error: `${label} can't contain < or >.` };
  return v;
}

function parseFields(body: Record<string, unknown>, existing: ProductWithSizes | null): ProductFields | { error: string } {
  const rigging = Boolean(existing?.riggingOptions.length);
  const name = plain(body.name, "Name", 120, true);
  if (typeof name !== "string") return name;
  // Sized items get their spec and description from their sizes on the page.
  const spec = rigging ? existing!.spec : plain(body.spec, "Short spec", 200, true);
  if (typeof spec !== "string") return spec;
  const description = rigging ? existing!.description : plain(body.description, "Description", 1000, true);
  if (typeof description !== "string") return description;

  let category = existing?.category ?? "";
  if (!existing || existing.isCustom) {
    category = text(body.category);
    if (!CATEGORIES.includes(category)) return { error: "Choose a category." };
  }

  const rates: Rates = {};
  if (rigging) Object.assign(rates, orderedRates(existing!.rates));
  else {
    for (const term of TERMS) {
      const raw = text(body[`rate_${term}`]);
      if (!raw) continue;
      const cents = parseAmount(raw);
      if (cents === null) return { error: `Enter the ${TERM_LABELS[term].toLowerCase()} rate in CI$, for example 350.` };
      rates[term] = cents / 100;
    }
    if (!Object.keys(rates).length) return { error: "Enter at least one rate." };
  }

  const qtyRaw = text(body.availableQuantity);
  let availableQuantity: number | null = null;
  if (qtyRaw) {
    if (!/^\d{1,6}$/.test(qtyRaw)) return { error: "Quantity must be a whole number, or blank to hide it." };
    availableQuantity = Number(qtyRaw);
  }

  const orderRaw = text(body.sortOrder);
  if (!/^\d{1,6}$/.test(orderRaw)) return { error: "Display order must be a whole number." };

  return {
    name,
    category,
    spec,
    description,
    rates,
    availableQuantity,
    // Add-ons stay hidden; they're offered inside other bookings.
    hidden: existing && isAddOnOnly(existing) ? true : body.listed !== "on",
    delivery: body.delivery === "on",
    photo: body.photo === "on",
    sortOrder: Number(orderRaw),
  };
}

// ---------- Edit form ----------

type FormState = { product: ProductWithSizes | null; values?: Partial<ProductFields>; error?: string };

const ProductForm: FC<FormState & { nextOrder: number }> = ({ product, values, error, nextOrder }) => {
  const v: Partial<ProductFields> = values ?? (product ? { ...product, rates: orderedRates(product.rates) } : { hidden: false, sortOrder: nextOrder });
  const rigging = Boolean(product?.riggingOptions.length);
  const addOn = product ? isAddOnOnly(product) : false;
  const action = product ? `/admin/catalog/${encodeURIComponent(product.id)}` : "/admin/catalog/new";
  return (
    <form class="form flush" method="post" action={action} enctype="multipart/form-data">
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div class="field">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" value={v.name} required maxlength={120} />
      </div>
      {product && !product.isCustom ? (
        <div class="field">
          <span class="label">Category</span>
          <span>{product.category}</span>
        </div>
      ) : (
        <div class="field">
          <label for="category">Category</label>
          <select id="category" name="category" required>
            <option value="">Choose a category</option>
            {CATEGORIES.map(cat => (
              <option value={cat} selected={v.category === cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}
      {rigging ? (
        <p class="muted flush">The spec, description and rates for this item come from its sizes, which you can edit below.</p>
      ) : (
        <>
          <div class="field">
            <label for="spec">Short spec</label>
            <input id="spec" name="spec" type="text" value={v.spec} required maxlength={200} aria-describedby="spec-hint" />
            <small id="spec-hint" class="hint">
              The one-line summary under the name, for example "40 ton • 82.5' main boom".
            </small>
          </div>
          <div class="field">
            <label for="description">Description</label>
            <textarea id="description" name="description" required maxlength={1000}>
              {v.description ?? ""}
            </textarea>
          </div>
          <fieldset class="field">
            <legend class="label">Rates (CI$)</legend>
            <small class="hint">Leave a rate blank if you don't offer that term. At least one is needed.</small>
            <div class="rate-grid">
              {TERMS.map(term => (
                <div class="field">
                  <label for={`rate_${term}`}>{TERM_LABELS[term]}</label>
                  <input id={`rate_${term}`} name={`rate_${term}`} type="text" inputmode="decimal" value={v.rates?.[term] !== undefined ? String(v.rates[term]) : ""} />
                </div>
              ))}
            </div>
          </fieldset>
        </>
      )}
      <div class="rate-grid">
        <div class="field">
          <label for="availableQuantity">
            Quantity available <span class="optional">(optional)</span>
          </label>
          <input
            id="availableQuantity"
            name="availableQuantity"
            type="text"
            inputmode="numeric"
            value={v.availableQuantity === null || v.availableQuantity === undefined ? "" : String(v.availableQuantity)}
            aria-describedby="qty-hint"
          />
          <small id="qty-hint" class="hint">
            Shown on the card. Blank hides it.
          </small>
        </div>
        <div class="field">
          <label for="sortOrder">Display order</label>
          <input id="sortOrder" name="sortOrder" type="text" inputmode="numeric" value={String(v.sortOrder ?? nextOrder)} required aria-describedby="order-hint" />
          <small id="order-hint" class="hint">
            Lower numbers come first.
          </small>
        </div>
      </div>
      {addOn ? (
        <p class="muted flush">This is offered as an add-on with other equipment, so it isn't listed on its own.</p>
      ) : (
        <label class="check">
          <input type="checkbox" name="listed" checked={!v.hidden} />
          <span>Show on the rentals page</span>
        </label>
      )}
      <label class="check">
        <input type="checkbox" name="delivery" checked={Boolean(v.delivery)} />
        <span>Charge the delivery fee (applies to cranes, boom trucks and telehandlers on hourly or daily terms)</span>
      </label>
      <div class="field">
        <label for="image">
          Photo <span class="optional">(optional)</span>
        </label>
        {product?.image ? <img class="product-preview" src={product.image.startsWith("/") ? product.image : `/${product.image}`} alt="" /> : null}
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="image-hint" />
        <small id="image-hint" class="hint">
          JPEG, PNG or WebP, up to 5 MB. {product?.image ? "Choosing a file replaces the current photo." : ""}
        </small>
      </div>
      <label class="check">
        <input type="checkbox" name="photo" checked={Boolean(v.photo)} />
        <span>It's a photo, so fill the card with it (leave unticked for cut-out product images)</span>
      </label>
      <div class="field">
        <label for="chart">
          Load chart or spec sheet <span class="optional">(optional, PDF)</span>
        </label>
        {product?.chart ? (
          <a class="text-link" href={product.chart.startsWith("/") ? product.chart : `/${product.chart}`} target="_blank" rel="noopener">
            Current file
          </a>
        ) : null}
        <input id="chart" name="chart" type="file" accept="application/pdf" />
        {product?.chart ? (
          <label class="check">
            <input type="checkbox" name="removeChart" />
            <span>Remove the current file</span>
          </label>
        ) : null}
      </div>
      <div class="form-actions">
        <button class="button primary" type="submit">
          {product ? "Save changes" : "Add equipment"}
        </button>
        <a class="text-link" href="/admin/catalog">
          Cancel
        </a>
      </div>
    </form>
  );
};

const SizesForm: FC<{ product: ProductWithSizes }> = ({ product }) => (
  <section class="card">
    <h2>Sizes</h2>
    <p class="muted">Price per day for each size. Leave a price blank to show it as priced on request.</p>
    <form class="form" method="post" action={`/admin/catalog/${encodeURIComponent(product.id)}/sizes`}>
      {product.riggingOptions.map(o => (
        <div class="rate-grid">
          <div class="field">
            <label for={`size_${o.id}`}>Size label</label>
            <input id={`size_${o.id}`} name={`size_${o.id}`} type="text" value={o.size} required maxlength={80} />
          </div>
          <div class="field">
            <label for={`price_${o.id}`}>Price per day (CI$)</label>
            <input id={`price_${o.id}`} name={`price_${o.id}`} type="text" inputmode="decimal" value={o.price === null ? "" : String(o.price)} />
          </div>
        </div>
      ))}
      <div class="form-actions">
        <button class="button primary" type="submit">
          Save sizes
        </button>
      </div>
    </form>
  </section>
);

async function nextSortOrder(): Promise<number> {
  const last = await prisma.product.aggregate({ _max: { sortOrder: true } });
  return (last._max.sortOrder ?? 0) + 10;
}

async function renderEdit(c: Context<AppEnv>, state: FormState, status: 200 | 400 = 200) {
  const user = (await currentUser(c))!;
  const [pending, nextOrder] = await Promise.all([pendingCount(), nextSortOrder()]);
  const product = state.product;
  const notice = NOTICES[c.req.query("notice") ?? ""];
  return c.html(
    <AdminPage title={product ? product.name : "Add equipment"} user={user} pending={pending} active="catalog">
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <p class="back-link">
        <a class="text-link" href="/admin/catalog">
          ← Catalog
        </a>
      </p>
      <div class="page-head">
        <p class="eyebrow">Catalog</p>
        <h1>{product ? product.name : "Add equipment"}</h1>
        {product ? <p class="lede">{product.category}</p> : <p class="lede">New equipment is listed on the rentals page under its category.</p>}
      </div>
      <div class="grid-2">
        <section class="card">
          <ProductForm {...state} nextOrder={nextOrder} />
        </section>
        <div class="stack">
          {product?.riggingOptions.length ? <SizesForm product={product} /> : null}
          {product?.isCustom ? (
            <section class="card danger-zone">
              <h2>Delete equipment</h2>
              <p class="muted">Removes it from the rentals page and drops it from any customer's saved cart. Past bookings keep their copy. To take it off the site for a while, untick "Show on the rentals page" instead.</p>
              <form method="post" action={`/admin/catalog/${encodeURIComponent(product.id)}/delete`} data-confirm={`Delete ${product.name} permanently?`}>
                <button class="button danger small" type="submit">
                  Delete {product.name}
                </button>
              </form>
            </section>
          ) : product ? (
            <section class="card">
              <h2>Part of the original catalog</h2>
              <p class="muted">
                This item is wired into the page's add-ons and navigation, so it can be edited or hidden but not deleted.
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </AdminPage>,
    status,
  );
}

const loadProduct = (id: string) => prisma.product.findUnique({ where: { id }, include: { riggingOptions: { orderBy: { sortOrder: "asc" } } } });

adminCatalog.get("/new", c => renderEdit(c, { product: null }));

const uploadLimit = bodyLimit({ maxSize: 25 * 1024 * 1024, onError: c => c.text("Upload too large. Photos can be up to 5 MB and PDFs up to 15 MB.", 413) });

async function applyUploads(body: Record<string, unknown>, product: Product | null) {
  const image = await storeUpload(body.image, "image");
  if (image && "error" in image) return image;
  const chart = await storeUpload(body.chart, "pdf");
  if (chart && "error" in chart) {
    if (image) await deleteUploadIfOurs(image.url);
    return chart;
  }
  return {
    image: image?.url ?? product?.image ?? "assets/cayman-crane-logo.png",
    chart: chart?.url ?? (body.removeChart === "on" ? null : product?.chart ?? null),
  };
}

adminCatalog.post("/new", uploadLimit, async c => {
  const body = await c.req.parseBody();
  const fields = parseFields(body, null);
  if ("error" in fields) return renderEdit(c, { product: null, values: formValues(body), error: fields.error }, 400);
  const files = await applyUploads(body, null);
  if ("error" in files) return renderEdit(c, { product: null, values: { ...fields }, error: files.error }, 400);

  const slug = fields.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";
  const product = await prisma.product.create({
    data: { ...fields, id: `${slug}-${randomBytes(2).toString("hex")}`, image: files.image, chart: files.chart, isCustom: true },
  });
  return c.redirect(`/admin/catalog/${encodeURIComponent(product.id)}?notice=created`);
});

// Echo what was typed back into the form after a validation error.
function formValues(body: Record<string, unknown>): Partial<ProductFields> {
  const rates: Rates = {};
  for (const term of TERMS) {
    const cents = parseAmount(text(body[`rate_${term}`]));
    if (cents !== null) rates[term] = cents / 100;
  }
  const qty = text(body.availableQuantity);
  return {
    name: text(body.name),
    category: text(body.category),
    spec: text(body.spec),
    description: text(body.description),
    rates,
    availableQuantity: /^\d+$/.test(qty) ? Number(qty) : null,
    hidden: body.listed !== "on",
    delivery: body.delivery === "on",
    photo: body.photo === "on",
    sortOrder: Number(text(body.sortOrder)) || 0,
  };
}

adminCatalog.get("/:id", async c => {
  const product = await loadProduct(c.req.param("id"));
  return product ? renderEdit(c, { product }) : c.notFound();
});

adminCatalog.post("/:id", uploadLimit, async c => {
  const product = await loadProduct(c.req.param("id"));
  if (!product) return c.notFound();
  const body = await c.req.parseBody();
  const fields = parseFields(body, product);
  if ("error" in fields) return renderEdit(c, { product, values: formValues(body), error: fields.error }, 400);
  const files = await applyUploads(body, product);
  if ("error" in files) return renderEdit(c, { product, values: fields, error: files.error }, 400);

  await prisma.product.update({ where: { id: product.id }, data: { ...fields, image: files.image, chart: files.chart } });
  if (files.image !== product.image) await deleteUploadIfOurs(product.image);
  if (files.chart !== product.chart) await deleteUploadIfOurs(product.chart);
  return c.redirect(`/admin/catalog/${encodeURIComponent(product.id)}?notice=saved`);
});

adminCatalog.post("/:id/sizes", async c => {
  const product = await loadProduct(c.req.param("id"));
  if (!product || !product.riggingOptions.length) return c.notFound();
  const body = await c.req.parseBody();
  const updates = [];
  for (const o of product.riggingOptions) {
    const size = plain(body[`size_${o.id}`], "Size label", 80, true);
    if (typeof size !== "string") return renderEdit(c, { product, error: size.error }, 400);
    const raw = text(body[`price_${o.id}`]);
    const cents = raw ? parseAmount(raw) : null;
    if (raw && cents === null) return renderEdit(c, { product, error: `Enter the price for ${o.size} in CI$, or leave it blank.` }, 400);
    updates.push(prisma.riggingOption.update({ where: { id: o.id }, data: { size, price: cents === null ? null : cents / 100 } }));
  }
  await prisma.$transaction(updates);
  return c.redirect(`/admin/catalog/${encodeURIComponent(product.id)}?notice=sizes-saved`);
});

adminCatalog.post("/:id/delete", async c => {
  const product = await loadProduct(c.req.param("id"));
  if (!product) return c.notFound();
  if (!product.isCustom) return c.redirect(`/admin/catalog/${encodeURIComponent(product.id)}`);
  await prisma.product.delete({ where: { id: product.id } });
  await deleteUploadIfOurs(product.image);
  await deleteUploadIfOurs(product.chart);
  return c.redirect("/admin/catalog?notice=deleted");
});

