/* Ducks & Disorder: offline-first packing rewards, daily routines, collectibles. */
(function () {
"use strict";
const DATA = window.GAME_DATA;
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
    coins:0, totalEarned:0, owned:[], history:[], custom:[], wishlist:null,
    boxSize:"small", boxes:{small:0,medium:0,large:0},
    boxCounts:{small:0,medium:0,large:0},
    promptIndex:0, view:"tasks",
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
  state.coins-=item.cost;
  state.owned.push(item.id);
  save();render();
  flash(item.name+" has invaded Axel's office.");
}
function node(tag,cls,text) {
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined)el.textContent=text;
  return el;
}
function renderPacking() {
  $("boxSize").value=state.boxSize;
  const quarter=state.boxes[state.boxSize],total=BOX_PAY[state.boxSize];
  $("boxProgress").textContent=quarter+" / 4 quarters • "+(state.boxCounts[state.boxSize]||0)+" completed "+state.boxSize+" boxes";
  $("boxProgressFill").style.width=(quarter*25)+"%";
  $("quarterBox").textContent="Packed another ¼  ·  +"+(Math.floor(total*(quarter+1)/4)-Math.floor(total*quarter/4));
  $("fullBox").textContent="Finished this box  ·  +"+(total-Math.floor(total*quarter/4));
  $("packingPrompt").textContent=PROMPTS[state.promptIndex%PROMPTS.length];
  const list=$("taskList");
  list.replaceChildren();
  for(const task of [...DATA.tasks,...state.custom]) {
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
  const wish=DATA.items.find(x=>x.id===state.wishlist);
  $("wishlist").textContent=!wish?"☆ Pick an item as your savings goal.":
    state.owned.includes(wish.id)?"★ Goal achieved: "+wish.name+"!":
    "★ Saving for "+wish.name+" • "+Math.max(0,wish.cost-state.coins)+" coins to go • about "+Math.ceil(Math.max(0,wish.cost-state.coins)/175)+" large boxes";
  const cat=$("catalog");cat.replaceChildren();
  for(const item of DATA.items) {
    const owned=state.owned.includes(item.id);
    const el=node("div","item");
    const info=node("div","");
    info.append(node("strong","",item.emoji+" "+item.name),
      node("small","",(DATA.tiers[item.tier-1]||"Collectible")+" • "+(owned?"Owned":item.cost+" coins")));
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
function renderRoom() {
  const placements=$("placements");placements.replaceChildren();
  for(const item of DATA.items.filter(x=>state.owned.includes(x.id))) {
    const prop=node("span","prop",item.emoji);
    prop.title=item.name;prop.style.left=(item.x*100)+"%";prop.style.top=(item.y*100)+"%";
    placements.append(prop);
  }
  $("roomCount").textContent=state.owned.length+" / "+DATA.items.length+" collectibles owned";
}
function renderProgress() {
  const total=Object.values(state.boxCounts).reduce((a,b)=>a+b,0);
  $("statBoxes").textContent=total;
  $("statToday").textContent=state.history.filter(h=>h.date===dayKey()&&h.boxComplete).length;
  $("statEarned").textContent=state.totalEarned.toLocaleString();
  $("statCollected").textContent=state.owned.length+" / "+DATA.items.length;
  $("boxTotals").textContent="Small: "+state.boxCounts.small+"  •  Medium: "+state.boxCounts.medium+"  •  Large: "+state.boxCounts.large;
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
window.ducks={show,remindersChanged:function(enabled){renderLife();flash(enabled?"Reminders enabled.":"Reminders off.");}};
bind();
})();
