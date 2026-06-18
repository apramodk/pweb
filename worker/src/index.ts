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
const DAILY_LIMIT = 20;
const UPSTREAM = "https://llm.apramodk.com/v1/chat/completions";

export interface Env {
  RATE_LIMIT: KVNamespace;
  LITELLM_KEY: string;
  TURNSTILE_SECRET: string;
  TAVILY_API_KEY: string;
}

const CORS: Record<string, string> = {
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

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";

    let body: { messages?: unknown; turnstileToken?: string; search?: boolean; model?: string };
    try {
      body = (await req.json()) as typeof body;
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
