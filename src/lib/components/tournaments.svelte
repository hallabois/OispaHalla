<script lang="ts">
    import { onMount } from "svelte";

    import Popup from "$lib/components/common/popup/popup.svelte";
    import { checkAlive, joined_game_id, joined_game_error, poll_success, poll_game, joined_game_user_id, joined_game_am_host, joined_game_host_pswds, refreshGameData } from "$lib/tournamentstore";
    import TournamentCreator from "./tournaments/tournamentCreator.svelte";
    import TournamentBrowser from "./tournaments/tournamentBrowser.svelte";
    import Lobby from "./tournaments/lobby.svelte";
    import TournamentJoiner from "./tournaments/tournamentJoiner.svelte";
    import type Announcer from "./tournaments/announcer.svelte";

    export let open = false;
    export function show() {
        open = true;
        checkServerAlive();
    }

    export let announcer: Announcer = null;

    let serverAlive;
    async function checkServerAlive() {
        serverAlive = await checkAlive();
    }

    $: if($joined_game_id != null && !window.location.href.endsWith("/moninpeli")) {
        console.log("Moving to multiplayer...");
        let data = {
            "game_id": $joined_game_id,
            "user_id": $joined_game_user_id,
            "am_host": $joined_game_am_host,
            "host_pswd": joined_game_host_pswds[$joined_game_id]
        };
        localStorage["mp_data"] = JSON.stringify(data);
        window.location.href = `/moninpeli`;
    }

    let activeTab = 0;
    let wasActive = false;
    $: if($poll_success && $poll_game) {
        if($poll_game.active && !wasActive) {
            open = false;
            wasActive = true;
            if(announcer) {
                announcer.announce("Peli on alkanut!");
            }
        }
        else if(!$poll_game.active){
            wasActive = false;
        }
    }
    else {
        wasActive = false;
    }

    onMount(()=>{
        if(window.location.href.includes("game_id")) {
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop as string),
            });
            
        }
        else{
            if(localStorage["mp_data"] != null && window.location.href.endsWith("/moninpeli")) {
                let data = JSON.parse(localStorage["mp_data"]);
                if(data) {
                    console.log("READ MP_DATA", data);

                    joined_game_id.set(data.game_id);
                    joined_game_user_id.set(data.user_id);
                    joined_game_am_host.set(data.am_host);
                    joined_game_host_pswds[data.game_id] = data.host_pswd;
                    refreshGameData();

                    // localStorage["mp_data"] = null;
                    show();
                }
            }
        }
    });
</script>

<Popup bind:open>
    <span slot="title">Moninpeli</span>
    <div slot="content">
        {#if serverAlive}
            {#if $joined_game_id != null}
                <Lobby />
            {:else}
                {#if !activeTab || activeTab == 0}
                    <div class="action-chooser">
                        <button on:click={()=>{activeTab = 1}} class="button action-btn">Luo Peli</button>
                        <button on:click={()=>{activeTab = 2}} class="button action-btn">Liity Peliin Koodilla</button>
                        <button on:click={()=>{activeTab = 3}} class="button action-btn">Selaa Julkisia Pelejä</button>
                    </div>
                {:else}
                    <button class="button action-btn back" on:click={()=>{activeTab = 0;joined_game_error.set(null)}}>&lt; Takaisin</button>
                    {#if activeTab == 1}
                        <TournamentCreator />
                    {/if}
                    {#if activeTab == 2}
                        <TournamentJoiner />
                    {/if}
                    {#if activeTab == 3}
                        <TournamentBrowser />
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