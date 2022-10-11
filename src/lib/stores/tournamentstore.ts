let tournament_endpoint_dev = false ? "https://ohts.fly.dev/api" : "http://localhost:9000/api";
export let tournament_endpoint = false ? "https://mp.oispahalla.com/api" : tournament_endpoint_dev;
import { token } from "$lib/Auth/authstore";
import { type Writable, writable, get } from "svelte/store";

export class createResponse {
	tournament_id!: number;
	error_code!: number | null;
}

export let gamemode_0_goals = [32, 64, 128, 256, 512, 1024, 2048];
export let gamemode_0_names: { [key: number]: string } = {
	32: "SSn",
	64: "MSl",
	128: "CFr",
	256: "HTe",
	512: "MPa",
	1024: "EHy",
	2048: "LHa"
};

export enum createTournamentGamemode {
	FirstPastThePost = 0
}

export class createTournamentGamemodeOptions {
	gamemode!: createTournamentGamemode;
	goal!: number;
}

export async function createTournament(
	name: string,
	is_public: boolean,
	max_clients: number,
	join_password: string | null,
	gamemode_options: createTournamentGamemodeOptions,
	token: string
): Promise<createResponse> {
	let resp = await fetch(`${tournament_endpoint}/games`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			create_name: name,
			create_public: is_public,
			create_max_clients: max_clients,
			create_join_password: join_password,
			create_gamemode: gamemode_options,

			token: token
		})
	});
	if (resp.ok) {
		let json = await resp.json();
		console.log("tournament data:", json);
		joined_game_host_pswds[json.tournament_id] = "lmao";
		return json as createResponse;
	}
	if (resp.status == 409) {
		return {tournament_id: 0, error_code: 1}; // Name already in use
	}
	return {tournament_id: 0, error_code: -1}; // Fetch failed
}

export class TournamentInfo {
	name!: string;
	id!: number;
	requires_password!: boolean;
	public!: boolean;
	active!: boolean;
	ended!: boolean;
	clients!: number;
	max_clients!: number;
	client_aliases!: string[];
	starting_state!: string;
	gamemode!: number;
	gamemode_goal!: number;
}

class publicTournamentsResponse {
	success: boolean;
	status_code: number;
	joinable_games: TournamentInfo[];
	active_games: number[];
	past_games: number[];
	constructor(
		success: boolean,
		status_code: number,
		joinable_games: TournamentInfo[],
		active_games: number[],
		past_games: number[]
	) {
		this.success = success;
		this.status_code = status_code;
		this.joinable_games = joinable_games;
		this.active_games = active_games;
		this.past_games = past_games;
	}
}

export async function getPublicTournaments() {
	let resp = await fetch(`${tournament_endpoint}/games`);
	if (resp.ok) {
		let json = await resp.json();
		console.log("public tournaments:", json);
		return new publicTournamentsResponse(
			true,
			0,
			json.joinable_games,
			json.active_games,
			json.past_games
		);
	}
	return new publicTournamentsResponse(false, -1, [], [], []); // Fetch failed
}

export async function checkNameValid(name: string) {
	let resp = await fetch(`${tournament_endpoint}/create`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			create_name: name
		})
	});
	if (resp.ok) {
		let json = await resp.json();
		return json.valid;
	}
	return false; // Fetch failed
}

export let server_status: Writable<boolean | null> = writable(null);
export async function checkAlive(): Promise<boolean> {
	try {
		server_status.set(null);
		let resp = await fetch(`${tournament_endpoint}/alive`);
		if (resp.ok) {
			server_status.set(true);
			return true;
		}
	} catch (error) {
		server_status.set(false);
		return false;
	}
	server_status.set(false);
	return false;
}

export let joined_game_id: Writable<number | null> = writable(null);
export let joined_game_am_host: Writable<boolean | null> = writable(false);
export let joined_game_host_pswds: { [key: number]: string } = {};
export let joined_game_data: Writable<TournamentInfo | null> = writable(null);
export let joined_game_error: Writable<String | null> = writable(null);

export async function getGameData(id: number) {
	let resp = await fetch(`${tournament_endpoint}/games/${id}`);
	if (resp.ok) {
		let json = await resp.json();
		return json;
	} else {
		return null;
	}
}

export async function refreshGameData() {
	let resp = await fetch(`${tournament_endpoint}/games/${get(joined_game_id)}`);
	console.log("refreshGameData response:", resp);
	if (resp.ok) {
		let json = await resp.json();
		joined_game_data.set(json);
		joined_game_error.set(null);
	} else {
		joined_game_error.set(resp.statusText);
	}
}

export async function poll(token: string) {
	return null;
	let moves = poll_send_moves;
	moves = moves.filter((i, idx) => poll_send_moves[idx - 1] !== i); // Remove adjacent duplicates, as they do not affect the game
	poll_send_moves = [];
	let resp = await fetch(`${tournament_endpoint}/poll/${get(joined_game_id)}`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			moves: moves,
			token
		})
	});
	if (resp.ok) {
		let data = await resp.json();
		return data as PollData;
	} else {
		return null;
	}
}

export async function joinGame(
	id: number,
	token: string,
	join_password: string | null = null,
	isHost = false
) {
	console.log("Trying to join game id", id, "...");
	// TODO: Contact server
	let resp = await fetch(`${tournament_endpoint}/games/${id}/join`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			join_password,
			token
		})
	});
	if (resp.ok) {
		joined_game_id.set(id);
		if (isHost && join_password) {
			joined_game_host_pswds[id] = join_password;
		} else {
			if (Object.keys(joined_game_host_pswds).includes(id + "")) {
				isHost = true;
			}
		}
		joined_game_am_host.set(isHost);
		await refreshGameData();
	} else {
		if (resp.status == 406) {
			joined_game_error.set("Peli on täynnä");
		} else if (resp.status == 418) {
			joined_game_error.set("Peli on jo käynnissä");
		} else if (resp.status == 401) {
			joined_game_error.set("Väärä salasana");
		} else {
			joined_game_error.set(resp.statusText);
		}
	}
	//
}

export async function leaveGame(token: string, informServer = true) {
	console.log("Leaving the current game...");

	if (informServer) {
		let resp = await fetch(`${tournament_endpoint}/games/${get(joined_game_id)}/leave`, {
			method: "POST",
			mode: "cors",
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				token
			})
		});
		if (resp.ok) {
		} else {
			joined_game_error.set(resp.statusText);
		}
	}

	joined_game_id.set(null);
	joined_game_data.set(null);
	joined_game_error.set(null);
	localStorage.removeItem("mp_data");
}

class startResponse {
	success!: boolean;
	tournament_id!: number;
	status_code!: number;
	msg!: string;
}

export async function host_startGame(token: string): Promise<startResponse> {
	let id = get(joined_game_id);
	let resp = await fetch(`${tournament_endpoint}/games/${id}/start`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			token
		})
	});
	if (resp.ok) {
		let json = await resp.json();
		return json as startResponse;
	}
	return { success: false, tournament_id: id, status_code: -1, msg: "Virhe tai jtn" }; // Fetch failed
}

class deleteResponse {
	success!: boolean;
}

export async function host_deleteGame(token: string): Promise<deleteResponse> {
	let id = get(joined_game_id);
	let resp = await fetch(`${tournament_endpoint}/games/${id}/delete`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			token
		})
	});
	if (resp.ok) {
		leaveGame(token, false);
		joined_game_host_pswds[id] = null;
		return { success: true };
	}
	return { success: false }; // Fetch failed
}

class PollData {
	board: string;
	game: TournamentInfo;
	history_index: number;
	other_boards: string[];
	id_index: number;
}
// Polling
export let poll_success: Writable<boolean | null> = writable(null);
export let poll_board_string: Writable<string | null> = writable(null);
export let poll_other_boards_string: Writable<string[] | null> = writable(null);
export let poll_game: Writable<TournamentInfo | null> = writable(null);
export let poll_index: Writable<number | null> = writable(null);
export let poll_id_index: Writable<number | null> = writable(null);

export let poll_send_moves: number[] = [];

let socket: WebSocket | null = null;
joined_game_id.subscribe(($joined_game_id)=>{
	if(!socket) {
		if($joined_game_id != null) {
			socket = new WebSocket(`ws://localhost:9000/ws/${$joined_game_id}?token=${get(token)}`);
			socket.addEventListener('open', (event) => {
				if(socket){
					socket.send('speak:I am.');
				}
			});
		}
	}
	else {
		if($joined_game_id == null) {
			socket.close();
			socket = null;
		}
	}
});
setInterval(() => {
	return;
	if (get(joined_game_id) != null) {
		poll().then((polldata) => {
			if (polldata != null) {
				poll_success.set(true);
				poll_board_string.set(polldata.board);
				poll_game.set(polldata.game);
				poll_index.set(polldata.history_index);
				poll_other_boards_string.set(polldata.other_boards);
				poll_id_index.set(polldata.id_index);
			} else {
				poll_success.set(false);
			}
		});
	} else {
		poll_success.set(null);
	}
}, 600);
