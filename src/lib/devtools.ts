import { get } from "svelte/store";
import { storage, getItem, setItem } from "./stores/storage";
import { browser } from "$app/env";

function getAllItems() {
    return get(storage);
}

if(browser) {
    window.devtools = {
        setItem,
        getItem,
        getAllItems
    }
}