import { readable } from "svelte/store";
import { browser } from "$app/environment";
import type { DocumentReference, DocumentSnapshot } from "firebase/firestore";
import type { FirebaseApp } from "firebase/app";
import { synced_variables } from "../../features";

const dbs: { [key: string]: DB } = {};

export type DB = ReturnType<typeof createDB>;

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

				const documentExists = (await getDoc(dbRef)).exists();
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

	async function uploadStorage(storage: object) {
		const { getDoc, setDoc } = await import("firebase/firestore");
		const d = await getDoc(dbRef);
		const old_data = d.data() || {};

		const enabled_keys = synced_variables;
		const data = {};
		for (const k of Object.keys(storage)) {
			if (enabled_keys.includes(k)) {
				if (storage[k] != null) {
					data[k] = JSON.stringify(storage[k]);
				}
			}
		}

		if (JSON.stringify(old_data) !== JSON.stringify(data)) {
			await setDoc(dbRef, {
				...data
			});
		}
	}

	async function uploadGame(gamestate: Object) {
		console.info("trying to upload gamestate...");
		const { getDoc, setDoc } = await import("firebase/firestore");
		const d = await getDoc(dbRef);
		const old_data = d.data() || {};
		const old_gamedata = old_data.gamestate;
		if (old_gamedata) {
			throw new Error("Tried to upload gamestate, but old data was found!");
		}
		await setDoc(dbRef, {
			...old_data,
			gamestate: JSON.stringify(gamestate),
			__updated_ms: new Date().getTime()
		});
		console.info("gamestate uploaded!");
	}

	async function clearGame() {
		console.info("clearing remote gamestate...");
		const { updateDoc, deleteField } = await import("firebase/firestore");
		await updateDoc(dbRef, {
			gamestate: deleteField()
		});
		console.info("remote gamestate cleared!");
	}

	async function activateAccount() {
		console.info("Activating account...");
		const { getDoc, setDoc } = await import("firebase/firestore");
		const d = await getDoc(dbRef);
		const data = d.data() || {};
		await setDoc(dbRef, data);
		console.info("Account activated.");
	}

	async function server_setPSA(index: number, content: string) {
		const { getDoc, setDoc } = await import("firebase/firestore");
		const d = await getDoc(dbRef);
		const data = d.data() || {};
		const old_content = data.content || {};
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
		uploadGame,
		clearGame,

		server_setPSA
	};
}

export function get_user_db(uid: string): DB {
	if (Object.keys(dbs).includes(uid)) {
		return dbs[uid];
	}
	const userdb = createDB("user", uid);
	dbs[uid] = userdb;
	return userdb;
}

export const PSA = createDB("global", "PSA");
