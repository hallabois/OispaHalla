<script lang="ts">
	import Board from "$lib/components/board/board.svelte";
	import Grid from "$lib/gamelogic/grid";
	import Tile from "$lib/gamelogic/tile";
	import { onMount } from "svelte";
	import {
		ready,
		wasm,
		validation_cache,
		init as initWasm
	} from "$lib/wasm/twothousand_forty_eight";
	import { browser } from "$app/environment";

	const directions = {
		"0": "ylös",
		"1": "oikealle",
		"2": "alas",
		"3": "vasemmalle",
		f: "loppuun"
	};

	let selected_frame = 0;
	let input = "";
	let show_additions = true;
	$: usable_input = input.replaceAll("\n", "");
	let parsed: any;
	let grid;
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
	let frame;
	let move_direction: string | null = null;
	$: if (parsed != null && selected_frame != null && $wasm != null) {
		console.info("Trying to render selected frame...");
		try {
			err2 = null;
			frame = parsed[selected_frame];
			let parsed_frame = JSON.parse(frame.replace("SCOREHERE", 0));
			console.log("frame", parsed_frame);
			let size = parsed_frame.grid.size;
			let transformed = parsed_frame.grid;
			// transformed = JSON.parse('{"size":4,"cells":[[null,null,null,null],[null,null,null,null],[{"x":2,"y":0,"value":2,"id":null,"previousPosition":null,"mergedFrom":null},null,null,null],[null,null,{"x":3,"y":2,"value":2,"id":null,"previousPosition":null,"mergedFrom":null},null]]}');
			console.log("transformed", transformed);
			lastGrid = { ...grid };
			grid = new Grid(size);
			let new_cells = transformed.cells.map((col) =>
				col.map((t) => (t ? new Tile({ x: t.x, y: t.y }, t.value, t.id) : null))
			);
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

			if (validation_cache[usable_input] == null) {
				validation_cache[usable_input] = {};
			}
			if (selected_frame > 0) {
				setTimeout(() => {
					let until_now = usable_input.split(":").slice(0, selected_frame).join(":");

					if (validation_cache[usable_input][selected_frame] == null && $wasm != null) {
						console.info("Analyzing frame", selected_frame);
						validation_cache[usable_input][selected_frame] = JSON.parse($wasm.validate(until_now));
					}
				}, 100);
			} else {
				validation_cache[usable_input][selected_frame] = null;
			}

			try {
				move_direction = usable_input.split(":")[selected_frame].split(";")[1];
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
			validation_cache[usable_input] = result;
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
			<textarea bind:value={input} autofocus />
			<br />
			<button
				on:click={() => {
					input = "";
				}}>Tyhjennä</button
			>
			<button
				on:click={() => {
					input =
						"4x4S0.0.0.0.0.0.2.0.0.0.0.0.0.0.0.2+2,1.2;0:0.0.2.2.0.0.2.0.0.0.0.0.0.0.0.0+2,1.2;1:0.0.0.4.0.0.2.2.0.0.0.0.0.0.0.0+3,3.2;1:0.0.0.4.0.0.0.4.0.0.0.0.0.0.0.2+2,0.2;0:0.0.2.8.0.0.0.2.0.0.0.0.0.0.0.0+1,3.2;2:0.0.0.0.0.0.0.0.0.0.0.8.0.2.2.2+2,3.2;0:0.2.2.8.0.0.0.2.0.0.0.0.0.0.2.0+1,0.2;1:0.2.4.8.0.0.0.2.0.0.0.0.0.0.0.2+2,1.2;0:0.2.4.8.0.0.2.4.0.0.0.0.0.0.0.0+1,2.4;3:2.4.8.0.2.4.0.0.0.4.0.0.0.0.0.0+1,2.2;0:4.8.8.0.0.4.0.0.0.2.0.0.0.0.0.0+3,3.2;1:0.0.4.16.0.0.0.4.0.0.0.2.0.0.0.2+2,2.2;0:0.0.4.16.0.0.0.4.0.0.2.4.0.0.0.0+1,1.2;0:0.0.4.16.0.2.2.8.0.0.0.0.0.0.0.0+1,1.2;1:0.0.4.16.0.2.4.8.0.0.0.0.0.0.0.0+2,2.2;0:0.2.8.16.0.0.0.8.0.0.2.0.0.0.0.0+1,1.2;3:2.8.16.0.8.2.0.0.2.0.0.0.0.0.0.0+1,1.2;1:0.2.8.16.0.2.8.2.0.0.0.2.0.0.0.0+0,0.2;0:2.4.16.16.0.0.0.4.0.0.0.0.0.0.0.0+2,1.2;1:0.2.4.32.0.0.2.4.0.0.0.0.0.0.0.0+3,0.2;2:0.0.0.2.0.0.0.0.0.0.4.32.0.2.2.4+1,2.2;0:0.2.4.2.0.0.2.32.0.2.0.4.0.0.0.0+0,1.2;1:0.2.4.2.2.0.2.32.0.0.2.4.0.0.0.0+3,3.2;0:2.2.4.2.0.0.4.32.0.0.0.4.0.0.0.2+1,1.2;0:2.2.8.2.0.2.0.32.0.0.0.4.0.0.0.2+2,1.2;3:4.8.2.0.2.32.2.0.4.0.0.0.2.0.0.0+2,1.2;0:4.8.4.0.2.32.2.0.4.0.0.0.2.0.0.0+0,1.2;1:0.4.8.4.2.2.32.2.0.0.0.4.0.0.0.2+1,2.4;0:2.4.8.4.0.2.32.2.0.4.0.4.0.0.0.2+1,2.2;3:2.4.8.4.2.32.2.0.8.2.0.0.2.0.0.0+2,3.2;0:4.4.8.4.8.32.2.0.2.2.0.0.0.0.2.0+0,3.2;0:4.4.8.4.8.32.4.0.2.2.0.0.2.0.0.0+3,2.2;3:8.8.4.0.8.32.4.0.4.0.0.2.2.0.0.0+1,2.2;0:16.8.8.2.4.32.0.0.2.2.0.0.0.0.0.0+3,0.2;3:16.16.2.2.4.32.0.0.4.0.0.0.0.0.0.0+1,2.2;0:16.16.2.2.8.32.0.0.0.2.0.0.0.0.0.0+3,0.2;3:32.4.0.2.8.32.0.0.2.0.0.0.0.0.0.0+3,3.2;1:0.32.4.2.0.0.8.32.0.0.0.2.0.0.0.2+2,2.2;0:0.32.4.2.0.0.8.32.0.0.2.4.0.0.0.0+1,3.4;3:32.4.2.0.8.32.0.0.2.4.0.0.0.4.0.0+3,2.2;0:32.4.2.0.8.32.0.0.2.8.0.2.0.0.0.0+2,1.2;0:32.4.2.2.8.32.2.0.2.8.0.0.0.0.0.0+3,1.2;0:32.4.4.2.8.32.0.2.2.8.0.0.0.0.0.0+0,0.2;1:2.32.8.2.0.8.32.2.0.0.2.8.0.0.0.0+1,3.2;0:2.32.8.4.0.8.32.8.0.0.2.0.0.2.0.0+1,3.2;3:2.32.8.4.8.32.8.0.2.0.0.0.2.2.0.0+2,3.2;0:2.64.16.4.8.2.0.0.4.0.0.0.0.0.2.0+0,3.2;0:2.64.16.4.8.2.2.0.4.0.0.0.2.0.0.0+3,2.2;3:2.64.16.4.8.4.0.0.4.0.0.2.2.0.0.0+2,1.4;0:2.64.16.4.8.4.4.2.4.0.0.0.2.0.0.0+3,3.2;3:2.64.16.4.8.8.2.0.4.0.0.0.2.0.0.2+1,3.2;0:2.64.16.4.8.8.2.2.4.0.0.0.2.2.0.0+3,1.2;3:2.64.16.4.16.4.0.2.4.0.0.0.4.0.0.0+1,2.2;0:2.64.16.4.16.4.0.2.8.2.0.0.0.0.0.0+0,1.2;1:2.64.16.4.2.16.4.2.0.0.8.2.0.0.0.0+2,3.2;0:4.64.16.4.0.16.4.4.0.0.8.0.0.0.2.0+2,1.2;3:4.64.16.4.16.8.2.0.8.0.0.0.2.0.0.0+2,3.2;1:4.64.16.4.0.16.8.2.0.0.0.8.0.0.2.2+0,2.2;0:4.64.16.4.0.16.8.2.2.0.2.8.0.0.0.2+3,1.2;3:4.64.16.4.16.8.2.2.4.8.0.0.2.0.0.0+1,2.4;0:4.64.16.4.16.16.2.2.4.4.0.0.2.0.0.0+2,3.4;3:4.64.16.4.32.4.0.0.8.0.0.0.2.0.4.0+1,3.2;0:4.64.16.4.32.4.4.0.8.0.0.0.2.2.0.0+3,1.2;0:4.64.16.4.32.4.4.2.8.2.0.0.2.0.0.0+1,3.2;3:4.64.16.4.32.8.2.0.8.2.0.0.2.2.0.0+3,3.2;0:4.64.16.4.32.8.2.0.8.4.0.0.2.0.0.2+2,3.4;3:4.64.16.4.32.8.2.0.8.4.0.0.4.0.4.0+3,3.2;0:4.64.16.4.32.8.2.0.8.4.4.0.4.0.0.2+3,1.2;3:4.64.16.4.32.8.2.2.8.8.0.0.4.2.0.0+2,2.2;0:4.64.16.4.32.16.2.2.8.2.2.0.4.0.0.0+1,3.2;3:4.64.16.4.32.16.4.0.8.4.0.0.4.2.0.0+0,2.2;1:4.64.16.4.0.32.16.4.2.0.8.4.0.0.4.2+0,2.4;0:4.64.32.8.2.32.8.4.4.0.4.2.0.0.0.0+2,3.2;3:4.64.32.8.2.32.8.4.8.2.0.0.0.0.2.0+0,3.4;0:4.64.32.8.2.32.8.4.8.2.2.0.4.0.0.0+2,2.2;3:4.64.32.8.2.32.8.4.8.4.2.0.4.0.0.0+0,2.2;1:4.64.32.8.2.32.8.4.2.8.4.2.0.0.0.4+0,2.2;0:4.64.32.8.4.32.8.4.2.8.4.2.0.0.0.4+2,3.2;3:4.64.32.8.4.32.8.4.2.8.4.2.4.0.2.0+1,3.2;0:8.64.32.8.2.32.8.4.4.8.4.2.0.2.2.0+1,3.2;3:8.64.32.8.2.32.8.4.4.8.4.2.4.2.0.0+0,3.2;0:8.64.32.8.2.32.8.4.8.8.4.2.2.2.0.0+1,3.2;3:8.64.32.8.2.32.8.4.16.4.2.0.4.2.0.0+3,0.2;2:8.64.0.2.2.32.32.0.16.4.8.8.4.2.2.4+3,1.2;3:8.64.2.0.2.64.0.2.16.4.16.0.4.4.4.0+1,2.2;0:8.128.2.2.2.8.16.0.16.2.4.0.4.0.0.0+3,1.2;3:8.128.4.0.2.8.16.2.16.2.4.0.4.0.0.0+0,3.2;1:0.8.128.4.2.8.16.2.0.16.2.4.2.0.0.4+1,2.2;0:4.16.128.4.0.16.16.2.0.2.2.8.0.0.0.0+2,2.2;3:4.16.128.4.32.2.0.0.4.8.2.0.0.0.0.0+1,3.2;0:4.16.128.4.32.2.2.0.4.8.0.0.0.2.0.0+2,1.2;3:4.16.128.4.32.4.2.0.4.8.0.0.2.0.0.0+0,1.2;1:4.16.128.4.2.32.4.2.0.0.4.8.0.0.0.2+2,2.2;0:4.16.128.4.2.32.8.2.0.0.2.8.0.0.0.2+1,3.2;3:4.16.128.4.2.32.8.2.2.8.0.0.2.2.0.0+0,0.2;2:2.16.0.0.4.32.0.0.2.8.128.4.4.2.8.2+3,2.2;0:2.16.128.4.4.32.8.2.2.8.0.2.4.2.0.0+3,3.2;3:2.16.128.4.4.32.8.2.2.8.2.0.4.2.0.2+3,3.2;0:2.16.128.4.4.32.8.4.2.8.2.0.4.2.0.2+3,2.2;0:2.16.128.8.4.32.8.2.2.8.2.2.4.2.0.0+3,3.2;3:2.16.128.8.4.32.8.2.2.8.4.0.4.2.0.2+2,3.2;0:2.16.128.8.4.32.8.4.2.8.4.0.4.2.2.0+2,3.2;3:2.16.128.8.4.32.8.4.2.8.4.0.4.4.2.0+2,3.2;3:2.16.128.8.4.32.8.4.2.8.4.0.8.2.2.0+3,2.2;3:2.16.128.8.4.32.8.4.2.8.4.2.8.4.0.0+1,3.2;1:2.16.128.8.4.32.8.4.2.8.4.2.0.2.8.4+3,3.2;3:2.16.128.8.4.32.8.4.2.8.4.2.2.8.4.2+0,3.2;0:2.16.128.8.4.32.8.4.4.16.8.4.2.0.0.0+3,3.2;0:2.16.128.8.8.32.16.8.2.16.0.0.0.0.0.2+2,3.2;3:2.16.128.8.8.32.16.8.2.16.0.0.2.0.2.0+3,1.2;0:2.16.128.16.8.32.16.2.4.16.2.0.0.0.0.0+3,3.2;1:2.16.128.16.8.32.16.2.0.4.16.2.0.0.0.2+0,2.2;0:2.16.128.16.8.32.32.4.2.4.0.2.0.0.0.0+1,3.2;3:2.16.128.16.8.64.4.0.2.4.2.0.0.2.0.0+2,3.2;1:2.16.128.16.0.8.64.4.0.2.4.2.0.0.2.2+0,1.2;1:2.16.128.16.2.8.64.4.0.2.4.2.0.0.0.4+2,3.2;0:4.16.128.16.0.8.64.4.0.2.4.2.0.0.2.4+2,3.2;3:4.16.128.16.8.64.4.0.2.4.2.0.2.4.2.0+1,3.2;0:4.16.128.16.8.64.4.0.4.8.4.0.0.2.0.0+1,3.2;3:4.16.128.16.8.64.4.0.4.8.4.0.2.2.0.0+3,2.4;0:4.16.128.16.8.64.8.0.4.8.0.4.2.2.0.0+3,1.2;3:4.16.128.16.8.64.8.2.4.8.4.0.4.0.0.0+3,3.2;0:4.16.128.16.8.64.8.2.8.8.4.0.0.0.0.2+3,2.2;3:4.16.128.16.8.64.8.2.16.4.0.2.2.0.0.0+0,3.2;1:4.16.128.16.8.64.8.2.0.16.4.2.2.0.0.2+3,3.4;0:4.16.128.16.8.64.8.4.2.16.4.2.0.0.0.4+2,3.2;3:4.16.128.16.8.64.8.4.2.16.4.2.4.0.2.0+0,3.2;1:4.16.128.16.8.64.8.4.2.16.4.2.2.0.4.2+3,3.2;3:4.16.128.16.8.64.8.4.2.16.4.2.2.4.2.2+0,0.2;2:2.16.128.0.4.64.8.16.8.16.4.4.4.4.2.4+3,0.2;3:2.16.128.2.4.64.8.16.8.16.8.0.8.2.4.0+3,2.2;0:2.16.128.2.4.64.16.16.16.16.4.2.0.2.0.0+0,2.2;1:2.16.128.2.0.4.64.32.2.32.4.2.0.0.0.2+3,3.2;3:2.16.128.2.4.64.32.0.2.32.4.2.2.0.0.2+2,3.2;1:2.16.128.2.0.4.64.32.2.32.4.2.0.0.2.4+0,3.2;0:4.16.128.2.0.4.64.32.0.32.4.2.2.0.2.4+3,3.2;3:4.16.128.2.4.64.32.0.32.4.2.0.4.4.0.2+3,3.4;0:8.16.128.4.32.64.32.0.4.8.2.0.0.0.0.4+2,3.2;1:8.16.128.4.0.32.64.32.0.4.8.2.0.0.2.4+3,2.2;3:8.16.128.4.32.64.32.0.4.8.2.2.2.4.0.0+3,3.2;0:8.16.128.4.32.64.32.2.4.8.2.0.2.4.0.2+3,2.2;0:8.16.128.4.32.64.32.4.4.8.2.2.2.4.0.0+0,3.4;1:8.16.128.4.32.64.32.4.0.4.8.4.4.0.2.4+3,3.2;3:8.16.128.4.32.64.32.4.4.8.4.0.4.2.4.2+3,3.2;0:8.16.128.8.32.64.32.2.8.8.8.0.0.2.0.2+1,3.2;1:8.16.128.8.32.64.32.2.0.0.8.16.0.2.0.4+2,2.2;3:8.16.128.8.32.64.32.2.8.16.2.0.2.4.0.0+0,3.4;1:8.16.128.8.32.64.32.2.0.8.16.2.4.0.2.4+3,3.2;3:8.16.128.8.32.64.32.2.8.16.2.0.4.2.4.2+0,2.2;1:8.16.128.8.32.64.32.2.2.8.16.2.4.2.4.2+3,3.2;0:8.16.128.8.32.64.32.4.2.8.16.2.4.2.4.2+3,3.2;0:8.16.128.8.32.64.32.4.2.8.16.4.4.2.4.2+3,3.2;0:8.16.128.8.32.64.32.8.2.8.16.2.4.2.4.2+3,2.2;0:8.16.128.16.32.64.32.4.2.8.16.2.4.2.4.0+3,0.2;f";
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
							{Object.keys(validation_cache[usable_input] || {}).length} / {parsed.length} siirtoa tarkistettu.
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
				{#if validation_cache[usable_input] != null}
					{#if validation_cache[usable_input][selected_frame] != null}
						<p style="word-break: break-all;">
							{JSON.stringify(validation_cache[usable_input][selected_frame])}
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
		background-attachment: fixed;
	}
	.page {
		width: min(500px, 95vw);
		margin: 0 auto;
		background: var(--background);
		padding: 1em;
	}
	textarea {
		width: 100%;
		resize: vertical;
		min-height: 150px;
	}
	/* Prevent tile animations */
	:global(.tile-new) :global(.tile-inner) {
		-webkit-animation: none !important;
		-moz-animation: none !important;
		animation: none !important;
	}
</style>
