import { get, writable, type Writable } from "svelte/store";
import type { CompleteValidationResult, GameState, ParseResult } from "twothousand-forty-eight";

export const ready = writable(false);
export const success: Writable<boolean | null> = writable(null);
export const wasm: Writable<typeof import("twothousand-forty-eight") | null> = writable(null);

export const validation_cache: Writable<{
	[key: string]: CompleteValidationResult | null;
}> = writable({});

export const gamestate_from_recording_cache: Writable<Map<ParseResult, GameState>> = writable(
	new Map()
);
export function get_gamestate_from_recording_cached(
	wasm: typeof import("twothousand-forty-eight"),
	recording: ParseResult
) {
	const cached = get(gamestate_from_recording_cache).get(recording);
	if (cached) {
		return cached;
	}
	const result = wasm.get_gamestate_from_recording(recording);
	gamestate_from_recording_cache.update((cache) => cache.set(recording, result));
	return result;
}

export const deserialize_cache: Writable<Map<string, ParseResult>> = writable(new Map());
export function deserialize_cached(wasm: typeof import("twothousand-forty-eight"), run: string) {
	const cached = get(deserialize_cache).get(run);
	if (cached) {
		return cached;
	}
	const result = wasm.deserialize(run);
	deserialize_cache.update((cache) => cache.set(run, result));
	return result;
}

export const serialize_cache: Writable<Map<ParseResult, string>> = writable(new Map());
export function serialize_cached(wasm: typeof import("twothousand-forty-eight"), run: ParseResult) {
	const cached = get(serialize_cache).get(run);
	if (cached) {
		return cached;
	}
	const result = wasm.serialize(run);
	serialize_cache.update((cache) => cache.set(run, result));
	return result;
}

export async function init() {
	if (get(success)) {
		return;
	}
	ready.set(false);
	success.set(null);
	console.info("trying to import wasm...");
	try {
		wasm.set(await import("twothousand-forty-eight"));
		console.info("wasm imported");
		success.set(true);
	} catch (e) {
		console.error("Failed to import wasm", e);
		success.set(false);
	}
	ready.set(true);
}
