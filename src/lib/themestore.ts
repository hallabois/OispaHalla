import { type Writable, writable, get } from "svelte/store";

export let theme_index: Writable<number> = writable(1);
export let base_path: Writable<string> = writable("");

export function get_base_path(): string {
    return get(base_path);
}