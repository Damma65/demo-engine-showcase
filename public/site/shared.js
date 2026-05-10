/* Shared site behavior — gold strip, mobile menu, rich footer. */
(function(){
  /* ---------- GOLD SPONSOR STRIP (above nav, on every page) ---------- */
  function injectGoldStrip(){
    if (document.querySelector('.gold-strip')) return;
    var strip = document.createElement('div');
    strip.className = 'gold-strip';
    strip.innerHTML =
      '<div class="gold-strip-inner">' +
        '<span class="gs-label"><span class="gs-dot"></span><span class="gs-label-text">Guldsponsorer · Energimässan 2027</span></span>' +
        '<div class="gs-chips">' +
          '<a class="gs-logo gs-logo--sungrow" href="https://en.sungrowpower.com/" target="_blank" rel="noopener" aria-label="Sungrow"><img src="partners/sungrow.svg" alt="Sungrow" loading="eager" decoding="async" /></a>' +
          '<span class="gs-divider"></span>' +
          '<a class="gs-logo gs-logo--tdg" href="sponsorpaket.html" aria-label="TDG Yunet"><img src="partners/tdg-yunet.svg" alt="TDG Yunet" loading="eager" decoding="async" /></a>' +
        '</div>' +
        '<a class="gs-cta" href="sponsorpaket.html">Bli sponsor</a>' +
      '</div>';
    document.body.insertBefore(strip, document.body.firstChild);
  }

  /* ---------- MOBILE NAV ---------- */
  function initMobileNav(){
    var nav = document.querySelector('.nav .nav-inner');
    if (!nav || nav.dataset.mobileInit) return;
    nav.dataset.mobileInit = '1';
    var links = nav.querySelector('.nav-links');
    if (!links) return;
    var btn = document.createElement('button');
    btn.className = 'nav-burger';
    btn.setAttribute('aria-label', 'Öppna meny');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(btn);
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    var inner = document.createElement('div');
    inner.className = 'nav-overlay-inner';
    links.querySelectorAll('a').forEach(function(a){
      var c = a.cloneNode(true); c.classList.remove('active'); inner.appendChild(c);
    });
    var cta = nav.querySelector('.nav-cta');
    if (cta){ var cc = cta.cloneNode(true); cc.classList.add('nav-overlay-cta'); inner.appendChild(cc); }
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    function close(){ overlay.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); document.body.style.overflow = ''; }
    function open(){ overlay.classList.add('open'); btn.classList.add('open'); btn.setAttribute('aria-expanded','true'); document.body.style.overflow = 'hidden'; }
    btn.addEventListener('click', function(){ if (overlay.classList.contains('open')) close(); else open(); });
    overlay.addEventListener('click', function(e){ if (e.target === overlay || e.target.tagName === 'A') close(); });
    document.addEventListener('keydown', function(e){ if (e.key==='Escape') close(); });
  }

  /* ---------- RICH FOOTER (replaces existing <footer>) ---------- */
  function injectFooter(){
    var existing = document.querySelector('footer');
    if (!existing) return;
    if (existing.classList.contains('site-footer')) return;
    var year = new Date().getFullYear();
    var html =
      '<div class="sf-grid">' +
        '<div class="sf-brand">' +
          '<a class="sf-logo" href="index.html">' +
            '<span class="sf-logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg></span>' +
            '<span class="sf-logo-text"><strong>Energimässan 2027</strong><span>Nordic Live Expo</span></span>' +
          '</a>' +
          '<div class="sf-addr">' +
            'Nordic Live Expo AB<br/>F O Petersons Gata 28<br/>421 31 Västra Frölunda, Sverige<br/><br/>' +
            'Tel: <a href="tel:+4631788452">+46 (0)31 – 788 45 20</a><br/>' +
            'E-post: <a href="mailto:samhalle@liveexpo.se">samhalle@liveexpo.se</a>' +
          '</div>' +
          '<div class="sf-social">' +
            '<a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.34 18.34H5.67V9.99h2.67v8.35zM7 8.83a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zm11.34 9.51h-2.67v-4.06c0-.97-.02-2.22-1.35-2.22-1.36 0-1.57 1.06-1.57 2.15v4.13H10.1V9.99h2.56v1.14h.04a2.81 2.81 0 0 1 2.53-1.39c2.7 0 3.2 1.78 3.2 4.1v4.5z"/></svg></a>' +
            '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>' +
            '<a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg></a>' +
            '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg></a>' +
          '</div>' +
        '</div>' +

        '<div class="sf-col">' +
          '<h4>Meny</h4>' +
          '<ul>' +
            '<li><a href="index.html">Startsida</a></li>' +
            '<li><a href="program.html">Program</a></li>' +
            '<li><a href="talare.html">Talare</a></li>' +
            '<li><a href="utstallning.html">Utställning</a></li>' +
            '<li><a href="bli-utstallare.html">Bli utställare</a></li>' +
            '<li><a href="sponsorpaket.html">Bli sponsor</a></li>' +
            '<li><a href="resa-boende.html">Resa &amp; boende</a></li>' +
            '<li><a href="faq.html">Vanliga frågor</a></li>' +
          '</ul>' +
        '</div>' +

        '<div class="sf-col">' +
          '<h4>Öppettider</h4>' +
          '<ul>' +
            '<li class="sf-time"><b>Tisdag 19 maj 2027</b><br/>09.00 – 17.00</li>' +
            '<li class="sf-time"><b>Onsdag 20 maj 2027</b><br/>09.00 – 16.00</li>' +
          '</ul>' +
          '<h4 style="margin-top:28px;">Plats</h4>' +
          '<ul>' +
            '<li class="sf-time"><b>Kistamässan</b><br/>Arne Beurlings Torg 5<br/>164 40 Kista</li>' +
          '</ul>' +
        '</div>' +

        '<div class="sf-about">' +
          '<h4>Om Nordic Live Expo</h4>' +
          'Nordic Live Expo arrangerar mässor, möten, konferenser och events på den skandinaviska marknaden. Huvudkontoret ligger i Göteborg. Vi matchar människor och företag för att göra affärer, nätverka och inspireras av varandra. Med ett fulladdat innehåll inspirerar, utvecklar och uppdaterar vi våra besökare och tar mässmediet till en helt ny nivå.' +
        '</div>' +
      '</div>' +

      '<div class="sf-bottom">' +
        '<div>© ' + year + ' Nordic Live Expo · Energimässan</div>' +
        '<div class="sf-bottom-links">' +
          '<a href="#">Integritetspolicy</a>' +
          '<a href="#">Cookies</a>' +
          '<a href="hallbarhet.html">Hållbarhet</a>' +
          '<a href="pressrum.html">Press</a>' +
        '</div>' +
      '</div>';
    existing.className = 'site-footer';
    existing.innerHTML = html;
  }

  function injectSavedSidebar(){
    if (document.querySelector('script[data-em-saved]')) return;
    var s = document.createElement('script');
    s.src = '/site/saved.js';
    s.defer = true;
    s.setAttribute('data-em-saved','1');
    document.head.appendChild(s);
  }

  /* ---------- CLOSE (×) BUTTON on individual speaker profile pages ---------- */
  function injectSpeakerClose(){
    var p = location.pathname;
    if (!/\/site\/talare\/[^\/]+\.html$/.test(p)) return; // only individual profiles
    if (document.getElementById('sp-page-close')) return;
    if (!document.getElementById('sp-page-close-style')){
      var st = document.createElement('style');
      st.id = 'sp-page-close-style';
      st.textContent =
        '#sp-page-close{position:fixed;top:16px;right:16px;z-index:9995;width:42px;height:42px;border-radius:50%;'+
        'background:rgba(8,5,15,0.78);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.18);'+
        'color:#fff;cursor:pointer;display:grid;place-items:center;padding:0;'+
        'box-shadow:0 10px 28px -8px rgba(0,0,0,0.6);transition:transform .15s, background .15s, border-color .15s;}'+
        '#sp-page-close:hover{transform:scale(1.06);background:rgba(8,5,15,0.95);border-color:rgba(255,214,10,0.55);color:#FFD60A;}'+
        '#sp-page-close svg{width:16px;height:16px;}';
      document.head.appendChild(st);
    }
    var btn = document.createElement('button');
    btn.id = 'sp-page-close';
    btn.type = 'button';
    btn.setAttribute('aria-label','Stäng talarprofil');
    btn.title = 'Stäng (Esc)';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';
    btn.addEventListener('click', function(){
      if (document.referrer && /\/site\//.test(document.referrer) && history.length > 1) history.back();
      else location.href = '../talare.html';
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') btn.click(); });
    document.body.appendChild(btn);
  }

  /* ---------- CANONICAL NAV (same headings on every page) ---------- */
  function normalizeNav(){
    var links = document.querySelector('.nav .nav-links');
    if (!links) return;
    var items = [
      ['index.html','Startsida'],
      ['program.html','Program'],
      ['talare.html','Talare'],
      ['utstallning.html','Utställning'],
      ['kvallsmingel.html','Kvällsmingel'],
      ['bli-utstallare.html','Bli utställare'],
      ['index.html#biljetter','Biljetter'],
      ['resa-boende.html','Boende & Info']
    ];
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    links.innerHTML = items.map(function(it){
      var href = it[0], label = it[1];
      var file = href.split('#')[0].toLowerCase();
      var active = (file === path) ? ' class="active"' : '';
      if (label === 'Kvällsmingel') active = (file === path) ? ' class="active nav-mingel"' : ' class="nav-mingel"';
      return '<a href="'+href+'"'+active+'>'+label+'</a>';
    }).join('');
  }

  function init(){ injectGoldStrip(); normalizeNav(); initMobileNav(); injectFooter(); injectSavedSidebar(); injectSpeakerClose(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
