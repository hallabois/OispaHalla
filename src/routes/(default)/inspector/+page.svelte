<script lang="ts">
	import Board from "$lib/components/board/board.svelte";
	import type Grid from "$lib/gamelogic/grid";
	import Tile from "$lib/gamelogic/tile";
	import { onMount } from "svelte";
	import { long4x4 } from "./example_games";
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
	let input = "";
	let show_additions = false;
	$: usable_input = input.replaceAll("\n", "");
	let parsed: any;
	let grid: Grid;
	let lastGrid;
	let err: string | null;
	let validation_result;
	let hash: string | null;

	let last_input: string | null = null;
	$: if (input.length > 0 && $ready && $wasm != null) {
		if (input !== last_input) {
			console.info("Trying to parse input...");
			try {
				err = null;
				validation_result = null;
				hash = null;

				console.info("wasm atm", $wasm);

				console.info("hashing...");
				hash = JSON.parse($wasm.hash(usable_input));

				parsed = JSON.parse($wasm.get_frames(usable_input));
				console.info("input parsed!");

				console.info("Validating history...");
				validation_result = JSON.parse($wasm.validate(usable_input));
			} catch (e) {
				console.warn("Error while parsing:", e);
				err = `${e}`;
			}
			last_input = input;
		}
	}

	$: if (parsed != null) {
		selected_frame = Math.max(0, Math.min(selected_frame, parsed.length - 1));
	}

	let err2: string | null;
	let frame: ohmp_gamestate;
	let move_direction: Direction | null = null;
	$: if (parsed != null && selected_frame != null && $wasm != null) {
		console.info("Trying to render selected frame...");
		try {
			err2 = null;
			frame = parsed[selected_frame];
			let parsed_frame = ohmp_gamestate_to_grid(frame);
			if (selected_frame > 0) {
				let last_frame = parsed[selected_frame - 1];
				parsed_frame = generate_previous_positions(
					parsed_frame,
					ohmp_gamestate_to_grid(last_frame)
				);
			}
			console.log("frame", parsed_frame);
			lastGrid = { ...grid };
			grid = parsed_frame;

			let new_cells = parsed_frame.cells;
			if (show_additions) {
				let now = usable_input.split(":")[selected_frame];
				let addition = now.split("+")[1].split(";")[0];
				let coordinates = addition.split(".")[0].split(",");
				let x = +coordinates[0];
				let y = +coordinates[1];
				let value = addition.split(".")[1];
				let tile = new Tile({ x, y }, 1, -1);
				console.info("Addition: ", tile);
				new_cells[y][x] = tile;
			}
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

			if ($validation_cache[usable_input] == null) {
				$validation_cache[usable_input] = {};
			}
			if (selected_frame > 0) {
				let until_now = usable_input.split(":").slice(0, selected_frame).join(":");

				if ($validation_cache[usable_input][selected_frame] == null && $wasm != null) {
					console.info("Analyzing frame", selected_frame);
					$validation_cache[usable_input][selected_frame] = JSON.parse($wasm.validate(until_now));
				}
			} else {
				$validation_cache[usable_input][selected_frame] = null;
			}

			try {
				move_direction = usable_input.split(":")[selected_frame].split(";")[1] as Direction;
			} catch (e) {
				move_direction = null;
			}
		} catch (e) {
			console.warn("Error while rendering:", e);
			err2 = `${e}`;
		}
	}

	async function validate_all() {
		if ($wasm != null) {
			let result = JSON.parse($wasm.validate_all_frames(usable_input));
			console.info("Validation result", result);
			$validation_cache[usable_input] = result;
		}
	}

	let mounted = false;
	let boardInstance: Board;
	let inputRoot: HTMLElement;
	onMount(() => {
		if (browser) {
			initWasm();
		}
		inputRoot = document.querySelector("html") as HTMLElement;
		mounted = true;
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
					input = long4x4;
				}}>Lataa esimerkki</button
			>
			<button
				on:click={() => {
					input = input.replaceAll(":\n", ":");
					input = input.replaceAll("S\n", "S");

					input = input.split(":").join(":\n");
					input = input.split("S").join("S\n");
				}}
			>
				Pilko
			</button>
			<br />
			{#if err || err2}
				<p>Virhe: {err || err2}</p>
			{:else}
				{#if hash != null}
					<p style="word-break: break-all;">{hash}</p>
				{/if}
				{#if parsed != null}
					<div>
						<p>Peli sisältää {parsed.length} {parsed.length == 1 ? "siirron" : "siirtoa"}.</p>
						<p>
							{Object.keys($validation_cache[usable_input] || {}).length} / {parsed.length} siirtoa tarkistettu.
						</p>
					</div>
					<input type="range" min="0" max={parsed.length - 1} bind:value={selected_frame} />
					<input type="number" bind:value={selected_frame} />
					<br />
					<label for="show_additions">Näytä lisäykset</label>
					<input id="show_additions" type="checkbox" bind:checked={show_additions} />
					<button on:click={validate_all}>Tarkista kaikki siirrot välimuistiin</button>
				{/if}
				<Board
					bind:this={boardInstance}
					enableLSM={false}
					enableKIM={false}
					documentRoot={inputRoot}
					enable_theme_chooser={true}
				/>
				{#if move_direction != null}
					<p>Siirto {directions[move_direction]}</p>
				{/if}
				{#if $validation_cache[usable_input] != null}
					{#if $validation_cache[usable_input][selected_frame] != null}
						<p style="word-break: break-all;">
							{JSON.stringify($validation_cache[usable_input][selected_frame])}
						</p>
					{/if}
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
		min-height: 150px;
	}
	@media screen and (max-width: 520px) {
		:root {
			--field-width: 320px !important;
			--grid-gap: 10px !important;
			--tile-border-radius: 3px !important;
		}
	}
</style>
