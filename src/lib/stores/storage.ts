import { type Writable, writable, get } from "svelte/store";
import { browser } from "$app/environment";
import { TAB_BLOCK } from "$lib/session_manager";
import * as localforage from "localforage";
import { get_user_db } from "$lib/Firestore/db";
import { auth } from "$lib/Auth/authstore";
import { enable_sync } from "$lib/config";

export async function getWholeLocalForage() {
	let composite = {};
	await localforage.iterate(function (value, key) {
		composite = {
			...composite,
			[key]: value
		};
	});
	return composite;
}

type KeyValueMap = { [key: string]: unknown };

export const storage: Writable<KeyValueMap> = writable({});
const _superset = storage.set;
storage.set = (value: KeyValueMap) => {
	_superset({
		...value,
		__updated_ms: new Date().getTime()
	});
};
export const storage_loaded: Writable<boolean> = writable(false);
export const storage_status: Writable<string | null> = writable(null);
export const storage_version = writable({});
export async function update_storage_from_localstorage() {
	storage_loaded.set(false);
	storage_status.set("Tarkistetaan tallennustilaa...");
	console.log("Loading storage...");
	const flag = await localforage.getItem("__updated_ms");
	if (flag == null && localStorage.data == null) {
		console.info("Migrating localstorage...");
		storage_status.set("Muutetaan tallennustilaa uuteen muotoon...");
		const data: KeyValueMap = {};
		for (const k of Object.keys(localStorage)) {
			const oregano = localStorage[k];
			let parsed = oregano;
			try {
				parsed = JSON.parse(oregano);
			} catch (e) {
				console.error(e);
			}
			data[k] = parsed;
		}
		storage.set(data);
		for (const k of Object.keys(data)) {
			if (k !== "backup" && k !== "lastSession") {
				delete localStorage[k];
			}
		}
	} else if (localStorage.data != null) {
		console.info("Migrating localstoragev2...");
		storage_status.set("Muutetaan tallennustilaa uuteen muotoon (2)...");
		storage.set(JSON.parse(localStorage.data));
		localStorage.backup = localStorage.data;
		delete localStorage.data;
	} else {
		storage_status.set("Ladataan tallennustilaa...");
		const composite = await getWholeLocalForage();
		storage.set({
			...get(storage),
			...composite
		});
	}
	console.log("Storage loaded.");
	storage_loaded.set(true);
	storage_status.set(null);
	storage_version.set({});
	setItem("123", true);
}

if (browser) {
	update_storage_from_localstorage();
	/* window.addEventListener('storage', function(event){
        update_storage_from_localstorage();
    }, false); */
}

storage.subscribe(async (data) => {
	if (browser) {
		try {
			if (data) {
				if (!get(storage_loaded)) {
					return;
				}
				if (get(TAB_BLOCK)) {
					// alert("Peliä ei tallenneta, kunnes muut välilehdet suljetaan");
					console.error("Refusing to write data as multiple tabs are open!");
					return;
				}
				const local_ts = (data.__updated_ms as number | null) || 0;
				const external_ts: number = (await localforage.getItem("__updated_ms")) || 0;
				if (external_ts > local_ts) {
					console.error("refusing to write expired changes to storage.", local_ts, external_ts);
					return;
				}

				const localHash = JSON.stringify({ ...data, __updated_ms: 0 }, null, 4);
				const externalHash = JSON.stringify(
					{ ...(await getWholeLocalForage()), __updated_ms: 0 },
					null,
					4
				);

				if (localHash !== externalHash) {
					for (const key of Object.keys(data)) {
						await localforage.setItem(key, data[key]);
					}
				}
			}

			if (data && enable_sync) {
				const $auth = get(auth);
				if ($auth != null) {
					const db = get_user_db($auth.uid);
					if (get(db)) {
						db.uploadStorage(data);
					}
				}
			}
		} catch (e) {
			console.error("Couldn't update storage", e);
		}
	} else {
		// console.info("Skipping localstorage operations outside browser...");
	}
});

export function setItem(key: string, value: unknown) {
	console.log(key, "=", value);
	const data = get(storage);
	data[key] = value;
	storage.set(data);
}

export function getItem<T>(key: string): T | undefined {
	const items = get(storage);
	return items[key] as T;
}

export function clearStorage() {
	storage.set({});
	localforage.clear().then(() => {
		console.info("Localforage cleared.");
	});
}
