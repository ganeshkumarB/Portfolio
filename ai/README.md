# Ask Sunny · the Claude backend

Without a server, Sunny answers from a fixed list about this site. With this worker deployed, Sunny becomes a small general assistant: it answers any reasonable question a visitor or recruiter asks (design, hiring, careers, everyday things) in its own voice, while the facts about Ganesh stay pinned and it refuses to invent anything about him. The API key lives on the worker, never in the page.

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

Upload. Every page already loads that file, so the panel header changes to "AI · ask me anything", the greeting invites any question, and the footer and the home page say the answers come from Claude through your own server.

## What it does

- Model `claude-opus-5-5`, effort `low`, up to 700 output tokens: fast, chat-length answers. The prompt tells Sunny to answer anything reasonable, keep to the pinned facts for Ganesh, decline to make commitments on his behalf (salary, dates), and keep code to a few lines.
- The system prompt holds the facts from the site (roles, notice period, case studies, contact). Edit `SYSTEM` in `worker.js` when those change. It is cached, so repeat calls are cheap.
- Server-side refusal fallback is on. If a safety classifier declines, the API retries on a fallback model inside the same call.
- CORS is locked to `ganeshuxcraft.in` and `localhost:8765`. Only the last eight messages are sent, each capped at 600 characters.
- If the worker is unreachable or slow (15 s), the page silently falls back to the offline answers, so Sunny never goes quiet.

## Cost

A typical question is roughly 1,500 cached input tokens and under 150 output tokens. At Opus 5.5 rates that is a fraction of a cent per question. Add a Cloudflare rate limit rule on the worker route if the site gets busy.

## Keeping it safe and cheap

- Put a Cloudflare rate-limiting rule on the worker route, for example 30 requests per minute per IP. Without it a script could run up your bill.
- Watch usage in the Anthropic console for the first week.
- To change what Sunny knows, edit the facts in `SYSTEM` and redeploy. Nothing else needs to change.
