import { get_all_scores } from "$lib/stores/leaderboard";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
	const size = params.size;

	const leaderboard_data = await get_all_scores(+size);

	return {
		leaderboard_data,
		size
	};
}) satisfies PageServerLoad;
