<script lang="ts">
	import Board from "$lib/components/board/board.svelte";
	import type Grid from "$lib/gamelogic/grid";
	import type { HistoryReconstruction, CompleteValidationResult } from "twothousand-forty-eight";
	import Tile from "$lib/gamelogic/tile";
	import { onMount } from "svelte";
	import { v2_4x4 } from "./example_games";
	import {
		ready,
		wasm,
		validation_cache,
		init as initWasm
	} from "$lib/wasm/twothousand_forty_eight";
	import { browser } from "$app/environment";
	import {
		generate_previous_positions,
		ohmp_gamestate_to_grid,
		type ohmp_gamestate
	} from "$lib/gamelogic/utils";

	type Direction = "0" | "1" | "2" | "3" | "f";
	const directions: {
		[key in Direction]: string;
	} = {
		"0": "ylös",
		"1": "oikealle",
		"2": "alas",
		"3": "vasemmalle",
		f: "loppuun"
	};

	let selected_frame = 0;
	let input: string = "";
	let show_additions = false;
	let reconstruction: HistoryReconstruction | null;
	let grid: Grid;
	let lastGrid;
	let err: string | null;
	let hash: string | null;

	let last_input: string | null = null;
	$: if (input.length > 0 && $ready && $wasm != null) {
		if (input !== last_input) {
			console.info("Trying to parse input...");
			try {
				err = null;
				hash = null;

				console.info("wasm atm", $wasm);

				console.info("hashing...");
				hash = $wasm.hash(input);

				reconstruction = $wasm.reconstruct(input);
				console.info("input parsed!");

				console.info("History validated!");
				setTimeout(() => {
					validate_all();
				}, 0);
			} catch (e) {
				console.warn("Error while parsing:", e);
				err = `${e}`;
			}
			last_input = input;
		}
	} else {
		reconstruction = null;
		hash = null;
		selected_frame = 0;
		err = null;
		err2 = null;
		last_input = null;
	}

	$: if (reconstruction != null) {
		selected_frame = Math.max(0, Math.min(selected_frame, reconstruction.history.length - 1));
	}

	let err2: string | null;
	let frame: ohmp_gamestate;
	let input_validation_result: CompleteValidationResult | null = null;
	let move_direction: Direction | null = null;
	$: if (reconstruction != null && selected_frame != null && $wasm != null) {
		console.info("Trying to render selected frame...");
		try {
			err2 = null;
			frame = reconstruction.history[selected_frame];
			let parsed_frame = ohmp_gamestate_to_grid(frame);
			if (selected_frame > 0) {
				let last_frame = reconstruction.history[selected_frame - 1];
				parsed_frame = generate_previous_positions(
					parsed_frame,
					ohmp_gamestate_to_grid(last_frame)
				);
			}
			console.log("frame", parsed_frame);
			lastGrid = structuredClone(grid);
			grid = parsed_frame;

			let new_cells = parsed_frame.cells;
			grid.cells = new_cells;
			grid = grid;
			if (boardInstance) {
				let gameManager = boardInstance.getGameManagerInstance();
				if (gameManager) {
					gameManager.grid = grid;
					gameManager.actuate();
				}
			}
			console.info("Rendered!");
		} catch (e) {
			console.warn("Error while rendering:", e);
			err2 = `${e}`;
		}
	}
	$: if (input != null && $validation_cache[input] != null) {
		input_validation_result = $validation_cache[input];
	}

	async function validate_all() {
		if ($wasm != null && input != null) {
			let result = JSON.parse($wasm.validate_all(input)) as CompleteValidationResult;
			console.info("Validation result", result);
			$validation_cache[input] = result;
		}
	}

	let boardInstance: Board;
	let inputRoot: HTMLElement;
	onMount(() => {
		if (browser) {
			initWasm();
		}
		inputRoot = document.querySelector("html") as HTMLElement;
	});
</script>

<svelte:head>
	<title>OH Inspector</title>
</svelte:head>

<main class="blurry-bg">
	<div class="page">
		{#if !$ready}
			<p>Ladataan...</p>
		{:else}
			<p>WASM Ladattu.</p>
			<!-- svelte-ignore a11y-autofocus -->
			<textarea bind:value={input} autofocus />
			<br />
			<button
				on:click={() => {
					input = "";
				}}>Tyhjennä</button
			>
			<button
				on:click={() => {
					input = v2_4x4;
				}}>Lataa esimerkki</button
			>
			<br />
			{#if err || err2}
				<p>Virhe: {err || err2}</p>
			{:else if reconstruction != null}
				<div>
					<p>
						Peli sisältää {reconstruction.history.length}
						{reconstruction.history.length == 1 ? "siirron" : "siirtoa"}.
					</p>
				</div>
				<input
					type="range"
					min="0"
					max={reconstruction.history.length - 1}
					bind:value={selected_frame}
				/>
				<input type="number" bind:value={selected_frame} />
				<br />
				<!--
					<label for="show_additions">Näytä lisäykset</label>
					<input id="show_additions" type="checkbox" bind:checked={show_additions} />
					-->
				<Board
					bind:this={boardInstance}
					enableLSM={false}
					enableKIM={false}
					documentRoot={inputRoot}
					enable_theme_chooser={true}
					{grid}
				/>
				{#if move_direction != null}
					<p>Siirto {directions[move_direction]}</p>
				{/if}
				{#if input_validation_result != null}
					{#if "Err" in input_validation_result}
						<p>
							{input_validation_result.Err}
						</p>
					{:else}
						{@const frame_result = input_validation_result.Ok[selected_frame]}
						<p style="word-break: break-all;">
							{JSON.stringify(frame_result)}
						</p>
					{/if}
				{:else}
					<p>Tarkistetaan peliä...</p>
				{/if}
				{#if hash != null}
					<p style="word-break: break-all;">{hash}</p>
				{/if}
				<details>
					<summary>Dataa dataa jesjes</summary>
					<p>{JSON.stringify(frame)}</p>
					<p>{JSON.stringify(grid)}</p>
				</details>
			{/if}
		{/if}
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		min-height: 100svh;
		background-attachment: fixed;
	}
	.page {
		width: min(500px, 95vw);
		margin: 0 auto;
		background: var(--dialog-background);
		padding: 1em;
		box-sizing: content-box;
	}
	textarea {
		width: 100%;
		resize: vertical;
		min-height: 75px;
	}
	@media screen and (max-width: 520px) {
		:root {
			--field-width: 320px !important;
			--grid-gap: 10px !important;
			--tile-border-radius: 3px !important;
		}
	}
</style>
