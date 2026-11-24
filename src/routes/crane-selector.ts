import {Hono} from 'hono';
import {bodyLimit} from 'hono/body-limit';
import {prisma} from '../db.js';
import {clientIp,createLimiter} from '../ratelimit.js';
import {craneChartData,screenLift,chartSourceMatches,chooseLiftRecommendation} from '../crane-selector.js';
export const craneSelector=new Hono();
const limit=createLimiter(100,15*60000);
const verifiedProfiles=craneChartData.profiles.filter(chartSourceMatches);
craneSelector.post('/',bodyLimit({maxSize:8000,onError:c=>c.json({error:'Lift request is too large.'},413)}),async c=>{
 if(limit(clientIp(c)))return c.json({error:'Too many calculations. Please try again later.'},429);
 const input=await c.req.json().catch(()=>null);if(!input||typeof input!=='object')return c.json({error:'Enter your lift requirements.'},400);
 const products=await prisma.product.findMany({where:{id:{in:craneChartData.profiles.map(p=>p.id)},hidden:false},select:{id:true,name:true,chart:true,rates:true,image:true,category:true}});
 const enabled=verifiedProfiles.filter(p=>products.some(product=>product.id===p.id&&product.chart?.replace(/^\//,'')===p.source&&product.name.replace(/[^a-z0-9]/gi,'').toLowerCase().includes(p.name.replace(/[^a-z0-9]/gi,'').toLowerCase())));
 try{
  const result=screenLift(input,enabled);
  const selected=chooseLiftRecommendation(input,result.matches);
  const matches=selected?[selected].map(m=>{const product=products.find(p=>p.id===m.id)!;const rate=(product.rates as Record<string,number>).hourly;return {...m,image:product.image,hourlyRate:typeof rate==='number'?rate:null,category:product.category};}):[];
  const recommendationReason=!selected?'CCC must review this lift; no suitable reviewed setup was selected.':input.loadLb>5000?'A rough-terrain crane is recommended for this heavier lift.':selected.equipmentType==='boom-truck'?'A boom truck meets the reviewed weight and height requirements.':'A rough-terrain crane is needed for the reviewed weight and height requirements.';
  return c.json({...result,matches,status:matches.length?'matches':'manual-review',recommendationReason,evaluatedMachineCount:enabled.length,limitPercent:60,excluded:[...craneChartData.excluded,...craneChartData.profiles.filter(p=>!enabled.includes(p)).map(p=>({id:p.id,name:p.name,reason:'Chart verification is needed. Please ask CCC for a manual equipment recommendation.'}))]});
 }catch(error){return c.json({error:error instanceof Error?error.message:'Check your lift requirements.'},400);}
});
