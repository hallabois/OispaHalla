import { dev as vite_dev } from "$app/environment";
import { env } from "$env/dynamic/public";

export const dev_branch = __APP_BRANCH__ == "testing";

export const leaderboard_endpoint = env.OH_PUBLIC_LB_ENDPOINT || "https://lb.oispahalla.com";
export const mp_default_endpoint = env.OH_PUBLIC_MP_ENDPOINT || "wss://mp.oispahalla.com";

export const enable_multiplayer = vite_dev || dev_branch;
export const enable_leaderboards = true;
export const enable_custom_themes = vite_dev;

export const countdown: Date | undefined = env.OH_PUBLIC_COUNTDOWN
	? new Date(env.OH_PUBLIC_COUNTDOWN)
	: undefined;
export const countdown_message: string | undefined = env.OH_PUBLIC_COUNTDOWN_MESSAGE;
export const enable_user_page_wasm = false;

export const enable_sync = false; // Setting this to true will wipe the users cloud saved games
export const synced_variables = ["read_psas", "imageTheme", "applied_festives", "__updated_ms"];
