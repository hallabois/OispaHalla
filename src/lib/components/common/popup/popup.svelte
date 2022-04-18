<script lang="ts">
    import { fade } from "svelte/transition";
    export let open = false;
</script>

{#if open}
    <main class="lb-popup" on:click={()=>{open = false;}} out:fade>
        <div class="lb-popup-container" on:click={(e)=>{e.stopPropagation();}}>
            <div class="popup">
                <div class="lb-header">
                    <h2 class="lb-title">
                        <slot name="title">
                            This is a generic popup.
                        </slot>
                    </h2>
                    <div class="lb-buttons">
                        <slot name="buttons">
                            <button title="Close window" class="button background-none color-button" on:click={()=>{open=false;}}>×</button>
                        </slot>
                    </div>
                </div>
                <div class="lb-content">
                    <slot name="content">
                        <p>Please fill me with content.</p>
                    </slot>
                </div>
            </div>
        </div>
    </main>
{/if}

<style lang="scss">
    .popup {
        display: flex;
        flex-direction: column;
    }

    h2.lb-title {
        margin-bottom: 0;
    }
    button {
        color: var(--color);
    }

    @media (max-width: 600px) {
        .lb-popup-container{
            height: 100vh !important;
            width: 100vw !important;
            margin: 0 !important;
        }
        .popup{
            flex-direction: column-reverse;
            height: 100%;
        }
        .lb-header {
            margin-bottom: .75em;
        }
    }
</style>