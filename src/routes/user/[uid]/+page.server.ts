import { leaderboard_endpoint } from "$lib/stores/leaderboardstore";
import { env } from "$env/dynamic/private";

async function getLeaderBoardData(uid: string): Promise<Response> {
    // ADMIN_TOKEN must match the ADMIN_TOKEN that of the lb backend
    let url = `${leaderboard_endpoint}/admin/scores/uid/${uid}?token=${env.ADMIN_TOKEN}`;
    console.log("getting lb data", url);
    return await fetch(url);
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, setHeaders, params }) {
	let uid = params.uid;

	let resp = await getLeaderBoardData(uid);
    console.log(resp);

	return {
		uid
	};
}
