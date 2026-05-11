/* ═══════════════════════════════════════════════════════════════
   PROJECT ATHERION — main.js
   © 2026 Project Atherion. All rights reserved.
   ═══════════════════════════════════════════════════════════════ */

/* ── Custom Cursor ───────────────────────────────────────────── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function cursorLoop() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(cursorLoop);
})();

document.querySelectorAll('a, button, .module, .role, .phase, .founder-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.transform   = 'translate(-50%,-50%) scale(1.8)';
    ring.style.borderColor = 'rgba(0,200,255,0.8)';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.transform   = 'translate(-50%,-50%) scale(1)';
    ring.style.borderColor = 'rgba(0,200,255,0.5)';
  });
});

/* ── Starfield ───────────────────────────────────────────────── */
const sc   = document.getElementById('starfield');
const sctx = sc.getContext('2d');
let stars  = [], SW, SH;

function resizeStar() { SW = sc.width = window.innerWidth; SH = sc.height = window.innerHeight; }

function initStars() {
  resizeStar(); stars = [];
  for (let i = 0; i < 320; i++) {
    stars.push({
      x: Math.random() * SW, y: Math.random() * SH,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2
    });
  }
}

function drawStars() {
  sctx.clearRect(0, 0, SW, SH);
  stars.forEach(s => {
    s.twinkle += s.speed * 0.02;
    const alpha = s.a * (0.5 + 0.5 * Math.sin(s.twinkle));
    sctx.beginPath();
    sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sctx.fillStyle = `rgba(180,220,255,${alpha})`;
    sctx.fill();
  });
}

initStars();
window.addEventListener('resize', initStars);

/* ── Canvases ────────────────────────────────────────────────── */
const pc   = document.getElementById('planet-canvas');
const pctx = pc.getContext('2d');
function resizePlanet() { pc.width = window.innerWidth; pc.height = window.innerHeight; }
resizePlanet();
window.addEventListener('resize', resizePlanet);

const apc   = document.getElementById('about-planet');
const apctx = apc.getContext('2d');

/* ── HUD Live Readout ────────────────────────────────────────── */
let hudVals = { atm: 625, temp: 200, albedo: 0.26 };

function updateHUD(t) {
  hudVals.atm    += Math.sin(t * 0.0003) * 2;
  hudVals.temp   += Math.cos(t * 0.0005) * 0.5;
  hudVals.albedo += Math.sin(t * 0.0007) * 0.001;
  const a = document.getElementById('hud-atm');
  const b = document.getElementById('hud-temp');
  const c = document.getElementById('hud-albedo');
  if (a) a.textContent = hudVals.atm.toFixed(1);
  if (b) b.textContent = hudVals.temp.toFixed(2);
  if (c) c.textContent = hudVals.albedo.toFixed(4);
}

/* ── Main Render Loop ────────────────────────────────────────── */
function render(ts) {
  drawStars();
  drawHeroPlanet(ts);
  drawAboutPlanet(ts);
  updateHUD(ts);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

/* ── Hero Planet ─────────────────────────────────────────────── */
function drawHeroPlanet(t) {
  const W = pc.width, H = pc.height;
  pctx.clearRect(0, 0, W, H);
  const cx = W * 0.5, cy = H * 0.5;
  const R  = Math.min(W, H) * 0.38;

  // Ambient glow
  const grd = pctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.8);
  grd.addColorStop(0,   'rgba(0,200,255,0.04)');
  grd.addColorStop(0.5, 'rgba(124,92,252,0.02)');
  grd.addColorStop(1,   'transparent');
  pctx.fillStyle = grd;
  pctx.fillRect(0, 0, W, H);

  pctx.save();
  pctx.beginPath();
  pctx.arc(cx, cy, R, 0, Math.PI * 2);
  pctx.clip();

  // Base
  const base = pctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R);
  base.addColorStop(0,   '#1a3a5c');
  base.addColorStop(0.4, '#0d2440');
  base.addColorStop(0.8, '#071628');
  base.addColorStop(1,   '#030c18');
  pctx.fillStyle = base;
  pctx.fillRect(cx - R, cy - R, R * 2, R * 2);

  drawAtmBands(pctx, cx, cy, R, t);
  drawTerrain(pctx, cx, cy, R, t);

  // Ice caps
  pctx.fillStyle = 'rgba(220,240,255,0.7)';
  pctx.beginPath();
  pctx.ellipse(cx, cy - R * 0.88, R * 0.42, R * 0.12, 0, 0, Math.PI * 2);
  pctx.fill();
  pctx.fillStyle = 'rgba(220,240,255,0.5)';
  pctx.beginPath();
  pctx.ellipse(cx, cy + R * 0.9, R * 0.28, R * 0.08, 0, 0, Math.PI * 2);
  pctx.fill();

  pctx.restore();

  // Atmosphere rim
  const rim = pctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.06);
  rim.addColorStop(0,   'transparent');
  rim.addColorStop(0.5, 'rgba(0,150,255,0.12)');
  rim.addColorStop(1,   'rgba(0,200,255,0.04)');
  pctx.beginPath();
  pctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2);
  pctx.fillStyle = rim;
  pctx.fill();

  // Specular
  pctx.save();
  pctx.beginPath();
  pctx.arc(cx, cy, R, 0, Math.PI * 2);
  pctx.clip();
  const spec = pctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 0, cx - R * 0.3, cy - R * 0.3, R * 0.6);
  spec.addColorStop(0, 'rgba(255,255,255,0.08)');
  spec.addColorStop(1, 'transparent');
  pctx.fillStyle = spec;
  pctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  pctx.restore();

  // Terminator shadow
  pctx.save();
  pctx.beginPath();
  pctx.arc(cx, cy, R, 0, Math.PI * 2);
  pctx.clip();
  const shadow = pctx.createRadialGradient(cx + R * 0.5, cy, R * 0.2, cx + R, cy, R * 1.2);
  shadow.addColorStop(0,   'transparent');
  shadow.addColorStop(0.6, 'rgba(0,0,0,0.35)');
  shadow.addColorStop(1,   'rgba(0,0,0,0.7)');
  pctx.fillStyle = shadow;
  pctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  pctx.restore();
}

function drawAtmBands(ctx, cx, cy, R, t) {
  const bands = [
    { y: -0.55, h: 0.12, c: 'rgba(180,200,220,0.09)', spd:  0.00004  },
    { y: -0.28, h: 0.08, c: 'rgba(150,180,210,0.07)', spd: -0.00003  },
    { y:  0.05, h: 0.10, c: 'rgba(160,190,215,0.08)', spd:  0.000035 },
    { y:  0.32, h: 0.07, c: 'rgba(140,170,200,0.06)', spd: -0.000025 },
    { y:  0.58, h: 0.09, c: 'rgba(160,190,215,0.07)', spd:  0.00003  },
  ];
  bands.forEach(b => {
    const off = Math.sin(t * b.spd * 1000 + b.y * 5) * R * 0.04;
    ctx.fillStyle = b.c;
    ctx.beginPath();
    ctx.ellipse(cx + off, cy + b.y * R, R * 0.98, R * b.h, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawTerrain(ctx, cx, cy, R, t) {
  const patches = [
    { x: -0.3,  y:  0.1,  rx: 0.28, ry: 0.18, c: 'rgba(80,140,100,0.22)'  },
    { x:  0.1,  y: -0.2,  rx: 0.20, ry: 0.14, c: 'rgba(90,120,100,0.18)'  },
    { x: -0.5,  y: -0.3,  rx: 0.15, ry: 0.10, c: 'rgba(100,130,110,0.15)' },
    { x:  0.35, y:  0.3,  rx: 0.18, ry: 0.12, c: 'rgba(70,110,90,0.20)'   },
    { x: -0.1,  y:  0.45, rx: 0.22, ry: 0.10, c: 'rgba(80,130,105,0.17)'  },
  ];
  const spd = t * 0.000008;
  patches.forEach((p, i) => {
    const nx = Math.cos(spd + i) * R * p.rx + cx + p.x * R;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.ellipse(nx, cy + p.y * R, R * p.rx, R * p.ry, i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ── About Planet ────────────────────────────────────────────── */
function drawAboutPlanet(t) {
  const W = apc.width, H = apc.height;
  apctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const R  = Math.min(W, H) * 0.42;

  apctx.save();
  apctx.beginPath();
  apctx.arc(cx, cy, R, 0, Math.PI * 2);
  apctx.clip();

  const base = apctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R);
  base.addColorStop(0,   '#2a1a3a');
  base.addColorStop(0.5, '#180e28');
  base.addColorStop(1,   '#0a0814');
  apctx.fillStyle = base;
  apctx.fillRect(0, 0, W, H);

  const pbands = [
    { y: -0.4,  h: 0.10, c: 'rgba(120,80,200,0.18)',  spd:  0.00005  },
    { y:  0.0,  h: 0.08, c: 'rgba(100,60,180,0.14)',  spd: -0.00004  },
    { y:  0.35, h: 0.12, c: 'rgba(130,90,210,0.16)',  spd:  0.000035 },
  ];
  pbands.forEach(b => {
    const off = Math.sin(t * b.spd * 1000) * R * 0.05;
    apctx.fillStyle = b.c;
    apctx.beginPath();
    apctx.ellipse(cx + off, cy + b.y * R, R * 0.96, R * b.h, 0, 0, Math.PI * 2);
    apctx.fill();
  });

  const eyeX   = cx + Math.sin(t * 0.0002) * R * 0.15;
  const eyeY   = cy + Math.cos(t * 0.00015) * R * 0.1;
  const eyeGrd = apctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, R * 0.2);
  eyeGrd.addColorStop(0,   'rgba(200,150,255,0.4)');
  eyeGrd.addColorStop(0.5, 'rgba(150,100,220,0.15)');
  eyeGrd.addColorStop(1,   'transparent');
  apctx.fillStyle = eyeGrd;
  apctx.beginPath();
  apctx.arc(eyeX, eyeY, R * 0.2, 0, Math.PI * 2);
  apctx.fill();

  apctx.restore();

  const arim = apctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.08);
  arim.addColorStop(0,   'transparent');
  arim.addColorStop(0.6, 'rgba(124,92,252,0.14)');
  arim.addColorStop(1,   'rgba(124,92,252,0.03)');
  apctx.beginPath();
  apctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2);
  apctx.fillStyle = arim;
  apctx.fill();

  apctx.save();
  apctx.beginPath();
  apctx.arc(cx, cy, R, 0, Math.PI * 2);
  apctx.clip();
  const ashadow = apctx.createRadialGradient(cx + R * 0.6, cy + R * 0.1, 0, cx + R, cy, R * 1.1);
  ashadow.addColorStop(0,   'transparent');
  ashadow.addColorStop(0.7, 'rgba(0,0,0,0.4)');
  ashadow.addColorStop(1,   'rgba(0,0,0,0.75)');
  apctx.fillStyle = ashadow;
  apctx.fillRect(0, 0, W, H);
  apctx.restore();
}

/* ── Scroll Reveal ───────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const ro = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => ro.observe(el));
