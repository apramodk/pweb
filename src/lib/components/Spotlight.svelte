<script lang="ts">
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    import { tick } from 'svelte';
    import { page } from '$app/stores';

    export let isOpen = false;

    let query = '';
    let inputEl: HTMLInputElement;
    let selectedIndex = 0;

    interface SearchItem {
        title: string;
        subtitle: string;
        category: string;
        href: string;
    }

    // Fallback items if CMS data isn't loaded yet
    const fallbackItems: SearchItem[] = [
        { title: 'Home', subtitle: 'Main page', category: 'Pages', href: `${base}/` },
        { title: 'HCI & Embedded Systems', subtitle: 'Capacitive touch, IoT, IMU drone controller', category: 'Pages', href: `${base}/HCI` },
        { title: 'Software Projects', subtitle: 'AI tools, macOS apps, browser extensions', category: 'Pages', href: `${base}/software` },
        { title: 'Research', subtitle: 'Neuromorphic computing, robotics, HCI', category: 'Pages', href: `${base}/research` },
    ];

    $: items = ($page.data?.searchItems as SearchItem[]) || fallbackItems;

    $: filtered = query.trim() === ''
        ? items.slice(0, 8)
        : items.filter(item => {
            const q = query.toLowerCase();
            return item.title.toLowerCase().includes(q)
                || item.subtitle.toLowerCase().includes(q)
                || item.category.toLowerCase().includes(q);
        });

    $: selectedIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));

    $: grouped = filtered.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, SearchItem[]>);

    function open() {
        isOpen = true;
        query = '';
        selectedIndex = 0;
        tick().then(() => inputEl?.focus());
    }

    function close() {
        isOpen = false;
        query = '';
    }

    function navigate(item: SearchItem) {
        close();
        goto(item.href);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            close();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filtered.length;
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
            return;
        }
        if (e.key === 'Enter' && filtered[selectedIndex]) {
            e.preventDefault();
            navigate(filtered[selectedIndex]);
            return;
        }
    }

    function globalKeydown(e: KeyboardEvent) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (isOpen) close();
            else open();
        }
    }

    $: if (typeof document !== 'undefined') {
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }
</script>

<svelte:window on:keydown={globalKeydown} />

{#if isOpen}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        transition:fade={{ duration: 150 }}
        on:click={close}
    >
        <!-- Spotlight container -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="mx-auto mt-[20vh] w-full max-w-xl"
            on:click|stopPropagation
        >
            <div class="rounded-2xl bg-base-100 border border-base-300 shadow-2xl overflow-hidden">
                <!-- Search input -->
                <div class="flex items-center gap-3 px-4 py-3 border-b border-base-300">
                    <svg class="w-5 h-5 text-base-content/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        bind:this={inputEl}
                        bind:value={query}
                        on:keydown={handleKeydown}
                        type="text"
                        placeholder="Search..."
                        class="flex-1 bg-transparent text-base outline-none placeholder:text-base-content/30"
                        spellcheck="false"
                    />
                    <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-base-200 border border-base-300 text-[10px] font-mono text-base-content/40">esc</kbd>
                </div>

                <!-- Results -->
                {#if filtered.length > 0}
                    <div class="max-h-80 overflow-y-auto py-2">
                        {#each Object.entries(grouped) as [category, categoryItems]}
                            <div class="px-4 pt-2 pb-1">
                                <p class="text-[10px] font-mono uppercase tracking-wider text-base-content/40">{category}</p>
                            </div>
                            {#each categoryItems as item}
                                {@const flatIndex = filtered.indexOf(item)}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                <div
                                    role="option"
                                    aria-selected={flatIndex === selectedIndex}
                                    class="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg cursor-pointer transition-colors
                                           {flatIndex === selectedIndex ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}"
                                    on:click={() => navigate(item)}
                                    on:mouseenter={() => selectedIndex = flatIndex}
                                >
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium truncate">{item.title}</p>
                                        <p class="text-xs truncate {flatIndex === selectedIndex ? 'text-primary-content/70' : 'text-base-content/50'}">{item.subtitle}</p>
                                    </div>
                                    {#if flatIndex === selectedIndex}
                                        <svg class="w-4 h-4 shrink-0 text-primary-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    {/if}
                                </div>
                            {/each}
                        {/each}
                    </div>
                {:else}
                    <div class="px-4 py-8 text-center">
                        <p class="text-sm text-base-content/40">No results for "{query}"</p>
                    </div>
                {/if}

                <!-- Footer -->
                <div class="flex items-center gap-4 px-4 py-2 border-t border-base-300 bg-base-200/50">
                    <span class="flex items-center gap-1 text-[10px] text-base-content/30">
                        <kbd class="px-1 py-0.5 rounded bg-base-200 border border-base-300 font-mono">↑↓</kbd> navigate
                    </span>
                    <span class="flex items-center gap-1 text-[10px] text-base-content/30">
                        <kbd class="px-1 py-0.5 rounded bg-base-200 border border-base-300 font-mono">↵</kbd> open
                    </span>
                    <span class="flex items-center gap-1 text-[10px] text-base-content/30">
                        <kbd class="px-1 py-0.5 rounded bg-base-200 border border-base-300 font-mono">esc</kbd> close
                    </span>
                </div>
            </div>
        </div>
    </div>
{/if}
