/* ============================================================
   GLOBAL SAVED-LIST SIDEBAR
   - Slide-out panel from the right
   - Saves talare, utställare and programpunkter to localStorage
   - First save auto-opens the panel and shows a docked toggle tab
   - Toggle tab stays visible afterwards (count badge)
   ============================================================ */
(function(){
  const KEY = 'em27_saved';     // unified store
  const LEGACY_AGENDA = 'em27_agenda'; // existing program.html storage — we'll mirror

  /* ---------- Storage ---------- */
  function load(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return []; }
  }
  function save(items){
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
    refreshButtons();
    // Mirror programpunkter back to em27_agenda so program.html's own UI stays in sync
    const agenda = items.filter(x => x.type === 'program').map(x => x.payload).filter(Boolean);
    try { localStorage.setItem(LEGACY_AGENDA, JSON.stringify(agenda)); } catch(e){}
  }
  function has(id){ return load().some(x => x.id === id); }
  function add(item){
    const list = load();
    if (list.some(x => x.id === item.id)) return false;
    list.push(Object.assign({ ts: Date.now() }, item));
    save(list);
    return true;
  }
  function remove(id){
    save(load().filter(x => x.id !== id));
  }
  function clearType(type){
    save(load().filter(x => x.type !== type));
  }
  function clearAll(){ save([]); }

  /* ---------- Sidebar shell ---------- */
  let panel, tab, listEl, countEls = [];
  const TYPE_LABELS = { talare: 'Talare', utstallare: 'Utställare', program: 'Programpunkter' };
  const TYPE_ORDER  = ['talare','program','utstallare'];

  function injectStyles(){
    if (document.getElementById('em-saved-style')) return;
    const css = `
      .em-saved-tab{ position:fixed; right:0; top:50%; transform:translate(0,-50%); z-index:9990;
        display:none; align-items:center; gap:8px; padding:14px 14px 14px 16px;
        background:linear-gradient(135deg,#FFD60A,#FF9500); color:#0a0612; border:0;
        border-top-left-radius:16px; border-bottom-left-radius:16px; font-family:inherit;
        font-weight:800; font-size:13px; letter-spacing:.04em; cursor:pointer;
        box-shadow:-8px 12px 30px -10px rgba(255,214,10,0.45), 0 0 0 1px rgba(0,0,0,0.05);
        writing-mode:vertical-rl; text-orientation:mixed; transition:transform .2s, box-shadow .2s; }
      .em-saved-tab:hover{ transform:translate(-3px,-50%); box-shadow:-10px 16px 36px -10px rgba(255,214,10,0.6); }
      .em-saved-tab.is-visible{ display:inline-flex; }
      .em-saved-tab .em-c{ background:#0a0612; color:#FFD60A; padding:2px 8px; border-radius:100px;
        font-size:12px; min-width:22px; text-align:center; writing-mode:horizontal-tb; }

      .em-saved-panel{ position:fixed; top:0; right:0; height:100vh; width:380px; max-width:92vw;
        background:#0E0B16; border-left:1px solid rgba(255,255,255,0.1); z-index:9991;
        transform:translateX(100%); transition:transform .35s cubic-bezier(.2,.8,.2,1);
        display:flex; flex-direction:column; box-shadow:-30px 0 80px -20px rgba(0,0,0,0.7);
        font-family:inherit; color:#fff; }
      .em-saved-panel.is-open{ transform:translateX(0); }
      .em-saved-backdrop{ position:fixed; inset:0; background:rgba(8,5,15,0.5); backdrop-filter:blur(4px);
        opacity:0; pointer-events:none; transition:opacity .3s; z-index:9989; }
      .em-saved-backdrop.is-open{ opacity:1; pointer-events:auto; }

      .em-sp-head{ padding:22px 22px 14px; display:flex; align-items:center; justify-content:space-between;
        border-bottom:1px solid rgba(255,255,255,0.08); }
      .em-sp-title{ display:flex; align-items:center; gap:10px; font-size:17px; font-weight:700; letter-spacing:-.01em; }
      .em-sp-title .em-star{ width:28px; height:28px; border-radius:9px; display:grid; place-items:center;
        background:linear-gradient(135deg,#FFD60A,#FF9500); color:#0a0612; font-size:14px; }
      .em-sp-close{ background:transparent; border:0; color:rgba(255,255,255,0.55); width:34px; height:34px;
        border-radius:50%; cursor:pointer; font-size:22px; line-height:1; transition:background .15s, color .15s; }
      .em-sp-close:hover{ background:rgba(255,255,255,0.06); color:#fff; }

      .em-sp-list{ flex:1; overflow-y:auto; padding:8px 14px 16px; }
      .em-sp-empty{ padding:80px 24px; text-align:center; color:rgba(255,255,255,0.55); font-size:13.5px; line-height:1.55; }
      .em-sp-empty b{ color:#FFD60A; }

      .em-sp-group{ margin-top:18px; }
      .em-sp-group-h{ display:flex; align-items:center; justify-content:space-between; padding:0 8px 8px;
        font-size:11px; letter-spacing:.16em; text-transform:uppercase; font-weight:700; color:rgba(255,255,255,0.5); }
      .em-sp-group-h .em-clr{ background:transparent; border:0; color:rgba(255,255,255,0.4); font-size:11px;
        cursor:pointer; padding:4px 8px; border-radius:6px; font-family:inherit; letter-spacing:0; text-transform:none; }
      .em-sp-group-h .em-clr:hover{ color:#FF6B6B; background:rgba(255,107,107,0.06); }

      .em-sp-item{ display:flex; align-items:center; gap:12px; padding:10px 10px 10px 12px; border-radius:12px;
        transition:background .15s; }
      .em-sp-item:hover{ background:rgba(255,255,255,0.04); }
      .em-sp-item .em-thumb{ width:42px; height:42px; border-radius:10px; flex-shrink:0; background:#1a1424;
        display:grid; place-items:center; font-size:16px; font-weight:700; color:#fff;
        background-size:cover; background-position:center 25%; }
      .em-sp-item a.em-body{ flex:1; min-width:0; text-decoration:none; color:inherit; display:block; }
      .em-sp-item .em-name{ font-size:14px; font-weight:600; color:#fff; line-height:1.3;
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .em-sp-item .em-sub{ margin-top:2px; font-size:12px; color:rgba(255,255,255,0.5);
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .em-sp-item .em-rm{ background:transparent; border:0; color:rgba(255,255,255,0.35); width:32px; height:32px;
        border-radius:50%; cursor:pointer; font-size:18px; line-height:1; transition:background .15s, color .15s; flex-shrink:0; }
      .em-sp-item .em-rm:hover{ background:rgba(255,107,107,0.12); color:#FF6B6B; }

      .em-sp-foot{ padding:14px 18px 18px; border-top:1px solid rgba(255,255,255,0.08);
        display:flex; flex-direction:column; gap:8px; }
      .em-sp-cta{ display:flex; align-items:center; justify-content:center; gap:8px; padding:14px;
        background:linear-gradient(135deg,#30D158,#0A84FF); border:0; border-radius:12px; color:#fff;
        font-weight:700; font-size:14px; cursor:pointer; font-family:inherit; transition:transform .15s, box-shadow .2s;
        box-shadow:0 12px 28px -10px rgba(48,209,88,0.5); }
      .em-sp-cta:hover{ transform:translateY(-1px); box-shadow:0 16px 36px -10px rgba(48,209,88,0.6); }
      .em-sp-cta:disabled{ opacity:0.45; cursor:not-allowed; transform:none; box-shadow:none; }
      .em-sp-clear{ background:transparent; border:1px solid rgba(255,255,255,0.12); border-radius:12px;
        padding:11px; color:rgba(255,255,255,0.7); font-weight:600; font-size:13px; cursor:pointer; font-family:inherit; }
      .em-sp-clear:hover{ background:rgba(255,107,107,0.06); color:#FF6B6B; border-color:rgba(255,107,107,0.3); }

      /* save buttons injected onto cards */
      .em-save-btn{ position:absolute; top:10px; right:10px; z-index:5; width:34px; height:34px; border-radius:50%;
        background:rgba(8,5,15,0.78); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.18);
        color:#fff; cursor:pointer; display:grid; place-items:center; padding:0; font-family:inherit;
        transition:transform .15s, background .15s, border-color .15s, color .15s;
        opacity:0; }
      .em-save-btn:hover{ transform:scale(1.08); background:rgba(8,5,15,0.95); border-color:rgba(255,214,10,0.5); color:#FFD60A; }
      .em-save-btn svg{ width:16px; height:16px; }
      .em-save-btn.is-saved{ background:linear-gradient(135deg,#FFD60A,#FF9500); border-color:transparent; color:#0a0612; opacity:1; }
      .em-save-btn.is-saved:hover{ color:#0a0612; }
      /* show on hover of parent */
      .em-saveable:hover .em-save-btn,
      .em-save-btn:focus-visible,
      .em-save-btn.is-saved{ opacity:1; }
      .em-saveable{ position:relative; }

      /* small toast */
      .em-saved-toast{ position:fixed; bottom:24px; left:50%; transform:translate(-50%, 20px); z-index:9999;
        background:#0a0612; border:1px solid rgba(255,214,10,0.4); color:#FFD60A; padding:12px 18px;
        border-radius:100px; font-size:13.5px; font-weight:600; opacity:0; transition:opacity .25s, transform .25s;
        pointer-events:none; box-shadow:0 14px 40px -10px rgba(0,0,0,0.5); }
      .em-saved-toast.is-on{ opacity:1; transform:translate(-50%, 0); }

      @media(max-width:600px){
        .em-saved-panel{ width:100vw; }
      }
    `;
    const s = document.createElement('style');
    s.id = 'em-saved-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildShell(){
    if (document.getElementById('em-saved-panel')) return;

    tab = document.createElement('button');
    tab.className = 'em-saved-tab';
    tab.id = 'em-saved-tab';
    tab.setAttribute('aria-label','Visa sparade');
    tab.innerHTML = '<span class="em-c" data-count>0</span><span>★ Sparade</span>';
    tab.addEventListener('click', openPanel);
    document.body.appendChild(tab);

    const back = document.createElement('div');
    back.className = 'em-saved-backdrop';
    back.id = 'em-saved-backdrop';
    back.addEventListener('click', closePanel);
    document.body.appendChild(back);

    panel = document.createElement('aside');
    panel.className = 'em-saved-panel';
    panel.id = 'em-saved-panel';
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML = `
      <div class="em-sp-head">
        <div class="em-sp-title"><span class="em-star">★</span><span>Mina sparade <span data-count style="color:rgba(255,255,255,0.45); font-weight:500;">(0)</span></span></div>
        <button class="em-sp-close" aria-label="Stäng">×</button>
      </div>
      <div class="em-sp-list" id="em-sp-list"></div>
      <div class="em-sp-foot">
        <button class="em-sp-cta" id="em-sp-cta">📲 Skicka till mässappen</button>
        <button class="em-sp-clear" id="em-sp-clear">Rensa alla</button>
      </div>
    `;
    document.body.appendChild(panel);

    listEl = panel.querySelector('#em-sp-list');
    countEls = document.querySelectorAll('[data-count]');

    panel.querySelector('.em-sp-close').addEventListener('click', closePanel);
    panel.querySelector('#em-sp-clear').addEventListener('click', () => {
      if (!load().length) return;
      if (confirm('Rensa hela listan med sparade?')) clearAll();
    });
    panel.querySelector('#em-sp-cta').addEventListener('click', sendToApp);

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
  }

  function openPanel(){
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden','false');
    document.getElementById('em-saved-backdrop').classList.add('is-open');
  }
  function closePanel(){
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden','true');
    document.getElementById('em-saved-backdrop').classList.remove('is-open');
  }

  function showToast(msg){
    let t = document.getElementById('em-saved-toast');
    if (!t){
      t = document.createElement('div'); t.id='em-saved-toast'; t.className='em-saved-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-on'), 1800);
  }

  function sendToApp(){
    const items = load();
    if (!items.length) { showToast('Inget sparat ännu'); return; }
    const counts = TYPE_ORDER.map(t => {
      const n = items.filter(x => x.type === t).length;
      return n ? `${n} ${TYPE_LABELS[t].toLowerCase()}` : null;
    }).filter(Boolean).join(' · ');
    showToast('✓ Skickat till din mässapp · ' + counts);
  }

  /* ---------- Render list ---------- */
  function render(){
    if (!listEl) return;
    const items = load();
    countEls.forEach(el => el.textContent = items.length === 0 ? '0' : items.length);

    // toggle tab visibility
    if (tab){
      if (items.length > 0) tab.classList.add('is-visible');
      else tab.classList.remove('is-visible');
      tab.querySelector('[data-count]').textContent = items.length;
    }

    if (!items.length){
      listEl.innerHTML = `<div class="em-sp-empty">Inget sparat än.<br/><br/>Klicka på <b>★</b> på talare, utställare eller programpunkter så samlas de här.</div>`;
      return;
    }

    let html = '';
    TYPE_ORDER.forEach(type => {
      const group = items.filter(x => x.type === type);
      if (!group.length) return;
      html += `<div class="em-sp-group">
        <div class="em-sp-group-h">
          <span>${TYPE_LABELS[type]} · ${group.length}</span>
          <button class="em-clr" data-clear-type="${type}">Rensa</button>
        </div>`;
      group.forEach(it => {
        const initials = (it.title||'?').trim().split(/\s+/).map(w => w[0]||'').slice(0,2).join('').toUpperCase();
        const thumbStyle = it.thumb ? `background-image:url('${escapeAttr(it.thumb)}')` : `background:linear-gradient(135deg,${it.c1||'#5E5CE6'},${it.c2||'#0A84FF'})`;
        const thumbInner = it.thumb ? '' : initials;
        html += `<div class="em-sp-item">
          <div class="em-thumb" style="${thumbStyle}">${thumbInner}</div>
          ${it.href
            ? `<a class="em-body" href="${escapeAttr(it.href)}"><div class="em-name">${escapeHtml(it.title||'')}</div>${it.subtitle ? `<div class="em-sub">${escapeHtml(it.subtitle)}</div>` : ''}</a>`
            : `<div class="em-body"><div class="em-name">${escapeHtml(it.title||'')}</div>${it.subtitle ? `<div class="em-sub">${escapeHtml(it.subtitle)}</div>` : ''}</div>`}
          <button class="em-rm" data-rm="${escapeAttr(it.id)}" title="Ta bort">×</button>
        </div>`;
      });
      html += `</div>`;
    });
    listEl.innerHTML = html;
    listEl.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => remove(b.dataset.rm)));
    listEl.querySelectorAll('[data-clear-type]').forEach(b => b.addEventListener('click', () => {
      if (confirm('Rensa alla ' + TYPE_LABELS[b.dataset.clearType].toLowerCase() + '?')) clearType(b.dataset.clearType);
    }));
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s){ return escapeHtml(s); }

  /* ---------- Decorate cards with save buttons ---------- */
  const SVG_BOOKMARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"/></svg>';
  const SVG_FILLED   = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"/></svg>';

  function makeButton(itemFactory){
    const btn = document.createElement('button');
    btn.className = 'em-save-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label','Spara');
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const it = itemFactory();
      if (!it || !it.id) return;
      if (has(it.id)){
        remove(it.id);
        showToast('Borttagen');
      } else {
        add(it);
        showToast('★ Sparad');
        // first-ever save → auto open
        if (load().length === 1) setTimeout(openPanel, 250);
      }
    });
    return btn;
  }

  function setBtnState(btn, saved){
    const nextState = !!saved;
    if (btn._emSavedState === nextState && btn.innerHTML) return;
    btn._emSavedState = nextState;
    btn.classList.toggle('is-saved', nextState);
    btn.innerHTML = nextState ? SVG_FILLED : SVG_BOOKMARK;
    btn.setAttribute('aria-label', nextState ? 'Sparad — klicka för att ta bort' : 'Spara');
  }

  const decorated = new WeakMap();

  function decorate(el, itemFactory){
    if (decorated.has(el)) return;
    decorated.set(el, true);
    el.classList.add('em-saveable');
    // Some decorated elements are <a> tags — buttons inside <a> are valid HTML.
    const btn = makeButton(itemFactory);
    el.appendChild(btn);
    el._emSaveBtn = btn;
    el._emItemFactory = itemFactory;
    const it = itemFactory();
    setBtnState(btn, it && has(it.id));
  }

  function refreshButtons(){
    document.querySelectorAll('.em-saveable').forEach(el => {
      if (!el._emSaveBtn || !el._emItemFactory) return;
      const it = el._emItemFactory();
      setBtnState(el._emSaveBtn, it && has(it.id));
    });
  }

  /* ----- factories per card type ----- */
  function slugFromHref(href){
    if (!href) return '';
    const m = href.match(/([^\/]+?)(?:\.html)?(?:[?#]|$)/);
    return m ? m[1] : href;
  }

  function decorateSpeakerTile(el){
    decorate(el, () => {
      const name = (el.querySelector('.sp-tile-name')||{}).textContent || '';
      const role = (el.querySelector('.sp-tile-role')||{}).textContent || '';
      const org  = (el.querySelector('.sp-tile-org')||{}).textContent || '';
      const photoEl = el.querySelector('.sp-tile-photo');
      let thumb = '';
      if (photoEl){
        const m = (photoEl.getAttribute('style')||'').match(/url\(['"]?([^'")]+)['"]?\)/);
        if (m) thumb = m[1];
      }
      const href = el.getAttribute('href') || '';
      const slug = slugFromHref(href) || name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      return {
        type:'talare',
        id:'talare:'+slug,
        title:name.trim(),
        subtitle:[role,org].filter(Boolean).join(' · '),
        href, thumb
      };
    });
  }

  function decorateKeynote(el){
    decorate(el, () => {
      const name = (el.querySelector('.kn-name')||{}).textContent || '';
      const role = (el.querySelector('.kn-role')||{}).textContent || '';
      const photo = el.querySelector('.kn-photo');
      const thumb = photo ? photo.getAttribute('src') : '';
      const href = el.getAttribute('href') || '';
      const slug = slugFromHref(href) || name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      return {
        type:'talare',
        id:'talare:'+slug,
        title:name.trim(),
        subtitle:role.trim(),
        href, thumb
      };
    });
  }

  function decorateExhibitor(el){
    decorate(el, () => {
      // ex-card may have name in various spots; try common selectors
      const name = (el.querySelector('.ex-name, h3, h4, .e-name') || {}).textContent
                   || el.getAttribute('aria-label') || el.getAttribute('title') || '';
      const sub  = (el.querySelector('.ex-tag, .ex-sub, .e-sub') || {}).textContent || '';
      const href = el.getAttribute('href') || '';
      const c1 = el.style.getPropertyValue('--c1') || '';
      const c2 = el.style.getPropertyValue('--c2') || '';
      const slug = (name||href).toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40);
      return {
        type:'utstallare',
        id:'utstallare:'+slug,
        title:name.trim(),
        subtitle:sub.trim(),
        href: href && href !== '#' ? href : '',
        c1, c2
      };
    });
  }

  function decorateSession(el){
    // .session elements on program.html — they already have their own ★ Spara button.
    // We DON'T inject our floating star here; instead we listen for the existing button
    // and mirror em27_agenda → em27_saved on every change.
  }

  /* ---------- Mirror existing program agenda into unified store ---------- */
  function mirrorAgenda(){
    let agenda;
    try { agenda = JSON.parse(localStorage.getItem(LEGACY_AGENDA) || '[]'); } catch(e){ agenda = []; }
    const list = load();
    // Remove program items no longer in agenda
    let filtered = list.filter(x => x.type !== 'program' || agenda.some(a => 'program:'+a.id === x.id));
    // Add new agenda entries
    agenda.forEach(a => {
      const id = 'program:'+a.id;
      if (!filtered.some(x => x.id === id)){
        filtered.push({
          type:'program', id,
          title:a.title,
          subtitle:`Dag ${a.day} · ${a.time} · ${a.dur}`,
          href:'program.html',
          payload:a, ts:Date.now()
        });
      }
    });
    if (JSON.stringify(filtered) !== JSON.stringify(list)) save(filtered);
  }

  /* ---------- Scan & init ---------- */
  function scan(){
    document.querySelectorAll('.sp-tile').forEach(decorateSpeakerTile);
    document.querySelectorAll('.kn-card').forEach(decorateKeynote);
    document.querySelectorAll('.ex-card').forEach(decorateExhibitor);
  }

  function init(){
    injectStyles();
    buildShell();
    mirrorAgenda();
    scan();
    render();

    // Re-scan on dynamic DOM (program/utställning render into .sessions / .ex-grid)
    let scanQueued = false;
    const mo = new MutationObserver(() => {
      if (scanQueued) return;
      scanQueued = true;
      requestAnimationFrame(() => {
        scanQueued = false;
        scan();
        refreshButtons();
      });
    });
    mo.observe(document.body, { childList:true, subtree:true });

    // Re-mirror agenda whenever localStorage changes (other tabs or program page)
    window.addEventListener('storage', (e) => {
      if (e.key === LEGACY_AGENDA) mirrorAgenda();
      if (e.key === KEY) { render(); refreshButtons(); }
    });
    // Poll mirror every 1.5s in case program.html updates within same tab
    setInterval(mirrorAgenda, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Expose minimal API
  window.EmSaved = { add, remove, clear:clearAll, open:openPanel, close:closePanel, list:load };
})();
