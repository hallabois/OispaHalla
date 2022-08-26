import { type Writable, writable, get } from 'svelte/store';
import { browser } from '$app/env';
import localforage from 'localforage';

type KeyValueMap = { [key: string]: any };

export let storage: Writable<KeyValueMap> = writable({});
let _superset = storage.set;
storage.set = (value: KeyValueMap) => {
	let existing = get(storage);

	_superset({
		...value,
		__updated_ms: new Date().getTime()
	});
};
async function update_storage_from_localstorage() {
	let flag = await localforage.getItem("__updated_ms");
	if (flag == null && localStorage.data == null) {
		console.info('Migrating localstorage...');
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
			if (k !== 'backup' && k !== 'lastSession') {
				delete localStorage[k];
			}
		}
	} else if(localStorage.data != null) {
		console.info('Migrating localstoragev2...');
		storage.set(JSON.parse(localStorage.data));
	} else {
		localforage.iterate(function(value, key, _iterationNumber) {
			storage.set({
				...get(storage),
				[key]: value
			});
		});
	}
}

if (browser) {
	update_storage_from_localstorage().then(()=>{});
	/* window.addEventListener('storage', function(event){
        update_storage_from_localstorage();
    }, false); */
}

storage.subscribe(async (data) => {
	if (browser) {
		let backup = (await localforage.getItem("data") || {});
		try {
			if (data) {
				for (let key of Object.keys(data)) {
					await localforage.setItem(key, data[key]);
				}
				
			}
		} catch (e) {
			console.warn("Couldn't update storage", e);
			await localforage.setItem("data", {
				backup
			});
		}
	} else {
		console.info('Skipping localstorage operations outside browser...');
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
	console.info('Clearing storage...');
	delete localStorage.data;
	storage.set({});
}
