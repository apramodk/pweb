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
  model?: string;
  search?: boolean;
  onToken: (t: string) => void;
}

export async function streamChat(opts: StreamOpts): Promise<void> {
  const res = await fetch(opts.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: opts.messages,
      turnstileToken: opts.turnstileToken,
      model: opts.model,
      search: opts.search ?? false,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "request failed" }))) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
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
