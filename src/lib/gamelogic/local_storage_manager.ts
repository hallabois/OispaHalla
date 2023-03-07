import { getItem, setItem } from "$lib/stores/storage";
import type GameManager from "./game_manager";

export default class LocalStorageManager {
	enabled: boolean;
	gameStateKey: string;
	constructor(enabled = true) {
		this.enabled = enabled;
		this.gameStateKey = "gameState";
		if (!this.enabled) {
			return;
		}

		if (getItem("bestScores") == null) {
			setItem("bestScores", {
				"3": 0,
				"4": 0
			});
		}
	}
	// Best score getters/setters
	getBestScore(size: number) {
		if (!this.enabled) {
			return 0;
		}
		try {
			if (getItem("bestScores") != null) {
				if (Object.keys(getItem("bestScores")).includes(size.toString())) {
					const val = getItem("bestScores")[size];
					return val;
				}
			}
		} catch (e) {
			console.log("Best scores not working!", e);
			return 0;
		}
		return 0;
	}
	setBestScore(score: number, size: number) {
		if (!this.enabled) {
			return;
		}
		const current = getItem("bestScores");
		current[size] = score;
		setItem("bestScores", current);
	}
	// Game state getters/setters and clearing
	getGameState() {
		if (!this.enabled) {
			return;
		}
		const state = getItem(this.gameStateKey);
		return state;
	}
	setGameState(gameState: ReturnType<GameManager["serialize"]>) {
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
