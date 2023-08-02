<script lang="ts">
	import { swipe } from "svelte-gestures";
	import Preloader from "$lib/components/common/asset-preloader/Preloader.svelte";
	import MultiplayerMenu from "$lib/components/multiplayer/menu.svelte";
	import GameBoard from "$lib/components/board/gameBoard.svelte";
	import Announcer from "$lib/components/common/announcer/announcer.svelte";
	import {
		connect,
		connection_error,
		game_details,
		joined_game_id,
		multiplayer_endpoint,
		name_cache,
		request_move,
		state,
		tournament_ping,
		user_details
	} from "$lib/stores/multiplayer";
	import {
		generate_previous_positions,
		ohmp_gamestate_to_grid,
		type ohmp_gamestate,
		do_gamestates_differ,
		fix_new_ids
	} from "$lib/gamelogic/utils";
	import KeyboardInputManager from "$lib/gamelogic/keyboard_input_manager";
	import { browser, dev } from "$app/environment";
	import Tournaments from "$lib/components/multiplayer.svelte";
	import { onMount } from "svelte";

	$: inputManager_should_exist =
		$joined_game_id &&
		$game_details[$joined_game_id]?.started &&
		$state[$joined_game_id] &&
		$user_details != null;
	let localGameState: Board | null = null;
	function move(direction: Direction) {
		if (inputManager_should_exist) {
			console.log("server-side move called with the value", direction);
			request_move(direction);
			if ($wasm && localGameState) {
				try {
					let random_seed = undefined;
					if ($joined_game_id) {
						const gamestates = $state[$joined_game_id] ?? [];
						const gamestate = gamestates.find(
							(s) => $user_details && s.user_id === $user_details.id
						);
						if (gamestate) {
							random_seed = $joined_game_id + gamestate.length + 1;
						}
					}
					console.log("rng seed", random_seed);
					try {
						let predicted = $wasm.apply_move(localGameState, direction, true);

						console.info("client-side prediction", predicted);
						localGameState.tiles = predicted.board.tiles;
					} catch (e) {}
				} catch (e) {
					console.warn("client-side prediction failed", e);
				}
			}
			return true;
		} else {
			// Propagate event
			return false;
		}
	}
	function swipeHandler(event: CustomEvent) {
		const direction_map: {
			[key: string]: Direction;
		} = {
			top: "UP",
			right: "RIGHT",
			bottom: "DOWN",
			left: "LEFT"
		};
		const direction = event.detail.direction;
		const direction_mapped = direction_map[direction];
		move(direction_mapped);
	}
	$: if (inputManager_should_exist && inputRoot != null) {
		console.log("inputroot", inputRoot);
		if (!dev) {
			window.onbeforeunload = () => {
				return "Oletko varma että haluat jättää pelin kesken?";
			};
		}

		inputManager = new KeyboardInputManager(inputRoot);
		inputManager.on("move", move);
	} else {
		if (browser) {
			window.onbeforeunload = null;
		}
	}

	let inputManager: KeyboardInputManager | null = null;
	let inputRoot: HTMLElement;
	let AnnouncerInstance: Announcer;
	let TtInstance: Tournaments;
	$: if (
		$joined_game_id &&
		$game_details[$joined_game_id] &&
		$game_details[$joined_game_id].winner_id
	) {
		TtInstance.show();
	}

	let enableMonkey = false;
	let monkeyInterval: ReturnType<typeof setInterval> | undefined;
	$: if (enableMonkey) {
		monkeyInterval = setInterval(() => {
			//@ts-ignore, we modulo integers by 4 so it's good.
			move(Math.round(Math.random() * 400) % 4);
		}, 500);
	} else {
		clearInterval(monkeyInterval);
	}

	import {
		ready,
		success as wasm_init_result,
		wasm,
		validation_cache,
		init as initWasm
	} from "$lib/wasm/twothousand_forty_eight";
	import type { Board, Direction } from "twothousand-forty-eight";
	import { board_to_tile_array, complete_tiles } from "$lib/gamelogic/new";
	let mounted = false;
	onMount(async () => {
		await initWasm();
		mounted = true;
	});
</script>

<main class="game-background">
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
	<div class="wasm-indicator">
		<p>{$multiplayer_endpoint}</p>
		<p>{$user_details?.id ?? "-"}</p>
		<p>{$joined_game_id ?? "-"}</p>
		<p>{$user_details?.admin ?? ""}</p>
	</div>
	{#if $joined_game_id && $game_details[$joined_game_id]?.started && $state[$joined_game_id] && $user_details != null}
		{@const gamestates = $state[$joined_game_id]}
		{@const gamestate = gamestates.find((s) => $user_details && s.user_id === $user_details.id)}

		{#if gamestate}
			{@const grid_o = gamestate.board}
			{@const grid_remote = board_to_tile_array(grid_o)}
			{@const grid_or_predicted =
				localGameState != null ? board_to_tile_array(localGameState) : grid_remote}
			{@const grid = grid_or_predicted}
			<p>{gamestate.score}</p>
			<p>
				ping: {$tournament_ping ?? "measuring..."}
			</p>
			<div class="board-container">
				<div
					style="display: flex;justify-content:space-between;width:var(--field-width, --default-field-width);margin-bottom: 8px;"
				>
					<div style="display: flex;align-items: end;">
						<button
							class="button color-button"
							on:click={() => {
								TtInstance.show();
							}}
						>
							Valikko
						</button>
					</div>
					<div style="display: flex;align-items: center;gap: .5em;">
						<label for="monkey">Enable monkey</label>
						<input id="monkey" type="checkbox" bind:checked={enableMonkey} />
					</div>
				</div>
				{#key grid}
					<GameBoard
						size={gamestate.board.width}
						tiles={grid}
						last_move_direction={null}
						last_move_tiles={null}
						{swipeHandler}
					/>
				{/key}
				<div class="mini-container">
					{#each gamestates as gstate, index}
						{@const board = board_to_tile_array(gstate.board)}
						{@const cached_name = ($name_cache || {})[gstate.user_id]}
						<div class="mini">
							<div class="mini-grid">
								{#key board}
									<GameBoard
										size={gstate.board.width}
										tiles={board}
										last_move_direction={null}
										last_move_tiles={null}
									/>
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
		{:else}
			<p>gamestate not found?</p>
		{/if}
		<Tournaments bind:this={TtInstance} />
	{:else}
		<div class="blurry-bg menu-bg">
			<div class="menu">
				<MultiplayerMenu announcer={AnnouncerInstance} />
			</div>
		</div>
	{/if}
</main>

<Preloader />

<style>
	main {
		min-height: 100vh;
		min-height: 100svh;

		display: grid;
		place-items: center;
	}
	.wasm-indicator {
		position: fixed;
		top: 0;
		left: 0;
		opacity: 0.5;
	}
	.wasm-indicator .error {
		color: red;
		background-color: black;
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
		min-width: 350px;
		max-width: 90vw;
	}
	.board-container {
		display: grid;
		place-items: center;
	}
	.board-container {
		--field-width: calc(500px / 1) !important;
		--grid-gap: calc(15px / 1);
	}
	.mini-container {
		--mini-factor: max(var(--player-count, 1), 4);
		--field-width: calc(500px / var(--mini-factor)) !important;
		--grid-gap: calc(15px / var(--mini-factor));
	}
	.mini-container,
	.board-container {
		--tile-size: calc(
			calc(
					var(--field-width, --default-field-width) -
						calc(var(--grid-gap) * calc(var(--grid-size) + 1))
				) / var(--grid-size)
		);
	}
	.mini-container {
		display: flex;
		gap: 0.5em;
		margin-top: 0.2em;
	}
	.mini {
		display: flex;
		background-color: var(--dialog-background);
		border-radius: calc(var(--tile-border-radius) * 2);
	}
	.mini-grid {
		width: var(--field-width);
		height: var(--field-width);
		overflow: hidden;
	}
	.mini-details {
		padding: 0.1em 0.5em;
	}
	.mini-details * {
		padding: 0;
		margin: 0;
	}
	:global(.mini-container .tile-inner) {
		animation: none !important;
		-moz-animation: none !important;
		-webkit-animation: none !important;
	}
</style>
