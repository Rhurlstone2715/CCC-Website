import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export type ChartCell={radiusFt:number;boomFt:number;ratedLb:number;angleDeg:number;deductionLb:number};
export type ChartProfile={id:string;name:string;source:string;sha256:string;page:number;setup:string;chartCode:string;deductionNote:string;singleLineLimitLb?:number;singleLineSourcePage?:number;singleLineNote?:string;cells:ChartCell[]};
export const craneChartData=JSON.parse(readFileSync(new URL('../data/crane-selector-charts.json',import.meta.url),'utf8')) as {profiles:ChartProfile[];excluded:{id:string;name:string;reason:string}[]};
export type LiftInput={loadLb:number;liftHeightFt:number};
// Planning brochures only; actual unit configuration and lift conditions need CCC review.
// Standard handling allowances are fixed on the server, never supplied by the customer.
export function screenLift(input:LiftInput,profiles:ChartProfile[]=craneChartData.profiles){
 for(const key of ['loadLb','liftHeightFt'] as const)if(!Number.isFinite(input[key])||input[key]<=0)throw Error('Enter a positive item weight and approximate lifting height.');
 if(input.loadLb>500000||input.liftHeightFt>500)throw Error('These values need direct lift-planning review.');
 if(Math.abs(input.loadLb*100-Math.round(input.loadLb*100))>0.000001)throw Error('Enter item weight to no more than two decimal places.');
 const matches=profiles.flatMap(profile=>{
  const boomTruck=!profile.id.startsWith('rt');
  if(boomTruck&&(!Number.isFinite(profile.singleLineLimitLb)||profile.singleLineLimitLb!<=0))return [];
  const riggingLb=boomTruck?500:800;
  const totalHundredths=Math.round(input.loadLb*100)+riggingLb*100,totalLb=totalHundredths/100;
  const setups=profile.cells.flatMap(cell=>{
   const adjustedChartLb=cell.ratedLb-cell.deductionLb;
   // Hard 60% limit, including standard rigging, without rounding down to fit.
   const effectiveRatedLb=Math.min(adjustedChartLb,profile.singleLineLimitLb??Infinity);
   if(totalHundredths>effectiveRatedLb*60)return [];
   // Approximate height pre-screen: omit boom-pin elevation, reserve 10 ft,
   // round down to 5 ft. Actual deflection and hook/rigging clearance need review.
   const estimatedTipScreenFt=Math.max(0,Math.floor((cell.boomFt*Math.sin(cell.angleDeg*Math.PI/180)-10)/5)*5);
   if(input.liftHeightFt>estimatedTipScreenFt)return [];
   return[{...cell,adjustedChartLb,effectiveRatedLb,allowedGrossLb:effectiveRatedLb*60/100,estimatedTipScreenFt,chartUtilizationPercent:Math.min(60,Math.ceil(totalLb/adjustedChartLb*10000-1e-9)/100)}];
  }).sort((a,b)=>b.radiusFt-a.radiusFt||a.boomFt-b.boomFt);
  if(!setups.length)return [];
  return[{id:profile.id,name:profile.name,source:profile.source,page:profile.page,setup:profile.setup,chartCode:profile.chartCode,deductionNote:profile.deductionNote,singleLineLimitLb:profile.singleLineLimitLb,singleLineSourcePage:profile.singleLineSourcePage,singleLineNote:profile.singleLineNote,riggingLb,totalLb,requiredChartLb:Math.ceil(totalHundredths/60),...setups[0]}];
 });
 return {status:matches.length?'matches':'manual-review',loadLb:input.loadLb,liftHeightFt:input.liftHeightFt,matches,reason:matches.length?'Preliminary maximum chart radii only, for stationary main-boom lifts on full outriggers. CCC must confirm actual rigging weight, height, configuration, ground conditions, clearance and availability.':'No reviewed setup passed the 60% capacity and approximate height screens. Contact CCC for a lift review.'};
}
export function chartSourceMatches(profile:ChartProfile){
 try{return createHash('sha256').update(readFileSync(new URL('../public/'+profile.source,import.meta.url))).digest('hex')===profile.sha256;}catch{return false;}
}
