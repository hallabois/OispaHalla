import { get } from "svelte/store";
import {
	storage,
	getItem,
	setItem,
	getWholeLocalForage,
	clearStorage,
	storage_loaded,
	storage_status
} from "./stores/storage";
import { browser } from "$app/environment";
import { available_themes, festives_applied, theme_index } from "./stores/themestore";
import { wasm, ready, init } from "$lib/wasm/twothousand_forty_eight";
import { open_popups } from "$lib/stores/popupstore";
import { auth } from "./Auth/authstore";
import type GameManager from "./gamelogic/game_manager";
import * as mp from "./stores/multiplayer";
import { gamestate, gamestates, set_active_size } from "./gamelogic/new";

function isStorageLoaded() {
	return get(storage_loaded);
}

function getStorageStatus() {
	return get(storage_status);
}

function getAllItems() {
	return get(storage);
}

function setWholeLocalForage(data: string) {
	const parsed = JSON.parse(data);
	console.info("Clearing storage...");
	clearStorage();
	console.info("Updating storage...");
	for (const k of Object.keys(parsed)) {
		setItem(k, parsed[k]);
	}
	console.info("Storage operation ready, have a nice day.");
}

function getTheme() {
	return get(theme_index);
}

function getAvailableThemes() {
	return get(available_themes);
}

function setTheme(index: number) {
	theme_index.set(index);
}

function getAppliedFestives() {
	return get(festives_applied);
}

function setAppliedFestives(applied: string[]) {
	festives_applied.set(applied);
}

function getHACHistory() {
	// @ts-ignore
	const game_manager = window.GameManagerDebugInstance;
	const size = game_manager.size;
	const history = game_manager.history;
	return `${size}x${size}S${history.join(":")}`;
}

function getGameState() {
	return get(gamestate);
}

async function initWasm() {
	await init();
}

function getWasm() {
	return get(wasm);
}

function getWasmReady() {
	return get(ready);
}

async function getWasmAndSetup() {
	if (getWasm() == null) {
		await initWasm();
	}
	return getWasm();
}

async function validateCurrentHistory() {
	const history = getHACHistory();
	const wasm = await getWasmAndSetup();
	const result = wasm?.validate(history);
	if (result == null) return;
	return JSON.parse(result);
}

async function validateCurrentHistoryAllFrames() {
	const history = getHACHistory();
	const wasm = await getWasmAndSetup();
	const result = wasm?.validate_all_frames(history);
	if (result == null) return;
	return JSON.parse(result);
}

function getOpenPopups() {
	return get(open_popups);
}

function toggleZenMode() {
	const currentMode: boolean = getItem("zen_mode");
	setItem("zen_mode", !currentMode);
	console.log(`Toggled zen mode, new value: ${!currentMode}`);
}

function getAuth() {
	return get(auth);
}

function testProbabilities() {
	const iters = 10_000;
	console.log(`Starting probability test using ${iters} iterations...`);
	// @ts-ignore
	const game_manager: GameManager = window.GameManagerDebugInstance;
	const values = [];
	for (let i = 0; i < iters; i++) {
		const tile = game_manager.getRandomTileToAdd();
		if (!tile) {
			console.error("getRandomTileToAdd didn't return anything!");
			return;
		}
		values.push(tile.value);
	}
	const values_total = values.length;
	const counted: number[] = [];
	console.log("Percentages:");
	for (const k of values) {
		if (!counted.includes(k)) {
			const c = values.filter((v) => v == k).length;
			console.log(`"${k}": ${c} = ${(c / values_total) * 100}%`);
			counted.push(k);
		}
	}
}

function setMpEndpoint(endpoint_url: string) {
	mp.disconnect();
	setTimeout(() => {
		mp.tournament_endpoint.set(endpoint_url);
	}, 2000);
}

if (browser) {
	// @ts-ignore
	window.devtools = {
		setItem,
		getItem,
		getAllItems,
		getWholeLocalForage,

		isStorageLoaded,
		getStorageStatus,

		setWholeLocalForage,

		getTheme,
		getAvailableThemes,
		setTheme,
		getAppliedFestives,
		setAppliedFestives,

		getHACHistory,
		getGameState,
		set_active_size,

		initWasm,
		getWasm,
		getWasmReady,

		setMpEndpoint,
		mp,

		validateCurrentHistory,
		validateCurrentHistoryAllFrames,

		stores: {
			get
		},
		getOpenPopups,

		toggleZenMode,

		getAuth,

		testProbabilities
	};
}
