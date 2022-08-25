import { get } from "svelte/store";
import { storage, getItem, setItem } from "./stores/storage";
import { browser } from "$app/env";

function getAllItems() {
    return get(storage);
}

function setLocalStorage(data: string) {
    let parsed = JSON.parse(data);
    console.info("Clearing localstorage...");
    localStorage.clear();
    console.info("Updating localstorage...");
    for(let k of Object.keys(parsed)) {
        localStorage.setItem(k, parsed[k]);
    }
    console.info("Localstorage operation ready, have a nice day.");
}

if(browser) {
    window.devtools = {
        setItem,
        getItem,
        getAllItems,
        setLocalStorage
    }
}