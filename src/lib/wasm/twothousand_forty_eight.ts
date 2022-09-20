import { browser } from "$app/environment";
import { writable } from "svelte/store";

export let ready = writable(false);
export let wasm;

export let validation_cache = {};

async function init() {
    console.info("trying to import wasm...");
    wasm = await import("twothousand-forty-eight");
    console.info("wasm imported");
    console.info("wasm", wasm);
    try {
        await wasm.default();
    } catch (e) {
        console.warn("Failed to init wasm manually:", e);
    }
    ready.set(true);
};

if(browser) {
    init();
}