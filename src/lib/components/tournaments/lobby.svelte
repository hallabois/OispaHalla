<script lang="ts">
    import { host_deleteGame, host_startGame, joined_game_am_host, joined_game_data, joined_game_error, joined_game_id, leaveGame, poll_game, poll_success, refreshGameData } from "$lib/tournamentstore";
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
            <p>Liitytty peliin "{$joined_game_data.name}"</p>
            <p>Liittymiskoodi on {$joined_game_id}</p>
            <div class="data">
                <div>
                    <h3>Aloitustilanne</h3>
                    <div class="game-preview">
                        <Board grid={hac_gamestate_to_grid($joined_game_data.starting_state)} />
                    </div>
                </div>
                <div>
                    <h3>Pelaajat</h3>
                    <p>{$joined_game_data.clients} {$joined_game_data.clients == 1 ? "pelaaja" : "pelaajaa"}</p>
                </div>
            </div>
        {:else}
            <p>Ladataan pelin tietoja...</p>
            <div class="data">
                <div>
                    <h3>...</h3>
                    <div class="game-preview"></div>
                </div>
                <div>
                    <h3>...</h3>
                </div>
            </div>
        {/if}
        {#if $joined_game_am_host && $poll_success}
            <div class="start">
                <button class="button action-btn" on:click={host_startGame} disabled={$poll_game.active}>Aloita Peli</button>
            </div>
        {/if}
        {#if !$joined_game_am_host && $poll_success}
            <div class="start">
                <p>Odotetaan pelin alkua...</p>
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
        gap: 1em;
    }
    .game-preview {
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
