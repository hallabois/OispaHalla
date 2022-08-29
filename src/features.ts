import { dev as vite_dev, browser } from "$app/environment";

export const enable_multiplayer = vite_dev && browser;
export const enable_leaderboards = browser;
export const enable_custom_themes = vite_dev;
export const enable_countdown = !vite_dev;