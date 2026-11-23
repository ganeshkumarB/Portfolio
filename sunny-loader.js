/* Sunny loader: on the first page of a visit, Sunny rises asleep in the middle of the
   screen, the sprout springs up, the eyes open with a blink and a blush, and Sunny
   flies to its corner where the real companion takes over. Plays once per session
   (sessionStorage "sunny:loaded"); add ?loader to the address to play it again.

   Self-contained: the character (a trimmed copy of Sunny's SVG, same coordinates and
   colours) and the few face rules it needs are inlined here, so the scene starts the
   moment the body opens, before sunny.js, sunny.css or any image has arrived. With
   the companion switched off in the preferences, or in Puppy-only mode, Sunny flies
   to the bottom-right corner and fades. Under reduced motion the loader shows Sunny
   awake and fades quickly.

   Loaded as the first script in <body>, synchronously. Everything is wrapped in
   try/catch: a failure removes the overlay. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement;
  var force = /[?&]loader(=|&|$)/.test(location.search);
  /* the first visit plays the longer story (sunny-story.js) instead; this short loader is for later visits */
  if (!force && doc.querySelector(".sst")) { try { sessionStorage.setItem("sunny:loaded", "1"); } catch (e) { /* ignore */ } return; }
  try { if (!force && sessionStorage.getItem("sunny:loaded")) return; } catch (e) { /* no storage: play once per load */ }
  try { sessionStorage.setItem("sunny:loaded", "1"); } catch (e) { /* ignore */ }

  function pref(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  /* the stored theme, applied early so the glow is right from the first frame (the page scripts set it again later) */
  var dark = pref("theme") === "dark";
  if (dark) html.setAttribute("data-theme", "dark");
  var reduced = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || pref("pref:motion") === "reduce";

  var INK = "#111111", SUN = "#FFC93C", DEEP = "#F2AE2E", SIZE = 260;
  /* Sunny, as drawn in sunny.js: shadow, feet, body, face (eyes, happy arcs, blush, smile, sleeping mouth), sprout, arms, zzz, nightcap */
  var ART = '<svg class="sl-svg" viewBox="0 0 220 220" aria-hidden="true" focusable="false" overflow="visible">' +
    '<defs><radialGradient id="sl-grad" cx="0.36" cy="0.3" r="0.78"><stop offset="0" stop-color="#FFE48A"/><stop offset="1" stop-color="#F2AE2E"/></radialGradient></defs>' +
    '<ellipse class="sl-shadow" cx="110" cy="207" rx="46" ry="6" fill="' + INK + '" fill-opacity="0.09"/>' +
    '<g class="sl-char">' +
      '<ellipse cx="92" cy="191" rx="12" ry="7" fill="' + DEEP + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<ellipse cx="128" cy="191" rx="12" ry="7" fill="' + DEEP + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<g class="sl-body">' +
        '<circle cx="110" cy="125" r="66" fill="url(#sl-grad)" stroke="' + INK + '" stroke-width="3"/>' +
        '<ellipse cx="80" cy="90" rx="14" ry="8" transform="rotate(-35 80 90)" fill="#fff" opacity="0.85"/>' +
        '<g class="sl-eyes">' +
          '<g class="sl-eye"><ellipse cx="93" cy="120" rx="8.5" ry="10.5" fill="' + INK + '"/><circle cx="96" cy="115" r="3.2" fill="#fff"/><circle cx="90" cy="124" r="1.6" fill="#fff"/></g>' +
          '<g class="sl-eye"><ellipse cx="127" cy="120" rx="8.5" ry="10.5" fill="' + INK + '"/><circle cx="130" cy="115" r="3.2" fill="#fff"/><circle cx="124" cy="124" r="1.6" fill="#fff"/></g>' +
          '<path class="sl-happy" d="M84 123 Q93 111 102 123" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
          '<path class="sl-happy" d="M118 123 Q127 111 136 123" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '</g>' +
        '<g class="sl-blush"><ellipse cx="72" cy="140" rx="8" ry="4.5" fill="#F6A3A3" opacity="0.85"/><ellipse cx="148" cy="140" rx="8" ry="4.5" fill="#F6A3A3" opacity="0.85"/></g>' +
        '<path class="sl-smile" d="M102 141 Q110 150 118 141" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle class="sl-o" cx="110" cy="145" r="4.5" fill="' + INK + '"/>' +
        '<g class="sl-sprout" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round">' +
          '<path d="M110 59 C113 50 105 45 108 35" fill="none"/>' +
          '<ellipse cx="97" cy="36" rx="10" ry="5.5" transform="rotate(-22 97 36)"/>' +
          '<ellipse cx="119" cy="31" rx="10" ry="5.5" transform="rotate(24 119 31)"/>' +
        '</g>' +
        '<g class="sl-cap"><path d="M52 92 Q110 40 172 88 L160 84 Q110 60 64 100 Z" fill="#4d8dff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="174" cy="90" r="7" fill="#fff" stroke="' + INK + '" stroke-width="2"/></g>' +
      '</g>' +
      '<ellipse cx="48" cy="132" rx="10" ry="15" transform="rotate(-15 48 132)" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<ellipse cx="172" cy="132" rx="10" ry="15" transform="rotate(15 172 132)" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2.5"/>' +
    '</g>' +
    '<g class="sl-zzz" fill="' + INK + '" font-family="JetBrains Mono, ui-monospace, monospace" font-weight="500"><text class="sl-z" x="158" y="70" font-size="12">z</text><text class="sl-z sl-z2" x="170" y="56" font-size="15">z</text><text class="sl-z sl-z3" x="184" y="40" font-size="19">Z</text></g>' +
  '</svg>';

  var EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)", SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  var css = '' +
    'html.sl-on { overflow: hidden !important; }' +
    'html.sl-on .sunny, html.sl-on .puppy { visibility: hidden !important; }' +
    '.sl { position: fixed; inset: 0; z-index: 2147483000; pointer-events: auto; }' +
    '.sl__bg { position: absolute; inset: 0; background: radial-gradient(60% 50% at 50% 46%, #fff3c9 0%, #fffaf0 55%, #ffffff 100%); opacity: 1; transition: opacity 0.55s ease; }' +
    '.sl--dark .sl__bg { background: radial-gradient(60% 50% at 50% 46%, #3a3220 0%, #1c1a16 50%, #0f1013 100%); }' +
    '.sl.is-leaving .sl__bg { opacity: 0; }' +
    '.sl__stage { position: absolute; left: 50%; top: 50%; width: ' + SIZE + 'px; height: ' + SIZE + 'px; margin: -' + (SIZE / 2) + 'px 0 0 -' + (SIZE / 2) + 'px; transform-origin: 50% 50%; opacity: 0; transform: translate(0, 48px) scale(0.9); will-change: transform, opacity; }' +
    '.sl__stage.is-up { opacity: 1; transform: translate(0, 0) scale(1); transition: transform 0.8s ' + EASE + ', opacity 0.6s ease; }' +
    '.sl__stage.is-flying { transition: transform 0.85s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease 0.6s; }' +
    '.sl__stage.is-fading { opacity: 0; }' +
    '.sl-svg { display: block; width: 100%; height: 100%; overflow: visible; }' +
    '.sl-svg * { transform-box: view-box; }' +
    '.sl-char { transform-origin: 110px 200px; animation: sl-breathe 3.4s ease-in-out infinite; }' +
    '.sl-eyes { transform-origin: 110px 120px; }' +
    '.sl-eye { transform-origin: 110px 120px; transition: transform 0.28s ' + SPRING + ', opacity 0.2s ease; }' +
    '.sl-happy, .sl-o, .sl-cap { opacity: 0; transition: opacity 0.2s ease; }' +
    '.sl-blush { transform-origin: 110px 140px; transition: transform 0.28s ' + SPRING + '; }' +
    '.sl-smile { transition: opacity 0.2s ease; }' +
    '.sl-sprout { transform-origin: 110px 59px; animation: sl-sway 3.2s ease-in-out infinite; }' +
    '.sl-zzz { opacity: 0; transition: opacity 0.25s ease; }' +
    '.sl-z { transform-origin: center; transform-box: fill-box; }' +
    /* asleep: eyes shut, mouth a small o, sprout drooped, zzz drifting */
    '.sl-asleep .sl-eye { transform: scaleY(0.1) translateY(6px); }' +
    '.sl-asleep .sl-smile { opacity: 0; } .sl-asleep .sl-o { opacity: 1; }' +
    '.sl-asleep .sl-sprout { animation-play-state: paused; transform: rotate(16deg); }' +
    '.sl-asleep .sl-char { animation: sl-droop 3.4s ease-in-out infinite; }' +
    '.sl-asleep .sl-zzz { opacity: 1; }' +
    '.sl-asleep .sl-z { animation: sl-float 2.4s ease-out infinite; } .sl-asleep .sl-z2 { animation-delay: -0.8s; } .sl-asleep .sl-z3 { animation-delay: -1.6s; }' +
    /* waking: the sprout springs, the eyes open and blink once */
    '.sl-wake .sl-sprout { animation: sl-spring 0.75s ' + SPRING + ' 1; }' +
    '.sl-wake .sl-eyes { animation: sl-blink 0.5s ease-in-out 1 0.45s; }' +
    /* a blush: happy arcs for eyes, cheeks up */
    '.sl-blushing .sl-eye { opacity: 0; } .sl-blushing .sl-happy { opacity: 1; }' +
    '.sl-blushing .sl-blush { transform: scale(1.7); }' +
    '.sl--dark .sl-cap { opacity: 1; }' +
    '@keyframes sl-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.012, 1.03); } }' +
    '@keyframes sl-droop { 0%, 100% { transform: rotate(0) scale(1, 0.98); } 50% { transform: rotate(5deg) scale(1.01, 1.03) translateY(6px); } }' +
    '@keyframes sl-sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }' +
    '@keyframes sl-float { 0% { opacity: 0; transform: translate(0, 6px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(6px, -16px); } }' +
    '@keyframes sl-spring { 0% { transform: rotate(16deg); } 55% { transform: rotate(-12deg); } 100% { transform: rotate(0); } }' +
    '@keyframes sl-blink { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.08); } }' +
    '@media (prefers-reduced-motion: reduce) { .sl-svg * { animation: none !important; } .sl__stage, .sl__stage.is-up, .sl__stage.is-flying { transition: opacity 0.3s ease !important; transform: none !important; } }';

  var style = doc.createElement("style"); style.textContent = css;
  var layer = doc.createElement("div"); layer.className = "sl" + (dark ? " sl--dark" : ""); layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<div class="sl__bg"></div><div class="sl__stage"><div class="sl-sunny' + (reduced ? '' : ' sl-asleep') + '">' + ART + '</div></div>';
  var stage = layer.lastChild, sunny = stage.firstChild;
  var body = doc.body || doc.currentScript.parentNode;
  body.insertBefore(style, body.firstChild);
  body.insertBefore(layer, style.nextSibling);
  html.classList.add("sl-on");

  var done = false, timers = [];
  function later(fn, ms) { timers.push(setTimeout(function () { try { fn(); } catch (e) { finish(); } }, ms)); }
  function finish() {
    if (done) return; done = true;
    timers.forEach(clearTimeout);
    html.classList.remove("sl-on");
    requestAnimationFrame(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); if (style.parentNode) style.parentNode.removeChild(style); });
  }
  /* is there a Sunny to hand over to? not when hidden in the preferences, not in Puppy-only mode */
  function companionOn() { return pref("pref:sunny") !== "off" && pref("pref:companion") !== "puppy" && !html.classList.contains("no-sunny"); }

  /* where Sunny lands: behind the hero card on a wide home page (as extras.js perches it), else the bottom-right corner */
  function target() {
    var bridge = doc.getElementById("bridge");
    if (bridge && !reduced && window.innerWidth >= 1081 && bridge.getBoundingClientRect().top > 180) {
      var b = bridge.getBoundingClientRect();
      return { left: b.right - 150 - 36, top: b.top - 150 * 0.78, width: 150, height: 150 };
    }
    var w = window.innerWidth < 720 ? 104 : 150;
    return { left: window.innerWidth - 12 - w, top: window.innerHeight - w, width: w, height: w };
  }
  function fly() {
    var r = target(), sx = window.innerWidth / 2, sy = window.innerHeight / 2;
    var tx = r.left + r.width / 2 - sx, ty = r.top + r.height / 2 - sy, k = r.width / SIZE;
    stage.classList.add("is-flying");
    stage.style.transform = "translate(" + tx.toFixed(1) + "px, " + ty.toFixed(1) + "px) scale(" + k.toFixed(3) + ")";
    layer.classList.add("is-leaving");
    stage.classList.add("is-fading"); /* the real Sunny shows through as the stand-in fades, a beat before the curtain lifts */
    if (!companionOn()) stage.style.transition = "transform 0.85s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease 0.3s";
    later(finish, 900);
  }

  try {
    if (reduced) {
      later(function () { stage.classList.add("is-up"); }, 30);
      later(function () { layer.classList.add("is-leaving"); stage.classList.add("is-fading"); later(finish, 500); }, 800);
    } else {
      later(function () { stage.classList.add("is-up"); }, 60);                                          /* rises, asleep */
      later(function () { sunny.classList.remove("sl-asleep"); sunny.classList.add("sl-wake"); }, 1400); /* the sprout springs up, the eyes open and blink */
      later(function () { sunny.classList.add("sl-blushing"); }, 1900);                                  /* a blush */
      later(function () { sunny.classList.remove("sl-blushing", "sl-wake"); fly(); }, 2800);            /* off to the corner */
    }
    /* belt and braces: nothing keeps the page covered for long */
    later(finish, 5000);
  } catch (e) { finish(); }
})();
