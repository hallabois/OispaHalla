<script lang="ts">
    import { getPublicTournaments } from "$lib/tournamentstore";


    let filter;
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
                {#each result.ongoing_games.filter(x=>filter==null||(x+"").includes(filter)) as game}
                    <div class="game">
                        <p>{game}</p>
                    </div>
                {/each}
            </div>
        {/if}
    {/await}
</main>

<style>
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
</style>