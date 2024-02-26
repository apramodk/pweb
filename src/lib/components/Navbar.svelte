<script lang="ts">
    import { base } from '$app/paths';
    export let isDarkMode:boolean=false;
    let txtc = ["","text-base-content"];
</script>

<div class="navbar bg-base-300 sticky top-0 z-10">
    <div class="flex-1">
        <a href="{base}/" class="btn btn-ghost normal-case text-xl {txtc[Number(isDarkMode)]} hover:text-neutral-content">APK</a>
    </div>
    <div class="flex-none">
        <nav>
                <a href="{base}/HCI" class="btn btn-ghost normal-case {txtc[Number(isDarkMode)]} hover:text-neutral-content">HCI</a>
        </nav>
        <div class="form-control" >
            <label class="label cursor-pointer">
                <input type="checkbox" class="toggle hover:bg-secondary " bind:checked={isDarkMode} />
            </label>
        </div>
    </div>
</div>