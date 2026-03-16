/* ============================================================
   MADHATTAN CO — ENDLESS ZOOM GRID
   Two grid layers cross-fade through a continuous scale(1)→scale(2)
   loop so the seam is always invisible.  The centre of the zoom
   tracks the viewport centre, giving a tunnel / pull-through feel.
   ============================================================ */

(function initZoomGrid() {
  'use strict';

  /* ── STYLES ─────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '.zm-wrap{',
      'position:fixed;inset:0;z-index:-1;',
      'pointer-events:none;overflow:hidden;',
    '}',

    '.zm-layer{',
      /* Oversized so the grid fills the viewport even at scale(2) */
      'position:absolute;top:-50%;left:-50%;',
      'width:200%;height:200%;',
      'background-image:',
        'linear-gradient(rgba(201,136,42,0.09) 1px,transparent 1px),',
        'linear-gradient(90deg,rgba(201,136,42,0.09) 1px,transparent 1px);',
      'background-size:80px 80px;',
      'transform-origin:50% 50%;',
      'opacity:0;',                  /* start invisible — prevents pre-animation static flash */
      'will-change:transform,opacity;',
    '}',

    '.zm-a{animation:zm-spin 6s linear infinite;}',
    '.zm-b{animation:zm-spin 6s linear infinite;animation-delay:-3s;}',

    '@keyframes zm-spin{',
      '0%  {transform:scale(1);opacity:0;}',
      '8%  {opacity:0.55;}',         /* fade in quickly */
      '88% {opacity:0.55;}',         /* hold */
      '100%{transform:scale(2);opacity:0;}', /* fade out, then snap back to scale(1) */
    '}',
  ].join('');
  document.head.appendChild(style);

  /* ── DOM ────────────────────────────────────────────────── */
  var wrap = document.createElement('div');
  wrap.className = 'zm-wrap';
  wrap.setAttribute('aria-hidden', 'true');

  ['zm-a', 'zm-b'].forEach(function (cls) {
    var el = document.createElement('div');
    el.className = 'zm-layer ' + cls;
    wrap.appendChild(el);
  });

  document.body.insertBefore(wrap, document.body.firstChild);
}());
