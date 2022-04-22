<script lang="ts">
    import { joinGame } from "$lib/tournamentstore";

    let chosen_game;
    $: canJoin = chosen_game != null && chosen_game.length > 0 && !isNaN(chosen_game) && !isNaN(parseFloat(chosen_game));
</script>

<main>
    <input bind:value={chosen_game} placeholder="Kirjoita liittymiskoodi tähän" autofocus/>
    <button disabled={!canJoin} on:click={()=>{joinGame(chosen_game)}} class="button action-btn fill-w">Liity</button>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        gap: .5em;
        margin-top: 1em;
    }
    .fill-w {
        width: calc(100%);
    }
    input {
        width: calc(100% - 2em);
        padding: .25em 1em;
        font-size: 1.15em;
    }
</style>