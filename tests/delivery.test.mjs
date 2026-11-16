import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../prisma/catalog-seed.json', import.meta.url), 'utf8')).products;
function checkout(cart, area = 'George Town', collection = 'delivery') {
  const context = { cart, products: catalog, $: selector => ({ value: selector === '#rentalCollection' ? collection : area }), money: n => `CI$${n}` };
  const declarations = source.split('\n').filter(line =>
    /^const deliveryFees=|^function (collectableRental|hasCollectableRentals|rentalCollection|deliveryAvailable|groupedSiteRental|chargeableSiteRental|firstSiteRental|bundledAccessoryDelivery|hasLiftingService|deliveryEligible|deliveryQuantity|itemDeliveryEstimate|collectionEligible|collectionEstimate|outboundDeliveryEstimate|deliveryEstimate|deliveryLine)\(/.test(line));
  return runInNewContext(`${declarations.join('\n')}\n({ total: deliveryEstimate(), lines: cart.map(deliveryLine) })`, context);
}
const line = (id, qty = 1, term = 'daily') => ({ id, qty, term });

test('each crane, boom truck and telehandler has its own area fee', () => {
  const ids = ['Rough Terrain Cranes', 'Boom Trucks', 'Telehandlers'].map(category => catalog.find(p => p.category === category && p.delivery).id);
  const result = checkout(ids.map(id => line(id)));
  assert.equal(result.total, 450);
  assert.ok(result.lines.every(text => text.includes('CI$150 × 1 = CI$150')));
});
test('multiple units of the same daily equipment each incur delivery', () => {
  assert.equal(checkout([line('rt40', 2)], 'North Side').total, 800);
});
test('hourly hours do not multiply delivery charges', () => {
  assert.equal(checkout([line('rt40', 8, 'hourly'), line('rt175', 4, 'hourly')]).total, 300);
});
test('weekly, monthly and operator services do not incur delivery', () => {
  const tool = catalog.find(p => p.category === 'Tools');
  assert.equal(checkout([line('rt40', 2, 'weekly'), line('rt175', 3, 'monthly'), line('telehandler-operator', 8, 'hourly')]).total, 0);
});
test('unknown areas require confirmation only when delivery is needed', () => {
  assert.equal(checkout([line('rt40')], '').total, null);
  assert.equal(checkout([line('rt40')], 'Other').total, null);
  assert.equal(checkout([line('rt40', 1, 'weekly')], '').total, 0);
  assert.equal(checkout([], '').total, 0);
});
test('changing quantity or removing equipment recalculates delivery', () => {
  const cart = [line('rt40', 2), line('rt175')];
  assert.equal(checkout(cart).total, 450);
  cart[0].qty = 1;
  assert.equal(checkout(cart).total, 300);
  cart.pop();
  assert.equal(checkout(cart).total, 150);
});

 test('tools, generators and other physical rentals use the same per-item delivery rates', () => {
  assert.equal(checkout([line('diesel-mixer-9-cu-ft',2),line('compressor'),line('g25')],'West Bay').total,1250);
  assert.equal(checkout([line('plumwall'),line('cord100'),line('concrete-bottom')],'East End').total,1400);
 });
 test('pickup remains available for tools alone, but mixed machine bookings require delivery', () => {
  assert.equal(checkout([line('diesel-mixer-9-cu-ft',2),line('g25')],'George Town','pickup').total,0);
  assert.equal(checkout([line('rt40'),line('compressor')],'West Bay','pickup').total,750);
 });
 test('weekly/monthly delivery is waived but pickup still needs an area', () => {
  assert.equal(checkout([line('diesel-mixer-9-cu-ft',2,'weekly'),line('compressor',1,'monthly')],'').total,null);
 });
 test('complete vibrator parts do not attract separate delivery fees', () => {
  assert.equal(checkout([line('wyco-995'),{...line('wyco-8914'),inSet:true},{...line('wyco-750d'),inSet:true}]).total,300);
 });

test('cranes and boom trucks are exempt from full-tank returns while other engines retain them', () => {
  const fn = source.split('\n').find(line => line.startsWith('function fuelReturnText('));
  for (const product of catalog.filter(p => p.fuelType)) {
    const result = runInNewContext(`${fn}\nfuelReturnText(product)`, {product});
    if (/crane|boom.?truck/i.test(product.category)) assert.equal(result, '');
    else assert.match(result, /Return with a full tank/);
  }
});

test('7 Mile Beach costs CI$200 per delivered item with weekly and monthly waivers', () => {
  assert.equal(checkout([line('rt40'), line('diesel-mixer-9-cu-ft',2)],'7 Mile Beach').total,800);
  assert.equal(checkout([line('rt40',1,'weekly'),line('diesel-mixer-9-cu-ft',2,'monthly')],'7 Mile Beach').total,200);
});


test('attachments share machine delivery while standalone attachments keep their own fee',()=>{
 for(const machine of ['rt40','altec2595','gth636']){
  const result=checkout([line(machine),line('bucket'),line('concrete-bottom')],'7 Mile Beach');assert.equal(result.total,200);assert.match(result.lines[1],/No additional delivery or pickup fee/);assert.match(result.lines[2],/No additional delivery or pickup fee/);
 }
 assert.equal(checkout([line('bucket'),line('concrete-bottom')],'7 Mile Beach').total,600);
 assert.equal(checkout([line('rt40',2),line('bucket',2)],'7 Mile Beach').total,400);
 assert.equal(checkout([line('rt40',1,'weekly'),line('bucket')],'7 Mile Beach').total,0);
});
test('pickup cannot remove machine delivery charges or mixed-booking delivery fees',()=>{
 assert.equal(checkout([line('altec2595'),line('bucket')],'7 Mile Beach','pickup').total,200);
 assert.equal(checkout([line('gth636'),line('compressor')],'7 Mile Beach','pickup').total,600);
 assert.equal(checkout([line('bucket')],'7 Mile Beach','pickup').total,0);
});

test('ICF and scaffold share one delivery and one collection charge regardless of units, term or lines',()=>{
 const result=checkout([line('plumwall',75),line('scaffold',40,'weekly'),line('plumwall',25)],'7 Mile Beach');assert.equal(result.total,400);assert.match(result.lines[0],/delivery CI\$200/);
 assert.equal(checkout([line('scaffold',100,'monthly')],'George Town').total,300);
 assert.equal(checkout([line('plumwall',75)],'','delivery').total,null);
 assert.equal(checkout([line('plumwall',75),line('scaffold',40,'weekly')],'','pickup').total,0);
 assert.equal(checkout([line('plumwall',75),line('rt40')],'George Town').total,450);
});

test('post shores, mats and Ellis braces have one shared delivery and one collection charge',()=>{
 assert.equal(checkout([line('ellis',50)],'George Town').total,300);
 assert.equal(checkout([line('props',100,'weekly'),line('mats',20),line('ellis',50)],'West Bay').total,500);
 assert.equal(checkout([line('mats',30,'monthly')],'7 Mile Beach').total,400);
 assert.equal(checkout([line('props',100,'weekly'),line('ellis',50),line('plumwall',75)],'West Bay').total,500);
 assert.equal(checkout([line('props',100,'weekly'),line('mats',20)],'','pickup').total,0);
});

test('one collection charge applies to all eligible rentals while the three lifting categories stay exempt',()=>{
 for(const id of ['rt40','altec2595','gth636'])assert.equal(checkout([line(id)],'George Town').total,150);
 assert.equal(checkout([line('diesel-mixer-9-cu-ft',10)],'George Town').total,1650);
 assert.equal(checkout([line('diesel-mixer-9-cu-ft',10,'weekly')],'George Town').total,150);
 assert.equal(checkout([line('diesel-mixer-9-cu-ft'),line('compressor'),line('g25')],'George Town').total,600);
});

test('attachments ride with each lifting machine without outbound or collection fees, but unrelated rentals still pay pickup',()=>{
 for(const id of ['rt40','altec2595','gth636'])assert.equal(checkout([line(id),line('bucket'),line('concrete-bottom')],'George Town').total,150);
 assert.equal(checkout([line('rt40'),line('bucket'),line('compressor')],'George Town').total,450);
 assert.equal(checkout([line('bucket')],'George Town').total,300);
});
