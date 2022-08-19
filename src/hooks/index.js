/* ~/src/hooks.js */

// This hook "pre-renders" the appropriate theme server-side.
import { defaultTheme } from "$lib/themestore";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {

    // Check for theme cookie
    let cookie = event.request.headers.get('cookie');
    if (cookie) {
        let matching = cookie.match(/theme=\d{1,5}/) || []; // qualifies theme:[0-99999]
        if(matching.length > 0) {
            let theme = matching[0].split("=")[1];
            return await resolve(event, {
                transformPageChunk: ({ html }) => html.replace(/<html/g, `<html class="theme-${theme}"`)
            });
        }
    }

    const response = await resolve(event)
    return response
}