import * as THREE from './vendor/three.module.min.js';

function labelTexture(text, background = '#d4c49b', foreground = '#493b27') {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = background; ctx.fillRect(0, 0, 768, 512);
  ctx.strokeStyle = foreground; ctx.globalAlpha = 0.25; ctx.lineWidth = 3; ctx.strokeRect(24, 24, 720, 464); ctx.globalAlpha = 1;
  ctx.fillStyle = foreground; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '44px Georgia,serif';
  const lines = text.split('\n'); lines.forEach((line, index) => ctx.fillText(line, 384, 256 + (index - (lines.length - 1) / 2) * 70, 670));
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
export function buildItem(kind, { solved = false } = {}) {
  const group = new THREE.Group();
  const materials = {
    wood: new THREE.MeshStandardMaterial({ color: 0x78502e, roughness: 0.65, metalness: 0.03 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb99a59, roughness: 0.3, metalness: 0.65 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xe3d4ac, roughness: 0.85 }),
    ink: new THREE.MeshStandardMaterial({ color: 0x2e3839, roughness: 0.7 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x26485e, roughness: 0.9, side: THREE.DoubleSide }),
  };
  const part = (geometry, material, x = 0, y = 0, z = 0) => { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); group.add(mesh); return mesh; };
  const box = (w, h, d, material, x = 0, y = 0, z = 0) => part(new THREE.BoxGeometry(w, h, d), material, x, y, z);
  const label = (text, x, y, z, w = 1.4, h = 0.6, back = false, background) => {
    const mesh = part(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: labelTexture(text, background), roughness: 0.8 }), x, y, z);
    if (back) mesh.rotation.y = Math.PI;
    return mesh;
  };
  if (kind === 'musicbox' || kind === 'box') {
    box(1.9, 1.12, 1.12, materials.wood, 0, -0.12);
    const lid = box(1.98, 0.12, 1.18, materials.wood, 0, 0.65, -0.24); lid.rotation.x = -0.48;
    for (const x of [-0.79, 0.79]) box(0.07, 1.14, 1.14, materials.brass, x, -0.1);
    box(0.23, 0.24, 0.08, materials.brass, 0, 0.3, 0.6);
    label(kind === 'box' ? '榊 修一\n時計 · 音楽箱 · 写真' : '手回し音楽箱', 0, -0.18, 0.574, 1.38, 0.45);
    label(kind === 'box' ? '職員私物\nB-204' : '月　鳥　花', 0, -0.1, -0.574, 1.4, 0.6, true);
    if (kind === 'musicbox') { const crank = part(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 12), materials.brass, 1.16, -0.1, 0); crank.rotation.z = Math.PI / 2; box(0.08, 0.3, 0.08, materials.brass, 1.4, -0.22); part(new THREE.SphereGeometry(0.08, 12, 8), materials.wood, 1.4, -0.39); }
  } else if (kind === 'key') {
    part(new THREE.TorusGeometry(0.42, 0.095, 12, 56), materials.brass, 0, 0.65);
    box(0.17, 1.25, 0.13, materials.brass, 0, -0.25);
    box(0.48, 0.16, 0.13, materials.brass, 0.16, -0.78); box(0.35, 0.14, 0.13, materials.brass, 0.1, -0.52);
    label('K · 7 · ○', 0, 0.65, 0.015, 0.58, 0.24); label('K · 7 · ○', 0, 0.65, -0.015, 0.58, 0.24, true);
  } else if (kind === 'umbrella') {
    part(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 12), materials.brass, 0, -0.05);
    const cloth = part(new THREE.ConeGeometry(0.27, 1.5, 10, 1, true), materials.blue, 0, 0.35); cloth.rotation.z = Math.PI;
    const handle = part(new THREE.TorusGeometry(0.19, 0.065, 10, 32, Math.PI * 1.5), materials.wood, 0.19, -1.02); handle.rotation.z = Math.PI;
    label('U-12', 0.28, -0.63, 0.07, 0.5, 0.28);
  } else if (kind === 'notebook') {
    box(1.58, 1.95, 0.18, materials.paper);
    box(1.66, 2.02, 0.045, materials.ink, 0, 0, 0.12); box(1.66, 2.02, 0.045, materials.ink, 0, 0, -0.12); box(0.12, 2.02, 0.28, materials.ink, -0.79);
    label('予定帳\n10月29日 — 31日', 0, 0.18, 0.148, 1.26, 0.64); label('高瀬 直', 0, -0.6, -0.148, 1.0, 0.3, true);
  } else if (kind === 'bag') {
    box(1.9, 1.35, 0.18, new THREE.MeshStandardMaterial({ color: 0x666d4b, roughness: 0.9 }));
    box(1.92, 0.12, 0.23, materials.ink, 0, 0.6); box(0.65, 0.1, 0.08, materials.brass, 0.2, 0.61, 0.14);
    label('職員私物\nB-204', 0.15, 0, 0.105, 1.1, 0.65); label('移送記録', 0, 0, -0.105, 1.1, 0.55, true);
  } else {
    const isPhoto = kind === 'photo', isLetter = kind === 'letter';
    const w = 1.95, h = isPhoto ? 1.43 : 1.3;
    box(w, h, isLetter ? 0.055 : 0.025, materials.paper);
    if (isPhoto || kind === 'postcard') {
      const map = new THREE.TextureLoader().load(`./assets/${kind}.png`); map.colorSpace = THREE.SRGBColorSpace;
      part(new THREE.PlaneGeometry(w - 0.1, h - 0.1), new THREE.MeshBasicMaterial({ map, transparent: true }), 0, 0, 0.031);
    } else { label('はるちゃんへ\n父さんより', 0, 0, 0.036, 1.7, 1.05); }
    label(isPhoto ? solved ? '管理番号\nB-204' : '四つの断片\n裏の文字をつなぐ' : isLetter ? '父からの手紙' : '岬の郵便局で受け取るあなたへ\n佐伯 文', 0, 0, -0.036, 1.7, 1.05, true);
    if (isPhoto && !solved) { box(0.015, h, 0.02, materials.ink, 0, 0, 0.043); box(w, 0.015, 0.02, materials.ink, 0, 0, 0.043); }
  }
  return group;
}

export function createItemViewer(canvas, kind, { solved, onUnavailable }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { onUnavailable(); return { dispose() {}, zoom() {}, reset() {} }; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30); camera.position.z = 5.4;
  scene.add(new THREE.HemisphereLight(0xdbe9ec, 0x342219, 2.4));
  for (const [color, intensity, x, y, z] of [[0xffe1aa, 3.8, -3, 4, 5], [0x9ec6e8, 2, 3, 1, -3]]) { const light = new THREE.DirectionalLight(color, intensity); light.position.set(x, y, z); scene.add(light); }
  const model = buildItem(kind, { solved }); scene.add(model);
  const initial = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.13, -0.28, -0.03)); model.quaternion.copy(initial);
  let disposed = false, frame = null, pinch = 0; const pointers = new Map(), controller = new AbortController();
  function draw() { if (disposed || frame !== null) return; frame = requestAnimationFrame(() => { frame = null; if (!disposed) renderer.render(scene, camera); }); }
  function rotate(dx, dy) { const scale = Math.PI * 2 / Math.max(220, canvas.clientWidth); model.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * scale)).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * scale)).normalize(); draw(); }
  function zoom(delta) { camera.position.z = THREE.MathUtils.clamp(camera.position.z + delta, 3.8, 8); draw(); }
  function reset() { model.quaternion.copy(initial); camera.position.z = 5.4; draw(); }
  const distance = () => { const p = [...pointers.values()]; return p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0; };
  canvas.addEventListener('pointerdown', e => { e.preventDefault(); canvas.focus({ preventScroll: true }); canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinch = distance(); }, { signal: controller.signal });
  canvas.addEventListener('pointermove', e => { const prior = pointers.get(e.pointerId); if (!prior) return; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.size === 1) rotate(e.clientX - prior.x, e.clientY - prior.y); else { const next = distance(); if (pinch) zoom((pinch - next) * 0.012); pinch = next; } }, { signal: controller.signal });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, e => { pointers.delete(e.pointerId); pinch = distance(); }, { signal: controller.signal });
  canvas.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY * 0.003); }, { passive: false, signal: controller.signal });
  canvas.addEventListener('keydown', e => { const arrows = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }; if (arrows[e.key]) { e.preventDefault(); rotate(...arrows[e.key]); } if (e.key === 'Home') reset(); }, { signal: controller.signal });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); if (!disposed) onUnavailable(); }, { signal: controller.signal });
  const observer = new ResizeObserver(() => { if (disposed || !canvas.clientWidth || !canvas.clientHeight) return; renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); draw(); }); observer.observe(canvas); draw();
  return { zoom, reset, dispose() { if (disposed) return; disposed = true; controller.abort(); observer.disconnect(); if (frame !== null) cancelAnimationFrame(frame); const geometries = new Set(), materials = new Set(); model.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); }); for (const geometry of geometries) geometry.dispose(); for (const material of materials) { material.map?.dispose(); material.dispose(); } renderer.dispose(); } };
}
