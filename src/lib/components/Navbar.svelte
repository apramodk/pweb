<script lang="ts">
    import { base } from '$app/paths';
    export let isDarkMode:boolean=false;
    let txtc = ["text-base-content", ""];
</script>

<div class="navbar bg-base-300 sticky top-0 z-10 px-2 md:px-4">
    <div class="flex-1">
        <a href="{base}/" class="btn btn-ghost normal-case text-lg md:text-xl {txtc[Number(isDarkMode)]} hover:text-neutral-content">APK</a>
    </div>
    <div class="flex-none gap-1 md:gap-2">
        <nav>
                <a href="{base}/HCI" class="btn btn-ghost btn-sm md:btn-md normal-case text-sm md:text-base {txtc[Number(isDarkMode)]} hover:text-neutral-content">HCI</a>
        </nav>
        <div class="form-control">
            <label class="label cursor-pointer p-1 md:p-2">
                <input type="checkbox" class="toggle toggle-sm md:toggle-md hover:bg-secondary" bind:checked={isDarkMode} />
            </label>
        </div>
    </div>
</div>