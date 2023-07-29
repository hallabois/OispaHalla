/// <reference types="svelte-gestures" />
declare let __APP_VERSION__: string;
declare let __APP_BRANCH__: string;
declare module "svelte-tiny-linked-charts";
declare module "hilbert-curve" {
	export function pointToIndex(point: { x: number; y: number }, order: number): number;
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}
