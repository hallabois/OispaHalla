import { defaultTheme } from "$lib/stores/themestore";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ request }) => {
	// Check for theme cookie
	const cookie = request.headers.get("cookie");
	let theme = defaultTheme;
	if (cookie) {
		const matching = cookie.match(/theme=\d{1,5}/) || []; // qualifies theme:[0-99999]
		if (matching.length > 0 && matching[0] != null) {
			theme = +matching[0].split("=")[1];
		}
	}

	console.log(`Serving theme ${theme}`);

	return {
		theme
	};
}) satisfies LayoutServerLoad;
