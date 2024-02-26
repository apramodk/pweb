<script lang="ts">
    export let title:string;
    export let breif:string;
    export let handleClick:()=>void;
    export let expanded:boolean;
    export let intro:string;
    export let components:string[];
    export let media:string[];
    export let cbody:string;
</script>

<div class="Card_wrapper">
    <div class="{expanded ? 'expanded' : 'card'}" id="card">
        {#if expanded}
            <div class="cardHeader">
                <div class="cardTitle">
                    <h2>{title}</h2>
                    <p>{breif}</p>
                </div>
                <div class="cardToggleBack">
                    <button on:click={handleClick}/>
                </div>
            </div>
            <div class="report">
                <p><strong>Introduction:</strong>{intro}</p>
                <p><strong>Components:</strong></p>
                <ul>
                    {#each components as component}
                        <li>{component}</li>
                    {/each}
                </ul>
                <div class="mediaBox">
                    {#each media as med}
                        {@html med}
                    {/each}
                </div>
                {@html cbody}
                </div>
            {:else}
                <h2>{title}</h2>
                <p>{breif}</p>
                <button on:click={handleClick}>Read More</button>
            {/if}            
    </div>
</div>

<style>
    .Card_wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 20rem;
        border-color: black;
    }
    .card {
        background-color: #f3f4f6;
        width: 100%;
        max-width: 300px;
        padding: 1rem;
        margin: 1rem;
        border-radius: 10px;
        border: 1px solid #dce3ed;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }
    .expanded {
        display: flex;
        flex-direction: column;
        background-color: #f3f4f6;
        width: fit-content;
        /* max-width: 300px; */
        padding: 1rem;
        margin: 1rem;
        border-radius: 10px;
        border: 1px solid #dce3ed;
        /* blur the background */
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        height: fit-content;
        margin-top: 15rem;
        max-height: 30rem;
        overflow-y: scroll;
        z-index: 100;
        position:fixed;
    }
    .cardHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .cardTitle {
        display: flex;
        flex-direction: column;
    }
    .cardToggleBack {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .mediaBox {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
    }
</style>