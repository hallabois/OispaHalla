<script lang="ts">
	import { onMount } from "svelte";
	import { LinkedChart } from "svelte-tiny-linked-charts";

	import { auth } from "$lib/Auth/authstore";

	import {
		connected,
		connect,
		joined_game_id,
		connection_error,
		tournament_announcer,
		tournament_ping_average,
		tournament_ping_average_history,
		tournament_endpoint,
		known_error
	} from "$lib/stores/multiplayer";
	import GameCreator from "./gameCreator.svelte";
	import GameBrowser from "./gameBrowser.svelte";
	import Lobby from "./lobby.svelte";
	import GameJoiner from "./gameJoiner.svelte";
	import type Announcer from "$lib/components/common/announcer/announcer.svelte";
	import { browser, dev } from "$app/environment";
	import { storage_loaded } from "$lib/stores/storage";
	import NameChanger from "../leaderboard/nameChanger.svelte";
	import { lb_screenName } from "$lib/stores/leaderboard";

	export let announcer: Announcer | null = null;
	$: $tournament_announcer = announcer;
	let chosen_game: number | null | undefined = null;

	$: if (
		browser &&
		chosen_game == null &&
		window.location.href.includes("?") &&
		$storage_loaded &&
		$auth
	) {
		let params = new URLSearchParams(window.location.href.split("?")[1]);
		let game_id = params.get("game_id");
		if (game_id) {
			console.log("read game_id", game_id);
			chosen_game = game_id;
			activeTab = 2;
		}
	}

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	let activeTab = 0;
	let chartWidth = 500;

	let NameChangerInstance: NameChanger;
	function editScreenName() {
		NameChangerInstance.show();
	}
</script>

<a href="/" style="width: min(500px, 90vw);">Takaisin yksinpeliin</a>
{#if mounted}
	{#if $auth}
		<p>Kirjautuneena sisään: {$auth.displayName || $auth.email}</p>
		{#if $known_error}
			{#if $known_error == "error.mp.info.lb"}
				<div class="action-chooser">
					{#if $lb_screenName}
						<button on:click={editScreenName} class="button action-btn" style="flex:1;"
							>Muuta nimimerkkiä "{$lb_screenName}"</button
						>
					{:else}
						<button on:click={editScreenName} class="button action-btn" style="flex:1;"
							>Lisää nimimerkki</button
						>
					{/if}
				</div>
				<NameChanger
					{announcer}
					bind:this={NameChangerInstance}
					callback={() => {
						connect();
					}}
				/>
			{:else}
				<p>Virhe: {$known_error}</p>
			{/if}
		{:else if $connected}
			{#if dev}
				<p>
					{#if $tournament_ping_average}
						{Math.round($tournament_ping_average)} ms latency
					{:else}
						measuring latency...
					{/if}
				</p>
				<LinkedChart
					data={$tournament_ping_average_history}
					width={chartWidth}
					fill="var(--button-background)"
				/><br />
				<p bind:clientWidth={chartWidth} style="opacity: .5;">
					connected to {$tournament_endpoint}
				</p>
			{/if}
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
							activeTab = 3;
						}}
						class="button action-btn">Selaa Julkisia Pelejä</button
					>
					<button
						on:click={() => {
							activeTab = 2;
						}}
						class="button action-btn">Liity Peliin Koodilla</button
					>
					<hr />
					<button
						on:click={() => {
							activeTab = 1;
						}}
						class="button action-btn">Luo Peli</button
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
					<GameCreator />
				{/if}
				{#if activeTab == 2}
					<GameJoiner {chosen_game} />
				{/if}
				{#if activeTab == 3}
					<GameBrowser />
				{/if}
			{/if}
		{:else if $connected == null}
			<h3>Otetaan yhteyttä palvelimeen...</h3>
		{:else}
			<h3>Palvelimeen ei saatu yhteyttä.</h3>
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
	hr {
		margin-block: 0;
	}
</style>
