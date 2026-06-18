# Auth + Per-User Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional GitHub/Google sign-in (Supabase) to `/playground` so signed-in users get DB-persisted, synced chats and a higher daily message cap, while anonymous use keeps working on localStorage.

**Architecture:** Static SvelteKit site talks to Supabase (Auth + Postgres + RLS) directly from the browser via `@supabase/supabase-js`; chats are RLS-scoped rows. Each chat request to the Cloudflare Worker carries the Supabase `access_token` in the JSON body; the Worker verifies the JWT (HS256) to pick a per-user cap (50/day) vs per-IP cap (5/day).

**Tech Stack:** SvelteKit (adapter-static), `@supabase/supabase-js`, Supabase (Auth + Postgres + RLS), Cloudflare Worker (Web Crypto for JWT verify) + Workers KV, Vitest.

## Global Constraints

- Site stays static (`@sveltejs/adapter-static`) — no SvelteKit server endpoints.
- Supabase **anon/public** URL + key may be hardcoded client-side (public by design; RLS protects data). Secrets (`SUPABASE_JWT_SECRET`, LiteLLM/Tavily/Turnstile) stay server-side only.
- Caps: anonymous **5/day** (per IP), signed-in **50/day** (per user).
- Access token travels in the **request body** (`accessToken` field), never an `Authorization` header (avoids CORS preflight change).
- **REVISED (2026-06-18):** new Supabase projects sign JWTs asymmetrically, so the Worker validates a token by calling Supabase `GET /auth/v1/user` (token + publishable key) rather than HMAC-verifying with a JWT secret. No JWT secret needed; Supabase URL + publishable key are public and hardcoded in the Worker.
- `pnpm install --frozen-lockfile` is the CI install — add deps with **pnpm** so the lockfile stays in sync.
- Invalid/expired token → silently treat as anonymous (no hard failure).

## File Structure
- `src/lib/supabase.ts` — Supabase browser client (public URL + anon key).
- `src/lib/chatStore.ts` — storage abstraction: `localStore` (localStorage) + `remoteStore` (Supabase), same interface.
- `worker/src/index.ts` — add `verifySupabaseJWT` + tiered rate limiting.
- `src/routes/playground/+page.svelte` — session state, sign-in/out UI, store switching, token in requests.

---

## Task 0: Supabase + OAuth + schema (manual setup)

**Files:** none (dashboard + SQL).

- [ ] **Step 1: Create Supabase project** at supabase.com (free). From Settings → API record: Project URL, anon public key, JWT secret.

- [ ] **Step 2: GitHub + Google OAuth** — create a GitHub OAuth app and a Google Cloud OAuth web client; callback URL for both = `https://<project>.supabase.co/auth/v1/callback`. Paste each client id/secret into Supabase → Authentication → Providers (enable GitHub + Google).

- [ ] **Step 3: Auth URL config** — Supabase → Authentication → URL Configuration: Site URL `https://apramodk.com`; Redirect URLs add `https://apramodk.com/playground` and `http://localhost:5173/playground`.

- [ ] **Step 4: Create the table + RLS** — Supabase → SQL Editor, run:

```sql
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null default 'New chat',
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.chats enable row level security;
create policy "own_select" on public.chats for select using (auth.uid() = user_id);
create policy "own_insert" on public.chats for insert with check (auth.uid() = user_id);
create policy "own_update" on public.chats for update using (auth.uid() = user_id);
create policy "own_delete" on public.chats for delete using (auth.uid() = user_id);
create index chats_user_updated on public.chats (user_id, updated_at desc);
```
Expected: table `chats` with RLS enabled and 4 policies.

- [ ] **Step 5: Hand off** the Project URL + anon key (for `src/lib/supabase.ts`) and the JWT secret (for the Worker secret). No commit.

---

## Task 1: Supabase client module

**Files:** Create `src/lib/supabase.ts`; modify `package.json` (dep).

**Interfaces:** Produces `supabase` (a `SupabaseClient`).

- [ ] **Step 1: Add the SDK** (pnpm keeps the lockfile synced)

Run: `cd /c/Users/apram/Code/pweb && pnpm add @supabase/supabase-js`
Expected: `@supabase/supabase-js` in `dependencies`, `pnpm-lock.yaml` updated.

- [ ] **Step 2: Create `src/lib/supabase.ts`** (replace the two constants with the real project values from Task 0)

```ts
import { createClient } from '@supabase/supabase-js';

// Public, safe to ship in the client bundle — RLS protects the actual data.
const SUPABASE_URL = 'https://REPLACE.supabase.co';
const SUPABASE_ANON_KEY = 'REPLACE_ANON_PUBLIC_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
```

- [ ] **Step 3: Build to verify it compiles**

Run: `npm run build`
Expected: build succeeds (`✔ done`).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/supabase.ts
git commit -m "feat(auth): add supabase browser client"
```

---

## Task 2: Worker — JWT verify + tiered rate limiting (TDD)

**Files:** Modify `worker/src/index.ts`; Test `worker/test/jwt.test.ts`.

**Interfaces:**
- Produces `verifySupabaseJWT(token: string, secret: string): Promise<string | null>` (returns user id or null).
- Consumes: existing `rateLimitKey`.

- [ ] **Step 1: Write the failing test** — `worker/test/jwt.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { verifySupabaseJWT } from "../src/index";

const SECRET = "test-secret";

// Build a valid HS256 JWT with the same WebCrypto the worker uses.
async function makeJwt(payload: object, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const b64url = (b: ArrayBuffer | Uint8Array) => {
    const bytes = b instanceof Uint8Array ? b : new Uint8Array(b);
    let s = ""; for (const c of bytes) s += String.fromCharCode(c);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const head = b64url(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

describe("verifySupabaseJWT", () => {
  it("returns the sub for a valid, unexpired token", async () => {
    const t = await makeJwt({ sub: "user-123", exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    expect(await verifySupabaseJWT(t, SECRET)).toBe("user-123");
  });
  it("returns null for a wrong secret", async () => {
    const t = await makeJwt({ sub: "user-123", exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    expect(await verifySupabaseJWT(t, "other-secret")).toBeNull();
  });
  it("returns null for an expired token", async () => {
    const t = await makeJwt({ sub: "user-123", exp: Math.floor(Date.now() / 1000) - 10 }, SECRET);
    expect(await verifySupabaseJWT(t, SECRET)).toBeNull();
  });
  it("returns null for malformed input", async () => {
    expect(await verifySupabaseJWT("not.a.jwt", SECRET)).toBeNull();
    expect(await verifySupabaseJWT("", SECRET)).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd worker && npx vitest run test/jwt.test.ts`
Expected: FAIL — `verifySupabaseJWT` not exported.

- [ ] **Step 3: Implement `verifySupabaseJWT`** — add to `worker/src/index.ts` (after `rateLimitKey`):

```ts
function b64urlToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  if (s.length % 4) s += "=".repeat(4 - (s.length % 4));
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function verifySupabaseJWT(token: string, secret: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h, p, sig] = parts;
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const ok = await crypto.subtle.verify(
      "HMAC", key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`)
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p))) as {
      sub?: string; exp?: number;
    };
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `cd worker && npx vitest run`
Expected: PASS (existing helper tests + 4 new jwt tests).

- [ ] **Step 5: Wire tiered rate limiting** — in `worker/src/index.ts`:
  - Add to `Env`: `SUPABASE_JWT_SECRET: string;`
  - Add to the body type: `accessToken?: string;`
  - Add constants: `const ANON_LIMIT = 5; const USER_LIMIT = 50;`
  - Replace the existing rate-limit block:

```ts
    // Identify signed-in users → higher cap; else per-IP anonymous cap.
    let uid: string | null = null;
    if (typeof body.accessToken === "string" && body.accessToken && env.SUPABASE_JWT_SECRET) {
      uid = await verifySupabaseJWT(body.accessToken, env.SUPABASE_JWT_SECRET);
    }
    const rlId = uid ? `user:${uid}` : `ip:${ip}`;
    const limit = uid ? USER_LIMIT : ANON_LIMIT;
    const key = rateLimitKey(rlId, new Date().toISOString());
    const used = parseInt((await env.RATE_LIMIT.get(key)) ?? "0", 10);
    if (used >= limit) {
      return json({ error: uid ? "daily limit reached" : "daily limit reached — sign in for more" }, 429);
    }
    ctx.waitUntil(env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 86400 }));
```
  (Note: `rateLimitKey` now receives `user:<id>`/`ip:<ip>` as its first arg — its `rl:${id}:${date}` shape still holds.)

- [ ] **Step 6: Run tests + deploy worker**

Run: `cd worker && npx vitest run` → PASS.
Then set the secret + deploy:
```bash
printf '%s' "<JWT_SECRET from Task 0>" | CLOUDFLARE_API_TOKEN=$TOK npx wrangler secret put SUPABASE_JWT_SECRET
CLOUDFLARE_API_TOKEN=$TOK npx wrangler deploy
```
Expected: deploy succeeds; secret uploaded.

- [ ] **Step 7: Commit**

```bash
cd /c/Users/apram/Code/pweb && git add worker/src/index.ts worker/test/jwt.test.ts
git commit -m "feat(worker): verify supabase JWT + tiered rate limits (5 anon / 50 user)"
```

---

## Task 3: Chat store abstraction

**Files:** Create `src/lib/chatStore.ts`.

**Interfaces:**
- Types: `Msg = { role: 'user'|'assistant'; content: string }`, `Chat = { id: string; title: string; messages: Msg[]; updated: number }`.
- Produces: `localStore` and `remoteStore(userId)`, each with `list(): Promise<Chat[]>`, `save(chat): Promise<void>`, `remove(id): Promise<void>`.

- [ ] **Step 1: Create `src/lib/chatStore.ts`**

```ts
import { supabase } from './supabase';

export type Msg = { role: 'user' | 'assistant'; content: string };
export type Chat = { id: string; title: string; messages: Msg[]; updated: number };
export interface ChatStore {
  list(): Promise<Chat[]>;
  save(chat: Chat): Promise<void>;
  remove(id: string): Promise<void>;
}

const KEY = 'pweb-chats';

export const localStore: ChatStore = {
  async list() {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
  },
  async save(chat) {
    const all = (await this.list()).filter((c) => c.id !== chat.id);
    all.unshift(chat);
    all.sort((a, b) => b.updated - a.updated);
    localStorage.setItem(KEY, JSON.stringify(all));
  },
  async remove(id) {
    const all = (await this.list()).filter((c) => c.id !== id);
    localStorage.setItem(KEY, JSON.stringify(all));
  }
};

export function remoteStore(): ChatStore {
  return {
    async list() {
      const { data } = await supabase
        .from('chats').select('id,title,messages,updated_at')
        .order('updated_at', { ascending: false });
      return (data ?? []).map((r) => ({
        id: r.id, title: r.title, messages: r.messages as Msg[],
        updated: new Date(r.updated_at as string).getTime()
      }));
    },
    async save(chat) {
      await supabase.from('chats').upsert({
        id: chat.id, title: chat.title, messages: chat.messages,
        updated_at: new Date(chat.updated).toISOString()
      });
    },
    async remove(id) {
      await supabase.from('chats').delete().eq('id', id);
    }
  };
}
```

- [ ] **Step 2: Build to verify it compiles**

Run: `npm run build` → `✔ done`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/chatStore.ts && git commit -m "feat(auth): localStorage + supabase chat stores"
```

---

## Task 4: Auth UI + persistence switching in the page

**Files:** Modify `src/routes/playground/+page.svelte`.

**Interfaces:** Consumes `supabase`, `localStore`, `remoteStore`, `streamChat` (token param from Task 5).

- [ ] **Step 1: Add imports + session state** (in `<script>`):

```ts
import { supabase } from '$lib/supabase';
import { localStore, remoteStore, type ChatStore } from '$lib/chatStore';
let session: import('@supabase/supabase-js').Session | null = null;
let store: ChatStore = localStore;
```

- [ ] **Step 2: React to auth in `onMount`** (add inside the existing `onMount`):

```ts
supabase.auth.getSession().then(({ data }) => applySession(data.session));
supabase.auth.onAuthStateChange((_e, s) => applySession(s));
```
And add these functions:
```ts
async function applySession(s: typeof session) {
    const wasAnon = !session;
    session = s;
    store = s ? remoteStore() : localStore;
    if (s && wasAnon) await maybeImportLocal();
    chats = await store.list();
    if (!chats.find((c) => c.id === currentId)) { currentId = newId(); messages = []; }
}
async function maybeImportLocal() {
    const local = await localStore.list();
    if (local.length && confirm(`Import ${local.length} local chat(s) into your account?`)) {
        for (const c of local) await store.save(c);
        localStorage.removeItem('pweb-chats');
    }
}
function signIn(provider: 'github' | 'google') {
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo: location.href } });
}
async function signOut() { await supabase.auth.signOut(); }
```

- [ ] **Step 3: Make existing chat ops async via `store`** — replace the bodies of `persist`/`saveCurrent`/`loadChat`/`deleteChat`/`newChat` to call `store.save(...)`, `store.remove(...)`, and `await store.list()` instead of the localStorage calls. (The current functions already maintain the `chats` array; swap their persistence line for `store.save(chat)` / `store.remove(id)`; replace the `onMount` localStorage read with `chats = await store.list()`.)

- [ ] **Step 4: Add the sidebar auth UI** — replace the `.side-head` block's brand line with:

```svelte
<div class="side-head">
    {#if session}
        <span class="brand">{session.user.email ?? session.user.user_metadata?.user_name ?? 'Signed in'}</span>
        <button class="auth-btn" type="button" on:click={signOut}>Sign out</button>
    {:else}
        <span class="brand">Sign in to save chats</span>
        <button class="auth-btn" type="button" on:click={() => signIn('github')}>Continue with GitHub</button>
        <button class="auth-btn" type="button" on:click={() => signIn('google')}>Continue with Google</button>
    {/if}
    <button class="new" type="button" on:click={newChat}>＋ New chat</button>
</div>
```
Add `.auth-btn` CSS mirroring `.new` (bordered pill button).

- [ ] **Step 5: Type-check + build**

Run: `npm run check` (no new errors in playground) then `npm run build` → `✔ done`.

- [ ] **Step 6: Commit**

```bash
git add src/routes/playground/+page.svelte && git commit -m "feat(auth): sign-in UI + supabase/localStorage chat switching + import"
```

---

## Task 5: Send the access token with chat requests

**Files:** Modify `src/lib/chat.ts`, `src/routes/playground/+page.svelte`.

**Interfaces:** `StreamOpts` gains `accessToken?: string`.

- [ ] **Step 1: Forward the token** — in `src/lib/chat.ts`, add `accessToken?: string;` to `StreamOpts`, and include `accessToken: opts.accessToken` in the POST body JSON.

- [ ] **Step 2: Pass it from `send()`** — in `+page.svelte`, add to the `streamChat({...})` call:
```ts
accessToken: session?.access_token,
```

- [ ] **Step 3: Build**

Run: `npm run build` → `✔ done`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/chat.ts src/routes/playground/+page.svelte
git commit -m "feat(auth): send supabase access token to worker for per-user cap"
```

---

## Task 6: End-to-end verification

**Files:** none.

- [ ] **Step 1: Run dev** (`npm run dev`), open `/playground`.
- [ ] **Step 2: Anonymous** — chat works; history in localStorage; after 5 messages, 429 with "sign in for more".
- [ ] **Step 3: Sign in with GitHub** — redirect + return signed in; prompted to import local chats; sidebar shows account.
- [ ] **Step 4: Persistence** — send messages; refresh → chats reload from Supabase; open a 2nd browser, sign in → same chats appear.
- [ ] **Step 5: Per-user cap** — signed-in allows past 5 (up to 50/day).
- [ ] **Step 6: Sign in with Google** — works.
- [ ] **Step 7: Sign out** — falls back to localStorage; signed-out chatting still works.
- [ ] **Step 8: Security** — Supabase rows for one user are not readable by another (RLS); the worker grants 50-cap only with a valid token (tamper a token → falls back to 5).
- [ ] **Step 9: Build** (`npm run build`) succeeds with adapter-static; merge `feat/auth-persistence` → main → CI deploys.

---

## Self-Review Notes
- **Spec coverage:** optional sign-in (Task 4), GitHub+Google (Tasks 0/4), Supabase persistence + RLS (Tasks 0/3/4), tiered caps 5/50 (Task 2), token-in-body (Tasks 2/5), import local chats (Task 4), anonymous fallback + static-site constraint (Tasks 3/4/6), JWT secret server-side only (Task 2) — all covered.
- **Placeholders:** only intentional `REPLACE…` values are the public Supabase URL + anon key (Task 1, supplied from Task 0) and the JWT secret (Task 2). No logic placeholders.
- **Type consistency:** `Msg`/`Chat`/`ChatStore` shared from `chatStore.ts` across tasks; `verifySupabaseJWT(token, secret) -> Promise<string|null>` consistent (Task 2); `accessToken` body field consistent (Tasks 2 & 5).
- **Testing honesty:** the pure/crypto helper (`verifySupabaseJWT`) is unit-tested; auth flow, RLS, and persistence are integration/manually verified (Task 6) — the right level for OAuth + a browser SDK.
