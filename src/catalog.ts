import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { prisma } from "./db.js";
import type { Product, RiggingOption } from "./generated/prisma/client.js";

// Rental terms in the order the rentals page lists them, with its labels.
export const TERMS = ["hourly", "fourhour", "daily", "weekly", "monthly"] as const;
export type Term = (typeof TERMS)[number];
export type Rates = Partial<Record<Term, number>>;
export const TERM_LABELS: Record<string, string> = {
  hourly: "Hourly",
  fourhour: "4-hour minimum",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quote: "Rate pending",
};

// Categories new equipment can go in. public/app.js places each one in the
// page's navigation (see categoryNav there).
export const CATEGORIES = [
  "Rough Terrain Cranes",
  "Boom Trucks",
  "Telehandlers",
  "Heavy Hauling",
  "Tools",
  "Power Generation",
  "Attachments",
  "Construction Plant / Equipment",
  "Ground Protection",
];

export function orderedRates(value: unknown): Rates {
  const rates = (value ?? {}) as Record<string, unknown>;
  const out: Rates = {};
  for (const term of TERMS) if (typeof rates[term] === "number") out[term] = rates[term] as number;
  return out;
}

// ---- Seeding ----

type SeedProduct = { id: string; name: string; category: string; spec: string; desc: string; rates: Rates; [key: string]: unknown };
type SeedOption = { id: string; size: string; length: number; depth?: number; width?: number; swl?: number; price?: number };

const SEED_FILE = fileURLToPath(new URL("../prisma/catalog-seed.json", import.meta.url));
const COLUMNS = new Set(["id", "name", "category", "spec", "desc", "image", "chart", "photo", "delivery", "availableQuantity", "rates", "hidden", "operatorService", "addOns", "needsPower", "setPart"]);

// Loads the catalog the site launched with, the first time the database has none.
export async function ensureCatalogSeeded(): Promise<void> {
  if (await prisma.product.count()) return;
  const seed = JSON.parse(readFileSync(SEED_FILE, "utf8")) as { products: SeedProduct[]; riggingSizes: Record<string, SeedOption[]> };
  await prisma.$transaction([
    prisma.product.createMany({
      skipDuplicates: true,
      data: seed.products.map((p, i) => {
        const extra = Object.fromEntries(Object.entries(p).filter(([key]) => !COLUMNS.has(key)));
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          spec: p.spec,
          description: p.desc,
          image: typeof p.image === "string" ? p.image : "",
          chart: typeof p.chart === "string" ? p.chart : null,
          photo: p.photo === true,
          delivery: p.delivery === true,
          operatorService: p.operatorService === true,
          availableQuantity: typeof p.availableQuantity === "number" ? p.availableQuantity : null,
          rates: orderedRates(p.rates),
          hidden: p.hidden === true,
          addOns: Array.isArray(p.addOns) ? (p.addOns as string[]) : [],
          needsPower: p.needsPower === true,
          setPart: typeof p.setPart === "string" ? p.setPart : null,
          sortOrder: (i + 1) * 10,
          extra: Object.keys(extra).length ? (extra as object) : undefined,
        };
      }),
    }),
    prisma.riggingOption.createMany({
      skipDuplicates: true,
      data: Object.entries(seed.riggingSizes).flatMap(([productId, options]) =>
        options.map((o, i) => ({
          id: o.id,
          productId,
          size: o.size,
          length: o.length,
          depth: o.depth ?? null,
          width: o.width ?? null,
          swl: o.swl ?? null,
          price: o.price ?? null,
          sortOrder: (i + 1) * 10,
        })),
      ),
    }),
  ]);
}

// ---- What the rentals page receives ----

// Same shape as the product objects public/app.js was written against.
export function clientProduct(p: Product): Record<string, unknown> {
  const out: Record<string, unknown> = { ...((p.extra ?? {}) as object), id: p.id, name: p.name, category: p.category, spec: p.spec, desc: p.description };
  if (p.image) out.image = p.image;
  if (p.chart) out.chart = p.chart;
  if (p.photo) out.photo = true;
  if (p.delivery) out.delivery = true;
  if (p.availableQuantity !== null) out.availableQuantity = p.availableQuantity;
  out.rates = orderedRates(p.rates);
  if (p.hidden) out.hidden = true;
  if (p.operatorService) out.operatorService = true;
  if (p.addOns.length) out.addOns = p.addOns;
  if (p.needsPower) out.needsPower = true;
  if (p.setPart) out.setPart = p.setPart;
  return out;
}

function clientOption(o: RiggingOption): Record<string, unknown> {
  const out: Record<string, unknown> = { id: o.id, size: o.size, length: o.length };
  if (o.depth !== null) out.depth = o.depth;
  if (o.width !== null) out.width = o.width;
  if (o.swl !== null) out.swl = o.swl;
  if (o.price !== null) out.price = o.price;
  return out;
}

export async function buildCatalog() {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { riggingOptions: { orderBy: { sortOrder: "asc" } } },
  });
  const riggingSizes: Record<string, Record<string, unknown>[]> = {};
  for (const p of products) if (p.riggingOptions.length) riggingSizes[p.id] = p.riggingOptions.map(clientOption);
  return { products: products.map(clientProduct), riggingSizes };
}

// A script that sets window.CCC_CATALOG, safe to inline in a page.
export async function catalogScript(): Promise<string> {
  const json = JSON.stringify(await buildCatalog())
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `window.CCC_CATALOG=${json};\n`;
}

// ---- Pricing booking lines on the server ----

export type CartItem = { id: string; term: string; qty: number };
export type PricedLine = { id: string; name: string; term: string; qty: number; rate: number | null; amount: number | null; operator: boolean };

const toCents = (dollars: number) => Math.round(dollars * 100);

// Prices each cart line from the current catalog. Equipment lines get the tier
// discount (as the cart shows it); operator lines don't. Lines the catalog
// can't price (sizes on request, retired items) are kept with no amount.
export async function priceItems(items: CartItem[], discountPercent: number): Promise<{ lines: PricedLine[]; estimateCents: number | null }> {
  const ids = [...new Set(items.map(i => i.id))];
  const [products, options] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: ids } } }),
    prisma.riggingOption.findMany({ where: { id: { in: ids } }, include: { product: { select: { name: true } } } }),
  ]);
  const productById = new Map(products.map(p => [p.id, p]));
  const optionById = new Map(options.map(o => [o.id, o]));

  let equipmentCents = 0;
  let operatorCents = 0;
  let anyPriced = false;
  const lines = items.map(item => {
    const option = optionById.get(item.id);
    const product = productById.get(item.id);
    let name = item.id;
    let rate: number | null = null;
    let operator = false;
    if (option) {
      name = `${option.product.name} — ${option.size}`;
      rate = item.term === "daily" ? option.price : null;
    } else if (product) {
      name = product.name;
      operator = product.operatorService;
      rate = orderedRates(product.rates)[item.term as Term] ?? null;
    }
    const amount = rate === null ? null : toCents(rate * item.qty) / 100;
    if (amount !== null) {
      anyPriced = true;
      if (operator) operatorCents += toCents(amount);
      else equipmentCents += toCents(amount);
    }
    return { id: item.id, name, term: item.term, qty: item.qty, rate, amount, operator };
  });

  const estimateCents = anyPriced ? Math.round((equipmentCents * (100 - discountPercent)) / 100) + operatorCents : null;
  return { lines, estimateCents };
}

// ---- Sets: a main item that only works with its parts (vibrator motor, shaft and head) ----

type SetProduct = Pick<Product, "id" | "name" | "hidden" | "addOns" | "setPart">;

// The kinds of part an item has to be rented with, from the set parts among its add-ons.
export function setGroups(product: SetProduct, byId: Map<string, SetProduct>): string[] {
  const groups: string[] = [];
  for (const id of product.addOns) {
    const part = byId.get(id)?.setPart;
    if (part && !groups.includes(part)) groups.push(part);
  }
  return groups;
}

// The cart doesn't say which part goes with which motor, so this checks the
// totals: per term, each kind of part adds up to the quantity of main items that
// need it. A part nothing offers as a set part is treated as an ordinary item.
export function setProblem(items: CartItem[], products: SetProduct[]): string | null {
  const byId = new Map(products.map(p => [p.id, p]));
  const parents = products.filter(p => !p.hidden && setGroups(p, byId).length);
  const required = new Map<string, number>();
  const supplied = new Map<string, number>();
  const add = (map: Map<string, number>, key: string, qty: number) => map.set(key, (map.get(key) ?? 0) + qty);
  for (const item of items) {
    const product = byId.get(item.id);
    if (!product) continue;
    const parent = parents.find(p => p.id === product.id);
    if (parent) for (const group of setGroups(parent, byId)) add(required, `${group}|${item.term}`, item.qty);
    if (product.setPart && parents.some(p => p.addOns.includes(product.id))) add(supplied, `${product.setPart}|${item.term}`, item.qty);
  }
  for (const key of new Set([...required.keys(), ...supplied.keys()])) {
    if ((required.get(key) ?? 0) === (supplied.get(key) ?? 0)) continue;
    const group = key.split("|")[0];
    const parent = parents.find(p => setGroups(p, byId).includes(group))!;
    const kinds = setGroups(parent, byId).map(g => `one ${g.toLowerCase()}`);
    return `The ${parent.name} has to be rented as a set, with ${kinds.join(" and ")} for each one. Please remove it from your cart and add it again to choose the set.`;
  }
  return null;
}

export async function checkSets(items: CartItem[]): Promise<string | null> {
  if (!items.length) return null;
  const products = await prisma.product.findMany({ select: { id: true, name: true, hidden: true, addOns: true, setPart: true } });
  return setProblem(items, products);
}

export function describeLines(lines: PricedLine[]): string {
  return lines.map(l => `${l.name} (${TERM_LABELS[l.term] ?? l.term} × ${l.qty})`).join("; ");
}
