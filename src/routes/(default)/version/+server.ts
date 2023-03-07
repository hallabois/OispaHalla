import { json, type RequestHandler } from "@sveltejs/kit";

export const prerender = true;

export const GET = (async ({}) => {
	return json({ version: __APP_VERSION__, branch: __APP_BRANCH__ });
}) satisfies RequestHandler;
