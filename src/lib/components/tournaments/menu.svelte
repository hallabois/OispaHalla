<script lang="ts">
	import { onMount } from "svelte";

	import { auth } from "$lib/Auth/authstore";

	import {
		connected,
		connect,
		joined_game_id,
		connection_error,
		tournament_announcer
	} from "$lib/stores/tournamentstore";
	import TournamentCreator from "$lib/components/tournaments/tournamentCreator.svelte";
	import TournamentBrowser from "$lib/components/tournaments/tournamentBrowser.svelte";
	import Lobby from "$lib/components/tournaments/lobby.svelte";
	import TournamentJoiner from "$lib/components/tournaments/tournamentJoiner.svelte";
	import type Announcer from "$lib/components/common/announcer/announcer.svelte";
	import { browser } from "$app/environment";

	export let announcer: Announcer | null = null;
	$: $tournament_announcer = announcer;
	let chosen_game: number | null | undefined = null;

	$: if (browser && chosen_game == null && window.location.href.includes("?")) {
		let params = new URLSearchParams(window.location.href.split("?")[1]);
		let game_id = params.get("game_id");
		if (game_id) {
			console.log("read game_id", game_id);
			chosen_game = +game_id;
			activeTab = 2;
			history.replaceState(null, "Oispa Halla", "moninpeli");
		}
	}

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	let activeTab = 0;
</script>

<a href="/" data-sveltekit-reload>Takaisin yksinpeliin</a>
{#if mounted}
	{#if $auth}
		<p>Kirjautuneena sisään: {$auth.displayName || $auth.email}</p>
		{#if $connected}
			{#if $connection_error}
				<p style="text-align: center;display: block;padding: 0.75em;">
					Virhe otettaessa yhteyttä palvelimeen.
				</p>
			{:else if $joined_game_id != null}
				<Lobby {announcer} />
			{:else if !activeTab || activeTab == 0}
				<div class="action-chooser">
					<button
						on:click={() => {
							activeTab = 1;
						}}
						class="button action-btn">Luo Peli</button
					>
					<button
						on:click={() => {
							activeTab = 2;
						}}
						class="button action-btn">Liity Peliin Koodilla</button
					>
					<button
						on:click={() => {
							activeTab = 3;
						}}
						class="button action-btn">Selaa Julkisia Pelejä</button
					>
				</div>
				<a href="/auth" style="text-align: center;display: block;padding: 0.75em;"
					>Hallinnoi kirjautumista</a
				>
			{:else}
				<button
					class="button action-btn back"
					on:click={() => {
						activeTab = 0;
					}}>&lt; Takaisin</button
				>
				{#if activeTab == 1}
					<TournamentCreator />
				{/if}
				{#if activeTab == 2}
					<TournamentJoiner {chosen_game} />
				{/if}
				{#if activeTab == 3}
					<TournamentBrowser />
				{/if}
			{/if}
		{:else if $connected == null}
			<h3>Otetaan yhteyttä palvelimeen...</h3>
		{:else}
			<h3>Palvelimeen ei saatu yhteyttä.</h3>
			<button on:click={connect}>Yritä uudelleen</button>
		{/if}
	{:else if $auth === undefined}
		<p style="text-align: center;display: block;padding: 0.75em;">Tarkistetaan tietoja</p>
	{:else}
		<button
			on:click={() => {
				window.location.href = "/auth";
			}}
			class="button action-btn"
			style="width: 100%;">Kirjaudu sisään</button
		>
	{/if}
{:else}
	<p style="text-align: center;display: block;padding: 0.75em;">Ladataan tietoja</p>
{/if}

<style>
	.action-chooser {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin-top: 0.5em;
	}
	.back {
		font-size: 0.75em;
	}
</style>
