// Estúdio 3D: mockups da marca refeitos em 3D a partir das artes do kit (medidas reais, escala 1 unidade = 100 mm).
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { drawLogo, drawSymbol, patternCanvas, C } from './brand.js';
import { symbolGeometry, MATERIALS } from './hero3d.js';

const CW = {
  cereja:    { base: C.cereja,    ink: C.offwhite, pat: '#9E2131', inner: C.nude,   string: C.offwhite },
  nude:      { base: C.nude,      ink: C.cereja,   pat: '#DDBFB3', inner: C.cereja, string: C.cereja },
  chocolate: { base: C.chocolate, ink: C.rosa,     pat: '#3A2521', inner: C.rosa,   string: C.rosa }
};

function tex(canvas, repeat) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
function canvasOf(w, h, bg) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  return [c, g];
}
function spaced(g, text, x, y, size, color, track = .32, weight = 500) {
  g.font = `${weight} ${size}px Montserrat, sans-serif`; g.fillStyle = color; g.textBaseline = 'middle';
  const chars = [...text]; const widths = chars.map(ch => g.measureText(ch).width + size * track);
  let cx = x - widths.reduce((a, b) => a + b, 0) / 2 + size * track / 2;
  chars.forEach((ch, i) => { g.fillText(ch, cx, y); cx += widths[i]; });
}

// --- texturas a partir das artes ---
function labelTex(cw, w, h, { logo = .62, tagline = '', taglineSize = .035, symbol = false } = {}) {
  const [c, g] = canvasOf(w, h, cw.base);
  if (symbol) {
    drawSymbol(g, w / 2, h * .42, h * .42, cw.ink);
    drawLogo(g, w * .2, h * .74, w * .6, cw.ink);
  } else {
    const lw = w * logo, lh = lw * 505 / 1210;
    drawLogo(g, (w - lw) / 2, h / 2 - lh / 2 - (tagline ? h * .06 : 0), lw, cw.ink);
    if (tagline) spaced(g, tagline, w / 2, h / 2 + lh / 2 + h * .04, h * taglineSize, cw.ink);
  }
  return tex(c);
}
const patTex = (cw, rep = [2, 2], bg) => tex(patternCanvas(cw.pat, bg || cw.base, 110), rep);
const plain = color => new THREE.MeshStandardMaterial({ color, roughness: .78 });
const paper = (map, rough = .7) => new THREE.MeshStandardMaterial({ map, roughness: rough });

function stickerTex(cw) {
  const S = 1024; const [c, g] = canvasOf(S, S, cw.base);
  drawSymbol(g, S / 2, S / 2, S * .42, cw.ink);
  g.save(); g.translate(S / 2, S / 2);
  const txt = 'INTIMIDADE QUE FORTALECE · AMOR EM CADA DETALHE · ';
  g.font = `500 ${S * .045}px Montserrat, sans-serif`; g.fillStyle = cw.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  const step = Math.PI * 2 / txt.length;
  [...txt].forEach((ch, i) => { g.save(); g.rotate(i * step); g.translate(0, -S * .4); g.fillText(ch, 0, 0); g.restore(); });
  g.restore();
  g.strokeStyle = cw.ink; g.globalAlpha = .5; g.lineWidth = 3; g.beginPath(); g.arc(S / 2, S / 2, S * .45, 0, Math.PI * 2); g.stroke();
  return tex(c);
}
function cardBackTex(cw) {
  const [c, g] = canvasOf(1800, 1000, cw.ink === C.offwhite ? C.nude : cw.base);
  const ink = cw.ink === C.offwhite ? C.cereja : cw.ink;
  drawSymbol(g, 260, 500, 420, ink);
  g.font = 'italic 400 92px "Playfair Display", serif'; g.fillStyle = ink; g.textBaseline = 'middle';
  g.fillText('Amor em cada detalhe.', 520, 420);
  spaced(g, 'INSTAGRAM.COM/ANMAR.LOVERS', 1000, 600, 40, ink, .25);
  return tex(c);
}

// --- objetos ---
function makeBox(cw) {
  const g = new THREE.Group();
  const sideMat = paper(patTex(cw, [2, 1]));
  const base = new THREE.Mesh(new THREE.BoxGeometry(2, .8, 1.5), [sideMat, sideMat, plain(cw.inner), plain(cw.base), sideMat, sideMat]);
  base.position.y = .4; base.castShadow = true; g.add(base);
  // papel de seda aparecendo dentro
  const tissue = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.4, 30, 20), new THREE.MeshStandardMaterial({ map: patTex(CW.nude, [3, 2], C.offwhite), roughness: .95, side: THREE.DoubleSide }));
  tissue.rotation.x = -Math.PI / 2; tissue.position.y = .805;
  const tp = tissue.geometry.attributes.position;
  for (let i = 0; i < tp.count; i++) tp.setZ(i, Math.sin(tp.getX(i) * 7) * .02 + Math.cos(tp.getY(i) * 9) * .015);
  tissue.geometry.computeVertexNormals(); g.add(tissue);
  // tampa com dobradiça na aresta de trás
  const hinge = new THREE.Group(); hinge.position.set(0, .8, -.78); g.add(hinge);
  const top = paper(labelTex(cw, 1400, 1050, { logo: .55, tagline: 'INTIMIDADE QUE FORTALECE', taglineSize: .03 }), .55);
  const rim = plain(cw.base);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.06, .22, 1.56), [rim, rim, top, rim, rim, rim]);
  lid.position.set(0, .05, .78); lid.castShadow = true; hinge.add(lid);
  g.userData = { frame: [6.3, .7], title: 'Caixa', size: '200 × 150 × 80 mm', note: 'Painel da tampa com logo e assinatura. Clique para abrir.', action: open => { hinge.userData.target = open ? -1.95 : 0; } };
  g.userData.tick = () => { hinge.rotation.x += ((hinge.userData.target || 0) - hinge.rotation.x) * .08; };
  g.position.y = 0; return g;
}

function makeBag(cw) {
  const g = new THREE.Group();
  const front = paper(labelTex(cw, 1200, 1600, { logo: .7, tagline: 'MAIS QUE PRAZER, UMA ESCOLHA DIÁRIA', taglineSize: .017 }), .6);
  const side = paper(patTex(cw, [1, 3]));
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 1), [side, side, hidden, plain(cw.base), front, front]);
  body.position.y = 1.6; body.castShadow = true; g.add(body);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(2.38, 3.18, .98), new THREE.MeshStandardMaterial({ color: cw.inner, roughness: .9, side: THREE.BackSide }));
  inner.position.y = 1.61; g.add(inner);
  const rope = new THREE.MeshStandardMaterial({ color: cw.string, roughness: .6 });
  [-.5, .5].forEach(z => {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.55, 3.15, z), new THREE.Vector3(-.45, 3.85, z), new THREE.Vector3(.45, 3.85, z), new THREE.Vector3(.55, 3.15, z)]);
    const h = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .035, 10), rope); h.castShadow = true; g.add(h);
  });
  g.scale.setScalar(.72);
  g.userData = { frame: [7.2, 1.35], title: 'Sacola', size: '240 × 320 × 100 mm', note: 'Frente com logo e assinatura; laterais com o pattern.' };
  return g;
}

function makeCard(cw) {
  const g = new THREE.Group();
  const front = paper(labelTex(cw, 1800, 1000, { logo: .56 }), .45);
  const back = paper(cardBackTex(cw), .6);
  const edge = plain(cw.base);
  const card = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.5, .025), [edge, edge, edge, edge, front, back]);
  card.castShadow = true; card.position.y = 1.15; g.add(card);
  const pivot = { target: 0 };
  g.userData = { frame: [5.2, 1.15], title: 'Cartão institucional', size: '90 × 50 mm', note: 'Frente com logo, verso com assinatura e @anmar.lovers. Clique para virar.', action: () => { pivot.target += Math.PI; } };
  g.userData.tick = () => { card.rotation.y += (pivot.target - card.rotation.y) * .09; };
  return g;
}

function makeTag(cw) {
  const g = new THREE.Group();
  const [c, ctx] = canvasOf(1000, 1800, cw.base);
  drawSymbol(ctx, 500, 820, 640, cw.ink);
  drawLogo(ctx, 200, 1300, 600, cw.ink);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(500, 170, 46, 0, Math.PI * 2); ctx.fill();
  const front = paper(tex(c), .55);
  const back = paper(patTex(cw, [1, 2]));
  const edge = plain(cw.base);
  const tag = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.7, .03), [edge, edge, edge, edge, front, back]);
  tag.castShadow = true; tag.position.y = 1.55; g.add(tag);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.075, .018, 12, 32), new THREE.MeshStandardMaterial({ color: 0xd8c3b8, metalness: .9, roughness: .25 }));
  ring.position.set(0, 2.62, .02); g.add(ring);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 2.62, 0), new THREE.Vector3(.15, 3.1, .1), new THREE.Vector3(-.1, 3.5, -.05), new THREE.Vector3(.05, 3.9, 0)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .012, 8), new THREE.MeshStandardMaterial({ color: cw.string, roughness: .7 })));
  g.userData = { frame: [6.6, 2.1], title: 'Tag', size: '50 × 90 mm', note: 'Frente com símbolo e logo; verso com o pattern.' };
  g.userData.tick = t => { g.rotation.z = Math.sin(t * 1.3) * .04; };
  return g;
}

function makeSticker(cw) {
  const g = new THREE.Group();
  const top = paper(stickerTex(cw), .35);
  const edge = plain(cw.base);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .03, 96), [edge, top, edge]);
  st.rotation.x = Math.PI / 2; st.position.y = 1.15; st.castShadow = true; g.add(st);
  g.userData = { frame: [4.6, 1.15], title: 'Adesivo redondo', size: 'Ø 50 mm', note: 'Corte circular com símbolo e assinatura em volta.' };
  g.userData.tick = t => { st.rotation.z = t * .2; };
  return g;
}

function makeTissue(cw) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(2.5, 3.5, 70, 90);
  const base = geo.attributes.position.array.slice();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: patTex(cw, [3, 4]), roughness: .95, side: THREE.DoubleSide, transparent: true, opacity: .97 }));
  m.position.y = 1.7; m.castShadow = true; g.add(m);
  g.userData = { frame: [9, 1.7], title: 'Papel de seda', size: '500 × 700 mm', note: 'Pattern oficial em fileiras alternadas.' };
  g.userData.tick = t => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      p.setZ(i, Math.sin(x * 2.2 + t * 1.6) * .12 + Math.cos(y * 1.7 + t * 1.1) * .1 + (x * x) * .05);
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  };
  return g;
}

function makeSymbol(cw, matName) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(symbolGeometry(), MATERIALS[matName || 'cereja']());
  m.scale.setScalar(2.4); m.position.y = 1.3; m.castShadow = true; g.add(m);
  g.userData = { frame: [5.6, 1.45], title: 'Símbolo em volume', size: 'Peça conceitual', note: 'A cereja-coração extrudada do vetor oficial. Arraste para girar.' };
  g.userData.tick = t => { m.position.y = 1.3 + Math.sin(t) * .05; };
  return g;
}

const MAKERS = { caixa: makeBox, sacola: makeBag, cartao: makeCard, tag: makeTag, adesivo: makeSticker, seda: makeTissue, simbolo: makeSymbol };
const SYMBOL_MAT = { cereja: 'cereja', nude: 'veludo', chocolate: 'chocolate' };

export function initStudio(canvas, ui, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .72; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), .04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(0, 2.3, 8.4); camera.lookAt(0, 1.3, 0);

  const spot = new THREE.SpotLight(0xfff0e8, 38, 20, .5, .7, 1.4);
  spot.position.set(2.5, 7, 4); spot.target.position.set(0, 1, 0); spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048); spot.shadow.radius = 6; spot.shadow.bias = -.0004;
  scene.add(spot, spot.target);
  const rim = new THREE.PointLight(0xF4B5BE, 25, 14); rim.position.set(-4, 3, -3); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffe9e4, 0x2A1A17, .2));

  const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.ShadowMaterial({ opacity: .32 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const stage = new THREE.Group(); scene.add(stage);
  let current = null, objName = 'caixa', cwName = 'cereja', opened = false, appear = 0, narrow = false;
  const look = new THREE.Vector3(0, 1, 0);

  function build() {
    if (current) { stage.remove(current); current.traverse(o => { o.geometry?.dispose(); [].concat(o.material || []).forEach(m => { m.map?.dispose(); m.dispose(); }); }); }
    current = MAKERS[objName](CW[cwName], SYMBOL_MAT[cwName]);
    stage.add(current); opened = false; appear = 0;
    const d = current.userData;
    ui.title.textContent = d.title; ui.size.textContent = d.size; ui.note.textContent = d.note;
  }
  build();

  // arrastar para girar; clique sem arrastar aciona a peça
  let drag = false, sx = 0, lx = 0, ly = 0, rotY = -.5, rotX = 0, velY = 0, idle = 0;
  canvas.addEventListener('pointerdown', e => { drag = true; sx = lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.classList.add('grabbing'); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    velY = (e.clientX - lx) * .008; rotY += velY;
    rotX = Math.max(-.35, Math.min(.5, rotX + (e.clientY - ly) * .004));
    lx = e.clientX; ly = e.clientY; idle = 0;
  });
  const end = e => {
    if (!drag) return; drag = false; canvas.classList.remove('grabbing');
    if (Math.abs(e.clientX - sx) < 5 && current.userData.action) { opened = !opened; current.userData.action(opened); }
  };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    narrow = w < 600; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas); resize();
  let visible = false;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: '200px' }).observe(canvas);

  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!drag) { velY *= .94; rotY += velY + (reduced || ++idle < 90 ? 0 : .003); }
    stage.rotation.y = rotY; stage.rotation.x = rotX * .5;
    appear += (1 - appear) * .08;
    const s = .6 + .4 * (1 - Math.pow(1 - appear, 3));
    stage.scale.setScalar(s); stage.position.y = (1 - appear) * -.6;
    // enquadramento da câmera por peça
    const [dist, ty] = current.userData.frame || [8, 1.2], d = dist * (narrow ? 1.25 : 1);
    camera.position.x += (0 - camera.position.x) * .06;
    camera.position.y += (ty + d * .28 - camera.position.y) * .06;
    camera.position.z += (d - camera.position.z) * .06;
    look.y += (ty - look.y) * .06; camera.lookAt(look);
    current.userData.tick?.(t);
    renderer.render(scene, camera);
  })();

  return {
    setObject(n) { objName = n; build(); },
    setColorway(n) { cwName = n; build(); }
  };
}
