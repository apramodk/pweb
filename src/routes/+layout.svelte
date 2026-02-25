<script lang="ts">
    import "tailwindcss/tailwind.css";
    import { Navbar, Footer } from "$lib/index";
    import { onMount } from "svelte";

    let isDarkMode: boolean = false;

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
    <Navbar bind:isDarkMode={isDarkMode} />
    <main class="flex-1">
        <slot />
    </main>
    <Footer />
</div>

<style>
    :global(html) {
        scroll-behavior: smooth;
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
