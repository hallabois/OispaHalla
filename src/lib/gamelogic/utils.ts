import Grid from "./grid";
import Tile from "./tile";

export function hac_gamestate_to_grid(gamestate: string) {
	let data = JSON.parse(gamestate.replaceAll("SCOREHERE", "0"));
	let size = data.grid.size;
	let cells = data.grid.cells.flat();

	let grid = new Grid(size);

	// console.info("ORIGINAL", cells);

	let newcells = cells
		.filter((t) => t && (t.position || (t.x && t.y)))
		.map((t) => new Tile({ y: t?.position?.x || t.x, x: t?.position?.y || t.y }, t.value, t.id))
		.filter((t: Tile) => t.x < size && t.y < size);

	// console.info("NEWCELLS", newcells);

	for (let y in grid.cells) {
		for (let x in grid.cells) {
			grid.cells[y][x] = newcells.find((t2) => x == t2.y && y == t2.x) || grid.cells[y][x];
		}
	}
	// console.info("GRID", grid);
	return grid;
}

export function generate_previous_positions(grid: Grid, previous: Grid) {
	let newcells = grid.cells;
	for (let colc in newcells) {
		for (let tindex in newcells[colc]) {
			let t = newcells[colc][tindex];
			if (t) {
				let prev = previous.cells.flat().find((t2) => t2 && t.id == t2.id);
				t.previousPosition = prev ? { x: prev.x, y: prev.y } : null;
				if (t.mergedFromRS) {
					t.mergedFrom = t.mergedFromRS.map((id) => {
						let found = previous.cells.flat().find((t2) => t2 && t2.id == id);
						if (found) {
							found.x = t.x;
							found.y = t.y;
						}
						return found;
					});
					for(let f of t.mergedFrom) {
						if(!f) {
							t.mergedFrom = null;
						}
					}
				}
				newcells[colc][tindex] = t;
			}
		}
	}
	grid.cells = newcells;
	return grid;
}

type ohts_grid_row = Tile[];
type ohts_gamestate = {
	width: number;
	height: number;
	tiles: ohts_grid_row[];
};

export function ohts_gamestate_to_grid(gamestate: ohts_gamestate) {
	console.info("gamestate", gamestate);
	let grid = new Grid(gamestate.width);
	for (let row of gamestate.tiles) {
		for (let tile of row) {
			if (tile && tile.value > 0) {
				let t = new Tile({ x: tile.x, y: tile.y }, tile.value);
				t.id = tile.id;
				t.mergedFromRS = tile.merged_from;
				grid.cells[tile.y][tile.x] = t;
			}
		}
	}
	return grid;
}
