<script lang="ts">
	import { swipe } from "svelte-gestures";
	import Preloader from "$lib/components/common/asset-preloader/Preloader.svelte";
	import MultiplayerMenu from "$lib/components/multiplayer/menu.svelte";
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
	import type Grid from "$lib/gamelogic/grid";
	import { browser, dev } from "$app/environment";
	import Tournaments from "$lib/components/multiplayer.svelte";
	import { onMount } from "svelte";

	$: inputManager_should_exist =
		$joined_game_id &&
		$game_details[$joined_game_id]?.started &&
		$state[$joined_game_id] &&
		$user_details != null;
	let localGameState: ohmp_gamestate | null = null;
	$: if (!inputManager_should_exist) localGameState = null;
	function move(direction: 0 | 1 | 2 | 3) {
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
					let predicted = JSON.parse(
						$wasm.apply_move_with_seed(JSON.stringify(localGameState), direction, true, random_seed)
					);
					console.info("client-side prediction", predicted);
					if (predicted.possible) {
						localGameState.tiles = predicted.tiles;
					}
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
		const direction_map = {
			top: 0,
			right: 1,
			bottom: 2,
			left: 3
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
	let monkeyInterval: ReturnType<typeof setInterval> | undefined;
	$: if (enableMonkey) {
		monkeyInterval = setInterval(() => {
			//@ts-ignore, we modulo integers by 4 so it's good.
			move(Math.round(Math.random() * 400) % 4);
		}, 500);
	} else {
		clearInterval(monkeyInterval);
	}

	let last_grid: Grid | null = null;

	function processGrid(inp: ohmp_gamestate, remote: boolean) {
		// Update localGameState
		let difference = localGameState ? do_gamestates_differ(localGameState, inp) : true;
		if (remote && difference) {
			localGameState = fix_new_ids(inp, localGameState);
		}

		let translated = ohmp_gamestate_to_grid(inp);
		if (last_grid) {
			translated = generate_previous_positions(translated, last_grid);
		}
		last_grid = translated;
		return translated;
	}

	import {
		ready,
		success as wasm_init_result,
		wasm,
		validation_cache,
		init as initWasm
	} from "$lib/wasm/twothousand_forty_eight";
	let mounted = false;
	onMount(async () => {
		await initWasm();
		mounted = true;
	});
</script>

<svelte:head>
	<title>Oispa Halla Moninpeli</title>
</svelte:head>

<main>
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
		{#if $wasm_init_result == null}
			<p class="loading">loading wasm...</p>
		{:else if $wasm_init_result}
			<p class="loaded">wasm ready</p>
		{:else}
			<p class="error">wasm could not be initialized</p>
		{/if}
	</div>
	{#if $joined_game_id && $game_details[$joined_game_id]?.started && $state[$joined_game_id] && $user_details != null}
		{@const gamestates = $state[$joined_game_id]}
		{@const gamestate = gamestates.find((s) => $user_details && s.user_id === $user_details.id)}

		{#if gamestate}
			{@const grid_o = gamestate.board}
			{@const grid_remote = processGrid(grid_o, true)}
			{@const grid_or_predicted =
				localGameState != null ? processGrid(localGameState, false) : grid_remote}
			{@const grid = grid_or_predicted}
			<p>{gamestate.score}</p>
			<p>
				ping: {$tournament_ping ?? "measuring..."}
			</p>
			<div class="board-container" bind:this={inputRoot} use:swipe on:swipe={swipeHandler}>
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
					<Board
						enableKIM={false}
						enableLSM={false}
						{grid}
						documentRoot={inputRoot}
						bind:this={BoardInstance}
					/>
				{/key}
				<div class="mini-container">
					{#each gamestates as gstate, index}
						{@const board = ohmp_gamestate_to_grid(gstate.board)}
						{@const cached_name = ($name_cache || {})[gstate.user_id]}
						<div class="mini">
							<div class="mini-grid">
								{#key board}
									<Board
										enableKIM={false}
										enableLSM={false}
										grid={board}
										enable_theme_chooser={false}
										documentRoot={null}
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

		--tile-size: calc(
			calc(
					var(--field-width, --default-field-width) -
						calc(var(--grid-gap) * calc(var(--grid-size) + 1))
				) / var(--grid-size)
		);
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
	.mini-container {
		--field-width: calc(500px / 4) !important;
		--grid-gap: calc(15px / 4);
		--tile-size: calc(
			calc(
					var(--field-width, --default-field-width) -
						calc(var(--grid-gap) * calc(var(--grid-size) + 1))
				) / var(--grid-size)
		);

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

	@media screen and (max-width: 520px) {
		:root {
			--field-width: 320px !important;
			--grid-gap: 10px !important;
			--tile-border-radius: 3px !important;
		}
	}
</style>
