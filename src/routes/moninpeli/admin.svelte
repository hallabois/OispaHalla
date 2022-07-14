<script lang="ts">
    import { tournament_endpoint } from "$lib/tournamentstore";
    let admin_token: string;
    let admin_token_checking = false;
    let admin_token_valid = false;
    $: {
        if(admin_token != null && admin_token != "" && admin_token.length > 2) {
            admin_token_checking = true;
            testAdminToken().then((v) => {
                admin_token_valid = v;
                admin_token_checking = false;
            });
        }
        else{
            admin_token_valid = false;
            admin_token_checking = false;
        }
    }

    let action_status: null | boolean = null; // Null: Clear, true: OK, false: Error

    function confirm_action() {
        let answer = prompt("Please retype the admin token");
        return answer === admin_token;
    }

    async function testAdminToken() {
        let result = await fetch(`${tournament_endpoint}/admin/games/0/${admin_token}`);
        return result.ok || result.status != 401;
    }

    async function getGames() {
        return fetch(`${tournament_endpoint}/admin/games/${admin_token}`);
    }

    async function deleteAllGames() {
        if(confirm_action()) {
            console.log("Confirmation received, deleting all games...");
            let result = await fetch(`${tournament_endpoint}/admin/clean/${admin_token}`, {
                method: 'DELETE',
                // headers: {
                //     'Content-type': 'application/json'
                // }
            });
            console.log("Deletion request result:", result);
            action_status = result.ok;
        }
    }
    
</script>

<main>
    {#if action_status != null}
        {#if action_status}
            <p>Action successful!</p>
        {:else}
            <p>Error completing action, check the console for details.</p>
        {/if}
    {/if}
    <div class="header">
        <div class="header-bar">
            <h1>OispaHalla™ Multiplayer Admin Panel</h1>
            {#if admin_token_valid}
                <button
                    on:click={
                        ()=>{
                            admin_token = "";
                        }
                    }
                >Log Out</button>
            {/if}
        </div>
        {#if admin_token_valid}
            <div class="actions">
                <button on:click={deleteAllGames}>Delete ALL Games</button>
            </div>
        {/if}
        <hr />
    </div>
    {#if admin_token_valid}
        <div class="content">
            {#await getGames()}
                <p>Loading games</p>
            {:then resp} 
                {#if resp.ok}
                    {#await resp.json()}
                        <p>Parsing JSON</p>
                    {:then data} 
                        {#if data.ongoing_games && data.ongoing_games.length > 0}
                            <div class="game">
                                {#each Object.keys(data.ongoing_games[0]) as key}
                                    <p
                                        style="flex: 1;text-align: center;"
                                    >{key}</p>
                                {/each}
                            </div>
                        {:else}
                            <p>No games atm</p>
                        {/if}
                        {#each data.ongoing_games as game}
                            <div class="game">
                                {#each Object.keys(game) as key}
                                    <p
                                        style="flex: 1;text-align: center;"
                                    >{game[key]}</p>
                                {/each}
                            </div>
                        {/each}
                    {/await}
                {:else}
                    <p>Failed to get games: {resp.statusText}</p>
                {/if}
            {/await}
        </div>
    {:else}
        <div class="content">
            <label for="admin_token">Admin token</label>
            <input
                id="admin_token"
                bind:value={admin_token} 
            />
        </div>
    {/if}
</main>

<style>
    :global(html, body) {
        color-scheme: dark;
    }
    main {
        display: flex;
        flex-direction: column;
        min-height: 100vh;

        color: #e6d2bf;
    }
    .header-bar {
        display: flex;
        flex-wrap: wrap;
        margin: .5em;
        align-items: center;
        justify-content: space-between;
    }
    .actions {
        margin: .5em;
    }
    .content {
        flex: 1;

        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: .5em;
    }

    .game {
        display: flex;
        gap: .5em;
        width: 100%;
        justify-content: space-around;
    }

    h1 {
        margin: 0;
    }
    hr {
        margin: 0;
        margin-bottom: 1em;
    }
    p {
        margin: 0;
        line-height: 1;
    }
</style>