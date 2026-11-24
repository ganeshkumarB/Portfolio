/* Sunny & Puppy: the loading screen. While the site loads, Sunny and Puppy play together in a little
   world that matches the real weather and the local time where the visitor is: a ball in the meadow
   when it is clear, a rope toy under a grey sky, puddle jumping in the rain, a snowball in the snow,
   leaves in the wind, and a yarn ball by the window, safe indoors, when there is a thunderstorm.
   Morning, afternoon, evening and night light the world; that is separate from the weather. One
   session, one scene: it is chosen once, before anything is shown, and never changes on screen.

   The style is the characters' own ("ink and sunshine"): the same #111 ink outline, chunky rounded
   toy-like shapes, one soft gradient per shape lit from the top left, glossy white highlights, and
   the site's warm cream glow behind the two of them. Far things lose their outline and fade into the
   sky, which gives the depth. Sunny and Puppy are the site's own artwork (Sunny.art, Puppy.art), with
   their own faces, blinks, tail and breathing; only weather clothes are added on top.

   The progress bar is the real loading: the page's own document, images, stylesheets and fonts, the
   weather check and the characters. Nothing is delayed to make it last; the screen fades out as soon as
   all of it has finished (or after 10 s at most). Skip with the button or Escape.

   It shows on the first page of a browser session (sessionStorage "sunny:loader"); add ?story to the
   address to see it again. Reduced motion shows the scene still. Loaded as the first script in <body>,
   synchronously, so the screen is up before the page paints. For checking: &hold=1 keeps it on screen,
   SunnyStory.state() / .weather() in the console; the weather test parameters are listed further down. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement, win = window;
  var qs = (function () { try { return new URLSearchParams(location.search); } catch (e) { return { has: function () { return false; }, get: function () { return null; } }; } })();
  function pref(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function sess(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  var force = qs.has("story");
  if (!force && sess("sunny:loader") === "1") return;
  if (!force && pref("pref:sunny") === "off") return; /* the visitor sent the mascots away */
  if (!doc.body) return;
  var SELF = (doc.currentScript && doc.currentScript.src) || "sunny-story.js";
  var reduced = (win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches) || pref("pref:motion") === "reduce";
  var hold = qs.has("hold");
  if (pref("theme") === "dark") html.setAttribute("data-theme", "dark");
  var T0 = Date.now(), W = 1600, H = 900, GY = 760;

  /* ===================================================================== styles */
  var CSS = `
html.sl-on { overflow: hidden !important; }
html.sl-on body > .sunny, html.sl-on body > .puppy, html.sl-on .to-top { visibility: hidden !important; }
.sl { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; color: #fff; background: var(--slBg, #0d1628); font-family: "Inter", system-ui, sans-serif; transition: opacity 0.9s ease; -webkit-user-select: none; user-select: none; }
.sl.is-out { opacity: 0; pointer-events: none; }
.sl-world { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; transform-origin: 0 0; opacity: 0; transition: opacity 0.7s ease; }
.sl-world.is-on { opacity: 1; }
.sl-cam > svg { position: absolute; left: 0; top: 0; overflow: visible; }
.sl-cam { position: absolute; inset: 0; transform-origin: 50% 70%; }
.sl-cam.is-push { animation: sl-push 30s cubic-bezier(0.25, 0.1, 0.25, 1) forwards; }
@keyframes sl-push { from { transform: scale(1); } to { transform: scale(1.04); } }
/* ---- the world's moving parts: all slow, all seamless ---- */
.w-drift { animation: w-drift 26s ease-in-out infinite alternate; }
.w-drift2 { animation: w-drift 34s ease-in-out infinite alternate-reverse; }
@keyframes w-drift { from { transform: translateX(-26px); } to { transform: translateX(26px); } }
.w-sway { transform-box: fill-box; transform-origin: 50% 100%; animation: w-sway 4.6s ease-in-out infinite alternate; }
.w-sway2 { transform-box: fill-box; transform-origin: 50% 100%; animation: w-sway 3.8s ease-in-out infinite alternate-reverse; }
@keyframes w-sway { from { transform: rotate(-1.6deg); } to { transform: rotate(1.6deg); } }
.sl.is-windy .w-sway, .sl.is-windy .w-sway2 { animation-name: w-gust; animation-duration: 1.7s; }
@keyframes w-gust { 0% { transform: rotate(var(--wb, -2deg)); } 100% { transform: rotate(calc(var(--wb, -2deg) * 3.2)); } }
.w-blade { transform-box: fill-box; transform-origin: 50% 100%; animation: w-blade 3.2s ease-in-out infinite alternate; }
.sl.is-windy .w-blade { animation: w-gust 1.1s ease-in-out infinite alternate; }
@keyframes w-blade { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }
.w-tw { animation: w-tw 3s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
@keyframes w-tw { from { opacity: 0.35; transform: scale(0.8); } to { opacity: 1; transform: scale(1.05); } }
.w-glow { animation: w-glow 4s ease-in-out infinite alternate; }
@keyframes w-glow { from { opacity: 0.8; } to { opacity: 1; } }
.w-flash { opacity: 0; }
/* ---- the two of them ---- */
.sl-actor { position: absolute; left: 0; top: 0; will-change: transform; }
.sl-pose { position: absolute; inset: 0; transform-origin: 50% 93%; will-change: transform; }
html body .sl-actor .sunny, html body .sl-actor .puppy { display: block !important; visibility: visible !important; position: absolute; inset: 0; width: 100%; height: 100%; right: auto; bottom: auto; z-index: auto; pointer-events: none; transition: none; filter: brightness(var(--charB, 1)); }
.sl-actor .sunny__char, .sl-actor .puppy__char { position: absolute; inset: 0; width: 100%; height: 100%; right: auto; bottom: auto; opacity: 1 !important; transform: none !important; translate: none !important; transition: none !important; pointer-events: none; cursor: default; }
.sl-actor .sunny__svg, .sl-actor .puppy__svg { width: 100%; height: 100%; transform: none !important; }
.sl-actor .s-shadow, .sl-actor .p-shadow { opacity: 0; }
.sunny .sl-cos { display: none; }
.sunny.sl-cos-on .sl-cos { display: inline; }
.sunny.sl-cos-rain .s-foot { fill: #2a3d66; }
.sunny.sl-cos-snow .s-foot { fill: #6b4a30; }
.sunny.sl-cos-snow .s-arm ellipse { fill: #de364d; }
.sunny.sl-cos-wind .s-foot { fill: #2f3640; }
.sunny.sl-gust .s-sprout { animation: sl-gust 0.7s ease-in-out infinite alternate !important; }
@keyframes sl-gust { from { transform: rotate(8deg); } to { transform: rotate(18deg); } }
.sunny.sl-reach .s-arm--r { animation: none !important; transform: rotate(-70deg) !important; transition: transform 0.4s ease; }
.sunny.sl-hold .s-arm--l { animation: none !important; transform: rotate(24deg) !important; }
.sunny.sl-push .s-arm--l, .sunny.sl-push .s-arm--r { animation: none !important; }
.sunny.sl-push .s-arm--l { transform: rotate(40deg) !important; }
.sl-scarf { display: none; } .puppy.sl-scarfed .sl-scarf { display: inline; }
.sl-shadow { position: absolute; left: 0; top: 0; width: 100px; height: 20px; margin: -10px 0 0 -50px; border-radius: 50%; background: radial-gradient(closest-side, rgba(20, 16, 30, 0.3), rgba(20, 16, 30, 0)); will-change: transform; }
.sl-prop { position: absolute; left: 0; top: 0; overflow: visible; will-change: transform; }
/* ---- the loading UI ---- */
.sl-fx { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.sl-scrim { position: absolute; left: 0; right: 0; bottom: 0; height: 38%; pointer-events: none; background: linear-gradient(to top, rgba(10, 12, 24, 0.6), rgba(10, 12, 24, 0.22) 50%, rgba(10, 12, 24, 0)); }
.sl-ui { position: absolute; left: max(24px, 5vw); bottom: max(24px, 6vh); width: min(420px, calc(100vw - 48px)); }
.sl-wx { display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px 7px 10px; border-radius: 999px; background: rgba(14, 14, 24, 0.55); border: 1px solid rgba(255, 255, 255, 0.18); font-size: 13px; line-height: 1.3; letter-spacing: 0.01em; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.sl-wx svg { width: 18px; height: 18px; flex: none; }
.sl-row { display: flex; justify-content: space-between; align-items: baseline; margin: 14px 0 8px; font-size: 14px; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35); }
.sl-pct { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: rgba(255, 255, 255, 0.85); font-variant-numeric: tabular-nums; }
.sl-bar { height: 6px; border-radius: 6px; background: rgba(255, 255, 255, 0.28); border: 1.5px solid #111; overflow: hidden; }
.sl-bar i { display: block; height: 100%; width: 100%; background: linear-gradient(90deg, #ffc93c, #ffe48a); transform-origin: 0 50%; transform: scaleX(0); transition: transform 0.35s ease-out; }
.sl-skip { position: absolute; top: max(16px, 3vh); right: max(16px, 3vw); padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(14, 14, 24, 0.5); color: #fff; font: 500 13px/1 "Inter", system-ui, sans-serif; cursor: pointer; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.sl-skip:hover { background: rgba(14, 14, 24, 0.75); }
.sl-skip:focus-visible { outline: 2px solid #ffc93c; outline-offset: 2px; }
.sl-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 640px) { .sl-ui { left: 20px; right: 20px; width: auto; bottom: max(28px, 5vh); } .sl-wx { font-size: 12.5px; } }
.sl.is-still *, .sl.is-still .sl-cam { animation: none !important; transition: none !important; }
`;
  var style = doc.createElement("style"); style.textContent = CSS; (doc.head || html).appendChild(style);
  var DOM = '<div class="sl-world" data-r="world" role="img"><div class="sl-cam" data-r="cam"></div></div>' +
    '<canvas class="sl-fx" data-r="fx" aria-hidden="true"></canvas>' +
    '<div class="sl-scrim" aria-hidden="true"></div>' +
    '<button type="button" class="sl-skip" data-r="skip">Skip <span aria-hidden="true">→</span></button>' +
    '<div class="sl-ui"><span class="sl-wx" data-r="wx"><span data-r="icon" aria-hidden="true"></span><span data-r="note">Checking the sky near you…</span></span>' +
    '<div class="sl-row"><span data-r="label">Loading the site</span><span class="sl-pct" data-r="pct" aria-hidden="true">0%</span></div>' +
    '<div class="sl-bar" role="progressbar" aria-label="Loading the site" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-r="bar"><i data-r="fill"></i></div></div>' +
    '<p class="sl-sr" aria-live="polite" data-r="live"></p>';
  var root = doc.createElement("div"); root.className = "sl"; root.setAttribute("role", "region"); root.setAttribute("aria-label", "Loading");
  root.innerHTML = DOM;
  if (reduced) root.classList.add("is-still");
  var R = {}; Array.prototype.forEach.call(root.querySelectorAll("[data-r]"), function (e) { R[e.getAttribute("data-r")] = e; });
  html.classList.add("sl-on");
  doc.body.insertBefore(root, doc.body.firstChild);
  /* until the scene is chosen, the screen is a quiet sky for the time of day (never empty) */
  (function () { var h = new Date().getHours(); root.style.setProperty("--slBg", h >= 6 && h < 17 ? "linear-gradient(#8fc8ef, #e9f5fc)" : h >= 17 && h < 20 ? "linear-gradient(#6d6fb8, #ffc89a)" : "linear-gradient(#18224d, #3b4f8c)"); })();

  /* ===================================================================== the real weather and the local time
     Weather → climate, decided from real readings only, by one fixed table (climateOf); the time of day only lights it.
     Where: the browser's own location when the visitor has already allowed it for this site (this never asks).
     If that is denied, not yet asked, unavailable or slower than 1.5 s, the city of the device's time zone (looked up
     once a day); if there is no place at all, the scene is lit by the device clock and claims no weather.
     What: one Open-Meteo request (free, no key): condition, temperature and feels-like, cloud cover, precipitation
     (rain, showers, snow), wind speed, gusts and direction, and today's sunrise and sunset in the place's own time
     zone. A field the service does not send is left out, and its effect with it. Coordinates are rounded to about
     1 km and kept only in this browser.
     Freshness: Open-Meteo updates every 15 minutes. A reading younger than that is used as it is; an older one (up to
     3 hours) is used at once, so nothing waits, while a fresh one is fetched for next time; anything older is thrown away.
     For checking: &weather=clear|partly|cloudy|drizzle|rain|heavy|storm|hail|snow|blizzard|fog|wind|heat|cold|frost|clearing|offline,
     &time=sunrise|morning|midday|afternoon|sunset|evening|night|latenight, &wind=DEGREES, &lat=..&lon=.. (the real
     weather there), &loc=denied|unavailable|timeout|prompt, &api=fail, &net=fail, &stale=1, and SunnyStory.weather(). */
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
      sunrise: mins(d.sunrise && d.sunrise[0]), sunset: mins(d.sunset && d.sunset[0]), recent: recentRain(j.hourly, c.time), src: src };
  }
  /* rain in the last three hours (up to the current hour), for "clearing after rain"; null when the service did not say */
  function recentRain(h, now) {
    if (!h || !h.time || !h.precipitation) return null;
    var sum = 0, seen = false; for (var i = 0; i < h.time.length; i++) if (h.time[i] <= now && h.precipitation[i] != null) { sum += h.precipitation[i]; seen = true; }
    return seen ? sum : null;
  }
  /* test readings for ?weather=, shaped like the service's */
  function synth(name) {
    var b = { code: 0, temp: 18, feels: 18, cloud: 8, precip: 0, rain: 0, showers: 0, snow: 0, wind: 8, gust: 14, dir: qs.has("wind") && isFinite(parseFloat(qs.get("wind"))) ? parseFloat(qs.get("wind")) : 80, isDay: 1, offset: null, sunrise: null, sunset: null, src: "override" };
    var o = { clear: {}, partly: { code: 2, cloud: 55 }, cloudy: { code: 3, cloud: 95 }, overcast: { code: 3, cloud: 100 }, drizzle: { code: 53, cloud: 100, precip: 0.1, rain: 0.1 }, rain: { code: 63, cloud: 100, precip: 0.6, rain: 0.6 },
      heavy: { code: 65, cloud: 100, precip: 2.4, rain: 2.4 }, storm: { code: 95, cloud: 100, precip: 1.4, wind: 36, gust: 64 }, hail: { code: 96, cloud: 100, precip: 1.6, wind: 34, gust: 60 }, snow: { code: 73, cloud: 100, temp: -2, feels: -6, snow: 0.4 },
      blizzard: { code: 75, cloud: 100, temp: -7, feels: -15, snow: 0.9, wind: 46, gust: 72 }, fog: { code: 45, cloud: 100, temp: 9, feels: 8 }, wind: { code: 1, cloud: 30, wind: 42, gust: 63 }, heat: { code: 0, cloud: 4, temp: 41, feels: 45 }, cold: { code: 1, cloud: 20, temp: 2, feels: -1 }, frost: { code: 0, cloud: 5, temp: -4, feels: -8 }, clearing: { code: 2, cloud: 45, recent: 1.4 } }[name];
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
    if (cl.kind === "clear" && rec.recent != null && rec.recent >= 0.3 && !(rec.precip > 0)) cl.clearing = true; /* dry now, wet an hour ago */
    if ((cl.kind === "clear" || cl.kind === "wind") && cl.temp != null && cl.temp <= 0) cl.frost = true;
    if ((cl.kind === "clear" || cl.kind === "wind") && cl.feels != null && cl.feels >= 38 && !cl.dark) cl.heat = true; /* heat: shade, water, slow paws */
    if ((cl.kind === "clear" || cl.kind === "wind" || cl.kind === "fog") && cl.temp != null && cl.temp <= 3) cl.cold = true; /* cold and dry: winter clothes */
    return cl;
  }
  /* ---- where, and the reading: one request chain, shared by the first answer and every refresh ---- */
  function fetchJSON(url, ms) {
    if (qs.get("net") === "fail") return Promise.reject(new Error("network failure (test)"));
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
      "&current=weather_code,temperature_2m,apparent_temperature,cloud_cover,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&hourly=precipitation&past_hours=3&forecast_hours=1&daily=sunrise,sunset&forecast_days=1&timezone=auto";
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
  /* the first answer: test overrides, then a cache, then the network; never waits more than 2.4 s. A late answer
     is not shown (the scene never changes once chosen); it is only kept in the cache for the next visit. */
  function resolveWeather() {
    var ow = qs.get("weather");
    function done(rec, src) { if (WX.done) return; WX.rec = rec; WX.src = src; WX.done = true; }
    if (ow) { var s = ow === "offline" ? null : synth(ow); if (!s) WX.err = ow === "offline" ? "offline (test)" : "unknown test weather"; return done(s, s ? "override" : "time"); }
    var c = null; try { c = JSON.parse(localStorage.getItem("sunny:wx") || "null"); } catch (e) { /* ignore */ }
    if (c && c.v === 2 && c.rec && !(qs.has("lat") && qs.has("lon"))) { /* a test place always asks the service */
      var age = Date.now() - c.t; if (qs.has("stale")) age = Math.max(age, FRESH + 1);
      if (age < FRESH) { WX.fetchedAt = c.t; return done(c.rec, "cache"); }
      if (age < STALE_MAX) { WX.fetchedAt = c.t; done(c.rec, "cache, refreshed for next time"); getWeather().then(null, function () { /* keep the old one */ }); return; }
    }
    if (!win.fetch || navigator.onLine === false) { WX.err = "offline"; return done(null, "time"); }
    getWeather().then(function (rec) { if (!WX.done) { WX.fetchedAt = Date.now(); done(rec, rec.src); } }, function () { done(null, "time"); });
    setTimeout(function () { if (!WX.done) { WX.err = WX.err || "no answer within 2.4 s"; done(null, "time"); } }, 2400);
  }
  resolveWeather();

  /* ===================================================================== the scene: one climate, one light */
  var LIGHTS = { sunrise: "morning", morning: "morning", midday: "day", afternoon: "day", sunset: "eve", evening: "eve", night: "night", latenight: "late" };
  var PART = { sunrise: "Morning", morning: "Morning", midday: "Afternoon", afternoon: "Afternoon", sunset: "Evening", evening: "Evening", night: "Night", latenight: "Night" };
  /* priority: thunderstorm, snow, rain, strong wind, cloudy, clear (climateOf already sorts them so); wind is also a layer */
  function sceneOf(cl) {
    var k = cl.kind, s = { kind: "cloudy", fog: false, rain: 0, snow: 0, wind: cl.wind, wx: cl.wx, known: cl.known, phase: cl.phase, light: LIGHTS[cl.phase] || "day", cold: !!cl.cold };
    if (!cl.known) s.kind = "cloudy"; /* no reading: the quiet garden, with no weather claimed */
    else if (k === "storm") { s.kind = "storm"; s.rain = Math.max(1.2, cl.rain); s.wind = Math.max(0.6, cl.wind); }
    else if (k === "snow") { s.kind = "snow"; s.snow = Math.max(0.45, cl.snow); }
    else if (k === "rain") { s.kind = "rain"; s.rain = Math.max(0.4, cl.rain); }
    else if (k === "wind") { s.kind = "wind"; s.wind = Math.max(0.7, cl.wind); }
    else if (k === "fog") { s.kind = "cloudy"; s.fog = true; }
    else s.kind = cl.sub === "overcast" || cl.cloud >= 0.7 ? "cloudy" : "clear";
    s.costume = s.kind === "rain" ? "rain" : s.kind === "snow" ? "snow" : s.kind === "wind" ? (s.cold ? "snow" : "wind") : (s.kind === "clear" || s.kind === "cloudy") && s.cold ? "snow" : "";
    return s;
  }
  var ACTS = { clear: "playing with a red ball in a flower meadow", cloudy: "playing tug with a rope toy in the garden", rain: "jumping into a puddle together in the rain",
    snow: "rolling a big snowball in the snow", wind: "chasing autumn leaves in the wind", storm: "playing with a ball of yarn indoors, warm and safe from the storm outside" };
  function noteOf(cl, s) {
    var part = PART[cl.phase] || "";
    if (!cl.known) return "Weather unavailable · " + part;
    var said = { storm: cl.sub === "hail" ? "Hailstorm" : "Thunderstorm", snow: cl.sub === "blizzard" ? "Blizzard" : "Snow", rain: cl.sub === "drizzle" ? "Drizzle" : cl.sub === "heavy" ? "Heavy rain" : "Rain", wind: "Windy", fog: "Fog" }[cl.kind] ||
      (s.kind === "cloudy" ? "Cloudy" : cl.heat ? "Hot and clear" : cl.frost ? "Clear and frosty" : cl.sub === "partly" ? "Partly cloudy" : "Clear skies");
    var deg = cl.temp == null ? "" : " · " + Math.round(UNIT_F ? cl.temp * 9 / 5 + 32 : cl.temp) + (UNIT_F ? "°F" : "°C");
    return said + " near you" + deg + " · " + part;
  }
  var CLOUD = function (y) { return '<path d="M6.6 ' + (16 + y) + 'h10.6a4 4 0 0 0 .5-7.96A5.6 5.6 0 0 0 6.9 9.3a3.4 3.4 0 0 0-.3 6.7z" fill="#e9eef6" transform="translate(0 ' + y + ')"/>'; };
  function iconOf(s) {
    var night = s.light === "night" || s.light === "late", p;
    if (s.kind === "clear") p = night ? '<path d="M15.2 3.6a8.4 8.4 0 1 0 5.2 13.6A7 7 0 0 1 15.2 3.6z" fill="#e8ecff"/>' : '<circle cx="12" cy="12" r="4.4" fill="#ffd24d"/><path d="M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.4 5.4l1.6 1.6M17 17l1.6 1.6M5.4 18.6L7 17M17 7l1.6-1.6" stroke="#ffd24d" stroke-width="1.8" stroke-linecap="round"/>';
    else if (s.kind === "cloudy") p = CLOUD(0);
    else if (s.kind === "rain") p = CLOUD(-3) + '<path d="M8.5 17l-1 3M12.5 17l-1 3M16.5 17l-1 3" stroke="#8fc7ff" stroke-width="1.8" stroke-linecap="round"/>';
    else if (s.kind === "snow") p = CLOUD(-3) + '<g fill="#fff"><circle cx="8.5" cy="18.5" r="1.3"/><circle cx="12.5" cy="20" r="1.3"/><circle cx="16.5" cy="18.5" r="1.3"/></g>';
    else if (s.kind === "storm") p = CLOUD(-3) + '<path d="M12.6 14.5l-2.6 4.2h2.6l-1.4 3.8 4-5.2h-2.6l1.4-2.8z" fill="#ffd24d"/>';
    else p = '<path d="M3 9h11.5a2.7 2.7 0 1 0-2.6-3.4M3 13h15.5a2.8 2.8 0 1 1-2.7 3.6M3 17h7" fill="none" stroke="#e9eef6" stroke-width="1.8" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 24 24">' + p + "</svg>";
  }

  /* ===================================================================== the look: palettes. Weather picks the world, time picks the light.
     Sky and ground come from the table; every object colour is graded by the light (T), so one drawing serves every time of day. */
  var PAL = {
    clear:  { day: ["#7cc6f5", "#e4f4ff", "#b6dcc8", "#93cf7e", "#a6de73", "#74c157", "#fff6dc", "#ffffff", "#dbe9f5"], eve: ["#5f63ad", "#ffc59a", "#c99aa6", "#a6a66e", "#c3c56c", "#93a050", "#ffd2a4", "#ffd9c4", "#e7a6a0"], night: ["#141d46", "#34488a", "#2b3a68", "#2c4a58", "#3a6451", "#2a4b3f", "#4b5c9c", "#4a5a8c", "#36446e"] },
    cloudy: { day: ["#aebbd0", "#e8ecf2", "#b9c8c2", "#97b68e", "#a9c890", "#82aa70", "#eef1f4", "#f4f6f9", "#cbd3df"], eve: ["#66658c", "#d6b3ae", "#9a92a3", "#7e8e72", "#95a87b", "#6e835c", "#e2c6bf", "#b9aebd", "#8f86a0"], night: ["#1e2640", "#414b68", "#363f58", "#33474a", "#3d5848", "#2d4438", "#555e7a", "#4b5470", "#383f58"] },
    rain:   { day: ["#8796ad", "#cbd4e0", "#a2b0b6", "#7f9c88", "#8aa97f", "#67875f", "#dde3eb", "#b9c3d2", "#93a0b4"], eve: ["#3a466e", "#988ca6", "#6d7390", "#56685e", "#637b63", "#4a604c", "#a69cb3", "#6f7594", "#545a78"], night: ["#10182f", "#29365c", "#25304c", "#253a3e", "#2f493f", "#223830", "#414c74", "#2f3a5a", "#222b46"] },
    snow:   { day: ["#a4caee", "#f0f7ff", "#d4e2f0", "#b6cde3", "#f8fbff", "#cfdff1", "#ffffff", "#ffffff", "#d5e3f2"], eve: ["#6c74b6", "#f4c4c6", "#c2b7d5", "#a7a7cb", "#f7eef5", "#c8c0df", "#f7dadb", "#f4d6dc", "#c8b4cc"], night: ["#111b40", "#314479", "#2d3c69", "#3a4c79", "#c6d4ed", "#8a9fc6", "#4e6198", "#3f4f80", "#2f3c66"] },
    wind:   { day: ["#74bdf0", "#e6f2fb", "#e3bf8e", "#d8994f", "#d8c46c", "#b39a48", "#fff0d0", "#ffffff", "#dbe6f2"], eve: ["#5b5ca6", "#ffb47e", "#c78e71", "#b56d43", "#caa35b", "#9c7a3e", "#ffca98", "#ffcfb4", "#d99a8a"], night: ["#16234f", "#384a86", "#393e67", "#4a3e50", "#5b5b48", "#43443a", "#535e98", "#45548a", "#333f6c"] },
    storm:  { day: ["#46526f", "#7b88a2", "#36405a", "#2c3550", "#b68350", "#9a6c40", "#ffe9c8", "#5c6782", "#444e68"], eve: ["#0d1430", "#252f58", "#161d38", "#121a30", "#7d5434", "#654328", "#ffcf96", "#262f50", "#1b2240"], night: ["#0d1430", "#252f58", "#161d38", "#121a30", "#7d5434", "#654328", "#ffcf96", "#262f50", "#1b2240"] }
  };
  var PKEYS = ["skyT", "skyB", "far", "mid", "grd", "grdD", "haze", "cloud", "cloudS"];
  /* light: [toward colour, amount] for objects, lamps on, sun, moon, stars, characters' brightness */
  var LIGHT = { morning: { tone: ["#ffb98a", 0.08], lamp: 0, sun: 1, moon: 0, stars: 0, charB: 1 }, day: { tone: ["#ffffff", 0], lamp: 0, sun: 1, moon: 0, stars: 0, charB: 1 },
    eve: { tone: ["#8a4a6a", 0.2], lamp: 0.8, sun: 1, moon: 0, stars: 0.25, charB: 1 }, night: { tone: ["#141c48", 0.52], lamp: 1, sun: 0, moon: 1, stars: 1, charB: 0.94 }, late: { tone: ["#0e1438", 0.6], lamp: 0.55, sun: 0, moon: 1, stars: 1, charB: 0.9 } };
  function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mixc(a, b, u) { var x = hx(a), y = hx(b); return "#" + x.map(function (v, i) { var o = Math.round(v + (y[i] - v) * u).toString(16); return o.length < 2 ? "0" + o : o; }).join(""); }
  var LT = LIGHT.day;
  function T(c) { return mixc(c, LT.tone[0], LT.tone[1]); }
  function palette(s) {
    var base = s.light === "late" ? "night" : s.light === "morning" ? "day" : s.light, row = PAL[s.kind][base], p = {};
    PKEYS.forEach(function (k, i) { p[k] = row[i]; });
    if (s.light === "morning" && s.kind !== "storm") { p.skyB = mixc(p.skyB, "#ffd9b8", 0.45); p.haze = mixc(p.haze, "#ffe6cc", 0.5); p.far = mixc(p.far, "#f3c9b4", 0.25); }
    if (s.light === "late") { ["skyT", "skyB", "far", "mid", "grd", "grdD"].forEach(function (k) { p[k] = mixc(p[k], "#070b22", 0.22); }); }
    return p;
  }

  /* ===================================================================== the drawing kit: ink outlines, chunky shapes, one gradient, a gloss */
  var INK = "#111";
  function ink(w) { return ' stroke="' + INK + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function V(n) { return 'style="fill:var(--' + n + ')"'; }
  /* shapes drawn outline first, fill second: one clean outer outline round a cluster of circles */
  function blob(parts, fill, sw, extra) {
    var o = "", f = "";
    parts.forEach(function (p) {
      var sh = p.length === 3 ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '"' : '<rect x="' + p[0] + '" y="' + p[1] + '" width="' + p[2] + '" height="' + p[3] + '" rx="' + (p[4] || 0) + '"';
      if (sw) o += sh + ' fill="' + INK + '" stroke="' + INK + '" stroke-width="' + sw * 2 + '" stroke-linejoin="round"/>';
      f += sh + " " + fill + "/>";
    });
    return "<g>" + o + f + (extra || "") + "</g>";
  }
  function cloud(x, y, k, cls, sw) {
    var P = [[0, 0, 42 * k], [46 * k, -20 * k, 52 * k], [98 * k, -4 * k, 40 * k], [-34 * k, 8 * k, 30 * k], [-40 * k, 4 * k, 168 * k, 38 * k, 19 * k]];
    P = P.map(function (p) { return p.length === 3 ? [x + p[0], y + p[1], p[2]] : [x + p[0], y + p[1], p[2], p[3], p[4]]; });
    return '<g class="' + (cls || "") + '">' + blob(P, V("cloud"), sw == null ? 2.5 : sw, '<path d="M' + (x - 30 * k) + " " + (y + 30 * k) + " H" + (x + 120 * k) + '" stroke="var(--cloudS)" stroke-width="' + 10 * k + '" stroke-linecap="round" opacity="0.7"/><path d="M' + (x + 18 * k) + " " + (y - 50 * k) + " Q" + (x + 40 * k) + " " + (y - 66 * k) + " " + (x + 66 * k) + " " + (y - 58 * k) + '" fill="none" stroke="#fff" stroke-width="' + 6 * k + '" stroke-linecap="round" opacity="0.45"/>') + "</g>";
  }
  function tree(x, y, k, crown, cls) {
    var c = [[0, -170, 74], [-60, -132, 54], [62, -128, 58], [-22, -222, 52], [34, -212, 56]].map(function (p) { return [x + p[0] * k, y + p[1] * k, p[2] * k]; });
    return '<g class="' + (cls || "") + '"><path d="M' + (x - 13 * k) + " " + y + " L" + (x - 9 * k) + " " + (y - 130 * k) + " L" + (x + 9 * k) + " " + (y - 130 * k) + " L" + (x + 13 * k) + " " + y + 'Z" fill="' + T("#8a5a36") + '"' + ink(2.5) + "/>" +
      blob(c, 'fill="' + T(crown) + '"', 2.5, '<circle cx="' + (x - 30 * k) + '" cy="' + (y - 200 * k) + '" r="' + 26 * k + '" fill="#fff" opacity="0.22"/><circle cx="' + (x + 40 * k) + '" cy="' + (y - 120 * k) + '" r="' + 30 * k + '" fill="#000" opacity="0.08"/>') + "</g>";
  }
  function pine(x, y, k, snowy) {
    var g = "", col = T("#3f7d6a");
    [[0, 150, 70], [-36, 110, 60], [-70, 72, 48]].forEach(function (t, i) {
      var ty = y - t[1] * k + (i === 0 ? 30 * k : 0) - i * 12 * k, w = t[1] * k * 0.62 + 10 * k, top = y - (t[1] + t[2] + 40) * k + i * 26 * k;
      g += '<path d="M' + x + " " + (top) + " L" + (x + w) + " " + (y - i * 46 * k) + " L" + (x - w) + " " + (y - i * 46 * k) + 'Z" fill="' + col + '"' + ink(2.5) + "/>";
      if (snowy) g += '<path d="M' + x + " " + top + " L" + (x + w * 0.45) + " " + (top + (y - i * 46 * k - top) * 0.42) + " Q" + x + " " + (top + (y - i * 46 * k - top) * 0.55) + " " + (x - w * 0.45) + " " + (top + (y - i * 46 * k - top) * 0.42) + 'Z" fill="' + T("#ffffff") + '"' + ink(2) + "/>";
    });
    return '<g><rect x="' + (x - 10 * k) + '" y="' + (y - 4) + '" width="' + 20 * k + '" height="' + 28 * k + '" fill="' + T("#7a4e2e") + '"' + ink(2.5) + "/>" + g + "</g>";
  }
  function house(x, y, k, snowy) {
    var w = 220 * k, h = 140 * k, wall = T("#f3dcb0"), roof = T(snowy ? "#ffffff" : "#d8665a");
    var win = function (wx, wy) { return '<rect x="' + wx + '" y="' + wy + '" width="' + 40 * k + '" height="' + 42 * k + '" rx="' + 6 * k + '" fill="' + T("#a8c7de") + '"' + ink(2.2) + '/><rect x="' + wx + '" y="' + wy + '" width="' + 40 * k + '" height="' + 42 * k + '" rx="' + 6 * k + '" fill="#ffd77a" style="opacity:var(--lamp)"' + ink(2.2) + '/><path d="M' + (wx + 20 * k) + " " + wy + " V" + (wy + 42 * k) + " M" + wx + " " + (wy + 21 * k) + " H" + (wx + 40 * k) + '"' + ink(1.8) + "/>"; };
    return '<g><circle cx="' + (x + 60 * k) + '" cy="' + (y - 70 * k) + '" r="' + 120 * k + '" fill="url(#slw-lamp)" style="opacity:var(--lamp)"/>' +
      '<rect x="' + (x + 140 * k) + '" y="' + (y - h - 70 * k) + '" width="' + 28 * k + '" height="' + 60 * k + '" fill="' + T("#b5523f") + '"' + ink(2.5) + "/>" +
      '<rect x="' + x + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" fill="' + wall + '"' + ink(2.5) + "/>" +
      '<path d="M' + (x - 20 * k) + " " + (y - h + 4) + " L" + (x + w / 2) + " " + (y - h - 92 * k) + " L" + (x + w + 20 * k) + " " + (y - h + 4) + 'Z" fill="' + roof + '"' + ink(2.8) + "/>" +
      win(x + 26 * k, y - h + 34 * k) + win(x + w - 66 * k, y - h + 34 * k) +
      '<rect x="' + (x + w / 2 - 22 * k) + '" y="' + (y - 78 * k) + '" width="' + 44 * k + '" height="' + 78 * k + '" rx="' + 20 * k + '" fill="' + T("#8a5a36") + '"' + ink(2.2) + "/></g>";
  }
  function lamp(x, y, k) {
    return '<g><circle cx="' + x + '" cy="' + (y - 250 * k) + '" r="' + 120 * k + '" fill="url(#slw-lamp)" style="opacity:var(--lamp)"/>' +
      '<rect x="' + (x - 6 * k) + '" y="' + (y - 236 * k) + '" width="' + 12 * k + '" height="' + 236 * k + '" rx="' + 5 * k + '" fill="' + T("#3a3f55") + '"' + ink(2.2) + "/>" +
      '<path d="M' + (x - 22 * k) + " " + (y - 234 * k) + " L" + (x - 16 * k) + " " + (y - 276 * k) + " H" + (x + 16 * k) + " L" + (x + 22 * k) + " " + (y - 234 * k) + 'Z" fill="' + T("#e9e2cf") + '"' + ink(2.2) + "/>" +
      '<path d="M' + (x - 22 * k) + " " + (y - 234 * k) + " L" + (x - 16 * k) + " " + (y - 276 * k) + " H" + (x + 16 * k) + " L" + (x + 22 * k) + " " + (y - 234 * k) + 'Z" fill="#ffd77a" style="opacity:var(--lamp)"' + ink(2.2) + "/>" +
      '<path d="M' + (x - 26 * k) + " " + (y - 276 * k) + " H" + (x + 26 * k) + " L" + x + " " + (y - 298 * k) + 'Z" fill="' + T("#3a3f55") + '"' + ink(2.2) + "/></g>";
  }
  function bench(x, y, k) {
    var wd = T("#b0784a");
    return '<g><path d="M' + (x + 14 * k) + " " + y + " V" + (y - 60 * k) + " M" + (x + 156 * k) + " " + y + " V" + (y - 60 * k) + '"' + ink(5) + "/>" +
      '<rect x="' + x + '" y="' + (y - 70 * k) + '" width="' + 170 * k + '" height="' + 16 * k + '" rx="' + 5 * k + '" fill="' + wd + '"' + ink(2.2) + "/>" +
      '<rect x="' + (x + 6 * k) + '" y="' + (y - 116 * k) + '" width="' + 158 * k + '" height="' + 14 * k + '" rx="' + 5 * k + '" fill="' + wd + '"' + ink(2.2) + "/>" +
      '<rect x="' + (x + 6 * k) + '" y="' + (y - 96 * k) + '" width="' + 158 * k + '" height="' + 14 * k + '" rx="' + 5 * k + '" fill="' + wd + '"' + ink(2.2) + "/></g>";
  }
  function fence(x0, x1, y, k) {
    var g = '<rect x="' + x0 + '" y="' + (y - 56 * k) + '" width="' + (x1 - x0) + '" height="' + 12 * k + '" fill="' + T("#f4ead6") + '"' + ink(2) + "/>";
    for (var x = x0 + 10; x < x1; x += 46 * k) g += '<path d="M' + x + " " + y + " V" + (y - 82 * k) + " L" + (x + 12 * k) + " " + (y - 96 * k) + " L" + (x + 24 * k) + " " + (y - 82 * k) + " V" + y + 'Z" fill="' + T("#fbf4e6") + '"' + ink(2) + "/>";
    return "<g>" + g + "</g>";
  }
  var FLOWER_C = ["#ff8fa3", "#ffffff", "#ffc93c", "#b69cff", "#ff9e6b"];
  function flower(x, y, r, i, stem) {
    var c = T(FLOWER_C[i % FLOWER_C.length]), g = stem ? '<path d="M' + x + " " + y + " q" + (-r * 0.4) + " " + r * 2.2 + " " + 0 + " " + r * 3.6 + '" fill="none"' + ink(1.8) + "/>" : "";
    for (var a = 0; a < 5; a++) { var t = a * 1.2566 - 1.57; g += '<circle cx="' + (x + Math.cos(t) * r * 0.9).toFixed(1) + '" cy="' + (y + Math.sin(t) * r * 0.9).toFixed(1) + '" r="' + (r * 0.62).toFixed(1) + '" fill="' + c + '"' + ink(1.6) + "/>"; }
    return '<g class="w-blade" style="animation-delay:-' + (i * 0.7 % 3).toFixed(1) + 's">' + g + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.5).toFixed(1) + '" fill="' + T("#ffc93c") + '"' + ink(1.6) + "/></g>";
  }
  function tuft(x, y, k, i) { return '<path class="w-blade" style="animation-delay:-' + (i * 0.53 % 3).toFixed(2) + 's" d="M' + x + " " + y + " q" + (-5 * k) + " " + (-14 * k) + " " + (-12 * k) + " " + (-20 * k) + " M" + x + " " + y + " q" + (1 * k) + " " + (-18 * k) + " " + (-1 * k) + " " + (-28 * k) + " M" + x + " " + y + " q" + (6 * k) + " " + (-12 * k) + " " + (13 * k) + " " + (-17 * k) + '" fill="none"' + ink(2.2) + "/>"; }
  function spark(x, y, r, i) { return '<path class="w-tw" style="animation-delay:-' + (i * 0.37 % 3).toFixed(2) + 's" d="M' + x + " " + (y - r) + " L" + (x + r * 0.22) + " " + (y - r * 0.22) + " L" + (x + r) + " " + y + " L" + (x + r * 0.22) + " " + (y + r * 0.22) + " L" + x + " " + (y + r) + " L" + (x - r * 0.22) + " " + (y + r * 0.22) + " L" + (x - r) + " " + y + " L" + (x - r * 0.22) + " " + (y - r * 0.22) + 'Z" fill="#fff6c8"/>'; }
  function ground(top, deep) { /* the near ground, with an ink line along its top edge */
    var d = "M-700 " + top + " C -200 " + (top - 40) + ", 300 " + (top + 16) + ", 800 " + (top - 6) + " S 1700 " + (top - 34) + ", 2300 " + (top + 4);
    return '<path d="' + d + " V1900 H-700 Z\" fill=\"url(#slw-grd)\"/><path d=\"" + d + '" fill="none"' + ink(3) + "/>";
  }
  function hills() {
    return '<path d="M-700 640 C -260 500, 160 540, 480 590 S 1020 480, 1320 540 S 1900 500, 2300 580 V760 H-700Z" ' + V("far") + "/>" +
      '<path d="M-700 690 C -330 610, 90 620, 360 676 S 900 630, 1160 676 S 1720 600, 2300 674 V790 H-700Z" ' + V("mid") + ink(2.5) + "/>";
  }
  function skyAndLights(s, sunXY) {
    var g = '<rect x="-700" y="-1100" width="3000" height="1900" fill="url(#slw-sky)"/>';
    if (s.kind !== "cloudy" && s.kind !== "rain" && s.kind !== "storm") {
      g += '<g style="opacity:var(--sun)"><circle cx="' + sunXY[0] + '" cy="' + sunXY[1] + '" r="230" fill="url(#slw-sunglow)"/><circle cx="' + sunXY[0] + '" cy="' + sunXY[1] + '" r="58" fill="#fff3c2"/></g>';
      g += '<g style="opacity:var(--moon)"><circle cx="1250" cy="150" r="170" fill="url(#slw-moonglow)"/><circle cx="1250" cy="150" r="46" fill="#fff6d8"/><circle cx="1236" cy="140" r="9" fill="#e9dcb4" opacity="0.7"/><circle cx="1262" cy="166" r="6" fill="#e9dcb4" opacity="0.7"/></g>';
      g += '<g style="opacity:var(--stars)">'; for (var i = 0; i < 26; i++) g += spark((i * 997) % 1800 - 100, 30 + (i * 613) % 420, 5 + (i % 3) * 3, i); g += "</g>";
    }
    return g;
  }
  function defs(s) {
    return "<defs>" +
      '<linearGradient id="slw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0.25" style="stop-color:var(--skyT)"/><stop offset="0.92" style="stop-color:var(--skyB)"/></linearGradient>' +
      '<linearGradient id="slw-grd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--grd)"/><stop offset="0.6" style="stop-color:var(--grdD)"/></linearGradient>' +
      '<radialGradient id="slw-glow"><stop offset="0" style="stop-color:var(--haze);stop-opacity:0.85"/><stop offset="1" style="stop-color:var(--haze);stop-opacity:0"/></radialGradient>' +
      '<radialGradient id="slw-sunglow"><stop offset="0" stop-color="#fff2c4" stop-opacity="0.9"/><stop offset="0.4" stop-color="#ffe08a" stop-opacity="0.35"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="slw-moonglow"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.45"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="slw-lamp"><stop offset="0" stop-color="#ffd77a" stop-opacity="0.7"/><stop offset="1" stop-color="#ffd77a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="slw-pud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--skyB)"/><stop offset="1" style="stop-color:var(--skyT)"/></linearGradient>' +
      '<radialGradient id="slw-ball" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#ff8a7a"/><stop offset="1" stop-color="#e2384a"/></radialGradient>' +
      '<radialGradient id="slw-snowball" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9daf0"/></radialGradient>' +
      '<linearGradient id="slw-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f4f7" stop-opacity="0"/><stop offset="0.5" stop-color="#f2f4f7" stop-opacity="0.75"/><stop offset="1" stop-color="#f2f4f7" stop-opacity="0"/></linearGradient>' +
      "</defs>";
  }

  /* ---- where the two of them stand (world units; the floor line is GY) and the size of each ---- */
  var PX = 620, SX = 1000, PUP = 250, SUN = 340, PFOOT = 0.923, SFOOT = 0.941;
  var WINR = [930, 150, 1410, 520]; /* the storm room's window panes */

  /* ---- the six worlds: background (behind them) and foreground (in front) ---- */
  function worldSVG(s) {
    var k = s.kind, sunXY = s.light === "morning" ? [300, 330] : s.light === "eve" ? [1180, 560] : [1270, 170], bg = "", fg = "", i;
    if (k === "storm") return roomSVG(s);
    bg += skyAndLights(s, sunXY);
    if (k === "clear") bg += cloud(260, 170, 1, "w-drift") + cloud(1080, 120, 0.8, "w-drift2") + cloud(-120, 330, 0.7, "w-drift2") + cloud(1560, 300, 0.9, "w-drift");
    if (k === "cloudy") { bg += cloud(-200, 140, 1.6, "w-drift", 0) + cloud(500, 90, 1.9, "w-drift2", 0) + cloud(1200, 150, 1.7, "w-drift", 0) + cloud(80, 300, 1.2, "w-drift2") + cloud(860, 270, 1.4, "w-drift") + cloud(1500, 320, 1.1, "w-drift2"); }
    if (k === "rain") { bg += cloud(-260, 120, 2, "w-drift", 0) + cloud(500, 60, 2.2, "w-drift2", 0) + cloud(1250, 110, 2, "w-drift", 0) + cloud(150, 260, 1.4, "w-drift") + cloud(980, 240, 1.5, "w-drift2"); }
    if (k === "snow") bg += cloud(180, 160, 0.9, "w-drift") + cloud(1150, 110, 0.8, "w-drift2");
    if (k === "wind") bg += cloud(-100, 150, 0.9, "w-drift") + cloud(520, 90, 0.7, "w-drift") + cloud(1180, 180, 0.95, "w-drift") + cloud(1650, 100, 0.7, "w-drift");
    bg += hills();
    /* the middle distance */
    if (k === "clear") bg += tree(150, 700, 1.15, "#5fb04a", "w-sway") + house(1240, 690, 0.9) + tree(1540, 704, 0.9, "#6fbf55", "w-sway2");
    if (k === "cloudy") bg += fence(-200, 1800, 712, 0.9) + tree(120, 708, 1.1, "#6e9e5c", "w-sway") + house(1260, 700, 0.85);
    if (k === "rain") bg += tree(60, 706, 1.2, "#5d8f57", "w-sway") + bench(1290, 712, 1) + lamp(300, 712, 1);
    if (k === "snow") { bg += pine(120, 712, 1.25, true) + pine(300, 706, 0.85, true) + house(1240, 696, 0.9, true) + pine(1530, 712, 1.1, true) + lamp(420, 714, 0.95); }
    if (k === "wind") bg += tree(120, 708, 1.2, "#e58a3a", "w-sway") + tree(360, 690, 0.75, "#f0b13c", "w-sway2") + house(1250, 690, 0.85) + tree(1530, 706, 1.05, "#d9622b", "w-sway");
    if (s.fog) bg += '<rect x="-700" y="380" width="3000" height="420" fill="url(#slw-fog)"/>'; /* fog: the distance fades into soft white, they stay clear in front */
    bg += ground(718, true);
    if (s.fog) bg += '<rect x="-700" y="640" width="3000" height="200" fill="url(#slw-fog)" opacity="0.6"/>';
    if (k === "snow") bg += '<path d="M-700 760 C -100 740, 500 770, 1000 752 S 1900 740, 2300 760" fill="none" stroke="' + T("#b9cde6") + '" stroke-width="10" opacity="0.6" stroke-linecap="round"/>';
    if (k === "rain") bg += '<ellipse cx="830" cy="' + (GY + 8) + '" rx="380" ry="38" fill="url(#slw-pud)"' + ink(2.5) + '/><path d="M560 ' + (GY + 2) + " q60 -10 130 -6 M940 " + (GY + 14) + ' q70 -4 120 -12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>';
    if (k === "clear" || k === "cloudy" || k === "wind") for (i = 0; i < 16; i++) { var fx = -80 + (i * 211) % 1760, fy = 740 + (i * 37) % 70; if (fx > 430 && fx < 1180 && fy < 800) continue; bg += k === "wind" ? tuft(fx, fy + 8, 1.2, i) : flower(fx, fy, 9 + (i % 3) * 2, i, false); }
    if (k !== "snow") for (i = 0; i < 14; i++) bg += tuft(-40 + (i * 157) % 1700, 760 + (i * 53) % 80, 1, i);
    /* the soft glow behind the two of them (the site's stage) */
    bg += '<ellipse cx="830" cy="620" rx="560" ry="320" fill="url(#slw-glow)" opacity="' + (s.light === "night" || s.light === "late" ? 0.5 : 0.65) + '"/>';
    /* the near foreground, framing the bottom corners */
    if (k === "clear") fg = flower(140, 870, 20, 0, true) + flower(210, 905, 16, 3, true) + flower(1460, 880, 22, 4, true) + flower(1530, 915, 16, 1, true) + tuft(90, 920, 2, 1) + tuft(1400, 930, 2, 2);
    if (k === "cloudy") fg = flower(120, 890, 18, 1, true) + flower(1490, 895, 20, 3, true) + tuft(200, 930, 2, 1) + tuft(1420, 940, 2, 3);
    if (k === "rain") fg = tuft(100, 930, 2.2, 1) + tuft(1480, 930, 2.2, 2) + flower(180, 900, 16, 3, true);
    if (k === "wind") fg = tuft(80, 930, 2.4, 1) + tuft(200, 940, 2, 2) + tuft(1420, 935, 2.4, 3) + tuft(1530, 945, 2, 4);
    if (k === "snow") fg = '<g><path d="M-80 960 Q 120 880 330 960Z M1300 960 Q 1500 870 1700 960Z" fill="' + T("#ffffff") + '"' + ink(3) + "/></g>";
    return { bg: bg, fg: fg };
  }
  function roomSVG(s) {
    var wall = T("#ecc898"), wallD = T("#d3a774"), wood = T("#8a5a36"), bg = "", fg = "", i;
    bg += '<rect x="-700" y="-1100" width="3000" height="1900" fill="' + wall + '"/>';
    for (i = -600; i < 2300; i += 90) bg += '<path d="M' + i + ' -1100 V700" stroke="' + wallD + '" stroke-width="5" opacity="0.6"/>';
    /* the window and the storm outside it */
    bg += '<rect x="' + (WINR[0] - 26) + '" y="' + (WINR[1] - 26) + '" width="' + (WINR[2] - WINR[0] + 52) + '" height="' + (WINR[3] - WINR[1] + 52) + '" rx="14" fill="' + wood + '"' + ink(3) + "/>" +
      '<rect x="' + WINR[0] + '" y="' + WINR[1] + '" width="' + (WINR[2] - WINR[0]) + '" height="' + (WINR[3] - WINR[1]) + '" rx="6" fill="url(#slw-sky)"' + ink(2.5) + "/>" +
      '<g clip-path="url(#slw-win)">' + cloud(950, 210, 1.1, "w-drift", 0) + cloud(1230, 180, 1.2, "w-drift2", 0) +
      '<path d="M' + WINR[0] + " 470 C 1000 410, 1080 430, 1150 450 S 1300 400, " + WINR[2] + " 440 V" + WINR[3] + " H" + WINR[0] + 'Z" ' + V("far") + "/>" +
      '<path class="w-bolt" d="M1300 190 L1270 270 L1296 270 L1262 352 L1332 250 L1302 250 L1330 190Z" fill="#fff8d6" opacity="0"/>' +
      '<rect class="w-flash" x="' + WINR[0] + '" y="' + WINR[1] + '" width="' + (WINR[2] - WINR[0]) + '" height="' + (WINR[3] - WINR[1]) + '" fill="#eef2ff"/></g>' +
      '<path d="M' + (WINR[0] + WINR[2]) / 2 + " " + WINR[1] + " V" + WINR[3] + " M" + WINR[0] + " " + (WINR[1] + WINR[3]) / 2 + " H" + WINR[2] + '" stroke="' + wood + '" stroke-width="14"/><path d="M' + (WINR[0] + WINR[2]) / 2 + " " + WINR[1] + " V" + WINR[3] + " M" + WINR[0] + " " + (WINR[1] + WINR[3]) / 2 + " H" + WINR[2] + '" fill="none"' + ink(2) + ' stroke-dasharray="0"/>' +
      '<rect x="' + (WINR[0] - 46) + '" y="' + (WINR[3] + 22) + '" width="' + (WINR[2] - WINR[0] + 92) + '" height="22" rx="8" fill="' + wood + '"' + ink(2.5) + "/>";
    /* curtains */
    bg += '<path d="M' + (WINR[0] - 70) + ' 110 Q ' + (WINR[0] - 20) + ' 320 ' + (WINR[0] - 60) + ' 580 L' + (WINR[0] - 130) + ' 580 Q ' + (WINR[0] - 110) + ' 320 ' + (WINR[0] - 140) + ' 110Z" fill="' + T("#e0705f") + '"' + ink(2.5) + "/>" +
      '<path d="M' + (WINR[2] + 70) + ' 110 Q ' + (WINR[2] + 20) + ' 320 ' + (WINR[2] + 60) + ' 580 L' + (WINR[2] + 130) + ' 580 Q ' + (WINR[2] + 110) + ' 320 ' + (WINR[2] + 140) + ' 110Z" fill="' + T("#e0705f") + '"' + ink(2.5) + "/>" +
      '<rect x="' + (WINR[0] - 170) + '" y="96" width="' + (WINR[2] - WINR[0] + 340) + '" height="16" rx="8" fill="' + T("#6b4428") + '"' + ink(2.2) + "/>";
    /* a picture, a shelf and the lamp on its table */
    bg += '<rect x="250" y="170" width="150" height="116" rx="8" fill="' + T("#fff4dc") + '"' + ink(2.5) + '/><path d="M268 268 L310 214 L342 250 L362 228 L384 268Z" fill="' + T("#93cf7e") + '"' + ink(2) + '/><circle cx="356" cy="204" r="12" fill="' + T("#ffc93c") + '"' + ink(2) + "/>";
    bg += '<circle cx="240" cy="470" r="260" fill="url(#slw-lamp)"/>' +
      '<rect x="150" y="560" width="190" height="20" rx="6" fill="' + wood + '"' + ink(2.5) + '/><path d="M170 580 V720 M320 580 V720"' + ink(6) + "/>" +
      '<path d="M236 556 V470"' + ink(5) + '/><ellipse cx="236" cy="556" rx="34" ry="9" fill="' + T("#3a3f55") + '"' + ink(2.2) + "/>" +
      '<path d="M180 470 L204 392 H268 L292 470Z" fill="#ffe7a8"' + ink(2.5) + '/><path d="M190 466 H282" stroke="#ffcf6e" stroke-width="6" opacity="0.8"/>';
    /* floor, skirting and the rug */
    bg += '<rect x="-700" y="690" width="3000" height="1300" fill="url(#slw-grd)"/><rect x="-700" y="676" width="3000" height="22" fill="' + wallD + '"' + ink(2.5) + "/>";
    for (i = -600; i < 2300; i += 150) bg += '<path d="M' + i + ' 700 L' + (i - 80) + ' 1900" stroke="#000" stroke-width="2" opacity="0.12"/>';
    bg += '<ellipse cx="820" cy="' + (GY + 10) + '" rx="520" ry="78" fill="' + T("#e0705f") + '"' + ink(3) + '/><ellipse cx="820" cy="' + (GY + 10) + '" rx="430" ry="56" fill="none" stroke="' + T("#ffd27a") + '" stroke-width="10"/><ellipse cx="820" cy="' + (GY + 10) + '" rx="330" ry="40" fill="none" stroke="' + T("#f4ead6") + '" stroke-width="6" opacity="0.8"/>';
    bg += '<ellipse cx="830" cy="600" rx="560" ry="300" fill="url(#slw-glow)" opacity="0.55"/>';
    /* cushions in front */
    fg = blob([[1430, 860, 120, 70, 30]], 'fill="' + T("#4d8dff") + '"', 3, '<path d="M1450 880 H1530" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.5"/>') + blob([[1300, 880, 110, 60, 28]], 'fill="' + T("#ffc93c") + '"', 3) + blob([[80, 870, 130, 74, 30]], 'fill="' + T("#2bb59a") + '"', 3);
    return { bg: bg, fg: fg };
  }

  /* ---- the toys ---- */
  function propSVG(kind) {
    if (kind === "ball") return '<svg width="90" height="90" viewBox="-45 -45 90 90"><circle r="34" fill="url(#slw-ball)"' + ink(3) + '/><path d="M-30 -6 Q0 10 30 -8" fill="none" stroke="#fff" stroke-width="3" opacity="0.5"/><ellipse cx="-12" cy="-16" rx="10" ry="6" fill="#fff" opacity="0.75" transform="rotate(-30 -12 -16)"/></svg>';
    if (kind === "yarn") return '<svg width="80" height="80" viewBox="-40 -40 80 80"><g class="sl-spin"><circle r="30" fill="' + T("#6ea8ff") + '"' + ink(3) + '/><path d="M-24 -14 Q0 -30 24 -14 M-28 2 Q0 -14 28 2 M-22 16 Q0 2 22 16 M-8 -28 Q-22 0 -8 28 M10 -28 Q24 0 10 28" fill="none" stroke="#2f6fe0" stroke-width="2.4"/></g><ellipse cx="-10" cy="-14" rx="8" ry="5" fill="#fff" opacity="0.6"/></svg>';
    if (kind === "snowball") return '<svg width="200" height="200" viewBox="-100 -100 200 200"><circle r="80" fill="url(#slw-snowball)"' + ink(3) + '/><g class="sl-spin" opacity="0.5" fill="#b9cde6"><circle cx="-30" cy="-20" r="7"/><circle cx="24" cy="10" r="9"/><circle cx="-10" cy="40" r="6"/><circle cx="40" cy="-34" r="5"/></g><ellipse cx="-30" cy="-40" rx="20" ry="11" fill="#fff" opacity="0.9" transform="rotate(-30 -30 -40)"/></svg>';
    if (kind === "leaf") return '<svg width="60" height="60" viewBox="-30 -30 60 60"><path d="M-22 0 Q0 -18 22 0 Q0 18 -22 0Z" fill="#e8892f"' + ink(2) + '/><path d="M-18 0 H18" stroke="#9c4a1a" stroke-width="1.6"/></svg>';
    if (kind === "rope") return '<svg width="1600" height="900" viewBox="0 0 1600 900" style="overflow:visible"><path class="sl-rope-o" fill="none"' + ink(11) + '/><path class="sl-rope" fill="none" stroke="#e9c98a" stroke-width="7" stroke-linecap="round" stroke-dasharray="7 6"/><circle class="sl-knot1" r="10" fill="#e9c98a"' + ink(2.5) + '/><circle class="sl-knot2" r="10" fill="#e9c98a"' + ink(2.5) + "/></svg>";
    return "";
  }

  /* ---- Sunny's weather clothes: layers added to his own drawing, so the face, colours and shape stay his ---- */
  function costumeSVG(kind) {
    function P(r, a) { a = a * Math.PI / 180; return (110 + r * Math.cos(a)).toFixed(1) + " " + (125 + r * Math.sin(a)).toFixed(1); }
    function hood(color, trim) { return '<path d="M' + P(77, -197) + " A77 77 0 1 1 " + P(77, 17) + " L" + P(64, 17) + " A64 64 0 1 0 " + P(64, -197) + ' Z" fill="' + color + '" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>' + (trim ? '<path d="M' + P(66, -190) + " A66 66 0 1 1 " + P(66, 10) + '" fill="none" stroke="' + trim + '" stroke-width="2" opacity="0.8"/>' : ""); }
    function hem(y, color) { var a = Math.asin((y - 125) / 66) * 180 / Math.PI; return '<path d="M' + P(66.5, a) + " A66.5 66.5 0 0 1 " + P(66.5, 180 - a) + ' Z" fill="' + color + '" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>'; }
    if (kind === "rain") return hood("#4d8dff", "#9cc2ff") + hem(156, "#4d8dff") + '<path d="M110 156 V190" stroke="#111" stroke-width="2"/><circle cx="102" cy="166" r="2.6" fill="#ffd54a" stroke="#111" stroke-width="1.4"/><circle cx="102" cy="178" r="2.6" fill="#ffd54a" stroke="#111" stroke-width="1.4"/>';
    if (kind === "snow") return '<path d="M' + P(68, -150) + " A68 68 0 0 1 " + P(68, -30) + ' Z" fill="#4d8dff" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/><path d="M' + P(67, -151) + " L" + P(67, -29) + '" stroke="#2f6fe0" stroke-width="8" stroke-linecap="round"/><path d="M' + P(67, -151) + " L" + P(67, -29) + '" stroke="#111" stroke-width="1.4" opacity="0.5"/>' +
      hem(158, "#de364d") + '<path d="M60 170 Q110 182 160 170 M66 182 Q110 192 154 182" fill="none" stroke="#9e1f33" stroke-width="1.8" opacity="0.7"/>' +
      '<path d="M56 150 Q110 166 164 150 L166 160 Q110 178 54 160 Z" fill="#f4efe6" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><path d="M74 157 l0 7 M90 161 l0 7 M106 163 l0 7 M122 162 l0 7 M138 159 l0 7 M152 155 l0 7" stroke="#de364d" stroke-width="3"/><path d="M140 160 q6 18 -2 30 l10 2 q8 -14 2 -32 z" fill="#f4efe6" stroke="#111" stroke-width="2" stroke-linejoin="round"/>';
    if (kind === "wind") return hem(154, "#2bb59a") + '<path d="M110 154 V190" stroke="#111" stroke-width="2"/><path d="M' + P(66, 26) + ' l12 -10 l-4 14 z" fill="#2bb59a" stroke="#111" stroke-width="2" stroke-linejoin="round"/><path d="M' + P(66, 154) + ' l-12 -10 l4 14 z" fill="#2bb59a" stroke="#111" stroke-width="2" stroke-linejoin="round"/>';
    return "";
  }
  var SCARF = '<svg class="sl-scarf" viewBox="0 0 220 220" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" aria-hidden="true"><path d="M84 116Q128 133 178 117L180 127Q128 144 82 126Z" fill="#de364d" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><path d="M146 128q6 16 -1 30l11 2q6 -16 -1 -31z" fill="#de364d" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/><circle cx="150" cy="130" r="5.5" fill="#c92a42" stroke="#111" stroke-width="2"/></svg>';
  var uid = 0;
  function uniq(svg) { var p = "sl" + (++uid) + "-"; return svg.replace(/id="([\w-]+)"/g, 'id="' + p + '$1"').replace(/url\(#([\w-]+)\)/g, "url(#" + p + "$1)").replace(/href="#([\w-]+)"/g, 'href="#' + p + '$1"'); }

  /* ---- the characters: the site's own drawings; puppy.js is fetched if this page has not loaded it yet ---- */
  function needPuppy() {
    if (win.Puppy || doc.querySelector("script[data-puppy]")) return;
    var sc = doc.createElement("script");
    sc.src = /sunny-story\.js/.test(SELF) ? SELF.replace(/sunny-story\.js/, "puppy.js") : "puppy.js";
    sc.async = true; sc.setAttribute("data-puppy", "");
    (doc.head || html).appendChild(sc);
  }
  function stylesheetOk() { var l = doc.querySelector('link[href*="sunny.css"]'); return !!l && l.media !== "print" && !!l.sheet; }
  function charsReady() {
    if (!(win.Sunny && typeof win.Sunny.art === "function")) return false;
    needPuppy();
    return !!(win.Puppy && typeof win.Puppy.art === "function") && stylesheetOk();
  }

  /* ===================================================================== building the scene */
  var S = null, CL = null, A = null, built = false, cam = { s: 1, tx: 0, ty: 0 }, vw = 0, vh = 0;
  function makeActor(cls, size, inner, over) {
    var a = doc.createElement("div"); a.className = "sl-actor " + cls; a.style.width = size + "px"; a.style.height = size + "px";
    a.innerHTML = '<div class="sl-pose">' + inner + (over || "") + "</div>";
    return { el: a, pose: a.querySelector(".sl-pose"), size: size };
  }
  function shadowEl() { var e = doc.createElement("div"); e.className = "sl-shadow"; return e; }
  function propEl(kind, w, h) { var e = doc.createElement("div"); e.className = "sl-prop"; e.style.width = w + "px"; e.style.height = h + "px"; e.style.margin = (-h / 2) + "px 0 0 " + (-w / 2) + "px"; e.innerHTML = propSVG(kind); return e; }
  function build(withChars) {
    built = true;
    var P = palette(S); LT = LIGHT[S.light] || LIGHT.day;
    if (S.kind === "storm" && S.light !== "day" && S.light !== "morning") { LT = { tone: ["#6a4036", 0.2], lamp: 1, sun: 0, moon: 0, stars: 0, charB: 1 }; } /* indoors at night: the lamp's warm light, not the night's blue */
    for (var k in P) R.world.style.setProperty("--" + k, P[k]);
    ["lamp", "sun", "moon", "stars", "charB"].forEach(function (q) { R.world.style.setProperty("--" + q, String(S.kind === "storm" && q === "lamp" ? 1 : LT[q])); });
    root.style.setProperty("--slBg", P.skyT);
    var w = worldSVG(S), clip = S.kind === "storm" ? '<clipPath id="slw-win"><rect x="' + WINR[0] + '" y="' + WINR[1] + '" width="' + (WINR[2] - WINR[0]) + '" height="' + (WINR[3] - WINR[1]) + '" rx="6"/></clipPath>' : "";
    var svgOpen = '<svg width="1600" height="900" viewBox="0 0 1600 900" aria-hidden="true">';
    R.cam.innerHTML = svgOpen + defs(S).replace("</defs>", clip + "</defs>") + w.bg + '</svg><div class="sl-actors" style="position:absolute;inset:0"></div>' + svgOpen + w.fg + "</svg>";
    var actors = R.cam.querySelector(".sl-actors");
    A = { props: {} };
    if (S.kind === "clear") { A.props.ball = propEl("ball", 90, 90); }
    if (S.kind === "storm") { A.props.ball = propEl("yarn", 80, 80); }
    if (S.kind === "snow") { A.props.snow = propEl("snowball", 200, 200); }
    if (S.kind === "wind") { A.props.leaf1 = propEl("leaf", 60, 60); A.props.leaf2 = propEl("leaf", 60, 60); }
    if (S.kind === "cloudy") { A.props.rope = doc.createElement("div"); A.props.rope.className = "sl-prop"; A.props.rope.innerHTML = propSVG("rope"); }
    A.pShadow = shadowEl(); A.sShadow = shadowEl(); actors.appendChild(A.pShadow); actors.appendChild(A.sShadow);
    if (A.props.snow) { A.props.snowShadow = shadowEl(); actors.appendChild(A.props.snowShadow); actors.appendChild(A.props.snow); }
    if (A.props.ball) { A.props.ballShadow = shadowEl(); actors.appendChild(A.props.ballShadow); }
    if (withChars) {
      A.pup = makeActor("sl-pup", PUP, '<div class="puppy is-in" data-emotion="happy"><div class="puppy__char">' + uniq(win.Puppy.art()) + "</div></div>", S.costume === "snow" ? SCARF : "");
      A.sun = makeActor("sl-sun", SUN, '<div class="sunny is-in" data-emotion="happy"><div class="sunny__char">' + uniq(win.Sunny.art()) + "</div></div>");
      actors.appendChild(A.pup.el); actors.appendChild(A.sun.el);
      A.pupRoot = A.pup.el.querySelector(".puppy"); A.sunRoot = A.sun.el.querySelector(".sunny");
      if (S.costume === "snow") A.pupRoot.classList.add("sl-scarfed");
      dress(A.sunRoot, S.costume);
      if (S.kind === "snow") A.sunRoot.classList.add("sl-push");
      if (S.kind === "wind") { A.sunRoot.classList.add("sl-reach"); A.sunRoot.classList.add("sl-gust"); }
      if (S.kind === "cloudy") A.sunRoot.classList.add("sl-hold");
      A.pupRoot.setAttribute("data-emotion", S.kind === "storm" ? "happy" : "excited");
    }
    ["ball", "rope", "leaf1", "leaf2"].forEach(function (n) { if (A.props[n]) actors.appendChild(A.props[n]); });
    root.classList.toggle("is-windy", S.kind === "wind" || S.wind > 0.6);
    R.world.style.setProperty("--wb", (S.wx > 0.1 ? 2 : -2) + "deg");
    if (S.kind === "storm") { A.flash = R.cam.querySelector(".w-flash"); A.bolt = R.cam.querySelector(".w-bolt"); }
    layout();
    animate(reduced ? 0.6 : 0);
    R.world.classList.add("is-on");
    if (!reduced) { R.cam.classList.add("is-push"); seed(); raf = requestAnimationFrame(frame); }
  }
  function dress(rootEl, kind) {
    if (!kind) return;
    var svg = rootEl.querySelector(".sunny__svg"), body = svg && svg.querySelector(".s-body"), sprout = body && body.querySelector(".s-sprout");
    if (!body) return;
    var g = doc.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "sl-cos");
    g.innerHTML = costumeSVG(kind);
    body.insertBefore(g, sprout || null); /* under the sprout, so it still pokes out of the hood */
    rootEl.classList.add("sl-cos-on"); rootEl.classList.add("sl-cos-" + kind);
  }
  function choose() {
    CL = climateOf(WX.rec, phaseNow()); S = sceneOf(CL);
    R.icon.innerHTML = iconOf(S); R.note.textContent = noteOf(CL, S);
    var said = "Sunny and Puppy " + ACTS[S.kind] + ", " + { morning: "in the morning", day: "in the afternoon", eve: "in the evening", night: "at night", late: "at night" }[S.light] + ".";
    R.world.setAttribute("aria-label", said);
    R.live.textContent = said + " " + R.note.textContent + ".";
  }

  /* ---- the camera: fills the screen; on a tall or narrow screen it keeps both of them, large, in view ---- */
  var FOCUS = [490, 1140];
  function layout() {
    vw = win.innerWidth || html.clientWidth; vh = win.innerHeight || html.clientHeight;
    var s = Math.min(Math.max(vw / W, vh / H), vw / (FOCUS[1] - FOCUS[0] + 40));
    cam.s = s; cam.tx = vw / 2 - (FOCUS[0] + FOCUS[1]) / 2 * s; cam.ty = vh * (vw < vh ? 0.47 : 0.55) - 610 * s;
    R.world.style.transform = "translate(" + cam.tx.toFixed(1) + "px," + cam.ty.toFixed(1) + "px) scale(" + s.toFixed(4) + ")";
    sizeCanvas();
  }
  function wx2(x) { return cam.tx + x * cam.s; } function wy2(y) { return cam.ty + y * cam.s; }

  /* ===================================================================== the play: a few coordinated moves, all loops, nothing random */
  function hopY(u, h) { return u <= 0 || u >= 1 ? 0 : -h * Math.sin(Math.PI * u); }
  function squash(u) { return u > 1 && u < 1.25 ? Math.sin((u - 1) / 0.25 * Math.PI) : 0; } /* the landing, after a hop */
  function setActor(a, x, foot, dy, rot, sx, sy) {
    a.el.style.transform = "translate(" + (x - a.size / 2).toFixed(1) + "px," + (GY - a.size * foot).toFixed(1) + "px)";
    a.pose.style.transform = "translateY(" + dy.toFixed(1) + "px) rotate(" + (rot || 0).toFixed(2) + "deg) scale(" + (sx || 1).toFixed(3) + "," + (sy || 1).toFixed(3) + ")";
  }
  function shadow(el, x, lift, w) { var k = Math.max(0.5, 1 - lift / 180); el.style.transform = "translate(" + x.toFixed(1) + "px," + (GY - 2) + "px) scale(" + (w / 100 * k).toFixed(3) + "," + (k).toFixed(3) + ")"; el.style.opacity = (0.4 + 0.6 * k).toFixed(2); }
  function place(el, x, y, rot) { el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)" + (rot != null ? " rotate(" + rot.toFixed(1) + "deg)" : ""); }
  function look(r, hr, hy) { if (!r) return; r.style.setProperty("--hr", hr.toFixed(2) + "deg"); r.style.setProperty("--hy", hy.toFixed(1) + "px"); }
  var lastLand = { p: -1, s: -1 }, nextLaugh = 4, boltAt = 3 + 2.5, boltT = -1, blinkAt = 2.5;
  function animate(t) {
    if (!A) return;
    var k = S.kind, pdx = 0, pdy = 0, prot = 0, psx = 1, psy = 1, sdx = 0, sdy = 0, srot = 0, ssx = 1, ssy = 1, u, ph;
    var breathe = Math.sin(t * 2.1) * 0.012;
    if (k === "clear") {
      /* the ball bounces between them; Puppy pounces when it comes his way, Sunny bumps it back */
      var Pd = 1.25; ph = (t % (2 * Pd)) / Pd; var toSun = ph < 1, f = toSun ? ph : ph - 1;
      var bx = toSun ? 770 + (860 - 770) * f : 860 - (860 - 770) * f, by = GY - 34 + hopY(f, 150);
      place(A.props.ball, bx, by, bx * 2.2); shadow(A.props.ballShadow, bx, GY - 34 - by, 70);
      u = ((t + Pd * 0.15) % (2 * Pd)) / (Pd * 0.55); pdy = hopY(u, 34); if (squash(u)) { psy = 1 - 0.05 * squash(u); psx = 1 + 0.04 * squash(u); }
      prot = 3 * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
      u = ((t + Pd * 1.15) % (2 * Pd)) / (Pd * 0.5); sdy = hopY(u, 18);
      look(A.pupRoot, -3 * Math.max(0, -by + GY - 34) / 150, -8 * Math.max(0, -by + GY - 34) / 150);
    } else if (k === "cloudy") {
      /* tug of war: they lean back in turn and the rope goes with them */
      var pull = Math.sin(t * 2.3), d = 9 * pull;
      pdx = d; sdx = d; prot = -2.5 - 2 * pull; srot = 2.5 - 2 * pull;
      var p0 = [PX - PUP / 2 + 0.745 * PUP + d, GY - PUP * PFOOT + 0.53 * PUP], p1 = [SX - SUN / 2 + 0.2 * SUN + d, GY - SUN * SFOOT + 0.6 * SUN];
      var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2 + 12 + 4 * Math.cos(t * 4.6), path = "M" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + p1[0].toFixed(1) + " " + p1[1].toFixed(1);
      var rp = A.props.rope; rp.querySelector(".sl-rope").setAttribute("d", path); rp.querySelector(".sl-rope-o").setAttribute("d", path);
      rp.querySelector(".sl-knot1").setAttribute("cx", p0[0] + 8); rp.querySelector(".sl-knot1").setAttribute("cy", p0[1] + 2);
      rp.querySelector(".sl-knot2").setAttribute("cx", p1[0] - 8); rp.querySelector(".sl-knot2").setAttribute("cy", p1[1] + 2);
    } else if (k === "rain") {
      /* together, into the puddle: up, splash, up again */
      var Pr = 1.7;
      u = (t % Pr) / (Pr * 0.42); sdy = hopY(u, 58); if (squash(u)) { ssy = 1 - 0.06 * squash(u); ssx = 1 + 0.05 * squash(u); }
      var u2 = ((t - 0.12 + Pr) % Pr) / (Pr * 0.42); pdy = hopY(u2, 70); if (squash(u2)) { psy = 1 - 0.07 * squash(u2); psx = 1 + 0.05 * squash(u2); }
      var n = Math.floor(t / Pr); if (u >= 1 && lastLand.s !== n) { lastLand.s = n; splashAt(SX, GY + 4, 1); } if (u2 >= 1 && lastLand.p !== n) { lastLand.p = n; splashAt(PX + 10, GY + 4, 0.9); }
    } else if (k === "snow") {
      /* Sunny rolls the big snowball; Puppy bounds about beside it */
      srot = -5 + Math.sin(t * 3) * 1.2; sdx = Math.sin(t * 1.5) * 6;
      place(A.props.snow, 812 + sdx, GY - 80, (t * 40) % 360 * 0 + sdx * 0.8); A.props.snow.querySelector(".sl-spin").style.transform = "rotate(" + (-t * 30 % 360).toFixed(1) + "deg)";
      shadow(A.props.snowShadow, 812 + sdx, 0, 170);
      var Ps = 0.9; u = (t % Ps) / (Ps * 0.7); pdy = hopY(u, 30); pdx = -40 + 40 * Math.sin(t * Math.PI / (Ps * 2)); prot = 4 * Math.cos(t * Math.PI / (Ps * 2));
      var ns = Math.floor(t / Ps); if (u >= 1 && lastLand.p !== ns) { lastLand.p = ns; prints.push({ x: PX + pdx - 20, y: GY + 6, a: 1 }, { x: PX + pdx + 24, y: GY + 10, a: 1 }); if (prints.length > 24) prints.splice(0, 2); }
    } else if (k === "wind") {
      /* the leaves: one dances round Sunny's raised hand, the other teases Puppy, who jumps for it */
      var hx = SX - SUN / 2 + 0.83 * SUN, hy = GY - SUN * SFOOT + 0.2 * SUN;
      place(A.props.leaf1, hx + 40 * Math.cos(t * 1.7), hy - 30 + 24 * Math.sin(t * 3.4), 30 * Math.sin(t * 2.4));
      var Pw = 2.2; u = (t % Pw) / (Pw * 0.38); pdy = hopY(u, 64); if (squash(u)) { psy = 1 - 0.06 * squash(u); }
      place(A.props.leaf2, PX + 30 + 30 * Math.sin(t * 1.1), GY - PUP - 40 + 22 * Math.sin(t * 2.2) + Math.min(0, pdy * 0.3), 40 * Math.sin(t * 1.9));
      look(A.pupRoot, -3, -10); sdy = Math.sin(t * 2.6) * 4; srot = Math.sin(t * 1.3) * 2;
    } else if (k === "storm") {
      /* by the window: Sunny rolls the yarn, Puppy paws it back */
      var yx = 808 + 46 * Math.sin(t * 1.5);
      place(A.props.ball, yx, GY - 26, null); A.props.ball.querySelector(".sl-spin").style.transform = "rotate(" + ((yx - 808) * 2).toFixed(1) + "deg)";
      ssy = 0.95; ssx = 1.04; sdy = 8; srot = Math.sin(t * 1.5) * 2;
      var near = Math.max(0, -Math.sin(t * 1.5)); prot = 5 * near; pdx = 14 * near; pdy = -8 * Math.max(0, Math.sin(t * 3 + 1)) * near;
      look(A.pupRoot, 3 * near, 8 * near);
    }
    if (A.pup) { setActor(A.pup, PX + pdx, PFOOT, pdy, prot, psx, psy * (1 + breathe)); shadow(A.pShadow, PX + pdx + 8, -pdy, 170); }
    if (A.sun) { setActor(A.sun, SX + sdx, SFOOT, sdy, srot, ssx, ssy * (1 - breathe * 0.6)); shadow(A.sShadow, SX + sdx, -sdy, 150); }
    /* now and then Sunny laughs, and Puppy blinks */
    if (A.sunRoot && t > nextLaugh) { nextLaugh = t + 6 + (t * 7 % 3); A.sunRoot.setAttribute("data-emotion", "laugh"); setTimeout(function () { if (A && A.sunRoot) A.sunRoot.setAttribute("data-emotion", "happy"); }, 1600); }
    if (A.pupRoot && t > blinkAt) { blinkAt = t + 2.6 + (t * 13 % 2); A.pupRoot.classList.add("is-blink"); setTimeout(function () { if (A && A.pupRoot) A.pupRoot.classList.remove("is-blink"); }, 120); }
    /* lightning, far away and soft: a flicker in the window; Puppy's ears perk, nothing more */
    if (A.flash) {
      if (t > boltAt && boltT < 0) boltT = 0;
      if (boltT >= 0) {
        boltT += 1 / 60; var b = boltT < 0.09 ? 0.75 : boltT < 0.17 ? 0.1 : boltT < 0.3 ? 0.5 : Math.max(0, 0.5 - (boltT - 0.3) * 1.1);
        A.flash.style.opacity = (b * 0.8).toFixed(3); A.bolt.style.opacity = (b > 0.3 ? 1 : 0).toString();
        if (A.pupRoot) A.pupRoot.classList.toggle("is-perk", boltT < 1.2);
        if (boltT > 1.3) { boltT = -1; boltAt = t + 8 + (t * 3 % 5); A.flash.style.opacity = "0"; A.bolt.style.opacity = "0"; }
      }
    }
  }

  /* ===================================================================== the weather, drawn: rain, splashes, ripples, snow, prints, leaves, motes, fireflies */
  var cv = R.fx, g = cv.getContext ? cv.getContext("2d") : null, DPR = Math.min(1.5, win.devicePixelRatio || 1);
  var drops = [], flakes = [], leaves = [], motes = [], rings = [], drips = [], prints = [], raf = 0, lastT = 0, clock = 0, ringAcc = 0, glowSprite = null;
  function sizeCanvas() { if (!g) return; cv.width = Math.round(vw * DPR); cv.height = Math.round(vh * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function areaK() { return Math.max(0.45, Math.min(1.2, (vw * vh) / (1440 * 900))); }
  function sprite(r, c) {
    var s = doc.createElement("canvas"); s.width = s.height = r * 2; var x = s.getContext("2d"), gr = x.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, "rgba(" + c + ",1)"); gr.addColorStop(0.3, "rgba(" + c + ",0.5)"); gr.addColorStop(1, "rgba(" + c + ",0)"); x.fillStyle = gr; x.fillRect(0, 0, r * 2, r * 2); return s;
  }
  var LEAF_C = ["#e8892f", "#d9622b", "#f0b13c", "#c94a2a"], PETAL_C = ["#ffffff", "#ffd9e4", "#fff3b8"];
  function newDrop(any) { var near = Math.random() < 0.35; return { x: rnd(-0.1, 1.1) * vw, y: any ? rnd(0, vh) : rnd(-0.3, 0) * vh, v: near ? rnd(1100, 1400) : rnd(750, 950), len: near ? rnd(20, 28) : rnd(11, 16), a: near ? 0.55 : 0.32, w: near ? 2.2 : 1.5 }; }
  function newFlake(any) { var near = Math.random() < 0.3; return { x: rnd(-0.05, 1.05) * vw, y: any ? rnd(0, vh) : rnd(-0.1, 0) * vh, r: near ? rnd(3.2, 4.8) : rnd(1.4, 2.6), v: near ? rnd(55, 85) : rnd(28, 50), ph: rnd(0, 6.3), a: near ? 0.95 : 0.7 }; }
  function newLeaf(any, petal) { var dir = S.wx > 0.1 ? 1 : -1; return { x: any ? rnd(0, vw) : dir > 0 ? rnd(-0.25, -0.02) * vw : rnd(1.02, 1.25) * vw, y: rnd(0.05, 0.8) * vh, vx: dir * rnd(110, 220) * (0.5 + S.wind), vy: rnd(-10, 30), rot: rnd(0, 6.3), vr: rnd(-3, 3), s: (petal ? rnd(5, 7) : rnd(10, 15)) * Math.max(0.6, cam.s), ph: rnd(0, 6.3), c: (petal ? PETAL_C : LEAF_C)[(Math.random() * (petal ? 3 : 4)) | 0], petal: petal }; }
  function newMote(fly) { var side = Math.random(); return { x: wx2(side < 0.4 ? rnd(200, 480) : side < 0.8 ? rnd(1150, 1450) : rnd(480, 1150)), y: wy2(side < 0.8 ? rnd(420, 780) : rnd(330, 420)), vx: rnd(-8, 8), vy: rnd(-10, -2), ph: rnd(0, 6.3), sp: rnd(0.6, 1.4), r: fly ? rnd(5, 8) : rnd(3, 6), fly: fly }; }
  function seed() {
    if (!g) return;
    var k = areaK(), i, n;
    drops = []; flakes = []; leaves = []; motes = []; rings = []; drips = [];
    if (S.rain) { n = Math.round((S.kind === "storm" ? 60 : 45 + 60 * Math.min(1.5, S.rain)) * k); for (i = 0; i < n; i++) drops.push(newDrop(true)); }
    if (S.snow) { n = Math.round((40 + 50 * Math.min(1.6, S.snow)) * k); for (i = 0; i < n; i++) flakes.push(newFlake(true)); }
    var windy = S.kind === "wind" ? 14 : (S.kind === "clear" || S.kind === "cloudy") && S.wind > 0.55 ? 5 : 0; /* wind as a layer on calmer scenes */
    for (i = 0; i < Math.round(windy * Math.max(0.6, k)); i++) leaves.push(newLeaf(true, S.kind !== "wind"));
    var night = S.light === "night" || S.light === "late";
    if (S.kind === "clear" || S.kind === "cloudy" || S.kind === "wind") { n = night ? (S.kind === "clear" ? 12 : 6) : S.fog ? 0 : 8; for (i = 0; i < n; i++) motes.push(newMote(night)); }
    glowSprite = night ? sprite(16, "220,255,140") : sprite(12, "255,244,206");
  }
  function splashAt(x, y, k) {
    if (!g || reduced) return;
    for (var i = 0; i < 9; i++) { var a = -Math.PI * (0.12 + 0.76 * i / 8); drips.push({ x: wx2(x + rnd(-30, 30)), y: wy2(y), vx: Math.cos(a) * rnd(120, 260) * cam.s * k, vy: Math.sin(a) * rnd(220, 380) * cam.s * k, t: 0 }); }
    rings.push({ x: wx2(x), y: wy2(y + 6), t: 0, m: 0.9, big: 1 });
  }
  function frame(now) {
    if (done) return;
    raf = requestAnimationFrame(frame);
    if (doc.hidden) { lastT = 0; return; }
    var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0; lastT = now; clock += dt;
    animate(clock);
    if (!g) return;
    g.clearRect(0, 0, vw, vh);
    var slant = (S.wx > 0.1 ? 1 : -1) * Math.min(0.5, 0.08 + S.wind * 0.4), i, p, s = cam.s;
    if (drops.length) {
      var clip = S.kind === "storm";
      if (clip) { g.save(); g.beginPath(); g.rect(wx2(WINR[0]), wy2(WINR[1]), (WINR[2] - WINR[0]) * s, (WINR[3] - WINR[1]) * s); g.clip(); }
      g.strokeStyle = "#dbe8ff"; g.lineCap = "round";
      for (i = 0; i < drops.length; i++) {
        p = drops[i]; p.y += p.v * dt; p.x += p.v * slant * dt;
        if (p.y - p.len > vh || p.x < -0.15 * vw || p.x > 1.15 * vw) { drops[i] = newDrop(false); continue; }
        g.globalAlpha = p.a; g.lineWidth = p.w; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.len * slant, p.y - p.len); g.stroke();
      }
      if (clip) g.restore();
      if (S.kind === "rain") { /* rain rings on the puddle */
        ringAcc += dt * (3 + 4 * S.rain);
        while (ringAcc > 1) { ringAcc -= 1; rings.push({ x: wx2(rnd(480, 1180)), y: wy2(GY + rnd(-14, 30)), t: 0, m: rnd(0.7, 1.1) }); }
      }
    }
    if (rings.length) {
      g.strokeStyle = "#ffffff"; g.lineWidth = 1.6;
      for (i = rings.length - 1; i >= 0; i--) {
        var r = rings[i]; r.t += dt / r.m; if (r.t >= 1) { rings.splice(i, 1); continue; }
        var rad = (r.big ? 10 + r.t * 70 : 4 + r.t * 22) * s; g.globalAlpha = 0.6 * (1 - r.t);
        g.beginPath(); g.ellipse(r.x, r.y, rad, rad * 0.25, 0, 0, Math.PI * 2); g.stroke();
      }
    }
    if (drips.length) {
      for (i = drips.length - 1; i >= 0; i--) {
        p = drips[i]; p.t += dt; p.vy += 900 * s * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > 0.7) { drips.splice(i, 1); continue; }
        g.globalAlpha = 1; g.fillStyle = "#cfe3ff"; g.strokeStyle = INK; g.lineWidth = 1.4;
        g.beginPath(); g.arc(p.x, p.y, 4.2 * s, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    }
    if (prints.length) {
      g.fillStyle = "#9fb6d8";
      for (i = prints.length - 1; i >= 0; i--) { p = prints[i]; p.a -= dt * 0.18; if (p.a <= 0) { prints.splice(i, 1); continue; } g.globalAlpha = 0.6 * p.a; g.beginPath(); g.ellipse(wx2(p.x), wy2(p.y), 9 * s, 4 * s, 0, 0, Math.PI * 2); g.fill(); }
    }
    if (flakes.length) {
      g.fillStyle = "#fff"; var sway = S.wx > 0.1 ? 1 : -1;
      for (i = 0; i < flakes.length; i++) {
        p = flakes[i]; p.ph += dt * 1.3; p.y += p.v * dt; p.x += (Math.sin(p.ph) * 14 + sway * S.wind * 60) * dt * (p.r / 2.5);
        if (p.y > vh + 6 || p.x < -0.08 * vw || p.x > 1.08 * vw) { flakes[i] = newFlake(false); continue; }
        g.globalAlpha = p.a; g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
      }
    }
    g.lineWidth = 1.6; g.strokeStyle = INK;
    for (i = 0; i < leaves.length; i++) {
      p = leaves[i]; p.ph += dt * 2; p.x += p.vx * dt; p.y += (p.vy + Math.sin(p.ph) * 40) * dt; p.rot += p.vr * dt;
      if (p.x < -0.3 * vw || p.x > 1.3 * vw || p.y > vh + 20) { leaves[i] = newLeaf(false, p.petal); continue; }
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.ph * 0.7))); g.globalAlpha = 1; g.fillStyle = p.c;
      g.beginPath(); g.moveTo(-p.s, 0); g.quadraticCurveTo(0, -p.s * 0.8, p.s, 0); g.quadraticCurveTo(0, p.s * 0.8, -p.s, 0); g.fill(); g.stroke(); g.restore();
    }
    for (i = 0; i < motes.length; i++) {
      p = motes[i]; p.ph += dt * p.sp; p.x += (p.vx + Math.sin(p.ph) * 10) * dt; p.y += (p.vy + Math.cos(p.ph * 0.8) * 8) * dt;
      if (p.y < wy2(300) || p.x < -20 || p.x > vw + 20 || (p.x > wx2(500) && p.x < wx2(1130) && p.y > wy2(430) && p.y < wy2(740))) /* beside them or above, never across their faces */ { motes[i] = newMote(p.fly); continue; }
      var tw = p.fly ? 0.35 + 0.65 * Math.max(0, Math.sin(p.ph * 2.1)) : 0.3 + 0.25 * Math.sin(p.ph * 1.7);
      g.globalAlpha = tw; g.drawImage(glowSprite, p.x - p.r * 2, p.y - p.r * 2, p.r * 4, p.r * 4);
    }
    g.globalAlpha = 1;
  }

  /* ===================================================================== the real progress: the page, the weather, the characters */
  var P = { dom: 0, res: 0, wx: 0, art: 0 }, WT = { dom: 1, res: 4, wx: 1, art: 2 }, shown = 0, lastPct = -1, done = false, artErr = null, endTimer = 0;
  function resFrac() {
    if (doc.readyState === "complete") return 1;
    var n = 0, d = 0;
    Array.prototype.forEach.call(doc.images, function (im) { if (root.contains(im) || im.loading === "lazy") return; n++; if (im.complete) d++; });
    Array.prototype.forEach.call(doc.querySelectorAll('link[rel="stylesheet"]'), function (l) { if (l.media === "print") return; n++; if (l.sheet) d++; });
    if (doc.fonts) { n++; if (doc.fonts.status === "loaded") d++; }
    return n ? Math.min(0.95, d / n) : 0; /* the rest is the window's own load event */
  }
  function tick() {
    if (done) return;
    if (!S && WX.done) choose();
    if (S && !built) {
      if (charsReady()) { P.art = 1; try { build(true); } catch (e) { artErr = String(e && e.message || e); built = true; P.art = 1; } }
      else if (Date.now() - T0 > 6000) { P.art = 1; artErr = "the characters did not arrive"; try { build(false); } catch (e2) { built = true; } } /* the world alone, never an empty screen */
    }
    P.dom = doc.readyState === "loading" ? 0 : 1; P.res = resFrac(); P.wx = WX.done ? 1 : 0;
    var sum = 0, tot = 0; for (var k in P) { sum += P[k] * WT[k]; tot += WT[k]; }
    shown = Math.max(shown, sum / tot);
    var pct = Math.round(shown * 100);
    if (pct !== lastPct) { lastPct = pct; R.fill.style.transform = "scaleX(" + shown.toFixed(3) + ")"; R.pct.textContent = pct + "%"; R.bar.setAttribute("aria-valuenow", String(pct)); }
    var all = P.dom && P.res === 1 && P.wx && P.art;
    if (all && !endTimer) { R.label.textContent = hold ? "Loaded (held for checking)" : "Ready"; if (!hold) endTimer = setTimeout(function () { finish(false); }, 380); } /* time for the bar to reach the end */
    if (!hold && Date.now() - T0 > 10000) finish(false); /* a slow resource never holds the site back */
  }
  var timer = setInterval(tick, 100); tick();
  function finish(skipped) {
    if (done) return; done = true; clearInterval(timer); clearTimeout(endTimer);
    sess("sunny:loader", "1");
    root.classList.add("is-out");
    setTimeout(function () {
      cancelAnimationFrame(raf);
      html.classList.remove("sl-on");
      if (root.parentNode) root.parentNode.removeChild(root);
      if (style.parentNode) style.parentNode.removeChild(style);
      win.removeEventListener("keydown", onKey); win.removeEventListener("resize", onResize);
      A = null;
      if (pref("puppy:met") !== "1") { store("puppy:met", "1"); afterStory(); }
    }, 950);
  }
  function onKey(e) { if (e.key === "Escape") { e.preventDefault(); finish(true); } }
  var rsz = 0; function onResize() { clearTimeout(rsz); rsz = setTimeout(function () { layout(); if (built && !reduced) seed(); }, 120); }
  R.skip.addEventListener("click", function () { finish(true); });
  win.addEventListener("keydown", onKey); win.addEventListener("resize", onResize);
  layout();

  /* for checking, in the console */
  win.SunnyStory = {
    state: function () { return { scene: S && S.kind, light: S && S.light, phase: S && S.phase, costume: S && S.costume, fog: S && S.fog, rain: S && +S.rain.toFixed(2), snow: S && +S.snow.toFixed(2), wind: S && +S.wind.toFixed(2), camera: cam, characters: !!(A && A.sun), progress: Math.round(shown * 100), tasks: { page: P.dom, resources: +P.res.toFixed(2), weather: P.wx, characters: P.art }, error: artErr, note: R.note.textContent, done: done }; },
    weather: function () { var c = CL; return { source: WX.src, location: WX.loc, error: WX.err, ageMinutes: WX.fetchedAt ? +((Date.now() - WX.fetchedAt) / 60000).toFixed(1) : null, reading: WX.rec,
      climate: c && { kind: c.kind, sub: c.sub, phase: c.phase, dark: c.dark, heat: c.heat, cold: c.cold, frost: !!c.frost, clearing: !!c.clearing, cloud: +c.cloud.toFixed(2), wind: +c.wind.toFixed(2), blowsRight: c.wx > 0.1, temp: c.temp } }; },
    at: function (t) { clock = t; animate(t); } /* a moment of the play, for stills */
  };

  /* ===================================================================== afterwards, on the first visit only: both in the corner, then Puppy goes home */
  var HOME_LINE = "I'm heading home. Need me? You can turn me on anytime from Accessibility settings.";
  function afterStory() {
    var tries = 0, t = setInterval(function () {
      var Sn = win.Sunny;
      if (!(Sn && Sn.el && Sn.setMode)) { if (++tries > 60) clearInterval(t); return; }
      clearInterval(t);
      if (Sn.mode() !== "sunny") return; /* the visitor already keeps Puppy around */
      Sn.setMode("together", { temp: true });
      setTimeout(function () {
        if (!(win.Puppy && win.Puppy.goHome) || Sn.mode() !== "together") return;
        win.Puppy.goHome(HOME_LINE, function () { if (Sn.mode() === "together" && pref("pref:companion") !== "together") Sn.setMode("sunny", { temp: true }); });
        setTimeout(function () { if (Sn.say) Sn.say("See you later, buddy.", 2600); }, 7000);
      }, 10000);
    }, 200);
  }
})();
