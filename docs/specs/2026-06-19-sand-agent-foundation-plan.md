# Sand — Agent Foundation v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-driven, traced agent tool-loop to Sand (the playground), shipping one tool (`web_search`), so the model can do multi-step tool use and every step is visible.

**Architecture:** The browser is the agent controller: it calls the Worker for each model turn (non-streaming, `tools` forwarded to the 120B), runs any requested tool by calling the Worker's tool-exec mode (Tavily stays server-side), appends results, and loops up to 6 steps. Each step is recorded into a `Trace` stored inline on the assistant message and shown in an expandable viewer. The Spark only ever runs inference.

**Tech Stack:** SvelteKit (adapter-static), TypeScript, Cloudflare Worker (`chat-api`), Workers KV, Tavily, Supabase (existing), Vitest.

## Global Constraints

- Product name in user-facing copy is **Sand**.
- Agent mode uses model **`gpt-oss-120b`** only (the 7B's tool-calling via Ollama is unreliable).
- Agent loop hard cap: **6 steps** (`MAX_STEPS = 6`).
- An agent **run** counts as **one** rate-limit unit (dedup via `runId`); anon cap 5/day, signed-in 50/day.
- Tavily key (`TAVILY_API_KEY`) and LiteLLM key (`LITELLM_KEY`) stay server-side (Worker only); never in the browser bundle.
- Do NOT add dependencies with `npm` — it desyncs `pnpm-lock.yaml` and breaks GitHub Pages CI (`pnpm install --frozen-lockfile`). Use `pnpm`/`corepack pnpm`.
- Non-agent chat (existing streaming + 🔎 RAG search) must keep working unchanged.
- Worker upstream: `https://llm.apramodk.com/v1/chat/completions`. UI endpoint: `https://chat-api.apramodk.com`.

---

### Task 1: Repair the frontend test runner

**Files:**
- Modify: `package.json` (root) — pin `vitest`, add a `test` script.
- Test: `src/lib/chat.test.ts` (existing — must become runnable).

**Interfaces:**
- Consumes: nothing.
- Produces: a working `pnpm test` at repo root so later tasks can TDD `src/lib/*`.

- [ ] **Step 1: Pin vitest to a vite@5-compatible major (via pnpm, keeps lockfile in sync)**

Run:
```bash
corepack pnpm add -D vitest@^2.1.9
```
Expected: installs vitest 2.x, updates `package.json` + `pnpm-lock.yaml` together.

- [ ] **Step 2: Add a root `test` script**

In `package.json`, add to `"scripts"` (after `"format"`):
```json
"test": "vitest run",
```

- [ ] **Step 3: Run the existing frontend test to confirm the runner works**

Run:
```bash
corepack pnpm test src/lib/chat.test.ts
```
Expected: PASS — 3 tests in `parseSSEChunk` pass (previously crashed with `ERR_PACKAGE_PATH_NOT_EXPORTED`).

- [ ] **Step 4: Confirm the build still works (lockfile sanity for CI)**

Run:
```bash
corepack pnpm install --frozen-lockfile && corepack pnpm build
```
Expected: install reports lockfile up to date; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: pin vitest to ^2 so frontend tests run (vite@5 compat)"
```

---

### Task 2: Tool registry (`src/lib/tools.ts`)

**Files:**
- Create: `src/lib/tools.ts`
- Test: `src/lib/tools.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `TOOLS: ToolSchema[]` — OpenAI tool schemas (v1: one `web_search`).
  - `summarizeResult(result: string, max?: number): string`
  - `executeTool(name: string, args: Record<string, unknown>, opts: { endpoint: string; runId: string }): Promise<string>`
  - type `ToolSchema`

- [ ] **Step 1: Write the failing test**

Create `src/lib/tools.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TOOLS, summarizeResult, executeTool } from './tools';

afterEach(() => vi.restoreAllMocks());

describe('TOOLS', () => {
  it('exposes a web_search function tool with a query param', () => {
    const ws = TOOLS.find((t) => t.function.name === 'web_search');
    expect(ws).toBeTruthy();
    expect(ws!.function.parameters.required).toContain('query');
  });
});

describe('summarizeResult', () => {
  it('collapses whitespace and truncates with an ellipsis', () => {
    expect(summarizeResult('a\n\n  b')).toBe('a b');
    expect(summarizeResult('x'.repeat(500), 10)).toBe('xxxxxxxxxx…');
  });
});

describe('executeTool', () => {
  it('posts the tool call and returns the result string', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ result: 'hits' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const out = await executeTool('web_search', { query: 'gpus' }, { endpoint: 'https://e', runId: 'r1' });
    expect(out).toBe('hits');
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({ tool: 'web_search', args: { query: 'gpus' }, runId: 'r1' });
  });

  it('returns a readable error string on non-ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'nope' }), { status: 500 })));
    expect(await executeTool('web_search', {}, { endpoint: 'https://e', runId: 'r1' })).toBe('Tool error: nope');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `corepack pnpm test src/lib/tools.test.ts`
Expected: FAIL — cannot import from `./tools` (file doesn't exist).

- [ ] **Step 3: Implement `src/lib/tools.ts`**

```ts
// Tool registry for Sand's agent loop. v1 ships one tool: web_search.
// Tools that need secrets (the Tavily key) run in the Worker; the browser only orchestrates.

export type ToolSchema = {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

export const TOOLS: ToolSchema[] = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for current information. Returns titled snippets with URLs.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'The search query.' } },
        required: ['query']
      }
    }
  }
];

// Shorten a tool result for the trace viewer.
export function summarizeResult(result: string, max = 280): string {
  const s = result.trim().replace(/\s+/g, ' ');
  return s.length > max ? s.slice(0, max) + '…' : s;
}

// Execute a tool via the Worker's tool-exec endpoint (keeps API keys server-side).
// Returns the tool's text result, or a readable error string the model can act on.
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  opts: { endpoint: string; runId: string }
): Promise<string> {
  try {
    const res = await fetch(opts.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: name, args, runId: opts.runId })
    });
    if (!res.ok) {
      const e = (await res.json().catch(() => ({}))) as { error?: string };
      return `Tool error: ${e.error ?? res.status}`;
    }
    const data = (await res.json()) as { result?: string };
    return data.result ?? '';
  } catch (e) {
    return `Tool error: ${e instanceof Error ? e.message : 'failed'}`;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `corepack pnpm test src/lib/tools.test.ts`
Expected: PASS — all 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tools.ts src/lib/tools.test.ts
git commit -m "feat: tool registry (web_search) for Sand agent loop"
```

---

### Task 3: Agent loop controller (`src/lib/agent.ts`)

**Files:**
- Create: `src/lib/agent.ts`
- Test: `src/lib/agent.test.ts`

**Interfaces:**
- Consumes: `TOOLS`, `executeTool`, `summarizeResult` from `./tools` (Task 2).
- Produces:
  - types `AgentMsg`, `RawToolCall`, `ParsedToolCall`, `TraceStep`, `Trace`, `RunAgentOpts`, `RunAgentResult`
  - `parseToolCalls(message: AgentMsg | undefined): ParsedToolCall[]`
  - `nextAction(message: AgentMsg | undefined, step: number, maxSteps?: number): { kind: 'tool' | 'final' | 'stop' }`
  - `runAgent(opts: RunAgentOpts): Promise<RunAgentResult>` (sends `{ agent:true, messages, tools, model, turnstileToken, accessToken, runId }` per model turn)
  - `MAX_STEPS = 6`

- [ ] **Step 1: Write the failing test**

Create `src/lib/agent.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseToolCalls, nextAction, runAgent, type AgentMsg } from './agent';

afterEach(() => vi.restoreAllMocks());

const callMsg = (name: string, args: string): AgentMsg => ({
  role: 'assistant',
  content: null,
  tool_calls: [{ id: 'c1', function: { name, arguments: args } }]
});

describe('parseToolCalls', () => {
  it('extracts id, name, and parsed args', () => {
    expect(parseToolCalls(callMsg('web_search', '{"query":"x"}'))).toEqual([
      { id: 'c1', name: 'web_search', args: { query: 'x' } }
    ]);
  });
  it('defaults to empty args on malformed JSON', () => {
    expect(parseToolCalls(callMsg('web_search', 'not json'))[0].args).toEqual({});
  });
  it('returns [] when there are no tool calls', () => {
    expect(parseToolCalls({ role: 'assistant', content: 'hi' })).toEqual([]);
  });
});

describe('nextAction', () => {
  it('finalizes when the model returns content with no tool calls', () => {
    expect(nextAction({ role: 'assistant', content: 'done' }, 0).kind).toBe('final');
  });
  it('runs tools when requested and steps remain', () => {
    expect(nextAction(callMsg('web_search', '{}'), 0, 6).kind).toBe('tool');
  });
  it('stops when tool calls arrive on the last allowed step', () => {
    expect(nextAction(callMsg('web_search', '{}'), 5, 6).kind).toBe('stop');
  });
});

describe('runAgent', () => {
  it('loops model -> tool -> model and returns final content + trace', async () => {
    const responses = [
      // turn 1: model asks for a search
      new Response(JSON.stringify({ choices: [{ message: callMsg('web_search', '{"query":"spark"}') }], usage: { prompt_tokens: 10, completion_tokens: 5 } }), { status: 200 }),
      // tool-exec result
      new Response(JSON.stringify({ result: '[1] DGX Spark ...' }), { status: 200 }),
      // turn 2: model answers
      new Response(JSON.stringify({ choices: [{ message: { role: 'assistant', content: 'The Spark is fast.' } }], usage: { prompt_tokens: 20, completion_tokens: 6 } }), { status: 200 })
    ];
    let i = 0;
    vi.stubGlobal('fetch', vi.fn(async () => responses[i++]));

    const res = await runAgent({
      endpoint: 'https://e',
      messages: [{ role: 'user', content: 'tell me about the spark' }],
      model: 'gpt-oss-120b',
      turnstileToken: 'tok'
    });

    expect(res.content).toBe('The Spark is fast.');
    expect(res.trace.status).toBe('ok');
    expect(res.trace.steps.map((s) => s.type)).toEqual(['model', 'tool', 'model']);
    const tool = res.trace.steps.find((s) => s.type === 'tool') as Extract<typeof res.trace.steps[number], { type: 'tool' }>;
    expect(tool.name).toBe('web_search');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `corepack pnpm test src/lib/agent.test.ts`
Expected: FAIL — cannot import from `./agent`.

- [ ] **Step 3: Implement `src/lib/agent.ts`**

```ts
import { TOOLS, executeTool, summarizeResult } from './tools';

export type RawToolCall = { id?: string; function?: { name?: string; arguments?: string } };
export type AgentMsg = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  tool_calls?: RawToolCall[];
  tool_call_id?: string;
};
export type ParsedToolCall = { id: string; name: string; args: Record<string, unknown> };

export type TraceStep =
  | { type: 'model'; ms: number; toolCalls: { name: string; args: string }[]; promptTokens?: number; completionTokens?: number }
  | { type: 'tool'; name: string; args: string; result: string; ms: number };
export type Trace = { model: string; status: 'ok' | 'step_limit' | 'error'; steps: TraceStep[] };

export const MAX_STEPS = 6;

// Pull tool calls out of an assistant message; tolerant of malformed JSON args.
export function parseToolCalls(message: AgentMsg | undefined): ParsedToolCall[] {
  const calls = message?.tool_calls;
  if (!Array.isArray(calls)) return [];
  const out: ParsedToolCall[] = [];
  for (let i = 0; i < calls.length; i++) {
    const name = calls[i]?.function?.name;
    if (!name) continue;
    let args: Record<string, unknown> = {};
    try {
      const raw = calls[i].function?.arguments;
      args = raw ? JSON.parse(raw) : {};
    } catch {
      args = {};
    }
    out.push({ id: calls[i].id ?? `call_${i}`, name, args });
  }
  return out;
}

// Decide what to do after a model turn.
export function nextAction(
  message: AgentMsg | undefined,
  step: number,
  maxSteps = MAX_STEPS
): { kind: 'tool' | 'final' | 'stop' } {
  if (parseToolCalls(message).length === 0) return { kind: 'final' };
  if (step >= maxSteps - 1) return { kind: 'stop' };
  return { kind: 'tool' };
}

export type RunAgentOpts = {
  endpoint: string;
  messages: { role: string; content: string }[];
  model: string;
  turnstileToken: string;
  accessToken?: string;
  onStatus?: (s: string) => void;
};
export type RunAgentResult = { content: string; trace: Trace };

function uuid(): string {
  return (crypto as { randomUUID?: () => string })?.randomUUID?.() ?? 'r' + Date.now() + Math.random().toString(16).slice(2);
}

async function modelTurn(opts: RunAgentOpts, convo: AgentMsg[], runId: string) {
  const res = await fetch(opts.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: true,
      messages: convo,
      tools: TOOLS,
      model: opts.model,
      turnstileToken: opts.turnstileToken,
      accessToken: opts.accessToken,
      runId
    })
  });
  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(e.error ?? `HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: AgentMsg }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  return { message: data.choices?.[0]?.message ?? { role: 'assistant' as const, content: '' }, usage: data.usage };
}

// Drive the agent loop in the browser. The Spark only runs inference (via the Worker).
export async function runAgent(opts: RunAgentOpts): Promise<RunAgentResult> {
  const runId = uuid();
  const convo: AgentMsg[] = opts.messages.map((m) => ({ role: m.role as AgentMsg['role'], content: m.content }));
  const trace: Trace = { model: opts.model, status: 'ok', steps: [] };

  for (let step = 0; step < MAX_STEPS; step++) {
    opts.onStatus?.(step === 0 ? 'Thinking…' : 'Reasoning…');
    const t0 = Date.now();
    let message: AgentMsg;
    let usage: { prompt_tokens?: number; completion_tokens?: number } | undefined;
    try {
      ({ message, usage } = await modelTurn(opts, convo, runId));
    } catch (e) {
      trace.status = 'error';
      throw Object.assign(e instanceof Error ? e : new Error('agent failed'), { trace });
    }
    const calls = parseToolCalls(message);
    trace.steps.push({
      type: 'model',
      ms: Date.now() - t0,
      toolCalls: calls.map((c) => ({ name: c.name, args: JSON.stringify(c.args) })),
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens
    });

    const action = nextAction(message, step);
    if (action.kind === 'final') return { content: message.content ?? '', trace };
    if (action.kind === 'stop') {
      trace.status = 'step_limit';
      return { content: message.content ?? '_(reached the step limit before finishing.)_', trace };
    }

    convo.push({ role: 'assistant', content: message.content ?? null, tool_calls: message.tool_calls });
    for (const call of calls) {
      opts.onStatus?.(
        call.name === 'web_search' ? `🔎 Searching: ${(call.args.query as string) ?? ''}` : `Running ${call.name}…`
      );
      const tt0 = Date.now();
      const result = await executeTool(call.name, call.args, { endpoint: opts.endpoint, runId });
      trace.steps.push({
        type: 'tool',
        name: call.name,
        args: JSON.stringify(call.args),
        result: summarizeResult(result),
        ms: Date.now() - tt0
      });
      convo.push({ role: 'tool', tool_call_id: call.id, content: result });
    }
  }
  trace.status = 'step_limit';
  return { content: '_(reached the step limit before finishing.)_', trace };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `corepack pnpm test src/lib/agent.test.ts`
Expected: PASS — all tests including the model→tool→model loop.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agent.ts src/lib/agent.test.ts
git commit -m "feat: browser-driven agent loop with inline tracing"
```

---

### Task 4: Worker — agent model turn + tool exec + run-scoped rate limit

**Files:**
- Modify: `worker/src/index.ts`
- Test: `worker/test/agent.test.ts` (create)

**Interfaces:**
- Consumes: existing `webSearch`, `verifyTurnstile`, `getUserId`, `rateLimitKey`, `MODELS`, `UPSTREAM`, `Msg` (all already in `worker/src/index.ts`).
- Produces (exported for tests):
  - `prepareAgentMessages(messages: unknown, max?: number): AgentMessage[]`
  - `runMarkerKey(runId: string): string`
  - type `AgentMessage = { role: string; content: string | null; tool_calls?: unknown; tool_call_id?: string }`

- [ ] **Step 1: Write the failing test**

Create `worker/test/agent.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { prepareAgentMessages, runMarkerKey } from '../src/index';

describe('runMarkerKey', () => {
  it('namespaces the run id', () => {
    expect(runMarkerKey('abc')).toBe('run:abc');
  });
});

describe('prepareAgentMessages', () => {
  it('keeps tool role, tool_call_id, and assistant tool_calls', () => {
    const out = prepareAgentMessages([
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: null, tool_calls: [{ id: 'c1' }] },
      { role: 'tool', tool_call_id: 'c1', content: 'res' }
    ]);
    expect(out).toHaveLength(3);
    expect(out[1].tool_calls).toEqual([{ id: 'c1' }]);
    expect(out[2].tool_call_id).toBe('c1');
    expect(out[1].content).toBeNull();
  });
  it('drops entries with disallowed roles', () => {
    expect(prepareAgentMessages([{ role: 'robot', content: 'x' }, { role: 'user', content: 'y' }])).toHaveLength(1);
  });
  it('caps to the last `max` messages', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ role: 'user', content: `m${i}` }));
    expect(prepareAgentMessages(many, 16)).toHaveLength(16);
  });
  it('returns [] for non-arrays', () => {
    expect(prepareAgentMessages(null)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd worker && corepack pnpm test test/agent.test.ts`
Expected: FAIL — `prepareAgentMessages` / `runMarkerKey` not exported.

- [ ] **Step 3: Add constants + helpers in `worker/src/index.ts`**

After the existing constants block (right after the line `const USER_LIMIT = 50;`), add:
```ts
const AGENT_MODEL = "gpt-oss-120b";
const AGENT_MAX_HISTORY = 16; // agent convos include tool + assistant-tool_call messages
const AGENT_ROLES = new Set(["user", "assistant", "system", "tool"]);
const RUN_TTL = 600; // seconds an agent run stays authorized
```

After the `getUserId` function (before `export default`), add:
```ts
export type AgentMessage = {
  role: string;
  content: string | null;
  tool_calls?: unknown;
  tool_call_id?: string;
};

// KV marker key proving a runId has been verified + counted once.
export function runMarkerKey(runId: string): string {
  return `run:${runId}`;
}

// Like trimMessages but preserves the agent roles/fields (tool, tool_calls, null content).
export function prepareAgentMessages(messages: unknown, max = AGENT_MAX_HISTORY): AgentMessage[] {
  if (!Array.isArray(messages)) return [];
  const out: AgentMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    if (typeof role !== "string" || !AGENT_ROLES.has(role)) continue;
    const content = (m as { content?: unknown }).content;
    const msg: AgentMessage = {
      role,
      content: typeof content === "string" ? content : content == null ? null : String(content),
    };
    const tc = (m as { tool_calls?: unknown }).tool_calls;
    if (Array.isArray(tc)) msg.tool_calls = tc;
    const tcid = (m as { tool_call_id?: unknown }).tool_call_id;
    if (typeof tcid === "string") msg.tool_call_id = tcid;
    out.push(msg);
  }
  return out.slice(-max);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd worker && corepack pnpm test test/agent.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Widen the request body type**

In `worker/src/index.ts`, replace the `body` type annotation inside `fetch`:
```ts
    let body: { messages?: unknown; turnstileToken?: string; search?: boolean; model?: string; accessToken?: string };
```
with:
```ts
    let body: {
      messages?: unknown;
      turnstileToken?: string;
      search?: boolean;
      model?: string;
      accessToken?: string;
      agent?: boolean;
      tools?: unknown;
      runId?: string;
      tool?: string;
      args?: { query?: string };
    };
```

- [ ] **Step 6: Add the tool-exec + agent branches**

In `worker/src/index.ts`, immediately after the JSON-parse block (the lines ending with `return json({ error: "bad request" }, 400);\n    }`) and BEFORE the existing `if (!body.turnstileToken ...)` line, insert:
```ts
    // ---- Tool execution (part of an already-authorized agent run) ----
    if (typeof body.tool === "string") {
      if (!body.runId || !(await env.RATE_LIMIT.get(runMarkerKey(body.runId)))) {
        return json({ error: "unauthorized run" }, 403);
      }
      if (body.tool === "web_search") {
        const query = typeof body.args?.query === "string" ? body.args.query : "";
        const result = query && env.TAVILY_API_KEY ? await webSearch(query, env.TAVILY_API_KEY) : "";
        return json({ result: result || "No results found." }, 200);
      }
      return json({ error: "unknown tool" }, 400);
    }

    // ---- Agent model turn (non-streaming; forwards tools to the 120B) ----
    if (body.agent === true) {
      const runId = typeof body.runId === "string" ? body.runId : "";
      if (!runId) return json({ error: "missing runId" }, 400);

      // First turn of a run: verify Turnstile + rate-limit once; later turns ride the marker.
      const firstTurn = !(await env.RATE_LIMIT.get(runMarkerKey(runId)));
      if (firstTurn) {
        if (!body.turnstileToken || !(await verifyTurnstile(body.turnstileToken, ip, env.TURNSTILE_SECRET))) {
          return json({ error: "verification failed" }, 403);
        }
        let uid: string | null = null;
        if (typeof body.accessToken === "string" && body.accessToken) uid = await getUserId(body.accessToken);
        const limit = uid ? USER_LIMIT : ANON_LIMIT;
        const key = rateLimitKey(uid ? `user:${uid}` : `ip:${ip}`, new Date().toISOString());
        const used = parseInt((await env.RATE_LIMIT.get(key)) ?? "0", 10);
        if (used >= limit) {
          return json({ error: uid ? "daily limit reached" : "daily limit reached — sign in for more" }, 429);
        }
        ctx.waitUntil(env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 86400 }));
        ctx.waitUntil(env.RATE_LIMIT.put(runMarkerKey(runId), "1", { expirationTtl: RUN_TTL }));
      }

      const agentMsgs = prepareAgentMessages(body.messages);
      if (agentMsgs.length === 0) return json({ error: "no messages" }, 400);

      const agentSystem: Msg = {
        role: "system",
        content:
          "You are Sand, a helpful agent with tools. Use the web_search tool when the question needs current or factual information you are unsure about. After using tools, answer concisely in GitHub-flavored Markdown and cite sources inline as [1], [2]. Do NOT wrap your whole reply in a code block.",
      };
      const cfg = MODELS[AGENT_MODEL];
      const payload: Record<string, unknown> = {
        model: AGENT_MODEL,
        messages: [agentSystem, ...agentMsgs],
        max_tokens: cfg.maxTokens,
        tool_choice: "auto",
        stream: false,
      };
      if (Array.isArray(body.tools)) payload.tools = body.tools;
      if (cfg.reasoningEffort) payload.reasoning_effort = cfg.reasoningEffort;

      const upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.LITELLM_KEY}` },
        body: JSON.stringify(payload),
      });
      if (!upstream.ok) return json({ error: "model unavailable" }, 502);
      const data = await upstream.json();
      return json(data, 200);
    }

```
(The existing streaming-chat code below this point is unchanged and remains the fallback for non-agent requests.)

- [ ] **Step 7: Run the worker test suite (no regressions)**

Run: `cd worker && corepack pnpm test`
Expected: PASS — existing `auth.test.ts` (4) + `helpers.test.ts` (4) + new `agent.test.ts` (5) = 13.

- [ ] **Step 8: Commit**

```bash
git add worker/src/index.ts worker/test/agent.test.ts
git commit -m "feat: worker agent model-turn + tool-exec with run-scoped rate limit"
```

---

### Task 5: UI — Agent toggle, run wiring, trace viewer, Sand branding

**Files:**
- Modify: `src/lib/chatStore.ts` (extend `Msg` with optional `trace`)
- Modify: `src/routes/playground/+page.svelte`

**Interfaces:**
- Consumes: `runAgent`, type `Trace` from `$lib/agent` (Task 3).
- Produces: agent-mode chat path + trace viewer in the playground; no new exports.

- [ ] **Step 1: Extend the persisted `Msg` type**

In `src/lib/chatStore.ts`, replace:
```ts
import { supabase } from './supabase';

export type Msg = { role: 'user' | 'assistant'; content: string };
```
with:
```ts
import { supabase } from './supabase';
import type { Trace } from './agent';

export type Msg = { role: 'user' | 'assistant'; content: string; trace?: Trace };
```
(`messages` persists as JSON in both stores, so the extra field rides along with no schema change.)

- [ ] **Step 2: Import runAgent + Trace, add agent state, in `+page.svelte`**

In the `<script>` block of `src/routes/playground/+page.svelte`, change:
```ts
    import { streamChat } from '$lib/chat';
```
to:
```ts
    import { streamChat } from '$lib/chat';
    import { runAgent, type Trace } from '$lib/agent';
```

Change the local `Msg` type:
```ts
    type Msg = { role: 'user' | 'assistant'; content: string };
```
to:
```ts
    type Msg = { role: 'user' | 'assistant'; content: string; trace?: Trace };
```

Add state next to `let searchOn = true;`:
```ts
    let agentOn = false;
    let agentStatus = '';
```

Add a reactive line after the `let store: ChatStore = localStore;` line:
```ts
    // Agent mode runs on the 120B (reliable tool-calling).
    $: if (agentOn) model = 'gpt-oss-120b';
```

- [ ] **Step 3: Branch `send()` into agent vs streaming**

In `src/routes/playground/+page.svelte`, replace the whole `try { await streamChat({ ... }); }` block inside `send()` (from `try {` through its matching `} catch (e) {` ... `}` `finally { ... }`) with:
```ts
        try {
            if (agentOn) {
                agentStatus = 'Thinking…';
                const { content, trace } = await runAgent({
                    endpoint: ENDPOINT,
                    messages: payload,
                    model: 'gpt-oss-120b',
                    turnstileToken,
                    accessToken: session?.access_token,
                    onStatus: (s) => (agentStatus = s)
                });
                messages[messages.length - 1] = { role: 'assistant', content, trace };
                messages = messages;
            } else {
                await streamChat({
                    endpoint: ENDPOINT,
                    messages: payload,
                    turnstileToken,
                    model,
                    search: searchOn,
                    accessToken: session?.access_token,
                    onToken: (t) => {
                        messages[messages.length - 1].content += t;
                        messages = messages;
                    }
                });
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'Something went wrong.';
            messages = messages.slice(0, -1);
        } finally {
            busy = false;
            agentStatus = '';
            turnstileToken = '';
            (window as any).turnstile?.reset?.();
            await saveCurrent();
        }
```

- [ ] **Step 4: Add the Agent toggle button in the composer**

In `src/routes/playground/+page.svelte`, directly BEFORE the existing 🔎 search `<button ... title="Web search">🔎</button>`, insert:
```svelte
                    <button
                        type="button"
                        class="tool"
                        class:on={agentOn}
                        on:click={() => (agentOn = !agentOn)}
                        aria-pressed={agentOn}
                        title="Agent mode (multi-step tools, 120B)"
                        aria-label="Toggle agent mode"
                    >🤖</button>
```
And on the 🔎 button, add `disabled={agentOn}` (the agent has its own web_search tool):
```svelte
                    <button
                        type="button"
                        class="tool"
                        class:on={searchOn}
                        on:click={() => (searchOn = !searchOn)}
                        aria-pressed={searchOn}
                        disabled={agentOn}
                        title="Web search"
                        aria-label="Toggle web search"
                    >🔎</button>
```

- [ ] **Step 5: Show agent status in the waiting indicator**

In `src/routes/playground/+page.svelte`, replace the `{#if waiting}` block:
```svelte
                    {#if waiting}
                        <div class="row assistant">
                            {#if searchOn}
                                <div class="bubble assistant searching">🔎 Searching the web…</div>
                            {:else}
                                <div class="bubble assistant typing" aria-label="typing">
                                    <span></span><span></span><span></span>
                                </div>
                            {/if}
                        </div>
                    {/if}
```
with:
```svelte
                    {#if waiting}
                        <div class="row assistant">
                            {#if agentOn}
                                <div class="bubble assistant searching">{agentStatus || 'Thinking…'}</div>
                            {:else if searchOn}
                                <div class="bubble assistant searching">🔎 Searching the web…</div>
                            {:else}
                                <div class="bubble assistant typing" aria-label="typing">
                                    <span></span><span></span><span></span>
                                </div>
                            {/if}
                        </div>
                    {/if}
```

- [ ] **Step 6: Render the trace viewer under agent answers**

In `src/routes/playground/+page.svelte`, find the assistant bubble render:
```svelte
                                {#if m.role === 'assistant'}
                                    <div class="bubble assistant md">{@html renderMd(m.content)}</div>
                                {:else}
                                    <div class="bubble user">{m.content}</div>
                                {/if}
```
Replace it with (wrap the assistant branch so the trace renders beneath the bubble):
```svelte
                                {#if m.role === 'assistant'}
                                    <div class="agent-col">
                                        <div class="bubble assistant md">{@html renderMd(m.content)}</div>
                                        {#if m.trace}
                                            <details class="trace">
                                                <summary>
                                                    🛠 {m.trace.steps.filter((s) => s.type === 'tool').length} tool call(s)
                                                    · {m.trace.status}
                                                </summary>
                                                <ol>
                                                    {#each m.trace.steps as s}
                                                        {#if s.type === 'model'}
                                                            <li>
                                                                🧠 model{s.toolCalls.length ? ` → ${s.toolCalls.map((t) => t.name).join(', ')}` : ' → answer'}
                                                                <span class="ms">{s.ms}ms</span>
                                                            </li>
                                                        {:else}
                                                            <li>
                                                                🔧 <b>{s.name}</b> <code>{s.args}</code>
                                                                <span class="ms">{s.ms}ms</span>
                                                                <div class="tres">{s.result}</div>
                                                            </li>
                                                        {/if}
                                                    {/each}
                                                </ol>
                                            </details>
                                        {/if}
                                    </div>
                                {:else}
                                    <div class="bubble user">{m.content}</div>
                                {/if}
```

- [ ] **Step 7: Add trace + Sand styles**

In the `<style>` block of `src/routes/playground/+page.svelte`, add (anywhere among the rules, e.g. after the `.delivered` rule):
```css
    .agent-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        max-width: 100%;
    }
    .trace {
        margin: 0.25rem 0 0.1rem;
        font-size: 0.78rem;
        color: #6b6b70;
        max-width: 100%;
    }
    .trace summary {
        cursor: pointer;
        list-style: none;
        padding: 0.2rem 0.1rem;
        user-select: none;
    }
    .trace ol {
        margin: 0.3rem 0 0;
        padding-left: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .trace code {
        background: rgba(0, 0, 0, 0.06);
        border-radius: 4px;
        padding: 0 0.25em;
        font-size: 0.92em;
        overflow-wrap: anywhere;
    }
    .trace .ms {
        color: #a0a0a6;
        margin-left: 0.35rem;
    }
    .trace .tres {
        margin-top: 0.15rem;
        color: #8a8a90;
        font-style: italic;
        overflow-wrap: anywhere;
    }
    @media (prefers-color-scheme: dark) {
        .trace,
        .trace .tres {
            color: #9a9aa0;
        }
        .trace code {
            background: rgba(255, 255, 255, 0.1);
        }
    }
```

- [ ] **Step 8: Sand branding (title, hero)**

In `src/routes/playground/+page.svelte`, update `<svelte:head>`:
```svelte
    <title>Sand — chat with my self-hosted LLM</title>
    <meta property="og:title" content="Sand — Akash Pramod Kumar" />
    <meta
        property="og:description"
        content="Sand: a self-hosted LLM agent harness running on my DGX Spark."
    />
```
Update the hero avatar and heading in the empty state:
```svelte
                    <div class="hero-avatar" aria-hidden="true">S</div>
                    <h1>Sand</h1>
                    <p>
                        A chat + agent harness on my own DGX Spark. Pick the fast <b>7B</b> or the
                        <b>120B</b> up top; toggle 🔎 web search or 🤖 agent mode in the box below.
                    </p>
```

- [ ] **Step 9: Typecheck and build**

Run:
```bash
corepack pnpm check && corepack pnpm build
```
Expected: `svelte-check` reports 0 errors; build succeeds (adapter-static emits `build/`).

- [ ] **Step 10: Manual smoke test (local preview)**

Run:
```bash
corepack pnpm preview
```
Then in the browser at the preview URL `/playground`: confirm the 🤖 toggle appears, the title reads "Sand", and a normal (non-agent) message still streams. (Full agent E2E needs the deployed Worker — covered in Task 6.)

- [ ] **Step 11: Commit**

```bash
git add src/lib/chatStore.ts src/routes/playground/+page.svelte
git commit -m "feat: Sand agent mode UI — toggle, run wiring, trace viewer, branding"
```

---

### Task 6: Ship it — deploy Worker, deploy site, live verify

**Files:** none (deploy + verification).

**Interfaces:**
- Consumes: everything above.
- Produces: live agent mode at `https://apramodk.com/playground`.

- [ ] **Step 1: Full test sweep**

Run:
```bash
corepack pnpm test && (cd worker && corepack pnpm test)
```
Expected: all frontend + worker tests pass.

- [ ] **Step 2: Deploy the Worker**

Run (uses the existing Cloudflare API token from the environment):
```bash
cd worker && CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" corepack pnpm exec wrangler deploy
```
Expected: deploy succeeds, prints the `chat-api.apramodk.com` route. (Existing Worker secrets `LITELLM_KEY`, `TURNSTILE_SECRET`, `TAVILY_API_KEY` are already set — no secret changes in this release.)

- [ ] **Step 3: Live tool-loop check against the deployed Worker**

With the local preview (`corepack pnpm preview`) pointed at the live `ENDPOINT`, in `/playground`: turn ON 🤖, ask *"What's new with the NVIDIA DGX Spark this week?"*. Expect the status to show "🔎 Searching…", a final answer that cites `[1]`/`[2]`, and an expandable trace showing `model → web_search → model`. If the 120B returns an answer with **no** `web_search` step, note it: tool-calling reliability is model-dependent and the loop degrades gracefully to a direct answer.

- [ ] **Step 4: Merge to main → trigger Pages deploy**

```bash
git checkout main
git merge --no-ff feat/sand-agent -m "feat: Sand agent foundation v1 (traced web_search loop)"
git push origin main
```
Expected: GitHub Pages CI runs `pnpm install --frozen-lockfile && pnpm build` and deploys. Watch it:
```bash
gh run watch
```

- [ ] **Step 5: Verify production**

Open `https://apramodk.com/playground`: confirm "Sand" branding, the 🤖 toggle, a non-agent message still streams, and an agent message produces a trace. Done.

---

## Notes / deliberate deviations from the spec
- **Inline trace (not a `traces` table):** the run's `Trace` is stored on the assistant `Msg` and persists with the chat JSON (local + Supabase, no migration, works for anonymous users). A standalone `traces` table for cross-run analytics is deferred to phase 3.
- **Agent turns are non-streaming:** each model turn returns full JSON so tool_calls are read cleanly; the final answer appears at once (with a live status line) rather than token-streaming. Token-streaming the final turn is a v1.1 nicety. Non-agent chat still streams exactly as before.
- **`run_js` / `fetch_url`** tools are intentionally out of scope (v1.1); the registry + loop already accommodate them.
