/* Shared site behavior — mobile menu, etc. Loaded on every page. */
(function(){
  function initMobileNav(){
    var nav = document.querySelector('.nav .nav-inner');
    if (!nav || nav.dataset.mobileInit) return;
    nav.dataset.mobileInit = '1';
    var links = nav.querySelector('.nav-links');
    if (!links) return;
    // Build burger button
    var btn = document.createElement('button');
    btn.className = 'nav-burger';
    btn.setAttribute('aria-label', 'Öppna meny');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(btn);
    // Build overlay
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    var inner = document.createElement('div');
    inner.className = 'nav-overlay-inner';
    // clone links + cta into overlay
    links.querySelectorAll('a').forEach(function(a){
      var c = a.cloneNode(true);
      c.classList.remove('active');
      inner.appendChild(c);
    });
    var cta = nav.querySelector('.nav-cta');
    if (cta){
      var cc = cta.cloneNode(true);
      cc.classList.add('nav-overlay-cta');
      inner.appendChild(cc);
    }
    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    function close(){
      overlay.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }
    function open(){
      overlay.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded','true');
      document.body.style.overflow = 'hidden';
    }
    btn.addEventListener('click', function(){
      if (overlay.classList.contains('open')) close(); else open();
    });
    overlay.addEventListener('click', function(e){
      if (e.target === overlay || e.target.tagName === 'A') close();
    });
    document.addEventListener('keydown', function(e){ if (e.key==='Escape') close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMobileNav);
  else initMobileNav();
})();
