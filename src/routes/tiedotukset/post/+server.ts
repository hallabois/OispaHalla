import { json as json$1 } from "@sveltejs/kit";
import { app } from "$lib/Auth_admin/auth.server";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";
import { getFirestore } from "firebase-admin/firestore";

export async function POST({ request }) {
	console.info("Validating admin post token...");
	let body = await request.json();
	return await handle(body, request);
}

async function handle(body: object, request) {
	if (!dev) {
		return json$1(
			{
				message: "this feature is not enabled in production"
			},
			{
				status: 400
			}
		);
	}
	if (body.token == null) {
		return json$1(
			{
				message: "please include a token"
			},
			{
				status: 400
			}
		);
	} else {
		let token = body.token;

		try {
			if (env.ADMIN_TOKEN) {
				if (token === env.ADMIN_TOKEN) {
					console.info(`ADMIN TOKEN USED for posting PSA`);
					if (body.psa == null || body.psa.id == null || body.psa.content == null) {
						return json$1(
							{
								message: "psa invalid"
							},
							{
								status: 400
							}
						);
					}
					console.info("Acquiring db...");
					let db = getFirestore(app);
					console.info("getting dbRef...");
					let ref = db.doc("global/PSA");
					console.info("getting current document");
					let document = await ref.get();
					console.info("getting current content...");
					let data = document.data() || {};
					let content = data.content || {};
					console.info("setting new content...");
					content[body.psa.id] = body.psa.content;
					await ref.set({
						...data,
						content
					});
					return json$1({
						message: "psa updated"
					});
				} else {
					return json$1(
						{
							message: "invalid admin token"
						},
						{
							status: 403
						}
					);
				}
			} else {
				console.warn("ADMIN_TOKEN not set!");
				return json$1(
					{
						message: `Invalid server configuration`
					},
					{
						status: 500
					}
				);
			}
		} catch (e) {
			console.warn("PSA error:", e);
			return json$1(
				{
					message: `Internal error`,
					error: e
				},
				{
					status: 500
				}
			);
		}
	}
}
