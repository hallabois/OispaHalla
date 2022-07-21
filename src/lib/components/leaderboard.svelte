<script lang="ts">
    import Popup from "./common/popup/popup.svelte";
    import type Announcer from "./tournaments/announcer.svelte";
    import {lb_screenName, lb_id, check_server_alive, get_all_scores, submit_score, get_top_scores, my_top_scores, my_top_submitted_scores, my_top_score_histories} from "../leaderboardstore";

    function submitUnsubmittedTopScores() {
        for(let s of [3, 4]) {
            let top_saved = $my_top_scores.get(s) || -1;
            let top_submitted = $my_top_submitted_scores.get(s) || -1;
            if(top_saved > top_submitted) {
                console.info(`Please submit score for size ${s}...`);
                submitting = true;
                size = s;
                show();
                return;
            }
        }
    }
    function getHACString(run: any[]) {
        return size + "x" + size + "S" + run.join(":");
    }
    async function submit() {
        let starting_size = size;
        let result = await submit_score(starting_size, $lb_id, $lb_screenName as string, $my_top_scores.get(starting_size) as number, 0, getHACString($my_top_score_histories.get(starting_size)));
        console.info("submit result", result);
        if(result.message) {
            if(announcer) {
                announcer.announce(result.message);
            }
        }
        if(result.success) {
            $my_top_submitted_scores.set(starting_size, $my_top_scores.get(starting_size) as number);
            submitting = false;
        }
    }
    $: if($my_top_scores && $my_top_submitted_scores) {
        check_server_alive().then((alive)=>{
            if(alive) {
                submitUnsubmittedTopScores();
            }
        })
    }

    export let open = false;
    export let size = 4;
    export let submitting = false;
    export function show() {
        open = true;
        //checkServerAlive();
    }

    function editScreenName() {
        let new_name = prompt("Uusi nimimerkki", $lb_screenName || undefined);
        if(new_name && new_name != $lb_screenName) {
            lb_screenName.set(new_name);
            if(announcer) {
                announcer.announce("Nimimerkki muutettu");
            }
        }
        else {
            if(announcer) {
                announcer.announce("Nimimerkki ei muuttunut");
            }
        }
    }

    export let announcer: Announcer|null = null;
</script>

<Popup bind:open>
    <span slot="title">Leaderboards {size}x{size}</span>
    <div slot="content" class="content">
        {#await check_server_alive()}
            <p>Otetaan yhteyttä palvelimeen...</p>
        {:then alive}
            {#if alive}
                {#if submitting}
                    <p>Tallennetaas sun tulos!</p>
                    <button on:click={submit} class="button action-btn" style="width: 100%;">Tallenna</button>
                    <button on:click={()=>{submitting = false;}} class="button" style="width: 100%;font-weight: normal !important;">Älä Tallenna Vielä</button>
                {:else}
                    <div class="size-selection">
                        {#each [3, 4] as s}
                            <button class="button action-btn" on:click={()=>{size = s;}} disabled={size == s}>{s}</button>
                        {/each}
                    </div>
                    {#await get_top_scores(size, 10)}
                        <p>Ladataan tuloksia...</p>
                    {:then top}
                        <div style="max-height: 300px;overflow-y: scroll;">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sija</th>
                                        <th>Pisteet</th>
                                        <th>Nimi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each top as entry, index}
                                        <tr>
                                            <td>{index+1}.</td>
                                            <td>{entry.score}</td>
                                            <td>{entry.user ? entry.user.screenName : "[Virheellinen nimi]"}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/await}
                    <div class="my-results">
                        <tr>
                            <td>Mun Sija</td>
                            <td>Mun Pisteet</td>
                            <td>{$lb_screenName}</td>
                        </tr>
                    </div>
                {/if}
                <div>
                    {#if $lb_screenName}
                        <button on:click={editScreenName} class="button action-btn" style="width: 100%;">Muuta nimimerkkiä "{$lb_screenName}"</button>
                    {:else}
                        <button on:click={editScreenName} class="button action-btn" style="width: 100%;">Lisää nimimerkki</button>
                    {/if}
                </div>
            {:else}
                <p>Virhe otettaessa yhteyttä palvelimeen.</p>
            {/if}
        {/await}
        {#if false}
            <div class="debug">
                <p>Top saved: {JSON.stringify(Array.from($my_top_scores))}</p>
                <p>Top submitted: {JSON.stringify(Array.from($my_top_submitted_scores))}</p>
                <p>Top histories: {$my_top_score_histories}</p>
            </div>
        {/if}
    </div>
</Popup>

<style>
    .size-selection {
        display: flex;
        gap: .5em;
        flex-wrap: wrap;
    }
    .size-selection * {
        flex: 1;
    }
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
    .content {
        display: flex;
        flex-direction: column;
        gap: .5em;
    }
</style>