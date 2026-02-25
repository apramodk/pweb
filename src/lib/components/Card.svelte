<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { tick } from 'svelte';

    export let isModalOpen: boolean;
    export let title: string;
    export let description: string;

    let modalElement: HTMLDivElement;
    let previouslyFocused: HTMLElement | null = null;

    function closeModal() {
        isModalOpen = false;
        previouslyFocused?.focus();
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            closeModal();
            return;
        }
        if (e.key === 'Tab' && modalElement) {
            const focusable = modalElement.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
            }
        }
    }

    $: if (typeof document !== 'undefined') {
        document.body.style.overflow = isModalOpen ? 'hidden' : '';
    }

    $: if (isModalOpen && typeof document !== 'undefined') {
        previouslyFocused = document.activeElement as HTMLElement;
        tick().then(() => {
            modalElement?.querySelector<HTMLElement>('button')?.focus();
        });
    }
</script>

<svelte:window on:keydown={isModalOpen ? handleKeydown : undefined} />

<!-- Card Button -->
<button
    class="group w-full rounded-window bg-base-100 border border-base-300 shadow-window
           hover:shadow-window-hover hover:-translate-y-0.5 hover:border-primary/30
           transition-all duration-200 text-left overflow-hidden cursor-pointer"
    on:click={() => isModalOpen = true}
>
    <!-- Title bar -->
    <div class="flex items-center gap-2 px-4 py-2.5 bg-base-200 border-b border-base-300">
        <div class="flex gap-1.5" aria-hidden="true">
            <span class="w-3 h-3 rounded-full bg-mac-red"></span>
            <span class="w-3 h-3 rounded-full bg-mac-yellow"></span>
            <span class="w-3 h-3 rounded-full bg-mac-green"></span>
        </div>
        <span class="flex-1 text-center text-xs font-mono opacity-50 truncate">{title}</span>
        <div class="w-[54px]"></div>
    </div>
    <!-- Card body -->
    <div class="p-5">
        <h2 class="text-lg font-semibold text-base-content">{title}</h2>
        <p class="text-sm opacity-70 mt-1">{description}</p>
    </div>
</button>

<!-- Modal -->
{#if isModalOpen}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        transition:fade={{ duration: 150 }}
        on:click|self={closeModal}
    >
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true"></div>

        <!-- Modal window -->
        <div
            bind:this={modalElement}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            class="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-window md:rounded-window
                   rounded-t-window bg-base-100 border border-base-300 shadow-window-hover
                   flex flex-col overflow-hidden"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <!-- Modal title bar -->
            <div class="flex items-center gap-2 px-4 py-2.5 bg-base-200 border-b border-base-300 shrink-0">
                <div class="flex gap-1.5">
                    <button
                        class="relative w-7 h-7 -m-2 flex items-center justify-center
                               focus:outline-none group/close"
                        on:click={closeModal}
                        aria-label="Close modal"
                    >
                        <span class="w-3 h-3 rounded-full bg-mac-red group-hover/close:brightness-90
                                     transition-all group-focus/close:ring-2 group-focus/close:ring-mac-red
                                     group-focus/close:ring-offset-1"></span>
                    </button>
                    <span class="w-3 h-3 rounded-full bg-mac-yellow" aria-hidden="true"></span>
                    <span class="w-3 h-3 rounded-full bg-mac-green" aria-hidden="true"></span>
                </div>
                <span class="flex-1 text-center text-xs font-mono opacity-50 truncate">{title}</span>
                <div class="w-[54px]"></div>
            </div>

            <!-- Modal content -->
            <div class="flex-1 overflow-y-auto p-6 md:p-10">
                <div class="prose prose-sm max-w-none
                            prose-headings:text-base-content prose-p:text-base-content/90
                            prose-strong:text-base-content prose-li:text-base-content/90
                            prose-a:text-primary prose-code:text-primary
                            prose-pre:bg-base-200 prose-pre:border prose-pre:border-base-300">
                    <slot />
                </div>
            </div>
        </div>
    </div>
{/if}
