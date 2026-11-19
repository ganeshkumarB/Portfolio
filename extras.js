/* Extras: the prompt-to-component replay, the palette generator (token playground)
   and the before/after compare slider. Plain JS, no services. */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     Prompt to component: a looping replay of the real workflow
     ============================================================ */
  var replay = $("#replay");
  if (replay) {
    var typed = $("#replayTyped", replay), frame = $("#replayFrame", replay), code = $("#replayCode", replay), status = $("#replayStatus", replay), restart = $("#replayRestart", replay);
    var PROMPT = "Build a Confirm dialog from the system: title, body, ghost + primary buttons. Use radius/md and space/4.";
    var CODE = [
      '<Dialog size="md">',
      '  <Dialog.Title>Delete project?</Dialog.Title>',
      '  <Dialog.Body>This can’t be undone.</Dialog.Body>',
      '  <Dialog.Actions>',
      '    <Button variant="ghost">Cancel</Button>',
      '    <Button variant="primary">Delete</Button>',
      '  </Dialog.Actions>',
      '</Dialog>'
    ];
    var parts = $$(".rf", frame), timers = [], running = false, playing = false, loopTimer = 0;
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearAll() { timers.forEach(clearTimeout); timers = []; clearTimeout(loopTimer); }
    function reset() {
      clearAll();
      typed.textContent = ""; code.textContent = "";
      parts.forEach(function (p) { p.classList.remove("is-on"); });
      replay.classList.remove("is-synced", "is-building", "is-coding");
      status.textContent = "waiting for a prompt";
    }
    function run() {
      reset(); running = true;
      if (reduced) {
        typed.textContent = PROMPT; parts.forEach(function (p) { p.classList.add("is-on"); });
        code.textContent = CODE.join("\n"); replay.classList.add("is-synced"); status.textContent = "● synced · 0 drift";
        return;
      }
      var i = 0;
      (function type() {
        if (i <= PROMPT.length) { typed.textContent = PROMPT.slice(0, i++); later(type, 22 + Math.random() * 30); return; }
        status.textContent = "figma mcp · reading tokens…";
        later(build, 500);
      })();
      function build() {
        replay.classList.add("is-building");
        parts.forEach(function (p, n) { later(function () { p.classList.add("is-on"); }, 160 + n * 260); });
        later(function () { status.textContent = "code connect · mapping…"; replay.classList.add("is-coding"); writeCode(); }, 300 + parts.length * 260);
      }
      function writeCode() {
        var line = 0;
        (function next() {
          if (line < CODE.length) { code.textContent += (line ? "\n" : "") + CODE[line++]; later(next, 190); return; }
          later(function () { replay.classList.add("is-synced"); status.textContent = "● synced · 0 drift"; }, 350);
          loopTimer = setTimeout(run, 6500);
        })();
      }
    }
    function start() { if (!playing) { playing = true; run(); } }
    function stop() { playing = false; running = false; clearAll(); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
      }, { threshold: 0.35 }).observe(replay);
    } else start();
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (!reduced) start(); });
    if (restart) restart.addEventListener("click", function () { playing = true; run(); });
  }

  /* ============================================================
     Token playground: a palette ramp from one colour, by formula
     ============================================================ */
  var lab = $("#tokenlab");
  if (lab) {
    var pick = $("#labColor", lab), hexOut = $("#labHex", lab), rampEl = $("#labRamp", lab), preview = $("#labPreview", lab);
    var nameIn = $("#labName", lab), copyCss = $("#labCopyCss", lab), copyJson = $("#labCopyJson", lab), toast = $("#labToast", lab);
    var STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    var L = [0.97, 0.93, 0.85, 0.75, 0.64, null, 0.44, 0.35, 0.26, 0.17]; /* null = the picked colour itself */
    function hexToRgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join(""); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
    function rgbToHex(r) { return "#" + r.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
    function rgbToHsl(c) {
      var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2, d = max - min;
      if (d) { s = l > 0.5 ? d / (2 - max - min) : d / (max + min); h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
      return [h, s, l];
    }
    function hslToRgb(h, s, l) {
      if (!s) return [l * 255, l * 255, l * 255];
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      var f = function (t) { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
      return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
    }
    function lum(c) { var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
    function contrast(a, b) { var la = lum(a) + 0.05, lb = lum(b) + 0.05; return la > lb ? la / lb : lb / la; }
    var WHITE = [255, 255, 255], INK = [21, 22, 26];
    function ramp(hex) {
      var base = hexToRgb(hex), hsl = rgbToHsl(base);
      return STEPS.map(function (step, i) {
        if (L[i] === null) return { step: step, hex: rgbToHex(base), rgb: base };
        /* lighter steps lose a little saturation, darker steps keep it: reads like a real brand ramp */
        var s = Math.min(1, hsl[1] * (L[i] > 0.6 ? 0.9 : 1.02));
        var rgb = hslToRgb(hsl[0], s, L[i]);
        return { step: step, hex: rgbToHex(rgb), rgb: rgb };
      });
    }
    var current = [];
    function slug() { return (nameIn && nameIn.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) || "brand"; }
    function render() {
      var hex = pick.value; hexOut.textContent = hex;
      current = ramp(hex);
      rampEl.innerHTML = current.map(function (c) {
        var onWhite = contrast(c.rgb, WHITE), onInk = contrast(c.rgb, INK);
        var textOk = onWhite >= 4.5, bgOk = onInk >= 4.5;
        var fg = onInk > onWhite ? "#15161a" : "#ffffff";
        return '<div class="lab__sw" style="--c:' + c.hex + ';--fg:' + fg + '" title="' + c.hex + '">' +
          '<span class="mono lab__step">' + c.step + '</span>' +
          '<span class="mono lab__hex">' + c.hex + '</span>' +
          '<span class="lab__aa' + (textOk ? " is-ok" : "") + '" title="As text on white: ' + onWhite.toFixed(1) + ':1">Aa ' + onWhite.toFixed(1) + '</span>' +
          "</div>";
      }).join("");
      var c100 = current[1].hex, c500 = current[5].hex, c900 = current[8].hex;
      preview.style.setProperty("--p-bg", c100); preview.style.setProperty("--p-accent", c500); preview.style.setProperty("--p-ink", c900);
      preview.style.setProperty("--p-accent-fg", contrast(current[5].rgb, WHITE) >= 3 ? "#fff" : "#15161a");
      document.documentElement.style.setProperty("--lab-pick", hex);
    }
    function say(msg) { toast.textContent = msg; toast.classList.add("is-show"); setTimeout(function () { toast.classList.remove("is-show"); }, 1600); }
    function copy(text, label) { var done = function () { say(label + " copied"); }; if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); }
    pick.addEventListener("input", render);
    if (nameIn) nameIn.addEventListener("input", render);
    copyCss.addEventListener("click", function () {
      var n = slug();
      copy(":root {\n" + current.map(function (c) { return "  --color-" + n + "-" + c.step + ": " + c.hex + ";"; }).join("\n") + "\n}", "CSS");
    });
    copyJson.addEventListener("click", function () {
      var n = slug();
      var json = { collection: "Color", mode: "Light", variables: current.map(function (c) { return { name: n + "/" + c.step, type: "COLOR", value: c.hex }; }) };
      copy(JSON.stringify(json, null, 2), "Figma variables JSON");
    });
    render();
  }

  /* prompt cards: copy the prompt text */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".prompt"), text = card ? $(".prompt__body", card).textContent : "";
      var done = function () { btn.textContent = "copied"; btn.classList.add("is-done"); setTimeout(function () { btn.textContent = "copy"; btn.classList.remove("is-done"); }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    });
  });

  /* ============================================================
     Compare slider: drag between two images
     ============================================================ */
  $$("[data-compare]").forEach(function (fig) {
    var stage = $(".compare__stage", fig), range = $(".compare__range", fig);
    function set(v) { v = Math.max(0, Math.min(100, v)); fig.style.setProperty("--pos", v + "%"); range.value = v; }
    range.addEventListener("input", function () { set(+range.value); });
    var dragging = false;
    function fromEvent(e) { var r = stage.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    stage.addEventListener("pointerdown", function (e) { dragging = true; stage.setPointerCapture(e.pointerId); fromEvent(e); });
    stage.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    stage.addEventListener("pointerup", function () { dragging = false; });
    stage.addEventListener("pointercancel", function () { dragging = false; });
    set(+range.value || 50);
  });
})();
