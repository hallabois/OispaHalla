import Grid from "./grid";
import Tile from "./tile";

export function hac_gamestate_to_grid(gamestate: string) {
    let data = JSON.parse(gamestate.replaceAll("SCOREHERE", "0"));
    let size = data.grid.size;
    let cells = data.grid.cells.flat();

    let grid = new Grid( 
        size
    );

    // console.info("ORIGINAL", cells);

    let newcells = cells.filter(
        t=> t && t.position
    )
    .map(
        t=> new Tile({x: t.position.y, y: t.position.x}, t.value, t.id)
    ).filter(
        (t: Tile)=> t.x < size && t.y < size
    );

    // console.info("NEWCELLS", newcells);

    for(let y in grid.cells) {
        for(let x in grid.cells) {
            grid.cells[y][x] = newcells.find(t2 => x == t2.x && y == t2.y) || grid.cells[y][x];
        }
    }
    // console.info("GRID", grid);
    return grid;
}

export function generate_previous_positions(grid: Grid, previous: Grid) {
    grid.cells.forEach(
        col =>
        col.forEach(
            t => {
                if(t){
                    let prev = previous.cells.find(
                        t2 =>
                            t.id == t2.id
                    );
                    t.previousPosition = prev ? {x: prev.x, y: prev.y} : null;
                }
            }
        )
    );
    return grid;
}