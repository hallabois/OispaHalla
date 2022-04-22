<script lang="ts">
    import { fade } from "svelte/transition";
    import { getPublicTournaments } from "$lib/tournamentstore";


    let filter;
    let chosen_game;
    $: canJoin = chosen_game != null;

    export let joinedGameId;
</script>

<main>
    {#await getPublicTournaments()}
        <p>Haetaan pelejä...</p>
    {:then result} 
        <p>DEBUG: {result.status_code}</p>
        {#if result.success}
            <div>
                <p>Löydettiin {result.ongoing_games.length} {result.ongoing_games.length == 1 ? "julkinen peli" : "julkista peliä"}!</p>
                <input class="search" bind:value={filter} placeholder="Hae pelejä nimen perusteella" />
            </div>
            <hr />
            <div class="games">
                {#each result.ongoing_games.filter(x=>filter==null||(x.name).includes(filter)||chosen_game == x.id) as game, id (game.id)}
                    <div class="game" class:selected={chosen_game == game.id} on:click={()=>{chosen_game = game.id}} in:fade={{delay: id*50}}>
                        <p>{game.name}</p>
                        <spacer />
                        <p>{game.clients} {game.clients == 1 ? "pelaaja " : "pelaajaa"}</p>
                    </div>
                {/each}
            </div>
            <hr />
            <button disabled={!canJoin} on:click={()=>{joinedGameId=chosen_game}} class="button action-btn fill-w">Liity</button>
        {/if}
    {/await}
</main>

<style>
    .fill-w {
        width: calc(100%);
    }
    .search {
        width: calc(100% - 2em);
        padding: .25em 1em;
    }
    .games {
        max-height: 50vh;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        gap: .25em;
    }
    .game {
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: .25em 1em;
        border-radius: .25em;
        cursor: pointer;
    }
    .game:hover {
        background: var(--background);
    }
    .game.selected {
        background: var(--color);
        color: var(--background);
    }
</style>