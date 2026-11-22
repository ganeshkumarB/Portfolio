/* Sunny loader: on the first page of a visit, Sunny rises asleep in the middle of the
   screen, the sprout springs up, the eyes open with a blink and a blush, and Sunny
   flies to its corner where the real companion takes over. Plays once per session
   (sessionStorage "sunny:loaded"); add ?loader to the address to play it again.

   The scene uses the companion's own SVG (Sunny.art) and face CSS (sunny.css), so the
   two can never drift apart. With the companion switched off in the preferences, or in
   Puppy-only mode, Sunny flies to the bottom-right corner and fades. Under reduced
   motion the loader shows Sunny awake and fades quickly.

   Loaded as the first script in <body>, synchronously, so the overlay is up before the
   page paints. Everything is wrapped in try/catch: a failure removes the overlay. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement;
  var force = /[?&]loader(=|&|$)/.test(location.search);
  try { if (!force && sessionStorage.getItem("sunny:loaded")) return; } catch (e) { /* no storage: play once per load */ }
  try { sessionStorage.setItem("sunny:loaded", "1"); } catch (e) { /* ignore */ }

  function pref(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  /* the stored theme, applied early so the glow is right from the first frame (the page scripts set it again later) */
  var dark = pref("theme") === "dark";
  if (dark) html.setAttribute("data-theme", "dark");
  var reduced = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || pref("pref:motion") === "reduce";

  var SIZE = 260, EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
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
    'html .sl .sunny.sl__sunny { position: relative; right: auto; bottom: auto; width: ' + SIZE + 'px; height: ' + SIZE + 'px; visibility: visible !important; z-index: auto; pointer-events: none; }' +
    '.sl .sunny__char { position: relative; right: auto; bottom: auto; width: ' + SIZE + 'px; height: ' + SIZE + 'px; opacity: 1 !important; transform: none !important; translate: none !important; transition: none !important; cursor: default; }' +
    '.sl .sunny__svg { transform: none !important; }' +
    '.sl .sunny.sl-wake .s-sprout { animation: sl-spring 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 1 !important; }' +
    '.sl .sunny.sl-wake .s-eyes { animation: sl-blink 0.5s ease-in-out 1 0.45s !important; }' +
    '@keyframes sl-spring { 0% { transform: rotate(16deg); } 55% { transform: rotate(-12deg); } 100% { transform: rotate(0); } }' +
    '@keyframes sl-blink { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.08); } }' +
    '@media (prefers-reduced-motion: reduce) { .sl__stage, .sl__stage.is-up, .sl__stage.is-flying { transition: opacity 0.3s ease !important; transform: none !important; } }';

  var style = doc.createElement("style"); style.textContent = css;
  var layer = doc.createElement("div"); layer.className = "sl" + (dark ? " sl--dark" : ""); layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<div class="sl__bg"></div><div class="sl__stage"></div>';
  var stage = layer.lastChild;
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
    var bridge = doc.getElementById("bridge"), r;
    if (bridge && !reduced && window.innerWidth >= 1081 && bridge.getBoundingClientRect().top > 180) {
      var b = bridge.getBoundingClientRect();
      return { left: b.right - 150 - 36, top: b.top - 150 * 0.78, width: 150, height: 150 };
    }
    var w = window.innerWidth < 720 ? 104 : 150;
    return { left: window.innerWidth - 12 - w, top: window.innerHeight - w, width: w, height: w };
  }
  function fly(fade) {
    var r = target(), sx = window.innerWidth / 2, sy = window.innerHeight / 2;
    var tx = r.left + r.width / 2 - sx, ty = r.top + r.height / 2 - sy, k = r.width / SIZE;
    stage.classList.add("is-flying");
    stage.style.transform = "translate(" + tx.toFixed(1) + "px, " + ty.toFixed(1) + "px) scale(" + k.toFixed(3) + ")";
    layer.classList.add("is-leaving");
    stage.classList.add("is-fading"); /* the real Sunny shows through as the stand-in fades, a beat before the curtain lifts */
    if (fade) stage.style.transition = "transform 0.85s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease 0.3s";
    later(finish, 900);
  }

  /* wait for the companion's art (sunny.js) and its stylesheet, then play */
  var started = Date.now();
  function ready() {
    if (!(window.Sunny && typeof window.Sunny.art === "function")) return false;
    var link = doc.querySelector('link[href*="sunny.css"]');
    return !!link && link.media === "all" && !!link.sheet;
  }
  function play() {
    var sunny = doc.createElement("div");
    sunny.className = "sunny sl__sunny is-in" + (dark ? " is-night" : "");
    sunny.innerHTML = '<div class="sunny__char">' + window.Sunny.art() + '</div>';
    if (!reduced) sunny.setAttribute("data-act", "sleep");
    stage.appendChild(sunny);
    var fade = !companionOn();
    if (reduced) {
      stage.classList.add("is-up");
      later(function () { layer.classList.add("is-leaving"); stage.classList.add("is-fading"); later(finish, 500); }, 700);
      return;
    }
    later(function () { stage.classList.add("is-up"); }, 60);                       /* rises, asleep */
    later(function () { sunny.removeAttribute("data-act"); sunny.classList.add("sl-wake"); }, 1350); /* the sprout springs up, the eyes open and blink */
    later(function () { sunny.setAttribute("data-emotion", "blush"); }, 1850);    /* a blush */
    later(function () { sunny.removeAttribute("data-emotion"); sunny.classList.remove("sl-wake"); fly(fade); }, 2750); /* off to the corner */
  }
  function poll() {
    if (done) return;
    if (ready()) { try { play(); } catch (e) { finish(); } return; }
    if (Date.now() - started > 3500) { layer.classList.add("is-leaving"); later(finish, 600); return; } /* no companion on this page: just lift the curtain */
    timers.push(setTimeout(poll, 40));
  }
  poll();
  /* belt and braces: nothing keeps the page covered for long */
  later(finish, 6500);
})();
