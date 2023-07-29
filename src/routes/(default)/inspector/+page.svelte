<script lang="ts">
	import type {
		HistoryReconstruction,
		CompleteValidationResult,
		Board,
		Direction
	} from "twothousand-forty-eight";
	import { onMount } from "svelte";
	import { v1_4x4, v2_4x4 } from "./example_games";
	import {
		ready,
		wasm,
		validation_cache,
		init as initWasm
	} from "$lib/wasm/twothousand_forty_eight";
	import { browser } from "$app/environment";
	import { board_to_tile_array } from "$lib/gamelogic/new";
	import GameBoard from "$lib/components/board/gameBoard.svelte";

	const directions: {
		[key in Direction]: string;
	} = {
		UP: "ylös",
		RIGHT: "oikealle",
		DOWN: "alas",
		LEFT: "vasemmalle",
		END: "loppu",
		BREAK: "kurinpalautus",
		START: "alku"
	};

	let selected_frame = 0;
	let input: string = "";
	let show_additions = false;
	let reconstruction: HistoryReconstruction | null;
	let board: Board;
	let last_board: Board | null = null;
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
	let input_validation_result: CompleteValidationResult | null = null;
	let move_direction: Direction | null = null;
	$: if (reconstruction != null && selected_frame != null && $wasm != null) {
		console.info("Trying to render selected frame...");
		try {
			err2 = null;
			board = reconstruction.history[selected_frame];
			console.log("frame", board);

			if (selected_frame > 0) {
				last_board = reconstruction.history[selected_frame - 1];
			} else {
				last_board = null;
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

	onMount(() => {
		if (browser) {
			initWasm();
		}
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
			Lataa esimerkkipeli:
			<button
				on:click={() => {
					input = v2_4x4;
				}}
			>
				V2</button
			>
			<button
				on:click={() => {
					input = v1_4x4;
				}}
			>
				V1</button
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
				<GameBoard
					tiles={board_to_tile_array(board)}
					size={board.width}
					last_move_direction={"DOWN"}
					last_move_tiles={last_board ? board_to_tile_array(last_board) : null}
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
					<p>{JSON.stringify(board)}</p>
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
