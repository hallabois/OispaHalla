import { app } from "$lib/Auth_admin/auth.server";
import { getFirestore } from "firebase-admin/firestore";

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, setHeaders, params, url }) {
	console.info("PSAS requested");
	let db = getFirestore(app);
	let ref = db.doc("global/PSA");
	let document = await ref.get();
	let data = document.data() || {};
	let content = data.content || {};

	return {
		content
	};
}
