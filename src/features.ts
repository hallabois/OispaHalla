import { dev as vite_dev, browser } from "$app/environment";

export const dev_branch = __APP_BRANCH__ == "testing";

export const enable_multiplayer = vite_dev || dev_branch;
export const enable_leaderboards = true;
export const enable_custom_themes = vite_dev;
export const enable_countdown = false;
export const enable_user_page_wasm = false;

export const enable_sync = false; // Setting this to true will wipe the users cloud saved games
export const synced_variables = ["read_psas", "imageTheme", "applied_festives", "__updated_ms"];

export const lb_test_prod_endpoint = true;
export const mp_test_prod_endpoint = true;
