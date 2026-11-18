import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{runInNewContext}from'node:vm';
const seed=JSON.parse(readFileSync(new URL('../prisma/catalog-seed.json',import.meta.url),'utf8')).products;
const context={window:{}};runInNewContext(readFileSync(new URL('../public/catalog-layout.js',import.meta.url),'utf8'),context);const layout=context.window.CCC_BROWSE;
test('browse categories include every customer-facing item exactly once without changing catalog data',()=>{
 const before=JSON.stringify(seed),categories=layout.visibleCategories(seed);assert.equal(categories.length,23);
 const ids=categories.flatMap(c=>Array.from(layout.itemsFor(seed,c.id),p=>p.id));
 assert.equal(ids.length,new Set(ids).size);assert.deepEqual([...ids].sort(),seed.filter(p=>!p.hidden&&!p.setPart&&!p.operatorService).map(p=>p.id).sort());assert.equal(JSON.stringify(seed),before);
});
test('cranes, boom trucks, telehandlers and Heavy Hauling are separate browse groups',()=>{
 for(const[id,count]of[['cranes',4],['boom-trucks',2],['telehandlers',3],['heavy-hauling',2]])assert.equal(layout.itemsFor(seed,id).length,count);
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
