import { readable } from "svelte/store";
import { browser } from "$app/environment";
import type { DocumentReference, DocumentSnapshot } from "firebase/firestore";
import type { FirebaseApp } from "firebase/app";

let dbs: { [key: string]: object } = {};

export const createDB = (
	collection: string,
	document: string,
	app_config: FirebaseApp | null = null
) => {
	let dbRef: DocumentReference;

	const { subscribe } = readable<DocumentSnapshot | null>(undefined, (set) => {
		let unsubscribe = () => {};

		async function listen() {
			if (browser) {
				const { app } = await import("$lib/Auth/firebase_config");
				const { doc, onSnapshot, getFirestore, getDoc } = await import("firebase/firestore");

				const db = getFirestore(app_config || app);

				dbRef = doc(db, collection, document);

				let documentExists = (await getDoc(dbRef)).exists();
				if (!documentExists) {
					await activateAccount();
				}

				//return getDoc(dbRef);
				unsubscribe = onSnapshot(dbRef, set);
			} else {
				set(null);
			}
		}

		listen();

		return () => unsubscribe();
	});

	async function addReadPSA(psa_id: number) {
		const { getDoc, setDoc } = await import("firebase/firestore");
		let d = await getDoc(dbRef);
		let data = d.data() || {};
		let old_read_psa = data.read_psa || [];

		await setDoc(dbRef, {
			...data,
			read_psa: [...old_read_psa, psa_id]
		});
	}

	async function activateAccount() {
		console.info("Activating account...");
		const { getDoc, setDoc } = await import("firebase/firestore");
		let d = await getDoc(dbRef);
		let data = d.data() || {};
		await setDoc(dbRef, data);
		console.info("Account activated.");
	}

	async function server_setPSA(index: number, content: string) {
		const { getDoc, setDoc } = await import("firebase/firestore");
		let d = await getDoc(dbRef);
		let data = d.data() || {};
		let old_content = data.content || {};
		await setDoc(dbRef, {
			...data,
			content: {
				...old_content,
				[index]: content
			}
		});
	}

	return {
		subscribe,
		activateAccount,
		addReadPSA,

		server_setPSA
	};
};

export function get_db(uid: string) {
	if (Object.keys(dbs).includes(uid)) {
		return dbs[uid];
	}
	let userdb = createDB("user", uid);
	dbs[uid] = userdb;
	return userdb;
}

export const PSA = createDB("global", "PSA");
