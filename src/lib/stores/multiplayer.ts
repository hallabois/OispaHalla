import { browser } from "$app/environment";
import { auth, rewrite_token, token } from "$lib/Auth/authstore";
import { mp_default_endpoint } from "$lib/config";
import { type Writable, writable, get, derived, type Readable } from "svelte/store";
import type { ohmp_gamestate } from "$lib/gamelogic/utils";
import type { SvelteComponent } from "svelte";

export const tournament_endpoint = writable(mp_default_endpoint);

export const gamemode_0_goals = [32, 64, 128, 256, 512, 1024, 2048];
export const gamemode_0_names: { [key: number]: string } = {
	32: "SSn",
	64: "MSl",
	128: "CFr",
	256: "HTe",
	512: "MPa",
	1024: "EHy",
	2048: "LHa"
};
export const ENABLED_SIZES = [2, 3, 4, 5] as const;
const GAME_ANY = -1 as const;

export enum createTournamentGamemode {
	FirstPastThePost = 0
}

export class createTournamentGamemodeOptions {
	mode!: createTournamentGamemode;
	goal!: number;
}

const socket: Writable<WebSocket | null> = writable(null);
export type ServerStatus = {
	db_size: number | null;
	users: string[] | null;
};
export type UserDetails = {
	id: string;
	name: string | null;
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
	starting_state: ohmp_gamestate;
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
	board: ohmp_gamestate;
	length: number;
};
export type LogEvent = {
	created: number;
	level: string;
	target: string;
	field: string;
	value: string;
};

export const try_autoconnect: Writable<boolean> = writable(true);
const supress_autoconnect: Writable<boolean> = writable(false);
export type ErrorType = "error.mp.info.lb";
export const known_error: Writable<ErrorType | null> = writable(null);

export const connected: Writable<boolean | null> = writable(null);
export const connection_error: Writable<boolean | null> = writable(null);
export const errors: Writable<Event[]> = writable([]);
export const server_status: Writable<ServerStatus | null> = writable(null);
export const user_details: Writable<UserDetails | null> = writable(null);
export const game_details: Writable<{ [key: number]: GameDetails }> = writable({});
export const game_index: Writable<Index | null> = writable(null);
export const joined_game_id: Writable<number | null> = writable(null);
export const joined_game_id_padded: Readable<string | null> = derived(
	joined_game_id,
	($joined_game_id) => {
		if ($joined_game_id == null) {
			return null;
		} else {
			return String($joined_game_id).padStart(5, "0");
		}
	}
);
export const chat: Writable<ChatMessage[] | null> = writable(null);
export const name_cache: Writable<{ [key: string]: string } | null> = writable(null);
export const state: Writable<{ [key: number]: GameState[] }> = writable({});
export const log: Writable<LogEvent[] | null> = writable(null);
function resetState() {
	known_error.set(null);
	server_status.set(null);
	user_details.set(null);
	game_details.set({});
	game_index.set(null);
	joined_game_id.set(null);
	chat.set(null);
	name_cache.set(null);
	state.set({});
	log.set(null);
}
user_details.subscribe(($user) => {
	if ($user != null) {
		if ($user.admin && get(server_status) == null) {
			send_custom("a_serverstatus");
		}
	}
});
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
export const tournament_announcer: Writable<SvelteComponent | null> = writable(null);

export const tournament_ping: Writable<number | null> = writable(null);
export const tournament_ping_average: Writable<number | null> = writable(null);
export const tournament_ping_average_history: Writable<number[]> = writable([]);
tournament_ping.subscribe(($tournament_ping) => {
	if ($tournament_ping != null) {
		const abs_diff = $tournament_ping;
		const $tournament_ping_average = get(tournament_ping_average);
		tournament_ping_average.set((abs_diff + ($tournament_ping_average ?? 0)) / 2);
	}
});
tournament_ping.subscribe(($value) => {
	if ($value) {
		tournament_ping_average_history.update(($old_history) => {
			if ($old_history.length > 150) {
				// Limit array length to 151
				$old_history.shift();
			}
			return [...$old_history, $value];
		});
	}
});

function reset_values() {
	connected.set(false);
	socket.set(null);
	pingStartTime.set(null);
	tournament_ping.set(null);
	tournament_ping_average.set(null);
	tournament_ping_average_history.set([]);
}

function socket_processor(message: { data: string }) {
	const json = message.data;
	if (json === "o") {
		const now = new Date();
		const $pingStartTime = get(pingStartTime);
		if ($pingStartTime) tournament_ping.set(now.getTime() - $pingStartTime.getTime());
		pingStartTime.set(null);
		return;
	}
	const event = JSON.parse(json);
	console.info("socket ev", event);
	if (event != null) {
		if (event.Index) {
			game_index.set(event.Index);
		}
		if (event.GameStarted || event.GameStopped || event.GameDeleted) {
			if (get(game_index) != null) {
				request_index();
			}
			game_details.set({});
		}
		if (event.UserDetails) {
			const details = event.UserDetails as UserDetails;
			user_details.set(details);
			if (details.current_games.length > 0) {
				if (get(joined_game_id) == null) {
					joined_game_id.set(details.current_games[0]);
				}
			}
		}
		if (event.GameDetails) {
			game_details.set({
				...get(game_details),
				[event.GameDetails.id]: event.GameDetails
			});
		}
		if (event.GameState) {
			if (event.GameState.length > 0) {
				const states: GameState[] = event.GameState;
				const game_id = states[0].game_id;
				state.set({
					...get(state),
					[game_id]: event.GameState
				});
			}
		}
		if (event.GameCreated) {
			request_join(event.GameCreated, null);
		}
		if (event.GameDeleted) {
			if (get(joined_game_id) == event.GameDeleted) {
				joined_game_id.set(null);
			}
			if (get(game_index) != null) {
				request_index();
			}
		}
		if (event.GameJoined) {
			joined_game_id.set(event.GameJoined);
		}
		if (event.GameLeft) {
			if (event.GameLeft == get(joined_game_id) || event.GameLeft == GAME_ANY) {
				joined_game_id.set(null);
			}
			if (get(game_index) != null) {
				request_index();
			}
		}
		if (event.Chat) {
			chat.set([...(get(chat) || []), event.Chat]);
		}
		if (event.ChatLog) {
			chat.set(event.ChatLog);
		}
		if (event.ParticipantDetails) {
			name_cache.set(event.ParticipantDetails.names);
		}
		if (event === "IndexUpdate") {
			// TODO: This is a hack to get the index to update
			request_index();
		}
		if (event.ServerMessage) {
			const msg = event.ServerMessage;
			console.info("Server message:", msg);
			const announcer = get(tournament_announcer);
			if (announcer) {
				announcer.announce(`${msg.title}: ${msg.message}`);
			}
		}
		if (event.ShutDown) {
			const reason = event.ShutDown;
			const announcer = get(tournament_announcer);
			if (announcer) {
				announcer.announce(`Server is shutting down: ${reason}`);
			}
		}
		if (event.Log) {
			log.set(event.Log);
		}
		if (event.Status) {
			server_status.set(event.Status);
		}

		if (event.GenericError) {
			const error = event.GenericError;
			let message = `Virhe: ${event.GenericError}`;
			if (error === "error.mp.game.notfound") {
				message = "Peliä ei löytynyt";
			}
			const announcer = get(tournament_announcer);
			if (announcer && message != null) {
				announcer.announce(message);
			}
		}
	}
}
function socket_error_processor(err: Event) {
	errors.set([...get(errors), err]);
}

export function connect_with_token($token: string | null) {
	if (get(socket)) {
		disconnect();
	}
	resetState();
	const connection_string = `${get(tournament_endpoint)}/ws?token=${$token}`;
	const new_socket = new WebSocket(connection_string);
	new_socket.addEventListener("open", () => {
		supress_autoconnect.set(false);
		connection_error.set(false);
		connected.set(true);
		errors.set([]);

		const $socket = get(socket);
		if ($socket) {
			$socket.send("udetails");
		}
		console.log("ws connected");
	});
	new_socket.addEventListener("close", (event) => {
		reset_values();
		if (event.code == 3001) {
			// User decision
			connection_error.set(null);
			console.log("ws disconnected");
		} else if (event.code == 4013) {
			connection_error.set(null);
			supress_autoconnect.set(true);
			console.warn(`ws connection error from server:`, event.reason);
			known_error.set(event.reason as ErrorType);
			if (event.reason == "error.mp.auth.token") {
				const $auth = get(auth);
				if ($auth) {
					rewrite_token($auth);
				}
			}
		} else {
			connection_error.set(true);
			console.warn("ws connection error", event.code);
		}
	});
	new_socket.addEventListener("message", socket_processor);
	new_socket.addEventListener("error", (error) => {
		socket_error_processor(error);
	});
	socket.set(new_socket);
}
export function connect() {
	connect_with_token(get(token));
}
export function disconnect() {
	const $socket = get(socket);
	if ($socket != null) {
		$socket.close(3001);
	}
}

export function request_index() {
	const $socket = get(socket);
	if ($socket) {
		$socket.send("index");
	} else {
		throw new Error("not connected! can't get index.");
	}
}
export function request_game_details(game_id: number) {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`gdetails|>${game_id}`);
	} else {
		throw new Error("not connected! can't get game details.");
	}
}
export function request_deletion(game_id: number) {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`delete|>${game_id}`);
	} else {
		throw new Error("not connected! can't delete game.");
	}
}
export function request_start(game_id: number) {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`start|>${game_id}`);
	} else {
		throw new Error("not connected! can't start game.");
	}
}
export function request_stop(game_id: number) {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`stop|>${game_id}`);
	} else {
		throw new Error("not connected! can't stop game.");
	}
}
export function request_join(game_id: number, password: string | null) {
	const $socket = get(socket);
	if ($socket) {
		let str = `join|>${game_id}`;
		if (password != null && password.length > 0) {
			str = `${str}|>${password}`;
		}
		$socket.send(str);
	} else {
		throw new Error("not connected! can't join game.");
	}
}
export function request_leave(game_id: number) {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`leave|>${game_id}`);
	} else {
		console.warn("left game without connection");
		joined_game_id.set(null);
	}
}
export function request_kick(game_id: number, user_id: string) {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`kick|>${game_id}|>${user_id}`);
	} else {
		console.warn("not connected! can't kick participants.");
		joined_game_id.set(null);
	}
}
export function send_message(message: string | null) {
	const $socket = get(socket);
	if ($socket) {
		if (message) $socket.send(`say|>${message}`);
	} else {
		throw new Error("not connected! can't send message.");
	}
}
export function admin_announce(message: string | null) {
	const $socket = get(socket);
	if ($socket) {
		if (message) $socket.send(`a_announce|>${message}`);
	} else {
		throw new Error("not connected! can't announce.");
	}
}
export function admin_deleteall() {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`a_deleteall`);
	} else {
		throw new Error("not connected! can't delete all games.");
	}
}
export function request_game_chat() {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`chat`);
	} else {
		throw new Error("not connected! can't get chat.");
	}
}
export function request_game_names() {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`names`);
	} else {
		throw new Error("not connected! can't get names.");
	}
}
export function request_game_state() {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`state`);
	} else {
		throw new Error("not connected! can't get state.");
	}
}
export function request_move(direction: number) {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`move|>${direction}`);
	} else {
		throw new Error("not connected! can't move.");
	}
}
export function send_custom(message: string) {
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`${message}`);
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
	const $socket = get(socket);
	if ($socket) {
		$socket.send(`create|>${JSON.stringify(options)}`);
	} else {
		throw new Error("not connected! can't create game.");
	}
}

function connect_if_possible() {
	if (get(token) != null && get(try_autoconnect) && !get(supress_autoconnect)) {
		connect();
	}
}
const pingStartTime: Writable<Date | null> = writable(null);
const pingIterations: Writable<number> = writable(168);
if (browser) {
	token.subscribe(() => {
		connect_if_possible();
	});
	tournament_endpoint.subscribe(() => {
		connect_if_possible();
	});
	// Keep websocket connections alive by pinging the connection every 2000ms.
	setInterval(() => {
		const $socket = get(socket);
		if ($socket == null) {
			connect_if_possible();
		}
		const $pingIterations = get(pingIterations);
		const $pingStartTime = get(pingStartTime);
		if ($pingStartTime == null) {
			if ($socket && $socket.readyState === $socket.OPEN) {
				$socket.send("p");
				pingIterations.set($pingIterations + 1);
				pingStartTime.set(new Date());
			}
		}
	}, 500);
}
