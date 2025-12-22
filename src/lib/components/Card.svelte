<script lang="ts">
    export let isModalOpen:boolean;
    export let title:string;
    export let description:string;
</script>


<button class="btn bg-neutral-content text-accent-content hover:text-neutral-content h-32 md:h-40 w-full shadow-lg" on:click={() => isModalOpen = true}>
    <div class="text-left">
        <h2 class="text-sm md:text-base font-semibold">{title}</h2>
        <p class="text-xs md:text-sm opacity-80">{description}</p>
    </div>
</button>
<dialog id="my_modal_1" class="modal" class:modal-open={isModalOpen}>
    <div class="modal-box overflow-y-scroll h-[90vh] md:h-screen max-w-none w-[95vw] md:w-[80vw] p-4 md:p-6">
        <div class="modal-header flex items-start justify-between gap-2 mb-4">
            <div class="flex-1 min-w-0">
                <h2 class="text-primary text-lg md:text-xl font-semibold">{title}</h2>
                <p class="text-sm md:text-base">{description}</p>
            </div>
            <div class="flex-shrink-0">
                <button class="btn btn-sm md:btn-md hover:text-error" on:click={()=>isModalOpen = false}>X</button>
            </div>
        </div>
        <div class="modal-body mx-0 md:mx-10 bg-slate-400 p-4 md:p-10 rounded-md text-neutral">
            <slot/>
        </div>
    </div>
</dialog>