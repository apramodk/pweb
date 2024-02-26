<script lang="ts">
    import "tailwindcss/tailwind.css";
    import { Navbar } from "$lib/index";
</script>

<body data-theme="dim">
    <Navbar/>
    <slot>
    </slot>
</body>


<style>
    body{
        width: 100vw;
        height: 100vh;
    }
</style>