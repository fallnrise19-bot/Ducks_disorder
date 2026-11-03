/* No-dependency smoke tests for the Android WebView game files. Run: node tests/smoke.cjs */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..","app","src","main","assets");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const data=fs.readFileSync(path.join(root,"data.js"),"utf8");
const packing=fs.readFileSync(path.join(root,"packing-rooms.js"),"utf8");
const layout=fs.readFileSync(path.join(root,"room-layout.js"),"utf8");
const placement=fs.readFileSync(path.join(root,"office-placement.js"),"utf8");
const reactions=fs.readFileSync(path.join(root,"axel-reactions.js"),"utf8");
assert.ok(fs.existsSync(path.join(root,"axel-office.webp")),"original office image bundled in Android assets");
assert.ok(fs.existsSync(path.join(root,"axel-office-boardroom.webp")),"second real office angle bundled");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
assert.doesNotThrow(()=>new vm.Script(data),"data.js parses");
assert.doesNotThrow(()=>new vm.Script(packing),"packing-rooms.js parses");
assert.doesNotThrow(()=>new vm.Script(layout),"room-layout.js parses");
assert.doesNotThrow(()=>new vm.Script(placement),"office-placement.js parses");
assert.doesNotThrow(()=>new vm.Script(reactions),"axel-reactions.js parses");
assert.doesNotThrow(()=>new vm.Script(app),"app.js parses");
class Element {
  constructor(id="",text="") {
    this.id=id;this.textContent=text;this.value="";this.children=[];
    this.disabled=false;this.hidden=false;this.style={};this.dataset={};
    this.listeners={};this.classList={toggle:()=>{}};
  }
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=[...children];}
  addEventListener(name,handler){this.listeners[name]=handler;}
  setAttribute(){}
  select(){}
  get childElementCount(){return this.children.length;}
  click(){if(!this.disabled&&this.listeners.click)this.listeners.click();}
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const elements=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
elements.boxSize.value="small";
const nav=["tasks","life","rooms","shop","progress"].map(id=>{
  const e=new Element();e.dataset.tab=id;return e;
});
const panels=["tasks","life","rooms","shop","progress"].map(id=>new Element(id));
const document={
  getElementById(id){assert.ok(elements[id],"missing HTML element "+id);return elements[id];},
  createElement(tag){return new Element(tag);},
  querySelectorAll(query){return query==="nav button"?nav:query===".panel"?panels:[];},
  addEventListener(){}
};
const memory=new Map();
const localStorage={
  getItem(key){return memory.get(key)||null;},
  setItem(key,value){memory.set(key,value);}
};
const window={};
const context={window,document,localStorage,Date,Math,Number,JSON,Array,Object,String,Set,
  setTimeout:()=>0,clearTimeout:()=>{}};
vm.runInNewContext(data,context,{filename:"data.js"});
vm.runInNewContext(packing,context,{filename:"packing-rooms.js"});
vm.runInNewContext(layout,context,{filename:"room-layout.js"});
vm.runInNewContext(placement,context,{filename:"office-placement.js"});
vm.runInNewContext(reactions,context,{filename:"axel-reactions.js"});
const run=()=>vm.runInNewContext(app,{...context},{filename:"app.js"});
const state=()=>JSON.parse(memory.get("ducks-disorder-v1"));
run();
assert.equal(window.GAME_DATA.items.length,40,"restored and expanded Mira-themed shop");
assert.equal(window.OFFICE_LAYOUT.views.length,2,"two office photos in a single room");
assert.ok(window.OFFICE_LAYOUT.slots.filter(s=>s.view==="boardroom").length>=30,"boardroom has its own concealed prop positions");
assert.ok(window.OFFICE_LAYOUT.slots.filter(s=>s.view==="desk").length>=40,"existing desk positions preserved");
assert.equal(elements.officeViewDots.children.length,2,"navigation dots match photo count");
assert.equal(state().officeView,"desk","existing save opens on familiar desk angle");
elements.officeNextView.click();
assert.equal(state().officeView,"boardroom","next arrow navigates to boardroom");
assert.equal(elements.officePhoto.src,"axel-office-boardroom.webp","second original screenshot displayed");
elements.officePrevView.click();
assert.equal(state().officeView,"desk","previous arrow returns to desk");
assert.equal(elements.officePhoto.src,"axel-office.webp","original desk screenshot unchanged");
elements.roomViewport.listeners.touchstart({touches:[{clientX:200,clientY:230}]});
elements.roomViewport.listeners.touchend({changedTouches:[{clientX:100,clientY:235}]});
assert.equal(state().officeView,"boardroom","leftward finger swipe advances to next view");
elements.roomViewport.listeners.touchstart({touches:[{clientX:80,clientY:235}]});
elements.roomViewport.listeners.touchend({changedTouches:[{clientX:205,clientY:233}]});
assert.equal(state().officeView,"desk","rightward swipe returns to previous view");
const dialogue=window.AXEL_REACTIONS;
assert.ok(dialogue.count>=110,"Axel has a substantial pool of unique comments");
assert.equal(dialogue.stage(1),0,"first additions remain restrained");
assert.equal(dialogue.stage(9),1,"early escalation begins");
assert.equal(dialogue.stage(17),2,"third-stage disapproval");
assert.equal(dialogue.stage(25),3,"frustration escalates");
assert.equal(dialogue.stage(33),4,"later purchases trigger peak exasperation");
const simulated=[];
for(let i=1;i<=40;i++){
  const line=dialogue.pick(window.GAME_DATA.items[i-1],i,simulated,()=>0.5);
  simulated.push(line);
  assert.equal(line.stage,dialogue.stage(i),"correct escalation phase at "+i);
}
assert.equal(new Set(simulated.map(r=>r.id)).size,40,"no dialogue line repeats over 40 purchases");
assert.equal(new Set(simulated.map(r=>r.text)).size,40,"no dialogue text repeats over 40 purchases");
assert.equal(dialogue.clean(simulated,window.GAME_DATA.items.map(i=>i.id)).length,40,"all reactions survive state sanitation");
for(const item of window.GAME_DATA.items){
  assert.ok(item.asset&&item.asset.endsWith(".png"),"real PNG assigned to "+item.id);
  const file=path.join(root,"collectibles",item.asset);
  assert.ok(fs.existsSync(file),"offline art is bundled: "+item.asset);
  assert.equal(fs.readFileSync(file).subarray(1,4).toString(),"PNG","asset is a real PNG: "+item.asset);
}
assert.equal(elements.catalog.children[0].children[0].children[0].src,"collectibles/duck_tactical.png","real art shown in shop");
assert.equal(window.DUCKS_PACKING_ROOMS.length,10,"all ten original house rooms restored");
assert.equal(elements.housePicker.children.length,10,"room picker displays ten rooms");
assert.equal(state().houseRoom,"basement","priority-one basement selected first");
const kitchen=elements.housePicker.children[1];
kitchen.click();
assert.equal(state().houseRoom,"kitchen");
assert.equal(elements.missionName.textContent,"Pack an unused beige cubby compartment");
elements.houseSkipBtn.click();
assert.equal(elements.missionName.textContent,"Pack unused items from an upper cabinet");
const beforeKitchen=state().coins;
elements.houseDoneButton.click();
assert.equal(state().coins-beforeKitchen,40,"kitchen upper cabinet job pays 40");
assert.equal(state().houseDone["k-upper"],1,"room mission completion saved");
const beforeDismiss=state().coins;
elements.houseDismissBtn.click();
assert.equal(state().coins,beforeDismiss,"not applicable gives no coins");
assert.ok(Object.values(state().houseSkipped).some(Boolean),"dismissed mission hidden");
elements.restoreHiddenBtn.click();
assert.ok(!Object.values(state().houseSkipped).some(Boolean),"hidden missions can be restored");
window.ducks.setPackingPhase("final");
assert.equal(state().phase,"final");
assert.equal(state().houseDone["k-upper"],1);
window.ducks.setPackingPhase("now");
for(let i=0;i<4;i++)elements.quarterBox.click();
assert.equal(state().coins,90,"small quarters pay exactly 50 on top of kitchen job");
assert.equal(state().boxes.small,0,"small partial progress resets after fourth quarter");
assert.equal(state().boxCounts.small,1,"small box completed count");
elements.boxSize.value="medium";
elements.boxSize.listeners.change({target:{value:"medium"}});
elements.quarterBox.click();
elements.fullBox.click();
assert.equal(state().coins,190,"medium quarter plus finish pays exactly 100");
assert.equal(state().boxCounts.medium,1);
elements.boxSize.value="large";
elements.boxSize.listeners.change({target:{value:"large"}});
elements.fullBox.click();
assert.equal(state().coins,365,"large box pays 175");
assert.equal(state().boxCounts.large,1);
for(let i=0;i<6;i++) {
  const water=elements.lifeList.children.find(row=>row.children[0].children[0].textContent.includes("Drink some water"));
  assert.ok(water,"water task present");
  water.children[1].click();
}
assert.equal(state().coins,385,"water reward capped at four check-ins");
assert.equal(state().lifeDaily.water,4);
// Force a boardroom placement to prove the shop takes the player directly
// to the correct view and not to the original desk picture.
const originalChooser=window.OFFICE_PLACEMENT.choose;
window.OFFICE_PLACEMENT.choose=()=> "board-table-01";
const item=window.GAME_DATA.items[0];
elements.catalog.children[0].children[1].children[1].click();
assert.equal(state().coins,385-item.cost,"purchase deducts collectible price");
assert.deepEqual(state().owned,[item.id]);
assert.equal(state().officeView,"boardroom","purchase automatically opens item's actual boardroom side");
assert.equal(elements.officePhoto.src,"axel-office-boardroom.webp","purchased item visible on correct office photo");
assert.equal(state().placements[item.id],"board-table-01");
window.OFFICE_PLACEMENT.choose=originalChooser;
assert.equal(state().view,"rooms","purchase automatically shows the office");
assert.ok(state().placements[item.id],"purchased prop gets a persistent hidden slot");
assert.ok(window.OFFICE_LAYOUT.slots.some(s=>s.id===state().placements[item.id]),"slot belongs to calibrated office map");
assert.equal(elements.roomReveal.hidden,false,"first purchase is announced");
elements.officePrevView.click();
assert.equal(elements.placements.children.length,0,"boardroom purchase does not bleed onto desk photo");
elements.officeNextView.click();
assert.equal(elements.placements.children.length,1,"purchased boardroom item reappears on correct photo");
assert.equal(elements.axelReaction.hidden,false,"Axel comment appears beneath the office");
assert.equal(state().axelReactions.length,1,"one reaction created for first purchase");
assert.equal(state().axelReactions[0].itemId,item.id,"comment belongs to purchased item");
assert.ok(elements.axelReactionText.textContent.length>15,"Axel speaks an actual line");
const firstAxelComment=elements.axelReactionText.textContent;
const firstAxelId=state().axelReactions[0].id;
const firstSpot=state().placements[item.id];
const secondItem=window.GAME_DATA.items[1];
elements.catalog.children[1].children[1].children[1].click();
assert.ok(state().owned.includes(secondItem.id),"second prop purchase works");
assert.ok(state().placements[secondItem.id],"second prop has a spot");
assert.notEqual(state().placements[secondItem.id],firstSpot,"two props cannot occupy the same hidden slot");
assert.equal(state().officeView,window.OFFICE_PLACEMENT.spot(state().placements[secondItem.id]).view,"next purchase opens matching view");
assert.equal(state().axelReactions.length,2,"one additional line for the second purchase");
assert.notEqual(state().axelReactions[1].id,firstAxelId,"second reaction never repeats the first");
assert.notEqual(state().axelReactions[1].text,firstAxelComment,"second reaction text differs");
assert.equal(elements.axelReactionText.textContent,state().axelReactions[1].text,"latest reaction is displayed");
const latestComment=state().axelReactions[1].text;
run();
assert.equal(state().coins,385-item.cost-secondItem.cost,"balance survives restart");
assert.equal(state().placements[item.id],firstSpot,"same spot survives restart");
assert.equal(state().officeView,window.OFFICE_PLACEMENT.spot(state().placements[secondItem.id]).view,"chosen photo view survives restart");
assert.equal(state().axelReactions.length,2,"reaction history survives restart");
assert.equal(elements.axelReaction.hidden,false,"last comment remains visible after restarting");
assert.equal(elements.axelReactionText.textContent,latestComment,"Axel's last line remains unchanged");
assert.equal(new Set(Object.values(state().placements)).size,state().owned.length,"saved placements never collide");
assert.deepEqual(state().owned,[item.id,secondItem.id],"collectible ownership survives restart");
assert.equal(elements.placements.children.length,state().owned.filter(id=>window.OFFICE_PLACEMENT.spot(state().placements[id]).view===state().officeView).length,"only current office photo's purchased objects are rendered");
window.OFFICE_LAYOUT.views.forEach(view=>{
  elements.officeViewDots.children[window.OFFICE_LAYOUT.views.indexOf(view)].click();
  const expected=state().owned.filter(id=>window.OFFICE_PLACEMENT.spot(state().placements[id]).view===view.id);
  assert.equal(elements.placements.children.length,expected.length,"only purchased objects from "+view.name+" show");
  for(const prop of elements.placements.children)
    assert.ok(prop.children[0].src.startsWith("collectibles/"),"real PNG shown in "+view.name);
});
assert.equal(state().placements[item.id],firstSpot,"switching views does not move earlier purchases");
assert.equal(elements.officePhoto.src,"axel-office-boardroom.webp","boardroom remains accessible");
assert.ok(state().placements[secondItem.id],"second object retains its real PNG and placement");
elements.officeViewDots.children[0].click();
assert.equal(state().officeView,"desk","dot button navigates without losing inventory");
assert.equal(state().houseDone["k-upper"],1,"mission completion survives restart");
assert.equal(state().houseRoom,"kitchen","selected room survives restart");
console.log("Ducks & Disorder smoke tests passed.");
