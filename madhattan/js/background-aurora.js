/* ============================================================
   MADHATTAN CO — AURORA BACKGROUND
   Softly drifting color blobs — saturated but diffuse.
   Retro cinematic palette: amber, wine, teal, indigo.
   mix-blend-mode: screen means colors only add light to the
   dark bg and never muddy text or UI elements.
   ============================================================ */

(function initAuroraBackground() {
  'use strict';

  // Skip on mobile — heavy blur + mix-blend-mode:screen stalls the iOS Safari GPU compositor
  if (window.matchMedia('(pointer: coarse)').matches) return;
  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── STYLES ──────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent =
    '.aurora-wrap{' +
      'position:fixed;inset:0;z-index:-1;' +
      'pointer-events:none;overflow:hidden;' +
      'mix-blend-mode:screen;' +
    '}' +

    '.aurora-blob{' +
      'position:absolute;border-radius:50%;' +
      'will-change:transform;' +
    '}' +

    /* Six independent drift paths — each blob gets its own keyframe
       so timings never sync up and the effect stays organic.         */
    '@keyframes au1{' +
      '0%,100%{transform:translate(0,0)   scale(1)   }' +
      '33%    {transform:translate(55px,-45px) scale(1.07)}' +
      '66%    {transform:translate(-30px, 50px) scale(0.94)}' +
    '}' +
    '@keyframes au2{' +
      '0%,100%{transform:translate(0,0)   scale(1)   }' +
      '40%    {transform:translate(-65px, 35px) scale(1.06)}' +
      '70%    {transform:translate(45px,-55px) scale(0.95)}' +
    '}' +
    '@keyframes au3{' +
      '0%,100%{transform:translate(0,0)   scale(1)   }' +
      '30%    {transform:translate(50px, 65px) scale(0.93)}' +
      '65%    {transform:translate(-45px,-30px) scale(1.09)}' +
    '}' +
    '@keyframes au4{' +
      '0%,100%{transform:translate(0,0)   scale(1)   }' +
      '45%    {transform:translate(-55px,-55px) scale(1.07)}' +
      '75%    {transform:translate(60px, 30px) scale(0.92)}' +
    '}' +
    '@keyframes au5{' +
      '0%,100%{transform:translate(0,0)   scale(1)   }' +
      '35%    {transform:translate(30px,-70px) scale(1.05)}' +
      '70%    {transform:translate(-60px, 40px) scale(0.96)}' +
    '}' +
    '@keyframes au6{' +
      '0%,100%{transform:translate(0,0)   scale(1)   }' +
      '50%    {transform:translate(-40px, 65px) scale(1.08)}' +
      '80%    {transform:translate(55px,-25px) scale(0.91)}' +
    '}';

  document.head.appendChild(style);

  /* ── CONTAINER ───────────────────────────────────────────── */
  var wrap = document.createElement('div');
  wrap.className = 'aurora-wrap';
  wrap.setAttribute('aria-hidden', 'true');

  /* ── BLOB DEFINITIONS ────────────────────────────────────── */
  /*  [ left, top, width, height, color (rgba), anim, duration, delay, blur ]
      Blobs are pushed to corners/edges so the center stays black.
      Opacity values are deliberately low — colors should feel like
      traces on old film, not light sources.                          */
  /*  Blur radii kept at 70–80px (down from 140–160px).
      Quadratic cost: half the radius ≈ 4× cheaper per blob.      */
  var blobs = [
    /* Amber — top-right corner bleed */
    ['55%',  '-15%', '580px', '480px', 'rgba(201,136,42,0.22)',  'au1', '30s',   '0s',  75],
    /* Deep wine — bottom-left corner */
    ['-15%', '60%',  '520px', '440px', 'rgba(148,18,38,0.24)',   'au2', '36s',  '-9s',  80],
    /* Retro teal — far right edge, mid-height */
    ['72%',  '25%',  '460px', '460px', 'rgba(0,120,120,0.18)',   'au3', '32s', '-17s',  70],
    /* Deep indigo — bottom-right */
    ['60%',  '68%',  '560px', '420px', 'rgba(48,14,112,0.22)',   'au4', '40s',  '-6s',  78],
    /* Burnt orange — top-left corner */
    ['-10%', '-5%',  '420px', '380px', 'rgba(190,70,16,0.20)',   'au5', '27s', '-13s',  72],
    /* Dusty magenta — bottom-center edge */
    ['30%',  '72%',  '440px', '340px', 'rgba(150,22,75,0.16)',   'au6', '34s', '-22s',  75],
  ];

  blobs.forEach(function (b) {
    var el = document.createElement('div');
    el.className = 'aurora-blob';
    el.style.cssText =
      'left:'       + b[0] + ';' +
      'top:'        + b[1] + ';' +
      'width:'      + b[2] + ';' +
      'height:'     + b[3] + ';' +
      'background:radial-gradient(ellipse at 50% 50%,' + b[4] + ' 0%,transparent 65%);' +
      'filter:blur(' + b[8] + 'px);' +
      'animation:'  + b[5] + ' ' + b[6] + ' ease-in-out infinite;' +
      'animation-delay:' + b[7] + ';';
    wrap.appendChild(el);
  });

  document.body.insertBefore(wrap, document.body.firstChild);

  /* Pause CSS animations when the tab is hidden — zero GPU cost in background */
  var auroraBlobs = wrap.querySelectorAll('.aurora-blob');
  document.addEventListener('visibilitychange', function () {
    var state = document.hidden ? 'paused' : 'running';
    auroraBlobs.forEach(function (el) {
      el.style.animationPlayState = state;
    });
  });
}());
