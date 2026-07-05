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

const ALLOWED_ORIGIN = "https://apramodk.com";
const MODELS: Record<string, { maxTokens: number; reasoningEffort?: string }> = {
  "qwen2.5-7b": { maxTokens: 512 },
  "gpt-oss-120b": { maxTokens: 900, reasoningEffort: "low" },
};
const DEFAULT_MODEL = "qwen2.5-7b";
const MAX_HISTORY = 6;
const ANON_LIMIT = 5;
const USER_LIMIT = 50;
const AGENT_MODEL = "gpt-oss-120b";
const AGENT_MAX_HISTORY = 16; // agent convos include tool + assistant-tool_call messages
const AGENT_ROLES = new Set(["user", "assistant", "system", "tool"]);
const RUN_TTL = 600; // seconds an agent run stays authorized
const UPSTREAM = "https://llm.apramodk.com/v1/chat/completions";
const TRANSCRIBE_UPSTREAM = "https://llm.apramodk.com/v1/audio/transcriptions";
const TRANSCRIBE_MODEL = "whisper-1";
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // ~8 MB — plenty for 60s of opus/aac
export const TRANSCRIBE_ANON_LIMIT = 20;
export const TRANSCRIBE_USER_LIMIT = 100;
// Public Supabase values (anon/publishable) — safe to ship; used to validate user tokens.
const SUPABASE_URL = "https://rrvjdkqoeyrqqtlmtljk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_GGGAVneA7Kz7BQqR4M3lfg_g7diX5UD";

export interface Env {
  RATE_LIMIT: KVNamespace;
  LITELLM_KEY: string;
  TURNSTILE_SECRET: string;
  TAVILY_API_KEY: string;
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

// Server-side web search via Tavily. Returns a formatted context block, or "".
async function webSearch(query: string, key: string): Promise<string> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query, max_results: 5, search_depth: "basic", include_answer: false }),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as {
      results?: { title: string; url: string; content: string }[];
    };
    return (data.results ?? [])
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content}`)
      .join("\n\n");
  } catch {
    return "";
  }
}

// Validate a Supabase access token by asking Supabase who it belongs to.
// Version-agnostic (works regardless of how the JWT is signed). Returns user id or null.
export async function getUserId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_PUBLISHABLE_KEY },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string };
    return typeof user.id === "string" ? user.id : null;
  } catch {
    return null;
  }
}

// Map a recorded audio mime type to a file extension the transcription API
// recognizes. Returns "" for unsupported types (used to reject uploads).
// Chrome/Firefox record audio/webm(;codecs=opus); Safari records audio/mp4.
export function extensionForMime(mime: string): string {
  const base = mime.split(";")[0].trim().toLowerCase();
  switch (base) {
    case "audio/webm":
      return "webm";
    case "audio/mp4":
    case "audio/m4a":
    case "audio/x-m4a":
      return "m4a";
    case "audio/ogg":
      return "ogg";
    case "audio/mpeg":
      return "mp3";
    case "audio/wav":
    case "audio/x-wav":
      return "wav";
    default:
      return "";
  }
}

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

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";

    // ---- Voice dictation: forward raw audio to the gateway's Whisper ----
    if (new URL(req.url).pathname === "/api/transcribe") {
      const mime = req.headers.get("Content-Type") ?? "";
      const ext = extensionForMime(mime);
      if (!ext) return json({ error: "unsupported audio type" }, 415);

      // Same tiering as chat: signed-in users get a bigger daily dictation cap.
      const auth = req.headers.get("Authorization") ?? "";
      const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      const uid = bearer ? await getUserId(bearer) : null;
      const limit = uid ? TRANSCRIBE_USER_LIMIT : TRANSCRIBE_ANON_LIMIT;
      const key = rateLimitKey(uid ? `stt:user:${uid}` : `stt:ip:${ip}`, new Date().toISOString());
      const used = parseInt((await env.RATE_LIMIT.get(key)) ?? "0", 10);
      if (used >= limit) return json({ error: "daily dictation limit reached" }, 429);

      const audio = await req.arrayBuffer();
      if (audio.byteLength === 0) return json({ error: "empty audio" }, 400);
      if (audio.byteLength > MAX_AUDIO_BYTES) return json({ error: "audio too large" }, 413);
      ctx.waitUntil(env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 86400 }));

      const form = new FormData();
      form.append("file", new Blob([audio], { type: mime }), `audio.${ext}`);
      form.append("model", TRANSCRIBE_MODEL);

      const upstream = await fetch(TRANSCRIBE_UPSTREAM, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.LITELLM_KEY}` },
        body: form,
      });
      if (!upstream.ok) return json({ error: "transcription unavailable" }, 502);
      const data = (await upstream.json().catch(() => ({}))) as { text?: unknown };
      return json({ text: typeof data.text === "string" ? data.text : "" }, 200);
    }

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
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return json({ error: "bad request" }, 400);
    }

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

    if (!body.turnstileToken || !(await verifyTurnstile(body.turnstileToken, ip, env.TURNSTILE_SECRET))) {
      return json({ error: "verification failed" }, 403);
    }

    // Signed-in users (valid Supabase token) get a higher per-user cap; else per-IP.
    let uid: string | null = null;
    if (typeof body.accessToken === "string" && body.accessToken) {
      uid = await getUserId(body.accessToken);
    }
    const limit = uid ? USER_LIMIT : ANON_LIMIT;
    const key = rateLimitKey(uid ? `user:${uid}` : `ip:${ip}`, new Date().toISOString());
    const used = parseInt((await env.RATE_LIMIT.get(key)) ?? "0", 10);
    if (used >= limit) {
      return json(
        { error: uid ? "daily limit reached" : "daily limit reached — sign in for more" },
        429
      );
    }
    ctx.waitUntil(env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 86400 }));

    const messages = trimMessages(body.messages, MAX_HISTORY);
    if (messages.length === 0) return json({ error: "no messages" }, 400);

    // Always steer formatting; optionally add web-search context as a second system message.
    const system: Msg[] = [
      {
        role: "system",
        content:
          "Format your replies in GitHub-flavored Markdown — use tables, lists, **bold**, and [links](https://example.com) where helpful. Do NOT wrap your entire response in a code block or triple backticks; only use code fences for actual code snippets.",
      },
    ];
    if (body.search === true && env.TAVILY_API_KEY) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) {
        const context = await webSearch(lastUser.content, env.TAVILY_API_KEY);
        if (context) {
          system.push({
            role: "system",
            content:
              "Web search results for the user's question are below. Use them to answer and cite sources inline as [1], [2], etc. If they aren't relevant, say so and answer normally.\n\n" +
              context,
          });
        }
      }
    }
    const finalMessages: Msg[] = [...system, ...messages];

    const model = typeof body.model === "string" && MODELS[body.model] ? body.model : DEFAULT_MODEL;
    const cfg = MODELS[model];
    const payload: Record<string, unknown> = {
      model,
      messages: finalMessages,
      max_tokens: cfg.maxTokens,
      stream: true,
    };
    if (cfg.reasoningEffort) payload.reasoning_effort = cfg.reasoningEffort;

    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.LITELLM_KEY}` },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok || !upstream.body) return json({ error: "model unavailable" }, 502);

    return new Response(upstream.body, {
      status: 200,
      headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  },
};
