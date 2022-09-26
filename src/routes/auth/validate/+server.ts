import { json as json$1 } from "@sveltejs/kit";
import { getAuth } from "firebase-admin/auth";
import { app } from "$lib/Auth_admin/auth.server";
import { env } from "$env/dynamic/private";

export async function POST({ request, getClientAddress }) {
	console.info("Validating token...");
	let body = await request.json();
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
				let ip = getClientAddress();
				if (token === env.ADMIN_TOKEN) {
					console.info(`ADMIN TOKEN USED BY ${ip}`);
					let info = {
						name: "admin",
						uid: "-1",
						email: "admin@oispahalla.com",
						email_verified: true,
						picture: ""
					};
					return json$1({
						message: "auth ok",
						info
					});
				}
			} else {
				console.warn("ADMIN_TOKEN not set!");
			}

			let result = await getAuth(app).verifyIdToken(token);
			let info = {
				name: result.name,
				uid: result.uid,
				email: result.email,
				email_verified: result.email_verified,
				picture: result.picture
			};
			console.info("Token valid.");
			console.info("\tuid", info.uid);
			console.info("\temail_verified:", info.email_verified);
			if (result.firebase.sign_in_provider === "password" && !result.email?.endsWith("@ksyk.fi")) {
				return json$1(
					{
						message: "invalid email"
					},
					{
						status: 403
					}
				);
			}
			return json$1({
				message: "auth ok",
				info
			});
		} catch (e) {
			console.warn("Invalid token!");
			console.warn("Auth error:", e);
			return json$1(
				{
					message: "invalid token"
				},
				{
					status: 403
				}
			);
		}
	}
}
