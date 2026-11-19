import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const functions=source.split('\n').find(line=>line.startsWith('function rewardDiscount('));
function price(equipment,percent,operator=0){return runInNewContext(`${functions}\n({discount:rewardSavings(),total:discountedSubtotal()})`,{equipmentSubtotal:()=>equipment,subtotal:()=>equipment+operator,rewardsAccount:{discountPercent:percent}})}
test('loyalty discounts round once to the nearest KYD $5 at every tier',()=>{
 for(const[equipment,percent,expected]of [[2330,5,115],[2330,10,235],[2330,15,350],[2270,5,115],[985,5,50],[990,5,50],[995,5,50],[985,10,100],[985,15,150],[985,0,0],[0,15,0],[10,5,0],[9.99,5,0],[950,5,50],[949.99,5,45]])assert.equal(price(equipment,percent).discount,expected);
});
test('rounding discounts the combined equipment subtotal and excludes operator charges',()=>{
 const result=price(630,5,140);assert.equal(result.discount,30);assert.equal(result.total,740);
});
