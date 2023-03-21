import { writable, type Writable } from "svelte/store";

export const app_name_default = "Oispa Halla";
export const app_description_default = "Yhdistä opettajat ja saavuta **Halla!**";
export const app_notice_default = "";
export const app_name_newgame_default = "Uusi Jakso";
export const app_name_score_default = "arvosana";
export const app_name_hiscore_default = "paras halla";
export const defaultTheme: Writable<number> = writable(4);
