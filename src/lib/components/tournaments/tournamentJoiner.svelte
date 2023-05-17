<script lang="ts">
	import { fade } from "svelte/transition";
	import { game_details, request_game_details, request_join } from "$lib/stores/tournamentstore";

	export let chosen_game: number | null = null;
	$: chosen_game_number = chosen_game == null ? null : +chosen_game;
	let requires_password = false;
	let password: string | null;
	let canJoin = false;
	$: game_id_valid = chosen_game != null && !isNaN(chosen_game) && (chosen_game + "").length == 5;
	$: if (chosen_game_number && game_id_valid) {
		let details = $game_details[chosen_game_number];
		if (details) {
			if (details.requires_password && !details.started) {
				requires_password = true;
			} else if (!details.started) {
				canJoin = true;
			}
		} else {
			request_game_details(chosen_game_number);
		}
	} else {
		canJoin = false;
		requires_password = false;
	}
	$: if (requires_password && password) {
		canJoin = password != null && password.length > 0;
	}
</script>

<div class="main">
	<!-- svelte-ignore a11y-autofocus -->
	<input
		bind:value={chosen_game}
		placeholder="Kirjoita liittymiskoodi tähän"
		autofocus={!requires_password}
	/>
	{#if requires_password}
		<!-- svelte-ignore a11y-autofocus -->
		<input bind:value={password} placeholder="Peli vaatii salasanan" autofocus />
	{/if}
	{#if false}
		<div class="err" transition:fade|local>
			<p>Virhe: (err)</p>
			<spacer />
			<button
				on:click={() => {
					// Clear error
				}}>×</button
			>
		</div>
	{/if}
	{#if game_id_valid && chosen_game_number != null}
		{@const game = $game_details[chosen_game_number]}
		{#if game}
			<div class="game-info-card">
				<p>{game.name}</p>
				<p>{game.clients.length} / {game.max_clients} pelaajaa</p>
				{#if game.started}
					<p>Peli on jo alkanut</p>
				{/if}
			</div>
		{/if}
	{/if}
	<button
		disabled={!canJoin}
		on:click={() => {
			if (chosen_game) {
				request_join(chosen_game, password);
			}
		}}
		class="button action-btn fill-w">Liity</button
	>
</div>

<style>
	.main {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin-top: 1em;
	}
	.fill-w {
		width: calc(100%);
	}
	input {
		width: 100%;
		padding: 0.25em 1em;
		font-size: 1.15em;
	}
	.err {
		color: red;
		display: flex;
		align-items: baseline;
	}
	spacer {
		flex: 1;
	}
</style>
