<script lang="ts">
	import GameBoard from "./gameBoard.svelte";
	import { browser } from "$app/environment";
	import { storage_loaded } from "$lib/stores/storage";
	import { init, wasm } from "$lib/wasm/twothousand_forty_eight";
	import { onMount } from "svelte";
	import "../../../style/board.scss";
	import { active_size, gamestate, last_move, tiles, tiles_last_turn } from "$lib/gamelogic/new";
	import type { Direction } from "twothousand-forty-eight";

	import { open_popups } from "$lib/stores/popupstore";
	export let enable_theme_chooser = true;

	$: loading = !browser || !$wasm || !storage_loaded || !gamestate;
	$: size = $active_size || 4;

	export let move: { (direction: Direction): boolean } = (direction: Direction) => {
		if ($open_popups.length > 0) return false;
		if ($gamestate) {
			$gamestate.move(direction);
			return true;
		}
		return false;
	};
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

	export let restart: { (force: boolean): boolean } = (force) => {
		if ($open_popups.length > 0) return false;
		if ($gamestate) {
			$gamestate.restart(force);
			return true;
		}
		return false;
	};

	export let revertMove: { (): boolean } = () => {
		if ($open_popups.length > 0) return false;
		if ($gamestate) {
			$gamestate.revertMove();
			return true;
		}
		return false;
	};

	onMount(async () => {
		await init();
	});
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "ArrowUp" || e.key === "w") {
			if (!move("UP")) return;
		} else if (e.key === "ArrowDown" || e.key === "s") {
			if (!move("DOWN")) return;
		} else if (e.key === "ArrowLeft" || e.key === "a") {
			if (!move("LEFT")) return;
		} else if (e.key === "ArrowRight" || e.key === "d") {
			if (!move("RIGHT")) return;
		} else if (e.key === "r") {
			if (e.ctrlKey || e.metaKey) {
				return;
			}
			if (!restart(false)) return;
		} else if (e.key === "e") {
			if (e.ctrlKey || e.metaKey) {
				return;
			}
			if (!revertMove()) return;
		} else {
			return;
		}
		// prevent scrolling, etc.
		e.preventDefault();
		e.stopPropagation();
	}}
/>

<GameBoard
	aknowledgeWinScreen={() => {
		$gamestate?.aknowledgeWinScreen();
	}}
	{restart}
	{swipeHandler}
	{loading}
	tiles={$tiles || []}
	last_move_direction={$last_move}
	last_move_tiles={$tiles_last_turn}
	won={$gamestate?.state.won ?? false}
	game_over={$gamestate?.state.over ?? false}
	win_screen_shown={$gamestate?.win_screen_shown ?? false}
	break_count={$gamestate?.state.breaks ?? 0}
	{enable_theme_chooser}
	{size}
/>
