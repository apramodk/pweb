import { describe, it, expect, vi, afterEach } from "vitest";
import { pickMimeType, transcribeAudio, appendTranscript } from "./voice";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("pickMimeType", () => {
  it("returns null when MediaRecorder is missing", () => {
    expect(pickMimeType()).toBeNull();
  });
  it("prefers webm/opus when supported", () => {
    vi.stubGlobal("MediaRecorder", {
      isTypeSupported: (t: string) => t.startsWith("audio/webm"),
    });
    expect(pickMimeType()).toBe("audio/webm;codecs=opus");
  });
  it("falls back to mp4 (Safari)", () => {
    vi.stubGlobal("MediaRecorder", {
      isTypeSupported: (t: string) => t === "audio/mp4",
    });
    expect(pickMimeType()).toBe("audio/mp4");
  });
  it("returns '' (browser default) when isTypeSupported is unavailable", () => {
    vi.stubGlobal("MediaRecorder", {});
    expect(pickMimeType()).toBe("");
  });
});

describe("transcribeAudio", () => {
  it("POSTs the blob to /api/transcribe and returns trimmed text", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ text: "  hi there " }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });
    const text = await transcribeAudio({ endpoint: "https://api.test", blob, accessToken: "tok" });
    expect(text).toBe("hi there");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.test/api/transcribe");
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("audio/webm");
    expect(headers.Authorization).toBe("Bearer tok");
  });

  it("throws the server's error message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "daily dictation limit reached" }), { status: 429 }))
    );
    const blob = new Blob([new Uint8Array([1])], { type: "audio/webm" });
    await expect(transcribeAudio({ endpoint: "https://api.test", blob })).rejects.toThrow(
      "daily dictation limit reached"
    );
  });

  it("throws HTTP status when the error body is not JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad gateway", { status: 502 })));
    const blob = new Blob([new Uint8Array([1])], { type: "audio/webm" });
    await expect(transcribeAudio({ endpoint: "https://api.test", blob })).rejects.toThrow(
      "HTTP 502"
    );
  });
});

describe("appendTranscript", () => {
  it("replaces empty input", () => {
    expect(appendTranscript("", "hello")).toBe("hello");
  });
  it("appends with a single space", () => {
    expect(appendTranscript("draft so far  ", " and more ")).toBe("draft so far and more");
  });
  it("ignores empty transcripts", () => {
    expect(appendTranscript("keep me", "   ")).toBe("keep me");
  });
});
