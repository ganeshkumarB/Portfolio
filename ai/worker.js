/* Ask Sunny · Cloudflare Worker
   Answers questions about Ganesh and his work with Claude, from ai/knowledge.js only,
   the same facts the page's scripted answers use. The site calls this endpoint from
   sunny-ai.js; the Anthropic key stays here, never in the page.

   Request:  { messages: [{role, content}, …up to 8], context: { page, project, section, sectionLabel, sectionTitle } }
   Response: { reply, actions: [{ href, label }], suggest: [question] }
   Nothing is logged or stored.

   Deploy:  npm install @anthropic-ai/sdk && npx wrangler deploy
   Secret:  npx wrangler secret put ANTHROPIC_API_KEY
   Then set SUNNY_AI_ENDPOINT on the site to this worker's URL (see ai/README.md). */

import Anthropic from "@anthropic-ai/sdk";
import "./knowledge.js";

const K = globalThis.SUNNY_KNOWLEDGE;
const ALLOWED_ORIGINS = ["https://ganeshuxcraft.in", "https://www.ganeshuxcraft.in", "http://localhost:8765"];

/* ---------- the prompt, rendered from the knowledge ---------- */
export function buildSystem(K) {
  const P = K.profile, PR = K.practice, PO = K.portfolio, R = K.recruiter;
  const lines = [];
  lines.push(`You are Sunny, the small sun mascot on ${P.name}'s portfolio (ganeshuxcraft.in). You help visitors, often recruiters and designers, understand ${P.shortName}'s work.`);
  lines.push("");
  lines.push("VOICE: curious, warm, clever, a little mischievous, observant, concise. Two to four short sentences by default; go deeper only when asked. Plain words. Humour subtle and occasional. No emoji except, rarely, one. Never open with praise for the question, never repeat the question, no greetings after the first turn, no bullet lists, no markdown.");
  lines.push("");
  lines.push("RULES:");
  lines.push("- Answer only from KNOWLEDGE. If the answer is not there, say so plainly (for example: \"I don't have the research details for that project, so I won't guess\") and offer what is documented, or suggest emailing " + K.mail + ".");
  lines.push("- Never invent projects, numbers, dates, clients, metrics, research or opinions. Internal metrics are under NDA; say so if asked.");
  lines.push("- Nothing about Zoho beyond KNOWLEDGE. Off-topic requests (homework, code, other people, general advice): say you only talk about " + P.shortName + "'s work, in one friendly line.");
  lines.push("- If asked, say plainly that you are an AI answering through " + P.shortName + "'s own server, from facts on the site.");
  lines.push(`- Refer to ${P.shortName} as "${P.pronoun}".`);
  lines.push("- CONTEXT: each visitor message may start with a bracketed line saying which page and section they are reading. \"This\", \"here\" and \"why was this designed this way\" refer to that section and project first; use wider knowledge only if the question is clearly about something else.");
  lines.push("- LINKS: when a page or case study is the natural next step, add one or two links at the very end as markers in this exact form: [[path|label]], for example [[case-zobot.html|Zobot case study]]. Allowed paths: " + K.routes.join(", ") + ", index.html#section for home sections (" + PO.home.map((h) => h.id).join(", ") + "), and mailto:" + K.mail + ". No other links.");
  lines.push("- FOLLOW-UP: after the links you may add one line in the form Next: <a short question the visitor might ask next>. At most one.");
  lines.push("- Comparisons: compare only what KNOWLEDGE documents for both projects. Recommendations: pick from the projects by the kind of problem they solved (their tags) and say why in one line.");
  lines.push("");
  lines.push("KNOWLEDGE");
  lines.push(`Profile: ${P.name}, ${P.title}. ${P.summary}`);
  lines.push(`Experience: ${P.experience.join(" ")}`);
  lines.push(`Education: ${P.education}`);
  lines.push(`Story: ${P.story}`);
  lines.push(`Highlights: ${P.highlights.join("; ")}.`);
  lines.push(`Location: ${P.location}. ${P.workModes}`);
  lines.push(`Looking for: ${P.lookingFor} Notice period: ${P.notice}. Replies ${P.replies}.`);
  lines.push(`Contact: ${P.email}. LinkedIn ${P.links.linkedin}. Behance ${P.links.behance}. Dribbble ${P.links.dribbble}. Instagram ${P.links.instagram}. Resume at resume.html (one-page and full two-page PDFs). Hiring page at hire.html.`);
  lines.push(`Tools: ${P.tools}`);
  lines.push(`Coding: ${P.coding}`);
  lines.push(`Leadership: ${P.leadership}`);
  lines.push(`Research: ${P.research}`);
  lines.push("Skills: " + Object.keys(P.skills).map((g) => `${g}: ${P.skills[g].join(", ")}`).join(". ") + ".");
  lines.push(`NDA: ${P.nda}`);
  lines.push("");
  lines.push("Projects (seven case studies on Zoho SalesIQ; every screen recreated with sample data):");
  for (const p of K.projects) {
    lines.push(`## ${p.name} (case ${p.num}, ${p.path}) — ${p.title}`);
    lines.push(`Summary: ${p.summary}`);
    lines.push(`Role: ${p.role}`);
    lines.push(`Problem: ${p.problem}`);
    lines.push(`Approach: ${p.approach}`);
    if (p.system) lines.push(`System: ${p.system}`);
    lines.push(`Decisions: ${p.decisions.join(" ")}`);
    if (p.principles) lines.push(`Principles: ${p.principles.join(" ")}`);
    lines.push(`Outcome: ${p.outcome.join(" ")}`);
    lines.push(`Learned: ${p.learned}`);
    if (p.honest) lines.push(`Honest note: ${p.honest}`);
    lines.push(`Sections: ${p.sections.map((s) => `${s.id} ${s.label}: "${s.title}" ${s.summary}`).join(" | ")}`);
    lines.push(`Kind of problem: ${p.tags.join(", ")}.`);
  }
  lines.push("");
  lines.push(`Process: ${PR.process.map((s) => `${s.name}: ${s.text}`).join(" ")} Principles: ${PR.principles.join(", ")}. ${PR.critique}`);
  lines.push(`Design to code: ${PR.designToCode}`);
  lines.push(`AI practice: ${PR.ai.rule} AI does: ${PR.ai.does.join(" ")} He decides: ${PR.ai.decides.join(" ")} Rules: ${PR.ai.rules.join(" ")} When AI got it wrong: ${PR.ai.wrong}`);
  lines.push("");
  lines.push(`Site: ${PO.site} Pages: ${PO.pages.map((g) => `${g.path} (${g.name}: ${g.what})`).join("; ")}. Home sections: ${PO.home.map((h) => `#${h.id} ${h.name}: ${h.what}`).join("; ")}. Shortcuts: ${PO.shortcuts}`);
  lines.push(`About you, Sunny: ${K.sunny.what} ${K.sunny.does} ${K.sunny.ai} ${K.sunny.controls}`);
  lines.push(`Recruiter summary: ${R.overview} Strengths: ${R.strengths} Products: ${R.products} AI: ${R.ai} Most relevant projects, in order: ${R.relevant.join(", ")}.`);
  return lines.join("\n");
}
const SYSTEM = buildSystem(K);

/* ---------- request shaping ---------- */
const PATH_RE = /^(index\.html(#[a-z-]+)?|#[a-z-]+|case-[a-z-]+\.html(#part-\d\d)?|hire\.html|resume\.html|how-i-use-ai\.html|prompts\.html|how-this-site-was-built\.html)$/;
function allowedHref(h) {
  h = String(h).trim().replace(/^\//, "");
  if (h.startsWith("mailto:" + K.mail)) return h;
  const path = h.split("#")[0];
  if (!PATH_RE.test(h)) return null;
  if (path && !K.routes.includes(path)) return null;
  return h;
}
export function cleanContext(c) {
  if (!c || typeof c !== "object") return null;
  const s = (v, n) => (typeof v === "string" && v.trim() ? v.trim().replace(/[\[\]\n]/g, " ").slice(0, n) : null);
  const out = { page: s(c.page, 40), project: s(c.project, 40), section: s(c.section, 40), sectionLabel: s(c.sectionLabel, 60), sectionTitle: s(c.sectionTitle, 120) };
  if (out.project && !K.projects.some((p) => p.id === out.project)) out.project = null;
  return out.page || out.project ? out : null;
}
export function contextLine(c) {
  if (!c) return "";
  const p = c.project ? K.projects.find((x) => x.id === c.project) : null;
  const where = p ? `the ${p.name} case study` : c.page === "home" ? "the home page" : `the ${c.page} page`;
  const sec = c.sectionTitle ? `, section ${c.sectionLabel ? c.sectionLabel + ": " : ""}"${c.sectionTitle}"` : c.sectionLabel ? `, section ${c.sectionLabel}` : "";
  return `[Visitor is reading ${where}${sec}]\n`;
}
/* [[path|label]] markers and a trailing "Next:" line become structured fields */
export function parseReply(text) {
  const actions = [];
  let reply = String(text || "");
  reply = reply.replace(/\[\[\s*([^\]|]+?)\s*\|\s*([^\]]+?)\s*\]\]/g, (m, href, label) => {
    const h = allowedHref(href);
    if (h && actions.length < 3) actions.push({ href: h, label: label.slice(0, 40) });
    return "";
  });
  let suggest = null;
  reply = reply.replace(/(?:^|\n)\s*Next:\s*(.+?)\s*$/i, (m, q) => { suggest = [q.replace(/^["“]|["”]$/g, "").slice(0, 90)]; return ""; });
  /* bare paths the model may still write become the page's name in the sentence, plus an action */
  reply = reply.replace(/\(?\/?((?:case-[a-z-]+|hire|resume|how-i-use-ai|prompts|how-this-site-was-built)\.html(?:#[a-z0-9-]+)?)\)?/g, (m, p) => {
    const h = allowedHref(p);
    if (!h) return "";
    const path = h.split("#")[0];
    const proj = K.projects.find((x) => x.path === path), page = K.portfolio.pages.find((x) => x.path === path);
    const label = proj ? proj.name + " case study" : page ? page.name : "that page";
    if (actions.length < 3 && !actions.some((a) => a.href === h)) actions.push({ href: h, label: label.slice(0, 40) });
    return "the " + label;
  });
  reply = reply.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/ {2,}/g, " ").trim();
  return { reply, actions, suggest };
}

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}
const json = (body, status, origin) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(origin) } });

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "origin not allowed" }, 403, origin);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, origin); }
    const incoming = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
    const messages = incoming
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
    /* the API wants alternating turns starting with the user: drop anything before the first user turn and merge repeats */
    while (messages.length && messages[0].role !== "user") messages.shift();
    const turns = [];
    for (const m of messages) { if (turns.length && turns[turns.length - 1].role === m.role) turns[turns.length - 1].content += "\n" + m.content; else turns.push({ ...m }); }
    if (!turns.length || turns[turns.length - 1].role !== "user") return json({ error: "no question" }, 400, origin);
    turns[turns.length - 1].content = contextLine(cleanContext(body.context)) + turns[turns.length - 1].content;

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 450,
        output_config: { effort: "low" }, // two to four sentences; the knowledge is in the prompt
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default", // if a safety classifier declines, the API re-runs on a fallback model
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: turns,
      });
      if (response.stop_reason === "refusal") {
        return json({ reply: "I'd rather not answer that one. Ask me about " + K.profile.shortName + " or the work instead.", actions: [], suggest: null }, 200, origin);
      }
      const raw = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      const out = parseReply(raw);
      if (!out.reply) return json({ error: "empty" }, 502, origin); // the page falls back to its scripted answer
      return json({ reply: out.reply, actions: out.actions, suggest: out.suggest, link: out.actions[0] ? [out.actions[0].href, out.actions[0].label] : null }, 200, origin);
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) return json({ error: "busy, try again in a moment" }, 429, origin);
      if (error instanceof Anthropic.AuthenticationError) return json({ error: "server key missing" }, 500, origin);
      if (error instanceof Anthropic.APIError) return json({ error: `api ${error.status}` }, 502, origin);
      return json({ error: "unexpected" }, 500, origin);
    }
  },
};
