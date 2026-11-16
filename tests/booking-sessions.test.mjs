import assert from 'node:assert/strict';import{test}from'node:test';import{sessionWindow,caymanDateTime}from'../dist/booking-sessions.js';
test('admin work sessions validate local dates, ordered endpoints and the maximum reservation period',()=>{
 assert.equal(caymanDateTime('2026-02-30T08:00'),null);assert.equal(caymanDateTime('2026-11-16T24:00'),null);assert.equal(caymanDateTime('2026-11-16T15:30'),Date.parse('2026-11-16T20:30:00Z'));
 for(const [start,end]of[['2026-11-16T08:00','2026-11-16T08:00'],['2026-11-16T08:00','2026-11-15T17:00'],['2026-11-16T08:00','2028-11-16T17:00']])assert.equal(sessionWindow({sessionStart:start,sessionEnd:end}),null);
 assert.equal(sessionWindow({sessionStart:'2026-11-16T08:00',sessionEnd:'2026-11-16T15:30'}).end,Date.parse('2026-11-16T20:30:00Z'));
});
