// Tool registry for Sand's agent loop. v1 ships one tool: web_search.
// Tools that need secrets (the Tavily key) run in the Worker; the browser only orchestrates.

export type ToolSchema = {
	type: 'function';
	function: { name: string; description: string; parameters: Record<string, unknown> };
};

export const TOOLS: ToolSchema[] = [
	{
		type: 'function',
		function: {
			name: 'web_search',
			description: 'Search the web for current information. Returns titled snippets with URLs.',
			parameters: {
				type: 'object',
				properties: { query: { type: 'string', description: 'The search query.' } },
				required: ['query']
			}
		}
	}
];

// Shorten a tool result for the trace viewer.
export function summarizeResult(result: string, max = 280): string {
	const s = result.trim().replace(/\s+/g, ' ');
	return s.length > max ? s.slice(0, max) + '…' : s;
}

// Execute a tool via the Worker's tool-exec endpoint (keeps API keys server-side).
// Returns the tool's text result, or a readable error string the model can act on.
export async function executeTool(
	name: string,
	args: Record<string, unknown>,
	opts: { endpoint: string; runId: string }
): Promise<string> {
	try {
		const res = await fetch(opts.endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tool: name, args, runId: opts.runId })
		});
		if (!res.ok) {
			const e = (await res.json().catch(() => ({}))) as { error?: string };
			return `Tool error: ${e.error ?? res.status}`;
		}
		const data = (await res.json()) as { result?: string };
		return data.result ?? '';
	} catch (e) {
		return `Tool error: ${e instanceof Error ? e.message : 'failed'}`;
	}
}
