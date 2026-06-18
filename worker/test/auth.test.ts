import { describe, it, expect, vi, afterEach } from "vitest";
import { getUserId } from "../src/index";

afterEach(() => vi.restoreAllMocks());

describe("getUserId", () => {
  it("returns the user id when Supabase validates the token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ id: "user-abc" }), { status: 200 }))
    );
    expect(await getUserId("good-token")).toBe("user-abc");
  });

  it("returns null on 401 (invalid/expired token)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unauthorized", { status: 401 })));
    expect(await getUserId("bad-token")).toBeNull();
  });

  it("returns null when the request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      })
    );
    expect(await getUserId("x")).toBeNull();
  });

  it("returns null when the response has no id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }))
    );
    expect(await getUserId("weird")).toBeNull();
  });
});
