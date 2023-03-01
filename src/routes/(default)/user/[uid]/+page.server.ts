import { getLeaderBoardData } from "$lib/server/leaderboards";
import { env } from "$env/dynamic/private";

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, setHeaders, params, url }) {
	let uid = params.uid;

	let resp = await getLeaderBoardData(uid, env.ADMIN_TOKEN);
	let size = null;
	if (url.searchParams) {
		size = url.searchParams.get("size");
	}

	return {
		uid,
		resp,
		size
	};
}
