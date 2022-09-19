import { tabID } from "$lib/session_manager";

import { getItem, setItem } from "$lib/stores/storage";
import { browser } from "$app/environment";

export default class LocalStorageManager {
	enabled: boolean;
	bestScoreKey: string;
	gameStateKey: string;
	constructor(enabled: boolean = true) {
		this.enabled = enabled;
		this.bestScoreKey = "bestScore";
		this.gameStateKey = "gameState";
		if (!this.enabled) {
			return;
		}

		if (getItem("bestScore") && getItem("bestScores") == null) {
			setItem("bestScores", {
				"4": getItem("bestScore")
			});
		}
		if (getItem("bestScores") == null) {
			setItem("bestScores", {
				"3": 0,
				"4": 0
			});
		}
	}
	// Best score getters/setters
	getBestScore() {
		if (!this.enabled) {
			return 0;
		}
		return getItem(this.bestScoreKey) || 0;
	}
	getBestScorePlus(size: number) {
		if (!this.enabled) {
			return 0;
		}
		try {
			if (getItem("bestScores") != null) {
				if (Object.keys(getItem("bestScores")).includes(size.toString())) {
					let val = getItem("bestScores")[size];
					return val;
				}
			}
		} catch (e) {
			console.log("Best scores not working!", e);
			return 0;
		}
		if (size == 4) {
			return this.getBestScore();
		}
		return 0;
	}
	setBestScore(score: number) {
		if (!this.enabled) {
			return;
		}
		setItem(this.bestScoreKey, score);
	}
	setBestScorePlus(score: number, size: number) {
		if (!this.enabled) {
			return;
		}
		setItem(this.bestScoreKey, score);
		let current = getItem("bestScores");
		current[size] = score;
		setItem("bestScores", current);
	}
	// Game state getters/setters and clearing
	getGameState() {
		if (!this.enabled) {
			return;
		}
		let state = getItem(this.gameStateKey);
		return state;
	}
	setGameState(gameState: any) {
		if (!this.enabled) {
			return;
		}
		setItem(this.gameStateKey, gameState);
	}
	clearGameState() {
		if (!this.enabled) {
			return;
		}
		setItem(this.gameStateKey, null);
	}
}
