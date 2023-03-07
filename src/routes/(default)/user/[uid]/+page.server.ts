import { getLeaderBoardData } from "$lib/server/leaderboards";
import { env } from "$env/dynamic/private";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, url }) => {
	const uid = params.uid;

	const resp = await getLeaderBoardData(uid, env.ADMIN_TOKEN);
	let size = null;
	if (url.searchParams) {
		size = url.searchParams.get("size");
	}

	return {
		uid,
		resp,
		size
	};
}) satisfies PageServerLoad;
