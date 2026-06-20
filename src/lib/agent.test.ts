import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseToolCalls, nextAction, runAgent, type AgentMsg } from './agent';

afterEach(() => vi.restoreAllMocks());

const callMsg = (name: string, args: string): AgentMsg => ({
	role: 'assistant',
	content: null,
	tool_calls: [{ id: 'c1', function: { name, arguments: args } }]
});

describe('parseToolCalls', () => {
	it('extracts id, name, and parsed args', () => {
		expect(parseToolCalls(callMsg('web_search', '{"query":"x"}'))).toEqual([
			{ id: 'c1', name: 'web_search', args: { query: 'x' } }
		]);
	});
	it('defaults to empty args on malformed JSON', () => {
		expect(parseToolCalls(callMsg('web_search', 'not json'))[0].args).toEqual({});
	});
	it('returns [] when there are no tool calls', () => {
		expect(parseToolCalls({ role: 'assistant', content: 'hi' })).toEqual([]);
	});
});

describe('nextAction', () => {
	it('finalizes when the model returns content with no tool calls', () => {
		expect(nextAction({ role: 'assistant', content: 'done' }, 0).kind).toBe('final');
	});
	it('runs tools when requested and steps remain', () => {
		expect(nextAction(callMsg('web_search', '{}'), 0, 6).kind).toBe('tool');
	});
	it('stops when tool calls arrive on the last allowed step', () => {
		expect(nextAction(callMsg('web_search', '{}'), 5, 6).kind).toBe('stop');
	});
});

describe('runAgent', () => {
	it('loops model -> tool -> model and returns final content + trace', async () => {
		const responses = [
			new Response(
				JSON.stringify({
					choices: [{ message: callMsg('web_search', '{"query":"spark"}') }],
					usage: { prompt_tokens: 10, completion_tokens: 5 }
				}),
				{ status: 200 }
			),
			new Response(JSON.stringify({ result: '[1] DGX Spark ...' }), { status: 200 }),
			new Response(
				JSON.stringify({
					choices: [{ message: { role: 'assistant', content: 'The Spark is fast.' } }],
					usage: { prompt_tokens: 20, completion_tokens: 6 }
				}),
				{ status: 200 }
			)
		];
		let i = 0;
		vi.stubGlobal('fetch', vi.fn(async () => responses[i++]));

		const res = await runAgent({
			endpoint: 'https://e',
			messages: [{ role: 'user', content: 'tell me about the spark' }],
			model: 'gpt-oss-120b',
			turnstileToken: 'tok'
		});

		expect(res.content).toBe('The Spark is fast.');
		expect(res.trace.status).toBe('ok');
		expect(res.trace.steps.map((s) => s.type)).toEqual(['model', 'tool', 'model']);
		const tool = res.trace.steps.find((s) => s.type === 'tool') as Extract<
			(typeof res.trace.steps)[number],
			{ type: 'tool' }
		>;
		expect(tool.name).toBe('web_search');
	});
});
