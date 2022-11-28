import { json_headers } from "$lib/utils";

export function recordGame(run: string, score: number) {
	try {
		fetch(`https://analytics.oispahalla.com/api/record`, {
			method: "POST",
			headers: json_headers,
			body: JSON.stringify({
				r: run,
				client: __APP_VERSION__,
				abandoned: false,
				won: false,
				score
			})
		}).catch((e) => {
			console.error("error recording analytics", e);
		});
	} catch (e) {
		console.error("error recording analytics", e);
	}
}
