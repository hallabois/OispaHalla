import type GameManager from "$lib/gamelogic/game_manager";
import { type Writable, writable } from "svelte/store";

export let game_manager: Writable<GameManager | null> = writable(null);
