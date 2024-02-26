<script lang="ts">
    export let isModalOpen:boolean;
    export let title:string;
    export let description:string;
</script>


<button class="btn bg-neutral-content text-accent-content hover:text-neutral-content h-40 shadow-lg" on:click={() => isModalOpen = true}>
    <div>
        <h2>{title}</h2>
        <p>{description}</p>
    </div>
</button>
<dialog id="my_modal_1" class="modal" class:modal-open={isModalOpen}>
    <div class="modal-box overflow-y-scroll h-screen max-w-none w-80vw">
        <div class="modal-header flex align-baseline justify-between h-10">
            <div>
                <h2 class="text-primary text-xl">{title}</h2>
                <p>{description}</p>
            </div>
            <div>
                <button class="btn hover:text-error" on:click={()=>isModalOpen = false}>X</button>
            </div>
        </div>
        <div class="modal-body m-10 bg-slate-400 p-10 rounded-md text-neutral">
            <slot/>
        </div>
    </div>
</dialog>