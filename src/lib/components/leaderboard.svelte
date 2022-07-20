<script lang="ts">
    import Popup from "./common/popup/popup.svelte";
    import type Announcer from "./tournaments/announcer.svelte";
    import {check_server_alive, get_all_scores, get_top_scores} from "../leaderboardstore.js";

    export let open = false;
    export function show() {
        open = true;
        //checkServerAlive();
    }

    export let announcer: Announcer|null = null;
</script>

<Popup bind:open>
    <span slot="title">Leaderboards top 10</span>
    <div slot="content">
        {#await check_server_alive()}
            <p>Otetaan yhteyttä palvelimeen...</p>
        {:then alive}
            {#if alive}
                {#await get_top_scores(4, 10)}
                    <p>Ladataan leaderboardeja...</p>
                {:then top}
                    <div style="max-height: 300px;overflow-y: scroll;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pisteet</th>
                                    <th>Nimi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each top as entry}
                                    <tr>
                                        <td>{entry.score}</td>
                                        <td>{entry.user.screenName}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/await}
            {:else}
                <p>Virhe otettaessa yhteyttä palvelimeen.</p>
            {/if}
        {/await}
    </div>
</Popup>

<style>
    table {
        width: 100%;

        border: 1px solid;
        border-collapse: collapse;

        text-align: left;

        max-height: 200px;
        overflow-y: scroll;
    }
    td, th {
        padding: .25em .5em;
    }
    td {
        border: 1px solid;
    }
</style>