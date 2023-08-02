import { setItem, getItem, storage, storage_loaded } from "$lib/stores/storage";
import type { Board, Direction, GameState, ParseResult, Tile } from "twothousand-forty-eight";
import {
	wasm,
	deserialize_cached,
	get_gamestate_from_recording_cached,
	serialize_cached
} from "$lib/wasm/twothousand_forty_eight";
import { derived, get, writable, type Readable, type Writable } from "svelte/store";
import { browser } from "$app/environment";
export const ENABLED_SIZES = [3, 4, 5] as const;
export type GameSize = (typeof ENABLED_SIZES)[number];
type Recordings = { [key in GameSize]: string } | null;
type Histories = { [key in GameSize]: ParseResult } | null;
type GameStates = { [key in GameSize]: GameState } | null;
type MetaDatas = { [key in GameSize]: GameMetaData | null } | null;
export type SubmittedHighScore = {
	submitted: true;
	score: number;
	data?: string;
};
export type HighScore =
	| SubmittedHighScore
	| {
			submitted: false;
			score: number;
			data: string;
			game_over: boolean;
	  };
export type HighScores = { [key in GameSize]: HighScore | null } | null;

export const active_size_server: Writable<GameSize | null> = writable(null);
export const active_size: Readable<GameSize | null> = derived(
	[storage, active_size_server],
	([$storage, $active_size_server]) => {
		if (!browser) {
			return $active_size_server;
		}
		if (!$storage) {
			return null;
		}
		const size = getItem("active-size") as string | null;
		if (size == null) {
			return 4;
		}
		return parseInt(size) as GameSize;
	}
);
export const active_size_safe: Readable<GameSize> = derived(active_size, ($active_size) => {
	if (!$active_size) {
		return 4;
	}
	return $active_size;
});

function gamestateKey(size: number) {
	return `gamestate_${size}_${size}`;
}

export const recordings: Readable<Recordings> = derived(
	[storage_loaded, storage, wasm],
	([$storage_loaded, $storage, $wasm]) => {
		if (!$storage_loaded || !$storage) {
			return null;
		}
		if (!$wasm) {
			return null;
		}
		const map = ENABLED_SIZES.map((size) => {
			const state = getItem<string>(gamestateKey(size));
			if (state) {
				return { size, state };
			}
			const new_state = $wasm.new_game(size);
			setItem(gamestateKey(size), serialize_cached($wasm, deserialize_cached($wasm, new_state)));
			return { size, state: new_state };
		}).reduce((acc, { size, state }) => {
			acc[size] = state;
			return acc;
		}, {} as { [key in GameSize]: string });
		return map;
	}
);
export const histories: Readable<Histories> = derived(
	[recordings, wasm],
	([$recordings, $wasm]) => {
		if (!$recordings) {
			return null;
		}
		if (!$wasm) {
			return null;
		}
		const map = ENABLED_SIZES.map((size) => {
			return { size, state: deserialize_cached($wasm, $recordings[size]) };
		}).reduce((acc, { size, state }) => {
			acc[size] = state;
			return acc;
		}, {} as { [key in GameSize]: ParseResult });
		return map;
	}
);

export const metadatas: Readable<MetaDatas> = derived([recordings], ([$recordings]) => {
	if (!$recordings) {
		return null;
	}
	const map = ENABLED_SIZES.map((size) => {
		const state = getItem(gamestateKey(size)) as string | null;
		if (state) {
			const meta = state.split("\n").at(1);
			if (meta) {
				try {
					return { size, meta: JSON.parse(meta) };
				} catch (e) {
					console.error("Failed to parse game metadata", e);
				}
			}
		}
		return { size, meta: null };
	}).reduce((acc, { size, meta }) => {
		acc[size] = meta;
		return acc;
	}, {} as { [key in GameSize]: GameMetaData | null });
	return map;
});
export const last_move: Readable<Direction | null> = derived(
	[histories, active_size],
	([$histories, $size]) => {
		if (!$histories) {
			return null;
		}
		if (!$size) {
			return null;
		}
		const history = $histories[$size];
		if ("V2" in history) {
			return history.V2.moves.at(-1) ?? null;
		}
		return null;
	}
);

export const gamestates: Readable<GameStates> = derived(
	[histories, wasm],
	([$histories, $wasm]) => {
		if (!$wasm) {
			return null;
		}
		if (!$histories) {
			return null;
		}
		const map = ENABLED_SIZES.map((size) => {
			return { size, state: get_gamestate_from_recording_cached($wasm, $histories[size]) };
		}).reduce((acc, { size, state }) => {
			acc[size] = state;
			return acc;
		}, {} as { [key in GameSize]: GameState });
		return map;
	}
);

function highscoreKey(size: GameSize) {
	return `highscore_${size}_${size}`;
}
export const highscores: Readable<HighScores> = derived([storage], ([$storage]) => {
	if (!$storage) {
		return null;
	}
	const scores = ENABLED_SIZES.map((size) => {
		const entry = getItem<HighScore>(highscoreKey(size));
		if (entry) {
			return { size, entry };
		}
		return { size, entry: null };
	}).reduce((acc, { size, entry }) => {
		acc[size] = entry;
		return acc;
	}, {} as { [key in GameSize]: HighScore | null });
	return scores;
});
export function setHighScore(size: GameSize, data: HighScore) {
	setItem(highscoreKey(size), data);
}
export function syncHighScore(size: GameSize, external: SubmittedHighScore) {
	const $highscores = get(highscores);
	if ($highscores == null) {
		return;
	}
	const existing = $highscores[size];
	if (!existing) {
		setHighScore(size, external);
		return;
	}
	if (existing.score <= external.score) {
		setHighScore(size, external);
	}
}
export const highscore: Readable<HighScore | null> = derived(
	[highscores, active_size],
	([$highscores, $size]) => {
		if (!$highscores) {
			return null;
		}
		if (!$size) {
			return null;
		}
		return $highscores[$size];
	}
);
function get_recording(size: GameSize): string | null {
	const $recordings = get(recordings);
	const $wasm = get(wasm);
	if (!$recordings) {
		return null;
	}
	if (!$wasm) {
		return null;
	}
	return $recordings[size];
}
function get_history(size: GameSize): ParseResult | null {
	const $histories = get(histories);
	if (!$histories) {
		return null;
	}
	return $histories[size];
}
function get_gamestate(size: GameSize): GameState | null {
	const $gamestates = get(gamestates);
	if (!$gamestates) {
		return null;
	}
	return $gamestates[size];
}

type GameMetaData = {
	version?: string;
	win_screen_shown: boolean;
};
class Game {
	state: GameState;
	history: ParseResult;
	win_screen_shown: boolean;
	wasm: typeof import("twothousand-forty-eight");
	constructor(
		state: GameState,
		history: ParseResult,
		meta: GameMetaData | null,
		wasm: typeof import("twothousand-forty-eight")
	) {
		this.state = state;
		this.history = history;
		this.win_screen_shown = meta?.win_screen_shown ?? false;
		this.wasm = wasm;
	}
	move(dir: Direction) {
		if (this.state.over) {
			return;
		}
		if (!this.state.allowed_moves.includes(dir)) {
			console.log("Invalid move");
			console.log(this.state.allowed_moves);
			return;
		}
		if ("V2" in this.history) {
			const modified_history = structuredClone(this.history);
			modified_history.V2.moves.push(dir);
			try {
				const new_state = get_gamestate_from_recording_cached(this.wasm, modified_history);
				const new_history = modified_history;
				this.state = new_state;
				this.history = new_history;
				this.save();
			} catch (e) {
				console.log(e);
			}
		} else {
			throw new Error("Unsupported history version for now");
		}
	}
	reload() {
		if ("V2" in this.history) {
			const size = this.history.V2.width as GameSize;
			if (!ENABLED_SIZES.includes(size)) {
				return;
			}
			const recording = get_recording(size);
			if (!recording) {
				return;
			}
			const history = get_history(size);
			if (!history) {
				return;
			}
			const state = get_gamestate(size);
			if (!state) {
				return;
			}
			this.state = state;
			this.history = history;
		} else {
			throw new Error("Unsupported history version for now");
		}
	}
	serialize() {
		if ("V2" in this.history) {
			const size = this.history.V2.width;
			if (!ENABLED_SIZES.includes(size as GameSize)) {
				throw new Error("Unsupported size");
			}
			const recording = serialize_cached(this.wasm, this.history);
			const meta: GameMetaData = {
				version: __APP_VERSION__,
				win_screen_shown: this.win_screen_shown
			};
			return `${recording}\n${JSON.stringify(meta)}`;
		} else {
			throw new Error("Unsupported history version for now");
		}
	}
	save() {
		if ("V2" in this.history) {
			const size = this.history.V2.width as GameSize;
			const serialized = this.serialize();
			setItem(gamestateKey(size), serialized);
			const $highscores = get(highscores);
			if ($highscores) {
				const highscore = $highscores[size];
				if (!highscore || this.state.score_max > highscore.score) {
					setHighScore(size, {
						submitted: false,
						data: serialized,
						score: this.state.score_max,
						game_over: this.state.over
					});
				}
			}
		} else {
			throw new Error("Unsupported history version for now");
		}
	}
	restart(force = false) {
		if (force || this.state.score_max < 16 || confirm("Oletko varma?")) {
			if ("V2" in this.history) {
				const size = this.history.V2.width;
				const recording = this.wasm.new_game(size);
				const history = this.wasm.deserialize(recording);
				const state = get_gamestate_from_recording_cached(this.wasm, history);
				this.state = state;
				this.history = history;
				this.save();
			} else {
				throw new Error("Unsupported history version for now");
			}
		}
	}
	revertMove() {
		if ("V2" in this.history) {
			const cut_history = structuredClone(this.history);
			cut_history.V2.moves.pop();
			const gamestate = get_gamestate_from_recording_cached(this.wasm, cut_history);
			this.state = gamestate;
			this.history = cut_history;
			this.save();
		} else {
			throw new Error("Unsupported history version for now");
		}
	}
	aknowledgeWinScreen() {
		this.win_screen_shown = true;
		this.save();
	}
}
active_size.subscribe((size) => {
	if (size && browser) {
		// try to save the size as a cookie
		try {
			document.cookie = `size=${size};SameSite=None;secure=true;expires=Fri, 31 Dec 9999 23:59:59 GMT"max-age=31536000;path=/;`;
		} catch (e) {
			console.warn("Failed to save game size as cookie: ", e);
		}
	}
});

export function set_active_size(size: GameSize) {
	setItem("active-size", size.toString());
}

export const gamestate: Readable<Game | null> = derived(
	[active_size, histories, gamestates, metadatas, wasm],
	([$size, $histories, $gamestates, $metadatas, $wasm]) => {
		if (!$size) {
			return null;
		}
		if (!$histories) {
			return null;
		}
		if (!$gamestates) {
			return null;
		}
		if (!$metadatas) {
			return null;
		}
		if (!$wasm) {
			return null;
		}
		const history = $histories[$size];
		const meta = $metadatas[$size];
		const state = $gamestates[$size];
		return new Game(state, history, meta, $wasm);
	}
);

export const score: Readable<number | null> = derived([gamestate], ([$gamestate]) => {
	if (!$gamestate) {
		return null;
	}
	return $gamestate.state.score_current;
});

export function board_to_tile_array(board: Board) {
	return board.tiles
		.flat()
		.flat()
		.flatMap((tile) => (tile ? [tile] : []))
		.filter((tile) => tile.value !== 0);
}
export const tiles: Readable<Tile[] | null> = derived([gamestate], ([$gamestate]) => {
	if (!$gamestate) {
		return null;
	}
	return board_to_tile_array($gamestate.state.board);
});

export const tiles_last_turn: Readable<Tile[] | null> = derived(
	[active_size, histories, wasm],
	([$active_size, $histories, $wasm]) => {
		if ($active_size == null || $histories == null) {
			return null;
		}
		if (!$wasm) {
			return null;
		}
		const history = $histories[$active_size];
		if ("V2" in history) {
			const cut_history = structuredClone(history);
			cut_history.V2.moves.pop();
			const gamestate = get_gamestate_from_recording_cached($wasm, cut_history);
			return board_to_tile_array(gamestate.board);
		}
		return null;
	}
);

type TilePossiblyFromLastTurn = Tile & {
	merged?: boolean;
	removed?: boolean;
};

export function get_tiles_merged_from(tiles: Tile[], last_tiles: Tile[]) {
	const ids = tiles
		.filter((tile) => tile.merged_from != null)
		.flatMap((tile) =>
			tile.merged_from
				? tile.merged_from.map((id) => {
						return {
							id,
							to: {
								x: tile.x,
								y: tile.y
							}
						};
				  })
				: []
		);
	const tiles_with_meta: TilePossiblyFromLastTurn[] = last_tiles
		.map((tile) => {
			const match_future = tiles.find((id) => id.id === tile.id);
			let to = { x: tile.x, y: tile.y };
			const match_future_merge = ids.find((id) => id.id === tile.id);
			let merged = false;
			if (match_future) {
				to = { x: match_future.x, y: match_future.y };
			}
			if (match_future_merge) {
				to = match_future_merge.to;
				merged = true;
			}
			return { tile, to, merged, removed: !match_future };
		})
		.map(({ tile, to, merged, removed }) => {
			return {
				...tile,
				x: to.x,
				y: to.y,
				merged_from: null,
				merged,
				removed,
				new: false
			};
		});
	return tiles_with_meta;
}

export function complete_tiles(
	tiles: Tile[],
	last_tiles: Tile[] | null,
	last_move: Direction | null
) {
	if (!last_tiles || !last_move || last_move === "BREAK") {
		return tiles;
	}
	const tiles_with_meta = get_tiles_merged_from(tiles, last_tiles);
	const compound = [
		...tiles_with_meta,
		...tiles.filter((tile) => !tiles_with_meta.find((t) => t.id === tile.id))
	];
	return compound.sort((a, b) => a.id - b.id);
}