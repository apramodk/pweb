<script lang="ts">
    import "tailwindcss/tailwind.css";
    import { Navbar } from "$lib/index";
    
    let isDarkMode:boolean;
    let theme = [ "retro", "forest"];
    let cls = ["","bg-base-content"];
</script>

<body data-theme={theme[Number(isDarkMode)]} class={cls[Number(isDarkMode)]}>
    <Navbar bind:isDarkMode={isDarkMode}/>
    <slot>
    </slot>
</body>


<style>
    body{
        width: 100vw;
        height: 100vh;
    }
</style>