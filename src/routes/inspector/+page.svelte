<script lang="ts">
	import Board from "$lib/components/board/board.svelte";
	import type GameManager from "$lib/gamelogic/game_manager";
import Grid from "$lib/gamelogic/grid";
	import { hac_gamestate_to_grid } from "$lib/gamelogic/utils";
	import { onMount } from "svelte";
	import init, { get_frames, parse } from "twothousand-forty-eight";

	let ready = false;
	onMount(() => {
		// @ts-ignore
		init().then(() => {
			ready = true;
		});
	});

	let selected_frame = 0;
	let input = "4x4S0.0.0.0.0.0.0.0.0.0.0.0.0.0.2.2+2,1.2;1";
	let parsed: any;
	let grid;
	let err: string | null;
	$: if (input.length > 0 && selected_frame != null && ready) {
		try {
			err = null;
			parsed = JSON.parse(get_frames(input));
		} catch (e) {
			console.warn(e);
			err = `${e}`;
		}
	}
	let err2: string | null;
	let frame;
	$: if (parsed != null && selected_frame != null && ready) {
		try {
			err2 = null;
			frame = parsed[selected_frame];
			let parsed_frame = JSON.parse(frame.replace("SCOREHERE", 0));
			console.log("frame", parsed_frame);
			let size = parsed_frame.grid.size;
			let transformed = parsed_frame.grid;
			// transformed = JSON.parse('{"size":4,"cells":[[null,null,null,null],[null,null,null,null],[{"x":2,"y":0,"value":2,"id":null,"previousPosition":null,"mergedFrom":null},null,null,null],[null,null,{"x":3,"y":2,"value":2,"id":null,"previousPosition":null,"mergedFrom":null},null]]}');
			console.log("transformed", transformed);
			grid = new Grid(size);
			grid.cells = transformed.cells;
			if(boardInstance && false) {
				let gameManager = boardInstance.getGameManagerInstance();
				if(gameManager) {
					gameManager.grid = grid;
					gameManager.actuate();
				}
			}
		} catch (e) {
			console.warn(e);
			err2 = `${e}`;
		}
	}

	let mounted = false;
	let boardInstance: Board;
	let inputRoot: HTMLElement;
	onMount(() => {
		inputRoot = document.querySelector("html") as HTMLElement;
		mounted = true;
	});
</script>

<main>
	{#if !ready}
		<p>Ladataan...</p>
	{:else}
		<p>WASM Ladattu.</p>
		<input bind:value={input} autofocus />
		<input type="number" bind:value={selected_frame} />
		{#if err || err2}
			<p>Virhe: {err || err2}</p>
		{:else}
			<Board
				bind:this={boardInstance}
				{grid}
				documentRoot={inputRoot}
				enable_theme_chooser={false}
			/>
			<p>{JSON.stringify(frame)}</p>
			<p>{JSON.stringify(grid)}</p>
		{/if}
	{/if}
</main>

<style>
</style>
