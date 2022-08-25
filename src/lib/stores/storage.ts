import { type Writable, writable, get } from 'svelte/store';
import { browser } from '$app/env';

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
function update_storage_from_localstorage() {
	let data = localStorage.data;
	if (data == null) {
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
	} else {
		storage.set(JSON.parse(localStorage.data));
	}
}

if (browser) {
	update_storage_from_localstorage();
	/* window.addEventListener('storage', function(event){
        update_storage_from_localstorage();
    }, false); */
}

storage.subscribe((data) => {
	if (browser) {
		let backup = localStorage.data;
		try {
			if (data) {
				for (let key of Object.keys(data)) {
					let existing_raw_data = localStorage.data;
					let existing_data = existing_raw_data == null ? {} : JSON.parse(existing_raw_data);
					let new_data = {
						...(existing_data || {}),
						[key]: data[key]
					};

					let new_json = JSON.stringify(new_data);
					if (localStorage.data !== new_json) {
						localStorage.data = new_json;
					}
				}
			}
		} catch (e) {
			console.warn("Couldn't update storage", e);
			localStorage.data = backup;
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
