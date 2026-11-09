/* Bento Viana — shared behaviour. Plain JS, no modules. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Header: solid after 80px ---- */
  var header = document.querySelector('[data-header]');
  function onScroll() {
    if (header) header.classList.toggle('is-solid', window.scrollY > 80);
  }
  if (header) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Nav: current page ---- */
  document.querySelectorAll('.site-nav a').forEach(function (a) {
    try {
      var seg = new URL(a.href, location.href).pathname.split('/').filter(Boolean).pop();
      var here = location.pathname.split('/').filter(Boolean);
      if (seg && here.indexOf(seg) > -1) a.setAttribute('aria-current', 'page');
    } catch (e) { /* ignore */ }
  });

  /* ---- Nav toggle ---- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  function setNav(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 860) setNav(false);
    });
  }

  /* ---- Manifesto line stagger ---- */
  var manifestos = document.querySelectorAll('.manifesto');
  manifestos.forEach(function (m) {
    m.querySelectorAll('.line').forEach(function (l, i) { l.style.setProperty('--i', i); });
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); mo.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    manifestos.forEach(function (m) { mo.observe(m); });
  } else {
    manifestos.forEach(function (m) { m.classList.add('is-visible'); });
  }

  /* ---- Image fade-in ---- */
  function markLoaded(img) { img.classList.add('is-loaded'); }
  function watchImages(root) {
    (root || document).querySelectorAll('img.fade-img').forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) markLoaded(img);
      else {
        img.addEventListener('load', function () { markLoaded(img); }, { once: true });
        img.addEventListener('error', function () { markLoaded(img); }, { once: true });
      }
    });
  }
  watchImages(document);
  window.bvWatchImages = watchImages; // for pages that inject images later

  /* ---- Light image protection ---- */
  document.addEventListener('contextmenu', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });

  /* ---- Lightbox ---- */
  var lb = null, lbImg, lbCap, lbCount, lbPrev, lbNext, lbClose;
  var items = [], idx = 0, lastFocus = null, touchX = null;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML =
      '<div class="lightbox__bar"><span class="label lightbox__count" aria-live="polite"></span>' +
      '<button type="button" class="lightbox__close">Close</button></div>' +
      '<div class="lightbox__stage">' +
      '<button type="button" class="lightbox__nav lightbox__prev" aria-label="Previous image">&larr;</button>' +
      '<img class="lightbox__img" alt="" draggable="false">' +
      '<button type="button" class="lightbox__nav lightbox__next" aria-label="Next image">&rarr;</button></div>' +
      '<p class="label lightbox__caption"></p>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('.lightbox__img');
    lbCap = lb.querySelector('.lightbox__caption');
    lbCount = lb.querySelector('.lightbox__count');
    lbPrev = lb.querySelector('.lightbox__prev');
    lbNext = lb.querySelector('.lightbox__next');
    lbClose = lb.querySelector('.lightbox__close');
    lbClose.addEventListener('click', closeLb);
    lbPrev.addEventListener('click', function () { show(idx - 1); });
    lbNext.addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__stage')) closeLb();
    });
    lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function show(i) {
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    var el = items[idx];
    var img = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (!img) return;
    var src = img.getAttribute('data-full') || el.getAttribute('data-full') || img.currentSrc || img.src;
    var alt = img.getAttribute('alt') || '';
    lbCount.textContent = pad(idx + 1) + ' / ' + pad(items.length);
    lbCap.textContent = alt;
    lbImg.classList.remove('is-shown');
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      lbImg.src = src;
      lbImg.alt = alt;
      lbImg.classList.add('is-shown');
    };
    pre.src = src;
    var single = items.length < 2;
    lbPrev.hidden = single;
    lbNext.hidden = single;
  }

  function openLb(el) {
    if (!lb) buildLightbox();
    var gEl = el.closest('[data-lightbox-group]');
    var group = gEl ? gEl.getAttribute('data-lightbox-group') : null;
    items = Array.prototype.filter.call(document.querySelectorAll('[data-lightbox]'), function (n) {
      var g = n.closest('[data-lightbox-group]');
      return (g ? g.getAttribute('data-lightbox-group') : null) === group && (n.tagName === 'IMG' || n.querySelector('img'));
    });
    var start = items.indexOf(el);
    lastFocus = document.activeElement;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    show(start < 0 ? 0 : start);
    lbClose.focus();
  }

  function closeLb() {
    if (!lb) return;
    lb.classList.remove('is-open');
    lbImg.classList.remove('is-shown');
    document.body.style.overflow = document.body.classList.contains('nav-open') ? 'hidden' : '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function isOpen() { return lb && lb.classList.contains('is-open'); }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-lightbox]');
    if (!el) return;
    e.preventDefault();
    openLb(el);
  });
  document.addEventListener('keydown', function (e) {
    var el = e.target;
    if (!isOpen()) {
      if ((e.key === 'Enter' || e.key === ' ') && el && el.matches && el.matches('[data-lightbox]') && el.tagName !== 'A' && el.tagName !== 'BUTTON') {
        e.preventDefault();
        openLb(el);
      }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return !b.hidden; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (f.indexOf(document.activeElement) < 0) { e.preventDefault(); first.focus(); }
    }
  });
  // make non-interactive lightbox triggers keyboard reachable
  document.querySelectorAll('[data-lightbox]').forEach(function (n) {
    if (n.tagName !== 'A' && n.tagName !== 'BUTTON') {
      if (!n.hasAttribute('tabindex')) n.setAttribute('tabindex', '0');
      if (!n.hasAttribute('role')) n.setAttribute('role', 'button');
    }
  });

  /* ---- Contact form ---- */
  var form = document.getElementById('inquiry-form');
  if (form) {
    var status = document.getElementById('form-status');
    var btn = form.querySelector('button[type="submit"]');
    var FALLBACK = 'Something went wrong. Please email hello@bentoviana.com.';
    var setStatus = function (msg, state) {
      if (!status) return;
      status.textContent = msg;
      status.setAttribute('data-state', state || '');
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var v = function (n) { var f = form.elements[n]; return f && f.value ? f.value.trim() : ''; };
      var message = 'Project type: ' + v('type') + '\nLocation: ' + v('location') +
        '\nTimeline: ' + v('timeline') + '\nHow they heard: ' + v('heard') + '\n\n' + v('message');
      var payload = { name: v('name'), email: v('email'), message: message, company: v('company'), site: 'bento-viana' };
      if (btn) btn.disabled = true;
      setStatus('Sending…', '');
      fetch('https://forms.caiomsi.com/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (res.ok && data.ok !== false) {
            setStatus('Thank you — your message is on its way. Bento will reply by email.', 'ok');
            form.reset();
          } else {
            setStatus((data && (data.error || data.message)) || FALLBACK, 'error');
          }
        });
      }).catch(function () {
        setStatus(FALLBACK, 'error');
      }).then(function () {
        if (btn) btn.disabled = false;
      });
    });
  }
})();
