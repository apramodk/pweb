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

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";

    let body: { messages?: unknown; turnstileToken?: string };
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
