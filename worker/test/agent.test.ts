import { describe, it, expect } from "vitest";
import { prepareAgentMessages, runMarkerKey } from "../src/index";

describe("runMarkerKey", () => {
  it("namespaces the run id", () => {
    expect(runMarkerKey("abc")).toBe("run:abc");
  });
});

describe("prepareAgentMessages", () => {
  it("keeps tool role, tool_call_id, and assistant tool_calls", () => {
    const out = prepareAgentMessages([
      { role: "user", content: "hi" },
      { role: "assistant", content: null, tool_calls: [{ id: "c1" }] },
      { role: "tool", tool_call_id: "c1", content: "res" },
    ]);
    expect(out).toHaveLength(3);
    expect(out[1].tool_calls).toEqual([{ id: "c1" }]);
    expect(out[2].tool_call_id).toBe("c1");
    expect(out[1].content).toBeNull();
  });
  it("drops entries with disallowed roles", () => {
    expect(
      prepareAgentMessages([
        { role: "robot", content: "x" },
        { role: "user", content: "y" },
      ])
    ).toHaveLength(1);
  });
  it("caps to the last `max` messages", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ role: "user", content: `m${i}` }));
    expect(prepareAgentMessages(many, 16)).toHaveLength(16);
  });
  it("returns [] for non-arrays", () => {
    expect(prepareAgentMessages(null)).toEqual([]);
  });
});
