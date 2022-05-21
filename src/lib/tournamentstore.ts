let tournament_endpoint = process.env.NODE_ENV !== "development" ? "https://hac.oispahalla.com:9000/ohts/api" : "https://0.0.0.0:9000/ohts/api";
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
    let resp = await fetch(`${tournament_endpoint}/games`, 
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

export class TournamentInfo {
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
    let resp = await fetch(`${tournament_endpoint}/games`);
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

export let server_status: Writable<boolean> = writable(null);
export async function checkAlive(): Promise<boolean> {
    try {
        server_status.set(null);
        let resp = await fetch(`${tournament_endpoint}/alive`);
        if(resp.ok) {
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

export let joined_game_id: Writable<number> = writable(null);
export let joined_game_user_id: Writable<string> = writable(null);
export let joined_game_am_host: Writable<boolean> = writable(false);
export let joined_game_host_pswds = {};
export let joined_game_data: Writable<TournamentInfo> = writable(null);
export let joined_game_error: Writable<String> = writable(null);

export async function getGameData(id: number) {
    let resp = await fetch(`${tournament_endpoint}/games/${id}`);
    if(resp.ok) {
        let json = await resp.json();
        return json;
    }
    else {
        return null;
    }
}

export async function refreshGameData() {
    let resp = await fetch(`${tournament_endpoint}/games/${get(joined_game_id)}`);
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

export async function poll() {
    let moves = poll_send_moves;
    moves = moves.filter((i,idx) => poll_send_moves[idx-1] !== i); // Remove adjacent duplicates, as they do not affect the game
    poll_send_moves = [];
    let resp = await fetch(`${tournament_endpoint}/poll/${get(joined_game_id)}`,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "user_id": get(joined_game_user_id), 
                "moves": moves
            })
        }
    );
    if(resp.ok) {
        let data = await resp.json();
        return data as PollData;
    }
    else {
        return null;
    }
}

export async function joinGame(id: number, joinPswd = null, isHost = false, hostPswd = null) {
    console.log("Trying to join game id", id, "...")
    // TODO: Contact server
    let resp = await fetch(`${tournament_endpoint}/games/${id}/join`,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "join_password": joinPswd, 
                "moves": "[]"
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

    let resp = await fetch(`${tournament_endpoint}/games/${get(joined_game_id)}/leave`,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "user_id": get(joined_game_user_id), 
            })
        }
    );
    if(resp.ok) {

    }
    else {
        joined_game_error.set(resp.statusText);
    }

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
    let resp = await fetch(`${tournament_endpoint}/games/${id}/start`, 
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

class deleteResponse {
    success: boolean
}

export async function host_deleteGame(): Promise<deleteResponse> {
    let id = get(joined_game_id);
    let resp = await fetch(`${tournament_endpoint}/games/${id}/delete`, 
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
        joined_game_id.set(null);
        joined_game_data.set(null);
        joined_game_error.set(null);
        joined_game_host_pswds[id] = null;
        return {success: true};
    }
    return {success: false} // Fetch failed
}


class PollData {
    board: string;
    game: TournamentInfo;
    history_index: number;
    other_boards: string[];
}
// Polling
export let poll_success: Writable<boolean> = writable(null);
export let poll_board_string: Writable<string> = writable(null);
export let poll_other_boards_string: Writable<string[]> = writable(null);
export let poll_game: Writable<TournamentInfo> = writable(null);
export let poll_index: Writable<number> = writable(null);

export let poll_send_moves: number[] = [];
setInterval(
    ()=>{
        if(get(joined_game_id) != null) {
            poll().then(
                (polldata) => {
                    if(polldata != null) {
                        poll_success.set(true);
                        poll_board_string.set(polldata.board);
                        poll_game.set(polldata.game);
                        poll_index.set(polldata.history_index);
                        poll_other_boards_string.set(polldata.other_boards);
                    }
                    else{
                        poll_success.set(false);
                    }
                }
            )
        }
        else {
            poll_success.set(null);
        }
    },
    400
);
