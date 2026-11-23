/* Sunny & Puppy: the loading story. On a visitor's first visit, before the site,
   a short film plays: a rainy evening, a frightened puppy, three bigger dogs, an
   umbrella, a warm room, a sunrise. Then the curtain lifts, Sunny and Puppy are in
   the corner together, and unless the visitor has chosen Puppy, Puppy says goodbye
   and walks home into a little doghouse on the left.

   It plays once per visitor (localStorage "sunny:story"); add ?story to the address
   to watch it again. Skip with the button or Escape. The page loads underneath and is
   never held back: the film is the welcome, not a wait.

   Sunny and Puppy are the site's own artwork, drawn by sunny.js (Sunny.art) and puppy.js
   (Puppy.art) and animated by their own face and act CSS in sunny.css. The street, the
   room, the bigger dogs, the umbrella, the scarf and the rest are scenery drawn here.
   Every sound is synthesised with Web Audio; sound is off unless the visitor has turned
   Sunny's sound on, and the Sound button turns it on for the film.

   Loaded as the first script in <body>, synchronously, so the night scene is up before
   the page paints. If the characters cannot be drawn within a few seconds the curtain
   simply lifts. Reduced motion shows one still per scene, faster, without rain. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement, win = window;
  var qs = (function () { try { return new URLSearchParams(location.search); } catch (e) { return { has: function () { return false; }, get: function () { return null; } }; } })();
  function pref(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  var force = qs.has("story");
  if (!force && pref("sunny:story") === "1") return;
  if (!force && pref("pref:sunny") === "off") return; /* the visitor sent the mascots away */
  var SELF = (doc.currentScript && doc.currentScript.src) || "sunny-story.js";
  var reduced = (win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches) || pref("pref:motion") === "reduce";
  var dark = pref("theme") === "dark";
  if (dark) html.setAttribute("data-theme", "dark");
  var W = 1600, H = 900, GY = 780, T_END = 66;

  /* ===================================================================== styles */
  var CSS = `
html.sl-on { overflow: hidden !important; }
html.sl-on body > .sunny, html.sl-on body > .puppy, html.sl-on .to-top { visibility: hidden !important; }
.sst { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; background: #08111f; color: #fff; font-family: "Inter", system-ui, sans-serif; transition: opacity 1.1s ease; -webkit-user-select: none; user-select: none; --font-d: "Space Grotesk", "Inter", sans-serif; --font-m: "JetBrains Mono", ui-monospace, monospace; }
.sst.is-out { opacity: 0; pointer-events: none; }
.sst-view { position: absolute; inset: 0; overflow: hidden; }
.sst-world { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; transform-origin: 0 0; will-change: transform; }
.sst-layer { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; }
.sst-sky { position: absolute; left: -500px; right: -500px; top: -1200px; height: 2100px; background: linear-gradient(to bottom, var(--skyT) 0%, var(--skyT) 52%, var(--skyB) 100%); }
.sst-clouds { position: absolute; inset: 0; }
.sst-cloud { position: absolute; border-radius: 50%; background: var(--cloudC); filter: blur(28px); opacity: var(--cloud); }
.sst-sun { position: absolute; width: 360px; height: 360px; margin: -180px 0 0 -180px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 243, 200, 1) 0 18%, rgba(255, 214, 120, 0.75) 30%, rgba(255, 196, 100, 0) 68%); opacity: var(--sun); }
.sst-rays { position: absolute; left: 700px; top: -200px; width: 1100px; height: 1100px; opacity: calc(var(--sun) * 0.45); pointer-events: none; mix-blend-mode: screen; }
.sst-rays i { position: absolute; left: 50%; top: 0; width: 120px; height: 1100px; margin-left: -60px; transform-origin: 50% 46%; background: linear-gradient(to bottom, rgba(255, 236, 190, 0), rgba(255, 236, 190, 0.5) 40%, rgba(255, 236, 190, 0)); filter: blur(14px); animation: sst-ray 7s ease-in-out infinite alternate; }
.sst-rays i:nth-child(1) { transform: rotate(28deg); } .sst-rays i:nth-child(2) { transform: rotate(44deg); width: 70px; animation-delay: -2s; } .sst-rays i:nth-child(3) { transform: rotate(60deg); animation-delay: -4s; }
@keyframes sst-ray { from { opacity: 0.55; } to { opacity: 1; } }
.sst-birds { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; opacity: var(--birds); pointer-events: none; }
.sst-bird { position: absolute; width: 26px; height: 12px; animation: sst-fly 16s linear infinite; }
.sst-bird svg { display: block; width: 100%; height: 100%; animation: sst-flap 0.42s ease-in-out infinite alternate; transform-origin: 50% 60%; }
@keyframes sst-fly { from { transform: translateX(-120px); } to { transform: translateX(1760px); } }
@keyframes sst-flap { from { transform: scaleY(1); } to { transform: scaleY(0.35); } }
.sst-street svg, .sst-room svg { position: absolute; left: 0; top: 0; overflow: visible; }
.c-far { fill: var(--far); } .c-mid { fill: var(--mid); } .c-near { fill: var(--near); } .c-neard { fill: var(--nearDark); }
.c-win { fill: var(--win); opacity: var(--winOn); } .c-wind { fill: var(--nearDark); opacity: 0.55; }
.c-walk { fill: var(--walk); } .c-curb { fill: var(--curb); } .c-road { fill: var(--road); }
.c-puddle { fill: var(--puddle); opacity: 0.5; } .c-post { fill: var(--post); } .c-box { fill: var(--box); } .c-boxd { fill: var(--boxD); }
.c-bulb { fill: #ffe7a8; opacity: var(--lampOn); } .c-reflect, .c-pool { opacity: calc(var(--lampOn) * 0.75); }
.sst-glow { position: absolute; width: 520px; height: 520px; margin: -260px 0 0 -260px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 214, 140, 0.55) 0%, rgba(255, 200, 120, 0.18) 32%, rgba(255, 200, 120, 0) 64%); mix-blend-mode: screen; pointer-events: none; }
.sst-cone { position: absolute; width: 360px; height: 300px; margin-left: -180px; background: linear-gradient(to bottom, rgba(255, 216, 150, 0.2), rgba(255, 216, 150, 0.03) 85%, rgba(255, 216, 150, 0)); clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%); mix-blend-mode: screen; pointer-events: none; }
.sst-spot { position: absolute; width: 900px; height: 520px; margin: -260px 0 0 -450px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 220, 160, 0.16), rgba(255, 220, 160, 0)); mix-blend-mode: screen; pointer-events: none; }
.sst-mist { position: absolute; left: -500px; width: 2600px; top: 560px; height: 300px; background: linear-gradient(to bottom, rgba(150, 172, 210, 0) 0%, rgba(var(--mistC), 0.24) 55%, rgba(var(--mistC), 0.07) 100%); pointer-events: none; animation: sst-mist 18s ease-in-out infinite alternate; }
@keyframes sst-mist { from { transform: translateX(-40px); } to { transform: translateX(40px); } }
.sst-room { position: absolute; left: 0; top: -900px; width: 1600px; height: 2700px; background: linear-gradient(to bottom, #efc08a 0, #f3c992 1500px, #f0c48d 1620px, #b9784a 1620px, #8f5a35 100%); opacity: 0; }
.sst-room > svg { top: 900px; }
.sst-room-rain { position: absolute; left: 212px; top: 1162px; width: 256px; height: 286px; background: repeating-linear-gradient(104deg, rgba(190, 210, 240, 0) 0 9px, rgba(190, 210, 240, 0.55) 9px 10px, rgba(190, 210, 240, 0) 10px 23px); background-size: 46px 140px; animation: sst-wrain 0.55s linear infinite; mix-blend-mode: screen; }
@keyframes sst-wrain { to { background-position: -14px 140px; } }
.sst-room-glow { position: absolute; left: 1160px; top: 1330px; width: 900px; height: 900px; margin: -450px 0 0 -450px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 196, 110, 0.5), rgba(255, 170, 90, 0.12) 40%, rgba(255, 170, 90, 0) 66%); mix-blend-mode: screen; animation: sst-flicker 3.2s ease-in-out infinite; }
@keyframes sst-flicker { 0%, 100% { opacity: 1; } 40% { opacity: 0.92; } 46% { opacity: 0.97; } 70% { opacity: 0.9; } }
.sst-actors { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; }
.sst-actor { position: absolute; left: 0; top: 0; will-change: transform, opacity; }
.sst-flip { position: absolute; inset: 0; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.sst-flip.is-flipped { transform: scaleX(-1); }
.sst-pose { position: absolute; inset: 0; transform-origin: 50% 94%; transition: transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1); }
.sst-over { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
html body .sst-actor .sunny, html body .sst-actor .puppy { display: block !important; visibility: visible !important; position: absolute; inset: 0; width: 100%; height: 100%; right: auto; bottom: auto; z-index: auto; pointer-events: none; --pp: 100%; transition: none; }
.sst-actor .sunny__char, .sst-actor .puppy__char { position: absolute; inset: 0; width: 100%; height: 100%; right: auto; bottom: auto; opacity: 1 !important; transform: none !important; translate: none !important; transition: none !important; pointer-events: none; cursor: default; }
.sst-actor .sunny__svg, .sst-actor .puppy__svg { width: 100%; height: 100%; transform: none !important; }
.sunny.st-slow[data-act="walk"] .s-char, .sunny.st-slow[data-act="walk"] .s-foot--l, .sunny.st-slow[data-act="walk"] .s-foot--r, .sunny.st-slow[data-act="walk"] .s-arm--l, .sunny.st-slow[data-act="walk"] .s-arm--r { animation-duration: 0.62s !important; }
.sunny.st-slow[data-act="walk"] .s-foot--r { animation-delay: -0.31s !important; }
.sunny.st-hold .s-arm--r { animation: none !important; transform: rotate(-26deg) !important; }
.sunny.st-reach .s-arm--r { animation: none !important; transform: rotate(-74deg) !important; }
.sunny.st-hug .s-arm--l { animation: none !important; transform: rotate(78deg) !important; }
.sunny.st-mend .s-arm--l { animation: none !important; transform: rotate(-38deg) !important; }
.sunny.st-mend .s-arm--r { animation: none !important; transform: rotate(38deg) !important; }
.sst-pose.st-sit { transform: translateY(9px) scale(1.04, 0.95); }
.sst-pose.st-bend { transform: rotate(9deg) translateY(4px); }
.sst-pose.st-breath { animation: sst-breath 1.5s ease-in-out 1; }
@keyframes sst-breath { 0%, 100% { transform: none; } 45% { transform: scale(1.06, 0.97) translateY(-3px); } 70% { transform: scale(0.98, 1.02); } }
.sst-pose.st-tremble { animation: sst-tremble 0.16s linear infinite alternate; }
@keyframes sst-tremble { from { transform: translateX(-1.2px); } to { transform: translateX(1.2px); } }
.sst-pose.st-shiver { animation: sst-shiver 0.11s linear infinite alternate; }
@keyframes sst-shiver { from { transform: translateX(-1px) scale(0.985, 0.99); } to { transform: translateX(1px) scale(0.985, 0.99); } }
.sst-pose.st-creep { animation: sst-creep 0.9s ease-in-out infinite; }
@keyframes sst-creep { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
.sst-pose.st-trot { animation: sst-trot 0.38s ease-in-out infinite alternate; }
@keyframes sst-trot { from { transform: translateY(0) rotate(-1.5deg); } to { transform: translateY(-5px) rotate(1.5deg); } }
.sst-pose.st-lean { transform: rotate(6deg) translateX(4px); }
.puppy.st-rest .p-head { --hr: 4deg; --hy: 12px; --hx: 5px; }
.sst-wet { opacity: 0; transition: opacity 1.2s ease; } .is-wet .sst-wet { opacity: 1; }
.sst-drip { animation: sst-drip 1.1s ease-in infinite; } .sst-drip:nth-child(2) { animation-delay: 0.45s; } .sst-drip:nth-child(3) { animation-delay: 0.8s; }
@keyframes sst-drip { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(18px); opacity: 0; } }
.sst-scarf-g, .sst-scarf-w, .sst-mendscarf { opacity: 0; transition: opacity 0.5s ease; }
.has-scarf-g .sst-scarf-g, .has-scarf-w .sst-scarf-w, .has-mend .sst-mendscarf { opacity: 1; }
.sst-dog .sst-pose { animation: sst-dogbreath 2.6s ease-in-out infinite; transform-origin: 50% 100%; }
.sst-dog .sst-pose.st-walk { animation: sst-dogwalk 0.5s ease-in-out infinite alternate; }
.sst-dog .sst-pose.st-loom { animation: sst-loom 2.4s ease-in-out infinite; }
.sst-dog .sst-pose.st-hesitate { animation: sst-dogbreath 1.1s ease-in-out infinite; }
@keyframes sst-dogbreath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.008, 1.02); } }
@keyframes sst-dogwalk { from { transform: translateY(0); } to { transform: translateY(-3px); } }
@keyframes sst-loom { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-5px); } }
.sst-dog .sst-over { filter: brightness(var(--dogB, 0.8)) saturate(0.88); }
.dg-head { transform-box: fill-box; transform-origin: 86% 72%; transition: transform 0.6s cubic-bezier(0.3, 1.3, 0.6, 1); }
.dg-tail { transform-box: fill-box; transform-origin: 4% 70%; transition: transform 0.6s ease; animation: dg-tailsway 2.8s ease-in-out infinite; }
@keyframes dg-tailsway { 0%, 100% { rotate: -3deg; } 50% { rotate: 3deg; } }
.dg-ear { transform-box: fill-box; transform-origin: 50% 100%; transition: transform 0.35s ease; }
.dg-leg { transform-box: fill-box; transform-origin: 50% 6%; }
.st-walk .dg-leg--a { animation: dg-step 0.5s ease-in-out infinite alternate; }
.st-walk .dg-leg--b { animation: dg-step 0.5s ease-in-out infinite alternate-reverse; }
@keyframes dg-step { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }
.dg-brow--u { opacity: 0; } .dg-brow { transition: opacity 0.3s ease; }
.dg-eye { transform-box: fill-box; transform-origin: center; transition: transform 0.3s ease; }
.st-loom .dg-head { transform: rotate(-7deg) translate(-5px, 7px); } .st-loom .dg-tail { transform: rotate(-14deg); } .st-loom .dg-ear { transform: rotate(-4deg); }
.st-hesitate .dg-head { transform: rotate(7deg) translate(5px, -4px); } .st-hesitate .dg-ear { transform: rotate(26deg); } .st-hesitate .dg-tail { transform: rotate(34deg); }
.st-hesitate .dg-brow--m, .st-leave .dg-brow--m { opacity: 0; } .st-hesitate .dg-brow--u, .st-leave .dg-brow--u { opacity: 1; }
.st-hesitate .dg-eye { transform: scale(1.18); }
.st-leave .dg-tail { transform: rotate(50deg); animation: none; } .st-leave .dg-ear { transform: rotate(20deg); } .st-leave .dg-head { transform: rotate(4deg) translateY(4px); }
.sst-towel .tw { animation: sst-rub 0.32s ease-in-out infinite alternate; }
@keyframes sst-rub { from { transform: translateX(-7px) rotate(-3deg); } to { transform: translateX(7px) rotate(3deg); } }
.sst-spark { position: absolute; width: 34px; height: 34px; margin: -17px 0 0 -17px; opacity: 0; pointer-events: none; }
.sst-spark.on { animation: sst-spark 0.9s ease-out 1; }
@keyframes sst-spark { 0% { opacity: 0; transform: scale(0.3) rotate(0); } 30% { opacity: 1; transform: scale(1.1) rotate(25deg); } 100% { opacity: 0; transform: scale(0.6) rotate(60deg); } }
.sst-rain { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; pointer-events: none; }
.sst-dip { position: absolute; inset: 0; opacity: 0; pointer-events: none; }
.sst-grade { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light; }
.sst-flash { position: absolute; inset: 0; background: #e8efff; opacity: 0; pointer-events: none; mix-blend-mode: screen; }
.sst-vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 55%, rgba(0, 0, 0, 0) 45%, rgba(4, 8, 16, 0.85) 100%); }
.sst-cap { position: absolute; left: 6%; right: 6%; top: 13%; margin: 0; text-align: center; font: 300 clamp(20px, 2.4vw, 38px)/1.25 var(--font-d); letter-spacing: -0.01em; color: var(--capC, #f5f7fb); text-shadow: 0 2px 22px var(--capS, rgba(0, 0, 0, 0.45)); opacity: 0; }
.sst-title { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-58%); text-align: center; opacity: 0; color: var(--capC, #3a2618); pointer-events: none; }
.sst-title h1 { margin: 0; font: 600 clamp(28px, 4.4vw, 64px)/1 var(--font-d); letter-spacing: 0.22em; padding-left: 0.22em; color: inherit; }
.sst-title p { margin: 18px 0 0; font: 400 clamp(14px, 1.4vw, 19px)/1.4 "Inter", system-ui, sans-serif; opacity: 0.8; color: inherit; }
.sst-ui { position: absolute; left: clamp(16px, 4vw, 48px); right: clamp(16px, 4vw, 48px); bottom: clamp(14px, 4vh, 36px); display: flex; align-items: center; gap: 14px; font: 500 11px/1 var(--font-m); letter-spacing: 0.08em; color: var(--uiC, rgba(255, 255, 255, 0.66)); }
.sst-track { position: relative; width: 92px; height: 2px; border-radius: 2px; background: var(--uiT, rgba(255, 255, 255, 0.16)); flex: none; }
.sst-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 2px; background: #ffc93c; }
.sst-fill::after { content: ""; position: absolute; right: -3px; top: -2px; width: 6px; height: 6px; border-radius: 50%; background: #ffe7a8; box-shadow: 0 0 10px 3px rgba(255, 201, 60, 0.6); }
.sst-line { flex: 1; font: 400 12px/1.3 "Inter", system-ui, sans-serif; letter-spacing: 0; }
.sst-btn { padding: 8px 2px; border: 0; background: none; color: inherit; font: inherit; letter-spacing: inherit; text-transform: uppercase; cursor: pointer; }
.sst-btn:hover, .sst-btn:focus-visible { color: var(--capC, #fff); outline: none; text-decoration: underline; text-underline-offset: 4px; }
.sst-btn[aria-pressed="true"] { color: #ffc93c; }
@media (max-width: 560px) { .sst-line { display: none; } .sst-ui { justify-content: space-between; } }
.sst.is-reduced .sst-pose, .sst.is-reduced .sst-actor *, .sst.is-reduced .sst-room-rain, .sst.is-reduced .sst-bird, .sst.is-reduced .sst-mist { animation: none !important; transition-duration: 0.01s !important; }
.sst.is-reduced .sst-flip { transition: none; }
.sst.is-still *, .sst.is-still .sst-flip, .sst.is-still .sst-pose { transition: none !important; }
`;

  /* ===================================================================== scenery */
  var BIRD = '<svg viewBox="0 0 26 12"><path d="M1 8Q7 1 13 8Q19 1 25 8" fill="none" stroke="#5a3d2a" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var DOM = `
<div class="sst-view"><div class="sst-world" data-r="world">
  <div class="sst-sky"></div>
  <div class="sst-clouds" data-r="clouds">
    <div class="sst-cloud" style="left:120px;top:60px;width:520px;height:150px"></div>
    <div class="sst-cloud" style="left:820px;top:20px;width:640px;height:170px"></div>
    <div class="sst-cloud" style="left:-200px;top:-200px;width:900px;height:260px"></div>
  </div>
  <div class="sst-rays"><i></i><i></i><i></i></div>
  <div class="sst-sun" data-r="sun" style="left:1270px;top:700px"></div>
  <div class="sst-birds"><div class="sst-bird" style="top:170px;animation-delay:-3s">${BIRD}</div><div class="sst-bird" style="top:205px;width:20px;animation-delay:-4.4s;animation-duration:19s">${BIRD}</div><div class="sst-bird" style="top:150px;width:18px;animation-delay:-9s;animation-duration:22s">${BIRD}</div></div>
  <div class="sst-layer sst-street" data-r="street">
    <svg width="1600" height="900" viewBox="0 0 1600 900" aria-hidden="true">
      <defs>
        <linearGradient id="sst-refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdca0" stop-opacity="0.6"/><stop offset="1" stop-color="#ffdca0" stop-opacity="0"/></linearGradient>
        <radialGradient id="sst-pool"><stop offset="0" stop-color="#ffd896" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd896" stop-opacity="0"/></radialGradient>
        <filter id="sst-blur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.6"/></filter>
      </defs>
      <g data-r="far" filter="url(#sst-blur)">
        <path class="c-far" d="M-200 760V520H70V470H140V540H210V430H260V400H300V430H360V500H430V455H520V520H600V420H660V380H700V420H760V480H840V440H900V505H980V410H1040V470H1100V430H1180V500H1260V450H1330V520H1400V430H1470V480H1540V440H1800V760Z"/>
        <g class="c-win" data-r="farWins"></g>
      </g>
      <g data-r="mid">
        <path class="c-mid" d="M560 760V560H700V520H820V575H920V540H1080V760Z"/>
        <g class="c-win" data-r="midWins"></g>
      </g>
      <path class="c-near" d="M100 760V470L330 380L560 470V760Z"/>
      <rect class="c-neard" x="455" y="392" width="34" height="64"/>
      <rect class="c-win" x="160" y="520" width="78" height="72" rx="4"/>
      <rect class="c-wind" x="420" y="520" width="78" height="72" rx="4"/>
      <path d="M196 520v72M160 556h78M456 520v72M420 556h78" stroke="var(--nearDark)" stroke-width="4"/>
      <rect class="c-neard" x="288" y="632" width="84" height="128" rx="6"/>
      <rect x="296" y="640" width="68" height="120" rx="4" fill="#3a2a22" opacity="0.85"/>
      <g data-r="door"><rect x="296" y="640" width="68" height="120" rx="4" class="c-near"/><rect x="304" y="650" width="52" height="46" rx="3" class="c-neard"/><circle cx="352" cy="706" r="3.5" fill="#c9a24a"/></g>
      <rect class="c-curb" x="278" y="756" width="104" height="8" rx="2"/>
      <path class="c-neard" d="M1080 760V360H1800V760Z"/>
      <rect class="c-near" x="1080" y="360" width="10" height="400" opacity="0.7"/>
      <g class="c-win" data-r="cornerWins"></g>
      <g class="c-mid" opacity="0.9"><rect x="1300" y="600" width="230" height="160" rx="3"/></g>
      <path d="M1300 620H1530M1300 642H1530M1300 664H1530M1300 686H1530M1300 708H1530M1300 730H1530" stroke="var(--nearDark)" stroke-width="3" opacity="0.8"/>
      <g transform="translate(1092 712)"><rect class="c-box" x="0" y="0" width="58" height="48" rx="3"/><path class="c-boxd" d="M0 0L14 -12H70L58 0Z"/><path class="c-boxd" d="M58 0L70 -12V36L58 48Z"/><path d="M8 18h40" stroke="var(--boxD)" stroke-width="3" opacity="0.6"/></g>
      <g transform="translate(640 0)"><rect class="c-post" x="-4" y="470" width="8" height="290"/><path d="M0 476 Q0 452 26 452" fill="none" stroke="var(--post)" stroke-width="6"/><path class="c-post" d="M14 452h26l-6 12h-14z"/><ellipse class="c-bulb" cx="27" cy="466" rx="8" ry="3.5"/></g>
      <g transform="translate(1240 0)"><rect class="c-post" x="-4" y="470" width="8" height="290"/><path d="M0 476 Q0 452 -26 452" fill="none" stroke="var(--post)" stroke-width="6"/><path class="c-post" d="M-14 452h-26l6 12h14z"/><ellipse class="c-bulb" cx="-27" cy="466" rx="8" ry="3.5"/></g>
      <rect class="c-walk" x="-500" y="760" width="2600" height="40"/>
      <rect class="c-curb" x="-500" y="798" width="2600" height="7"/>
      <rect class="c-road" x="-500" y="805" width="2600" height="1400"/>
      <ellipse class="c-pool" cx="667" cy="786" rx="190" ry="20" fill="url(#sst-pool)"/>
      <ellipse class="c-pool" cx="1213" cy="786" rx="190" ry="20" fill="url(#sst-pool)"/>
      <ellipse class="c-puddle" cx="470" cy="792" rx="112" ry="8"/>
      <ellipse class="c-puddle" cx="900" cy="784" rx="78" ry="6"/>
      <ellipse class="c-puddle" cx="1330" cy="790" rx="124" ry="8"/>
      <rect class="c-reflect" x="653" y="806" width="28" height="110" fill="url(#sst-refl)"/>
      <rect class="c-reflect" x="1199" y="806" width="28" height="110" fill="url(#sst-refl)"/>
    </svg>
  </div>
  <div class="sst-mist" data-r="mist"></div>
  <div class="sst-room" data-r="room">
    <svg width="1600" height="900" viewBox="0 0 1600 900" aria-hidden="true">
      <defs><linearGradient id="sst-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14213a"/><stop offset="1" stop-color="#2c4166"/></linearGradient></defs>
      <rect x="-500" y="596" width="2600" height="10" fill="#d9a66e" opacity="0.7"/>
      <rect x="196" y="246" width="288" height="318" rx="8" fill="#b57e4f"/>
      <rect x="212" y="262" width="256" height="286" rx="4" fill="url(#sst-glass)"/>
      <path d="M340 262v286M212 405h256" stroke="#b57e4f" stroke-width="8"/>
      <path d="M170 236 q40 150 0 340 h48 q-26 -170 0 -340z" fill="#e9876a"/>
      <path d="M510 236 q-40 150 0 340 h-48 q26 -170 0 -340z" fill="#e9876a"/>
      <rect x="150" y="226" width="380" height="14" rx="6" fill="#9a6a42"/>
      <g transform="translate(680 300)"><rect width="150" height="112" rx="6" fill="#8a5b38"/><rect x="10" y="10" width="130" height="92" rx="3" fill="#fff4dd"/><circle cx="75" cy="56" r="20" fill="#ffc93c" stroke="#111" stroke-width="2.5"/><path d="M75 36 c3 -9 -5 -12 -2 -20" fill="none" stroke="#111" stroke-width="2"/><circle cx="68" cy="54" r="2.4" fill="#111"/><circle cx="82" cy="54" r="2.4" fill="#111"/></g>
      <g transform="translate(1160 0)"><rect x="-4" y="430" width="8" height="300" fill="#6b4a30"/><ellipse cx="0" cy="730" rx="48" ry="9" fill="#6b4a30"/><path d="M-70 430 L-46 340 H46 L70 430 Z" fill="#ffe3a6" stroke="#c99a5c" stroke-width="3"/></g>
      <path d="M-500 720 H2100" stroke="#7d4c2c" stroke-width="3" opacity="0.5"/>
      <path d="M-500 770 H2100 M-500 830 H2100 M-500 900 H2100" stroke="#7d4c2c" stroke-width="2" opacity="0.35"/>
      <ellipse cx="740" cy="818" rx="400" ry="42" fill="#d9805a" opacity="0.9"/>
      <ellipse cx="740" cy="818" rx="360" ry="34" fill="none" stroke="#f3b38b" stroke-width="4" opacity="0.7"/>
      <g transform="translate(1340 770)"><ellipse cx="0" cy="10" rx="92" ry="22" fill="#a8693d"/><ellipse cx="0" cy="0" rx="80" ry="18" fill="#f1dfc4"/></g>
    </svg>
    <div class="sst-room-rain" data-r="roomRain"></div>
    <div class="sst-room-glow"></div>
  </div>
  <div class="sst-layer" data-r="glows">
    <div class="sst-cone" style="left:667px;top:466px"></div><div class="sst-cone" style="left:1213px;top:466px"></div>
    <div class="sst-glow" style="left:667px;top:470px"></div><div class="sst-glow" style="left:1213px;top:470px"></div>
    <div class="sst-spot" data-r="spot" style="left:1230px;top:730px"></div>
  </div>
  <div class="sst-actors" data-r="actors"></div>
  <canvas class="sst-rain" data-r="rain" width="1600" height="900"></canvas>
</div></div>
<div class="sst-grade" data-r="grade"></div>
<div class="sst-flash" data-r="flash"></div>
<div class="sst-vig" data-r="vig"></div>
<div class="sst-dip" data-r="dipW" style="background:#1d120b"></div>
<div class="sst-dip" data-r="dipG" style="background:#fff2d6"></div>
<p class="sst-cap" data-r="cap" aria-live="polite"></p>
<div class="sst-title" data-r="title"><h1>SUNNY &amp; PUPPY</h1><p>Some friendships begin with a little kindness.</p></div>
<div class="sst-ui"><span class="sst-track"><span class="sst-fill" data-r="fill"></span></span><span class="sst-line" data-r="line"></span><button class="sst-btn" type="button" data-r="snd" aria-pressed="false">Sound</button><button class="sst-btn" type="button" data-r="skip">Skip →</button></div>`;

  /* ===================================================================== mount the curtain now */
  var style = doc.createElement("style"); style.textContent = CSS;
  var story = doc.createElement("div");
  story.className = "sst" + (reduced ? " is-reduced" : "");
  story.setAttribute("role", "img");
  story.setAttribute("aria-label", "A short animated story: on a rainy evening Sunny finds a frightened puppy, stands up for him, takes him home, and the two become friends. Press Escape to skip.");
  story.innerHTML = DOM;
  var body = doc.body || doc.currentScript.parentNode;
  body.insertBefore(style, body.firstChild);
  body.insertBefore(story, style.nextSibling);
  html.classList.add("sl-on");
  var R = {}; Array.prototype.forEach.call(story.querySelectorAll("[data-r]"), function (e) { R[e.getAttribute("data-r")] = e; });
  var world = R.world, actorsEl = R.actors;

  (function windows() {
    function grid(g, x0, x1, y0, y1, dx, dy, seed) {
      var out = "", n = seed;
      for (var y = y0; y < y1; y += dy) for (var x = x0; x < x1; x += dx) { n = (n * 9301 + 49297) % 233280; if (n / 233280 < 0.42) out += '<rect x="' + x + '" y="' + y + '" width="' + (dx * 0.42) + '" height="' + (dy * 0.48) + '" rx="2"/>'; }
      g.innerHTML = out;
    }
    grid(R.farWins, -180, 1780, 450, 720, 34, 40, 7);
    grid(R.midWins, 580, 1070, 590, 730, 40, 46, 3);
    grid(R.cornerWins, 1110, 1780, 390, 580, 52, 58, 11);
  })();

  /* ===================================================================== timeline */
  function ease(e, u) {
    if (e === "lin") return u;
    if (e === "in") return u * u * u;
    if (e === "out") return 1 - Math.pow(1 - u, 3);
    if (e === "back") { var c = 1.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }
  function track(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) { var k = keys[i]; if (t <= k[0]) { var p = keys[i - 1], u = (t - p[0]) / ((k[0] - p[0]) || 1); return p[1] + (k[1] - p[1]) * ease(k[2], u); } }
    return keys[keys.length - 1][1];
  }
  function states(list, t) { var s = {}; for (var i = 0; i < list.length && list[i][0] <= t; i++) { var o = list[i][1]; for (var k in o) s[k] = o[k]; } return s; }
  function smooth(a, b, t) { var u = Math.max(0, Math.min(1, (t - a) / (b - a))); return u * u * (3 - 2 * u); }
  function winw(t, a, b, f) { f = f || 0.7; return smooth(a, a + f, t) * (1 - smooth(b - f, b, t)); }

  var BANDS_T = [0, 6, 13, 21, 30, 40, 49, 56, 66], TITLE_AT = 63.4;
  var LINES = ["A little walk in the rain…", "Sunny noticed someone…", "Someone needed help.", "Sunny decided to stay.", "A new friendship begins…", "A little warmth goes a long way.", "Finding a companion…", "Almost home…"];
  var CAPS = [[0.8, 5.4, "Just another rainy evening…"], [7.0, 12.4, "…until Sunny noticed someone."], [14.2, 20.4, "The little puppy needed help."], [22.0, 29.4, "Sunny wasn’t going to leave him behind."],
    [31.0, 39.4, "Sometimes, all you need is someone who stays."], [41.4, 48.4, "A little warmth changed everything."], [50.4, 55.6, "And Sunny found a friend."], [57.4, 60.6, "Yesterday, they were strangers."], [61.2, 66, "Today, neither is alone."]];
  var SUNNY_X = [[0, 120], [6, 700, "lin"], [8.2, 700], [11.8, 880], [15.8, 880], [16.9, 832], [22.2, 832], [24.4, 1300], [40.30, 1300], [40.31, 700], [44.4, 700], [45.3, 930], [46.6, 930], [47.4, 640], [47.9, 640], [49.0, 1020], [49.25, 1020], [49.26, 334], [50.0, 334], [53.2, 760, "lin"], [54.8, 760], [56.0, 960, "lin"], [66, 960]];
  var SUNNY_OP = [[0, 1], [49.25, 1], [49.26, 0], [49.95, 0], [50.25, 1]];
  var SUNNY_S = [
    [0, { act: "walk", slow: 1, hold: 1, emo: null, flip: false, look: [0.2, -0.2] }], [1.8, { look: [0.5, -0.5] }], [3.4, { look: [-0.4, -0.3] }], [4.6, { look: [0.3, 0] }],
    [6.0, { act: null }], [6.4, { look: [1, 0.35] }], [6.7, { emo: "curious" }], [8.2, { act: "walk", emo: null }], [11.8, { act: null, look: [1, 0.45] }],
    [13.6, { look: [1, -0.1] }], [15.0, { emo: "whoa" }], [15.8, { tremble: 1 }], [17.2, { emo: "confused" }], [20.2, { emo: null }],
    [21.0, { tremble: 0, breath: 1 }], [22.0, { breath: 0, emo: "focused" }], [22.2, { act: "walk", slow: 0 }], [24.4, { act: null, look: [1, 0] }],
    [28.0, { emo: null }], [28.8, { emo: "relaxed" }], [30.0, { emo: null, flip: true }], [30.9, { hold: 0, look: [1, 0.5] }],
    [31.2, { reach: 1 }], [33.0, { reach: 0 }], [33.3, { bend: 1, look: [1, 0.9] }], [33.9, { bend: 0 }], [34.2, { sit: 1, look: [1, 0.5] }], [37.6, { look: [1, 0.2] }], [38.8, { emo: "blush" }],
    [40.31, { sit: 0, emo: null, flip: true, reach: 1, act: null, look: [1, 0.6] }], [42.6, { reach: 0, emo: "laugh" }], [43.4, { emo: null, reach: 1, look: [1, 0.8] }], [44.0, { reach: 0 }],
    [44.4, { flip: false, act: "walk" }], [45.3, { act: null, sit: 1, mend: 1, look: [0, 0.8] }], [46.6, { sit: 0, mend: 0, flip: true, act: "walk" }], [47.4, { act: null, reach: 1, look: [1, 0.4] }], [47.6, { emo: "happy" }],
    [47.9, { reach: 0, flip: false, act: "walk", emo: null, look: [0.4, 0] }], [49.0, { act: null }],
    [49.26, { flip: false, act: null, look: [0.4, -0.5] }], [50.0, { act: "walk", slow: 1 }], [53.2, { act: null }], [53.3, { flip: true, look: [1, 0.3] }], [53.5, { emo: "happy" }], [53.9, { reach: 1 }],
    [54.6, { reach: 0, flip: false, emo: null }], [54.8, { act: "walk" }], [56.0, { act: null, look: [-0.6, 0.4] }], [56.3, { sit: 1 }], [57.4, { hug: 1, emo: "relaxed" }], [61.6, { emo: "sleepy" }]
  ];
  var UMB_ROT = [[0, -14], [15.9, -14], [16.7, 162], [24.3, 162], [24.75, 64, "back"], [30.4, 64], [30.85, -14]];
  var UMB_OPEN = [[0, 1], [15.9, 1], [16.6, 0.16], [24.35, 0.16], [24.8, 1, "back"]];
  var UMB_VIS = [[0, 1], [30.88, 1], [30.9, 0]];
  var PUP_X = [[0, 1185], [16.4, 1185], [17.4, 1166], [19.0, 1166], [19.8, 1152], [31.5, 1152], [32.4, 1112], [34.6, 1112], [36.0, 1168], [37.4, 1168], [38.4, 1198], [40.30, 1198], [40.31, 590], [44.0, 590], [44.8, 540],
    [47.9, 540], [49.0, 880], [49.25, 880], [49.26, 334], [51.0, 334], [53.2, 640, "lin"], [53.9, 640], [54.6, 702], [54.8, 702], [56.0, 846, "lin"], [56.5, 846], [57.3, 862], [66, 862]];
  var PUP_OP = [[0, 1], [49.25, 1], [49.26, 0], [50.9, 0], [51.2, 1]];
  var PUP_S = [
    [0, { emo: "sad", shiver: 1, wet: 1, scarf: "g", flip: true, look: [0, 0.6], act: null }], [6.9, { look: [-1, 0.1] }], [9.2, { emo: "scared", look: [-1, 0.2] }],
    [13.6, { flip: false, look: [1, 0] }], [17.4, { look: [1, -0.2] }], [22.6, { look: [-0.3, 0] }], [23.6, { look: [1, 0] }], [24.7, { emo: "surprised" }], [25.6, { emo: "scared" }], [27.6, { emo: "sad" }],
    [30.4, { look: [1, -0.3] }], [31.2, { emo: "scared" }], [32.4, { emo: "sad", look: [1, 0.1] }], [33.6, { look: [1, 0.7] }], [34.4, { emo: "curious" }], [34.6, { creep: 1 }], [36.0, { creep: 0, emo: null, act: "sniff" }],
    [37.4, { act: null, look: [1, -0.5], shiver: 0 }], [37.5, { creep: 1 }], [38.4, { creep: 0 }], [38.9, { emo: "happy" }], [39.3, { emo: null, act: "wag" }],
    [40.31, { emo: "shy", act: null, flip: false, scarf: "", look: [1, -0.3] }], [41.8, { emo: "happy" }], [42.5, { emo: null, act: "shake" }], [43.5, { act: null, wet: 0, look: [-0.6, 0.6] }],
    [44.0, { trot: 1 }], [44.8, { trot: 0, act: "sniff" }], [44.9, { emo: "happy" }], [46.4, { act: null, emo: null, look: [1, -0.3] }], [47.5, { scarf: "w", emo: "love" }], [47.9, { emo: "happy", act: "run" }], [49.0, { act: null }],
    [49.26, { emo: null, act: null, flip: false }], [51.0, { act: "run", emo: "happy" }], [53.2, { act: null, emo: null, look: [1, 0] }], [53.9, { act: "run", emo: "excited" }], [54.6, { act: null, emo: "happy" }],
    [54.8, { trot: 1, emo: null }], [56.0, { trot: 0 }], [56.5, { creep: 1 }], [57.3, { creep: 0, lean: 1, rest: 1 }], [57.6, { emo: "sleepy" }], [61.6, { emo: null, act: "sleep" }]
  ];
  var DOG_X = [
    [[0, 1900], [13.0, 1900], [15.4, 1330], [22.6, 1330], [24.0, 1525], [24.8, 1525], [25.4, 1570], [26.6, 1570], [29.0, 2160, "in"]],
    [[0, 2000], [13.4, 2000], [15.8, 1442], [22.7, 1442], [24.1, 1650], [24.9, 1650], [25.5, 1690], [26.9, 1690], [29.4, 2260, "in"]],
    [[0, 2100], [13.8, 2100], [16.2, 1560], [22.8, 1560], [24.2, 1780], [25.0, 1780], [25.6, 1810], [27.2, 1810], [29.7, 2360, "in"]]
  ];
  var DOG_S = [[[0, { walk: 1, flip: false }], [15.4, { walk: 0, loom: 1 }], [22.6, { walk: 1 }], [23.0, { loom: 0, hesitate: 1 }], [24.0, { walk: 0 }], [26.6, { hesitate: 0, walk: 1, flip: true, leave: 1 }]],
    [[0, { walk: 1, flip: false }], [15.8, { walk: 0, loom: 1 }], [22.7, { walk: 1 }], [23.1, { loom: 0, hesitate: 1 }], [24.1, { walk: 0 }], [26.9, { hesitate: 0, walk: 1, flip: true, leave: 1 }]],
    [[0, { walk: 1, flip: false }], [16.2, { walk: 0, loom: 1 }], [22.8, { walk: 1 }], [23.2, { loom: 0, hesitate: 1 }], [24.2, { walk: 0 }], [27.2, { hesitate: 0, walk: 1, flip: true, leave: 1 }]]];
  var CAM = [[0, 540, 520, 1.0], [6, 760, 520, 1.0], [8.2, 900, 520, 1.03], [12.5, 1000, 525, 1.06], [13.0, 1010, 525, 1.06], [15.6, 1180, 520, 1.0], [21, 1150, 520, 1.03], [24.4, 1260, 545, 1.12], [29.5, 1250, 555, 1.18],
    [30.5, 1222, 590, 1.3], [40.30, 1215, 605, 1.4], [40.31, 760, 540, 1.06], [49.25, 820, 530, 1.0], [49.26, 470, 520, 1.0], [53.2, 700, 525, 1.04], [56.0, 860, 545, 1.14], [66, 905, 575, 1.3]];
  var CAMX = CAM.map(function (c) { return [c[0], c[1]]; }), CAMY = CAM.map(function (c) { return [c[0], c[2]]; }), CAMZ = CAM.map(function (c) { return [c[0], c[3]]; });
  var RAIN = [[0, 1], [24, 1], [32, 0.78], [38, 0.5], [40.3, 0.38], [40.31, 0]];
  var WINDOW_RAIN = [[40.3, 0.5], [45, 0.32], [49.2, 0.12]];
  var WIND = [[0, 0.22], [13, 0.3], [21, 0.42], [30, 0.24], [40, 0.12]];
  var SPOT = [[0, 0], [20, 0], [24, 0.8], [38, 1], [40.3, 0]];
  var VIG = [[0, 0.6], [13, 0.68], [24, 0.85], [38, 0.7], [40.3, 0.42], [49.25, 0.42], [49.26, 0.36], [66, 0.2]];
  var DOOR = [[49.26, 1], [49.7, 1], [50.0, 0.16], [52.2, 0.16], [52.8, 1]];
  var SUN_Y = [[49.26, 820], [66, 330, "out"]];
  var DIP_W = [[39.6, 0], [40.15, 1], [40.5, 1], [41.2, 0]];
  var DIP_G = [[48.6, 0], [49.15, 1], [49.45, 1], [50.2, 0]];
  var FLASH = [[13.05, 0], [13.12, 0.32], [13.22, 0.04], [13.32, 0.2], [13.6, 0]];
  var KEY_T = [3.5, 11.6, 19.0, 25.8, 38.9, 47.6, 54.2, 64.6];

  var PAL = {
    night: { skyT: "#07101d", skyB: "#1b2f4b", far: "#12213a", mid: "#172a44", near: "#1c3050", nearDark: "#15253d", win: "#f2c46d", winOn: 0.8, walk: "#22314a", curb: "#2c3c57", road: "#131d2c", puddle: "#4a6c98", post: "#0d1522", box: "#4a3a2c", boxD: "#3a2d22", lampOn: 1, cloud: 0.85, cloudC: "#22324c", sun: 0, birds: 0, capC: "#f5f7fb", capS: "rgba(0,0,0,0.5)", uiC: "rgba(255,255,255,0.66)", uiT: "rgba(255,255,255,0.16)", grade: "rgba(40,80,160,0.30)", dogB: 0.74, refl: 0.28, mist: 1, mistC: "150,172,210" },
    soft: { skyT: "#141f35", skyB: "#3b4b67", far: "#1f3049", mid: "#25374f", near: "#2b3e59", nearDark: "#21334c", win: "#f6cc7a", winOn: 0.9, walk: "#33425a", curb: "#3d4d66", road: "#1e293a", puddle: "#5f7aa2", post: "#16202f", box: "#5a4634", boxD: "#463628", lampOn: 0.95, cloud: 0.65, cloudC: "#33435e", sun: 0, birds: 0, capC: "#f7f4ee", capS: "rgba(0,0,0,0.45)", uiC: "rgba(255,255,255,0.7)", uiT: "rgba(255,255,255,0.18)", grade: "rgba(170,120,80,0.16)", dogB: 0.82, refl: 0.24, mist: 0.7, mistC: "150,172,210" },
    room: { skyT: "#07101d", skyB: "#1b2f4b", far: "#12213a", mid: "#172a44", near: "#1c3050", nearDark: "#15253d", win: "#f2c46d", winOn: 0.8, walk: "#22314a", curb: "#2c3c57", road: "#131d2c", puddle: "#4a6c98", post: "#0d1522", box: "#4a3a2c", boxD: "#3a2d22", lampOn: 0, cloud: 0, cloudC: "#22324c", sun: 0, birds: 0, capC: "#3a2214", capS: "rgba(255,220,170,0.6)", uiC: "rgba(58,34,20,0.7)", uiT: "rgba(58,34,20,0.18)", grade: "rgba(255,150,70,0.22)", dogB: 1, refl: 0.07, mist: 0, mistC: "150,172,210" },
    dawn: { skyT: "#f0a77e", skyB: "#ffe0b2", far: "#d8a882", mid: "#cd9a76", near: "#c38d6b", nearDark: "#b17f61", win: "#ffe7b8", winOn: 0.25, walk: "#e0bd96", curb: "#d2ab85", road: "#b78f6e", puddle: "#ffe3b4", post: "#7c5f47", box: "#b98a5c", boxD: "#a2774f", lampOn: 0.3, cloud: 0.3, cloudC: "#ffd7b5", sun: 0.55, birds: 0.8, capC: "#3a2618", capS: "rgba(255,236,200,0.6)", uiC: "rgba(58,38,24,0.7)", uiT: "rgba(58,38,24,0.18)", grade: "rgba(255,170,100,0.16)", dogB: 0.95, refl: 0.15, mist: 0.55, mistC: "255,236,214" },
    gold: { skyT: "#ffcd78", skyB: "#fff1cf", far: "#ebc699", mid: "#e2b78a", near: "#d8aa7f", nearDark: "#c89971", win: "#fff1cc", winOn: 0.1, walk: "#efd2aa", curb: "#e2c096", road: "#c8a17b", puddle: "#fff3cf", post: "#8e6d50", box: "#c99a68", boxD: "#b0845a", lampOn: 0, cloud: 0.12, cloudC: "#fff0d8", sun: 1, birds: 1, capC: "#3a2618", capS: "rgba(255,240,210,0.7)", uiC: "rgba(58,38,24,0.72)", uiT: "rgba(58,38,24,0.18)", grade: "rgba(255,200,110,0.18)", dogB: 1, refl: 0.08, mist: 0.3, mistC: "255,240,220" }
  };
  var PAL_T = [[0, "night"], [24, "night"], [40.3, "soft"], [40.31, "room"], [49.25, "room"], [49.26, "dawn"], [58, "gold"], [66, "gold"]];
  function hex(c) { var m = /^#(..)(..)(..)$/.exec(c); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null; }
  function rgba(c) { var m = /rgba\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)/.exec(c.replace(/\s/g, "")); return m ? [+m[1], +m[2], +m[3], +m[4]] : null; }
  function trip(c) { var m = /^([\d.]+),([\d.]+),([\d.]+)$/.exec(c); return m ? [+m[1], +m[2], +m[3]] : null; }
  function mix(a, b, u) {
    if (typeof a === "number") return a + (b - a) * u;
    var A = hex(a), B = hex(b);
    if (A && B) return "rgb(" + Math.round(A[0] + (B[0] - A[0]) * u) + "," + Math.round(A[1] + (B[1] - A[1]) * u) + "," + Math.round(A[2] + (B[2] - A[2]) * u) + ")";
    A = rgba(a); B = rgba(b);
    if (A && B) return "rgba(" + Math.round(A[0] + (B[0] - A[0]) * u) + "," + Math.round(A[1] + (B[1] - A[1]) * u) + "," + Math.round(A[2] + (B[2] - A[2]) * u) + "," + (A[3] + (B[3] - A[3]) * u).toFixed(3) + ")";
    A = trip(a); B = trip(b);
    if (A && B) return Math.round(A[0] + (B[0] - A[0]) * u) + "," + Math.round(A[1] + (B[1] - A[1]) * u) + "," + Math.round(A[2] + (B[2] - A[2]) * u);
    return u < 0.5 ? a : b;
  }
  function palette(t) {
    var i = 0; while (i < PAL_T.length - 1 && PAL_T[i + 1][0] <= t) i++;
    var a = PAL_T[i], b = PAL_T[Math.min(i + 1, PAL_T.length - 1)];
    var u = b[0] > a[0] ? ease("io", Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])))) : 0;
    var A = PAL[a[1]], B = PAL[b[1]], out = {};
    for (var k in A) out[k] = mix(A[k], B[k], u);
    return out;
  }

  /* ===================================================================== actors (built once the art is ready) */
  var A = null, uid = 0;
  function uniq(svg) { var p = "sst" + (++uid) + "-"; return svg.replace(/id="([\w-]+)"/g, 'id="' + p + '$1"').replace(/url\(#([\w-]+)\)/g, "url(#" + p + "$1)").replace(/href="#([\w-]+)"/g, 'href="#' + p + '$1"'); }
  function umbrella() {
    return '<g class="u-root"><g class="u-tilt"><path d="M0 -6V-150" stroke="#111" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M0 0q0 14 -11 14q-7 0 -7 -7" fill="none" stroke="#111" stroke-width="3.2" stroke-linecap="round"/>' +
      '<g class="u-can"><path d="M-112 -128Q-104 -178 0 -188Q104 -178 112 -128Q98 -138 84 -128Q70 -138 56 -128Q42 -138 28 -128Q14 -138 0 -128Q-14 -138 -28 -128Q-42 -138 -56 -128Q-70 -138 -84 -128Q-98 -138 -112 -128Z" fill="#4d8dff" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M-86 -150Q-40 -178 0 -180" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.35"/>' +
      '<path d="M0 -188L-56 -129M0 -188L0 -129M0 -188L56 -129" stroke="#111" stroke-width="1.6" opacity="0.35"/><path d="M0 -188V-198" stroke="#111" stroke-width="3" stroke-linecap="round"/></g></g></g>';
  }
  function dogSVG(o) {
    var K = "#100B0E", S = ' stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
    var farEar = o.ear === "flop" ? "" : '<path class="dg-ear" d="M64 54L67 22L85 48Z" fill="' + o.dark + '"' + S + '/>';
    var ear = o.ear === "flop" ? '<path class="dg-ear" d="M82 52Q104 36 116 60Q120 84 106 88Q100 66 82 60Z" fill="' + o.dark + '"' + S + '/>'
      : '<g class="dg-ear"><path d="M80 56L92 14L110 50Z" fill="' + o.base + '"' + S + '/><path d="M87 50L92 27L102 49Z" fill="' + o.dark + '"/></g>';
    var scruff = o.scruff ? '<path d="M66 50L70 38L75 47L80 36L84 48Z" fill="' + o.base + '"' + S + '/>' : "";
    var saddle = o.saddle ? '<path d="M118 94Q166 82 214 96Q226 106 220 120Q176 106 126 114Q114 104 118 94Z" fill="' + o.dark + '"/>' : "";
    var tailTip = o.scruff ? '<path d="M240 74L250 62L248 76L258 70L250 82Z" fill="' + o.light + '"' + S + '/>' : "";
    return '<svg class="sst-over" viewBox="0 0 260 220" style="top:auto;bottom:0;height:100%" aria-hidden="true">' +
      '<path class="dg-leg dg-leg--a" d="M188 150Q200 170 198 204Q198 210 192 210L182 210Q178 210 180 204Q182 182 176 160Z" fill="' + o.dark + '"' + S + '/>' +
      '<path class="dg-leg dg-leg--b" d="M106 148L110 204Q110 210 104 210L96 210Q92 210 94 204L96 150Z" fill="' + o.dark + '"' + S + '/>' +
      '<g class="dg-tail"><path d="M214 104Q240 100 248 76Q252 66 244 68Q240 90 212 94Z" fill="' + o.base + '"' + S + '/>' + tailTip + '</g>' +
      '<path d="M86 112Q94 92 130 90Q178 86 214 96Q232 104 228 132Q224 156 196 160Q150 166 112 158Q88 150 86 112Z" fill="' + o.base + '"' + S + '/>' + saddle +
      '<path d="M112 152Q150 162 196 154Q176 164 132 163Q118 162 112 152Z" fill="' + o.light + '"/>' +
      '<path class="dg-leg dg-leg--b" d="M178 118Q212 114 220 144Q224 168 210 184L212 204Q212 211 204 211L188 211Q181 211 184 204L192 190Q176 170 174 144Z" fill="' + o.base + '"' + S + '/>' +
      '<path d="M98 62Q120 68 124 102Q120 136 100 146Q80 138 78 114Q76 84 98 62Z" fill="' + o.base + '"' + S + '/>' +
      '<path d="M82 110Q96 118 108 116Q104 132 96 140L92 132L86 140L84 128L78 132Q78 120 82 110Z" fill="' + o.light + '"/>' +
      '<g class="dg-leg dg-leg--a"><path d="M94 136Q112 132 118 148L120 203Q120 211 112 211L96 211Q88 211 91 204L98 194Q90 168 94 136Z" fill="' + o.base + '"' + S + '/><path d="M103 211v-5M111 211v-5" stroke="' + K + '" stroke-width="1.6"/></g>' +
      '<g class="dg-head">' + farEar +
        '<path d="M50 62Q70 40 98 50Q116 62 110 88Q104 106 82 110Q58 112 48 98Q44 78 50 62Z" fill="' + o.base + '"' + S + '/>' + scruff +
        '<path d="M52 74Q32 74 20 84Q12 92 16 101Q30 111 54 104Q60 90 52 74Z" fill="' + o.light + '"' + S + '/>' +
        '<path d="M22 101Q32 105 42 100" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/>' +
        '<ellipse cx="18" cy="88" rx="7" ry="5.6" fill="#1b1412"/><ellipse cx="16" cy="86" rx="2.2" ry="1.4" fill="#fff" opacity="0.45"/>' + ear +
        '<g class="dg-eye"><ellipse cx="64" cy="73" rx="5" ry="5.8" fill="#1b1412"/><circle cx="62.4" cy="71" r="1.7" fill="#fff"/></g>' +
        '<path class="dg-brow dg-brow--m" d="M54 65L73 60" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path class="dg-brow dg-brow--u" d="M55 61Q63 56 73 59" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '</g></svg>';
  }
  var SUN_SIZE = 190, PUP_SIZE = 120;
  function buildActors() {
    function makeActor(cls, size, inner, over) {
      var a = doc.createElement("div");
      a.className = "sst-actor " + cls; a.style.width = size + "px"; a.style.height = size + "px";
      a.innerHTML = '<div class="sst-flip"><div class="sst-pose">' + inner + (over || "") + "</div></div>";
      actorsEl.appendChild(a);
      return { el: a, flip: a.querySelector(".sst-flip"), pose: a.querySelector(".sst-pose"), size: size, last: {} };
    }
    function prop(cls, w, h, svg) { var e = doc.createElement("div"); e.className = "sst-actor " + cls; e.style.width = w + "px"; e.style.height = h + "px"; e.innerHTML = svg; actorsEl.appendChild(e); return { el: e, w: w, h: h, last: {} }; }
    var sunny = makeActor("sst-sunny", SUN_SIZE, '<div class="sunny is-in"><div class="sunny__char">' + uniq(win.Sunny.art()) + "</div></div>",
      '<svg class="sst-over" viewBox="0 0 220 220" aria-hidden="true"><g class="sst-mendscarf"><path d="M76 164q34 -10 68 0l2 11q-36 -8 -72 0z" fill="#de364d" stroke="#111" stroke-width="2" stroke-linejoin="round"/><path d="M100 167l3 3M108 166l3 3M116 166l3 3M124 167l3 3" stroke="#fff" stroke-width="1.5" opacity="0.85"/></g>' +
      '<g class="sst-umb" transform="translate(184 140)">' + umbrella() + "</g></svg>");
    var pup = makeActor("sst-pup", PUP_SIZE, '<div class="puppy is-in"><div class="puppy__char">' + uniq(win.Puppy.art()) + "</div></div>",
      '<svg class="sst-over" viewBox="0 0 220 220" aria-hidden="true">' +
      '<g class="sst-scarf-g"><path d="M92 199q16 -7 34 -3q14 3 26 -2l5 5l-4 3l6 4l-5 2q-15 5 -30 1q-16 -4 -32 2z" fill="#de364d" stroke="#111" stroke-width="2" stroke-linejoin="round"/><path d="M106 200q10 -2 20 1" stroke="#9e1f33" stroke-width="2" fill="none"/></g>' +
      '<g class="sst-scarf-w"><path d="M84 116Q128 133 178 117L180 127Q128 144 82 126Z" fill="#de364d" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><path d="M146 128q6 16 -1 30l11 2q6 -16 -1 -31z" fill="#de364d" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><circle cx="150" cy="130" r="5.5" fill="#c92a42" stroke="#111" stroke-width="2"/><path d="M160 121l4 2M167 119l4 2" stroke="#fff" stroke-width="1.4" opacity="0.85"/></g>' +
      '<g class="sst-wet"><path d="M112 60q8 -8 18 -6M150 70q6 -6 14 -4M100 150q6 -4 12 -2" fill="none" stroke="#dfe7f5" stroke-width="2.2" stroke-linecap="round" opacity="0.5"/>' +
      '<g fill="#a9c3ec"><path class="sst-drip" d="M128 126c-2.4 3.4 -2.4 5.4 0 5.4c2.4 0 2.4 -2 0 -5.4z"/><path class="sst-drip" d="M96 98c-2 3 -2 4.8 0 4.8c2 0 2 -1.8 0 -4.8z"/><path class="sst-drip" d="M170 112c-2 3 -2 4.8 0 4.8c2 0 2 -1.8 0 -4.8z"/></g></g></svg>');
    function dog(scale, o) { var a = makeActor("sst-dog", 250 * scale, dogSVG(o)); a.el.style.height = 212 * scale + "px"; a.h = 212 * scale; return a; }
    var dogs = [dog(1.0, { base: "#8b5e3c", dark: "#5e3d26", light: "#d9b48a", ear: "flop", scruff: 1 }), dog(0.92, { base: "#6f727b", dark: "#4a4d55", light: "#c9ccd2", ear: "point", scruff: 1 }), dog(1.12, { base: "#b5793f", dark: "#2a2421", light: "#e1b685", ear: "point", saddle: 1 })];
    var planted = prop("sst-planted", SUN_SIZE, SUN_SIZE, '<svg class="sst-over" viewBox="0 0 220 220" aria-hidden="true"><g transform="translate(110 216)"><g transform="rotate(-24)">' + umbrella().replace('<g class="u-root"><g class="u-tilt">', "<g><g>") + "</g></g></svg>");
    var biscuit = prop("sst-biscuit", 40, 18, '<svg viewBox="0 0 40 18" width="40" height="18" aria-hidden="true"><path d="M7 5a4 4 0 1 1 3 -3h20a4 4 0 1 1 3 3v8a4 4 0 1 1 -3 3h-20a4 4 0 1 1 -3 -3z" fill="#e8b06a" stroke="#111" stroke-width="1.8"/></svg>');
    var bowls = prop("sst-bowls", 130, 34, '<svg viewBox="0 0 130 34" width="130" height="34" aria-hidden="true"><path d="M4 12h52l-6 20h-40z" fill="#de364d" stroke="#111" stroke-width="2"/><ellipse cx="30" cy="12" rx="26" ry="5" fill="#9a5a2a" stroke="#111" stroke-width="2"/><path d="M72 12h52l-6 20h-40z" fill="#4d8dff" stroke="#111" stroke-width="2"/><ellipse cx="98" cy="12" rx="26" ry="5" fill="#bfe0ff" stroke="#111" stroke-width="2"/></svg>');
    var towel = prop("sst-towel", 140, 90, '<svg viewBox="0 0 140 90" width="140" height="90" aria-hidden="true"><g class="tw"><path d="M14 40Q70 2 126 40L132 76Q119 66 108 82Q96 64 84 80Q70 62 56 80Q44 64 32 82Q21 66 8 76Z" fill="#f6efe3" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 60Q70 40 124 60" stroke="#7fb0f5" stroke-width="6" fill="none" opacity="0.85"/><path d="M40 22Q70 10 100 22" stroke="#fff" stroke-width="5" fill="none" opacity="0.6" stroke-linecap="round"/></g></svg>');
    var SPARK = '<svg viewBox="0 0 34 34" width="34" height="34"><path d="M17 2L20 14L32 17L20 20L17 32L14 20L2 17L14 14Z" fill="#FFC93C" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    var sparks = [[33.9, "biscuit"], [44.0, "bowls"], [46.0, "mend"], [47.5, "neck"]].map(function (s) { var e = doc.createElement("div"); e.className = "sst-spark"; e.innerHTML = SPARK; actorsEl.appendChild(e); return { t: s[0], at: s[1], el: e, on: false }; });
    [dogs[2], dogs[1], dogs[0], biscuit, bowls, pup, planted, towel, sunny].forEach(function (a, i) { a.el.style.zIndex = i + 1; });
    sparks.forEach(function (s) { s.el.style.zIndex = 20; });
    return { sunny: sunny, pup: pup, dogs: dogs, planted: planted, biscuit: biscuit, bowls: bowls, towel: towel, sparks: sparks,
      sunnyRoot: sunny.el.querySelector(".sunny"), sunnyLook: sunny.el.querySelector(".s-look"), pupRoot: pup.el.querySelector(".puppy"), pupLooks: pup.el.querySelectorAll(".p-look"),
      umbTilt: sunny.el.querySelector(".u-tilt"), umbCan: sunny.el.querySelector(".u-can"), umbG: sunny.el.querySelector(".sst-umb") };
  }

  /* ===================================================================== render */
  var cssCache = {};
  function setVar(k, v) { if (cssCache[k] !== v) { cssCache[k] = v; story.style.setProperty("--" + k, v); } }
  function setCls(el, cls, on) { if (el.classList.contains(cls) !== !!on) el.classList.toggle(cls, !!on); }
  function setAttr(el, k, v) { if (v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); } else if (el.hasAttribute(k)) el.removeAttribute(k); }
  function place(a, x, footFrac, op, w, h) {
    w = w || a.size; h = h || a.size;
    var tf = "translate3d(" + (x - w / 2).toFixed(1) + "px," + (GY - h + h * footFrac).toFixed(1) + "px,0)";
    if (a.last.tf !== tf) { a.last.tf = tf; a.el.style.transform = tf; }
    var o = op == null ? 1 : +op.toFixed(3);
    if (a.last.op !== o) { a.last.op = o; a.el.style.opacity = o; a.el.style.visibility = o <= 0.001 ? "hidden" : "visible"; }
  }
  function lookAt(el, dx, dy, flipped, kx, ky, many) {
    var v = "translate(" + ((flipped ? -1 : 1) * dx * kx).toFixed(1) + "px," + (dy * ky).toFixed(1) + "px)";
    if (many) { for (var i = 0; i < el.length; i++) if (el[i].style.transform !== v) el[i].style.transform = v; } else if (el && el.style.transform !== v) el.style.transform = v;
  }
  function sceneOf(t) { for (var i = BANDS_T.length - 2; i >= 0; i--) if (t >= BANDS_T[i]) return i; return 0; }
  var capIdx = -1, lineIdx = -1, clock = 0, lastRefl = -1, umbRim = null, sunState = { x: 0 }, outdoor = 1, rainNow = 1, windNow = 0.2, heads = null;
  function render(tReal) {
    var t = reduced ? KEY_T[sceneOf(tReal)] : tReal;
    var P = palette(t);
    for (var k in P) setVar(k, P[k]);
    /* the camera, with a little handheld drift */
    var vw = story.clientWidth, vh = story.clientHeight;
    var cx = track(CAMX, t), cy = track(CAMY, t), z = track(CAMZ, t);
    if (!reduced) { cx += Math.sin(clock * 0.21) * 5; cy += Math.sin(clock * 0.27 + 1) * 3.5; }
    var fit = Math.min(Math.max(vw / W, vh / H), vw / 760), s = fit * z;
    var tx = vw / 2 - cx * s, ty = vh / 2 - cy * s;
    if (W * s >= vw) tx = Math.min(0, Math.max(vw - W * s, tx)); else tx = (vw - W * s) / 2;
    if (H * s >= vh) ty = Math.min(0, Math.max(vh - H * s, ty)); else ty = (vh - H * s) * 0.5;
    world.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + s.toFixed(4) + ")";
    /* depth: the far skyline and clouds lag behind the camera */
    R.far.setAttribute("transform", "translate(" + ((cx - 800) * 0.3).toFixed(1) + " 0)");
    R.mid.setAttribute("transform", "translate(" + ((cx - 800) * 0.12).toFixed(1) + " 0)");
    R.clouds.style.transform = "translateX(" + ((cx - 800) * 0.45).toFixed(1) + "px)";
    var inRoom = t >= 40.31 && t < 49.26; outdoor = inRoom ? 0 : 1;
    R.room.style.opacity = inRoom ? 1 : 0; R.street.style.visibility = inRoom ? "hidden" : "visible";
    R.glows.style.opacity = inRoom ? 0 : 1;
    R.spot.style.opacity = track(SPOT, t);
    R.roomRain.style.opacity = inRoom ? track(WINDOW_RAIN, t) : 0;
    rainNow = inRoom ? 0 : track(RAIN, t); windNow = track(WIND, t);
    R.door.setAttribute("transform", "translate(296 0) scale(" + track(DOOR, t).toFixed(3) + " 1) translate(-296 0)");
    R.sun.style.top = track(SUN_Y, t).toFixed(1) + "px";
    R.grade.style.background = P.grade;
    R.vig.style.opacity = track(VIG, t);
    R.dipW.style.opacity = track(DIP_W, t); R.dipG.style.opacity = track(DIP_G, t);
    R.mist.style.opacity = inRoom ? 0 : P.mist;
    R.flash.style.opacity = reduced ? 0 : track(FLASH, tReal);
    if (A) {
      var S = states(SUNNY_S, t), sx = track(SUNNY_X, t);
      place(A.sunny, sx, 13 / 220, track(SUNNY_OP, t));
      setAttr(A.sunnyRoot, "data-emotion", S.emo); setAttr(A.sunnyRoot, "data-act", S.act);
      setCls(A.sunnyRoot, "st-slow", S.slow); setCls(A.sunnyRoot, "st-hold", S.hold && track(UMB_VIS, t) > 0); setCls(A.sunnyRoot, "st-reach", S.reach); setCls(A.sunnyRoot, "st-hug", S.hug); setCls(A.sunnyRoot, "st-mend", S.mend);
      setCls(A.sunny.el, "has-mend", S.mend);
      setCls(A.sunny.pose, "st-sit", S.sit); setCls(A.sunny.pose, "st-bend", S.bend); setCls(A.sunny.pose, "st-tremble", S.tremble); setCls(A.sunny.pose, "st-breath", S.breath);
      setCls(A.sunny.flip, "is-flipped", S.flip);
      lookAt(A.sunnyLook, (S.look || [0, 0])[0], (S.look || [0, 0])[1], S.flip, 5, 4);
      var sway = reduced ? 0 : Math.sin(clock * 1.3) * 2.4 * (0.4 + windNow), uo = track(UMB_OPEN, t), uv = track(UMB_VIS, t), ur = track(UMB_ROT, t);
      A.umbTilt.setAttribute("transform", "rotate(" + (ur + sway).toFixed(2) + ")");
      A.umbCan.setAttribute("transform", "scale(" + uo.toFixed(3) + " 1)");
      A.umbG.style.opacity = uv;
      var Q = states(PUP_S, t), px = track(PUP_X, t);
      place(A.pup, px, 17 / 220, track(PUP_OP, t));
      setAttr(A.pupRoot, "data-emotion", Q.emo); setAttr(A.pupRoot, "data-act", Q.act);
      setCls(A.pupRoot, "st-rest", Q.rest);
      setCls(A.pup.el, "is-wet", Q.wet); setCls(A.pup.el, "has-scarf-g", Q.scarf === "g"); setCls(A.pup.el, "has-scarf-w", Q.scarf === "w");
      setCls(A.pup.pose, "st-shiver", Q.shiver); setCls(A.pup.pose, "st-creep", Q.creep); setCls(A.pup.pose, "st-trot", Q.trot); setCls(A.pup.pose, "st-lean", Q.lean);
      setCls(A.pup.flip, "is-flipped", Q.flip);
      lookAt(A.pupLooks, (Q.look || [0, 0])[0], (Q.look || [0, 0])[1], Q.flip, 22, 16, true);
      for (var d = 0; d < 3; d++) {
        var D = states(DOG_S[d], t), dg = A.dogs[d], dx = track(DOG_X[d], t);
        place(dg, dx, 8 / 220, t < 30.5 && !inRoom ? Math.min(1, Math.max(0, (2260 - dx) / 220)) : 0, dg.size, dg.h);
        setCls(dg.pose, "st-walk", D.walk); setCls(dg.pose, "st-loom", D.loom); setCls(dg.pose, "st-hesitate", D.hesitate); setCls(dg.pose, "st-leave", D.leave); setCls(dg.flip, "is-flipped", D.flip);
      }
      var ra = Math.round(P.refl * 100) / 100;
      if (ra !== lastRefl) {
        lastRefl = ra;
        [[A.sunny, 22], [A.pup, 19], [A.dogs[0], 15], [A.dogs[1], 14], [A.dogs[2], 17], [A.planted, 8]].forEach(function (r) {
          var v = ra > 0.01 ? "below -" + r[1] + "px linear-gradient(transparent 52%, rgba(255,255,255," + ra + "))" : "none";
          r[0].el.style.webkitBoxReflect = v; r[0].el.style.boxReflect = v;
        });
      }
      sunState = { x: sx, act: S.act, slow: S.slow, op: track(SUNNY_OP, t) };
      umbRim = null;
      if (uv > 0.5 && uo > 0.75 && !inRoom) {
        var rr = ur * Math.PI / 180, kk = SUN_SIZE / 220, left = sx - SUN_SIZE / 2, top = GY - SUN_SIZE + SUN_SIZE * 13 / 220;
        umbRim = [-1, 1].map(function (side) {
          var lx = side * 112 * uo, ly = -128, vx = 184 + lx * Math.cos(rr) - ly * Math.sin(rr), vy = 140 + lx * Math.sin(rr) + ly * Math.cos(rr);
          if (S.flip) vx = 220 - vx; return [left + vx * kk, top + vy * kk];
        });
      }
      /* heads in the open rain, for the splashes: Sunny when his umbrella is down, Puppy unless the umbrella covers him */
      heads = [];
      if (!inRoom) {
        if (!(uv > 0.5 && uo > 0.75) && track(SUNNY_OP, t) > 0.5) heads.push([sx, GY - 150, 38]);
        if (!(t >= 30.9 && t < 40.3) && track(PUP_OP, t) > 0.5) heads.push([px + (Q.flip ? -6 : 6), GY - 98, 20]);
      }
      place(A.planted, px + 52, 4 / 220, t >= 30.9 && t < 40.3 ? 1 : 0, SUN_SIZE, SUN_SIZE);
      place(A.biscuit, 1192, 0.2, t >= 33.8 && t < 36.8 ? (t < 36.2 ? 1 : 1 - (t - 36.2) / 0.6) : 0, 40, 18);
      place(A.bowls, 506, 0.25, inRoom && t >= 44.0 ? 1 : 0, 130, 34);
      place(A.towel, px + 10, -0.5, inRoom && t >= 40.6 && t < 42.4 ? 1 : 0, 140, 90);
      A.sparks.forEach(function (sp) {
        var on = t >= sp.t && t < sp.t + 0.9;
        if (on && !sp.on) {
          var x = sp.at === "biscuit" ? 1192 : sp.at === "bowls" ? 506 : sp.at === "mend" ? 930 : px + 18, y = sp.at === "biscuit" ? GY - 18 : sp.at === "bowls" ? GY - 30 : sp.at === "mend" ? GY - 70 : GY - 62;
          sp.el.style.left = x + "px"; sp.el.style.top = y + "px"; sp.el.classList.remove("on"); void sp.el.offsetWidth; sp.el.classList.add("on");
        }
        if (!on && sp.on) sp.el.classList.remove("on");
        sp.on = on;
      });
    }
    var ci = -1, ca = 0;
    for (var c = 0; c < CAPS.length; c++) { var w = winw(tReal, CAPS[c][0], CAPS[c][1], 0.8); if (w > 0.001) { ci = c; ca = w; } }
    if (ci !== capIdx && ci >= 0) { capIdx = ci; R.cap.textContent = CAPS[ci][2]; }
    R.cap.style.opacity = A ? (ci >= 0 ? ca : 0) * (1 - smooth(TITLE_AT, TITLE_AT + 0.8, tReal)) : 0;
    R.title.style.opacity = smooth(TITLE_AT, TITLE_AT + 1.2, tReal);
    var li = sceneOf(tReal); if (li !== lineIdx) { lineIdx = li; R.line.textContent = LINES[li]; }
    R.fill.style.width = Math.min(100, tReal / T_END * 100).toFixed(1) + "%";
  }

  /* ===================================================================== rain */
  var cv = R.rain, g2 = cv.getContext("2d"), drops = [], fx = [], drips = [], dripT = 0, stepT = 0;
  var PUDDLES = [[470, 792, 112, 8], [900, 784, 78, 6], [1330, 790, 124, 8]];
  function newDrop(scatter) {
    var near = Math.random() < 0.3;
    return { near: near, x: Math.random() * (W + 300) - 150, y: scatter ? Math.random() * H : -20 - Math.random() * 220, v: near ? 1350 + Math.random() * 450 : 820 + Math.random() * 320,
      l: near ? 24 + Math.random() * 16 : 10 + Math.random() * 9, a: near ? 0.26 + Math.random() * 0.2 : 0.1 + Math.random() * 0.12, w: near ? 1.7 : 0.9, floor: near ? GY + 20 + Math.random() * 110 : GY - 30 + Math.random() * 60 };
  }
  function splash(x, y, big, max) { fx.push({ k: "s", x: x, y: y, life: 0, max: max || (big ? 0.26 : 0.18), big: big }); }
  function rainStep(dt) {
    g2.clearRect(0, 0, W, H);
    if (reduced) return;
    var want = Math.round(460 * rainNow);
    while (drops.length < want) drops.push(newDrop(drops.length < want * 0.5));
    g2.lineCap = "round";
    var slant = 0.16 + windNow * 0.5 + Math.sin(clock * 0.35) * 0.05;
    for (var i = drops.length - 1; i >= 0; i--) {
      var p = drops[i];
      p.y += p.v * dt; p.x -= p.v * dt * slant;
      if (p.y >= p.floor) { if (Math.random() < (p.near ? 0.8 : 0.35)) splash(p.x, p.floor, p.near); if (drops.length > want) { drops.splice(i, 1); continue; } drops[i] = newDrop(false); continue; }
      g2.strokeStyle = "rgba(205,220,245," + p.a + ")"; g2.lineWidth = p.w;
      g2.beginPath(); g2.moveTo(p.x, p.y); g2.lineTo(p.x + p.l * slant, p.y - p.l); g2.stroke();
    }
    dripT -= dt;
    if (umbRim && rainNow > 0.1 && dripT <= 0) { dripT = 0.09 + Math.random() * 0.12; var e = umbRim[Math.random() < 0.5 ? 0 : 1]; drips.push({ x: e[0] + (Math.random() * 6 - 3), y: e[1] + 2, v: 60 }); }
    g2.fillStyle = "rgba(200,218,246,0.7)";
    for (var d = drips.length - 1; d >= 0; d--) {
      var q = drips[d]; q.v += 1600 * dt; q.y += q.v * dt;
      if (q.y >= GY) { splash(q.x, GY, 0, 0.2); drips.splice(d, 1); continue; }
      g2.beginPath(); g2.ellipse(q.x, q.y, 1.3, 3.2, 0, 0, Math.PI * 2); g2.fill();
    }
    if (heads && rainNow > 0.2) heads.forEach(function (h) { if (Math.random() < rainNow * dt * 9) splash(h[0] + (Math.random() * 2 - 1) * h[2], h[1] + Math.random() * 6, 0, 0.16); });
    stepT -= dt;
    if (outdoor && rainNow > 0.15 && sunState.act === "walk" && sunState.op > 0.5 && stepT <= 0) { stepT = sunState.slow ? 0.31 : 0.21; for (var n = 0; n < 3; n++) splash(sunState.x + (Math.random() * 30 - 15), GY + 2, 1, 0.3); }
    if (outdoor && Math.random() < rainNow * dt * 30) { var pd = PUDDLES[(Math.random() * 3) | 0]; fx.push({ k: "r", x: pd[0] + (Math.random() * 2 - 1) * pd[2] * 0.8, y: pd[1] + (Math.random() * 2 - 1) * pd[3] * 0.4, life: 0, max: 0.9 }); }
    for (var j = fx.length - 1; j >= 0; j--) {
      var f = fx[j]; f.life += dt; var u = f.life / f.max;
      if (u >= 1) { fx.splice(j, 1); continue; }
      if (f.k === "s") { var sz = f.big ? 1.6 : 1; g2.lineWidth = f.big ? 1.3 : 0.9; g2.strokeStyle = "rgba(210,225,248," + (0.45 * (1 - u)) + ")"; g2.beginPath(); g2.moveTo(f.x - (4 + u * 6) * sz, f.y - u * 7 * sz); g2.lineTo(f.x - 1, f.y); g2.moveTo(f.x + (4 + u * 6) * sz, f.y - u * 7 * sz); g2.lineTo(f.x + 1, f.y); g2.stroke(); }
      else { g2.lineWidth = 1; g2.strokeStyle = "rgba(220,232,250," + (0.45 * (1 - u)) + ")"; g2.beginPath(); g2.ellipse(f.x, f.y, 4 + u * 26, 1 + u * 3.4, 0, 0, Math.PI * 2); g2.stroke(); }
    }
  }

  /* ===================================================================== sound */
  var soundOn = pref("sunny:sound") === "on", ac = null, master = null, beds = {}, noiseBuf = null, brownBuf = null;
  function audio() {
    if (ac) return ac;
    var AC = win.AudioContext || win.webkitAudioContext; if (!AC) return null;
    ac = new AC();
    var comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3.5; comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = soundOn ? 0.9 : 0; master.connect(comp);
    var len = ac.sampleRate * 2; noiseBuf = ac.createBuffer(1, len, ac.sampleRate); var dd = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) dd[i] = Math.random() * 2 - 1;
    brownBuf = ac.createBuffer(1, len, ac.sampleRate); var b = brownBuf.getChannelData(0), last = 0;
    for (var k = 0; k < len; k++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; b[k] = last * 3.5; }
    beds.hiss = bed(noiseBuf, "bandpass", 5200, 0.5); beds.patter = bed(noiseBuf, "lowpass", 900, 0.7); beds.wind = bed(brownBuf, "lowpass", 420, 0.8);
    beds.pad = ac.createGain(); beds.pad.gain.value = 0; beds.pad.connect(master);
    [261.6, 329.6, 392, 493.9].forEach(function (fr, n) { var o = ac.createOscillator(); o.type = "sine"; o.frequency.value = fr / 2; var g = ac.createGain(); g.gain.value = 0.25 / (n + 1); o.connect(g); g.connect(beds.pad); o.start(); });
    return ac;
  }
  function bed(buf, type, freq, q) { var src = ac.createBufferSource(); src.buffer = buf; src.loop = true; var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; var g = ac.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(master); src.start(0, Math.random()); return g; }
  function live() { return soundOn && ac && ac.state === "running"; }
  function noise(dur, type, freq, q, vol, at, sweepTo, brown) {
    if (!live()) return; var t = ac.currentTime + (at || 0);
    var src = ac.createBufferSource(); src.buffer = brown ? brownBuf : noiseBuf;
    var f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }
  function voice(o) {
    if (!live()) return; var t = ac.currentTime + (o.at || 0), dur = o.dur;
    var osc = ac.createOscillator(); osc.type = o.type || "sawtooth";
    o.f.forEach(function (pt, i) { if (i === 0) osc.frequency.setValueAtTime(pt[1], t + pt[0]); else osc.frequency.exponentialRampToValueAtTime(pt[1], t + pt[0]); });
    if (o.vib) { var lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + dur + 0.1); }
    var env = ac.createGain(); env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(o.vol, t + (o.a || 0.01)); env.gain.setValueAtTime(o.vol, t + Math.max(o.a || 0.01, dur - (o.r || 0.08))); env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var out = env;
    if (o.am) { var amp = ac.createGain(), am = ac.createOscillator(), ad = ac.createGain(); amp.gain.value = 0.55; am.frequency.value = o.am; ad.gain.value = 0.45; am.connect(ad); ad.connect(amp.gain); am.start(t); am.stop(t + dur + 0.1); env.connect(amp); out = amp; }
    osc.connect(env);
    (o.form || [[1500, 3, 1]]).forEach(function (fm) { var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = fm[0]; bp.Q.value = fm[1]; var fg = ac.createGain(); fg.gain.value = fm[2]; out.connect(bp); bp.connect(fg); fg.connect(master); });
    if (o.low) { var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = o.low[0]; var lg2 = ac.createGain(); lg2.gain.value = o.low[1]; out.connect(lp); lp.connect(lg2); lg2.connect(master); }
    osc.start(t); osc.stop(t + dur + 0.05);
    if (o.breath) noise(dur * 0.9, "highpass", 2600, 0.7, o.breath, o.at);
  }
  var SND = {
    whimper: function (at) { voice({ at: at, type: "triangle", f: [[0, 880], [0.2, 1330], [0.42, 1180], [0.66, 760]], vib: [7, 26], form: [[1450, 3, 1.1], [3000, 4, 0.35]], vol: 0.09, dur: 0.7, a: 0.07, r: 0.2, breath: 0.012 }); },
    whimperFear: function (at) { voice({ at: at, type: "triangle", f: [[0, 1050], [0.14, 1520], [0.3, 1380], [0.5, 1000]], vib: [11, 40], form: [[1700, 3, 1.1], [3300, 4, 0.4]], vol: 0.1, dur: 0.52, a: 0.04, r: 0.16, breath: 0.015 }); SND.whimper((at || 0) + 0.62); },
    whine: function (at) { voice({ at: at, type: "triangle", f: [[0, 700], [0.26, 1080], [0.44, 1260]], vib: [6, 18], form: [[1400, 3, 1]], vol: 0.08, dur: 0.48, a: 0.08, r: 0.14, breath: 0.01 }); },
    barkScared: function (at) { voice({ at: at, f: [[0, 980], [0.02, 1260], [0.1, 720]], form: [[1750, 5, 1], [3200, 6, 0.45]], vol: 0.075, dur: 0.12, a: 0.004, r: 0.07 }); noise(0.05, "bandpass", 2700, 1, 0.03, at); },
    barkHappy: function (at) { voice({ at: at, f: [[0, 760], [0.025, 1020], [0.12, 620]], form: [[1500, 4, 1], [2900, 5, 0.5]], vol: 0.1, dur: 0.15, a: 0.004, r: 0.08 }); noise(0.06, "bandpass", 2300, 1, 0.035, at); },
    yips: function (at) { at = at || 0; SND.barkHappy(at); SND.barkHappy(at + 0.2); voice({ at: at + 0.42, f: [[0, 1150], [0.05, 1350], [0.09, 950]], form: [[1900, 5, 1]], vol: 0.07, dur: 0.1, a: 0.003, r: 0.05 }); },
    pant: function (at, n, fast) { at = at || 0; n = n || 7; var gap = fast ? 0.15 : 0.2; for (var i = 0; i < n; i++) noise(0.1, "bandpass", i % 2 ? 1100 : 1500, 0.9, i % 2 ? 0.02 : 0.03, at + i * gap); },
    sniff: function (at) { at = at || 0; for (var i = 0; i < 3; i++) noise(0.045, "highpass", 2400, 0.8, 0.035, at + i * 0.09); },
    crunch: function (at) { at = at || 0; for (var i = 0; i < 6; i++) noise(0.03, "highpass", 1700 + Math.random() * 900, 0.6, 0.03, at + i * 0.13 + Math.random() * 0.04); },
    sigh: function (at) { noise(0.85, "lowpass", 1300, 0.7, 0.05, at, 380); voice({ at: (at || 0) + 0.05, type: "sine", f: [[0, 430], [0.7, 300]], form: [[600, 1, 0.5]], vol: 0.025, dur: 0.75, a: 0.15, r: 0.4 }); },
    sleep: function (at) { noise(1.2, "lowpass", 520, 0.6, 0.035, at, 300); noise(1.4, "lowpass", 380, 0.6, 0.022, (at || 0) + 1.3, 260); },
    shake: function (at) { at = at || 0; for (var i = 0; i < 9; i++) noise(0.05, "bandpass", 1800, 0.8, 0.03, at + i * 0.055); },
    rub: function (at) { at = at || 0; for (var i = 0; i < 8; i++) noise(0.14, "bandpass", 2100, 0.6, 0.028, at + i * 0.17); },
    growl: function (at, dur) { dur = dur || 1.6; voice({ at: at, f: [[0, 82], [dur * 0.5, 96], [dur, 78]], am: 23, form: [[480, 1.2, 1.1], [900, 2, 0.45]], low: [380, 0.8], vol: 0.13, dur: dur, a: 0.3, r: 0.5 }); noise(dur, "lowpass", 360, 0.7, 0.04, at, null, true); },
    bigBark: function (at) { voice({ at: at, f: [[0, 240], [0.03, 330], [0.22, 170]], form: [[700, 3, 1], [1500, 4, 0.6], [2600, 5, 0.22]], low: [500, 0.6], vol: 0.15, dur: 0.26, a: 0.006, r: 0.12 }); noise(0.12, "bandpass", 900, 1, 0.05, at); },
    huff: function (at) { noise(0.35, "bandpass", 650, 0.8, 0.06, at, 380); },
    yelp: function (at) { voice({ at: at, f: [[0, 300], [0.08, 460], [0.16, 400]], form: [[800, 3, 1], [1700, 4, 0.4]], vol: 0.1, dur: 0.18, a: 0.006, r: 0.08 }); },
    paws: function (at, n, soft) { at = at || 0; for (var i = 0; i < (n || 8); i++) noise(0.05, "bandpass", 900, 0.8, soft ? 0.015 : 0.028, at + i * 0.25 + (i % 2) * 0.06); },
    thunder: function (at) { noise(0.4, "highpass", 900, 0.5, 0.05, at); noise(3.4, "lowpass", 220, 0.6, 0.32, (at || 0) + 0.1, 70, true); },
    creak: function (at) { voice({ at: at, f: [[0, 170], [0.3, 230], [0.6, 150]], am: 31, form: [[900, 6, 1], [1900, 8, 0.4]], vol: 0.04, dur: 0.65, a: 0.05, r: 0.2 }); },
    birds: function (at) { at = at || 0; [0, 0.16, 0.3, 0.9, 1.04].forEach(function (d, i) { voice({ at: at + d, type: "sine", f: [[0, 2600 + i * 120], [0.06, 3700], [0.1, 3000]], form: [[3200, 1, 1]], vol: 0.018, dur: 0.11, a: 0.005, r: 0.05 }); }); },
    step: function () { noise(0.06, "bandpass", outdoor ? 1300 : 700, 0.9, 0.045); if (outdoor && rainNow > 0.2) noise(0.09, "highpass", 3000, 0.7, 0.02, 0.02); },
    drop: function () { noise(0.025, "bandpass", 3400 + Math.random() * 1200, 3, 0.015); },
    breath: function () { voice({ type: "sine", f: [[0, 180], [0.9, 260]], form: [[400, 1, 0.6]], vol: 0.02, dur: 0.9, a: 0.3, r: 0.4 }); noise(0.9, "lowpass", 700, 0.6, 0.03, 0, 300); }
  };
  var SUNNY_CUES = { hmm: 1, gasp: 1, swoosh: 1, pop: 1, sigh: 1, tick: 1, aww: 1, ting: 1, ding: 1, bell: 1 };
  var CUES = [[6.5, "hmm"], [8.6, "whimper"], [10.6, "whimper"], [13.15, "thunder"], [13.4, "paws"], [15.0, "gasp"], [15.6, "growl"], [16.3, "swoosh"], [16.6, "whimperFear"], [17.5, "barkScared"], [17.78, "barkScared"], [18.4, "bigBark"], [19.1, "whimperFear"], [20.1, "growlShort"],
    [21.4, "breath"], [23.1, "huff"], [24.6, "pop"], [24.82, "yelp"], [25.4, "huff"], [26.7, "pawsAway"], [28.9, "sigh"], [31.6, "whimper"], [33.8, "tick"], [35.2, "sniff"], [36.2, "crunch"], [37.6, "whine"], [38.9, "aww"], [39.3, "barkHappy"],
    [40.8, "rub"], [42.6, "shake"], [44.2, "tick"], [45.0, "crunch"], [46.0, "ting"], [47.5, "yips"], [48.1, "pant"], [49.9, "creak"], [50.5, "birds"], [51.4, "pant"], [53.0, "birds"], [53.5, "ding"], [53.95, "yips"], [54.5, "pantFast"], [57.6, "pupSigh"], [61.6, "sleep"], [63.6, "bell"]];
  function cue(n) {
    if (!live()) return;
    if (SUNNY_CUES[n]) { try { if (win.Sunny && win.Sunny.sfx) win.Sunny.sfx(n); } catch (e) { /* optional */ } return; }
    if (n === "growlShort") return SND.growl(0, 0.9);
    if (n === "pawsAway") return SND.paws(0, 10, true);
    if (n === "pantFast") return SND.pant(0, 9, true);
    if (n === "pupSigh") return SND.sigh();
    if (SND[n]) SND[n]();
  }
  var lastStep = 0, sleepAt = 0;
  function soundStep(t, prevT, rate) {
    if (!live()) return;
    var now = ac.currentTime;
    beds.hiss.gain.setTargetAtTime(outdoor ? 0.06 * rainNow : 0.012 * track(WINDOW_RAIN, t) * 2, now, 0.5);
    beds.patter.gain.setTargetAtTime(outdoor ? 0.09 * rainNow : 0.02 * track(WINDOW_RAIN, t) * 2, now, 0.5);
    beds.wind.gain.setTargetAtTime(outdoor ? (0.05 + windNow * 0.12) * (0.4 + rainNow) : 0, now, 0.8);
    beds.pad.gain.setTargetAtTime(t > 44 ? 0.05 * smooth(44, 50, t) : 0, now, 1.2);
    if (t > prevT && t - prevT < 1) CUES.forEach(function (c) { if (c[0] > prevT && c[0] <= t) cue(c[1]); });
    if (umbRim && rainNow > 0.2 && Math.random() < 0.5) SND.drop();
    if (sunState.act === "walk" && sunState.op > 0.5 && clock - lastStep > (sunState.slow ? 0.31 : 0.21) / Math.max(1, rate)) { lastStep = clock; SND.step(); }
    if (states(PUP_S, t).act === "sleep" && clock - sleepAt > 3) { sleepAt = clock; SND.sleep(); }
    if (t >= 56 && t > prevT && Math.floor(t * 1.25) !== Math.floor(prevT * 1.25) && t < 63) { var notes = [523, 659, 784, 659, 587, 523, 659, 784]; voice({ type: "triangle", f: [[0, notes[Math.floor(t * 1.25) % notes.length]]], form: [[1800, 0.5, 1]], vol: 0.02, dur: 0.7, a: 0.01, r: 0.6 }); }
  }
  function setSound(on) {
    soundOn = on; R.snd.setAttribute("aria-pressed", String(on)); R.snd.textContent = on ? "Sound on" : "Sound";
    if (on) { audio(); if (ac && ac.state === "suspended") ac.resume(); }
    if (ac && master) master.gain.setTargetAtTime(on ? 0.9 : 0, ac.currentTime, 0.05);
  }
  R.snd.addEventListener("click", function (e) { e.stopPropagation(); setSound(!soundOn); });
  function firstGesture() { if (soundOn) { audio(); if (ac && ac.state === "suspended") ac.resume(); } }
  win.addEventListener("pointerdown", firstGesture); win.addEventListener("keydown", firstGesture);
  R.snd.setAttribute("aria-pressed", String(soundOn)); R.snd.textContent = soundOn ? "Sound on" : "Sound";

  /* ===================================================================== run */
  var tau = 0, prevTau = 0, done = false, started = false, paused = false, waitedFor = 0, rafId = 0;
  var at = qs.get("story-at"); /* a frozen moment, for checking the film */
  if (at != null) { story.classList.add("is-still"); paused = true; }
  var stylesheetOk = function () { var l = doc.querySelector('link[href*="sunny.css"]'); return !!l && l.media !== "print" && !!l.sheet; };
  function needPuppy() {
    if (win.Puppy || doc.querySelector("script[data-puppy]")) return;
    var sc = doc.createElement("script");
    sc.src = /sunny-story\.js/.test(SELF) ? SELF.replace(/sunny-story\.js/, "puppy.js") : "puppy.js";
    sc.async = true; sc.setAttribute("data-puppy", "");
    (doc.head || doc.documentElement).appendChild(sc);
  }
  function ready() {
    if (!(win.Sunny && typeof win.Sunny.art === "function")) return false;
    needPuppy();
    return !!(win.Puppy && typeof win.Puppy.art === "function") && stylesheetOk();
  }
  var last = 0;
  function frame(now) {
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now; clock += dt;
    if (!started) {
      waitedFor += dt;
      if (ready()) { try { A = buildActors(); } catch (e) { return finish(true); } started = true; if (at != null) { tau = +at; prevTau = tau; } }
      else if (waitedFor > 6) return finish(true); /* the characters never arrived: just lift the curtain */
    }
    if (started && !paused && !done) {
      tau = Math.min(T_END, tau + dt * (reduced ? 2.6 : 1));
      if (tau >= T_END) finish(false);
    }
    try { render(tau); } catch (e) { return finish(true); }
    rainStep(paused ? 0 : dt);
    soundStep(tau, prevTau, 1); prevTau = tau;
    if (A && Math.random() < dt / 3.2 && !A.pupRoot.hasAttribute("data-emotion") && A.pupRoot.getAttribute("data-act") !== "sleep") { A.pupRoot.classList.add("is-blink"); setTimeout(function () { if (A) A.pupRoot.classList.remove("is-blink"); }, 110); }
    if (!done || story.parentNode) rafId = requestAnimationFrame(frame);
  }
  function finish(silent) {
    if (done) return; done = true;
    if (!silent) { store("sunny:story", "1"); store("puppy:met", "1"); }
    story.classList.add("is-out");
    if (ac && master) master.gain.setTargetAtTime(0, ac.currentTime, 0.4);
    setTimeout(function () {
      cancelAnimationFrame(rafId);
      html.classList.remove("sl-on");
      if (story.parentNode) story.parentNode.removeChild(story);
      if (style.parentNode) style.parentNode.removeChild(style);
      win.removeEventListener("keydown", onKey);
      if (ac) { try { ac.close(); } catch (e) { /* ignore */ } }
      if (!silent) afterStory();
    }, 1150);
  }
  function onKey(e) { if (e.key === "Escape") { e.preventDefault(); finish(false); } }
  R.skip.addEventListener("click", function () { finish(false); });
  win.addEventListener("keydown", onKey);
  rafId = requestAnimationFrame(frame);

  /* ===================================================================== after the film: both in the corner, then Puppy goes home */
  var HOME_LINE = "I'm going home. If you need me, turn me on in the accessibility settings.";
  function afterStory() {
    var tries = 0, t = setInterval(function () {
      var S = win.Sunny;
      if (!(S && S.el && S.setMode)) { if (++tries > 60) clearInterval(t); return; }
      clearInterval(t);
      if (S.mode() !== "sunny") return; /* the visitor already keeps Puppy around */
      S.setMode("together", { temp: true });
      setTimeout(function () {
        if (!(win.Puppy && win.Puppy.goHome) || S.mode() !== "together") return;
        win.Puppy.goHome(HOME_LINE, function () { if (S.mode() === "together" && pref("pref:companion") !== "together") S.setMode("sunny", { temp: true }); });
        setTimeout(function () { if (S.say) S.say("See you later, buddy.", 2600); }, 7000);
      }, 10000);
    }, 200);
  }
})();
