import { browser } from "$app/environment";
import { writable, type Writable } from "svelte/store";

export let ready = writable(false);
export let wasm: Writable<typeof import("twothousand-forty-eight") | null> = writable(null);

export let validation_cache = {};

export async function init() {
	console.info("trying to import wasm...");
	wasm.set(await import("twothousand-forty-eight"));
	console.info("wasm imported");
	ready.set(true);
}
