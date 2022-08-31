import { get } from "svelte/store";
import { storage, getItem, setItem } from "./stores/storage";
import { browser } from "$app/environment";
import { theme_index } from "./stores/themestore";
import { my_top_scores, my_top_score_histories, my_top_submitted_scores } from "./stores/leaderboardstore";

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

function getTopScores() {
	return get(my_top_scores);
}

function getTopHistories() {
	return get(my_top_score_histories);
}

function getTopSubmitted() {
	return get(my_top_submitted_scores);
}

if (browser) {
	// @ts-ignore
	window.devtools = {
		setItem,
		getItem,
		getAllItems,

		setLocalStorage,

		getTheme,
		setTheme,

		getTopScores,
		getTopHistories,
		getTopSubmitted
	};
}
