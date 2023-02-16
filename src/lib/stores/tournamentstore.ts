import { browser, dev } from "$app/environment";
import { token } from "$lib/Auth/authstore";
import { mp_test_prod_endpoint } from "../../features";
import { type Writable, writable, get } from "svelte/store";
import { getItem, setItem, storage_loaded } from "./storage";
import type { ohts_gamestate } from "$lib/gamelogic/utils";

let tournament_endpoint_prod = "wss://mp.oispahalla.com";
let tournament_endpoint_dev = mp_test_prod_endpoint
	? tournament_endpoint_prod
	: "ws://localhost:9000";
export let tournament_endpoint = dev ? tournament_endpoint_dev : tournament_endpoint_prod;

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
export let enabled_sizes = [2, 3, 4, 5];
const GAME_ANY = -1;

export enum createTournamentGamemode {
	FirstPastThePost = 0
}

export class createTournamentGamemodeOptions {
	mode!: createTournamentGamemode;
	goal!: number;
}

let socket: WebSocket | null = null;
export type UserDetails = {
	id: string;
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
	creator: string;
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
export type ChatMessage = {
	game_id: number;
	user_id: string;
	content: string;
};
export type GameState = {
	game_id: number;
	user_id: string;
	score: number;
	board: ohts_gamestate;
};

export let try_autoconnect: Writable<boolean> = writable(true);

export let connected: Writable<boolean | null> = writable(null);
export let connection_error: Writable<boolean | null> = writable(null);
export let errors: Writable<Error[]> = writable([]);
export let user_details: Writable<UserDetails | null> = writable(null);
export let game_details: Writable<{ [key: number]: GameDetails }> = writable({});
export let game_index: Writable<Index | null> = writable(null);
export let joined_game_id: Writable<number | null> = writable(null);
export let chat: Writable<ChatMessage[] | null> = writable(null);
export let name_cache: Writable<{ [key: string]: string } | null> = writable(null);
export let state: Writable<{ [key: number]: GameState[] }> = writable({});
joined_game_id.subscribe(($joined_game_id) => {
	if ($joined_game_id == null) {
		chat.set(null);
		name_cache.set(null);
	} else {
		if (get(chat) == null) {
			request_game_chat();
		}
		if (get(name_cache) == null) {
			request_game_names();
		}
		if (get(state)[$joined_game_id] == null) {
			request_game_state();
		}
		if (get(game_details)[$joined_game_id] == null) {
			request_game_details($joined_game_id);
		}
	}
});
export let tournament_announcer: Writable<any | null> = writable(null);

export let tournament_ping: Writable<number | null> = writable(null);
function socket_processor(message: any) {
	let json = message.data;
	if (json === "o") {
		let now = new Date();
		tournament_ping.set(now.getTime() - pingStartTime.getTime());
		return;
	}
	let event = JSON.parse(json);
	console.info("socket ev", event);
	if (event.data) {
		if (event.data.Index) {
			game_index.set(event.data.Index);
		}
		if (event.data.GameStarted || event.data.GameStopped || event.data.GameDeleted) {
			if (get(game_index) != null) {
				request_index();
			}
			game_details.set({});
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
		if (event.data.GameState) {
			if (event.data.GameState.length > 0) {
				let states: GameState[] = event.data.GameState;
				let game_id = states[0].game_id;
				state.set({
					...get(state),
					[game_id]: event.data.GameState
				});
			}
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
			if (event.data.GameLeft == get(joined_game_id) || event.data.GameLeft == GAME_ANY) {
				joined_game_id.set(null);
			}
			if (get(game_index) != null) {
				request_index();
			}
		}
		if (event.data.Chat) {
			chat.set([...(get(chat) || []), event.data.Chat]);
		}
		if (event.data.ChatLog) {
			chat.set(event.data.ChatLog);
		}
		if (event.data.ParticipantDetails) {
			name_cache.set(event.data.ParticipantDetails.names);
		}
		if (event.data.ServerMessage) {
			let msg = event.data.ServerMessage;
			console.info("Server message:", msg);
			let announcer = get(tournament_announcer);
			if (announcer) {
				announcer.announce(`${msg.title}: ${msg.message}`);
			}
		}

		if (event.data.GenericError) {
			let announcer = get(tournament_announcer);
			if (announcer) {
				announcer.announce(`Virhe: ${event.data.GenericError}`);
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
export function request_start(game_id: number) {
	if (socket) {
		socket.send(`start|>${game_id}`);
	} else {
		throw new Error("not connected! can't start game.");
	}
}
export function request_stop(game_id: number) {
	if (socket) {
		socket.send(`stop|>${game_id}`);
	} else {
		throw new Error("not connected! can't stop game.");
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
export function request_kick(game_id: number, user_id: string) {
	if (socket) {
		socket.send(`kick|>${game_id}|>${user_id}`);
	} else {
		console.warn("not connected! can't kick participants.");
		joined_game_id.set(null);
	}
}
export function send_message(message: string | null) {
	if (socket) {
		if (message) socket.send(`say|>${message}`);
	} else {
		throw new Error("not connected! can't send message.");
	}
}
export function admin_announce(message: string | null) {
	if (socket) {
		if (message) socket.send(`announce|>${message}`);
	} else {
		throw new Error("not connected! can't announce.");
	}
}
export function admin_deleteall() {
	if (socket) {
		socket.send(`deleteall`);
	} else {
		throw new Error("not connected! can't delete all games.");
	}
}
export function request_game_chat() {
	if (socket) {
		socket.send(`chat`);
	} else {
		throw new Error("not connected! can't get chat.");
	}
}
export function request_game_names() {
	if (socket) {
		socket.send(`names`);
	} else {
		throw new Error("not connected! can't get names.");
	}
}
export function request_game_state() {
	if (socket) {
		socket.send(`state`);
	} else {
		throw new Error("not connected! can't get state.");
	}
}
export function request_move(direction: number) {
	if (socket) {
		socket.send(`move|>${direction}`);
	} else {
		throw new Error("not connected! can't move.");
	}
}
export function send_custom(message: string) {
	if (socket) {
		socket.send(`${message}`);
	} else {
		throw new Error("not connected! can't send custom message");
	}
}

export type CreateOptions = {
	name: string;
	size: number;
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

let pingStartTime: Date;
if (browser) {
	token.subscribe(($token) => {
		if ($token != null && get(try_autoconnect)) {
			connect();
		}
	});
	// Keep websocket connections alive by pinging the connection every 2000ms.
	setInterval(() => {
		if (socket) {
			pingStartTime = new Date();
			socket.send("\x70");
		}
	}, 2000);
}
