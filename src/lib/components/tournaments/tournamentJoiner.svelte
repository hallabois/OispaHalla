<script lang="ts">
	import { fade } from "svelte/transition";
	import { game_details, request_game_details, request_join } from "$lib/stores/tournamentstore";

	export let chosen_game: number | null = null;
	let requires_password = false;
	let password: string | null;
	let canJoin = false;
	$: game_id_valid = chosen_game != null && !isNaN(chosen_game);
	$: if (chosen_game && game_id_valid) {
		if ($game_details[chosen_game]) {
			requires_password = $game_details[chosen_game].requires_password;
			if (!requires_password) {
				canJoin = true;
			}
		} else {
			request_game_details(chosen_game);
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
		width: calc(100% - 2em);
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
