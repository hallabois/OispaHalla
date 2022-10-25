<script lang="ts">
	import { onMount } from "svelte";
	import { storage_status, storage_loaded } from "$lib/stores/storage";
	import Board from "./template.svelte";

	import GameManager from "$lib/gamelogic/game_manager";
	import html_actuator from "$lib/gamelogic/html_actuator";
	import LocalStorageManager from "$lib/gamelogic/local_storage_manager";
	import KeyboardInputManager from "$lib/gamelogic/keyboard_input_manager";
	import { generate_previous_positions } from "$lib/gamelogic/utils";
	import type Grid from "$lib/gamelogic/grid";
	import { base_path } from "$lib/stores/themestore";
	import type Announcer from "../tournaments/announcer.svelte";

	export let announcer: Announcer | null;
	export let enableKIM = false;
	export let enableLSM = false;
	export let enableRng = false;
	export let documentRoot: HTMLElement | null;
	export let initComponentsOnMount = true;
	export let enable_theme_chooser = true;

	export let grid: Grid | null = null;

	let board: HTMLElement;
	let GameManagerInstance: GameManager | null;
	let HTMLActuatorInstance: html_actuator;
	let KIM: KeyboardInputManager;
	let LSM: LocalStorageManager;

	export function setDocumentRoot(root: HTMLElement) {
		documentRoot = root;
	}

	export function setAnnouncer(announ: Announcer) {
		announcer = announ;
	}

	export function initcomponents() {
		if (GameManagerInstance) {
			GameManagerInstance = null;
		}
		HTMLActuatorInstance = new html_actuator(documentRoot || board);
		// if(KIM && KIM.removeKeydownHandler) {
		//     KIM.removeKeydownHandler();
		// }
		KIM = new KeyboardInputManager(board, enableKIM);
		LSM = new LocalStorageManager(enableLSM);
		GameManagerInstance = new GameManager(
			4,
			KIM,
			HTMLActuatorInstance,
			LSM,
			documentRoot || board,
			announcer,
			grid,
			enableRng
		);
	}

	export function getGameManagerInstance() {
		return GameManagerInstance;
	}

	export let enablePrevGen = false;
	let prevGrid: Grid;
	$: if (board && grid && grid != null && enablePrevGen) {
		if (prevGrid) {
			grid = generate_previous_positions(grid, prevGrid);
		}
		if (JSON.stringify(prevGrid) != JSON.stringify(grid)) {
			// reinitcomponents();
			HTMLActuatorInstance.actuate(grid, {
				score: 0,
				terminated: false,
				palautukset: 0
			});
			GameManagerInstance.grid = grid;
			prevGrid = grid;
		}
	}

	$: if ($base_path && GameManagerInstance) {
		GameManagerInstance.actuate();
	}

	$: if (KIM && enableKIM != KIM.enabled) {
		// if(KIM && KIM.removeKeydownHandler) {
		//     KIM.removeKeydownHandler();
		// }
		KIM = new KeyboardInputManager(board, enableKIM);
		GameManagerInstance.inputManager = KIM;
	}

	let unique = {};
	export function destruct() {
		return;
	}

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	$: if (initComponentsOnMount && mounted && $storage_loaded) {
		console.log("Starting to load game logic...");
		initcomponents();
	}
</script>

<main bind:this={board} title={$storage_status}>
	{#key unique}
		<Board {enable_theme_chooser} />
	{/key}
</main>

<style>
</style>
