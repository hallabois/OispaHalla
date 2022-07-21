let leaderboard_enpoint_prod = "https://oispahallalb.herokuapp.com";
let leaderboard_endpoint_dev = true ? leaderboard_enpoint_prod : "http://localhost:5000";
export let leaderboard_endpoint = process.env.NODE_ENV !== "development" ? leaderboard_enpoint_prod : leaderboard_endpoint_dev;
import { type Writable, writable, get } from "svelte/store";
import { browser } from "$app/env";

export let lb_screenName: Writable<string|null> = writable(browser ? localStorage.lb_screenName || null : null);
lb_screenName.subscribe((value) => {if(browser){localStorage.lb_screenName = value}});

export let lb_id: Writable<string|null> = writable(browser ? localStorage.lb_id || null : null);
lb_id.subscribe((value) => {if(browser){localStorage.lb_id = value}});

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

export class submit_response {
    success!: boolean
    message!: string|null
}
export async function submit_score(size: number, user_id: string|null, user_screenName: string, run_score: number, run_breaks: number, run_history: string): Promise<submit_response> {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "user": {
                        "id": user_id,
                        "screenName": user_screenName
                    },
                    "score": run_score,
                    "breaks": run_breaks,
                    "history": run_history
                })
            }
        );
        if(resp.ok) {
            return {
                success: true,
                message: "Suoritus tallennettu."
            }
        }
        else {
            console.warn(resp);
            let json = await resp.json();
            return {
                success: false,
                message: json.message || "Tuntematon virhe"
            };
        }
    }
    catch (e) {
        console.warn(e);
        return {
            success: false,
            message: "Error contacting server."
        };
    }
}

export type Scores = Map<number, number>;
export type Histories = Map<number, string>;
export function get_local_top_scores(): Scores {
    const scores = new Map();
    for(const size of [3, 4]) {
        scores.set(size, JSON.parse(localStorage.getItem(`HAC_best_score${size}`) || "null"));
    }
    console.info(scores);
    return scores;
};
export function get_local_top_histories(): Histories {
    const histories = new Map();
    for(const size of [3, 4]) {
        histories.set(size, JSON.parse(localStorage.getItem(`HAC_best_history${size}`) || "null"));
    }
    console.info(histories);
    return histories;
}
export function update_my_top_score() {
    my_top_scores.set(get_local_top_scores());
    my_top_score_histories.set(get_local_top_histories());
}
export let my_top_scores: Writable<Scores> = writable(browser ? get_local_top_scores() : new Map());
export let my_top_score_histories: Writable<Histories> = writable(browser ? get_local_top_histories() : new Map());
export let my_top_submitted_scores: Writable<Scores> = writable(browser ? JSON.parse(localStorage.lb_submitted || "null") || new Map() : new Map());
my_top_submitted_scores.subscribe((value) => {if(browser){localStorage.lb_id = JSON.stringify(value)}});