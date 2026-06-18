# LLM Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `/playground` chat page to the static pweb site, backed by a Cloudflare Worker that safely proxies to the self-hosted model with bot/rate/cost protection.

**Architecture:** The SvelteKit site stays static on GitHub Pages. A standalone Cloudflare Worker (`chat-api.apramodk.com`) holds the LiteLLM key as a secret, verifies Turnstile, rate-limits per IP via Workers KV, caps tokens, and streams responses from `llm.apramodk.com`. The browser talks only to the Worker.

**Tech Stack:** Cloudflare Workers (TypeScript) + Workers KV + Turnstile; SvelteKit (adapter-static) + Tailwind/DaisyUI; Vitest for unit tests; wrangler for Worker dev/deploy.

## Global Constraints

- Site MUST remain static (`@sveltejs/adapter-static`) — no SvelteKit server endpoints.
- Worker CORS locked to `https://apramodk.com` (exact value).
- Public model: `qwen2.5-7b` ONLY. Never expose `gpt-oss-120b` to the public.
- Caps: `max_tokens=512`, last `6` messages, `20` requests/day/IP.
- LiteLLM demo key + Turnstile secret live ONLY as Worker secrets — never in the client bundle.
- Page copy MUST honestly state: demo runs a fast 7B; gpt-oss-120B is self-hosted on the same DGX Spark but not served here.
- Upstream URL: `https://llm.apramodk.com/v1/chat/completions`.

---

## File Structure

- `worker/wrangler.toml` — Worker config: name, KV binding, custom domain route.
- `worker/src/index.ts` — Worker entry: CORS, Turnstile verify, rate limit, trim, streaming proxy. **(Hand-write target — core logic.)**
- `worker/test/helpers.test.ts` — Vitest unit tests for the pure helpers.
- `worker/package.json` — wrangler + vitest deps.
- `src/lib/chat.ts` — client streaming helper + SSE parse (pure, testable).
- `src/lib/chat.test.ts` — Vitest for `parseSSEChunk`.
- `src/routes/playground/+page.svelte` — the chat UI (Turnstile widget, streaming, error states). **(Auditable glue.)**
- `src/routes/playground/+page.ts` — `export const prerender = true`.

---

## Task 0: Prerequisites (manual + Spark setup)

**Files:** none (dashboard + Spark commands).

- [ ] **Step 1: Mint the budget-capped demo LiteLLM key** (on the Spark)

```bash
ssh apramodk@spark-a61f 'cd ~/llm-stack; KEY=$(grep ^LITELLM_MASTER_KEY= .env | cut -d= -f2)
curl -s localhost:4000/key/generate -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d "{\"key_alias\":\"public-demo\",\"models\":[\"qwen2.5-7b\"],\"max_budget\":10,\"budget_duration\":\"30d\",\"rpm_limit\":30}"'
```
Expected: JSON with a `"key":"sk-..."`. Save it — this becomes the Worker's `LITELLM_KEY` secret. It is scoped to qwen2.5-7b, $10/30d budget, 30 req/min.

- [ ] **Step 2: Create a Turnstile site** (Cloudflare dashboard → Turnstile → Add site)
  - Domain: `apramodk.com`. Widget mode: **Managed** (invisible/interactive as needed).
  - Copy the **Site Key** (public, goes in the Svelte page) and **Secret Key** (goes in the Worker secret).
  - For local dev, use Cloudflare's documented always-pass test keys (sitekey `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`).

- [ ] **Step 3: No commit** (no repo changes in this task).

---

## Task 1: Worker scaffold + pure helpers (TDD)

**Files:**
- Create: `worker/package.json`, `worker/wrangler.toml`, `worker/src/index.ts`, `worker/test/helpers.test.ts`

**Interfaces:**
- Produces: `trimMessages(messages: unknown, max?: number): Msg[]`, `rateLimitKey(ip: string, dateISO: string): string` (exported from `worker/src/index.ts`).

- [ ] **Step 1: Init the worker project**

```bash
cd ~/Code/pweb && mkdir -p worker/src worker/test && cd worker
cat > package.json <<'JSON'
{
  "name": "chat-api",
  "private": true,
  "type": "module",
  "scripts": { "dev": "wrangler dev", "deploy": "wrangler deploy", "test": "vitest run" },
  "devDependencies": { "wrangler": "^3", "vitest": "^2", "@cloudflare/workers-types": "^4", "typescript": "^5" }
}
JSON
npm install
```
Expected: `node_modules` created, no errors.

- [ ] **Step 2: Write the failing tests for the pure helpers**

`worker/test/helpers.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { trimMessages, rateLimitKey } from "../src/index";

describe("trimMessages", () => {
  it("keeps only the last N valid messages", () => {
    const msgs = Array.from({ length: 10 }, (_, i) => ({ role: "user", content: `m${i}` }));
    const out = trimMessages(msgs, 6);
    expect(out).toHaveLength(6);
    expect(out[0].content).toBe("m4");
  });
  it("drops malformed entries", () => {
    expect(trimMessages([{ role: "user", content: "ok" }, { role: "x" }, null], 6)).toHaveLength(1);
  });
  it("returns [] for non-arrays", () => {
    expect(trimMessages(null)).toEqual([]);
  });
});

describe("rateLimitKey", () => {
  it("buckets by ip and UTC date", () => {
    expect(rateLimitKey("1.2.3.4", "2026-06-17T10:00:00Z")).toBe("rl:1.2.3.4:2026-06-17");
  });
});
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `cd ~/Code/pweb/worker && npm test`
Expected: FAIL — cannot import `trimMessages`/`rateLimitKey` (not defined yet).

- [ ] **Step 4: Implement the helpers (minimal) in `worker/src/index.ts`**

```ts
export type Msg = { role: "user" | "assistant" | "system"; content: string };

const VALID_ROLES = new Set(["user", "assistant", "system"]);

export function trimMessages(messages: unknown, max = 6): Msg[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is Msg =>
        !!m && typeof (m as Msg).content === "string" && VALID_ROLES.has((m as Msg).role)
    )
    .slice(-max);
}

export function rateLimitKey(ip: string, dateISO: string): string {
  return `rl:${ip}:${dateISO.slice(0, 10)}`;
}
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `cd ~/Code/pweb/worker && npm test`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
cd ~/Code/pweb && git add worker/package.json worker/src/index.ts worker/test/helpers.test.ts
git commit -m "feat(worker): scaffold chat-api worker + tested pure helpers"
```

---

## Task 2: Worker request handler (Turnstile + rate limit + streaming proxy)

**Files:**
- Modify: `worker/src/index.ts` (add `Env`, `verifyTurnstile`, default `fetch` export)
- Create: `worker/wrangler.toml`

**Interfaces:**
- Consumes: `trimMessages`, `rateLimitKey` from Task 1.
- Produces: a deployed Worker accepting `POST { messages, turnstileToken }` and returning a streamed `text/event-stream`.

- [ ] **Step 1: Write `wrangler.toml`**

```toml
name = "chat-api"
main = "src/index.ts"
compatibility_date = "2026-01-01"
compatibility_flags = ["nodejs_compat"]

kv_namespaces = [
  { binding = "RATE_LIMIT", id = "REPLACE_WITH_KV_ID" }
]

# After deploy, bind the custom domain in the dashboard (Workers > chat-api > Domains)
# or uncomment:
# routes = [{ pattern = "chat-api.apramodk.com", custom_domain = true }]
```

- [ ] **Step 2: Create the KV namespace**

```bash
cd ~/Code/pweb/worker && npx wrangler kv namespace create RATE_LIMIT
```
Expected: prints an `id = "..."`. Paste it into `wrangler.toml` replacing `REPLACE_WITH_KV_ID`.

- [ ] **Step 3: Implement the handler in `worker/src/index.ts`** (append below the helpers)

```ts
const ALLOWED_ORIGIN = "https://apramodk.com";
const MODEL = "qwen2.5-7b";
const MAX_TOKENS = 512;
const MAX_HISTORY = 6;
const DAILY_LIMIT = 20;
const UPSTREAM = "https://llm.apramodk.com/v1/chat/completions";

export interface Env {
  RATE_LIMIT: KVNamespace;
  LITELLM_KEY: string;
  TURNSTILE_SECRET: string;
}

const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";

    let body: { messages?: unknown; turnstileToken?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "bad request" }, 400);
    }

    if (!body.turnstileToken || !(await verifyTurnstile(body.turnstileToken, ip, env.TURNSTILE_SECRET))) {
      return json({ error: "verification failed" }, 403);
    }

    const key = rateLimitKey(ip, new Date().toISOString());
    const used = parseInt((await env.RATE_LIMIT.get(key)) ?? "0", 10);
    if (used >= DAILY_LIMIT) return json({ error: "daily demo limit reached" }, 429);
    ctx.waitUntil(env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 86400 }));

    const messages = trimMessages(body.messages, MAX_HISTORY);
    if (messages.length === 0) return json({ error: "no messages" }, 400);

    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.LITELLM_KEY}` },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: MAX_TOKENS, stream: true }),
    });

    if (!upstream.ok || !upstream.body) return json({ error: "model unavailable" }, 502);

    return new Response(upstream.body, {
      status: 200,
      headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  },
};
```

- [ ] **Step 4: Set the secrets**

```bash
cd ~/Code/pweb/worker
npx wrangler secret put LITELLM_KEY        # paste the public-demo key from Task 0
npx wrangler secret put TURNSTILE_SECRET   # paste the Turnstile secret key from Task 0
```
Expected: "Success! Uploaded secret ..." for each.

- [ ] **Step 5: Manual integration test with `wrangler dev`**

```bash
cd ~/Code/pweb/worker && npx wrangler dev
```
In another shell (uses Turnstile test secret locally; any token passes):
```bash
curl -s -N -X POST http://localhost:8787 -H "Content-Type: application/json" \
  -d '{"turnstileToken":"x","messages":[{"role":"user","content":"say hi in 3 words"}]}'
```
Expected: a streamed `data: {...}` SSE response ending in `data: [DONE]`.
Then verify guards: missing `turnstileToken` → HTTP 403; send 21 requests → 21st returns 429.

- [ ] **Step 6: Commit**

```bash
cd ~/Code/pweb && git add worker/src/index.ts worker/wrangler.toml
git commit -m "feat(worker): turnstile verify, KV rate limit, streaming proxy"
```

---

## Task 3: Deploy the Worker

**Files:** none (deploy + dashboard).

- [ ] **Step 1: Deploy**

```bash
cd ~/Code/pweb/worker && npx wrangler deploy
```
Expected: prints the deployed `*.workers.dev` URL.

- [ ] **Step 2: Bind the custom domain** — Cloudflare dashboard → Workers & Pages → `chat-api` → Settings → Domains & Routes → add `chat-api.apramodk.com`.

- [ ] **Step 3: Verify the live endpoint** (now requires a REAL Turnstile token, so test the negative path)

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://chat-api.apramodk.com \
  -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hi"}]}'
```
Expected: `403` (no Turnstile token). Full happy-path is verified from the UI in Task 6.

- [ ] **Step 4: No commit** (deploy only).

---

## Task 4: Client streaming helper (TDD)

**Files:**
- Create: `src/lib/chat.ts`, `src/lib/chat.test.ts`

**Interfaces:**
- Produces: `parseSSEChunk(line: string): string | null` and `streamChat(opts): Promise<void>` for the page.

- [ ] **Step 1: Write the failing test**

`src/lib/chat.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseSSEChunk } from "./chat";

describe("parseSSEChunk", () => {
  it("extracts delta content", () => {
    expect(parseSSEChunk('data: {"choices":[{"delta":{"content":"Hi"}}]}')).toBe("Hi");
  });
  it("returns null for [DONE]", () => {
    expect(parseSSEChunk("data: [DONE]")).toBeNull();
  });
  it("returns null for non-data / malformed lines", () => {
    expect(parseSSEChunk(": keep-alive")).toBeNull();
    expect(parseSSEChunk("data: not-json")).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd ~/Code/pweb && npx vitest run src/lib/chat.test.ts`
Expected: FAIL — `parseSSEChunk` not defined.

- [ ] **Step 3: Implement `src/lib/chat.ts`**

```ts
export function parseSSEChunk(line: string): string | null {
  const t = line.trim();
  if (!t.startsWith("data:")) return null;
  const payload = t.slice(5).trim();
  if (payload === "[DONE]") return null;
  try {
    const obj = JSON.parse(payload);
    return obj?.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

export interface StreamOpts {
  endpoint: string;
  messages: { role: string; content: string }[];
  turnstileToken: string;
  onToken: (t: string) => void;
}

export async function streamChat(opts: StreamOpts): Promise<void> {
  const res = await fetch(opts.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: opts.messages, turnstileToken: opts.turnstileToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "request failed" }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const token = parseSSEChunk(line);
      if (token) opts.onToken(token);
    }
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `cd ~/Code/pweb && npx vitest run src/lib/chat.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd ~/Code/pweb && git add src/lib/chat.ts src/lib/chat.test.ts
git commit -m "feat(playground): streaming chat client helper + SSE parse tests"
```

---

## Task 5: The `/playground` page UI

**Files:**
- Create: `src/routes/playground/+page.ts`, `src/routes/playground/+page.svelte`

**Interfaces:**
- Consumes: `streamChat` from `src/lib/chat.ts`; the live Worker at `https://chat-api.apramodk.com`.

- [ ] **Step 1: Prerender flag** — `src/routes/playground/+page.ts`:

```ts
export const prerender = true;
```

- [ ] **Step 2: Build the page** — `src/routes/playground/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { streamChat } from "$lib/chat";

  const ENDPOINT = "https://chat-api.apramodk.com";
  const SITE_KEY = "REPLACE_WITH_TURNSTILE_SITE_KEY";

  type Msg = { role: "user" | "assistant"; content: string };
  let messages: Msg[] = [];
  let input = "";
  let busy = false;
  let error = "";
  let turnstileToken = "";

  onMount(() => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    document.head.appendChild(s);
    (window as any).onTurnstile = (tok: string) => (turnstileToken = tok);
  });

  async function send() {
    if (!input.trim() || busy) return;
    if (!turnstileToken) { error = "Please complete the verification."; return; }
    error = "";
    busy = true;
    messages = [...messages, { role: "user", content: input }, { role: "assistant", content: "" }];
    const sent = input;
    input = "";
    try {
      await streamChat({
        endpoint: ENDPOINT,
        messages: messages.filter((m) => m.content || m.role === "user").map((m) => ({ role: m.role, content: m.content || sent })),
        turnstileToken,
        onToken: (t) => {
          messages[messages.length - 1].content += t;
          messages = messages;
        },
      });
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong.";
      messages = messages.slice(0, -1);
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Playground — chat with my self-hosted LLM</title></svelte:head>

<div class="mx-auto max-w-2xl p-4 flex flex-col gap-4">
  <header>
    <h1 class="text-2xl font-bold">Chat with my self-hosted LLM</h1>
    <p class="text-sm opacity-70">
      This demo runs a fast <b>7B</b> model for snappy replies. I also self-host
      <b>gpt-oss-120B</b> on the same DGX Spark — just not exposed here. Daily limit applies.
    </p>
  </header>

  <div class="flex flex-col gap-3 min-h-[40vh]">
    {#each messages as m}
      <div class="chat {m.role === 'user' ? 'chat-end' : 'chat-start'}">
        <div class="chat-bubble">{m.content}</div>
      </div>
    {/each}
  </div>

  {#if error}<div class="alert alert-error text-sm">{error}</div>{/if}

  <div class="cf-turnstile" data-sitekey={SITE_KEY} data-callback="onTurnstile"></div>

  <form class="flex gap-2" on:submit|preventDefault={send}>
    <input class="input input-bordered flex-1" bind:value={input} placeholder="Ask something…" disabled={busy} />
    <button class="btn btn-primary" disabled={busy || !input.trim()}>{busy ? "…" : "Send"}</button>
  </form>
</div>
```
Replace `REPLACE_WITH_TURNSTILE_SITE_KEY` with the site key from Task 0.

- [ ] **Step 3: Type-check**

Run: `cd ~/Code/pweb && npm run check`
Expected: no errors in `playground/`.

- [ ] **Step 4: Commit**

```bash
cd ~/Code/pweb && git add src/routes/playground/+page.ts src/routes/playground/+page.svelte
git commit -m "feat(playground): chat UI with Turnstile + streaming"
```

---

## Task 6: End-to-end verification

**Files:** none.

- [ ] **Step 1: Run the site locally**

Run: `cd ~/Code/pweb && npm run dev` → open `http://localhost:5173/playground`.

- [ ] **Step 2: Verify the happy path** — complete Turnstile, send a message, confirm tokens stream in live.
- [ ] **Step 3: Verify guards** — send messages until the 20/day limit trips → UI shows "daily demo limit reached"; with the Worker offline, UI shows a friendly error.
- [ ] **Step 4: Verify the key never leaks** — view-source / network tab: confirm no `sk-...` key and no Turnstile *secret* in the client; only the public site key and the Worker URL appear.
- [ ] **Step 5: Confirm prerender** — `npm run build` succeeds with adapter-static (no server-endpoint errors).
- [ ] **Step 6: No commit** (verification only). When satisfied, merge `feat/llm-playground` and let GitHub Pages deploy.

---

## Self-Review Notes

- **Spec coverage:** static-site constraint (Task 5 prerender + build check), Worker proxy w/ key secret (Task 2/3), Turnstile (Task 2/5), per-IP rate limit (Task 2), budget-capped key (Task 0), token/history caps (Task 2 constants), streaming (Task 2/4), CORS lock (Task 2), 7B-only + 120B copy (Task 2 `MODEL`, Task 5 copy) — all covered.
- **Placeholders:** the only intentional `REPLACE_WITH_*` tokens are the KV id, Turnstile site key, and secrets — each has an explicit step that supplies the real value. No logic placeholders.
- **Type consistency:** `trimMessages`/`rateLimitKey` signatures match between Task 1 and Task 2; `parseSSEChunk`/`streamChat` match between Task 4 and Task 5.
- **Testing honesty:** pure helpers are unit-TDD'd (Tasks 1, 4); the I/O-bound parts (Turnstile, streaming proxy, UI) are integration/manually verified (Tasks 2, 6), which is the appropriate test level for a thin streaming proxy + UI.
