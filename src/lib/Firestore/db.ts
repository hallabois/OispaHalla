import { readable, type Readable } from "svelte/store";
import { browser } from "$app/environment";
import type { DocumentReference, DocumentSnapshot } from "firebase/firestore";
import type { FirebaseApp } from "firebase/app";
import { synced_variables } from "../../features";

let dbs: { [key: string]: DB } = {};

export type DB = ReturnType<createDB>;

export function createDB(
	collection: string,
	document: string,
	app_config: FirebaseApp | null = null
) {
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

	async function uploadStorage(storage: Object) {
		const { getDoc, setDoc } = await import("firebase/firestore");
		let d = await getDoc(dbRef);
		let old_data = d.data() || {};

		let enabled_keys = synced_variables;
		let data = {};
		for(let k of Object.keys(storage)) {
			if(enabled_keys.includes(k)) {
				if(storage[k] != null) {
					data[k] = JSON.stringify(storage[k]);
				}
			}
		}

		if(JSON.stringify(old_data) !== JSON.stringify(data)) {
			await setDoc(dbRef, {
				...data
			});
		}
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
		uploadStorage,

		server_setPSA
	};
}

export function get_db(uid: string): DB {
	console.info("DB requested for user ", uid);
	if (Object.keys(dbs).includes(uid)) {
		console.info("DB found in cache");
		return dbs[uid];
	}
	console.info("Creating DB...");
	let userdb = createDB("user", uid);
	dbs[uid] = userdb;
	console.info("DB Created", userdb);
	return userdb;
}

export const PSA = createDB("global", "PSA");
