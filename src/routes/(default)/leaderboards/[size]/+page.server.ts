import { get_all_scores } from "$lib/stores/leaderboardstore";

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, setHeaders, params }) {
	let size = params.size;

	let leaderboard_data = await get_all_scores(size);

	return {
		leaderboard_data,
		size
	};
}
