import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../prisma/catalog-seed.json', import.meta.url), 'utf8')).products;
function checkout(cart, area = 'George Town') {
  const context = { cart, products: catalog, $: () => ({ value: area }), money: n => `CI$${n}` };
  const declarations = source.split('\n').filter(line =>
    /^const deliveryFees=|^function (deliveryEligible|deliveryQuantity|itemDeliveryEstimate|deliveryEstimate|deliveryLine)\(/.test(line));
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
test('weekly, monthly, tools and operator services do not incur delivery', () => {
  const tool = catalog.find(p => p.category === 'Tools');
  assert.equal(checkout([line('rt40', 2, 'weekly'), line('rt175', 3, 'monthly'), line(tool.id, 2), line('telehandler-operator', 8, 'hourly')]).total, 0);
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
