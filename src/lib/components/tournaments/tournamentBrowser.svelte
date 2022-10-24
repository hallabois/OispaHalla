<script lang="ts">
	import { fade, slide } from "svelte/transition";
	import {
		connected,
		game_index,
		request_index,
		request_join,
		user_details
	} from "$lib/stores/tournamentstore";

	$: if (connected && $game_index == null) {
		request_index();
	}

	let filter: string | null;
	let chosen_game: number | null;
	let game_requires_password = false;
	let passwords: { [key: number]: string } = {};
	$: canJoin = chosen_game != null;
	//  && !(game_requires_password && (passwords[chosen_game] == null || passwords[chosen_game] == ""))

	function selectGame(game: any) {
		chosen_game = game.id;
		game_requires_password = game.requires_password;
	}
</script>

<main>
	{#if $user_details}
		{#if !$game_index}
			<p>Haetaan pelejä...</p>
		{:else}
			<div>
				<p>
					Löydettiin {$game_index.joinable_games.length}
					{$game_index.joinable_games.length == 1 ? "julkinen peli" : "julkista peliä"}!
				</p>
				<input class="search" bind:value={filter} placeholder="Hae pelejä nimen perusteella" />
			</div>
			<hr />
			<div class="games">
				{#each $game_index.joinable_games.filter((x) => filter == null || x.name.includes(filter) || chosen_game == x.id) as game, index}
					{@const am_host = $user_details.admin || $user_details.user_id == game.creator}
					<div
						class="game"
						class:selected={chosen_game == game.id}
						on:click={() => {
							selectGame(game);
						}}
						title={game.id + ""}
					>
						<p>{game.name}</p>
						<spacer />
						{#if am_host}
							<p title="Olet tämän pelin luoja">👑</p>
						{/if}
						{#if game.requires_password}
							<p title="Tähän peliin liittyminen vaatii salasanan">🔐</p>
						{/if}
						<p>{game.clients}/{game.max_clients} {game.clients == 1 ? "pelaaja " : "pelaajaa"}</p>
					</div>
					{#if game.requires_password && chosen_game == game.id && !am_host}
						<div>
							<label for="pswd">Salasana:</label>
							<!-- svelte-ignore a11y-autofocus -->
							<input bind:value={passwords[game.id]} autofocus />
						</div>
					{/if}
				{/each}
			</div>
			<hr />
			<button
				disabled={!canJoin}
				on:click={() => {
					if (chosen_game) request_join(chosen_game, passwords[chosen_game]);
				}}
				class="button action-btn fill-w">Liity</button
			>
		{/if}
	{/if}
</main>

<style>
	.fill-w {
		width: calc(100%);
	}
	.search {
		width: calc(100% - 2em);
		padding: 0.25em 1em;
	}
	.games {
		max-height: 30vh;
		min-height: 2em;
		overflow-y: auto;

		display: flex;
		flex-direction: column;
		gap: 0.25em;
	}
	.game {
		display: flex;
		align-items: center;
		gap: 0.5em;

		padding: 0.5em 1em;
		border-radius: 0.25em;
		cursor: pointer;
		transition: background 200ms, color 200ms;
	}
	.game:hover {
		background: var(--background);
	}
	.game.selected {
		background: var(--color);
		color: var(--background);
	}
	.game p {
		margin: 0;
	}
	spacer {
		flex: 1;
	}
	hr {
		margin-block: 0.5em;
	}
	.err {
		color: red;
		display: flex;
		align-items: baseline;
	}
</style>
