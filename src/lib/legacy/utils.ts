import Grid from "./grid";
import Tile from "./tile";

export function hac_gamestate_to_grid(gamestate: string) {
    let data = JSON.parse(gamestate.replaceAll("SCOREHERE", "0"));
    let size = data.grid.size;
    let cells = data.grid.cells.flat();

    let grid = new Grid( 
        size
    );

    console.info("ORIGINAL", cells);

    let newcells = cells.filter(
        t=> t && t.position
    )
    .map(
        t=> new Tile(t.position, t.value)
    ).filter(
        (t: Tile)=> t.x < size && t.y < size
    );

    console.info("NEWCELLS", newcells);

    for(let y in grid.cells) {
        for(let x in grid.cells) {
            grid.cells[y][x] = newcells.find(t2 => x == t2.x && y == t2.y) || grid.cells[y][x];
        }
    }
    console.info("GRID", grid);
    return grid;
}