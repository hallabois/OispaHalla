import { dev, browser } from "$app/env";

export const enable_multiplayer = browser && dev;
export const enable_leaderboards = true;