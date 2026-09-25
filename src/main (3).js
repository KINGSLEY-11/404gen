import * as THREE from 'three';
import makeKeke from '../assets/keke.js';
import makePassenger from '../assets/passenger.js';
import makeGoat from '../assets/goat.js';
import makeShop from '../assets/shop.js';
import makeHouse from '../assets/house.js';
import makeLight from '../assets/streetlight.js';
import makeTree from '../assets/mango_tree.js';
import makeSuya from '../assets/suya_stand.js';
import makeGen from '../assets/generator.js';
import makeTank from '../assets/water_tank.js';
import makeSign from '../assets/signboard.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a1828);
scene.fog = new THREE.Fog(0x8a4a3a, 18, 78);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.12, 180);
const clock = new THREE.Clock();

const telemetry = {
  pos: [0, 0],
  fps: 60,
  draws: 0,
  tris: 0,
  heading: 0,
  fares: 0,
  onboard: 0,
  speed: 0,
  over: false,
};
window.__GAME__ = telemetry;
window.__READY__ = false;

const barf = document.getElementById('barf');
const loadmsg = document.getElementById('loadmsg');
function setLoad(p, msg) {
  barf.style.width = `${Math.floor(p * 100)}%`;
  if (msg) loadmsg.textContent = msg;
}

// ---------- lighting: sodium + cooler shop spill ----------
function rigLights() {
  const amb = new THREE.AmbientLight(0x3a2a38, 0.28);
  scene.add(amb);
  const hemi = new THREE.HemisphereLight(0xc47a4a, 0x3a2218, 0.35);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb347, 1.35);
  sun.position.set(-18, 22, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -36;
  sun.shadow.camera.right = 36;
  sun.shadow.camera.top = 36;
  sun.shadow.camera.bottom = -36;
  scene.add(sun);
}

// ---------- world ----------
const LOOP_R = 22; // centreline radius of the block road
const ROAD_W = 8;

function roadPoint(t) {
  const a = t * Math.PI * 2;
  return { x: Math.cos(a) * LOOP_R, z: Math.sin(a) * LOOP_R, a };
}

function buildGround() {
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xc4a07a, roughness: 1 });
  groundMat.name = 'ground';
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x8b4a2a, roughness: 0.95 });
  roadMat.name = 'ground';
  const ring = new THREE.RingGeometry(LOOP_R - ROAD_W * 0.5, LOOP_R + ROAD_W * 0.5, 64);
  const road = new THREE.Mesh(ring, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  road.receiveShadow = true;
  scene.add(road);

  const lineMat = new THREE.MeshStandardMaterial({ color: 0xc9a15b, roughness: 0.8 });
  for (let i = 0; i < 28; i++) {
    const t = i / 28;
    const p = roadPoint(t);
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 1.1), lineMat);
    dash.position.set(p.x, 0.04, p.z);
    dash.rotation.y = -p.a;
    scene.add(dash);
  }

  // inner compound dirt
  const yard = new THREE.Mesh(new THREE.CircleGeometry(LOOP_R - ROAD_W * 0.5 - 0.4, 32), new THREE.MeshStandardMaterial({ color: 0x6a341c, roughness: 1 }));
  yard.rotation.x = -Math.PI / 2;
  yard.position.y = 0.01;
  yard.receiveShadow = true;
  scene.add(yard);
}

function place(obj, x, z, rotY = 0) {
  obj.position.set(x, 0, z);
  obj.rotation.y = rotY;
  scene.add(obj);
  return obj;
}

const buildings = [];
const lights = [];

function decorateStreet() {
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const p = roadPoint(t);
    const outward = { x: Math.cos(p.a), z: Math.sin(p.a) };
    const tangent = { x: -Math.sin(p.a), z: Math.cos(p.a) };

    // outer shops / houses face inward toward road (front +Z of asset)
    const outer = i % 3 === 0 ? makeHouse(THREE) : makeShop(THREE);
    const ox = p.x + outward.x * 9.2;
    const oz = p.z + outward.z * 9.2;
    place(outer, ox, oz, p.a + Math.PI);
    buildings.push(outer);

    const inner = i % 2 === 0 ? makeShop(THREE) : makeHouse(THREE);
    const ix = p.x - outward.x * 8.6;
    const iz = p.z - outward.z * 8.6;
    place(inner, ix, iz, p.a);
    buildings.push(inner);

    const lamp = makeLight(THREE);
    place(lamp, p.x + outward.x * 4.6 + tangent.x * 2.2, p.z + outward.z * 4.6 + tangent.z * 2.2, p.a + Math.PI * 0.5);
    const sl = new THREE.PointLight(0xffb347, 2.4, 16, 1.6);
    sl.position.set(lamp.position.x, 6.1, lamp.position.z);
    scene.add(sl);
    lights.push(sl);

    if (i % 3 === 1) {
      const tree = makeTree(THREE);
      place(tree, p.x - outward.x * 5.8 + tangent.x * -3, p.z - outward.z * 5.8 + tangent.z * -3, p.a);
    }
    if (i % 5 === 0) {
      place(makeSuya(THREE), p.x + outward.x * 5.4 + tangent.x * -3.2, p.z + outward.z * 5.4 + tangent.z * -3.2, p.a + Math.PI);
    }
    if (i % 4 === 2) {
      place(makeGen(THREE), p.x - outward.x * 5.2 + tangent.x * 3.4, p.z - outward.z * 5.2 + tangent.z * 3.4, p.a);
    }
    if (i === 2) place(makeTank(THREE), -4, -3, 0.4);
    if (i === 6) place(makeSign(THREE), p.x + outward.x * 5.0, p.z + outward.z * 5.0, p.a + Math.PI);
  }
}

// ---------- player keke ----------
const keke = makeKeke(THREE);
scene.add(keke);
let px = LOOP_R, pz = 0, yaw = Math.PI * 0.5;
let speed = 0;
const MAX_SPEED = 11.5;
keke.position.set(px, 0, pz);
keke.rotation.y = yaw;

// ---------- passengers / goats ----------
const passengers = [];
const goats = [];
const destMarker = new THREE.Mesh(
  new THREE.RingGeometry(0.7, 0.95, 20),
  new THREE.MeshBasicMaterial({ color: 0xf5c400, side: THREE.DoubleSide })
);
destMarker.rotation.x = -Math.PI / 2;
destMarker.visible = false;
scene.add(destMarker);

function spawnPassenger() {
  const t = Math.random();
  const p = roadPoint(t);
  const side = Math.random() < 0.5 ? 1 : -1;
  const outward = { x: Math.cos(p.a), z: Math.sin(p.a) };
  const obj = makePassenger(THREE);
  const x = p.x + outward.x * side * 3.6;
  const z = p.z + outward.z * side * 3.6;
  place(obj, x, z, p.a + (side > 0 ? Math.PI : 0));
  const glow = new THREE.PointLight(0xf5c400, 1.1, 5);
  glow.position.set(x, 1.6, z);
  scene.add(glow);
  passengers.push({ obj, glow, x, z, destT: (t + 0.28 + Math.random() * 0.2) % 1, riding: false });
}

function spawnGoat() {
  const t = Math.random();
  const p = roadPoint(t);
  const obj = makeGoat(THREE);
  place(obj, p.x + (Math.random() - 0.5) * 3, p.z + (Math.random() - 0.5) * 3, Math.random() * 6);
  goats.push({ obj, t, wander: Math.random() * 6, sign: Math.random() < 0.5 ? 1 : -1 });
}

let onboard = null;
let naira = 0;
let shift = 120;
let playing = false;
let toastT = 0;

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('on');
  toastT = 1.8;
}

// ---------- input ----------
const stick = { x: 0, y: 0, active: false, ox: 0, oy: 0, id: null };
const stickEl = document.getElementById('stick');
const nub = document.getElementById('sticknub');
const drivePad = document.getElementById('drivepad');
const keys = new Set();
let braking = false;

function bindStick(el) {
  const maxR = () => Math.max(56, stickEl.getBoundingClientRect().width * 0.42);
  const setFrom = (cx, cy) => {
    const dx = cx - stick.ox;
    const dy = cy - stick.oy;
    const max = maxR();
    const len = Math.hypot(dx, dy) || 1;
    const cl = Math.min(len, max);
    let x = (dx / len) * (cl / max);
    let y = (dy / len) * (cl / max);
    if (Math.hypot(x, y) < 0.14) { x = 0; y = 0; }
    stick.x = x;
    stick.y = y;
    nub.style.transform = `translate(${(dx / len) * cl}px, ${(dy / len) * cl}px)`;
  };
  const start = (e) => {
    const t = e.changedTouches ? e.changedTouches[0] : e;
    stick.active = true;
    stick.id = t.pointerId != null ? t.pointerId : 1;
    stick.ox = t.clientX;
    stick.oy = t.clientY;
    const r = stickEl.getBoundingClientRect();
    stickEl.style.left = (t.clientX - r.width / 2) + 'px';
    stickEl.style.top = (t.clientY - r.height / 2) + 'px';
    stickEl.style.bottom = 'auto';
    setFrom(t.clientX, t.clientY);
  };
  const move = (e) => {
    if (!stick.active) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    if (t.pointerId != null && stick.id != null && t.pointerId !== stick.id) return;
    setFrom(t.clientX, t.clientY);
  };
  const end = (e) => {
    const t = e && e.changedTouches ? e.changedTouches[0] : e;
    if (t && t.pointerId != null && stick.id != null && t.pointerId !== stick.id) return;
    stick.active = false;
    stick.x = 0; stick.y = 0; stick.id = null;
    nub.style.transform = 'translate(0,0)';
    stickEl.style.left = '';
    stickEl.style.top = '';
    stickEl.style.bottom = '';
  };
  el.addEventListener('pointerdown', start);
  addEventListener('pointermove', move);
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
  el.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
  addEventListener('touchmove', (e) => { if (stick.active) { e.preventDefault(); move(e); } }, { passive: false });
  addEventListener('touchend', end);
}
bindStick(drivePad || stickEl);

addEventListener('keydown', (e) => keys.add(e.code));
addEventListener('keyup', (e) => keys.delete(e.code));

let audioCtx;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.value = 220;
    g.gain.value = 0.05;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.16);
  } catch (_) {}
}

const brakeEl = document.getElementById('brake');
function setBrake(on) {
  braking = on;
  if (brakeEl) brakeEl.classList.toggle('on', on);
}
if (brakeEl) {
  brakeEl.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); setBrake(true); });
  brakeEl.addEventListener('pointerup', () => setBrake(false));
  brakeEl.addEventListener('pointercancel', () => setBrake(false));
  brakeEl.addEventListener('pointerleave', () => setBrake(false));
}

document.getElementById('horn').addEventListener('pointerdown', () => {
  if (!playing) return;
  beep();
  tryBoard(true);
  toast('HAAA!');
});

addEventListener('keydown', (e) => {
  if (!playing) return;
  if (e.code === 'Space') {
    e.preventDefault();
    beep();
    tryBoard(true);
    toast('HAAA!');
  }
});

function throttleSteer() {
  let th = 0, st = 0;
  if (stick.active) {
    th = -stick.y;
    st = stick.x;
    if (th > 0.2) th = 0.2 + (th - 0.2) * 1.15;
    st = st * Math.min(1, 0.45 + Math.abs(th) * 0.7);
  }
  if (keys.has('KeyW') || keys.has('ArrowUp')) th += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown') || keys.has('ShiftLeft') || keys.has('ShiftRight') || braking) th -= 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) st -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) st += 1;
  if (stick.active && stick.y > 0.35) th -= 0.85;
  return { th: THREE.MathUtils.clamp(th, -1, 1), st: THREE.MathUtils.clamp(st, -1, 1) };
}

function tryBoard(forced) {
  if (onboard) {
    const d = destMarker.position;
    const dist = Math.hypot(px - d.x, pz - d.z);
    if (dist < 4.4 && speed < 4.2) {
      naira += 400 + Math.floor(Math.random() * 250);
      document.getElementById('naira').textContent = naira.toLocaleString();
      scene.remove(onboard.obj);
      onboard = null;
      destMarker.visible = false;
      telemetry.fares = naira;
      telemetry.onboard = 0;
      toast('+ FARE');
      spawnPassenger();
    }
    return;
  }
  let best = null, bestD = forced ? 6.4 : 4.2;
  for (const p of passengers) {
    if (p.riding) continue;
    const d = Math.hypot(px - p.x, pz - p.z);
    if (d < bestD) { best = p; bestD = d; }
  }
  if (!best || speed > 4.4) return;
  best.riding = true;
  scene.remove(best.obj);
  scene.remove(best.glow);
  const dest = roadPoint(best.destT);
  destMarker.position.set(dest.x, 0.05, dest.z);
  destMarker.visible = true;
  onboard = best;
  telemetry.onboard = 1;
  toast('BOARDING · DROP AT THE RING');
}

function hitGoats() {
  for (const g of goats) {
    const d = Math.hypot(px - g.obj.position.x, pz - g.obj.position.z);
    if (d < 1.15 && speed > 5.2) {
      speed *= 0.35;
      toast('GOAT!');
    }
  }
}

// ---------- camera ----------
const camTarget = new THREE.Vector3();
const camPos = new THREE.Vector3(px - 8, 4.2, pz);

function updateCamera() {
  const back = 7.2, height = 3.6;
  const desired = new THREE.Vector3(
    px - Math.sin(yaw) * back,
    height,
    pz - Math.cos(yaw) * back
  );
  camPos.lerp(desired, 0.14);
  camTarget.set(px + Math.sin(yaw) * 4, 1.1, pz + Math.cos(yaw) * 4);
  camera.position.copy(camPos);
  camera.lookAt(camTarget);
}

// ---------- loop ----------
let lastInfo = 0;
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const fps = 1 / Math.max(dt, 0.0001);

  if (playing) {
    const { th, st } = throttleSteer();
    const accel = th * 14 - speed * 1.6;
    speed += accel * dt;
    if (braking || keys.has('ShiftLeft') || keys.has('ShiftRight') || th < -0.4) speed *= Math.pow(0.06, dt);
    else if (Math.abs(th) < 0.05) speed *= Math.pow(0.22, dt);
    speed = THREE.MathUtils.clamp(speed, -3.5, MAX_SPEED);
    yaw -= st * (1.15 + Math.abs(speed) * 0.08) * dt;
    px += Math.sin(yaw) * speed * dt;
    pz += Math.cos(yaw) * speed * dt;

    // keep roughly on the loop road (soft attract to ring)
    const r = Math.hypot(px, pz);
    const targetR = LOOP_R;
    if (r > 0.01) {
      const pull = (targetR - r) * 0.35 * dt;
      px += (px / r) * pull * 8;
      pz += (pz / r) * pull * 8;
    }

    keke.position.set(px, 0.02 + Math.abs(Math.sin(performance.now() * 0.02) * speed) * 0.01, pz);
    keke.rotation.y = yaw;
    keke.rotation.z = -st * 0.12;
    keke.rotation.x = th * 0.03;

    if (!onboard) tryBoard(false);
    else tryBoard(false);
    hitGoats();

    for (const g of goats) {
      g.wander += dt * g.sign * 0.35;
      const p = roadPoint((g.t + g.wander * 0.01) % 1);
      g.obj.position.x += (p.x - g.obj.position.x) * dt * 0.4;
      g.obj.position.z += (p.z - g.obj.position.z) * dt * 0.4;
      g.obj.rotation.y += dt * 0.4 * g.sign;
    }

    destMarker.rotation.z += dt * 1.2;

    shift -= dt;
    if (shift < 0) endShift();
    const m = Math.max(0, Math.floor(shift / 60));
    const s = Math.max(0, Math.floor(shift % 60));
    document.getElementById('time').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    const hint = document.getElementById('hint');
    hint.textContent = onboard ? 'DROP THEM ON THE GOLD RING' : 'PICK UP THE HAILING PASSENGER';

    if (toastT > 0) {
      toastT -= dt;
      if (toastT <= 0) document.getElementById('toast').classList.remove('on');
    }
  }

  updateCamera();
  renderer.render(scene, camera);

  const info = renderer.info;
  telemetry.pos = [px, pz];
  telemetry.fps = fps;
  telemetry.draws = info.render.calls;
  telemetry.tris = info.render.triangles;
  telemetry.heading = yaw;
  telemetry.speed = speed;
  telemetry.fares = naira;

  if (performance.now() - lastInfo > 2000) lastInfo = performance.now();
}

function endShift() {
  playing = false;
  telemetry.over = true;
  document.getElementById('touch').classList.add('hidden');
  document.getElementById('over').classList.remove('hidden');
  document.getElementById('overp').textContent = `You banked ₦${naira.toLocaleString()} before the dust settled.`;
}

function startShift() {
  document.getElementById('start').classList.add('hidden');
  document.getElementById('over').classList.add('hidden');
  document.getElementById('load').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('touch').classList.remove('hidden');
  naira = 0;
  shift = 120;
  onboard = null;
  destMarker.visible = false;
  telemetry.over = false;
  document.getElementById('naira').textContent = '0';
  playing = true;
  toast('SHIFT OPEN');
}

document.getElementById('startb').addEventListener('click', startShift);
document.getElementById('startb').addEventListener('pointerup', (e) => { e.preventDefault(); startShift(); });
document.getElementById('overb').addEventListener('click', () => {
  px = LOOP_R; pz = 0; yaw = Math.PI * 0.5; speed = 0;
  startShift();
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// boot
(async function boot() {
  setLoad(0.1, 'laterite');
  rigLights();
  buildGround();
  setLoad(0.4, 'compound');
  decorateStreet();
  setLoad(0.7, 'passengers');
  for (let i = 0; i < 4; i++) spawnPassenger();
  for (let i = 0; i < 5; i++) spawnGoat();
  setLoad(1, 'ready');
  window.__READY__ = true;
  document.getElementById('load').classList.add('hidden');
  tick();
})();
