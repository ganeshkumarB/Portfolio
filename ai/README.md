# Ask Sunny · the Claude backend

Without a server, Sunny answers from a fixed list about this site. With this worker deployed, Sunny answers in natural language with Claude: any phrasing, follow-up questions, two to four warm sentences, but only about Ganesh and his work, from the KNOWLEDGE block in `worker.js`. Off-topic requests get a polite redirect, and it says plainly that it is an AI when asked. The API key lives on the worker, never in the page.

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

- Model `claude-opus-5-5`, effort `low`, up to 400 output tokens: two to four sentences. The prompt is the one Ganesh wrote: answer only from KNOWLEDGE, never invent, nothing about Zoho beyond the facts, off-topic gets redirected, say you are an AI if asked, end with one link when relevant.
- The system prompt holds the facts from the site (roles, notice period, case studies, contact). Edit `SYSTEM` in `worker.js` when those change. It is cached, so repeat calls are cheap.
- Server-side refusal fallback is on. If a safety classifier declines, the API retries on a fallback model inside the same call.
- CORS is locked to `ganeshuxcraft.in` and `localhost:8765`. Only the last eight messages are sent, each capped at 600 characters.
- If the worker is unreachable or slow (15 s), the page silently falls back to the offline answers, so Sunny never goes quiet.

## Cost

A typical question is roughly 1,500 cached input tokens and under 150 output tokens. At Opus 5.5 rates that is a fraction of a cent per question. Add a Cloudflare rate limit rule on the worker route if the site gets busy.

## Keeping it safe and cheap

- Put a Cloudflare rate-limiting rule on the worker route, for example 30 requests per minute per IP. Without it a script could run up your bill.
- Watch usage in the Anthropic console for the first week.
- To change what Sunny knows, edit the KNOWLEDGE block in `SYSTEM` and redeploy. Nothing else needs to change.
