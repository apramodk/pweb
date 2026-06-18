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
