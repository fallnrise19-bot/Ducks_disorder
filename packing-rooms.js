/* Original room-by-room packing plan from Under the Willow's feature branch. These are real rooms and priorities from user-supplied house photos. Routine cleaning remains in Daily Life; do not introduce renovation here. */
window.DUCKS_PACKING_ROOMS=[
  {
    "id": "basement",
    "name": "Basement",
    "icon": "🗄️",
    "priority": 1,
    "status": "Priority 1 · start now",
    "description": "Main campaign: reduce moving volume. Most plastic totes are only partly filled and can be repacked. Use accessible bins and don't pull one from underneath a tall stack.",
    "notes": [
      "All rat cages and equipment are coming.",
      "Bikes and seasonal belongings are coming.",
      "Christmas decorations need serious consolidation.",
      "Most basement furniture probably is not moving; decisions belong to Tim.",
      "Tools, workshop and 3D equipment are Tim-only, and he will donate unwanted electronics when he returns."
    ],
    "missions": [
      {
        "id": "b-tote",
        "title": "Open and assess one accessible tote",
        "detail": "Check what belongs together, what is broken, and what belongs to Tim. No cleaning the floor.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "b-condense",
        "title": "Consolidate two partially filled totes",
        "detail": "Combine compatible belongings into fewer containers without overfilling; label what stays.",
        "cash": 50,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "b-empty",
        "title": "Free one tote for reuse",
        "detail": "When a container becomes truly empty, stack it with your available packing supplies.",
        "cash": 30,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "b-xmas",
        "title": "Reduce Christmas decorations",
        "detail": "Work through one accessible Christmas tote, removing broken items and consolidating decorations that will move.",
        "cash": 50,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "b-rat",
        "title": "Pack one group of rat accessories",
        "detail": "Keep all cages for the move. Box compatible unused rat supplies or enrichment, not Tim's belongings.",
        "cash": 45,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "b-season",
        "title": "Pack one group of seasonal supplies",
        "detail": "Box seasonal decorations or equipment that will not be needed again before departure.",
        "cash": 40,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "b-bikes",
        "title": "Gather bicycle accessories",
        "detail": "Pack spare bike accessories and parts; keep the bicycles themselves for moving.",
        "cash": 35,
        "phase": "now",
        "repeat": false
      },
      {
        "id": "b-tim",
        "title": "Set aside an item that needs Tim's decision",
        "detail": "Do not discard, donate or pack his possessions. Mark them for Tim to handle.",
        "cash": 20,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "b-furniture",
        "title": "Identify basement furniture for Tim to review",
        "detail": "Record what may not be moving; do not dismantle or dispose of it yourself.",
        "cash": 20,
        "phase": "now",
        "repeat": false
      },
      {
        "id": "b-damaged",
        "title": "Separate a broken item found while sorting",
        "detail": "If you find something broken inside the tote you are packing, set it aside to discard later.",
        "cash": 15,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "b-rat-cages",
        "title": "Prepare rat cages for transport",
        "detail": "When the move is close, prepare empty cages and removable accessories for safe transport.",
        "cash": 60,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "b-large",
        "title": "Coordinate remaining large basement items",
        "detail": "Leave heavy furniture, workshop equipment and unwanted electronics for Tim.",
        "cash": 25,
        "phase": "moving",
        "repeat": false
      }
    ]
  },
  {
    "id": "kitchen",
    "name": "Kitchen",
    "icon": "🍽️",
    "priority": 2,
    "status": "Pack unused items now",
    "description": "You know what isn't being used. Pack those items; keep everyday cooking, groceries and pet supplies in service.",
    "missions": [
      {
        "id": "k-cubby",
        "title": "Pack an unused beige cubby compartment",
        "detail": "Pack unused cookware, serving bowls or small appliances from one compartment.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "k-upper",
        "title": "Pack unused items from an upper cabinet",
        "detail": "Spare mugs, dishes, cups and serving items only; reach high cabinets safely.",
        "cash": 40,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "k-lower",
        "title": "Pack unused items from a lower cabinet",
        "detail": "Pack spare pots, pans, baking pieces or gadgets no longer needed.",
        "cash": 40,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "k-black",
        "title": "Pack spare items from the black storage unit",
        "detail": "Choose unused accessories or storage containers without affecting current meals.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "k-drawer",
        "title": "Pack duplicate utensils or kitchen gadgets",
        "detail": "Take only things you can live without until the move.",
        "cash": 30,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "k-pantry",
        "title": "Review kitchen extras for moving",
        "detail": "Pack only permitted, sealed nonperishables and other kitchen accessories; skip liquids if your mover restricts them.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "k-final",
        "title": "Pack remaining kitchen equipment",
        "detail": "Leave one minimal cooking and eating setup until the final days.",
        "cash": 50,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "k-last",
        "title": "Pack the final daily kitchen kit",
        "detail": "Only after the family no longer needs the kitchen.",
        "cash": 60,
        "phase": "moving",
        "repeat": false
      }
    ]
  },
  {
    "id": "linen",
    "name": "Upstairs hall closet",
    "icon": "🧺",
    "priority": 3,
    "status": "Pack early",
    "description": "Spare towels and linens; keep enough for everyday showers and baths.",
    "missions": [
      {
        "id": "l-towels",
        "title": "Pack the spare folded towels",
        "detail": "Take nonessential towels from a reachable middle shelf; leave the daily set.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "l-blankets",
        "title": "Pack an extra blanket or spare linen set",
        "detail": "Use the lower shelves; no need to empty the entire closet.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "l-storage",
        "title": "Pack unused supplies from an accessible shelf",
        "detail": "Avoid restricted liquids and products used by the children.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "l-leftovers",
        "title": "Pack other spare linens",
        "detail": "Leave the last everyday towels, sheets and bath essentials.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "l-final",
        "title": "Pack the remaining linen closet",
        "detail": "Leave only items needed for the journey.",
        "cash": 35,
        "phase": "final",
        "repeat": false
      }
    ]
  },
  {
    "id": "living",
    "name": "Living room",
    "icon": "📺",
    "priority": 4,
    "status": "Display items now · tech later",
    "description": "Pack display collectibles and nonessential decorations; do NOT touch Tim's 3D-printing corner, workshop, printer supplies or hobby tools.",
    "notes": [
      "The tall stack near the room is EMPTY moving-box supply, not finished boxes.",
      "Televisions, computers, consoles and VR still in use stay available.",
      "Tim's entire 3D-printing area is permission-only, even for cleaning."
    ],
    "missions": [
      {
        "id": "v-narrow",
        "title": "Pack one accessible shelf of collectibles",
        "detail": "Choose one shelf in the narrow black shelving units beside the TV. Wrap fragile pieces.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "v-wall",
        "title": "Pack reachable wall display figures",
        "detail": "Leave high or mounted hardware for help later.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "v-white",
        "title": "Pack decorations from a floating white shelf",
        "detail": "Only nonessential decorations, never anything from Tim's printing station.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "v-hex",
        "title": "Pack small ornaments in the hexagonal displays",
        "detail": "Leave the wall mount in place until moving day.",
        "cash": 30,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "v-other",
        "title": "Pack another group of nonessential living-room displays",
        "detail": "No furniture shifting or general clutter cleaning.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "v-electronics",
        "title": "Prepare gaming and TV electronics",
        "detail": "Pack only after devices are no longer needed and with the owner's approval.",
        "cash": 60,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "v-furniture",
        "title": "Prepare the sofas and remaining furniture",
        "detail": "Only at moving time with help.",
        "cash": 50,
        "phase": "moving",
        "repeat": true
      }
    ]
  },
  {
    "id": "master",
    "name": "Master bedroom",
    "icon": "🛏️",
    "priority": 5,
    "status": "Nonessentials only",
    "description": "Keep the bed, lamps, everyday clothes and bedding in use.",
    "missions": [
      {
        "id": "m-art",
        "title": "Pack wall art and decorative signs",
        "detail": "Protect framed pieces; no patching or cleaning mission attached.",
        "cash": 35,
        "phase": "now",
        "repeat": false
      },
      {
        "id": "m-plush",
        "title": "Pack spare decorative plushies",
        "detail": "Leave comfort items that are still used.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "m-clothes",
        "title": "Pack out-of-season or rarely worn clothes",
        "detail": "Take from closet or dresser; keep the daily wardrobe accessible.",
        "cash": 40,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "m-bins",
        "title": "Pack accessible extra closet contents",
        "detail": "Check first; don't lift bulky storage over your head.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "m-final",
        "title": "Pack remaining spare bedroom belongings",
        "detail": "Maintain current sleep setup.",
        "cash": 35,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "m-moving",
        "title": "Pack bedding and daily bedside items",
        "detail": "Only when you're ready to stop sleeping in this room.",
        "cash": 50,
        "phase": "moving",
        "repeat": false
      }
    ]
  },
  {
    "id": "entry",
    "name": "Main entry and closet",
    "icon": "🚪",
    "priority": 6,
    "status": "Partial now · rest late",
    "description": "Keep the front door, stairway and daily school gear available.",
    "missions": [
      {
        "id": "e-shoes",
        "title": "Pack unused or off-season footwear",
        "detail": "Pair unused shoes; separate outgrown children's shoes from what is coming.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "e-bags",
        "title": "Pack unused backpacks and bags",
        "detail": "Keep the school bags and daily items in use.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "e-coats",
        "title": "Pack coats that will not be worn before moving",
        "detail": "Keep appropriate cold-weather clothing ready.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "e-top",
        "title": "Pack accessible nonessential upper-shelf belongings",
        "detail": "Avoid awkward reaching or moving a precarious pile.",
        "cash": 30,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "e-final",
        "title": "Pack remaining entryway accessories",
        "detail": "Only after school and daily routines end.",
        "cash": 30,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "e-last",
        "title": "Pack remaining shoes, coats and bags",
        "detail": "Keep travel clothes and one pair of shoes per person accessible.",
        "cash": 40,
        "phase": "moving",
        "repeat": false
      }
    ]
  },
  {
    "id": "upbath",
    "name": "Upstairs main bathroom",
    "icon": "🚿",
    "priority": 7,
    "status": "Nonessentials now · cabinet last",
    "description": "The mirrored cabinet above the toilet belongs to the family and WILL move. Keep medication and daily products available.",
    "missions": [
      {
        "id": "u-groom",
        "title": "Pack unused grooming accessories",
        "detail": "Check one vanity basket for tools not needed before the move.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "u-linens",
        "title": "Pack spare bathroom linens or organizers",
        "detail": "Keep daily towels and shower essentials in service.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "u-shelf",
        "title": "Pack safe-to-transport spare personal-care items",
        "detail": "Do not put essential medications or restricted liquids into ordinary moving boxes.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "u-medcab",
        "title": "Empty nonessential belongings from the wall cabinet",
        "detail": "Leave daily medications and any first-aid needs accessible.",
        "cash": 25,
        "phase": "final",
        "repeat": false
      },
      {
        "id": "u-remove",
        "title": "Remove and protect the family-owned mirrored cabinet",
        "detail": "Tim or another helper handles wall removal and mounting hardware.",
        "cash": 40,
        "phase": "moving",
        "repeat": false
      }
    ]
  },
  {
    "id": "downbath",
    "name": "Downstairs half bath",
    "icon": "🪞",
    "priority": 8,
    "status": "Pack lightly · clean separately",
    "description": "Keep the daily bathroom ready; don't assume the wall cabinet is yours to remove.",
    "missions": [
      {
        "id": "d-groom",
        "title": "Pack unused bathroom grooming accessories",
        "detail": "Only things not needed until departure.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "d-storage",
        "title": "Pack one under-sink basket of nonessentials",
        "detail": "Keep first aid and everyday medication accessible.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "d-art",
        "title": "Pack the wolf print and decorative wall sign",
        "detail": "Leave plumbing, fittings and uncertain wall cabinet ownership alone.",
        "cash": 30,
        "phase": "now",
        "repeat": false
      },
      {
        "id": "d-extras",
        "title": "Pack spare bathroom accessories",
        "detail": "Keep daily toiletries and hand soap in service.",
        "cash": 25,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "d-final",
        "title": "Pack remaining nonessential bathroom belongings",
        "detail": "Don't pack the daily essentials yet.",
        "cash": 30,
        "phase": "final",
        "repeat": false
      },
      {
        "id": "d-moving",
        "title": "Pack final toiletries",
        "detail": "Preserve a personal travel hygiene bag.",
        "cash": 35,
        "phase": "moving",
        "repeat": false
      }
    ]
  },
  {
    "id": "chloe",
    "name": "Chloe's bedroom",
    "icon": "🦄",
    "priority": 9,
    "status": "Protected · closets now",
    "description": "Keep the room looking lived-in. Only clothing, closet storage and optional wall art now; toys remain until final 2–3 weeks.",
    "missions": [
      {
        "id": "c-summer",
        "title": "Pack Chloe's summer clothes",
        "detail": "Go through closet and drawers; leave her newly bought daily wardrobe intact.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "c-outgrown",
        "title": "Remove clothing that no longer fits Chloe",
        "detail": "Separate donation, discard and current sizes; this is moving preparation.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "c-top",
        "title": "Pack accessible rarely used closet storage",
        "detail": "Check before boxing; high items can wait for help.",
        "cash": 30,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "c-art",
        "title": "Pack wall artwork only if Chloe is comfortable",
        "detail": "This is optional; keep familiar decorations if she prefers.",
        "cash": 25,
        "phase": "now",
        "repeat": false
      },
      {
        "id": "c-extra",
        "title": "Pack extra toys and stuffed animals",
        "detail": "Leave current favorites and bedtime comfort objects.",
        "cash": 35,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "c-kitchen",
        "title": "Pack play-kitchen and doll accessories",
        "detail": "Keep a few favorites available until the final days.",
        "cash": 35,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "c-final",
        "title": "Pack remaining bedroom belongings",
        "detail": "Beds, comfort objects and travel bag stay last.",
        "cash": 45,
        "phase": "moving",
        "repeat": true
      }
    ]
  },
  {
    "id": "boys",
    "name": "Oliver & Logan's bedroom",
    "icon": "🧩",
    "priority": 10,
    "status": "Protected · clothing only",
    "description": "Children are stressed about moving; do NOT dismantle their displays or completed LEGO sets now. Floor-to-closet access is a separate Cleaning mission in Daily Life.",
    "notes": [
      "Do not disturb built LEGO sets or display shelves before the final weeks.",
      "The beds, gaming setup, comfort items and room decorations stay familiar.",
      "Toys on the floor are a Cleaning task in Daily Life, not a Packing instruction."
    ],
    "missions": [
      {
        "id": "o-outgrown",
        "title": "Purge outgrown boys' clothes",
        "detail": "Go through one accessible closet or dresser section, keeping each boy's clothing distinct.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "o-summer",
        "title": "Pack the boys' summer clothes",
        "detail": "Box out-of-season outfits and leave daily clothes accessible.",
        "cash": 35,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "o-closet",
        "title": "Pack unused accessible closet storage",
        "detail": "No toy displays or electronics; leave inaccessible items until the cleaning mission is done.",
        "cash": 30,
        "phase": "now",
        "repeat": true
      },
      {
        "id": "o-wall",
        "title": "Pack removable wall art only if both boys are comfortable",
        "detail": "Do not strip their room of familiar things early.",
        "cash": 20,
        "phase": "now",
        "repeat": false
      },
      {
        "id": "o-toys",
        "title": "Pack spare toys and books",
        "detail": "Only in the last two to three weeks; ask before moving special creations.",
        "cash": 35,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "o-lego",
        "title": "Carefully photograph and secure completed LEGO builds",
        "detail": "Photograph first; pack intact when possible, with loose pieces in labelled bags. Involve the boys.",
        "cash": 65,
        "phase": "final",
        "repeat": true
      },
      {
        "id": "o-rest",
        "title": "Pack remaining bedroom belongings",
        "detail": "Leave comfort toys and sleeping gear for moving day.",
        "cash": 45,
        "phase": "moving",
        "repeat": true
      }
    ]
  }
];
