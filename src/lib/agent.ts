import { TOOLS, executeTool, summarizeResult } from './tools';

export type RawToolCall = { id?: string; function?: { name?: string; arguments?: string } };
export type AgentMsg = {
	role: 'user' | 'assistant' | 'system' | 'tool';
	content: string | null;
	tool_calls?: RawToolCall[];
	tool_call_id?: string;
};
export type ParsedToolCall = { id: string; name: string; args: Record<string, unknown> };

export type TraceStep =
	| {
			type: 'model';
			ms: number;
			toolCalls: { name: string; args: string }[];
			promptTokens?: number;
			completionTokens?: number;
	  }
	| { type: 'tool'; name: string; args: string; result: string; ms: number };
export type Trace = { model: string; status: 'ok' | 'step_limit' | 'error'; steps: TraceStep[] };

export const MAX_STEPS = 6;

// Pull tool calls out of an assistant message; tolerant of malformed JSON args.
export function parseToolCalls(message: AgentMsg | undefined): ParsedToolCall[] {
	const calls = message?.tool_calls;
	if (!Array.isArray(calls)) return [];
	const out: ParsedToolCall[] = [];
	for (let i = 0; i < calls.length; i++) {
		const name = calls[i]?.function?.name;
		if (!name) continue;
		let args: Record<string, unknown> = {};
		try {
			const raw = calls[i].function?.arguments;
			args = raw ? JSON.parse(raw) : {};
		} catch {
			args = {};
		}
		out.push({ id: calls[i].id ?? `call_${i}`, name, args });
	}
	return out;
}

// Decide what to do after a model turn.
export function nextAction(
	message: AgentMsg | undefined,
	step: number,
	maxSteps = MAX_STEPS
): { kind: 'tool' | 'final' | 'stop' } {
	if (parseToolCalls(message).length === 0) return { kind: 'final' };
	if (step >= maxSteps - 1) return { kind: 'stop' };
	return { kind: 'tool' };
}

export type RunAgentOpts = {
	endpoint: string;
	messages: { role: string; content: string }[];
	model: string;
	turnstileToken: string;
	accessToken?: string;
	onStatus?: (s: string) => void;
};
export type RunAgentResult = { content: string; trace: Trace };

function uuid(): string {
	return (
		(crypto as { randomUUID?: () => string })?.randomUUID?.() ??
		'r' + Date.now() + Math.random().toString(16).slice(2)
	);
}

async function modelTurn(opts: RunAgentOpts, convo: AgentMsg[], runId: string) {
	const res = await fetch(opts.endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			agent: true,
			messages: convo,
			tools: TOOLS,
			model: opts.model,
			turnstileToken: opts.turnstileToken,
			accessToken: opts.accessToken,
			runId
		})
	});
	if (!res.ok) {
		const e = (await res.json().catch(() => ({}))) as { error?: string };
		throw new Error(e.error ?? `HTTP ${res.status}`);
	}
	const data = (await res.json()) as {
		choices?: { message?: AgentMsg }[];
		usage?: { prompt_tokens?: number; completion_tokens?: number };
	};
	return {
		message: data.choices?.[0]?.message ?? { role: 'assistant' as const, content: '' },
		usage: data.usage
	};
}

// Drive the agent loop in the browser. The Spark only runs inference (via the Worker).
export async function runAgent(opts: RunAgentOpts): Promise<RunAgentResult> {
	const runId = uuid();
	const convo: AgentMsg[] = opts.messages.map((m) => ({
		role: m.role as AgentMsg['role'],
		content: m.content
	}));
	const trace: Trace = { model: opts.model, status: 'ok', steps: [] };

	for (let step = 0; step < MAX_STEPS; step++) {
		opts.onStatus?.(step === 0 ? 'Thinking…' : 'Reasoning…');
		const t0 = Date.now();
		let message: AgentMsg;
		let usage: { prompt_tokens?: number; completion_tokens?: number } | undefined;
		try {
			({ message, usage } = await modelTurn(opts, convo, runId));
		} catch (e) {
			trace.status = 'error';
			throw Object.assign(e instanceof Error ? e : new Error('agent failed'), { trace });
		}
		const calls = parseToolCalls(message);
		trace.steps.push({
			type: 'model',
			ms: Date.now() - t0,
			toolCalls: calls.map((c) => ({ name: c.name, args: JSON.stringify(c.args) })),
			promptTokens: usage?.prompt_tokens,
			completionTokens: usage?.completion_tokens
		});

		const action = nextAction(message, step);
		if (action.kind === 'final') return { content: message.content ?? '', trace };
		if (action.kind === 'stop') {
			trace.status = 'step_limit';
			return {
				content: message.content ?? '_(reached the step limit before finishing.)_',
				trace
			};
		}

		convo.push({ role: 'assistant', content: message.content ?? null, tool_calls: message.tool_calls });
		for (const call of calls) {
			opts.onStatus?.(
				call.name === 'web_search'
					? `🔎 Searching: ${(call.args.query as string) ?? ''}`
					: `Running ${call.name}…`
			);
			const tt0 = Date.now();
			const result = await executeTool(call.name, call.args, { endpoint: opts.endpoint, runId });
			trace.steps.push({
				type: 'tool',
				name: call.name,
				args: JSON.stringify(call.args),
				result: summarizeResult(result),
				ms: Date.now() - tt0
			});
			convo.push({ role: 'tool', tool_call_id: call.id, content: result });
		}
	}
	trace.status = 'step_limit';
	return { content: '_(reached the step limit before finishing.)_', trace };
}
