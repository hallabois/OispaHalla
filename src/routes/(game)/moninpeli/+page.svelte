<script lang="ts">
	import MultiplayerMenu from "$lib/components/tournaments/menu.svelte";
	import Board from "$lib/components/board/board.svelte";
	import Announcer from "$lib/components/common/announcer/announcer.svelte";
	import {
		connect,
		connection_error,
		game_details,
		joined_game_id,
		name_cache,
		request_move,
		state,
		user_details
	} from "$lib/stores/tournamentstore";
	import {
		generate_previous_positions,
		hac_gamestate_to_grid,
		ohts_gamestate_to_grid
	} from "$lib/gamelogic/utils";
	import KeyboardInputManager from "$lib/gamelogic/keyboard_input_manager";
	import type Grid from "$lib/gamelogic/grid";
	import { browser, dev } from "$app/environment";
	import Tournaments from "$lib/components/tournaments.svelte";
	import Popup from "$lib/components/common/popup/popup.svelte";

	let enableKIM = false;

	/* $: if ($poll_board_string) {
		grid = hac_gamestate_to_grid($poll_board_string);
	} else if ($joined_game_data) {
		// grid = hac_gamestate_to_grid($joined_game_data.starting_state);
	} else {
		// enableKIM = false;
	} */

	$: inputManager_should_exist =
		$joined_game_id &&
		$game_details[$joined_game_id]?.started &&
		$state[$joined_game_id] &&
		$user_details != null;
	function move(direction: 0 | 1 | 2 | 3) {
		if (inputManager_should_exist) {
			// BoardInstance?.getGameManagerInstance()?.move(direction);
			console.log("server-side move called with the value", direction);
			request_move(direction);
			// poll_send_moves.push(direction);
			// console.info(JSON.stringify(poll_send_moves));
		} else {
			if (browser && document.oh_keylistener) {
				document.oh_keylistener.removeKeydownHandler();
			}
		}
	}
	$: if (inputManager_should_exist) {
		if (!dev) {
			window.onbeforeunload = function (e) {
				return "Oletko varma että haluat jättää pelin kesken?";
			};
		}

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

		if (browser && document.oh_keylistener) {
			console.log("Destroying server-side inputmanager...");
			document.oh_keylistener.removeKeydownHandler();
			inputManager = null;
		}
	}

	let inputManager: KeyboardInputManager | null = null;
	let inputRoot: HTMLElement;
	let AnnouncerInstance: Announcer;
	let BoardInstance: Board;
	let TtInstance: Tournaments;
	$: if (
		$joined_game_id &&
		$game_details[$joined_game_id] &&
		$game_details[$joined_game_id].winner_id
	) {
		TtInstance.show();
	}

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
	{#if $joined_game_id && $game_details[$joined_game_id]?.started && $state[$joined_game_id] && $user_details != null}
		{@const gamestates = $state[$joined_game_id]}
		{@const gamestate = gamestates.find((s) => s.user_id === $user_details.id)}
		{@const game = $game_details[$joined_game_id]}
		{@const grid_o = gamestate.board}
		{@const grid = processGrid(grid_o)}
		<p>{gamestate.score}</p>
		<div class="board-container">
			<div
				style="display: flex;justify-content:space-between;width:var(--field-width);margin-bottom: 8px;"
			>
				<div style="display: flex;align-items: end;">
					<button
						class="button color-button"
						on:click={() => {
							TtInstance.show();
						}}
						title="Tournament Mode"
					>
						Valikko
					</button>
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
				<Board
					{enableKIM}
					enableLSM={false}
					{grid}
					documentRoot={inputRoot}
					announcer={AnnouncerInstance}
					bind:this={BoardInstance}
				/>
			{/key}
			<div class="mini-container">
				{#each gamestates as gstate, index}
					{@const board = ohts_gamestate_to_grid(gstate.board)}
					{@const cached_name = ($name_cache || {})[gstate.user_id]}
					<div class="mini">
						<div class="mini-grid">
							{#key board}
								<Board {enableKIM} enableLSM={false} grid={board} />
							{/key}
						</div>
						<div class="mini-details">
							<p>{cached_name}</p>
							<p>{gstate.score}</p>
						</div>
					</div>
				{/each}
			</div>
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

		--tile-size: calc(
			calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) /
				var(--grid-size)
		);
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
	.mini {
		display: flex;
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
