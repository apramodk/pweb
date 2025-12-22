<script lang="ts">
    import "tailwindcss/tailwind.css";
    import { Navbar } from "$lib/index";
    
    let isDarkMode:boolean;
    let theme = ["dim", "retro"];
</script>

<body data-theme={theme[Number(isDarkMode)]}>
    <Navbar bind:isDarkMode={isDarkMode}/>
    <slot>
    </slot>
</body>


<style>
    body{
        width: 100%;
        min-height: 100vh;
        overflow-x: hidden;
    }
</style>