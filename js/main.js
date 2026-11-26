(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  if (cfg.emailUser && cfg.emailHost) cfg.email = cfg.emailUser + '@' + cfg.emailHost;
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // data-link bağlantılarını config'ten doldur; adresi olmayanı gizle
  document.querySelectorAll('[data-link]').forEach(function (el) {
    var key = el.getAttribute('data-link');
    var value = cfg[key];
    if (!value) { el.remove(); return; }
    el.setAttribute('href', key === 'email' ? 'mailto:' + value : value);
  });
  document.querySelectorAll('.proj__links, .dhero__actions').forEach(function (box) {
    if (!box.children.length) box.remove();
  });

  // Proje şeridi (yalnızca ana sayfada): ok düğmeleri ve kaydırma
  var rail = document.getElementById('rail');
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  if (rail && prevBtn && nextBtn) {
    var step = function (dir) {
      var card = rail.querySelector('.proj');
      var w = card ? card.getBoundingClientRect().width + 20 : 400;
      rail.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    };
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });

    // Oklar kart görsellerinin dikey ortasına hizalanır; şeridin başında/sonunda ilgili ok gizlenir
    var layoutArrows = function () {
      var art = rail.querySelector('.proj__art');
      if (art) {
        var top = art.getBoundingClientRect().top - rail.parentElement.getBoundingClientRect().top + art.offsetHeight / 2;
        prevBtn.style.top = nextBtn.style.top = top + 'px';
      }
      var max = rail.scrollWidth - rail.clientWidth;
      prevBtn.disabled = rail.scrollLeft <= 4;
      nextBtn.disabled = rail.scrollLeft >= max - 4;
    };
    rail.addEventListener('scroll', layoutArrows, { passive: true });
    window.addEventListener('resize', layoutArrows);
    window.addEventListener('load', layoutArrows);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutArrows);
    layoutArrows();
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    });
  }

  // Scroll reveal: JS çalışmazsa içerik gizli kalmasın diye sınıf burada eklenir
  var items = document.querySelectorAll('.reveal');
  if (items.length && 'IntersectionObserver' in window && !reduce) {
    root.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.setProperty('--d', (i % 4) * 0.07 + 's');
      io.observe(el);
    });
  }

  // E-posta kopyalama (yalnızca ana sayfada)
  var mail = cfg.email || '';
  var text = document.getElementById('emailText');
  var btn = document.getElementById('copyBtn');
  var msg = document.getElementById('copyMsg');
  if (!text || !btn) return;
  if (!mail) { btn.remove(); text.remove(); return; }
  text.textContent = mail;

  btn.addEventListener('click', function () {
    var done = function () { msg.textContent = 'Kopyalandı ✓'; setTimeout(function () { msg.textContent = ''; }, 2000); };
    var fallback = function () {
      var r = document.createRange(); r.selectNodeContents(text);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      msg.textContent = 'Seçildi, Ctrl+C ile kopyalayın';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mail).then(done, fallback);
    } else { fallback(); }
  });
})();
