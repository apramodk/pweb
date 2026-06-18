<svelte:head>
    <title>Playground — chat with my self-hosted LLM</title>
    <meta property="og:title" content="LLM Playground — Akash Pramod Kumar" />
    <meta
        property="og:description"
        content="Chat live with an open model I self-host on a DGX Spark."
    />
</svelte:head>

<script lang="ts">
    import { onMount } from 'svelte';
    import { streamChat } from '$lib/chat';

    const ENDPOINT = 'https://chat-api.apramodk.com';
    // Public Turnstile *site* key. Replace before deploy.
    // Local dev: Cloudflare's always-pass test key is 1x00000000000000000000AA
    const SITE_KEY = 'REPLACE_WITH_TURNSTILE_SITE_KEY';

    type Msg = { role: 'user' | 'assistant'; content: string };
    let messages: Msg[] = [];
    let input = '';
    let busy = false;
    let error = '';
    let turnstileToken = '';

    onMount(() => {
        (window as any).onTurnstile = (tok: string) => (turnstileToken = tok);
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
    });

    async function send() {
        if (!input.trim() || busy) return;
        if (!turnstileToken) {
            error = 'Please complete the verification below.';
            return;
        }
        error = '';
        busy = true;
        const userMsg: Msg = { role: 'user', content: input.trim() };
        const payload = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
        messages = [...messages, userMsg, { role: 'assistant', content: '' }];
        input = '';
        try {
            await streamChat({
                endpoint: ENDPOINT,
                messages: payload,
                turnstileToken,
                onToken: (t) => {
                    messages[messages.length - 1].content += t;
                    messages = messages;
                }
            });
        } catch (e) {
            error = e instanceof Error ? e.message : 'Something went wrong.';
            messages = messages.slice(0, -1);
        } finally {
            busy = false;
            // Turnstile tokens are single-use — reset for the next message.
            turnstileToken = '';
            (window as any).turnstile?.reset?.();
        }
    }
</script>

<div class="max-w-3xl mx-auto px-6 py-16 md:py-24">
    <section class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">
            <span class="rainbow-underline">Playground</span>
        </h1>
        <p class="mt-4 text-base-content/80 leading-relaxed max-w-xl">
            Chat with an open model running on my own hardware. This demo serves a fast
            <span class="font-mono text-primary">7B</span> model for snappy replies — I also
            self-host <span class="font-mono text-primary">gpt-oss-120B</span> on the same
            DGX Spark, just not exposed here. A daily limit keeps the GPU honest.
        </p>
    </section>

    <!-- Mac-window chat -->
    <div class="rounded-window bg-base-100 border border-base-300 shadow-window overflow-hidden">
        <!-- Title bar -->
        <div class="flex items-center gap-2 px-4 py-2.5 bg-base-200 border-b border-base-300">
            <div class="flex gap-1.5" aria-hidden="true">
                <span class="w-3 h-3 rounded-full bg-mac-red"></span>
                <span class="w-3 h-3 rounded-full bg-mac-yellow"></span>
                <span class="w-3 h-3 rounded-full bg-mac-green"></span>
            </div>
            <span class="flex-1 text-center text-xs font-mono opacity-50">~/chat — qwen2.5-7b</span>
            <div class="w-[54px]"></div>
        </div>

        <!-- Messages -->
        <div class="px-4 py-5 space-y-4 min-h-[40vh] max-h-[55vh] overflow-y-auto">
            {#if messages.length === 0}
                <p class="text-sm opacity-40 font-mono">Ask me anything…</p>
            {/if}
            {#each messages as m}
                <div class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}">
                    <div
                        class="max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap
                               {m.role === 'user'
                            ? 'bg-primary text-primary-content'
                            : 'bg-base-200 border border-base-300'}"
                    >
                        {m.content}{#if m.role === 'assistant' && busy && !m.content}<span class="opacity-40">▌</span>{/if}
                    </div>
                </div>
            {/each}
        </div>

        <!-- Input -->
        <div class="border-t border-base-300 p-3 space-y-3">
            {#if error}
                <div class="text-sm text-mac-red font-mono px-1">{error}</div>
            {/if}
            <div class="cf-turnstile" data-sitekey={SITE_KEY} data-callback="onTurnstile"></div>
            <form class="flex gap-2" on:submit|preventDefault={send}>
                <input
                    class="flex-1 px-3 py-2 rounded-lg bg-base-200 border border-base-300
                           text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    bind:value={input}
                    placeholder="Ask something…"
                    disabled={busy}
                />
                <button
                    class="px-4 py-2 rounded-lg bg-base-200 border border-base-300 text-sm
                           font-medium shadow-btn-retro hover:shadow-none hover:translate-y-px
                           transition-all disabled:opacity-40 disabled:shadow-none"
                    disabled={busy || !input.trim()}
                >
                    {busy ? '…' : 'Send'}
                </button>
            </form>
        </div>
    </div>
</div>
