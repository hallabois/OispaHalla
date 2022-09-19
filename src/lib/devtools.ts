import { get } from "svelte/store";
import { storage, getItem, setItem, getWholeLocalForage } from "./stores/storage";
import { browser } from "$app/environment";
import { theme_index } from "./stores/themestore";
import type GameManager from "./gamelogic/game_manager";

function getAllItems() {
	return get(storage);
}

function setLocalStorage(data: string) {
	let parsed = JSON.parse(data);
	console.info("Clearing localstorage...");
	localStorage.clear();
	console.info("Updating localstorage...");
	for (let k of Object.keys(parsed)) {
		localStorage.setItem(k, parsed[k]);
	}
	console.info("Localstorage operation ready, have a nice day.");
}

function getTheme() {
	return get(theme_index);
}

function setTheme(index: number) {
	theme_index.set(index);
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

if (browser) {
	// @ts-ignore
	window.devtools = {
		setItem,
		getItem,
		getAllItems,
		getWholeLocalForage,

		setLocalStorage,

		getTheme,
		setTheme,

		getHACHistory,
		getGameManagerInstance
	};
}
