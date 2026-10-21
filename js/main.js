// Interações, animações de scroll e montagem das seções.
import { logoSVG, symbolSVG, patternCanvas, C, PART } from './brand.js';

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

// Ícones oficiais (VETORIZADOS/ICONES), viewBox 100 × 100
const ICON = {
  'bem-estar': 'M50 84C-8 50 12 10 35 20C43 23 47 28 50 34C53 28 57 23 65 20C88 10 108 50 50 84Z',
  'casal': 'M55 50A24 24 0 1 1 7 50A24 24 0 1 1 55 50M93 50A24 24 0 1 1 45 50A24 24 0 1 1 93 50',
  'cuidados': 'M27 81C27 49 57 43 72 18C81 63 51 75 27 81ZM27 81L61 37M27 62C10 62 8 43 10 37C25 40 35 49 27 62',
  'desejo': 'M50 9C58 34 83 38 75 66C66 96 26 97 21 67C17 49 31 39 34 32C34 50 43 45 50 9Z',
  'dicas': 'M35 65C35 57 23 50 23 35C23 0 77 0 77 35C77 50 65 57 65 65ZM35 76H65M39 86H61',
  'experiencia': 'M50 7C54 33 67 45 92 50C67 55 54 67 50 93C46 67 33 55 8 50C33 45 46 33 50 7Z',
  'intimidade': 'M72 10C22 17 16 65 58 83C17 94 -6 50 17 23C31 6 48 5 72 10Z',
  'presentes': 'M22 43H78V86H22ZM16 31H84V44H16ZM50 31V86M50 30C20 36 23 3 40 12C49 17 50 30 50 30C50 30 51 17 60 12C77 3 80 36 50 30',
  'privacidade': 'M21 41H79V86H21ZM33 41V26C33 4 67 4 67 26V41M50 57V70',
  'sensualidade': 'M10 48C30 23 39 30 50 37C61 30 70 23 90 48C70 79 30 79 10 48ZM10 48C34 55 40 47 50 49C60 47 66 55 90 48'
};
const iconSVG = (id, w = 3) => `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="translate(5,5) scale(.9)"><path d="${ICON[id]}" pathLength="1" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;

// ---------- logos estáticos ----------
$$('[data-logo]').forEach(el => el.appendChild(logoSVG({ label: 'AnMar Lovers' })));
$$('[data-symbol]').forEach(el => el.appendChild(symbolSVG()));

// ---------- toast ----------
const toastEl = $('#toast'); let tt;
function toast(m) { toastEl.textContent = m; toastEl.hidden = false; clearTimeout(tt); tt = setTimeout(() => toastEl.hidden = true, 1800); }

// ---------- rolagem suave ----------
let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
gsap.registerPlugin(ScrollTrigger);
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
  e.preventDefault();
  lenis ? lenis.scrollTo(t, { offset: 0, duration: 1.6 }) : t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

// ---------- cursor, ímã e cartões com inclinação ----------
if (fine && !reduced) {
  document.body.classList.add('has-cursor');
  const cur = $('.cursor'), dot = $('i', cur), ring = $('b', cur);
  const p = { x: innerWidth / 2, y: innerHeight / 2 }, r = { ...p };
  addEventListener('pointermove', e => { p.x = e.clientX; p.y = e.clientY; gsap.set(dot, { x: p.x, y: p.y }); }, { passive: true });
  gsap.ticker.add(() => { r.x += (p.x - r.x) * .18; r.y += (p.y - r.y) * .18; gsap.set(ring, { x: r.x, y: r.y }); });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a, button, input, .tilt, .swatch');
    cur.classList.toggle('hover', !!t);
    cur.classList.toggle('drag', !!e.target.closest('canvas'));
  });
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => { const b = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - b.left - b.width / 2) * .3, y: (e.clientY - b.top - b.height / 2) * .4, duration: .4 }); });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
  });
}
function tilt(el, max = 8) {
  el.addEventListener('pointermove', e => {
    const b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
    if (!reduced && fine) gsap.to(el, { rotateY: (x - .5) * max * 2, rotateX: (.5 - y) * max * 2, duration: .5, ease: 'power2.out', transformPerspective: 900 });
  });
  el.addEventListener('pointerleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: .8, ease: 'power3.out' }));
}

// ---------- navegação e progresso ----------
const nav = $('#nav'); let lastY = 0;
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => {
  const y = s.scroll();
  nav.classList.toggle('solid', y > 60);
  nav.classList.toggle('hide', y > 400 && y > lastY + 4);
  if (y < lastY - 4) nav.classList.remove('hide');
  lastY = y;
  $('#progressBar').style.transform = `scaleX(${s.progress})`;
}});
const navLinks = $$('.nav ul a');
navLinks.forEach(a => {
  const sec = document.getElementById(a.getAttribute('href').slice(1)); if (!sec) return;
  ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) { navLinks.forEach(l => l.classList.remove('on')); a.classList.add('on'); } } });
});

// ---------- utilidades de texto ----------
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  return $$('.w', el);
}
function splitChars(el) {
  const out = [];
  [...el.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      [...n.textContent].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.style.display = 'inline-block'; s.textContent = ch === ' ' ? ' ' : ch; frag.appendChild(s); out.push(s); });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') out.push(...splitChars(n));
  });
  return out;
}

// ---------- capa 3D ----------
const heroCanvas = $('#heroCanvas');
let hero = null;
import('./hero3d.js').then(({ initHero }) => {
  try { hero = initHero(heroCanvas, { reduced }); } catch (err) { console.warn('WebGL indisponível', err); heroCanvas.hidden = true; }
});
if (!reduced) {
  const chars = splitChars($('.hero-title'));
  gsap.from(chars, { yPercent: 110, rotate: 8, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .035, delay: .2 });
  gsap.from('.hero-kicker, .hero-sub, .hero-actions, .hero-foot', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .7 });
  gsap.to('.hero-in', { yPercent: -25, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}
ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: s => hero?.setScroll(s.progress) });

// ---------- revelações genéricas ----------
if (!reduced) {
  $$('.h2, .lead, section .kicker:not(.hero-kicker)').forEach(el => {
    if (el.closest('.build') || el.closest('.colors-head')) return;
    gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  $$('[data-words]').forEach(el => {
    const w = splitWords(el);
    gsap.fromTo(w, { opacity: .12 }, { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });
  gsap.from('.value', { y: 80, opacity: 0, rotateX: -20, duration: 1.2, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.values', start: 'top 85%' } });
}
$$('.tilt').forEach(el => tilt(el));

// ---------- construção da marca ----------
(function build() {
  const host = $('#buildLogo'), stage = $('#buildStage');
  const svg = logoSVG({ label: 'Logo AnMar Lovers sendo construído' });
  host.appendChild(svg);
  const NS = 'http://www.w3.org/2000/svg';
  const g = svg.querySelector('g');
  const parts = $$('g.part', svg);
  const symG = parts[0], sym = $('path', symG);
  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = `<linearGradient id="rise" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor"/><stop offset="0" stop-color="currentColor" stop-opacity="0"/></linearGradient>`;
  svg.prepend(defs);
  const stops = $$('stop', defs);
  sym.setAttribute('fill', 'url(#rise)');
  sym.setAttribute('stroke', 'currentColor'); sym.setAttribute('stroke-width', '2.5');
  const len = sym.getTotalLength();
  const lovers = PART.lovers.map(i => parts[i]), anmar = PART.anmar.map(i => parts[i]), store = PART.lovestore.map(i => parts[i]);

  // guias de construção (coordenadas do desenho final, 1210 × 505)
  const guides = document.createElementNS(NS, 'g'); guides.setAttribute('class', 'guides');
  guides.innerHTML = `
    <line class="guide" x1="-20" x2="1230" y1="377" y2="377"/><text class="guide-t" x="1230" y="370" text-anchor="end">linha de base</text>
    <line class="guide" x1="-20" x2="1230" y1="141" y2="141"/><text class="guide-t" x="1230" y="134" text-anchor="end">altura das maiúsculas</text>
    <line class="guide" x1="-20" x2="1230" y1="24" y2="24"/><line class="guide" x1="-20" x2="1230" y1="72" y2="72"/>
    <line class="guide" x1="-20" x2="1230" y1="451" y2="451"/><line class="guide" x1="-20" x2="1230" y1="494" y2="494"/>
    <rect class="guide guide-box" x="170" y="17" width="225" height="384"/><text class="guide-t" x="282" y="-6" text-anchor="middle">símbolo 225 × 385</text>
    <line class="guide" x1="12" x2="12" y1="-10" y2="515"/><line class="guide" x1="1198" x2="1198" y1="-10" y2="515"/>
    <text class="guide-t" x="605" y="535" text-anchor="middle">1210 × 505</text>`;
  svg.appendChild(guides);

  const steps = $$('#buildSteps li');
  const setStep = i => steps.forEach((s, j) => s.classList.toggle('on', j === i));

  stage.addEventListener('pointermove', e => { const b = stage.getBoundingClientRect(); stage.style.setProperty('--lx', (e.clientX - b.left) / b.width * 100 + '%'); stage.style.setProperty('--ly', (e.clientY - b.top) / b.height * 100 + '%'); });

  if (reduced) { // estado final, sem animação
    sym.setAttribute('stroke-width', '0'); stops.forEach(s => s.setAttribute('offset', '1'));
    guides.style.opacity = .6; steps.forEach(s => s.classList.add('on')); return;
  }

  gsap.set(sym, { attr: { 'stroke-dasharray': len, 'stroke-dashoffset': len } });
  gsap.set(symG, { x: 322, y: 45, scale: 1.25, transformOrigin: '50% 50%' });
  gsap.set(lovers, { opacity: 0, y: 80 });
  gsap.set([...anmar, ...store], { opacity: 0 });
  gsap.set(anmar, { x: i => (i - 2) * 60 });
  gsap.set(store, { x: i => (i - 4) * 50 });
  gsap.set(guides, { opacity: 0 });
  gsap.set(stage, { backgroundColor: C.nude }); gsap.set(host, { color: C.cereja });

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: {
    trigger: '.build-pin', pin: true, start: 'top top', end: '+=520%', scrub: 1,
    onUpdate: s => { setStep(Math.min(5, Math.floor(s.progress * 6))); $('#buildBar').style.transform = `scaleX(${s.progress})`; }
  }});
  tl.to(sym, { attr: { 'stroke-dashoffset': 0 }, duration: 1 })
    .to(stops, { attr: { offset: 1 }, duration: 1, stagger: .15 })
    .to(sym, { attr: { 'stroke-width': 0 }, duration: .3 }, '<.6')
    .to(symG, { x: 0, y: 0, scale: 1, duration: 1 })
    .to(lovers, { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'expo.out' }, '<.25')
    .to([...anmar, ...store], { opacity: 1, x: 0, duration: 1, stagger: .03, ease: 'expo.out' })
    .to(guides, { opacity: 1, duration: .6 })
    .from($$('.guide', guides), { attr: { 'stroke-dashoffset': 400 }, duration: .6 }, '<')
    .to({}, { duration: .3 })
    .to(guides, { opacity: 0, duration: .4 })
    .to(stage, { backgroundColor: C.cereja, duration: .35 }).to(host, { color: C.offwhite, duration: .35 }, '<')
    .to(stage, { backgroundColor: C.chocolate, duration: .35 }, '+=.15').to(host, { color: C.rosa, duration: .35 }, '<')
    .to(stage, { backgroundColor: C.offwhite, duration: .35 }, '+=.15').to(host, { color: C.cereja, duration: .35 }, '<')
    .to({}, { duration: .2 });
})();

// ---------- cores ----------
(function colors() {
  const LIST = [
    ['Cereja', '#880D1B', 'Paixão e vida', C.offwhite, 'Assinatura da marca'],
    ['Nude', '#EAD7CF', 'Acolhimento e intimidade', C.cereja, 'Respiro e embalagens'],
    ['Chocolate', '#2A1A17', 'Elegância e confiança', C.rosa, 'Apoio e eventos'],
    ['Preto', '#000000', 'Sofisticação e discrição', C.offwhite, 'Uniformes e apoio'],
    ['Rosa suave', '#F4B5BE', 'Sensualidade e delicadeza', C.chocolate, 'Detalhes e destaques'],
    ['Off-white', '#F7F4EF', 'Leveza e equilíbrio', C.cereja, 'Fundos e textos longos']
  ];
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const cmyk = h => { const [r, g, b] = rgb(h).map(v => v / 255), k = 1 - Math.max(r, g, b); return k === 1 ? [0, 0, 0, 100] : [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map(v => Math.round(v * 100)); };
  const track = $('#colorsTrack');
  LIST.forEach(([n, hex, mean, fg, use], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'swatch';
    b.style.setProperty('--sw', hex); b.style.setProperty('--sw-fg', fg);
    b.setAttribute('aria-label', `Copiar ${n} ${hex}`);
    b.innerHTML = `<span class="swatch-top"><span>0${i + 1}</span><span>${use}</span></span>
      <span><span class="swatch-name">${n}</span><span class="swatch-mean" style="display:block">${mean}</span>
      <dl><dt>HEX</dt><dd>${hex}</dd><dt>RGB</dt><dd>${rgb(hex).join(' ')}</dd><dt>CMYK</dt><dd>${cmyk(hex).join(' ')}</dd></dl></span>
      <span class="copied">Copiado</span>`;
    b.prepend(symbolSVG({ cls: 'swatch-sym' }));
    b.addEventListener('click', () => {
      const done = () => { b.classList.add('done'); setTimeout(() => b.classList.remove('done'), 1100); };
      try { navigator.clipboard.writeText(hex).then(done, () => toast(hex)); } catch { toast(hex); }
    });
    track.appendChild(b);
  });
  const mm = gsap.matchMedia();
  mm.add('(min-width: 760px) and (prefers-reduced-motion: no-preference)', () => {
    const dist = () => track.scrollWidth - innerWidth + 48;
    const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.colors-pin', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true } });
    $$('.swatch-sym', track).forEach(s => gsap.fromTo(s, { xPercent: 30, rotate: -12 }, { xPercent: -30, rotate: 12, ease: 'none', scrollTrigger: { trigger: s.parentElement, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
    gsap.from('.colors-head > *', { y: 40, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.colors', start: 'top 70%' } });
  });
})();

// ---------- tipografia ----------
(function type() {
  const k = $('#kinetic'); const letters = splitChars(k);
  if (!reduced) {
    gsap.from(letters, { yPercent: 100, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: k, start: 'top 85%' } });
    if (fine) {
      const sec = $('#tipografia');
      sec.addEventListener('pointermove', e => {
        letters.forEach(l => {
          const b = l.getBoundingClientRect(); const d = Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2));
          const f = Math.max(0, 1 - d / 420);
          gsap.to(l, { scaleY: 1 + f * .35, skewX: -f * 12, color: f > .55 ? '#2A1A17' : '#880D1B', duration: .5, ease: 'power3.out' });
        });
      });
      sec.addEventListener('pointerleave', () => gsap.to(letters, { scaleY: 1, skewX: 0, color: '#880D1B', duration: .8 }));
    }
  }
  const big = $('#glyphBig'), name = $('#glyphName');
  $$('[data-glyphs]').forEach(box => {
    const serif = box.classList.contains('serif');
    [...box.dataset.glyphs].forEach(ch => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = ch;
      const show = () => { big.textContent = ch; big.className = serif ? 'serif' : 'sans'; name.textContent = `${serif ? 'Playfair Display' : 'Montserrat'} · ${ch}`; if (!reduced) gsap.fromTo(big, { scale: .7, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)' }); };
      b.addEventListener('pointerenter', show); b.addEventListener('focus', show); b.addEventListener('click', show);
      box.appendChild(b);
    });
  });
  const tin = $('#typeIn'), tout = $('#typeOut'), size = $('#sizeIn'); let f = 'serif';
  const render = () => { tout.textContent = tin.value || 'Intimidade que fortalece'; tout.className = 'tester-out ' + (f === 'sans' ? 'sans' : 'serif'); tout.style.fontStyle = f === 'serif-i' ? 'italic' : 'normal'; tout.style.fontWeight = f === 'sans' ? 300 : 400; tout.style.fontSize = size.value + 'px'; };
  tin.addEventListener('input', render); size.addEventListener('input', render);
  $('#fontSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; f = b.dataset.f; $$('#fontSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(); });
  render();
})();

// ---------- pattern com profundidade ----------
(function pattern() {
  const PATS = [
    ['Cereja', C.cereja, '#A3283A', '#C2414F'],
    ['Nude', C.nude, '#D9BBAE', C.cereja],
    ['Chocolate', C.chocolate, '#3F2723', C.rosa],
    ['Off-white', C.offwhite, C.rosa, C.cereja]
  ];
  const sec = $('#pattern'), far = $('.pl-far'), mid = $('.pl-mid'), near = $('.pl-near');
  const url = (fg, cell) => `url(${patternCanvas(fg, null, cell, 4, 4).toDataURL()})`;
  function apply(i) {
    const [, bg, soft, strong] = PATS[i];
    sec.style.background = bg;
    far.style.backgroundImage = url(soft, 70); far.style.backgroundSize = '280px auto';
    mid.style.backgroundImage = url(strong, 120); mid.style.backgroundSize = '480px auto'; mid.style.opacity = i === 3 ? .5 : .35;
    near.style.backgroundImage = url(strong, 220); near.style.backgroundSize = '880px auto';
    sec.style.color = i === 1 || i === 3 ? C.chocolate : C.offwhite;
    $('.pattern .lead').style.color = i === 1 || i === 3 ? '#4A332D' : '';
    $('.pattern .kicker').style.color = i === 1 || i === 3 ? C.cereja : '';
    sec.classList.toggle('light', i === 1 || i === 3);
  }
  const chips = $('#patChips');
  PATS.forEach(([n, bg, , fg], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', String(i === 0));
    b.innerHTML = `<span class="dot" style="background:linear-gradient(135deg, ${bg} 50%, ${fg} 50%)"></span>${n}`;
    b.addEventListener('click', () => { $$('button', chips).forEach(x => x.setAttribute('aria-pressed', String(x === b))); apply(i); });
    chips.appendChild(b);
  });
  apply(0);
  if (!reduced) {
    [[far, -8], [mid, -18], [near, -40]].forEach(([el, y]) => gsap.fromTo(el, { yPercent: -y / 2 }, { yPercent: y / 2, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } }));
    if (fine) sec.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      gsap.to(far, { x: x * -15, duration: 1 }); gsap.to(mid, { x: x * -40, y: y * -20, duration: 1 }); gsap.to(near, { x: x * -110, y: y * -60, duration: 1 });
    });
  }
})();

// ---------- ícones ----------
(function icons() {
  const LIST = [['bem-estar', 'Bem-estar', 'Equilíbrio'], ['casal', 'Relacionamento', 'A dois'], ['cuidados', 'Cuidado', 'Autocuidado'], ['desejo', 'Desejo', 'Paixão'], ['dicas', 'Dicas', 'Descoberta'],
    ['experiencia', 'Experiência', 'Mais que o óbvio'], ['intimidade', 'Intimidade', 'Liberdade'], ['presentes', 'Presente', 'Momentos especiais'], ['privacidade', 'Privacidade', 'Discrição'], ['sensualidade', 'Sensualidade', 'Expressão']];
  const grid = $('#iconGrid');
  LIST.forEach(([id, n, m]) => {
    const a = document.createElement('article'); a.className = 'icon-card tilt'; a.tabIndex = 0;
    a.innerHTML = `${iconSVG(id)}<strong>${n}</strong><span>${m}</span>`;
    a.addEventListener('pointerenter', () => { if (!reduced) gsap.fromTo($('path', a), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }); });
    grid.appendChild(a); tilt(a, 12);
  });
  $('#cats').innerHTML = [['desejo', 'Vibradores'], ['sensualidade', 'Lingeries'], ['cuidados', 'Lubrificantes'], ['presentes', 'Presentes']].map(([i, n]) => `<div class="cat">${iconSVG(i, 3.5)}<span>${n}</span></div>`).join('');
  if (!reduced) {
    const paths = $$('#iconGrid path');
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    ScrollTrigger.create({ trigger: grid, start: 'top 80%', once: true, onEnter: () => gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: .08 }) });
    gsap.from('.icon-card', { y: 60, opacity: 0, rotateX: -25, duration: 1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: grid, start: 'top 85%' } });
    gsap.from('.cat', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '#cats', start: 'top 90%' } });
  }
})();

// ---------- estúdio 3D ----------
(async function studio() {
  const canvas = $('#studioCanvas');
  await document.fonts.ready; // as texturas usam Montserrat e Playfair
  let st;
  try {
    const { initStudio } = await import('./studio3d.js');
    st = initStudio(canvas, { title: $('#stTitle'), size: $('#stSize'), note: $('#stNote') }, { reduced });
  } catch (err) { console.warn('Estúdio 3D indisponível', err); $('.studio-hint').textContent = 'O 3D não abriu neste navegador.'; return; }
  $('#objTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#objTabs button').forEach(x => x.setAttribute('aria-selected', String(x === b))); st.setObject(b.dataset.obj); });
  $('#cwTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#cwTabs button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); st.setColorway(b.dataset.cw); });
  if (!reduced) gsap.from('.studio-view', { scale: .9, opacity: 0, y: 60, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.studio-view', start: 'top 85%' } });
})();

// ---------- mockups fotográficos do kit (aparecem quando os arquivos estão em assets/mockups) ----------
(async function shots() {
  const LIST = [
    ['papelaria-e-embalagens', 'Papelaria e embalagens'], ['uniformes-polo-avental', 'Uniformes: polo e avental'],
    ['EXEMPLOS DE EMBALAGENS', 'Exemplos de embalagens'], ['V1 - Vermelha', 'Camiseta vermelha'], ['V2 - Branca e Vermelha', 'Camiseta branca e vermelha'], ['V3 - Preta', 'Camiseta preta'],
    ['AnMar-Lovers-ativacao-01-vista-geral', 'Ativação: vista geral'], ['AnMar-Lovers-ativacao-02-perspectiva', 'Ativação: perspectiva'],
    ['AnMar-Lovers-ativacao-03-experimentacao', 'Ativação: experimentação'], ['AnMar-Lovers-ativacao-04-roleta', 'Ativação: roleta'],
    ['modelos-posts', 'Modelos de posts'], ['modelos-stories', 'Modelos de stories'], ['Catalogo-molduras', 'Molduras para stories'],
    ['01', 'Brandbook: capa'], ['CORES', 'Brandbook: cores'], ['TIPOGRAFIA', 'Brandbook: tipografia'], ['PATTERN', 'Brandbook: pattern'], ['ICONOGRAFIA', 'Brandbook: iconografia'], ['DESTAQUES', 'Brandbook: destaques']
  ];
  // assets/mockups/lista.json traz os nomes dos arquivos já otimizados que estão na pasta
  let files = [];
  try { const r = await fetch('assets/mockups/lista.json'); if (r.ok) files = await r.json(); } catch {}
  const have = new Map(files.map(f => [f.replace(/\.[a-z0-9]+$/i, ''), f]));
  const found = LIST.filter(([n]) => have.has(n)).map(([n, t]) => [`assets/mockups/${encodeURIComponent(have.get(n))}`, t]);
  if (!found.length) return;
  const sec = $('#mockups'), track = $('#shotsTrack'); sec.hidden = false;
  found.forEach(([u, t]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'shot';
    b.innerHTML = `<div class="shot-frame"><img src="${u}" alt="${t}" loading="lazy"></div><p>${t}</p>`;
    b.addEventListener('click', () => { $('#lbImg').src = u; $('#lbImg').alt = t; $('#lbCap').textContent = t; $('#lightbox').hidden = false; });
    track.appendChild(b);
  });
  $('#lbClose').addEventListener('click', () => $('#lightbox').hidden = true);
  $('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') $('#lightbox').hidden = true; });
  ScrollTrigger.refresh();
})();

// ---------- instagram ----------
(function insta() {
  const HL = [['presentes', 'Presentes', 'Para momentos especiais'], ['cuidados', 'Cuidados', 'Conservação e uso'], ['desejo', 'Desejo', 'Paixão e descoberta'], ['bem-estar', 'Bem-estar', 'Equilíbrio a dois'],
    ['dicas', 'Dicas', 'Informação verificada'], ['casal', 'Casal', 'Tempo a dois'], ['experiencia', 'Coleções', 'Lançamentos e linhas'], ['privacidade', 'Privacidade', 'Compra e entrega discretas']];
  const hl = $('#igHl');
  HL.forEach(([id, n], i) => {
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = `<span class="ring"><i>${iconSVG(id, 4)}</i></span>${n}`;
    b.addEventListener('click', () => {
      const holder = $('#storyIcon'); holder.innerHTML = `<g transform="translate(5,5) scale(.9)"><path d="${ICON[id]}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      $('#storyTitle').textContent = n; $('#storyText').textContent = HL[i][2];
      const s = $('#story'); s.hidden = false;
      const bar = $('.story-prog i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      if (!reduced) gsap.from('.story-body > *', { y: 30, opacity: 0, stagger: .08, duration: .7, ease: 'expo.out' });
    });
    hl.appendChild(b);
  });
  $('#storyClose').addEventListener('click', () => $('#story').hidden = true);
  const tiles = [[C.cereja, C.offwhite], [C.nude, C.cereja], [C.chocolate, C.rosa], [C.offwhite, C.cereja], [C.rosa, C.chocolate], [C.cereja, '#A3283A'], [C.nude, '#D9BBAE'], [C.chocolate, '#3F2723'], [C.cereja, C.rosa]];
  $('#igGrid').innerHTML = tiles.map(([bg, fg], i) => `<div style="background:${bg} url(${patternCanvas(fg, null, i % 3 ? 60 : 110, 2, 2).toDataURL()}) center/${i % 3 ? 50 : 100}% auto"></div>`).join('');
  const phone = $('#phone');
  if (!reduced) {
    gsap.from(phone, { y: 120, rotateX: 25, rotateY: -20, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: phone, start: 'top 90%' } });
    if (fine) {
      const wrap = $('#instagram');
      wrap.addEventListener('pointermove', e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; gsap.to(phone, { rotateY: x * 22, rotateX: -y * 14, duration: .8, ease: 'power3.out' }); });
      wrap.addEventListener('pointerleave', () => gsap.to(phone, { rotateX: 0, rotateY: 0, duration: 1 }));
    }
  }
})();

// ---------- voz ----------
$$('.flip').forEach(f => f.addEventListener('click', () => f.classList.toggle('on')));
if (!reduced) gsap.from('.flip', { y: 70, opacity: 0, rotateY: -30, duration: 1.2, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.flips', start: 'top 85%' } });

// ---------- semana ----------
(function week() {
  const W = [['Seg', 'Pergunta', 'Pergunta de conexão', 'Uma pergunta leve sobre tempo a dois ou pequenos gestos. Moldura 08 com enquete.'],
    ['Ter', 'Detalhe', 'Detalhe de produto', 'Textura, material ou embalagem nas mãos, com uma característica confirmada. Moldura 06.'],
    ['Qua', 'Bastidor', 'Bastidor', 'Preparação de um pedido, papel de seda e fita, sem dados de cliente. Molduras 01–03.'],
    ['Qui', 'Dica', 'Dica de cuidado verificada', 'Conservação e uso com base nas informações do fabricante.'],
    ['Sex', 'Convite', 'Convite ou oferta real', 'Condição, prazo e estoque confirmados antes de publicar.'],
    ['Sáb', 'Evento', 'Experiência, atendimento ou evento', 'Estande, atendimento e depoimentos autorizados.'],
    ['Dom', 'Pausa', 'Pausa ou conteúdo leve', 'Uma frase da marca, ou nenhum post. Frequência não é obrigação.']];
  const today = (new Date().getDay() + 6) % 7, box = $('#week'), det = $('#weekDetail');
  const show = i => { det.innerHTML = `<p class="kicker">${W[i][0]}${i === today ? ' · hoje' : ''}</p><h3>${W[i][2]}</h3><p>${W[i][3]}</p>`; if (!reduced) gsap.from(det.children, { y: 16, opacity: 0, stagger: .06, duration: .6, ease: 'expo.out' }); };
  W.forEach(([d, s], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === today));
    b.innerHTML = `<span>${d}</span><b>${s}</b>`;
    b.addEventListener('click', () => { $$('button', box).forEach(x => x.setAttribute('aria-pressed', String(x === b))); show(i); });
    box.appendChild(b);
  });
  show(today);
})();

// ---------- peças ----------
(function pieces() {
  const OK = ['ok', 'Pronto'], ED = ['edit', 'Modelo editável'], VAL = ['warn', 'Validar antes'];
  const CAT = [
    ['Cartão institucional', 'Papelaria', '90 × 50 mm', OK], ['Papel timbrado', 'Papelaria', 'A4 · 210 × 297 mm', OK], ['Carta de agradecimento', 'Papelaria', '100 × 150 mm', OK],
    ['Cartão-presente', 'Papelaria', '85 × 55 mm', OK], ['Voucher preenchível', 'Papelaria', '100 × 50 mm', ['edit', 'Preencher benefício']], ['Envelope DL, frente', 'Papelaria', '220 × 110 mm', ['warn', 'Envelope pronto, sem faca']],
    ['Tag', 'Embalagens', '50 × 90 mm', OK], ['Adesivo redondo', 'Embalagens', 'Ø 50 mm', OK], ['Papel de seda', 'Embalagens', '500 × 700 mm', OK], ['Fita personalizada', 'Embalagens', '300 × 25 mm (repeat)', OK],
    ['Sacola', 'Embalagens', '240 × 320 × 100 mm', ['warn', 'Painel; adaptar à faca']], ['Caixa', 'Embalagens', '200 × 150 × 80 mm', ['warn', 'Painel; adaptar à faca']],
    ['Camisa, peito', 'Uniformes', '90 mm de largura', OK], ['Camisa, costas', 'Uniformes', '240 mm de largura', OK], ['Avental, frente', 'Uniformes', '180 mm de largura', OK],
    ['Placa “Experimente”', 'Eventos', 'A5 · 148 × 210 mm', OK], ['Cartão amostra', 'Eventos', '50 × 90 mm', OK], ['Banner', 'Eventos', '800 × 2000 mm', ['warn', 'Conferir ferragem']], ['Roleta', 'Eventos', 'Ø 650 mm', VAL],
    ['Foto de perfil', 'Digital', '1080 × 1080 px', OK], ['Destaques (8)', 'Digital', '1080 × 1920 px', OK], ['Posts (8)', 'Digital', '1080 × 1350 px', ED], ['Stories (6)', 'Digital', '1080 × 1920 px', ED], ['Molduras (8)', 'Digital', '1080 × 1920 px', OK]
  ];
  const G = ['Todas', ...new Set(CAT.map(c => c[1]))];
  let cur = store.get('al-grp', 'Todas'); if (!G.includes(cur)) cur = 'Todas';
  const chips = $('#catChips'), list = $('#pieceList');
  function render(anim) {
    const rows = CAT.filter(c => cur === 'Todas' || c[1] === cur);
    list.innerHTML = rows.map(([n, g, s, [k, l]]) => `<li class="piece"><span class="piece-n">${n}</span><span class="piece-g">${g}</span><span class="piece-s">${s}</span><span class="pill ${k}">${l}</span></li>`).join('');
    if (anim && !reduced) gsap.from('.piece', { x: -30, opacity: 0, stagger: .03, duration: .6, ease: 'expo.out' });
    ScrollTrigger.refresh();
  }
  G.forEach(g => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = g; b.setAttribute('aria-pressed', String(g === cur));
    b.addEventListener('click', () => { cur = g; store.set('al-grp', g); $$('button', chips).forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(true); });
    chips.appendChild(b);
  });
  render(false);
})();

// ---------- rodapé ----------
(function footer() {
  const svg = logoSVG({ label: 'AnMar Lovers' }); $('#footerLogo').appendChild(svg);
  if (reduced) return;
  const parts = $$('g.part', svg);
  gsap.from(parts, { opacity: 0, y: 60, duration: 1.2, ease: 'expo.out', stagger: { each: .03, from: 'center' }, scrollTrigger: { trigger: '.footer', start: 'top 75%' } });
})();

addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
