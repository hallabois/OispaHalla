import { browser } from "$app/environment";
import { type Writable, writable, get } from "svelte/store";

import { setItem, getItem, storage_loaded } from "$lib/stores/storage";

export let defaultTheme = 4;
export function setDefaultTheme(theme: number) {
	defaultTheme = theme;
}
export let currentImageThemeVersion = 6;

export let theme_index: Writable<number> = writable(defaultTheme);
export let theme_loaded: Writable<boolean> = writable(false);
export let festives_applied: Writable<string[]> = writable([]);
theme_index.subscribe((themeID) => {
	if (!get(storage_loaded)) {
		return; // Overwriting at this point would always cause the default theme to load
	}
	console.info("theme changed to", themeID);
	// Save choice to localstorage
	try {
		setItem("imageTheme", themeID);
		setItem("imageThemeLastVersion", currentImageThemeVersion);
	} catch (e) {
		console.warn("Failed to save theme preference", e);
	}
	if (browser) {
		// Save choice as a cookie
		try {
			document.cookie = `theme=${themeID};SameSite=None;secure=true;expires=Fri, 31 Dec 9999 23:59:59 GMT"max-age=31536000;path=/;`;
		} catch {}
		// Apply theme
		let html = document.querySelector("html");
		if (html) {
			html.setAttribute("class", "theme-" + themeID);
		}
	}
});
festives_applied.subscribe((festives) => {
	if (!get(storage_loaded)) {
		return;
	}
	try {
		setItem("festives_applied", festives);
	} catch (e) {
		console.warn("Failed to save applied festives", e);
	}
});
export let base_path: Writable<string> = writable("");

export function get_base_path(): string {
	return get(base_path);
}

// Load theme from storage
storage_loaded.subscribe(($storage_loaded) => {
	if ($storage_loaded) {
		console.log("Loading theme...");
		let localtheme = getItem("imageTheme");
		if (localtheme != null) {
			console.log(`found an existing prefer for theme ${localtheme}`);
			if (
				getItem("imageThemeLastVersion") &&
				getItem("imageThemeLastVersion") == currentImageThemeVersion
			) {
				theme_index.set(+localtheme);
			} else {
				theme_index.set(defaultTheme);
			}
		} else {
			theme_index.set(defaultTheme);
		}
		console.info(`Loaded theme ${get(theme_index)}.`);

		let festives = getItem("festives_applied");
		if (festives != null) {
			festives_applied.set(festives);
		} else {
			festives_applied.set([]);
		}
		theme_loaded.set(true);
	}
});

class theme_manifest {
	name!: string;
	description!: string;
}
let default_manifest: theme_manifest = {
	name: "Oispa Halla",
	description: "Yhdistä opettajat ja saavuta **Halla!**"
};
class theme {
	name!: string;
	index!: number;
	icon_url!: string;
	style!: string;
	manifest!: theme_manifest;
}
class theme_custom {
	name!: string;
	index!: number;
	theme_url!: string;
	icon_url!: string;
	style!: string;
	manifest!: theme_manifest;
}
export type Theme = theme | theme_custom;
let classic = {
	name: "Classic",
	index: 16,
	icon_url: "/img/theme-16/2048.webp",
	style: "background: transparent;",
	manifest: default_manifest
};
export let available_themes: Writable<Array<Theme>> = writable([
	{
		name: "OispaHalla",
		index: 1,
		icon_url: "/img/raksahalla_192.webp",
		style: "background: white;",
		manifest: default_manifest
	},
	{
		name: "OispaHalla (tumma)",
		index: 0,
		icon_url: "/img/raksahalla_192.webp",
		style: "background: black;",
		manifest: default_manifest
	},
	classic
]);

let kaunis = {
	name: "Kaunis",
	index: 5,
	icon_url: "/img/theme-4/cover.webp",
	style: "background: #8cc4e3;",
	manifest: default_manifest
};
let kaunis_dark = {
	name: "Kaunis (tumma)",
	index: 4,
	icon_url: "/img/theme-4/cover.webp",
	style: "background: #001522;",
	manifest: default_manifest
};
if (true) {
	available_themes.set([kaunis, kaunis_dark, ...get(available_themes)]);
}

// Check for holidays
class Holiday {
	min!: {
		month: number;
		date: number;
	};
	max!: {
		month: number;
		date: number;
	};
	theme!: theme;
}
let spooktober: Holiday = {
	min: {
		month: 10,
		date: 10
	},
	max: {
		month: 10,
		date: 31
	},
	theme: {
		name: "Hallaween",
		index: 2,
		icon_url: "/img/theme-2/2048.webp",
		style: "background: #001522;"
	}
};
let xmas: Holiday = {
	min: {
		month: 12,
		date: 15
	},
	max: {
		month: 12,
		date: 31
	},
	theme: {
		name: "Joulu",
		index: 3,
		icon_url: "/img/theme-3/2048.webp",
		style: "background: #001522;"
	}
};
let holidays: Holiday[] = [spooktober, xmas];

function removeHolidayThemeFromUse(t: theme) {
	available_themes.set(get(available_themes).filter((t2) => t2.index !== t.index));
	if (get(theme_index) === t.index) {
		theme_index.set(defaultTheme);
	}
}

theme_loaded.subscribe(($theme_loaded) => {
	if ($theme_loaded) {
		let now = new Date();
		let year = now.getFullYear();
		let month = now.getMonth() + 1;
		let day = now.getDate();
		for (let holiday of holidays) {
			let festive_hash = `${holiday.theme.index}_${year}`;
			if (month > holiday.min.month || (month == holiday.min.month && day >= holiday.min.date)) {
				if (month < holiday.max.month || (month == holiday.max.month && day <= holiday.max.date)) {
					available_themes.set([...get(available_themes), holiday.theme]);
					if (!get(festives_applied).includes(festive_hash)) {
						theme_index.set(holiday.theme.index);
						festives_applied.set([...get(festives_applied), festive_hash]);
					}
				} else {
					removeHolidayThemeFromUse(holiday.theme);
				}
			} else {
				removeHolidayThemeFromUse(holiday.theme);
			}
		}
	}
});
