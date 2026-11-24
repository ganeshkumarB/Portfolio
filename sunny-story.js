/* Sunny & Puppy: the loading story. On a visitor's first visit, before the site,
   a short film plays: one small story about Sunny and Puppy, told in the weather that is
   really outside the visitor's window. Rain outside is a puddle walk under one umbrella;
   sun is a wander after a butterfly; a dry night is a walk under the stars; snow is a
   snowball; wind is a chase after a leaf; a thunderstorm is waited out together on the
   porch. The weather picks the story and the time of day lights it, both settled before
   anything is shown, and neither changes while it plays. Then the curtain lifts, Sunny
   and Puppy are in the corner together, and unless the visitor has chosen Puppy, Puppy
   says goodbye and walks home into a little doghouse on the left.

   It plays once per visitor (localStorage "sunny:story"); add ?story to the address
   to watch it again. Skip with the button or Escape. The page loads underneath and is
   never held back: the button turns into "Enter site" the moment the page has really
   finished loading, and when the story ends the curtain lifts (if the page is still
   loading, the last scene goes on for a few seconds at most).

   Sunny and Puppy are the site's own artwork, drawn by sunny.js (Sunny.art) and puppy.js
   (Puppy.art) and animated by their own face and act CSS in sunny.css; only clothes for
   the weather are added on top. The street, the porch, the umbrella and the small props
   are scenery drawn here. Every sound is synthesised with Web Audio; sound is off unless
   the visitor has turned Sunny's sound on, and the Sound button turns it on for the film.

   Loaded as the first script in <body>, synchronously, so the curtain is up before the
   page paints. If the characters cannot be drawn within a few seconds the curtain simply
   lifts. Reduced motion shows a handful of stills from the same story, in the same weather. */
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
  var W = 1600, H = 900, GY = 780, T_END = 26;

  /* ===================================================================== styles */
  var CSS = `
html.sl-on { overflow: hidden !important; }
html.sl-on body > .sunny, html.sl-on body > .puppy, html.sl-on .to-top { visibility: hidden !important; }
.sst { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; background: #08111f; color: #fff; font-family: "Inter", system-ui, sans-serif; transition: opacity 1.1s ease; -webkit-user-select: none; user-select: none; --font-d: "Space Grotesk", "Inter", sans-serif; --font-m: "JetBrains Mono", ui-monospace, monospace; }
.sst.is-out { opacity: 0; pointer-events: none; }
.sst-world { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; transform-origin: 0 0; will-change: transform; }
.sst-layer { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; }
.sst-sky { position: absolute; left: -500px; right: -500px; top: -1200px; height: 2100px; background: linear-gradient(to bottom, var(--skyT) 0%, var(--skyT) 52%, var(--skyB) 100%); }
.sst-clouds { position: absolute; inset: 0; }
.sst-cloud { position: absolute; border-radius: 50%; background: var(--cloudC); filter: blur(28px); opacity: var(--cloud); box-shadow: inset 0 18px 34px rgba(255, 255, 255, 0.14); }
/* ---- storybook: painted texture over the world, a paper grain over the frame ---- */
.sst-brush { position: absolute; left: -500px; top: -1100px; width: 2600px; height: 2700px; background-image: var(--brushTex); background-size: 720px 720px; mix-blend-mode: soft-light; opacity: 0.62; pointer-events: none; }
.sst-paper { position: absolute; inset: 0; background-image: var(--paperTex); background-size: 280px 280px; mix-blend-mode: overlay; opacity: 0.2; pointer-events: none; }
.sst-fore { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; pointer-events: none; filter: blur(2.2px); will-change: transform; }
.sst-fore svg { position: absolute; left: 0; top: 0; overflow: visible; }
.c-fore { fill: color-mix(in srgb, #070d18 62%, var(--nearDark)); } .c-fore2 { fill: color-mix(in srgb, #0d1626 45%, var(--near)); }
.c-awn { fill: color-mix(in srgb, #c9483f 60%, var(--near)); } .c-awn2 { fill: color-mix(in srgb, #f3e3c8 50%, var(--near)); }
.c-wood { fill: color-mix(in srgb, #7a5030 55%, var(--nearDark)); } .c-leaf { fill: color-mix(in srgb, #4f8a4a 50%, var(--nearDark)); } .c-leaf2 { fill: color-mix(in srgb, #6fae5c 45%, var(--near)); }
.c-bloomA { fill: color-mix(in srgb, #ef8fa6 60%, var(--near)); } .c-bloomB { fill: color-mix(in srgb, #ffd45c 60%, var(--near)); }
.c-wire { fill: none; stroke: var(--nearDark); stroke-width: 1.6; opacity: 0.75; }
.c-bulbOn { fill: #ffe0a0; opacity: var(--lampOn); } .c-bulbGlow { fill: #ffcf7a; opacity: calc(var(--lampOn) * 0.28); }
.c-cat { fill: color-mix(in srgb, #05080f 55%, var(--nearDark)); } .c-catEye { fill: #ffd77a; opacity: var(--lampOn); }
.c-rim { fill: none; stroke: var(--skyB); stroke-width: 2.2; opacity: 0.42; stroke-linejoin: round; }
.c-cobble { fill: none; stroke: var(--curb); stroke-width: 2; stroke-linecap: round; opacity: 0.55; }
.c-hi { fill: none; stroke: #fff; stroke-width: 1.4; opacity: 0.12; }
.sst-smoke { position: absolute; left: 472px; top: 380px; width: 0; height: 0; }
.sst-smoke i { position: absolute; left: -14px; top: -14px; width: 28px; height: 28px; border-radius: 50%; background: rgba(var(--mistC), 0.32); filter: blur(5px); animation: sst-smoke 6s ease-out infinite; }
.sst-smoke i:nth-child(2) { animation-delay: -2s; } .sst-smoke i:nth-child(3) { animation-delay: -4s; }
@keyframes sst-smoke { 0% { transform: translate(0, 0) scale(0.5); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(-60px, -130px) scale(2.4); opacity: 0; } }
/* the characters take the scene's light: a gentle tint and a soft rim, never a new colour */
.sst-actor { filter: brightness(var(--charB, 1)) saturate(var(--charS, 1)); }
.sst-sunny .sst-flip, .sst-pup .sst-flip { filter: drop-shadow(0 0 5px var(--rimC, rgba(0, 0, 0, 0))); }
.sst-cshadow { position: absolute; left: 0; top: 0; width: 120px; height: 18px; margin: -9px 0 0 -60px; border-radius: 50%; background: radial-gradient(closest-side, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0)); pointer-events: none; }
.sst-sun { position: absolute; width: 360px; height: 360px; margin: -180px 0 0 -180px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 243, 200, 1) 0 18%, rgba(255, 214, 120, 0.75) 30%, rgba(255, 196, 100, 0) 68%); opacity: var(--sun); }
.sst-rays { position: absolute; left: 700px; top: -200px; width: 1100px; height: 1100px; opacity: calc(var(--sun) * 0.45); pointer-events: none; mix-blend-mode: screen; }
.sst-rays i { position: absolute; left: 50%; top: 0; width: 120px; height: 1100px; margin-left: -60px; transform-origin: 50% 46%; background: linear-gradient(to bottom, rgba(255, 236, 190, 0), rgba(255, 236, 190, 0.5) 40%, rgba(255, 236, 190, 0)); filter: blur(14px); animation: sst-ray 7s ease-in-out infinite alternate; }
.sst-rays i:nth-child(1) { transform: rotate(28deg); } .sst-rays i:nth-child(2) { transform: rotate(44deg); width: 70px; animation-delay: -2s; } .sst-rays i:nth-child(3) { transform: rotate(60deg); animation-delay: -4s; }
@keyframes sst-ray { from { opacity: 0.55; } to { opacity: 1; } }
/* the adaptive opening: moon, stars, and Sunny's outfit for the weather */
.sst-moon { position: absolute; left: 1180px; top: 150px; width: 70px; height: 70px; margin: -35px 0 0 -35px; border-radius: 50%; background: radial-gradient(circle at 38% 38%, #fffdf2 0 55%, #f1ead2 72%); box-shadow: 0 0 60px 18px rgba(255, 248, 220, 0.25); opacity: var(--moon, 0); pointer-events: none; }
.sst-stars { position: absolute; left: 0; top: 0; width: 1600px; height: 520px; opacity: var(--stars, 0); pointer-events: none; }
.sst-stars i { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #fff; animation: sst-twinkle 3.2s ease-in-out infinite alternate; }
@keyframes sst-twinkle { from { opacity: 0.25; } to { opacity: 1; } }
.sunny .sst-cos { display: none; }
.sunny.st-cos-on .sst-cos { display: inline; }
.sunny.st-cos-on.st-cos-clear .s-cap { opacity: 1; }
.sunny.st-cos-on.st-cos-clear .s-foot { fill: #ffffff; }
.sunny.st-cos-on.st-cos-rain .s-foot, .sunny.st-cos-on.st-cos-storm .s-foot { fill: #2a3d66; }
.sunny.st-cos-on.st-cos-snow .s-foot { fill: #6b4a30; }
.sunny.st-cos-on.st-cos-snow .s-arm ellipse { fill: #de364d; }
.sunny.st-cos-on.st-cos-night .s-foot { fill: #5b6170; }
.sunny.st-cos-on.st-cos-wind .s-foot { fill: #2f3640; }
.sunny.st-gust .s-sprout { animation: sst-gust 0.7s ease-in-out infinite alternate !important; }
@keyframes sst-gust { from { transform: rotate(8deg); } to { transform: rotate(30deg); } }
.sst-cos .cos-flap { transform-box: fill-box; transform-origin: 0 0; animation: sst-flap 0.42s ease-in-out infinite alternate; }
@keyframes sst-flap { from { transform: skewY(-6deg); } to { transform: skewY(10deg) scaleX(1.15); } }
.sst-pose.st-brace { transform: rotate(-7deg) translateX(-4px); transition-duration: 0.35s; }
.sst-birds { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; opacity: var(--birds); pointer-events: none; }
.sst-bird { position: absolute; width: 26px; height: 12px; animation: sst-fly 16s linear infinite; }
.sst-bird svg { display: block; width: 100%; height: 100%; animation: sst-wing 0.42s ease-in-out infinite alternate; transform-origin: 50% 60%; }
@keyframes sst-fly { from { transform: translateX(-120px); } to { transform: translateX(1760px); } }
@keyframes sst-wing { from { transform: scaleY(1); } to { transform: scaleY(0.35); } }
.sst-street svg { position: absolute; left: 0; top: 0; overflow: visible; }
.c-far { fill: var(--far); } .c-mid { fill: var(--mid); } .c-near { fill: var(--near); } .c-neard { fill: var(--nearDark); }
.c-win { fill: var(--win); opacity: var(--winOn); } .c-wind { fill: var(--nearDark); opacity: 0.55; }
.c-walk { fill: var(--walk); } .c-curb { fill: var(--curb); } .c-road { fill: var(--road); }
.c-puddle { fill: var(--puddle); opacity: 0.5; } .c-post { fill: var(--post); } .c-box { fill: var(--box); } .c-boxd { fill: var(--boxD); }
.c-bulb { fill: #ffe7a8; opacity: var(--lampOn); } .c-reflect, .c-pool { opacity: calc(var(--lampOn) * 0.75); }
.sst-glow, .sst-cone { opacity: var(--lampOn, 1); }
.sst.is-reduced .sst-smoke i { animation: none; opacity: 0.6; }
.sst-glow { position: absolute; width: 520px; height: 520px; margin: -260px 0 0 -260px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 214, 140, 0.55) 0%, rgba(255, 200, 120, 0.18) 32%, rgba(255, 200, 120, 0) 64%); mix-blend-mode: screen; pointer-events: none; }
.sst-cone { position: absolute; width: 360px; height: 300px; margin-left: -180px; background: linear-gradient(to bottom, rgba(255, 216, 150, 0.2), rgba(255, 216, 150, 0.03) 85%, rgba(255, 216, 150, 0)); clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%); mix-blend-mode: screen; pointer-events: none; }
.sst-mist { position: absolute; left: -500px; width: 2600px; top: 560px; height: 300px; background: linear-gradient(to bottom, rgba(150, 172, 210, 0) 0%, rgba(var(--mistC), 0.24) 55%, rgba(var(--mistC), 0.07) 100%); pointer-events: none; animation: sst-mist 18s ease-in-out infinite alternate; }
@keyframes sst-mist { from { transform: translateX(-40px); } to { transform: translateX(40px); } }
.sst-actors { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; }
.sst-actor { position: absolute; left: 0; top: 0; will-change: transform, opacity; }
.sst-flip { position: absolute; inset: 0; transition: transform 0.24s cubic-bezier(0.5, 0, 0.2, 1); }
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
.sst-pose.st-tremble { animation: sst-tremble 0.16s linear infinite alternate; }
@keyframes sst-tremble { from { transform: translateX(-1.2px); } to { transform: translateX(1.2px); } }
.sst-pose.st-shiver { animation: sst-shiver 0.11s linear infinite alternate; }
@keyframes sst-shiver { from { transform: translateX(-1px) scale(0.985, 0.99); } to { transform: translateX(1px) scale(0.985, 0.99); } }
.sst-pose.st-lean { transform: rotate(6deg) translateX(4px); }
/* turning around: a little hop and a squash as the body swings, the way a dog pivots on its back legs */
.sst-pose.st-turn { animation: sst-turn 0.34s cubic-bezier(0.3, 0.7, 0.4, 1) 1 !important; }
@keyframes sst-turn { 0% { transform: none; } 35% { transform: translateY(-6px) scale(0.93, 1.05); } 70% { transform: translateY(1px) scale(1.05, 0.95); } 100% { transform: none; } }
.puppy.st-rest .p-head { --hr: 4deg; --hy: 12px; --hx: 5px; }
.sst-wet { opacity: 0; transition: opacity 1.2s ease; } .is-wet .sst-wet { opacity: 1; }
.sst-drip { animation: sst-drip 1.1s ease-in infinite; } .sst-drip:nth-child(2) { animation-delay: 0.45s; } .sst-drip:nth-child(3) { animation-delay: 0.8s; }
@keyframes sst-drip { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(18px); opacity: 0; } }
.sst-scarf-w { opacity: 0; }
.has-scarf-w .sst-scarf-w { opacity: 1; }
.sst-spark { position: absolute; width: 34px; height: 34px; margin: -17px 0 0 -17px; opacity: 0; pointer-events: none; }
.sst-spark.on { animation: sst-spark 0.9s ease-out 1; }
@keyframes sst-spark { 0% { opacity: 0; transform: scale(0.3) rotate(0); } 30% { opacity: 1; transform: scale(1.1) rotate(25deg); } 100% { opacity: 0; transform: scale(0.6) rotate(60deg); } }
.sst-rain { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; pointer-events: none; }
.sst-grade { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light; }
.sst-flash { position: absolute; inset: 0; background: #e8efff; opacity: 0; pointer-events: none; mix-blend-mode: screen; }
.sst-vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 55%, rgba(0, 0, 0, 0) 45%, rgba(4, 8, 16, 0.85) 100%); }
/* the title sits at the top, clear of the two of them */
.sst-title { position: absolute; left: 0; right: 0; top: clamp(18px, 7vh, 64px); text-align: center; opacity: 0; color: var(--capC, #f5f7fb); text-shadow: 0 2px 22px var(--capS, rgba(0, 0, 0, 0.45)); pointer-events: none; }
.sst-title h1 { margin: 0; font: 600 clamp(20px, 2.6vw, 38px)/1 var(--font-d); letter-spacing: 0.22em; padding-left: 0.22em; color: inherit; }
.sst-title p { margin: 12px 0 0; font: 400 clamp(12px, 1.2vw, 16px)/1.4 "Inter", system-ui, sans-serif; opacity: 0.85; color: inherit; }
.sst-ui { position: absolute; left: clamp(16px, 4vw, 48px); right: clamp(16px, 4vw, 48px); bottom: clamp(14px, 4vh, 36px); display: flex; align-items: center; gap: 14px; font: 500 11px/1 var(--font-m); letter-spacing: 0.08em; color: var(--uiC, rgba(255, 255, 255, 0.66)); }
.sst-track { position: relative; width: 92px; height: 2px; border-radius: 2px; background: var(--uiT, rgba(255, 255, 255, 0.16)); flex: none; }
.sst-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 2px; background: #ffc93c; }
.sst-fill::after { content: ""; position: absolute; right: -3px; top: -2px; width: 6px; height: 6px; border-radius: 50%; background: #ffe7a8; box-shadow: 0 0 10px 3px rgba(255, 201, 60, 0.6); }
.sst-line { flex: 1; font: 400 12px/1.3 "Inter", system-ui, sans-serif; letter-spacing: 0; }
.sst-btn { padding: 8px 2px; border: 0; background: none; color: inherit; font: inherit; letter-spacing: inherit; text-transform: uppercase; cursor: pointer; }
.sst-btn:hover, .sst-btn:focus-visible { color: var(--capC, #fff); outline: none; text-decoration: underline; text-underline-offset: 4px; }
.sst-btn[aria-pressed="true"] { color: #ffc93c; }
@media (max-width: 560px) { .sst-line { display: none; } .sst-ui { justify-content: space-between; } }
.sst.is-reduced .sst-pose, .sst.is-reduced .sst-actor *, .sst.is-reduced .sst-bird, .sst.is-reduced .sst-mist { animation: none !important; transition-duration: 0.01s !important; }
.sst.is-reduced .sst-flip { transition: none; }
.sst.is-still *, .sst.is-still .sst-flip, .sst.is-still .sst-pose { transition: none !important; }
/* ---- the world stays behind the curtain until the weather is known, then fades up already in its weather ---- */
.sst-view { opacity: 0; transition: opacity 0.7s ease; }
.sst.is-ready .sst-view { opacity: 1; }
.sst.is-still .sst-view { transition: none; }
.sst-cloud { animation: sst-drift 46s ease-in-out infinite alternate; }
.sst.is-windy .sst-cloud { animation-duration: 11s; }
@keyframes sst-drift { from { translate: 40px 0; } to { translate: -90px 0; } }
/* plants and window boxes move with the air: a little on a calm day, a lot in the wind */
.sst-street .c-leaf, .sst-street .c-leaf2, .sst-street .c-bloomA, .sst-street .c-bloomB { animation: sst-sway 3.4s ease-in-out infinite alternate; }
.sst-street .c-leaf2, .sst-street .c-bloomB { animation-delay: -1.3s; }
@keyframes sst-sway { from { transform: translateX(-0.9px); } to { transform: translateX(0.9px); } }
.sst.is-windy .sst-street .c-leaf, .sst.is-windy .sst-street .c-leaf2, .sst.is-windy .sst-street .c-bloomA, .sst.is-windy .sst-street .c-bloomB { animation: sst-swayw 0.8s ease-in-out infinite alternate; }
@keyframes sst-swayw { from { transform: translate(-2px, 0.4px); } to { transform: translate(-6px, 1.2px); } }
/* the porch: a striped roof over the door, a lantern, a lit pane, and the warm light they throw */
.c-lan { fill: #ffd58a; stroke: var(--nearDark); stroke-width: 1.6; opacity: calc(0.3 + var(--porch, 0) * 0.7); }
.c-doorwin { fill: var(--win); opacity: calc(var(--porch, 0) * 0.85); }
.c-awnshade { fill: #000; opacity: 0.16; }
.sst-porchglow { position: absolute; left: 340px; top: 690px; width: 560px; height: 440px; margin: -220px 0 0 -280px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 196, 120, 0.5), rgba(255, 180, 100, 0.16) 55%, rgba(255, 180, 100, 0)); mix-blend-mode: screen; opacity: var(--porch, 0); pointer-events: none; }
/* the small things the stories are about */
.sst-prop { position: absolute; left: 0; top: 0; pointer-events: none; will-change: transform, opacity; opacity: 0; }
.sst-prop svg { display: block; overflow: visible; }
.bf-l, .bf-r { transform-box: view-box; transform-origin: 18px 16px; animation: sst-bf 0.2s ease-in-out infinite alternate; }
@keyframes sst-bf { from { transform: scaleX(1); } to { transform: scaleX(0.2); } }
.sst-prop.is-rest .bf-l, .sst-prop.is-rest .bf-r { animation-duration: 1.2s; }
.sst-glowdot svg { filter: drop-shadow(0 0 5px #ffe98a) drop-shadow(0 0 12px rgba(255, 233, 138, 0.75)); }
.sst-shoot svg { filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8)); }
.sst-flies { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; pointer-events: none; opacity: 0; }
.sst-flies i { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: #fff3a8; box-shadow: 0 0 10px 4px rgba(255, 236, 130, 0.5); animation: sst-float 7s ease-in-out infinite alternate, sst-glim 1.9s ease-in-out infinite alternate; }
@keyframes sst-float { from { transform: translate(0, 0); } 50% { transform: translate(26px, -30px); } to { transform: translate(-18px, -58px); } }
@keyframes sst-glim { from { opacity: 0.2; } to { opacity: 1; } }
.sst.is-reduced .sst-flies i, .sst.is-reduced .sst-cloud, .sst.is-reduced .sst-street *, .sst.is-reduced .bf-l, .sst.is-reduced .bf-r { animation: none !important; }
/* sunlight: a warm wash falling across the street from the upper right, only when the sun is really out */
.sst-sunwash { position: absolute; left: -500px; top: -300px; width: 2600px; height: 1500px; background: linear-gradient(118deg, rgba(255, 206, 130, 0) 34%, rgba(255, 206, 130, 0.2) 60%, rgba(255, 222, 160, 0.42) 100%); mix-blend-mode: screen; opacity: var(--rays, 0); pointer-events: none; }
.sst-sunpool { position: absolute; left: 0; top: 742px; width: 1600px; height: 110px; background: radial-gradient(ellipse at 62% 40%, rgba(255, 226, 160, 0.5), rgba(255, 226, 160, 0) 62%); mix-blend-mode: screen; opacity: var(--rays, 0); pointer-events: none; }
/* snow lies on every roof and ledge */
.c-cap { fill: none; stroke: #fff; stroke-width: 7; stroke-linecap: round; opacity: var(--snowy, 0); }
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
  <div class="sst-stars" data-r="stars"></div>
  <div class="sst-moon" data-r="moon"></div>
  <div class="sst-sun" data-r="sun" style="left:1270px;top:700px"></div>
  <div class="sst-birds"><div class="sst-bird" style="top:170px;animation-delay:-3s">${BIRD}</div><div class="sst-bird" style="top:205px;width:20px;animation-delay:-4.4s;animation-duration:19s">${BIRD}</div><div class="sst-bird" style="top:150px;width:18px;animation-delay:-9s;animation-duration:22s">${BIRD}</div></div>
  <div class="sst-layer sst-street" data-r="street">
    <svg width="1600" height="900" viewBox="0 0 1600 900" aria-hidden="true">
      <defs>
        <linearGradient id="sst-refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdca0" stop-opacity="0.6"/><stop offset="1" stop-color="#ffdca0" stop-opacity="0"/></linearGradient>
        <radialGradient id="sst-pool"><stop offset="0" stop-color="#ffd896" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd896" stop-opacity="0"/></radialGradient>
        <filter id="sst-blur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.6"/></filter>
        <linearGradient id="sst-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--skyB)" stop-opacity="0"/><stop offset="1" style="stop-color: var(--skyB)" stop-opacity="0.5"/></linearGradient>
        <linearGradient id="sst-haze2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--skyB)" stop-opacity="0"/><stop offset="1" style="stop-color: var(--skyB)" stop-opacity="0.2"/></linearGradient>
        <linearGradient id="sst-ao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></linearGradient>
      </defs>
      <g data-r="far" filter="url(#sst-blur)">
        <path class="c-far" d="M-200 760V520H70V470H140V540H210V430H260V400H300V430H360V500H430V455H520V520H600V420H660V380H700V420H760V480H840V440H900V505H980V410H1040V470H1100V430H1180V500H1260V450H1330V520H1400V430H1470V480H1540V440H1800V760Z"/>
        <g class="c-win" data-r="farWins"></g>
        <path class="c-rim" data-rough="1" d="M-200 520H70V470H140V540H210V430H260V400H300V430H360V500H430V455H520V520H600V420H660V380H700V420H760V480H840V440H900V505H980V410H1040V470H1100V430H1180V500H1260V450H1330V520H1400V430H1470V480H1540V440H1800"/>
      </g>
      <rect x="-500" y="330" width="2600" height="440" fill="url(#sst-haze)"/>
      <g data-r="mid">
        <path class="c-mid" d="M560 760V560H700V520H820V575H920V540H1080V760Z"/>
        <g class="c-win" data-r="midWins"></g>
        <path class="c-rim" data-rough="1" d="M560 560H700V520H820V575H920V540H1080"/>
        <path d="M796 520 V494 M786 500 H806 M790 507 H802" stroke="var(--nearDark)" stroke-width="2" fill="none"/>
        <g transform="translate(872 575)"><path class="c-cat" d="M-10 0 C-12 -10 -8 -18 0 -19 C8 -18 12 -10 10 0 Z M-7 -17 L-9 -27 L-2 -20 Z M7 -17 L9 -27 L2 -20 Z M10 -2 C20 -2 22 -12 16 -16"/><circle class="c-catEye" cx="-3.5" cy="-13" r="1.3"/><circle class="c-catEye" cx="3.5" cy="-13" r="1.3"/></g>
      </g>
      <rect x="-500" y="520" width="2600" height="250" fill="url(#sst-haze2)"/>
      <path class="c-near" d="M100 760V470L330 380L560 470V760Z"/>
      <path class="c-rim" data-rough="1" d="M100 470L330 380L560 470"/>
      <rect class="c-neard" x="455" y="392" width="34" height="64"/>
      <rect class="c-win" x="160" y="520" width="78" height="72" rx="4"/>
      <rect class="c-wind" x="420" y="520" width="78" height="72" rx="4"/>
      <path d="M196 520v72M160 556h78M456 520v72M420 556h78" stroke="var(--nearDark)" stroke-width="4"/>
      <rect class="c-neard" x="288" y="632" width="84" height="128" rx="6"/>
      <rect x="296" y="640" width="68" height="120" rx="4" fill="#3a2a22" opacity="0.85"/>
      <g data-r="door"><rect x="296" y="640" width="68" height="120" rx="4" class="c-near"/><rect x="304" y="650" width="52" height="46" rx="3" class="c-neard"/><rect class="c-doorwin" x="308" y="654" width="44" height="38" rx="2"/><circle cx="352" cy="706" r="3.5" fill="#c9a24a"/></g>
      <rect class="c-curb" x="278" y="756" width="104" height="8" rx="2"/>
      <g data-r="details">
        <path class="c-awn" d="M148 506 H250 L244 524 Q237 531 230 524 Q223 531 216 524 Q209 531 202 524 Q195 531 188 524 Q181 531 174 524 Q167 531 160 524 Q155 529 150 524 Z"/>
        <path class="c-awn2" d="M168 506 H182 L181 524 Q174 531 167 524 Z M196 506 H210 L209 524 Q202 531 195 524 Z M224 506 H238 L237 524 Q230 531 223 524 Z"/>
        <rect class="c-wood" x="414" y="592" width="90" height="13" rx="3"/>
        <g><circle class="c-leaf" cx="426" cy="590" r="7"/><circle class="c-leaf2" cx="446" cy="588" r="8"/><circle class="c-leaf" cx="468" cy="590" r="7"/><circle class="c-leaf2" cx="490" cy="588" r="8"/><circle class="c-bloomA" cx="432" cy="584" r="4"/><circle class="c-bloomB" cx="455" cy="582" r="4"/><circle class="c-bloomA" cx="478" cy="584" r="4"/><circle class="c-bloomB" cx="496" cy="582" r="3.5"/></g>
        <g transform="translate(262 760)"><path class="c-wood" d="M-12 0 L-15 -22 H15 L12 0 Z"/><circle class="c-leaf" cx="-6" cy="-30" r="10"/><circle class="c-leaf2" cx="6" cy="-34" r="11"/><circle class="c-leaf" cx="0" cy="-44" r="8"/></g>
        <g transform="translate(398 760)"><path class="c-wood" d="M-11 0 L-14 -20 H14 L11 0 Z"/><path class="c-leaf2" d="M0 -20 C-14 -34 -10 -56 0 -62 C10 -56 14 -34 0 -20 Z"/></g>
        <g transform="translate(1100 470)"><path d="M0 0 H34" stroke="var(--post)" stroke-width="4"/><path d="M8 0 V10 M26 0 V10" stroke="var(--post)" stroke-width="2"/><rect class="c-awn2" x="0" y="10" width="34" height="26" rx="4"/><circle class="c-wood" cx="17" cy="23" r="6"/></g>
        <path class="c-wire" d="M332 386 Q520 438 702 522"/>
        <path class="c-wire" data-r="lights" d="M644 480 Q940 566 1236 480"/>
        <g data-r="bulbs"></g>
        <path class="c-cobble" data-r="cobble"/>
        <path class="c-hi" d="M-500 799 H2100"/>
      </g>
      <g data-r="porch">
        <path class="c-awnshade" d="M214 623 Q342 627 470 623 L466 637 Q342 643 218 637 Z"/>
        <path class="c-awn" d="M210 596 H474 L482 617 Q473.2 625 464.5 617 Q455.8 625 447.0 617 Q438.2 625 429.5 617 Q420.8 625 412.0 617 Q403.2 625 394.5 617 Q385.8 625 377.0 617 Q368.2 625 359.5 617 Q350.8 625 342.0 617 Q333.2 625 324.5 617 Q315.8 625 307.0 617 Q298.2 625 289.5 617 Q280.8 625 272.0 617 Q263.2 625 254.5 617 Q245.8 625 237.0 617 Q228.2 625 219.5 617 Q210.8 625 202.0 617 Z"/>
        <path class="c-awn2" d="M210.0 596 L226.5 596 L219.5 617 Q210.8 625 202.0 617 Z M243.0 596 L259.5 596 L254.5 617 Q245.8 625 237.0 617 Z M276.0 596 L292.5 596 L289.5 617 Q280.8 625 272.0 617 Z M309.0 596 L325.5 596 L324.5 617 Q315.8 625 307.0 617 Z M342.0 596 L358.5 596 L359.5 617 Q350.8 625 342.0 617 Z M375.0 596 L391.5 596 L394.5 617 Q385.8 625 377.0 617 Z M408.0 596 L424.5 596 L429.5 617 Q420.8 625 412.0 617 Z M441.0 596 L457.5 596 L464.5 617 Q455.8 625 447.0 617 Z"/>
        <path d="M350 623 q0 4 0 6" stroke="var(--nearDark)" stroke-width="2" fill="none"/><path class="c-lan" d="M344 629 q6 -3 12 0 l1 12 q-7 4 -14 0 Z"/>
      </g>
      <rect x="-500" y="680" width="2600" height="80" fill="url(#sst-ao)"/>
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
  <div class="sst-brush" data-r="brush"></div>
  <div class="sst-layer" data-r="glows">
    <div class="sst-smoke"><i></i><i></i><i></i></div>
    <div class="sst-cone" style="left:667px;top:466px"></div><div class="sst-cone" style="left:1213px;top:466px"></div>
    <div class="sst-glow" style="left:667px;top:470px"></div><div class="sst-glow" style="left:1213px;top:470px"></div>
    <div class="sst-porchglow"></div><div class="sst-sunwash"></div><div class="sst-sunpool"></div>
  </div>
  <div class="sst-actors" data-r="actors"></div>
  <div class="sst-flies" data-r="flies"></div>
  <div class="sst-fore" data-r="fore"><svg width="1600" height="900" viewBox="0 -56 1600 900" aria-hidden="true">
    <g class="c-fore"><ellipse cx="-40" cy="880" rx="150" ry="70"/><ellipse cx="90" cy="900" rx="120" ry="60"/><ellipse cx="200" cy="912" rx="90" ry="44"/><circle cx="20" cy="840" r="46"/><circle cx="-90" cy="830" r="52"/></g>
    <g class="c-fore2"><circle cx="40" cy="850" r="22"/><circle cx="120" cy="868" r="18"/></g>
    <g class="c-fore"><rect x="1474" y="836" width="30" height="56" rx="10"/><rect x="1466" y="828" width="46" height="12" rx="5"/><rect x="1462" y="852" width="54" height="10" rx="4"/><ellipse cx="1640" cy="880" rx="170" ry="72"/><ellipse cx="1560" cy="906" rx="110" ry="50"/><circle cx="1700" cy="828" r="56"/></g>
    <g class="c-fore2"><circle cx="1606" cy="852" r="22"/><circle cx="1668" cy="846" r="18"/></g>
  </svg></div>
  <canvas class="sst-rain" data-r="rain" width="1600" height="900"></canvas>
</div></div>
<div class="sst-paper" data-r="paper"></div>
<div class="sst-grade" data-r="grade"></div>
<div class="sst-flash" data-r="flash"></div>
<div class="sst-vig" data-r="vig"></div>
<div class="sst-title" data-r="title"><h1>SUNNY &amp; PUPPY</h1><p data-r="sub"></p></div>
<div class="sst-ui"><span class="sst-track"><span class="sst-fill" data-r="fill"></span></span><span class="sst-line" data-r="line">Looking out of the window…</span><button class="sst-btn" type="button" data-r="snd" aria-pressed="false">Sound</button><button class="sst-btn" type="button" data-r="skip">Skip →</button></div>`;

  /* ===================================================================== mount the curtain now */
  var style = doc.createElement("style"); style.textContent = CSS;
  var story = doc.createElement("div");
  story.className = "sst" + (reduced ? " is-reduced" : "");
  story.setAttribute("role", "img");
  story.setAttribute("aria-label", "A short animated story about Sunny and Puppy. Press Escape to skip.");
  story.innerHTML = DOM;
  var body = doc.body || doc.currentScript.parentNode;
  body.insertBefore(style, body.firstChild);
  body.insertBefore(story, style.nextSibling);
  html.classList.add("sl-on");
  var R = {}; Array.prototype.forEach.call(story.querySelectorAll("[data-r]"), function (e) { R[e.getAttribute("data-r")] = e; });
  var world = R.world, actorsEl = R.actors;

  (function windows() {
    /* windows: a little irregular, as if painted by hand, some brighter, some dimmer */
    function grid(g, x0, x1, y0, y1, dx, dy, seed) {
      var out = "", n = seed;
      function rnd() { n = (n * 9301 + 49297) % 233280; return n / 233280; }
      for (var y = y0; y < y1; y += dy) for (var x = x0; x < x1; x += dx) {
        if (rnd() < 0.42) {
          var w = dx * (0.38 + rnd() * 0.1), h = dy * (0.44 + rnd() * 0.1), ox = (rnd() - 0.5) * 3, op = 0.55 + rnd() * 0.45;
          out += '<rect x="' + (x + ox).toFixed(1) + '" y="' + (y + (rnd() - 0.5) * 2).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" opacity="' + op.toFixed(2) + '"/>';
        }
      }
      g.innerHTML = out;
    }
    grid(R.farWins, -180, 1780, 450, 720, 34, 40, 7);
    grid(R.midWins, 580, 1070, 590, 730, 40, 46, 3);
    grid(R.cornerWins, 1110, 1780, 390, 580, 52, 58, 11);
  })();
  /* ---- storybook: hand-painted edges, generated textures, string lights, paving ---- */
  (function storybook() {
    var seed = 17;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function j(a) { return (rnd() - 0.5) * 2 * a; }
    /* a polygon with straight edges becomes a slightly wavering painted one */
    function wobble(pts, closed, amp, step) {
      var out = [];
      for (var i = 0; i < pts.length - (closed ? 0 : 1); i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / step));
        for (var k = 0; k < n; k++) { var t = k / n; out.push([a[0] + (b[0] - a[0]) * t + (k ? j(amp) : j(amp * 0.4)), a[1] + (b[1] - a[1]) * t + (k ? j(amp) : j(amp * 0.4))]); }
      }
      if (!closed) out.push(pts[pts.length - 1]);
      return "M" + out.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L") + (closed ? " Z" : "");
    }
    function parse(d) { /* absolute M/H/V/L/Z only */
      var pts = [], x = 0, y = 0, closed = /Z\s*$/i.test(d), re = /([MLHVZ])\s*([-\d.\s]*)/gi, m;
      while ((m = re.exec(d))) {
        var c = m[1].toUpperCase(), v = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
        if (c === "M" || c === "L") for (var i = 0; i < v.length; i += 2) { x = v[i]; y = v[i + 1]; pts.push([x, y]); }
        else if (c === "H") v.forEach(function (n) { x = n; pts.push([x, y]); });
        else if (c === "V") v.forEach(function (n) { y = n; pts.push([x, y]); });
      }
      return { pts: pts, closed: closed };
    }
    var svg = R.street.querySelector("svg");
    /* snow caps: a white line along every roof edge that is not a wall, shown only when it snows */
    Array.prototype.forEach.call(svg.querySelectorAll("path.c-rim"), function (el) {
      var p = parse(el.getAttribute("d") || ""), d = "";
      for (var i = 0; i < p.pts.length - 1; i++) { var a = p.pts[i], b = p.pts[i + 1]; if (Math.abs(b[0] - a[0]) > 6) d += "M" + (Math.min(a[0], b[0]) === a[0] ? a[0] + 3 : a[0] - 3) + " " + (a[1] - 2) + " L" + (Math.min(a[0], b[0]) === a[0] ? b[0] - 3 : b[0] + 3) + " " + (b[1] - 2) + " "; }
      var cap = document.createElementNS("http://www.w3.org/2000/svg", "path"); cap.setAttribute("class", "c-cap"); cap.setAttribute("d", d + "M0 0"); el.parentNode.insertBefore(cap, el.nextSibling);
    });
    Array.prototype.forEach.call(svg.querySelectorAll("path"), function (el) {
      var d = el.getAttribute("d") || ""; if (!/^[MLHVZ\d\s.,-]+$/.test(d) || (d.match(/M/g) || []).length > 1 || el.closest("[data-r=details]")) return; /* single absolute straight-edged shapes only */
      var p = parse(d); if (p.pts.length < 2) return;
      var big = p.pts.some(function (q, i) { var r = p.pts[(i + 1) % p.pts.length]; return Math.hypot(r[0] - q[0], r[1] - q[1]) > 60; });
      el.setAttribute("d", wobble(p.pts, p.closed, big ? 1.6 : 0.8, big ? 34 : 18));
    });
    Array.prototype.forEach.call(svg.querySelectorAll("rect"), function (el) {
      if (el.getAttribute("fill") && /url\(/.test(el.getAttribute("fill"))) return; /* gradients and pools stay smooth */
      var x = +el.getAttribute("x"), y = +el.getAttribute("y"), w = +el.getAttribute("width"), h = +el.getAttribute("height"); if (!w || !h) return;
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      for (var a = 0; a < el.attributes.length; a++) { var at = el.attributes[a]; if (!/^(x|y|width|height|rx|ry)$/.test(at.name)) path.setAttribute(at.name, at.value); }
      var amp = Math.min(1.4, Math.max(0.35, Math.min(w, h) / 22));
      path.setAttribute("d", wobble([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true, amp, w > 200 ? 40 : 16));
      el.parentNode.replaceChild(path, el);
    });
    /* string lights hanging across the street */
    var bulbs = "";
    for (var t = 0.06; t < 0.97; t += 0.075) { var bx = (1 - t) * (1 - t) * 644 + 2 * (1 - t) * t * 940 + t * t * 1236, by = (1 - t) * (1 - t) * 480 + 2 * (1 - t) * t * 566 + t * t * 480; bulbs += '<circle class="c-bulbGlow" cx="' + bx.toFixed(1) + '" cy="' + (by + 6).toFixed(1) + '" r="9"/><circle class="c-bulbOn" cx="' + bx.toFixed(1) + '" cy="' + (by + 6).toFixed(1) + '" r="3.2"/>'; }
    R.bulbs.innerHTML = bulbs;
    /* paving: short painted strokes along the pavement */
    var cob = ""; for (var cx = -480; cx < 2080; cx += 26 + rnd() * 18) { var cy = 768 + rnd() * 24; cob += "M" + cx.toFixed(0) + " " + cy.toFixed(0) + " h" + (8 + rnd() * 10).toFixed(0) + " "; }
    R.cobble.setAttribute("d", cob);
    /* textures, painted once: brush strokes for the world, a fine grain for the frame */
    function tex(w, h, draw) { var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d"); if (!g) return ""; draw(g, w, h); try { return c.toDataURL("image/png"); } catch (e) { return ""; } }
    var brush = tex(512, 512, function (g, w, h) {
      g.lineCap = "round";
      for (var i = 0; i < 520; i++) {
        var x = rnd() * w, y = rnd() * h, len = 30 + rnd() * 110, ang = (rnd() - 0.5) * 0.55, lw = 4 + rnd() * 16, light = rnd() < 0.5;
        g.strokeStyle = light ? "rgba(255,255,255," + (0.035 + rnd() * 0.05).toFixed(3) + ")" : "rgba(0,0,0," + (0.03 + rnd() * 0.045).toFixed(3) + ")"; g.lineWidth = lw;
        for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
          var sx = x + ox * w, sy = y + oy * h, ex = sx + Math.cos(ang) * len, ey = sy + Math.sin(ang) * len;
          g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + ex) / 2 + (rnd() - 0.5) * 10, (sy + ey) / 2 + (rnd() - 0.5) * 8, ex, ey); g.stroke();
        }
      }
    });
    var paper = tex(220, 220, function (g, w, h) {
      var img = g.createImageData(w, h), d = img.data;
      for (var i = 0; i < d.length; i += 4) { var v = 128 + (rnd() - 0.5) * 64; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      g.putImageData(img, 0, 0);
    });
    if (brush) story.style.setProperty("--brushTex", "url(" + brush + ")");
    if (paper) story.style.setProperty("--paperTex", "url(" + paper + ")");
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

  /* five beats: arrive, Sunny finds something to do, Puppy turns up, the two of them together, the quiet end */
  var BANDS_T = [0, 4.5, 10, 16, 22, 26], TITLE_AT = 22.6, KEY_T = [3, 7.5, 13.5, 19.5, 25], CAMX, CAMY, CAMZ;

  var PAL = {
    night: { skyT: "#07101d", skyB: "#1b2f4b", far: "#12213a", mid: "#172a44", near: "#1c3050", nearDark: "#15253d", win: "#f2c46d", winOn: 0.8, walk: "#22314a", curb: "#2c3c57", road: "#131d2c", puddle: "#4a6c98", post: "#0d1522", box: "#4a3a2c", boxD: "#3a2d22", lampOn: 1, cloud: 0.85, cloudC: "#22324c", sun: 0, birds: 0, capC: "#f5f7fb", capS: "rgba(0,0,0,0.5)", uiC: "rgba(255,255,255,0.66)", uiT: "rgba(255,255,255,0.16)", grade: "rgba(40,80,160,0.30)", dogB: 0.74, refl: 0.28, mist: 1, mistC: "150,172,210" },
    dawn: { skyT: "#f0a77e", skyB: "#ffe0b2", far: "#d8a882", mid: "#cd9a76", near: "#c38d6b", nearDark: "#b17f61", win: "#ffe7b8", winOn: 0.25, walk: "#e0bd96", curb: "#d2ab85", road: "#b78f6e", puddle: "#ffe3b4", post: "#7c5f47", box: "#b98a5c", boxD: "#a2774f", lampOn: 0.3, cloud: 0.3, cloudC: "#ffd7b5", sun: 0.55, birds: 0.8, capC: "#3a2618", capS: "rgba(255,236,200,0.6)", uiC: "rgba(58,38,24,0.7)", uiT: "rgba(58,38,24,0.18)", grade: "rgba(255,170,100,0.16)", dogB: 0.95, refl: 0.15, mist: 0.55, mistC: "255,236,214" }
  };
  var WX = { kind: "clear", wind: false, tod: "day", src: "time", done: false };
  var hour = new Date().getHours();
  function todFromHour(h) { return h >= 20 || h < 5 ? "night" : (h >= 17.5 || h < 7) ? "dusk" : "day"; }
  WX.tod = todFromHour(hour + new Date().getMinutes() / 60);
  function kindFromCode(c) {
    if (c >= 95) return "storm";
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return "snow";
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return "rain";
    if (c === 2 || c === 3 || c === 45 || c === 48) return "cloudy";
    return "clear";
  }
  Object.keys(PAL).forEach(function (k) { PAL[k].stars = 0; PAL[k].moon = 0; });
  /* how the scene's light falls on the characters: brightness, saturation and a soft rim */
  var LIGHT = { night: [0.92, 0.94, "rgba(255,206,140,0.38)"], soft: [0.95, 0.96, "rgba(255,214,160,0.32)"], room: [1.02, 1.04, "rgba(255,186,120,0.42)"], dawn: [1.02, 1.03, "rgba(255,196,140,0.45)"], gold: [1.03, 1.05, "rgba(255,214,150,0.5)"] };
  Object.keys(PAL).forEach(function (k) { var l = LIGHT[k] || [1, 1, "rgba(255,255,255,0.2)"]; PAL[k].charB = l[0]; PAL[k].charS = l[1]; PAL[k].rimC = l[2]; });
  function palFrom(base, over) { var o = {}; for (var k in PAL[base]) o[k] = PAL[base][k]; for (var j in over) o[j] = over[j]; return o; }
  var DARK_UI = { capC: "#16263f", capS: "rgba(255,255,255,0.65)", uiC: "rgba(22,38,63,0.72)", uiT: "rgba(22,38,63,0.18)" };
  PAL.day = palFrom("night", Object.assign({ skyT: "#4f98da", skyB: "#cde4f6", far: "#9fb8cf", mid: "#7f9cb8", near: "#6c8cab", nearDark: "#5b7a98", win: "#f3f0dc", winOn: 0.3, walk: "#d9d2c4", curb: "#bdb4a4", road: "#7b838d", puddle: "#b4cde6", post: "#3d4756", box: "#b48a5e", boxD: "#9a7550", lampOn: 0, cloud: 0.6, cloudC: "#ffffff", sun: 1, birds: 1, grade: "rgba(255,206,140,0.18)", dogB: 1, refl: 0.08, mist: 0.08, mistC: "255,246,230" }, DARK_UI));
  PAL.cloudy = palFrom("day", { skyT: "#8ea3b8", skyB: "#d5dde5", cloud: 0.95, cloudC: "#eef1f4", sun: 0.25, birds: 0.6, grade: "rgba(200,210,225,0.10)", mist: 0.35, mistC: "230,235,240" });
  PAL.overcast = palFrom("night", { skyT: "#55647a", skyB: "#97a4b4", far: "#6b7a8d", mid: "#647386", near: "#5c6b7e", nearDark: "#526072", win: "#f2d08a", winOn: 0.5, walk: "#69737f", curb: "#78828f", road: "#424b57", puddle: "#8fa3bd", post: "#2f3743", box: "#6b5643", boxD: "#594736", lampOn: 0.55, cloud: 0.95, cloudC: "#7a8696", grade: "rgba(60,90,140,0.16)", dogB: 0.88, refl: 0.24, mist: 0.9, mistC: "190,200,215" });
  PAL.stormday = palFrom("overcast", { skyT: "#333d4d", skyB: "#636f80", far: "#4c5869", mid: "#465263", near: "#414d5e", nearDark: "#3a4556", cloud: 1, cloudC: "#525d6c", lampOn: 0.8, dogB: 0.8 });
  PAL.snowday = palFrom("day", { skyT: "#b6c4d4", skyB: "#e7edf4", far: "#a7b4c4", mid: "#9fadbf", near: "#98a7ba", nearDark: "#8b9aae", win: "#ffe2a6", winOn: 0.45, walk: "#f5f8fc", curb: "#e3e9f1", road: "#d2dbe6", puddle: "#ffffff", lampOn: 0.3, cloud: 0.85, cloudC: "#f2f5f9", sun: 0, birds: 0, grade: "rgba(200,220,255,0.14)", dogB: 0.95, refl: 0.04, mist: 0.6, mistC: "235,240,248" });
  PAL.nightclear = palFrom("night", { cloud: 0.2, stars: 1, moon: 1, refl: 0.07, puddle: "#334d70", mist: 0.45, grade: "rgba(40,80,160,0.24)" });
  PAL.snownight = palFrom("night", { walk: "#cad4e3", curb: "#b5c1d3", road: "#8592a8", puddle: "#e3e9f2", refl: 0.06, mist: 0.7, mistC: "200,210,230", cloud: 0.9, cloudC: "#3a4a64" });
  PAL.duskclear = palFrom("dawn", { sun: 0.8, birds: 0.7, lampOn: 0.6, winOn: 0.6 });
  PAL.day.rimC = "rgba(255,250,235,0.42)"; PAL.day.charB = 1.02; PAL.day.charS = 1;
  PAL.cloudy.rimC = "rgba(240,244,250,0.3)"; PAL.cloudy.charB = 0.98;
  PAL.overcast.rimC = "rgba(214,226,240,0.28)"; PAL.overcast.charB = 0.95; PAL.overcast.charS = 0.93;
  PAL.stormday.rimC = "rgba(200,214,235,0.26)"; PAL.stormday.charB = 0.9; PAL.stormday.charS = 0.9;
  PAL.snowday.rimC = "rgba(255,255,255,0.5)"; PAL.snowday.charB = 1.0;
  PAL.nightclear.rimC = "rgba(214,226,255,0.36)"; PAL.snownight.rimC = "rgba(220,230,255,0.36)";

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
  PAL.mild = palFrom("day", { skyT: "#7fa6c9", skyB: "#dfe8ee", cloud: 0.8, sun: 0.35, birds: 0.7, grade: "rgba(235,215,180,0.12)" });
  PAL.nightcloud = palFrom("nightclear", { cloud: 0.7, stars: 0.4, moon: 0.75 });
  PAL.stormnight = palFrom("night", { cloud: 1, cloudC: "#1d2b42", mist: 1 });
  PAL.day.rays = 0.9; PAL.duskclear.rays = 1; PAL.mild.rays = 0.35; PAL.cloudy.rays = 0.15;
  PAL.stormday.porch = 1; PAL.stormnight.porch = 1; PAL.snowday.snowy = 1; PAL.snownight.snowy = 1;
  Object.keys(PAL).forEach(function (k) {
    var p = PAL[k];
    if (p.snowy == null) p.snowy = 0;
    if (p.rays == null) p.rays = 0;
    if (p.porch == null) p.porch = p.lampOn > 0.05 ? Math.max(0.3, p.lampOn) : 0;          /* the porch lantern: lit whenever the street lamps are */
    if (p.vig == null) p.vig = p.lampOn > 0.7 ? 0.62 : p.lampOn > 0.25 ? 0.46 : 0.26;
  });

  /* ===================================================================== today's story
     One complete little story for the weather outside, in that weather and that light from the first frame to the
     last: a sunny wander with a butterfly, a rainy puddle walk, a quiet night under the stars, a snow day, a windy
     chase after a leaf, or a storm waited out on the porch. The weather picks the story; the time of day only lights
     it (rain at noon is a grey day, not a night). The story is chosen once, before the scene is shown, and nothing
     about it changes while it plays: the same street, the same outfit, the same sky.
     Weather comes from Open-Meteo (free, no key). The place is the one the browser already shares (only if the visitor
     granted it before; the film never asks) or, by default, the city in the device's time zone, so no permission
     prompt appears. Coordinates are rounded to about 1 km. Nothing is stored except a 45-minute cache in this browser.
     Offline, on any error, or after 2.4 s without an answer, the story is a plain walk lit by the local time, and the
     film does not claim to know the weather.
     For checking: ?story&weather=rain|storm|snow|wind|clear|cloudy&time=day|dusk|night, or &weather=offline. */
  var COSTUME = "clear", ST = null, SCENE = null;
  function hop(a, b, h) { return [[a, 0], [(a + b) / 2, -h, "out"], [b, 0, "in"]]; }
  function hops() { var o = [[0, 0]]; for (var i = 0; i < arguments.length; i++) o = o.concat(hop.apply(null, arguments[i])); return o; }
  /* where things sit on the characters, in street coordinates: f is true when the character faces left */
  function sHand(x, f) { return [x + (f ? -1 : 1) * 66, GY - 96]; }   /* Sunny's raised hand */
  function sTop(x, f) { return [x + (f ? -1 : 1) * 6, GY - 152]; }    /* the tip of his sprout */
  function pNose(x, f) { return [x + (f ? -1 : 1) * 28, GY - 50]; }   /* Puppy's nose */
  function pHead(x, f) { return [x + (f ? -1 : 1) * 5, GY - 92]; }   /* the top of Puppy's head */
  var K = ' stroke="#111" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
  var PROP = {
    butterfly: '<svg viewBox="0 0 36 30" width="36" height="30"><g class="bf-l"><path d="M18 15C13 2 2 1 3 11C3 17 11 17 18 15C10 16 5 22 9 26C13 29 17 22 18 16Z" fill="#ff8a9e"' + K + '/><circle cx="8" cy="9" r="2.2" fill="#fff" opacity="0.8"/></g>' +
      '<g class="bf-r"><path d="M18 15C23 2 34 1 33 11C33 17 25 17 18 15C26 16 31 22 27 26C23 29 19 22 18 16Z" fill="#ff8a9e"' + K + '/><circle cx="28" cy="9" r="2.2" fill="#fff" opacity="0.8"/></g>' +
      '<path d="M18 9V24" stroke="#111" stroke-width="2.6" stroke-linecap="round"/><path d="M18 10q-3 -5 -6 -6M18 10q3 -5 6 -6" fill="none" stroke="#111" stroke-width="1.2" stroke-linecap="round"/></svg>',
    leaf: '<svg viewBox="0 0 32 20" width="32" height="20"><path d="M2 10C9 0 22 0 30 10C22 20 9 20 2 10Z" fill="#e0932f"' + K + '/><path d="M2 10H25M11 10l4 -4M17 10l4 -4M11 10l4 4M17 10l4 4" fill="none" stroke="#8a4f17" stroke-width="1.2" stroke-linecap="round"/></svg>',
    ball: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#fff"' + K + '/><path d="M6 15a7 7 0 0 0 11 2" fill="none" stroke="#b9c9e2" stroke-width="2" stroke-linecap="round"/></svg>',
    glow: '<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="3" fill="#fff7b0"/></svg>',
    star: '<svg viewBox="0 0 170 8" width="170" height="8"><defs><linearGradient id="sst-ss"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect x="0" y="3" width="164" height="2" rx="1" fill="url(#sst-ss)"/><circle cx="165" cy="4" r="3.2" fill="#fff"/></svg>'
  };
  var STORIES = {
    /* a bright (or simply dry) day: Sunny meets a butterfly, Puppy bounds in after it, and it picks its own perches */
    day: function () {
      var nose = pNose(1090, true), top = sTop(946, false);
      return {
        sub: "Small wonders are better shared.", amb: "birds",
        label: "Sunny is out for a walk and meets a butterfly. Puppy bounds in to chase it, the butterfly lands on Puppy’s nose, then on Sunny’s sprout, and the two friends sit down together.",
        SX: [[0, 560], [1.5, 560], [4.2, 760, "lin"], [5.0, 760], [6.2, 832, "lin"], [14.0, 832], [15.4, 946, "lin"]],
        SY: hops([6.9, 7.4, 34]),
        SS: [[0, { act: "stretch", flip: false, look: [0.3, -0.9] }], [1.5, { act: "walk", look: [0.5, -0.2] }], [2.4, { emo: "happy" }], [3.4, { emo: null, look: [1, -0.5] }], [4.2, { act: null }], [4.4, { emo: "curious" }],
          [5.0, { act: "walk", slow: 1, emo: null }], [6.2, { act: null }], [6.4, { reach: 1, look: [1, -0.7] }], [7.5, { reach: 0, emo: "laugh" }], [8.6, { emo: null, look: [1, -0.4] }], [9.6, { look: [1, 0.2], emo: "happy" }], [10.8, { emo: null }],
          [11.4, { look: [1, -0.3] }], [12.6, { look: [1, 0.2] }], [13.7, { emo: "whoa" }], [14.0, { emo: null, act: "walk" }], [15.4, { act: null, bend: 1, look: [1, 0.6] }], [16.2, { emo: "blush" }],
          [17.3, { bend: 0, emo: "whoa", look: [0.8, -0.6] }], [18.2, { emo: null, look: [0.4, -0.9] }], [19.4, { look: [0, -1], emo: "whoa" }], [20.2, { emo: "laugh" }], [21.4, { emo: "happy", sit: 1, look: [1, 0.3] }], [22.4, { reach: 1 }], [23.6, { emo: "relaxed" }]],
        PX: [[0, 1480], [8.8, 1480], [11.0, 1090, "out"], [21.6, 1090], [22.6, 1050]],
        PY: hops([11.3, 11.8, 46], [17.15, 17.45, 10], [19.8, 20.2, 22], [20.5, 20.9, 18]),
        PS: [[0, { flip: true, emo: "excited", look: [-1, -0.4] }], [11.0, { emo: "happy", look: [-0.6, -0.8] }], [11.9, { emo: null, look: [-0.5, -1] }], [12.4, { act: "tilt", emo: "curious" }], [13.4, { act: null }], [13.6, { emo: "surprised", look: [-1, 0.5] }], [15.2, { emo: "shy" }],
          [17.15, { emo: null, act: "sneeze" }], [17.8, { act: null, look: [-0.6, -0.9] }], [19.5, { emo: "happy", act: "wag", look: [-1, -0.6] }], [21.6, { act: null, creep: 1 }], [22.6, { creep: 0, lean: 1 }], [23.6, { emo: "love" }]],
        CAM: [[0, 650, 650, 1.9], [4.4, 820, 648, 1.85], [9, 905, 650, 1.75], [11.5, 962, 650, 1.8], [15.6, 1012, 655, 2.05], [19.5, 1004, 642, 1.95], [26, 1006, 646, 2.06]],
        props: [{ svg: PROP.butterfly, w: 36, h: 30, cls: "sst-bf", wob: [9, 7, 5.2],
          X: [[0, 1260], [2.4, 1260], [4.4, 940], [6.4, 905], [7.0, 952], [8.2, 1012], [9.6, 980], [11.2, 1062], [12.2, 1034], [13.6, nose[0]], [17.2, nose[0]], [18.0, 1040], [18.8, 986], [19.4, top[0]]],
          Y: [[0, 520], [2.4, 520], [4.4, 640], [6.4, 656], [7.0, 590], [8.2, 640], [9.6, 610], [11.2, 668], [12.2, 585], [13.6, nose[1] - 10], [17.2, nose[1] - 10], [18.0, 612], [18.8, 584], [19.4, top[1] - 12], [21.4, top[1] - 12], [21.9, top[1] + 2]],
          OP: [[0, 0], [2.2, 0], [2.6, 1]], WOB: [[0, 1], [13.2, 1], [13.6, 0], [17.2, 0], [17.4, 1], [19.0, 1], [19.4, 0]] }],
        SPARKS: [[13.65, nose[0], nose[1] - 22], [19.45, top[0], top[1] - 24]],
        CUES: [[0.6, "birds"], [4.4, "hmm"], [7.0, "swoosh"], [9.4, "yips"], [11.3, "barkHappy"], [13.6, "ting"], [16.2, "aww"], [17.2, "sniff"], [19.4, "ding"], [19.9, "barkHappy"], [22.8, "bell"]],
        KEY: [3.2, 7.1, 13.9, 19.6, 25]
      };
    },
    /* rain from the first frame: puddle jumping, a soaked puppy who does not trust the puddle, one umbrella for two */
    rain: function () {
      return {
        sub: "One umbrella is plenty for two.",
        label: "It is raining. Sunny, in a raincoat with an umbrella, jumps in a puddle. Puppy arrives soaked and unsure of the puddle, so Sunny walks over and shares the umbrella, and they carry on through the rain together.",
        SX: [[0, 540], [3.4, 760, "lin"], [4.4, 760], [5.2, 832, "lin"], [5.7, 832], [6.2, 900, "lin"], [11.6, 900], [13.0, 1004, "lin"], [16.6, 1004], [21.8, 1296, "lin"]],
        SY: hops([5.7, 6.2, 62], [7.0, 7.5, 50], [8.0, 8.5, 40]),
        SS: [[0, { act: "walk", slow: 1, hold: 1, flip: false, look: [0.3, -0.5] }], [2.0, { look: [0.6, 0.3] }], [3.4, { act: null, look: [1, 0.8] }], [3.7, { emo: "curious" }], [4.4, { act: "walk", emo: null }], [5.2, { act: null, bend: 1 }], [5.7, { bend: 0, emo: "happy" }], [6.2, { emo: "laugh" }],
          [9.0, { emo: "happy" }], [9.7, { emo: "curious", look: [1, 0.1] }], [10.8, { emo: "sad", look: [1, 0.3] }], [11.6, { act: "walk", emo: null }], [13.0, { act: null, look: [1, 0.6] }], [13.6, { emo: "relaxed" }], [15.4, { emo: "happy" }],
          [16.6, { act: "walk", emo: null, look: [0.6, 0.4] }], [19.0, { look: [1, 0.5], emo: "happy" }], [20.8, { emo: "laugh" }], [21.8, { act: null, look: [1, 0.5] }], [22.6, { emo: "relaxed" }]],
        UR: [[0, -14], [12.8, -14], [13.5, 14], [16.6, 14], [17.2, 2], [21.8, 2], [22.4, 14]], UV: [[0, 1]],
        PX: [[0, 1470], [7.8, 1470], [9.6, 1150, "lin"], [10.2, 1150], [11.0, 1080], [11.6, 1080], [12.0, 1112], [16.6, 1112], [21.8, 1404, "lin"], [22.3, 1404], [22.9, 1398]],
        PY: hops([20.4, 20.8, 30]),
        PS: [[0, { flip: true, wet: 1, emo: "sad", look: [-1, 0.2] }], [9.6, { shiver: 1, look: [-1, 0.5] }], [10.2, { creep: 1, shiver: 0 }], [11.0, { creep: 0, act: "sniff", look: [-1, 0.9] }], [11.6, { act: null, emo: "scared" }], [12.0, { shiver: 1, emo: "sad", look: [-1, -0.2] }],
          [13.5, { look: [-1, -0.8], emo: "surprised" }], [14.3, { emo: null, act: "shake", shiver: 0 }], [15.1, { act: null, wet: 0, emo: "happy", look: [-1, -0.6] }], [15.6, { act: "wag" }], [16.6, { act: null, flip: false, emo: null, look: [0.6, 0] }],
          [18.4, { look: [-1, -0.7], emo: "happy" }], [19.6, { look: [1, 0.3], emo: "excited" }], [21.8, { emo: "happy" }], [22.3, { flip: true, creep: 1 }], [22.9, { creep: 0, lean: 1, look: [-1, -0.6] }], [24, { emo: "love" }]],
        CAM: [[0, 640, 650, 1.9], [3.4, 800, 650, 1.85], [6.2, 900, 646, 1.95], [9.2, 985, 650, 1.7], [13.5, 1062, 652, 2.0], [16.6, 1070, 650, 1.9], [21.8, 1345, 650, 1.85], [26, 1345, 650, 2.0]],
        FX: [[6.2, "splash", 900, GY + 4, 18], [7.5, "splash", 900, GY + 4, 14], [8.5, "splash", 900, GY + 4, 10], [14.5, "spray", 1112, GY - 60, 14], [20.8, "splash", 1332, GY + 6, 10]],
        CUES: [[3.7, "hmm"], [6.2, "splosh"], [7.5, "splosh"], [8.5, "splosh"], [9.6, "whimper"], [11.6, "whine"], [13.5, "pop"], [14.3, "shake"], [15.2, "barkHappy"], [16.0, "aww"], [20.8, "splosh"], [20.95, "yips"], [22.8, "bell"]],
        KEY: [3.0, 5.95, 12.4, 15.3, 25]
      };
    },
    /* a dry night: a quiet walk, the stars, one shooting star, fireflies, and a nap under the street lamp */
    night: function () {
      var hand = sHand(800, false);
      return {
        sub: "Quiet nights, good company.", amb: "crickets",
        label: "At night Sunny, in a hoodie, walks with Puppy under the street lamps. They stop to look at the stars, a shooting star goes by, fireflies come out, one rests on Sunny’s hand, and the two sit down together until Puppy falls asleep.",
        SX: [[0, 520], [4.6, 800, "lin"]],
        SS: [[0, { act: "walk", slow: 1, flip: false, look: [0.6, 0.2] }], [2.4, { look: [0.3, -0.6] }], [4.6, { act: null, look: [0.2, -1] }], [4.9, { emo: "curious" }], [5.8, { reach: 1, emo: null }], [7.4, { reach: 0 }], [8.2, { emo: "whoa" }], [9.0, { emo: "happy" }],
          [10.2, { emo: null, look: [1, 0.3] }], [11.0, { look: [0.9, -0.2] }], [12.5, { reach: 1, look: [1, -0.5] }], [13.0, { emo: "happy" }], [14.0, { bend: 1, look: [1, 0.4] }], [15.3, { bend: 0, reach: 0, emo: null, look: [0.6, -0.9] }],
          [17.2, { sit: 1, look: [1, 0.3] }], [18.0, { reach: 1, emo: "relaxed" }], [19.6, { look: [0.3, -0.8] }], [22.0, { look: [1, 0.4] }], [23.6, { emo: "sleepy" }]],
        PX: [[0, 640], [4.6, 920, "lin"], [16.0, 920], [17.0, 902]],
        PY: hops([8.5, 8.9, 26], [11.8, 12.2, 34]),
        PS: [[0, { flip: false, look: [0.6, 0.1] }], [2.4, { look: [-1, -0.4], emo: "happy" }], [3.4, { look: [0.6, 0], emo: null }], [4.9, { flip: true, look: [-1, -0.4] }], [6.2, { look: [-0.3, -1], emo: "curious" }], [8.3, { emo: "excited" }], [9.0, { act: "howl", emo: null }],
          [10.2, { act: null, look: [-0.6, -0.5] }], [11.2, { emo: "curious", look: [0.5, -0.6] }], [12.4, { look: [-1, -0.8] }], [14.2, { act: "sniff", emo: null }], [15.3, { act: null, look: [-0.5, -1], emo: "happy" }], [16.0, { creep: 1 }], [17.0, { creep: 0 }],
          [17.6, { lean: 1, rest: 1 }], [20, { emo: "sleepy" }], [23.6, { emo: null, act: "sleep" }]],
        CAM: [[0, 660, 650, 1.85], [4.6, 862, 650, 1.85], [6.0, 885, 588, 1.42], [9.6, 885, 588, 1.42], [11.4, 870, 648, 1.85], [15.3, 866, 642, 1.8], [18, 850, 650, 2.0], [26, 850, 648, 2.08]],
        FLIES: [[0, 0], [10.0, 0], [12.4, 1]],
        props: [{ svg: PROP.star, w: 170, h: 8, cls: "sst-shoot", sky: 1, rot: 15, X: [[0, 470], [8.0, 470], [8.9, 890, "out"]], Y: [[0, 300], [8.0, 300], [8.9, 412, "out"]], OP: [[0, 0], [7.95, 0], [8.1, 1], [8.65, 1], [8.95, 0]] },
          { svg: PROP.glow, w: 16, h: 16, cls: "sst-glowdot", wob: [7, 6, 2.6],
            X: [[0, 1020], [10.8, 1020], [11.8, 965], [12.8, hand[0]], [14.0, hand[0] + 10], [15.3, hand[0] + 10], [17.4, 880], [26, 905]],
            Y: [[0, 706], [10.8, 706], [11.8, 665], [12.8, hand[1] - 6], [14.0, hand[1] + 4], [15.3, hand[1] + 4], [17.4, 600], [26, 520]],
            OP: [[0, 0], [10.6, 0], [11.0, 1], [20, 1], [24, 0.5]], WOB: [[0, 1], [12.5, 1], [12.8, 0], [15.3, 0], [15.6, 1]] }],
        SPARKS: [[8.9, 880, 420]],
        CUES: [[0.8, "crickets"], [4.9, "hmm"], [8.05, "ting"], [8.3, "gasp"], [9.05, "howl"], [12.8, "ding"], [14.3, "sniff"], [17.8, "pupSigh"], [22.8, "bell"], [23.8, "sleep"]],
        KEY: [3.0, 8.4, 13.4, 19.4, 25]
      };
    },
    /* snow: a flake on the glove, a snowball, a puppy who catches it with his whole face, and a lot of running about */
    snow: function () {
      var hand = sHand(780, false), nose = pNose(880, true);
      return {
        sub: "Cold day, warm company.",
        label: "It is snowing. Sunny, in a winter coat, scarf and gloves, makes a snowball and tosses it to Puppy, who jumps and catches it in a puff of snow. They play in the snow and then sit together and watch it fall.",
        SX: [[0, 540], [4.0, 780, "lin"]],
        SY: hops([15.0, 15.4, 30], [16.0, 16.4, 30]),
        SS: [[0, { act: "walk", slow: 1, flip: false, look: [0.3, -0.8] }], [1.2, { emo: "relaxed" }], [3.0, { emo: null }], [4.0, { act: null }], [4.3, { reach: 1, look: [1, -0.7] }], [5.2, { emo: "happy" }], [5.8, { reach: 0, emo: null, look: [0.6, 0.9] }], [6.0, { bend: 1 }],
          [7.2, { bend: 0, mend: 1, look: [0.4, 0.7], emo: "focused" }], [8.4, { emo: null }], [9.0, { look: [1, 0.1], emo: "happy" }], [10.4, { mend: 0, reach: 1, emo: null }], [11.75, { reach: 0 }], [12.6, { emo: "laugh" }], [14.2, { emo: "happy", look: [1, 0.2] }],
          [14.9, { flip: true, look: [-1, 0.2] }], [16.2, { flip: false, look: [1, 0.2] }], [17.4, { emo: null }], [18.0, { look: [0.3, -0.9], emo: "relaxed" }], [19.7, { look: [1, 0.3], emo: null }], [20.7, { emo: "laugh" }], [21.6, { sit: 1, emo: "happy" }], [22.2, { reach: 1 }], [24, { emo: "relaxed" }]],
        PX: [[0, 1470], [8.0, 1470], [10.0, 1060, "out"], [14.2, 1060], [15.5, 640], [15.9, 640], [17.3, 880]],
        PY: hops([8.4, 8.8, 24], [9.0, 9.4, 24], [9.6, 10.0, 18], [10.8, 11.2, 26], [12.2, 12.8, 56], [20.55, 20.85, 12]),
        PS: [[0, { flip: true, scarf: "w", emo: "excited", look: [-1, -0.2] }], [10.0, { emo: "happy", act: "wag", look: [-1, -0.6] }], [11.6, { act: null, look: [-0.7, -1], emo: "excited" }], [12.6, { emo: "surprised" }], [13.2, { emo: null, act: "shake" }], [13.9, { act: null, emo: "happy" }],
          [14.2, { emo: "excited", look: [-1, 0] }], [15.5, { flip: false, look: [1, 0] }], [17.3, { flip: true, emo: "happy", look: [-1, -0.6] }], [18.2, { look: [-0.3, -1], emo: null }], [19.6, { emo: "surprised", look: [-0.8, 0.5] }], [20.55, { emo: null, act: "sneeze" }],
          [21.0, { act: null, emo: "happy", look: [-1, -0.6] }], [22.0, { lean: 1 }], [24, { emo: "love" }]],
        CAM: [[0, 650, 650, 1.9], [4, 822, 650, 1.9], [8.6, 905, 650, 1.7], [12.4, 930, 640, 1.8], [15.4, 765, 650, 1.65], [17.4, 832, 650, 1.85], [26, 832, 648, 2.05]],
        props: [{ svg: PROP.ball, w: 24, h: 24, cls: "sst-ball",
          X: [[0, 782], [10.4, 782], [10.8, hand[0]], [11.6, hand[0]], [12.5, 1024, "lin"]], Y: [[0, GY - 34], [10.4, GY - 34], [10.8, hand[1] - 4], [11.6, hand[1] - 4], [12.05, 540, "out"], [12.5, 668, "in"]],
          OP: [[0, 0], [7.1, 0], [7.4, 1], [12.48, 1], [12.52, 0]], R: [[0, 0], [11.6, 0], [12.5, 300, "lin"]] }],
        SPARKS: [[4.9, hand[0], hand[1] - 10], [7.5, 782, GY - 44], [19.6, nose[0], nose[1] - 8]],
        FX: [[12.5, "puff", 1026, 668, 16], [13.4, "puff", 1060, GY - 70, 10], [20.6, "puff", nose[0], nose[1], 6]],
        CUES: [[4.9, "ting"], [7.5, "pop"], [9.0, "barkHappy"], [10.9, "yips"], [11.6, "swoosh"], [12.5, "puff"], [13.2, "shake"], [14.3, "barkHappy"], [16.4, "arf"], [19.6, "ting"], [20.6, "sniff"], [22.8, "bell"]],
        KEY: [3.0, 7.8, 12.45, 19.4, 25]
      };
    },
    /* wind: one leaf that will not be caught, a puppy who catches it anyway, and a gust that takes it back */
    wind: function () {
      var mouth = pNose(658, false), hand = sHand(760, true), head = pHead(658, false);
      return {
        sub: "Catch what the wind brings.",
        label: "It is windy. Sunny, in a windbreaker, tries to catch a leaf that keeps slipping away. Puppy runs in, chases the leaf down and brings it back, a gust carries it off again, and another leaf lands on Puppy’s head.",
        SX: [[0, 560], [2.4, 684, "lin"], [3.4, 674], [4.2, 760, "lin"]],
        SY: hops([5.7, 6.2, 48], [6.8, 7.3, 48], [20.0, 20.4, 36]),
        SS: [[0, { act: "walk", slow: 1, flip: false, look: [0.5, -0.2] }], [2.4, { act: null, brace: 1, emo: "whoa" }], [3.4, { brace: 0, emo: null, act: "walk" }], [4.2, { act: null, look: [1, -0.5] }], [5.0, { emo: "curious" }], [5.6, { reach: 1, emo: null, look: [1, -0.7] }], [6.3, { reach: 0 }],
          [6.5, { flip: true, look: [-1, -0.6] }], [6.8, { reach: 1 }], [7.4, { reach: 0, emo: "laugh" }], [7.8, { flip: false, look: [0.7, -0.8] }], [8.8, { emo: "happy", look: [1, 0] }], [10.2, { emo: null, look: [1, -0.3] }], [11.0, { flip: true, look: [-1, 0.2], emo: "happy" }],
          [12.6, { emo: "laugh" }], [13.6, { emo: "happy", look: [-1, 0.4] }], [14.8, { bend: 1, emo: "blush" }], [15.6, { bend: 0, reach: 1, emo: "happy", look: [-1, -0.5] }], [16.6, { brace: 1, emo: "whoa" }], [17.1, { reach: 0, look: [-1, -0.8] }], [17.8, { brace: 0 }],
          [18.6, { emo: null, look: [-1, 0.3] }], [19.0, { emo: "laugh" }], [20.0, { reach: 1, look: [-0.3, -1] }], [20.6, { reach: 0, emo: "happy" }], [22.3, { emo: "laugh", look: [-1, 0.2] }], [23.2, { sit: 1, emo: "happy" }], [23.8, { reach: 1 }]],
        PX: [[0, 1480], [8.4, 1480], [10.0, 1000, "out"], [10.8, 1000], [11.7, 610], [13.0, 610], [14.4, 658]],
        PY: hops([10.2, 10.7, 60], [11.6, 12.0, 30], [19.6, 20.0, 40], [20.8, 21.2, 36]),
        PS: [[0, { flip: true, emo: "excited", look: [-1, -0.5] }], [10.8, { look: [-1, -0.2] }], [12.0, { emo: "happy", look: [-0.5, 0.9] }], [12.4, { act: "wag" }], [12.8, { flip: false, look: [1, -0.4] }], [13.0, { act: null }], [14.4, { act: "wag", look: [1, -0.6] }], [15.6, { act: null }],
          [16.6, { emo: "surprised" }], [17.0, { flip: true, look: [-1, -0.6] }], [18.4, { flip: false, look: [1, -0.4], emo: null }], [19.0, { emo: "happy" }], [19.6, { emo: "excited", look: [0.3, -1] }], [21.3, { emo: null, look: [0.5, -0.8] }], [22.2, { emo: "surprised", look: [0, -1] }],
          [23.0, { emo: "happy", look: [1, -0.5] }], [23.6, { lean: 1 }]],
        CAM: [[0, 660, 650, 1.9], [4.2, 800, 648, 1.85], [8.6, 862, 645, 1.7], [10.4, 900, 645, 1.7], [11.8, 700, 650, 1.75], [14.6, 712, 652, 2.0], [17.2, 700, 640, 1.8], [19, 712, 645, 1.8], [22.4, 712, 650, 2.0], [26, 712, 648, 2.06]],
        LEAF: [[0, 1], [2.2, 1], [2.5, 2.4], [3.6, 1], [16.4, 1], [16.7, 2.6], [17.8, 1], [19.0, 2], [22.0, 2], [23.5, 1]],
        WINDT: [[0, 0.85], [2.2, 0.85], [2.5, 1.2], [3.6, 0.85], [16.4, 0.85], [16.7, 1.25], [17.8, 0.85]],
        props: [{ svg: PROP.leaf, w: 32, h: 20, cls: "sst-leaf", wob: [8, 9, 4.1], spin: 260,
          X: [[0, 1300], [4.4, 1300], [5.5, 880], [5.9, 850], [6.4, 690], [7.0, 662], [7.6, 800], [8.4, 900], [9.6, 940], [10.3, 965], [10.6, 930], [11.3, 690], [11.9, 598], [12.9, 598], [13.2, 646], [14.4, mouth[0] + 6], [15.2, mouth[0] + 6], [15.7, hand[0]], [16.6, hand[0]], [17.0, 560], [18.2, 240], [18.3, 1010], [20.8, 1010], [22.2, head[0]]],
          Y: [[0, 560], [4.4, 560], [5.5, 640], [5.9, 600], [6.4, 612], [7.0, 640], [7.6, 585], [8.4, 545], [9.6, 570], [10.3, 665], [10.6, 640], [11.3, 660], [11.9, GY - 8], [12.9, GY - 8], [13.2, mouth[1] + 4], [14.4, mouth[1] + 4], [15.2, mouth[1] + 4], [15.7, hand[1] - 6], [16.6, hand[1] - 6], [17.0, 560], [18.2, 470], [18.3, 480], [20.8, 480], [22.2, head[1] - 6]],
          OP: [[0, 0], [4.3, 0], [4.6, 1], [17.6, 1], [18.2, 0], [20.8, 0], [21.0, 1]],
          WOB: [[0, 1], [11.6, 1], [11.9, 0], [16.6, 0], [16.8, 1], [21.9, 1], [22.2, 0]] }],
        SPARKS: [[12.0, 598, GY - 30], [22.25, head[0], head[1] - 18]],
        CUES: [[2.4, "gust"], [5.0, "hmm"], [5.7, "swoosh"], [6.8, "swoosh"], [9.2, "yips"], [10.3, "barkHappy"], [12.2, "barkHappy"], [14.9, "aww"], [16.6, "gust"], [19.7, "yips"], [22.2, "pop"], [22.8, "bell"]],
        KEY: [2.8, 5.95, 12.2, 15.9, 25]
      };
    },
    /* a thunderstorm: one flash, a frightened puppy, an arm around him, and the storm waited out together on the porch */
    storm: function () {
      return {
        sub: "Storms are smaller together.", shelter: true,
        label: "A thunderstorm. Sunny, in a storm jacket with an umbrella, is walking with Puppy when lightning flashes and Puppy is frightened. Sunny crouches down, puts an arm around him, then leads him to the warm, lit porch, where they sit together while the rain goes on.",
        SX: [[0, 1010], [3.0, 870, "lin"], [12.2, 870], [17.0, 400, "lin"]],
        SS: [[0, { act: "walk", slow: 1, hold: 1, flip: true, look: [-0.6, 0.2] }], [3.0, { act: null, tremble: 1, emo: "whoa" }], [3.6, { tremble: 0, emo: null, look: [-1, 0.6] }], [4.6, { emo: "sad" }], [5.6, { sit: 1, emo: null }], [6.2, { reach: 1 }], [8.2, { emo: "relaxed" }],
          [9.7, { look: [-0.4, -0.6] }], [10.3, { look: [-1, 0.6] }], [11.4, { sit: 0, reach: 0, emo: null, look: [-1, -0.1] }], [12.2, { act: "walk" }], [14.4, { look: [-1, 0.5] }], [15.6, { look: [-1, 0] }], [17.0, { act: null, look: [-1, 0.5] }],
          [18.2, { sit: 1 }], [19.2, { reach: 1, emo: "relaxed" }], [19.7, { look: [0.6, -0.5] }], [20.6, { look: [-1, 0.5] }], [21.2, { emo: "happy" }], [23.6, { emo: "relaxed" }]],
        UR: [[0, -10], [6.0, -10], [6.6, 14], [11.4, 14], [12.0, -10]], UO: [[0, 1], [16.6, 1], [17.2, 0.14]], UV: [[0, 1], [17.2, 1], [17.5, 0]], /* under the porch roof the umbrella is folded and put away */
        PX: [[0, 910], [3.0, 770, "lin"], [12.2, 770], [17.0, 296, "lin"]],
        PY: hops([3.05, 3.35, 22], [9.65, 9.85, 8]),
        PS: [[0, { flip: true, wet: 1, look: [-0.6, 0.2] }], [3.05, { emo: "scared", look: [0.3, -0.8] }], [3.4, { shiver: 1 }], [3.6, { flip: false, look: [1, -0.4] }], [6.4, { emo: "sad", look: [1, -0.6] }], [8.4, { shiver: 0 }], [8.8, { emo: "shy" }],
          [9.65, { emo: "scared", shiver: 1, look: [0.2, -0.8] }], [10.4, { shiver: 0, emo: "sad", look: [1, -0.6] }], [11.0, { emo: "shy" }], [11.8, { emo: null }], [12.2, { flip: true, look: [-0.6, 0.1] }], [14.4, { look: [1, -0.6] }], [15.6, { look: [-0.6, 0] }],
          [17.5, { act: "shake" }], [18.3, { act: null, wet: 0, flip: false, look: [1, -0.5] }], [19.4, { lean: 1 }], [19.7, { look: [0.6, -0.7] }], [20.5, { look: [1, -0.6], emo: "shy" }], [21.2, { emo: "love" }], [22.0, { act: "wag" }],
          [23.6, { act: null, emo: "sleepy", rest: 1 }]],
        CAM: [[0, 930, 650, 1.85], [3.0, 832, 650, 1.85], [6.2, 826, 656, 2.1], [11.4, 826, 654, 2.0], [12.4, 780, 650, 1.75], [17.0, 372, 655, 1.85], [19.4, 362, 662, 2.1], [26, 362, 662, 2.18]],
        FLASH: [[2.9, 0], [2.96, 0.5], [3.06, 0.06], [3.16, 0.32], [3.5, 0], [9.5, 0], [9.56, 0.24], [9.7, 0.04], [9.78, 0.14], [10.0, 0], [19.5, 0], [19.56, 0.13], [19.8, 0]],
        WARM: [[0, 0], [14.5, 0], [17.2, 1]],
        FX: [[17.7, "spray", 296, GY - 60, 14]],
        CUES: [[3.45, "thunder"], [3.5, "whimperFear"], [5.0, "whimper"], [6.4, "breath"], [8.6, "whine"], [10.1, "thunderFar"], [10.2, "whimper"], [11.0, "aww"], [17.5, "shake"], [20.1, "thunderFar"], [21.2, "pupSigh"], [22.8, "bell"]],
        KEY: [2.4, 3.3, 8.6, 15.0, 25]
      };
    }
  };
  function mixPal(a, b, u, ui) {
    var o = {}; for (var k in a) o[k] = mix(a[k], b[k], u);
    ["capC", "capS", "uiC", "uiT"].forEach(function (k) { o[k] = ui[k]; });
    return o;
  }
  /* weather picks the story, time of day picks the light; both are settled here, once */
  function pickScene() {
    var k = WX.kind, tod = WX.tod, known = WX.src !== "time", night = tod === "night";
    var name = !known ? (night ? "night" : "day") : k === "storm" ? "storm" : k === "snow" ? "snow" : k === "rain" ? "rain" : WX.wind ? "wind" : night ? "night" : "day";
    var light, darkP;
    if (name === "storm") { light = "stormday"; darkP = "stormnight"; }
    else if (name === "snow") { light = "snowday"; darkP = "snownight"; }
    else if (name === "rain") { light = "overcast"; darkP = "night"; }
    else if (!known) { light = "mild"; darkP = "nightcloud"; }
    else if (k === "cloudy") { light = "cloudy"; darkP = "nightcloud"; }
    else { light = "day"; darkP = "nightclear"; }
    var P = night ? PAL[darkP] : tod === "dusk" ? (light === "day" ? PAL.duskclear : mixPal(PAL[light], PAL[darkP], 0.5, PAL[darkP])) : PAL[light];
    COSTUME = name === "day" ? "clear" : name;
    var word = night ? "night" : tod === "dusk" ? (hour < 12 ? "morning" : "evening") : (hour >= 5 && hour < 12 ? "morning" : "afternoon");
    var said = { storm: "There’s a storm near you", snow: "It’s snowing near you", rain: "It’s raining near you", wind: "It’s windy near you", night: k === "cloudy" ? "It’s a cloudy night near you" : "It’s a clear night near you", day: k === "cloudy" ? "It’s cloudy near you" : "It’s clear near you" }[name];
    var dress = { storm: "his storm jacket", snow: "his winter coat", rain: "his raincoat", wind: "his windbreaker", night: "his hoodie", day: "his cap" }[name];
    var windy = name === "storm" ? 0.95 : name === "wind" ? 0.85 : WX.wind && known ? 0.8 : name === "snow" ? 0.14 : 0.2;
    SCENE = { name: name, P: P, known: known, rain: name === "storm" ? 1.5 : name === "rain" ? 1 : 0, snow: name === "snow" ? 1 : 0, wind: windy,
      note: known ? said + ", so Sunny wore " + dress + "." : "A little walk, in your " + word + "…",
      sun: tod === "dusk" ? [1180, 470] : [1150, 330], moon: [1040, 385] };
    var o = STORIES[name](), d = { SY: [[0, 0]], PY: [[0, 0]], UR: [[0, -14]], UO: [[0, 1]], UV: [[0, 0]], FLASH: [[0, 0]], WARM: [[0, 0]], LEAF: [[0, 0]], FLIES: [[0, 0]], WINDT: [[0, windy]], props: [], SPARKS: [], FX: [], CUES: [], amb: null, shelter: false };
    for (var key in d) if (o[key] == null) o[key] = d[key];
    ST = o; KEY_T = o.KEY;
    CAMX = o.CAM.map(function (c) { return [c[0], c[1]]; }); CAMY = o.CAM.map(function (c) { return [c[0], c[2]]; }); CAMZ = o.CAM.map(function (c) { return [c[0], c[3]]; });
  }
  /* dress the set once: the palette, the sun or moon, the note at the bottom, the words for screen readers */
  function applyScene() {
    var P = SCENE.P;
    for (var k in P) setVar(k, P[k]);
    R.grade.style.background = P.grade; R.vig.style.opacity = P.vig; R.mist.style.opacity = P.mist;
    R.sun.style.left = SCENE.sun[0] + "px"; R.sun.style.top = SCENE.sun[1] + "px";
    R.moon.style.left = SCENE.moon[0] + "px"; R.moon.style.top = SCENE.moon[1] + "px";
    R.line.textContent = SCENE.note; R.sub.textContent = ST.sub;
    story.classList.toggle("is-windy", SCENE.wind > 0.6);
    story.setAttribute("aria-label", "A short animated story. " + ST.label + " Press Escape to skip.");
    if (ST.FLIES.length > 1) { var h = ""; for (var i = 0; i < 14; i++) h += '<i style="left:' + (640 + (i * 137) % 470) + "px;top:" + (590 + (i * 71) % 170) + "px;animation-delay:-" + (i * 0.83).toFixed(2) + "s,-" + (i * 0.37).toFixed(2) + 's"></i>'; R.flies.innerHTML = h; }
  }
  /* where and what the weather is: overrides for checking, then a fresh cache, then the browser's own answers */
  function resolveWeather() {
    var ow = qs.get("weather"), ot = qs.get("time");
    function finish(kind, wind, tod, src) {
      if (WX.done) return;
      WX.kind = kind || WX.kind; WX.wind = !!wind; if (tod) WX.tod = tod; WX.src = src; WX.done = true;
    }
    if (ot) WX.tod = ot;
    if (ow) { if (ow === "offline") return finish(null, false, ot, "time"); return finish(ow === "wind" ? "clear" : ow, ow === "wind" || qs.has("wind"), ot, "override"); }
    try { var c = JSON.parse(localStorage.getItem("sunny:wx") || "null"); if (c && Date.now() - c.t < 45 * 60000) return finish(c.kind, c.wind, todFromHour(hour), "cache"); } catch (e) { /* ignore */ }
    if (!win.fetch || (navigator.onLine === false)) return finish(null, false, null, "time");
    function forecast(lat, lon, src) {
      var ctl = win.AbortController ? new AbortController() : null; if (ctl) setTimeout(function () { ctl.abort(); }, 3500);
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat.toFixed(2) + "&longitude=" + lon.toFixed(2) + "&current=weather_code,wind_speed_10m,wind_gusts_10m,is_day&timezone=auto";
      return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.json(); }).then(function (j) {
        var cur = j && j.current; if (!cur || cur.weather_code == null) throw new Error("no weather");
        var kind = kindFromCode(cur.weather_code), wind = (cur.wind_speed_10m || 0) >= 30 || (cur.wind_gusts_10m || 0) >= 50;
        var tod = cur.is_day === 0 ? "night" : todFromHour(hour) === "night" ? "dusk" : todFromHour(hour);
        try { localStorage.setItem("sunny:wx", JSON.stringify({ t: Date.now(), kind: kind, wind: wind })); } catch (e) { /* ignore */ }
        finish(kind, wind, tod, src);
      });
    }
    function byTimeZone() {
      var zone = ""; try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { /* ignore */ }
      var city = zone.split("/").pop().replace(/_/g, " ");
      if (!city || /^(UTC|GMT|Etc)/i.test(zone)) return Promise.reject(new Error("no city"));
      return fetch("https://geocoding-api.open-meteo.com/v1/search?count=1&name=" + encodeURIComponent(city)).then(function (r) { return r.json(); }).then(function (g) {
        var hit = g && g.results && g.results[0]; if (!hit) throw new Error("no place");
        return forecast(hit.latitude, hit.longitude, "zone");
      });
    }
    var tried = false;
    function fallback() { if (tried) return; tried = true; byTimeZone().catch(function () { finish(null, false, null, "time"); }); }
    /* the browser's location, only when the visitor already allowed it for this site; the film never asks */
    if (navigator.permissions && navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then(function (st) {
        if (st.state !== "granted") return fallback();
        navigator.geolocation.getCurrentPosition(function (pos) { forecast(pos.coords.latitude, pos.coords.longitude, "location").catch(fallback); }, fallback, { timeout: 2500, maximumAge: 30 * 60000 });
      }, fallback);
    } else fallback();
  }
  resolveWeather();
  /* Sunny's outfits: layers added to his own drawing, so the face, colours and shape stay his */
  function costumeSVG(kind) {
    function P(r, a) { a = a * Math.PI / 180; return (110 + r * Math.cos(a)).toFixed(1) + " " + (125 + r * Math.sin(a)).toFixed(1); }
    function hood(color, trim) { return '<path d="M' + P(77, -197) + " A77 77 0 1 1 " + P(77, 17) + " L" + P(64, 17) + " A64 64 0 1 0 " + P(64, -197) + ' Z" fill="' + color + '" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>' + (trim ? '<path d="M' + P(66, -190) + " A66 66 0 1 1 " + P(66, 10) + '" fill="none" stroke="' + trim + '" stroke-width="2" opacity="0.8"/>' : ""); }
    function hem(y, color) { var a = Math.asin((y - 125) / 66) * 180 / Math.PI; return '<path d="M' + P(66.5, a) + " A66.5 66.5 0 0 1 " + P(66.5, 180 - a) + ' Z" fill="' + color + '" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>'; }
    var o = "";
    if (kind === "rain") o = hood("#4d8dff", "#9cc2ff") + hem(156, "#4d8dff") + '<path d="M110 156 V190" stroke="#111" stroke-width="2"/><circle cx="102" cy="166" r="2.6" fill="#ffd54a" stroke="#111" stroke-width="1.4"/><circle cx="102" cy="178" r="2.6" fill="#ffd54a" stroke="#111" stroke-width="1.4"/>';
    if (kind === "storm") o = hood("#2a3d66", "#6f86b5") + hem(154, "#2a3d66") + '<path d="M' + P(66, 52) + " A66 66 0 0 1 " + P(66, 128) + '" fill="none" stroke="#ffd54a" stroke-width="5"/><path d="M110 154 V190" stroke="#0b1424" stroke-width="2"/>';
    if (kind === "snow") o = '<path d="M' + P(68, -150) + " A68 68 0 0 1 " + P(68, -30) + ' Z" fill="#4d8dff" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/><path d="M' + P(67, -151) + " L" + P(67, -29) + '" stroke="#2f6fe0" stroke-width="8" stroke-linecap="round"/><path d="M' + P(67, -151) + " L" + P(67, -29) + '" stroke="#111" stroke-width="1.4" opacity="0.5"/>' +
      hem(158, "#de364d") + '<path d="M60 170 Q110 182 160 170 M66 182 Q110 192 154 182" fill="none" stroke="#9e1f33" stroke-width="1.8" opacity="0.7"/>' +
      '<path d="M56 150 Q110 166 164 150 L166 160 Q110 178 54 160 Z" fill="#f4efe6" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><path d="M74 157 l0 7 M90 161 l0 7 M106 163 l0 7 M122 162 l0 7 M138 159 l0 7 M152 155 l0 7" stroke="#de364d" stroke-width="3"/><path d="M140 160 q6 18 -2 30 l10 2 q8 -14 2 -32 z" fill="#f4efe6" stroke="#111" stroke-width="2" stroke-linejoin="round"/>';
    if (kind === "night") o = hood("#4a5160", "#6b7385") + hem(154, "#4a5160") + '<rect x="88" y="171" width="44" height="13" rx="6" fill="#3d4350" stroke="#111" stroke-width="1.8"/><path d="M101 156 V164 M119 156 V164" stroke="#e8e8ea" stroke-width="2" stroke-linecap="round"/><circle cx="101" cy="166" r="2.4" fill="#e8e8ea"/><circle cx="119" cy="166" r="2.4" fill="#e8e8ea"/>';
    if (kind === "wind") o = hem(154, "#2bb59a") + '<path d="M110 154 V190" stroke="#111" stroke-width="2"/><path d="M' + P(66, 26) + ' l12 -10 l-4 14 z" fill="#2bb59a" stroke="#111" stroke-width="2" stroke-linejoin="round"/><path d="M' + P(66, 154) + ' l-12 -10 l4 14 z" fill="#2bb59a" stroke="#111" stroke-width="2" stroke-linejoin="round"/><path class="cos-flap" d="M168 176 l18 4 l-14 8 z" fill="#2bb59a" stroke="#111" stroke-width="2" stroke-linejoin="round"/>';
    return o;
  }
  function dressSunny(root) {
    var svg = root.querySelector(".sunny__svg"), body = svg && svg.querySelector(".s-body"), sprout = body && body.querySelector(".s-sprout");
    if (!body) return;
    var g = doc.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "sst-cos");
    g.innerHTML = costumeSVG(COSTUME);
    body.insertBefore(g, sprout || null); /* under the sprout, so it still pokes out of the hood */
    root.classList.add("st-cos-" + COSTUME);
  }
  /* stars for a clear night */
  (function () { var h = ""; for (var i = 0; i < 46; i++) { var x = (i * 977) % 1600, y = 20 + (i * 613) % 470; h += '<i style="left:' + x + "px;top:" + y + "px;animation-delay:-" + (i % 7) * 0.45 + 's"></i>'; } R.stars.innerHTML = h; })();

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
  var SUN_SIZE = 190, PUP_SIZE = 120;
  function buildActors() {
    function makeActor(cls, size, inner, over) {
      var a = doc.createElement("div");
      a.className = "sst-actor " + cls; a.style.width = size + "px"; a.style.height = size + "px";
      a.innerHTML = '<div class="sst-flip"><div class="sst-pose">' + inner + (over || "") + "</div></div>";
      actorsEl.appendChild(a);
      return { el: a, flip: a.querySelector(".sst-flip"), pose: a.querySelector(".sst-pose"), size: size, last: {} };
    }
    var sunny = makeActor("sst-sunny", SUN_SIZE, '<div class="sunny is-in"><div class="sunny__char">' + uniq(win.Sunny.art()) + "</div></div>",
      '<svg class="sst-over" viewBox="0 0 220 220" aria-hidden="true"><g class="sst-umb" transform="translate(184 140)">' + umbrella() + "</g></svg>");
    var pup = makeActor("sst-pup", PUP_SIZE, '<div class="puppy is-in"><div class="puppy__char">' + uniq(win.Puppy.art()) + "</div></div>",
      '<svg class="sst-over" viewBox="0 0 220 220" aria-hidden="true">' +
      '<g class="sst-scarf-w"><path d="M84 116Q128 133 178 117L180 127Q128 144 82 126Z" fill="#de364d" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><path d="M146 128q6 16 -1 30l11 2q6 -16 -1 -31z" fill="#de364d" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><circle cx="150" cy="130" r="5.5" fill="#c92a42" stroke="#111" stroke-width="2"/></g>' +
      '<g class="sst-wet"><path d="M112 60q8 -8 18 -6M150 70q6 -6 14 -4M100 150q6 -4 12 -2" fill="none" stroke="#dfe7f5" stroke-width="2.2" stroke-linecap="round" opacity="0.5"/>' +
      '<g fill="#a9c3ec"><path class="sst-drip" d="M128 126c-2.4 3.4 -2.4 5.4 0 5.4c2.4 0 2.4 -2 0 -5.4z"/><path class="sst-drip" d="M96 98c-2 3 -2 4.8 0 4.8c2 0 2 -1.8 0 -4.8z"/><path class="sst-drip" d="M170 112c-2 3 -2 4.8 0 4.8c2 0 2 -1.8 0 -4.8z"/></g></g></svg>');
    /* the story's own small things: a butterfly, a leaf, a snowball, a firefly, a shooting star */
    var props = ST.props.map(function (p) {
      var e = doc.createElement("div"); e.className = "sst-prop " + (p.cls || ""); e.style.width = p.w + "px"; e.style.height = p.h + "px"; e.style.margin = -p.h / 2 + "px 0 0 " + -p.w / 2 + "px"; e.innerHTML = p.svg;
      if (p.sky) world.insertBefore(e, R.street); else { actorsEl.appendChild(e); e.style.zIndex = 6; }
      return { el: e, p: p, last: "" };
    });
    var SPARK = '<svg viewBox="0 0 34 34" width="34" height="34"><path d="M17 2L20 14L32 17L20 20L17 32L14 20L2 17L14 14Z" fill="#FFC93C" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    var sparks = ST.SPARKS.map(function (s) { var e = doc.createElement("div"); e.className = "sst-spark"; e.innerHTML = SPARK; e.style.left = s[1] + "px"; e.style.top = s[2] + "px"; e.style.zIndex = 20; actorsEl.appendChild(e); return { t: s[0], el: e, on: false }; });
    function cshadow() { var e = doc.createElement("div"); e.className = "sst-cshadow"; actorsEl.insertBefore(e, actorsEl.firstChild); return e; }
    var pupShadow = cshadow(), sunShadow = cshadow();
    pup.el.style.zIndex = 2; sunny.el.style.zIndex = 3;
    return { pupShadow: pupShadow, sunShadow: sunShadow, sunny: sunny, pup: pup, props: props, sparks: sparks,
      sunnyRoot: sunny.el.querySelector(".sunny"), sunnyLook: sunny.el.querySelector(".s-look"), pupRoot: pup.el.querySelector(".puppy"), pupLooks: pup.el.querySelectorAll(".p-look"),
      umbTilt: sunny.el.querySelector(".u-tilt"), umbCan: sunny.el.querySelector(".u-can"), umbG: sunny.el.querySelector(".sst-umb") };
  }

  /* ===================================================================== render */
  var cssCache = {};
  function setVar(k, v) { if (cssCache[k] !== v) { cssCache[k] = v; story.style.setProperty("--" + k, v); } }
  function setCls(el, cls, on) { if (el.classList.contains(cls) !== !!on) el.classList.toggle(cls, !!on); }
  function setAttr(el, k, v) { if (v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); } else if (el.hasAttribute(k)) el.removeAttribute(k); }
  function place(a, x, footFrac, dy) {
    var tf = "translate3d(" + (x - a.size / 2).toFixed(1) + "px," + (GY - a.size + a.size * footFrac + (dy || 0)).toFixed(1) + "px,0)";
    if (a.last.tf !== tf) { a.last.tf = tf; a.el.style.transform = tf; }
  }
  /* a soft contact shadow on the ground under a character; it shrinks and fades as the character leaves the ground */
  function shadowAt(el, x, lift, sc) {
    if (!el) return;
    var k = Math.max(0.45, 1 + lift / 160), tf = "translate3d(" + x.toFixed(1) + "px," + (GY + 2) + "px,0) scale(" + (sc * k).toFixed(2) + ",1)";
    if (el._tf !== tf) { el._tf = tf; el.style.transform = tf; }
    var o = k.toFixed(2); if (el._op !== o) { el._op = o; el.style.opacity = o; }
  }
  function lookAt(el, dx, dy, flipped, kx, ky, many) {
    var v = "translate(" + ((flipped ? -1 : 1) * dx * kx).toFixed(1) + "px," + (dy * ky).toFixed(1) + "px)";
    if (many) { for (var i = 0; i < el.length; i++) if (el[i].style.transform !== v) el[i].style.transform = v; } else if (el && el.style.transform !== v) el.style.transform = v;
  }
  function sceneOf(t) { for (var i = BANDS_T.length - 2; i >= 0; i--) if (t >= BANDS_T[i]) return i; return 0; }
  /* ---- the pup's gait: bob, lean, sway and squash follow the distance actually covered, so the walk speeds up and
     slows down with the movement, eases in and out, and each footfall can be heard ---- */
  var G = { x: null, t: 0, phase: 0, amt: 0, foot: 0 };
  function gaitOn() { return G.amt > 0.15; }
  function gait(pose, px, Q) {
    var dtg = clock - G.t; G.t = clock;
    if (G.x === null || Math.abs(px - G.x) > 90 || dtg <= 0 || dtg > 0.25) { G.x = px; return; } /* a jump in time, not a step */
    var dx = px - G.x; G.x = px;
    var speed = Math.abs(dx) / dtg;
    G.amt += ((reduced ? 0 : Math.min(1, speed / 150)) - G.amt) * Math.min(1, dtg * 7);
    var stride = Q.creep ? 13 : speed > 230 ? 40 : 27; /* px per step: short when sneaking, long when running */
    G.phase += Math.abs(dx) / stride * Math.PI;
    var a = G.amt, s = Math.sin(G.phase);
    var bob = -Math.abs(s) * (Q.creep ? 1.4 : 2 + 4.5 * a) * a;
    var lean = (Q.creep ? 4 : 2.5 + 1.5 * a) * a;          /* nose a little forward, more when running */
    var sway = Math.sin(G.phase) * 1.8 * a;                /* the body rocks from paw to paw */
    var sq = Math.cos(G.phase * 2) * 0.03 * a;             /* squash on landing, stretch on the push */
    var low = Q.creep ? 0.05 : 0;
    pose.style.translate = "0 " + (bob + (Q.creep ? 3 : 0)).toFixed(2) + "px";
    pose.style.rotate = (lean + sway).toFixed(2) + "deg";
    pose.style.scale = (1 + sq).toFixed(3) + " " + (1 - sq - low).toFixed(3);
    var foot = Math.floor(G.phase / Math.PI);
    if (foot !== G.foot) { G.foot = foot; if (a > 0.3) SND.paw(speed > 230); }
  }
  /* a change of direction plays a quick pivot instead of a slow mirror */
  function turned(actor, flip) {
    flip = !!flip;
    if (actor.lastFlip !== undefined && actor.lastFlip !== flip && !reduced && !story.classList.contains("is-still")) {
      var p = actor.pose; p.classList.remove("st-turn"); void p.offsetWidth; p.classList.add("st-turn");
      clearTimeout(actor.turnT); actor.turnT = setTimeout(function () { p.classList.remove("st-turn"); }, 360);
    }
    actor.lastFlip = flip;
  }
  var SHELTER = [214, 470, 600]; /* the porch roof: left, right, and the height the rain stops at */
  var clock = 0, umbRim = null, sunState = { x: 0 }, outdoor = 1, rainNow = 0, windNow = 0.2, snowNow = 0, leafNow = 0, heads = null, reflSet = false;
  function render(tReal) {
    var t = reduced ? KEY_T[sceneOf(Math.min(tReal, T_END - 0.01))] : tReal;
    /* the camera stays close on the two of them, with a little handheld drift */
    var vw = story.clientWidth, vh = story.clientHeight;
    var cx = track(CAMX, t), cy = track(CAMY, t), z = track(CAMZ, t);
    if (!reduced) { cx += Math.sin(clock * 0.21) * 4; cy += Math.sin(clock * 0.27 + 1) * 2.5; }
    var fit = Math.min(Math.max(vw / W, vh / H), vw / 760), s = Math.min(fit * z, vw / 460); /* never so close that the pair cannot share a narrow screen */
    var tx = vw / 2 - cx * s, ty = vh / 2 - cy * s;
    if (W * s >= vw) tx = Math.min(0, Math.max(vw - W * s, tx)); else tx = (vw - W * s) / 2;
    if (H * s >= vh) ty = Math.min(0, Math.max(vh - H * s, ty)); else ty = (vh - H * s) * 0.5;
    world.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + s.toFixed(4) + ")";
    /* depth: the far skyline and clouds lag behind the camera, the foreground runs ahead of it */
    R.far.setAttribute("transform", "translate(" + ((cx - 800) * 0.3).toFixed(1) + " 0)");
    R.mid.setAttribute("transform", "translate(" + ((cx - 800) * 0.12).toFixed(1) + " 0)");
    R.clouds.style.transform = "translateX(" + ((cx - 800) * 0.45).toFixed(1) + "px)";
    R.fore.style.transform = "translate3d(" + (-(cx - 800) * 0.22).toFixed(1) + "px,0,0)";
    rainNow = SCENE.rain; snowNow = SCENE.snow; windNow = track(ST.WINDT, t); leafNow = track(ST.LEAF, t);
    R.flash.style.opacity = reduced ? 0 : track(ST.FLASH, tReal);
    R.flies.style.opacity = track(ST.FLIES, t);
    var warm = track(ST.WARM, t); /* stepping into the porch light warms the rim on the characters */
    setVar("rimC", warm > 0.01 ? mix(SCENE.P.rimC, "rgba(255,190,120,0.55)", warm) : SCENE.P.rimC);
    setVar("charB", +(SCENE.P.charB + (1.02 - SCENE.P.charB) * warm).toFixed(3));
    if (!A) return;
    var S = states(ST.SS, t), sx = track(ST.SX, t), sy = track(ST.SY, t);
    place(A.sunny, sx, 13 / 220, sy); shadowAt(A.sunShadow, sx, sy, 1.3);
    setAttr(A.sunnyRoot, "data-emotion", S.emo); setAttr(A.sunnyRoot, "data-act", S.act);
    setCls(A.sunnyRoot, "st-cos-on", true); setCls(A.sunnyRoot, "st-gust", windNow > 0.6);
    var uo = track(ST.UO, t), uv = track(ST.UV, t), ur = track(ST.UR, t);
    setCls(A.sunnyRoot, "st-slow", S.slow); setCls(A.sunnyRoot, "st-hold", S.hold && uv > 0); setCls(A.sunnyRoot, "st-reach", S.reach); setCls(A.sunnyRoot, "st-hug", S.hug); setCls(A.sunnyRoot, "st-mend", S.mend);
    setCls(A.sunny.pose, "st-brace", S.brace); setCls(A.sunny.pose, "st-sit", S.sit); setCls(A.sunny.pose, "st-bend", S.bend); setCls(A.sunny.pose, "st-tremble", S.tremble);
    turned(A.sunny, S.flip); setCls(A.sunny.flip, "is-flipped", S.flip);
    lookAt(A.sunnyLook, (S.look || [0, 0])[0], (S.look || [0, 0])[1], S.flip, 5, 4);
    var sway = reduced ? 0 : Math.sin(clock * 1.3) * 2.4 * (0.4 + windNow);
    A.umbTilt.setAttribute("transform", "rotate(" + (ur + sway).toFixed(2) + ")");
    A.umbCan.setAttribute("transform", "scale(" + uo.toFixed(3) + " 1)");
    A.umbG.style.opacity = uv;
    var Q = states(ST.PS, t), px = track(ST.PX, t), py = track(ST.PY, t);
    place(A.pup, px, 17 / 220, py); shadowAt(A.pupShadow, px + (Q.flip ? 4 : -4), py, 0.85);
    /* walking and running are drawn from the real speed in gait(), not from a fixed loop */
    setAttr(A.pupRoot, "data-emotion", Q.emo); setAttr(A.pupRoot, "data-act", Q.act);
    setCls(A.pupRoot, "st-rest", Q.rest);
    setCls(A.pup.el, "is-wet", Q.wet); setCls(A.pup.el, "has-scarf-w", Q.scarf === "w");
    setCls(A.pup.pose, "st-shiver", Q.shiver && !gaitOn()); setCls(A.pup.pose, "st-lean", Q.lean);
    gait(A.pup.pose, px, Q);
    turned(A.pup, Q.flip); setCls(A.pup.flip, "is-flipped", Q.flip);
    lookAt(A.pupLooks, (Q.look || [0, 0])[0], (Q.look || [0, 0])[1], Q.flip, 22, 16, true);
    if (!reflSet) { /* wet ground mirrors them a little */
      reflSet = true; var ra = Math.round(SCENE.P.refl * 100) / 100;
      [[A.sunny, 22], [A.pup, 19]].forEach(function (r) { var v = ra > 0.01 ? "below -" + r[1] + "px linear-gradient(transparent 52%, rgba(255,255,255," + ra + "))" : "none"; r[0].el.style.webkitBoxReflect = v; r[0].el.style.boxReflect = v; });
    }
    sunState = { x: sx, act: S.act, slow: S.slow };
    /* the umbrella's rim, for the drips, and who is standing in the open rain, for the splashes on their heads */
    umbRim = null;
    if (uv > 0.5 && uo > 0.75) {
      var rr = ur * Math.PI / 180, kk = SUN_SIZE / 220, left = sx - SUN_SIZE / 2, top = GY - SUN_SIZE + SUN_SIZE * 13 / 220 + sy;
      umbRim = [-1, 1].map(function (side) {
        var lx = side * 112 * uo, ly = -128, vx = 184 + lx * Math.cos(rr) - ly * Math.sin(rr), vy = 140 + lx * Math.sin(rr) + ly * Math.cos(rr);
        if (S.flip) vx = 220 - vx; return [left + vx * kk, top + vy * kk];
      });
    }
    function covered(x) { return (ST.shelter && x > SHELTER[0] && x < SHELTER[1]) || (umbRim && x > Math.min(umbRim[0][0], umbRim[1][0]) - 6 && x < Math.max(umbRim[0][0], umbRim[1][0]) + 6); }
    heads = [];
    if (!covered(sx)) heads.push([sx, GY - 150 + sy, 38]);
    if (!covered(px)) heads.push([px + (Q.flip ? -6 : 6), GY - 98 + py, 20]);
    for (var i = 0; i < A.props.length; i++) {
      var pr = A.props[i], p = pr.p, x = track(p.X, t), y = track(p.Y, t), o = track(p.OP, t), w = p.WOB ? track(p.WOB, t) : (p.wob ? 1 : 0), rot = p.rot || 0;
      if (p.wob && w > 0 && !reduced) { x += Math.sin(clock * p.wob[2]) * p.wob[0] * w; y += Math.sin(clock * p.wob[2] * 1.7 + 1) * p.wob[1] * w; }
      if (p.R) rot += track(p.R, t);
      if (p.spin) rot += reduced ? 20 : (w > 0 ? (clock * p.spin) % 360 : 12);
      var tf = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + rot.toFixed(1) + "deg)|" + o.toFixed(2) + "|" + (w > 0 ? 1 : 0);
      if (pr.last !== tf) { pr.last = tf; pr.el.style.transform = tf.split("|")[0]; pr.el.style.opacity = o.toFixed(2); pr.el.style.visibility = o <= 0.01 ? "hidden" : "visible"; setCls(pr.el, "is-rest", w <= 0); }
    }
    A.sparks.forEach(function (sp) {
      var on = t >= sp.t && t < sp.t + 0.9 && !reduced;
      if (on && !sp.on) { sp.el.classList.remove("on"); void sp.el.offsetWidth; sp.el.classList.add("on"); }
      if (!on && sp.on) sp.el.classList.remove("on");
      sp.on = on;
    });
    R.title.style.opacity = smooth(TITLE_AT, TITLE_AT + 1.2, tReal);
    R.fill.style.width = Math.min(100, tReal / T_END * 100).toFixed(1) + "%";
  }

  /* ===================================================================== rain, snow, leaves and splashes */
  var cv = R.rain, g2 = cv.getContext("2d"), drops = [], fx = [], drips = [], dripT = 0, eaveT = 0, stepT = 0, flakes = [], leaves = [], prints = [], printT = 0;
  var PUDDLES = [[470, 792, 112, 8], [900, 784, 78, 6], [1330, 790, 124, 8]];
  var LEAF_C = ["#c9772e", "#e0a33d", "#9b5a2a", "#7a9a3a"];
  function newDrop(scatter) {
    var near = Math.random() < 0.3;
    return { near: near, x: Math.random() * (W + 300) - 150, y: scatter ? Math.random() * H : -20 - Math.random() * 220, v: near ? 1350 + Math.random() * 450 : 820 + Math.random() * 320,
      l: near ? 24 + Math.random() * 16 : 10 + Math.random() * 9, a: near ? 0.26 + Math.random() * 0.2 : 0.1 + Math.random() * 0.12, w: near ? 1.7 : 0.9, floor: near ? GY + 20 + Math.random() * 110 : GY - 30 + Math.random() * 60 };
  }
  function newFlake(scatter) { return { x: Math.random() * (W + 200) - 100, y: scatter ? Math.random() * H : -10, r: 1.2 + Math.random() * 2.6, v: 40 + Math.random() * 70, ph: Math.random() * 6 }; }
  function leafY() { return Math.random() < 0.55 ? 430 + Math.random() * 160 : 744 + Math.random() * 34; } /* above their heads or along the ground, never across their faces */
  function newLeaf(scatter) { return { x: scatter ? Math.random() * W : W + Math.random() * 400, y: leafY(), v: 260 + Math.random() * 260, rot: Math.random() * 6, sp: 3 + Math.random() * 6, c: LEAF_C[(Math.random() * 4) | 0] }; }
  /* the weather is already there on the first frame: the air starts full of it */
  function prefill() {
    drops.length = 0; fx.length = 0; flakes.length = 0; leaves.length = 0;
    var i, n = Math.round(300 * SCENE.rain); for (i = 0; i < n; i++) drops.push(newDrop(true));
    n = Math.round(200 * SCENE.snow); for (i = 0; i < n; i++) flakes.push(newFlake(true));
    n = Math.round(14 * track(ST.LEAF, 0)); for (i = 0; i < n; i++) leaves.push(newLeaf(true));
  }
  function splash(x, y, big, max) { fx.push({ k: "s", x: x, y: y, life: 0, max: max || (big ? 0.26 : 0.18), big: big }); }
  /* a burst of drops or snow thrown up by a jump, a shake or a catch */
  function burst(kind, x, y, n) {
    if (reduced) return;
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * (kind === "spray" ? 5 : 2.2), sp = (kind === "puff" ? 60 : 150) + Math.random() * (kind === "puff" ? 90 : 190);
      fx.push({ k: "p", x: x + (Math.random() - 0.5) * 20, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: kind === "puff" ? 220 : 900, r: kind === "puff" ? 2 + Math.random() * 3 : 1.4 + Math.random() * 1.6,
        c: kind === "puff" ? "255,255,255" : "205,225,250", life: 0, max: kind === "puff" ? 0.7 + Math.random() * 0.4 : 0.45 + Math.random() * 0.3 });
    }
    if (kind === "splash") { splash(x - 16, GY + 3, 1, 0.4); splash(x + 16, GY + 3, 1, 0.4); fx.push({ k: "r", x: x, y: GY + 6, life: 0, max: 1 }); }
  }
  function rainStep(dt) {
    g2.clearRect(0, 0, W, H);
    if (reduced) dt = 0; /* a still: the weather hangs in the air */
    var want = Math.round(300 * rainNow);
    while (drops.length < want) drops.push(newDrop(false));
    g2.lineCap = "round";
    var slant = 0.16 + windNow * 0.5 + Math.sin(clock * 0.35) * 0.05, roofed = ST && ST.shelter;
    for (var i = drops.length - 1; i >= 0; i--) {
      var p = drops[i];
      p.y += p.v * dt; p.x -= p.v * dt * slant;
      if (roofed && p.y >= SHELTER[2] && p.y < SHELTER[2] + 60 && p.x > SHELTER[0] && p.x < SHELTER[1]) { if (dt && Math.random() < 0.5) splash(p.x, SHELTER[2], 0); if (dt) drops[i] = newDrop(false); continue; } /* the porch roof keeps the rain off */
      if (roofed && p.y > SHELTER[2] && p.x > SHELTER[0] && p.x < SHELTER[1]) continue;
      if (p.y >= p.floor) { if (Math.random() < (p.near ? 0.8 : 0.35)) splash(p.x, p.floor, p.near); if (drops.length > want) { drops.splice(i, 1); continue; } drops[i] = newDrop(false); continue; }
      g2.strokeStyle = "rgba(205,220,245," + p.a + ")"; g2.lineWidth = p.w;
      g2.beginPath(); g2.moveTo(p.x, p.y); g2.lineTo(p.x + p.l * slant, p.y - p.l); g2.stroke();
    }
    dripT -= dt;
    if (dt && umbRim && rainNow > 0.1 && dripT <= 0) { dripT = 0.09 + Math.random() * 0.12; var e = umbRim[Math.random() < 0.5 ? 0 : 1]; drips.push({ x: e[0] + (Math.random() * 6 - 3), y: e[1] + 2, v: 60 }); }
    eaveT -= dt;
    if (dt && roofed && rainNow > 0.1 && eaveT <= 0) { eaveT = 0.16 + Math.random() * 0.2; drips.push({ x: Math.random() < 0.5 ? SHELTER[0] + 6 + Math.random() * 14 : SHELTER[1] - 6 - Math.random() * 14, y: 628, v: 40 }); }
    g2.fillStyle = "rgba(200,218,246,0.7)";
    for (var d = drips.length - 1; d >= 0; d--) {
      var q = drips[d]; q.v += 1600 * dt; q.y += q.v * dt;
      if (q.y >= GY) { splash(q.x, GY, 0, 0.2); drips.splice(d, 1); continue; }
      g2.beginPath(); g2.ellipse(q.x, q.y, 1.3, 3.2, 0, 0, Math.PI * 2); g2.fill();
    }
    /* snow: slow flakes that drift with the wind, and Sunny's footprints */
    var wantF = Math.round(200 * snowNow);
    while (flakes.length < wantF) flakes.push(newFlake(false));
    for (var f2 = flakes.length - 1; f2 >= 0; f2--) {
      var fl = flakes[f2]; fl.y += fl.v * dt; fl.x += (Math.sin(fl.ph + clock * 1.4) * 14 - windNow * 60) * dt;
      if (fl.y > GY + 30 + fl.r * 30) { if (flakes.length > wantF) { flakes.splice(f2, 1); continue; } fl.y = -10; fl.x = Math.random() * (W + 200) - 100; }
      g2.fillStyle = "rgba(255,255,255," + (0.5 + fl.r * 0.12).toFixed(2) + ")"; g2.beginPath(); g2.arc(fl.x, fl.y, fl.r, 0, Math.PI * 2); g2.fill();
    }
    if (dt && snowNow > 0.3 && sunState.act === "walk") { printT -= dt; if (printT <= 0) { printT = sunState.slow ? 0.31 : 0.21; prints.push({ x: sunState.x + (prints.length % 2 ? 9 : -9), a: 1 }); if (prints.length > 40) prints.shift(); } }
    for (var pi = prints.length - 1; pi >= 0; pi--) { var pr = prints[pi]; g2.fillStyle = "rgba(120,135,160," + (0.35 * pr.a).toFixed(2) + ")"; g2.beginPath(); g2.ellipse(pr.x, GY + 4, 6, 2, 0, 0, Math.PI * 2); g2.fill(); }
    /* wind: leaves carried across the street */
    var wantL = Math.round(14 * leafNow);
    while (leaves.length < wantL) leaves.push(newLeaf(false));
    for (var li2 = leaves.length - 1; li2 >= 0; li2--) {
      var lf = leaves[li2]; lf.x -= lf.v * dt * (0.6 + windNow * 0.6); lf.y += Math.sin(clock * 2.2 + lf.rot) * 26 * dt; lf.rot += lf.sp * dt;
      if (lf.x < -60 || lf.y > GY + 30) { if (leaves.length > wantL) { leaves.splice(li2, 1); continue; } lf.x = W + Math.random() * 200; lf.y = leafY(); }
      g2.save(); g2.translate(lf.x, lf.y); g2.rotate(lf.rot); g2.fillStyle = lf.c; g2.beginPath(); g2.ellipse(0, 0, 7, 3.2, 0, 0, Math.PI * 2); g2.fill(); g2.restore();
    }
    if (dt && heads && rainNow > 0.2) heads.forEach(function (h) { if (Math.random() < rainNow * dt * 9) splash(h[0] + (Math.random() * 2 - 1) * h[2], h[1] + Math.random() * 6, 0, 0.16); });
    stepT -= dt;
    if (dt && rainNow > 0.15 && sunState.act === "walk" && stepT <= 0) { stepT = sunState.slow ? 0.31 : 0.21; for (var n = 0; n < 3; n++) splash(sunState.x + (Math.random() * 30 - 15), GY + 2, 1, 0.3); }
    if (Math.random() < rainNow * dt * 30) { var pd = PUDDLES[(Math.random() * 3) | 0]; fx.push({ k: "r", x: pd[0] + (Math.random() * 2 - 1) * pd[2] * 0.8, y: pd[1] + (Math.random() * 2 - 1) * pd[3] * 0.4, life: 0, max: 0.9 }); }
    for (var j = fx.length - 1; j >= 0; j--) {
      var f = fx[j]; f.life += dt; var u = f.life / f.max;
      if (u >= 1) { fx.splice(j, 1); continue; }
      if (f.k === "s") { var sz = f.big ? 1.6 : 1; g2.lineWidth = f.big ? 1.3 : 0.9; g2.strokeStyle = "rgba(210,225,248," + (0.45 * (1 - u)) + ")"; g2.beginPath(); g2.moveTo(f.x - (4 + u * 6) * sz, f.y - u * 7 * sz); g2.lineTo(f.x - 1, f.y); g2.moveTo(f.x + (4 + u * 6) * sz, f.y - u * 7 * sz); g2.lineTo(f.x + 1, f.y); g2.stroke(); }
      else if (f.k === "p") { f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; g2.fillStyle = "rgba(" + f.c + "," + (0.85 * (1 - u)).toFixed(2) + ")"; g2.beginPath(); g2.arc(f.x, f.y, f.r, 0, Math.PI * 2); g2.fill(); }
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
    /* a bark: the pitch jumps up and falls, two detuned voices and a square for the edge, a little distortion for the
       rasp, three mouth formants, a breath at the start and a soft chest thump underneath */
    bark: function (at, o) {
      if (!live()) return; var t = ac.currentTime + (at || 0), d = o.dur;
      var env = ac.createGain(); env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(o.vol, t + 0.007);
      env.gain.exponentialRampToValueAtTime(o.vol * 0.55, t + d * 0.4); env.gain.exponentialRampToValueAtTime(0.0001, t + d);
      var ws = ac.createWaveShaper(), k = o.rasp || 10, n = 512, curve = new Float32Array(n);
      for (var q = 0; q < n; q++) { var x = q * 2 / n - 1; curve[q] = (1 + k) * x / (1 + k * Math.abs(x)); }
      ws.curve = curve;
      [["sawtooth", 0], ["sawtooth", 9], ["square", -6]].forEach(function (v, vi) {
        var osc = ac.createOscillator(); osc.type = v[0]; osc.detune.value = v[1];
        osc.frequency.setValueAtTime(o.f[0], t); osc.frequency.linearRampToValueAtTime(o.f[1], t + d * 0.16); osc.frequency.exponentialRampToValueAtTime(o.f[2], t + d);
        var g = ac.createGain(); g.gain.value = vi === 2 ? 0.35 : 0.5; osc.connect(g); g.connect(ws); osc.start(t); osc.stop(t + d + 0.03);
      });
      ws.connect(env);
      o.form.forEach(function (fm) { var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = fm[0]; bp.Q.value = fm[1]; var fg = ac.createGain(); fg.gain.value = fm[2]; env.connect(bp); bp.connect(fg); fg.connect(master); });
      noise(Math.min(0.06, d * 0.4), "bandpass", o.form[1][0], 1.1, o.vol * 0.45, at);                     /* the breath that starts it */
      var th = ac.createOscillator(); th.type = "sine"; th.frequency.setValueAtTime(o.f[0] * 0.5, t); th.frequency.exponentialRampToValueAtTime(o.f[2] * 0.4, t + d * 0.6);
      var tg = ac.createGain(); tg.gain.setValueAtTime(0.0001, t); tg.gain.exponentialRampToValueAtTime(o.vol * 0.6, t + 0.01); tg.gain.exponentialRampToValueAtTime(0.0001, t + d * 0.6);
      th.connect(tg); tg.connect(master); th.start(t); th.stop(t + d);
    },
    barkHappy: function (at) { SND.bark(at, { f: [520, 820, 430], dur: 0.17, vol: 0.1, rasp: 9, form: [[900, 5, 1], [1900, 7, 0.6], [3200, 8, 0.25]] }); },
    yips: function (at) { at = at || 0; SND.barkHappy(at); SND.barkHappy(at + 0.22); SND.bark(at + 0.46, { f: [760, 1150, 820], dur: 0.11, vol: 0.075, rasp: 5, form: [[1200, 5, 1], [2500, 7, 0.55], [3800, 8, 0.2]] }); noise(0.18, "bandpass", 1300, 0.9, 0.02, at + 0.62); },
    arf: function (at) { SND.bark(at, { f: [480, 700, 380], dur: 0.2, vol: 0.09, rasp: 12, form: [[850, 5, 1], [1800, 7, 0.6], [3000, 8, 0.25]] }); },
    paw: function (run) { if (!live()) return; noise(0.03, "bandpass", run ? 1100 : 1500, 1, run ? 0.016 : 0.011); if (outdoor && rainNow > 0.2) noise(0.05, "highpass", 2600, 0.7, 0.012, 0.01); },
    pant: function (at, n, fast) { at = at || 0; n = n || 7; var gap = fast ? 0.15 : 0.2; for (var i = 0; i < n; i++) noise(0.1, "bandpass", i % 2 ? 1100 : 1500, 0.9, i % 2 ? 0.02 : 0.03, at + i * gap); },
    sniff: function (at) { at = at || 0; for (var i = 0; i < 3; i++) noise(0.045, "highpass", 2400, 0.8, 0.035, at + i * 0.09); },
    sigh: function (at) { noise(0.85, "lowpass", 1300, 0.7, 0.05, at, 380); voice({ at: (at || 0) + 0.05, type: "sine", f: [[0, 430], [0.7, 300]], form: [[600, 1, 0.5]], vol: 0.025, dur: 0.75, a: 0.15, r: 0.4 }); },
    sleep: function (at) { noise(1.2, "lowpass", 520, 0.6, 0.035, at, 300); noise(1.4, "lowpass", 380, 0.6, 0.022, (at || 0) + 1.3, 260); },
    shake: function (at) { at = at || 0; for (var i = 0; i < 9; i++) noise(0.05, "bandpass", 1800, 0.8, 0.03, at + i * 0.055); },
    thunder: function (at) { noise(0.4, "highpass", 900, 0.5, 0.05, at); noise(3.4, "lowpass", 220, 0.6, 0.32, (at || 0) + 0.1, 70, true); },
    birds: function (at) { at = at || 0; [0, 0.16, 0.3, 0.9, 1.04].forEach(function (d, i) { voice({ at: at + d, type: "sine", f: [[0, 2600 + i * 120], [0.06, 3700], [0.1, 3000]], form: [[3200, 1, 1]], vol: 0.018, dur: 0.11, a: 0.005, r: 0.05 }); }); },
    crickets: function (at) { at = at || 0; for (var i = 0; i < 6; i++) voice({ at: at + i * 0.16 + (i > 2 ? 0.5 : 0), type: "sine", f: [[0, 4200], [0.05, 4400]], am: 60, form: [[4300, 4, 1]], vol: 0.012, dur: 0.09, a: 0.005, r: 0.04 }); },
    thunderFar: function (at) { noise(2.6, "lowpass", 160, 0.6, 0.12, at, 60, true); },
    splosh: function (at) { noise(0.32, "bandpass", 700, 0.7, 0.11, at, 2400); noise(0.5, "highpass", 2600, 0.6, 0.035, (at || 0) + 0.06); },
    puff: function (at) { noise(0.22, "lowpass", 900, 0.7, 0.07, at, 300); },
    gust: function (at) { noise(1.7, "bandpass", 260, 0.6, 0.2, at, 820, true); },
    howl: function (at) { voice({ at: at, type: "triangle", f: [[0, 520], [0.25, 780], [0.9, 820], [1.2, 640]], vib: [5, 10], form: [[1100, 3, 1], [2400, 4, 0.3]], vol: 0.06, dur: 1.25, a: 0.12, r: 0.35, breath: 0.008 }); },
    step: function () { noise(0.06, "bandpass", outdoor ? 1300 : 700, 0.9, 0.045); if (outdoor && rainNow > 0.2) noise(0.09, "highpass", 3000, 0.7, 0.02, 0.02); },
    drop: function () { noise(0.025, "bandpass", 3400 + Math.random() * 1200, 3, 0.015); },
    breath: function () { voice({ type: "sine", f: [[0, 180], [0.9, 260]], form: [[400, 1, 0.6]], vol: 0.02, dur: 0.9, a: 0.3, r: 0.4 }); noise(0.9, "lowpass", 700, 0.6, 0.03, 0, 300); }
  };
  var SUNNY_CUES = { hmm: 1, gasp: 1, swoosh: 1, pop: 1, sigh: 1, tick: 1, aww: 1, ting: 1, ding: 1, bell: 1 };
  function cue(n) {
    if (!live()) return;
    if (SUNNY_CUES[n]) { try { if (win.Sunny && win.Sunny.sfx) win.Sunny.sfx(n); } catch (e) { /* optional */ } return; }
    if (n === "pupSigh") return SND.sigh();
    if (SND[n]) SND[n]();
  }
  var lastStep = 0, sleepAt = 0, ambAt = 0;
  function soundStep(t, prevT) {
    if (!live() || !ST) return;
    var now = ac.currentTime, r = Math.min(1.3, rainNow);
    beds.hiss.gain.setTargetAtTime(0.06 * r, now, 0.5);
    beds.patter.gain.setTargetAtTime(0.09 * r, now, 0.5);
    beds.wind.gain.setTargetAtTime(windNow > 0.5 ? 0.05 + windNow * 0.1 : 0.012 + r * 0.03, now, 0.8);
    beds.pad.gain.setTargetAtTime(0.045 * smooth(15, 21, t), now, 1.2);
    if (t > prevT && t - prevT < 1) ST.CUES.forEach(function (c) { if (c[0] > prevT && c[0] <= t) cue(c[1]); });
    if (umbRim && rainNow > 0.2 && Math.random() < 0.5) SND.drop();
    if (sunState.act === "walk" && clock - lastStep > (sunState.slow ? 0.31 : 0.21)) { lastStep = clock; SND.step(); }
    if (states(ST.PS, t).act === "sleep" && clock - sleepAt > 3) { sleepAt = clock; SND.sleep(); }
    if (ST.amb && clock - ambAt > 5.2) { ambAt = clock; SND[ST.amb](); }
    if (t >= 20 && t < 25.6 && t > prevT && Math.floor(t * 1.25) !== Math.floor(prevT * 1.25)) { var notes = [523, 659, 784, 659, 587, 523, 659, 784]; voice({ type: "triangle", f: [[0, notes[Math.floor(t * 1.25) % notes.length]]], form: [[1800, 0.5, 1]], vol: 0.02, dur: 0.7, a: 0.01, r: 0.6 }); }
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
  var tau = 0, prevTau = 0, done = false, started = false, paused = false, waitedFor = 0, rafId = 0, held = 0, loaded = false;
  var at = qs.get("story-at"); /* a frozen moment, for checking the film */
  var from = +qs.get("story-from") || 0; /* play from a given second, for checking the film */
  if (at != null) { story.classList.add("is-still"); paused = true; win.SunnyStoryAt = function (t) { tau = prevTau = +t; }; } /* step through stills while checking */
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
    /* the page behind the curtain: when it has really finished loading, the button says so */
    if (!loaded && doc.readyState === "complete") { loaded = true; R.skip.textContent = "Enter site →"; }
    if (!started) {
      waitedFor += dt;
      /* the weather is settled first (or given up on after 2.4 s); only then is the scene built and shown */
      if (ready() && (WX.done || waitedFor > 2.4)) {
        try { WX.done = true; pickScene(); applyScene(); A = buildActors(); dressSunny(A.sunnyRoot); prefill(); } catch (e) { return finish(true); }
        started = true;
        if (at != null) { tau = +at; prevTau = tau; } else if (from) { tau = Math.max(0, Math.min(T_END - 1, from)); prevTau = tau; }
        try { render(tau); } catch (e2) { return finish(true); }
        story.classList.add("is-ready");
      } else if (waitedFor > 6) return finish(true); /* the characters never arrived: just lift the curtain */
    }
    if (started && !paused && !done) {
      var before = tau;
      tau = Math.min(T_END, tau + dt * (reduced ? 2.6 : 1));
      ST.FX.forEach(function (f) { if (f[0] > before && f[0] <= tau) burst(f[1], f[2], f[3], f[4]); });
      /* the story has been told: the curtain lifts as soon as the page behind it is ready. Until then the last
         scene simply goes on (the same weather, the two of them together), never longer than a few seconds */
      if (tau >= T_END) { held += dt; if (loaded || held > 8) finish(false); }
    }
    if (started) { try { render(tau); } catch (e3) { return finish(true); } rainStep(paused ? 0 : dt); }
    soundStep(tau, prevTau); prevTau = tau;
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
  var HOME_LINE = "I'm heading home. Need me? You can turn me on anytime from Accessibility settings.";
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
