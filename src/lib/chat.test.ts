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
