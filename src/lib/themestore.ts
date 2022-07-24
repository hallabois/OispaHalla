import { browser } from "$app/env";
import { type Writable, writable, get } from "svelte/store";

export let defaultTheme = 1;
export let currentImageThemeVersion = 5;

export let theme_index: Writable<number> = writable(defaultTheme);
export let theme_loaded = false;
theme_index.subscribe((themeID) => {
    if(browser) {
        // Save choice to localstorage
        try {
            if(theme_loaded) {
                localStorage.imageTheme = themeID;
            }
        }catch{}
        // Apply theme
        let html = document.querySelector("html");
        if(html) {
            html.classList = ["theme-" + themeID];
        }
        theme_loaded = true;
    }
})
export let base_path: Writable<string> = writable("");

export function get_base_path(): string {
    return get(base_path);
}

// Load theme from storage
if(browser) {
    if(localStorage.imageTheme){
        if(localStorage.imageThemeLastVersion && localStorage.imageThemeLastVersion == currentImageThemeVersion){
            theme_index.set(+localStorage.imageTheme);
        }
        else{
            theme_index.set( defaultTheme );
        }
    }
    else{
        theme_index.set( defaultTheme );
    }
}