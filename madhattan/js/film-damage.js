/* ============================================================
   MADHATTAN CO — ATMOSPHERIC LIGHT EFFECTS
   Single layer — "behind glass" (z-index 5, below glass cards)
     Light leaks + halation blooms
     → sits beneath glass/backdrop-filter elements so those
       surfaces naturally diffuse and catch the light.
   mix-blend-mode:screen — purely additive, never covers content.
   ============================================================ */

(function initAtmosphericLights() {
  'use strict';

  var rnd = Math.random;
  var rng = function (lo, hi) { return lo + rnd() * (hi - lo); };

  /* ── PAGE-SPECIFIC MULTIPLIER ────────────────────────────── */
  var page = window.location.pathname.split('/').pop();
  var GLOW_MULT = (page === 'index.html' || page === '' || page === 'project-detail.html') ? 0
                : (page === 'projects.html' || page === 'services.html') ? 0.45
                : 1.0;

  /* ── CANVAS ──────────────────────────────────────────────── */
  var c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  c.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'z-index:5;pointer-events:none;mix-blend-mode:screen;';
  document.body.insertBefore(c, document.body.firstChild);
  var ctx = c.getContext('2d');
  c.width  = window.innerWidth;
  c.height = window.innerHeight;
  window.addEventListener('resize', function () {
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  });

  /* ── 1. LIGHT LEAKS ──────────────────────────────────────── */
  var LEAK_CORNERS = [
    [0, 0], [1, 0], [0, 1], [1, 1],
    [0.5, 0], [0, 0.5], [1, 0.5],
  ];

  function Leak() {
    var corner  = LEAK_CORNERS[Math.floor(rnd() * LEAK_CORNERS.length)];
    this.cx     = corner[0] * c.width;
    this.cy     = corner[1] * c.height;
    this.r      = rng(c.width * 0.25, c.width * 0.55);
    var flavour = rnd();
    if (flavour < 0.4) {
      this.c0 = 'rgba(255,140,30,';
      this.c1 = 'rgba(201,100,10,';
      this.cT = 'rgba(255,140,30,0)';
    } else if (flavour < 0.75) {
      this.c0 = 'rgba(240,192,64,';
      this.c1 = 'rgba(180,120,20,';
      this.cT = 'rgba(240,192,64,0)';
    } else {
      this.c0 = 'rgba(255,120,40,';
      this.c1 = 'rgba(180,70,10,';
      this.cT = 'rgba(255,120,40,0)';
    }
    this.op    = 0;
    this.peak  = rng(0.13, 0.32) * GLOW_MULT;
    this.rise  = rng(0.0015, 0.004);
    this.fall  = rng(0.001, 0.003);
    this.hold  = rng(80, 260);
    this.held  = 0;
    this.done  = false;
    this.phase = 'in';
  }
  Leak.prototype.tick = function () {
    if (this.phase === 'in') {
      this.op += this.rise;
      if (this.op >= this.peak) { this.op = this.peak; this.phase = 'hold'; }
    } else if (this.phase === 'hold') {
      if (++this.held >= this.hold) this.phase = 'out';
    } else {
      this.op -= this.fall;
      if (this.op <= 0) this.done = true;
    }
  };
  Leak.prototype.draw = function () {
    var g = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.r);
    g.addColorStop(0,   this.c0 + this.op + ')');
    g.addColorStop(0.4, this.c1 + (this.op * 0.5) + ')');
    g.addColorStop(1,   this.cT);
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  };

  /* ── 2. HALATION BLOOMS ──────────────────────────────────── */
  function Halo() {
    this.x    = rng(c.width * 0.05, c.width * 0.95);
    this.y    = rng(c.height * 0.05, c.height * 0.90);
    this.r    = rng(250, 520);
    this.sx   = rng(0.5, 1.0);
    this.sy   = rng(0.5, 1.0);
    this.rot  = rnd() * Math.PI;
    this.op   = 0;
    this.peak = rng(0.03, 0.06) * GLOW_MULT;
    this.rise = rng(0.0003, 0.0008);
    this.fall = rng(0.0002, 0.0007);
    this.hold = rng(300, 900);
    this.held = 0;
    this.done = false;
    this.phase = 'in';
    this.warm  = rnd() < 0.65;
  }
  Halo.prototype.tick = Leak.prototype.tick;
  Halo.prototype.draw = function () {
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
    if (this.warm) {
      g.addColorStop(0,    'rgba(255,160,40,'  + this.op + ')');
      g.addColorStop(0.3,  'rgba(220,120,30,'  + (this.op * 0.55) + ')');
      g.addColorStop(0.65, 'rgba(200,100,20,'  + (this.op * 0.18) + ')');
      g.addColorStop(1,    'rgba(255,160,40,0)');
    } else {
      g.addColorStop(0,    'rgba(240,192,64,'  + this.op + ')');
      g.addColorStop(0.3,  'rgba(200,140,30,'  + (this.op * 0.55) + ')');
      g.addColorStop(0.65, 'rgba(180,100,20,'  + (this.op * 0.18) + ')');
      g.addColorStop(1,    'rgba(240,192,64,0)');
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.scale(this.sx, this.sy);
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  };

  /* ── POOLS & RENDER LOOP ─────────────────────────────────── */
  var leaks = [], halos = [];

  function spawn() {
    if (rnd() < 0.004 && leaks.length < 2) leaks.push(new Leak());
    if (rnd() < 0.003 && halos.length < 3) halos.push(new Halo());
  }

  function tickPool(pool) {
    for (var i = pool.length - 1; i >= 0; i--) {
      pool[i].tick();
      if (pool[i].done) pool.splice(i, 1);
      else pool[i].draw();
    }
  }

  function frame() {
    requestAnimationFrame(frame);
    ctx.clearRect(0, 0, c.width, c.height);
    spawn();
    tickPool(leaks);
    tickPool(halos);
  }

  frame();
}());
