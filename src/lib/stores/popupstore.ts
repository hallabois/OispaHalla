import { type Writable, writable } from "svelte/store";

export const open_popups: Writable<object[]> = writable([]);
