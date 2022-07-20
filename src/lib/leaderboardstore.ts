let leaderboard_enpoint_prod = "https://oispahallalb.herokuapp.com";
let leaderboard_endpoint_dev = false ? leaderboard_enpoint_prod : "http://localhost:5000";
export let leaderboard_endpoint = process.env.NODE_ENV !== "development" ? leaderboard_enpoint_prod : leaderboard_endpoint_dev;
import { type Writable, writable, get } from "svelte/store";

export async function check_server_alive() {
    const resp = await fetch(`${leaderboard_endpoint}/alive`);
    return resp.ok;
}

export class scores_ok {
    scores!: any[]
}
export class scores_error {
    error_msg!: string
}
export type scores_response = scores_ok | scores_error
export async function get_all_scores(size: number): Promise<scores_response> {
    const resp = await fetch(`${leaderboard_endpoint}/scores/${size}/`);
    if(resp.ok) {
        try {
            const json_result = await resp.json();
            return json_result;
        }
        catch(e) {
            console.warn(e);
            return {
                error_msg: "Invalid JSON"
            };
        }
    }
    else {
        console.warn(resp);
        return {
            error_msg: "Failed to contact server."
        };
    }
}