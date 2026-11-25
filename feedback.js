/* Sunny asks for feedback, once, at a natural moment: after about three minutes on the site, at the end of a page, or
   once a case study has really been read. Never during the loading screen, while the chat is open, while the visitor
   types or looks at a picture, and never in the first moments on a page.

   Frequency: asked once per visitor (localStorage "sunny:fb"). "Not now" waits 30 days; an answer is never asked again.
   Where it goes: nowhere until the visitor presses Send. With window.SUNNY_FEEDBACK_ENDPOINT set (sunny-config.js) it is
   posted there as JSON; otherwise Send opens the visitor's own email app with a short note to the address on the site.
   For checking: ?feedback asks after two seconds; SunnyFeedback.ask() asks now; SunnyFeedback.reset() forgets. */
(function () {
  "use strict";
  var doc = document, win = window, html = doc.documentElement;
  var qs = (function () { try { return new URLSearchParams(location.search); } catch (e) { return { has: function () { return false; } }; } })();
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function sget(k) { try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function sput(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  var KEY = "sunny:fb", SKEY = "sunny:fb:s", DAY = 86400000;
  var force = qs.has("feedback");
  win.SunnyFeedback = { reset: function () { try { localStorage.removeItem(KEY); sessionStorage.removeItem(SKEY); } catch (e) { /* ignore */ } } };
  if (get("pref:sunny") === "off" && !force) return;
  var prev = null; try { prev = JSON.parse(get(KEY) || "null"); } catch (e) { prev = null; }
  if (!force && prev && (prev.done || (prev.later && Date.now() - prev.later < 30 * DAY))) return;

  var EMAIL = "ganesh.rayanbalu@gmail.com";
  var page = location.pathname.split("/").pop() || "index.html", isCase = /^case-/.test(page);
  var reduced = (win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches) || html.classList.contains("reduce-motion");

  /* ---- what the visitor has done this session: time on the site (only while the tab is in view) and case studies read ---- */
  var S = sget(SKEY) || { ms: 0, read: [] };
  var pageStart = Date.now(), lastTick = Date.now(), maxDepth = 0, asked = false, endAt = 0;
  function depth() { var h = doc.documentElement.scrollHeight - win.innerHeight; return h <= 0 ? 1 : Math.min(1, win.scrollY / h); }
  function atEnd() { return doc.documentElement.scrollHeight - (win.scrollY + win.innerHeight) < 120; }
  function onPage() { return Date.now() - pageStart; }
  function tick() {
    var now = Date.now();
    if (!doc.hidden) S.ms += Math.min(now - lastTick, 5000);
    lastTick = now; maxDepth = Math.max(maxDepth, depth());
    if (!endAt && atEnd() && maxDepth > 0.5) endAt = now; /* Sunny cheers at the end first; the question comes after */
    if (isCase && maxDepth > 0.7 && onPage() > 40000 && S.read.indexOf(page) < 0) S.read.push(page); /* a case study, really read */
    sput(SKEY, S);
    if (asked) return;
    var why = force && onPage() > 2000 ? "forced" :
      S.ms > 180000 ? "time" :
      endAt && now - endAt > 4000 && onPage() > 25000 ? "end" :
      isCase && S.read.indexOf(page) >= 0 && maxDepth > 0.85 ? "read" :
      S.read.length >= 2 ? "read" : null;
    if (why && goodMoment()) ask(why);
  }
  /* only when nothing else is happening */
  function goodMoment() {
    if (html.classList.contains("sl-on")) return false; /* the loading screen */
    if (onPage() < (force ? 1500 : 12000)) return false;
    if (win.SunnyAsk && SunnyAsk.isOpen && SunnyAsk.isOpen()) return false;
    var a = doc.activeElement; if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return false;
    var lb = doc.getElementById("lightbox"); if (lb && !lb.hidden) return false;
    var keys = doc.getElementById("keys"); if (keys && !keys.hidden) return false;
    var prefs = doc.getElementById("prefs"); if (prefs && !prefs.hidden) return false;
    var se = win.Sunny && Sunny.sense && Sunny.sense(); if (se && se.asleep) return false; /* a sleeping Sunny does not ask */
    var sn = win.Sunny && Sunny.el; if (!sn || getComputedStyle(sn).visibility === "hidden" || getComputedStyle(sn).display === "none") return false;
    return true;
  }

  /* ---- the card ---- */
  var CSS = `
.fb { position: fixed; z-index: 2147482000; width: min(340px, calc(calc(100vw / var(--z, 1)) - 24px)); padding: 16px 16px 14px; border-radius: 16px; background: var(--card, #fff); color: var(--ink, #15161a); border: 1px solid var(--line, #e6e7ea); box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.35); font: 14px/1.45 "Inter", system-ui, sans-serif; opacity: 0; transform: translateY(10px) scale(0.98); transform-origin: 90% 100%; transition: opacity 0.3s var(--ease-out, ease), transform 0.4s var(--ease-out, ease); }
.fb.is-in { opacity: 1; transform: none; }
.fb__x { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border: 0; border-radius: 50%; background: transparent; color: var(--muted, #61656e); font-size: 18px; line-height: 1; cursor: pointer; }
.fb__x:hover { background: var(--surface, #f5f5f3); color: var(--ink, #15161a); }
.fb__q { margin: 0 28px 12px 0; font: 600 15px/1.35 "Space Grotesk", "Inter", sans-serif; }
.fb__opts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.fb__opt { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 10px; border: 1px solid var(--line, #e6e7ea); background: var(--card, #fff); color: inherit; font: 500 13px/1.2 "Inter", system-ui, sans-serif; text-align: left; cursor: pointer; transition: border-color 0.15s ease, background-color 0.15s ease; }
.fb__opt:hover, .fb__opt:focus-visible { border-color: #ffc93c; background: rgba(255, 213, 74, 0.12); outline: none; }
.fb__opt span { font-size: 17px; }
.fb__note { display: block; width: 100%; min-height: 76px; margin: 0 0 8px; padding: 9px 10px; border-radius: 10px; border: 1px solid var(--line, #e6e7ea); background: var(--bg, #fff); color: inherit; font: 13px/1.45 "Inter", system-ui, sans-serif; resize: vertical; }
.fb__who { display: block; width: 100%; margin: 0 0 10px; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--line, #e6e7ea); background: var(--bg, #fff); color: inherit; font: 13px/1.3 "Inter", system-ui, sans-serif; }
.fb__note:focus, .fb__who:focus { outline: 2px solid #ffc93c; outline-offset: 1px; }
.fb__row { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
.fb__btn { padding: 8px 14px; border-radius: 999px; border: 1px solid var(--line, #e6e7ea); background: transparent; color: inherit; font: 500 13px/1 "Inter", system-ui, sans-serif; cursor: pointer; }
.fb__btn--go { background: var(--ink, #15161a); border-color: var(--ink, #15161a); color: var(--bg, #fff); }
.fb__btn:focus-visible { outline: 2px solid #ffc93c; outline-offset: 2px; }
.fb__fine { margin: 10px 0 0; color: var(--muted, #61656e); font: 11px/1.4 "JetBrains Mono", ui-monospace, monospace; }
@media (prefers-reduced-motion: reduce) { .fb { transition: none; } }
`;
  var card = null, choice = null;
  var OPTS = [["love", "😍", "Loved it"], ["good", "🙂", "It’s good"], ["okay", "😐", "It’s okay"], ["meh", "🙁", "Not for me"]];
  function place() {
    if (!card) return;
    var sn = win.Sunny && Sunny.el && Sunny.el.querySelector(".sunny__svg"), r = sn && sn.getBoundingClientRect();
    var w = card.offsetWidth, h = card.offsetHeight, vw = win.innerWidth, vh = win.innerHeight, x, y;
    if (r && r.width && vw > 560) { x = r.left - w - 12; y = r.top + r.height * 0.35 - h; if (x < 12) { x = Math.min(vw - w - 12, r.left); y = r.top - h - 56; } }
    else if (r && r.width) { x = (vw - w) / 2; y = r.top - h - 56; } /* phones: full width, above Sunny and the line it says */
    else { x = vw - w - 24; y = vh - h - 24; }
    if (y < 12) y = Math.min(vh - h - 12, 12);
    card.style.left = Math.max(12, x) + "px"; card.style.top = Math.max(12, y) + "px";
  }
  function step1() {
    return '<p class="fb__q" id="fbQ">How’s the portfolio so far?</p><div class="fb__opts" role="group" aria-labelledby="fbQ">' +
      OPTS.map(function (o) { return '<button type="button" class="fb__opt" data-v="' + o[0] + '"><span aria-hidden="true">' + o[1] + "</span>" + o[2] + "</button>"; }).join("") + "</div>" +
      '<p class="fb__fine">One question from Sunny · takes 5 seconds</p>';
  }
  function step2() {
    var endpoint = !!win.SUNNY_FEEDBACK_ENDPOINT;
    return '<p class="fb__q" id="fbQ">' + (choice === "meh" || choice === "okay" ? "Thanks for being honest. What should I change?" : "That made my day. Anything I should add or change?") + "</p>" +
      '<label class="sl-sr" for="fbNote" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Your note</label><textarea class="fb__note" id="fbNote" maxlength="600" placeholder="Optional"></textarea>' +
      '<label class="sl-sr" for="fbWho" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Your name or email, only if you want a reply</label><input class="fb__who" id="fbWho" maxlength="120" placeholder="Name or email, only if you want a reply" autocomplete="email" />' +
      '<div class="fb__row"><button type="button" class="fb__btn" data-act="skip">Skip</button><button type="button" class="fb__btn fb__btn--go" data-act="send">' + (endpoint ? "Send" : "Send by email") + "</button></div>" +
      '<p class="fb__fine">' + (endpoint ? "Sent to Ganesh · nothing else is stored" : "Opens your email app with this note · nothing is sent until you do") + "</p>";
  }
  function say(t, ms) { if (win.Sunny && Sunny.say) Sunny.say(t, ms || 3200); }
  function emote(n) { if (win.Sunny && Sunny.emote) Sunny.emote(n, 1800); }
  function ask(why) {
    if (asked) return; asked = true;
    put(KEY, JSON.stringify({ asked: Date.now(), why: why }));
    if (win.Sunny && Sunny.hush) Sunny.hush(25000);
    emote("curious"); say(why === "read" ? "You read that one all the way. Can I ask you something?" : why === "end" ? "You made it to the end! Can I ask you something?" : "Can I ask you something quick?", 3400);
    var st = doc.createElement("style"); st.textContent = CSS; doc.head.appendChild(st);
    card = doc.createElement("div"); card.className = "fb"; card.setAttribute("role", "dialog"); card.setAttribute("aria-labelledby", "fbQ");
    card.innerHTML = '<button type="button" class="fb__x" aria-label="Not now">×</button><div class="fb__body">' + step1() + "</div>";
    doc.body.appendChild(card); place();
    setTimeout(function () { if (card) card.classList.add("is-in"); }, reduced ? 0 : 600); /* after Sunny has spoken up */
    card.addEventListener("click", onClick);
    card.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); later(); } });
    win.addEventListener("resize", place); win.addEventListener("scroll", place, { passive: true });
  }
  function onClick(e) {
    var o = e.target.closest(".fb__opt"), a = e.target.closest("[data-act]");
    if (e.target.closest(".fb__x")) return later();
    if (o) {
      choice = o.getAttribute("data-v");
      emote(choice === "love" ? "love" : choice === "good" ? "happy" : "curious");
      card.querySelector(".fb__body").innerHTML = step2(); place();
      var n = card.querySelector(".fb__note"); if (n) n.focus();
      return;
    }
    if (a && a.getAttribute("data-act") === "skip") return send(true);
    if (a && a.getAttribute("data-act") === "send") return send(false);
  }
  function send(skipNote) {
    var note = skipNote ? "" : (card.querySelector(".fb__note").value || "").trim(), who = skipNote ? "" : (card.querySelector(".fb__who").value || "").trim();
    var label = (OPTS.filter(function (o) { return o[0] === choice; })[0] || [0, "", choice])[2];
    var data = { rating: choice, label: label, note: note, contact: who, page: page, read: S.read.slice(0, 7), minutes: Math.round(S.ms / 60000) };
    put(KEY, JSON.stringify({ asked: Date.now(), done: true, rating: choice }));
    var ep = win.SUNNY_FEEDBACK_ENDPOINT;
    if (ep) { try { fetch(ep, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data), keepalive: true }); } catch (e) { /* the thanks still shows */ } }
    else if (!skipNote || choice) {
      var body = "Rating: " + label + "\n" + (note ? "\n" + note + "\n" : "") + (who ? "\nFrom: " + who + "\n" : "") + "\nPage: " + page + (S.read.length ? "\nRead: " + S.read.join(", ") : "");
      if (!skipNote) { var m = doc.createElement("a"); m.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Portfolio feedback: " + label) + "&body=" + encodeURIComponent(body); doc.body.appendChild(m); m.click(); m.remove(); }
    }
    thanks();
  }
  function thanks() {
    emote(choice === "meh" ? "shy" : "love");
    say(choice === "meh" || choice === "okay" ? "Thank you. I’ll pass it on to Ganesh." : "Thank you! That really helps.", 3000);
    close();
  }
  function later() { put(KEY, JSON.stringify({ asked: Date.now(), later: Date.now() })); say("No problem. Enjoy the rest!", 2400); close(); }
  function close() {
    if (!card) return; var c = card; card = null;
    c.classList.remove("is-in"); setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 350);
    win.removeEventListener("resize", place); win.removeEventListener("scroll", place);
  }

  var timer = setInterval(tick, 1000);
  win.addEventListener("pagehide", function () { sput(SKEY, S); });
  win.SunnyFeedback.ask = function () { asked = false; ask("forced"); };
  win.SunnyFeedback.state = function () { return { minutes: +(S.ms / 60000).toFixed(1), read: S.read, depth: +maxDepth.toFixed(2), onPageSec: Math.round(onPage() / 1000), asked: asked }; };
})();
