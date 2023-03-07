import admin from "firebase-admin";

import { env } from "$env/dynamic/private";

const clientEmail = env.OH_FIREBASE_ADMIN_CLIENT_EMAIL;
if (!clientEmail) {
	throw new Error("Env variable OH_FIREBASE_ADMIN_CLIENT_EMAIL missing!");
}

const privateKey = env.OH_FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!privateKey) {
	throw new Error("Env variable OH_FIREBASE_ADMIN_PRIVATE_KEY missing!");
} else if (!privateKey.includes("\n")) {
	throw new Error(
		"Please verify that your private key env variable preservers the original newlines!"
	);
}

const projectId = env.OH_FIREBASE_ADMIN_PROJECT_ID;
if (!projectId) {
	throw new Error("Env variable OH_FIREBASE_ADMIN_PROJECT_ID missing!");
}

const databaseURL = env.OH_FIREBASE_ADMIN_DATABASE_URL;
if (!databaseURL) {
	throw new Error("Env variable OH_FIREBASE_ADMIN_DATABASE_URL missing!");
}

export const app = admin.initializeApp({
	credential: admin.credential.cert({
		clientEmail,
		privateKey,
		projectId
	}),
	databaseURL
});

console.info("Firebase admin config imported");
