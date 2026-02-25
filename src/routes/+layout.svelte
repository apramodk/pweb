<script lang="ts">
    import "tailwindcss/tailwind.css";
    import { Navbar, Footer } from "$lib/index";
    import Spotlight from "$lib/components/Spotlight.svelte";
    import { onMount } from "svelte";

    let isDarkMode: boolean = false;
    let spotlightOpen = false;

    onMount(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        isDarkMode = prefersDark;
    });

    $: {
        const theme = isDarkMode ? "macdark" : "maclight";
        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", theme);
        }
    }
</script>

<div class="flex flex-col min-h-screen {!isDarkMode ? 'pinstripe' : ''}">
    <div class="apple-rainbow h-1 w-full shrink-0" aria-hidden="true"></div>
    <Navbar bind:isDarkMode={isDarkMode} on:search={() => spotlightOpen = true} />
    <main class="flex-1">
        <slot />
    </main>
    <Footer />
</div>

<Spotlight bind:isOpen={spotlightOpen} />

<style>
    :global(html) {
        scroll-behavior: smooth;
    }
    .apple-rainbow {
        background: linear-gradient(
            90deg,
            #61BB46 0%,
            #61BB46 16.66%,
            #FDB827 16.66%,
            #FDB827 33.33%,
            #F5821F 33.33%,
            #F5821F 50%,
            #E03A3E 50%,
            #E03A3E 66.66%,
            #963D97 66.66%,
            #963D97 83.33%,
            #009DDC 83.33%,
            #009DDC 100%
        );
    }
    .pinstripe {
        background-image: repeating-linear-gradient(
            180deg,
            transparent,
            transparent 3px,
            rgba(0, 0, 0, 0.015) 3px,
            rgba(0, 0, 0, 0.015) 4px
        );
    }
</style>
