// This hook "pre-renders" the appropriate theme server-side.
import { get } from "svelte/store";
import { defaultTheme } from "./brand";
import type { Handle } from "@sveltejs/kit";

export const handle = (async ({ event, resolve }) => {
	let theme = get(defaultTheme);

	// Check for theme cookie
	const cookie = event.request.headers.get("cookie");
	if (cookie) {
		const matching = cookie.match(/theme=\d{1,5}/) || []; // qualifies theme:[0-99999]
		if (matching.length > 0) {
			// @ts-ignore
			theme = +matching[0].split("=")[1];
		}
	}

	// Apply selected theme to the html component
	return await resolve(event, {
		transformPageChunk: ({ html }) => html.replace(/<html/g, `<html class="theme-${theme}"`)
	});
}) satisfies Handle;
