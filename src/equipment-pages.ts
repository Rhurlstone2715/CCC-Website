import { readFile } from "node:fs/promises";

export const equipmentPages = [
  { slug: "cranes-boom-trucks", title: "Cranes & Boom Trucks", categories: ["Rough Terrain Cranes", "Boom Trucks"], description: "Operator-assisted lifting for construction, deliveries and complex placements. Compare capacities and view load charts before requesting your dates." },
  { slug: "telehandlers", title: "Telehandlers", categories: ["Telehandlers"], description: "Material handling for your site. Compare lifting capacity and reach, add an operator if needed, and select compatible attachments." },
  { slug: "tools", title: "Tools", categories: ["Tools"], description: "Concrete, cutting, welding and site essentials. Choose your rental term and quantities. Tool rentals are pickup only." },
  { slug: "generators-power", title: "Generators & Power", categories: ["Power Generation"], description: "Generators, temporary power distribution and extension cords. Confirm the voltage, connections and power required for your equipment." },
  { slug: "attachments", title: "Attachments", categories: ["Attachments"], description: "Baskets, buckets, jibs, lifting beams and rigging accessories. Our team will confirm compatibility and suitability for your equipment and lift." },
  { slug: "bracing-scaffolding", title: "Bracing & Scaffolding", categories: ["Construction Plant / Equipment"], description: "ICF bracing, scaffolding, shoring and wall braces. Select your quantities and request the components needed for your project." },
  { slug: "transport-ground-protection", title: "Transport & Ground Protection", categories: ["Heavy Hauling", "Ground Protection"], description: "Lowboy and flatbed transport, plus ground protection for site access. Share your load, route and site details so we can plan the right setup." },
];
export type EquipmentPageContext = { mode: "home" | "all" | "category" | "item"; slug?: string; productId?: string; title: string; description: string };
type CatalogProduct = { id: string; name: string; category: string; hidden?: boolean; setPart?: string; desc?: string; image?: string };
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
export const equipmentUrl = (slug: string) => `/equipment/${slug}`;

export async function renderEquipmentPage(path: string, products: CatalogProduct[] = []): Promise<string | null> {
  let context: EquipmentPageContext;
  const category = equipmentPages.find(p => path === equipmentUrl(p.slug));
  const item = path.startsWith("/equipment/item/") ? products.find(p => p.id === path.slice("/equipment/item/".length) && !p.hidden && !p.setPart) : undefined;
  if (path === "/" || path === "/rentals") context = { mode: "home", title: "Equipment Rentals & Lifting Services", description: "Find cranes, boom trucks, telehandlers, tools and site equipment for your project in Grand Cayman." };
  else if (path === "/equipment") context = { mode: "all", title: "All Equipment", description: "Search the full Cayman Crane fleet and rental range. Browse across categories and keep everything in one shared request." };
  else if (category) context = { mode: "category", slug: category.slug, title: category.title, description: category.description };
  else if (item) context = { mode: "item", productId: item.id, slug: equipmentPages.find(p => p.categories.includes(item.category))?.slug, title: item.name, description: item.desc || "View equipment specifications and rates, then request availability for your project." };
  else return null;

  let html = await readFile(new URL("../public/rentals.html", import.meta.url), "utf8");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(context.title)} | Cayman Crane Company</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(context.description)}">`)
    .replace('<head>', `<head><script>window.CCC_EQUIPMENT_PAGES=${scriptJson(equipmentPages)};window.CCC_EQUIPMENT_PAGE=${scriptJson(context)};</script>`)
    .replace('<body>', `<body data-equipment-page="${context.mode}">`)
    .replace(/(src|href)="((?:assets\/|styles\.css|rentals-nav\.css|customer-experience\.css|optimized-images\.js|catalog\.js|app\.js)[^"]*)"/g, '$1="/$2"');
  const links = `<a href="/equipment"${context.mode === "all" ? ' aria-current="page"' : ""}>All equipment</a>` + equipmentPages.map(p => `<a href="${equipmentUrl(p.slug)}"${p.slug === context.slug ? ' aria-current="page"' : ""}>${escape(p.title)}</a>`).join("");
  html = html.replace('<a href="#catalog">Equipment</a>', `<details class="equipment-menu"><summary>Equipment <span aria-hidden="true">⌄</span></summary><div>${links}</div></details>`);
  html = html.replace('<div class="mobile-nav" id="mobileNav"><a href="#catalog">Equipment</a>', `<div class="mobile-nav" id="mobileNav"><div class="mobile-equipment-links"><span>Equipment</span>${links}</div>`);
  for (const anchor of ["services", "terms", "rewards", "gallery", "contact"]) html = html.replaceAll(`href="#${anchor}"`, `href="/rentals#${anchor}"`);
  html = html.replaceAll('href="#top"', 'href="/"').replace('href="#catalog" id="browseButton"', 'href="/equipment" id="browseButton"');
  const catalogStart = html.indexOf('    <section class="catalog-section"');
  const catalogEnd = html.indexOf('</section>', catalogStart) + '</section>'.length;
  let catalog = html.slice(catalogStart, catalogEnd);
  if (context.mode === "home") {
    const tiles = equipmentPages.map((p, i) => `<a class="equipment-category-tile" href="${equipmentUrl(p.slug)}"><span class="tile-number">0${i + 1}</span><h3>${escape(p.title)}</h3><p>${escape(p.description.split(". ")[0])}.</p><span class="tile-action">Browse equipment <span aria-hidden="true">→</span></span></a>`).join("");
    const headingEnd = catalog.indexOf('<div class="category-intro">');
    catalog = catalog.slice(0, headingEnd) + `<form class="home-equipment-search" action="/equipment" method="get"><label for="homeEquipmentSearch">Find equipment by name</label><div><input id="homeEquipmentSearch" name="q" type="search" placeholder="Try crane, telehandler or concrete vibrator"><button class="button primary" type="submit">Search all equipment</button></div></form><div class="equipment-category-grid">${tiles}<a class="equipment-category-tile all-equipment-tile" href="/equipment"><span class="tile-number">THE FULL RANGE</span><h3>All equipment</h3><p>Know what you need? Search every category and build one request.</p><span class="tile-action">View all equipment <span aria-hidden="true">→</span></span></a></div><div hidden>` + catalog.slice(headingEnd).replace('</div></section>', '</div></div></section>');
    html = html.slice(0, catalogStart) + catalog + html.slice(catalogEnd);
  } else {
    html = html.replace(/<link rel="preload" as="image"[^>]*>/, "");
    const parent = context.mode === "item" ? equipmentPages.find(p => p.slug === context.slug) : null;
    const breadcrumb = `<nav class="equipment-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/equipment">All equipment</a>${parent ? `<span aria-hidden="true">/</span><a href="${equipmentUrl(parent.slug)}">${escape(parent.title)}</a>` : ""}${context.mode !== "all" ? `<span aria-hidden="true">/</span><span aria-current="page">${escape(context.title)}</span>` : ""}</nav>`;
    const hero = `<section class="equipment-page-heading"><div class="wrap">${breadcrumb}<p class="eyebrow red">${context.mode === "item" ? "Equipment details" : "Find your equipment"}</p><h1>${escape(context.title)}</h1><p>${escape(context.description)}</p><div class="equipment-page-notes"><span>One cart across every category</span><span>Availability confirmed for your dates</span></div></div></section>`;
    catalog = catalog.replace(/<div class="section-heading split">[\s\S]*?<\/a><\/div>/, `<div class="section-heading split"><div><h2>${context.mode === "item" ? "Specifications & rental options" : "Choose your equipment"}</h2><p>All rates are in CI$. Add equipment from any page to the same request.</p></div><a class="catalog-help" href="https://wa.me/13459160816" target="_blank" rel="noopener">Need help choosing? Ask us ↗</a></div>`);
    const mainStart = html.indexOf('<main id="top">') + '<main id="top">'.length;
    const mainEnd = html.indexOf('</main>', mainStart);
    const help = `<section class="equipment-help"><div class="wrap"><div><p class="eyebrow red">Local support, start to finish</p><h2>Let’s find the right setup.</h2><p>Share your load, access and dates. We’ll help you choose the equipment and confirm availability.</p></div><a class="button primary" href="https://wa.me/13459160816" target="_blank" rel="noopener">Talk to our team</a></div></section>`;
    html = html.slice(0, mainStart) + hero + catalog + help + html.slice(mainEnd);
    html = html.replace('<a href="#catalog">Rentals</a>', '<a href="/equipment">Equipment</a>');
  }
  return html;
}
