// Voice dictation: pick a recordable mime type, ship the audio to the Worker's
// /api/transcribe endpoint, and merge the transcript into the composer text.

// Preference order matters: Chrome/Firefox/Edge record webm/opus; Safari
// (macOS + iOS) only records mp4/aac; ogg covers older Firefox.
const MIME_CANDIDATES = [
	'audio/webm;codecs=opus',
	'audio/webm',
	'audio/mp4',
	'audio/ogg;codecs=opus'
];

// Best supported MediaRecorder mime type. Returns null when recording isn't
// supported at all, and '' when MediaRecorder exists but can't report support
// (older Safari) — in that case let the browser pick its default.
export function pickMimeType(): string | null {
	if (typeof MediaRecorder === 'undefined') return null;
	if (typeof MediaRecorder.isTypeSupported === 'function') {
		for (const c of MIME_CANDIDATES) {
			if (MediaRecorder.isTypeSupported(c)) return c;
		}
	}
	return '';
}

export interface TranscribeOpts {
	endpoint: string;
	blob: Blob;
	accessToken?: string;
}

// POST the recorded audio to the Worker; resolves to the transcript text.
export async function transcribeAudio(opts: TranscribeOpts): Promise<string> {
	const headers: Record<string, string> = {
		'Content-Type': opts.blob.type || 'audio/webm'
	};
	if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`;
	const res = await fetch(`${opts.endpoint}/api/transcribe`, {
		method: 'POST',
		headers,
		body: opts.blob
	});
	if (!res.ok) {
		const err = (await res.json().catch(() => ({}))) as { error?: string };
		throw new Error(err.error ?? `HTTP ${res.status}`);
	}
	const data = (await res.json()) as { text?: string };
	return typeof data.text === 'string' ? data.text.trim() : '';
}

// Append a transcript to whatever is already typed, with a single space between.
export function appendTranscript(existing: string, transcript: string): string {
	const t = transcript.trim();
	if (!t) return existing;
	if (!existing.trim()) return t;
	return existing.replace(/\s+$/, '') + ' ' + t;
}
