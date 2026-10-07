(function () {
  'use strict';

  var WA = '905327074409';
  var body = document.body;
  var hamburger = document.getElementById('hamburger');

  function openWa(text) {
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }

  // Mobil menü
  function closeNav() {
    body.classList.remove('nav-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  }
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', closeNav); });

  // Yıl
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Görünür olunca belirme
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Menüde aktif bölüm
  var links = document.querySelectorAll('.nav__link[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) {
      var sec = document.querySelector(l.getAttribute('href'));
      if (sec) spy.observe(sec);
    });
  }

  // Konumu WhatsApp'tan gönder
  document.querySelectorAll('[data-send-location]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var base = 'Merhaba, çekiciye ihtiyacım var.';
      if (!navigator.geolocation) { openWa(base + ' Konumumu buradan paylaşacağım.'); return; }
      // Pop-up engelini aşmak için pencere tıklama anında açılır, konum gelince yönlendirilir
      var win = window.open('about:blank', '_blank');
      var done = false;
      function go(text) {
        if (done) return;
        done = true;
        var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
        if (win && !win.closed) win.location.href = url; else window.location.href = url;
      }
      navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude.toFixed(6), lng = pos.coords.longitude.toFixed(6);
        go(base + '\nKonumum: https://maps.google.com/?q=' + lat + ',' + lng);
      }, function () {
        go(base + ' Konumumu buradan paylaşacağım.');
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      setTimeout(function () { go(base + ' Konumumu buradan paylaşacağım.'); }, 12000);
    });
  });

  // Galeri büyütme
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lastBtn = null;
    function closeLb() {
      lb.hidden = true;
      lbImg.removeAttribute('src');
      if (lastBtn) lastBtn.focus();
    }
    document.querySelectorAll('[data-lightbox]').forEach(function (b) {
      b.addEventListener('click', function () {
        lastBtn = b;
        lbImg.src = b.getAttribute('data-lightbox');
        lbImg.alt = (b.querySelector('img') || {}).alt || '';
        lb.hidden = false;
        lb.querySelector('.lightbox__close').focus();
      });
    });
    lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (!lb.hidden) closeLb(); closeNav(); }
    });
  }

  // Talep formu -> WhatsApp mesajı
  var form = document.getElementById('contactForm');
  if (form) {
    var err = document.getElementById('formErr');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [];
      form.querySelectorAll('[required]').forEach(function (el) {
        var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
        el.classList.toggle('is-invalid', !ok);
        if (!ok) bad.push(el);
      });
      if (bad.length) {
        err.textContent = 'Lütfen ad, telefon, aracın yeri ve KVKK onayını doldurun.';
        err.hidden = false;
        bad[0].focus();
        return;
      }
      err.hidden = true;
      var d = new FormData(form);
      openWa([
        'Merhaba Devranlar Oto Kurtarma,',
        'Ad Soyad: ' + d.get('ad'),
        'Telefon: ' + d.get('telefon'),
        'Araç: ' + d.get('arac') + ' · Durum: ' + d.get('durum'),
        'Araç nerede: ' + d.get('nereden'),
        'Nereye: ' + (d.get('nereye') || '-'),
        'Not: ' + (d.get('mesaj') || '-')
      ].join('\n'));
    });
    form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); });
  }
})();
