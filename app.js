/* Ducks & Disorder: offline-first packing rewards, daily routines, collectibles. */
(function () {
"use strict";
const DATA = window.GAME_DATA;
const PLACE = window.OFFICE_PLACEMENT;
const OFFICE = window.OFFICE_LAYOUT;
const KITCHEN = window.KITCHEN_LAYOUT;
const KPLACE = window.KITCHEN_PLACEMENT;
const DECOR_ROOMS=[{id:"F-011",name:"Axel\'s Office",icon:"🗃️"},{id:"F-006",name:"Kitchen",icon:"🍕"}];
const AXEL = window.AXEL_REACTIONS;
const PACKING_ROOMS = Array.isArray(window.DUCKS_PACKING_ROOMS) ? [...window.DUCKS_PACKING_ROOMS].sort((a,b)=>a.priority-b.priority) : [];
const PHASES = {now:0,final:1,moving:2};
const KEY = "ducks-disorder-v1";
const BRIDGE = window.DucksBridge || null;
const $ = id => document.getElementById(id);
const BOX_PAY = { small:50, medium:100, large:175 };
const PROMPTS = [
  "Put three things into the box.",
  "Pack something you won't need before moving.",
  "Wrap one fragile item.",
  "Find the tape, a marker and your next box.",
  "Clear one tiny corner.",
  "Choose five things to pack.",
  "Add another handful of items.",
  "Three things count. You can stop there."
];
const ROUTINES = [
  {id:"water", emoji:"💧", name:"Drink some water", detail:"A glass or a few good sips", coins:5, limit:4, period:"day"},
  {id:"food", emoji:"🍽️", name:"Eat something", detail:"A meal or substantial snack", coins:10, limit:3, period:"day"},
  {id:"dishes", emoji:"🧽", name:"Quick dish reset", detail:"Tackle dishes or clear the sink", coins:15, limit:1, period:"day"},
  {id:"dishwasher", emoji:"🍴", name:"Run or empty the dishwasher", detail:"An everyday household win", coins:20, limit:1, period:"day"},
  {id:"laundry", emoji:"🧺", name:"Laundry", detail:"Sunday routine, claim any day this week", coins:65, limit:1, period:"week", due:0},
  {id:"garbage", emoji:"🗑️", name:"Put out the garbage", detail:"Tuesday evening routine, claim any day this week", coins:40, limit:1, period:"week", due:2}
];
const validNum = value => Math.max(0, Math.min(999999999, Math.floor(Number(value) || 0)));
function dayKey() {
  const d = new Date();
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function weekKey() {
  const d = new Date();
  d.setHours(12,0,0,0);
  d.setDate(d.getDate()-d.getDay());
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function defaults() {
  return {
    coins:0, totalEarned:0, owned:[], placements:{}, officeLayoutVersion:PLACE.layoutVersion, officeView:"desk", kitchenLayoutVersion:KPLACE.layoutVersion, kitchenView:"island", decorRoom:"F-011", shopRoom:"F-011", axelReactions:[], history:[], custom:[], wishlist:null,
    boxSize:"small", boxes:{small:0,medium:0,large:0},
    boxCounts:{small:0,medium:0,large:0},
    promptIndex:0, view:"tasks",
    houseRoom:"basement", houseCursor:{}, houseDone:{}, houseSkipped:{}, phase:"now", binsFreed:0,
    lifeDaily:{key:dayKey(),water:0,food:0,dishes:0,dishwasher:0},
    lifeWeekly:{key:weekKey(),laundry:0,garbage:0}
  };
}
function normalize(raw) {
  const s=defaults();
  if (!raw || typeof raw!=="object" || Array.isArray(raw)) return s;
  s.coins=validNum(raw.coins);
  s.totalEarned=validNum(raw.totalEarned===undefined?raw.earned||raw.coins:raw.totalEarned);
  s.owned=Array.isArray(raw.owned)?[...new Set(raw.owned.filter(id=>DATA.items.some(item=>item.id===id)))]:[];
  // Keep both collections and every saved item. Migrate office placements only
  // with the office engine, and kitchen props only with the kitchen engine.
  const oldOfficeLayout=Number(raw.officeLayoutVersion)||0;
  const oldKitchenLayout=Number(raw.kitchenLayoutVersion)||0;
  const officeOwned=s.owned.filter(id=>DATA.items.some(item=>item.id===id&&item.room==="F-011"));
  const kitchenOwned=s.owned.filter(id=>DATA.items.some(item=>item.id===id&&item.room==="F-006"));
  s.placements={
    ...PLACE.restore(officeOwned,raw.placements,{reflow:oldOfficeLayout<PLACE.layoutVersion}),
    ...KPLACE.restore(kitchenOwned,raw.placements,{reflow:oldKitchenLayout<KPLACE.layoutVersion})
  };
  s.officeLayoutVersion=PLACE.layoutVersion;
  s.kitchenLayoutVersion=KPLACE.layoutVersion;
  s.officeView=OFFICE.views.some(v=>v.id===raw.officeView)?raw.officeView:OFFICE.views[0].id;
  s.kitchenView=KITCHEN.views.some(v=>v.id===raw.kitchenView)?raw.kitchenView:KITCHEN.views[0].id;
  s.decorRoom=DECOR_ROOMS.some(r=>r.id===raw.decorRoom)?raw.decorRoom:"F-011";
  s.shopRoom=DECOR_ROOMS.some(r=>r.id===raw.shopRoom)?raw.shopRoom:"F-011";
  s.axelReactions=AXEL.clean(raw.axelReactions,s.owned);
  s.history=Array.isArray(raw.history)?raw.history.filter(h=>h&&typeof h.id==="string").slice(-250):[];
  s.custom=Array.isArray(raw.custom)?raw.custom.filter(t=>t&&typeof t.name==="string"&&t.name.trim()).slice(0,50).map(t=>({
    id:typeof t.id==="string"?t.id:"custom-"+Date.now(),
    name:t.name.slice(0,70),reward:Math.min(200,validNum(t.reward||40))
  })):[];
  s.wishlist=DATA.items.some(i=>i.id===raw.wishlist)?raw.wishlist:null;
  s.boxSize=Object.prototype.hasOwnProperty.call(BOX_PAY,raw.boxSize)?raw.boxSize:"small";
  for (const size of Object.keys(BOX_PAY)) {
    s.boxes[size]=Math.min(3,validNum(raw.boxes&&raw.boxes[size]));
    s.boxCounts[size]=validNum(raw.boxCounts&&raw.boxCounts[size]);
  }
  s.promptIndex=validNum(raw.promptIndex);
  s.houseRoom=PACKING_ROOMS.some(r=>r.id===raw.houseRoom)?raw.houseRoom:"basement";
  s.phase=Object.prototype.hasOwnProperty.call(PHASES,raw.phase)?raw.phase:"now";
  s.binsFreed=validNum(raw.binsFreed);
  const missionIds=new Set(PACKING_ROOMS.flatMap(r=>r.missions.map(m=>m.id)));
  if(raw.houseDone && typeof raw.houseDone==="object")
    for(const id of missionIds)s.houseDone[id]=Math.min(10000,validNum(raw.houseDone[id]));
  if(raw.houseSkipped && typeof raw.houseSkipped==="object")
    for(const id of missionIds)if(raw.houseSkipped[id])s.houseSkipped[id]=true;
  if(raw.houseCursor && typeof raw.houseCursor==="object")
    for(const room of PACKING_ROOMS)s.houseCursor[room.id]=validNum(raw.houseCursor[room.id]);
  s.view=["tasks","life","rooms","shop","progress"].includes(raw.view)?raw.view:"tasks";
  if (raw.lifeDaily && raw.lifeDaily.key===dayKey()) {
    for(const r of ROUTINES.filter(t=>t.period==="day"))
      s.lifeDaily[r.id]=Math.min(r.limit,validNum(raw.lifeDaily[r.id]));
  }
  if (raw.lifeWeekly && raw.lifeWeekly.key===weekKey()) {
    for(const r of ROUTINES.filter(t=>t.period==="week"))
      s.lifeWeekly[r.id]=Math.min(r.limit,validNum(raw.lifeWeekly[r.id]));
  }
  return s;
}
function readState() {
  // Existing test APKs saved localStorage; prefer that so upgrading preserves purchases.
  let raw="";
  try { raw=localStorage.getItem(KEY)||""; } catch (_) {}
  if(!raw && BRIDGE) try {raw=BRIDGE.load()||"";} catch (_) {}
  try {return normalize(raw?JSON.parse(raw):null);}catch(_){return defaults();}
}
let state=readState();
let justPurchased=null;
function save() {
  const json=JSON.stringify(state);
  try {localStorage.setItem(KEY,json);}catch(_){}
  if(BRIDGE) try {BRIDGE.save(json);}catch(_){}
}
function syncPeriods() {
  let changed=false;
  if(state.lifeDaily.key!==dayKey()){
    state.lifeDaily={key:dayKey(),water:0,food:0,dishes:0,dishwasher:0};changed=true;
  }
  if(state.lifeWeekly.key!==weekKey()){
    state.lifeWeekly={key:weekKey(),laundry:0,garbage:0};changed=true;
  }
  if(changed)save();
}
function addHistory(id,name,earned,extra) {
  state.coins+=earned;
  state.totalEarned+=earned;
  state.history.push(Object.assign({id,name,date:dayKey(),at:Date.now(),earned},extra||{}));
  if(state.history.length>250)state.history=state.history.slice(-250);
  save();
  render();
  flash("+"+earned+" coins • "+name);
}
let toastTimer;
function flash(message) {
  const el=$("toast");
  el.textContent=message;
  el.hidden=false;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{el.hidden=true;},2600);
}
function show(view) {
  if(!["tasks","life","rooms","shop","progress"].includes(view))return;
  state.view=view;save();
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===view));
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("hidden",p.id!==view));
  render();
}
function claimBox(full) {
  const size=state.boxSize;
  const before=state.boxes[size];
  const after=full?4:before+1;
  // Floors ensure 4 quarters pay EXACTLY the whole-box value.
  const gain=Math.floor(BOX_PAY[size]*after/4)-Math.floor(BOX_PAY[size]*before/4);
  const completed=after===4;
  state.boxes[size]=completed?0:after;
  if(completed)state.boxCounts[size]+=1;
  state.promptIndex+=1;
  addHistory("box-"+size,completed?"Finished "+size+" box":"Packed ¼ of "+size+" box",gain,{boxComplete:completed});
}
function claimTask(task) {
  addHistory(task.id,task.name,Math.min(200,validNum(task.reward)));
}
function claimRoutine(r) {
  syncPeriods();
  const record=r.period==="week"?state.lifeWeekly:state.lifeDaily;
  if(record[r.id]>=r.limit) return;
  record[r.id]+=1;
  addHistory("life-"+r.id,r.name,r.coins);
}
function purchase(item) {
  if(state.owned.includes(item.id)||state.coins<item.cost)return;
  const kitchen=item.room==="F-006";
  const engine=kitchen?KPLACE:PLACE;
  state.coins-=item.cost;
  state.placements[item.id]=engine.choose(item,state.placements,true);
  const location=engine.spot(state.placements[item.id]);
  state.decorRoom=item.room;
  state.shopRoom=item.room;
  if(location) {
    if(kitchen)state.kitchenView=location.view||"island";
    else state.officeView=location.view||OFFICE.views[0].id;
  }
  state.owned.push(item.id);
  let reaction=AXEL.pick(item,state.owned.length,state.axelReactions);
  // Axel is aware when the kitchen becomes Mira's second trouble zone.
  if(kitchen) reaction.text=reaction.text
    .replace(/my office/gi,"the kitchen").replace(/this office/gi,"this kitchen")
    .replace(/the office/gi,"the kitchen").replace(/my desk/gi,"the island")
    .replace(/the desk/gi,"the island").replace(/my furniture/gi,"the counters")
    .replace(/my shelves/gi,"the cupboards");
  state.axelReactions.push(reaction);
  justPurchased=item.id;
  save();show("rooms");
  flash(item.name+" has appeared in "+(kitchen?"the kitchen":"Axel's office")+".");
}
function node(tag,cls,text) {
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined)el.textContent=text;
  return el;
}

/* User-specific prioritized room plan, ported from Under the Willow's house.js. */
function currentHouseRoom() { return PACKING_ROOMS.find(r=>r.id===state.houseRoom)||PACKING_ROOMS[0]||null; }
function activeMissions(room) {
  return room?room.missions.filter(m=>PHASES[m.phase]<=PHASES[state.phase]&&!state.houseSkipped[m.id]&&(m.repeat||!state.houseDone[m.id])):[];
}
function currentHouseMission() {
  const room=currentHouseRoom(),list=activeMissions(room);
  return list.length?list[(state.houseCursor[room.id]||0)%list.length]:null;
}
function pickHouse(id) {
  if(!PACKING_ROOMS.some(r=>r.id===id))return;
  state.houseRoom=id;save();render();
}
function chooseHouseForMe() {
  const rooms=PACKING_ROOMS.filter(r=>activeMissions(r).length);
  if(!rooms.length){flash("No available missions. You can unlock another phase under Stats.");return;}
  // Prefer high-priority untried jobs, not an endless repeat of the first basement mission.
  const room=rooms.find(r=>activeMissions(r).some(m=>!state.houseDone[m.id]))||rooms[0];
  const list=activeMissions(room);
  const idx=list.findIndex(m=>!state.houseDone[m.id]);
  state.houseRoom=room.id;
  state.houseCursor[room.id]=idx>=0?idx:(state.houseCursor[room.id]||0)+1;
  save();render();flash("Recommended: "+room.name);
}
function completeHouseMission() {
  const room=currentHouseRoom(),mission=currentHouseMission();
  if(!room||!mission)return;
  state.houseDone[mission.id]=(state.houseDone[mission.id]||0)+1;
  if(mission.id==="b-empty")state.binsFreed++;
  state.houseCursor[room.id]=(state.houseCursor[room.id]||0)+1;
  addHistory("house-"+mission.id,mission.title,mission.cash,{room:room.id,missionId:mission.id});
}
function skipHouseMission() {
  const room=currentHouseRoom(),list=activeMissions(room);
  if(!room||list.length<2){flash("No other available job in this room.");return;}
  state.houseCursor[room.id]=(state.houseCursor[room.id]||0)+1;
  save();render();
}
function dismissHouseMission() {
  const mission=currentHouseMission();
  if(!mission)return;
  state.houseSkipped[mission.id]=true;save();render();flash("Hidden for now. No coins awarded.");
}
function restoreRoomMissions() {
  const room=currentHouseRoom();if(!room)return;
  for(const m of room.missions)delete state.houseSkipped[m.id];
  save();render();flash("Hidden jobs restored.");
}
function setPackingPhase(phase) {
  if(!Object.prototype.hasOwnProperty.call(PHASES,phase))return;
  state.phase=phase;save();render();
  flash(phase==="now"?"Showing early packing.":phase==="final"?"Final-weeks jobs unlocked.":"Moving-day jobs unlocked.");
}
function renderHouse() {
  const room=currentHouseRoom();if(!room)return;
  const list=activeMissions(room),mission=currentHouseMission();
  const unique=room.missions.filter(m=>state.houseDone[m.id]>0).length;
  const hidden=room.missions.filter(m=>state.houseSkipped[m.id]).length;
  $("houseRoomTitle").textContent=room.icon+" "+room.name;
  $("houseRoomStatus").textContent=room.status+" · Priority "+room.priority;
  $("houseRoomDetail").textContent=room.description;
  const notes=$("houseNotes");notes.replaceChildren();
  for(const note of room.notes||[])notes.append(node("p","house-note","• "+note));
  const picker=$("housePicker");picker.replaceChildren();
  for(const r of PACKING_ROOMS) {
    const done=r.missions.filter(m=>state.houseDone[m.id]).length;
    const button=node("button",r.id===room.id?"selected":"",r.icon+" "+r.name+" ("+done+"/"+r.missions.length+")");
    button.addEventListener("click",()=>pickHouse(r.id));picker.append(button);
  }
  $("missionRoom").textContent=room.name.toUpperCase()+" · "+(mission?mission.phase==="now"?"EARLY PACKING":mission.phase==="final"?"FINAL WEEKS":"MOVING DAY":"NO AVAILABLE JOBS");
  $("missionReward").textContent=mission?"+"+mission.cash+" coins":"";
  $("missionName").textContent=mission?mission.title:"Nothing else available in this phase";
  $("missionDetail").textContent=mission?mission.detail:"Choose another room, restore hidden jobs, or unlock a later phase under Stats.";
  $("missionFlag").textContent=mission?(mission.repeat?"REPEATABLE · one real job per claim":"ONE-TIME JOB"):"";
  $("houseDoneButton").disabled=!mission;
  $("houseSkipBtn").disabled=list.length<2;
  $("houseDismissBtn").disabled=!mission;
  $("houseMissionNote").textContent="Completed jobs in this room: "+unique+" / "+room.missions.length+" · Available now: "+list.length;
  $("restoreHiddenBtn").hidden=!hidden;
  $("restoreHiddenBtn").textContent="Restore "+hidden+" hidden "+(hidden===1?"job":"jobs")+" in this room";
}
function renderPhase() {
  const picker=$("phasePicker");picker.replaceChildren();
  for(const phase of [{id:"now",label:"Pack early"},{id:"final",label:"Final weeks"},{id:"moving",label:"Moving days"}]) {
    const b=node("button",state.phase===phase.id?"selected":"",phase.label);
    b.addEventListener("click",()=>setPackingPhase(phase.id));picker.append(b);
  }
  $("phaseNote").textContent=state.phase==="now"?
    "Pack nonessentials; keep everyday cooking, school gear, comfort items and electronics available.":
    state.phase==="final"?
    "Final 2–3 weeks: toys, accessories and more equipment can be packed carefully.":
    "Moving-day jobs are unlocked. Keep travel and overnight essentials separate.";
  $("roomMissionsDone").textContent=PACKING_ROOMS.reduce((sum,r)=>sum+r.missions.filter(m=>state.houseDone[m.id]).length,0);
  $("freedBins").textContent=state.binsFreed;
}

function renderPacking() {
  renderHouse();
  $("boxSize").value=state.boxSize;
  const quarter=state.boxes[state.boxSize],total=BOX_PAY[state.boxSize];
  $("boxProgress").textContent=quarter+" / 4 quarters • "+(state.boxCounts[state.boxSize]||0)+" completed "+state.boxSize+" boxes";
  $("boxProgressFill").style.width=(quarter*25)+"%";
  $("quarterBox").textContent="Packed another ¼  ·  +"+(Math.floor(total*(quarter+1)/4)-Math.floor(total*quarter/4));
  $("fullBox").textContent="Finished this box  ·  +"+(total-Math.floor(total*quarter/4));
  $("packingPrompt").textContent=PROMPTS[state.promptIndex%PROMPTS.length];
  const list=$("taskList");
  list.replaceChildren();
  for(const task of state.custom) {
    const el=node("div","item");
    const info=node("div","");
    info.append(node("strong","",task.name),node("small","", "+"+task.reward+" coins per completion"));
    const btn=node("button","","Claim");
    btn.addEventListener("click",()=>claimTask(task));
    el.append(info,btn);
    list.append(el);
  }
  $("done").textContent=state.history.filter(h=>h.date===dayKey()).length;
}
function remindersEnabled() {
  try{return !!(BRIDGE&&BRIDGE.remindersEnabled());}catch(_){return false;}
}
function renderLife() {
  const list=$("lifeList");list.replaceChildren();
  const weekday=new Date().getDay();
  const ordered=[...ROUTINES].sort((a,b)=>(a.due===weekday?0:1)-(b.due===weekday?0:1));
  for(const r of ordered) {
    const record=r.period==="week"?state.lifeWeekly:state.lifeDaily;
    const count=record[r.id]||0,done=count>=r.limit;
    const el=node("div","item"+(done?" routine-done":""));
    const info=node("div","life-copy");
    info.append(node("strong","",r.emoji+" "+r.name),node("small","",r.detail),
      node("span","muted",r.period==="week"?(done?"Done this week ✓":(r.due===weekday?"Due today":"Once per week")):(count+"/"+r.limit+" today")));
    const btn=node("button","",done?"✓ Done":"+"+r.coins);
    btn.disabled=done;
    btn.addEventListener("click",()=>claimRoutine(r));
    el.append(info,btn);list.append(el);
  }
  const on=remindersEnabled();
  $("reminderBtn").textContent=on?"Turn reminders off":"Turn on gentle reminders";
  $("reminderStatus").textContent=on?
    "On • Water noon / 4 PM / 8 PM, meals 1 PM / 6 PM, dishwasher 9 PM, laundry Sunday 1 PM, garbage Tuesday 7 PM.":
    "Off • Optional phone reminders for water, meals, dishwasher, Sunday laundry and Tuesday garbage.";
}
function renderShop() {
  const picker=$("shopRoomPicker");picker.replaceChildren();
  for(const room of DECOR_ROOMS){
    const button=node("button",state.shopRoom===room.id?"selected":"",room.icon+" "+room.name);
    button.setAttribute("aria-pressed",String(state.shopRoom===room.id));
    button.addEventListener("click",()=>{state.shopRoom=room.id;save();renderShop();});
    picker.append(button);
  }
  const wish=DATA.items.find(x=>x.id===state.wishlist);
  $("wishlist").textContent=!wish?"☆ Pick an item as your savings goal.":
    state.owned.includes(wish.id)?"★ Goal achieved: "+wish.name+"!":
    "★ Saving for "+wish.name+" • "+Math.max(0,wish.cost-state.coins)+" coins to go • about "+Math.ceil(Math.max(0,wish.cost-state.coins)/175)+" large boxes";
  const cat=$("catalog");cat.replaceChildren();
  for(const item of DATA.items.filter(i=>i.room===state.shopRoom)) {
    const owned=state.owned.includes(item.id);
    const el=node("div","item shop-item");
    const info=node("div","shop-info");
    const thumbnail=node("img","shop-thumb");
    thumbnail.src=(item.room==="F-006"?"kitchen/":"collectibles/")+item.asset;
    thumbnail.alt="";
    thumbnail.loading="lazy";
    const copy=node("div","shop-copy");
    copy.append(node("strong","",item.name),
      node("small","",(DATA.tiers[item.tier-1]||"Collectible")+" • "+(owned?"Owned":item.cost+" coins")));
    info.append(thumbnail,copy);
    const actions=node("div","shop-actions");
    const goal=node("button","",state.wishlist===item.id?"★ Goal":"☆ Wish");
    goal.setAttribute("aria-label","Choose "+item.name+" as savings goal");
    goal.addEventListener("click",()=>{state.wishlist=state.wishlist===item.id?null:item.id;save();render();});
    const buy=node("button",owned?"":"primary",owned?"Owned":"Buy");
    buy.disabled=owned||state.coins<item.cost;
    buy.addEventListener("click",()=>purchase(item));
    actions.append(goal,buy);el.append(info,actions);cat.append(el);
  }
}

function decorLayout(){return state.decorRoom==="F-006"?KITCHEN:OFFICE;}
function decorEngine(){return state.decorRoom==="F-006"?KPLACE:PLACE;}
function decorViewKey(){return state.decorRoom==="F-006"?"kitchenView":"officeView";}
function officeView(){
  const layout=decorLayout(),selected=state[decorViewKey()];
  return layout.views.find(v=>v.id===selected)||layout.views[0];
}
function selectDecorRoom(id){
  if(!DECOR_ROOMS.some(room=>room.id===id))return;
  state.decorRoom=id;save();renderRoom();
}
function selectOfficeView(id){
  const layout=decorLayout();
  if(!layout.views.some(view=>view.id===id))return;
  state[decorViewKey()]=id;save();renderRoom();
}
function stepOfficeView(step){
  const layout=decorLayout();
  const index=layout.views.findIndex(view=>view.id===state[decorViewKey()]);
  selectOfficeView(layout.views[(Math.max(0,index)+step+layout.views.length)%layout.views.length].id);
}
function renderRoom() {
  const layout=decorLayout(),engine=decorEngine(),view=officeView();
  const room=DECOR_ROOMS.find(r=>r.id===state.decorRoom);
  $("decorRoomHeading").textContent=room.name+" · "+room.id;
  const picker=$("decorRoomPicker");picker.replaceChildren();
  for(const option of DECOR_ROOMS){
    const b=node("button",option.id===state.decorRoom?"selected":"",option.icon+" "+option.name);
    b.setAttribute("aria-pressed",String(option.id===state.decorRoom));
    b.addEventListener("click",()=>selectDecorRoom(option.id));
    picker.append(b);
  }
  const photo=$("officePhoto");
  if(photo.dataset.viewId!==(room.id+":"+view.id)){
    photo.src=view.image;photo.dataset.viewId=room.id+":"+view.id;
  }
  photo.alt=view.alt;
  $("officeViewTitle").textContent=view.name;
  const viewIndex=layout.views.findIndex(x=>x.id===view.id);
  $("officeViewCount").textContent=(viewIndex+1)+" of "+layout.views.length+" views";
  $("officePrevView").disabled=layout.views.length<=1;
  $("officeNextView").disabled=layout.views.length<=1;
  const dots=$("officeViewDots");dots.replaceChildren();
  for(const candidate of layout.views){
    const dot=node("button",candidate.id===view.id?"office-dot active":"office-dot","●");
    dot.title=candidate.name;
    dot.setAttribute("type","button");
    dot.setAttribute("aria-label","Show "+candidate.name);
    dot.setAttribute("aria-pressed",String(candidate.id===view.id));
    dot.addEventListener("click",()=>selectOfficeView(candidate.id));
    dots.append(dot);
  }
  const board=$("placements");board.replaceChildren();
  const roomItems=DATA.items.filter(item=>item.room===state.decorRoom);
  for(const item of roomItems.filter(item=>state.owned.includes(item.id))){
    const spot=engine.spot(state.placements[item.id]);
    if(!spot || (spot.view||layout.views[0].id)!==view.id)continue;
    const prop=node("span","prop prop-"+spot.zone+(item.id===justPurchased?" prop-arrival":""));
    const image=node("img","prop-art");
    image.src=(item.room==="F-006"?"kitchen/":"collectibles/")+item.asset;
    image.alt=item.name;image.draggable=false;image.loading="lazy";
    prop.append(image);prop.title=item.name;
    prop.style.left=(spot.x*100)+"%";prop.style.top=(spot.y*100)+"%";
    const footprint=engine.bounds(item,spot);
    prop.style.width=(footprint?footprint.w*100:3)+"%";
    prop.setAttribute("role","img");
    prop.setAttribute("aria-label",item.name);
    prop.addEventListener("click",()=>flash(item.name));
    board.append(prop);
  }
  const roomOwned=roomItems.filter(item=>state.owned.includes(item.id)).length;
  $("roomCount").textContent=roomOwned+" / "+roomItems.length+" collectibles placed";
  const latest=DATA.items.find(i=>i.id===justPurchased&&i.room===state.decorRoom);
  const latestSpot=latest?engine.spot(state.placements[latest.id]):null;
  const latestHere=!!(latestSpot&&(latestSpot.view||layout.views[0].id)===view.id);
  $("roomReveal").hidden=!latestHere;
  $("roomReveal").textContent=latestHere?"New arrival: "+latest.name+". Can you spot it? 👀":"";
  const comment=[...state.axelReactions].reverse().find(x=>DATA.items.some(i=>i.id===x.itemId&&i.room===state.decorRoom));
  const reactionBox=$("axelReaction");
  reactionBox.hidden=!comment;
  reactionBox.className="axel-reaction"+(comment&&comment.itemId===justPurchased?" axel-reaction-new":"");
  $("axelReactionSubject").textContent=comment?"RE: "+comment.itemName:"";
  $("axelReactionText").textContent=comment?comment.text:"";
}
function renderProgress() {
  const total=Object.values(state.boxCounts).reduce((a,b)=>a+b,0);
  $("statBoxes").textContent=total;
  $("statToday").textContent=state.history.filter(h=>h.date===dayKey()&&h.boxComplete).length;
  $("statEarned").textContent=state.totalEarned.toLocaleString();
  $("statCollected").textContent=state.owned.length+" / "+DATA.items.length;
  $("boxTotals").textContent="Small: "+state.boxCounts.small+"  •  Medium: "+state.boxCounts.medium+"  •  Large: "+state.boxCounts.large;
  renderPhase();
  const recent=$("recent");recent.replaceChildren();
  for(const h of [...state.history].reverse().slice(0,10)) {
    const r=node("div","recent-row");
    r.append(node("span","",h.name||h.id),node("strong","", "+"+validNum(h.earned||0)));
    recent.append(r);
  }
  if(!recent.childElementCount)recent.append(node("p","muted","Your first completed task will appear here."));
}
function render() {
  syncPeriods();
  $("coins").textContent=state.coins.toLocaleString();
  renderPacking();renderLife();renderShop();renderRoom();renderProgress();
}
function backup() {
  const json=JSON.stringify(state);
  $("backupText").hidden=false;$("backupText").value=json;
  if(BRIDGE&&BRIDGE.backup)try{BRIDGE.backup(json);return;}catch(_){}
  $("backupText").select();
  flash("Copy the backup text and save it somewhere safe.");
}
function restore() {
  try{
    const raw=JSON.parse($("restoreInput").value);
    if(!raw || !Array.isArray(raw.owned) || !Number.isFinite(Number(raw.coins)) || !raw.boxCounts)throw Error("invalid backup");
    state=normalize(raw);save();render();show("progress");
    $("restoreInput").value="";flash("Progress restored.");
  }catch(_){flash("That backup doesn't look valid.");}
}
function toggleReminders() {
  if(!BRIDGE){flash("Phone reminders work in the installed Android app.");return;}
  try{
    if(remindersEnabled())BRIDGE.disableReminders();
    else BRIDGE.enableReminders();
    // Android will call remindersChanged after the permission result.
    setTimeout(renderLife,600);
  }catch(_){flash("Couldn't change the reminder setting.");}
}
function bind() {
  document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>show(b.dataset.tab)));
  $("boxSize").addEventListener("change",event=>{state.boxSize=event.target.value;save();render();});
  $("quarterBox").addEventListener("click",()=>claimBox(false));
  $("fullBox").addEventListener("click",()=>claimBox(true));
  $("anotherPrompt").addEventListener("click",()=>{state.promptIndex++;save();render();});
  // Zoom uses a genuinely scrollable 2D viewport, not just a larger picture.
  // Android WebView needs pan-x and pan-y on that scroll container. Its old
  // pan-y-only touch-action blocked horizontal dragging completely.
  let zoomed=false;
  const viewport=$("roomViewport");
  const office=$("room");
  function panOffice(dx,dy) {
    if(!zoomed)return;
    viewport.scrollLeft=Math.max(0,Math.min(
      office.scrollWidth-viewport.clientWidth,
      viewport.scrollLeft+dx
    ));
    viewport.scrollTop=Math.max(0,Math.min(
      office.scrollHeight-viewport.clientHeight,
      viewport.scrollTop+dy
    ));
  }
  $("roomZoomBtn").addEventListener("click",()=>{
    zoomed=!zoomed;
    viewport.classList.toggle("zoomed",zoomed);
    office.classList.toggle("zoomed",zoomed);
    $("officePanTools").hidden=!zoomed;
    $("roomZoomBtn").textContent=zoomed?"↩ Normal view":"🔎 Look closer";
    $("roomZoomBtn").setAttribute("aria-pressed",String(zoomed));
    viewport.setAttribute("aria-label",zoomed?
      "Enlarged office image. Drag in any direction, or use the four directional buttons.":
      "Office photo. Swipe left or right to change room views.");
    if(zoomed) {
      // Begin in the middle, with scroll room to look both left and right,
      // and up and down. Physical finger drag is browser-native.
      viewport.scrollLeft=Math.max(0,(office.scrollWidth-viewport.clientWidth)/2);
      viewport.scrollTop=Math.max(0,(office.scrollHeight-viewport.clientHeight)/2);
    } else {
      viewport.scrollLeft=0;
      viewport.scrollTop=0;
    }
  });
  $("officePanLeft").addEventListener("click",()=>panOffice(-150,0));
  $("officePanUp").addEventListener("click",()=>panOffice(0,-115));
  $("officePanDown").addEventListener("click",()=>panOffice(0,115));
  $("officePanRight").addEventListener("click",()=>panOffice(150,0));
  $("officePrevView").addEventListener("click",()=>stepOfficeView(-1));
  $("officeNextView").addEventListener("click",()=>stepOfficeView(1));
  let officeTouch=null;
  viewport.addEventListener("touchstart",event=>{
    if(!zoomed && event.touches && event.touches.length===1)
      officeTouch={x:event.touches[0].clientX,y:event.touches[0].clientY};
    else officeTouch=null;
  },{passive:true});
  viewport.addEventListener("touchend",event=>{
    if(!officeTouch)return;
    const finger=event.changedTouches&&event.changedTouches[0];
    if(!finger)return;
    const dx=finger.clientX-officeTouch.x,dy=finger.clientY-officeTouch.y;
    officeTouch=null;
    if(!zoomed&&Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3)
      stepOfficeView(dx<0?1:-1);
  },{passive:true});
  viewport.addEventListener("touchcancel",()=>{officeTouch=null;});
  viewport.addEventListener("keydown",event=>{
    const arrows={
      ArrowLeft:[-130,0],ArrowRight:[130,0],
      ArrowUp:[0,-110],ArrowDown:[0,110]
    };
    const delta=arrows[event.key];
    if(!delta)return;
    if(zoomed)panOffice(...delta);
    else if(event.key==="ArrowLeft"||event.key==="ArrowRight")
      stepOfficeView(event.key==="ArrowLeft"?-1:1);
    else return;
    event.preventDefault();
  });
  $("chooseRoomBtn").addEventListener("click",chooseHouseForMe);
  $("houseDoneButton").addEventListener("click",completeHouseMission);
  $("houseSkipBtn").addEventListener("click",skipHouseMission);
  $("houseDismissBtn").addEventListener("click",dismissHouseMission);
  $("restoreHiddenBtn").addEventListener("click",restoreRoomMissions);
  $("customTask").addEventListener("submit",event=>{
    event.preventDefault();const input=$("taskName"),name=input.value.trim();
    if(!name)return;
    state.custom.push({id:"custom-"+Date.now(),name:name.slice(0,70),reward:40});
    input.value="";save();render();
  });
  $("reminderBtn").addEventListener("click",toggleReminders);
  $("backupBtn").addEventListener("click",backup);
  $("restoreBtn").addEventListener("click",restore);
  $("restoreToggle").addEventListener("click",()=>{$("restorePanel").hidden=!$("restorePanel").hidden;});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)render();});
  show(state.view);
}
window.ducks={show,chooseHouseForMe,completeHouseMission,skipHouseMission,dismissHouseMission,setPackingPhase,remindersChanged:function(enabled){renderLife();flash(enabled?"Reminders enabled.":"Reminders off.");}};
bind();
})();
