import { defaultTheme } from "$lib/brand";
import { get } from "svelte/store";
import type { LayoutServerLoad } from "./$types";
import { active_size_server, type GameSize } from "$lib/gamelogic/new";
import { theme_index_server } from "$lib/stores/themestore";
import { countdown } from "$lib/config";

export const load = (async ({ request }) => {
	// Check for theme cookie
	const cookie = request.headers.get("cookie");
	let theme = get(defaultTheme);
	let size = 4;
	if (cookie) {
		const matching = cookie.match(/theme=\d{1,5}/) || []; // qualifies theme:[0-99999]
		if (matching.length > 0 && matching[0] != null) {
			theme = +matching[0].split("=")[1];
		}
		const matchingSize = cookie.match(/size=\d{1,5}/) || []; // qualifies size:[0-99999]
		if (matchingSize.length > 0 && matchingSize[0] != null) {
			size = +matchingSize[0].split("=")[1];
		}
	}

	console.log(`Serving theme ${theme} for size ${size}`);
	active_size_server.set(size as GameSize | null);
	theme_index_server.set(theme);

	return {
		theme,
		size,
		lauched_serverside: countdown ? new Date().getTime() > countdown.getTime() : null
	};
}) satisfies LayoutServerLoad;
