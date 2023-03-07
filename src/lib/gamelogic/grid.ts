import Tile from "./tile";

export default class Grid {
	size;
	cells: any[];
	constructor(size: number, previousState = null) {
		this.size = size;
		this.cells = previousState ? this.fromState(previousState) : this.empty();
	}
	// Build a grid of the specified size
	empty() {
		const cells = [];

		for (let x = 0; x < this.size; x++) {
			const row = (cells[x] = []);

			for (let y = 0; y < this.size; y++) {
				row.push(null);
			}
		}

		return cells;
	}
	fromState(state: any[][]) {
		const cells = [];

		for (let x = 0; x < this.size; x++) {
			const row = (cells[x] = []);

			for (let y = 0; y < this.size; y++) {
				const tile = state[x][y];
				row.push(tile ? new Tile(tile.position, tile.value) : null);
			}
		}

		return cells;
	}
	// Find the first available random position
	randomAvailableCell() {
		const cells = this.availableCells();

		if (cells.length) {
			return cells[Math.floor(Math.random() * cells.length)];
		}
	}
	availableCells() {
		const cells: { x: any; y: any }[] = [];

		this.eachCell(function (x, y, tile) {
			if (!tile) {
				cells.push({ x: x, y: y });
			}
		});

		return cells;
	}
	// Call callback for every cell
	eachCell(callback) {
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				callback(x, y, this.cells[x][y]);
			}
		}
	}
	// Check if there are any cells available
	cellsAvailable() {
		return !!this.availableCells().length;
	}
	// Check if the specified cell is taken
	cellAvailable(cell) {
		return !this.cellOccupied(cell);
	}
	cellOccupied(cell) {
		return !!this.cellContent(cell);
	}
	cellContent(cell) {
		if (this.withinBounds(cell)) {
			return this.cells[cell.x][cell.y];
		} else {
			return null;
		}
	}
	// Inserts a tile at its position
	insertTile(tile) {
		this.cells[tile.x][tile.y] = tile;
	}
	removeTile(tile) {
		this.cells[tile.x][tile.y] = null;
	}
	withinBounds(position) {
		return position.x >= 0 && position.x < this.size && position.y >= 0 && position.y < this.size;
	}
	serialize() {
		const cellState = [];

		for (let x = 0; x < this.size; x++) {
			const row = (cellState[x] = []);

			for (let y = 0; y < this.size; y++) {
				row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
			}
		}

		return {
			size: this.size,
			cells: cellState
		};
	}
	serialize_HAC() {
		const state: number[] = [];
		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				try {
					if (this.cells[x][y]) {
						state.push(this.cells[x][y].value);
					} else {
						state.push(0);
					}
				} catch {
					state.push(0);
				}
			}
		}
		return state;
	}
	palautaKuri() {
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				if (this.cells[x][y] && this.cells[x][y].value < 16) {
					this.cells[x][y] = null;
				}
			}
		}
	}
}
