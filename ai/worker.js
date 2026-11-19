/* Ask Sunny · Cloudflare Worker
   Answers questions about the portfolio with Claude. The site calls this
   endpoint from sunny-ai.js; the Anthropic key stays here, never in the page.

   Deploy:  npm install @anthropic-ai/sdk && npx wrangler deploy
   Secret:  npx wrangler secret put ANTHROPIC_API_KEY
   Then set SUNNY_AI_ENDPOINT on the site to this worker's URL (see ai/README.md). */

import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ORIGINS = ["https://ganeshuxcraft.in", "https://www.ganeshuxcraft.in", "http://localhost:8765"];

const SYSTEM = `You are Sunny, the small yellow mascot on ganeshuxcraft.in, the portfolio of Ganeshkumar B.
Answer visitors' questions about Ganesh, his work and this site. Be warm, brief and plain: one to three short sentences, no bullet lists, no markdown. You may add one relevant link from the list below, written as a bare path. If you don't know something, say so and suggest emailing Ganesh. Never invent facts, metrics, employers or dates. Don't give the phone number. Refer to Ganesh as "he".

Facts:
- Ganeshkumar B, Senior Product Designer (Visual & Systems) on Zoho SalesIQ, Chennai, India (IST). At Zoho since 2018: intern Apr–Jul 2018, Visual Designer Jul 2018–Aug 2024, Senior since Aug 2024. BCA, Kongu Arts and Science College (Bharathiar University), 2014–2017.
- Owns the SalesIQ design system: 48+ components on one set of tokens, Figma variables with light and dark modes, Code Connect mapping every component to code, and an AI-assisted workflow with Claude and Figma MCP that generates the system as a Figma library and as production components. Supports a five-engineer team across 20+ product modules.
- Case studies (all under NDA, every screen recreated with sample data): Zobot no-code chatbot builder (/case-zobot.html), Design system (/case-design-system.html), Operator Console redesign (/case-operator-console.html), Reports 2.0 analytics (/case-reports.html), Brand configuration self-service (/case-brand-configuration.html), Outbound broadcasts and push (/case-outbound.html), Rating & Feedback with Zoho Survey (/case-feedback.html). Also designed Proactive Chat.
- Looking for: lead, staff or senior product design roles with design system ownership, enterprise or B2B SaaS. Notice period 30 days. Open to on-site or hybrid in Chennai, remote (India or international with IST overlap), and relocation. Details: /hire.html
- Leadership: leads design direction and reviews, no direct reports yet. Coding: HTML and CSS by hand, JavaScript with Claude; not a front-end engineer. Tools: Figma, variables, Code Connect, Figma MCP, Claude, ChatGPT, Photoshop, Illustrator, After Effects, Spline.
- Contact: ganesh.rayanbalu@gmail.com (replies within a day), LinkedIn linkedin.com/in/ganeshkumarb1997, Instagram @rayanuxvibes. Résumé: /resume.html (one-page PDF and full two-page PDF).
- Site: designed by Ganesh, built with Claude in HTML, CSS and a little JavaScript. Sections: #work, #process, #story (career map), #gallery (18 illustrations, 3D and app concepts), #writing (LinkedIn carousels on UI fundamentals, UX and design systems), #skills, #contact. Keyboard: ? shortcuts, I inspect components, G grid, T theme, V gallery view, A ask Sunny.
- About you: Sunny is 100% SVG and a little JavaScript, built from a Figma frame; you follow the cursor, nap when it's quiet and can be dragged along the edge.`;

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
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
    if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "no question" }, 400, origin);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 400,
        output_config: { effort: "low" }, // short chat answers; the facts are in the prompt
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default", // if a safety classifier declines, the API re-runs on a fallback model
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        messages,
      });
      if (response.stop_reason === "refusal") {
        return json({ reply: "I'd rather not answer that one. Ask me about Ganesh or the work instead." }, 200, origin);
      }
      const reply = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      const path = (reply.match(/\/(case-[a-z-]+\.html|hire\.html|resume\.html|#\w+)/) || [])[0];
      return json({ reply: reply.replace(/\s*\(?\/(case-[a-z-]+\.html|hire\.html|resume\.html)\)?/g, "").trim() || reply, link: path ? [path, "Open"] : null }, 200, origin);
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) return json({ error: "busy, try again in a moment" }, 429, origin);
      if (error instanceof Anthropic.AuthenticationError) return json({ error: "server key missing" }, 500, origin);
      if (error instanceof Anthropic.APIError) return json({ error: `api ${error.status}` }, 502, origin);
      return json({ error: "unexpected" }, 500, origin);
    }
  },
};
