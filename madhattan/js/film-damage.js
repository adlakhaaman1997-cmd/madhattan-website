/* ============================================================
   MADHATTAN CO — FILM DAMAGE
   Two-layer approach:

   Layer 1 — "behind glass" (z-index 5, below glass cards at z-10)
     Light leaks + halation blooms
     → sits beneath the glass/backdrop-filter elements so those
       surfaces naturally diffuse and catch the light, making it
       feel like the leaks are glowing through frosted glass.

   Layer 2 — "film surface" (z-index 9999, above everything)
     Grain · dust · hair · scratches
     → sits on top of all UI like physical damage on the film strip.

   Both layers: mix-blend-mode:screen — purely additive, never
   covers or darkens content.
   ============================================================ */

(function initFilmDamage() {
  'use strict';

  var rnd = Math.random;
  var rng = function (lo, hi) { return lo + rnd() * (hi - lo); };

  /* ── PAGE-SPECIFIC MULTIPLIER ────────────────────────────── */
  // Projects and services pages have videos — dial back light leaks
  // and halos so they don't bleed into the video color grade.
  var page = window.location.pathname.split('/').pop();
  var GLOW_MULT = page === 'project-detail.html' ? 0.15
                : (page === 'projects.html' || page === 'services.html') ? 0.45
                : 1.0;

  /* ── HELPER: make a canvas ───────────────────────────────── */
  function makeCanvas(zIndex) {
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'z-index:' + zIndex + ';pointer-events:none;mix-blend-mode:screen;';
    document.body.insertBefore(c, document.body.firstChild);
    var ctx = c.getContext('2d');
    var W = c.width  = window.innerWidth;
    var H = c.height = window.innerHeight;
    window.addEventListener('resize', function () {
      W = c.width  = window.innerWidth;
      H = c.height = window.innerHeight;
    });
    return { c: c, ctx: ctx, get W() { return c.width; }, get H() { return c.height; } };
  }

  var bg = makeCanvas(5);     // behind glass — light leaks + halos
  var fg = makeCanvas(9999);  // film surface — grain + artifacts

  /* ── SHARED STATE MACHINE (used by all artifact types) ───── */
  // Prototype tick shared via Leak.prototype.tick below.

  /* ── 1. LIGHT LEAKS (bg layer) ───────────────────────────── */
  var LEAK_CORNERS = [
    [0, 0], [1, 0], [0, 1], [1, 1],
    [0.5, 0], [0, 0.5], [1, 0.5],
  ];

  function Leak() {
    var corner  = LEAK_CORNERS[Math.floor(rnd() * LEAK_CORNERS.length)];
    this.cx     = corner[0] * bg.W;
    this.cy     = corner[1] * bg.H;
    this.r      = rng(bg.W * 0.25, bg.W * 0.55);
    var flavour = rnd();
    if (flavour < 0.4) {
      this.c0 = 'rgba(255,140,30,';
      this.c1 = 'rgba(201,100,10,';
      this.cT = 'rgba(255,140,30,0)';
    } else if (flavour < 0.75) {
      this.c0 = 'rgba(255,200,80,';
      this.c1 = 'rgba(180,100,20,';
      this.cT = 'rgba(255,200,80,0)';
    } else {
      this.c0 = 'rgba(255,80,20,';
      this.c1 = 'rgba(160,50,10,';
      this.cT = 'rgba(255,80,20,0)';
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
    var ctx = bg.ctx;
    var g = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.r);
    g.addColorStop(0,   this.c0 + this.op + ')');
    g.addColorStop(0.4, this.c1 + (this.op * 0.5) + ')');
    g.addColorStop(1,   this.cT);   // same hue at alpha 0 — no premultiplied-alpha banding
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  };

  /* ── 2. HALATION BLOOMS (bg layer) ───────────────────────── */
  function Halo() {
    this.x    = rng(bg.W * 0.05, bg.W * 0.95);
    this.y    = rng(bg.H * 0.05, bg.H * 0.90);
    // Large radius — ambient wash, not spotlight
    this.r    = rng(250, 520);
    // Random ellipse so they're never circular orbs
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
    var ctx = bg.ctx;
    // Gradient built in unit space, canvas scaled to ellipse shape
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
    if (this.warm) {
      g.addColorStop(0,    'rgba(255,160,40,'  + this.op + ')');
      g.addColorStop(0.3,  'rgba(220,120,30,'  + (this.op * 0.55) + ')');
      g.addColorStop(0.65, 'rgba(200,100,20,'  + (this.op * 0.18) + ')');
      g.addColorStop(1,    'rgba(255,160,40,0)');
    } else {
      g.addColorStop(0,    'rgba(255,240,200,' + this.op + ')');
      g.addColorStop(0.3,  'rgba(220,190,120,' + (this.op * 0.55) + ')');
      g.addColorStop(0.65, 'rgba(200,160,80,'  + (this.op * 0.18) + ')');
      g.addColorStop(1,    'rgba(255,240,200,0)');
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

  /* ── 3. SCRATCHES (fg layer) ─────────────────────────────── */
  function Scratch() {
    this.x     = rng(0, fg.W);
    this.y1    = rng(0, fg.H * 0.15);
    this.y2    = rng(fg.H * 0.5, fg.H);
    this.w     = rng(0.3, 0.8);
    this.op    = 0;
    this.peak  = rng(0.16, 0.36);   // mid of old 0.12-0.28 and new 0.22-0.50
    this.rise  = rng(0.05, 0.12);
    this.fall  = rng(0.03, 0.07);
    this.hold  = rng(2, 10);
    this.held  = 0;
    this.done  = false;
    this.phase = 'in';
    this.pts   = [];
    for (var y = this.y1; y <= this.y2; y += 5) {
      this.pts.push(this.x + rng(-0.6, 0.6));
    }
  }
  Scratch.prototype.tick = Leak.prototype.tick;
  Scratch.prototype.draw = function () {
    var ctx = fg.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,' + this.op + ')';
    ctx.lineWidth   = this.w;
    ctx.beginPath();
    var y = this.y1;
    ctx.moveTo(this.pts[0], y);
    for (var i = 1; i < this.pts.length; i++) {
      y += 5;
      ctx.lineTo(this.pts[i], Math.min(y, this.y2));
    }
    ctx.stroke();
    ctx.restore();
  };

  /* ── 4. DUST (fg layer) ──────────────────────────────────── */
  function Dust() {
    this.x     = rng(0, fg.W);
    this.y     = rng(0, fg.H);
    this.r     = rng(0.5, 2.0);
    this.op    = 0;
    this.peak  = rng(0.25, 0.56);   // mid of old 0.20-0.50 and new 0.32-0.68
    this.rise  = rng(0.05, 0.12);
    this.fall  = rng(0.02, 0.05);
    this.hold  = rng(5, 45);
    this.held  = 0;
    this.done  = false;
    this.phase = 'in';
  }
  Dust.prototype.tick = Leak.prototype.tick;
  Dust.prototype.draw = function () {
    var ctx = fg.ctx;
    ctx.save();
    ctx.globalAlpha = this.op;
    ctx.fillStyle   = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  /* ── 5. HAIR (fg layer) ──────────────────────────────────── */
  function Hair() {
    var len    = rng(10, 50);
    var angle  = rnd() * Math.PI * 2;
    this.x1    = rng(0, fg.W);
    this.y1    = rng(0, fg.H);
    this.x2    = this.x1 + Math.cos(angle) * len;
    this.y2    = this.y1 + Math.sin(angle) * len;
    this.cpx   = (this.x1 + this.x2) / 2 + rng(-18, 18);
    this.cpy   = (this.y1 + this.y2) / 2 + rng(-18, 18);
    this.w     = rng(0.3, 0.7);
    this.op    = 0;
    this.peak  = rng(0.16, 0.34);   // mid of old 0.12-0.28 and new 0.20-0.42
    this.rise  = rng(0.03, 0.07);
    this.fall  = rng(0.015, 0.04);
    this.hold  = rng(10, 55);
    this.held  = 0;
    this.done  = false;
    this.phase = 'in';
  }
  Hair.prototype.tick = Leak.prototype.tick;
  Hair.prototype.draw = function () {
    var ctx = fg.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,' + this.op + ')';
    ctx.lineWidth   = this.w;
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.quadraticCurveTo(this.cpx, this.cpy, this.x2, this.y2);
    ctx.stroke();
    ctx.restore();
  };

  /* ── 6. FILM GRAIN (fg layer, redrawn every frame) ───────── */
  var GRAIN_COUNT = 1100;   // midpoint between 700 and 1800

  function drawGrain() {
    var ctx = fg.ctx;
    for (var i = 0; i < GRAIN_COUNT; i++) {
      var x  = rng(0, fg.W);
      var y  = rng(0, fg.H);
      var r  = rng(0.3, 1.6);
      var op = rng(0.03, 0.28);   // mid of old 0.02-0.20 and new 0.05-0.38
      ctx.globalAlpha = op;
      ctx.fillStyle   = '#fff';
      ctx.fillRect(x, y, r, r);
    }
    ctx.globalAlpha = 1;
  }

  /* ── POOLS ───────────────────────────────────────────────── */
  var scratches = [], dusts = [], hairs = [], leaks = [], halos = [];

  function spawn() {
    if (rnd() < 0.008 && scratches.length < 3)  scratches.push(new Scratch());
    if (rnd() < 0.060 && dusts.length    < 28)  dusts.push(new Dust());
    if (rnd() < 0.018 && hairs.length    < 10)  hairs.push(new Hair());
    if (rnd() < 0.004 && leaks.length    < 2)   leaks.push(new Leak());
    if (rnd() < 0.003 && halos.length    < 3)   halos.push(new Halo());
  }

  function tickPool(pool) {
    for (var i = pool.length - 1; i >= 0; i--) {
      pool[i].tick();
      if (pool[i].done) pool.splice(i, 1);
      else pool[i].draw();
    }
  }

  /* ── VIDEO CLIP (both layers) ───────────────────────────── */
  // Applied BEFORE drawing on each canvas so pixels are simply never
  // written in video areas — no gradient-vs-hole contrast, no rectangle.
  function clipExcludingVideos(ctx, W, H) {
    var els   = document.querySelectorAll('video, iframe');
    var rects = [];
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.width > 0 && r.height > 0) rects.push(r);
    }
    if (rects.length === 0) return false;
    ctx.beginPath();
    ctx.rect(0, 0, W, H);           // whole canvas
    for (var j = 0; j < rects.length; j++) {
      var vr = rects[j];
      ctx.rect(vr.left - 4, vr.top - 4, vr.width + 8, vr.height + 8);
    }
    ctx.clip('evenodd');
    return true;
  }

  /* ── RENDER LOOPS ────────────────────────────────────────── */
  function frame() {
    requestAnimationFrame(frame);

    // Background layer: leaks + halos — no video clip.
    // At 0.03–0.06 opacity through screen blend, the warm shift on any
    // video pixel is <2% — imperceptible. Clipping a gradient always
    // creates a high-contrast dark-rectangle boundary, which is far more
    // visible than the glow itself.
    bg.ctx.clearRect(0, 0, bg.W, bg.H);
    spawn();
    tickPool(leaks);
    tickPool(halos);

    // Foreground layer: grain + artifacts — also clipped away from videos
    fg.ctx.clearRect(0, 0, fg.W, fg.H);
    fg.ctx.save();
    clipExcludingVideos(fg.ctx, fg.W, fg.H);
    drawGrain();
    tickPool(dusts);
    tickPool(hairs);
    tickPool(scratches);
    fg.ctx.restore();
  }

  frame();
}());
