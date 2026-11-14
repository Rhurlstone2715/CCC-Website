import assert from 'node:assert/strict';
import {test} from 'node:test';
import {allocations,peak,rentalHours} from './availability.js';
const map=new Map([['boom',{id:'boom',operatorService:false}],['brace',{id:'brace',operatorService:false}],['operator',{id:'operator',operatorService:true}]]);
const schedule={startDate:new Date('2030-01-01T00:00:00Z'),startTime:'08:00',scheduleStart:null,scheduleEnd:null};
test('hourly service reserves one truck for the work hours, while braces reserve individual units',()=>{
 const rows=allocations([{id:'boom',term:'hourly',qty:6},{id:'brace',term:'daily',qty:100},{id:'operator',term:'hourly',qty:6}],schedule,map);
 assert.equal(rows.length,2);assert.equal(rows[0].qty,1);assert.equal(rows[0].start,Date.parse('2030-01-01T13:00:00Z'));assert.equal(rows[0].end,Date.parse('2030-01-01T19:00:00Z'));assert.equal(rows[1].qty,100);assert.equal(rows[1].end-rows[1].start,86400000);
});
test('availability counts peak concurrent quantities and allows exact back-to-back handover',()=>{
 assert.equal(peak([{id:'brace',start:0,end:10,qty:100},{id:'brace',start:10,end:20,qty:100},{id:'brace',start:0,end:20,qty:100}]),200);
 assert.equal(peak([{id:'brace',start:0,end:20,qty:100},{id:'brace',start:5,end:15,qty:100},{id:'brace',start:9,end:12,qty:101}]),301);
});
test('rental windows cover four-hour minimums, seven-day weeks, thirty-day months and inclusive admin dates',()=>{
 assert.equal(rentalHours('hourly',1),4);assert.equal(rentalHours('fourhour',1),4);assert.equal(rentalHours('weekly',20),168);assert.equal(rentalHours('monthly',20),720);
 const [row]=allocations([{id:'boom',term:'hourly',qty:4}],{...schedule,scheduleStart:new Date('2030-01-02Z'),scheduleEnd:new Date('2030-01-04Z')},map);
 assert.equal(row.start,Date.parse('2030-01-02T05:00:00Z'));assert.equal(row.end,Date.parse('2030-01-05T05:00:00Z'));
});
