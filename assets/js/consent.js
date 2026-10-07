/* Google Ads / Analytics etiketleri + çerez onayı (Consent Mode v2)
   Kimlikler boş kaldıkça hiçbir Google etiketi yüklenmez ve onay bandı gösterilmez. */
(function () {
  'use strict';

  var TAGS = {
    gtmId: 'GTM-PC2X3CKM', // Google Tag Manager kapsayıcısı (sayfa <head>'inde yüklenir)
    adsId: '',          // Google Ads etiket kimliği, örn. 'AW-123456789'
    callConversion: '', // Telefon tıklaması dönüşümü, örn. 'AW-123456789/AbCdEfGh'
    waConversion: '',   // WhatsApp tıklaması / form dönüşümü, örn. 'AW-123456789/IjKlMnOp'
    gaId: ''            // Google Analytics 4 kimliği, örn. 'G-XXXXXXXXXX'
  };

  var KEY = 'cerez_onayi';
  var enabled = !!(TAGS.gtmId || TAGS.adsId || TAGS.gaId);

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function consentState(granted) {
    var v = granted ? 'granted' : 'denied';
    return { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v };
  }

  if (enabled) {
    var d = consentState(false);
    d.wait_for_update = 500;
    gtag('consent', 'default', d);
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', true);
    if (read() === 'granted') gtag('consent', 'update', consentState(true));

    if (TAGS.adsId || TAGS.gaId) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (TAGS.adsId || TAGS.gaId);
      document.head.appendChild(s);
      gtag('js', new Date());
      if (TAGS.adsId) gtag('config', TAGS.adsId);
      if (TAGS.gaId) gtag('config', TAGS.gaId);
    }
  }

  // Dönüşümler: telefon, WhatsApp ve iletişim formu
  // GTM tetikleyicileri için: telefon_tiklama, whatsapp_tiklama, whatsapp-konum_tiklama, form_tiklama
  // AntiClick: dönüşüm olayları yalnızca ziyaretçi temiz çıkarsa gönderilir (bot/sahte tıklamada hiç gönderilmez).
  // AntiClick betiği yüklenmeden tıklanırsa kuyruğa (AntiClick.q) girer; betik hiç yüklenemezse 5 sn sonra gönderilir.
  function whenClean(fn) {
    var done = false;
    var run = function () { if (!done) { done = true; fn(); } };
    var AC = window.AntiClick = window.AntiClick || {};
    if (typeof AC.onClean === 'function') { AC.onClean(run); return; }
    (AC.q = AC.q || []).push(run);
    setTimeout(function () {
      if (typeof (window.AntiClick || {}).onClean !== 'function') run();
    }, 5000);
  }
  function convert(sendTo, label) {
    if (!enabled) return;
    whenClean(function () {
      window.dataLayer.push({ event: label + '_tiklama', iletisim_yontemi: label });
      if (sendTo) gtag('event', 'conversion', { send_to: sendTo });
      if (TAGS.gaId) gtag('event', 'generate_lead', { method: label });
    });
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('[data-send-location]')) { convert(TAGS.waConversion, 'whatsapp-konum'); return; }
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.indexOf('tel:') === 0) convert(TAGS.callConversion, 'telefon');
    else if (href.indexOf('wa.me/') !== -1) convert(TAGS.waConversion, 'whatsapp');
  });
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'contactForm') convert(TAGS.waConversion, 'form');
  });

  // Onay bandı
  function banner() {
    if (document.getElementById('cookieBar')) return;
    var bar = document.createElement('div');
    bar.id = 'cookieBar';
    bar.className = 'cookie-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Çerez tercihleri');
    bar.innerHTML =
      '<p>Sitemizde reklamlarımızın etkinliğini ölçmek için Google çerezleri kullanmak istiyoruz. ' +
      'Onay vermezseniz yalnızca zorunlu işlevler çalışır. Ayrıntılar: ' +
      '<a href="gizlilik-politikasi.html">Gizlilik ve Çerez Politikası</a>.</p>' +
      '<div class="cookie-bar__actions">' +
      '<button type="button" class="btn btn--ghost-dark" data-c="denied">Reddet</button>' +
      '<button type="button" class="btn btn--red" data-c="granted">Kabul Et</button></div>';
    bar.addEventListener('click', function (e) {
      var c = e.target.getAttribute && e.target.getAttribute('data-c');
      if (!c) return;
      save(c);
      gtag('consent', 'update', consentState(c === 'granted'));
      window.dataLayer.push({ event: 'cerez_tercihi', cerez_onayi: c });
      bar.remove();
    });
    document.body.appendChild(bar);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!enabled) return;
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.hidden = false;
      el.addEventListener('click', function (e) { e.preventDefault(); banner(); });
    });
    if (!read()) banner();
  });
})();
