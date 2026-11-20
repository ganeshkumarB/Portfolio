/* Ask Sunny: a small chat panel next to the mascot.
   Works out of the box from this site's own content (no server, no key).
   Set AI_ENDPOINT to a deployed copy of ai/worker.js and Sunny answers
   with Claude instead, falling back to the local answers if the call fails. */
(function (global) {
  "use strict";
  var AI_ENDPOINT = global.SUNNY_AI_ENDPOINT || ""; /* set in sunny-config.js */

  var isHome = /\/(index\.html)?$/.test(location.pathname) || location.pathname === "/";
  var home = isHome ? "" : "index.html";
  var MAIL = "ganesh.rayanbalu@gmail.com";

  /* ---------- what Sunny knows (from the site) ---------- */
  var KB = [
    { k: ["who", "ganesh", "about", "designer", "what do you do", "intro", "introduce"], a: "Ganeshkumar B is a Senior Product Designer on Zoho SalesIQ, eight years in. He owns the 48+ component design system and the Figma-to-code workflow behind it.", link: [home + "#story", "Read the story"] },
    { k: ["role", "roles", "looking", "open to", "hiring", "hire", "job", "position", "lead"], a: "He's looking for a lead, staff or senior product design role with design system ownership, in an enterprise or B2B SaaS team.", link: ["hire.html", "Hiring me? Quick answers"] },
    { k: ["notice", "period", "join", "start", "available", "availability", "when can"], a: "Notice period is 30 days.", link: ["hire.html", "More for recruiters"] },
    { k: ["where", "location", "chennai", "remote", "relocate", "relocation", "based", "timezone", "ist", "city"], a: "Chennai, India, on IST. Open to on-site or hybrid in Chennai, remote for Indian or international teams with IST overlap, and relocating for the right role.", link: ["hire.html", "Hiring me? Quick answers"] },
    { k: ["email", "contact", "reach", "mail", "talk", "call", "message"], a: "Email is the way: " + MAIL + ". He replies within a day.", link: ["mailto:" + MAIL + "?subject=Hello%20from%20the%20portfolio", "Email Ganesh"] },
    { k: ["code", "coding", "html", "css", "javascript", "developer", "engineer", "front end", "frontend"], a: "Enough to ship this site: HTML and CSS by hand, JavaScript with help from Claude. On the product he works in Figma variables and Code Connect so every component maps to real code. He's not a front-end engineer and doesn't pretend to be.", link: ["hire.html", "The FAQ"] },
    { k: ["team", "lead a team", "manage", "managed", "reports", "people", "mentor"], a: "He has led design direction, not people: owns the SalesIQ design system and the design reviews across a five-engineer team, no direct reports yet. A lead role where that changes is exactly what he's after.", link: ["hire.html", "The FAQ"] },
    { k: ["tools", "tool", "figma", "software", "stack", "use", "photoshop", "illustrator", "after effects", "spline"], a: "Figma every day: variables and modes, Code Connect, Dev Mode and Figma MCP. Claude and ChatGPT for critique and design-to-code. Photoshop, Illustrator, After Effects and Spline for visuals and motion.", link: [home + "#skills", "Skills, as tokens"] },
    { k: ["resume", "résumé", "cv", "pdf", "download"], a: "There's a printable one-page résumé, plus the full two-page PDF.", link: ["resume.html", "Open the résumé"] },
    { k: ["case", "case study", "case studies", "work", "projects", "portfolio", "show me the work"], a: "Seven case studies on Zoho SalesIQ: Zobot, the design system, Operator Console, Reports, Brand configuration, Outbound and Feedback. Every screen is recreated with sample data because the real work is under NDA.", link: [home + "#work", "Selected work"] },
    { k: ["zobot", "chatbot", "bot builder", "no-code", "bot"], a: "Zobot is the no-code chatbot builder: a drag-and-drop canvas so a non-technical admin can publish a working bot. Ganesh was the sole designer. Website at launch, seven channels today.", link: ["case-zobot.html", "Zobot case study"] },
    { k: ["relevant to ai", "most relevant", "ai project", "ai work"], a: "The design system: it's where Claude and Figma MCP generate production components from the library, and where Code Connect keeps Figma and code in step.", link: ["case-design-system.html", "Design system case study"] },
    { k: ["design system", "components", "tokens", "variables", "code connect", "mcp", "48"], a: "The SalesIQ design system: 48+ components on one set of tokens, light and dark modes, every component mapped to its code with Code Connect, and an AI workflow with Claude and Figma MCP that generates the system twice, as a Figma library and as production components.", link: ["case-design-system.html", "Design system case study"] },
    { k: ["operator", "console", "agents", "queue", "support"], a: "The Operator Console redesign puts the queue, the conversation and everything about the visitor in one calm view for agents handling many chats.", link: ["case-operator-console.html", "Operator Console case study"] },
    { k: ["reports", "analytics", "charts", "dashboard", "metrics"], a: "Reports 2.0: one place to read engagement, support, bots, outbound and live activity. Every chart answers one question.", link: ["case-reports.html", "Reports case study"] },
    { k: ["brand", "brand configuration", "channels", "whatsapp", "widget"], a: "Brand configuration rebuilt as self-service: shared settings set once, every channel (web, mobile SDK, WhatsApp) on its own card. No developer needed.", link: ["case-brand-configuration.html", "Brand configuration case study"] },
    { k: ["outbound", "broadcast", "push", "campaign", "notification"], a: "Outbound: write a campaign on the left, see it on the right, choose who gets it and when. Broadcasts and push on WhatsApp, web and mobile.", link: ["case-outbound.html", "Outbound case study"] },
    { k: ["feedback", "rating", "survey", "stars", "csat"], a: "Rating & Feedback: ask the moment a chat ends, with faces, stars or yes/no, and a different reply for every rating. Hands off to Zoho Survey when more is needed.", link: ["case-feedback.html", "Feedback case study"] },
    { k: ["gallery", "illustration", "illustrations", "3d", "art", "visual"], a: "Eighteen pieces in the Playground: illustrations, 3D renders and app concepts. Click any piece to open it.", link: [home + "#gallery", "Illustration & visual work"] },
    { k: ["writing", "blog", "posts", "linkedin", "carousel", "instagram"], a: "Short carousels on UI fundamentals, UX and design systems. Spacing is 80% of good UI, apparently.", link: [home + "#writing", "Writing"] },
    { k: ["process", "how", "ship", "workflow", "pipeline", "figma to code"], a: "Four steps: understand the real problem, design the flows and the patterns that repeat, connect the design system to code through MCP, build with Code Connect and AI. Same component across web, mobile SDK and WhatsApp, zero drift.", link: [home + "#process", "How I work"] },
    { k: ["nda", "real", "screenshots", "actual", "confidential", "secret"], a: "Most of the work is under NDA with Zoho, so the case studies recreate every screen with sample data. The full Figma files are shown live on a call or shared with a password on request.", link: ["mailto:" + MAIL + "?subject=Request%20access", "Request access"] },
    { k: ["sunny", "you", "who are you", "mascot", "what are you", "your name"], a: "I'm Sunny. 100% SVG and a little JavaScript, built from a Figma frame. My answers come from a set list Ganesh wrote, unless he has switched on the AI service. Try dragging me." },
    { k: ["site", "website", "built", "made", "stack", "framework", "how was this"], a: "Designed by Ganesh, built with Claude in plain HTML, CSS and a little JavaScript. No framework, no build step. There's a page with the timeline and AI's drafts next to the finals.", link: ["how-this-site-was-built.html", "How this site was built"] },
    { k: ["ai", "use ai", "claude", "artificial", "chatgpt", "honest", "wrong"], a: "AI drafts, he decides. Claude and Figma MCP sit inside the design-system workflow; nothing generated ships unreviewed. There's a page on it, including the times AI got it wrong.", link: ["how-i-use-ai.html", "How I use AI"] },
    { k: ["prompt", "prompts", "prompt library", "library", "download prompts"], a: "Seven prompts for tokens, components, Code Connect and critique, free to copy or download as Markdown.", link: ["prompts.html", "Prompt library"] },
    { k: ["replay", "animation", "step 04", "prompt to component", "demo"], a: "The fourth step, Build, replays the loop: a prompt goes in, Figma MCP builds the component, Code Connect returns the code.", link: [home + "#process", "How I work"] },
    { k: ["sound", "sounds", "voice", "noise", "mute", "quiet", "chirp", "audio"], a: "I'm silent until you turn sound on. Four synthesized voices, no audio files: soft, bubbly, retro and bell. Pick one in the AI section.", link: [home + "#ai", "What Sunny can do"] },
    { k: ["dark", "light", "theme", "night mode", "dark mode"], a: "Flipping the lights.", act: "theme" },
    { k: ["shortcut", "shortcuts", "keyboard", "keys", "hotkey"], a: "Here they are.", act: "keys" },
    { k: ["inspect", "inspector", "layers", "figma counterpart", "component names"], a: "Press I anywhere on the home page, or click the { } button in the nav. Hover a layer to see its tokens, click to pin a component and see its Figma counterpart.", link: [home + "#hey", "Home"] },
    { k: ["hi", "hello", "hey", "yo", "good morning", "good evening"], a: "Hi! Ask me anything about Ganesh, the work, or how this site was made." },
    { k: ["thanks", "thank you", "cool", "nice", "great", "awesome"], a: "Anytime. ☀" }
  ];
  var SUGGEST = isHome
    ? ["What does Ganesh do?", "Which project is most relevant to AI?", "Is he open to roles?"]
    : ["Is he open to roles?", "Which project is most relevant to AI?", "Does he code?"];

  /* Zobot-style branches: after an answer, offer the next questions that usually follow */
  var FOLLOW = {
    "who": ["Is he open to roles?", "Show me the case studies", "Does he code?"],
    "role": ["Notice period?", "Where is he based?", "Email him"],
    "notice": ["Where is he based?", "What roles is he after?", "Email him"],
    "where": ["Notice period?", "Email him", "Show me the résumé"],
    "code": ["What tools does he use?", "Tell me about the design system", "Has he led a team?"],
    "team": ["What roles is he after?", "Does he code?", "Email him"],
    "tools": ["Tell me about the design system", "How does the system ship?", "Show me the résumé"],
    "case": ["Tell me about Zobot", "Tell me about the design system", "What about Reports?"],
    "zobot": ["Tell me about the design system", "What about the Operator Console?", "Show me the case studies"],
    "design system": ["How does Code Connect fit in?", "Does he code?", "Show me the Zobot case"],
    "relevant to ai": ["How does he use AI?", "Tell me about the design system", "Show me the prompts"],
    "sunny": ["How was this site built?", "Show me the gallery", "Keyboard shortcuts?"],
    "site": ["How does he use AI?", "Does he code?", "Keyboard shortcuts?"],
    "ai": ["Show me the prompts", "When did AI get it wrong?", "How was this site built?"],
    "prompt": ["How does he use AI?", "Tell me about the design system", "Email him"]
  };
  var FOLLOW_DEFAULT = ["Is he open to roles?", "Show me the case studies", "Email him"];
  function norm(s) { return s.toLowerCase().replace(/[^a-z0-9+& ]+/g, " ").replace(/\s+/g, " ").trim(); }
  function answerLocal(q) {
    var n = " " + norm(q) + " ";
    var best = null, bestScore = 0;
    KB.forEach(function (e) {
      var score = 0;
      e.k.forEach(function (k) { if (n.indexOf(" " + k + " ") > -1) score += k.indexOf(" ") > -1 ? 3 : 2; else if (k.length > 4 && n.indexOf(k) > -1) score += 1; });
      if (score > bestScore) { bestScore = score; best = e; }
    });
    if (!best || bestScore < 2) return { a: "Right now I only answer from a fixed list about Ganesh and this site. For anything else, Ganesh is a quick email away.", card: true, link: ["mailto:" + MAIL + "?subject=Question%20from%20the%20portfolio", "Email Ganesh"], alt: [home + "#work", "See public work"] };
    return best;
  }

  /* ---------- panel ---------- */
  var root, panel, log, input, askBtn, open = false, history = [], busy = false;
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function linkHtml(l) { if (!l) return ""; var ext = /^(https?:|mailto:)/.test(l[0]); return '<a class="ask__link" href="' + l[0] + '"' + (ext && l[0].indexOf("mailto:") !== 0 ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l[1]) + "</a>"; }
  /* a tiny Sunny face for the header and the message avatars */
  var AVA = '<span class="ask__ava" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 10c1-3-1.5-4-.5-7" fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16.5" cy="5.5" rx="3" ry="1.6" transform="rotate(-24 16.5 5.5)" fill="#FFC93C" stroke="#111" stroke-width="1.2"/><circle cx="20" cy="23" r="15" fill="#FFC93C" stroke="#111" stroke-width="2"/><ellipse cx="14.5" cy="22" rx="2.3" ry="3" fill="#111"/><ellipse cx="25.5" cy="22" rx="2.3" ry="3" fill="#111"/><circle cx="15.3" cy="20.8" r="0.9" fill="#fff"/><circle cx="26.3" cy="20.8" r="0.9" fill="#fff"/><path d="M16 28q4 3.5 8 0" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="10.5" cy="26" rx="2" ry="1.1" fill="#F6A3A3" opacity=".8"/><ellipse cx="29.5" cy="26" rx="2" ry="1.1" fill="#F6A3A3" opacity=".8"/></svg></span>';
  function add(role, text, link, card, alt) {
    var m;
    if (card) {
      m = el('<div class="ask__card">' +
        '<div class="ask__card-top">' + AVA + '<p>' + esc(text) + '</p></div>' +
        '<div class="ask__card-actions"><a class="ask__btn ask__btn--ink" href="' + link[0] + '">' + esc(link[1]) + '</a>' +
        (alt ? '<a class="ask__btn" href="' + alt[0] + '">' + esc(alt[1]) + '</a>' : '') + '</div></div>');
    } else {
      m = el('<div class="ask__msg ask__msg--' + role + '">' + (role === "sunny" ? AVA : "") + '<div class="ask__body"><p>' + esc(text) + "</p>" + (link ? '<div class="ask__sources">' + linkHtml(link) + "</div>" : "") + "</div></div>");
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
    return m;
  }
  var THINK = ["Looking through the case studies", "Checking the site", "Reading the hiring page", "Looking that up"];
  function showError(question) {
    var e = el('<div class="ask__error"><p>Can’t reach Sunny’s AI right now. Answered from the site instead.</p><button type="button" class="ask__retry">Retry</button></div>');
    e.querySelector(".ask__retry").addEventListener("click", function () { if (busy) return; e.remove(); respond(question); });
    log.appendChild(e); log.scrollTop = log.scrollHeight;
  }
  function typing(on) {
    var t = log.querySelector(".ask__typing");
    panel.classList.toggle("is-busy", !!on);
    if (on && !t) { log.appendChild(el('<div class="ask__typing" aria-label="Sunny is thinking">' + AVA + '<span>' + THINK[Math.floor(Math.random() * THINK.length)] + '</span></div>')); log.scrollTop = log.scrollHeight; }
    else if (!on && t) t.remove();
  }
  var closeTimer = 0;
  function setOpen(on) {
    open = on;
    clearTimeout(closeTimer);
    askBtn.setAttribute("aria-expanded", String(on));
    if (on) {
      root.classList.add("has-ask"); panel.classList.remove("is-closing"); panel.hidden = false;
      askBtn.classList.remove("is-nudge"); setTimeout(function () { input.focus(); }, 50); if (global.Sunny) Sunny.emote("happy");
    } else {
      panel.classList.add("is-closing");
      closeTimer = setTimeout(function () { panel.hidden = true; panel.classList.remove("is-closing"); root.classList.remove("has-ask"); }, 180);
    }
  }
  function doAction(act) {
    if (act === "theme") { var t = document.getElementById("themeToggle"); if (t) t.click(); }
    if (act === "keys") { document.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true })); }
  }
  function scrollIfSameSection(link) {
    if (!link || link[0].indexOf("#") !== 0) return;
    var sec = document.querySelector(link[0]);
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function respond(text) {
    history.push({ role: "user", content: text });
    busy = true; typing(true);
    if (global.Sunny) Sunny.emote("curious", 1600);
    var local = answerLocal(text);
    var finish = function (reply, link, act, failed) {
      typing(false); busy = false;
      add("sunny", reply, link, local.card && reply === local.a, local.alt);
      if (failed) showError(text);
      renderChips(local.k ? (FOLLOW[local.k[0]] || FOLLOW_DEFAULT) : FOLLOW_DEFAULT);
      history.push({ role: "assistant", content: reply });
      if (history.length > 16) history = history.slice(-16);
      if (global.Sunny) Sunny.say(reply.length > 90 ? reply.slice(0, 88) + "…" : reply, 3200);
      if (act) setTimeout(function () { doAction(act); }, 400);
      scrollIfSameSection(link);
    };
    if (!AI_ENDPOINT) { setTimeout(function () { finish(local.a, local.link, local.act); }, 420 + Math.min(900, text.length * 12)); return; }
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    fetch(AI_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.slice(-8), page: location.pathname }), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error("status " + r.status); return r.json(); })
      .then(function (data) { clearTimeout(timer); finish(data.reply || local.a, data.link || local.link, local.act); })
      .catch(function () { clearTimeout(timer); finish(local.a, local.link, local.act, true); });
  }
  function renderChips(list, stack) {
    var old = log.querySelector(".ask__chips"); if (old) old.remove();
    var box = el('<div class="ask__chips' + (stack ? " ask__chips--stack" : "") + '" aria-label="Suggested questions">' + list.map(function (s) { return '<button type="button" class="ask__chip">' + esc(s) + "</button>"; }).join("") + "</div>");
    Array.prototype.forEach.call(box.querySelectorAll(".ask__chip"), function (c) {
      c.addEventListener("click", function () { if (busy) return; box.remove(); add("you", c.textContent); respond(c.textContent); });
    });
    log.appendChild(box); log.scrollTop = log.scrollHeight;
  }
  function send() {
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    var pending = log.querySelector(".ask__chips"); if (pending) pending.remove();
    add("you", text);
    respond(text);
  }
  function build() {
    root = global.Sunny && Sunny.el;
    if (!root) return false;
    var charEl = root.querySelector(".sunny__char");
    askBtn = el('<button type="button" class="sunny__ask" aria-label="Ask Sunny a question" aria-expanded="false" title="Ask Sunny (A)">Ask me</button>');
    panel = el(
      '<div class="ask" hidden role="dialog" aria-label="Ask Sunny">' +
        '<div class="ask__head">' + AVA + '<span class="ask__who"><span class="ask__title">Ask Sunny</span><span class="ask__status' + (AI_ENDPOINT ? " is-ai" : "") + '"><span class="ask__status-txt">' + (AI_ENDPOINT ? "AI · answers about Ganesh’s work" : "scripted · from a set list") + '</span><span class="ask__status-busy">thinking…</span></span></span><button type="button" class="ask__close" aria-label="Close">×</button></div>' +
        '<div class="ask__log"><div class="ask__hello">' + AVA + '<p>' + "Hi! I’m Sunny. Ask me anything about Ganesh’s work and I’ll point you to the right case study." + '</p></div></div>' +
        '<div class="ask__foot"><form class="ask__form"><input class="ask__input" type="text" placeholder="Ask about Ganesh’s work…" maxlength="240" autocomplete="off" /><button type="submit" class="ask__send" aria-label="Send"><span class="ask__send-up" aria-hidden="true">↑</span><span class="ask__send-stop" aria-hidden="true">■</span></button></form>' +
        '<p class="ask__note">' + (AI_ENDPOINT ? "AI answers via Ganesh’s own server · can be wrong · nothing stored" : "Answers from a set list Ganesh wrote · no AI service · nothing stored") + '</p></div>' +
      "</div>");
    root.appendChild(panel);
    charEl.appendChild(askBtn);
    log = panel.querySelector(".ask__log");
    input = panel.querySelector(".ask__input");
    askBtn.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!open); });
    panel.querySelector(".ask__close").addEventListener("click", function () { setOpen(false); });
    panel.querySelector(".ask__form").addEventListener("submit", function (e) { e.preventDefault(); send(); });
    renderChips(SUGGEST, true);
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); askBtn.focus(); } e.stopPropagation(); });
    panel.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
      var off = false; try { off = localStorage.getItem("keys:shortcuts") === "off"; } catch (err) { /* ignore */ }
      if (!off && e.key.toLowerCase() === "a") { e.preventDefault(); setOpen(!open); }
    });
    setTimeout(function () { if (!open) askBtn.classList.add("is-nudge"); }, 9000);
    var how = document.getElementById("sunnyHow");
    if (how && AI_ENDPOINT) how.textContent = "Sunny is an AI. It answers about my work from a fixed set of facts, through my own server; the key never ships with the site. Nothing is stored.";
    global.SunnyAsk = {
      open: function () { setOpen(true); },
      ask: function (q) { setOpen(true); if (busy || !q) return; var pending = log.querySelector(".ask__chips"); if (pending) pending.remove(); add("you", q); respond(q); }
    };
    return true;
  }
  var tries = 0, t = setInterval(function () { if (build() || ++tries > 60) clearInterval(t); }, 100);
})(window);
