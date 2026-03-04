<svelte:head>
    <title>Software Projects — Akash Pramod Kumar</title>
</svelte:head>

<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;

    const rainbow = ['#61BB46', '#FDB827', '#F5821F', '#E03A3E', '#963D97', '#009DDC'];
</script>

<div class="max-w-6xl mx-auto px-6 py-12">
    <header class="mb-10">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight"><span class="rainbow-underline">Software Projects</span></h1>
        <p class="mt-3 text-base-content/60 font-mono text-sm">Developer tools, AI systems, and side projects</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each data.projects as project}
            <div class="rounded-window bg-base-100 border border-base-300 shadow-window
                        hover:shadow-window-hover hover:-translate-y-0.5 hover:border-primary/30
                        transition-all duration-200 overflow-hidden">
                <!-- Title bar -->
                <div class="flex items-center gap-2 px-4 py-2.5 bg-base-200 border-b border-base-300">
                    <div class="flex gap-1.5" aria-hidden="true">
                        <span class="w-3 h-3 rounded-full bg-mac-red"></span>
                        <span class="w-3 h-3 rounded-full bg-mac-yellow"></span>
                        <span class="w-3 h-3 rounded-full bg-mac-green"></span>
                    </div>
                    <span class="flex-1 text-center text-xs font-mono opacity-50 truncate">{project.title}</span>
                    <div class="w-[54px]"></div>
                </div>
                <!-- Card body -->
                <div class="p-5">
                    <h2 class="text-lg font-semibold text-base-content">{project.title}</h2>
                    <p class="text-sm text-base-content/70 mt-1">{project.description}</p>
                    <p class="text-xs text-base-content/50 mt-2">{project.detail}</p>

                    <!-- Tech pills -->
                    {#if project.tech?.length}
                        <div class="flex flex-wrap gap-2 mt-4">
                            {#each project.tech as t, i}
                                <span
                                    class="px-2.5 py-0.5 rounded-full text-white text-xs font-mono shadow-md"
                                    style="background-color: {rainbow[i % 6]}"
                                >{t}</span>
                            {/each}
                        </div>
                    {/if}

                    <!-- GitHub link -->
                    {#if project.github_url}
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg
                                   bg-base-200 border border-base-300 text-sm font-medium
                                   shadow-btn-retro hover:shadow-none hover:translate-y-px
                                   transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            View on GitHub
                        </a>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>
