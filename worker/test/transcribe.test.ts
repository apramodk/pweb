import { describe, it, expect, vi, afterEach } from "vitest";
import worker, {
  extensionForMime,
  rateLimitKey,
  MAX_AUDIO_BYTES,
  TRANSCRIBE_ANON_LIMIT,
  type Env,
} from "../src/index";

function mockEnv(kv: Record<string, string> = {}) {
  const env = {
    RATE_LIMIT: {
      get: async (k: string) => kv[k] ?? null,
      put: async (k: string, v: string) => {
        kv[k] = v;
      },
    },
    LITELLM_KEY: "test-key",
    TURNSTILE_SECRET: "ts",
    TAVILY_API_KEY: "tv",
  } as unknown as Env;
  return { env, kv };
}

function mockCtx() {
  const tasks: Promise<unknown>[] = [];
  const ctx = { waitUntil: (p: Promise<unknown>) => tasks.push(p) } as unknown as ExecutionContext;
  return { ctx, flush: () => Promise.all(tasks) };
}

function audioRequest(opts: { body?: BodyInit; type?: string; auth?: string; ip?: string } = {}) {
  const headers: Record<string, string> = {
    "Content-Type": opts.type ?? "audio/webm;codecs=opus",
    "CF-Connecting-IP": opts.ip ?? "1.2.3.4",
  };
  if (opts.auth) headers.Authorization = `Bearer ${opts.auth}`;
  return new Request("https://chat-api.apramodk.com/api/transcribe", {
    method: "POST",
    headers,
    body: opts.body ?? new Uint8Array([1, 2, 3, 4]),
  });
}

afterEach(() => vi.restoreAllMocks());

describe("extensionForMime", () => {
  it("maps recorder mime types (with codec params) to extensions", () => {
    expect(extensionForMime("audio/webm;codecs=opus")).toBe("webm");
    expect(extensionForMime("audio/webm")).toBe("webm");
    expect(extensionForMime("audio/mp4")).toBe("m4a");
    expect(extensionForMime("audio/ogg;codecs=opus")).toBe("ogg");
  });
  it("returns '' for non-audio types", () => {
    expect(extensionForMime("application/json")).toBe("");
    expect(extensionForMime("")).toBe("");
  });
});

describe("POST /api/transcribe", () => {
  it("forwards audio to the gateway as multipart and returns the transcript", async () => {
    const upstream = vi.fn(
      async () => new Response(JSON.stringify({ text: " hello world " }), { status: 200 })
    );
    vi.stubGlobal("fetch", upstream);
    const { env, kv } = mockEnv();
    const { ctx, flush } = mockCtx();

    const res = await worker.fetch(audioRequest(), env, ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ text: " hello world " });

    expect(upstream).toHaveBeenCalledTimes(1);
    const [url, init] = upstream.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://llm.apramodk.com/v1/audio/transcriptions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    const form = init.body as FormData;
    expect(form.get("model")).toBe("whisper-1");
    expect((form.get("file") as unknown as File).name).toBe("audio.webm");

    // Counts one dictation against the per-IP daily cap.
    await flush();
    const key = rateLimitKey("stt:ip:1.2.3.4", new Date().toISOString());
    expect(kv[key]).toBe("1");
  });

  it("rejects unsupported content types with 415", async () => {
    const { env } = mockEnv();
    const { ctx } = mockCtx();
    const res = await worker.fetch(audioRequest({ type: "text/plain" }), env, ctx);
    expect(res.status).toBe(415);
  });

  it("rejects empty audio with 400", async () => {
    const { env } = mockEnv();
    const { ctx } = mockCtx();
    const res = await worker.fetch(audioRequest({ body: new Uint8Array(0) }), env, ctx);
    expect(res.status).toBe(400);
  });

  it("rejects oversized audio with 413", async () => {
    const { env } = mockEnv();
    const { ctx } = mockCtx();
    const res = await worker.fetch(
      audioRequest({ body: new Uint8Array(MAX_AUDIO_BYTES + 1) }),
      env,
      ctx
    );
    expect(res.status).toBe(413);
  });

  it("enforces the anonymous daily cap with 429", async () => {
    const key = rateLimitKey("stt:ip:1.2.3.4", new Date().toISOString());
    const { env } = mockEnv({ [key]: String(TRANSCRIBE_ANON_LIMIT) });
    const { ctx } = mockCtx();
    const res = await worker.fetch(audioRequest(), env, ctx);
    expect(res.status).toBe(429);
  });

  it("buckets signed-in users by user id, not IP", async () => {
    const upstream = vi.fn(async (url: string) => {
      if (String(url).includes("supabase")) {
        return new Response(JSON.stringify({ id: "user-abc" }), { status: 200 });
      }
      return new Response(JSON.stringify({ text: "ok" }), { status: 200 });
    });
    vi.stubGlobal("fetch", upstream);
    const { env, kv } = mockEnv();
    const { ctx, flush } = mockCtx();

    const res = await worker.fetch(audioRequest({ auth: "supa-token" }), env, ctx);
    expect(res.status).toBe(200);
    await flush();
    const key = rateLimitKey("stt:user:user-abc", new Date().toISOString());
    expect(kv[key]).toBe("1");
  });

  it("returns 502 when the gateway is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    const { env } = mockEnv();
    const { ctx } = mockCtx();
    const res = await worker.fetch(audioRequest(), env, ctx);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "transcription unavailable" });
  });
});
