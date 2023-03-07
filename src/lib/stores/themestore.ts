import { browser } from "$app/environment";
import { type Writable, writable, get } from "svelte/store";

import { setItem, getItem, storage_loaded } from "$lib/stores/storage";

export let defaultTheme = 4;
export function setDefaultTheme(theme: number) {
	defaultTheme = theme;
}
export const currentImageThemeVersion = 6;

export const theme_index: Writable<number> = writable(defaultTheme);
export const theme_loaded: Writable<boolean> = writable(false);
export const festives_applied: Writable<string[]> = writable([]);
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
		} catch (e) {
			console.warn("Failed to save theme as cookie: ", e);
		}
		// Apply theme
		const html = document.querySelector("html");
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
export const base_path: Writable<string> = writable("");

export function get_base_path(): string {
	return get(base_path);
}

// Load theme from storage
storage_loaded.subscribe(($storage_loaded) => {
	if ($storage_loaded) {
		console.log("Loading theme...");
		const localtheme = getItem("imageTheme");
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

		const festives = getItem("festives_applied");
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
const default_manifest: theme_manifest = {
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
const classic = {
	name: "Classic",
	index: 16,
	icon_url: "/img/theme-16/2048.webp",
	style: "background: transparent;",
	manifest: default_manifest
};
export const available_themes: Writable<Array<Theme>> = writable([
	{
		name: "Kaunis",
		index: 5,
		icon_url: "/img/theme-4/cover.webp",
		style: "background: #8cc4e3;",
		manifest: default_manifest
	},
	{
		name: "Kaunis (tumma)",
		index: 4,
		icon_url: "/img/theme-4/cover.webp",
		style: "background: #001522;",
		manifest: default_manifest
	},
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
const spooktober: Holiday = {
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
		style: "background: #001522;",
		manifest: default_manifest
	}
};
const xmas: Holiday = {
	min: {
		month: 12,
		date: 1
	},
	max: {
		month: 12,
		date: 31
	},
	theme: {
		name: "Joulu",
		index: 3,
		icon_url: "/img/theme-3/2048.webp",
		style: "background: #001522;",
		manifest: default_manifest
	}
};
const holidays: Holiday[] = [spooktober, xmas];

function removeHolidayThemeFromUse(t: theme) {
	available_themes.set(get(available_themes).filter((t2) => t2.index !== t.index));
	if (get(theme_index) === t.index) {
		theme_index.set(defaultTheme);
	}
}

theme_loaded.subscribe(($theme_loaded) => {
	if ($theme_loaded) {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		const day = now.getDate();
		for (const holiday of holidays) {
			const festive_hash = `${holiday.theme.index}_${year}`;
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
