// Desenho da marca em canvas e SVG a partir dos vetores oficiais.
import { LOGO_PARTS, LOGO_W, LOGO_H, LOGO_OFFSET, SYMBOL, SYMBOL_W, SYMBOL_H, SYMBOL_OFFSET } from './brand-data.js';

export const C = {
  cereja: '#880D1B', nude: '#EAD7CF', chocolate: '#2A1A17', preto: '#000000', rosa: '#F4B5BE', offwhite: '#F7F4EF'
};

// Índices das partes do logo (ordem do arquivo oficial)
export const PART = {
  symbol: [0],
  lovers: [1, 2, 5, 4, 3],          // L V E R S (o “O” é o símbolo)
  anmar: [18, 16, 15, 19, 17],      // A N M A R
  lovestore: [6, 7, 8, 9, 10, 11, 12, 13, 14]
};

const cache = new Map();
const path2d = d => { if (!cache.has(d)) cache.set(d, new Path2D(d)); return cache.get(d); };

function fillParts(ctx, parts) {
  for (const p of parts) {
    ctx.save();
    ctx.transform(...p.m);
    ctx.fill(path2d(p.d));
    ctx.restore();
  }
}

// Logo completo, com largura w, canto superior esquerdo em (x, y)
export function drawLogo(ctx, x, y, w, color) {
  const s = w / LOGO_W;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s); ctx.translate(...LOGO_OFFSET);
  ctx.fillStyle = color;
  fillParts(ctx, LOGO_PARTS);
  ctx.restore();
  return { w, h: LOGO_H * s };
}

// Símbolo com altura h, centrado em (cx, cy)
export function drawSymbol(ctx, cx, cy, h, color) {
  const s = h / SYMBOL_H;
  ctx.save();
  ctx.translate(cx - SYMBOL_W * s / 2, cy - h / 2); ctx.scale(s, s); ctx.translate(...SYMBOL_OFFSET);
  ctx.fillStyle = color;
  fillParts(ctx, [SYMBOL]);
  ctx.restore();
}

// Pattern oficial: símbolo em fileiras alternadas
export function patternCanvas(fg, bg, cell = 120, cols = 4, rows = 4) {
  const cv = document.createElement('canvas');
  cv.width = cell * cols; cv.height = cell * rows * 1.25;
  const ctx = cv.getContext('2d');
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height); }
  const rh = cell * 1.25, sh = cell * .62;
  for (let r = -1; r <= rows; r++) for (let c = -1; c <= cols; c++) {
    const off = (r % 2 ? cell / 2 : 0);
    drawSymbol(ctx, c * cell + cell / 2 + off, r * rh + rh / 2, sh, fg);
  }
  return cv;
}

// SVG em DOM com cada parte separada (para animação)
export function logoSVG({ color = 'currentColor', cls = '', label = 'AnMar Lovers' } = {}) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${LOGO_W} ${LOGO_H}`);
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label);
  if (cls) svg.setAttribute('class', cls);
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', `translate(${LOGO_OFFSET.join(',')})`);
  g.setAttribute('fill', color);
  LOGO_PARTS.forEach((p, i) => {
    // cada parte fica num <g> próprio: as animações movem o <g> e preservam a matriz original do caminho
    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'part'); wrap.dataset.part = i;
    const el = document.createElementNS(NS, 'path');
    el.setAttribute('transform', `matrix(${p.m.join(',')})`);
    el.setAttribute('d', p.d);
    wrap.appendChild(el); g.appendChild(wrap);
  });
  svg.appendChild(g);
  return svg;
}

export function symbolSVG({ color = 'currentColor', cls = '' } = {}) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${SYMBOL_W} ${SYMBOL_H}`);
  svg.setAttribute('aria-hidden', 'true');
  if (cls) svg.setAttribute('class', cls);
  svg.innerHTML = `<g transform="translate(${SYMBOL_OFFSET.join(',')})" fill="${color}"><path transform="matrix(${SYMBOL.m.join(',')})" d="${SYMBOL.d}"/></g>`;
  return svg;
}

export { LOGO_PARTS, SYMBOL, LOGO_W, LOGO_H, SYMBOL_W, SYMBOL_H };
