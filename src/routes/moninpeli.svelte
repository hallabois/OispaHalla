<!-- Explain what global variables are to typescript -->
<script context="module" lang="ts">
    declare var onInitDone: Function;
</script>
<!-- / -->
<script lang="ts">
    import { marked } from 'marked';
    import { onMount } from "svelte";

    import Tournaments from "$lib/components/tournaments.svelte";
    import Board from "$lib/components/board/board.svelte";
    import { joined_game_data, joined_game_id, poll_board_string, poll_other_boards_string, poll_send_moves, poll_success } from '$lib/tournamentstore';
    import { hac_gamestate_to_grid } from '$lib/legacy/utils';
    import KeyboardInputManager from '$lib/legacy/keyboard_input_manager';

    let app_name = "Oispa Halla";
    let app_description = "Yhdistä opettajat ja saavuta **Halla!**";
    let app_notice = "**HUOMIO**: Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu minkäänlaiseen paremmuusjärjestykseen. Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.";
    let app_name_newgame = "Uusi Jakso";
    let app_name_score = "arvosana";
    let app_name_hiscore = "paras halla";

    let enableKIM = false;

    let grid = null;

    $: if($poll_board_string) {
        grid = hac_gamestate_to_grid($poll_board_string);
        enableKIM = true;
    }
    else if($joined_game_data) {
        grid = hac_gamestate_to_grid($joined_game_data.starting_state);
        enableKIM = false;
    }
    else {
        enableKIM = false;
    }

    function move(direction: number) {
        // console.log("move called with the value", direction);
        poll_send_moves.push(direction);
        // console.info(JSON.stringify(poll_send_moves));
    }

    let inputManager;
    let inputRoot;
    onMount(()=>{
        onInitDone();
        inputManager = new KeyboardInputManager(inputRoot);
        inputManager.on("move", move);
    });
    let TtInstance;
</script>

<main bind:this={inputRoot}>
    <Tournaments bind:this={TtInstance} />
    <div class="board-container">
        <Board {enableKIM} {grid} />
        <button class="button background-none color-button" on:click={()=>{TtInstance.show()}} title="Tournament Mode">
            ⚔
        </button>
        {#if $joined_game_id && $poll_success}
            <div class="mini-container">
                    {#each $poll_other_boards_string as board_string}
                        <div class="mini-grid">
                            <Board grid={hac_gamestate_to_grid(board_string)} />
                        </div>
                    {/each}
            </div>
        {/if}
    </div>
</main>


<style>
    .board-container {
        display: grid;
        place-items: center;
    }
    .mini-container {
        --field-width: calc(500px / 4) !important;
        --grid-gap: calc(15px / 4);
        --tile-size: calc(calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) / var(--grid-size));

        display: flex;
        gap: .5em;
    }
    .mini-grid {
        width: var(--field-width);
        height: var(--field-width);
        overflow: hidden;
    }
    :global(.mini-container .tile-inner) {
        animation: none !important;
        -moz-animation: none !important;
        -webkit-animation: none !important;
    }
</style>
<div class="patches">
    <script src="js/application.js"></script>
    <div class="preload-container" />
</div>