let tournament_endpoint_dev = false ? "ohts.fly.dev" : "localhost:9000";
export let tournament_endpoint = false ? "mp.oispahalla.com" : tournament_endpoint_dev;
import { browser } from "$app/environment";
import { token } from "$lib/Auth/authstore";
import { type Writable, writable, get } from "svelte/store";

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
export let connected: Writable<boolean | null> = writable(null);
export let game_index: Writable<Object | null> = writable(null);
export let try_admin: Writable<boolean> = writable(false);
export let try_autoconnect: Writable<boolean> = writable(true);
export let joined_game_id: Writable<number | null> = writable(null);

function socket_processor(message: any) {
	let json = message.data;
	let event = JSON.parse(json);
	console.info("socket ev", event);
	if(event.data) {
		if(event.data.Index) {
			game_index.set(event.data.Index);
		}
	}
}


export function connect_with_token(token: string | null) {
	if(!socket) {
		let connection_string = `ws://${tournament_endpoint}/ws?token=${token}`;
		if(get(try_admin)) {
			connection_string = `${connection_string}&admin=true`;
		}
		socket = new WebSocket(connection_string);
		socket.addEventListener('open', (event) => {
			connected.set(true);
			if(socket){
				socket.send('say|>Hello world!');
			}
		});
		socket.addEventListener('close', (event) => {
			connected.set(false);
		});
		socket.addEventListener('message', socket_processor);
		socket.addEventListener('error', (err)=>{console.error("ws err", err)});
	}
}
export function connect() {
	connect_with_token(get(token));
}

export function request_index() {
	if(socket) {
		socket.send("index");
	}
	else {
		throw new Error("not connected! can't get index.");
	}
}

export type CreateOptions = {
	name: string,
	gamemode: {
		mode: number,
		goal: number
	},
	public: boolean,
	maxclients: number,
	joinpassword: string | null
};
export function create(options: CreateOptions) {
	let $token = get(token);
	if(socket) {
		socket.send(`create|>${JSON.stringify(options)}`);
	}
	else {
		throw new Error("not connected! can't create game.");
	}
}

if(browser) {
	token.subscribe(($token) => {
		if($token != null && get(try_autoconnect)) {
			connect();
		}
	});
}