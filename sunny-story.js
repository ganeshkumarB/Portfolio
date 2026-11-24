/* Sunny & Puppy: the loading screen. While the site loads, one rendered scene of Sunny and Puppy
   playing together, chosen for the real weather and the local time where the visitor is:
   a ball in the meadow when it is clear, a rope toy under a grey sky, puddle jumping in the
   rain, a snowball in the snow, leaves in the wind, and a yarn ball by the window, safe
   indoors, when there is a thunderstorm. Morning, afternoon, evening and night light the scene;
   that is separate from the weather. One session, one scene: it is chosen once, before
   anything is shown, and never changes while it is on screen.

   The progress bar is the real loading: the page's own document, images, stylesheets and
   fonts, the weather check and the scene's picture. Nothing is delayed to make it last; the
   screen fades out as soon as all of it has finished (or after 10 s at most, so a slow
   resource never holds the site back). Skip with the button or Escape.

   It shows on the first page of a browser session (sessionStorage "sunny:loader"); add
   ?story to the address to see it again. The art is in assets/loader/<climate>-<light>.jpg;
   only the gentle motion is added here: a slow camera push, the characters breathing and
   bouncing (a masked copy of the picture, moved a few pixels), and the weather itself, drawn
   on one canvas. Reduced motion shows the picture still.

   Loaded as the first script in <body>, synchronously, so the screen is up before the page
   paints. For checking: &hold=1 keeps it on screen, and SunnyStory.state() / .weather() in
   the console; the weather test parameters are listed above the weather code below. */
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
  var BASE = /sunny-story\.js/.test(SELF) ? SELF.replace(/sunny-story\.js.*$/, "") : "";
  var reduced = (win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches) || pref("pref:motion") === "reduce";
  var hold = qs.has("hold");
  if (pref("theme") === "dark") html.setAttribute("data-theme", "dark");
  var T0 = Date.now();

  /* ===================================================================== styles */
  var CSS = `
html.sl-on { overflow: hidden !important; }
html.sl-on body > .sunny, html.sl-on body > .puppy, html.sl-on .to-top { visibility: hidden !important; }
.sl { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; color: #fff; background: var(--slBg, #0d1628); font-family: "Inter", system-ui, sans-serif; transition: opacity 0.9s ease; -webkit-user-select: none; user-select: none; }
.sl.is-out { opacity: 0; pointer-events: none; }
.sl-back { position: absolute; inset: -60px; background-size: cover; background-position: center; filter: blur(26px) brightness(0.62) saturate(1.1); opacity: 0; transition: opacity 0.8s ease; }
.sl.is-band .sl-back.is-on { opacity: 1; }
.sl-frame { position: absolute; left: 0; top: 0; opacity: 0; transition: opacity 0.8s ease; }
.sl-frame.is-on { opacity: 1; }
.sl.is-band .sl-frame { -webkit-mask-image: linear-gradient(to bottom, transparent 0, rgba(0, 0, 0, 0.55) 7%, #000 20%, #000 80%, rgba(0, 0, 0, 0.55) 93%, transparent 100%); mask-image: linear-gradient(to bottom, transparent 0, rgba(0, 0, 0, 0.55) 7%, #000 20%, #000 80%, rgba(0, 0, 0, 0.55) 93%, transparent 100%); }
.sl-cam { position: absolute; inset: 0; transform-origin: var(--fx, 50%) var(--fy, 50%); }
.sl-cam.is-push { animation: sl-push 26s cubic-bezier(0.25, 0.1, 0.25, 1) forwards; }
@keyframes sl-push { from { transform: scale(1); } to { transform: scale(1.045); } }
.sl-img, .sl-cg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.sl-cg { background-size: 100% 100%; background-repeat: no-repeat; will-change: transform; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
.sl-cg.m-b { animation-name: sl-breathe; animation-duration: 3s; }
.sl-cg.m-f { animation-name: sl-float; animation-duration: 2.4s; }
.sl-cg.m-ball { animation-name: sl-ball; animation-duration: 1.5s; animation-timing-function: linear; }
@keyframes sl-breathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.006, 1.017); } }
@keyframes sl-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.55%); } }
@keyframes sl-ball { 0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1); } 50% { transform: translateY(-1.3%); animation-timing-function: cubic-bezier(0.6, 0, 0.8, 0.4); } 100% { transform: translateY(0); } }
.sl-grade { position: absolute; inset: 0; pointer-events: none; }
.sl-mist { position: absolute; inset: -10% -30%; pointer-events: none; opacity: 0; background: radial-gradient(40% 30% at 30% 70%, rgba(228, 234, 240, 0.55), transparent 70%), radial-gradient(45% 28% at 75% 60%, rgba(228, 234, 240, 0.45), transparent 70%), linear-gradient(to top, rgba(226, 232, 238, 0.5), rgba(226, 232, 238, 0) 60%); }
.sl.is-fog .sl-mist { opacity: 0.75; animation: sl-mist 30s ease-in-out infinite alternate; }
@keyframes sl-mist { from { transform: translateX(-4%); } to { transform: translateX(4%); } }
.sl-flash { position: absolute; pointer-events: none; opacity: 0; mix-blend-mode: screen; background: radial-gradient(60% 70% at 70% 40%, rgba(225, 232, 255, 0.95), rgba(190, 205, 255, 0.35) 55%, rgba(190, 205, 255, 0) 80%); }
.sl-glow { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: rgba(205, 215, 255, 0.5); mix-blend-mode: soft-light; }
.sl-fx { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.sl-scrim { position: absolute; left: 0; right: 0; bottom: 0; height: 42%; pointer-events: none; background: linear-gradient(to top, rgba(6, 10, 20, 0.72), rgba(6, 10, 20, 0.32) 45%, rgba(6, 10, 20, 0)); }
.sl-ui { position: absolute; left: max(24px, 5vw); bottom: max(24px, 6vh); width: min(420px, calc(100vw - 48px)); }
.sl-wx { display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px 7px 10px; border-radius: 999px; background: rgba(8, 14, 28, 0.5); border: 1px solid rgba(255, 255, 255, 0.16); font-size: 13px; line-height: 1.3; letter-spacing: 0.01em; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.sl-wx svg { width: 18px; height: 18px; flex: none; }
.sl-row { display: flex; justify-content: space-between; align-items: baseline; margin: 16px 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.92); }
.sl-pct { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: rgba(255, 255, 255, 0.8); font-variant-numeric: tabular-nums; }
.sl-bar { height: 4px; border-radius: 4px; background: rgba(255, 255, 255, 0.22); overflow: hidden; }
.sl-bar i { display: block; height: 100%; width: 100%; border-radius: inherit; background: linear-gradient(90deg, #ffd24d, #ffe58f); transform-origin: 0 50%; transform: scaleX(0); transition: transform 0.35s ease-out; }
.sl-skip { position: absolute; top: max(16px, 3vh); right: max(16px, 3vw); padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.28); background: rgba(8, 14, 28, 0.45); color: #fff; font: 500 13px/1 "Inter", system-ui, sans-serif; cursor: pointer; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.sl-skip:hover { background: rgba(8, 14, 28, 0.7); }
.sl-skip:focus-visible { outline: 2px solid #ffd24d; outline-offset: 2px; }
.sl-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 640px) { .sl-ui { left: 20px; right: 20px; width: auto; bottom: max(28px, 5vh); } .sl-wx { font-size: 12.5px; } }
@media (prefers-reduced-motion: reduce) { .sl-cam.is-push, .sl-cg, .sl.is-fog .sl-mist { animation: none !important; } .sl-bar i { transition: none; } }
.sl.is-still .sl-cam, .sl.is-still .sl-cg, .sl.is-still .sl-mist { animation: none !important; }
`;
  var style = doc.createElement("style"); style.textContent = CSS; (doc.head || html).appendChild(style);
  var DOM = '<div class="sl-back" data-r="back"></div>' +
    '<div class="sl-frame" data-r="frame" role="img"><div class="sl-cam" data-r="cam"></div></div>' +
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
  (function () { var h = new Date().getHours(); root.style.setProperty("--slBg", h >= 6 && h < 17 ? "linear-gradient(#4d7ea8, #1a2f4a)" : h >= 17 && h < 20 ? "linear-gradient(#8a5a6e, #241d38)" : "linear-gradient(#17244a, #070c1a)"); })();

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
  var LIGHTS = { sunrise: "day", morning: "day", midday: "day", afternoon: "day", sunset: "eve", evening: "eve", night: "night", latenight: "night" };
  var PART = { sunrise: "Morning", morning: "Morning", midday: "Afternoon", afternoon: "Afternoon", sunset: "Evening", evening: "Evening", night: "Night", latenight: "Night" };
  /* priority: thunderstorm, snow, rain, strong wind, cloudy, clear (climateOf already sorts them so); wind is also a layer */
  function sceneOf(cl) {
    var k = cl.kind, s = { kind: "cloudy", fog: false, rain: 0, snow: 0, wind: cl.wind, wx: cl.wx, known: cl.known };
    if (!cl.known) s.kind = "cloudy"; /* no reading: the quiet garden, with no weather claimed */
    else if (k === "storm") { s.kind = "storm"; s.rain = Math.max(1.2, cl.rain); s.wind = Math.max(0.6, cl.wind); }
    else if (k === "snow") s.kind = "snow", s.snow = Math.max(0.45, cl.snow);
    else if (k === "rain") s.kind = "rain", s.rain = Math.max(0.4, cl.rain);
    else if (k === "wind") s.kind = "wind", s.wind = Math.max(0.7, cl.wind);
    else if (k === "fog") s.kind = "cloudy", s.fog = true;
    else s.kind = cl.sub === "overcast" || cl.cloud >= 0.7 ? "cloudy" : "clear";
    var light = LIGHTS[cl.phase] || "day", file = s.kind + "-" + light, grade = "";
    if (cl.phase === "sunrise" || cl.phase === "morning") grade = "morning";
    if (cl.phase === "latenight") grade = "late";
    if (cl.heat && light === "day") grade = "heat";
    if (s.kind === "storm" && light === "eve") file = "storm-night"; /* indoors, the lamp is on by dusk */
    if (s.kind === "cloudy" && light === "night") { file = "cloudy-eve"; grade = "night"; } /* the dusk picture, darkened */
    s.light = light; s.file = file; s.grade = grade; s.phase = cl.phase;
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
    var night = s.light === "night", p;
    if (s.kind === "clear") p = night ? '<path d="M15.2 3.6a8.4 8.4 0 1 0 5.2 13.6A7 7 0 0 1 15.2 3.6z" fill="#e8ecff"/>' : '<circle cx="12" cy="12" r="4.4" fill="#ffd24d"/><path d="M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.4 5.4l1.6 1.6M17 17l1.6 1.6M5.4 18.6L7 17M17 7l1.6-1.6" stroke="#ffd24d" stroke-width="1.8" stroke-linecap="round"/>';
    else if (s.kind === "cloudy") p = CLOUD(0);
    else if (s.kind === "rain") p = CLOUD(-3) + '<path d="M8.5 17l-1 3M12.5 17l-1 3M16.5 17l-1 3" stroke="#8fc7ff" stroke-width="1.8" stroke-linecap="round"/>';
    else if (s.kind === "snow") p = CLOUD(-3) + '<g fill="#fff"><circle cx="8.5" cy="18.5" r="1.3"/><circle cx="12.5" cy="20" r="1.3"/><circle cx="16.5" cy="18.5" r="1.3"/></g>';
    else if (s.kind === "storm") p = CLOUD(-3) + '<path d="M12.6 14.5l-2.6 4.2h2.6l-1.4 3.8 4-5.2h-2.6l1.4-2.8z" fill="#ffd24d"/>';
    else p = '<path d="M3 9h11.5a2.7 2.7 0 1 0-2.6-3.4M3 13h15.5a2.8 2.8 0 1 1-2.7 3.6M3 17h7" fill="none" stroke="#e9eef6" stroke-width="1.8" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 24 24">' + p + "</svg>";
  }

  /* ---- where the two of them are in each picture (fractions of its width and height): x0, y0, x1, y1, and how they move:
     b breathes on the ground, f bobs in the air (mid-jump), ball bounces. win is the window, for the storm's rain and lightning. */
  var M = {
    "clear-day": { c: [[0.195, 0.16, 0.475, 0.71, "f"], [0.52, 0.23, 0.79, 0.75, "f"], [0.415, 0.675, 0.53, 0.845, "ball"]] },
    "clear-eve": { c: [[0.255, 0.17, 0.515, 0.69, "f"], [0.53, 0.31, 0.765, 0.75, "f"], [0.443, 0.655, 0.53, 0.81, "ball"]] },
    "clear-night": { c: [[0.25, 0.2, 0.495, 0.7, "f"], [0.52, 0.27, 0.79, 0.74, "f"], [0.4375, 0.62, 0.54, 0.805, "ball"]] },
    "cloudy-day": { c: [[0.125, 0.26, 0.42, 0.81, "b"], [0.58, 0.3, 0.84, 0.82, "b"]] },
    "cloudy-eve": { c: [[0.19, 0.3, 0.42, 0.81, "b"], [0.56, 0.31, 0.855, 0.81, "b"]] },
    "rain-day": { c: [[0.26, 0.09, 0.53, 0.76, "f"], [0.53, 0.24, 0.75, 0.76, "f"]], sync: true, ground: 0.8 },
    "rain-eve": { c: [[0.26, 0.11, 0.51, 0.73, "f"], [0.52, 0.23, 0.765, 0.75, "f"]], sync: true, ground: 0.8 },
    "rain-night": { c: [[0.27, 0.13, 0.52, 0.72, "f"], [0.53, 0.24, 0.75, 0.72, "f"]], sync: true, ground: 0.78 },
    "snow-day": { c: [[0.19, 0.11, 0.51, 0.84, "b"], [0.61, 0.36, 0.83, 0.85, "b"]] },
    "snow-eve": { c: [[0.22, 0.13, 0.52, 0.82, "b"], [0.57, 0.38, 0.81, 0.87, "b"]] },
    "snow-night": { c: [[0.21, 0.15, 0.505, 0.83, "b"], [0.6, 0.4, 0.83, 0.87, "b"]] },
    "wind-day": { c: [[0.255, 0.3, 0.5, 0.79, "b"], [0.55, 0.35, 0.79, 0.79, "f"]] },
    "wind-eve": { c: [[0.26, 0.25, 0.51, 0.79, "b"], [0.52, 0.35, 0.745, 0.8, "f"]] },
    "wind-night": { c: [[0.275, 0.27, 0.505, 0.78, "b"], [0.535, 0.38, 0.76, 0.81, "f"]] },
    "storm-day": { c: [[0.2, 0.19, 0.5, 0.81, "b"], [0.5, 0.28, 0.84, 0.82, "b"]], win: [0.4, 0, 0.96, 0.385] },
    "storm-night": { c: [[0.24, 0.23, 0.515, 0.81, "b"], [0.51, 0.27, 0.82, 0.81, "b"]], win: [0.45, 0, 0.94, 0.45] }
  };
  function metaOf(file) {
    var m = M[file] || M["cloudy-day"], x0 = 1, x1 = 0, y0 = 1, y1 = 0;
    m.c.forEach(function (b) { if (b[4] === "ball") return; x0 = Math.min(x0, b[0]); x1 = Math.max(x1, b[2]); y0 = Math.min(y0, b[1]); y1 = Math.max(y1, b[3]); });
    return { c: m.c, sync: !!m.sync, ground: m.ground || 0, win: m.win || null, x0: x0, x1: x1, fx: (x0 + x1) / 2, fy: (y0 + y1) / 2 };
  }

  /* ---- the frame: fills the screen when it can; on a tall or narrow screen it shrinks until both of them are fully in view,
     as a band over a soft, blurred copy of itself */
  var S = null, CL = null, META = null, FR = { l: 0, t: 0, w: 0, h: 0 }, band = false, vw = 0, vh = 0;
  function layout() {
    vw = win.innerWidth || html.clientWidth; vh = win.innerHeight || html.clientHeight;
    if (!META) return;
    var s = Math.max(vw, vh * 16 / 9), need = Math.min(1, META.x1 - META.x0 + (vw < vh ? 0.05 : 0.08));
    if (vw / s < need) s = vw / need;
    var h = s * 9 / 16; band = h < vh - 1;
    var l = Math.min(0, Math.max(vw - s, vw / 2 - META.fx * s));
    var t = band ? Math.max(0, (vh - h) * (vw < 700 ? 0.34 : 0.45)) : Math.min(0, Math.max(vh - h, vh * 0.48 - META.fy * h));
    FR = { l: l, t: t, w: s, h: h };
    var f = R.frame.style; f.left = l.toFixed(1) + "px"; f.top = t.toFixed(1) + "px"; f.width = s.toFixed(1) + "px"; f.height = h.toFixed(1) + "px";
    root.classList.toggle("is-band", band);
    sizeCanvas();
  }
  function maskFor(b) {
    var k = b[4] === "ball" ? 1.7 : 1.3, rx = (b[2] - b[0]) / 2 * k * 100, ry = (b[3] - b[1]) / 2 * k * 100, cx = (b[0] + b[2]) / 2 * 100, cy = (b[1] + b[3]) / 2 * 100;
    return "radial-gradient(ellipse " + rx.toFixed(2) + "% " + ry.toFixed(2) + "% at " + cx.toFixed(2) + "% " + cy.toFixed(2) + "%, #000 0, #000 78%, transparent 100%)";
  }
  var GRADES = {
    morning: "background: linear-gradient(115deg, rgba(255, 196, 150, 0.34), rgba(255, 222, 186, 0.1) 45%, rgba(170, 200, 235, 0.08)); mix-blend-mode: soft-light;",
    heat: "background: linear-gradient(rgba(255, 176, 90, 0.2), rgba(255, 214, 150, 0.08)); mix-blend-mode: soft-light;",
    late: "background: radial-gradient(85% 85% at 50% 50%, rgba(10, 16, 40, 0.1), rgba(4, 8, 22, 0.55)); mix-blend-mode: multiply;",
    night: "background: radial-gradient(90% 90% at 50% 55%, rgba(20, 30, 68, 0.5), rgba(8, 12, 32, 0.72)); mix-blend-mode: multiply;"
  };
  function build(src) {
    var m = META, h = '<img class="sl-img" alt="" src="' + src + '">' + (S.fog ? '<div class="sl-mist"></div>' : ""); /* under the characters' layers, so they stand in front of it */
    if (!reduced) m.c.forEach(function (b, i) {
      var cls = "m-" + b[4], delay = m.sync && b[4] !== "ball" ? 0 : -(i * 0.9 + 0.3);
      var origin = ((b[0] + b[2]) / 2 * 100).toFixed(2) + "% " + (b[3] * 100).toFixed(2) + "%";
      var mk = maskFor(b);
      h += '<div class="sl-cg ' + cls + '" style="background-image:url(\'' + src + "');-webkit-mask-image:" + mk + ";mask-image:" + mk + ";transform-origin:" + origin + ";animation-delay:" + delay + 's"></div>';
    });
    if (S.grade) h += '<div class="sl-grade" style="' + GRADES[S.grade] + '"></div>';
    if (m.win) h += '<div class="sl-flash" data-flash style="left:' + m.win[0] * 100 + "%;top:" + m.win[1] * 100 + "%;width:" + (m.win[2] - m.win[0]) * 100 + "%;height:" + (m.win[3] - m.win[1]) * 100 + '%"></div><div class="sl-glow" data-glow></div>';
    R.cam.innerHTML = h;
    R.cam.style.setProperty("--fx", (m.fx * 100).toFixed(1) + "%"); R.cam.style.setProperty("--fy", (m.fy * 100).toFixed(1) + "%");
    R.flash = R.cam.querySelector("[data-flash]"); R.glow = R.cam.querySelector("[data-glow]");
    R.back.style.backgroundImage = "url('" + src + "')"; R.back.classList.add("is-on");
    root.classList.toggle("is-fog", S.fog);
    R.frame.classList.add("is-on");
    if (!reduced) { R.cam.classList.add("is-push"); seed(); raf = requestAnimationFrame(frame); }
  }
  function choose() {
    CL = climateOf(WX.rec, phaseNow()); S = sceneOf(CL); META = metaOf(S.file);
    layout();
    R.icon.innerHTML = iconOf(S); R.note.textContent = noteOf(CL, S);
    var said = "Sunny and Puppy " + ACTS[S.kind] + ", " + { day: CL.phase === "sunrise" || CL.phase === "morning" ? "in the morning" : "in the afternoon", eve: "in the evening", night: "at night" }[S.light] + ".";
    R.frame.setAttribute("aria-label", said);
    var small = FR.w * Math.min(2, win.devicePixelRatio || 1) <= 1000;
    var src = BASE + "assets/loader/" + S.file + (small ? "-s" : "") + ".jpg", im = new Image();
    im.decoding = "async";
    im.onload = function () { var go = function () { if (done) return; P.art = 1; build(src); R.live.textContent = said + " " + R.note.textContent + "."; }; if (im.decode) im.decode().then(go, go); else go(); };
    im.onerror = function () { P.art = 1; artErr = "the picture did not load"; R.live.textContent = R.note.textContent + "."; }; /* the quiet sky stays; loading goes on */
    im.src = src;
  }

  /* ===================================================================== the weather, drawn: rain, ripples, snow, leaves, motes, fireflies, lightning */
  var cv = R.fx, g = cv.getContext ? cv.getContext("2d") : null, DPR = Math.min(1.5, win.devicePixelRatio || 1);
  var drops = [], flakes = [], leaves = [], motes = [], rings = [], raf = 0, lastT = 0, ringAcc = 0, boltAt = 0, boltT = -1, glowSprite = null;
  function sizeCanvas() { if (!g) return; cv.width = Math.round(vw * DPR); cv.height = Math.round(vh * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function areaK() { return Math.max(0.45, Math.min(1.2, (vw * vh) / (1440 * 900))); }
  function sprite(r, c) {
    var s = doc.createElement("canvas"); s.width = s.height = r * 2; var x = s.getContext("2d"), gr = x.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, "rgba(" + c + ",1)"); gr.addColorStop(0.25, "rgba(" + c + ",0.55)"); gr.addColorStop(1, "rgba(" + c + ",0)"); x.fillStyle = gr; x.fillRect(0, 0, r * 2, r * 2); return s;
  }
  var LEAF_C = ["#d9622b", "#e8892f", "#c94a2a", "#f0b13c"], PETAL_C = ["#fff4f6", "#ffd9e4", "#fff8d6"];
  function newDrop(any) { var near = Math.random() < 0.35; return { x: rnd(-0.1, 1.1) * vw, y: any ? rnd(0, vh) : rnd(-0.3, 0) * vh, v: (near ? rnd(1300, 1700) : rnd(850, 1150)), len: near ? rnd(22, 34) : rnd(12, 20), a: near ? rnd(0.28, 0.4) : rnd(0.14, 0.24), w: near ? 1.4 : 1 }; }
  function newFlake(any) { var near = Math.random() < 0.3; return { x: rnd(-0.05, 1.05) * vw, y: any ? rnd(0, vh) : rnd(-0.1, 0) * vh, r: near ? rnd(2.6, 4) : rnd(1, 2.2), v: near ? rnd(55, 85) : rnd(28, 50), ph: rnd(0, 6.3), a: near ? 0.92 : rnd(0.5, 0.75) }; }
  function newLeaf(any, petal) { var dir = S.wx > 0.1 ? 1 : -1; return { x: any ? rnd(0, vw) : dir > 0 ? rnd(-0.25, -0.02) * vw : rnd(1.02, 1.25) * vw, y: rnd(0.08, 0.85) * vh, vx: dir * rnd(110, 220) * (0.5 + S.wind), vy: rnd(-10, 30), rot: rnd(0, 6.3), vr: rnd(-3, 3), s: petal ? rnd(4, 6) : rnd(8, 13), ph: rnd(0, 6.3), c: (petal ? PETAL_C : LEAF_C)[(Math.random() * (petal ? 3 : 4)) | 0], petal: petal }; }
  function newMote(fly) { return { x: rnd(FR.l, FR.l + FR.w), y: rnd(FR.t + FR.h * 0.3, FR.t + FR.h * 0.95), vx: rnd(-8, 8), vy: rnd(-10, -2), ph: rnd(0, 6.3), sp: rnd(0.6, 1.4), r: fly ? rnd(5, 8) : rnd(3, 6), fly: fly }; }
  function seed() {
    if (!g) return;
    var k = areaK(), i, n;
    drops = []; flakes = []; leaves = []; motes = []; rings = [];
    if (S.rain) { n = Math.round((S.kind === "storm" ? 70 : 55 + 75 * Math.min(1.5, S.rain)) * k); for (i = 0; i < n; i++) drops.push(newDrop(true)); }
    if (S.snow) { n = Math.round((45 + 55 * Math.min(1.6, S.snow)) * k); for (i = 0; i < n; i++) flakes.push(newFlake(true)); }
    var windy = S.kind === "wind" ? 16 : (S.kind === "clear" || S.kind === "cloudy") && S.wind > 0.55 ? 5 : 0; /* wind as a layer on calmer scenes */
    for (i = 0; i < Math.round(windy * Math.max(0.6, k)); i++) leaves.push(newLeaf(true, S.kind !== "wind"));
    var night = S.light === "night";
    if (S.kind === "clear" || S.kind === "cloudy" || S.kind === "wind") { n = night ? (S.kind === "clear" ? 12 : 6) : S.fog ? 0 : 10; for (i = 0; i < n; i++) motes.push(newMote(night)); }
    glowSprite = night ? sprite(16, "214,255,140") : sprite(12, "255,240,200");
    boltAt = 2.5 + Math.random() * 3;
  }
  function frame(now) {
    if (done) return;
    raf = requestAnimationFrame(frame);
    if (doc.hidden) { lastT = 0; return; }
    var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0; lastT = now;
    if (!g) return;
    g.clearRect(0, 0, vw, vh);
    var slant = (S.wx > 0.1 ? 1 : -1) * Math.min(0.5, 0.08 + S.wind * 0.4), i, p;
    /* rain: across the screen, or behind the window glass in the storm */
    if (drops.length) {
      var clip = META.win && S.kind === "storm";
      if (clip) { g.save(); g.beginPath(); g.rect(FR.l + META.win[0] * FR.w, FR.t + META.win[1] * FR.h, (META.win[2] - META.win[0]) * FR.w, (META.win[3] - META.win[1]) * FR.h); g.clip(); }
      g.strokeStyle = "rgb(222,232,246)"; g.lineCap = "round";
      for (i = 0; i < drops.length; i++) {
        p = drops[i]; p.y += p.v * dt; p.x += p.v * slant * dt;
        if (p.y - p.len > vh || p.x < -0.15 * vw || p.x > 1.15 * vw) { drops[i] = newDrop(false); continue; }
        g.globalAlpha = clip ? p.a * 0.7 : p.a; g.lineWidth = p.w; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.len * slant, p.y - p.len); g.stroke();
      }
      if (clip) g.restore();
      /* ripples on the puddle */
      if (META.ground && S.kind === "rain") {
        ringAcc += dt * (3 + 4 * S.rain) * areaK();
        while (ringAcc > 1) { ringAcc -= 1; var gy = FR.t + rnd(META.ground, 0.98) * FR.h; if (gy < vh) rings.push({ x: FR.l + rnd(0.08, 0.92) * FR.w, y: gy, t: 0, m: rnd(0.7, 1.1), s: (gy - FR.t) / FR.h }); }
        g.strokeStyle = "rgb(235,242,250)"; g.lineWidth = 1;
        for (i = rings.length - 1; i >= 0; i--) {
          var r = rings[i]; r.t += dt / r.m; if (r.t >= 1) { rings.splice(i, 1); continue; }
          var rad = (4 + r.t * 22) * (FR.w / 1600) * (0.6 + r.s * 0.6); g.globalAlpha = 0.45 * (1 - r.t);
          g.beginPath(); g.ellipse(r.x, r.y, rad, rad * 0.28, 0, 0, Math.PI * 2); g.stroke();
        }
      }
    }
    if (flakes.length) {
      g.fillStyle = "#fff"; var sway = S.wx > 0.1 ? 1 : -1;
      for (i = 0; i < flakes.length; i++) {
        p = flakes[i]; p.ph += dt * 1.3; p.y += p.v * dt; p.x += (Math.sin(p.ph) * 14 + sway * S.wind * 60) * dt * (p.r / 2.5);
        if (p.y > vh + 6 || p.x < -0.08 * vw || p.x > 1.08 * vw) { flakes[i] = newFlake(false); if (sway > 0 && S.wind > 0.4) flakes[i].x -= 0.1 * vw; continue; }
        g.globalAlpha = p.a; g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
      }
    }
    for (i = 0; i < leaves.length; i++) {
      p = leaves[i]; p.ph += dt * 2; p.x += p.vx * dt; p.y += (p.vy + Math.sin(p.ph) * 40) * dt; p.rot += p.vr * dt;
      if (p.x < -0.3 * vw || p.x > 1.3 * vw || p.y > vh + 20) { leaves[i] = newLeaf(false, p.petal); continue; }
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.ph * 0.7))); g.globalAlpha = 0.95; g.fillStyle = p.c;
      g.beginPath(); g.moveTo(-p.s, 0); g.quadraticCurveTo(0, -p.s * 0.75, p.s, 0); g.quadraticCurveTo(0, p.s * 0.75, -p.s, 0); g.fill(); g.restore();
    }
    for (i = 0; i < motes.length; i++) {
      p = motes[i]; p.ph += dt * p.sp; p.x += (p.vx + Math.sin(p.ph) * 10) * dt; p.y += (p.vy + Math.cos(p.ph * 0.8) * 8) * dt;
      if (p.y < FR.t + FR.h * 0.15 || p.x < FR.l - 20 || p.x > FR.l + FR.w + 20) { motes[i] = newMote(p.fly); continue; }
      var tw = p.fly ? 0.35 + 0.65 * Math.max(0, Math.sin(p.ph * 2.1)) : 0.25 + 0.2 * Math.sin(p.ph * 1.7);
      g.globalAlpha = tw; g.drawImage(glowSprite, p.x - p.r * 2, p.y - p.r * 2, p.r * 4, p.r * 4);
    }
    g.globalAlpha = 1;
    /* lightning: far away and soft, never a shock; a flicker in the window and a breath of light in the room */
    if (R.flash) {
      boltAt -= dt;
      if (boltAt <= 0 && boltT < 0) boltT = 0;
      if (boltT >= 0) {
        boltT += dt; var b = boltT < 0.09 ? 0.6 : boltT < 0.17 ? 0.1 : boltT < 0.3 ? 0.4 : Math.max(0, 0.4 - (boltT - 0.3) * 0.9);
        R.flash.style.opacity = b.toFixed(3); R.glow.style.opacity = (b * 0.35).toFixed(3);
        if (boltT > 0.8) { boltT = -1; boltAt = rnd(7, 13); R.flash.style.opacity = "0"; R.glow.style.opacity = "0"; }
      }
    }
  }

  /* ===================================================================== the real progress: the page, the weather, the scene's picture */
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
      if (pref("puppy:met") !== "1") { store("puppy:met", "1"); afterStory(); }
    }, 950);
  }
  function onKey(e) { if (e.key === "Escape") { e.preventDefault(); finish(true); } }
  var rsz = 0; function onResize() { clearTimeout(rsz); rsz = setTimeout(layout, 120); }
  R.skip.addEventListener("click", function () { finish(true); });
  win.addEventListener("keydown", onKey); win.addEventListener("resize", onResize);
  layout();

  /* for checking, in the console */
  win.SunnyStory = {
    state: function () { return { scene: S && S.kind, image: S && S.file, light: S && S.light, phase: S && S.phase, grade: S && S.grade, fog: S && S.fog, rain: S && +S.rain.toFixed(2), snow: S && +S.snow.toFixed(2), wind: S && +S.wind.toFixed(2), band: band, frame: FR, progress: Math.round(shown * 100), tasks: { page: P.dom, resources: +P.res.toFixed(2), weather: P.wx, art: P.art }, artError: artErr, note: R.note.textContent, done: done }; },
    weather: function () { var c = CL; return { source: WX.src, location: WX.loc, error: WX.err, ageMinutes: WX.fetchedAt ? +((Date.now() - WX.fetchedAt) / 60000).toFixed(1) : null, reading: WX.rec,
      climate: c && { kind: c.kind, sub: c.sub, phase: c.phase, dark: c.dark, heat: c.heat, cold: c.cold, frost: !!c.frost, clearing: !!c.clearing, cloud: +c.cloud.toFixed(2), wind: +c.wind.toFixed(2), blowsRight: c.wx > 0.1, temp: c.temp } }; }
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
