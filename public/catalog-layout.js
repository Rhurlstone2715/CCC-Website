/* Presentation-only rental categories. Product.category remains unchanged for booking policies. */
window.CCC_BROWSE=(()=>{
 const categories=[
  {id:'cranes',name:'Cranes',description:'Rough terrain cranes for every lift',hero:'rt890e'},
  {id:'boom-trucks',name:'Boom Trucks',description:'National & Altec boom trucks',hero:'national1400'},
  {id:'telehandlers',name:'Forklifts/Telehandlers',description:'Telehandlers for lifting & material placement',hero:'gth1056'},
  {id:'concrete',name:'Concrete Equipment',description:'Mixing, vibrating & finishing',hero:'diesel-mixer-9-cu-ft'},
  {id:'scaffolding',name:'Scaffolding & Props',description:'Scaffolding sets & post shores',hero:'scaffold'},
  {id:'wall-bracing',name:'Wall Bracing',description:'ICF bracing & Ellis wall braces',hero:'plumwall'},
  {id:'air',name:'Air Tools & Compressors',description:'Compressors & pneumatic tools',hero:'compressor'},
  {id:'power-generation',name:'Generators & Welders',description:'Site power, welding & electrical accessories',hero:'g25'},
  {id:'hydraulic',name:'Rebar Benders/Cutters',description:'Rebar cutting & bending tools',hero:'fs600'},
  {id:'heavy-hauling',name:'Heavy Hauling',description:'Trailer heads, dump trucks & heavy transport',hero:'lowboy'},
  {id:'attachments',name:'Attachments & Rigging',description:'Buckets, baskets, beams & lifting accessories',hero:'bucket'},
  {id:'handling',name:'Material Handling',description:'Pallet jacks & roller skids',hero:'palletjacks'},
  {id:'ground',name:'Ground Protection',description:'Mats for site access & surface protection',hero:'mats'},
  {id:'compaction',name:'Compaction Equipment',description:'Compactors, rollers & rammers',image:'/assets/categories/compaction.jpg'},
  {id:'lighting',name:'Construction Lighting',description:'Lighting for work areas & jobsites',image:'/assets/categories/lighting.jpg'},
  {id:'floor',name:'Floor Care Equipment',description:'Floor cleaning & surface preparation',image:'/assets/categories/floor.jpg'},
  {id:'ladders',name:'Ladders',description:'Access equipment for work at height',image:'/assets/categories/ladders.jpg'},
  {id:'garden',name:'Lawn & Garden Equipment',description:'Outdoor maintenance equipment',image:'/assets/categories/garden.jpg'},
  {id:'painting',name:'Painting & Wallpaper',description:'Tools for painting & decorating',image:'/assets/categories/painting.jpg'},
  {id:'power-tools',name:'Power Tools',description:'General powered jobsite tools',image:'/assets/categories/power-tools.jpg'},
  {id:'pressure',name:'Pressure Washer',description:'Pressure cleaning equipment',image:'/assets/categories/pressure.jpg'},
  {id:'pumps',name:'Pumps',description:'Water transfer & drainage equipment',image:'/assets/categories/pumps.jpg'},
  {id:'saws',name:'Saws',description:'Cutting equipment & accessories',image:'/assets/categories/saws.jpg'},
  {id:'other',name:'Other Equipment & Tools',description:'More equipment for your jobsite',fallback:true,image:'/assets/ccc-icon-192.png'}
 ];
 const productGroups={
  'pressure':['simpson-alh3425','simpson-cm61083'],
  'concrete':['wyco-995','diesel-mixer-9-cu-ft','concrete-jitter-bug','concrete-bull-float'],
  'scaffolding':['scaffold','props'],'wall-bracing':['plumwall','ellis'],
  'air':['compressor','impactgun'],'power-generation':['mini-welder','mini-plasma'],
  'hydraulic':['fs600','fr800c','handheld-rebar'],'handling':['palletjacks','rollers']
 };
 const standardGroups={'Rough Terrain Cranes':'cranes','Boom Trucks':'boom-trucks','Telehandlers':'telehandlers','Heavy Hauling':'heavy-hauling','Power Generation':'power-generation','Attachments':'attachments','Ground Protection':'ground'};
 function categoryId(p){
  if(standardGroups[p.category])return standardGroups[p.category];
  for(const [id,ids]of Object.entries(productGroups))if(ids.includes(p.id))return id;
  const name=String(p.name||'').toLowerCase();
  const rules=[['wall-bracing',/\b(brac|icf)/],['scaffolding',/scaffold|shoring|post shore/],['pressure',/pressure wash/],['compaction',/compactor|rammer|vibratory roller/],['lighting',/lighting|light tower|work light/],['floor',/floor (scrub|clean|polish|grind)/],['ladders',/ladder/],['garden',/mower|garden|trimmer|hedge/],['painting',/paint|wallpaper/],['pumps',/\bpump\b/],['saws',/\bsaw\b/],['air',/compressor|pneumatic/],['power-generation',/welder|plasma/],['hydraulic',/rebar|hydraulic/],['concrete',/concrete|cement mixer|bull float|jitter/],['handling',/pallet jack|roller skid/],['power-tools',/drill|grinder|power tool/]];
  return rules.find(([,pattern])=>pattern.test(name))?.[0]||'other';
 }
 function itemsFor(products,id){return products.filter(p=>!p.hidden&&!p.setPart&&!p.operatorService&&categoryId(p)===id)}
 function visibleCategories(products){return categories.filter(c=>!c.fallback||itemsFor(products,c.id).length)}
 return {categories,categoryId,itemsFor,visibleCategories};
})();
