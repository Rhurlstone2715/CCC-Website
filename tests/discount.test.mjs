import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const functions=source.split('\n').find(line=>line.startsWith('function rewardDiscount('));
function price(equipment,percent,operator=0){return runInNewContext(`${functions}\n({discount:rewardSavings(),total:discountedSubtotal()})`,{equipmentSubtotal:()=>equipment,subtotal:()=>equipment+operator,rewardsAccount:{discountPercent:percent}})}
test('loyalty discounts round once to whole CI dollars at every tier',()=>{
 for(const[equipment,percent,expected]of [[985,5,49],[990,5,50],[995,5,50],[985,10,99],[985,15,148],[985,0,0],[0,15,0],[10,5,1],[9.99,5,0]])assert.equal(price(equipment,percent).discount,expected);
});
test('rounding discounts the combined equipment subtotal and excludes operator charges',()=>{
 const result=price(630,5,140);assert.equal(result.discount,32);assert.equal(result.total,738);
});
