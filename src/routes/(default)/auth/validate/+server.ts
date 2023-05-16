import { json as json$1, type RequestHandler } from "@sveltejs/kit";
import { getAuth } from "firebase-admin/auth";
import { app } from "$lib/Auth_admin/auth.server";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";

export const prerender = false;

function get_admins() {
	if (env.OH_ADMIN_EMAIL_LIST) {
		const emails = env.OH_ADMIN_EMAIL_LIST.split(";");
		return emails;
	}
	return [];
}

export const POST = (async ({ request, getClientAddress }) => {
	console.info("Validating token...");
	const admin_emails = get_admins();
	const body = await request.json();
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
		const token = body.token;

		console.info("token validation request headers:", request.headers);
		try {
			if (env.ADMIN_TOKEN) {
				const ip = getClientAddress();
				if (token === env.ADMIN_TOKEN) {
					console.info(`ADMIN TOKEN USED BY ${ip}`);
					const info = {
						name: "admin",
						uid: "::admin::",
						email: "admin@oispahalla.com",
						email_verified: true,
						admin: true,
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

			const result = await getAuth(app).verifyIdToken(token);
			const verified_email = result.email_verified
				? result.email || "no-email"
				: "unverified-email";
			const info = {
				name: result.name,
				uid: result.uid,
				email: result.email,
				email_verified: result.email_verified,
				picture: result.picture,
				admin: admin_emails.includes(verified_email)
			};
			console.info("Token valid.");
			console.info("\tuid", info.uid);
			console.info("\temail_verified:", info.email_verified);
			if (!dev && !info.admin) {
				if (
					result.firebase.sign_in_provider === "password" &&
					!result.email?.endsWith("@ksyk.fi")
				) {
					return json$1(
						{
							message: "invalid email"
						},
						{
							status: 403
						}
					);
				}
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
}) satisfies RequestHandler;
