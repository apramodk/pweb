<svelte:head>
    <title>HCI &amp; Embedded Systems — Akash Pramod Kumar</title>
</svelte:head>

<script lang="ts">
    import { Card, Images } from '$lib/index';
    import { slide } from 'svelte/transition';
    import { base } from '$app/paths';
    import type { PageData } from './$types';

    export let data: PageData;

    let expanded: Record<string, boolean> = {};

    function toggleExpand(id: string) {
        expanded[id] = !expanded[id];
    }
</script>

<div class="max-w-6xl mx-auto px-6 py-12">
    <header class="mb-10">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight"><span class="rainbow-underline">HCI &amp; Embedded Systems</span></h1>
        <p class="mt-3 text-base-content/60 font-mono text-sm">Hardware prototypes from UTK's Human-Computer Interaction course</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each data.projects as project}
            <Card
                title={project.title}
                description={project.short_description}
                isModalOpen={false}
            >
                <div>
                    <!-- Render rich text content as HTML -->
                    <div class="prose prose-sm max-w-none
                                prose-headings:text-base-content prose-p:text-base-content/80
                                prose-strong:text-base-content prose-li:text-base-content/80">
                        {@html project.content.replace(/\n/g, '<br>')}
                    </div>

                    <!-- YouTube embeds -->
                    {#each project.youtube_urls || [] as url}
                        <div class="flex justify-center p-5">
                            <div class="aspect-video w-full max-w-lg">
                                <iframe
                                    class="w-full h-full rounded-lg"
                                    src={url}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowfullscreen
                                ></iframe>
                            </div>
                        </div>
                    {/each}

                    <!-- Local video embeds -->
                    {#each project.local_videos || [] as videoPath}
                        <div class="flex justify-center p-5">
                            <video class="w-full max-w-lg rounded-lg" controls src="{base}{videoPath}">
                                <track kind="captions" />
                            </video>
                        </div>
                    {/each}

                    <!-- Image galleries -->
                    {#each project.image_indices || [] as imgIdx}
                        <div class="flex justify-center p-5">
                            <Images im_index={imgIdx} />
                        </div>
                    {/each}

                    <!-- Code blocks -->
                    {#each project.code_blocks || [] as block}
                        <button
                            on:click={() => toggleExpand(block.id)}
                            class="px-4 py-2 rounded-lg bg-primary text-primary-content text-sm font-medium
                                   shadow-btn-retro hover:shadow-none hover:translate-y-px transition-all
                                   focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mr-2 mt-2"
                        >
                            {expanded[block.id] ? `Hide ${block.label}` : block.label}
                        </button>
                        {#if expanded[block.id]}
                            <div transition:slide={{ duration: 200 }}>
                                <pre class="mt-3 bg-base-200 border border-base-300 rounded-lg p-4 overflow-x-auto text-sm"><code>{block.code}</code></pre>
                            </div>
                        {/if}
                    {/each}
                </div>
            </Card>
        {/each}
    </div>
</div>
