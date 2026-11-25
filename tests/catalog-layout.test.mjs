import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{runInNewContext}from'node:vm';
const seed=JSON.parse(readFileSync(new URL('../prisma/catalog-seed.json',import.meta.url),'utf8')).products;
const context={window:{}};runInNewContext(readFileSync(new URL('../public/catalog-layout.js',import.meta.url),'utf8'),context);const layout=context.window.CCC_BROWSE;
test('browse categories include every customer-facing item exactly once without changing catalog data',()=>{
 const before=JSON.stringify(seed),categories=layout.visibleCategories(seed);assert.ok(categories.length>0);assert.ok(categories.every(c=>layout.itemsFor(seed,c.id).length>0));
 const ids=categories.flatMap(c=>Array.from(layout.itemsFor(seed,c.id),p=>p.id));
 assert.equal(ids.length,new Set(ids).size);assert.deepEqual([...ids].sort(),seed.filter(p=>!p.hidden&&!p.setPart).map(p=>p.id).sort());assert.equal(JSON.stringify(seed),before);
 assert.ok(ids.includes('rigger-banksman'));assert.ok(!ids.includes('telehandler-operator'));
});
test('cranes, boom trucks, telehandlers and Heavy Hauling are separate browse groups',()=>{
 for(const[id,count]of[['cranes',4],['boom-trucks',2],['telehandlers',3],['heavy-hauling',5]])assert.equal(layout.itemsFor(seed,id).length,count);
 assert.equal(layout.categories.find(c=>c.id==='hydraulic').name,'Rebar Benders/Cutters');assert.equal(layout.categories.find(c=>c.id==='heavy-hauling').name,'Heavy Hauling');assert.ok(!layout.categories.some(c=>['Heavy Equipment','Lifting Equipment'].includes(c.name)));
});
test('wall bracing is separate from scaffolding and retains the animated ICF image',()=>{
 assert.deepEqual(Array.from(layout.itemsFor(seed,'wall-bracing'),p=>p.id).sort(),['ellis','plumwall']);assert.deepEqual(Array.from(layout.itemsFor(seed,'scaffolding'),p=>p.id).sort(),['props','scaffold']);
 const hero=seed.find(p=>p.id===layout.categories.find(c=>c.id==='wall-bracing').hero);assert.match(hero.image,/\.gif$/);
});
test('new admin equipment stays discoverable and backend categories remain unchanged',()=>{
 const p={id:'new-custom-tool',name:'New custom tool',category:'Tools',rates:{daily:11}},products=[...seed,p];
 assert.equal(layout.categoryId(p),'other');assert.ok(layout.visibleCategories(products).some(c=>c.id==='other'));assert.equal(layout.itemsFor(products,'other')[0],p);assert.equal(p.category,'Tools');
 assert.equal(layout.categoryId({...p,name:'New crane',category:'Rough Terrain Cranes'}),'cranes');
});
test('Rigger/Banksman is a visible, bookable Rigging Services item with hourly and daily rates',()=>{
 const p=seed.find(p=>p.id==='rigger-banksman');assert.ok(p);assert.equal(p.name,'Rigger/Banksman');assert.equal(p.category,'Rigging Services');
 assert.deepEqual(p.rates,{hourly:50,daily:315});assert.equal(p.operatorService,true);assert.ok(!p.hidden);assert.ok(!p.delivery);assert.equal(p.availableQuantity,undefined);assert.equal(p.image,'assets/catalog/rigger-banksman.png');
 assert.equal(layout.categoryId(p),'rigging-services');assert.deepEqual(Array.from(layout.itemsFor(seed,'rigging-services'),p=>p.id),['rigger-banksman']);
 assert.equal(layout.categories.find(c=>c.id==='rigging-services').name,'Rigging & Banksman Services');assert.equal(layout.categories.find(c=>c.id==='rigging-services').hero,'rigger-banksman');assert.ok(!layout.categories.some(c=>c.id==='operator-service'));assert.ok(!layout.itemsFor(seed,'other').some(p=>p.id==='rigger-banksman'));
 const operator=seed.find(p=>p.id==='telehandler-operator');assert.ok(operator.hidden);assert.deepEqual(operator.rates,{hourly:35,daily:315});assert.ok(!layout.visibleCategories(seed).some(c=>layout.itemsFor(seed,c.id).includes(operator)));
});
test('Rigger/Banksman migration adds the item without overwriting admin-edited catalogs',()=>{
 const sql=readFileSync(new URL('../prisma/migrations/20261123090000_rigger_banksman/migration.sql',import.meta.url),'utf8');
 assert.match(sql,/INSERT INTO "Product"/);assert.match(sql,/'rigger-banksman', 'Rigger\/Banksman', 'Rigging Services'/);assert.match(sql,/'\{"hourly":50,"daily":315\}'::jsonb/);
 assert.match(sql,/HAVING COUNT\(\*\)>0/);assert.match(sql,/ON CONFLICT \("id"\) DO NOTHING/);assert.doesNotMatch(sql,/\b(UPDATE|DELETE|DROP|TRUNCATE)\b/i);
});
