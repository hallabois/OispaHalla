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

export type ohmp_grid_row = Tile[];
export type ohmp_gamestate = {
	width: number;
	height: number;
	tiles: ohmp_grid_row[];
};

export function ohmp_gamestate_to_grid(gamestate: ohmp_gamestate) {
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

export function do_gamestates_differ(a: ohmp_gamestate, b: ohmp_gamestate) {
	if (a.width !== b.width) return ["w", a.width, b.width];
	if (a.height !== b.height) return ["h", a.height, b.height];
	let w = a.width;
	let h = b.height;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			let ta = a.tiles[y][x];
			let tb = a.tiles[y][x];
			if (ta.value !== tb.value) {
				return [ta, tb];
			}
		}
	}
	return false;
}

function gather_ids(gamestate: ohmp_gamestate) {
	let ids = [];
	for (let y = 0; y < gamestate.height; y++) {
		for (let x = 0; x < gamestate.width; x++) {
			let t = gamestate.tiles[y][x];
			ids.push(t.id);
		}
	}
	return ids;
}

export function fix_new_ids(remote: ohmp_gamestate, predicted: ohmp_gamestate | null) {
	if (!predicted) return predicted;
	let w = remote.width;
	let h = remote.height;

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			let t_remote = remote.tiles[y][x];
			let t_predicted = predicted.tiles[y][x];
			if (t_remote.id !== t_predicted.id && t_remote.value === t_predicted.value) {
				t_predicted.id = t_remote.id;
				predicted.tiles[y][x] = t_predicted;
			}
		}
	}

	return predicted;
}
