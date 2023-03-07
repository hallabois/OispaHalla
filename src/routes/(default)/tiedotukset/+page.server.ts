import { app } from "$lib/Auth_admin/auth.server";
import { getFirestore } from "firebase-admin/firestore";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load = (async () => {
	console.info("PSAS requested");
	const db = getFirestore(app);
	const ref = db.doc("global/PSA");
	const document = await ref.get();
	const data = document.data() || {};
	const content = data.content || {};

	return {
		content
	};
}) satisfies PageServerLoad;
