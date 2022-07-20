let leaderboard_enpoint_prod = "https://oispahallalb.herokuapp.com";
let leaderboard_endpoint_dev = true ? leaderboard_enpoint_prod : "http://localhost:5000";
export let leaderboard_endpoint = process.env.NODE_ENV !== "development" ? leaderboard_enpoint_prod : leaderboard_endpoint_dev;
import { type Writable, writable, get } from "svelte/store";

export async function check_server_alive() {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/alive`);
        return resp.ok;
    }
    catch (e) {
        console.warn(e);
        return false;
    }
}

export class scores_ok {
    scores!: any[]
}
export class scores_error {
    error_msg!: string
}
export type scores_response = scores_ok | scores_error
export async function get_all_scores(size: number): Promise<scores_response> {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}/`);
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
    catch (e) {
        console.warn(e);
        return {
            error_msg: "Error contacting server."
        };
    }
}

export async function get_top_scores(size: number, threshold: number): Promise<scores_response> {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}/${threshold}`);
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
    catch (e) {
        console.warn(e);
        return {
            error_msg: "Error contacting server."
        };
    }
}