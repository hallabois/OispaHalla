import { writable, type Writable } from "svelte/store";

export const ready = writable(false);
export const success: Writable<boolean | null> = writable(null);
export const wasm: Writable<typeof import("twothousand-forty-eight") | null> = writable(null);

export type ValidationData = {
	Ok?: {
		valid: boolean;
		score: number;
		score_end: number;
		score_margin: number;
		breaks: number;
		break_positions: number[];
	};
};
export const validation_cache: Writable<{
	[key: string]: {
		[key: number]: ValidationData | null;
	};
}> = writable({});

export async function init() {
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
