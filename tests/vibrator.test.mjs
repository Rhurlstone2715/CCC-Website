import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
const source = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const products = JSON.parse(readFileSync(new URL('../prisma/catalog-seed.json', import.meta.url), 'utf8')).products;
const declarations = source.split('\n').filter(line => /^function (completeVibrator|setParts|visibleCart|bundleRate|vibratorStartingRate|displayRate|setOptionLabel|lineAmount|displayLineAmount|displayLineRate|lineTotal|lineRate|lineName)\(/.test(line)).join('\n');
function evaluate(cart, expression) {
  return runInNewContext(`${declarations}\n${expression}`, { products, cart, money: n => `CI$${n}`, termLabels: { daily: 'Daily', weekly: 'Weekly' } });
}
function set(shaft, head, term = 'daily', qty = 1, key = 'set1') {
  return [{ id: 'wyco-995', key, term, qty }, ...[shaft, head].map(id => ({ id, term, qty, key: `${id}:${key}`, parentKey: key, inSet: true }))];
}
for (const [shaft, daily, weekly] of [['wyco-8914', 55, 195], ['wyco-8920', 60, 220]]) {
  for (const head of ['wyco-750d', 'wyco-750eh']) {
    test(`${shaft} + ${head} preserves complete rental prices`, () => {
      for (const [term, price] of [['daily', daily], ['weekly', weekly]]) {
        const cart = set(shaft, head, term, 2);
        assert.equal(evaluate(cart, 'visibleCart().length'), 1);
        assert.equal(evaluate(cart, 'displayLineRate(cart[0])'), price);
        assert.equal(evaluate(cart, 'displayLineAmount(cart[0])'), price * 2);
        assert.match(evaluate(cart, 'lineName(cart[0],products.find(p=>p.id===cart[0].id))'), /shaft.*head/);
      }
    });
  }
}
test('separate configured sets retain independent names and totals', () => {
  const cart = [...set('wyco-8914', 'wyco-750d'), ...set('wyco-8920', 'wyco-750eh', 'daily', 1, 'set2')];
  assert.equal(evaluate(cart, 'visibleCart().length'), 2);
  assert.equal(evaluate(cart, 'visibleCart().reduce((sum,i)=>sum+displayLineAmount(i),0)'), 115);
});
test('card starting rates include the motor, shaft and head', () => {
  assert.equal(evaluate([], 'displayRate(products.find(p=>p.id==="wyco-995"),"daily")'), 55);
  assert.equal(evaluate([], 'displayRate(products.find(p=>p.id==="wyco-995"),"weekly")'), 195);
});
