/* ============================================================
   MADHATTAN CO — BACKGROUND LINES
   Vanilla JS port of Aceternity UI's Background Lines.
   Tuned for the dark cinematic aesthetic:
   – Warm amber / cream palette, mix-blend-mode: screen
   – SVG opacity capped at 0.35 so lines stay atmospheric
   – Hero section blocked by its own background-color
   ============================================================ */

(function initBackgroundLines() {
  'use strict';

  /* ── PALETTE ─────────────────────────────────────────────── */
  // Amber, gold, and warm neutrals — matches the site's accent
  // system. A few cooler tones add subtle depth without clashing.
  var COLORS = [
    '#C9882A', // site amber
    '#D4A042', // light amber
    '#E8C06A', // pale gold
    '#8A5A18', // burnt amber
    '#F0EAD6', // site cream
    '#BDB5A6', // site secondary
    '#C9882A',
    '#D4A042',
    '#F5D78A', // very pale gold
    '#A07840', // warm mid
    '#C9882A',
    '#8A5A18',
    '#E8C06A',
    '#BDB5A6',
    '#D4A042',
    '#F0EAD6',
    '#C9882A',
    '#A07840',
    '#F5D78A',
    '#D4A042',
    '#8A5A18',
  ];

  /* ── SVG SETUP ───────────────────────────────────────────── */
  var NS  = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1440 900');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'z-index:-1;pointer-events:none;' +
    'opacity:0.35;' +               // global ceiling — keeps lines diffuse
    'mix-blend-mode:screen;';       // naturally brightens dark bg, won't darken text
  document.body.insertBefore(svg, document.body.firstChild);

  /* ── PATH GENERATION ─────────────────────────────────────── */
  function makePath(yCenter, amplitude, phase) {
    var W    = 1600;
    var segs = 10;
    var sw   = W / segs;
    var d    = 'M ' + (-sw) + ' ' + yCenter;
    for (var i = 0; i < segs + 1; i++) {
      var x1   = i * sw - sw;
      var x2   = x1 + sw;
      var sign = i % 2 === 0 ? 1 : -1;
      var cy   = yCenter + sign * amplitude + phase;
      var mx   = (x1 + x2) / 2;
      d += ' Q ' + mx + ' ' + cy + ' ' + x2 + ' ' + yCenter;
    }
    return d;
  }

  /* ── CREATE PATHS ────────────────────────────────────────── */
  var DURATION = 12000; // slightly slower → more cinematic

  [0, 1].forEach(function (pass) {
    COLORS.forEach(function (color, i) {
      var yBase     = 30 + (i / (COLORS.length - 1)) * 840;
      var amplitude = 14 + (i % 5) * 6;       // 14–38 px
      var phase     = pass * 10 - 5;
      var delay     = (Math.random() * 12) * 1000;
      var rDelay    = (Math.random() * 10) * 1000;

      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', makePath(yBase, amplitude, phase));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-dasharray', '50 800');
      path.setAttribute('stroke-dashoffset', '800');
      path.style.opacity = '0';

      svg.appendChild(path);

      if (typeof path.animate === 'function') {
        path.animate(
          [
            { strokeDashoffset: '800', strokeDasharray: '50 800', opacity: '0' },
            { offset: 0.08, opacity: '0.7' },   // max per-path opacity = 0.7
            { offset: 0.92, opacity: '0.7' },   // × SVG opacity 0.35 = ~0.25 effective
            { strokeDashoffset: '0', strokeDasharray: '20 800', opacity: '0' },
          ],
          {
            duration:   DURATION,
            delay:      delay,
            endDelay:   rDelay,
            iterations: Infinity,
            easing:     'linear',
            fill:       'both',
          }
        );
      }
    });
  });

}());
