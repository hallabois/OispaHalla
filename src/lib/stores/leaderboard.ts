import { type Readable, get, derived, writable, type Writable } from "svelte/store";
import { setItem, getItem, storage_loaded, storage } from "$lib/stores/storage";
import { json_headers } from "$lib/utils";
import { leaderboard_endpoint } from "$lib/config";
import {
	highscores,
	type GameSize,
	type HighScores,
	syncHighScore,
	active_size,
	ENABLED_SIZES
} from "$lib/gamelogic/new";
import { token } from "$lib/Auth/authstore";
import { browser } from "$app/environment";

export const lb_screenName: Readable<string | undefined> = derived(
	[storage_loaded, storage],
	([$storage_loaded, $storage]) => {
		if (!$storage_loaded) {
			return undefined;
		}
		return $storage["lb_screenName"] as string | undefined;
	}
);
export const set_lb_screenName = (name: string) => {
	setItem("lb_screenName", name);
};

export async function check_server_alive() {
	try {
		const resp = await fetch(`${leaderboard_endpoint}/alive`, {
			headers: json_headers
		});
		return resp.ok;
	} catch (e) {
		console.warn(e);
		return false;
	}
}
export type scores_ok = {
	scores: {
		score: number;
		user: {
			screenName: string;
			uid: string;
		};
	}[];
};
export type scores_error = {
	error_msg: string;
};
export type scores_response = scores_ok | scores_error;
export async function get_all_scores(
	size: number,
	override_fetch: typeof fetch | null = null
): Promise<scores_response> {
	const fetcher = override_fetch || fetch;
	try {
		const resp = await fetcher(`${leaderboard_endpoint}/scores/size/${size}/`, {
			headers: json_headers
		});
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
		const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}/${threshold}`, {
			headers: json_headers
		});
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
	uid!: string;
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
export type Fetchboard_ok = {
	success: boolean;
	rank: number;
	topBoard: Score_ok[];
	rivals:
		| {
				score: number;
				user: User;
		  }[]
		| null;
	score: Score_ok;
};
export type Score_error = {
	success: boolean;
	error_msg: string;
};
export type Score_response = Score_ok | Score_error;
export type Fetchboard_response = Fetchboard_ok | Score_error;

export async function fetchboard(
	size: GameSize,
	token: string | null,
	threshold: number,
	rankMinus: number | null,
	rankPlus: number | null
): Promise<Fetchboard_response> {
	try {
		const resp = await fetch(
			`${leaderboard_endpoint}/scores/size/${size}/fetchboard/${threshold}/`,
			{
				method: "POST",
				headers: json_headers,
				body: JSON.stringify({
					token,
					...(token
						? {
								rankMinus,
								rankPlus
						  }
						: {})
				})
			}
		);
		if (resp.ok) {
			try {
				const json_result = await resp.json();
				if (get(lb_screenName) == null && json_result?.score?.user?.screenName) {
					set_lb_screenName(json_result?.score?.user?.screenName);
				}
				if (json_result.score && json_result.score.size && json_result.score.score) {
					syncHighScore(json_result.score.size, {
						submitted: true,
						score: json_result.score.score
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
export const refresh_key = writable({});
export const fetchboard_cache: Writable<{
	[size in GameSize]: Fetchboard_response | null;
}> = writable(ENABLED_SIZES.reduce((acc, size) => ({ ...acc, [size]: null }), {} as any));
export const fetchboard_cache_key = writable(get(refresh_key));
export const personal_leaderboards = derived(
	[active_size, token, refresh_key],
	([$active_size, $token, $refresh_key]) => {
		if ($active_size == null) {
			return null;
		}
		if ($token == null) {
			return null;
		}
		if ($refresh_key != get(fetchboard_cache_key)) {
			fetchboard_cache.set(
				ENABLED_SIZES.reduce((acc, size) => ({ ...acc, [size]: null }), {} as any)
			);
			fetchboard_cache_key.set($refresh_key);
		}
		const cached = get(fetchboard_cache)[$active_size];
		if (cached) {
			return cached;
		}
		const result = fetchboard($active_size, $token, 10, 1, 1);
		fetchboard_cache.update((cache) => ({ ...cache, [$active_size]: result }));
		return result;
	}
);
export const server_alive = derived([token], async ([$token]) => {
	return await check_server_alive();
});

export type submit_response = {
	success: boolean;
	message: string;
	json: any | null;
};
export async function submit_score(
	size: GameSize,
	token: string | null,
	user_screenName: string,
	run_score: number,
	run_breaks: number,
	run_history: string
): Promise<submit_response> {
	const connected_accounts = storage_loaded ? getItem("connected_accounts") || [] : [];
	try {
		const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}`, {
			method: "POST",
			headers: json_headers,
			body: JSON.stringify({
				user: {
					token: token,
					screenName: user_screenName,
					connected_accounts
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
			console.error(resp);
			const json = await resp.json();
			console.error("resp json:", json);
			return {
				success: false,
				message: json.message || "Tuntematon virhe",
				json: json
			};
		}
	} catch (e) {
		console.error(e);
		return {
			success: false,
			message: "Verkkovirhe.",
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

export class change_name_response {
	success!: boolean;
	message!: string;
}
export async function change_name(name: string, token: string): Promise<change_name_response> {
	try {
		const connected_accounts = storage_loaded ? getItem("connected_accounts") || [] : [];
		const resp = await fetch(`${leaderboard_endpoint}/meta/changename`, {
			method: "POST",
			headers: json_headers,
			body: JSON.stringify({
				token: token,
				name,
				connected_accounts
			})
		});
		if (resp.ok) {
			set_lb_screenName(name);
			return {
				success: true,
				message: "Nimi vaihdettu."
			};
		} else {
			console.warn(resp);
			const json = await resp.json();
			return {
				success: false,
				message: json.message || "Tuntematon virhe"
			};
		}
	} catch (e) {
		console.warn(e);
		return {
			success: false,
			message: "Verkkovirhe."
		};
	}
}
