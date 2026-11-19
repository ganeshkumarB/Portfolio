# Ask Sunny · optional Claude backend

Sunny answers visitors from the site's own content with no server at all. This folder turns the same chat panel into a real Claude assistant, with the API key kept on a tiny Cloudflare Worker instead of in the page.

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

In every page that loads `sunny-ai.js`, add one line before that script tag:

```html
<script>window.SUNNY_AI_ENDPOINT = "https://sunny-ai.<your-subdomain>.workers.dev";</script>
```

Reload. The panel header changes from "offline · site knowledge" to "claude", and a one-line privacy note appears under the input.

## What it does

- Model `claude-opus-5-5`, effort `low`, 400 output tokens: fast, short answers.
- The system prompt holds the facts from the site (roles, notice period, case studies, contact). Edit `SYSTEM` in `worker.js` when those change. It is cached, so repeat calls are cheap.
- Server-side refusal fallback is on. If a safety classifier declines, the API retries on a fallback model inside the same call.
- CORS is locked to `ganeshuxcraft.in` and `localhost:8765`. Only the last eight messages are sent, each capped at 600 characters.
- If the worker is unreachable or slow (15 s), the page silently falls back to the offline answers, so Sunny never goes quiet.

## Cost

A typical question is roughly 1,500 cached input tokens and under 150 output tokens. At Opus 5.5 rates that is a fraction of a cent per question. Add a Cloudflare rate limit rule on the worker route if the site gets busy.
