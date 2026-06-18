# LLM Playground for apramodk.com — Design

**Date:** 2026-06-17
**Status:** Approved (design), pending implementation plan

## Summary
Add a public `/playground` page to the (static, GitHub Pages) SvelteKit site where
visitors can chat with a self-hosted open model. Doubles as a portfolio showpiece:
"a model I run on my own DGX Spark, live on my site." Because the site is static
(`adapter-static`), all secrets + abuse protection live in a Cloudflare Worker, not
the site.

## Goals
- Visitors can chat (multi-turn) with a self-hosted model from the site.
- API key never reaches the browser.
- GPU + cost protected against bots, abuse, and DDoS.
- Ships fast and bounded (job-hunt portfolio piece, not a side-quest sink).

## Non-goals (YAGNI)
- No user accounts, no persisted history, no multi-model selector.
- No exposure of the 120B model to the public (mentioned in copy only).
- No change to the existing GitHub Pages deploy of the site.

## Architecture
```
browser (/playground, static, GH Pages)
   │  POST {messages} + Turnstile token   (CORS locked to apramodk.com)
   ▼
Cloudflare Worker  chat-api.apramodk.com
   • verify Turnstile (bots)
   • per-IP rate limit via Workers KV
   • trim history + cap max_tokens
   • inject LiteLLM demo key (Worker secret)
   • stream (SSE) passthrough
   ▼
https://llm.apramodk.com  ->  LiteLLM  ->  Ollama (qwen2.5-7b) on Spark
```

## Components
1. **Chat UI** — new route `src/routes/playground/+page.svelte`, styled with the
   existing DaisyUI/Tailwind. Multi-turn, streaming display, "self-hosted 120B" blurb.
   Bounded: sends only the last ~6 messages.  *(Auditable glue.)*
2. **Cloudflare Worker `chat-api`** — gatekeeper + proxy: Turnstile verify, IP rate
   limit, token/context caps, key injection, streaming passthrough. Deployed via
   wrangler; key + Turnstile secret stored as Worker secrets.  *(Hand-written core.)*

## Model
- Served: **qwen2.5-7b** only (fast, cheap, abuse-resilient).
- gpt-oss-120b: referenced in page copy as the flex, **not** served to the public.

## Abuse / DDoS protection (defense in depth)
1. Cloudflare edge **L3/L4 DDoS mitigation** (automatic — Worker is on CF edge).
2. **Turnstile** invisible captcha — blocks bot/script floods.
3. **Per-IP rate limit** (Workers KV): ~20 messages/day/IP.
4. **Dedicated LiteLLM "public-demo" key** (Neon-backed) scoped to qwen2.5-7b with a
   **hard monthly budget cap** — bounds worst-case cost regardless of other layers.
5. **Caps:** max_tokens ~512, last ~6 messages, request-size limit.
6. **Streaming** — snappy UX + dodges Cloudflare 100s timeout.
7. (Optional) Cloudflare Rate-Limiting Rule on the Worker route.

## Request lifecycle / error handling
- Missing/invalid Turnstile -> 403, UI shows "verify you are human".
- Over rate limit -> 429, UI shows friendly "daily demo limit reached" message.
- Upstream/model error or timeout -> 502, UI shows "model busy, try again".
- All responses stream tokens; UI renders incrementally.

## Security notes
- LiteLLM key + Turnstile secret: Worker secrets only, never in client bundle.
- Origin (llm.apramodk.com -> Spark) stays hidden behind the existing tunnel.
- Worker CORS locked to https://apramodk.com (defense-in-depth; real protection is
  Turnstile + rate limit + budget cap, since non-browser clients ignore CORS).

## Deployment
- Site: unchanged (GitHub Pages, adapter-static).
- Worker: `wrangler deploy`; route chat-api.apramodk.com; secrets via `wrangler secret put`.
- Mint the demo LiteLLM key on the Spark with a budget cap; store in Worker secret.

## Testing
- Manual: happy-path chat, rate-limit trip, Turnstile fail, upstream-down behavior.
- Quick load check: confirm rate limit + budget cap actually bound abuse.

## Open / future
- Could later add the 120B behind a stricter gate if desired.
- Could move site to Cloudflare Pages to unify hosting (not now).
