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
    btn.title = "Preferences: shortcuts, motion, Sunny, sound, text size"; btn.setAttribute("aria-label", "Preferences");
    btn.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M3 6h14M3 14h14"/><circle cx="8" cy="6" r="2.2" fill="var(--pill, #15161a)"/><circle cx="12.5" cy="14" r="2.2" fill="var(--pill, #15161a)"/></svg>';
    if (resume) {
      /* one pill: preferences segment, divider, résumé */
      var group = doc.createElement("div"); group.className = "nav__tools";
      nav.insertBefore(group, resume); group.appendChild(btn); group.appendChild(resume);
    } else nav.appendChild(btn);

    var panel = doc.createElement("div");
    panel.className = "prefs"; panel.id = "prefs"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "prefsTitle");
    panel.innerHTML =
      '<div class="prefs__card">' +
        '<div class="prefs__head"><span class="prefs__title" id="prefsTitle">Preferences</span><button type="button" class="prefs__close" aria-label="Close preferences">×</button></div>' +
        '<p class="prefs__intro">Saved in this browser only. Nothing is sent anywhere.</p>' +
        row("shortcuts", "Single-key shortcuts", "I, G, T, V, A and C. <kbd>?</kbd> and <kbd>Esc</kbd> always work. Off is safer with screen readers and voice control.") +
        row("motion", "Reduce motion", "Stops the intro, reveals, Sunny’s acts and the replay. Follows your system setting unless you choose here.") +
        row("sunny", "Show Sunny", "The mascot in the corner, its speech bubbles and the Ask me button.") +
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
      if (e.target.classList.contains("prefs__reset")) {
        ["keys:shortcuts", "pref:motion", "pref:sunny", "pref:text", "sunny:sound", "sunny:voice"].forEach(function (k) { try { localStorage.removeItem(k); } catch (err) { /* ignore */ } });
        if (global.Sunny) global.Sunny.setSound(false);
        changed(); render();
      }
      if (e.target.classList.contains("prefs__close") || e.target === panel) setOpen(false);
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
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", build); else build();
  global.Prefs = { get: P, apply: apply, changed: changed, open: function () { global.dispatchEvent(new Event("prefs:open")); } };
})(window);
