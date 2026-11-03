/* Secret placement logic for Axel's real F-011 office.
   Pre-approved spots are hidden. Newly bought props randomly take a suitable
   free spot, and their assignment is saved forever in the existing local save. */
(function () {
  "use strict";
  const layout=window.OFFICE_LAYOUT;
  const slotMap=new Map(layout.slots.map(slot=>[slot.id,slot]));
  function choose(item,used,random) {
    const allowed=layout.itemZones[item.id]||["desk","counter","shelf"];
    const preferred=layout.itemSlots&&layout.itemSlots[item.id];
    let candidates=Array.isArray(preferred)?layout.slots.filter(slot=>preferred.includes(slot.id)&&!used.has(slot.id)):[];
    if(!candidates.length)candidates=layout.slots.filter(slot=>allowed.includes(slot.zone)&&!used.has(slot.id));
    if(!candidates.length)candidates=layout.slots.filter(slot=>!used.has(slot.id));
    if(!candidates.length)return null;
    // Spread NEW purchases across the office's camera views, rather than
    // hiding everything on the desk side. Existing saved placements never move.
    if(random && candidates.length>1 && Array.isArray(layout.views) && layout.views.length>1) {
      const counts=new Map(layout.views.map(view=>[view.id,0]));
      for(const id of used) {
        const spot=slotMap.get(id);
        if(spot)counts.set(spot.view||"desk",(counts.get(spot.view||"desk")||0)+1);
      }
      const least=Math.min(...candidates.map(spot=>counts.get(spot.view||"desk")||0));
      const quieter=candidates.filter(spot=>(counts.get(spot.view||"desk")||0)===least);
      if(quieter.length && Math.random()<0.8)candidates=quieter;
    }
    let index;
    if(random)index=Math.floor(Math.random()*candidates.length);
    else {
      // Old purchases get a consistent position during migration.
      let hash=0;
      for(const character of item.id)hash=(hash*31+character.charCodeAt(0))>>>0;
      index=hash%candidates.length;
    }
    return candidates[index].id;
  }
  function restore(owned,existing) {
    const assigned={},used=new Set();
    const fromSave=existing && typeof existing==="object"?existing:{};
    for(const id of owned) {
      const slot=slotMap.get(fromSave[id]);
      if(slot&&!used.has(slot.id)) {assigned[id]=slot.id;used.add(slot.id);}
    }
    for(const id of owned) {
      if(assigned[id])continue;
      const item=window.GAME_DATA.items.find(i=>i.id===id);
      if(!item)continue;
      const slot=choose(item,used,false);
      if(slot){assigned[id]=slot;used.add(slot);}
    }
    return assigned;
  }
  window.OFFICE_PLACEMENT={choose,restore,spot(id){return slotMap.get(id)||null;}};
})();
