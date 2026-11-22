/* Ask Sunny: a small chat panel next to the mascot.
   Answers come from ai/knowledge.js, the one structured source of facts about
   Ganesh and the work. Without a server, Sunny answers from that knowledge
   directly (scripted). With SUNNY_AI_ENDPOINT set to a deployed copy of
   ai/worker.js, Sunny answers in natural language with Claude from the same
   knowledge, and falls back to the scripted answer if the call fails, times
   out, is stopped or comes back empty.

   Context: Sunny knows which page and which section the visitor is reading
   (Sunny.context()), so "why was this designed this way?" means this section.
   Only the last eight messages and that small context object are sent. */
(function (global) {
  "use strict";
  var AI_ENDPOINT = global.SUNNY_AI_ENDPOINT || ""; /* set in sunny-config.js */
  var K = global.SUNNY_KNOWLEDGE;
  if (!K) { if (global.console) console.warn("Ask Sunny: ai/knowledge.js did not load, the panel is off."); return; }
  var MAIL = K.mail;
  var isHome = /\/(index\.html)?$/.test(location.pathname) || location.pathname === "/";
  var home = isHome ? "" : "index.html";
  var HIM = K.profile.shortName;

  /* ---------- helpers ---------- */
  function norm(s) { return String(s).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9+&%#' ]+/g, " ").replace(/\s+/g, " ").trim(); }
  function has(n, re) { return re.test(n); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function byId(id) { for (var i = 0; i < K.projects.length; i++) if (K.projects[i].id === id) return K.projects[i]; return null; }
  function context() { return global.Sunny && Sunny.context ? Sunny.context() : { page: isHome ? "home" : "page", project: null, section: null }; }
  /* projects named in the question, in the order they appear */
  function projectsIn(n) {
    var found = [];
    K.projects.forEach(function (p) {
      var at = -1;
      p.keys.forEach(function (k) { var i = (" " + n + " ").indexOf(" " + k + " "); if (i > -1 && (at < 0 || i < at)) at = i; });
      if (at > -1) found.push({ p: p, at: at });
    });
    found.sort(function (a, b) { return a.at - b.at; });
    return found.map(function (f) { return f.p; });
  }
  /* links Sunny may offer: site routes, home sections, and mail to Ganesh */
  function safeHref(h) {
    if (typeof h !== "string") return null;
    h = h.trim();
    if (/^mailto:/.test(h)) return h.indexOf("mailto:" + MAIL) === 0 ? h : null;
    var hash = "", path = h;
    var i = h.indexOf("#"); if (i > -1) { hash = h.slice(i); path = h.slice(0, i); }
    path = path.replace(/^\//, "").replace(/^index\.html$/, "index.html");
    if (path === "" && hash) return (isHome ? "" : "index.html") + hash;
    if (K.routes.indexOf(path) < 0) return null;
    if (path === "index.html") return (isHome ? "" : "index.html") + hash;
    return path + hash;
  }
  function A(href, label) { return { href: href, label: label }; }
  var MAIL_LINK = "mailto:" + MAIL + "?subject=Hello%20from%20the%20portfolio";
  function reply(text, actions, suggest, topic) { return { text: text, actions: actions || [], suggest: suggest || null, topic: topic || null }; }

  /* ---------- scripted answers: what Sunny can work out from the knowledge ---------- */
  var last = { project: null, field: null, list: null, topic: null };
  var FIELD_ORDER = ["problem", "decisions", "outcome", "learned"];
  var FIELD_Q = { problem: "What was the problem?", decisions: "Which decisions shaped it?", outcome: "What was the outcome?", learned: "What did he learn?", approach: "How did he approach it?" };

  function projectField(p, field) {
    switch (field) {
      case "problem": return p.problem;
      case "approach": return p.approach + (p.system ? " " + p.system : "");
      case "system": return p.system || p.approach;
      case "decisions": return "Three things shaped it. " + p.decisions.map(function (d, i) { return (i + 1) + ". " + d; }).join(" ") + (p.principles ? " The principles behind them: " + p.principles.join(" ") : "");
      case "role": return p.role + (p.honest ? " " + p.honest : "");
      case "outcome": return p.outcome.join(" ");
      case "learned": return p.learned;
      default: return p.summary + " " + p.role;
    }
  }
  function projectFollowups(p, field) {
    var qs = FIELD_ORDER.filter(function (f) { return f !== field; }).slice(0, 2).map(function (f) { return FIELD_Q[f]; });
    var other = K.recruiter.relevant.filter(function (id) { return id !== p.id; })[0];
    if (other) qs.push("Compare it with " + byId(other).name);
    return qs;
  }
  function projectAnswer(p, field, c) {
    var text = projectField(p, field);
    last = { project: p, field: field, list: null, topic: "project" };
    return reply(text, [A(p.path, p.name + " case study")], projectFollowups(p, field), { project: p.id, field: field });
  }
  function sectionAnswer(p, c, n) {
    var s = null;
    p.sections.forEach(function (x) { if (x.id === c.section) s = x; });
    if (!s) return projectAnswer(p, "summary", c);
    var text = s.label + ": “" + s.title + "” " + s.summary;
    if (/decision|why|chose|designed this way/.test(n)) text += " The decisions behind it: " + p.decisions.join(" ");
    last = { project: p, field: "section", list: null, topic: "project" };
    return reply(text, [A(p.path + "#" + s.id, "This section")], [FIELD_Q.decisions, FIELD_Q.outcome, "Compare it with " + byId(K.recruiter.relevant.filter(function (id) { return id !== p.id; })[0]).name]);
  }
  function compareAnswer(a, b) {
    var text = a.name + ": " + a.summary + " " + b.name + ": " + b.summary + " Same designer, same product, different problems: " + a.name + " is about " + a.tags.slice(0, 2).join(" and ") + "; " + b.name + " is about " + b.tags.slice(0, 2).join(" and ") + ".";
    last = { project: null, field: null, list: [a, b], topic: "compare" };
    return reply(text, [A(a.path, a.name), A(b.path, b.name)], ["Tell me more about " + a.name, "Tell me more about " + b.name, "Which one is most relevant to AI?"]);
  }
  function listAnswer(ids, intro) {
    var ps = ids.map(byId);
    var text = intro + " " + ps.map(function (p, i) { return (i + 1) + ". " + p.name + ": " + p.title.replace(/\.$/, "") + "."; }).join(" ");
    last = { project: null, field: null, list: ps, topic: "list" };
    return reply(text, ps.map(function (p) { return A(p.path, p.name); }), ["Tell me about the first one", "Compare " + ps[0].name + " and " + ps[1].name, "Give me a 60-second overview of " + HIM]);
  }
  function unknownAnswer(c) {
    var p = c.project ? byId(c.project) : null;
    var text = "I don't have that on the site, so I won't guess. " + HIM + " is a quick email away and replies within a day.";
    var sug = p ? [FIELD_Q.decisions, FIELD_Q.outcome, "Give me a 60-second overview of " + HIM] : ["Give me a 60-second overview of " + HIM, "Show me his best projects", "Is he open to roles?"];
    last.topic = "unknown";
    return reply(text, [A(MAIL_LINK, "Email " + HIM), A(home + "#work", "See the work")], sug, { unknown: true });
  }

  /* fixed answers about Ganesh, the site and Sunny; keys are words to match */
  var P = K.profile, R = K.recruiter, PR = K.practice, PO = K.portfolio;
  var ENTRIES = [
    { k: ["who is", "who's", "about ganesh", "introduce", "intro", "what does he do", "kind of designer", "what does ganesh do"], a: P.oneLiner + " " + P.summary, act: [A("index.html#story", "Read the story"), A("resume.html", "Resume")], f: ["What roles is he looking for?", "Show me his best projects", "How does he use AI?"], t: "who" },
    { k: ["60 second", "60-second", "sixty second", "overview", "elevator", "summary", "summarise", "summarize", "tl dr", "in short", "quick version", "recruiter"], a: R.overview, act: [A("resume.html", "Resume"), A("hire.html", "Hiring page"), A(MAIL_LINK, "Email " + HIM)], f: ["What are his strongest skills?", "Show me the most relevant projects", "What leadership experience does he have?"], t: "overview" },
    { k: ["strongest", "strengths", "strength", "best at", "good at", "superpower", "skills", "skill set", "capabilities"], a: R.strengths + " Skills, grouped: " + Object.keys(P.skills).map(function (g) { return g + " (" + P.skills[g].join(", ") + ")"; }).join("; ") + ".", act: [A("index.html#skills", "Skills, as tokens"), A("resume.html", "Resume")], f: ["Show me the most relevant projects", "Has he worked with AI?", "What products has he worked on?"], t: "skills" },
    { k: ["products", "worked on", "what has he built", "what has he designed", "kind of products", "industry", "domain"], a: R.products, act: [A("index.html#work", "Selected work")], f: ["Tell me about Zobot", "Tell me about the Operator Console", "Give me a 60-second overview of " + HIM], t: "products" },
    { k: ["design system experience", "experience with design systems", "experience with the design system", "systems experience"], a: byId("design-system").summary + " " + P.leadership, act: [A("case-design-system.html", "Design system case study")], f: ["How does Figma connect to code?", "How does the system scale across platforms?", "Where does AI fit in the system?"], t: "ds-exp" },
    { k: ["leadership", "led a team", "lead a team", "leads", "manage", "managed", "manager", "reports", "mentor", "people"], a: P.leadership, act: [A("hire.html", "Hiring page")], f: ["What roles is he looking for?", "Does he code?", "Email him"], t: "team" },
    { k: ["roles", "role is he", "looking for", "open to", "hiring", "hire", "job", "position", "opportunit", "what kind of role"], a: P.lookingFor + " Notice period " + P.notice + ". " + P.workModes, act: [A("hire.html", "Hiring me? Quick answers"), A(MAIL_LINK, "Email " + HIM)], f: ["Notice period?", "Where is he based?", "Give me a 60-second overview of " + HIM], t: "role" },
    { k: ["notice", "notice period", "when can he start", "join", "start date", "availability", "available"], a: "Notice period is " + P.notice + ".", act: [A("hire.html", "More for recruiters")], f: ["Where is he based?", "What roles is he looking for?", "Email him"], t: "notice" },
    { k: ["where", "location", "chennai", "remote", "relocate", "relocation", "based", "timezone", "time zone", "ist", "city", "on-site", "onsite", "hybrid"], a: P.location + ". " + P.workModes, act: [A("hire.html", "Hiring me? Quick answers")], f: ["Notice period?", "Email him", "Show me the resume"], t: "where" },
    { k: ["email", "contact", "reach", "mail", "talk", "call", "message", "get in touch"], a: "Email is the way: " + MAIL + ". He replies " + P.replies + ".", act: [A(MAIL_LINK, "Email " + HIM)], f: ["Show me the resume", "What roles is he looking for?", "Show me his best projects"], t: "email" },
    { k: ["code", "coding", "html", "css", "javascript", "developer", "engineer", "front end", "frontend", "does he code", "technical"], a: P.coding, act: [A("hire.html", "The FAQ")], f: ["What tools does he use?", "How does Figma connect to code?", "Has he led a team?"], t: "code" },
    { k: ["tools", "tool", "figma", "software", "stack", "photoshop", "illustrator", "after effects", "spline"], a: P.tools, act: [A("index.html#skills", "Skills, as tokens")], f: ["Tell me about the design system", "How does he use AI?", "Show me the resume"], t: "tools" },
    { k: ["education", "degree", "college", "university", "study", "studied", "bca", "certif"], a: P.education, act: [A("resume.html", "Resume")], f: ["How many years of experience?", "Give me a 60-second overview of " + HIM], t: "edu" },
    { k: ["experience", "years", "how long", "career", "background", "history", "timeline", "zoho"], a: P.experience.join(" ") + " " + P.education, act: [A("resume.html", "Resume"), A("index.html#story", "The story")], f: ["What products has he worked on?", "What roles is he looking for?", "What are his strongest skills?"], t: "exp" },
    { k: ["story", "journey", "how did he start", "visual design", "started"], a: P.story, act: [A("index.html#story", "Read the story")], f: ["What products has he worked on?", "Give me a 60-second overview of " + HIM], t: "story" },
    { k: ["research", "usability", "testing", "tested", "user research", "interviews", "validate"], a: P.research, act: [A("case-zobot.html", "Zobot case study")], f: ["Which Zobot decision would he make differently?", "What is his design process?"], t: "research" },
    { k: ["resume", "cv", "pdf", "download"], a: "There's a printable one-page resume, plus one-page and full two-page PDFs.", act: [A("resume.html", "Open the resume")], f: ["Give me a 60-second overview of " + HIM, "What roles is he looking for?", "Email him"], t: "resume" },
    { k: ["case studies", "case study", "projects", "portfolio", "show me the work", "the work", "best projects", "best work", "selected work", "all the projects"], a: "Seven case studies on Zoho SalesIQ: " + K.projects.map(function (p) { return p.name; }).join(", ") + ". Every screen is recreated with sample data because the real work is under NDA. Start with Zobot and the Design system.", act: [A("index.html#work", "Selected work"), A("case-zobot.html", "Zobot"), A("case-design-system.html", "Design system")], f: ["Show me the most relevant projects", "Compare Zobot and the Operator Console", "Which project is most relevant to AI?"], t: "case" },
    { k: ["relevant to ai", "most relevant to ai", "ai project", "ai work", "where ai"], a: "The design system: it's where Claude and Figma MCP generate production components from the library, and where Code Connect keeps Figma and code in step.", act: [A("case-design-system.html", "Design system case study"), A("how-i-use-ai.html", "How I use AI")], f: ["How does he use AI?", "Where does AI fit in the system?", "Show me the prompts"], t: "relevant-ai" },
    { k: ["worked with ai", "has he worked with ai", "ai experience", "experience with ai", "use ai", "uses ai", "how does he use ai", "claude", "chatgpt", "artificial", "generative", "llm"], a: R.ai + " " + PR.ai.rule, act: [A("how-i-use-ai.html", "How I use AI"), A("prompts.html", "Prompt library")], f: ["When did AI get it wrong?", "Where does AI fit in the system?", "Show me the prompts"], t: "ai" },
    { k: ["got it wrong", "went wrong", "mistake", "mistakes", "wrong", "honest", "fail", "hallucinat"], a: PR.ai.wrong + " Rule: " + PR.ai.rule, act: [A("how-i-use-ai.html", "How I use AI")], f: ["How does he use AI?", "What rules does he hold to?", "How was this site built?"], t: "wrong" },
    { k: ["rules", "what ai does", "what he decides", "ai drafts", "guardrails"], a: "What AI does: " + PR.ai.does.join(" ") + " What he decides: " + PR.ai.decides.join(" ") + " Rules: " + PR.ai.rules.join(" "), act: [A("how-i-use-ai.html", "How I use AI")], f: ["When did AI get it wrong?", "Show me the prompts"], t: "rules" },
    { k: ["prompt", "prompts", "prompt library", "library of prompts"], a: PO.pages[4].what, act: [A("prompts.html", "Prompt library")], f: ["How does he use AI?", "Tell me about the design system", "Email him"], t: "prompt" },
    { k: ["process", "how does he work", "how he works", "design process", "workflow", "pipeline", "figma to code", "method", "approach to design"], a: "Four steps. " + PR.process.map(function (s) { return s.name + ": " + s.text; }).join(" ") + " Principles: " + PR.principles.join(", ").toLowerCase() + ". " + PR.critique, act: [A("index.html#process", "How I work")], f: ["How does Figma connect to code?", "How does he use AI?", "Show me his best projects"], t: "process" },
    { k: ["code connect", "figma mcp", "mcp", "design to code", "design-to-code", "variables", "tokens", "figma connect"], a: PR.designToCode, act: [A("case-design-system.html", "Design system case study"), A("index.html#process", "How I work")], f: ["How is the system structured?", "Where does AI fit in the system?", "Does he code?"], t: "d2c" },
    { k: ["critique", "review", "design review", "feedback on a screen"], a: PR.critique + " There's a prompt for it in the library.", act: [A("prompts.html", "Prompt library")], f: ["How does he run design reviews?", "Has he led a team?"], t: "critique" },
    { k: ["nda", "real screenshots", "real product", "actual", "confidential", "secret", "sample data", "recreated"], a: P.nda, act: [A("mailto:" + MAIL + "?subject=Request%20access", "Request access")], f: ["Show me his best projects", "Email him"], t: "nda" },
    { k: ["gallery", "playground", "illustration", "illustrations", "3d", "art", "visual work", "renders"], a: "Eighteen pieces in the Playground: illustrations, 3D renders and app concepts. Click any piece to open it.", act: [A("index.html#gallery", "Playground")], f: ["What tools does he use?", "Show me the case studies"], t: "gallery" },
    { k: ["writing", "blog", "posts", "linkedin", "carousel", "carousels", "articles"], a: PO.home[4].what, act: [A("index.html#writing", "Writing"), A(P.links.linkedin, "LinkedIn")], f: ["What is his design process?", "Tell me about the design system"], t: "writing" },
    { k: ["sunny", "who are you", "what are you", "your name", "mascot", "yourself", "how do you work", "are you an ai", "are you ai", "a bot", "robot", "what can you do", "can you do", "what do you do", "help me", "help"], a: K.sunny.what + " " + K.sunny.does + " " + (AI_ENDPOINT ? "Right now I answer with Claude through " + HIM + "'s own server, only from facts on the site." : "Right now I answer from a set list written from the site; the AI service is wired but not switched on.") + " " + K.sunny.controls, act: [A("how-this-site-was-built.html", "How this site was built")], f: ["How was this site built?", "Keyboard shortcuts?", "Show me the gallery"], t: "sunny" },
    { k: ["site", "website", "this portfolio", "built", "made", "framework", "how was this", "stack of the site", "github"], a: PO.site + " There's a page with the timeline and AI's drafts next to the finals.", act: [A("how-this-site-was-built.html", "How this site was built")], f: ["How does he use AI?", "Does he code?", "Keyboard shortcuts?"], t: "site" },
    { k: ["sound", "sounds", "voice", "noise", "mute", "quiet", "chirp", "audio"], a: "I'm silent until you turn sound on. Four synthesized voices, no audio files: soft, bubbly, retro and bell. Pick one in the preferences panel.", f: ["Keyboard shortcuts?", "What can you do?"], t: "sound" },
    { k: ["dark", "light", "theme", "night mode", "dark mode"], a: "Flipping the lights.", do: "theme", t: "theme" },
    { k: ["shortcut", "shortcuts", "keyboard", "keys", "hotkey"], a: PO.shortcuts, do: "keys", t: "keys" },
    { k: ["inspect", "inspector", "layers", "figma counterpart", "component names"], a: "Press I anywhere on the home page, or click the { } button in the nav. Hover a layer to see its tokens, click to pin a component and see its Figma counterpart.", act: [A("index.html#hey", "Home")], t: "inspect" },
    { k: ["hi", "hello", "hey", "yo", "good morning", "good evening", "good afternoon"], a: "Hi! Ask me about " + HIM + ", the work, or how this site was made.", f: ["Who is " + HIM + "?", "Show me his best projects", "Is he open to roles?"], t: "hi" },
    { k: ["thanks", "thank you", "cool", "nice", "great", "awesome", "perfect", "ok", "okay"], a: pick(["Anytime. ☀", "Happy to help.", "That's what I'm here for."]), f: ["Show me his best projects", "Email him"], t: "thanks" }
  ];
  function scoreEntry(e, n) {
    var score = 0, padded = " " + n + " ";
    e.k.forEach(function (k) {
      if (padded.indexOf(" " + k + " ") > -1) score += k.indexOf(" ") > -1 ? 4 : 2;
      else if (k.length > 4 && n.indexOf(k) > -1) score += 1;
    });
    return score;
  }

  /* the local pipeline: context first, then project questions, then recruiter and site questions, then an honest unknown */
  function answerLocal(q) {
    var n = norm(q), c = context();
    var named = projectsIn(n), here = c.project ? byId(c.project) : null;
    var wantsField = has(n, /who designed|his role|ganesh.?s role|responsib|sole designer|what was his part|team/) ? "role"
      : has(n, /learn|takeaway|reflection|lesson|differently|regret/) ? "learned"
      : has(n, /outcome|result|impact|changed after|after the redesign|what shipped|did it work|success|metric/) ? "outcome"
      : has(n, /problem|challenge|what was wrong|pain|why (was it |did it need|redesign|rebuild)|before/) ? "problem"
      : has(n, /decision|decisions|principle|trade|thinking|why (was|did|the|a|choose|chose)|chose|chosen|choice/) ? "decisions"
      : has(n, /structur|anatomy|how is (it|the system) (built|organised|organized)|how does (it|the system) (scale|work)|platforms|architecture|how (was|did) (it|he) (approach|solve)|approach|how does figma/) ? "approach"
      : null;

    /* follow-ups that lean on the last answer */
    if (has(n, /^(tell me more|more|go on|elaborate|continue|and\??|what else|keep going|details?)( please)?$/) || has(n, /^tell me more about (it|that|this)$/)) {
      if (last.project) {
        var next = FIELD_ORDER.filter(function (f) { return f !== last.field; })[0];
        if (last.field === "problem") next = "decisions"; else if (last.field === "decisions") next = "outcome"; else if (last.field === "outcome") next = "learned"; else if (last.field === "learned") next = "approach";
        return projectAnswer(last.project, next, c);
      }
      if (last.list && last.list.length) return projectAnswer(last.list[0], "summary", c);
      if (last.topic === "who" || last.topic === "overview") return runEntry(findEntry("strongest"), n);
    }
    var ord = n.match(/\b(first|second|third|other|last|1st|2nd|3rd)\b (one|project|case)/);
    if (ord && last.list && last.list.length) {
      var idx = { first: 0, "1st": 0, second: 1, "2nd": 1, third: 2, "3rd": 2, other: 1, last: last.list.length - 1 }[ord[1]];
      if (last.list[idx]) return projectAnswer(last.list[idx], "summary", c);
    }
    if (!named.length && last.project && has(n, /^(why|how) (did|was) (he|it|that|this)/) && wantsField) return projectAnswer(last.project, wantsField, c);

    /* compare two projects */
    if (has(n, /compare|difference|differ|versus|\bvs\b|between/) && named.length >= 2) return compareAnswer(named[0], named[1]);
    if (has(n, /compare/) && named.length === 1 && (here || last.project) && (here || last.project).id !== named[0].id) return compareAnswer(here || last.project, named[0]);

    /* recommendations by the kind of problem */
    if (has(n, /relevant project|most relevant|recommend|which project should|where (should|do) i start|start with|best project|strongest project|highlight/) && !has(n, /relevant to ai/)) return listAnswer(R.relevant, "Start with these three.");
    if (has(n, /complex (ux|problem|workflow)|hard problem|complicated|complexity|dense|all day/) && !named.length) return listAnswer(["zobot", "operator-console"], "Two cases where the problem was complexity itself.");
    if (has(n, /data|analytics|dashboard|charts/) && !named.length) return projectAnswer(byId("reports"), "summary", c);
    if (has(n, /self.?service|settings|configuration|configure/) && !named.length) return projectAnswer(byId("brand-configuration"), "summary", c);

    /* this section, this project */
    if (here && !named.length && has(n, /\b(this|here|these|that one)\b|designed this way|this (section|part|screen|page|decision)|above/)) return c.section ? sectionAnswer(here, c, n) : projectAnswer(here, wantsField || "summary", c);
    if (named.length === 1 && !has(n, /relevant to ai|use ai/)) return projectAnswer(named[0], wantsField || (has(n, /tell me about|what is|what's|about/) ? "summary" : "summary"), c);
    if (named.length > 1) return listAnswer(named.map(function (p) { return p.id; }), "Here they are.");
    if (here && wantsField && !has(n, /ganesh|he |his /)) return projectAnswer(here, wantsField, c);
    if (here && has(n, /why|how|what/) && wantsField) return projectAnswer(here, wantsField, c);

    /* everything else: the fixed entries */
    var best = null, bestScore = 0;
    ENTRIES.forEach(function (e) { var s = scoreEntry(e, n); if (s > bestScore) { bestScore = s; best = e; } });
    if (best && bestScore >= 2) return runEntry(best, n);
    if (here && wantsField) return projectAnswer(here, wantsField, c);
    if (last.project && wantsField) return projectAnswer(last.project, wantsField, c);
    return unknownAnswer(c);
  }
  function findEntry(key) { for (var i = 0; i < ENTRIES.length; i++) if (ENTRIES[i].k.indexOf(key) > -1) return ENTRIES[i]; return ENTRIES[0]; }
  function runEntry(e) {
    last = { project: null, field: null, list: null, topic: e.t };
    var r = reply(e.a, e.act || [], e.f || null, { entry: e.t });
    r.do = e.do || null;
    return r;
  }

  /* ---------- contextual suggestions ---------- */
  function suggestions() {
    var c = context();
    if (c.page === "case") { var p = byId(c.project); if (p) return p.questions.slice(0, 4); }
    if (c.page === "home") return ["Who is " + HIM + "?", "What kind of designer is he?", "Show me his best projects", "What is his design process?", "How does he use AI?"];
    if (c.page === "hire" || c.page === "resume") return ["Give me a 60-second overview of " + HIM, "What roles is he looking for?", "What is his design system experience?", "Has he worked with AI?"];
    if (c.page === "how-i-use-ai" || c.page === "prompts" || c.page === "how-this-site-was-built") return ["How does he use AI?", "When did AI get it wrong?", "How was this site built?", "Show me the prompts"];
    return ["Who is " + HIM + "?", "Show me his best projects", "Is he open to roles?"];
  }
  var FOLLOW_DEFAULT = ["Is he open to roles?", "Show me his best projects", "Email him"];

  /* ---------- panel ---------- */
  var root, panel, log, input, askBtn, clearBtn, open = false, history = [], busy = false, inflight = null, stopped = false;
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  /* a tiny Sunny face for the header and the message avatars */
  var AVA = '<span class="ask__ava" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 10c1-3-1.5-4-.5-7" fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16.5" cy="5.5" rx="3" ry="1.6" transform="rotate(-24 16.5 5.5)" fill="#FFC93C" stroke="#111" stroke-width="1.2"/><circle cx="20" cy="23" r="15" fill="#FFC93C" stroke="#111" stroke-width="2"/><ellipse cx="14.5" cy="22" rx="2.3" ry="3" fill="#111"/><ellipse cx="25.5" cy="22" rx="2.3" ry="3" fill="#111"/><circle cx="15.3" cy="20.8" r="0.9" fill="#fff"/><circle cx="26.3" cy="20.8" r="0.9" fill="#fff"/><path d="M16 28q4 3.5 8 0" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="10.5" cy="26" rx="2" ry="1.1" fill="#F6A3A3" opacity=".8"/><ellipse cx="29.5" cy="26" rx="2" ry="1.1" fill="#F6A3A3" opacity=".8"/></svg></span>';
  function actionsHtml(actions) {
    var out = "";
    (actions || []).slice(0, 3).forEach(function (a) {
      var h = safeHref(a.href); if (!h || !a.label) return;
      var ext = /^(https?:|mailto:)/.test(h);
      out += '<a class="ask__link" href="' + esc(h) + '"' + (ext && h.indexOf("mailto:") !== 0 ? ' target="_blank" rel="noopener"' : "") + ">" + esc(String(a.label).slice(0, 40)) + "</a>";
    });
    return out ? '<div class="ask__sources">' + out + "</div>" : "";
  }
  function add(role, text, actions, card) {
    var m;
    if (card) {
      m = el('<div class="ask__card"><div class="ask__card-top">' + AVA + '<p>' + esc(text) + '</p></div>' +
        '<div class="ask__card-actions">' + (actions || []).slice(0, 2).map(function (a, i) { var h = safeHref(a.href); return h ? '<a class="ask__btn' + (i === 0 ? " ask__btn--ink" : "") + '" href="' + esc(h) + '">' + esc(a.label) + '</a>' : ""; }).join("") + '</div></div>');
    } else {
      m = el('<div class="ask__msg ask__msg--' + role + '">' + (role === "sunny" ? AVA : "") + '<div class="ask__body"><p>' + esc(text) + "</p>" + (role === "sunny" ? actionsHtml(actions) : "") + "</div></div>");
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
    return m;
  }
  function note(text) { var n = el('<p class="ask__sys">' + esc(text) + "</p>"); log.appendChild(n); log.scrollTop = log.scrollHeight; }
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
    if (global.Sunny && Sunny.setAskOpen) Sunny.setAskOpen(on);
    if (on) {
      root.classList.add("has-ask"); panel.classList.remove("is-closing"); panel.hidden = false;
      askBtn.classList.remove("is-nudge"); setTimeout(function () { input.focus(); }, 50);
    } else {
      panel.classList.add("is-closing");
      closeTimer = setTimeout(function () { panel.hidden = true; panel.classList.remove("is-closing"); root.classList.remove("has-ask"); }, 180);
    }
  }
  function doAction(act) {
    if (act === "theme") { var t = document.getElementById("themeToggle"); if (t) t.click(); }
    if (act === "keys") { document.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true })); }
  }
  function scrollIfSameSection(actions) {
    if (!actions || !actions.length) return;
    var h = safeHref(actions[0].href); if (!h || h.indexOf("#") !== 0) return;
    var sec = document.querySelector(h);
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  /* only what the answer needs: page, project and the section in view */
  function safeContext() {
    var c = context();
    return { page: String(c.page || "").slice(0, 40), project: c.project ? String(c.project).slice(0, 40) : null, section: c.section ? String(c.section).slice(0, 40) : null, sectionLabel: c.sectionLabel ? String(c.sectionLabel).slice(0, 60) : null, sectionTitle: c.sectionTitle ? String(c.sectionTitle).slice(0, 120) : null };
  }
  /* an AI reply is used only if it has the right shape; anything odd falls back */
  function sanitize(data) {
    if (!data || typeof data !== "object") return null;
    var text = typeof data.reply === "string" ? data.reply.trim() : "";
    if (!text || text.length > 1500) return null;
    var actions = [];
    if (Array.isArray(data.actions)) data.actions.forEach(function (a) { if (a && typeof a.href === "string" && typeof a.label === "string" && safeHref(a.href) && actions.length < 3) actions.push(A(a.href, a.label.slice(0, 40))); });
    if (!actions.length && Array.isArray(data.link) && typeof data.link[0] === "string" && safeHref(data.link[0])) actions.push(A(data.link[0], String(data.link[1] || "Open").slice(0, 40)));
    var suggest = Array.isArray(data.suggest) ? data.suggest.filter(function (s) { return typeof s === "string" && s.trim() && s.length <= 90; }).slice(0, 3) : null;
    return reply(text, actions, suggest && suggest.length ? suggest : null);
  }
  function respond(text) {
    history.push({ role: "user", content: text });
    busy = true; stopped = false; typing(true);
    if (global.Sunny) Sunny.emote("curious", 1600);
    var local = answerLocal(text), isUnknown = !!(local.topic && local.topic.unknown);
    var finish = function (r, failed, how) {
      typing(false); busy = false; inflight = null;
      if (how === "stopped") note("Stopped. The short version, from the site:");
      add("sunny", r.text, r.actions, isUnknown && r === local);
      if (failed) showError(text);
      renderChips(r.suggest || local.suggest || FOLLOW_DEFAULT);
      history.push({ role: "assistant", content: r.text });
      if (history.length > 16) history = history.slice(-16);
      if (global.Sunny) Sunny.emote(isUnknown && r === local ? "confused" : "happy", 1400);
      if (r.do) setTimeout(function () { doAction(r.do); }, 400);
      scrollIfSameSection(r.actions);
    };
    if (!AI_ENDPOINT) { inflight = { abort: function () { } }; setTimeout(function () { if (busy) finish(local, false); }, 420 + Math.min(900, text.length * 12)); return; }
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    inflight = { abort: function () { stopped = true; if (ctrl) ctrl.abort(); } };
    fetch(AI_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.slice(-8), context: safeContext() }), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error("status " + r.status); return r.json(); })
      .then(function (data) { clearTimeout(timer); var r = sanitize(data); if (!r) throw new Error("empty"); finish(r, false); })
      .catch(function () { clearTimeout(timer); finish(local, !stopped, stopped ? "stopped" : null); });
  }
  function renderChips(list, stack) {
    var old = log.querySelector(".ask__chips"); if (old) old.remove();
    if (!list || !list.length) return;
    var box = el('<div class="ask__chips' + (stack ? " ask__chips--stack" : "") + '" aria-label="Suggested questions">' + list.map(function (s) { return '<button type="button" class="ask__chip">' + esc(s) + "</button>"; }).join("") + "</div>");
    Array.prototype.forEach.call(box.querySelectorAll(".ask__chip"), function (c) {
      c.addEventListener("click", function () { if (busy) return; box.remove(); add("you", c.textContent); respond(c.textContent); });
    });
    log.appendChild(box); log.scrollTop = log.scrollHeight;
  }
  function send() {
    if (busy) { if (inflight) inflight.abort(); return; } /* the send button is Stop while Sunny is thinking */
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    var pending = log.querySelector(".ask__chips"); if (pending) pending.remove();
    add("you", text);
    respond(text);
  }
  function hello() {
    var c = context(), p = c.project ? byId(c.project) : null;
    return p ? "Hi! I’m Sunny. You’re reading the " + p.name + " case. Ask me about the problem, the decisions or what shipped." : "Hi! I’m Sunny. Ask me anything about " + HIM + "’s work and I’ll point you to the right case study.";
  }
  function clearAll() {
    if (busy && inflight) inflight.abort();
    history = []; last = { project: null, field: null, list: null, topic: null };
    log.innerHTML = '<div class="ask__hello">' + AVA + '<p>' + esc(hello()) + '</p></div>';
    renderChips(suggestions(), true);
    input.focus();
  }
  function build() {
    root = global.Sunny && Sunny.el;
    if (!root) return false;
    var charEl = root.querySelector(".sunny__char");
    askBtn = el('<button type="button" class="sunny__ask" aria-label="Ask Sunny a question" aria-expanded="false" title="Ask Sunny (A)">Ask me</button>');
    panel = el(
      '<div class="ask" hidden role="dialog" aria-label="Ask Sunny">' +
        '<div class="ask__head">' + AVA + '<span class="ask__who"><span class="ask__title">Ask Sunny</span><span class="ask__status' + (AI_ENDPOINT ? " is-ai" : "") + '"><span class="ask__status-txt">' + (AI_ENDPOINT ? "AI · answers about " + HIM + "’s work" : "scripted · from the site") + '</span><span class="ask__status-busy">thinking…</span></span></span>' +
        '<button type="button" class="ask__clear" aria-label="Clear the conversation" title="Clear the conversation">clear</button>' +
        '<button type="button" class="ask__close" aria-label="Close. The conversation is kept." title="Close (the conversation is kept)">×</button></div>' +
        '<div class="ask__log" aria-live="polite"><div class="ask__hello">' + AVA + '<p>' + esc(hello()) + '</p></div></div>' +
        '<div class="ask__foot"><form class="ask__form"><input class="ask__input" type="text" placeholder="Ask about ' + esc(HIM) + '’s work…" maxlength="240" autocomplete="off" aria-label="Your question" /><button type="submit" class="ask__send" aria-label="Send"><span class="ask__send-up" aria-hidden="true">↑</span><span class="ask__send-stop" aria-hidden="true">■</span></button></form>' +
        '<p class="ask__note">' + (AI_ENDPOINT ? "AI answers via " + HIM + "’s own server · can be wrong · nothing stored" : "Answers from the site, no AI service · nothing stored") + '</p></div>' +
      "</div>");
    root.appendChild(panel);
    charEl.appendChild(askBtn);
    log = panel.querySelector(".ask__log");
    input = panel.querySelector(".ask__input");
    clearBtn = panel.querySelector(".ask__clear");
    askBtn.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!open); });
    panel.querySelector(".ask__close").addEventListener("click", function () { setOpen(false); });
    clearBtn.addEventListener("click", clearAll);
    panel.querySelector(".ask__form").addEventListener("submit", function (e) { e.preventDefault(); send(); });
    panel.querySelector(".ask__send").addEventListener("click", function (e) { if (busy) { e.preventDefault(); if (inflight) inflight.abort(); } });
    renderChips(suggestions(), true);
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
      close: function () { setOpen(false); },
      clear: clearAll,
      ask: function (q) { setOpen(true); if (busy || !q) return; var pending = log.querySelector(".ask__chips"); if (pending) pending.remove(); add("you", q); respond(q); },
      answer: answerLocal /* the scripted pipeline, for testing */
    };
    return true;
  }
  var tries = 0, t = setInterval(function () { if (build() || ++tries > 60) clearInterval(t); }, 100);
})(window);
