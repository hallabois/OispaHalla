<script lang="ts">
    import Popup from "$lib/components/common/popup/popup.svelte";
    import { checkAlive } from "$lib/tournamentstore";
    import TournamentCreator from "./tournaments/tournamentCreator.svelte";
    import TournamentBrowser from "./tournaments/tournamentBrowser.svelte";
import Lobby from "./tournaments/lobby.svelte";

    export let open = false;
    export function show() {
        open = true;
        checkServerAlive();
    }

    let serverAlive;
    async function checkServerAlive() {
        serverAlive = await checkAlive();
    }

    let activeTab = 0;
    let joinedGameId;
</script>

<Popup bind:open>
    <span slot="title">Moninpeli</span>
    <div slot="content">
        {#if serverAlive}
            {#if joinedGameId != null}
                <Lobby bind:joinedGameId />
            {:else}
                {#if !activeTab || activeTab == 0}
                    <div class="action-chooser">
                        <button on:click={()=>{activeTab = 1}} class="button action-btn">Luo Peli</button>
                        <button on:click={()=>{activeTab = 2}} class="button action-btn">Liity Peliin Koodilla</button>
                        <button on:click={()=>{activeTab = 3}} class="button action-btn">Selaa Julkisia Pelejä</button>
                    </div>
                {:else}
                    <button class="button action-btn back" on:click={()=>{activeTab = 0}}>&lt; Takaisin</button>
                    {#if activeTab == 1}
                        <TournamentCreator bind:joinedGameId />
                    {/if}
                    {#if activeTab == 3}
                        <TournamentBrowser bind:joinedGameId />
                    {/if}
                {/if}
            {/if}
        {:else if serverAlive == null}
            <h3>Otetaan yhteyttä palvelimeen...</h3>
        {:else}
            <h3>Palvelimeen ei saatu yhteyttä.</h3>
            <button on:click={checkServerAlive}>Yritä uudelleen</button>
        {/if}
    </div>
</Popup>

<style>
    .action-chooser {
        display: flex;
        flex-direction: column;
        gap: .5em;
        margin-top: .5em;
    }
    .back {
        font-size: .75em;
    }
</style>