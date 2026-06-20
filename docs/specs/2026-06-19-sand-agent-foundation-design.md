# Sand — Agent Foundation v1 — Design

**Date:** 2026-06-19
**Status:** Approved (design), pending implementation plan

## Summary
Turn the playground into **Sand**, a real harness, by adding a **client-side, traced agent loop**: the browser drives a bounded multi-step loop where the model can call tools (v1 ships one tool, `web_search`), and every step is logged to Supabase and viewable in the UI. The Spark stays dedicated to inference; all orchestration runs in the browser. This is phase 1 of the roadmap (personal daily-driver → agent platform → public product).

## Goals
- A bounded (~6-step) agent loop the **browser** orchestrates: model → tool_call → execute → model → … → final answer.
- One real tool end-to-end: **`web_search`** (reuse the existing Tavily path, key stays in the Worker).
- **Observability:** every step (model turn, tool name/args/result, timing, token usage) logged to a Supabase `traces` table (RLS per user) and shown in a **trace viewer** in Sand.
- Agent mode defaults to **gpt-oss-120b** (the 7B's tool-calling via Ollama is too unreliable).
- An agent *run* counts as **one** rate-limit unit (not per model turn).
- Light branding pass: surface the name **Sand** in the UI.

## Non-goals (YAGNI / later)
- `fetch_url` and `run_js` tools → v1.1 (the loop is built to add them trivially).
- Server-side agent runtime (kept off the Spark deliberately).
- Multi-user agent sharing, scheduled/background agents, agent marketplace.

## Architecture
```
browser (Sand) = agent controller
  runAgent(messages):
    loop (max 6 steps):
      POST {messages, tools, model:'gpt-oss-120b', agent:true, runId} → Worker → LiteLLM/120B
        • model returns tool_calls → for each: POST {tool, args, runId} → Worker executes → append tool result → loop
        • model returns final answer → stream it → done
    each step → append to in-memory trace → persist trace row to Supabase
  Spark only ever runs model inference (via existing LiteLLM gateway).

Worker (chat-api) gains:
  • model-turn mode: forward OpenAI `tools` to the model; return tool_calls (JSON) or stream final content
  • tool-exec mode: {tool:'web_search', args:{query}} → run Tavily (key server-side) → return results
  • rate limit: increment the daily counter once per runId (KV marker `run:<id>`, TTL ~10m), so a multi-turn run = 1 unit
```

## Components / files
- `src/lib/tools.ts` — tool registry: OpenAI tool schema(s) (`web_search`) + a browser-side `executeTool(name, args)` that calls the Worker's tool-exec mode.
- `src/lib/agent.ts` — the loop controller `runAgent(opts)`: drives turns, parses tool_calls, calls tools, emits trace steps + the streamed final answer via callbacks. Pure state machine where possible (testable).
- `src/lib/traces.ts` — Supabase `traces` CRUD: `saveTrace(trace)`, `listTraces(chatId)`.
- `worker/src/index.ts` — add `tools` passthrough + tool_call return; `web_search` tool-exec action; `runId` rate-limit dedup.
- `src/routes/playground/+page.svelte` — an **Agent** toggle (🤖, separate from the simple 🔎 RAG search); wire `runAgent`; render a **trace viewer** (expandable "steps" under an agent answer); Sand branding.
- Supabase: `traces` table + RLS.

## Data model — Supabase `traces`
- `id uuid pk default gen_random_uuid()`
- `user_id uuid not null default auth.uid()` (RLS: own rows only)
- `chat_id uuid` (which conversation)
- `model text`, `query text` (the triggering user message, truncated)
- `steps jsonb` — array of `{ type:'model'|'tool', name?, args?, resultSummary?, ms, promptTokens?, completionTokens? }`
- `status text` ('ok' | 'step_limit' | 'error'), `created_at timestamptz default now()`
- RLS policies mirror `chats` (select/insert/update/delete where `auth.uid() = user_id`).

## Data flow — one agent run
1. User sends a message with **Agent** on. Browser starts a `runId`, begins a trace.
2. Browser POSTs `{messages, tools:[web_search schema], model:'gpt-oss-120b', agent:true, runId}`.
3. Worker forwards to the 120B with tools. Model replies with either `tool_calls` or a final answer.
4. If `tool_calls`: browser records a tool step, POSTs `{tool:'web_search', args, runId}` → Worker runs Tavily → returns results → browser appends a `tool` role message → back to step 2.
5. If final answer: stream it into the bubble, mark the trace `ok`, persist the trace to Supabase.
6. The assistant bubble shows an expandable **"steps"** affordance → renders the trace.

## Error handling
- Model emits no valid `tool_calls` and no answer / malformed → break loop, answer normally, trace `status:'error'`.
- Tool execution error → append an error tool-result message; let the model recover; record it in the step.
- Step cap (6) hit → stop, return best-so-far answer, trace `status:'step_limit'`, UI notes "reached step limit."
- Trace persistence failure → non-blocking (keep the in-memory trace for this session; never breaks the chat).
- Signed-out users: agent mode allowed but traces aren't persisted (no account) — trace is session-only.

## Security
- Tavily key stays server-side (Worker); the browser never sees it — `web_search` executes in the Worker.
- `traces` rows are RLS-scoped to the user (same model as `chats`).
- Turnstile still gates the first model turn of a run (subsequent same-run calls carry the validated `runId`).

## Testing
- Unit: the loop decision logic (given a model response → next action: call-tool vs finish vs error), tool_call parsing, step-cap enforcement, trace-step shaping. (`src/lib/agent.ts` pure parts.)
- Integration/manual: an agent query needing search (e.g. "what's new with the DGX Spark this week?") → loop calls `web_search` → cited answer → trace viewer shows model→tool→model steps; step cap respected; rate limit counts the run once.

## Rollout
- Build on `feat/sand-agent`; needs the `traces` table created in Supabase (SQL in the plan) before E2E. The Worker tool-calling change deploys via wrangler; the site via CI on merge.
