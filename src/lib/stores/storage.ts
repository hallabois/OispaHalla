import { type Writable, writable, get } from "svelte/store";
import { browser } from "$app/environment";
import { TAB_BLOCK } from "$lib/session_manager";
import localforage from "localforage";

export async function getWholeLocalForage() {
	let composite = {};
	await localforage.iterate(function (value, key, _iterationNumber) {
		composite = {
			...composite,
			[key]: value
		};
	});
	return composite;
}

type KeyValueMap = { [key: string]: any };

export let storage: Writable<KeyValueMap> = writable({});
let _superset = storage.set;
storage.set = (value: KeyValueMap) => {
	_superset({
		...value,
		__updated_ms: new Date().getTime()
	});
};
export let storage_loaded: Writable<boolean> = writable(false);
export let storage_status: Writable<string | null> = writable(null);
export let storage_version: Writable<Object> = writable({});
async function update_storage_from_localstorage() {
	storage_loaded.set(false);
	storage_status.set("Tarkistetaan tallennustilaa...");
	console.log("Loading storage...");
	let flag = await localforage.getItem("__updated_ms");
	if (flag == null && localStorage.data == null) {
		console.info("Migrating localstorage...");
		storage_status.set("Muutetaan tallennustilaa uuteen muotoon...");
		let data: KeyValueMap = {};
		for (let k of Object.keys(localStorage)) {
			let oregano = localStorage[k];
			let parsed = oregano;
			try {
				parsed = JSON.parse(oregano);
			} catch (e) {
				console.warn(e);
			}
			data[k] = parsed;
		}
		storage.set(data);
		for (let k of Object.keys(data)) {
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
		let composite = await getWholeLocalForage();
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
	update_storage_from_localstorage().then(() => {});
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
					console.warn("Refusing to write data as multiple tabs are open!");
					return;
				}
				let local_ts: number = data.__updated_ms || 0;
				let external_ts: number = (await localforage.getItem("__updated_ms")) || 0;
				if (external_ts > local_ts) {
					console.warn("refusing to write expired changes to storage.", local_ts, external_ts);
					return;
				}

				let localHash = JSON.stringify({ ...data, __updated_ms: 0 }, null, 4);
				let externalHash = JSON.stringify(
					{ ...(await getWholeLocalForage()), __updated_ms: 0 },
					null,
					4
				);

				if (localHash !== externalHash) {
					console.log("Updating storage...");
					for (let key of Object.keys(data)) {
						await localforage.setItem(key, data[key]);
					}
					console.log("Storage updated.");
				}
			}
		} catch (e) {
			console.warn("Couldn't update storage", e);
		}
	} else {
		// console.info("Skipping localstorage operations outside browser...");
	}
});

export function setItem(key: string, value: any) {
	let data = get(storage);
	data[key] = value;
	storage.set(data);
}

export function getItem(key: string): any {
	let items = get(storage);
	return items[key];
}

export function clearStorage() {
	storage.set({});
	localforage.clear().then(() => {
		console.info("Localforage cleared.");
	});
}
