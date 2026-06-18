<svelte:head>
    <title>Playground — chat with my self-hosted LLM</title>
    <meta property="og:title" content="LLM Playground — Akash Pramod Kumar" />
    <meta
        property="og:description"
        content="Chat live with open models I self-host on a DGX Spark."
    />
</svelte:head>

<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import { streamChat } from '$lib/chat';
    import MarkdownIt from 'markdown-it';

    // html:false escapes any raw HTML (XSS-safe for untrusted web-search content);
    // linkify auto-links bare URLs; breaks renders single newlines.
    const md = new MarkdownIt({ html: false, linkify: true, breaks: true });
    const _linkOpen =
        md.renderer.rules.link_open ||
        ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        tokens[idx].attrSet('target', '_blank');
        tokens[idx].attrSet('rel', 'noopener noreferrer');
        return _linkOpen(tokens, idx, options, env, self);
    };
    const renderMd = (s: string): string => md.render(s);

    const ENDPOINT = 'https://chat-api.apramodk.com';
    // Public Turnstile *site* key. Replace before deploy.
    // Local dev: Cloudflare's always-pass test key is 1x00000000000000000000AA
    const SITE_KEY = '1x00000000000000000000AA';
    const STORE = 'pweb-chats';

    const MODELS = [
        { id: 'qwen2.5-7b', label: 'Fast 7B' },
        { id: 'gpt-oss-120b', label: '120B 🧠' }
    ];
    const EXAMPLES = [
        'Explain mixture-of-experts models, simply.',
        'Write a haiku about GPUs.',
        'What can you help me with?'
    ];

    type Msg = { role: 'user' | 'assistant'; content: string };
    type Chat = { id: string; title: string; messages: Msg[]; updated: number };

    let messages: Msg[] = [];
    let chats: Chat[] = [];
    let currentId = '';
    let input = '';
    let model = 'qwen2.5-7b';
    let searchOn = false;
    let busy = false;
    let error = '';
    let turnstileToken = '';
    let sidebarOpen = false;
    let scroller: HTMLElement;
    let box: HTMLInputElement;

    $: waiting =
        busy &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'assistant' &&
        messages[messages.length - 1].content === '';
    $: lastUserIndex = messages.map((m) => m.role).lastIndexOf('user');

    afterUpdate(() => {
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
    });

    function newId(): string {
        return (crypto as any)?.randomUUID?.() ?? 'c' + Date.now();
    }
    function persist() {
        try {
            localStorage.setItem(STORE, JSON.stringify(chats));
        } catch {
            /* ignore */
        }
    }
    function titleOf(ms: Msg[]): string {
        const u = ms.find((m) => m.role === 'user');
        return u ? u.content.slice(0, 42) : 'New chat';
    }
    function saveCurrent() {
        if (messages.length === 0) return;
        const chat: Chat = {
            id: currentId,
            title: titleOf(messages),
            messages: [...messages],
            updated: Date.now()
        };
        const i = chats.findIndex((c) => c.id === currentId);
        if (i >= 0) chats[i] = chat;
        else chats = [chat, ...chats];
        chats = chats.sort((a, b) => b.updated - a.updated);
        persist();
    }
    function newChat() {
        saveCurrent();
        currentId = newId();
        messages = [];
        error = '';
        sidebarOpen = false;
    }
    function loadChat(id: string) {
        saveCurrent();
        const c = chats.find((x) => x.id === id);
        if (c) {
            currentId = id;
            messages = [...c.messages];
        }
        sidebarOpen = false;
    }
    function deleteChat(id: string) {
        chats = chats.filter((c) => c.id !== id);
        persist();
        if (id === currentId) {
            currentId = newId();
            messages = [];
        }
    }

    onMount(() => {
        try {
            const raw = localStorage.getItem(STORE);
            if (raw) chats = JSON.parse(raw);
        } catch {
            /* ignore */
        }
        currentId = newId();

        (window as any).onTurnstile = (tok: string) => (turnstileToken = tok);
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
    });

    function quick(t: string) {
        input = t;
        box?.focus();
    }

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
                model,
                search: searchOn,
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
            turnstileToken = '';
            (window as any).turnstile?.reset?.();
            saveCurrent();
        }
    }
</script>

<div class="app" class:open={sidebarOpen}>
    <aside class="sidebar">
        <div class="side-head">
            <span class="brand">self-hosted LLM</span>
            <button class="new" type="button" on:click={newChat}>＋ New chat</button>
        </div>
        <nav class="history" aria-label="Chat history">
            {#if chats.length === 0}
                <p class="no-chats">No chats yet</p>
            {/if}
            {#each chats as c (c.id)}
                <button
                    class="chat-item"
                    class:active={c.id === currentId}
                    type="button"
                    on:click={() => loadChat(c.id)}
                >
                    <span class="chat-title">{c.title}</span>
                    <span
                        class="del"
                        role="button"
                        tabindex="0"
                        aria-label="Delete chat"
                        on:click|stopPropagation={() => deleteChat(c.id)}
                        on:keydown|stopPropagation={(e) => e.key === 'Enter' && deleteChat(c.id)}
                        >×</span
                    >
                </button>
            {/each}
        </nav>
        <div class="side-foot">
            <a href="/">← Portfolio</a>
        </div>
    </aside>

    <div class="main">
        <header class="topbar">
            <button class="menu" type="button" on:click={() => (sidebarOpen = !sidebarOpen)} aria-label="Menu">☰</button>
            <div class="model-pick" role="group" aria-label="Model">
                {#each MODELS as m}
                    <button
                        type="button"
                        class:sel={model === m.id}
                        on:click={() => (model = m.id)}
                        disabled={busy}
                    >{m.label}</button>
                {/each}
            </div>
        </header>

        <div class="scroll" bind:this={scroller}>
            {#if messages.length === 0}
                <div class="empty">
                    <div class="hero-avatar" aria-hidden="true">AI</div>
                    <h1>Chat with my self-hosted LLM</h1>
                    <p>
                        Running on my own DGX Spark. Pick the fast <b>7B</b> or the <b>120B</b> up
                        top, and toggle 🔎 web search in the box below.
                    </p>
                    <div class="examples">
                        {#each EXAMPLES as ex}
                            <button type="button" on:click={() => quick(ex)}>{ex}</button>
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="column">
                    {#each messages as m, i}
                        {#if !(m.role === 'assistant' && m.content === '')}
                            <div class="row {m.role}">
                                {#if m.role === 'assistant'}
                                    <div class="bubble assistant md">{@html renderMd(m.content)}</div>
                                {:else}
                                    <div class="bubble user">{m.content}</div>
                                {/if}
                            </div>
                            {#if m.role === 'user' && i === lastUserIndex}
                                <div class="delivered">Delivered</div>
                            {/if}
                        {/if}
                    {/each}
                    {#if waiting}
                        <div class="row assistant">
                            {#if searchOn}
                                <div class="bubble assistant searching">🔎 Searching the web…</div>
                            {:else}
                                <div class="bubble assistant typing" aria-label="typing">
                                    <span></span><span></span><span></span>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>

        <div class="composer">
            <div class="composer-inner">
                {#if error}<div class="err">{error}</div>{/if}
                <div class="cf-turnstile" data-sitekey={SITE_KEY} data-callback="onTurnstile" data-theme="auto" data-appearance="interaction-only"></div>
                <form on:submit|preventDefault={send}>
                    <button
                        type="button"
                        class="tool"
                        class:on={searchOn}
                        on:click={() => (searchOn = !searchOn)}
                        aria-pressed={searchOn}
                        title="Web search"
                        aria-label="Toggle web search"
                    >🔎</button>
                    <input
                        bind:this={box}
                        bind:value={input}
                        placeholder="Message self-hosted LLM…"
                        aria-label="Message"
                        disabled={busy}
                    />
                    <button class="send" disabled={busy || !input.trim()} aria-label="Send">↑</button>
                </form>
                <p class="disclaimer">
                    Open model on a DGX Spark · responses may be wrong · rate-limited demo
                </p>
            </div>
        </div>
    </div>

    <button class="backdrop" type="button" aria-label="Close sidebar" on:click={() => (sidebarOpen = false)}></button>
</div>

<style>
    .app {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        background: #ffffff;
        color: #0d0d0d;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue',
            'Segoe UI', Roboto, sans-serif;
    }

    /* ----- sidebar ----- */
    .sidebar {
        flex: 0 0 264px;
        width: 264px;
        display: flex;
        flex-direction: column;
        background: #f7f7f8;
        border-right: 1px solid #ececf0;
        padding: 0.75rem;
    }
    .side-head {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        padding-top: env(safe-area-inset-top);
    }
    .brand {
        font-size: 0.8rem;
        font-weight: 600;
        color: #6b6b70;
        padding: 0 0.4rem;
    }
    .new {
        text-align: left;
        border: 1px solid #e2e2e7;
        background: #fff;
        border-radius: 12px;
        padding: 0.6rem 0.75rem;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        font-family: inherit;
        color: inherit;
        transition: background 0.15s;
    }
    .new:hover {
        background: #f0f0f3;
    }
    .history {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        margin: 0.75rem 0;
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
    }
    .no-chats {
        color: #b0b0b5;
        font-size: 0.8rem;
        padding: 0.4rem;
        margin: 0;
    }
    .chat-item {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        width: 100%;
        text-align: left;
        border: none;
        background: transparent;
        border-radius: 9px;
        padding: 0.5rem 0.6rem;
        font-size: 0.86rem;
        cursor: pointer;
        color: #2a2a2e;
        font-family: inherit;
    }
    .chat-item:hover {
        background: #ececf0;
    }
    .chat-item.active {
        background: #e3e3e8;
        font-weight: 500;
    }
    .chat-title {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .del {
        opacity: 0;
        color: #9a9aa0;
        font-size: 1.1rem;
        line-height: 1;
        padding: 0 0.2rem;
    }
    .chat-item:hover .del {
        opacity: 1;
    }
    .del:hover {
        color: #ff3b30;
    }
    .side-foot {
        border-top: 1px solid #ececf0;
        padding-top: 0.6rem;
    }
    .side-foot a {
        display: block;
        padding: 0.4rem 0.6rem;
        font-size: 0.85rem;
        color: #0a7aff;
        text-decoration: none;
    }

    /* ----- main column ----- */
    .main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }
    .topbar {
        position: relative;
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 52px;
        padding-top: env(safe-area-inset-top);
        border-bottom: 1px solid #ececf0;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(14px);
    }
    .menu {
        position: absolute;
        left: 0.5rem;
        display: none;
        border: none;
        background: transparent;
        font-size: 1.3rem;
        cursor: pointer;
        color: inherit;
        padding: 0.3rem 0.6rem;
    }
    .model-pick {
        display: inline-flex;
        gap: 2px;
        background: #ececf0;
        border-radius: 9px;
        padding: 2px;
    }
    .model-pick button {
        border: none;
        background: transparent;
        border-radius: 7px;
        padding: 0.3rem 0.7rem;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        color: #6b6b70;
        font-family: inherit;
        transition: background 0.15s, color 0.15s;
    }
    .model-pick button.sel {
        background: #fff;
        color: #0d0d0d;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .model-pick button:disabled {
        cursor: default;
        opacity: 0.6;
    }

    .scroll {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
    }
    .column {
        max-width: 46rem;
        margin: 0 auto;
        padding: 1.5rem 1rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .row {
        display: flex;
        margin-top: 0.3rem;
    }
    .row.user {
        justify-content: flex-end;
    }
    .row.assistant {
        justify-content: flex-start;
    }
    .bubble {
        max-width: 80%;
        padding: 0.55rem 0.85rem;
        font-size: 1.02rem;
        line-height: 1.4;
        border-radius: 19px;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        animation: pop 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2);
    }
    .bubble.user {
        background: linear-gradient(180deg, #2e9bff 0%, #0a7aff 100%);
        color: #fff;
        border-bottom-right-radius: 6px;
    }
    .bubble.assistant {
        background: #e9e9eb;
        color: #000;
        border-bottom-left-radius: 6px;
    }
    .bubble.md {
        max-width: 100%;
        white-space: normal;
    }
    .bubble.md :global(p) {
        margin: 0 0 0.5em;
    }
    .bubble.md :global(p:last-child) {
        margin-bottom: 0;
    }
    .bubble.md :global(ul),
    .bubble.md :global(ol) {
        margin: 0.4em 0;
        padding-left: 1.3em;
    }
    .bubble.md :global(li) {
        margin: 0.15em 0;
    }
    .bubble.md :global(a) {
        color: #0a66d6;
        text-decoration: underline;
    }
    .bubble.md :global(code) {
        background: rgba(0, 0, 0, 0.07);
        padding: 0.1em 0.35em;
        border-radius: 5px;
        font-size: 0.88em;
    }
    .bubble.md :global(pre) {
        background: rgba(0, 0, 0, 0.06);
        padding: 0.65em 0.8em;
        border-radius: 10px;
        overflow-x: auto;
        margin: 0.5em 0;
    }
    .bubble.md :global(pre code) {
        background: none;
        padding: 0;
        font-size: 0.85em;
    }
    .bubble.md :global(table) {
        display: block;
        overflow-x: auto;
        border-collapse: collapse;
        font-size: 0.9em;
        margin: 0.5em 0;
    }
    .bubble.md :global(th),
    .bubble.md :global(td) {
        border: 1px solid #d3d3d8;
        padding: 0.3em 0.55em;
        text-align: left;
    }
    .bubble.md :global(th) {
        background: rgba(0, 0, 0, 0.04);
        font-weight: 600;
    }
    .bubble.md :global(h1),
    .bubble.md :global(h2),
    .bubble.md :global(h3) {
        font-size: 1.05em;
        font-weight: 700;
        margin: 0.6em 0 0.3em;
    }
    .bubble.md :global(blockquote) {
        border-left: 3px solid #c8c8cf;
        margin: 0.5em 0;
        padding-left: 0.7em;
        color: #555;
    }
    .delivered {
        align-self: flex-end;
        font-size: 0.66rem;
        color: #9a9aa0;
        margin: 0.15rem 0.1rem 0;
    }
    .bubble.searching {
        font-size: 0.92rem;
        font-style: italic;
        color: #4a4a50;
    }
    .bubble.typing {
        display: flex;
        gap: 5px;
        align-items: center;
        padding: 0.7rem 0.85rem;
    }
    .bubble.typing span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9b9ba0;
        animation: blink 1.3s infinite ease-in-out both;
    }
    .bubble.typing span:nth-child(2) {
        animation-delay: 0.2s;
    }
    .bubble.typing span:nth-child(3) {
        animation-delay: 0.4s;
    }
    @keyframes pop {
        from {
            transform: translateY(6px) scale(0.96);
            opacity: 0;
        }
        to {
            transform: none;
            opacity: 1;
        }
    }
    @keyframes blink {
        0%,
        80%,
        100% {
            transform: scale(0.7);
            opacity: 0.4;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .empty {
        max-width: 34rem;
        margin: auto;
        padding: 2rem 1.25rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100%;
        justify-content: center;
    }
    .hero-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #2e9bff, #0a7aff);
        display: grid;
        place-items: center;
        color: #fff;
        font-weight: 700;
        font-size: 1.1rem;
        margin-bottom: 1rem;
    }
    .empty h1 {
        font-size: 1.6rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 0;
    }
    .empty p {
        margin: 0.6rem 0 1.4rem;
        color: #6b6b70;
        line-height: 1.5;
    }
    .examples {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
    }
    .examples button {
        border: 1px solid #e2e2e7;
        background: #fff;
        border-radius: 16px;
        padding: 0.5rem 0.85rem;
        font-size: 0.85rem;
        color: #2a2a2e;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
        font-family: inherit;
    }
    .examples button:hover {
        border-color: #0a7aff;
        background: #f5faff;
    }

    .composer {
        flex: 0 0 auto;
        padding: 0.5rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 28%);
    }
    .composer-inner {
        max-width: 46rem;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .composer .err {
        color: #ff3b30;
        font-size: 0.8rem;
        padding: 0 0.4rem;
    }
    .composer form {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: #fff;
        border: 1px solid #d9d9e0;
        border-radius: 26px;
        padding: 0.35rem 0.35rem 0.35rem 0.5rem;
        box-shadow: 0 2px 14px rgba(0, 0, 0, 0.06);
    }
    .tool {
        flex: 0 0 auto;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid transparent;
        background: transparent;
        font-size: 0.95rem;
        cursor: pointer;
        opacity: 0.55;
        transition: background 0.15s, opacity 0.15s;
    }
    .tool:hover {
        opacity: 0.9;
        background: #f0f0f3;
    }
    .tool.on {
        opacity: 1;
        background: #e7f1ff;
        border-color: #b9d9ff;
    }
    .composer input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 1rem;
        padding: 0.45rem 0;
        font-family: inherit;
        color: inherit;
    }
    .send {
        width: 34px;
        height: 34px;
        flex: 0 0 34px;
        border-radius: 50%;
        border: none;
        background: #0a7aff;
        color: #fff;
        font-size: 1.15rem;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
    }
    .send:hover:not(:disabled) {
        background: #0066e0;
    }
    .send:active:not(:disabled) {
        transform: scale(0.88);
    }
    .send:disabled {
        background: #cdd0d4;
        cursor: default;
    }
    .disclaimer {
        text-align: center;
        font-size: 0.7rem;
        color: #a0a0a6;
        margin: 0;
    }

    .backdrop {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 55;
        border: none;
        background: rgba(0, 0, 0, 0.35);
    }

    @media (max-width: 820px) {
        .menu {
            display: block;
        }
        .sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 60;
            transform: translateX(-100%);
            transition: transform 0.22s ease;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.18);
        }
        .app.open .sidebar {
            transform: none;
        }
        .app.open .backdrop {
            display: block;
        }
    }

    @media (prefers-color-scheme: dark) {
        .app {
            background: #1a1a1d;
            color: #ececec;
        }
        .sidebar {
            background: #131315;
            border-color: #2c2c30;
        }
        .brand {
            color: #8a8a90;
        }
        .new {
            background: #232327;
            border-color: #34343a;
        }
        .new:hover {
            background: #2a2a30;
        }
        .chat-item {
            color: #d8d8de;
        }
        .chat-item:hover {
            background: #232327;
        }
        .chat-item.active {
            background: #2c2c32;
        }
        .side-foot {
            border-color: #2c2c30;
        }
        .topbar {
            background: rgba(26, 26, 29, 0.8);
            border-color: #2c2c30;
        }
        .model-pick {
            background: #2a2a30;
        }
        .model-pick button {
            color: #9a9aa0;
        }
        .model-pick button.sel {
            background: #45454d;
            color: #fff;
        }
        .bubble.assistant {
            background: #2b2b30;
            color: #fff;
        }
        .bubble.md :global(a) {
            color: #5aa9ff;
        }
        .bubble.md :global(code),
        .bubble.md :global(pre) {
            background: rgba(255, 255, 255, 0.1);
        }
        .bubble.md :global(th),
        .bubble.md :global(td) {
            border-color: #44444c;
        }
        .bubble.md :global(th) {
            background: rgba(255, 255, 255, 0.06);
        }
        .bubble.md :global(blockquote) {
            border-color: #55555d;
            color: #b5b5bd;
        }
        .bubble.searching {
            color: #b8b8c0;
        }
        .empty p {
            color: #9a9aa0;
        }
        .examples button {
            background: #232327;
            border-color: #34343a;
            color: #e2e2e7;
        }
        .examples button:hover {
            background: #2a2a30;
        }
        .composer {
            background: linear-gradient(180deg, rgba(26, 26, 29, 0) 0%, #1a1a1d 28%);
        }
        .composer form {
            background: #232327;
            border-color: #3a3a40;
        }
        .tool:hover {
            background: #2e2e34;
        }
        .tool.on {
            background: #16324f;
            border-color: #2f5b86;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .bubble {
            animation: none;
        }
        .bubble.typing span {
            animation: none;
            opacity: 0.6;
        }
        .sidebar {
            transition: none;
        }
    }
</style>
