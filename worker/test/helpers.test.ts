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
