<script lang="ts">
    import Popup from "./common/popup/popup.svelte";
    import type Announcer from "./tournaments/announcer.svelte";
    import {check_server_alive} from "../leaderboardstore.js";

    export let open = false;
    export function show() {
        open = true;
        //checkServerAlive();
    }

    export let announcer: Announcer|null = null;
</script>

<Popup bind:open>
    <span slot="title">Leaderboards</span>
    <div slot="content">
        {#await check_server_alive()}
            <p>Otetaan yhteyttä palvelimeen...</p>
        {:then alive}
            {#if alive}
                <p>Alive!</p>
            {:else}
                <p>Virhe otettaessa yhteyttä palvelimiin.</p>
            {/if}
        {/await}
    </div>
</Popup>

<style>

</style>