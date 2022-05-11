<script lang="ts">
    import { host_startGame, joined_game_am_host, joined_game_data, joined_game_error, joined_game_id, leaveGame, refreshGameData } from "$lib/tournamentstore";
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
                Admin 👑
            {/if}
        </div>
        <hr />
        {#if $joined_game_data}
            <p>Liitytty peliin {$joined_game_id}: "{$joined_game_data.name}"</p>
        {:else}
            <p>Ladataan pelin tietoja...</p>
        {/if}
        {#if $joined_game_am_host}
            <div>
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
    hr {
        margin-block: .25em;
    }
</style>