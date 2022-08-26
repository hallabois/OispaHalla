import { browser } from '$app/env';
import { type Writable, writable, get } from 'svelte/store';

import { setItem, getItem } from '$lib/stores/storage';

export let defaultTheme = 5;
export function setDefaultTheme(theme: number) {
	defaultTheme = theme;
}
export let currentImageThemeVersion = 6;

export let theme_index: Writable<number> = writable(defaultTheme);
export let theme_loaded = false;
theme_index.subscribe((themeID) => {
	// Save choice to localstorage
	try {
		if (theme_loaded) {
			setItem('imageTheme', themeID);
			setItem('imageThemeLastVersion', currentImageThemeVersion);
		}
	} catch {}
	if (browser) {
		// Save choice as a cookie
		try {
			document.cookie = `theme=${themeID};SameSite=None;secure=true;expires=Fri, 31 Dec 9999 23:59:59 GMT"max-age=31536000;path=/;`;
		} catch {}
		// Apply theme
		let html = document.querySelector('html');
		if (html) {
			html.setAttribute('class', 'theme-' + themeID);
		}
	}
	theme_loaded = true;
});
export let base_path: Writable<string> = writable('');

export function get_base_path(): string {
	return get(base_path);
}

// Load theme from storage
if (browser) {
	if (getItem('imageTheme') != null) {
		if (
			getItem('imageThemeLastVersion') &&
			getItem('imageThemeLastVersion') == currentImageThemeVersion
		) {
			theme_index.set(+getItem('imageTheme'));
		} else {
			theme_index.set(defaultTheme);
		}
	} else {
		theme_index.set(defaultTheme);
	}
}