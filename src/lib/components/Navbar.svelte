<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { createEventDispatcher } from 'svelte';
    export let isDarkMode: boolean = false;

    const dispatch = createEventDispatcher();
    $: currentPath = $page.url.pathname;
</script>

<header class="sticky top-0 z-50 border-b border-base-300 bg-base-200/80 backdrop-blur-md">
    <nav class="navbar max-w-6xl mx-auto px-4">
        <div class="flex-1">
            <a
                href="{base}/"
                class="text-xl font-semibold tracking-tight hover:text-primary transition-colors"
            >
                <span class="opacity-50 mr-1">&#8984;</span>APK
            </a>
        </div>
        <div class="flex items-center gap-1">
            <a
                href="{base}/HCI"
                class="btn btn-ghost btn-sm font-mono text-sm {currentPath.includes('/HCI') ? 'bg-base-300 text-primary' : ''}"
            >
                HCI
            </a>
            <a
                href="{base}/software"
                class="btn btn-ghost btn-sm font-mono text-sm {currentPath.includes('/software') ? 'bg-base-300 text-primary' : ''}"
            >
                Software
            </a>
            <a
                href="{base}/research"
                class="btn btn-ghost btn-sm font-mono text-sm {currentPath.includes('/research') ? 'bg-base-300 text-primary' : ''}"
            >
                Research
            </a>
            <button
                class="btn btn-ghost btn-sm btn-square"
                on:click={() => dispatch('search')}
                aria-label="Search (⌘K)"
            >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
            <button
                class="btn btn-ghost btn-sm btn-square"
                on:click={() => isDarkMode = !isDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {#if isDarkMode}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                    </svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                {/if}
            </button>
        </div>
    </nav>
</header>
