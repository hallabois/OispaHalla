import { tabID } from "$lib/session_manager";

import { getItem, setItem } from "$lib/stores/storage";
import { browser } from "$app/environment";

export default class LocalStorageManager {
	enabled: boolean;
	bestScoreKey: string;
	gameStateKey: string;
	constructor(enabled: boolean = true) {
		this.enabled = enabled;
		if (!this.enabled) {
			return;
		}
		this.bestScoreKey = "bestScore";
		this.gameStateKey = "gameState";

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
		if (browser && localStorage.lastSession && localStorage.lastSession != tabID) {
			this.resolveConflict();
		} else {
			setItem(this.bestScoreKey, score);
		}
	}
	setBestScorePlus(score, size) {
		if (!this.enabled) {
			return;
		}
		if (browser && localStorage.lastSession && localStorage.lastSession != tabID) {
			this.resolveConflict();
		} else {
			setItem(this.bestScoreKey, score);
			let current = getItem("bestScores");
			current[size] = score;
			setItem("bestScores", current);
		}
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
		if (browser && localStorage.lastSession && localStorage.lastSession != tabID) {
			this.resolveConflict();
		} else {
			if (browser) {
				localStorage.setItem("lastSession", tabID);
			}
			setItem(this.gameStateKey, gameState);
		}
	}
	clearGameState() {
		if (!this.enabled) {
			return;
		}
		if (browser && localStorage.lastSession && localStorage.lastSession != tabID) {
			this.resolveConflict();
		} else {
			setItem(this.gameStateKey, null);
		}
	}
	resolveConflict() {
		if (!this.enabled) {
			return;
		}
		let overwrite = confirm(
			"Sinulla on useampi Oispa Halla™ välilehti auki!\nHaluatko lataa aiemman välilehden tilan tähän välilehteen?\n\n(Jos et paina OK, pelisi ei tallennu, kunnes suljet toiset välilehdet)"
		);
		// Analytics
		try {
			// sa_event('conflict_resolved_to_' + overwrite);
		} catch {}
		//
		if (overwrite) {
			localStorage.setItem("lastSession", tabID);
			// HallaAntiCheat = null; // Estää vahingolliset kirjoitukset historiaan. Aiheuttaa virheitä ennen reloadia, mutta ketä kiinnostaa ¯\_(ツ)_/¯
			document.write("Ladataan uudelleen...");
			window.location.reload();
		}
	}
}
