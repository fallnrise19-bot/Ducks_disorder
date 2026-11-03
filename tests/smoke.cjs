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
assert.ok(fs.existsSync(path.join(root,"axel-office.webp")),"original office image bundled in Android assets");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
assert.doesNotThrow(()=>new vm.Script(data),"data.js parses");
assert.doesNotThrow(()=>new vm.Script(packing),"packing-rooms.js parses");
assert.doesNotThrow(()=>new vm.Script(layout),"room-layout.js parses");
assert.doesNotThrow(()=>new vm.Script(placement),"office-placement.js parses");
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
const run=()=>vm.runInNewContext(app,{...context},{filename:"app.js"});
const state=()=>JSON.parse(memory.get("ducks-disorder-v1"));
run();
assert.equal(window.GAME_DATA.items.length,20);
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
const item=window.GAME_DATA.items[0];
elements.catalog.children[0].children[1].children[1].click();
assert.equal(state().coins,385-item.cost,"purchase deducts collectible price");
assert.deepEqual(state().owned,[item.id]);
assert.equal(state().view,"rooms","purchase automatically shows the office");
assert.ok(state().placements[item.id],"purchased prop gets a persistent hidden slot");
assert.ok(window.OFFICE_LAYOUT.slots.some(s=>s.id===state().placements[item.id]),"slot belongs to calibrated office map");
assert.equal(elements.roomReveal.hidden,false,"first purchase is announced");
const firstSpot=state().placements[item.id];
const secondItem=window.GAME_DATA.items[1];
elements.catalog.children[1].children[1].children[1].click();
assert.ok(state().owned.includes(secondItem.id),"second prop purchase works");
assert.ok(state().placements[secondItem.id],"second prop has a spot");
assert.notEqual(state().placements[secondItem.id],firstSpot,"two props cannot occupy the same hidden slot");
run();
assert.equal(state().coins,385-item.cost-secondItem.cost,"balance survives restart");
assert.equal(state().placements[item.id],firstSpot,"same spot survives restart");
assert.equal(new Set(Object.values(state().placements)).size,state().owned.length,"saved placements never collide");
assert.deepEqual(state().owned,[item.id,secondItem.id],"collectible ownership survives restart");
assert.equal(elements.placements.children.length,2,"both purchased props appear in the original office");
assert.equal(state().houseDone["k-upper"],1,"mission completion survives restart");
assert.equal(state().houseRoom,"kitchen","selected room survives restart");
console.log("Ducks & Disorder smoke tests passed.");
