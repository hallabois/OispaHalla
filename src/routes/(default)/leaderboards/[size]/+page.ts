import { get_all_scores } from "$lib/stores/leaderboard";
import type { PageLoad } from "./$types";

export const load = (async ({ params, fetch }) => {
	const size = params.size;

	const leaderboard_data = await get_all_scores(+size, fetch);

	return {
		leaderboard_data,
		size
	};
}) satisfies PageLoad;
