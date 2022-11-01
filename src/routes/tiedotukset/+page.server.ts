import { json as json$1 } from "@sveltejs/kit";
import { app } from "$lib/Auth_admin/auth.server";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";
import { getFirestore } from "firebase-admin/firestore";


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
