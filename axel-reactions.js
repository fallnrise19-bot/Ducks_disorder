/* Axel reacts to actual purchases, not redraws. Each line has a unique ID.
   His tone escalates from restrained disapproval to controlled exasperation.
   Comments are assigned once, stored in the existing offline save, and never reused. */
(function () {
"use strict";
const phases=[
  [
    "I see {item} has appeared. I'll assume there's an explanation.",
    "That wasn't here yesterday.",
    "Mira. We have discussed additions to my office.",
    "Interesting choice. Not an approved one.",
    "I notice the desk is developing opinions.",
    "Would you like to explain the purpose of {item}?",
    "I am choosing to regard this as temporary.",
    "The room had a perfectly functional arrangement.",
    "You've mistaken available space for an invitation.",
    "I distinctly remember approving none of this.",
    "It's a remarkably specific form of provocation.",
    "I'm adding this to the list of things requiring a conversation.",
    "This office is not a gallery. Just so we're clear.",
    "I haven't decided whether to be concerned or impressed."
  ],
  [
    "Another one. Of course.",
    "Mira, 'I found room' is not the same as permission.",
    "I moved {item} once. It came back.",
    "I have counted the additions. She has counted the empty spaces.",
    "The staff have started asking whether this is intentional.",
    "My office is not a storage solution for her personality.",
    "I am beginning to suspect these purchases are coordinated.",
    "She has established a pattern. An irritatingly cheerful pattern.",
    "At what point did my furniture become a challenge?",
    "Someone has put {item} precisely where I would notice it.",
    "I'm not touching it until I know whether it sets something off.",
    "There was a time when this room looked professional.",
    "I have drafted a rule. She has already found a loophole.",
    "Every time I leave, the inventory changes."
  ],
  [
    "That is quite enough. Apparently that sentence means nothing here.",
    "We are rapidly approaching the limits of my tolerance.",
    "I had the door locked. That was evidently a suggestion.",
    "I am aware of {item}. I am also aware of the laughter.",
    "Do not tell me this is 'improving the atmosphere.'",
    "There is an entire building. Somehow every object ends up here.",
    "Mira has made a hobby of measuring my patience.",
    "I removed one decoration. Three replacements appeared.",
    "This is no longer accidental. I admire the logistics. Barely.",
    "The next person to call this 'adorable' can explain it to me.",
    "I would appreciate a single undisturbed horizontal surface.",
    "No, I do not want to know what {item} cost.",
    "I've begun documenting evidence. She has begun autographing it.",
    "We're past the point where I can pretend not to notice."
  ],
  [
    "Mira. My office. Now. Bring a sensible explanation. Just one.",
    "There are consequences for this. She has requested a price list.",
    "I've considered removing the shelves. She would use the floor.",
    "I'm fairly certain {item} was selected out of spite.",
    "No one is to describe this room as 'her aesthetic' in my hearing.",
    "Security has stopped reporting the new objects. They report the gaps.",
    "I have issued an instruction. It has been decorated.",
    "She's laughing. I can hear it from the corridor.",
    "I used to recognize the surface of my desk.",
    "Someone has renamed this room. I'm not repeating the name.",
    "I refuse to negotiate with decorative objects.",
    "My attempts at deterrence have become part of the entertainment.",
    "There are more additions than there are chairs. Think about that.",
    "It's the precision that bothers me. She knows exactly where to put them."
  ],
  [
    "Fine. The office has been claimed by a small, extremely determined menace.",
    "I will be billing Mira for the building's remaining dignity.",
    "The day she runs out of shelf space, I expect an extension request.",
    "I no longer ask what {item} is doing here. I ask what comes next.",
    "I have accepted that the floor plan is now a work of fiction.",
    "She calls it decorating. I call it a prolonged siege.",
    "I found a corner that was untouched. That was my mistake.",
    "At this point I might as well assign the objects staff numbers.",
    "The office has surrendered. I have not.",
    "Mira will be delighted to know I have stopped moving things back.",
    "I should have anticipated the escalation. She certainly did.",
    "I am going to finish one entire cup of tea without discovering a new object.",
    "I will not give her the satisfaction of a reaction. ...Too late.",
    "If she puts one more thing in here, I may start charging admission."
  ]
];
const special={
  "mug":[
    "A mug marked 'Ask Axel.' The answer is no.",
    "Apparently I now offer consultations by the cup.",
    "Someone asked the mug for permission. It apparently granted it.",
    "She has put my name on merchandise without even the decency to invoice me.",
    "I would like to resign from whatever service this mug advertises."
  ],
  "low-signal-neon":[
    "A LOW.SIGNAL sign. In my office. Subtle.",
    "The sign is bright enough to be noticed from the corridor. Naturally.",
    "I've asked for the neon to be switched off. It is now brighter.",
    "If that sign starts flashing during a meeting, there will be a discussion.",
    "I have lost a lighting dispute to a woman with an entire music career."
  ],
  "bad-ideas-notebook":[
    "'Bad Ideas, Vol. 1.' The numbering concerns me.",
    "There is apparently a second volume. I will not be requesting it.",
    "That notebook has made more appearances than my meeting schedule.",
    "If she starts using this office to draft Vol. 3, we're moving the desk.",
    "I've read enough of the titles to know this is an organized campaign."
  ],
  "mira-selfie":[
    "She framed that gesture. Of course she did.",
    "I've asked whether the photograph is necessary. She said it's expressive.",
    "Her expression is now visible from my desk. She planned that.",
    "I am not being insulted by a photograph in my own office.",
    "Fine. The picture stays. I refuse to admit she won."
  ],
  "wooden-wolf":[
    "A wooden wolf. At least this one is quiet.",
    "The wolf has moved. No one admits touching it.",
    "I believe she has started a pack.",
    "Even the decorative wolves are multiplying. Impressive.",
    "The wolf may stay. I am less certain about its owner."
  ],
  "wolf-paw":[
    "A paw-print paperweight. Practical, for once.",
    "The paperweight has acquired an entourage.",
    "I can no longer find the documents under the paperweight.",
    "She called it 'a warning.' She smiled when she said it.",
    "I've given up trying to establish who actually owns this desk."
  ],
  "compass":[
    "A compass. Is she expecting the desk to move?",
    "The compass points north. Her decisions do not.",
    "I've checked. The compass is working. The logic behind it isn't.",
    "If I require navigation to cross my own office, we've gone too far.",
    "I suppose the compass will be useful when I get lost among the decorations."
  ],
  "old-hoodie":[
    "Her old hoodie. This is an office, not a wardrobe.",
    "The hoodie is still here. I suspect the chair has been reassigned.",
    "She says the hoodie makes the room comfortable. For her, naturally.",
    "There is a perfectly good coat rack. She has chosen my chair.",
    "The hoodie has been here longer than some members of staff."
  ],
  "duck-yellow":[
    "A duck. Why a duck?",
    "The duck is watching me. I am choosing not to engage.",
    "No, Mira, it is not the new head of security.",
    "I moved the duck. It returned with reinforcements.",
    "She has given the duck authority. I am disputing the appointment."
  ],
  "c007-binder":[
    "C-007. She has chosen a particularly pointed filing system.",
    "That binder has been moved closer to my desk.",
    "She seems to find the label amusing. I do not.",
    "If she starts reorganizing the archives, I'll need a second office.",
    "The binder can remain. Her commentary on it cannot."
  ]
};
function stage(count) {
  return Math.min(phases.length-1,Math.max(0,Math.floor((Math.max(1,count)-1)/8)));
}
function allIds() {
  const ids=[];
  for(let i=0;i<phases.length;i++)for(let j=0;j<phases[i].length;j++)ids.push("p"+i+"-"+j);
  for(const [item,lines] of Object.entries(special))for(let i=0;i<lines.length;i++)ids.push("s-"+item+"-"+i);
  return ids;
}
const validIds=new Set(allIds());
function pick(item,ownedCount,history,rng=Math.random) {
  const tier=stage(ownedCount);
  const used=new Set((Array.isArray(history)?history:[]).map(entry=>entry.id));
  let options=phases[tier].map((text,i)=>({id:"p"+tier+"-"+i,text})).filter(x=>!used.has(x.id));
  const specialText=special[item.id]&&special[item.id][tier];
  const candidate=specialText?{id:"s-"+item.id+"-"+tier,text:specialText}:null;
  if(candidate&&!used.has(candidate.id)&&rng()<0.68)options=[candidate];
  if(!options.length&&candidate&&!used.has(candidate.id))options=[candidate];
  // Even if the catalog grows past 40 collectibles, still never repeat a comment.
  if(!options.length){
    for(let i=tier+1;i<phases.length&&!options.length;i++)
      options=phases[i].map((text,j)=>({id:"p"+i+"-"+j,text})).filter(x=>!used.has(x.id));
  }
  if(!options.length){
    for(let i=0;i<tier&&!options.length;i++)
      options=phases[i].map((text,j)=>({id:"p"+i+"-"+j,text})).filter(x=>!used.has(x.id));
  }
  const chosen=options[Math.min(options.length-1,Math.max(0,Math.floor(rng()*options.length)))] ||
    {id:"extra-"+item.id,text:"I've seen "+item.name+". I am adding it to the incident report."};
  return {id:chosen.id,itemId:item.id,itemName:item.name,stage:tier,
    text:chosen.text.replace(/\{item\}/g,item.name),at:Date.now()};
}
function clean(history,owned) {
  const allowedItems=new Set(owned);
  const seen=new Set();
  return (Array.isArray(history)?history:[]).filter(entry=>{
    if(!entry||typeof entry!=="object"||typeof entry.id!=="string"||
      (!validIds.has(entry.id)&&!entry.id.startsWith("extra-"))||
      seen.has(entry.id)||!allowedItems.has(entry.itemId)||
      typeof entry.text!=="string"||!entry.text.trim()||entry.text.length>500)return false;
    seen.add(entry.id);return true;
  }).slice(-200).map(entry=>({id:entry.id,itemId:entry.itemId,itemName:
    typeof entry.itemName==="string"?entry.itemName.slice(0,100):"",
    text:entry.text,stage:Math.min(4,Math.max(0,Number(entry.stage)||0)),
    at:Math.max(0,Math.floor(Number(entry.at)||0))}));
}
window.AXEL_REACTIONS={pick,stage,clean,count:validIds.size};
})();
