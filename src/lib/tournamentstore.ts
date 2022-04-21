let tournament_endpoint = "http://0.0.0.0:8000/ohts/api";

class createResponse {
    success: boolean
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
        return new createResponse(json.success, json.tournament_id, json.status_code);
    }
    return new createResponse(false, 0, -1); // Fetch failed
}

class publicTournamentsResponse {
    success: boolean
    status_code: number
    ongoing_games: number[]
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