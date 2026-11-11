import assert from "node:assert/strict";
import { test } from "node:test";
import { equipmentPages, renderEquipmentPage } from "./equipment-pages.js";

test("homepage links to all seven categories without rendering the full catalogue", async () => {
  const html = (await renderEquipmentPage("/"))!;
  for (const page of equipmentPages) assert.ok(html.includes(`href="/equipment/${page.slug}"`));
  assert.match(html, /class="equipment-category-grid"/);
  assert.match(html, /action="\/equipment" method="get"/);
  assert.match(html, /data-equipment-page="home"/);
});
test("category pages have specific headings, descriptions and absolute assets", async () => {
  for (const page of equipmentPages) {
    const html = (await renderEquipmentPage(`/equipment/${page.slug}`))!;
    assert.ok(html.includes(`<h1>${page.title.replaceAll("&", "&amp;")}</h1>`));
    assert.match(html, /src="\/app.js"/);
    assert.match(html, /href="\/styles.css"/);
    assert.doesNotMatch(html, /<section class="hero">/);
    assert.doesNotMatch(html, /class="rewards-banner"/);
    assert.match(html, /id="cartDrawer"/);
  }
  assert.equal(await renderEquipmentPage("/equipment/not-a-category"), null);
});
test("individual pages hide retired/component records and safely encode catalogue text", async () => {
  const products = [{ id: "rt40", name: '<Test & Crane>', category: "Rough Terrain Cranes", desc: '</script><script>alert(1)</script>' }, { id: "retired", name: "Retired", category: "Tools", hidden: true }, { id: "shaft", name: "Shaft", category: "Tools", setPart: "Shaft" }];
  const html = (await renderEquipmentPage("/equipment/item/rt40", products))!;
  assert.match(html, /<h1>&lt;Test &amp; Crane&gt;<\/h1>/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /href="\/equipment\/cranes-boom-trucks"/);
  assert.equal(await renderEquipmentPage("/equipment/item/retired", products), null);
  assert.equal(await renderEquipmentPage("/equipment/item/shaft", products), null);
  assert.equal(await renderEquipmentPage("/equipment/item/missing", products), null);
});
