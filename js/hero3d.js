// Símbolo 3D da capa: cereja-coração extrudada do vetor oficial, com luz de estúdio e bokeh.
import * as THREE from 'three';
import { SVGLoader } from '../vendor/SVGLoader.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { SYMBOL } from './brand-data.js';

// Geometria extrudada do símbolo. Usa as coordenadas originais (eixo y para cima), sem a matriz de inversão.
export function symbolGeometry({ depth = 46, bevel = 10, curve = 28 } = {}) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${SYMBOL.d}"/></svg>`);
  const shapes = data.paths.flatMap(p => SVGLoader.createShapes(p));
  // ignora o fragmento minúsculo que existe no vetor
  const big = shapes.filter(s => Math.abs(THREE.ShapeUtils.area(s.getPoints(8))) > 50);
  const geo = new THREE.ExtrudeGeometry(big, {
    depth, curveSegments: curve, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * .55, bevelSegments: 8
  });
  geo.center();
  geo.computeBoundingBox();
  const h = geo.boundingBox.max.y - geo.boundingBox.min.y;
  geo.scale(1 / h, 1 / h, 1 / h); // altura 1
  geo.computeVertexNormals();
  return geo;
}

export const MATERIALS = {
  cereja: () => new THREE.MeshPhysicalMaterial({ color: 0x880D1B, roughness: .28, metalness: 0, clearcoat: 1, clearcoatRoughness: .06, sheen: .25, sheenColor: new THREE.Color(0xC23A4C), sheenRoughness: .5 }),
  veludo: () => new THREE.MeshPhysicalMaterial({ color: 0xEAD7CF, roughness: .9, sheen: 1, sheenColor: new THREE.Color(0xffffff), sheenRoughness: .5 }),
  chocolate: () => new THREE.MeshPhysicalMaterial({ color: 0x2A1A17, roughness: .35, metalness: .1, clearcoat: .8, clearcoatRoughness: .2 }),
  rosa: () => new THREE.MeshPhysicalMaterial({ color: 0xF4B5BE, roughness: .15, transmission: .55, thickness: .6, ior: 1.4, clearcoat: 1, attenuationColor: new THREE.Color(0x880D1B), attenuationDistance: .8 })
};

function bokehTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function initHero(canvas, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(0, 0, 6.2);

  // luzes: chave quente, contra-luz rosa e um ponto que segue o cursor
  const key = new THREE.DirectionalLight(0xfff1e6, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.PointLight(0xF4B5BE, 40, 12); rim.position.set(-3, 1.5, -2); scene.add(rim);
  const follow = new THREE.PointLight(0xffd9de, 18, 9); follow.position.set(0, 0, 3); scene.add(follow);
  scene.add(new THREE.AmbientLight(0x2A1A17, .6));

  const group = new THREE.Group(); scene.add(group);
  const mesh = new THREE.Mesh(symbolGeometry(), MATERIALS.cereja());
  mesh.scale.setScalar(2.35);
  group.add(mesh);

  // partículas de bokeh em três profundidades (efeito de profundidade de campo)
  const tex = bokehTexture();
  const layers = [];
  [[-6, 1.4, .55, 60], [-2.5, .7, .45, 70], [2.2, 2.6, .18, 18]].forEach(([z, size, op, n]) => {
    const g = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 14; pos[i * 3 + 1] = (Math.random() - .5) * 8; pos[i * 3 + 2] = z + (Math.random() - .5) * 1.5; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ size, map: tex, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, color: z > 0 ? 0xF4B5BE : 0xC23A4C });
    const pts = new THREE.Points(g, m); pts.userData.z = z; scene.add(pts); layers.push(pts);
  });

  // interação: cursor inclina, arrasto gira com inércia, clique pulsa
  const target = { x: 0, y: 0 }, mouse = { x: 0, y: 0 };
  let spin = 0, vel = 0, dragging = false, lastX = 0, pulse = 0, scrollP = 0;
  const onMove = e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    if (dragging) { vel = (e.clientX - lastX) * .004; spin += vel; lastX = e.clientX; }
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); pulse = 1; canvas.classList.add('grabbing'); });
  const up = () => { dragging = false; canvas.classList.remove('grabbing'); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    // em telas estreitas o símbolo sobe e diminui um pouco
    group.position.x = w > 900 ? 1.15 : 0;
    group.position.y = w > 900 ? 0 : 1.05;
    mesh.scale.setScalar(w > 900 ? 2.35 : 1.5);
  }
  new ResizeObserver(resize).observe(canvas); resize();

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    target.x += (mouse.y * .35 - target.x) * .06;
    target.y += (mouse.x * .6 - target.y) * .06;
    if (!dragging) { vel *= .95; spin += vel + (reduced ? 0 : .0025); }
    pulse *= .9;
    group.rotation.x = target.x + scrollP * .6;
    group.rotation.y = target.y + spin + scrollP * 1.2;
    group.position.z = -scrollP * 2.2;
    mesh.position.y = reduced ? 0 : Math.sin(t * .9) * .06;
    const beat = 1 + pulse * .08 + (reduced ? 0 : Math.max(0, Math.sin(t * 2.2)) ** 12 * .025);
    mesh.scale.setScalar((canvas.clientWidth > 900 ? 2.35 : 1.5) * beat);
    follow.position.set(mouse.x * 3, mouse.y * 2, 3);
    layers.forEach((l, i) => {
      l.position.x = -mouse.x * (l.userData.z > 0 ? .6 : .15 * (i + 1));
      l.position.y = -mouse.y * (l.userData.z > 0 ? .4 : .1 * (i + 1)) + scrollP * (i + 1) * .8;
      if (!reduced) l.rotation.z = t * .01 * (i % 2 ? 1 : -1);
    });
    renderer.render(scene, camera);
  }
  frame();

  return { setScroll(p) { scrollP = p; }, setMaterial(name) { mesh.material = MATERIALS[name](); } };
}
