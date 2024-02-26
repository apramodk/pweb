<script lang="ts">
    import "tailwindcss/tailwind.css";
    import { Navbar } from "$lib/index";
    
    let isDarkMode:boolean;
    let theme = [ "retro", "dim"];
</script>

<body data-theme={theme[Number(isDarkMode)]}>
    <Navbar bind:isDarkMode={isDarkMode}/>
    <slot>
    </slot>
</body>


<style>
    body{
        width: 100vw;
        min-height: 100vh;
    }
</style>