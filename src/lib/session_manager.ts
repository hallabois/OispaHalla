import { browser } from "$app/environment";
import { writable } from "svelte/store";

let date_registered = 0;

export function destroyCTMBlock() {
	if (browser) {
		nt.postMessage(new Date().getTime());
		if (localStorage) {
			if (localStorage.lastSession) {
				if (localStorage.lastSession == date_registered) {
					delete localStorage.lastSession;
				} else if (+localStorage.lastSession < date_registered) {
					delete localStorage.lastSession;
				}
			}
		}
		console.info("Session manager unregistered with the tab id", date_registered);
	}
}

export const TAB_BLOCK = writable(false);
let oldest_tab = 999999999999999;

const ctm_channel_sync = "crosstab_management_oh";
const ctm_close_key = -245;

let nt: BroadcastChannel;
export function initCTMBlock() {
	date_registered = new Date().getTime();

	console.info("Session manager registered with the tab id", date_registered);
	window.onpagehide = destroyCTMBlock;
	window.onbeforeunload = destroyCTMBlock;

	/* const storage_lock = +(localStorage.getItem("lastSession") || "9999999999999999999");
	if (storage_lock < date_registered) {
		TAB_BLOCK.set(true);
	} else {
		localStorage.setItem("lastSession", date_registered + "");
	} */
	nt = new BroadcastChannel(ctm_channel_sync);
	nt.postMessage(date_registered); /* send */
	nt.onmessage = function (ev) {
		if (ev.data == ctm_close_key) {
			date_registered = new Date().getTime() + 9999999;
		}
		if (ev.data != date_registered) {
			console.log("CTM sync", ev, date_registered);
			if (date_registered < ev.data) {
				console.log("We are the best!");
				nt.postMessage(date_registered);
				console.log("Tab lock ought to be removed...");
				localStorage.setItem("lastSession", date_registered + "");
				/* if(get(TAB_BLOCK)) {
					location.reload();
				} */
			} else {
				TAB_BLOCK.set(true);
				console.log("Blocking this tab...");
			}
			oldest_tab = Math.min(oldest_tab, ev.data);
		}
	};
}

export async function take_ownership() {
	nt.postMessage(ctm_close_key);
	location.reload();
}
