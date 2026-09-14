/* ----------------------------------------------------------------------
   PAYMENT INTEGRATION
   ----------------------------------------------------------------------
   processPayment(order) is the single place checkout.html calls into.
   Right now it's SIMULATED — it waits a moment and reports success, so
   you can test the full cart → checkout → confirmation flow today.

   When you tell me which payment provider you're using (Stripe, PayPal,
   Razorpay, Paddle, etc.), replace the body of this function with the
   real call. Two important things that stay true no matter which
   provider you pick:

   1. A real charge needs a small backend (a serverless function is
      enough — e.g. one Netlify/Vercel/Cloudflare function, or a tiny
      Node endpoint). Secret API keys must never be pasted into this
      file, because anything in a .html/.js file is visible to anyone
      who views your site's source.
   2. This function's job is just to call that backend endpoint (or
      redirect to the provider's hosted checkout) and return whether
      the payment succeeded.

   Examples of what real integrations look like, once you have a
   backend endpoint:

   --- Stripe (redirect to Stripe Checkout) ---
   async function processPayment(order){
     const res = await fetch('/api/create-checkout-session', {
       method:'POST',
       headers:{ 'Content-Type':'application/json' },
       body: JSON.stringify(order)
     });
     const { url } = await res.json();
     window.location.href = url; // Stripe hosts the payment page
   }

   --- PayPal (client-side Buttons SDK, no redirect) ---
   function renderPaypalButtons(order, onSuccess){
     paypal.Buttons({
       createOrder: (data, actions) => actions.order.create({
         purchase_units: [{ amount: { value: order.total.toFixed(2) } }]
       }),
       onApprove: (data, actions) => actions.order.capture().then(onSuccess)
     }).render('#paypal-button-container');
   }
   ---------------------------------------------------------------------- */

async function processPayment(order){
  // order: { items:[{id,name,qty,price}], total:Number, customer:{name,email,address} }

  // --- SIMULATED PAYMENT — replace this block when a provider is chosen ---
  await new Promise(resolve => setTimeout(resolve, 1300));
  return { success:true, orderId:'ORD-' + Date.now().toString(36).toUpperCase() };
}
