import { describe, it, expect, vi, afterEach } from 'vitest';
import { TOOLS, summarizeResult, executeTool } from './tools';

afterEach(() => vi.restoreAllMocks());

describe('TOOLS', () => {
	it('exposes a web_search function tool with a query param', () => {
		const ws = TOOLS.find((t) => t.function.name === 'web_search');
		expect(ws).toBeTruthy();
		expect((ws!.function.parameters as { required: string[] }).required).toContain('query');
	});
});

describe('summarizeResult', () => {
	it('collapses whitespace and truncates with an ellipsis', () => {
		expect(summarizeResult('a\n\n  b')).toBe('a b');
		expect(summarizeResult('x'.repeat(500), 10)).toBe('xxxxxxxxxx…');
	});
});

describe('executeTool', () => {
	it('posts the tool call and returns the result string', async () => {
		const fetchMock = vi.fn(
			async (_input: RequestInfo | URL, _init?: RequestInit) =>
				new Response(JSON.stringify({ result: 'hits' }), { status: 200 })
		);
		vi.stubGlobal('fetch', fetchMock);
		const out = await executeTool('web_search', { query: 'gpus' }, { endpoint: 'https://e', runId: 'r1' });
		expect(out).toBe('hits');
		const init = fetchMock.mock.calls[0][1] as RequestInit;
		const body = JSON.parse(init.body as string);
		expect(body).toMatchObject({ tool: 'web_search', args: { query: 'gpus' }, runId: 'r1' });
	});

	it('returns a readable error string on non-ok', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response(JSON.stringify({ error: 'nope' }), { status: 500 }))
		);
		expect(await executeTool('web_search', {}, { endpoint: 'https://e', runId: 'r1' })).toBe(
			'Tool error: nope'
		);
	});
});
