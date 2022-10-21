import { browser, dev } from "$app/environment";
let tournament_endpoint_dev = false ? "wss://ohts.fly.dev" : "ws://localhost:9000";
export let tournament_endpoint = dev ? tournament_endpoint_dev : "wss://mp.oispahalla.com";
import { token } from "$lib/Auth/authstore";
import { type Writable, writable, get } from "svelte/store";
import { getItem, setItem, storage_loaded } from "./storage";

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
	mode!: createTournamentGamemode;
	goal!: number;
}

let socket: WebSocket | null = null;
export type UserDetails = {
	user_id: string;
	name: string;
	admin: boolean;
	current_games: number[];
};
export type GameDetails = {
	id: number;
	creator_id: string;
	gamemode: number;
	gamemode_goal: number;
	name: string;
	public: boolean;
	max_clients: number;
	requires_password: boolean;
	started: boolean;
	ended: boolean;
	winner_id: string | null;
	clients: string[];
	starting_state: Object;
};
export type GameIndex = {
	id: number;
	name: string;
	clients: number;
	max_clients: 4;
	requires_password: boolean;
};
export type Index = {
	joinable_games: GameIndex[];
	all_games: number[];
	active_games: number[];
	ended_games: number[];
};

export let try_autoconnect: Writable<boolean> = writable(true);

export let connected: Writable<boolean | null> = writable(null);
export let connection_error: Writable<boolean | null> = writable(null);
export let errors: Writable<Error[]> = writable([]);
export let user_details: Writable<UserDetails | null> = writable(null);
export let game_details: Writable<{ [key: number]: GameDetails }> = writable({});
export let game_index: Writable<Index | null> = writable(null);
export let joined_game_id: Writable<number | null> = writable(null);

function socket_processor(message: any) {
	let json = message.data;
	let event = JSON.parse(json);
	console.info("socket ev", event);
	if (event.data) {
		if (event.data.Index) {
			game_index.set(event.data.Index);
		}
		if (event.data.UserDetails) {
			let details = event.data.UserDetails as UserDetails;
			user_details.set(details);
			if (details.current_games.length > 0) {
				if (get(joined_game_id) == null) {
					joined_game_id.set(details.current_games[0]);
				}
			}
		}
		if (event.data.GameDetails) {
			game_details.set({
				...get(game_details),
				[event.data.GameDetails.id]: event.data.GameDetails
			});
		}
		if (event.data.GameCreated) {
			request_join(event.data.GameCreated, null);
		}
		if (event.data.GameDeleted) {
			if (get(joined_game_id) == event.data.GameDeleted) {
				joined_game_id.set(null);
			}
			if (get(game_index) != null) {
				request_index();
			}
		}
		if (event.data.GameJoined) {
			joined_game_id.set(event.data.GameJoined);
		}
		if (event.data.GameLeft) {
			if (event.data.GameLeft == get(joined_game_id)) {
				joined_game_id.set(null);
			}
			if (get(game_index) != null) {
				request_index();
			}
		}
	}
}
function socket_error_processor(err: any) {
	errors.set([...get(errors), err]);
}

export function connect_with_token(token: string | null) {
	if (socket) {
		disconnect();
	}
	let connection_string = `${tournament_endpoint}/ws?token=${token}`;
	socket = new WebSocket(connection_string);
	socket.addEventListener("open", (event) => {
		connection_error.set(false);
		connected.set(true);
		errors.set([]);
		if (socket) {
			socket.send("udetails");
		}
		console.log("ws connected");
	});
	socket.addEventListener("close", (event) => {
		connected.set(false);

		socket = null;
		if (event.code == 3001) {
			// User decision
			connection_error.set(null);
			console.log("ws disconnected");
		} else {
			connection_error.set(true);
			console.log("ws connection error");
		}
	});
	socket.addEventListener("message", socket_processor);
	socket.addEventListener("error", socket_error_processor);
}
export function connect() {
	connect_with_token(get(token));
}
export function disconnect() {
	if (socket) {
		socket.close(3001);
	}
}

export function request_index() {
	if (socket) {
		socket.send("index");
	} else {
		throw new Error("not connected! can't get index.");
	}
}
export function request_game_details(game_id: number) {
	if (socket) {
		socket.send(`gdetails|>${game_id}`);
	} else {
		throw new Error("not connected! can't get game details.");
	}
}
export function request_deletion(game_id: number) {
	if (socket) {
		socket.send(`delete|>${game_id}`);
	} else {
		throw new Error("not connected! can't delete game.");
	}
}
export function request_join(game_id: number, password: string | null) {
	if (socket) {
		let str = `join|>${game_id}`;
		if (password != null && password.length > 0) {
			str = `${str}|>${password}`;
		}
		socket.send(str);
	} else {
		throw new Error("not connected! can't join game.");
	}
}
export function request_leave(game_id: number) {
	if (socket) {
		socket.send(`leave|>${game_id}`);
	} else {
		console.warn("left game without connection");
		joined_game_id.set(null);
	}
}

export type CreateOptions = {
	name: string;
	gamemode: {
		mode: number;
		goal: number;
	};
	public: boolean;
	maxclients: number;
	joinpassword: string | null;
};
export function create(options: CreateOptions) {
	let $token = get(token);
	if (socket) {
		socket.send(`create|>${JSON.stringify(options)}`);
	} else {
		throw new Error("not connected! can't create game.");
	}
}

if (browser) {
	token.subscribe(($token) => {
		if ($token != null && get(try_autoconnect)) {
			connect();
		}
	});
	// Keep websocket connections alive by pinging the connection every 30s.
	setInterval(() => {
		if (socket) {
			socket.send("\x70");
		}
	}, 30_000);
}
