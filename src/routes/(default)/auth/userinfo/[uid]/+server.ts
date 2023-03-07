import { json as json$1 } from "@sveltejs/kit";
import { getLeaderBoardData } from "$lib/server/leaderboards";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

export const GET = (async ({ params }) => {
	const uid = params.uid;
	console.info(`User info request for uid "${uid}"`);
	try {
		const resp = await getLeaderBoardData(uid, env.ADMIN_TOKEN);
		if (resp.err) {
			throw new Error(resp.err);
		}
		if (!resp.data) {
			throw new Error("lb did not return any data" + resp);
		}
		const lb = {
			uid: resp.data.uid,
			screenName: resp.data.screenName,
			updatedAt: resp.data.updatedAt
		};
		return json$1(
			{
				lb
			},
			{
				status: 200
			}
		);
	} catch (e) {
		console.warn("Error during user info request:", e);
		return json$1(
			{
				error: e + ""
			},
			{
				status: 500
			}
		);
	}
}) satisfies RequestHandler;
