/* ---------------- CART ---------------- */
const ORDO_CART_KEY = 'ordoUmbraCart';

function ordoGetCart(){
  try{
    const raw = localStorage.getItem(ORDO_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}

function ordoSaveCart(cart){
  try{ localStorage.setItem(ORDO_CART_KEY, JSON.stringify(cart)); }catch(e){ /* storage unavailable — cart just won't persist */ }
  ordoUpdateCartBadge();
}

function ordoAddToCart(id, qty){
  qty = qty || 1;
  const cart = ordoGetCart();
  const existing = cart.find(c => c.id === id);
  if(existing){ existing.qty += qty; } else { cart.push({ id, qty }); }
  ordoSaveCart(cart);
  ordoShowToast('Sealed into the satchel');
}

function ordoRemoveFromCart(id){
  ordoSaveCart(ordoGetCart().filter(c => c.id !== id));
}

function ordoSetQty(id, qty){
  const cart = ordoGetCart();
  const item = cart.find(c => c.id === id);
  if(item){
    item.qty = Math.max(1, Math.floor(qty) || 1);
    ordoSaveCart(cart);
  }
}

function ordoCartLines(){
  return ordoGetCart().map(c => {
    const product = (typeof ORDO_PRODUCTS !== 'undefined') ? ORDO_PRODUCTS.find(p => p.id === c.id) : null;
    return product ? { ...product, qty:c.qty, lineTotal: product.price * c.qty } : null;
  }).filter(Boolean);
}

function ordoCartCount(){
  return ordoGetCart().reduce((sum, c) => sum + c.qty, 0);
}

function ordoCartTotal(){
  return ordoCartLines().reduce((sum, l) => sum + l.lineTotal, 0);
}

function ordoUpdateCartBadge(){
  const n = ordoCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  });
}

function ordoShowToast(msg){
  let toast = document.getElementById('ordo-toast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'ordo-toast';
    toast.className = 'ordo-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove('show');
  void toast.offsetWidth; // restart the transition
  toast.classList.add('show');
  clearTimeout(toast._ordoTimer);
  toast._ordoTimer = setTimeout(()=> toast.classList.remove('show'), 2200);
}

document.addEventListener('DOMContentLoaded', ordoUpdateCartBadge);
