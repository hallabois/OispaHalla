import { get } from "svelte/store";
import { storage, getItem, setItem, getWholeLocalForage, clearStorage } from "./stores/storage";
import { browser } from "$app/environment";
import { available_themes, festives_applied, theme_index } from "./stores/themestore";
import { wasm, ready, init } from "$lib/wasm/twothousand_forty_eight";

function getAllItems() {
	return get(storage);
}

function setWholeLocalForage(data: string) {
	let parsed = JSON.parse(data);
	console.info("Clearing storage...");
	clearStorage();
	console.info("Updating storage...");
	for (let k of Object.keys(parsed)) {
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
	let game_manager = window.GameManagerDebugInstance;
	let size = game_manager.size;
	let history = game_manager.history;
	return `${size}x${size}S${history.join(":")}`;
}

function getGameManagerInstance() {
	// @ts-ignore
	return window.GameManagerDebugInstance;
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
	let history = getHACHistory();
	let wasm = await getWasmAndSetup();
	let result = wasm?.validate(history);
	if (result == null) return;
	return JSON.parse(result);
}

async function validateCurrentHistoryAllFrames() {
	let history = getHACHistory();
	let wasm = await getWasmAndSetup();
	let result = wasm?.validate_all_frames(history);
	if (result == null) return;
	return JSON.parse(result);
}

if (browser) {
	// @ts-ignore
	window.devtools = {
		setItem,
		getItem,
		getAllItems,
		getWholeLocalForage,

		setWholeLocalForage,

		getTheme,
		getAvailableThemes,
		setTheme,
		getAppliedFestives,
		setAppliedFestives,

		getHACHistory,
		getGameManagerInstance,

		initWasm,
		getWasm,
		getWasmReady,

		validateCurrentHistory,
		validateCurrentHistoryAllFrames,

		stores: {
			get
		}
	};
}
