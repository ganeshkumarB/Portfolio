# Ask Sunny · the Claude backend

Sunny answers from one source of facts, `ai/knowledge.js`, which the page loads as a plain script and this worker imports. Without a server, the page works out answers from that knowledge itself (scripted, context-aware). With this worker deployed, Sunny answers in natural language with Claude from the same knowledge: any phrasing, follow-ups, comparisons, recommendations, a recruiter summary, two to four warm sentences, and only about Ganesh and his work. Off-topic requests get a polite redirect, and it says plainly that it is an AI when asked. The API key lives on the worker, never in the page.

## 1. Deploy the worker (about five minutes)

```bash
cd ai
npm init -y
npm install @anthropic-ai/sdk
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY     # paste your key when asked
npx wrangler deploy
```

Wrangler prints the worker URL, something like `https://sunny-ai.<your-subdomain>.workers.dev`.

## 2. Point the site at it

Open `sunny-config.js` at the site root and paste the URL:

```js
window.SUNNY_AI_ENDPOINT = "https://sunny-ai.<your-subdomain>.workers.dev";
```

Upload. Every page already loads that file, so the panel header changes to "AI · answers about Ganesh’s work", and the footer and the home page say the answers come from Claude through your own server.

## What it does

- Model `claude-opus-5-5`, effort `low`, up to 450 output tokens: two to four sentences. The system prompt is built from `knowledge.js` at start-up and cached, so repeat calls are cheap.
- Context: the page sends `{ page, project, section, sectionLabel, sectionTitle }` for the section the visitor is reading. The worker prefixes the question with one bracketed line, so "why was this designed this way?" means that section of that case study. Nothing else about the visitor is sent.
- Response: `{ reply, actions: [{ href, label }], suggest: [question] }`. Links come back as `[[path|label]]` markers in the model's text and are checked against the site's routes; anything else is dropped. The page checks them again before rendering.
- Server-side refusal fallback is on. If a safety classifier declines, the API retries on a fallback model inside the same call.
- CORS is locked to `ganeshuxcraft.in` and `localhost:8765`. Only the last eight messages are sent, each capped at 1,200 characters, merged into alternating turns.
- If the worker is unreachable, slow (15 s), stopped by the visitor, or returns an empty or malformed answer, the page falls back to its scripted answer from the same knowledge, so Sunny never goes quiet.

## Keeping the facts right

Everything Sunny may say is in `knowledge.js`: profile, the seven projects section by section, the design practice, the site, Sunny itself and the recruiter summary. Edit that one file when something changes, bump the asset version on the pages, and redeploy the worker. Facts that are not on the site do not belong there; Sunny is told to say it does not know rather than guess.

## Cost

A typical question is roughly 9,500 cached input tokens and under 150 output tokens. At Opus 5.5 rates that is about a cent per question with the cache warm. Add a Cloudflare rate limit rule on the worker route (for example 30 requests per minute per IP) before the site gets busy, and watch usage in the Anthropic console for the first week.

## Testing without a key

`buildSystem`, `parseReply`, `cleanContext` and `contextLine` are exported, so the prompt and the response shaping can be unit-tested with a stub SDK. The site itself has a harness page while developing (`_sunny-test.html?mode=ai`) that fakes the endpoint to exercise the success, failure, empty, garbage and stopped paths.
