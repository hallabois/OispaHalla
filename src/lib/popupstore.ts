import { type Writable, writable, get } from "svelte/store";

export let open_popups: Writable<any[]> = writable([]);