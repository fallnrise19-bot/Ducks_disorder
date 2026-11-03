/* Realistic hidden placement for the two photographic views of F-011.
   Legacy layouts are migrated once; item ownership, coins and Axel comments
   are never changed. Deterministic migration and random new purchases
   both avoid crowding and keep sensible physical surfaces. */
(function(){
"use strict";
const layout=window.OFFICE_LAYOUT;
const catalog=window.GAME_DATA.items;
const byId=new Map(catalog.map(item=>[item.id,item]));
const slots=layout.slots;
const slotMap=new Map(slots.map(slot=>[slot.id,slot]));
const aspect={
"duck_tactical.png":.84,"black_duck.png":.72,"royal_duck.png":1.01,
"red_bonsai.png":1.27,"dragon.png":1.05,"gnome.png":.70,
"c007_duck.png":.64,"succulent.png":.92,"ask_axel_mug.png":1.27,
"skull.png":.72,"amethyst.png":1.01,"black_cat.png":.59,
"globe.png":.69,"hourglass.png":.56,"chained_books.png":1.06,
"candles.png":.90,"mira_portrait.png":.85,"duck_army.png":1.46,
"dragon_king.png":1.05,"duck_portrait.png":.77,
"low_signal_neon.png":2.11,"bad_ideas_notebook.png":.86,
"mira_middle_finger.png":.88,"wooden_wolf.png":.78,
"wolf_paw_paperweight.png":1.01,"compass.png":.51,
"old_hoodie.png":1.35,"headphones.png":1.41,
"mira_lyrics.png":.96,"low_signal_cassettes.png":1.60,
"low_signal_speaker.png":2.18,"wolf_medallion.png":.84,
"chai_to_go.png":.70,"c007_binder.png":.69,
"security_tablet.png":1.69,"collar_display.png":1.31,
"c007_photo.png":.90,"file_folder.png":1.28,
"low_signal_mug.png":1.49,"chains.png":1.30
};
const scale={
"dragon-king":1.25,"dragon":1.13,"duck-army":1.25,
"gnome":1.1,"teddy":1.06,"cat":1.06,"old-hoodie":1.25,
"low-signal-neon":1.26,"mira-selfie":1.08,"duck-throne":1.05,
"portrait":1.06,"collar-display":1.12,
"chai-to-go":.85,"wolf-paw":.89,"wolf-medallion":.84
};
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
  const wall=slot.zone==="wall";
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
window.OFFICE_PLACEMENT={
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
