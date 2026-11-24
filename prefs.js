/* Preferences: one panel for display, motion, sound, keyboard and the companions, plus the site's tooltips.
   Runs first so the other scripts can read the stored choices. Everything is stored in this browser only. */
(function (global) {
  "use strict";
  var doc = document, root = doc.documentElement;
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function mq(q) { return !!(global.matchMedia && global.matchMedia(q).matches); }

  /* ---------- state ---------- */
  var P = {
    shortcuts: function () { return get("keys:shortcuts", "on") !== "off"; },
    motion: function () { return get("pref:motion", "auto"); },           /* auto | reduce */
    systemMotion: function () { return mq("(prefers-reduced-motion: reduce)"); },
    sunny: function () { return get("pref:sunny", "on") !== "off"; },
    companion: function () { var v = get("pref:companion", "sunny"); return ["sunny", "puppy", "together"].indexOf(v) > -1 ? v : "sunny"; }, /* sunny | puppy | together */
    text: function () { var v = get("pref:text", "normal"); return ["normal", "large", "larger"].indexOf(v) > -1 ? v : "normal"; },
    links: function () { return get("pref:links", "auto") === "underline"; },
    theme: function () { var v = get("theme", "light"); return v === "dark" || v === "system" ? v : "light"; }, /* light | dark | system */
    sound: function () { return get("sunny:sound", "off") === "on" ? get("sunny:voice", "soft") : "off"; }
  };
  function themeDark() { var t = P.theme(); return t === "dark" || (t === "system" && mq("(prefers-color-scheme: dark)")); }
  function apply() {
    root.classList.toggle("reduce-motion", P.motion() === "reduce");
    root.classList.toggle("no-sunny", !P.sunny());
    root.classList.toggle("text-lg", P.text() === "large");
    root.classList.toggle("text-xl", P.text() === "larger");
    root.classList.toggle("u-links", P.links());
    if (P.theme() === "system" || root.hasAttribute("data-theme") !== themeDark()) {
      if (themeDark()) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    }
    var tb = doc.getElementById("themeToggle"), ic = tb && tb.querySelector(".nav__theme-icon");
    if (tb) tb.setAttribute("aria-pressed", String(themeDark()));
    if (ic) ic.textContent = themeDark() ? "☾" : "☀";
    if (doc.body) doc.body.classList.toggle("no-shortcuts", !P.shortcuts());
  }
  apply();
  function changed() { apply(); global.dispatchEvent(new CustomEvent("prefs:change")); }
  /* "System" follows the OS as it changes */
  try { global.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { if (P.theme() === "system") changed(); }); } catch (e) { /* old browsers */ }

  /* ---------- panel ---------- */
  var ICON = {
    light: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="3.4"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 12.3A7 7 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8z"/></svg>',
    system: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="10" rx="1.8"/><path d="M7 17h6M10 13.5V17"/></svg>',
    replay: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10a6.5 6.5 0 1 0 2-4.7"/><path d="M3 3.5v3.5h3.5"/><path d="M8.5 7.5v5l4-2.5z" fill="currentColor" stroke="none"/></svg>',
    keys: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="2" y="5" width="16" height="10" rx="2"/><path d="M5.5 8.5h1M9.5 8.5h1M13.5 8.5h1M6 12h8"/></svg>'
  };
  /* tiny faces for the companion choice */
  var ART_SUN = '<svg viewBox="0 0 40 40" width="30" height="30"><path d="M20 10c1-3-1.5-4-.5-7" fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16.5" cy="5.5" rx="3" ry="1.6" transform="rotate(-24 16.5 5.5)" fill="#FFC93C" stroke="#111" stroke-width="1.2"/><circle cx="20" cy="23" r="15" fill="#FFC93C" stroke="#111" stroke-width="2"/><ellipse cx="14.5" cy="22" rx="2.3" ry="3" fill="#111"/><ellipse cx="25.5" cy="22" rx="2.3" ry="3" fill="#111"/><circle cx="15.3" cy="20.8" r="0.9" fill="#fff"/><circle cx="26.3" cy="20.8" r="0.9" fill="#fff"/><path d="M16 28q4 3.5 8 0" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var ART_PUP = '<svg viewBox="0 0 40 40" width="30" height="30"><path d="M8 22 L5 5 L18 14 Z M32 22 L35 5 L22 14 Z" fill="#2b2d33" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><circle cx="20" cy="23" r="14" fill="#2b2d33" stroke="#111" stroke-width="2"/><path d="M20.5 11 l2.6 -4 l-.8 2.8 h2.2 l-3.6 4.8 l1 -3.1 h-2.2 z" fill="#8cc0ff" stroke="#4d8dff" stroke-width=".6"/><ellipse cx="14.8" cy="23" rx="3.2" ry="3.8" fill="#e8a03a" stroke="#111" stroke-width="1.2"/><ellipse cx="25.2" cy="23" rx="3.2" ry="3.8" fill="#e8a03a" stroke="#111" stroke-width="1.2"/><ellipse cx="15.2" cy="23.3" rx="1.9" ry="2.5" fill="#111"/><ellipse cx="25.6" cy="23.3" rx="1.9" ry="2.5" fill="#111"/><circle cx="16" cy="21.8" r=".8" fill="#fff"/><circle cx="26.4" cy="21.8" r=".8" fill="#fff"/><path d="M18 28.5 q2 -1.5 4 0 q-.6 2.2 -2 2.4 q-1.4 -.2 -2 -2.4z" fill="#111"/></svg>';

  function build() {
    var nav = doc.querySelector(".nav"); if (!nav || doc.getElementById("prefs")) return;
    var resume = nav.querySelector(".nav__resume");
    var btn = doc.createElement("button");
    btn.type = "button"; btn.className = "nav__prefs"; btn.id = "prefsToggle";
    btn.setAttribute("aria-haspopup", "dialog"); btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("data-tip", "Accessibility & preferences"); btn.setAttribute("aria-label", "Accessibility and preferences");
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="7.3" r="1.3" fill="currentColor" stroke="none"/><path d="M7 10.2c3.3.9 6.7.9 10 0"/><path d="M12 10.8v3.4l-2.1 4.2M12 14.2l2.1 4.2"/></svg>';
    var utils = nav.querySelector(".nav__utils"), pill = nav.querySelector(".nav__pill"), inspect = nav.querySelector("#inspectToggle");
    if (utils) utils.appendChild(btn);
    else if (inspect && inspect.parentNode) inspect.parentNode.insertBefore(btn, inspect.nextSibling);
    else if (pill) pill.appendChild(btn);
    else if (resume) nav.insertBefore(btn, resume);
    else nav.appendChild(btn);

    var hasKeys = !!doc.getElementById("keys");
    function seg(key, label, opts, hint) { /* a radio group of pills */
      return '<div class="prefs__row prefs__row--stack"><div class="prefs__text"><span class="prefs__label" id="pl-' + key + '">' + label + '</span>' + (hint ? '<span class="prefs__hint" id="ph-' + key + '">' + hint + '</span>' : "") + '</div>' +
        '<div class="prefs__seg" role="radiogroup" aria-labelledby="pl-' + key + '"' + (hint ? ' aria-describedby="ph-' + key + '"' : "") + ' data-seg="' + key + '">' +
        opts.map(function (o) { return '<button type="button" role="radio" aria-checked="false" tabindex="-1" data-val="' + o[0] + '"' + (o[3] ? ' data-tip="' + o[3] + '"' : "") + '>' + (o[2] || "") + '<span>' + o[1] + '</span></button>'; }).join("") + "</div></div>";
    }
    function toggle(key, label, hint) {
      return '<label class="prefs__row"><span class="prefs__text"><span class="prefs__label">' + label + '</span><span class="prefs__hint" id="ph-' + key + '">' + hint + '</span></span>' +
        '<input type="checkbox" role="switch" class="prefs__check" data-pref="' + key + '" aria-describedby="ph-' + key + '" /><span class="prefs__track" aria-hidden="true"></span></label>';
    }
    function group(id, title, body) { return '<section class="prefs__group" aria-labelledby="pg-' + id + '"><h3 class="prefs__h mono" id="pg-' + id + '">' + title + "</h3>" + body + "</section>"; }
    var panel = doc.createElement("div");
    panel.className = "prefs"; panel.id = "prefs"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "prefsTitle");
    panel.innerHTML =
      '<div class="prefs__card">' +
        '<div class="prefs__head"><div class="prefs__headtext"><h2 class="prefs__title" id="prefsTitle">Accessibility &amp; preferences</h2><p class="prefs__intro">Changes apply right away and stay in this browser. Nothing is sent anywhere.</p></div>' +
          '<button type="button" class="prefs__close" aria-label="Close preferences" data-tip="Close · Esc">×</button></div>' +
        '<div class="prefs__body">' +
          group("display", "Display",
            seg("theme", "Theme", [["light", "Light", ICON.light], ["dark", "Dark", ICON.dark], ["system", "System", ICON.system, "Follows your device"]]) +
            seg("text", "Text size", [["normal", "Default", '<b class="prefs__aa" style="font-size:12px">A</b>'], ["large", "Large", '<b class="prefs__aa" style="font-size:14px">A</b>', "About an eighth bigger"], ["larger", "Larger", '<b class="prefs__aa" style="font-size:16px">A</b>', "About a quarter bigger"]]) +
            toggle("links", "Underline links", "Marks every link with an underline, so none depend on colour alone.")) +
          group("motion", "Motion and sound",
            toggle("motion", "Reduce motion", "Stills the loading scene, and stops reveals, the companions’ acts and the replay.") +
            seg("sound", "Companion sound", [["off", "Off"], ["soft", "Soft"], ["bubbly", "Bubbly"], ["retro", "Retro"], ["bell", "Bell"]], "Short synthesized cues when Sunny or Puppy reacts. Off until you choose.")) +
          group("keys", "Keyboard",
            toggle("shortcuts", "Single-key shortcuts", "I, G, T, A and C. <kbd>?</kbd> and <kbd>Esc</kbd> always work. Turn off if you use a screen reader or voice control.") +
            (hasKeys ? '<div class="prefs__row prefs__row--btn"><button type="button" class="prefs__btn" data-act="keys">' + ICON.keys + '<span>See all shortcuts</span><kbd>?</kbd></button></div>' : "")) +
          group("comp", "Companions",
            toggle("sunny", "Show companions", "Sunny and Puppy in the corner, their speech bubbles and the Ask me tag.") +
            '<div class="prefs__row prefs__row--stack prefs__row--comp"><div class="prefs__text"><span class="prefs__label" id="pl-comp">Who keeps you company</span></div>' +
              '<div class="prefs__cards" role="radiogroup" aria-labelledby="pl-comp" data-seg="companion">' +
                [["sunny", "Sunny", ART_SUN, "Answers your questions"], ["puppy", "Puppy", ART_PUP, "Plays, and still opens the chat"], ["together", "Together", ART_SUN + ART_PUP, "Puppy as Sunny’s sidekick"]].map(function (c) {
                  return '<button type="button" role="radio" aria-checked="false" tabindex="-1" data-val="' + c[0] + '"><span class="prefs__card-art" aria-hidden="true">' + c[2] + '</span><span class="prefs__card-name">' + c[1] + '</span><span class="prefs__card-note">' + c[3] + "</span></button>";
                }).join("") + "</div></div>" +
            '<div class="prefs__row prefs__row--btn"><a class="prefs__btn" data-act="story" href="?story">' + ICON.replay + '<span>See the loading scene again</span></a><p class="prefs__hint prefs__hint--story">Sunny and Puppy play in the weather where you are right now. The city in your time zone is looked up on Open-Meteo; nothing else is sent, and it never asks for your location.</p></div>') +
        '</div>' +
        '<div class="prefs__foot"><button type="button" class="prefs__reset">Reset all</button><span class="mono">Stored in this browser</span></div>' +
      "</div>";
    doc.body.appendChild(panel);
    var storyLink = panel.querySelector('[data-act="story"]');
    if (storyLink) storyLink.setAttribute("href", location.pathname + "?story");

    function checkSeg(key, val) {
      var g = panel.querySelector('[data-seg="' + key + '"]'); if (!g) return;
      Array.prototype.forEach.call(g.querySelectorAll("[data-val]"), function (b) { var on = b.getAttribute("data-val") === val; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", String(on)); b.setAttribute("tabindex", on ? "0" : "-1"); });
    }
    function render() {
      panel.querySelector('[data-pref="shortcuts"]').checked = P.shortcuts();
      var sysMotion = P.systemMotion(), mot = panel.querySelector('[data-pref="motion"]');
      mot.checked = sysMotion || P.motion() === "reduce"; mot.disabled = sysMotion;
      panel.querySelector("#ph-motion").textContent = sysMotion ? "On, because your device asks for less motion. Change it in your system settings." : "Stills the loading scene, and stops reveals, the companions’ acts and the replay.";
      panel.querySelector('[data-pref="sunny"]').checked = P.sunny();
      panel.querySelector('[data-pref="links"]').checked = P.links();
      checkSeg("theme", P.theme()); checkSeg("text", P.text()); checkSeg("sound", P.sound()); checkSeg("companion", P.companion());
      panel.querySelector(".prefs__row--comp").classList.toggle("is-off", !P.sunny());
      Array.prototype.forEach.call(panel.querySelectorAll('[data-seg="companion"] button, [data-seg="sound"] button, [data-act="story"]'), function (b) { if (P.sunny()) b.removeAttribute("aria-disabled"); else b.setAttribute("aria-disabled", "true"); });
      panel.querySelector('[data-seg="sound"]').closest(".prefs__row").classList.toggle("is-off", !P.sunny());
      if (storyLink) storyLink.closest(".prefs__row").classList.toggle("is-off", !P.sunny());
    }
    function choose(key, val) {
      if (key === "theme") set("theme", val);
      if (key === "text") set("pref:text", val);
      if (key === "sound") {
        var S = global.Sunny;
        if (val === "off") { if (S) S.setSound(false); else set("sunny:sound", "off"); }
        else if (S) S.setVoice(val, true); else { set("sunny:sound", "on"); set("sunny:voice", val); }
      }
      if (key === "companion") { set("pref:companion", val); if (global.Sunny && global.Sunny.setMode) global.Sunny.setMode(val); }
      changed(); render();
      var b = panel.querySelector('[data-seg="' + key + '"] [data-val="' + val + '"]'); if (b && doc.activeElement && doc.activeElement.closest && doc.activeElement.closest('[data-seg="' + key + '"]')) b.focus();
    }
    panel.addEventListener("change", function (e) {
      var k = e.target.getAttribute && e.target.getAttribute("data-pref"); if (!k) return;
      var on = e.target.checked;
      if (k === "shortcuts") set("keys:shortcuts", on ? "on" : "off");
      if (k === "motion") set("pref:motion", on ? "reduce" : "auto");
      if (k === "sunny") set("pref:sunny", on ? "on" : "off");
      if (k === "links") set("pref:links", on ? "underline" : "auto");
      changed(); render();
    });
    panel.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-val]");
      if (b) { if (b.getAttribute("aria-disabled") === "true") return; choose(b.closest("[data-seg]").getAttribute("data-seg"), b.getAttribute("data-val")); return; }
      var a = e.target.closest && e.target.closest("[data-act]");
      if (a && a.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }
      if (a && a.getAttribute("data-act") === "keys") { setOpen(false); setTimeout(function () { doc.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true })); }, 60); return; }
      if (a && a.getAttribute("data-act") === "story") { try { sessionStorage.removeItem("sunny:loader"); } catch (err) { /* ignore */ } return; }
      if (e.target.closest && e.target.closest(".prefs__reset")) {
        ["keys:shortcuts", "pref:motion", "pref:sunny", "pref:text", "pref:links", "pref:companion", "sunny:sound", "sunny:voice", "theme"].forEach(function (k) { try { localStorage.removeItem(k); } catch (err) { /* ignore */ } });
        if (global.Sunny) { global.Sunny.setSound(false); if (global.Sunny.setMode) global.Sunny.setMode("sunny"); }
        changed(); render();
      }
      if ((e.target.closest && e.target.closest(".prefs__close")) || e.target === panel) setOpen(false);
    });
    /* arrow keys move a radio group's choice */
    panel.addEventListener("keydown", function (e) {
      var b = e.target.closest && e.target.closest("[data-seg] [data-val]"); if (!b) return;
      var g = b.closest("[data-seg]"), all = Array.prototype.slice.call(g.querySelectorAll("[data-val]")), i = all.indexOf(b), n = all.length, to = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (i + 1) % n;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (i + n - 1) % n;
      if (e.key === "Home") to = 0; if (e.key === "End") to = n - 1;
      if (to < 0 || all[to].getAttribute("aria-disabled") === "true") return;
      e.preventDefault(); choose(g.getAttribute("data-seg"), all[to].getAttribute("data-val")); all[to].focus();
    });
    var open = false, lastFocus = null;
    function setOpen(on) {
      open = on; panel.hidden = !on; btn.setAttribute("aria-expanded", String(on));
      doc.body.classList.toggle("prefs-open", on);
      if (on) { lastFocus = doc.activeElement; render(); var first = panel.querySelector('[data-seg="theme"] [tabindex="0"]'); if (first) first.focus(); }
      else if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    btn.addEventListener("click", function () { setOpen(!open); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } });
    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return; /* keep focus inside while open */
      var f = Array.prototype.filter.call(panel.querySelectorAll("input:not([disabled]), button, a[href]"), function (x) { return x.tabIndex >= 0 && x.offsetParent !== null; }); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    global.addEventListener("prefs:change", function () { if (open) render(); });
    global.addEventListener("prefs:open", function () { setOpen(true); });
    /* the nav's theme button writes light or dark; keep the panel in step */
    var tb = doc.getElementById("themeToggle"); if (tb) tb.addEventListener("click", function () { setTimeout(function () { if (open) render(); }, 0); });
    render();
  }

  /* ---------- tooltips: icons, external links, downloads, and anything with a title or data-tip ---------- */
  var SITES = { "linkedin.com": "LinkedIn", "behance.net": "Behance", "dribbble.com": "Dribbble", "instagram.com": "Instagram", "figma.com": "Figma", "github.com": "GitHub", "medium.com": "Medium", "x.com": "X", "twitter.com": "X", "youtube.com": "YouTube" };
  function siteName(host) { host = (host || "").replace(/^www\./, ""); for (var k in SITES) if (host === k || host.slice(-(k.length + 1)) === "." + k) return SITES[k]; return host; }
  function words(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function iconOnly(el) { return !/[A-Za-z]{2,}/.test(words(el)); }
  /* a key hint at the end ("(I)" or "· I") only while single-key shortcuts are on */
  function keyHint(t) {
    t = t.replace(/\s*\(([A-Z?])\)$/, " · $1");
    return P.shortcuts() ? t : t.replace(/ · [A-Z]$/, "");
  }
  function external(el) { return el.tagName === "A" && /^https?:/i.test(el.getAttribute("href") || "") && el.host !== location.host; }
  function tipFor(el) {
    if (el.id === "themeToggle") return keyHint((root.getAttribute("data-theme") === "dark" ? "Switch to light theme" : "Switch to dark theme") + " · T");
    if (el.classList.contains("sunny__ask")) { var who = global.Sunny && global.Sunny.mode && global.Sunny.mode() === "puppy" ? "Puppy" : "Sunny"; return keyHint("Ask about the work, or click " + who + " · A"); }
    var t = el.getAttribute("data-tip");
    if (t == null && el.getAttribute("title")) { /* a native title would show a second, unstyled tooltip */
      t = el.getAttribute("title"); el.setAttribute("data-tip", t); el.removeAttribute("title");
      if (!el.getAttribute("aria-label") && iconOnly(el)) el.setAttribute("aria-label", t);
    }
    var label = el.getAttribute("aria-label") || "";
    if (t == null && el.tagName === "A") {
      var href = el.getAttribute("href") || "";
      if (el.hasAttribute("download")) t = label || "Downloads the file";
      else if (/^mailto:/i.test(href)) t = "Write to " + decodeURIComponent(href.slice(7).split("?")[0]) + " in your email app";
      else if (/^tel:/i.test(href)) t = "Calls " + href.slice(4);
      else if (el.classList.contains("piece")) t = "Opens a larger view";
    }
    if (external(el)) { /* say where it goes, and that it leaves in a new tab */
      var where = siteName(el.hostname), newTab = el.target === "_blank";
      var base = t || (label && iconOnly(el) && label !== where ? label : "");
      var go = newTab ? "Opens " + where + " in a new tab" : "Goes to " + where;
      if (!base || base === where) t = go;
      else if (!/new tab|goes to|opens/i.test(base)) t = base + " · " + (newTab ? "new tab" : where);
      else t = base;
    }
    if (t == null && label && iconOnly(el)) t = label;
    return t ? keyHint(t) : "";
  }
  function tips() {
    var fine = mq("(hover: hover) and (pointer: fine)");
    var tip = doc.createElement("div"); tip.className = "tip"; tip.id = "siteTip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
    doc.body.appendChild(tip);
    var cur = null, showT = 0, warmUntil = 0, described = null;
    var SEL = "a[href], button, [role='button'], summary, [data-tip], [title]";
    function target(node) {
      var el = node && node.closest ? node.closest(SEL) : null;
      if (!el || el.closest(".sst, .ask, .sunny__svg, .puppy__svg") || doc.body.classList.contains("inspecting")) return null;
      return tipFor(el) ? el : null;
    }
    function show(el) {
      var text = tipFor(el); if (!text) return;
      cur = el; tip.textContent = text; tip.hidden = false; tip.classList.remove("is-on", "is-below");
      var r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, vw = doc.documentElement.clientWidth;
      var below = r.top - th - 10 < 6;
      var top = below ? r.bottom + 10 : r.top - th - 10;
      var cx = r.left + r.width / 2, left = Math.max(8, Math.min(vw - tw - 8, cx - tw / 2));
      tip.style.left = Math.round(left) + "px"; tip.style.top = Math.round(top) + "px";
      tip.style.setProperty("--ax", Math.round(cx - left) + "px");
      tip.classList.toggle("is-below", below);
      void tip.offsetWidth; tip.classList.add("is-on");
      /* for keyboard and screen-reader users, the tip describes the control unless it only repeats its name */
      var name = el.getAttribute("aria-label") || words(el);
      if (text !== name && !el.hasAttribute("aria-describedby")) { el.setAttribute("aria-describedby", tip.id); described = el; }
    }
    function hide() {
      clearTimeout(showT);
      if (cur) warmUntil = Date.now() + 500;
      cur = null; tip.classList.remove("is-on"); tip.hidden = true;
      if (described) { described.removeAttribute("aria-describedby"); described = null; }
    }
    function later(el) { clearTimeout(showT); showT = setTimeout(function () { show(el); }, Date.now() < warmUntil ? 0 : 380); }
    if (fine) {
      doc.addEventListener("pointerover", function (e) {
        if (e.pointerType && e.pointerType !== "mouse") return;
        var el = target(e.target);
        if (el === cur) return;
        if (cur) hide();
        if (el) later(el);
      }, { passive: true });
      doc.addEventListener("pointerout", function (e) { if (!e.relatedTarget || !(cur || showT) || (cur && !cur.contains(e.relatedTarget))) { if (!target(e.relatedTarget)) hide(); } }, { passive: true });
    }
    doc.addEventListener("focusin", function (e) {
      var el = target(e.target);
      if (!el || !(el.matches && el.matches(":focus-visible"))) { if (cur) hide(); return; }
      hide(); show(el);
    });
    doc.addEventListener("focusout", function () { hide(); });
    doc.addEventListener("pointerdown", hide, { passive: true });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && cur) hide(); });
    global.addEventListener("scroll", function () { if (cur) hide(); }, { passive: true, capture: true });
  }
  /* narrow screens: links and utilities fold into a drawer behind a menu button */
  function drawer() {
    var nav = doc.querySelector(".nav"); if (!nav || nav.querySelector(".nav__drawer")) return;
    var pill = nav.querySelector(".nav__pill"), utils = nav.querySelector(".nav__utils");
    if (!pill) return;
    var box = doc.createElement("div"); box.className = "nav__drawer"; box.id = "navDrawer";
    nav.insertBefore(box, pill); box.appendChild(pill);
    var resume = nav.querySelector(".nav__resume");
    var right = doc.createElement("div"); right.className = "nav__right";
    if (resume) { nav.insertBefore(right, resume); right.appendChild(resume); } else nav.appendChild(right);
    var wide = function () { return global.innerWidth > (nav.classList.contains("nav--rail") ? 1399 : 1080); };
    function place() {
      if (!utils) return;
      if (wide()) { if (utils.parentNode !== right) right.insertBefore(utils, right.firstChild); }
      else if (utils.parentNode !== box) box.appendChild(utils);
    }
    place(); global.addEventListener("resize", place);
    /* reserve the bold width of each label so the row never shifts when the active link changes */
    Array.prototype.forEach.call(nav.querySelectorAll(".nav__link"), function (a) {
      var span = a.querySelector("span"); if (!span) { span = doc.createElement("span"); span.textContent = a.textContent.trim(); a.textContent = ""; a.appendChild(span); }
      span.setAttribute("data-label", span.textContent.trim());
    });
    var menu = doc.createElement("button");
    menu.type = "button"; menu.className = "nav__menu"; menu.setAttribute("aria-expanded", "false"); menu.setAttribute("aria-controls", "navDrawer"); menu.setAttribute("aria-label", "Menu");
    menu.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(menu);
    function setOpen(on) { nav.classList.toggle("is-open", on); menu.setAttribute("aria-expanded", String(on)); doc.body.classList.toggle("nav-open", on); }
    menu.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    box.addEventListener("click", function (e) { if (e.target.closest("a.nav__link")) setOpen(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) setOpen(false); });
    global.addEventListener("resize", function () { if (wide() && nav.classList.contains("is-open")) setOpen(false); });
  }
  function boot() { apply(); build(); drawer(); tips(); }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot); else boot();
  global.Prefs = { get: P, apply: apply, changed: changed, open: function () { global.dispatchEvent(new Event("prefs:open")); } };
})(window);
