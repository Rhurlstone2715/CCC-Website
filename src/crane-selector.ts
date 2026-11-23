import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export type ChartCell={radiusFt:number;boomFt:number;ratedLb:number;angleDeg:number;deductionLb:number};
export type ChartProfile={id:string;name:string;source:string;sha256:string;page:number;setup:string;chartCode:string;deductionNote:string;cells:ChartCell[]};
export const craneChartData=JSON.parse(readFileSync(new URL('../data/crane-selector-charts.json',import.meta.url),'utf8')) as {profiles:ChartProfile[];excluded:{id:string;name:string;reason:string}[]};
export type LiftInput={loadLb:number;handlingLb:number;radiusFt:number;liftHeightFt:number;headroomFt:number;unknownHandling?:boolean;specialLift?:boolean;fullOutriggers?:boolean};
// The supplied brochures are planning guides, not serial-specific operating charts.
// Never interpolate capacities, extrapolate a chart, or treat a capacity match as lift approval.
export function screenLift(input:LiftInput,profiles:ChartProfile[]=craneChartData.profiles){
 for(const key of ['loadLb','radiusFt','liftHeightFt','headroomFt'] as const)if(!Number.isFinite(input[key])||input[key]<=0)throw Error('Enter positive load, radius, lift height and rigging headroom values.');
 if(!Number.isFinite(input.handlingLb)||input.handlingLb<0)throw Error('Enter the combined hook block, slings and lifting-accessory weight.');
 if(input.loadLb>500000||input.handlingLb>100000||input.radiusFt>500||input.liftHeightFt>500||input.headroomFt>100)throw Error('These values need direct lift-planning review.');
 for(const weight of [input.loadLb,input.handlingLb])if(Math.abs(weight*100-Math.round(weight*100))>0.000001)throw Error('Enter weights to no more than two decimal places.');
 const totalHundredths=Math.round(input.loadLb*100)+Math.round(input.handlingLb*100);
 const totalLb=totalHundredths/100;
 const requiredChartLb=Math.ceil(totalHundredths/60);
 if(input.unknownHandling||!input.handlingLb||input.specialLift||input.fullOutriggers!==true)return {status:'manual-review',totalLb,requiredChartLb,matches:[],reason:'CCC must review unknown handling weights, special lifts, or setups without confirmed full outrigger space.'};
 const matches=profiles.flatMap(profile=>{
  const booms=[...new Set(profile.cells.map(c=>c.boomFt))].sort((a,b)=>a-b);
  const setups=booms.flatMap(boom=>{
   const rows=profile.cells.filter(c=>c.boomFt===boom).sort((a,b)=>a.radiusFt-b.radiusFt);
   if(input.radiusFt<rows[0].radiusFt||input.radiusFt>rows.at(-1)!.radiusFt)return [];
   const cell=rows.find(c=>c.radiusFt>=input.radiusFt)!;
   const adjustedChartLb=cell.ratedLb-cell.deductionLb;
   // Integer hundredths of a pound: never round a load downward to fit the 60% cap.
   if(totalHundredths>adjustedChartLb*60)return [];
   // Conservative planning geometry only: omit positive boom-pin elevation,
   // reserve 10 ft, and round down. Loaded angles are approximate in these guides.
   // Actual working range, deflection, hook clearance and lift path still need CCC approval.
   const estimatedTipScreenFt=Math.max(0,Math.floor((cell.boomFt*Math.sin(cell.angleDeg*Math.PI/180)-10)/5)*5);
   if(input.liftHeightFt+input.headroomFt>estimatedTipScreenFt)return [];
   return[{...cell,adjustedChartLb,allowedGrossLb:adjustedChartLb*60/100,estimatedTipScreenFt,chartUtilizationPercent:Math.min(60,Math.ceil(totalLb/adjustedChartLb*10000-1e-9)/100)}];
  });
  if(!setups.length)return [];
  return[{id:profile.id,name:profile.name,source:profile.source,page:profile.page,setup:profile.setup,chartCode:profile.chartCode,deductionNote:profile.deductionNote,...setups[0]}];
 });
 return {status:matches.length?'matches':'manual-review',totalLb,requiredChartLb,matches,reason:matches.length?'Preliminary planning matches only. CCC must verify the actual crane chart, configuration, reeving, reach, ground conditions, clearance and availability.':'No reviewed setup passed the 60% capacity and conservative reach screens. Request a manual lift review; this does not prove the job is impossible.'};
}
export function chartSourceMatches(profile:ChartProfile){
 try{return createHash('sha256').update(readFileSync(new URL('../public/'+profile.source,import.meta.url))).digest('hex')===profile.sha256;}catch{return false;}
}
