# Auth + Per-User Chat Persistence — Design

**Date:** 2026-06-18
**Status:** Approved (design), pending Supabase/OAuth setup + implementation plan

## Summary
Add optional sign-in (GitHub + Google) to the `/playground` so users can persist their chats to a database synced across devices, and give signed-in users a higher daily message cap than anonymous visitors. The site stays static (GitHub Pages); auth + DB are provided by **Supabase** (client SDK + Row-Level Security), so no app server is needed for persistence. The existing Cloudflare Worker becomes auth-aware for rate limiting.

## Goals
- Anonymous visitors keep working exactly as today (localStorage history), with a **low** daily message cap.
- Signed-in users get chats **persisted to Supabase** (synced across devices) and a **higher** daily cap.
- No backend server for persistence — browser talks to Supabase directly, secured by RLS.
- Keep all existing protections (Turnstile, budget-capped LiteLLM key, Tavily search, both models).

## Non-goals (YAGNI)
- No required login, no paid tiers, no teams/sharing, no admin UI.
- No server-side rendering of user data (site stays static/prerendered).
- No migration off GitHub Pages.

## Decisions (locked)
- **Stack:** Supabase (Auth + Postgres + RLS). Free tier; note: free projects pause after ~7 days idle (mitigate with a periodic ping if always-on is desired).
- **Auth methods:** GitHub OAuth + Google OAuth.
- **Caps:** anonymous **5 messages/day** (per IP); signed-in **50 messages/day** (per user). Tweakable constants.
- **Login is optional**, with perks (persistence + higher cap).

## Architecture
```
browser (SvelteKit static, GitHub Pages)
 ├─ Supabase JS SDK
 │    • GitHub/Google OAuth → session (JWT in browser)
 │    • chats CRUD ── direct, RLS-enforced ──▶ Supabase (Auth + Postgres)
 └─ chat request (+ Supabase access token when signed in) ──▶ Cloudflare Worker (chat-api)
        • access token present & valid → per-USER daily cap (50), keyed by user id
        • else → per-IP daily cap (5)
        • then existing flow: Turnstile → optional Tavily → LiteLLM → model
```

## Data model (Supabase Postgres)
Table `chats`:
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) default auth.uid()`
- `title text`
- `messages jsonb not null default '[]'`
- `updated_at timestamptz not null default now()`

RLS (enabled): policies allowing `select/insert/update/delete` only where `user_id = auth.uid()`.

## Components
1. **Supabase client module** (`src/lib/supabase.ts`) — init the client from public env (URL + anon key); export `supabase`. Anon key is public/safe (RLS protects data).
2. **Auth + chat-store integration** in `+page.svelte`:
   - Sign-in buttons (GitHub / Google) in the sidebar; show account + sign-out when authed.
   - Reactive `session`; on auth change, switch the chat source: signed-out → localStorage (today's behavior); signed-in → Supabase `chats` rows.
   - On first sign-in, prompt to **import** existing localStorage chats into the account.
   - Send the session access token to the Worker with each chat request.
3. **Worker auth-aware rate limiting** (`worker/src/index.ts`):
   - New secret `SUPABASE_JWT_SECRET`. If an access token is provided, verify (HS256) and extract `sub` (user id) → rate-limit key `rl:user:<sub>:<date>`, cap 50. Else `rl:ip:<ip>:<date>`, cap 5. Invalid token → treat as anonymous.

## Data flow — sending a message (signed-in)
browser includes the Supabase `access_token` as a **field in the JSON request body** (not an `Authorization` header — avoids a CORS preflight/allow-header change, since the Worker only allows `Content-Type`) → Worker verifies the JWT → per-user cap check (KV) → Turnstile → optional Tavily → LiteLLM stream. On completion, the browser writes/updates the chat row in Supabase (RLS-scoped to the user).

## Error handling
- Invalid/expired token → Worker silently falls back to anonymous (per-IP) limits (no hard failure).
- Supabase unreachable / project paused → client surfaces a non-blocking notice ("couldn't sync — chatting locally") and falls back to localStorage; chatting still works.
- Over cap → 429 with a message that signing in raises the limit (for anon) / daily limit reached (for signed-in).
- OAuth redirect failure → show a retry sign-in button.

## Security
- **Anon (public) key** lives in the client — safe by design; **RLS** ensures users read/write only their own rows.
- **JWT secret** and **LiteLLM/Tavily/Turnstile secrets** stay server-side (Worker secrets / Supabase) — never in the bundle.
- Worker verifies the JWT signature before granting the higher cap (can't be spoofed for more quota).

## Manual setup (one-time, user)
1. Create a Supabase project (free).
2. Create a **GitHub OAuth app** and a **Google Cloud OAuth** client; paste their IDs/secrets into Supabase → Authentication → Providers.
3. Set Supabase Auth redirect URL to `https://apramodk.com/playground` (+ `http://localhost:5173/playground` for dev).
4. Run the `chats` table + RLS SQL (provided in the plan).
5. Hand off: **Supabase project URL + anon public key** (→ client), and the **JWT secret** (→ Worker secret `SUPABASE_JWT_SECRET`).

## Testing
- Unit: JWT-verify + rate-limit-key selection (pure helpers) in the Worker; chat-source switching logic.
- Manual/integration: sign in with each provider; chat persists + reloads across a refresh and a second browser; anon hits 5/day cap; signed-in gets 50/day; import-on-first-sign-in works; signed-out still works on localStorage.

## Rollout / dependency note
Implementation is gated on the Supabase project + both OAuth apps existing and the keys/secret being provided. The plan documents the setup steps; build/test starts once keys are in hand. Free-tier caveat: Supabase idle-pause (~7 days) — optional keep-alive ping.
