import { type Writable, writable, get } from "svelte/store";
import { browser, dev } from "$app/environment";
import { auth } from "$lib/Auth/authstore";

import { setItem, getItem, storage } from "$lib/stores/storage";

let leaderboard_endpoint_prod = "https://oispahallalb.herokuapp.com";
let leaderboard_endpoint_dev = true ? leaderboard_endpoint_prod : "http://localhost:5000";
export let leaderboard_endpoint = dev ? leaderboard_endpoint_dev : leaderboard_endpoint_prod;

export let lb_screenName: Writable<string | null> = writable(getItem("lb_screenName") || null);
function ensure_screenname() {
	if (get(lb_screenName) == null && browser && auth != null) {
		let $auth = get(auth);
		if ($auth != null && $auth.email != null) {
			// This is a bit cursed but does the job
			let name = $auth.email
				.split("@")[0]
				.split(".")
				.map((namep, ind) => {
					return namep.slice(0, Math.min(namep.length, Math.max(20 - ind * 20, 1)));
				})
				.join("");
			lb_screenName.set(name);
		}
	}
}
lb_screenName.subscribe((val) => {
	if (val == "null") {
		lb_screenName.set(null);
	}
	ensure_screenname();
});
lb_screenName.subscribe((value) => {
	setItem("lb_screenName", value);
});
auth.subscribe(() => {
	ensure_screenname();
});

export async function check_server_alive() {
	try {
		const resp = await fetch(`${leaderboard_endpoint}/alive`);
		return resp.ok;
	} catch (e) {
		console.warn(e);
		return false;
	}
}

export class scores_ok {
	scores!: any[];
}
export class scores_error {
	error_msg!: string;
}
export type scores_response = scores_ok | scores_error;
export async function get_all_scores(size: number): Promise<scores_response> {
	try {
		const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}/`);
		if (resp.ok) {
			try {
				const json_result = await resp.json();
				return json_result;
			} catch (e) {
				console.warn(e);
				return {
					error_msg: "Invalid JSON"
				};
			}
		} else {
			console.warn(resp);
			return {
				error_msg: "Failed to contact server."
			};
		}
	} catch (e) {
		console.warn(e);
		return {
			error_msg: "Error contacting server."
		};
	}
}

export async function get_top_scores(size: number, threshold: number): Promise<scores_response> {
	try {
		const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}/${threshold}`);
		if (resp.ok) {
			try {
				const json_result = await resp.json();
				return json_result;
			} catch (e) {
				console.warn(e);
				return {
					error_msg: "Invalid JSON"
				};
			}
		} else {
			console.warn(resp);
			return {
				error_msg: "Failed to contact server."
			};
		}
	} catch (e) {
		console.warn(e);
		return {
			error_msg: "Error contacting server."
		};
	}
}

export class User {
	_id!: string;
	screenName!: string;
}
export class Score {}
export class Score_ok {
	success!: boolean;
	_id!: string;
	size!: number;
	score!: number;
	breaks!: number;
	user!: User;
	createdAt!: string;
	updatedAt!: string;
}
export class Score_error {
	success!: boolean;
	error_msg!: string;
}
export type Score_response = Score_ok | Score_error;
export async function fetchboard(size: number, token: string): Promise<Score_response> {
	try {
		const resp = await fetch(
			`${leaderboard_endpoint}/scores/size/${size}/fetchboard/token/${token}`
		);
		if (resp.ok) {
			try {
				const json_result = await resp.json();
				if (json_result.score && json_result.score.size && json_result.score.score) {
					let existing = getItem("bestScores") || {};
					setItem("bestScores", {
						...existing,
						[json_result.score.size]: Math.max(json_result.score.score, existing[json_result.score.size] || 0)
					});
					let existing_submitted = getItem("lb_submitted") || {};
					setItem("lb_submitted", {
						...existing_submitted,
						[json_result.score.size]: Math.max(json_result.score.score, existing_submitted[json_result.score.size] || 0)
					});
				}
				return {
					...json_result,
					success: true
				};
			} catch (e) {
				console.warn(e);
				return {
					success: false,
					error_msg: "Invalid JSON"
				};
			}
		} else {
			console.warn(resp);
			return {
				success: false,
				error_msg: "Failed to reach server."
			};
		}
	} catch (e) {
		console.warn(e);
		return {
			success: false,
			error_msg: "Error contacting server."
		};
	}
}

export class submit_response {
	success!: boolean;
	message!: string;
	json!: any | null;
}
export async function submit_score(
	size: number,
	token: string | null,
	user_screenName: string,
	run_score: number,
	run_breaks: number,
	run_history: string
): Promise<submit_response> {
	try {
		const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				user: {
					token: token,
					screenName: user_screenName
				},
				score: run_score,
				breaks: run_breaks,
				history: run_history
			})
		});
		if (resp.ok) {
			return {
				success: true,
				message: "Suoritus tallennettu.",
				json: await resp.json()
			};
		} else {
			console.warn(resp);
			let json = await resp.json();
			return {
				success: false,
				message: json.message || "Tuntematon virhe",
				json: json
			};
		}
	} catch (e) {
		console.warn(e);
		return {
			success: false,
			message: "Error contacting server.",
			json: null
		};
	}
}

export async function check_name(name: string, uid: string): Promise<boolean> {
	try {
		const resp = await fetch(`${leaderboard_endpoint}/meta/verifyname/${name}/uid/${uid}`);
		if (resp.ok) {
			return true;
		} else {
			return false;
		}
	} catch (e) {
		console.warn(e);
		return false;
	}
}

export type Scores = { [key: number]: number };
export type Histories = { [key: number]: any[] };
export function get_local_top_scores(): Scores {
	const scores: Scores = {};
	for (const size of [3, 4]) {
		scores[size] = getItem(`HAC_best_score${size}`);
	}
	// console.info(scores);
	return scores;
}
export function get_local_top_histories(): Histories {
	const histories: Histories = {};
	for (const size of [3, 4]) {
		histories[size] = getItem(`HAC_best_history${size}`);
	}
	// console.info(histories);
	return histories;
}
export function update_my_top_score() {
	my_top_scores.set(get_local_top_scores());
	my_top_score_histories.set(get_local_top_histories());
}
export let my_top_scores: Writable<Scores> = writable(browser ? get_local_top_scores() : {});
export let my_top_score_histories: Writable<Histories> = writable(
	browser ? get_local_top_histories() : {}
);
export let my_top_submitted_scores: Writable<Scores> = writable(
	browser ? getItem("lb_submitted") || {} : {}
);
my_top_submitted_scores.subscribe((value) => {
	setItem("lb_submitted", value);
});
