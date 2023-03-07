import { writable, type Writable } from "svelte/store";

export const ready = writable(false);
export const wasm: Writable<typeof import("twothousand-forty-eight") | null> = writable(null);

export const validation_cache = {};

export async function init() {
	console.info("trying to import wasm...");
	wasm.set(await import("twothousand-forty-eight"));
	console.info("wasm imported");
	ready.set(true);
}
