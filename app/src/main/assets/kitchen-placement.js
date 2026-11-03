/* Realistic hidden placement for the F-006 kitchen photograph.
   Legacy layouts are migrated once; item ownership, coins and Axel comments
   are never changed. Deterministic migration and random new purchases
   both avoid crowding and keep sensible physical surfaces. */
(function(){
"use strict";
const layout=window.KITCHEN_LAYOUT;
const catalog=window.KITCHEN_CATALOG;
const byId=new Map(catalog.map(item=>[item.id,item]));
const slots=layout.slots;
const slotMap=new Map(slots.map(slot=>[slot.id,slot]));
const aspect={"basil_plant.png":0.729,"brownie_sundae.png":1.51,"chai_mug.png":1.164,"chaos_brownies_recipe.png":1.264,"chef_duck.png":0.87,"chips_bag.png":0.854,"coffee_bean_jar.png":0.714,"coffee_canister.png":0.762,"cookbooks.png":1.5,"cookie_jar.png":0.778,"cookie_tin.png":1.386,"diet_cola_sideways.png":1.396,"diet_cola_upright.png":0.688,"duck_candle.png":0.809,"grocery_clipboard.png":0.789,"gummy_blue.png":1.613,"gummy_bowl.png":1.445,"gummy_green.png":1.6,"gummy_orange.png":1.565,"gummy_pink.png":1.643,"gummy_purple.png":1.657,"hot_sauce.png":0.333,"iced_chai.png":0.623,"kitchen_memo_board.png":1.091,"kitchen_queen_trophy.png":0.805,"kitchen_timer.png":0.817,"lemon_bowl.png":1.373,"napkin_holder.png":1.054,"oven_mitt.png":1.108,"pepper_grinder.png":0.373,"pizza_open.png":1.191,"pizza_stack.png":1.306,"pothos_plant.png":1.13,"salt_grinder.png":0.553,"snack_stash_basket.png":1.326,"soda_sixpack.png":1.281,"tea_canister.png":0.71,"tea_towel.png":0.848,"utensils.png":0.995};
const scale={"k-kitchen_queen_trophy":1.65,"k-pizza_stack":1.35,"k-pizza_open":1.35,"k-soda_sixpack":1.3,"k-snack_stash_basket":1.25,"k-pothos_plant":1.25,"k-kitchen_memo_board":1.3,"k-utensils":1.08,"k-chef_duck":1.3};
function hash(value){
  let h=2166136261;
  for(const letter of value){h^=letter.charCodeAt(0);h=Math.imul(h,16777619);}
  return h>>>0;
}
function bounds(item,slot){
  if(!slot)return null;
  const ratio=aspect[item.asset]||1;
  const factor=scale[item.id]||1;
  let width=Math.min(.12,(slot.size||.042)*factor);
  // Never let a tall thin prop tower above the furniture supporting it.
  const height=width*(16/9)/ratio;
  if(height>(slot.maxHeight||.13))width*=((slot.maxHeight||.13)/height);
  const h=width*(16/9)/ratio;
  const wall=slot.zone==="wall"||slot.zone==="fridge";
  const x1=slot.x-width/2,x2=slot.x+width/2;
  const y1=wall?slot.y-h/2:slot.y-h;
  const y2=wall?slot.y+h/2:slot.y;
  return {x1,y1,x2,y2,w:width,h,view:slot.view||"desk"};
}
function overlap(a,b){
  if(!a||!b||a.view!==b.view)return 0;
  const dx=Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1));
  const dy=Math.max(0,Math.min(a.y2,b.y2)-Math.max(a.y1,b.y1));
  const aArea=Math.max(.00001,a.w*a.h),bArea=Math.max(.00001,b.w*b.h);
  return dx*dy/Math.min(aArea,bArea);
}
function pickCandidates(item,used){
  const preferred=layout.itemSlots&&layout.itemSlots[item.id];
  const zones=layout.itemZones[item.id]||["desk","counter","shelf"];
  const eligible=slots.filter(slot=>!used.has(slot.id)&&zones.includes(slot.zone));
  const wanted=Array.isArray(preferred)?eligible.filter(slot=>preferred.includes(slot.id)):[];
  return wanted.length?wanted:eligible;
}
function plan(item,assignments,random){
  const assigned=assignments&&typeof assignments==="object"?assignments:{};
  const pairs=Object.entries(assigned).map(([id,idSlot])=>({item:byId.get(id),slot:slotMap.get(idSlot)})).filter(p=>p.item&&p.slot);
  const occupied=new Set(pairs.map(p=>p.slot.id));
  let possible=pickCandidates(item,occupied);
  if(!possible.length)possible=slots.filter(slot=>!occupied.has(slot.id));
  if(!possible.length)return null;
  const views=new Map((layout.views||[]).map(view=>[view.id,0]));
  for(const pair of pairs){const v=pair.slot.view||"desk";views.set(v,(views.get(v)||0)+1);}
  const ranked=possible.map(slot=>{
    const b=bounds(item,slot);
    let crowd=0,near=0;
    for(const pair of pairs){
      if((pair.slot.view||"desk")!==(slot.view||"desk"))continue;
      const other=bounds(pair.item,pair.slot);
      crowd+=overlap(b,other);
      const separation=Math.hypot(b.x1+b.w/2-other.x1-other.w/2,(b.y1+b.h/2-other.y1-other.h/2)*.9);
      if(separation<.08)near+=(.08-separation)*24;
    }
    // Fill both camera views evenly; intersections are extremely costly.
    const loading=(views.get(slot.view||"desk")||0)*10;
    // Stable variation during migration; purchases add fresh randomness.
    const variation=random?Math.random()*3:(hash(item.id+":"+slot.id)%1000)/500;
    return {slot,score:loading+near+crowd*1800+variation,crowd};
  });
  ranked.sort((a,b)=>a.score-b.score);
  // Small random shortlist only when choices are similarly safe.
  const best=ranked[0];
  const choices=ranked.filter(x=>x.score<=best.score+2.8&&x.crowd<=best.crowd+.005);
  return (random?choices[Math.floor(Math.random()*choices.length)]:best).slot.id;
}
function restore(owned,existing,opts){
  const saved=existing&&typeof existing==="object"?existing:{};
  const reset=!!(opts&&opts.reflow);
  const result={},already=new Set();
  if(!reset)for(const id of owned){
    const slot=slotMap.get(saved[id]);
    if(slot&&!already.has(slot.id)&&byId.has(id)){
      result[id]=slot.id;already.add(slot.id);
    }
  }
  const remaining=owned.filter(id=>byId.has(id)&&!result[id]);
  // Restricted wall/large pieces get suitable positions before general mugs.
  remaining.sort((a,b)=>{
    const aZones=(layout.itemZones[a]||["desk","counter","shelf"]).length;
    const bZones=(layout.itemZones[b]||["desk","counter","shelf"]).length;
    const ap=layout.itemSlots&&layout.itemSlots[a]?1:0;
    const bp=layout.itemSlots&&layout.itemSlots[b]?1:0;
    return bp-ap||aZones-bZones||hash(a)-hash(b);
  });
  for(const id of remaining){
    const chosen=plan(byId.get(id),result,false);
    if(chosen)result[id]=chosen;
  }
  return result;
}
window.KITCHEN_PLACEMENT={
  choose(item,assigned,random){
    if(assigned instanceof Set){
      // Compatibility with older clients that passed occupied slot IDs.
      const reconstructed={};
      let n=0;
      for(const slot of assigned)reconstructed["legacy-"+n++]=slot;
      return plan(item,reconstructed,!!random);
    }
    return plan(item,assigned,!!random);
  },
  restore,spot(id){return slotMap.get(id)||null;},bounds,
  overlap,layoutVersion:layout.layoutVersion
};
})();
