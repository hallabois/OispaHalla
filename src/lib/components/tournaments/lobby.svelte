<script lang="ts">
    import { host_deleteGame, host_startGame, joined_game_am_host, joined_game_data, joined_game_error, joined_game_id, leaveGame, refreshGameData } from "$lib/tournamentstore";
    import Board from "../board/board.svelte";
    import { hac_gamestate_to_grid } from "$lib/legacy/utils";
</script>

<main>
    {#if $joined_game_error}
        <p>Virhe pelin tietoja haettaessa: {$joined_game_error}</p>
        <button on:click={refreshGameData}>Yritä Uudelleen</button>
        <button on:click={leaveGame}>Anna Olla</button>
    {:else}
        <div class="top">
            <button class="" on:click={leaveGame}>Poistu Pelistä</button>
            {#if $joined_game_am_host}
                Järjestäjä 👑
                <button class="" on:click={host_deleteGame}>
                    Poista Peli
                </button>
            {/if}
        </div>
        <hr />
        {#if $joined_game_data}
            <p>Liitytty peliin {$joined_game_id}: "{$joined_game_data.name}"</p>
            <div class="data">
                <div>
                    <h3>Aloitustilanne</h3>
                    <div class="game-preview">
                        <Board grid={hac_gamestate_to_grid($joined_game_data.starting_state)} />
                    </div>
                </div>
                <div>
                    <h3>Pelaajat</h3>
                </div>
            </div>
        {:else}
            <p>Ladataan pelin tietoja...</p>
            <div class="game-preview"></div>
        {/if}
        {#if $joined_game_am_host}
            <div class="start">
                <button class="button action-btn" on:click={host_startGame}>Aloita Peli</button>
            </div>
        {/if}
    {/if}
</main>

<style>
    .top {
        display: flex;
        justify-content: space-between;
    }
    .data {
        display: flex;
        flex-wrap: wrap;
    }
    .game-preview {
        /* --tile-size: calc(300px / 5) !important; */
        --field-width: 300px !important;
        --tile-size: calc(calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) / var(--grid-size));
        overflow: hidden;
        display: block;
        width: 300px;
        height: 300px;
        border-radius: 6px;
    }
    .start {
        margin-top: 1em;
    }
    hr {
        margin-block: .25em;
    }
</style>