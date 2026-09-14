/* ---------------- PRODUCT CATALOG ---------------- */
/* Single source of truth for every product on the site.
   Add a new item here and it will automatically appear in the shop grid,
   be reachable at product.html?id=<id>, and work in the cart. */
const ORDO_PRODUCTS = [
  {
    id:"whisper-blade",
    name:"The Whisper Blade",
    price:320,
    desc:"A wrist-mounted hidden blade, spring-locked and silent. Deploys in the time it takes to exhale.",
    icon:`<svg viewBox="0 0 64 64" fill="none"><path d="M10 54L44 20" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M44 20l8-8 4 4-8 8" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M10 54l-2 6 6-2" stroke="url(#bladeGrad)" stroke-width="2"/></svg>`
  },
  {
    id:"nocturne-recurve",
    name:"Nocturne Recurve",
    price:540,
    desc:"A recurve bow strung with waxed sinew. Draws without a sound, looses without a warning.",
    icon:`<svg viewBox="0 0 64 64" fill="none"><path d="M20 8C10 20 10 44 20 56" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M20 8v48" stroke="url(#bladeGrad)" stroke-width="1" stroke-dasharray="3 3"/><path d="M20 32H52" stroke="url(#bladeGrad)" stroke-width="1.5"/><path d="M46 26l6 6-6 6" stroke="url(#bladeGrad)" stroke-width="2"/></svg>`
  },
  {
    id:"twin-kris-daggers",
    name:"Twin Kris Daggers",
    price:410,
    desc:"A matched pair, wave-forged for close work where a single blade cannot cover both flanks.",
    icon:`<svg viewBox="0 0 64 64" fill="none"><path d="M18 10q4 6 0 12t0 12t0 12t0 12" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M46 10q-4 6 0 12t0 12t0 12t0 12" stroke="url(#bladeGrad)" stroke-width="2"/></svg>`
  },
  {
    id:"ashfall-satchel",
    name:"Ashfall Satchel",
    price:180,
    desc:"Three sealed smoke charges, ceramic-cased. Break the seal; the room forgets you were ever there.",
    icon:`<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="36" r="14" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M24 22c0-6 4-10 8-10s6 3 4 7" stroke="url(#bladeGrad)" stroke-width="2"/></svg>`
  },
  {
    id:"magistrates-rapier",
    name:"The Magistrate's Rapier",
    price:680,
    desc:"A ceremonial longblade for those rare confrontations meant to be witnessed, not hidden.",
    icon:`<svg viewBox="0 0 64 64" fill="none"><path d="M32 4v40" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M20 16h24" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M32 44l-6 14M32 44l6 14" stroke="url(#bladeGrad)" stroke-width="2"/></svg>`
  },
  {
    id:"marked-throwing-set",
    name:"Marked Throwing Set",
    price:250,
    desc:"Six balanced blades, weighted for a flat arc across a crowded room.",
    icon:`<svg viewBox="0 0 64 64" fill="none"><path d="M32 8v18M32 8l-5 8M32 8l5 8" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M20 44l14-10M20 44l2-9M20 44l9 3" stroke="url(#bladeGrad)" stroke-width="2"/><path d="M44 44l-14-10M44 44l-2-9M44 44l-9 3" stroke="url(#bladeGrad)" stroke-width="2"/></svg>`
  }
];

function ordoFormatPrice(n){
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
}
