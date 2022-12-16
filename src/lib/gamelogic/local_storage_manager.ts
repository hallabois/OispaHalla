import { getItem, setItem } from "$lib/stores/storage";

export default class LocalStorageManager {
	enabled: boolean;
	gameStateKey: string;
	constructor(enabled: boolean = true) {
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
					let val = getItem("bestScores")[size];
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
