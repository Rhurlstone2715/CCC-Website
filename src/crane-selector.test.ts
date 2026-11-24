import assert from 'node:assert/strict';import{test}from'node:test';
import{craneChartData,screenLift,chartSourceMatches,type ChartProfile}from'./crane-selector.js';
const base={loadLb:10000,liftHeightFt:50};
test('reviewed chart data matches exact source files, imperial units and populated main-boom cells',()=>{
 assert.equal(craneChartData.profiles.length,6);assert.equal(craneChartData.profiles.reduce((n,p)=>n+p.cells.length,0),556);
 for(const p of craneChartData.profiles){assert.ok(chartSourceMatches(p),p.id);const unique=new Set();for(const c of p.cells){assert.ok(c.ratedLb>c.deductionLb);assert.ok(c.boomFt>0&&c.radiusFt>0&&c.angleDeg>0&&c.angleDeg<=90);const key=`${c.radiusFt}:${c.boomFt}`;assert.ok(!unique.has(key));unique.add(key);}}
 assert.ok(!craneChartData.excluded.some(p=>p.id==='rt40'));assert.ok(!chartSourceMatches({...craneChartData.profiles[0],sha256:'incorrect'}));
 const reference=[['rt890e',50,102.8,21950],['rt175',50,85,21200],['rt635c',50,100,11300],['national1400',50,127,5500],['altec2595',50,95,4150],['rt40',40,48,17700]] as const;
 for(const[id,radius,boom,capacity]of reference)assert.equal(craneChartData.profiles.find(p=>p.id===id)!.cells.find(c=>c.radiusFt===radius&&c.boomFt===boom)!.ratedLb,capacity);
});
test('maximum radius includes the correct fixed rigging for each type',()=>{
 const result=screenLift(base);assert.equal(result.status,'matches');const omega=result.matches.find(m=>m.id==='rt40')!;assert.equal(omega.radiusFt,35);assert.equal(omega.boomFt,72);assert.equal(omega.angleDeg,58);assert.equal(omega.totalLb,10800);assert.equal(omega.allowedGrossLb,12000);
 for(const m of result.matches){assert.equal(m.riggingLb,m.id.startsWith('rt')?800:500);assert.equal(m.totalLb,10000+m.riggingLb);assert.ok(m.totalLb<=m.allowedGrossLb);assert.equal(m.allowedItemLb+m.riggingLb,m.allowedGrossLb);assert.ok(m.chartUtilizationPercent<=60);}
 const light=screenLift({loadLb:100,liftHeightFt:5});assert.equal(light.matches.length,6);
 for(const m of light.matches){const p=craneChartData.profiles.find(p=>p.id===m.id)!;for(const c of p.cells.filter(c=>c.radiusFt>m.radiusFt)){const reach=Math.max(0,Math.floor((c.boomFt*Math.sin(c.angleDeg*Math.PI/180)-10)/5)*5);assert.ok((100+m.riggingLb)*100>(c.ratedLb-c.deductionLb)*60||reach<5);}}
});
test('60% boundary includes server rigging and rejects one hundredth over',()=>{
 const profile:ChartProfile={...craneChartData.profiles[0],cells:[{radiusFt:50,boomFt:100,ratedLb:20100,angleDeg:60,deductionLb:100}]};
 assert.equal(screenLift({...base,loadLb:11200},[profile]).matches.length,1);
 assert.equal(screenLift({...base,loadLb:11200.01},[profile]).matches.length,0);
 assert.throws(()=>screenLift({...base,loadLb:11200.001}));
 // Unknown client fields cannot lower the standard allowance or override the scope.
 assert.equal(screenLift({...base,loadLb:11200.01,handlingLb:0} as typeof base,[profile]).matches.length,0);
});
test('uses only documented cells and reduces maximum radius for height or load',()=>{
 const p:ChartProfile={...craneChartData.profiles[0],cells:[{radiusFt:40,boomFt:100,ratedLb:30000,angleDeg:70,deductionLb:0},{radiusFt:50,boomFt:100,ratedLb:20000,angleDeg:60,deductionLb:0}]};
 assert.equal(screenLift(base,[p]).matches[0].radiusFt,50);
 assert.equal(screenLift({...base,liftHeightFt:80},[p]).matches[0].radiusFt,40);
 assert.equal(screenLift({...base,loadLb:12000},[p]).matches[0].radiusFt,40);
 assert.equal(screenLift({...base,liftHeightFt:100},[p]).matches.length,0);
});
test('invalid inputs and loads beyond all reviewed capacity get no recommendation',()=>{
 for(const change of [{loadLb:-1},{liftHeightFt:0},{loadLb:Infinity},{liftHeightFt:NaN}])assert.throws(()=>screenLift({...base,...change}));
 assert.equal(screenLift({loadLb:500000,liftHeightFt:5}).matches.length,0);
 for(const liftHeightFt of [5,25,50,100,150])for(const loadLb of [100,1000,10000,50000,200000])for(const m of screenLift({loadLb,liftHeightFt}).matches)assert.ok((loadLb+m.riggingLb)*100<=(m.ratedLb-m.deductionLb)*60);
});

test('boom trucks use only single-part hook-ball ratings with 500 lb handling and 60% margin',()=>{
 for(const[id,limit,item]of [['national1400',4400,2140],['altec2595',4620,2272]] as const){
  const p=craneChartData.profiles.find(p=>p.id===id)!;assert.equal(p.singleLineLimitLb,limit);
  const fixture={...p,cells:[{radiusFt:10,boomFt:100,ratedLb:50000,angleDeg:70,deductionLb:0}]};
  const at=screenLift({loadLb:item,liftHeightFt:5},[fixture]).matches[0];assert.ok(at);assert.equal(at.riggingLb,500);assert.equal(at.allowedGrossLb,limit*60/100);assert.match(at.setup,/single-part line/);
  assert.equal(screenLift({loadLb:item+.01,liftHeightFt:5},[fixture]).matches.length,0);
  assert.equal(screenLift({loadLb:item,liftHeightFt:5},[{...fixture,singleLineLimitLb:undefined}]).matches.length,0);
  for(const m of screenLift({loadLb:500,liftHeightFt:10},[p]).matches)assert.ok(m.totalLb*100<=limit*60);
 }
 const heavy=screenLift({loadLb:10000,liftHeightFt:50});assert.ok(heavy.matches.length);assert.ok(heavy.matches.every(m=>m.id.startsWith('rt')));
});
