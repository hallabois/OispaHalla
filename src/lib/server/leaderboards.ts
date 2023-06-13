import { leaderboard_endpoint } from "$lib/config";
import { json_headers } from "$lib/utils";

export type Score = {
	_id: string;
	size: number;
	score: number;
	breaks: number;
	history: string;
	user: string;
	hash: string;
	createdAt: string;
	updatedAt: string;
};

export type leaderBoardDataOk = {
	_id: string;
	screenName: string;
	scores: { [key: number]: Score };
	uid: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
};

export type leaderBoardDataResult = {
	err: string | null;
	data: leaderBoardDataOk | null;
};

export async function getLeaderBoardData(
	uid: string,
	admin_token: string
): Promise<leaderBoardDataResult> {
	// ADMIN_TOKEN must match the ADMIN_TOKEN that of the lb backend
	const url = `${leaderboard_endpoint}/admin/user/uid/${uid}?token=${encodeURIComponent(
		admin_token
	)}`;
	console.log("getting lb user data for user", uid);
	const resp = await fetch(url, {
		headers: json_headers
	});
	if (resp.ok) {
		const json = await resp.json();
		return { data: json, err: null };
	}
	console.warn("lb user data err", resp);
	return { err: resp.statusText, data: null };
}
