<script lang="ts">
	import Board from "$lib/components/board/board.svelte";
	import { ohts_gamestate_to_grid } from "$lib/gamelogic/utils";
	import { numberWithSpaces, type Score } from "./util";
	import type { PageData } from "./$types";
	import Grid from "$lib/gamelogic/grid";
	import Tile from "$lib/gamelogic/tile";

	export let data: PageData;
	$: user_data = data.resp;
	let selected_score_size: number | null = data.size;
	$: if (user_data && user_data.data && selected_score_size == null) {
		let keys = Object.keys(user_data.data.scores);
		let preferred_scores = [4, 3, 2, 5];
		for (let prefkey of preferred_scores) {
			if (keys.includes(prefkey + "")) {
				selected_score_size = prefkey;
				break;
			}
		}
	}
	let selected_score_data: Score | null;
	let selected_score_frames: string[] | null = null;
	let selected_score_framecount: number | null;
	let selected_score_last_grid: Grid | null;
	$: if (user_data && user_data.data && selected_score_size) {
		selected_score_data = user_data.data.scores[selected_score_size];
		if (selected_score_data) {
			let record = selected_score_data.history;
			let history = record.split("S")[1];
			selected_score_frames = history.split(":");
			selected_score_framecount = selected_score_frames.length;
			let last_frame = selected_score_frames[selected_score_framecount - 1];

			selected_score_last_grid = parse_frame_grid(last_frame, selected_score_size);
		}
	}

	function parse_frame_grid(frame: string, size: number): Grid {
		let grid = new Grid(size);
		if (!frame) {
			return grid;
		}
		let board = frame.split("+")[0];
		let ind = 0;
		for (let val of board.split(".")) {
			if (+val != 0) {
				let x = ind % size;
				let y = Math.floor(ind / size);
				grid.cells[y][x] = new Tile({ x, y }, +val);
				ind += 1;
			}
		}
		return grid;
	}

	import {
		ready,
		wasm,
		validation_cache,
		init as initWasm
	} from "$lib/wasm/twothousand_forty_eight";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	let selected_frames: { [key: number]: number } = {};
	let grids: { [key: number]: { [key: number]: Grid } } = {};
	$: if (selected_score_size && selected_score_data && selected_score_frames) {
		if (selected_frames[selected_score_size] == null) {
			selected_frames[selected_score_size] = selected_score_frames.length - 1;
		}
		if (selected_frames[selected_score_size] != null) {
			selected_frames[selected_score_size] = Math.max(
				0,
				Math.min(selected_frames[selected_score_size], selected_score_frames.length - 1)
			);
			let frame = selected_score_frames[selected_frames[selected_score_size]];
			if (grids[selected_score_size] == null) {
				grids[selected_score_size] = {};
			}
			grids[selected_score_size][selected_frames[selected_score_size]] = parse_frame_grid(
				frame,
				selected_score_size
			);
		}
	}

	let inputRoot: HTMLElement;
	let mounted = false;
	onMount(() => {
		if (browser) {
			initWasm();
		}
		inputRoot = document.querySelector("html") as HTMLElement;
		mounted = true;
	});
</script>

<svelte:head>
	{#if user_data.data}
		<title>OispaHalla-käyttäjä "{user_data.data.screenName}"</title>
	{:else}
		<title>Puuttuva OispaHalla -käyttäjä {data.uid}</title>
	{/if}
</svelte:head>

<main class="blurry-bg">
	<div class="nav">
		<a href="/">Takaisin OispaHallaan</a>
	</div>
	<div class="content">
		{#if user_data.data}
			{@const udata = user_data.data}
			<h1>{udata.screenName}</h1>
			<div class="size-selector">
				{#each Object.keys(udata.scores) as k}
					<button
						class="action-btn button"
						disabled={selected_score_size == +k}
						on:click={() => {
							selected_score_size = +k;
						}}>{k}</button
					>
				{/each}
			</div>
			{#if selected_score_data != null}
				{@const grid =
					grids[selected_score_size][selected_frames[selected_score_size]] ||
					selected_score_last_grid}
				<h2>{numberWithSpaces(selected_score_data.score)} pistettä</h2>
				<h3>
					{selected_score_frames?.length} siirtoa,
					{selected_score_data.breaks}
					{selected_score_data.breaks == 1 ? "kurinpalautus" : "kurinpalautusta"}
				</h3>
				<h3>Saavutettu {new Date(selected_score_data.updatedAt).toLocaleString()}</h3>
				<hr />
				{#if grid}
					<div class="game-preview">
						{#key grid}
							<Board
								enableLSM={false}
								documentRoot={inputRoot}
								enableKIM={false}
								{grid}
								enable_theme_chooser={false}
							/>
						{/key}
					</div>
				{/if}
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
		{:else}
			<p>Virhe: {user_data.err}</p>
		{/if}
	</div>
</main>

<style>
	main {
		min-height: 100vh;
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
	:global(.tile-new) :global(.tile-inner) {
		-webkit-animation: none !important;
		-moz-animation: none !important;
		animation: none !important;
	}
</style>
