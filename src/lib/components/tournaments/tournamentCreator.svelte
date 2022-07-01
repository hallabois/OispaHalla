<script lang="ts">
    import { createTournament, joinGame } from "$lib/tournamentstore";
    let name;
    let create_public = true;
    let max_clients = 4;
    let password;
    $: t_valid = create_public != null && (!create_public || (name != null && name.length > 0)) && max_clients != null && max_clients > 0;

    let createRequest;
    function createT() {
        createRequest = createTournament(create_public ? name : "private", create_public, max_clients, password);
    }
</script>

<main>
    {#if createRequest}
        {#await createRequest}
            <p>Luodaan peliä...</p>
        {:then data}
            <p>DEBUG: {data.status_code}</p>
            {#if data.success}
                <p>Peli luotu!</p>
                <p>ID: {data.tournament_id}</p>
                {#await joinGame(data.tournament_id, data.join_password, true, data.edit_key)}
                    <p>Liitytään peliin...</p>
                {:then result} 
                    <p>{JSON.stringify(result)}</p>
                {/await}
            {:else if data.status_code == 1}
                <p>Nimi on jo käytössä</p>
            {:else}
                <p>Peliä luodessa sattui virhe.</p>
            {/if}
        {/await}
    {:else}
        <div class="creator">
            <div class="input-section">
                <label for="ispublic">Julkinen</label>
                <input type="checkbox" id="ispublic" bind:checked={create_public} />
            </div>
            {#if create_public}
                <div class="input-section">
                    <label type="text" for="name">Pelin Nimi</label>
                    <input id="name" bind:value={name} />
                </div>
            {/if}
            <div class="input-section">
                <label for="max_clients">Pelaajien määrä</label>
                <input type="number" id="max_clients" bind:value={max_clients} />
            </div>
            <div class="input-section">
                <label for="pswd">Salasana</label>
                <input type="password" id="pswd" bind:value={password} placeholder="Voit jättää salasanan tyhjäksi" />
            </div>
            <button disabled={!t_valid} on:click={createT} class="button action-btn">Luo</button>
        </div>
    {/if}
</main>

<style>
    .creator {
        display: flex;
        flex-direction: column;
        gap: .5em;
    }
    .input-section {
        display: flex;
    }
    .input-section * {
        flex: 1;
    }
</style>