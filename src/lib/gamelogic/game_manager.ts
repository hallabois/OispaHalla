declare let sa_event: Function;

import Grid from "./grid";
import type HTMLActuator from "./html_actuator";
import type KeyboardInputManager from "./keyboard_input_manager";
import type LocalStorageManager from "./local_storage_manager";
import Tile from "./tile";

import { getItem, setItem } from "$lib/stores/storage";
import { TAB_BLOCK } from "$lib/session_manager";
import { get } from "svelte/store";
import { browser, dev } from "$app/environment";
import { recordGame } from "$lib/stores/analytics";

export default class GameManager {
	size: any;
	//@ts-ignore, make sure it's always initialized
	history: string[];
	inputManager: any;
	storageManager: LocalStorageManager;
	actuator: any;
	startTiles: number;
	numOfScores: number;
	popup: Element | null;
	palautukset = 0;
	//@ts-ignore, make sure it's always initialized
	grid: Grid;
	over = false;
	won = false;
	score: number;
	run_best_score: number | null; // Keep track of the best score reached during this run, as kurinpalautukset changes the score by -1000
	doKeepPlaying: boolean | null;

	documentRoot: HTMLElement;
	enable_random: boolean;

	subscribers: Function[];

	subscribe(listener: Function) {
		this.subscribers = [...this.subscribers, listener];
	}
	update_subscribers() {
		for (const subscriber of this.subscribers) {
			subscriber();
		}
	}

	constructor(
		size: number,
		InputManager: KeyboardInputManager,
		Actuator: HTMLActuator,
		StorageManager: LocalStorageManager,
		documentRoot: HTMLElement,
		grid: Grid | null = null,
		enable_random = true
	) {
		this.documentRoot = documentRoot;
		this.enable_random = enable_random;

		this.size = size; // Size of the grid
		this.inputManager = InputManager;
		this.storageManager = StorageManager;
		this.actuator = Actuator;
		this.score = 0;
		this.run_best_score = null;
		this.doKeepPlaying = null;

		this.startTiles = 2;
		this.numOfScores = 10;

		this.inputManager.on("restart", this.restart.bind(this));
		this.inputManager.on("move", this.move.bind(this));
		this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

		this.popup = this.documentRoot.querySelector(".lb-popup");
		this.subscribers = [];

		if (typeof grid !== "undefined" && grid) {
			this.grid = grid;
			// Update the actuator
			this.actuate();
		} else {
			this.setup();
		}
	}
	// Export the current game for later analysis
	serialize_HAC(gridState: number[], direction: string | number, added: string | undefined) {
		return gridState.join(".") + "+" + added + ";" + direction;
	}
	// Restart the game
	restart() {
		this.recordBest();
		this.storageManager.clearGameState();
		this.actuator.continueGame(); // Clear the game won/lost message
		//this.size = 4;
		this.setup();
		this.update_subscribers();
	}

	// Restart the game
	restartplus(size = 3) {
		this.recordBest();
		this.storageManager.clearGameState();
		this.actuator.continueGame(); // Clear the game won/lost message
		this.size = size;
		this.setup();
		this.update_subscribers();
	}
	// Keep playing after winning (allows going over 2048)
	keepPlaying() {
		this.doKeepPlaying = true;
		this.actuator.continueGame(); // Clear the game won/lost message
	}

	paritaKuli() {
		if (!this.isGameTerminated()) {
			if (this.score >= 1000) {
				if (this.palautukset < 3) {
					this.palautukset++;
					this.score -= 1000;
					this.grid.palautaKuri();
					this.actuate();
					this.actuator.paritaKuli();
				} else alert("Olet lahjonut opettajia liikaa! Halla on pettynyt sinuun.");
			} else alert("Et ole tarpeeksi suosittu opettajien keskuudessa lahjomaan heitä!");
		}
		this.update_subscribers();
	}
	// Return true if the game is lost, or has won and the user hasn't kept playing
	isGameTerminated() {
		return this.over || (this.won && !this.doKeepPlaying);
	}

	// Set up the game
	setup() {
		const previousState = this.storageManager.getGameState();
		this.loadPreviousState(previousState);

		// Analytics
		try {
			sa_event("new_game");
			sa_event("new_game_size_" + this.size);
		} catch {}
		//

		// Update the actuator
		this.actuate();
	}
	// Set up the initial tiles to start the game with
	addStartTiles() {
		if (!this.enable_random) {
			return;
		}
		for (let i = 0; i < this.startTiles; i++) {
			this.addRandomTile();
		}
	}
	// Adds a tile in a random position
	addRandomTile() {
		const tile = this.getRandomTileToAdd();
		if (tile) {
			this.grid.insertTile(tile);
			return "" + tile.x + "," + tile.y + "." + tile.value; // for HAC
		}
		this.update_subscribers();
	}
	getRandomTileToAdd() {
		if (!this.enable_random) {
			return;
		}
		if (this.grid.cellsAvailable()) {
			const value = Math.random() < 0.9 ? 2 : 4;
			const chosen_location = this.grid.randomAvailableCell();
			if (chosen_location) {
				const tile = new Tile(chosen_location, value);
				return tile;
			}
		}
	}

	loadPreviousState(previousState: any) {
		// Reload the game from a previous game if present
		if (previousState) {
			this.grid = new Grid(previousState.grid.size, previousState.grid.cells); // Reload grid
			this.size = previousState.grid.size;
			this.score = previousState.score;
			this.run_best_score = previousState.run_best_score;
			this.palautukset = previousState.palautukset == undefined ? 0 : previousState.palautukset;
			this.over = previousState.over;
			this.won = previousState.won;
			this.doKeepPlaying = previousState.keepPlaying;
			this.history = previousState.history || [];
		} else {
			this.grid = new Grid(this.size);
			this.score = 0;
			this.run_best_score = 0;
			this.palautukset = 0;
			this.over = false;
			this.won = false;
			this.doKeepPlaying = false;
			this.history = [];

			// Add the initial tiles
			this.addStartTiles();
		}
		this.update_subscribers();
	}

	// Sends the updated grid to the actuator
	actuate() {
		if (this.storageManager.getBestScore(this.size) < this.score) {
			this.storageManager.setBestScore(this.score, this.size);
		}

		// Clear the state when the game is over (game over only, not win)
		if (this.over) {
			this.storageManager.clearGameState();
		} else {
			this.storageManager.setGameState(this.serialize());
		}

		this.actuator.actuate(this.grid, {
			score: this.score,
			palautukset: this.palautukset,
			over: this.over,
			won: this.won,
			bestScore: this.storageManager.getBestScore(this.size),
			terminated: this.isGameTerminated()
		});
		this.update_subscribers();
	}
	// Represent the current game as an object
	serialize() {
		return {
			grid: this.grid.serialize(),
			score: this.score,
			run_best_score: this.run_best_score,
			palautukset: this.palautukset,
			over: this.over,
			won: this.won,
			size: this.size,
			keepPlaying: this.doKeepPlaying,
			history: this.history
		};
	}
	// Save all tile positions and remove merger info
	prepareTiles() {
		this.grid.eachCell(function (x: number, y: number, tile: any) {
			if (tile) {
				tile.mergedFrom = null;
				tile.hasBeenMerged = false;
				tile.savePosition();
			}
		});
	}
	// Move a tile and its representation
	moveTile(tile: Tile, cell: any) {
		this.grid.cells[tile.x][tile.y] = null;
		this.grid.cells[cell.x][cell.y] = tile;
		tile.updatePosition(cell);
	}
	// Move tiles on the grid in the specified direction
	move(direction: 0 | 1 | 2 | 3) {
		const HAC_grid = this.grid.serialize_HAC();

		// 0: up, 1: right, 2: down, 3: left
		const directions = ["up", "right", "down", "left"];

		if (this.isGameTerminated()) return; // Don't do anything if the game's over

		let cell, tile;

		const vector = this.getVector(direction);
		const traversals = this.buildTraversals(vector);
		let moved = false;

		// Save the current tile positions and remove merger information
		this.prepareTiles();

		// Traverse the grid in the right direction and move tiles
		traversals.x.forEach((x) => {
			traversals.y.forEach((y) => {
				cell = { x, y };
				tile = this.grid.cellContent(cell);

				if (tile) {
					const positions = this.findFarthestPosition(cell, vector);
					const next = this.grid.cellContent(positions.next);

					// Only one merger per row traversal?
					if (next && next.value === tile.value && !next.mergedFrom) {
						const merged = new Tile(positions.next, tile.value * 2);
						merged.mergedFrom = [tile, next];
						tile.hasBeenMerged = true;
						next.hasBeenMerged = true;

						this.grid.insertTile(merged);
						this.grid.removeTile(tile);

						// Converge the two tiles' positions
						tile.updatePosition(positions.next);

						// Update the score
						this.score += merged.value;
						if (this.run_best_score != null) {
							this.run_best_score = Math.max(this.run_best_score, this.score);
						}

						// The mighty 2048 tile
						if (merged.value === 2048) this.won = true;
					} else {
						this.moveTile(tile, positions.farthest);
					}

					if (!this.positionsEqual(cell, tile)) {
						moved = true; // The tile moved from its original cell!
					}
				}
			});
		});
		let ended = false;

		let added: string | undefined = "";
		if (moved) {
			added = this.addRandomTile();

			if (!this.movesAvailable()) {
				this.over = true; // Game over!

				// Record end for HAC
				const state = this.serialize_HAC(HAC_grid, "f", added);
				this.pushToHistory(state);

				this.recordBest();

				// Analytics
				recordGame(this.size + "x" + this.size + "S" + this.history.join(":"), this.score);
				try {
					sa_event("game_failed");
				} catch {}
				//

				ended = true;
			}

			this.actuate();
		}
		if (!ended && moved) {
			const HAC_direction = moved ? direction : "e";
			//HAC_grid = this.grid.serialize_HAC();
			const state = this.serialize_HAC(HAC_grid, HAC_direction, added);
			this.pushToHistory(state);

			this.recordBest();
		}
		this.update_subscribers();
	}
	// Get the vector representing the chosen direction
	getVector(direction: 0 | 1 | 2 | 3): { x: number; y: number } {
		// Vectors representing tile movement
		const map = {
			0: { x: 0, y: -1 },
			1: { x: 1, y: 0 },
			2: { x: 0, y: 1 },
			3: { x: -1, y: 0 } // Left
		};

		return map[direction];
	}
	// Build a list of positions to traverse in the right order
	buildTraversals(vector: { x: number; y: number }) {
		const traversals = { x: [], y: [] };

		for (let pos = 0; pos < this.size; pos++) {
			//@ts-ignore
			traversals.x.push(pos);
			//@ts-ignore
			traversals.y.push(pos);
		}

		// Always traverse from the farthest cell in the chosen direction
		if (vector.x === 1) traversals.x = traversals.x.reverse();
		if (vector.y === 1) traversals.y = traversals.y.reverse();

		return traversals;
	}
	findFarthestPosition(cell: any, vector: { x: number; y: number }) {
		let previous;

		// Progress towards the vector direction until an obstacle is found
		do {
			previous = cell;
			cell = { x: previous.x + vector.x, y: previous.y + vector.y };
		} while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

		return {
			farthest: previous,
			next: cell // Used to check if a merge is required
		};
	}
	movesAvailable() {
		return this.grid.cellsAvailable() || this.tileMatchesAvailable();
	}
	// Check for available matches between tiles (more expensive check)
	tileMatchesAvailable() {
		let tile;

		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				tile = this.grid.cellContent({ x: x, y: y });

				if (tile) {
					for (let direction = 0; direction < 4; direction++) {
						//@ts-ignore, just make sure direction remains between 0-3
						const vector = this.getVector(direction);
						const cell = { x: x + vector.x, y: y + vector.y };

						const other = this.grid.cellContent(cell);

						if (other && other.value === tile.value) {
							return true; // These two tiles can be merged
						}
					}
				}
			}
		}

		return false;
	}
	positionsEqual(first: { x: number; y: number }, second: { x: number; y: number }) {
		return first.x === second.x && first.y === second.y;
	}

	recordBest() {
		if (get(TAB_BLOCK)) {
			return;
		}

		const score = this.run_best_score || this.score;

		let best = getItem("HAC_best_score" + this.size);
		if (best == null && getItem("HAC_best_score") != null && this.size == 4) {
			best = getItem("HAC_best_score");
			setItem("HAC_best_score" + this.size, best);
		}
		if (best == null) {
			best = 0;
		}
		const old_best = getItem("HAC_best_score" + this.size) || -1;
		let best_history = getItem("HAC_best_history" + this.size);
		if (best_history == null && getItem("HAC_best_history") != null && this.size == 4) {
			best_history = getItem("HAC_best_history");
			setItem("HAC_best_history" + this.size, best_history);
		}
		if (score < 1) {
			return;
		}
		if (this.history.length == 0) {
			return;
		}
		if (best == null) {
			if (best_history == null) {
				best = 0;
			} else if (old_best != null && old_best < best) {
				best = 0;
			} else {
				best = old_best;
			}
		}
		if (best_history == null || best_history.length == 0) {
			best = 0;
		}
		if (old_best == null) {
			best = 0;
		}
		if (score >= best) {
			setItem("HAC_best_history" + this.size, this.history);
			setItem("HAC_best_score" + this.size, score);
			if (this.over) {
				// Send an event to open the leaderboard popup
				const event = new Event("game_ended_with_best_score");
				window.dispatchEvent(event);
			}
		}
	}

	pushToHistory(state: string) {
		this.history.push(state);
		if (browser && dev) {
			//@ts-ignore
			window.devtools.validateCurrentHistory().then((result) => {
				console.log(result);
				if (result && !result.Ok) {
					alert(
						"Pelin historia on korruptoitunut!\nOta yhteyttä kehittäjiin tai käynnistä peli uudelleen.\n\nKorruptoitunutta peliä ei voi lähettää leaderboardeille."
					);
				}
			});
		}
		// this.removeConsecutiveDuplicatesFromHistory();
	}

	removeConsecutiveDuplicatesFromHistory() {
		let working_copy = [...this.history]; // Create a copy of the history

		// Reverse the array so we keep the last duplicate instead of the first one
		// working_copy.reverse();

		// Always keep the 0th element, but remove any other elements that match the previous element
		working_copy = this.history.filter((val, index, array) => {
			// Only compare the tiles within the entries, as a bug causes ghost additions...
			return index == 0 || val.split("+")[0] != array[index - 1].split("+")[0];
		});

		// Reverse the array again so that the order of non-duplicated entries are preserved
		// working_copy.reverse();

		this.history = working_copy;
	}
}
