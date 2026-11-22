/* Preferences: one panel for keyboard shortcuts, reduced motion, Sunny, sound and text size.
   Runs first so the other scripts can read the stored choices. Everything is stored in this browser only. */
(function (global) {
  "use strict";
  var doc = document, root = doc.documentElement;
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* ---------- state ---------- */
  var P = {
    shortcuts: function () { return get("keys:shortcuts", "on") !== "off"; },
    motion: function () { return get("pref:motion", "auto"); },           /* auto | reduce */
    sunny: function () { return get("pref:sunny", "on") !== "off"; },
    companion: function () { var v = get("pref:companion", "sunny"); return ["sunny", "puppy", "together"].indexOf(v) > -1 ? v : "sunny"; }, /* sunny | puppy | together */
    text: function () { return get("pref:text", "normal"); },             /* normal | large */
    sound: function () { return get("sunny:sound", "off") === "on" ? get("sunny:voice", "soft") : "off"; }
  };
  function apply() {
    root.classList.toggle("reduce-motion", P.motion() === "reduce");
    root.classList.toggle("no-sunny", !P.sunny());
    root.classList.toggle("text-lg", P.text() === "large");
    if (doc.body) doc.body.classList.toggle("no-shortcuts", !P.shortcuts());
  }
  apply();
  function changed() { apply(); global.dispatchEvent(new CustomEvent("prefs:change")); }

  /* ---------- panel ---------- */
  function build() {
    var nav = doc.querySelector(".nav"); if (!nav || doc.getElementById("prefs")) return;
    var resume = nav.querySelector(".nav__resume");
    var btn = doc.createElement("button");
    btn.type = "button"; btn.className = "nav__prefs"; btn.id = "prefsToggle";
    btn.setAttribute("aria-haspopup", "dialog"); btn.setAttribute("aria-expanded", "false");
    btn.title = "Accessibility and preferences: shortcuts, motion, companions, sound, text size"; btn.setAttribute("aria-label", "Accessibility and preferences");
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="7.3" r="1.3" fill="currentColor" stroke="none"/><path d="M7 10.2c3.3.9 6.7.9 10 0"/><path d="M12 10.8v3.4l-2.1 4.2M12 14.2l2.1 4.2"/></svg>';
    var utils = nav.querySelector(".nav__utils"), pill = nav.querySelector(".nav__pill"), inspect = nav.querySelector("#inspectToggle");
    if (utils) utils.appendChild(btn);
    else if (inspect && inspect.parentNode) inspect.parentNode.insertBefore(btn, inspect.nextSibling);
    else if (pill) pill.appendChild(btn);
    else if (resume) nav.insertBefore(btn, resume);
    else nav.appendChild(btn);

    /* tiny faces for the companion choice */
    var ART_SUN = '<svg viewBox="0 0 40 40" width="22" height="22"><path d="M20 10c1-3-1.5-4-.5-7" fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16.5" cy="5.5" rx="3" ry="1.6" transform="rotate(-24 16.5 5.5)" fill="#FFC93C" stroke="#111" stroke-width="1.2"/><circle cx="20" cy="23" r="15" fill="#FFC93C" stroke="#111" stroke-width="2"/><ellipse cx="14.5" cy="22" rx="2.3" ry="3" fill="#111"/><ellipse cx="25.5" cy="22" rx="2.3" ry="3" fill="#111"/><circle cx="15.3" cy="20.8" r="0.9" fill="#fff"/><circle cx="26.3" cy="20.8" r="0.9" fill="#fff"/><path d="M16 28q4 3.5 8 0" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/></svg>';
    var ART_PUP = '<svg viewBox="0 0 40 40" width="22" height="22"><path d="M8 22 L5 5 L18 14 Z M32 22 L35 5 L22 14 Z" fill="#2b2d33" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><circle cx="20" cy="23" r="14" fill="#2b2d33" stroke="#111" stroke-width="2"/><path d="M20.5 11 l2.6 -4 l-.8 2.8 h2.2 l-3.6 4.8 l1 -3.1 h-2.2 z" fill="#8cc0ff" stroke="#4d8dff" stroke-width=".6"/><ellipse cx="14.8" cy="23" rx="3.2" ry="3.8" fill="#e8a03a" stroke="#111" stroke-width="1.2"/><ellipse cx="25.2" cy="23" rx="3.2" ry="3.8" fill="#e8a03a" stroke="#111" stroke-width="1.2"/><ellipse cx="15.2" cy="23.3" rx="1.9" ry="2.5" fill="#111"/><ellipse cx="25.6" cy="23.3" rx="1.9" ry="2.5" fill="#111"/><circle cx="16" cy="21.8" r=".8" fill="#fff"/><circle cx="26.4" cy="21.8" r=".8" fill="#fff"/><path d="M18 28.5 q2 -1.5 4 0 q-.6 2.2 -2 2.4 q-1.4 -.2 -2 -2.4z" fill="#111"/></svg>';
    var panel = doc.createElement("div");
    panel.className = "prefs"; panel.id = "prefs"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "prefsTitle");
    panel.innerHTML =
      '<div class="prefs__card">' +
        '<div class="prefs__head"><span class="prefs__title" id="prefsTitle">Accessibility &amp; preferences</span><button type="button" class="prefs__close" aria-label="Close preferences">×</button></div>' +
        '<p class="prefs__intro">Saved in this browser only. Nothing is sent anywhere.</p>' +
        row("shortcuts", "Single-key shortcuts", "I, G, T, A and C. <kbd>?</kbd> and <kbd>Esc</kbd> always work. Off is safer with screen readers and voice control.") +
        row("motion", "Reduce motion", "Stops the intro, reveals, Sunny’s acts and the replay. Follows your system setting unless you choose here.") +
        row("sunny", "Show companions", "Sunny and Puppy in the corner, their speech bubbles and the Ask me button.") +
        '<div class="prefs__row prefs__row--voice prefs__row--comp"><div class="prefs__text"><span class="prefs__label">Companion</span><span class="prefs__hint">Sunny answers questions. Puppy is the playful one. Together, Puppy tags along as Sunny’s sidekick.</span></div>' +
          '<div class="prefs__comp" role="radiogroup" aria-label="Companion">' + [["sunny", "Sunny", ART_SUN], ["puppy", "Puppy", ART_PUP], ["together", "Together", ART_SUN + ART_PUP]].map(function (c) { return '<button type="button" role="radio" aria-checked="false" tabindex="-1" data-comp="' + c[0] + '"><span class="prefs__comp-art" aria-hidden="true">' + c[2] + '</span>' + c[1] + "</button>"; }).join("") + "</div></div>" +
        row("text", "Larger text", "Scales the whole page up by about an eighth.") +
        '<div class="prefs__row prefs__row--voice"><div class="prefs__text"><span class="prefs__label">Sound</span><span class="prefs__hint">Off until you choose. Short synthesized cues when Sunny reacts.</span></div>' +
          '<div class="prefs__voice" role="group" aria-label="Sunny’s sound">' + ["off", "soft", "bubbly", "retro", "bell"].map(function (v) { return '<button type="button" data-voice="' + v + '">' + v + "</button>"; }).join("") + "</div></div>" +
        '<p class="prefs__foot mono">Theme: use the sun button in the nav · <button type="button" class="prefs__reset">Reset all</button></p>' +
      "</div>";
    doc.body.appendChild(panel);

    function row(key, label, hint) {
      return '<label class="prefs__row"><span class="prefs__text"><span class="prefs__label">' + label + '</span><span class="prefs__hint">' + hint + '</span></span>' +
        '<input type="checkbox" class="prefs__check" data-pref="' + key + '" /><span class="prefs__track" aria-hidden="true"></span></label>';
    }
    function render() {
      panel.querySelector('[data-pref="shortcuts"]').checked = P.shortcuts();
      panel.querySelector('[data-pref="motion"]').checked = P.motion() === "reduce";
      panel.querySelector('[data-pref="sunny"]').checked = P.sunny();
      panel.querySelector('[data-pref="text"]').checked = P.text() === "large";
      var comp = P.companion();
      Array.prototype.forEach.call(panel.querySelectorAll("[data-comp]"), function (b) { var on = b.getAttribute("data-comp") === comp; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", String(on)); b.setAttribute("tabindex", on ? "0" : "-1"); });
      var cur = P.sound();
      Array.prototype.forEach.call(panel.querySelectorAll("[data-voice]"), function (b) { b.classList.toggle("is-on", b.getAttribute("data-voice") === cur); b.setAttribute("aria-pressed", String(b.getAttribute("data-voice") === cur)); });
    }
    panel.addEventListener("change", function (e) {
      var k = e.target.getAttribute && e.target.getAttribute("data-pref"); if (!k) return;
      var on = e.target.checked;
      if (k === "shortcuts") set("keys:shortcuts", on ? "on" : "off");
      if (k === "motion") set("pref:motion", on ? "reduce" : "auto");
      if (k === "sunny") set("pref:sunny", on ? "on" : "off");
      if (k === "text") set("pref:text", on ? "large" : "normal");
      changed(); render();
    });
    panel.addEventListener("click", function (e) {
      var v = e.target.getAttribute && e.target.getAttribute("data-voice");
      if (v) {
        var S = global.Sunny;
        if (v === "off") { if (S) S.setSound(false); else set("sunny:sound", "off"); }
        else if (S) S.setVoice(v, true); else { set("sunny:sound", "on"); set("sunny:voice", v); }
        changed(); render();
      }
      var comp = e.target.closest && e.target.closest("[data-comp]");
      if (comp) { chooseCompanion(comp.getAttribute("data-comp")); }
      if (e.target.classList.contains("prefs__reset")) {
        ["keys:shortcuts", "pref:motion", "pref:sunny", "pref:text", "pref:companion", "sunny:sound", "sunny:voice"].forEach(function (k) { try { localStorage.removeItem(k); } catch (err) { /* ignore */ } });
        if (global.Sunny) { global.Sunny.setSound(false); if (global.Sunny.setMode) global.Sunny.setMode("sunny"); }
        changed(); render();
      }
      if (e.target.classList.contains("prefs__close") || e.target === panel) setOpen(false);
    });
    function chooseCompanion(v) {
      if (["sunny", "puppy", "together"].indexOf(v) < 0) return;
      set("pref:companion", v);
      if (global.Sunny && global.Sunny.setMode) global.Sunny.setMode(v);
      changed(); render();
      var b = panel.querySelector('[data-comp="' + v + '"]'); if (b) b.focus();
    }
    /* arrow keys move the companion choice, like a radio group */
    panel.addEventListener("keydown", function (e) {
      var b = e.target.closest && e.target.closest("[data-comp]"); if (!b) return;
      var order = ["sunny", "puppy", "together"], i = order.indexOf(b.getAttribute("data-comp"));
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); chooseCompanion(order[(i + 1) % 3]); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); chooseCompanion(order[(i + 2) % 3]); }
    });
    var open = false, lastFocus = null;
    function setOpen(on) {
      open = on; panel.hidden = !on; btn.setAttribute("aria-expanded", String(on));
      doc.body.classList.toggle("prefs-open", on);
      if (on) { lastFocus = doc.activeElement; render(); var first = panel.querySelector(".prefs__check"); if (first) first.focus(); }
      else if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    btn.addEventListener("click", function () { setOpen(!open); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } });
    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return; /* keep focus inside while open */
      var f = panel.querySelectorAll("input, button"); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    global.addEventListener("prefs:change", render);
    global.addEventListener("prefs:open", function () { setOpen(true); });
    render();
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
  function boot() { build(); drawer(); }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot); else boot();
  global.Prefs = { get: P, apply: apply, changed: changed, open: function () { global.dispatchEvent(new Event("prefs:open")); } };
})(window);
