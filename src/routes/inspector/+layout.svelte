<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    let mounted = false;
    onMount(()=>{
        mounted = true;
    })
</script>

{#if browser}
    {#if mounted}
        <slot />
    {:else}
        <p>Ladataan niitä näitä...</p>
    {/if}
{:else}
    <p>Ladataan tietoja palvelimelta...</p>
{/if}