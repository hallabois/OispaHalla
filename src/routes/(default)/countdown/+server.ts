import { json, type RequestHandler } from "@sveltejs/kit";
import { countdown, countdown_message } from "$lib/config";

export const GET = (async () => {
	return json({
		time: new Date().getTime(),
		countdown: countdown
			? {
					time: countdown.getTime(),
					message: countdown_message
			  }
			: null
	});
}) satisfies RequestHandler;
