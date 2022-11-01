<script lang="ts">
	import { onMount } from "svelte";

	import MultiplayerMenu from "$lib/components/tournaments/menu.svelte";
	import Board from "$lib/components/board/board.svelte";
	import Announcer from "$lib/components/tournaments/announcer.svelte";
	import {
		connect,
		connection_error,
		game_details,
		joined_game_id,
		request_move,
		state
	} from "$lib/stores/tournamentstore";
	import {
		generate_previous_positions,
		hac_gamestate_to_grid,
		ohts_gamestate_to_grid
	} from "$lib/gamelogic/utils";
	import KeyboardInputManager from "$lib/gamelogic/keyboard_input_manager";
	import Grid from "$lib/gamelogic/grid";
	import { browser } from "$app/environment";
	import Tournaments from "$lib/components/tournaments.svelte";

	let app_name = "Oispa Halla";
	let app_description = "Yhdistä opettajat ja saavuta **Halla!**";
	let app_notice =
		"**HUOMIO**: Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu minkäänlaiseen paremmuusjärjestykseen. Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.";
	let app_name_newgame = "Uusi Jakso";
	let app_name_score = "arvosana";
	let app_name_hiscore = "paras halla";

	let enableKIM = false;

	/* $: if ($poll_board_string) {
		grid = hac_gamestate_to_grid($poll_board_string);
	} else if ($joined_game_data) {
		// grid = hac_gamestate_to_grid($joined_game_data.starting_state);
	} else {
		// enableKIM = false;
	} */

	function move(direction: 0 | 1 | 2 | 3) {
		if (true) {
			// BoardInstance?.getGameManagerInstance()?.move(direction);
			console.log("server-side move called with the value", direction);
			request_move(direction);
			// poll_send_moves.push(direction);
			// console.info(JSON.stringify(poll_send_moves));
		} else {
			console.warn("Tried to move when the game hadn't started yet");
		}
	}
	$: if ($joined_game_id) {
		//window.onbeforeunload = function (e) {
		//	return "Oletko varma että haluat jättää pelin kesken?";
		//};
		if (inputManager == null) {
			console.log("Creating server-side inputmanager...");
			inputManager = new KeyboardInputManager(inputRoot);
			inputManager.on("move", move);
			// enableKIM = true;
		}
	} else {
		if (browser) {
			window.onbeforeunload = null;
		}
		if (inputManager != null) {
			console.log("Destroying server-side inputmanager...");
			inputManager = null;
			// enableKIM = false;
		}
	}

	let inputManager: KeyboardInputManager | null = null;
	let inputRoot: HTMLElement;
	let AnnouncerInstance: Announcer;
	let BoardInstance: Board;
	let TtInstance: Tournaments;

	let enableMonkey = false;
	let monkeyInterval: NodeJS.Timer | undefined;
	$: if (enableMonkey) {
		monkeyInterval = setInterval(() => {
			//@ts-ignore, we modulo integers by 4 so it's good.
			move(Math.round(Math.random() * 400) % 4);
		}, 500);
	} else {
		clearInterval(monkeyInterval);
	}

	let last_grid: Grid | null = null;
	function processGrid(inp: Object) {
		let translated = ohts_gamestate_to_grid(inp);
		if (last_grid) {
			translated = generate_previous_positions(translated, last_grid);
		}
		last_grid = translated;
		return translated;
	}
</script>

<main bind:this={inputRoot}>
	<Announcer bind:this={AnnouncerInstance} />
	{#if $connection_error}
		<p class="err">
			Palvelimeen ei saada yhteyttä. <button
				on:click={() => {
					connect();
				}}>Yritä uudelleen</button
			>
		</p>
	{/if}
	{#if $joined_game_id && $game_details[$joined_game_id]?.started && $state[$joined_game_id]}
		{@const gamestate = $state[$joined_game_id]}
		{@const game = $game_details[$joined_game_id]}
		{@const grid_o = gamestate.board}
		{@const grid = processGrid(grid_o)}
		<div class="board-container">
			<div style="display: flex;justify-content:space-between;width:var(--field-width);">
				<div style="display: flex;align-items: end;">
					<a data-sveltekit-reload href="/">Takaisin yksinpeliin</a>
				</div>
				<!-- {#if $poll_success}
			<h3 style="margin:0;">{$poll_game.client_aliases[$poll_id_index]}</h3>
		{/if} -->
				<div style="display: flex;align-items: end;">
					<label for="monkey">Enable monkey</label>
					<input id="monkey" type="checkbox" bind:checked={enableMonkey} />
				</div>
			</div>
			{#key grid}
				<Board {enableKIM} enableLSM={false} {grid} bind:this={BoardInstance} />
			{/key}
			<button
				class="button background-none color-button"
				on:click={() => {
					TtInstance.show();
				}}
				title="Tournament Mode"
			>
				⚔
			</button>
			<!-- {#if $poll_success}
		<div class="mini-container">
			{#each $poll_other_boards_string as board_string, index}
				<div class="mini-grid">
					<Board grid={hac_gamestate_to_grid(board_string)} />
				</div>
			{/each}
		</div>
	{/if} -->
		</div>
		<Tournaments bind:this={TtInstance} />
	{:else}
		<div class="blurry-bg menu-bg">
			<div class="menu">
				<MultiplayerMenu announcer={AnnouncerInstance} />
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		min-height: 100vh;

		display: grid;
		place-items: center;
	}
	.err {
		z-index: 217;
		background-color: red;
		color: black;
		text-align: center;

		position: absolute;
		top: 0;
		left: 0;
		right: 0;
	}
	.menu-bg {
		width: 100%;
		height: 100%;

		display: flex;
		justify-content: center;
		align-items: center;

		background-attachment: fixed;
	}
	.menu {
		min-width: min(90vw, 500px);
	}
	.board-container {
		display: grid;
		place-items: center;
	}
	.mini-container {
		--field-width: calc(500px / 4) !important;
		--grid-gap: calc(15px / 4);
		--tile-size: calc(
			calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) /
				var(--grid-size)
		);

		display: flex;
		gap: 0.5em;
	}
	.mini-grid {
		width: var(--field-width);
		height: var(--field-width);
		overflow: hidden;
	}
	:global(.mini-container .tile-inner) {
		animation: none !important;
		-moz-animation: none !important;
		-webkit-animation: none !important;
	}
</style>
