<svelte:head>
    <title>{data.writing.title} — Akash Pramod Kumar</title>
</svelte:head>

<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;

    const rainbow = ['#61BB46', '#FDB827', '#F5821F', '#E03A3E', '#963D97', '#009DDC'];
</script>

<div class="max-w-3xl mx-auto px-6 py-12">
    <!-- Header -->
    <header class="mb-10">
        <a href="/research" class="text-sm text-primary font-mono hover:underline mb-4 inline-block">&larr; Back to Research</a>
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">{data.writing.title}</h1>
        {#if data.writing.authors?.length}
            <p class="mt-2 text-base-content/60 text-sm">
                {data.writing.authors.join(', ')}
            </p>
        {/if}
        {#if data.writing.published_date}
            <p class="text-xs text-base-content/40 font-mono mt-1">{data.writing.published_date}</p>
        {/if}
        {#if data.writing.tags?.length}
            <div class="flex flex-wrap gap-2 mt-4">
                {#each data.writing.tags as tag, i}
                    <span
                        class="px-2.5 py-0.5 rounded-full text-white text-xs font-mono shadow-md"
                        style="background-color: {rainbow[i % 6]}"
                    >{tag}</span>
                {/each}
            </div>
        {/if}
    </header>

    <!-- Abstract -->
    {#if data.writing.abstract}
        <div class="mb-8 p-4 bg-base-200 border border-base-300 rounded-lg">
            <p class="text-sm font-semibold mb-1">Abstract</p>
            <p class="text-sm text-base-content/70 leading-relaxed">{data.writing.abstract}</p>
        </div>
    {/if}

    <!-- Content -->
    <article class="prose prose-sm max-w-none
                    prose-headings:text-base-content prose-p:text-base-content/80
                    prose-a:text-primary prose-code:text-primary
                    prose-pre:bg-base-200 prose-pre:border prose-pre:border-base-300">
        {@html data.writing.content}
    </article>
</div>
