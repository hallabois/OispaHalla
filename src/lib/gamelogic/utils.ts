import Grid from "./grid";
import Tile from "./tile";

export function hac_gamestate_to_grid(gamestate: string) {
	const data = JSON.parse(gamestate.replaceAll("SCOREHERE", "0"));
	const size = data.grid.size;
	const cells = data.grid.cells.flat();

	const grid = new Grid(size);

	// console.info("ORIGINAL", cells);

	const newcells = cells
		.filter((t) => t && (t.position || (t.x && t.y)))
		.map((t) => new Tile({ y: t?.position?.x || t.x, x: t?.position?.y || t.y }, t.value, t.id))
		.filter((t: Tile) => t.x < size && t.y < size);

	// console.info("NEWCELLS", newcells);

	for (const y in grid.cells) {
		for (const x in grid.cells) {
			grid.cells[y][x] = newcells.find((t2) => x == t2.y && y == t2.x) || grid.cells[y][x];
		}
	}
	// console.info("GRID", grid);
	return grid;
}

export function generate_previous_positions(grid: Grid, previous: Grid) {
	const newcells = grid.cells;
	for (const colc in newcells) {
		for (const tindex in newcells[colc]) {
			const t = newcells[colc][tindex];
			if (t) {
				const prev = previous.cells.flat().find((t2) => t2 && t.id == t2.id);
				t.previousPosition = prev ? { x: prev.x, y: prev.y } : null;
				if (t.mergedFromRS) {
					t.mergedFrom = t.mergedFromRS.map((id) => {
						const found = previous.cells.flat().find((t2) => t2 && t2.id == id);
						if (found) {
							found.x = t.x;
							found.y = t.y;
						}
						return found;
					});
					for (const f of t.mergedFrom) {
						if (!f) {
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

export type ohts_grid_row = Tile[];
export type ohts_gamestate = {
	width: number;
	height: number;
	tiles: ohts_grid_row[];
};

export function ohts_gamestate_to_grid(gamestate: ohts_gamestate) {
	console.info("gamestate", gamestate);
	const grid = new Grid(gamestate.width);
	for (const row of gamestate.tiles) {
		for (const tile of row) {
			if (tile && tile.value > 0) {
				const t = new Tile({ x: tile.x, y: tile.y }, tile.value);
				t.id = tile.id;
				t.mergedFromRS = tile.merged_from;
				grid.cells[tile.y][tile.x] = t;
			}
		}
	}
	return grid;
}
