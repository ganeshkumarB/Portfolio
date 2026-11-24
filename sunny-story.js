/* Sunny & Puppy: the loading story, "The Lonely Pup". On a visitor's first visit, before
   the site, a short film plays in twelve scenes: Puppy wakes alone, tries to join three
   pups and their ball, is left behind (nobody means it) and sits by himself. Sunny notices
   him from a distance, stops, comes only part of the way, sits and offers something; Puppy
   decides for himself, they play, and the last frame repeats the loneliest one with the
   space beside Puppy filled. The weather really outside the visitor's window changes the
   world and the offering (rain, a storm, snow, wind, fog or fair weather, lit by the time
   of day), never the order of the feelings; it is settled before anything is shown and
   does not change while the film plays. Then the curtain lifts, Sunny and Puppy are in the
   corner together, and unless the visitor has chosen Puppy, Puppy says goodbye and walks
   home into a little doghouse on the left.

   It plays once per visitor (localStorage "sunny:story"); add ?story to the address
   to watch it again. Skip with the button or Escape. The page loads underneath and is
   never held back: the button turns into "Enter site" the moment the page has really
   finished loading, and when the story ends the curtain lifts (if the page is still
   loading, the last scene goes on for a few seconds at most).

   Sunny and Puppy are the site's own artwork, drawn by sunny.js (Sunny.art) and puppy.js
   (Puppy.art) and animated by their own face and act CSS in sunny.css; only clothes for
   the weather are added on top. The street, the park, the three pups, the umbrella and
   the small props are scenery drawn here. Every sound is synthesised with Web Audio;
   sound is off unless the visitor has turned Sunny's sound on, and the Sound button turns
   it on for the film.

   Loaded as the first script in <body>, synchronously, so the curtain is up before the
   page paints. If the characters cannot be drawn within a few seconds the curtain simply
   lifts. Reduced motion shows one still per scene, in the same weather. */
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
  var W = 1600, H = 900, GY = 780, T_END = 62;

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
/* the street dogs: jointed legs that walk in diagonal pairs, a body that bobs with the stride, a head that leads */
.sst-dog .sst-pose { transform-origin: 50% 100%; }
.sst-dog .sst-over { filter: brightness(var(--dogB, 0.8)) saturate(0.9); }
.sst-dog .sst-over * { transform-box: view-box; }
.dg-upper { animation: dg-breathe 2.8s ease-in-out infinite; transform-origin: 160px 200px; }
@keyframes dg-breathe { 0%, 100% { transform: none; } 50% { transform: translateY(-0.6px) scale(1.004, 1.012); } }
.dg-head { transform-origin: 96px 104px; transition: transform 0.6s cubic-bezier(0.3, 1.2, 0.5, 1); }
.dg-jaw { transform-origin: 60px 84px; transition: transform 0.3s ease; }
.dg-ear { transform-origin: 76px 50px; transition: transform 0.35s ease; }
.dg-tail { transform-origin: 226px 104px; transition: transform 0.6s ease; animation: dg-tailsway 2.6s ease-in-out infinite; }
@keyframes dg-tailsway { 0%, 100% { rotate: -4deg; } 50% { rotate: 4deg; } }
.dg-scruff { transform-origin: 100px 98px; transition: transform 0.4s ease; }
.dg-teeth { opacity: 0; transition: opacity 0.25s ease; }
.dg-brow--u { opacity: 0; } .dg-brow { transition: opacity 0.3s ease; }
.dg-eye { transform-origin: 60px 64px; transition: transform 0.3s ease; }
/* legs: thigh/upper leg swings from the shoulder or hip, the lower leg folds at the knee or hock while the paw is in the air */
.dg-leg--fn, .dg-leg--ff { transform-origin: 113px 138px; } .dg-leg--ff { transform-origin: 124px 138px; }
.dg-leg--bn { transform-origin: 206px 124px; } .dg-leg--bf { transform-origin: 196px 124px; }
.dg-shin--f { transform-origin: 113px 174px; } .dg-leg--ff .dg-shin--f { transform-origin: 124px 174px; }
.dg-shin--b { transform-origin: 208px 174px; } .dg-leg--bf .dg-shin--b { transform-origin: 198px 174px; }
.st-walk .dg-leg { animation: dg-stride var(--gait, 0.62s) linear infinite; }
.st-walk .dg-shin--f { animation: dg-knee var(--gait, 0.62s) linear infinite; }
.st-walk .dg-shin--b { animation: dg-hock var(--gait, 0.62s) linear infinite; }
.st-walk .dg-leg--ff, .st-walk .dg-leg--ff .dg-shin--f, .st-walk .dg-leg--bn, .st-walk .dg-leg--bn .dg-shin--b { animation-delay: calc(var(--gait, 0.62s) * -0.5); }
@keyframes dg-stride { 0% { transform: rotate(17deg); } 60% { transform: rotate(-17deg); } 80% { transform: rotate(-2deg); } 100% { transform: rotate(17deg); } }
@keyframes dg-knee { 0%, 58% { transform: none; } 72% { transform: rotate(-42deg); } 88% { transform: rotate(-12deg); } 100% { transform: none; } }
@keyframes dg-hock { 0%, 58% { transform: none; } 72% { transform: rotate(30deg); } 90% { transform: rotate(6deg); } 100% { transform: none; } }
.st-walk .dg-upper { animation: dg-bob calc(var(--gait, 0.62s) / 2) ease-in-out infinite alternate; }
@keyframes dg-bob { from { transform: translateY(0) rotate(0.4deg); } to { transform: translateY(-2.5px) rotate(-0.6deg); } }
.st-walk .dg-head { animation: dg-nod calc(var(--gait, 0.62s) / 2) ease-in-out infinite alternate; }
@keyframes dg-nod { from { rotate: 0deg; } to { rotate: -3deg; } }
.st-walk .dg-tail { animation: dg-tailwalk calc(var(--gait, 0.62s) / 2) ease-in-out infinite alternate; }
@keyframes dg-tailwalk { from { rotate: -6deg; } to { rotate: 6deg; } }
/* looming: head down and forward, hackles up, a lifted lip, a slow heave of the chest */
.st-loom .dg-head { transform: rotate(-9deg) translate(-6px, 10px); }
.st-loom .dg-scruff { transform: scaleY(1.6); }
.st-loom .dg-teeth { opacity: 1; }
.st-loom .dg-tail { transform: rotate(-18deg); animation: none; }
.st-loom .dg-ear { transform: rotate(-6deg); }
.st-loom .dg-upper { animation: dg-heave 1.4s ease-in-out infinite; }
@keyframes dg-heave { 0%, 100% { transform: none; } 50% { transform: translateY(-1px) scale(1.01, 1.025); } }
/* unsure: head up and back, ears flat, the tail dropping, weight shifting back */
.st-hesitate .dg-head { transform: rotate(8deg) translate(6px, -4px); }
.st-hesitate .dg-ear { transform: rotate(24deg); }
.st-hesitate .dg-tail { transform: rotate(30deg); animation: none; }
.st-hesitate .dg-brow--m, .st-leave .dg-brow--m { opacity: 0; } .st-hesitate .dg-brow--u, .st-leave .dg-brow--u { opacity: 1; }
.st-hesitate .dg-eye { transform: scale(1.16); }
.st-hesitate .dg-upper { animation: dg-shift 1.2s ease-in-out infinite; }
@keyframes dg-shift { 0%, 100% { transform: none; } 50% { transform: translateX(4px) rotate(1deg); } }
/* leaving: a quick trot, tail tucked, head low */
.st-leave { --gait: 0.46s; }
.st-leave .dg-tail { transform: rotate(48deg); animation: none; }
.st-leave .dg-ear { transform: rotate(22deg); }
.st-leave .dg-head { transform: rotate(5deg) translateY(5px); }
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
@keyframes sst-swayw { from { transform: translate(calc(-2px * var(--wsgn, 1)), 0.4px); } to { transform: translate(calc(-6px * var(--wsgn, 1)), 1.2px); } }
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
/* ---- The Lonely Pup ---- */
.sst-sunny, .sst-pup, .sst-dog { transform-origin: 50% 94%; }
.sst-pup .sst-pose.st-low { transform: translateY(3px) scale(1.02, 0.95); }
.sst-pup .sst-pose.st-sigh { animation: sst-sigh 1.4s ease-in-out 1; }
@keyframes sst-sigh { 0%, 100% { transform: translateY(3px) scale(1.02, 0.95); } 40% { transform: translateY(1px) scale(1.04, 1); } 70% { transform: translateY(4px) scale(1.01, 0.93); } }
/* the three pups are friendly: soft raised brows, ears up, tails high */
.sst-dog .dg-brow--m { opacity: 0; } .sst-dog .dg-brow--u { opacity: 1; }
.st-run { --gait: 0.34s; }
.st-run .dg-tail { transform: rotate(-12deg); }
.st-play .dg-tail { transform: rotate(-16deg); animation: dg-wagfast 0.26s ease-in-out infinite alternate; }
@keyframes dg-wagfast { from { rotate: -10deg; } to { rotate: 12deg; } }
.st-play .dg-head { transform: rotate(5deg) translate(3px, -5px); }
.st-play .dg-ear { transform: rotate(-6deg); }
.st-play .dg-upper { animation: dg-play 0.62s ease-in-out infinite alternate; }
@keyframes dg-play { from { transform: translateY(0) rotate(0); } to { transform: translateY(-2px) rotate(-1.4deg); } }
.sst.is-fog .sst-dog .sst-over { filter: brightness(var(--dogB, 0.8)) saturate(0.6) contrast(0.8); opacity: 0.78; }
/* the pocket park */
.c-grass { fill: color-mix(in srgb, #ffffff calc(var(--snowy, 0) * 92%), color-mix(in srgb, #6a9f52 52%, var(--walk))); }
.c-grass2 { fill: color-mix(in srgb, #f4f7fb calc(var(--snowy, 0) * 92%), color-mix(in srgb, #4f8541 50%, var(--near))); }
.c-trunk { fill: color-mix(in srgb, #6b4a30 60%, var(--nearDark)); }
.c-canopy { fill: color-mix(in srgb, #4f8a4a 55%, var(--nearDark)); } .c-canopy2 { fill: color-mix(in srgb, #6fae5c 50%, var(--near)); } .c-canopy3 { fill: color-mix(in srgb, #9fcf7a 40%, var(--near)); opacity: calc(0.5 + var(--rays, 0) * 0.5); }
.c-snowcap, .c-snowtop { fill: #fff; opacity: var(--snowy, 0); } .c-snowtop { fill: none; }
.c-bench { fill: color-mix(in srgb, #9a6a3c 58%, var(--near)); } .c-benchd { fill: color-mix(in srgb, #6b4a2c 55%, var(--nearDark)); }
.c-fence { fill: none; stroke: color-mix(in srgb, #e8dcc6 45%, var(--near)); stroke-width: 4; stroke-linecap: round; }
.c-blade { fill: none; stroke: color-mix(in srgb, #ffffff calc(var(--snowy, 0) * 80%), color-mix(in srgb, #5e9648 55%, var(--near))); stroke-width: 2.2; stroke-linecap: round; }
.sst-tree { transform-box: view-box; transform-origin: 1520px 760px; animation: sst-tree 6s ease-in-out infinite alternate; }
@keyframes sst-tree { from { transform: rotate(-0.4deg); } to { transform: rotate(0.5deg); } }
.sst.is-windy .sst-tree { animation: sst-treew 1.3s ease-in-out infinite alternate; }
@keyframes sst-treew { from { transform: rotate(calc(-1.6deg * var(--wsgn, 1))) skewX(calc(-1deg * var(--wsgn, 1))); } to { transform: rotate(calc(-3.4deg * var(--wsgn, 1))) skewX(calc(-2.4deg * var(--wsgn, 1))); } }
.sst-blades { transform-box: fill-box; transform-origin: 50% 100%; animation: sst-blade 3s ease-in-out infinite alternate; }
@keyframes sst-blade { from { transform: skewX(-3deg); } to { transform: skewX(3deg); } }
.sst.is-windy .sst-blades { animation: sst-bladew 0.7s ease-in-out infinite alternate; }
@keyframes sst-bladew { from { transform: skewX(calc(-8deg * var(--wsgn, 1))); } to { transform: skewX(calc(-20deg * var(--wsgn, 1))); } }
.sst.is-windy .sst-cloud { animation-name: sst-driftw; }
@keyframes sst-driftw { from { translate: calc(60px * var(--wsgn, 1)) 0; } to { translate: calc(-120px * var(--wsgn, 1)) 0; } }
/* heat: the far town shimmers, the flowers droop */
.sst.is-heat [data-r=far], .sst.is-heat [data-r=mid] { animation: sst-shimmer 1.7s ease-in-out infinite alternate; transform-box: view-box; }
@keyframes sst-shimmer { from { filter: none; } to { filter: blur(0.6px); } }
.sst-haze2 { position: absolute; left: -500px; top: 600px; width: 2600px; height: 170px; pointer-events: none; opacity: calc(var(--heat, 0) * 0.55); background: linear-gradient(to bottom, rgba(255, 236, 196, 0), rgba(255, 236, 196, 0.5) 60%, rgba(255, 236, 196, 0)); animation: sst-hazemove 2.4s ease-in-out infinite alternate; }
@keyframes sst-hazemove { from { transform: translateY(0) scaleY(1); } to { transform: translateY(-6px) scaleY(1.12); } }
.sst.is-heat .sst-street .c-bloomA, .sst.is-heat .sst-street .c-bloomB { translate: 0 3px; animation: none; }
.sst.is-reduced .sst-haze2, .sst.is-reduced [data-r=far], .sst.is-reduced [data-r=mid] { animation: none !important; }
/* fog: banks of mist at different depths, and halos round the lamps */
.sst-fogs { position: absolute; left: -500px; top: 0; width: 2600px; height: 900px; pointer-events: none; opacity: var(--fog, 0); }
.sst-fogs i { position: absolute; left: 0; width: 2600px; border-radius: 50%; background: radial-gradient(closest-side, rgba(var(--mistC), 0.7), rgba(var(--mistC), 0)); filter: blur(18px); animation: sst-fogdrift 30s ease-in-out infinite alternate; }
.sst-fogs i:nth-child(1) { top: 360px; height: 260px; opacity: 0.9; } .sst-fogs i:nth-child(2) { top: 520px; height: 220px; opacity: 0.75; animation-duration: 22s; animation-delay: -8s; } .sst-fogs i:nth-child(3) { top: 640px; height: 170px; opacity: 0.55; animation-duration: 18s; animation-delay: -3s; }
@keyframes sst-fogdrift { from { transform: translateX(-120px); } to { transform: translateX(120px); } }
.sst.is-fog .sst-glow { transform: scale(1.6); opacity: calc(var(--lampOn) * 1.2); }
.sst-lglow { mix-blend-mode: screen; }
.sst-lantern svg { filter: drop-shadow(0 0 6px rgba(255, 210, 130, 0.9)); }
.sst-pbird svg { animation: sst-wing 0.28s ease-in-out infinite alternate; transform-origin: 50% 60%; }
.sst-pbird.is-rest svg { animation: none; }
.sst-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.sst.is-reduced .sst-tree, .sst.is-reduced .sst-blades, .sst.is-reduced .sst-fogs i, .sst.is-reduced .sst-dog * { animation: none !important; }
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
      <g data-r="park">
        <path class="c-grass2" d="M1080 762V724Q1120 716 1160 722T1240 720T1320 724T1400 718T1480 722T1560 718T1640 722T1720 718T1800 722V762Z"/>
        <path class="c-fence" d="M1096 760V716M1142 760V716M1188 760V716M1374 760V716M1420 760V716M1466 760V716M1650 760V716M1696 760V716M1742 760V716M1788 760V716M1090 728H1240M1360 728H1800M1090 746H1240M1360 746H1800"/>
        <g class="sst-tree">
          <path class="c-trunk" d="M1506 762C1510 700 1508 650 1500 600C1494 570 1478 548 1462 536L1472 528C1490 540 1504 556 1512 578C1516 556 1528 540 1546 530L1554 538C1538 552 1528 574 1526 604C1524 650 1528 710 1534 762Z"/>
          <circle class="c-canopy" cx="1440" cy="560" r="80"/><circle class="c-canopy" cx="1520" cy="520" r="100"/><circle class="c-canopy" cx="1610" cy="560" r="82"/><circle class="c-canopy" cx="1528" cy="604" r="88"/>
          <circle class="c-canopy2" cx="1428" cy="545" r="60"/><circle class="c-canopy2" cx="1504" cy="498" r="76"/><circle class="c-canopy2" cx="1592" cy="538" r="60"/>
          <circle class="c-canopy3" cx="1488" cy="478" r="32"/><circle class="c-canopy3" cx="1418" cy="528" r="24"/>
          <ellipse class="c-snowcap" cx="1508" cy="428" rx="70" ry="13"/><ellipse class="c-snowcap" cx="1430" cy="488" rx="46" ry="10"/><ellipse class="c-snowcap" cx="1600" cy="484" rx="50" ry="10"/>
        </g>
        <g>
          <rect class="c-benchd" x="1262" y="612" width="7" height="50"/><rect class="c-benchd" x="1392" y="612" width="7" height="50"/>
          <rect class="c-bench" x="1252" y="616" width="156" height="10" rx="2"/><rect class="c-bench" x="1252" y="634" width="156" height="10" rx="2"/>
          <rect class="c-benchd" x="1258" y="671" width="8" height="89"/><rect class="c-benchd" x="1394" y="671" width="8" height="89"/>
          <rect class="c-bench" x="1246" y="660" width="168" height="11" rx="2"/><rect class="c-benchd" x="1246" y="670" width="168" height="4"/>
          <rect class="c-snowcap" x="1246" y="655" width="168" height="6" rx="3"/><rect class="c-snowcap" x="1252" y="612" width="156" height="5" rx="2"/>
        </g>
        <g><ellipse class="c-grass2" cx="1730" cy="750" rx="64" ry="12"/><circle class="c-bloomA" cx="1694" cy="738" r="5"/><circle class="c-bloomB" cx="1712" cy="732" r="5"/><circle class="c-bloomA" cx="1732" cy="740" r="4.5"/><circle class="c-bloomB" cx="1752" cy="734" r="5"/><circle class="c-bloomA" cx="1770" cy="741" r="4"/></g>
      </g>
      <g transform="translate(640 0)"><rect class="c-post" x="-4" y="470" width="8" height="290"/><path d="M0 476 Q0 452 26 452" fill="none" stroke="var(--post)" stroke-width="6"/><path class="c-post" d="M14 452h26l-6 12h-14z"/><ellipse class="c-bulb" cx="27" cy="466" rx="8" ry="3.5"/></g>
      <g transform="translate(1240 0)"><rect class="c-post" x="-4" y="470" width="8" height="290"/><path d="M0 476 Q0 452 -26 452" fill="none" stroke="var(--post)" stroke-width="6"/><path class="c-post" d="M-14 452h-26l6 12h14z"/><ellipse class="c-bulb" cx="-27" cy="466" rx="8" ry="3.5"/></g>
      <rect class="c-walk" x="-500" y="760" width="2600" height="40"/>
      <path class="c-grass" d="M1066 800C1072 778 1078 762 1092 760H2100V800Z"/>
      <path class="c-blade sst-blades" d="M1092 763 q0.6 -7.6 1.5 -12.6 M1106 763 q0.6 -9.3 1.4 -15.5 M1121 763 q-0.1 -4.4 -0.2 -7.3 M1137 763 q1.0 -7.7 2.4 -12.8 M1145 763 q-0.6 -6.7 -1.5 -11.2 M1157 763 q-1.2 -7.3 -2.9 -12.2 M1166 763 q1.0 -5.7 2.5 -9.5 M1180 763 q0.7 -5.1 1.8 -8.4 M1188 763 q-0.9 -7.5 -2.2 -12.6 M1195 763 q-0.7 -8.9 -1.7 -14.8 M1204 763 q0.9 -9.5 2.2 -15.8 M1214 763 q0.1 -9.4 0.2 -15.7 M1227 763 q1.1 -5.3 2.6 -8.8 M1240 763 q0.9 -9.4 2.4 -15.7 M1250 763 q-0.8 -6.2 -2.0 -10.3 M1258 763 q-0.5 -4.6 -1.2 -7.6 M1270 763 q0.4 -4.2 1.1 -7.0 M1280 763 q0.8 -5.9 1.9 -9.8 M1292 763 q-0.0 -5.9 -0.1 -9.8 M1305 763 q1.1 -4.5 2.9 -7.5 M1312 763 q0.8 -8.2 2.1 -13.7 M1319 763 q-0.3 -8.5 -0.8 -14.1 M1332 763 q-1.1 -4.2 -2.7 -7.1 M1340 763 q-0.7 -9.4 -1.8 -15.6 M1354 763 q1.1 -9.2 2.7 -15.4 M1364 763 q0.1 -6.1 0.1 -10.2 M1378 763 q0.6 -4.8 1.5 -8.0 M1392 763 q-1.1 -8.8 -2.8 -14.7 M1408 763 q-0.4 -4.7 -1.0 -7.8 M1420 763 q-0.4 -9.2 -1.0 -15.3 M1436 763 q-0.5 -7.1 -1.1 -11.9 M1445 763 q-1.0 -5.2 -2.5 -8.6 M1454 763 q1.2 -7.9 3.0 -13.2 M1462 763 q1.2 -4.5 2.9 -7.4 M1474 763 q-0.6 -6.4 -1.6 -10.7 M1486 763 q-0.1 -8.7 -0.3 -14.4 M1497 763 q1.0 -4.5 2.5 -7.5 M1504 763 q0.8 -6.9 2.0 -11.4 M1513 763 q1.1 -8.2 2.7 -13.6 M1525 763 q-0.9 -8.5 -2.4 -14.1 M1536 763 q0.8 -5.0 2.1 -8.3 M1546 763 q1.2 -6.6 3.0 -11.1 M1561 763 q-0.1 -9.5 -0.3 -15.8 M1572 763 q-0.1 -8.1 -0.1 -13.6 M1582 763 q-0.8 -6.4 -2.1 -10.6 M1592 763 q1.1 -9.5 2.8 -15.9 M1605 763 q-0.4 -6.9 -1.0 -11.5 M1612 763 q0.7 -5.7 1.7 -9.5 M1627 763 q0.7 -6.2 1.7 -10.3 M1641 763 q0.4 -8.0 1.0 -13.3 M1655 763 q0.5 -6.2 1.2 -10.3 M1665 763 q0.6 -6.8 1.6 -11.4 M1678 763 q1.1 -5.8 2.7 -9.6 M1691 763 q-1.2 -7.3 -2.9 -12.2 M1703 763 q0.4 -5.6 1.0 -9.3 M1714 763 q0.4 -8.6 0.9 -14.4 M1728 763 q0.3 -6.1 0.9 -10.1 M1741 763 q-0.4 -8.7 -0.9 -14.5 M1756 763 q0.5 -8.9 1.1 -14.8 M1772 763 q0.0 -9.4 0.1 -15.6 M1784 763 q0.8 -5.1 2.0 -8.5"/>
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
  <div class="sst-fogs"><i></i><i></i><i></i></div>
  <div class="sst-haze2"></div>
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
<p class="sst-sr" data-r="sr" aria-live="polite"></p>
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

  function hex(c) { var m = /^#(..)(..)(..)$/.exec(c); if (m) return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]; m = /^rgb\(([\d.]+),([\d.]+),([\d.]+)\)$/.exec(String(c).replace(/\s/g, "")); return m ? [+m[1], +m[2], +m[3]] : null; }
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
  /* fog: the far town fades into the light, the near street stays readable */
  PAL.fogday = palFrom("overcast", { skyT: "#c3cad2", skyB: "#e2e5e8", far: "#d3d7dc", mid: "#bec5cd", near: "#98a3b0", nearDark: "#8a95a3", win: "#f6dca0", winOn: 0.55, walk: "#a9b0b8", curb: "#b3b9c0", road: "#8b939c",
    cloud: 0.25, cloudC: "#e9ecef", lampOn: 0.75, mist: 1, mistC: "226,230,234", grade: "rgba(220,226,232,0.10)", refl: 0.1, dogB: 0.86 });
  PAL.fognight = palFrom("night", { skyT: "#17202e", skyB: "#334055", far: "#2c3850", mid: "#29354c", near: "#25324a", cloud: 0.3, mist: 1, mistC: "150,162,186", refl: 0.12 });
  PAL.fogday.rimC = "rgba(255,236,200,0.34)"; PAL.fogday.charB = 0.97; PAL.fogday.charS = 0.94; PAL.fognight.rimC = "rgba(255,214,150,0.4)";
  PAL.fogday.fog = 1; PAL.fognight.fog = 0.85;
  /* heat: a bleached sky, sun-baked stone, straw-coloured grass */
  PAL.heat = palFrom("day", { skyT: "#8fbbdc", skyB: "#f3ecda", far: "#cfc7b2", mid: "#bdb49e", near: "#aaa08a", nearDark: "#998f7a", walk: "#ecdcbc", curb: "#dccdb0", road: "#a0988b", cloud: 0.05, sun: 1, birds: 0.3, grade: "rgba(255,214,140,0.24)", mist: 0.3, mistC: "255,238,205", refl: 0.03 });
  PAL.heat.rimC = "rgba(255,240,200,0.5)"; PAL.heat.charB = 1.03; PAL.heat.charS = 0.97;
  PAL.day.rays = 0.9; PAL.heat.rays = 1; PAL.duskclear.rays = 1; PAL.mild.rays = 0.35; PAL.cloudy.rays = 0.15;
  PAL.stormday.porch = 1; PAL.stormnight.porch = 1; PAL.snowday.snowy = 1; PAL.snownight.snowy = 1;
  Object.keys(PAL).forEach(function (k) {
    var p = PAL[k];
    if (p.snowy == null) p.snowy = 0;
    if (p.rays == null) p.rays = 0;
    if (p.fog == null) p.fog = 0;
    if (p.porch == null) p.porch = p.lampOn > 0.05 ? Math.max(0.3, p.lampOn) : 0;
    if (p.vig == null) p.vig = p.lampOn > 0.7 ? 0.62 : p.lampOn > 0.25 ? 0.46 : 0.26;
  });

  /* ===================================================================== the story: The Lonely Pup
     Twelve scenes, about a minute. Puppy wakes alone in his box under the park tree, tries to join three pups and
     their red ball, is left behind (nobody means it) and sits alone. Sunny notices him from a distance, stops, comes
     only part of the way, sits, and offers something. Puppy decides for himself. They play; in the quiet afterwards
     Puppy leans on him, and the last frame repeats the loneliest one with the empty space beside Puppy filled.
     The real weather changes the world and the offering (a butterfly, an umbrella, a leaf, a lantern, a snowball,
     a safe place in a storm), never the order of the feelings. Weather comes from Open-Meteo (free, no key): the
     place is the one the browser already shares (only if the visitor granted it before; the film never asks) or the
     city in the device's time zone. Coordinates are rounded to about 1 km; a 45-minute cache is kept in this browser.
     Offline, on any error, or after 2.4 s without an answer, the story plays in fair weather lit by the local clock,
     and the film does not claim to know the weather.
     For checking: ?story&weather=rain|storm|snow|wind|fog|clear|cloudy|offline&time=day|dusk|night, &story-at=SECONDS
     for a still (then SunnyStoryAt(t) in the console), and SunnyStory.state() for the current scene and states. */
  var COSTUME = "clear", ST = null, SCENE = null;
  var SCENES = [["A New Day", 4, "Puppy wakes up alone in his cardboard box."], ["A World Full of Friends", 5, "He trots out and sees three pups playing with a red ball."],
    ["Can I Play Too?", 5, "He asks to join with a play bow and a bark. Nobody notices."], ["Left Behind", 4, "The ball bounces away, the pups race after it, and he cannot keep up."],
    ["A Little Sad", 4, "His tail sinks. He walks back the way he came."], ["All Alone", 6, "He sits down by himself while the world goes on."],
    ["Someone Notices", 5, "Sunny walks by, sees him, and stops."], ["A Gentle Hello", 8, "Sunny comes part of the way, sits, and offers something. Puppy decides for himself."],
    ["Let’s Play!", 7, "Puppy bows again, and this time someone bows back."], ["The First Friend", 5, "In the quiet afterwards, Puppy leans on Sunny."],
    ["Together From Now On", 4, "They walk on side by side."], ["Never Alone Again", 5, "The same place as before, and now there are two."]];
  var AT = [], acc = 0; SCENES.forEach(function (s) { AT.push(acc); acc += s[1]; });
  T_END = acc; BANDS_T = AT.concat([T_END]); TITLE_AT = T_END - 3.6;
  /* ---- the characters' states: each sets their face, act and posture; overrides can add a look or a flip ---- */
  var PUP_STATES = {
    idle: {}, wake: { act: "wakeup", emo: "sleepy" }, yawn: { act: "yawn" }, stretch: { act: "stretch" }, explore: { emo: "curious", act: "sniff" }, walk: {}, run: { emo: "excited" },
    sniff: { act: "sniff" }, curious: { emo: "curious" }, tilt: { emo: "curious", act: "tilt" }, excited: { emo: "excited", act: "wag" }, hopeful: { emo: "happy", act: "perk" },
    bow: { emo: "happy", act: "stretch" }, approach: { emo: "curious", creep: 1 }, hesitate: { emo: "shy" }, listen: { act: "listen" }, sit: { act: "sit" },
    confused: { emo: "confused" }, disappointed: { emo: "sad" }, lonely: { emo: "sad", act: "sit", low: 1 }, lonelyLie: { emo: "sad", act: "lie" },
    scared: { emo: "scared", shiver: 1 }, comforted: { emo: "shy", lean: 1 }, play: { emo: "excited" }, jump: { emo: "excited" }, wag: { emo: "happy", act: "wag" },
    rest: { emo: "love", lean: 1, rest: 1 }, sleep: { act: "sleep", lean: 1, rest: 1 }, shake: { act: "shake" }, paw: { act: "paw", emo: "confused" }
  };
  var SUN_STATES = {
    idle: {}, float: { float: 1, emo: "relaxed" }, walk: { act: "walk" }, look: { emo: "happy" }, notice: { emo: "curious" }, concerned: { emo: "sad" },
    approach: { act: "walk", slow: 1, emo: "relaxed" }, wait: { sit: 1, emo: "relaxed" }, offer: { sit: 1, reach: 1, emo: "relaxed" }, encourage: { emo: "happy", bend: 1 },
    comfort: { sit: 1, reach: 1, emo: "relaxed" }, play: { act: "walk", emo: "laugh" }, celebrate: { emo: "laugh", float: 1 }, rest: { sit: 1, emo: "relaxed" }
  };
  var PUP_RESET = { emo: null, act: null, creep: 0, lean: 0, rest: 0, shiver: 0, low: 0, sigh: 0, front: 0 };
  var SUN_RESET = { emo: null, act: null, slow: 0, reach: 0, sit: 0, bend: 0, hug: 0, mend: 0, brace: 0, tremble: 0, float: 0 };
  /* a timeline of [time, state, overrides] or [time, overrides]; resolved once into full snapshots */
  function resolve(list, presets, reset) {
    list.sort(function (a, b) { return a[0] - b[0]; });
    var cur = { name: "idle" }, out = [];
    list.forEach(function (e) {
      var name = typeof e[1] === "string" ? e[1] : null, over = name ? e[2] : e[1], k;
      cur = Object.assign({}, cur);
      if (name) { for (k in reset) cur[k] = reset[k]; var p = presets[name] || {}; for (k in p) cur[k] = p[k]; cur.name = name; }
      if (over) for (k in over) cur[k] = over[k];
      out.push([e[0], cur]);
    });
    return out;
  }
  function snapAt(list, t) { var s = list[0][1]; for (var i = 0; i < list.length && list[i][0] <= t; i++) s = list[i][1]; return s; }
  /* a hop with anticipation and follow-through: a crouch before, the jump, a small squash on landing */
  function hop(a, b, h) { return [[a - 0.12, 0], [a, 4, "out"], [(a + b) / 2, -h, "out"], [b, 3, "in"], [b + 0.16, 0, "out"]]; }
  function hops() { var o = [[0, 0]]; for (var i = 0; i < arguments.length; i++) o = o.concat(hop.apply(null, arguments[i])); return o; }
  /* a thrown or bounced ball: straight across, up and down */
  function arcs(segs) {
    var X = [[segs[0][0], segs[0][1]]], Y = [[segs[0][0], segs[0][2]]];
    segs.forEach(function (s) { var t0 = s[0], t1 = s[3]; X.push([t0, s[1]], [t1, s[4], "lin"]); Y.push([t0, s[2]], [(t0 + t1) / 2, Math.min(s[2], s[5]) - s[6], "out"], [t1, s[5], "in"]); });
    return { X: X, Y: Y };
  }
  /* where things sit on the characters, in street coordinates: f is true when the character faces left */
  function sHand(x, f) { return [x + (f ? -1 : 1) * 66, GY - 96]; }
  function pNose(x, f) { return [x + (f ? -1 : 1) * 28, GY - 50]; }
  function pHead(x, f) { return [x + (f ? -1 : 1) * 5, GY - 92]; }
  var K = ' stroke="#111" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
  var PROP = {
    butterfly: '<svg viewBox="0 0 36 30" width="36" height="30"><g class="bf-l"><path d="M18 15C13 2 2 1 3 11C3 17 11 17 18 15C10 16 5 22 9 26C13 29 17 22 18 16Z" fill="#ff8a9e"' + K + '/><circle cx="8" cy="9" r="2.2" fill="#fff" opacity="0.8"/></g>' +
      '<g class="bf-r"><path d="M18 15C23 2 34 1 33 11C33 17 25 17 18 15C26 16 31 22 27 26C23 29 19 22 18 16Z" fill="#ff8a9e"' + K + '/><circle cx="28" cy="9" r="2.2" fill="#fff" opacity="0.8"/></g>' +
      '<path d="M18 9V24" stroke="#111" stroke-width="2.6" stroke-linecap="round"/><path d="M18 10q-3 -5 -6 -6M18 10q3 -5 6 -6" fill="none" stroke="#111" stroke-width="1.2" stroke-linecap="round"/></svg>',
    butterfly2: '<svg viewBox="0 0 36 30" width="36" height="30"><g class="bf-l"><path d="M18 15C13 2 2 1 3 11C3 17 11 17 18 15C10 16 5 22 9 26C13 29 17 22 18 16Z" fill="#ffd45c"' + K + '/></g><g class="bf-r"><path d="M18 15C23 2 34 1 33 11C33 17 25 17 18 15C26 16 31 22 27 26C23 29 19 22 18 16Z" fill="#ffd45c"' + K + '/></g><path d="M18 9V24" stroke="#111" stroke-width="2.6" stroke-linecap="round"/></svg>',
    leaf: '<svg viewBox="0 0 32 20" width="32" height="20"><path d="M2 10C9 0 22 0 30 10C22 20 9 20 2 10Z" fill="#e0932f"' + K + '/><path d="M2 10H25M11 10l4 -4M17 10l4 -4M11 10l4 4M17 10l4 4" fill="none" stroke="#8a4f17" stroke-width="1.2" stroke-linecap="round"/></svg>',
    snowball: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#fff"' + K + '/><path d="M6 15a7 7 0 0 0 11 2" fill="none" stroke="#b9c9e2" stroke-width="2" stroke-linecap="round"/></svg>',
    ball: '<svg viewBox="0 0 26 26" width="26" height="26"><circle cx="13" cy="13" r="11" fill="#de364d"' + K + '/><path d="M4 11Q13 17 22 11" fill="none" stroke="#fff" stroke-width="2" opacity="0.85"/><circle cx="9" cy="8" r="2.6" fill="#fff" opacity="0.5"/></svg>',
    glow: '<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="3" fill="#fff7b0"/></svg>',
    box: '<svg viewBox="0 0 110 46" width="110" height="46" overflow="visible"><path d="M4 10L-8 2L-4 18L4 22Z M106 10L118 2L114 18L106 22Z" fill="#b5834a" stroke="#111" stroke-width="2" stroke-linejoin="round"/><path d="M4 10H106V44H4Z" fill="#c9965a" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M30 28H80" stroke="#9a6a36" stroke-width="3" opacity="0.6"/><path d="M4 16H106" stroke="#111" stroke-width="1.2" opacity="0.3"/><path class="c-snowtop" d="M5 9Q55 4 105 9" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>',
    lantern: '<svg viewBox="0 0 30 46" width="30" height="46"><path d="M15 2q-9 0 -9 9" fill="none" stroke="#111" stroke-width="2.2"/><path d="M8 10H22L24 16H6Z" fill="#3d4350" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 16H23V36H7Z" fill="#ffe7a1" stroke="#111" stroke-width="1.8"/><path d="M15 21q-3 4 0 8q3 -4 0 -8z" fill="#ff9f43"/><path d="M5 36H25V40H5Z" fill="#3d4350" stroke="#111" stroke-width="1.8"/></svg>',
    lglow: '<svg viewBox="0 0 300 300" width="300" height="300"><defs><radialGradient id="sst-lg"><stop offset="0" stop-color="#ffd890" stop-opacity="0.75"/><stop offset="0.35" stop-color="#ffc870" stop-opacity="0.3"/><stop offset="1" stop-color="#ffc870" stop-opacity="0"/></radialGradient></defs><circle cx="150" cy="150" r="150" fill="url(#sst-lg)"/></svg>',
    bowl: '<svg viewBox="0 0 40 20" width="40" height="20"><path d="M2 6H38L33 18H7Z" fill="#4d8dff" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="20" cy="6" rx="18" ry="3.4" fill="#bfe0ff" stroke="#111" stroke-width="1.6"/><path d="M10 5.5q5 -1.4 10 0" stroke="#fff" stroke-width="1.4" fill="none" opacity="0.8"/></svg>',
    shade: '<svg viewBox="0 0 320 30" width="320" height="30"><ellipse cx="160" cy="15" rx="160" ry="13" fill="rgba(70,48,20,0.26)"/></svg>',
    star: '<svg viewBox="0 0 170 8" width="170" height="8"><defs><linearGradient id="sst-ss"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect x="0" y="3" width="164" height="2" rx="1" fill="url(#sst-ss)"/><circle cx="165" cy="4" r="3.2" fill="#fff"/></svg>',
    bird: '<svg viewBox="0 0 26 14" width="26" height="14"><path d="M1 9Q7 2 13 9Q19 2 25 9" fill="none" stroke="#3a2a20" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="13" cy="10" rx="3" ry="2.4" fill="#3a2a20"/></svg>'
  };
  /* ---- the story, built for one climate ---- */
  function buildStory(v, night, mods) {
    mods = mods || {};
    var wet = v === "rain" || v === "storm", calm = v === "storm"; /* in a storm the play stays small and sheltered */
    var under = wet || !!mods.heat;                              /* in rain or heat he sits under the bench: shelter, or shade */
    var BOX = 1480, BENCH = 1330, S = under ? BENCH : 1120;     /* S: where Puppy sits alone, and where the film ends */
    var tS = 22.6;                                               /* when he reaches it */
    var P10 = calm ? [S - 250, S - 140] : [S - 560, S - 450];     /* where Sunny and Puppy sit in scene 10 */
    var o = { S: S, v: v, wet: wet };
    /* ---------- Puppy ---------- */
    var PX = [[0, BOX], [3.6, BOX], [4.1, BOX - 82, "out"], [6.0, 1290], [9.0, 1290], [9.6, 1262, "out"], [13.2, 1262], [14.4, 1340, "lin"], [15.2, 1372, "out"], [15.8, 1385, "out"],
      ];
    if (calm) PX.push([19.0, 1385], [19.8, S + 20, "out"], [21.4, S + 20], [22.2, S, "out"]);
    else PX.push([19.6, 1385], [tS, S, "lin"]);
    var PY = hops([3.6, 4.1, 34], [11.0, 11.35, 22], [11.6, 11.95, 22]);
    var PS = [
      [0, "idle", { flip: true, look: [0, 0.3], act: "sleep" }], [1.3, "wake", { look: [0, 0.2] }], [2.1, "yawn"], [2.8, "stretch"], [3.3, "explore", { look: [-1, -0.2] }],
      [4.1, "walk", { emo: "curious", look: [-1, -0.1] }], [6.0, "hopeful", { look: [-1, -0.2] }], [7.1, "excited", { look: [-1, 0.1] }], [8.3, "curious", { look: [-1, 0] }],
      [9.0, "run", { look: [-1, 0] }], [9.7, "hopeful", { look: [-1, -0.1] }], [9.95, "bow"], [10.9, "excited", { act: null }], [11.0, "jump"], [12.0, "hopeful", { emo: "shy" }],
      [12.2, "curious", { look: [-0.2, -1] }], [12.6, { look: [1, -0.7], emo: "surprised" }], [13.0, { flip: false, look: [1, -0.2] }],
      [13.2, "run", { look: [1, 0] }], [15.4, "walk", { emo: null, look: [1, 0] }], [15.8, "paw", { look: [1, 0.1] }], [16.9, "confused", { look: [1, 0.2] }],
      [18.0, "disappointed", { look: [1, 0.15] }], [18.8, { look: [0.6, 0.6] }], [19.4, { flip: true, look: [-1, 0.5] }], [19.6, "walk", { emo: "sad", low: 1, look: [-1, 0.6] }],
      [tS + 0.1, under ? "lonelyLie" : "lonely", { look: [-0.3, 0.6] }], [24.2, { look: [-0.5, -0.6] }], [24.9, { look: [-0.3, 0.6] }], [25.0, { sigh: 1 }], [26.4, { sigh: 0 }], [27.2, { look: [0.3, 0.5] }],
      [33.6, "listen", { emo: "sad", low: 0, look: [-0.4, 0.4] }], [34.4, "hesitate", { look: [-1, 0] }], [35.0, { look: [0.4, 0.5] }], [35.9, { look: [-1, 0.1] }], [37.2, "curious", { look: [-1, 0.2] }],
      [38.4, "approach", { look: [-1, 0.2] }], [39.0, "hesitate", { look: [-1, 0] }], [39.7, "approach", { look: [-1, 0.3] }], [40.3, "sniff", { look: [-1, 0.4] }], [40.8, "wag", { emo: "shy" }], [41.15, "curious", { act: null }],
      [41.25, "bow", { look: [-1, -0.2] }], [42.1, "idle", { emo: "surprised", look: [-1, -0.4] }], [42.4, "jump", { look: [-1, -0.3] }], [43.0, "wag", { look: [-1, -0.3] }],
      [48.0, "wag", { look: [-1, -0.2] }], [48.6, "approach", { emo: "happy", look: [-1, 0] }], [49.2, "comforted", { emo: "love", look: [-1, -0.2] }], [51.0, { act: "wag" }], [51.6, { act: null }], [52.4, { look: [-1, -0.8] }],
      [53.4, "walk", { flip: false, emo: "happy", look: [1, 0] }], [54.4, { look: [1, -0.1] }], [55.0, { look: [-1, -0.8] }], [55.7, { look: [1, 0] }],
      [56.9, "rest", { flip: true, look: [-1, -0.3] }], [59.4, { emo: "sleepy" }], [60.4, "sleep"]];
    if (wet) PS.push([4.3, { wet: 1 }], [48.0, "shake", { wet: 1 }], [48.6, { wet: 0 }]);
    if (under) PS.push([56.9, "lonelyLie", { emo: "love", look: [-1, -0.3] }], [59.4, { emo: "sleepy" }], [60.4, "sleep", { lean: 0, rest: 0 }]);
    if (v === "storm") PS = PS.filter(function (e) { return !(e[0] >= 18.0 && e[0] < 23); });
    if (v === "storm") PS.push([18.0, "disappointed", { look: [1, 0.15] }], [18.7, "scared", { look: [0.3, -0.8] }], [19.0, "run", { flip: true, emo: "scared", look: [-1, 0] }], [21.4, "scared", { look: [-1, -0.3] }], [tS + 0.1, "lonelyLie", { shiver: 1, emo: "scared" }], [26, { emo: "sad" }], [29.75, { emo: "scared", shiver: 1 }], [31.0, { emo: "sad", shiver: 0 }]);
    /* ---------- Sunny: off stage until scene 07 ---------- */
    var SX = [[0, S - 1300], [28.0, S - 1080], [30.0, S - 760, "lin"], [30.9, S - 690, "out"], [33.0, S - 690], [35.6, S - 330, "lin"]];
    var SY = [[0, 0]], SS = [
      [0, "idle", { flip: false, hold: wet, look: [0.3, -0.6] }], [28.0, "walk", { emo: "happy", look: [0.3, -0.6] }], [29.0, { look: [-0.2, -0.8] }],
      [29.8, "walk", { emo: "curious", look: [1, v === "snow" ? 0.8 : 0.1] }], [30.4, { look: [1, 0.15] }], [30.9, "notice", { look: [1, 0.2] }], [31.6, "concerned", { look: [1, 0.25] }], [32.5, { look: [1, 0.15] }],
      [33.0, "approach", { look: [1, 0.2] }], [35.6, "idle", { emo: "relaxed", look: [1, 0.2] }], [35.9, "wait", { look: [0.2, -0.8] }], [38.6, { look: [0.4, -0.6] }], [41.0, { emo: "happy" }],
      [41.6, "encourage", { sit: 0, look: [1, 0.3] }], [42.3, "idle", { emo: "happy", look: [1, 0] }], [42.6, "celebrate"], [43.6, "play", { look: [1, 0] }], [44.7, "idle", { emo: "laugh", look: [1, 0.2] }],
      [45.6, "play", { flip: true, look: [1, 0] }], [47.4, "idle", { flip: false, emo: "laugh", look: [1, 0.2] }], [47.8, "rest", { emo: "happy", look: [0.2, -0.5] }],
      [49.3, "rest", { emo: "surprised", look: [1, 0.5] }], [50.0, { emo: "blush" }], [50.8, "comfort", { emo: "relaxed", look: [1, 0.4] }], [52.6, { look: [1, 0.6], emo: "happy" }],
      [53.2, "idle", { emo: "happy", look: [1, 0.3] }], [53.6, "walk", { emo: "happy", look: [1, 0] }], [55.0, { look: [1, 0.5] }], [55.7, { look: [1, 0] }], [56.7, "rest", { look: [1, 0.3] }], [57.6, "comfort", { look: [1, 0.4] }], [60.2, { emo: "sleepy" }]];
    SY = hops([42.95, 43.35, 26]);
    if (calm) {
      /* the storm: no chase; a crouch at the bench, an umbrella over the gap, and drips to catch */
      SX = SX.slice(0, 5).concat([[35.6, S - 250, "lin"]]);
      SS = SS.filter(function (e) { return e[0] < 41.6; }).concat([[35.9, "wait", { look: [1, 0.4], emo: "relaxed" }], [38.0, { emo: "sad", look: [1, 0.5] }], [39.4, "comfort", { look: [1, 0.5] }], [41.0, { emo: "happy" }],
        [42.6, "comfort", { emo: "laugh", look: [1, 0.1] }], [44.4, { emo: "happy", look: [1, -0.2] }], [46.8, { emo: "relaxed", look: [1, 0.3] }], [49.3, "comfort", { emo: "surprised", look: [1, 0.5] }], [50.0, { emo: "blush" }], [50.8, { emo: "relaxed" }],
        [52.6, { look: [1, 0.6], emo: "happy" }], [53.2, "walk", { emo: "happy", look: [1, 0.3] }], [55.2, "comfort", { look: [1, 0.4] }], [60.2, { emo: "sleepy" }]]);
      SX.push([53.2, S - 250], [55.0, S - 120, "lin"]);
      SY = [[0, 0]];
    } else {
      var pre = v === "rain" ? S - 380 : S - 330;
      if (v === "rain") SX.push([36.6, S - 330], [37.4, S - 380, "out"]);
      SX.push([43.7, pre], [44.6, S - 110, "lin"], [45.6, S - 110], [47.4, P10[0], "lin"], [53.6, P10[0]], [56.7, S - 110, "lin"]);
      PX.push([38.4, S], [39.0, S - 70, "lin"], [39.4, S - 45, "out"], [39.7, S - 45], [40.3, S - 140, "lin"], [43.6, S - 140], [44.2, S + 40, "out"], [46.0, S + 40], [47.4, P10[1], "lin"], [48.6, P10[1]], [49.2, P10[1] - 6, "out"], [53.4, P10[1] - 6], [56.6, S, "lin"]);
      PY = PY.concat(hop(42.4, 42.85, 30), hop(45.4, 45.8, 22), hop(47.5, 47.9, 18));
      PS.push([44.2, "play", { flip: false, act: "spin", look: [1, -0.2] }], [45.2, "bow", { flip: true, look: [-1, -0.2] }], [45.9, "run", { emo: "excited", look: [-1, 0] }], [47.4, "wag", { look: [-1, -0.3] }]);
    }
    if (calm) {
      PX.push([37.9, S], [38.2, S + 8, "out"], [38.6, S - 120, "out"], [53.2, S - 120], [55.0, S, "lin"]);
      PS = PS.filter(function (e) { return !(e[0] >= 37.2 && e[0] < 48.0); });
      PS.push([37.95, "scared", { look: [0.2, -0.9] }], [38.6, "scared", { look: [-1, -0.5] }], [39.6, "comforted", { shiver: 0, look: [-1, -0.6] }], [40.6, { emo: "happy" }],
        [41.4, "curious", { look: [-0.3, -1] }], [42.0, "jump", { look: [-0.4, -1] }], [42.8, "wag", { emo: "happy", look: [-1, -0.6] }], [43.6, "jump", { look: [0.2, -1] }], [44.6, "wag", { look: [-1, -0.5] }], [46.0, "curious", { look: [0, -1] }], [46.6, "jump"], [47.4, "wag"]);
      PY = PY.concat(hop(42.0, 42.4, 26), hop(43.6, 44.0, 24), hop(46.6, 47.0, 20));
      PS = PS.filter(function (e) { return !(e[0] >= 48.6 && e[0] < 53.4); }).concat([[48.6, "comforted", { emo: "love", look: [-1, -0.3] }], [51.0, { act: "wag" }], [51.6, { act: null }], [52.4, { look: [-1, -0.8] }]]);
      PS = PS.filter(function (e) { return !(e[0] >= 53.4 && e[0] < 56.9); }).concat([[53.4, "walk", { emo: "happy", look: [1, -0.2] }], [54.6, { look: [-1, -0.8] }], [55.0, "lonelyLie", { emo: "love", look: [-1, -0.4] }]]);
    }
    /* ---------- Sunny's umbrella ---------- */
    o.UV = wet ? [[0, 1]] : [[0, 0]];
    o.UR = [[0, -14]]; o.UO = [[0, 1]];
    if (v === "rain") { o.UV = [[0, 1], [36.25, 1], [36.3, 0], [44.4, 0], [44.45, 1]]; o.UR = [[0, -14], [44.45, -14], [45.0, 10], [53.2, 10], [53.8, -4], [56.6, -4], [57.4, 16]]; SS.push([36.0, "encourage", { hold: 1, look: [1, 0.6] }], [36.6, "idle", { hold: 0, emo: "relaxed", look: [1, 0.3] }], [44.45, { hold: 1 }]); }
    if (v === "storm") o.UR = [[0, -12], [35.8, -12], [36.6, 30], [53.2, 30], [53.8, -6], [55.2, -6], [55.9, 26]];
    /* ---------- the three pups and their ball (they never mean any harm) ---------- */
    var far = under ? 150 : 300;
    var b = arcs([[3.9, -160, GY - 12, 5.1, 900, GY - 10, 40], [5.1, 900, GY - 10, 5.9, 1135, GY - 12, 90], [5.9, 1135, GY - 12, 6.6, 1030, GY - 10, 60], [6.6, 1030, GY - 10, 7.5, 880, GY - 10, 80], [7.5, 880, GY - 10, 8.4, 1140, GY - 12, 110],
      [8.4, 1140, GY - 12, 9.1, 1010, GY - 10, 50], [9.1, 1010, GY - 10, 10.0, 900, GY - 10, 70], [10.0, 900, GY - 10, 11.0, 1140, GY - 12, 100], [11.0, 1140, GY - 12, 12.2, 1135, GY - 12, 8],
      [12.2, 1135, GY - 12, 12.95, 1500, GY - 12, 150], [12.95, 1500, GY - 12, 13.35, 1640, GY - 12, 46], [13.35, 1640, GY - 12, 13.7, 1760, GY - 12, 22], [13.7, 1760, GY - 12, 14.4, 2050, GY - 12, 10],
      [53.0, S + far - 20, GY - 12, 53.9, S + far + 180, GY - 12, 90], [53.9, S + far + 180, GY - 12, 54.8, S + far + 60, GY - 12, 70], [54.8, S + far + 60, GY - 12, 55.8, S + far + 230, GY - 12, 100], [55.8, S + far + 230, GY - 12, 56.8, 2100, GY - 12, 40]]);
    o.dogs = [
      { scale: 0.62, base: "#8b5e3c", dark: "#5e3d26", light: "#d9b48a", ear: "flop", X: [[0, -320], [3.8, -320], [5.0, 880, "out"], [5.6, 880], [5.9, 905], [6.6, 880], [9.5, 880], [9.8, 905], [12.3, 900], [14.6, 2150, "in"], [52.6, 2150], [52.8, S + far], [56.6, S + far + 30], [57.8, 2150, "in"]],
        Y: hops([4.95, 5.3, 26], [7.35, 7.75, 30], [9.85, 10.25, 26], [53.1, 53.5, 22]), S: [[0, { run: 1, flip: true }], [5.0, { run: 0, play: 1, flip: true }], [12.3, { play: 0, run: 1, flip: true }], [14.6, { run: 0 }], [52.8, { play: 1, flip: true }], [56.6, { play: 0, run: 1, flip: true }]] },
      { scale: 0.56, base: "#6f727b", dark: "#4a4d55", light: "#c9ccd2", ear: "point", X: [[0, -220], [3.9, -220], [5.1, 1010, "out"], [5.4, 1010], [5.8, 1040, "out"], [7.6, 1040], [8.4, 1000, "out"], [12.2, 1000], [14.4, 2200, "in"], [52.6, 2200], [52.8, S + far + 110], [56.6, S + far + 120], [57.8, 2200, "in"]],
        Y: hops([6.45, 6.85, 34], [8.95, 9.35, 28], [53.8, 54.2, 26]), S: [[0, { run: 1, flip: true }], [5.1, { run: 0, play: 1, flip: false }], [7.6, { flip: true }], [9.0, { flip: false }], [12.2, { play: 0, run: 1, flip: true }], [14.4, { run: 0 }], [52.8, { play: 1, flip: false }], [56.6, { play: 0, run: 1, flip: true }]] },
      { scale: 0.68, base: "#b5793f", dark: "#2a2421", light: "#e1b685", ear: "point", saddle: 1, X: [[0, -120], [4.0, -120], [5.2, 1140, "out"], [12.3, 1140], [14.2, 2100, "in"], [52.6, 2100], [52.8, S + far + 220], [56.6, S + far + 200], [57.6, 2100, "in"]],
        Y: hops([5.75, 6.15, 30], [8.25, 8.7, 36], [10.85, 11.3, 32], [12.05, 12.4, 26], [54.7, 55.1, 26]), S: [[0, { run: 1, flip: true }], [5.2, { run: 0, play: 1, flip: false }], [12.3, { play: 0, run: 1, flip: true }], [14.2, { run: 0 }], [52.8, { play: 1, flip: false }], [56.6, { play: 0, run: 1, flip: true }]] }];
    o.props = [{ svg: PROP.box, w: 110, h: 46, cls: "sst-box", z: 4, zAt: [3.9, 1], X: [[0, BOX]], Y: [[0, GY - 22]], OP: [[0, 1]] },
      { svg: PROP.ball, w: 26, h: 26, cls: "sst-ball", z: 2, X: b.X, Y: b.Y, OP: [[0, 0], [3.9, 0], [4.0, 1], [14.3, 1], [14.4, 0], [52.9, 0], [53.0, 1], [56.7, 1], [56.8, 0]], R: [[0, 0], [14.4, 900, "lin"], [53, 900], [57, 1500, "lin"]] }];
    /* ---------- the offering, and the game it turns into ---------- */
    var hand = sHand(S - 330, false), nose = pNose(S - 140, true);
    o.SPARKS = []; o.FX = []; o.FLIES = [[0, 0]]; o.LEAF = [[0, 0]];
    function heatBowl() {
      var at = function (t, c) { if (t < 36.0) { var h = sHand(c.sx, c.sf); return [h[0], h[1] + 22 + c.sy]; } return [S - 200, GY - 10]; };
      o.props.push({ svg: PROP.shade, w: 320, h: 30, cls: "sst-shade", z: 1, X: [[0, BENCH + 30]], Y: [[0, GY + 2]], OP: [[0, 1]] },
        { svg: PROP.bowl, w: 40, h: 20, cls: "sst-bowl", z: 5, at: at, OP: [[0, 0], [27.8, 0], [28.0, 1]] });
      SS.push([36.0, "encourage", { look: [1, 0.6] }], [36.6, "wait", { look: [0.2, -0.6] }]);
      o.SPARKS.push([36.1, S - 200, GY - 40]);
    }
    if (v === "clear") {
      if (mods.heat) heatBowl(); else {
      var bf = night ? { svg: PROP.glow, w: 16, h: 16, cls: "sst-glowdot", wob: [7, 6, 2.6] } : { svg: PROP.butterfly, w: 36, h: 30, cls: "sst-bf", wob: [9, 7, 5.2] };
      bf.X = [[0, S - 520], [34.4, S - 520], [36.2, S - 360], [37.0, hand[0]], [40.0, hand[0]], [40.5, nose[0] - 4], [41.1, nose[0] - 4], [42.0, S - 220], [44.3, S + 70], [45.6, S - 20], [47.3, P10[1] - 60], [48.4, P10[1] - 30], [50.0, P10[1] + 200]];
      bf.Y = [[0, GY - 260], [34.4, GY - 260], [36.2, GY - 170], [37.0, hand[1] - 12], [40.0, hand[1] - 12], [40.5, nose[1] - 10], [41.1, nose[1] - 10], [42.0, GY - 150], [44.3, GY - 120], [45.6, GY - 170], [47.3, GY - 130], [48.4, GY - 190], [50.0, GY - 320]];
      bf.OP = [[0, 0], [34.2, 0], [34.6, 1], [49.2, 1], [50.0, 0]]; bf.WOB = [[0, 1], [36.8, 1], [37.0, 0], [40.0, 0], [40.1, 1], [40.4, 1], [40.5, 0], [41.1, 0], [41.2, 1]];
      o.props.push(bf);
      o.SPARKS.push([37.05, hand[0], hand[1] - 30], [40.55, nose[0], nose[1] - 26]);
      }
      if (!night) { /* two butterflies, always together, while he sits alone */
        [[0, PROP.butterfly2], [26, PROP.butterfly]].forEach(function (pair, i) {
          o.props.push({ svg: pair[1], w: 30, h: 25, cls: "sst-bf", wob: [10, 8, 4.6 + i], X: [[0, 1620 + i * 30], [5, 1500 + i * 30], [9, 1320 + i * 30], [22.6, S - 900 + i * 34], [27.6, S + 380 + i * 34, "lin"]], Y: [[0, GY - 150 - i * 20], [9, GY - 200 - i * 20], [22.6, GY - 230 - i * 18], [27.6, GY - 260 - i * 18]],
            OP: [[0, 1], [9.0, 1], [9.4, 0], [22.6, 0], [22.9, 1], [27.3, 1], [27.6, 0]] });
        });
      } else o.FLIES = [[0, 0], [22, 0], [25, 1]];
    }
    if (v === "wind") {
      o.LEAF = [[0, 1], [11.9, 1], [12.2, 2.4], [13.4, 1], [22, 1], [23, 1.6], [28, 1.2], [35.4, 1], [35.6, 2.2], [36.4, 1]];
      o.props.push({ svg: PROP.leaf, w: 32, h: 20, cls: "sst-leaf", wob: [8, 9, 4.1], spin: 260, push: [38.6, 40.6, 40],
        X: [[0, mods.windRight ? S - 760 : S + 360], [35.6, mods.windRight ? S - 760 : S + 360], [36.6, hand[0]], [37.4, hand[0]], [38.6, S - 60], [40.6, S - 60], [41.2, S - 200], [43.6, S - 150], [44.3, S + 90], [45.6, S + 20], [47.2, P10[1] - 80], [47.6, pHead(P10[1], true)[0]]],
        Y: [[0, GY - 230], [35.6, GY - 230], [36.6, hand[1] - 6], [37.4, hand[1] - 6], [38.6, GY - 8], [40.6, GY - 8], [41.2, GY - 160], [43.6, GY - 120], [44.3, GY - 60], [45.6, GY - 150], [47.2, GY - 130], [47.6, pHead(P10[1], true)[1] - 6]],
        OP: [[0, 0], [35.5, 0], [35.7, 1]], WOB: [[0, 1], [36.5, 1], [36.6, 0], [37.4, 0], [37.5, 1], [38.5, 1], [38.6, 0], [40.6, 0], [40.7, 1], [47.5, 1], [47.6, 0]] });
      o.SPARKS.push([36.65, hand[0], hand[1] - 26], [47.7, pHead(P10[1], true)[0], pHead(P10[1], true)[1] - 20]);
    }
    if (v === "fog") {
      /* the lantern: carried, set down between them, carried again */
      var lan = function (t, c) {
        if (t < 36.0 || (t >= 44.2 && t < 47.4) || (t >= 53.3 && t < 57.0)) { var h = sHand(c.sx, c.sf); return [h[0], h[1] + 18 + c.sy]; }
        if (t < 44.2) return [S - 200, GY - 22];
        if (t < 53.3) return [P10[0] + 56, GY - 22];
        return [S - 55, GY - 22];
      };
      o.props.push({ svg: PROP.lglow, w: 300, h: 300, cls: "sst-lglow", z: 1, at: lan, OP: [[0, 0], [27.8, 0], [28.4, 1]] }, { svg: PROP.lantern, w: 30, h: 46, cls: "sst-lantern", z: 5, at: lan, OP: [[0, 0], [27.8, 0], [28.0, 1]] });
      SS.push([36.0, "encourage", { look: [1, 0.6] }], [36.6, "wait", { look: [0.2, -0.6] }]);
      o.SPARKS.push([36.1, S - 200, GY - 50]);
    }
    if (v === "snow") {
      o.props.push({ svg: PROP.snowball, w: 24, h: 24, cls: "sst-ball", z: 4, push: [38.4, 42.8, 40], X: [[0, S - 285], [37.4, S - 285], [38.4, S - 52, "out"]], Y: [[0, GY - 12]], OP: [[0, 0], [37.0, 0], [37.2, 1], [42.75, 1], [42.8, 0]], R: [[0, 0], [37.4, 0], [38.4, 520, "out"]] });
      SS.push([36.0, "encourage", { mend: 1, look: [0.6, 0.8] }], [37.4, "encourage", { look: [1, 0.6] }], [37.9, "wait", { look: [1, 0.3] }], [38.6, { look: [0.2, -0.7] }]);
      o.SPARKS.push([37.3, S - 285, GY - 34]);
      o.FX.push([42.8, "puff", S - 120, GY - 20, 18], [45.8, "puff", S + 40, GY - 4, 10], [47.9, "puff", P10[1], GY - 4, 10]);
    }
    if (v === "rain") {
      /* he sets his open umbrella down beside Puppy and steps back into the rain himself */
      var um = umbrella().replace('<g class="u-root"><g class="u-tilt">', "<g><g>");
      o.props.push({ svg: '<svg viewBox="0 0 220 220" width="190" height="190" overflow="visible"><g transform="translate(110 214)"><g transform="rotate(-18)">' + um + "</g></g></svg>", w: 190, h: 190, cls: "sst-planted", z: 1, X: [[0, S - 150]], Y: [[0, GY - 95]], OP: [[0, 0], [36.25, 0], [36.3, 1], [44.4, 1], [44.45, 0]] });
      o.FX.push([42.85, "splash", S - 140, GY + 4, 12], [44.2, "splash", S + 40, GY + 4, 10], [45.8, "splash", S + 40, GY + 4, 12], [47.9, "splash", P10[1], GY + 4, 12]);
      o.SHELTERS = [[S - 245, S - 55, GY - 175, 36.3, 44.4]];
    }
    if (v === "storm") { o.FLASH = [[18.6, 0], [18.66, 0.5], [18.76, 0.06], [18.86, 0.3], [19.2, 0], [29.7, 0], [29.76, 0.34], [29.9, 0.04], [30.0, 0.18], [30.3, 0], [37.8, 0], [37.86, 0.42], [37.96, 0.05], [38.06, 0.24], [38.4, 0], [45.2, 0], [45.26, 0.12], [45.5, 0], [50.6, 0], [50.66, 0.1], [50.9, 0], [59.6, 0], [59.66, 0.08], [59.9, 0]]; }
    if (v === "snow" || v === "clear" && !night || v === "wind") {
      /* two birds settle back on the wire together, at the end */
      [0, 1].forEach(function (i) { o.props.push({ svg: PROP.bird, w: 26, h: 14, cls: "sst-pbird", sky: 1, X: [[0, S - 700 - i * 40], [57.6, S - 700 - i * 40], [59.0 + i * 0.2, S - 40 + i * 24, "out"]], Y: [[0, 380], [57.6, 380 - i * 20], [59.0 + i * 0.2, 500 + i * 2, "out"]], OP: [[0, 0], [57.6, 0], [57.8, 1]], WOB: [[0, 1], [59.0 + i * 0.2, 1], [59.05 + i * 0.2, 0]] }); });
    }
    if (mods.cold || v === "snow") PS.push([0, { scarf: "w" }]);
    if (mods.stars) { /* a clear night: they look up together before they fall asleep */
      o.props.push({ svg: PROP.star, w: 170, h: 8, cls: "sst-shoot", sky: 1, rot: 15, X: [[0, S - 760], [58.2, S - 760], [59.0, S - 330, "out"]], Y: [[0, 300], [58.2, 300], [59.0, 412, "out"]], OP: [[0, 0], [58.15, 0], [58.3, 1], [58.8, 1], [59.05, 0]] });
      SS.push([58.0, { look: [0.2, -1] }], [59.5, { look: [1, 0.4] }]); PS.push([58.1, { look: [-0.3, -1] }], [59.3, { look: [-1, -0.3] }]);
    }
    /* ---------- the camera: wide and still for loneliness, closer as they connect ---------- */
    var c10 = (P10[0] + P10[1]) / 2;
    o.CAM = [[0, BOX, 700, 2.4], [3.4, BOX - 10, 696, 2.35], [4.4, BOX - 60, 680, 1.9], [6.4, 1250, 650, 1.35], [9.0, 1240, 650, 1.35],
      [9.7, 1200, 690, 1.8], [12.2, 1200, 690, 1.8], [13.6, 1320, 680, 1.7], [15.0, 1330, 665, 1.62], [17.9, 1330, 665, 1.62],
      [18.4, 1380, 690, 2.35], [19.5, 1378, 690, 2.3], [21.4, S + 40, 670, 1.6], [23.6, S - 300, 645, 1.0], [31.0, S - 300, 645, 1.0], [33.0, S - 600, 660, 1.5],
      [34.9, S - 215, 652, 1.7], [38.2, S - 215, 652, 1.7], [38.9, S - 100, 690, 2.35], [40.6, S - 100, 690, 2.35], [41.3, S - 215, 652, 1.7]];
    if (calm) o.CAM.push([47.6, S - 190, 662, 1.85], [48.4, c10, 690, 2.3], [53.0, c10, 690, 2.55], [53.8, S - 160, 662, 1.75], [56.6, S - 120, 660, 1.6]);
    else o.CAM.push([44.2, S - 80, 652, 1.6], [47.4, S - 470, 655, 1.65], [48.4, c10, 690, 2.3], [53.0, c10, 690, 2.55], [53.9, S - 260, 652, 1.2], [56.8, S - 160, 650, 1.15]);
    o.CAM.push([57.6, S - 300, 645, 1.0], [T_END, S - 290, 648, 1.08]);
    o.DRIFT = calm ? [[0, 0]] : [[0, 0], [41.0, 0], [41.8, 1], [47.0, 1], [47.8, 0]]; /* handheld energy only while they play */
    /* ---------- sound ---------- */
    o.CUES = [[0.3, "sleep"], [3.3, "sniff"], [4.6, "dogBark"], [5.1, "boing"], [5.9, "boing"], [6.6, "boing"], [6.7, "dogBark2"], [7.5, "boing"], [8.1, "dogBark"], [8.4, "boing"], [9.1, "boing"], [9.9, "dogBark2"], [10.0, "boing"], [11.0, "boing"],
      [10.2, "yips"], [11.0, "barkHappy"], [12.2, "boing"], [12.95, "boing"], [12.4, "dogBark"], [12.5, "pawsRun"], [13.35, "boing"], [16.3, "whine"], [18.4, "whimper"], [25.0, "pupSigh"], [30.9, "hmm"],
      [37.0, "ting"], [40.3, "sniff"], [41.3, "yips"], [42.45, "barkHappy"], [43.4, "pop"], [45.3, "arf"], [46.4, "pant"], [49.4, "aww"], [53.2, "dogBark2"], [54.0, "boing"], [54.8, "boing"], [T_END - 3.4, "bell"], [60.6, "sleep"]];
    if (v === "storm") o.CUES.push([18.8, "thunder"], [18.9, "whimperFear"], [29.85, "thunder"], [37.95, "thunder"], [38.1, "whimperFear"], [45.4, "thunderFar"], [50.8, "thunderFar"], [59.8, "thunderFar"]);
    if (v === "rain") o.CUES.push([42.85, "splosh"], [44.2, "splosh"], [45.8, "splosh"], [47.9, "splosh"]);
    if (v === "snow") o.CUES.push([42.8, "puff"], [45.8, "puff"]);
    if (v === "wind") o.CUES.push([12.2, "gust"], [35.6, "gust"]);
    o.amb = v === "clear" ? (night ? "crickets" : "birds") : null;
    o.WINDT = v === "wind" ? [[0, 0], [12.0, 0], [12.2, 0.35], [13.4, 0], [35.4, 0], [35.6, 0.35], [36.6, 0]] : [[0, 0]]; /* gusts the story needs, on top of the real wind */
    if (mods.heat) o.CUES.push([23.4, "pant"], [27.0, "pant"], [40.4, "sniff"], [46.9, "pant"]);
    if (mods.stars) o.CUES.push([58.3, "ting"]);
    function ord(k) { return k.slice().sort(function (a, b) { return a[0] - b[0]; }); }
    SX = ord(SX); PX = ord(PX); PY = ord(PY); SY = ord(SY);
    o.SX = SX; o.SY = SY; o.SS = resolve(SS, SUN_STATES, SUN_RESET); o.PX = PX; o.PY = PY; o.PS = resolve(PS, PUP_STATES, PUP_RESET);
    o.FLASH = o.FLASH || [[0, 0]]; o.SHELTERS = (o.SHELTERS || []).concat([[214, 470, 600], [1250, 1412, 662], [1390, 1660, 590]]);
    o.KEY = [2.5, 7.4, 10.4, 16.4, v === "storm" ? 18.8 : 19.0, 25.5, 31.8, 40.6, calm ? 43.0 : 44.8, 51.2, 55.0, 61.0];
    o.label = { clear: night ? "on a quiet night in the park" : "on a bright day in the park", rain: "in the rain", storm: "in a thunderstorm", wind: "on a windy day", fog: "in the fog", snow: "in the snow" }[v];
    o.offer = { clear: mods.heat ? "Sunny sets down a bowl of water for him in the shade" : night ? "a firefly settles on Sunny’s hand" : "a butterfly settles on Sunny’s hand", rain: "Sunny sets his umbrella down beside Puppy and stands in the rain", storm: "Sunny crouches beside him and holds his umbrella over them both", wind: "Sunny catches a leaf and lets it drift to Puppy", fog: "Sunny sets his lantern down between them", snow: "Sunny rolls a snowball to Puppy’s paws" }[v];
    return o;
  }
  function mixPal(a, b, u, ui) {
    var o = {}; for (var k in a) o[k] = mix(a[k], b[k], u);
    ["capC", "capS", "uiC", "uiT"].forEach(function (k) { o[k] = ui[k]; });
    return o;
  }
  /* ===================================================================== the real weather and the local time
     Weather → climate → world → behaviour, decided here from real readings only, by one fixed table (climateOf).
     Where: the browser's own location when the visitor has already allowed it for this site (the film never asks).
     If that is denied, not yet asked, unavailable or slower than 1.5 s, the city of the device's time zone (looked up
     once a day); if there is no place at all, the film is lit by the device clock and claims no weather.
     What: one Open-Meteo request (free, no key): condition, temperature and feels-like, cloud cover, precipitation
     (rain, showers, snow), wind speed, gusts and direction, and today's sunrise and sunset in the place's own time
     zone. A field the service does not send is left out, and its effect with it. Coordinates are rounded to about
     1 km and kept only in this browser.
     Freshness: Open-Meteo updates every 15 minutes. A reading younger than that is used as it is; an older one (up to
     3 hours) is used at once, so nothing waits, while a fresh one is fetched; anything older is thrown away. While the
     film plays the light follows the place's clock, and a fresh reading eases in over six seconds, but only where it
     cannot contradict the story already on screen (rain does not start in a dry story, snow does not melt halfway
     through a snowball fight); anything bigger is kept for the next visit. Scenes and feelings never change.
     For checking: &weather=clear|partly|cloudy|drizzle|rain|heavy|storm|hail|snow|blizzard|fog|wind|heat|cold|offline,
     &time=sunrise|morning|midday|afternoon|sunset|evening|night|latenight, &wind=DEGREES, &lat=..&lon=.. (the real
     weather there), &loc=denied|unavailable|timeout|prompt, &api=fail, &stale=1, &refresh=SECONDS[:weather], and
     SunnyStory.weather() in the console. */
  var WX = { done: false, src: "time", loc: "none", rec: null, err: null, fetchedAt: 0, pending: null, last: null };
  var hour = new Date().getHours();
  var FRESH = 15 * 60000, STALE_MAX = 3 * 3600000;
  var UNIT_F = /^en-(US|LR)\b|^my\b/i.test(navigator.language || "");
  var PHASES = ["sunrise", "morning", "midday", "afternoon", "sunset", "evening", "night", "latenight"];
  function num(v) { return typeof v === "number" && isFinite(v) ? v : null; }
  function mins(s) { var m = /T(\d\d):(\d\d)/.exec(s || ""); return m ? +m[1] * 60 + +m[2] : null; }
  /* one reading, as the service sent it */
  function readRec(j, src) {
    var c = j && j.current; if (!c || c.weather_code == null) throw new Error("no current weather");
    var d = j.daily || {}, off = num(j.utc_offset_seconds);
    if (off != null && c.time) { var obs = Date.parse(c.time + "Z") - off * 1000; if (isFinite(obs) && Date.now() - obs > STALE_MAX) throw new Error("stale reading"); }
    return { code: c.weather_code, temp: num(c.temperature_2m), feels: num(c.apparent_temperature), cloud: num(c.cloud_cover), precip: num(c.precipitation), rain: num(c.rain), showers: num(c.showers), snow: num(c.snowfall),
      wind: num(c.wind_speed_10m), gust: num(c.wind_gusts_10m), dir: num(c.wind_direction_10m), isDay: c.is_day, offset: off, tz: j.timezone || "",
      sunrise: mins(d.sunrise && d.sunrise[0]), sunset: mins(d.sunset && d.sunset[0]), src: src };
  }
  /* test readings for ?weather=, shaped like the service's */
  function synth(name) {
    var b = { code: 0, temp: 18, feels: 18, cloud: 8, precip: 0, rain: 0, showers: 0, snow: 0, wind: 8, gust: 14, dir: qs.has("wind") && isFinite(parseFloat(qs.get("wind"))) ? parseFloat(qs.get("wind")) : 80, isDay: 1, offset: null, sunrise: null, sunset: null, src: "override" };
    var o = { clear: {}, partly: { code: 2, cloud: 55 }, cloudy: { code: 3, cloud: 95 }, overcast: { code: 3, cloud: 100 }, drizzle: { code: 53, cloud: 100, precip: 0.1, rain: 0.1 }, rain: { code: 63, cloud: 100, precip: 0.6, rain: 0.6 },
      heavy: { code: 65, cloud: 100, precip: 2.4, rain: 2.4 }, storm: { code: 95, cloud: 100, precip: 1.4, wind: 36, gust: 64 }, hail: { code: 96, cloud: 100, precip: 1.6, wind: 34, gust: 60 }, snow: { code: 73, cloud: 100, temp: -2, feels: -6, snow: 0.4 },
      blizzard: { code: 75, cloud: 100, temp: -7, feels: -15, snow: 0.9, wind: 46, gust: 72 }, fog: { code: 45, cloud: 100, temp: 9, feels: 8 }, wind: { code: 1, cloud: 30, wind: 42, gust: 63 }, heat: { code: 0, cloud: 4, temp: 41, feels: 45 }, cold: { code: 1, cloud: 20, temp: -3, feels: -8 } }[name];
    if (!o) return null;
    for (var k in o) b[k] = o[k];
    return b;
  }
  /* the time at the place itself (its own time zone when the service gave it), in minutes since midnight */
  function localMinutes(rec) {
    var now = new Date();
    if (rec && rec.offset != null) { var u = new Date(now.getTime() + rec.offset * 1000); return u.getUTCHours() * 60 + u.getUTCMinutes() + u.getUTCSeconds() / 60; }
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  }
  function phaseOf(m, sr, ss) {
    if (sr == null || ss == null || ss - sr < 120) { sr = 390; ss = 1110; } /* no sun times (offline, or polar day and night): a usual day */
    var noon = (sr + ss) / 2;
    if (m < sr - 30) return "latenight";
    if (m < sr + 45) return "sunrise";
    if (m < noon - 90) return "morning";
    if (m < noon + 90) return "midday";
    if (m < ss - 60) return "afternoon";
    if (m < ss + 20) return "sunset";
    if (m < ss + 90) return "evening";
    return "night";
  }
  function phaseNow() {
    var ot = qs.get("time");
    if (ot) return { day: "midday", dusk: "sunset", night: "night" }[ot] || (PHASES.indexOf(ot) >= 0 ? ot : "midday");
    var r = WX.rec; return phaseOf(localMinutes(r), r && r.sunrise, r && r.sunset);
  }
  /* ---- the table: a reading and a phase become one climate ---- */
  function climateOf(rec, phase) {
    var cl = { known: !!rec, phase: phase, dark: phase === "evening" || phase === "night" || phase === "latenight", kind: "clear", sub: "fair", rain: 0, snow: 0, wind: 0.2, wx: -0.35, cloud: 0.4, temp: null, feels: null, heat: false, cold: false };
    if (!rec) { cl.sub = "unknown"; return cl; }
    var c = rec.code, sp = rec.wind || 0, gu = rec.gust || 0, rate = rec.precip != null ? rec.precip * 4 : null; /* mm in the last 15 minutes, as mm per hour */
    cl.temp = rec.temp; cl.feels = rec.feels != null ? rec.feels : rec.temp;
    cl.cloud = rec.cloud != null ? rec.cloud / 100 : c >= 3 ? 1 : c === 2 ? 0.55 : c === 1 ? 0.25 : 0.05;
    cl.wind = Math.max(0.12, Math.min(1, Math.max(sp, gu * 0.6) / 45));
    if (rec.dir != null) cl.wx = -Math.sin(rec.dir * Math.PI / 180); /* where it blows to, east being to the right */
    function byRate(r) { return r < 0.5 ? 0.45 : r < 2.5 ? 0.8 : r < 7.6 ? 1.1 : 1.5; }
    if (c >= 95) { cl.kind = "storm"; cl.sub = c >= 96 ? "hail" : "thunder"; cl.rain = 1.5; }
    else if ((c >= 71 && c <= 77) || c === 85 || c === 86) { cl.kind = "snow"; cl.snow = { 71: 0.6, 73: 1, 75: 1.4, 77: 0.5, 85: 0.7, 86: 1.3 }[c] || 1; cl.sub = sp >= 40 || gu >= 60 ? "blizzard" : "snow"; if (cl.sub === "blizzard") cl.snow = Math.min(1.6, cl.snow + 0.3); }
    else if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) {
      var base = c <= 57 ? (c >= 55 ? 0.6 : 0.45) : { 61: 0.75, 63: 1, 65: 1.45, 66: 0.75, 67: 1.45, 80: 0.75, 81: 1, 82: 1.5 }[c] || 1;
      cl.kind = "rain"; cl.rain = rate ? (base + byRate(rate)) / 2 : base; cl.sub = c <= 57 ? "drizzle" : cl.rain >= 1.3 ? "heavy" : "rain";
    } else if (c === 45 || c === 48) { cl.kind = "fog"; cl.sub = "fog"; }
    else if (sp >= 30 || gu >= 50) { cl.kind = "wind"; cl.sub = "wind"; }
    if (cl.kind === "clear") cl.sub = c === 3 || cl.cloud >= 0.85 ? "overcast" : c === 2 || cl.cloud >= 0.3 ? "partly" : "fair";
    if ((cl.kind === "clear" || cl.kind === "wind") && cl.feels != null && cl.feels >= 38 && !cl.dark) cl.heat = true; /* heat: shade, water, slow paws */
    if ((cl.kind === "clear" || cl.kind === "wind" || cl.kind === "fog") && cl.temp != null && cl.temp <= 3) cl.cold = true; /* cold and dry: winter clothes */
    return cl;
  }
  /* ---- the world for a climate: light, sky, sun, rain, snow, wind ---- */
  var SUNPOS = { sunrise: [330, 420], morning: [520, 300], midday: [820, 150], afternoon: [1150, 300], sunset: [1220, 430], evening: [1220, 720], night: [1220, 900], latenight: [1220, 900] };
  function lightFor(cl, v) {
    var light, dark, warm = false;
    if (v === "storm") { light = "stormday"; dark = "stormnight"; }
    else if (v === "snow") { light = "snowday"; dark = "snownight"; }
    else if (v === "rain") { light = "overcast"; dark = "night"; }
    else if (v === "fog") { light = "fogday"; dark = "fognight"; }
    else if (!cl.known) { light = "mild"; dark = "nightcloud"; }
    else if (cl.sub === "overcast") { light = "cloudy"; dark = "nightcloud"; }
    else { light = cl.heat ? "heat" : "day"; dark = cl.cloud > 0.6 ? "nightcloud" : "nightclear"; warm = true; }
    var ph = cl.phase, sunsetP = warm ? PAL.duskclear : mixPal(PAL[light], PAL[dark], 0.5, PAL[dark]), P;
    if (ph === "night") P = PAL[dark];
    else if (ph === "latenight") P = mixPal(PAL[dark], palFrom(dark, { winOn: PAL[dark].winOn * 0.35 }), 1, PAL[dark]); /* most windows dark */
    else if (ph === "evening") P = mixPal(sunsetP, PAL[dark], 0.7, PAL[dark]);
    else if (ph === "sunset") P = sunsetP;
    else if (ph === "sunrise") { P = warm ? mixPal(PAL.dawn, PAL[light], 0.55, PAL[light]) : mixPal(PAL[light], PAL[dark], 0.35, PAL[light]); P.mist = Math.min(P.mist, 0.3); }
    else P = PAL[light];
    P = mixPal(P, P, 0, P); /* a copy */
    if (cl.known && (v === "clear" || v === "wind")) { /* the real cloud cover: more cloud, less sun, fewer stars */
      var cc = cl.cloud;
      P.cloud = Math.max(P.cloud, 0.12 + 0.8 * cc); P.sun = P.sun * (1 - 0.75 * cc); P.rays = P.rays * (1 - cc); P.stars = P.stars * (1 - cc); P.moon = P.moon * (1 - 0.6 * cc);
    }
    return P;
  }
  function envFrom(cl, v) {
    return { P: lightFor(cl, v), sun: SUNPOS[cl.phase] || SUNPOS.midday, heat: cl.heat ? 1 : 0, wx: cl.wx,
      rain: v === "storm" ? Math.max(1.2, cl.rain) : v === "rain" ? Math.max(0.4, cl.rain) : 0,
      snow: v === "snow" ? Math.max(0.45, cl.snow) : 0,
      wind: v === "storm" ? Math.max(0.8, cl.wind) : v === "wind" ? Math.max(0.75, cl.wind) : cl.wind };
  }
  function costumeFor(cl, v) { return v === "fog" ? (cl.cold ? "snow" : "night") : v === "clear" || v === "wind" ? (cl.cold ? "snow" : v === "wind" ? "wind" : cl.dark ? "night" : "clear") : v; }
  var DRESS = { rain: "his raincoat", storm: "his storm jacket", snow: "his winter coat", wind: "his windbreaker", night: "his hoodie", clear: "his cap" };
  function noteFor(cl, v) {
    if (!cl.known) return "A little walk, in your " + { sunrise: "morning", morning: "morning", midday: "afternoon", afternoon: "afternoon", sunset: "evening", evening: "evening", night: "night", latenight: "night" }[cl.phase] + "…";
    var said = { storm: cl.sub === "hail" ? "There’s a hailstorm near you" : "There’s a storm near you", snow: cl.sub === "blizzard" ? "There’s a blizzard near you" : "It’s snowing near you",
      rain: cl.sub === "drizzle" ? "It’s drizzling near you" : cl.sub === "heavy" ? "It’s pouring near you" : "It’s raining near you", fog: "It’s foggy near you", wind: "It’s windy near you",
      clear: cl.heat ? "It’s hot near you" : cl.cold ? "It’s cold near you" : cl.sub === "overcast" ? (cl.dark ? "It’s a cloudy night near you" : "It’s cloudy near you") : cl.sub === "partly" ? (cl.dark ? "It’s a partly cloudy night near you" : "It’s partly cloudy near you") : cl.dark ? "It’s a clear night near you" : "It’s clear near you" }[v === cl.kind ? v : cl.kind];
    var deg = cl.temp == null ? "" : ", " + Math.round(UNIT_F ? cl.temp * 9 / 5 + 32 : cl.temp) + (UNIT_F ? "°F" : "°C");
    return said + deg + (costumeFor(cl, v) === COSTUME ? ", so Sunny wore " + DRESS[COSTUME] : "") + ".";
  }
  /* ---- the environment while the film plays: what is on screen now, and where it is easing to ---- */
  var ENV = { cur: null, from: null, to: null, t0: 0, dur: 6 };
  function applyEnv(e) {
    var P = e.P;
    for (var k in P) setVar(k, P[k]);
    R.grade.style.background = P.grade; R.vig.style.opacity = P.vig; R.mist.style.opacity = P.mist;
    R.sun.style.left = e.sun[0].toFixed(0) + "px"; R.sun.style.top = e.sun[1].toFixed(0) + "px";
    setVar("wsgn", e.wx > 0.1 ? -1 : 1); setVar("heat", e.heat.toFixed(2));
    story.classList.toggle("is-windy", e.wind > 0.6); story.classList.toggle("is-heat", e.heat > 0.5);
  }
  function envTo(e) { ENV.from = ENV.cur; ENV.to = e; ENV.t0 = clock; ENV.dur = reduced ? 0.01 : 6; }
  function envTick() {
    if (!ENV.to) return;
    var u = Math.min(1, (clock - ENV.t0) / ENV.dur), k = u * u * (3 - 2 * u), a = ENV.from, b = ENV.to, e = { P: {} };
    for (var p in b.P) e.P[p] = mix(a.P[p], b.P[p], k);
    ["rain", "snow", "wind", "wx", "heat"].forEach(function (q) { e[q] = a[q] + (b[q] - a[q]) * k; });
    e.sun = [a.sun[0] + (b.sun[0] - a.sun[0]) * k, a.sun[1] + (b.sun[1] - a.sun[1]) * k];
    ENV.cur = e; applyEnv(e);
    if (u >= 1) { ENV.cur = b; ENV.to = null; }
  }
  /* a fresh reading during the film: only what fits the story already on screen */
  function fits(v, k) { return k === v || (v === "clear" && k === "wind") || (v === "wind" && k === "clear"); }
  function liveUpdate(rec, why) {
    WX.rec = rec; WX.fetchedAt = Date.now(); WX.src = rec.src || WX.src;
    if (!started || !SCENE) return; /* not on screen yet: the scene will be built from it */
    var cl = climateOf(rec, phaseNow());
    WX.last = { why: why, at: +tau.toFixed(2), kind: cl.kind, sub: cl.sub, applied: false };
    if (!SCENE.known ? cl.kind !== "clear" : !fits(SCENE.name, cl.kind)) { WX.pending = cl; return; } /* kept for the next visit */
    SCENE.cl = cl; SCENE.known = true; WX.last.applied = true; WX.pending = null;
    envTo(envFrom(cl, SCENE.name)); R.line.textContent = noteFor(cl, SCENE.name);
  }
  /* the place's clock moves on: sunset can come during the film, gently */
  function phaseTick() {
    if (!SCENE) return;
    var ph = phaseNow(); if (ph === SCENE.cl.phase) return;
    var cl = {}; for (var k in SCENE.cl) cl[k] = SCENE.cl[k];
    cl.phase = ph; cl.dark = ph === "evening" || ph === "night" || ph === "latenight"; if (cl.dark) cl.heat = false;
    SCENE.cl = cl; envTo(envFrom(cl, SCENE.name));
  }
  /* weather picks the climate, the place's time picks the light; both are settled here, once, before anything shows */
  function pickScene() {
    var cl = climateOf(WX.rec, phaseNow()), v = cl.kind;
    COSTUME = costumeFor(cl, v);
    var env = envFrom(cl, v);
    SCENE = { name: v, cl: cl, P: env.P, known: cl.known, night: cl.dark, note: noteFor(cl, v), moon: [1040, 385] };
    ENV.cur = env; ENV.from = ENV.to = null;
    ST = buildStory(v, cl.dark, { heat: cl.heat, cold: cl.cold, windRight: cl.wx > 0.1, stars: cl.dark && cl.cloud < 0.6 && (v === "clear" || v === "wind") });
    KEY_T = ST.KEY;
    CAMX = ST.CAM.map(function (c) { return [c[0], c[1]]; }); CAMY = ST.CAM.map(function (c) { return [c[0], c[2]]; }); CAMZ = ST.CAM.map(function (c) { return [c[0], c[3]]; });
  }
  /* dress the set once: the world, the note at the bottom, the words for screen readers */
  function applyScene() {
    var cl = SCENE.cl;
    applyEnv(ENV.cur);
    R.moon.style.left = SCENE.moon[0] + "px"; R.moon.style.top = SCENE.moon[1] + "px";
    R.line.textContent = SCENE.note;
    R.sub.textContent = SCENE.name === "clear" && !SCENE.night ? "Nobody should have to play alone." : "Nobody should be left out in the " + (SCENE.night ? "dark." : SCENE.name === "clear" ? "sun." : SCENE.name + ".");
    story.classList.toggle("is-fog", SCENE.name === "fog");
    var where = !cl.known ? "in the park" : SCENE.name !== "clear" ? ST.label : cl.heat ? "on a hot day in the park" : cl.dark ? (cl.cloud > 0.6 ? "on a cloudy night in the park" : "on a quiet night in the park") : cl.sub === "overcast" ? "on a grey day in the park" : cl.cold ? "on a cold day in the park" : "on a bright day in the park"; /* never claims weather it does not know */
    story.setAttribute("aria-label", "A short animated story, The Lonely Pup, " + where + ". Puppy is left behind by three pups and sits alone. Sunny notices him, comes part of the way and waits; " + ST.offer + ". Puppy slowly trusts him, they play, and they end the day side by side. Press Escape to skip.");
    if (ST.FLIES.length > 1) { var h = ""; for (var i = 0; i < 14; i++) h += '<i style="left:' + (ST.S - 520 + (i * 137) % 640) + "px;top:" + (560 + (i * 71) % 190) + "px;animation-delay:-" + (i * 0.83).toFixed(2) + "s,-" + (i * 0.37).toFixed(2) + 's"></i>'; R.flies.innerHTML = h; }
  }
  /* ---- where, and the reading: one request chain, shared by the first answer and every refresh ---- */
  function fetchJSON(url, ms) {
    var ctl = win.AbortController ? new AbortController() : null, t = ctl ? setTimeout(function () { ctl.abort(); }, ms) : 0;
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error("http " + r.status); return r.json(); }, function (e) { clearTimeout(t); throw e; });
  }
  function browserPlace() {
    return new Promise(function (ok, no) {
      var force = qs.get("loc");
      if (force) { if (force === "timeout") { setTimeout(function () { no("timeout"); }, 1500); return; } return no(force === "prompt" ? "not asked" : force); }
      if (!navigator.geolocation || !navigator.permissions || !navigator.permissions.query) return no("unsupported");
      navigator.permissions.query({ name: "geolocation" }).then(function (st) {
        if (st.state !== "granted") return no(st.state === "denied" ? "denied" : "not asked");
        var over = false, timer = setTimeout(function () { if (!over) { over = true; no("timeout"); } }, 1500);
        navigator.geolocation.getCurrentPosition(function (p) { if (over) return; over = true; clearTimeout(timer); ok({ lat: p.coords.latitude, lon: p.coords.longitude, src: "location" }); },
          function (err) { if (over) return; over = true; clearTimeout(timer); no(err && err.code === 1 ? "denied" : err && err.code === 3 ? "timeout" : "unavailable"); },
          { timeout: 1500, maximumAge: 30 * 60000 });
      }, function () { no("unsupported"); });
    });
  }
  function zonePlace() {
    try { var c = JSON.parse(localStorage.getItem("sunny:loc") || "null"); if (c && c.v === 2 && Date.now() - c.t < 86400000) return Promise.resolve({ lat: c.lat, lon: c.lon, src: "zone" }); } catch (e) { /* ignore */ }
    var zone = ""; try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { /* ignore */ }
    /* browsers still report some zones by their old names (Asia/Calcutta); search for the city's name today */
    var OLD = { Calcutta: "Kolkata", Saigon: "Ho Chi Minh City", Katmandu: "Kathmandu", Rangoon: "Yangon", Kiev: "Kyiv", Ulan_Bator: "Ulaanbaatar", Godthab: "Nuuk", Thimbu: "Thimphu", Dacca: "Dhaka", Ujung_Pandang: "Makassar", Ashkhabad: "Ashgabat", Macao: "Macau", Chungking: "Chongqing", Harbin: "Harbin", Kashgar: "Kashgar", Asmera: "Asmara", Faeroe: "Torshavn", Buenos_Aires: "Buenos Aires" };
    var last = zone.split("/").pop(), city = (OLD[last] || last).replace(/_/g, " ");
    if (!city || /^(UTC|GMT|Etc)/i.test(zone)) return Promise.reject(new Error("no time-zone city"));
    /* a place counts only if its clock reads like this device's: a "Calcutta" in South Africa does not */
    function sameClock(tz) { try { var o = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, d = new Date(); return d.toLocaleTimeString("en-GB", Object.assign({ timeZone: tz }, o)) === d.toLocaleTimeString("en-GB", o); } catch (e) { return false; } }
    return fetchJSON("https://geocoding-api.open-meteo.com/v1/search?count=10&name=" + encodeURIComponent(city), 3000).then(function (g) {
      var hit = (g && g.results || []).filter(function (r) { return r.timezone === zone || sameClock(r.timezone); })[0]; if (!hit) throw new Error("no place for the time zone");
      var L = { lat: Math.round(hit.latitude * 100) / 100, lon: Math.round(hit.longitude * 100) / 100, src: "zone" };
      try { localStorage.setItem("sunny:loc", JSON.stringify({ v: 2, t: Date.now(), lat: L.lat, lon: L.lon })); } catch (e) { /* ignore */ }
      return L;
    });
  }
  function locate() {
    var la = parseFloat(qs.get("lat")), lo = parseFloat(qs.get("lon"));
    if (isFinite(la) && isFinite(lo)) { WX.loc = "test place"; return Promise.resolve({ lat: la, lon: lo, src: "test place" }); }
    return browserPlace().then(function (L) { WX.loc = "granted"; return L; }, function (why) { WX.loc = String(why); return zonePlace(); });
  }
  function forecast(L) {
    if (qs.get("api") === "fail") return Promise.reject(new Error("weather service failed (test)"));
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + L.lat.toFixed(2) + "&longitude=" + L.lon.toFixed(2) +
      "&current=weather_code,temperature_2m,apparent_temperature,cloud_cover,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&daily=sunrise,sunset&forecast_days=1&timezone=auto";
    return fetchJSON(url, 4000).then(function (j) { if (j && j.error) throw new Error(j.reason || "weather service error"); return readRec(j, L.src); });
  }
  var inflight = null;
  function getWeather() {
    if (inflight) return inflight;
    inflight = locate().then(forecast).then(function (rec) {
      inflight = null; WX.err = null;
      if (rec.src !== "test place") try { localStorage.setItem("sunny:wx", JSON.stringify({ v: 2, t: Date.now(), rec: rec })); } catch (e) { /* ignore */ }
      return rec;
    }, function (e) { inflight = null; WX.err = String((e && e.message) || e); throw e; });
    return inflight;
  }
  function refresh(why) { getWeather().then(function (rec) { liveUpdate(rec, why); }, function () { WX.last = { why: why, error: WX.err }; }); }
  /* the first answer: overrides for checking, then a cache, then the network; never waits more than 2.4 s */
  function resolveWeather() {
    var ow = qs.get("weather");
    function done(rec, src) { if (WX.done) return; WX.rec = rec; WX.src = src; WX.done = true; }
    if (ow) { var s = ow === "offline" ? null : synth(ow); if (!s) WX.err = ow === "offline" ? "offline (test)" : "unknown test weather"; return done(s, s ? "override" : "time"); }
    var c = null; try { c = JSON.parse(localStorage.getItem("sunny:wx") || "null"); } catch (e) { /* ignore */ }
    if (c && c.v === 2 && c.rec && !(qs.has("lat") && qs.has("lon"))) { /* a test place always asks the service */
      var age = Date.now() - c.t; if (qs.has("stale")) age = Math.max(age, FRESH + 1);
      if (age < FRESH) { WX.fetchedAt = c.t; return done(c.rec, "cache"); }
      if (age < STALE_MAX) { WX.fetchedAt = c.t; done(c.rec, "cache, refreshing"); return refresh("stale cache"); }
    }
    if (!win.fetch || navigator.onLine === false) { WX.err = "offline"; return done(null, "time"); }
    getWeather().then(function (rec) { if (!WX.done) { WX.fetchedAt = Date.now(); done(rec, rec.src); } else liveUpdate(rec, "late answer"); }, function () { done(null, "time"); });
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
  function dogSVG(o) {
    /* side view, facing left: far legs, tail, body, near legs, then neck and head on top */
    var K = "#100B0E", S = ' stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
    function frontLeg(x, fill, cls) {
      var upper = '<path d="M' + (x - 10) + ' 132 C' + (x - 11) + ' 150, ' + (x - 9) + ' 166, ' + (x - 8) + ' 174 C' + (x - 7) + ' 181, ' + (x + 7) + ' 181, ' + (x + 8) + ' 174 C' + (x + 9) + ' 164, ' + (x + 11) + ' 148, ' + (x + 10) + ' 132 Z" fill="' + fill + '"' + S + '/>';
      var lower = '<g class="dg-shin--f"><path d="M' + (x - 7) + ' 170 L' + (x + 7) + ' 170 C' + (x + 7) + ' 186, ' + (x + 6) + ' 196, ' + (x + 6) + ' 202 C' + (x + 6) + ' 208, ' + (x + 2) + ' 210, ' + (x - 4) + ' 210 L' + (x - 13) + ' 210 C' + (x - 18) + ' 210, ' + (x - 18) + ' 205, ' + (x - 12) + ' 203 L' + (x - 6) + ' 201 C' + (x - 6) + ' 192, ' + (x - 7) + ' 182, ' + (x - 7) + ' 170 Z" fill="' + fill + '"' + S + '/>' +
        '<path d="M' + (x - 12) + ' 210 v-3 M' + (x - 7) + ' 210 v-3" stroke="' + K + '" stroke-width="1.4"/></g>';
      return '<g class="dg-leg ' + cls + '">' + lower + upper + '</g>';
    }
    function backLeg(x, fill, cls) {
      var thigh = '<path d="M' + (x - 16) + ' 112 C' + (x + 8) + ' 106, ' + (x + 24) + ' 120, ' + (x + 20) + ' 142 C' + (x + 17) + ' 158, ' + (x + 10) + ' 168, ' + (x + 9) + ' 174 C' + (x + 8) + ' 181, ' + (x - 5) + ' 181, ' + (x - 5) + ' 174 C' + (x - 7) + ' 160, ' + (x - 18) + ' 146, ' + (x - 16) + ' 112 Z" fill="' + fill + '"' + S + '/>';
      var lower = '<g class="dg-shin--b"><path d="M' + (x - 4) + ' 170 L' + (x + 8) + ' 170 C' + (x + 7) + ' 184, ' + (x + 3) + ' 194, ' + (x + 3) + ' 202 C' + (x + 3) + ' 208, ' + (x - 1) + ' 210, ' + (x - 6) + ' 210 L' + (x - 15) + ' 210 C' + (x - 20) + ' 210, ' + (x - 20) + ' 205, ' + (x - 14) + ' 203 L' + (x - 8) + ' 201 C' + (x - 7) + ' 192, ' + (x - 5) + ' 182, ' + (x - 4) + ' 170 Z" fill="' + fill + '"' + S + '/></g>';
      return '<g class="dg-leg ' + cls + '">' + lower + thigh + '</g>';
    }
    var ear = o.ear === "flop"
      ? '<path class="dg-ear" d="M66 46 C80 40, 92 46, 94 58 C96 72, 90 84, 84 88 C80 76, 74 64, 62 56 Z" fill="' + o.dark + '"' + S + '/>'
      : '<g class="dg-ear"><path d="M64 46 L70 14 L88 42 Z" fill="' + o.base + '"' + S + '/><path d="M70 40 L72 24 L82 40 Z" fill="' + o.dark + '" opacity="0.7"/></g>';
    var farEar = o.ear === "flop" ? "" : '<path class="dg-ear" d="M78 44 L90 18 L98 46 Z" fill="' + o.dark + '"' + S + '/>';
    var saddle = o.saddle ? '<path d="M128 94 C158 86, 192 88, 214 98 C216 110, 202 114, 182 110 C160 106, 140 108, 126 106 Z" fill="' + o.dark + '"/>' : "";
    var scruff = o.scruff ? '<path class="dg-scruff" d="M92 98 L96 86 L102 96 L108 84 L112 96 L118 88 L120 100 Z" fill="' + o.base + '"' + S + '/>' : "";
    return '<svg class="sst-over" viewBox="0 0 260 220" style="top:auto;bottom:0;height:100%" aria-hidden="true">' +
      frontLeg(124, o.dark, "dg-leg--ff") + backLeg(198, o.dark, "dg-leg--bf") +
      '<g class="dg-upper">' +
        '<g class="dg-tail"><path d="M222 100 C238 94, 250 82, 254 66 C256 58, 249 57, 247 64 C244 78, 234 88, 220 92 Z" fill="' + o.base + '"' + S + '/>' + (o.scruff ? '<path d="M250 70 l6 -10 l-1 9 l6 -3 l-6 8 z" fill="' + o.light + '"/>' : "") + '</g>' +
        '<path d="M100 98 C120 86, 178 86, 210 92 C234 96, 240 120, 228 140 C220 152, 204 150, 190 146 C172 142, 152 150, 134 162 C118 170, 98 164, 92 148 C86 128, 88 106, 100 98 Z" fill="' + o.base + '"' + S + '/>' +
        saddle +
        '<path d="M134 160 C152 150, 172 143, 190 146 C178 152, 156 158, 140 166 Z" fill="' + o.light + '" opacity="0.85"/>' +
        '<path d="M96 116 C92 132, 96 152, 108 162 C102 150, 100 134, 104 118 Z" fill="' + o.light + '"/>' +
        '<path d="M112 100 C150 92, 190 92, 212 98" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.12"/>' +
      '</g>' +
      frontLeg(113, o.base, "dg-leg--fn") + backLeg(208, o.base, "dg-leg--bn") +
      '<g class="dg-upper">' + scruff +
        '<g class="dg-head">' +
          '<path d="M122 108 C112 90, 100 76, 86 64 L66 84 C78 98, 88 116, 98 130 Z" fill="' + o.base + '"/>' +
          '<path d="M118 100 C110 86, 100 74, 88 64 M70 86 C80 100, 88 114, 96 126" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/>' + farEar +
          '<path d="M62 44 C82 38, 98 50, 96 68 C94 84, 82 92, 68 90 L40 90 C26 90, 16 86, 14 78 C12 70, 22 66, 36 64 C44 52, 52 46, 62 44 Z" fill="' + o.base + '"' + S + '/>' +
          '<path d="M40 66 C30 66, 18 70, 15 77 C16 84, 26 88, 40 89 C48 82, 48 72, 40 66 Z" fill="' + o.light + '"/>' +
          '<g class="dg-jaw"><path d="M20 86 C30 92, 44 94, 58 90" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/></g>' +
          '<path class="dg-teeth" d="M24 86 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4" fill="#fff" stroke="' + K + '" stroke-width="1" stroke-linejoin="round"/>' +
          '<ellipse cx="15" cy="74" rx="6.5" ry="5.4" fill="#1b1412"/><ellipse cx="13" cy="72" rx="2" ry="1.3" fill="#fff" opacity="0.45"/>' +
          '<path d="M30 70 Q40 66 52 66" fill="none" stroke="' + K + '" stroke-width="1.2" opacity="0.35"/>' + ear +
          '<g class="dg-eye"><ellipse cx="58" cy="62" rx="4.6" ry="5.2" fill="#1b1412"/><circle cx="56.6" cy="60.2" r="1.6" fill="#fff"/></g>' +
          '<path class="dg-brow dg-brow--m" d="M48 55 L66 51" fill="none" stroke="' + K + '" stroke-width="2.3" stroke-linecap="round"/>' +
          '<path class="dg-brow dg-brow--u" d="M49 52 Q57 47 66 50" fill="none" stroke="' + K + '" stroke-width="2.3" stroke-linecap="round"/>' +
        '</g>' +
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
    var sunny = makeActor("sst-sunny", SUN_SIZE, '<div class="sunny is-in"><div class="sunny__char">' + uniq(win.Sunny.art()) + "</div></div>",
      '<svg class="sst-over" viewBox="0 0 220 220" aria-hidden="true"><g class="sst-umb" transform="translate(184 140)">' + umbrella() + "</g></svg>");
    var pup = makeActor("sst-pup", PUP_SIZE, '<div class="puppy is-in"><div class="puppy__char">' + uniq(win.Puppy.art()) + "</div></div>",
      '<svg class="sst-over" viewBox="0 0 220 220" aria-hidden="true">' +
      '<g class="sst-scarf-w"><path d="M84 116Q128 133 178 117L180 127Q128 144 82 126Z" fill="#de364d" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><path d="M146 128q6 16 -1 30l11 2q6 -16 -1 -31z" fill="#de364d" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><circle cx="150" cy="130" r="5.5" fill="#c92a42" stroke="#111" stroke-width="2"/></g>' +
      '<g class="sst-wet"><path d="M112 60q8 -8 18 -6M150 70q6 -6 14 -4M100 150q6 -4 12 -2" fill="none" stroke="#dfe7f5" stroke-width="2.2" stroke-linecap="round" opacity="0.5"/>' +
      '<g fill="#a9c3ec"><path class="sst-drip" d="M128 126c-2.4 3.4 -2.4 5.4 0 5.4c2.4 0 2.4 -2 0 -5.4z"/><path class="sst-drip" d="M96 98c-2 3 -2 4.8 0 4.8c2 0 2 -1.8 0 -4.8z"/><path class="sst-drip" d="M170 112c-2 3 -2 4.8 0 4.8c2 0 2 -1.8 0 -4.8z"/></g></g></svg>');
    function cshadow() { var e = doc.createElement("div"); e.className = "sst-cshadow"; actorsEl.insertBefore(e, actorsEl.firstChild); return e; }
    /* the three pups: the street dogs of the old film, drawn friendly (soft brows, no teeth, tails up) */
    var dogs = ST.dogs.map(function (d) {
      var a = makeActor("sst-dog", 250 * d.scale, dogSVG(d)); a.h = 212 * d.scale; a.el.style.height = a.h + "px"; a.el.style.zIndex = 1; a.d = d; a.shadow = cshadow(); return a;
    });
    /* the story's own small things */
    var props = ST.props.map(function (p) {
      var e = doc.createElement("div"); e.className = "sst-prop " + (p.cls || ""); e.style.width = p.w + "px"; e.style.height = p.h + "px"; e.style.margin = -p.h / 2 + "px 0 0 " + -p.w / 2 + "px"; e.innerHTML = p.svg;
      if (p.sky) world.insertBefore(e, R.street.nextSibling); else { actorsEl.appendChild(e); e.style.zIndex = p.z || 6; }
      return { el: e, p: p, last: "" };
    });
    var SPARK = '<svg viewBox="0 0 34 34" width="34" height="34"><path d="M17 2L20 14L32 17L20 20L17 32L14 20L2 17L14 14Z" fill="#FFC93C" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    var sparks = ST.SPARKS.map(function (s) { var e = doc.createElement("div"); e.className = "sst-spark"; e.innerHTML = SPARK; e.style.left = s[1] + "px"; e.style.top = s[2] + "px"; e.style.zIndex = 20; actorsEl.appendChild(e); return { t: s[0], el: e, on: false }; });
    var pupShadow = cshadow(), sunShadow = cshadow();
    pup.el.style.zIndex = 2; sunny.el.style.zIndex = 3;
    return { pupShadow: pupShadow, sunShadow: sunShadow, sunny: sunny, pup: pup, dogs: dogs, props: props, sparks: sparks,
      sunnyRoot: sunny.el.querySelector(".sunny"), sunnyLook: sunny.el.querySelector(".s-look"), pupRoot: pup.el.querySelector(".puppy"), pupLooks: pup.el.querySelectorAll(".p-look"),
      umbTilt: sunny.el.querySelector(".u-tilt"), umbCan: sunny.el.querySelector(".u-can"), umbG: sunny.el.querySelector(".sst-umb") };
  }

  /* ===================================================================== render */
  var cssCache = {};
  function setVar(k, v) { if (cssCache[k] !== v) { cssCache[k] = v; story.style.setProperty("--" + k, v); } }
  function setCls(el, cls, on) { if (el.classList.contains(cls) !== !!on) el.classList.toggle(cls, !!on); }
  function setAttr(el, k, v) { if (v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); } else if (el.hasAttribute(k)) el.removeAttribute(k); }
  /* a character on the ground line. Below zero (a crouch before a jump, a landing) is a squash, not a sink */
  function place(a, x, footFrac, dy, op) {
    var h = a.h || a.size, up = Math.min(0, dy || 0), sq = Math.max(0, dy || 0);
    var tf = "translate3d(" + (x - a.size / 2).toFixed(1) + "px," + (GY - h + h * footFrac + up).toFixed(1) + "px,0)";
    if (a.last.tf !== tf) { a.last.tf = tf; a.el.style.transform = tf; }
    var sc = sq > 0.05 ? (1 + sq * 0.016).toFixed(3) + " " + (1 - sq * 0.03).toFixed(3) : up < -8 ? "0.985 1.025" : "1";
    if (a.last.sc !== sc) { a.last.sc = sc; a.el.style.scale = sc; }
    var o = op == null ? 1 : +op.toFixed(2);
    if (a.last.op !== o) { a.last.op = o; a.el.style.opacity = o; a.el.style.visibility = o <= 0.01 ? "hidden" : "visible"; }
  }
  /* a soft contact shadow on the ground under a character; it shrinks and fades as the character leaves the ground */
  function shadowAt(el, x, lift, sc, op) {
    if (!el) return;
    var k = Math.max(0.45, 1 + Math.min(0, lift) / 160), tf = "translate3d(" + x.toFixed(1) + "px," + (GY + 2) + "px,0) scale(" + (sc * k).toFixed(2) + ",1)";
    if (el._tf !== tf) { el._tf = tf; el.style.transform = tf; }
    var o = (k * (op == null ? 1 : op)).toFixed(2); if (el._op !== o) { el._op = o; el.style.opacity = o; }
  }
  function lookAt(el, dx, dy, flipped, kx, ky, many) {
    var v = "translate(" + ((flipped ? -1 : 1) * dx * kx).toFixed(1) + "px," + (dy * ky).toFixed(1) + "px)";
    if (many) { for (var i = 0; i < el.length; i++) if (el[i].style.transform !== v) el[i].style.transform = v; } else if (el && el.style.transform !== v) el.style.transform = v;
  }
  function sceneOf(t) { for (var i = BANDS_T.length - 2; i >= 0; i--) if (t >= BANDS_T[i]) return i; return 0; }
  /* ---- the pup's gait: bob, lean, sway and squash follow the distance actually covered, so the walk speeds up and
     slows down with the movement, eases in and out, and each footfall can be heard. Mood changes the walk: a sad
     pup barely bounces, an excited one bounds ---- */
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
    var a = G.amt, s = Math.sin(G.phase), mood = Q.low ? 0.45 : Q.emo === "excited" || Q.emo === "happy" ? 1.25 : 1;
    var bob = -Math.abs(s) * (Q.creep ? 1.4 : 2 + 4.5 * a) * a * mood;
    var lean = (Q.creep ? 4 : 2.5 + 1.5 * a) * a;
    var sway = Math.sin(G.phase) * 1.8 * a;
    var sq = Math.cos(G.phase * 2) * 0.03 * a * mood;
    var low = Q.creep ? 0.05 : Q.low ? 0.03 : 0;
    pose.style.translate = "0 " + (bob + (Q.creep ? 3 : Q.low ? 2 : 0)).toFixed(2) + "px";
    pose.style.rotate = (lean + sway).toFixed(2) + "deg";
    pose.style.scale = (1 + sq).toFixed(3) + " " + (1 - sq - low).toFixed(3);
    var foot = Math.floor(G.phase / Math.PI);
    if (foot !== G.foot) { G.foot = foot; if (a > 0.3) SND.paw(speed > 230); if (snowNow > 0.3 && a > 0.3) prints.push({ x: px + (foot % 2 ? 5 : -5), a: 1, s: 0.55 }); }
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
  /* rain stops at a roof: the porch, the park bench, the tree, or an umbrella set down on the ground */
  function shelterAt(x, y, t) {
    var L = ST.SHELTERS;
    for (var i = 0; i < L.length; i++) { var s = L[i]; if (x > s[0] && x < s[1] && y >= s[2] && (s[3] == null || (t >= s[3] && t < s[4]))) return s; }
    return null;
  }
  var clock = 0, tauNow = 0, driftX = -0.35, umbRim = null, sunState = { x: 0 }, outdoor = 1, rainNow = 0, windNow = 0.2, snowNow = 0, leafNow = 0, heads = null, reflSet = false, floatAmt = 0, lastRC = 0, sceneNow = -1, NOW = { S: null, Q: null };
  function render(tReal) {
    var t = reduced ? KEY_T[sceneOf(Math.min(tReal, T_END - 0.01))] : tReal;
    tauNow = t;
    var dtc = Math.max(0, Math.min(0.1, clock - lastRC)); lastRC = clock;
    /* the camera holds still for loneliness and moves only with purpose; a little handheld life only while they play */
    var vw = story.clientWidth, vh = story.clientHeight;
    var cx = track(CAMX, t), cy = track(CAMY, t), z = track(CAMZ, t), dr = reduced ? 0 : track(ST.DRIFT, t);
    if (dr > 0) { cx += Math.sin(clock * 0.9) * 7 * dr; cy += Math.sin(clock * 1.3 + 1) * 4 * dr; }
    var fit = Math.min(Math.max(vw / W, vh / H), vw / 760), s = Math.min(fit * z, vw / 460); /* never so close that the pair cannot share a narrow screen */
    var tx = vw / 2 - cx * s, ty = vh / 2 - cy * s;
    if (W * s >= vw) tx = Math.min(0, Math.max(vw - W * s, tx)); else tx = (vw - W * s) / 2;
    if (H * s >= vh) ty = Math.min(0, Math.max(vh - H * s, ty)); else ty = (vh - H * s) * 0.5;
    world.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + s.toFixed(4) + ")";
    R.far.setAttribute("transform", "translate(" + ((cx - 800) * 0.3).toFixed(1) + " 0)");
    R.mid.setAttribute("transform", "translate(" + ((cx - 800) * 0.12).toFixed(1) + " 0)");
    R.clouds.style.transform = "translateX(" + ((cx - 800) * 0.45).toFixed(1) + "px)";
    R.fore.style.transform = "translate3d(" + (-(cx - 800) * 0.22).toFixed(1) + "px,0,0)";
    R.fore.style.opacity = Math.max(0, Math.min(1, (1.6 - z) / 0.4)).toFixed(2); /* the foreground frames the wide shots only */
    /* the world as it is now: the real weather, eased when a fresher reading or the next part of the day arrives */
    envTick();
    var E = ENV.cur; rainNow = E.rain; snowNow = E.snow; windNow = Math.min(1.3, E.wind + track(ST.WINDT, t)); driftX = E.wx;
    leafNow = Math.max(track(ST.LEAF, t), E.wind > 0.55 ? (E.wind - 0.55) * 2 : 0); /* a real gale brings leaves into any story */
    R.flash.style.opacity = reduced ? 0 : track(ST.FLASH, tReal);
    R.flies.style.opacity = track(ST.FLIES, t);
    /* the scene, for screen readers: one short line each time a new one begins */
    var sc = sceneOf(t);
    if (sc !== sceneNow) { sceneNow = sc; R.sr.textContent = "Scene " + (sc + 1) + " of 12, " + SCENES[sc][0] + ". " + SCENES[sc][2]; }
    if (!A) return;
    var S = snapAt(ST.SS, t), sx = track(ST.SX, t), sy = track(ST.SY, t);
    floatAmt += ((S.float && !reduced ? 1 : 0) - floatAmt) * Math.min(1, dtc * 5);
    if (floatAmt > 0.01) sy -= floatAmt * (9 + Math.sin(clock * 3.1) * 4);
    NOW.S = S;
    place(A.sunny, sx, 13 / 220, sy, t >= 27.6 ? 1 : 0); shadowAt(A.sunShadow, sx, sy, 1.3, t >= 27.6 ? 1 : 0);
    setAttr(A.sunnyRoot, "data-emotion", S.emo); setAttr(A.sunnyRoot, "data-act", S.act);
    setCls(A.sunnyRoot, "st-cos-on", true); setCls(A.sunnyRoot, "st-gust", windNow > 0.6);
    var uo = track(ST.UO, t), uv = track(ST.UV, t), ur = track(ST.UR, t);
    setCls(A.sunnyRoot, "st-slow", S.slow); setCls(A.sunnyRoot, "st-hold", S.hold && uv > 0); setCls(A.sunnyRoot, "st-reach", S.reach); setCls(A.sunnyRoot, "st-hug", S.hug); setCls(A.sunnyRoot, "st-mend", S.mend);
    setCls(A.sunny.pose, "st-brace", S.brace); setCls(A.sunny.pose, "st-sit", S.sit); setCls(A.sunny.pose, "st-bend", S.bend); setCls(A.sunny.pose, "st-tremble", S.tremble);
    turned(A.sunny, S.flip); setCls(A.sunny.flip, "is-flipped", S.flip);
    lookAt(A.sunnyLook, (S.look || [0, 0])[0], (S.look || [0, 0])[1], S.flip, 5, 4);
    var sway = reduced ? 0 : Math.sin(clock * 1.3) * 2.4 * (0.4 + windNow);
    A.umbTilt.setAttribute("transform", "rotate(" + (ur + sway + windNow * driftX * 6).toFixed(2) + ")"); /* leans with the wind */
    A.umbCan.setAttribute("transform", "scale(" + uo.toFixed(3) + " 1)");
    A.umbG.style.opacity = uv;
    var Q = snapAt(ST.PS, t), px = track(ST.PX, t), py = track(ST.PY, t);
    NOW.Q = Q;
    place(A.pup, px, 17 / 220, py); shadowAt(A.pupShadow, px + (Q.flip ? 4 : -4), py, 0.85);
    A.pup.el.style.zIndex = Q.front ? 4 : 2;
    /* walking and running are drawn from the real speed in gait(), not from a fixed loop */
    setAttr(A.pupRoot, "data-emotion", Q.emo); setAttr(A.pupRoot, "data-act", Q.act);
    setCls(A.pupRoot, "st-rest", Q.rest);
    setCls(A.pup.el, "is-wet", Q.wet); setCls(A.pup.el, "has-scarf-w", Q.scarf === "w");
    setCls(A.pup.pose, "st-shiver", Q.shiver && !gaitOn()); setCls(A.pup.pose, "st-lean", Q.lean); setCls(A.pup.pose, "st-low", Q.low && !gaitOn()); setCls(A.pup.pose, "st-sigh", Q.sigh);
    gait(A.pup.pose, px, Q);
    turned(A.pup, Q.flip); setCls(A.pup.flip, "is-flipped", Q.flip);
    lookAt(A.pupLooks, (Q.look || [0, 0])[0], (Q.look || [0, 0])[1], Q.flip, 22, 16, true);
    /* the three pups */
    for (var d = 0; d < A.dogs.length; d++) {
      var dg = A.dogs[d], D = states(dg.d.S, t), dx = track(dg.d.X, t), dy = track(dg.d.Y, t), dop = Math.max(0, Math.min(1, (2060 - dx) / 200));
      place(dg, dx, 8 / 220, dy, dop); shadowAt(dg.shadow, dx + 10 * dg.d.scale * (D.flip ? -1 : 1), dy, dg.size / 120, dop);
      setCls(dg.pose, "st-play", D.play && !D.run); setCls(dg.pose, "st-walk", D.run); setCls(dg.pose, "st-run", D.run);
      turned(dg, D.flip); setCls(dg.flip, "is-flipped", D.flip);
    }
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
    function covered(x, y) { return shelterAt(x, y, t) || (umbRim && x > Math.min(umbRim[0][0], umbRim[1][0]) - 6 && x < Math.max(umbRim[0][0], umbRim[1][0]) + 6); }
    heads = [];
    if (t >= 27.6 && !covered(sx, GY - 150)) heads.push([sx, GY - 150 + sy, 38]);
    if (!covered(px, GY - 98)) heads.push([px + (Q.flip ? -6 : 6), GY - 98 + py, 20]);
    var ctx = { sx: sx, sy: sy, sf: S.flip, px: px, py: py, pf: Q.flip };
    for (var i = 0; i < A.props.length; i++) {
      var pr = A.props[i], p = pr.p, xy = p.at ? p.at(t, ctx) : [track(p.X, t), track(p.Y, t)], x = xy[0], y = xy[1], o = track(p.OP, t), w = p.WOB ? track(p.WOB, t) : (p.wob ? 1 : 0), rot = p.rot || 0;
      if (p.push && t >= p.push[0] && t < p.push[1]) x = Math.min(x, px - p.push[2]); /* nudged along by a nose */
      if (p.zAt) { var zz = String(t >= p.zAt[0] ? p.zAt[1] : p.z || 6); if (pr.el.style.zIndex !== zz) pr.el.style.zIndex = zz; }
      if (p.wob && w > 0 && !reduced) { x += Math.sin(clock * p.wob[2]) * p.wob[0] * w; y += Math.sin(clock * p.wob[2] * 1.7 + 1) * p.wob[1] * w; }
      if (p.R) rot += track(p.R, t);
      if (p.spin) rot += reduced ? 20 : (w > 0 ? (clock * p.spin) % 360 : 12);
      var key = x.toFixed(1) + "|" + y.toFixed(1) + "|" + rot.toFixed(1) + "|" + o.toFixed(2) + "|" + (w > 0 ? 1 : 0);
      if (pr.last !== key) { pr.last = key; pr.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + rot.toFixed(1) + "deg)"; pr.el.style.opacity = o.toFixed(2); pr.el.style.visibility = o <= 0.01 ? "hidden" : "visible"; setCls(pr.el, "is-rest", w <= 0); }
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
  function leafSign() { return driftX > 0.1 ? 1 : -1; }
  function newLeaf(scatter) { return { x: scatter ? Math.random() * W : leafSign() > 0 ? -60 - Math.random() * 400 : W + Math.random() * 400, y: leafY(), v: 260 + Math.random() * 260, rot: Math.random() * 6, sp: 3 + Math.random() * 6, c: LEAF_C[(Math.random() * 4) | 0] }; }
  /* the weather is already there on the first frame: the air starts full of it */
  function prefill() {
    drops.length = 0; fx.length = 0; flakes.length = 0; leaves.length = 0;
    var i, n = Math.round(300 * ENV.cur.rain); for (i = 0; i < n; i++) drops.push(newDrop(true));
    n = Math.round(200 * ENV.cur.snow); for (i = 0; i < n; i++) flakes.push(newFlake(true));
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
    var slant = -(windNow * 0.55 * driftX) + Math.sin(clock * 0.35) * 0.03; /* drops lean the way the wind really blows */
    for (var i = drops.length - 1; i >= 0; i--) {
      var p = drops[i];
      p.y += p.v * dt; p.x -= p.v * dt * slant;
      var roof = p.y < GY + 10 && shelterAt(p.x, p.y, tauNow);
      if (roof) { if (dt) { if (p.y < roof[2] + 40 && Math.random() < 0.5) splash(p.x, roof[2], 0); drops[i] = newDrop(false); } continue; } /* a roof keeps the rain off */
      if (p.y >= p.floor) { if (Math.random() < (p.near ? 0.8 : 0.35)) splash(p.x, p.floor, p.near); if (drops.length > want) { drops.splice(i, 1); continue; } drops[i] = newDrop(false); continue; }
      var fine = rainNow < 0.6 ? 0.55 : 1; /* drizzle is finer and shorter */
      g2.strokeStyle = "rgba(205,220,245," + p.a + ")"; g2.lineWidth = p.w * fine;
      g2.beginPath(); g2.moveTo(p.x, p.y); g2.lineTo(p.x + p.l * fine * slant, p.y - p.l * fine); g2.stroke();
    }
    dripT -= dt;
    if (dt && umbRim && rainNow > 0.1 && dripT <= 0) { dripT = 0.09 + Math.random() * 0.12; var e = umbRim[Math.random() < 0.5 ? 0 : 1]; drips.push({ x: e[0] + (Math.random() * 6 - 3), y: e[1] + 2, v: 60 }); }
    eaveT -= dt;
    if (dt && rainNow > 0.1 && eaveT <= 0) { /* water runs off the edges of every roof */
      eaveT = 0.12 + Math.random() * 0.16;
      var live = ST.SHELTERS.filter(function (s) { return s[3] == null || (tauNow >= s[3] && tauNow < s[4]); }), sh = live[(Math.random() * live.length) | 0];
      if (sh) drips.push({ x: Math.random() < 0.5 ? sh[0] + 4 + Math.random() * 10 : sh[1] - 4 - Math.random() * 10, y: sh[2] + 6, v: 40 });
    }
    g2.fillStyle = "rgba(200,218,246,0.7)";
    for (var d = drips.length - 1; d >= 0; d--) {
      var q = drips[d]; q.v += 1600 * dt; q.y += q.v * dt;
      if (q.y >= GY) { splash(q.x, GY, 0, 0.2); drips.splice(d, 1); continue; }
      g2.beginPath(); g2.ellipse(q.x, q.y, 1.3, 3.2, 0, 0, Math.PI * 2); g2.fill();
    }
    /* snow: slow flakes that drift with the wind, and the prints both of them leave */
    var wantF = Math.round(200 * snowNow);
    while (flakes.length < wantF) flakes.push(newFlake(false));
    for (var f2 = flakes.length - 1; f2 >= 0; f2--) {
      var fl = flakes[f2]; fl.y += fl.v * dt; fl.x += (Math.sin(fl.ph + clock * 1.4) * 14 + windNow * 60 * driftX) * dt;
      if (fl.y > GY + 30 + fl.r * 30) { if (flakes.length > wantF) { flakes.splice(f2, 1); continue; } fl.y = -10; fl.x = Math.random() * (W + 200) - 100; }
      g2.fillStyle = "rgba(255,255,255," + (0.5 + fl.r * 0.12).toFixed(2) + ")"; g2.beginPath(); g2.arc(fl.x, fl.y, fl.r, 0, Math.PI * 2); g2.fill();
    }
    if (dt && snowNow > 0.3 && sunState.act === "walk") { printT -= dt; if (printT <= 0) { printT = sunState.slow ? 0.31 : 0.21; prints.push({ x: sunState.x + (prints.length % 2 ? 9 : -9), a: 1, s: 1 }); } }
    while (prints.length > 90) prints.shift();
    for (var pi = 0; pi < prints.length; pi++) { var pr = prints[pi]; g2.fillStyle = "rgba(120,135,160," + (0.35 * pr.a).toFixed(2) + ")"; g2.beginPath(); g2.ellipse(pr.x, GY + 4, 6 * pr.s, 2, 0, 0, Math.PI * 2); g2.fill(); }
    /* wind: leaves carried across the street */
    var wantL = Math.round(14 * leafNow);
    while (leaves.length < wantL) leaves.push(newLeaf(false));
    for (var li2 = leaves.length - 1; li2 >= 0; li2--) {
      var ls = leafSign(), lf = leaves[li2]; lf.x += ls * lf.v * dt * (0.6 + windNow * 0.6); lf.y += Math.sin(clock * 2.2 + lf.rot) * 26 * dt; lf.rot += lf.sp * dt;
      if ((ls < 0 && lf.x < -80) || (ls > 0 && lf.x > W + 80) || lf.y > GY + 30) { if (leaves.length > wantL) { leaves.splice(li2, 1); continue; } lf.x = ls > 0 ? -60 - Math.random() * 200 : W + Math.random() * 200; lf.y = leafY(); }
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
    dogBark: function (at) { SND.bark(at, { f: [380, 560, 300], dur: 0.2, vol: 0.075, rasp: 12, form: [[700, 5, 1], [1500, 7, 0.55], [2700, 8, 0.2]] }); SND.bark((at || 0) + 0.24, { f: [360, 520, 290], dur: 0.17, vol: 0.06, rasp: 12, form: [[680, 5, 1], [1450, 7, 0.5], [2600, 8, 0.2]] }); },
    dogBark2: function (at) { SND.bark(at, { f: [450, 680, 360], dur: 0.16, vol: 0.06, rasp: 9, form: [[820, 5, 1], [1700, 7, 0.55], [3000, 8, 0.2]] }); },
    boing: function (at) { noise(0.05, "bandpass", 700, 1.2, 0.05, at); voice({ at: at, type: "sine", f: [[0, 260], [0.12, 170]], form: [[400, 1, 0.7]], vol: 0.03, dur: 0.14, a: 0.004, r: 0.08 }); },
    pawsRun: function (at) { at = at || 0; for (var i = 0; i < 10; i++) noise(0.05, "bandpass", 900, 0.8, 0.02, at + i * 0.18 + (i % 2) * 0.05); },
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
    beds.pad.gain.setTargetAtTime(0.045 * smooth(41, 47, t) * (1 - 0.4 * smooth(22, 23, t) * (1 - smooth(28, 33, t))), now, 1.2);
    if (t > prevT && t - prevT < 1) ST.CUES.forEach(function (c) { if (c[0] > prevT && c[0] <= t) cue(c[1]); });
    if (umbRim && rainNow > 0.2 && Math.random() < 0.5) SND.drop();
    if (sunState.act === "walk" && clock - lastStep > (sunState.slow ? 0.31 : 0.21)) { lastStep = clock; SND.step(); }
    if (NOW.Q && NOW.Q.act === "sleep" && t > 50 && clock - sleepAt > 3) { sleepAt = clock; SND.sleep(); }
    if (ST.amb && clock - ambAt > 5.2) { ambAt = clock; SND[ST.amb](); }
    if (t >= T_END - 6 && t < T_END - 0.4 && t > prevT && Math.floor(t * 1.25) !== Math.floor(prevT * 1.25)) { var notes = [523, 659, 784, 659, 587, 523, 659, 784]; voice({ type: "triangle", f: [[0, notes[Math.floor(t * 1.25) % notes.length]]], form: [[1800, 0.5, 1]], vol: 0.02, dur: 0.7, a: 0.01, r: 0.6 }); }
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
  if (at != null) { story.classList.add("is-still"); paused = true; win.SunnyStoryAt = function (t) { tau = prevTau = +t; }; }
  /* for checking: where the story is and what each character is doing */
  win.SunnyStory = { state: function () { var sc = sceneOf(tau); return { t: +tau.toFixed(2), scene: sc + 1, title: SCENES[sc][0], climate: SCENE && SCENE.name, night: SCENE && SCENE.night, puppy: NOW.Q && NOW.Q.name, puppyFace: NOW.Q && NOW.Q.emo, sunny: NOW.S && NOW.S.name, sunnyFace: NOW.S && NOW.S.emo, ended: done }; }, scenes: function () { return SCENES.map(function (s, i) { return { n: i + 1, title: s[0], start: AT[i], seconds: s[1] }; }); },
    /* runs the story's own clock forward (for checking when a hidden tab has paused the frames); returns each scene change it passed */
    weather: function () { var c = SCENE && SCENE.cl, e = ENV.cur; return { source: WX.src, location: WX.loc, error: WX.err, ageMinutes: WX.fetchedAt ? +((Date.now() - WX.fetchedAt) / 60000).toFixed(1) : null, reading: WX.rec,
      climate: c && { kind: c.kind, sub: c.sub, phase: c.phase, dark: c.dark, heat: c.heat, cold: c.cold, cloud: +c.cloud.toFixed(2), wind: +c.wind.toFixed(2), blowsRight: c.wx > 0.1, temp: c.temp }, story: SCENE && SCENE.name, costume: COSTUME,
      now: e && { rain: +e.rain.toFixed(2), snow: +e.snow.toFixed(2), wind: +e.wind.toFixed(2), wx: +e.wx.toFixed(2), easing: !!ENV.to }, lastUpdate: WX.last, keptForNextVisit: WX.pending && { kind: WX.pending.kind, sub: WX.pending.sub }, note: R.line.textContent }; },
    fastForward: function (sec) { var seen = [], last = -1; for (var x = 0; x < sec && !done; x += 0.05) { advance(0.05); var sc = sceneOf(tau); if (sc !== last) { last = sc; seen.push(sc + 1); } } try { render(tau); } catch (e) { /* ignore */ } return { scenes: seen, t: +tau.toFixed(2), ended: done }; } }; /* step through stills while checking */
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
        started = true; startLive();
        if (at != null) { tau = +at; prevTau = tau; } else if (from) { tau = Math.max(0, Math.min(T_END - 1, from)); prevTau = tau; }
        try { render(tau); } catch (e2) { return finish(true); }
        story.classList.add("is-ready");
      } else if (waitedFor > 6) return finish(true); /* the characters never arrived: just lift the curtain */
    }
    advance(dt); if (started) liveTest();
    if (started) { try { render(tau); } catch (e3) { return finish(true); } rainStep(paused ? 0 : dt); }
    soundStep(tau, prevTau); prevTau = tau;
    if (A && Math.random() < dt / 3.2 && !A.pupRoot.hasAttribute("data-emotion") && A.pupRoot.getAttribute("data-act") !== "sleep") { A.pupRoot.classList.add("is-blink"); setTimeout(function () { if (A) A.pupRoot.classList.remove("is-blink"); }, 110); }
    if (!done || story.parentNode) rafId = requestAnimationFrame(frame);
  }
  /* while the film plays: the place's clock (every 15 s) and a reading older than 15 minutes (refetched once) */
  var liveTimer = 0, refreshAt = null, refreshTo = null;
  (function () { var r = qs.get("refresh"); if (r) { var p = r.split(":"); refreshAt = +p[0] || 0; refreshTo = p[1] || null; } })();
  function startLive() {
    liveTimer = setInterval(function () {
      phaseTick();
      if (WX.src !== "override" && WX.rec && Date.now() - WX.fetchedAt > FRESH && !inflight) refresh("15 minutes old");
    }, 15000);
  }
  function liveTest() { /* &refresh=SECONDS[:weather]: a reading arriving mid-film, for checking */
    if (refreshAt == null || tau < refreshAt) return;
    refreshAt = null;
    if (refreshTo) { var r = synth(refreshTo); if (r) liveUpdate(r, "test"); } else refresh("test");
  }
  /* the story moves on by real time only: no waiting on anything but the clock */
  function advance(dt) {
    if (!started || paused || done) return;
    var before = tau;
    tau = Math.min(T_END, tau + dt * (reduced ? 2 : 1));
    ST.FX.forEach(function (f) { if (f[0] > before && f[0] <= tau) burst(f[1], f[2], f[3], f[4]); });
    /* the story has been told: the curtain lifts as soon as the page behind it is ready. Until then the last
       scene simply goes on (the same weather, the two of them together), never longer than a few seconds */
    if (tau >= T_END) { held += dt; if (loaded || held > 8) finish(false); }
  }
  function finish(silent) {
    if (done) return; done = true; clearInterval(liveTimer);
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
