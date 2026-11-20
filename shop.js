// Storefront: product cards, cart drawer, checkout.
// All content and settings come from site-config.js (window.SITE).
(function () {
  var S = window.SITE;
  if (!S) return;
  var C = S.shop, P = S.products;

  var KEY = 'qalbCart.v1';
  var MAX_QTY = 20;
  var fmt = new Intl.NumberFormat(C.locale || 'en-IN');
  function money(n) { return C.currency + fmt.format(n); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function label(g) { return g >= 1000 ? (g / 1000) + ' kg' : g + ' g'; }
  function prod(id) { for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i]; return null; }
  function sizeFor(id, g) {
    var p = prod(id);
    if (!p) return null;
    for (var i = 0; i < p.sizes.length; i++) if (p.sizes[i].g === g) return p.sizes[i];
    return null;
  }
  var reduce = function () { return document.documentElement.classList.contains('reduce-motion'); };
  var CART_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';

  /* ---------- cart state ---------- */
  function load() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a.filter(function (i) { return i && sizeFor(i.id, i.g) && i.qty > 0; }) : [];
    } catch (e) { return []; }
  }
  var cart = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function totals() {
    var sub = 0, n = 0;
    cart.forEach(function (i) { sub += sizeFor(i.id, i.g).price * i.qty; n += i.qty; });
    var ship = sub === 0 ? 0 : (sub >= C.freeShippingOver ? 0 : C.shippingFlat);
    return { sub: sub, ship: ship, total: sub + ship, count: n };
  }
  function add(id, g, qty) {
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id && cart[i].g === g) {
        cart[i].qty = Math.min(MAX_QTY, cart[i].qty + qty);
        save(); updateBadge(true); return;
      }
    }
    cart.push({ id: id, g: g, qty: qty });
    save(); updateBadge(true);
  }

  /* ---------- nav badge ---------- */
  var badges = document.querySelectorAll('.cart-count');
  function updateBadge(bump) {
    var n = totals().count;
    badges.forEach(function (b) {
      b.textContent = n;
      b.classList.toggle('has', n > 0);
      if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
  }

  /* ---------- product grid ---------- */
  var grid = document.getElementById('productGrid');
  if (grid) {
    P.forEach(function (p, idx) {
      var sel = sizeFor(p.id, p.defaultG) || p.sizes[0];
      var card = document.createElement('article');
      card.className = 'pcard reveal';
      card.style.setProperty('--d', (idx % 3) * 90 + 'ms');
      card.setAttribute('data-id', p.id);
      var media = p.image
        ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">'
        : '<svg role="img" aria-label="' + esc(p.name) + '"><use href="#ill-' + esc(p.art) + '"/></svg>';
      card.innerHTML =
        '<div class="pmedia" style="--tint:' + esc(p.tint || '#F4E8D8') + '">' + media + '<span class="ptag">' + esc(p.form) + '</span></div>' +
        '<div class="pbody">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p class="pblurb">' + esc(p.blurb) + '</p>' +
          (p.use ? '<p class="puse"><b>Try:</b> ' + esc(p.use) + '</p>' : '') +
          '<div class="buy">' +
            '<div class="buy-label">Choose weight</div>' +
            '<div class="chips" role="radiogroup" aria-label="Weight for ' + esc(p.name) + '">' +
              p.sizes.map(function (s) {
                return '<button type="button" role="radio" aria-checked="false" class="chip" data-g="' + s.g + '">' + label(s.g) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="buy-row"><div class="price"><b></b><small></small></div>' +
            '<button type="button" class="btn add">' + CART_ICON + '<span>Add to Cart</span></button></div>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);

      var priceEl = card.querySelector('.price b');
      var perEl = card.querySelector('.price small');
      var addBtn = card.querySelector('.add');
      var addLabel = addBtn.querySelector('span');
      var timer;
      function paint(animate) {
        card.querySelectorAll('.chip').forEach(function (c) {
          c.setAttribute('aria-checked', String(Number(c.getAttribute('data-g')) === sel.g));
        });
        priceEl.textContent = money(sel.price);
        perEl.textContent = money(Math.round(sel.price / (sel.g / 100))) + ' / 100 g';
        if (animate) { priceEl.classList.remove('pop'); void priceEl.offsetWidth; priceEl.classList.add('pop'); }
      }
      paint(false);
      card.querySelector('.chips').addEventListener('click', function (e) {
        var c = e.target.closest('.chip');
        if (!c) return;
        sel = sizeFor(p.id, Number(c.getAttribute('data-g')));
        paint(true);
      });
      addBtn.addEventListener('click', function () {
        add(p.id, sel.g, 1);
        addLabel.textContent = 'Added ✓';
        addBtn.classList.add('done');
        clearTimeout(timer);
        timer = setTimeout(function () { addLabel.textContent = 'Add to Cart'; addBtn.classList.remove('done'); }, 1500);
        openCart('cart');
      });
    });
  }

  /* ---------- drawer shell ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  var drawer = document.createElement('aside');
  drawer.className = 'cart';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'cartTitle');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML =
    '<div class="cart-head"><div class="cart-title" id="cartTitle">Your Cart</div>' +
    '<button type="button" class="cart-close" aria-label="Close cart">&times;</button></div>' +
    '<div class="cart-body" tabindex="-1"></div>';
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  var body = drawer.querySelector('.cart-body');
  var titleEl = drawer.querySelector('.cart-title');
  var closeBtn = drawer.querySelector('.cart-close');
  var view = 'cart', lastOrder = null, opener = null;
  var demo = !C.razorpayKeyId;

  /* ---------- views ---------- */
  function cartView() {
    if (!cart.length) {
      return '<div class="cart-empty">' +
        '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>' +
        '<p>Your cart is empty.</p><p class="muted">Pick a spice and weight to get started.</p>' +
        '<button type="button" class="btn" data-act="browse">Browse Spices</button></div>';
    }
    var t = totals();
    var items = cart.map(function (i, idx) {
      var p = prod(i.id), s = sizeFor(i.id, i.g);
      var nm = p.name;
      return '<li class="ci"><div class="ci-info"><div class="ci-name">' + esc(nm) + '</div>' +
        '<div class="ci-sub">' + label(i.g) + ' · ' + money(s.price) + ' each</div>' +
        '<div class="qty" role="group" aria-label="Quantity for ' + esc(nm) + ' ' + label(i.g) + '">' +
          '<button type="button" data-act="dec" data-i="' + idx + '" aria-label="Decrease quantity">&minus;</button>' +
          '<span aria-live="polite">' + i.qty + '</span>' +
          '<button type="button" data-act="inc" data-i="' + idx + '" aria-label="Increase quantity"' + (i.qty >= MAX_QTY ? ' disabled' : '') + '>+</button>' +
        '</div></div>' +
        '<div class="ci-side"><div class="ci-price">' + money(s.price * i.qty) + '</div>' +
        '<button type="button" class="linkbtn" data-act="remove" data-i="' + idx + '" aria-label="Remove ' + esc(nm) + ' ' + label(i.g) + '">Remove</button></div></li>';
    }).join('');
    var need = C.freeShippingOver - t.sub;
    var pct = Math.min(100, Math.round(t.sub / C.freeShippingOver * 100));
    var hint = need > 0 ? 'Add <b>' + money(need) + '</b> more for free shipping' : 'You\u2019ve unlocked free shipping';
    return '<ul class="ci-list">' + items + '</ul>' +
      '<div class="cart-foot">' +
        '<div class="ship"><div class="ship-bar"><i style="width:' + pct + '%"></i></div><p>' + hint + '</p></div>' +
        '<dl class="sum"><dt>Subtotal</dt><dd>' + money(t.sub) + '</dd>' +
          '<dt>Shipping</dt><dd>' + (t.ship ? money(t.ship) : 'Free') + '</dd>' +
          '<dt class="tot">Total</dt><dd class="tot">' + money(t.total) + '</dd></dl>' +
        '<button type="button" class="btn big wide" data-act="checkout">Checkout &middot; ' + money(t.total) + '</button>' +
        '<button type="button" class="linkbtn center" data-act="browse">Continue shopping</button>' +
      '</div>';
  }

  function field(name, labelText, attrs, tag) {
    var el = tag === 'textarea'
      ? '<textarea name="' + name + '" rows="2" ' + attrs + '></textarea>'
      : '<input name="' + name + '" ' + attrs + '>';
    return '<label class="field"><span>' + labelText + '</span>' + el + '</label>';
  }

  function checkoutView() {
    var t = totals();
    var lines = cart.map(function (i) {
      return '<li><span>' + i.qty + ' &times; ' + esc(prod(i.id).name) + ' &middot; ' + label(i.g) + '</span><b>' + money(sizeFor(i.id, i.g).price * i.qty) + '</b></li>';
    }).join('');
    return '<form class="co" id="checkoutForm" novalidate>' +
      '<button type="button" class="linkbtn back" data-act="back">&larr; Back to cart</button>' +
      '<div class="co-h">Delivery details</div>' +
      field('name', 'Full name', 'type="text" required autocomplete="name" placeholder="Your name"') +
      '<div class="two">' +
        field('email', 'Email', 'type="email" required autocomplete="email" placeholder="you@example.com"') +
        field('phone', 'Mobile', 'type="tel" required inputmode="numeric" autocomplete="tel-national" pattern="[6-9][0-9]{9}" maxlength="10" title="10-digit mobile number" placeholder="10-digit number"') +
      '</div>' +
      field('address', 'Address', 'required autocomplete="street-address" placeholder="House no., street, area"', 'textarea') +
      '<div class="two">' +
        field('city', 'City', 'type="text" required autocomplete="address-level2"') +
        field('state', 'State', 'type="text" required autocomplete="address-level1"') +
      '</div>' +
      '<div class="two">' +
        field('pin', 'PIN code', 'type="text" required inputmode="numeric" autocomplete="postal-code" pattern="[1-9][0-9]{5}" maxlength="6" title="6-digit PIN code"') +
      '</div>' +
      '<div class="co-h">Order summary</div>' +
      '<ul class="co-lines">' + lines +
        '<li><span>Shipping</span><b>' + (t.ship ? money(t.ship) : 'Free') + '</b></li>' +
        '<li class="tot"><span>Total</span><b>' + money(t.total) + '</b></li></ul>' +
      (demo ? '<p class="demo-note"><b>Demo checkout.</b> No payment is taken and the order is not sent anywhere. Add a Razorpay key in <code>site-config.js</code> to accept real payments.</p>' : '') +
      '<p class="form-error" role="alert" hidden></p>' +
      '<button type="submit" class="btn big wide" id="payBtn">' + (demo ? 'Place Order (demo)' : 'Pay ' + money(t.total)) + '</button>' +
      '</form>';
  }

  function doneView() {
    var o = lastOrder;
    var first = esc((o.customer.name || '').split(' ')[0] || 'there');
    return '<div class="done">' +
      '<svg class="tick" viewBox="0 0 52 52" width="64" height="64" aria-hidden="true"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 27l8 8 14-17" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<h3>Thank you, ' + first + '!</h3>' +
      '<p>Your order <b>' + esc(o.id) + '</b> for <b>' + money(o.total) + '</b> has been placed.</p>' +
      '<p class="muted">We\u2019ll reach you at ' + esc(o.customer.email) + ' / ' + esc(o.customer.phone) + ' about delivery.</p>' +
      (o.status === 'demo' ? '<p class="demo-note"><b>Demo checkout.</b> No payment was taken and this order was not sent to anyone.</p>' : (o.paymentId ? '<p class="muted">Payment ID: ' + esc(o.paymentId) + '</p>' : '')) +
      '<button type="button" class="btn" data-act="close">Continue Shopping</button></div>';
  }

  function render() {
    titleEl.textContent = view === 'cart' ? 'Your Cart' : view === 'checkout' ? 'Checkout' : 'Order Placed';
    body.innerHTML = view === 'cart' ? cartView() : view === 'checkout' ? checkoutView() : doneView();
  }

  /* ---------- open / close ---------- */
  function openCart(v) {
    if (v) view = v;
    if (view === 'checkout' && !cart.length) view = 'cart';
    render();
    if (!drawer.classList.contains('open')) opener = document.activeElement;
    drawer.classList.add('open');
    overlay.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('cart-open');
    setTimeout(function () { closeBtn.focus(); }, 60);
  }
  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('cart-open');
    if (view === 'done') view = 'cart';
    if (opener && opener.focus) opener.focus();
  }
  function goShop() {
    closeCart();
    var g = document.getElementById('shop');
    if (g) g.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('[data-open-cart]').forEach(function (b) {
    b.addEventListener('click', function () { openCart('cart'); });
  });
  closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') { closeCart(); return; }
    if (e.key === 'Tab') {                       // keep focus inside the drawer
      var f = drawer.querySelectorAll('button:not([disabled]), input, textarea, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  body.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act'), idx = Number(b.getAttribute('data-i'));
    if (act === 'inc' && cart[idx]) cart[idx].qty = Math.min(MAX_QTY, cart[idx].qty + 1);
    else if (act === 'dec' && cart[idx]) { cart[idx].qty -= 1; if (cart[idx].qty <= 0) cart.splice(idx, 1); }
    else if (act === 'remove') cart.splice(idx, 1);
    else if (act === 'checkout') { view = 'checkout'; }
    else if (act === 'back') { view = 'cart'; }
    else if (act === 'browse') { goShop(); return; }
    else if (act === 'close') { closeCart(); return; }
    save(); updateBadge(false); render();
    if (act === 'checkout') { var n = body.querySelector('input[name="name"]'); if (n) n.focus(); }
  });

  /* ---------- checkout ---------- */
  function showError(msg) {
    var el = body.querySelector('.form-error');
    var btn = body.querySelector('#payBtn');
    if (el) { el.textContent = msg; el.hidden = false; }
    if (btn) { btn.disabled = false; btn.textContent = demo ? 'Place Order (demo)' : 'Pay ' + money(totals().total); }
  }
  function finish(order, paymentId) {
    order.paymentId = paymentId || null;
    order.status = paymentId ? 'paid' : 'demo';
    if (C.orderEndpoint) {
      try {
        fetch(C.orderEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) }).catch(function () {});
      } catch (e) {}
    }
    lastOrder = order;
    cart = []; save(); updateBadge(false);
    view = 'done'; render();
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (window.Razorpay) return res();
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function payRazorpay(order) {
    loadScript('https://checkout.razorpay.com/v1/checkout.js').then(function () {
      var rz = new window.Razorpay({
        key: C.razorpayKeyId,
        amount: order.total * 100,                 // paise
        currency: 'INR',
        name: S.brand.name,
        description: 'Order ' + order.id,
        prefill: { name: order.customer.name, email: order.customer.email, contact: order.customer.phone },
        notes: { order_id: order.id, address: order.customer.address + ', ' + order.customer.city + ', ' + order.customer.state + ' ' + order.customer.pin },
        theme: { color: '#B9131A' },
        handler: function (r) { finish(order, r.razorpay_payment_id); },
        modal: { ondismiss: function () { showError('Payment was cancelled. You can try again.'); } }
      });
      rz.on('payment.failed', function (r) {
        showError('Payment failed' + (r && r.error && r.error.description ? ': ' + r.error.description : '.') + ' Please try again.');
      });
      rz.open();
    }).catch(function () { showError('Could not load the payment window. Check your connection and try again.'); });
  }

  body.addEventListener('submit', function (e) {
    if (e.target.id !== 'checkoutForm') return;
    e.preventDefault();
    var f = e.target;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var d = {};
    new FormData(f).forEach(function (v, k) { d[k] = String(v).trim(); });
    var t = totals();
    var order = {
      id: 'QS' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      currency: C.currency, subtotal: t.sub, shipping: t.ship, total: t.total,
      items: cart.map(function (i) {
        return { id: i.id, name: prod(i.id).name, grams: i.g, qty: i.qty, unitPrice: sizeFor(i.id, i.g).price };
      }),
      customer: d
    };
    var btn = f.querySelector('#payBtn');
    btn.disabled = true; btn.textContent = 'Processing…';
    var err = f.querySelector('.form-error'); if (err) err.hidden = true;
    if (demo) setTimeout(function () { finish(order, null); }, 700);
    else payRazorpay(order);
  });

  updateBadge(false);
})();
