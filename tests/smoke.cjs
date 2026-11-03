/* No-dependency smoke tests for the Android WebView game files. Run: node tests/smoke.cjs */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..","app","src","main","assets");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const data=fs.readFileSync(path.join(root,"data.js"),"utf8");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
assert.doesNotThrow(()=>new vm.Script(data),"data.js parses");
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
const run=()=>vm.runInNewContext(app,context,{filename:"app.js"});
const state=()=>JSON.parse(memory.get("ducks-disorder-v1"));
run();
assert.equal(window.GAME_DATA.items.length,20);
for(let i=0;i<4;i++)elements.quarterBox.click();
assert.equal(state().coins,50,"small quarters pay exactly 50");
assert.equal(state().boxes.small,0,"small partial progress resets after fourth quarter");
assert.equal(state().boxCounts.small,1,"small box completed count");
elements.boxSize.value="medium";
elements.boxSize.listeners.change({target:{value:"medium"}});
elements.quarterBox.click();
elements.fullBox.click();
assert.equal(state().coins,150,"medium quarter plus finish pays exactly 100");
assert.equal(state().boxCounts.medium,1);
elements.boxSize.value="large";
elements.boxSize.listeners.change({target:{value:"large"}});
elements.fullBox.click();
assert.equal(state().coins,325,"large box pays 175");
assert.equal(state().boxCounts.large,1);
for(let i=0;i<6;i++) {
  const water=elements.lifeList.children.find(row=>row.children[0].children[0].textContent.includes("Drink some water"));
  assert.ok(water,"water task present");
  water.children[1].click();
}
assert.equal(state().coins,345,"water reward capped at four check-ins");
assert.equal(state().lifeDaily.water,4);
const item=window.GAME_DATA.items[0];
elements.catalog.children[0].children[1].children[1].click();
assert.equal(state().coins,345-item.cost,"purchase deducts collectible price");
assert.deepEqual(state().owned,[item.id]);
run();
assert.equal(state().coins,345-item.cost,"balance survives restart");
assert.deepEqual(state().owned,[item.id],"collectible ownership survives restart");
assert.equal(elements.placements.children.length,1,"owned collectible appears in room");
console.log("Ducks & Disorder smoke tests passed.");
