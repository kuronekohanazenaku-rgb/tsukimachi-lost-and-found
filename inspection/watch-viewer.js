import * as THREE from './vendor/three.module.min.js';

export function backIsReadable(quaternion) {
  const normal = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
  return normal.z > 0.72;
}

function dialTexture(back = false) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(420, 380, 80, 512, 512, 720);
  gradient.addColorStop(0, back ? '#cfb477' : '#f2e7c6'); gradient.addColorStop(1, back ? '#8b6c39' : '#b7a575');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 1024);
  // Deterministic patina, so the texture does not change on every inspection.
  let seed = 417;
  for (let i = 0; i < 4200; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0; const x = seed % 1024;
    seed = (seed * 1664525 + 1013904223) >>> 0; const y = seed % 1024;
    ctx.fillStyle = `rgba(64,44,20,${(i % 5 + 1) / 160})`; ctx.fillRect(x, y, 1 + i % 3, 1);
  }
  ctx.translate(512, 512); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (back) {
    for (const radius of [458, 446, 390]) { ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.strokeStyle = '#785a2e'; ctx.lineWidth = radius === 390 ? 2 : 4; ctx.stroke(); }
    ctx.fillStyle = '#49351f'; ctx.font = '32px serif'; ctx.fillText('製 造 番 号', 0, -106);
    ctx.font = '142px Georgia,serif'; ctx.fillText('417', 0, 18);
    ctx.strokeStyle = '#745729'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-175, 118); ctx.lineTo(175, 118); ctx.stroke();
    ctx.font = '21px Georgia,serif'; ctx.fillStyle = '#5c4628'; ctx.fillText('TSUKIMACHI', 0, 174);
    // Four small screws and decorative engraving remain attached to the back.
    for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2, x = Math.cos(a) * 414, y = Math.sin(a) * 414; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fillStyle = '#94723c'; ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke(); }
  } else {
    ctx.strokeStyle = '#786646'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 470, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 60; i++) {
      const a = i * Math.PI / 30, outer = 447, inner = i % 5 ? 430 : 412;
      ctx.beginPath(); ctx.moveTo(Math.sin(a) * inner, -Math.cos(a) * inner); ctx.lineTo(Math.sin(a) * outer, -Math.cos(a) * outer); ctx.lineWidth = i % 5 ? 2 : 4; ctx.stroke();
    }
    const roman = ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
    ctx.font = '65px Georgia,serif'; ctx.fillStyle = '#3f3727';
    roman.forEach((number, i) => { const a = i * Math.PI / 6; ctx.fillText(number, Math.sin(a) * 350, -Math.cos(a) * 350); });
    ctx.font = '22px Georgia,serif'; ctx.fillText('TSUKIMACHI', 0, -175); ctx.font = '18px Georgia,serif'; ctx.fillStyle = '#84724e'; ctx.fillText('手巻き · 十七石', 0, -140);
    ctx.beginPath(); ctx.arc(0, 205, 92, 0, Math.PI * 2); ctx.lineWidth = 1; ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 79, 205 - Math.cos(a) * 79); ctx.lineTo(Math.sin(a) * 88, 205 - Math.cos(a) * 88); ctx.stroke(); }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  return texture;
}

export function createWatchViewer(canvas, { onDiscover, onUnavailable }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { onUnavailable(); return { dispose() {}, zoom() {}, reset() {} }; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
  camera.position.set(0, 0.12, 4.9); camera.lookAt(0, 0.12, 0);
  scene.add(new THREE.HemisphereLight(0xd3e9ef, 0x4a2d13, 2.2));
  const key = new THREE.DirectionalLight(0xffe0a5, 4.4); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fcee5, 2.8); rim.position.set(4, 1, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffc579, 1.3); fill.position.set(0, -3, 2); scene.add(fill);
  const watch = new THREE.Group(); scene.add(watch);
  const brass = new THREE.MeshStandardMaterial({ color: 0xb39454, metalness: 0.72, roughness: 0.3 });
  const darkBrass = new THREE.MeshStandardMaterial({ color: 0x806339, metalness: 0.6, roughness: 0.45 });
  const brightBrass = new THREE.MeshStandardMaterial({ color: 0xddc48a, metalness: 0.6, roughness: 0.25 });
  function mesh(geometry, material, x = 0, y = 0, z = 0) { const part = new THREE.Mesh(geometry, material); part.position.set(x, y, z); watch.add(part); return part; }
  const body = mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.25, 96), brass); body.rotation.x = Math.PI / 2;
  for (const z of [-0.12, -0.08, 0.07, 0.14]) mesh(new THREE.TorusGeometry(0.96, 0.035, 12, 96), z === 0.14 ? brightBrass : darkBrass, 0, 0, z);
  mesh(new THREE.TorusGeometry(0.89, 0.045, 16, 96), brightBrass, 0, 0, 0.17);
  mesh(new THREE.CircleGeometry(0.866, 96), new THREE.MeshStandardMaterial({ map: dialTexture(), roughness: 0.85, metalness: 0.03 }), 0, 0, 0.172);
  const back = mesh(new THREE.CircleGeometry(0.935, 96), new THREE.MeshStandardMaterial({ map: dialTexture(true), metalness: 0.44, roughness: 0.6 }), 0, 0, -0.132); back.rotation.y = Math.PI;
  const handMaterial = new THREE.MeshStandardMaterial({ color: 0x302a1f, metalness: 0.4, roughness: 0.4 });
  function hand(length, width, angle, z) {
    const pivot = new THREE.Group(); pivot.rotation.z = -angle; pivot.position.z = z; watch.add(pivot);
    const shape = new THREE.Shape(); shape.moveTo(-width / 2, -0.09); shape.lineTo(-width / 2, length * 0.75); shape.lineTo(0, length); shape.lineTo(width / 2, length * 0.75); shape.lineTo(width / 2, -0.09); shape.closePath();
    pivot.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false }), handMaterial));
  }
  hand(0.46, 0.046, (6 + 40 / 60) * Math.PI / 6, 0.183);
  hand(0.69, 0.027, 40 * Math.PI / 30, 0.196);
  mesh(new THREE.SphereGeometry(0.043, 20, 12), brightBrass, 0, 0, 0.21);
  const crown = mesh(new THREE.CylinderGeometry(0.105, 0.13, 0.18, 24), darkBrass, 0, 1.045, 0);
  for (let i = 0; i < 5; i++) { const ridge = mesh(new THREE.TorusGeometry(0.115, 0.012, 6, 24), brass, 0, 1 + i * 0.026, 0); ridge.rotation.x = Math.PI / 2; }
  mesh(new THREE.TorusGeometry(0.19, 0.032, 12, 48), brass, 0, 1.23, 0);
  crown.castShadow = false;
  const initial = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.13, -0.22, -0.045)); watch.quaternion.copy(initial);
  let disposed = false, frame = null, discoveryTimer = null, discovered = false;
  const controller = new AbortController(), pointers = new Map();
  const yaw = new THREE.Quaternion(), pitch = new THREE.Quaternion(), axisY = new THREE.Vector3(0, 1, 0), axisX = new THREE.Vector3(1, 0, 0);
  let pinch = 0;
  function paint() {
    if (disposed || frame !== null) return;
    frame = requestAnimationFrame(() => { frame = null; if (!disposed) renderer.render(scene, camera); });
    if (backIsReadable(watch.quaternion) && !discovered && !discoveryTimer) {
      discoveryTimer = setTimeout(() => { discoveryTimer = null; if (!disposed && backIsReadable(watch.quaternion)) { discovered = true; onDiscover(); } }, 300);
    } else if (!backIsReadable(watch.quaternion)) { clearTimeout(discoveryTimer); discoveryTimer = null; }
  }
  function rotate(dx, dy) {
    const scale = Math.PI * 2 / Math.max(220, canvas.clientWidth);
    yaw.setFromAxisAngle(axisY, dx * scale); pitch.setFromAxisAngle(axisX, dy * scale);
    watch.quaternion.premultiply(yaw).premultiply(pitch).normalize(); paint();
  }
  function zoom(delta) { camera.position.z = THREE.MathUtils.clamp(camera.position.z + delta, 3.6, 7.2); paint(); }
  function reset() { watch.quaternion.copy(initial); camera.position.z = 4.9; paint(); }
  function distance() { const pair = [...pointers.values()]; return pair.length > 1 ? Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y) : 0; }
  canvas.addEventListener('pointerdown', event => { event.preventDefault(); canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId); pointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); pinch = distance(); }, { signal: controller.signal });
  canvas.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId); if (!previous) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) rotate(event.clientX - previous.x, event.clientY - previous.y);
    else { const next = distance(); if (pinch) zoom((pinch - next) * 0.012); pinch = next; }
  }, { signal: controller.signal });
  function release(event) { pointers.delete(event.pointerId); pinch = distance(); }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, release, { signal: controller.signal });
  canvas.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY * 0.003); }, { passive: false, signal: controller.signal });
  canvas.addEventListener('keydown', event => {
    const keys = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
    if (keys[event.key]) { event.preventDefault(); rotate(...keys[event.key]); }
    if (event.key === 'Home') { event.preventDefault(); reset(); }
  }, { signal: controller.signal });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); if (!disposed) onUnavailable(); }, { signal: controller.signal });
  const observer = new ResizeObserver(() => { if (disposed) return; const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); paint(); });
  observer.observe(canvas); paint();
  return { zoom, reset, dispose() {
    if (disposed) return; disposed = true; controller.abort(); observer.disconnect(); clearTimeout(discoveryTimer); if (frame !== null) cancelAnimationFrame(frame);
    const geometries = new Set(), materials = new Set(), textures = new Set();
    watch.traverse(part => { if (part.geometry) geometries.add(part.geometry); if (part.material) materials.add(part.material); });
    for (const material of materials) { if (material.map) textures.add(material.map); material.dispose(); }
    for (const geometry of geometries) geometry.dispose(); for (const texture of textures) texture.dispose(); renderer.dispose();
  } };
}
