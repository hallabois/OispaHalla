<script lang="ts">
    import { joined_game_data, joined_game_error, joined_game_id, leaveGame, refreshGameData } from "$lib/tournamentstore";
</script>

<main>
    {#if $joined_game_error}
        <p>Virhe pelin tietoja haettaessa: {$joined_game_error}</p>
        <button on:click={refreshGameData}>Yritä Uudelleen</button>
        <button on:click={leaveGame}>Anna Olla</button>
    {:else}
        {#if $joined_game_data}
            <p>Liitytty peliin {$joined_game_id}: "{$joined_game_data.name}"</p>
        {:else}
            <p>Ladataan pelin tietoja...</p>
        {/if}
        <button on:click={leaveGame}>Poistu Pelistä</button>
    {/if}
</main>

<style>

</style>