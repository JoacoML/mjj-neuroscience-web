(() => {
  const cfg = window.SITE_CONFIG || {};
  const EN = window.I18N_EN || {};
  const ES = { ...(window.I18N_ES_EXTRA || {}) };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  let lang = 'es';

  // ---------- Config ----------
  $$('.js-platform').forEach((a) => { if (cfg.platformUrl) a.href = cfg.platformUrl; });
  $$('.js-email').forEach((a) => {
    if (!cfg.contactEmail) return;
    a.href = `mailto:${cfg.contactEmail}`;
    a.textContent = cfg.contactEmail;
  });
  $('#year').textContent = String(new Date().getFullYear());

  // ---------- i18n ----------
  // El HTML está en español: guardamos esos textos como diccionario ES.
  $$('[data-i18n]').forEach((el) => { ES[el.dataset.i18n] = el.textContent; });
  $$('[data-i18n-html]').forEach((el) => { ES[el.dataset.i18nHtml] = el.innerHTML; });
  ES['meta.title'] = document.title;
  ES['meta.description'] = $('meta[name="description"]').content;

  const t = (key) => (lang === 'en' ? EN[key] : ES[key]) ?? ES[key] ?? key;

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.title = t('meta.title');
    $('meta[name="description"]').content = t('meta.description');
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderPhases();
    const active = $('[role="tab"][aria-selected="true"]');
    if (active) selectTab(active, false);
    try { localStorage.setItem('lang', lang); } catch { /* sin storage */ }
  }

  function initialLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'es') return q;
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'es') return saved;
    } catch { /* sin storage */ }
    return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // ---------- Fases ----------
  function renderPhases() {
    const list = $('#phases');
    list.innerHTML = '';
    (window.PHASES || []).forEach((p, i) => {
      const [title, sub] = p[lang];
      const li = document.createElement('li');
      li.className = 'phase reveal in';
      li.style.setProperty('--i', String(i));
      li.innerHTML = `<span class="phase-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="phase-time mono">${p.time}</span>
        <h3></h3><p></p>`;
      $('h3', li).textContent = title;
      $('p', li).textContent = sub;
      list.appendChild(li);
    });
  }

  // ---------- Tabs del recorrido ----------
  const tourImg = $('#tour-img');
  const tourCaption = $('#tour-caption');
  const tabs = $$('[role="tab"]');
  function selectTab(tab, animate = true) {
    const idx = tabs.indexOf(tab) + 1;
    tabs.forEach((b) => b.setAttribute('aria-selected', String(b === tab)));
    tourCaption.textContent = t(`tour.c${idx}`);
    const src = `assets/${tab.dataset.shot}.jpg`;
    tourImg.alt = tab.textContent;
    if (tourImg.getAttribute('src') === src) return;
    if (!animate) { tourImg.src = src; return; }
    tourImg.classList.add('swap');
    setTimeout(() => { tourImg.src = src; }, 160);
    tourImg.onload = () => tourImg.classList.remove('swap');
  }
  tabs.forEach((b) => b.addEventListener('click', () => selectTab(b)));
  // Precarga para que el cambio de pestaña sea instantáneo.
  window.addEventListener('load', () => tabs.forEach((b) => { new Image().src = `assets/${b.dataset.shot}.jpg`; }));

  // ---------- Animaciones al hacer scroll ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  // ---------- "Time is brain": cronómetro y contador ----------
  const start = performance.now();
  const timerEl = $('#stroke-timer');
  const countEl = $('#neuron-count');
  const NEURONS_PER_MS = 1_900_000 / 60_000;
  const fmt = () => new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-AR');
  function tick() {
    const ms = performance.now() - start;
    const s = Math.floor(ms / 1000);
    timerEl.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    countEl.textContent = fmt().format(Math.floor(ms * NEURONS_PER_MS));
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---------- Nav con sombra al scrollear ----------
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Formulario de demo ----------
  const form = $('#demo-form');
  const status = $('#form-status');
  const submitBtn = $('button[type="submit"]', form);

  function setStatus(key, kind) {
    status.textContent = key ? t(key) : '';
    status.dataset.kind = kind || '';
  }

  // Envía la solicitud por mail a través de FormSubmit (https://formsubmit.co), sin backend propio.
  async function sendLead(lead) {
    const subject = `${cfg.leadSubject} — ${lead['Institución']} (${lead['Nombre']})`;
    const res = await fetch(`https://formsubmit.co/ajax/${cfg.leadInbox}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        _replyto: lead.Email,
        ...lead,
      }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || String(out.success) !== 'true') throw new Error(`formsubmit ${res.status} ${out.message || ''}`);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (data.get('website')) return; // honeypot: bots
    if (!form.checkValidity()) {
      form.classList.add('touched');
      setStatus('form.invalid', 'error');
      $(':invalid', form)?.focus();
      return;
    }
    // Claves en español: son los rótulos que se leen en el mail.
    const field = (name) => String(data.get(name) || '').trim() || '—';
    const roleOption = form.elements.role.selectedOptions[0];
    const lead = {
      Nombre: field('name'),
      Email: field('email'),
      'Institución': field('organization'),
      Rol: ES[roleOption.dataset.i18n] || roleOption.value,
      'País': field('country'),
      'Teléfono': field('phone'),
      Mensaje: field('message'),
      Idioma: lang.toUpperCase(),
      Origen: location.hostname || 'local',
    };
    submitBtn.disabled = true;
    setStatus('form.sending');
    try {
      await sendLead(lead);
      setStatus('form.ok', 'ok');
      form.reset();
      form.classList.remove('touched');
    } catch (err) {
      console.error(err);
      setStatus('form.error', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  setLang(initialLang());
})();
