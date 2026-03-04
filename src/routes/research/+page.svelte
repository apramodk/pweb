<svelte:head>
    <title>Research — Akash Pramod Kumar</title>
</svelte:head>

<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;

    const rainbow = ['#61BB46', '#FDB827', '#F5821F', '#E03A3E', '#963D97', '#009DDC'];
</script>

<div class="max-w-4xl mx-auto px-6 py-12">
    <header class="mb-10">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight"><span class="rainbow-underline">Research</span></h1>
        <p class="mt-3 text-base-content/60 font-mono text-sm">Writing, notes, and research experience</p>
    </header>

    <!-- Publications / Writing -->
    <section class="mb-16">
        <h2 class="text-xl font-semibold mb-6"><span class="rainbow-underline">Writing</span></h2>
        <div class="rounded-window bg-base-100 border border-base-300 shadow-window overflow-hidden">
            <!-- Title bar -->
            <div class="flex items-center gap-2 px-4 py-2.5 bg-base-200 border-b border-base-300">
                <div class="flex gap-1.5" aria-hidden="true">
                    <span class="w-3 h-3 rounded-full bg-mac-red"></span>
                    <span class="w-3 h-3 rounded-full bg-mac-yellow"></span>
                    <span class="w-3 h-3 rounded-full bg-mac-green"></span>
                </div>
                <span class="flex-1 text-center text-xs font-mono opacity-50">~/Research/Writing</span>
                <div class="w-[54px]"></div>
            </div>
            {#if data.writings.length > 0}
                <nav class="divide-y divide-base-300">
                    {#each data.writings as w, i}
                        <a
                            href="/research/{w.slug}"
                            class="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors group"
                        >
                            <span class="text-lg" aria-hidden="true">&#128196;</span>
                            <div class="flex-1">
                                <p class="font-medium text-sm group-hover:text-primary transition-colors">{w.title}</p>
                                {#if w.abstract}
                                    <p class="text-xs opacity-50 line-clamp-2">{w.abstract}</p>
                                {/if}
                                <div class="flex items-center gap-2 mt-1">
                                    {#if w.published_date}
                                        <span class="text-xs opacity-30 font-mono">{w.published_date}</span>
                                    {/if}
                                    {#if w.tags?.length}
                                        {#each w.tags.slice(0, 3) as tag, j}
                                            <span
                                                class="px-1.5 py-0.5 rounded-full text-white text-[10px] font-mono"
                                                style="background-color: {rainbow[(i + j) % 6]}"
                                            >{tag}</span>
                                        {/each}
                                    {/if}
                                </div>
                            </div>
                            <svg class="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    {/each}
                </nav>
            {:else}
                <div class="px-6 py-10 text-center">
                    <p class="text-base-content/40 font-mono text-sm">No publications yet.</p>
                    <p class="text-base-content/30 text-xs mt-1">Research docs and write-ups will appear here.</p>
                </div>
            {/if}
        </div>
    </section>

    <!-- Research Experience -->
    <section>
        <h2 class="text-xl font-semibold mb-6"><span class="rainbow-underline">Research Experience</span></h2>
        <div class="space-y-8">
            {#each data.positions as r, i}
                <div class="rounded-window bg-base-100 border border-base-300 shadow-window overflow-hidden">
                    <!-- Title bar -->
                    <div class="flex items-center gap-2 px-4 py-2.5 bg-base-200 border-b border-base-300">
                        <div class="flex gap-1.5" aria-hidden="true">
                            <span class="w-3 h-3 rounded-full bg-mac-red"></span>
                            <span class="w-3 h-3 rounded-full bg-mac-yellow"></span>
                            <span class="w-3 h-3 rounded-full bg-mac-green"></span>
                        </div>
                        <span class="flex-1 text-center text-xs font-mono opacity-50 truncate">{r.lab_name}</span>
                        <div class="w-[54px]"></div>
                    </div>
                    <!-- Body -->
                    <div class="p-6">
                        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-4">
                            <div>
                                <h3 class="text-lg font-semibold">{r.lab_name}</h3>
                                <p class="text-sm text-primary font-mono">{r.institution}</p>
                                <p class="text-xs text-base-content/50 mt-0.5">{r.role}</p>
                            </div>
                            <p class="text-xs text-base-content/50 font-mono shrink-0">{r.period} &middot; {r.location}</p>
                        </div>

                        <p class="text-sm text-base-content/70 leading-relaxed">{r.description}</p>

                        {#if r.topics?.length}
                            <div class="flex flex-wrap gap-2 mt-4">
                                {#each r.topics as topic, j}
                                    <span
                                        class="px-2.5 py-0.5 rounded-full text-white text-xs font-mono shadow-md"
                                        style="background-color: {rainbow[(i * 3 + j) % 6]}"
                                    >{topic}</span>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </section>
</div>
