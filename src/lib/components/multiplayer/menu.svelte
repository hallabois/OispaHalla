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
		multiplayer_endpoint,
		known_error,
		user_details
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
	import Icon from "../common/icon/icon.svelte";
	import {
		backIconData,
		browseIconData,
		createIconData,
		passwordIconData,
		pinIconData,
		settingsIconData,
		shareIconData,
		userIconData
	} from "../common/icon/iconData";
	import { page } from "$app/stores";
	import Busy from "../common/loading-indicator/Busy.svelte";

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

<div style="width: min(500px, 90vw);" />

{#if mounted}
	{#if $user_details}
		<p>Kirjautuneena sisään: {$user_details.name || $user_details.id}</p>
	{/if}
	{#if $auth}
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
					connected to {$multiplayer_endpoint}
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
						class="button action-btn icon-btn"
					>
						<Icon
							d={browseIconData}
							fill="var(--button-color)"
							viewBox="0 -960 960 960"
							height="1.5em"
							width="1.5em"
							take_no_space={true}
						/>
						<p>Selaa Julkisia Pelejä</p>
					</button>
					<button
						on:click={() => {
							activeTab = 2;
						}}
						class="button action-btn icon-btn"
					>
						<Icon
							d={pinIconData}
							fill="var(--button-color)"
							viewBox="0 -960 960 960"
							height="1.5em"
							width="1.5em"
						/>
						<p>Liity Peliin Koodilla</p>
					</button>
					<hr />
					<button
						on:click={() => {
							activeTab = 1;
						}}
						class="button action-btn icon-btn"
					>
						<Icon
							d={createIconData}
							fill="var(--button-color)"
							viewBox="0 -960 960 960"
							height="1.5em"
							width="1.5em"
						/>
						<p>Luo Peli</p>
					</button>
					<hr />
				</div>
			{:else}
				<button
					class="button action-btn icon-btn back"
					on:click={() => {
						activeTab = 0;
					}}
				>
					<Icon
						d={backIconData}
						fill="var(--color)"
						viewBox="0 -960 960 960"
						height="1.5em"
						width="1.5em"
					/>
					Takaisin
				</button>
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
			<Busy>
				<p>Otetaan yhteyttä palvelimeen</p>
			</Busy>
		{:else}
			<p style="text-align: center;display: block;padding: 0.75em;">
				Palvelimeen ei saatu yhteyttä
			</p>
		{/if}
	{:else if $auth === undefined}
		<Busy>
			<p>Tarkistetaan tietoja</p>
		</Busy>
	{:else}
		<button
			on:click={() => {
				window.location.href = "/auth";
			}}
			class="button action-btn icon-btn"
			style="width: 100%;">Kirjaudu sisään</button
		>
	{/if}
{:else}
	<Busy>
		<p>Ladataan tietoja</p>
	</Busy>
{/if}
{#if activeTab == 0}
	<div class="links">
		{#if $page.url.pathname == "/moninpeli"}
			<a href="/" class="link-with-icon button action-btn icon-btn discourage">
				<Icon
					d={backIconData}
					fill="var(--color)"
					viewBox="0 -960 960 960"
					height="1.5em"
					width="1.5em"
				/>
				<p>Takaisin yksinpeliin</p>
			</a>
		{/if}
		{#if $auth}
			<a href="/auth" class="link-with-icon button action-btn icon-btn action-btn">
				<Icon
					d={userIconData}
					fill="var(--color)"
					viewBox="0 -960 960 960"
					height="1.5em"
					width="1.5em"
				/>
				<p>Hallinnoi kirjautumista</p>
			</a>
		{/if}
	</div>
{/if}

<style>
	.action-chooser {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin-top: 0.5em;
	}
	.icon-btn {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.icon-btn p {
		flex: 1;
		margin: 0;
	}
	.back {
		font-size: 0.75em;
	}
	.links {
		text-align: center;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		margin-top: 0.5em;
	}
	.links > * {
		flex-grow: 1;
	}
	.link-with-icon {
		display: flex;
		gap: 0.25rem;
	}
	.link-with-icon > p {
		flex-grow: 1;
	}
	hr {
		margin-block: 0;
	}
</style>
