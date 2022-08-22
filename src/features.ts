import { dev as vite_dev, browser } from "$app/env";

export const enable_multiplayer = vite_dev && browser;
export const enable_leaderboards = browser;