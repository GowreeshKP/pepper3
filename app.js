// Page behaviour: config-driven text, reveals, progress bar, nav, hero parallax, story word-scrub.
(function () {
  var S = window.SITE || {};
  var B = S.brand || {}, K = S.contact || {}, C = S.shop || {};
  var root = document.documentElement;
  var reduce = root.classList.contains('reduce-motion');
  var fmt = new Intl.NumberFormat(C.locale || 'en-IN');
  function money(n) { return (C.currency || '₹') + fmt.format(n); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- config-driven text ---------- */
  var announce = document.getElementById('announce');
  if (announce) {
    var msg = (B.announcement || '').replace('{freeShipping}', money(C.freeShippingOver || 0));
    if (msg) announce.textContent = msg; else announce.hidden = true;
  }
  document.querySelectorAll('[data-ship-text]').forEach(function (el) {
    el.textContent = 'Free shipping over ' + money(C.freeShippingOver || 0);
  });
  document.querySelectorAll('[data-ship-faq]').forEach(function (el) {
    el.textContent = 'Orders over ' + money(C.freeShippingOver || 0) + ' ship free. Below that, shipping is a flat ' + money(C.shippingFlat || 0) + '.';
  });
  /* brand name + logo come from site-config.js */
  if (B.name) {
    document.querySelectorAll('[data-brand-name]').forEach(function (el) { el.textContent = B.name; });
    document.title = B.name + ' — Whole Spices with Heart';
  }
  if (B.logo) document.querySelectorAll('.brand-logo, .hero-logo').forEach(function (img) { img.src = B.logo; });
  var yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

  var fc = document.getElementById('footContact');
  if (fc) {
    var h = '';
    if (K.email) h += '<a href="mailto:' + esc(K.email) + '">' + esc(K.email) + '</a>';
    if (K.phone) h += '<a href="tel:' + esc(K.phone.replace(/[^\d+]/g, '')) + '">' + esc(K.phone) + '</a>';
    if (K.whatsapp) h += '<a href="https://wa.me/' + esc(K.whatsapp.replace(/\D/g, '')) + '" target="_blank" rel="noopener">WhatsApp</a>';
    if (K.instagram) h += '<a href="' + esc(K.instagram) + '" target="_blank" rel="noopener">Instagram</a>';
    if (K.address) h += '<p>' + esc(K.address) + '</p>';
    if (h) { fc.insertAdjacentHTML('beforeend', h); fc.hidden = false; }
  }

  /* ---------- marquee of product names ---------- */
  var mq = document.getElementById('marquee');
  if (mq && S.products) {
    var one = S.products.map(function (p) { return '<span>' + esc(p.name) + '</span><i>✦</i>'; }).join('');
    mq.innerHTML = one + one + one + one;
  }

  /* ---------- reveal on scroll ---------- */
  function showAll() { document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); }); }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    var seen = 0;
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (!el.style.getPropertyValue('--d')) {
        var sib = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
        var i = Array.prototype.indexOf.call(sib, el);
        el.style.setProperty('--d', Math.max(0, i) % 4 * 90 + 'ms');
      }
      io.observe(el); seen++;
    });
  }

  /* ---------- story: words light up as you scroll ---------- */
  var scrubs = Array.prototype.slice.call(document.querySelectorAll('.scrub'));
  var words = [];
  scrubs.forEach(function (p) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = t;
            frag.appendChild(s); words.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(p);
  });

  /* ---------- scroll loop ---------- */
  var bar = document.getElementById('progress');
  var nav = document.querySelector('.site-nav');
  var hero = document.querySelector('.hero-art');
  var orbs = hero ? Array.prototype.slice.call(hero.querySelectorAll('.orb')) : [];
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (bar) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    if (nav) nav.classList.toggle('shrunk', y > 24);
    if (reduce) return;
    if (hero) {
      var f = Math.min(1, y / 700);
      hero.style.setProperty('--sy', (y * -0.06).toFixed(1) + 'px');
      orbs.forEach(function (o, i) { o.style.setProperty('--py', (y * (0.04 + i * 0.025) * -1).toFixed(1) + 'px'); });
      hero.style.opacity = String(1 - f * 0.35);
    }
    if (words.length) {
      var vh = window.innerHeight;
      scrubs.forEach(function (p) {
        var r = p.getBoundingClientRect();
        var start = vh * 0.86, end = vh * 0.45;
        var prog = Math.max(0, Math.min(1, (start - r.top) / (start - end + r.height * 0.6)));
        var ws = p.querySelectorAll('.w');
        var lit = Math.round(prog * ws.length);
        for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('lit', i < lit);
      });
    }
  }
  function req() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  if (reduce) words.forEach(function (w) { w.classList.add('lit'); });
  onScroll();

  /* ---------- hero: pointer parallax ---------- */
  if (hero && !reduce && window.matchMedia('(hover:hover)').matches) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5), y = (e.clientY / window.innerHeight - 0.5);
      hero.style.setProperty('--mx', (x * 18).toFixed(1) + 'px');
      hero.style.setProperty('--my', (y * 14).toFixed(1) + 'px');
      orbs.forEach(function (o, i) {
        var k = (i % 2 ? -1 : 1) * (10 + i * 4);
        o.style.setProperty('--ox', (x * k).toFixed(1) + 'px');
        o.style.setProperty('--oy', (y * k).toFixed(1) + 'px');
      });
    }, { passive: true });
  }
})();
