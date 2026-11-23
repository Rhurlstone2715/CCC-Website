import assert from 'node:assert/strict';import{test}from'node:test';
import{craneChartData,screenLift,chartSourceMatches,type ChartProfile}from'./crane-selector.js';
const base={loadLb:10000,handlingLb:2000,radiusFt:50,liftHeightFt:50,headroomFt:10,fullOutriggers:true};
test('reviewed chart data matches exact source files, imperial units and populated main-boom cells',()=>{
 assert.equal(craneChartData.profiles.length,5);assert.equal(craneChartData.profiles.reduce((n,p)=>n+p.cells.length,0),482);
 for(const p of craneChartData.profiles){assert.ok(chartSourceMatches(p),p.id);const unique=new Set();for(const c of p.cells){assert.ok(c.ratedLb>c.deductionLb);assert.ok(c.boomFt>0&&c.radiusFt>0&&c.angleDeg>0&&c.angleDeg<=90);const key=`${c.radiusFt}:${c.boomFt}`;assert.ok(!unique.has(key));unique.add(key);}}
 assert.ok(craneChartData.excluded.some(p=>p.id==='rt40'));assert.ok(!chartSourceMatches({...craneChartData.profiles[0],sha256:'incorrect'}));
 const reference=[['rt890e',50,102.8,21950],['rt175',50,85,21200],['rt635c',50,100,11300],['national1400',50,127,5500],['altec2595',50,95,4150]] as const;
 for(const[id,radius,boom,capacity]of reference)assert.equal(craneChartData.profiles.find(p=>p.id===id)!.cells.find(c=>c.radiusFt===radius&&c.boomFt===boom)!.ratedLb,capacity);
});
test('10,000 lb item at 50 ft respects rigging, 60% of adjusted capacity and the reach screen',()=>{
 const result=screenLift(base);assert.equal(result.status,'matches');assert.equal(result.totalLb,12000);assert.equal(result.requiredChartLb,20000);assert.deepEqual(result.matches.map(m=>m.id),['rt890e']);const m=result.matches[0];assert.equal(m.deductionLb,133);assert.ok(result.totalLb<=m.allowedGrossLb);assert.ok(m.chartUtilizationPercent<=60);assert.match(result.reason,/Preliminary/);
});
test('60% boundary uses integer hundredths and rejects even one hundredth over without rounding',()=>{
 const template=craneChartData.profiles[0];const profile:ChartProfile={...template,cells:[{radiusFt:50,boomFt:100,ratedLb:20100,angleDeg:60,deductionLb:100}]};
 assert.equal(screenLift({...base,loadLb:10000,handlingLb:2000},[profile]).matches.length,1);
 assert.equal(screenLift({...base,loadLb:10000,handlingLb:2000.01},[profile]).matches.length,0);
 assert.throws(()=>screenLift({...base,handlingLb:2000.001}));
 const p={...profile,cells:[{radiusFt:50,boomFt:100,ratedLb:20417,angleDeg:60,deductionLb:0}]};assert.equal(screenLift({...base,loadLb:10000,handlingLb:2250.2},[p]).matches.length,1);
});
test('rounds radius outward, never extrapolates or fills blank boom columns',()=>{
 const p:ChartProfile={...craneChartData.profiles[0],cells:[{radiusFt:40,boomFt:100,ratedLb:30000,angleDeg:70,deductionLb:0},{radiusFt:50,boomFt:100,ratedLb:20000,angleDeg:60,deductionLb:0}]};
 assert.equal(screenLift({...base,radiusFt:40.01},[p]).matches[0].radiusFt,50);
 assert.equal(screenLift({...base,radiusFt:39},[p]).matches.length,0);assert.equal(screenLift({...base,radiusFt:50.01},[p]).matches.length,0);
 assert.equal(screenLift({...base,liftHeightFt:100},[p]).matches.length,0);
});
test('unknown weights, non-full outriggers, special lifts and impossible inputs never receive a recommendation',()=>{
 for(const change of [{unknownHandling:true},{handlingLb:0},{fullOutriggers:false},{specialLift:true}])assert.equal(screenLift({...base,...change}).matches.length,0);
 for(const change of [{loadLb:-1},{radiusFt:0},{loadLb:Infinity},{headroomFt:NaN}])assert.throws(()=>screenLift({...base,...change}));
 for(const radiusFt of [10,25,50,75,100,150])for(const loadLb of [100,1000,10000,50000,200000]){const result=screenLift({...base,radiusFt,loadLb,liftHeightFt:5,headroomFt:5});for(const m of result.matches)assert.ok((loadLb+base.handlingLb)*100<=(m.ratedLb-m.deductionLb)*60);}
});
