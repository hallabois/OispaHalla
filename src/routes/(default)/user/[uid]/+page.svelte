<script lang="ts">
	import Game from "$lib/components/board/game.svelte";
	import type { Score } from "$lib/server/leaderboards";
	import { numberWithSpaces } from "$lib/utils";
	import type { PageData } from "./$types";

	export let data: PageData;
	console.log("data", data);
	$: user_data = data.resp;
	let selected_score_size = data.size;
	let selected_score_data: Score | null;
	let selected_score_frames: string[] | null = null;
	let selected_score_framecount: number | null;

	import { ready, wasm, init as initWasm } from "$lib/wasm/twothousand_forty_eight";
	import { onMount } from "svelte";
	import { enable_user_page_wasm } from "$lib/config";
	import type { GameSize } from "$lib/gamelogic/new";
	import type { Tile } from "twothousand-forty-eight";

	let board_cache: { [key in GameSize]: Tile[] | undefined } = {
		2: undefined,
		3: undefined,
		4: undefined,
		5: undefined,
		6: undefined
	};
	$: if (
		$wasm &&
		selected_score_data &&
		selected_score_size &&
		board_cache[selected_score_size] == undefined
	) {
		console.log(`caching history for size ${selected_score_size}...`);
		console.info("wasm atm", $wasm);
		let gamestate = $wasm.get_gamestate(selected_score_data?.history);
		board_cache[selected_score_size] = gamestate.board.tiles
			.flat()
			.flat()
			.flatMap((tile) => (tile ? [tile] : []))
			.filter((tile) => tile.value !== 0);
		console.log("cache complete.");
	}

	let selected_frames: { [key: number]: number } = {};

	onMount(async () => {
		await initWasm();
	});
</script>

<svelte:head>
	{#if user_data.data}
		<title>{user_data.data.screenName}</title>
	{:else}
		<title>Puuttuva OispaHalla-käyttäjä {data.uid}</title>
	{/if}
</svelte:head>

<main class="blurry-bg">
	<div class="nav">
		<a href="/">Takaisin OispaHallaan</a>
		<a href="/leaderboards">Leaderboards</a>
	</div>
	<div class="content">
		{#if user_data.data}
			{@const udata = user_data.data}
			<h1>{udata.screenName}</h1>
			<div class="size-selector">
				{#each Object.keys(udata.scores) as k}
					<a
						data-sveltekit-replacestate
						href={`?size=${k}`}
						class="tab"
						class:active={selected_score_size == +k}
					>
						{k}×{k}
					</a>
				{/each}
			</div>
			{#if selected_score_data != null && selected_score_size != null}
				{@const histlen = selected_score_frames?.length || 1}
				<h2>
					{numberWithSpaces(selected_score_data.score)} pistettä
				</h2>
				<h3 class="stats">
					<span title={`${selected_score_data.score / histlen} pps`}>{histlen} siirtoa</span>
					<span
						>{selected_score_data.breaks}
						{selected_score_data.breaks == 1 ? "kurinpalautus" : "kurinpalautusta"}</span
					>
				</h3>
				<h3>Saavutettu {new Date(selected_score_data.updatedAt).toLocaleString()}</h3>
				<hr />
				<div class="game-preview">
					<Game
						move={(direction) => false}
						restart={(force) => false}
						revertMove={() => false}
						grid={board_cache[selected_score_size] || []}
					/>
				</div>
				{#if enable_user_page_wasm && false}
					<div class="playback-controls">
						{#if !$ready}
							<progress />
						{:else if selected_score_framecount != null}
							{@const selected_frame = selected_frames[selected_score_size]}
							{@const frame_count = selected_score_framecount - 1}
							<p>
								<code
									>{(selected_frame + "").padStart(
										(frame_count + "").length,
										"0"
									)}/{frame_count}</code
								>
							</p>
							<input
								type="range"
								min="0"
								max={frame_count}
								bind:value={selected_frames[selected_score_size]}
							/>
							<div>
								<button
									disabled={selected_frame == 0}
									on:click={() => {
										selected_frames[selected_score_size] = (selected_frame || 0) - 1;
									}}>&lt;</button
								>
								<button
									disabled={selected_frame == frame_count}
									on:click={() => {
										selected_frames[selected_score_size] = (selected_frame || 0) + 1;
									}}>&gt;</button
								>
							</div>
						{:else}
							<p>Tulkitaan peliä...</p>
						{/if}
					</div>
				{/if}
			{/if}
		{:else}
			<p>Virhe: {user_data.err}</p>
		{/if}
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		min-height: 100svh;
		background-attachment: fixed;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.content {
		flex: 1;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.size-selector {
		display: flex;
		gap: 0.25em;
	}
	.nav {
		min-width: 100vw;
		box-sizing: border-box;
		padding: 0.1em 0.5em;
		display: flex;
		gap: 0.5em;
	}
	h1,
	h2,
	h3,
	h4,
	p {
		margin: 0;
	}
	hr {
		min-width: min(500px, 90vw);
		margin-block: 0.333em !important;
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25em;

		justify-content: center;
		align-items: center;
	}
	.stats > * {
		margin-inline: 0.375em;
	}
	.playback-controls {
		width: 100%;

		display: flex;
		min-height: 40px;
		align-items: center;
		gap: 1em;
		padding-inline: 1em;
		box-sizing: border-box;
	}
	.playback-controls input,
	.playback-controls progress {
		flex: 1;
	}

	/* Prevent tile animations */
	/* :global(.tile-new) :global(.tile-inner) {
		-webkit-animation: none !important;
		-moz-animation: none !important;
		animation: none !important;
	} */
</style>
