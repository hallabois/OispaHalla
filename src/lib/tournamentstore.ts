let tournament_endpoint = "http://0.0.0.0:8000/ohts/api";
import { type Writable, writable, get } from "svelte/store";

class createResponse {
    success: boolean
    edit_key: string
    join_password: string
    tournament_id: number
    status_code: number
    constructor(success, tournament_id, status_code) {
        this.success = success;
        this.tournament_id = tournament_id;
        this.status_code = status_code;
    }
}

export async function createTournament(name: string, is_public: boolean, max_clients: number, join_password: string): Promise<createResponse> {
    let resp = await fetch(`${tournament_endpoint}/create`, 
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "create_name": name,
                "create_public": is_public,
                "create_max_clients": max_clients,
                "create_join_password": join_password          
            })
        }
    );
    if(resp.ok) {
        let json = await resp.json();
        console.log("tournament data:", json);
        return json as createResponse;
    }
    return new createResponse(false, 0, -1); // Fetch failed
}

class TournamentInfo {
    name: string
    id: number
    requires_password: boolean
    public: boolean
    active: boolean
    clients: number
    starting_state: string
}

class publicTournamentsResponse {
    success: boolean
    status_code: number
    ongoing_games: TournamentInfo[]
    active_games: number[]
    past_games: number[]
    constructor(success, status_code, ongoing_games, active_games, past_games) {
        this.success = success;
        this.status_code = status_code;
        this.ongoing_games = ongoing_games;
        this.active_games = active_games;
        this.past_games = past_games;
    }
}

export async function getPublicTournaments() {
    let resp = await fetch(`${tournament_endpoint}/public_games`);
    if(resp.ok) {
        let json = await resp.json();
        console.log("public tournaments:", json);
        return new publicTournamentsResponse(true, 0, json.ongoing_games, json.active_games, json.past_games);
    }
    return new publicTournamentsResponse(false, -1, [], [], []); // Fetch failed
}

export async function checkNameValid(name: string) {
    let resp = await fetch(`${tournament_endpoint}/create`, 
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "create_name": name, 
            })
        }
    );
    if(resp.ok) {
        let json = await resp.json();
        return json.valid;
    }
    return false; // Fetch failed
}

export async function checkAlive(): Promise<boolean> {
    try {
        let resp = await fetch(`${tournament_endpoint}/alive`);
        if(resp.ok) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

export let joined_game_id: Writable<number> = writable(null);
export let joined_game_user_id: Writable<number> = writable(null);
export let joined_game_am_host: Writable<boolean> = writable(false);
export let joined_game_host_pswds = {};
export let joined_game_data: Writable<TournamentInfo> = writable(null);
export let joined_game_error: Writable<String> = writable(null);

export async function getGameData(id: number) {
    let resp = await fetch(`${tournament_endpoint}/game/${id}`);
    if(resp.ok) {
        let json = await resp.json();
        return json;
    }
    else {
        return null;
    }
}

export async function refreshGameData() {
    let resp = await fetch(`${tournament_endpoint}/game/${get(joined_game_id)}`);
    console.log("refreshGameData response:", resp);
    if(resp.ok) {
        let json = await resp.json();
        joined_game_data.set(json);
        joined_game_error.set(null);
    }
    else {
        joined_game_error.set(resp.statusText);
    }
}

export async function joinGame(id: number, joinPswd = null, isHost = false, hostPswd = null) {
    console.log("Trying to join game id", id, "...")
    // TODO: Contact server
    let resp = await fetch(`${tournament_endpoint}/join/${id}`,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "join_password": joinPswd, 
            })
        }
    );
    if(resp.ok) {
        let json = await resp.json();
        joined_game_id.set(json.game_id);
        joined_game_user_id.set(json.user_id);
        if(isHost) {
            joined_game_host_pswds[id] = hostPswd;
        }
        else {
            if(Object.keys(joined_game_host_pswds).includes(id+"")) {
                isHost = true;
            }
        }
        joined_game_am_host.set(isHost);
        await refreshGameData();
    }
    else {
        joined_game_error.set(resp.statusText);
    }
    //
}

export async function leaveGame() {
    console.log("Leaving the current game...");
    // TODO: Contact server
    joined_game_id.set(null);
    joined_game_data.set(null);
    joined_game_error.set(null);
}

class startResponse {
    success: boolean
    tournament_id: number
    status_code: number
    msg: string
}

export async function host_startGame(): Promise<startResponse> {
    let id = get(joined_game_id);
    let resp = await fetch(`${tournament_endpoint}/start/${id}`, 
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "edit_key": joined_game_host_pswds[id],
            })
        }
    );
    if(resp.ok) {
        let json = await resp.json();
        return json as startResponse;
    }
    return {success: false, tournament_id: id, status_code: -1, msg: "Virhe tai jtn"} // Fetch failed
}