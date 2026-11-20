/* Extras: the prompt-to-component replay and the before/after compare slider. Plain JS, no services. */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");

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

  /* sound profile switcher */
  var voiceBox = $("#sunnyVoice");
  if (voiceBox) {
    var voiceBtns = $$("[data-voice]", voiceBox);
    function markVoice() {
      var S = window.Sunny, cur = S ? (S.soundOn() ? S.voice() : "off") : "soft";
      voiceBtns.forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-voice") === cur); });
    }
    voiceBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var S = window.Sunny; if (!S) return;
        var v = b.getAttribute("data-voice");
        if (v === "off") { S.setSound(false); S.say("Quiet mode. Still here.", 2000); }
        else { S.setVoice(v, true); S.emote("happy", 1400); }
        markVoice();
      });
    });
    var tries = 0, tv = setInterval(function () { if (window.Sunny && window.Sunny.voice) { markVoice(); clearInterval(tv); } else if (++tries > 50) clearInterval(tv); }, 100);
    window.addEventListener("prefs:change", markVoice);
  }

  /* gallery: nine pieces first */
  var galleryAll = $("#galleryAll");
  if (galleryAll) $$("#gallery .piece").forEach(function (el, i) { if (i >= 10) el.classList.add("is-more"); });
  if (galleryAll) galleryAll.addEventListener("click", function () {
    var g = $("#gallery"); g.classList.add("show-all"); galleryAll.setAttribute("aria-expanded", "true");
    $$(".piece", g).forEach(function (el) { el.classList.add("is-in"); });
    window.dispatchEvent(new Event("resize"));
  });

  /* "Ask Sunny" buttons on the page open the chat, with a question if given */
  $$("[data-ask]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var api = window.SunnyAsk; if (!api) return;
      var q = btn.getAttribute("data-ask");
      if (q) api.ask(q); else api.open();
    });
  });

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

  /* ============================================================
     Recruiter view: a condensed home page, remembered per browser
     ============================================================ */
  var modeBtn = $("#modeToggle"), modeExit = $("#modeExit");
  if ($("#recruiter")) {
    function setMode(on, quiet) {
      document.body.classList.toggle("recruiter", on);
      if (modeBtn) modeBtn.setAttribute("aria-pressed", String(on));
      try { localStorage.setItem("site:mode", on ? "recruiter" : "full"); } catch (e) { /* ignore */ }
      try {
        var u = new URL(location.href);
        if (on) u.searchParams.set("mode", "recruiter"); else u.searchParams.delete("mode");
        history.replaceState(null, "", u.pathname + (u.search || "") + u.hash);
      } catch (e) { /* ignore */ }
      if (!quiet) {
        var target = on ? $("#recruiter") : $("#hey");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.Sunny && !on) Sunny.say("Full site again. Welcome back!", 2400);
      }
      window.dispatchEvent(new Event("resize"));
    }
    var wantsMode = false;
    try { wantsMode = new URL(location.href).searchParams.get("mode") === "recruiter"; } catch (e) { /* ignore */ }
    if (wantsMode) setMode(true, true);
    if (modeBtn) modeBtn.addEventListener("click", function () { setMode(!document.body.classList.contains("recruiter")); });
    if (modeExit) modeExit.addEventListener("click", function () { setMode(false); });
  }

  /* ============================================================
     Match me to your job description: keyword matching, in the browser
     ============================================================ */
  var jdForm = $("#jdForm");
  if (jdForm) {
    var CASES = {
      zobot: ["case-zobot.html", "Zobot — No-code Bot Builder"],
      system: ["case-design-system.html", "SalesIQ Design System"],
      console: ["case-operator-console.html", "Operator Console"],
      reports: ["case-reports.html", "Reports and analytics"],
      brand: ["case-brand-configuration.html", "Brand configuration"],
      outbound: ["case-outbound.html", "Outbound campaigns"],
      feedback: ["case-feedback.html", "Rating & Feedback"]
    };
    /* each skill: how a job description tends to say it, and which case studies show it */
    var SKILLS = [
      { label: "Design systems", k: ["design system", "design systems", "component library", "component libraries", "ui kit", "pattern library"], c: ["system"] },
      { label: "Design tokens & Figma variables", k: ["design token", "tokens", "figma variables", "variables", "theming", "dark mode"], c: ["system"] },
      { label: "Figma", k: ["figma"], c: ["system", "zobot"] },
      { label: "Code Connect / Dev Mode", k: ["code connect", "dev mode", "handoff", "hand-off", "design-to-code", "design to code", "developer handoff"], c: ["system"] },
      { label: "AI-assisted design", k: ["ai", "llm", "generative", "mcp", "claude", "chatgpt", "copilot", "ai-assisted", "ai tools"], c: ["system"] },
      { label: "Enterprise / B2B SaaS", k: ["b2b", "saas", "enterprise", "platform"], c: ["console", "reports", "system"] },
      { label: "End-to-end product design", k: ["end-to-end", "end to end", "0 to 1", "zero to one", "from concept", "full product lifecycle", "product design"], c: ["zobot", "outbound", "brand"] },
      { label: "No-code / builders", k: ["no-code", "no code", "low-code", "builder", "workflow", "automation", "chatbot", "bot"], c: ["zobot"] },
      { label: "Conversational / messaging", k: ["chat", "messaging", "conversational", "live chat", "whatsapp", "support"], c: ["console", "zobot", "feedback"] },
      { label: "Dashboards & data visualisation", k: ["dashboard", "dashboards", "analytics", "data visualization", "data visualisation", "charts", "reporting", "reports"], c: ["reports"] },
      { label: "Complex workflows / admin tools", k: ["complex", "admin", "configuration", "settings", "internal tools", "operations", "agent"], c: ["console", "brand"] },
      { label: "Cross-platform (web, mobile SDK)", k: ["mobile", "ios", "android", "sdk", "cross-platform", "responsive", "multi-platform"], c: ["system", "brand"] },
      { label: "User research & usability testing", k: ["user research", "research", "usability", "user testing", "interviews", "discovery", "customer feedback"], c: ["console", "reports", "feedback"] },
      { label: "Information architecture", k: ["information architecture", " ia ", "navigation", "taxonomy", "structure"], c: ["reports", "console"] },
      { label: "Interaction design & prototyping", k: ["interaction design", "prototyp", "micro-interaction", "motion", "animation"], c: ["zobot", "outbound"] },
      { label: "Accessibility", k: ["accessibility", "a11y", "wcag", "inclusive"], c: ["system"] },
      { label: "Design leadership & critique", k: ["lead", "leadership", "mentor", "critique", "design review", "stakeholder", "cross-functional", "collaborat"], c: ["system", "console"] },
      { label: "HTML & CSS", k: ["html", "css", "front-end", "frontend", "front end", "code"], c: ["system"] },
      { label: "Visual & brand design", k: ["visual design", "branding", "brand", "illustration", "typography"], c: ["brand", "zobot"] },
      { label: "Survey & feedback flows", k: ["survey", "feedback", "csat", "nps", "rating"], c: ["feedback"] }
    ];
    /* things a JD may ask for that the site does not claim; say so instead of pretending */
    var NOT_HERE = [
      { label: "People management", k: ["people manag", "direct reports", "manage a team", "managing a team", "hire and grow"] },
      { label: "Consumer / B2C products", k: ["b2c", "consumer app", "consumer product", "e-commerce", "ecommerce"] },
      { label: "Native app engineering", k: ["swift", "kotlin", "react native", "flutter"] },
      { label: "Game design", k: ["game design", "unity", "unreal"] },
      { label: "Marketing design / growth", k: ["marketing campaigns", "growth design", "landing pages", "seo"] }
    ];
    var jdText = $("#jdText"), jdResult = $("#jdResult"), jdNote = $("#jdNote"), jdClear = $("#jdClear");
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function match(text) {
      var t = " " + text.toLowerCase().replace(/[^a-z0-9+&/ -]+/g, " ").replace(/\s+/g, " ") + " ";
      var hits = [], caseScore = {};
      SKILLS.forEach(function (s) {
        var n = 0;
        s.k.forEach(function (k) { var i = 0; while ((i = t.indexOf(k, i)) > -1) { n++; i += k.length; } });
        if (n) { hits.push({ s: s, n: n }); s.c.forEach(function (c, idx) { caseScore[c] = (caseScore[c] || 0) + n * (idx === 0 ? 2 : 1); }); }
      });
      hits.sort(function (a, b) { return b.n - a.n; });
      var misses = NOT_HERE.filter(function (m) { return m.k.some(function (k) { return t.indexOf(k) > -1; }); });
      var cases = Object.keys(caseScore).sort(function (a, b) { return caseScore[b] - caseScore[a]; }).slice(0, 3);
      return { hits: hits, misses: misses, cases: cases, caseScore: caseScore };
    }
    jdForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = jdText.value.trim();
      if (text.length < 40) { jdNote.textContent = "Paste a little more of the description."; return; }
      var r = match(text);
      jdNote.textContent = "";
      var words = text.split(/\s+/).length;
      var head = r.hits.length ? (r.hits.length + " of the things this role asks for show up in the work. Start with " + (r.cases.length ? CASES[r.cases[0]][1] : "the case studies") + ".") : "No clear overlap found. Try pasting the responsibilities and requirements sections.";
      var html = '<p class="jd__summary">' + esc(head) + "</p>";
      if (r.hits.length) html += '<div><h4>Matched in the work</h4><div class="jd__chips">' + r.hits.map(function (h) { return '<span class="jd__chip">' + esc(h.s.label) + (h.n > 1 ? " ×" + h.n : "") + "</span>"; }).join("") + "</div></div>";
      if (r.misses.length) html += '<div><h4>Asked for, not shown here</h4><div class="jd__chips">' + r.misses.map(function (m) { return '<span class="jd__chip jd__chip--miss">' + esc(m.label) + "</span>"; }).join("") + '</div><p class="jd__honest">Worth asking about on a call rather than assuming.</p></div>';
      if (r.cases.length) html += '<div><h4>Read these first</h4><div class="jd__cases">' + r.cases.map(function (c, i) { return '<a class="jd__case" href="' + CASES[c][0] + '"><i>0' + (i + 1) + "</i><b>" + esc(CASES[c][1]) + "</b><span>" + r.caseScore[c] + " matching signals</span></a>"; }).join("") + "</div></div>";
      html += '<p class="jd__honest">Keyword matching in your browser against ' + SKILLS.length + " skills on this site, across " + words + " words. Nothing was sent anywhere.</p>";
      jdResult.innerHTML = html; jdResult.hidden = false;
      if (window.Sunny && !document.body.classList.contains("recruiter")) Sunny.say(r.hits.length ? "Matched " + r.hits.length + " skills. Read the first case." : "Hmm, not much overlap there.", 3000);
    });
    if (jdClear) jdClear.addEventListener("click", function () { jdText.value = ""; jdResult.hidden = true; jdResult.innerHTML = ""; jdNote.textContent = ""; jdText.focus(); });
  }
})();


/* How I work: four steps, one stage. Auto-plays, pauses on hover or focus, arrow keys move between steps. */
(function () {
  "use strict";
  var how = document.getElementById("how"); if (!how) return;
  var tabs = Array.prototype.slice.call(how.querySelectorAll(".how__step"));
  var panels = Array.prototype.slice.call(how.querySelectorAll(".how__panel"));
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var idx = 0, timer = 0, paused = false, inView = false;
  tabs.forEach(function (t) { t.style.setProperty("--dur", (parseInt(t.getAttribute("data-dur"), 10) || 5200) + "ms"); });

  function show(i, user) {
    idx = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, n) {
      var on = n === idx;
      t.classList.toggle("is-active", on);
      var card = t.closest(".how__card"); if (card) card.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var bar = t.querySelector(".how__bar i");
      if (bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
    });
    panels.forEach(function (p, n) { if (n === idx) p.removeAttribute("hidden"); else p.setAttribute("hidden", ""); });
    how.setAttribute("data-step", String(idx));
    /* the Build step hosts the replay; start it directly rather than waiting on its own visibility check */
    var restart = panels[idx] && panels[idx].querySelector("#replayRestart");
    if (restart) setTimeout(function () { restart.click(); }, 60);
    if (user) document.dispatchEvent(new CustomEvent("how:step", { detail: idx }));
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduced || paused || !inView) return;
    var dur = parseInt(tabs[idx].getAttribute("data-dur"), 10) || 5200;
    timer = setTimeout(function () { show(idx + 1); }, dur);
  }
  function pause() { paused = true; how.classList.add("is-paused"); clearTimeout(timer); }
  function resume() { paused = false; how.classList.remove("is-paused"); schedule(); }

  tabs.forEach(function (t, n) {
    t.addEventListener("click", function () { show(n, true); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, go = null;
      if (k === "ArrowRight" || k === "ArrowDown") go = idx + 1;
      else if (k === "ArrowLeft" || k === "ArrowUp") go = idx - 1;
      else if (k === "Home") go = 0;
      else if (k === "End") go = tabs.length - 1;
      if (go === null) return;
      e.preventDefault(); show(go, true); tabs[idx].focus();
    });
  });
  how.addEventListener("mouseenter", pause);
  how.addEventListener("mouseleave", resume);
  how.addEventListener("focusin", pause);
  how.addEventListener("focusout", function (e) { if (!how.contains(e.relatedTarget)) resume(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { inView = en.isIntersecting; if (inView) schedule(); else clearTimeout(timer); });
    }, { threshold: 0.3 }).observe(how);
  } else { inView = true; schedule(); }
  document.addEventListener("visibilitychange", function () { if (document.hidden) clearTimeout(timer); else schedule(); });
  show(0);
})();


/* Hero 18: Sunny peeks from behind the bridge card, ducks when you hover it, and glides to its corner once you scroll. */
(function () {
  "use strict";
  var card = document.getElementById("heroCard"), bridge = document.getElementById("bridge");
  if (!card || !bridge) return;
  var wide = window.matchMedia("(min-width: 1081px)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  if (reduced) return;
  var root = null, chr = null, mode = "dock", raf = 0, greeted = false;

  function place() {
    if (!root || mode !== "hero") return;
    var r = bridge.getBoundingClientRect();
    var size = chr.offsetWidth || 150;
    var cx = r.right - size - 36;            /* character box left */
    var cy = r.top - size * 0.54;            /* the card's top edge cuts Sunny at the waist */
    root.style.left = Math.round(cx + size - root.offsetWidth) + "px";
    root.style.top = Math.round(cy + size - root.offsetHeight) + "px";
    root.style.right = "auto"; root.style.bottom = "auto";
  }
  function setMode(next) {
    if (!root || next === mode) return;
    var from = chr.getBoundingClientRect();
    mode = next;
    root.classList.add("sunny--landing");
    if (next === "hero") { root.classList.add("sunny--perch"); place(); }
    else { root.classList.remove("sunny--perch", "is-duck"); root.style.left = root.style.top = root.style.right = root.style.bottom = ""; }
    var to = chr.getBoundingClientRect();
    var dx = from.left - to.left, dy = from.top - to.top;
    try {
      chr.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "translate(" + (dx * 0.4) + "px," + (dy * 0.4 - 60) + "px)", offset: 0.5 }, { transform: "none" }],
        { duration: 1100, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }).onfinish = function () { root.classList.remove("sunny--landing"); };
    } catch (e) { root.classList.remove("sunny--landing"); }
    if (window.Sunny) {
      if (next === "dock") { window.Sunny.emote("happy"); window.Sunny.say("Ducked behind, then down here.", 2600); }
      else { window.Sunny.emote("curious"); }
    }
  }
  function tick() {
    raf = 0;
    if (!root) return;
    if (!wide.matches) { setMode("dock"); return; }
    var top = bridge.getBoundingClientRect().top;
    if (mode === "hero" && top < 120) setMode("dock");
    else if (mode === "dock" && top > 180) setMode("hero");
    place();
  }
  function schedule() { if (!raf) raf = setTimeout(tick, 16); }

  function hook() {
    root = document.querySelector(".sunny"); if (!root) return false;
    chr = root.querySelector(".sunny__char"); if (!chr) return false;
    mode = "dock";
    if (wide.matches && bridge.getBoundingClientRect().top > 180) {
      root.classList.add("sunny--perch"); mode = "hero"; place();
      setTimeout(function () { if (mode === "hero" && window.Sunny && !greeted) { greeted = true; window.Sunny.emote("curious"); window.Sunny.say("Boo. Hover the card, it tilts.", 3000); } }, 1400);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    bridge.addEventListener("mouseenter", function () { if (mode === "hero") { root.classList.add("is-duck"); if (window.Sunny) window.Sunny.emote("shy", 1600); } });
    bridge.addEventListener("mouseleave", function () { root.classList.remove("is-duck"); });
    return true;
  }
  var tries = 0;
  (function wait() { if (hook()) return; if (++tries < 80) setTimeout(wait, 150); })();
})();
