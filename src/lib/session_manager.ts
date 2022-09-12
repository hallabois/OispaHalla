import { browser } from "$app/environment";
import { get, writable } from "svelte/store";

export let tabID = 1.0;
let date_registered: number = 0;

function unregisterTabID() {
	if (browser) {
		nt.postMessage(new Date().getTime());
		if (localStorage) {
			if (localStorage.lastSession) {
				if (localStorage.lastSession == tabID) {
					delete localStorage.lastSession;
				}
			}
		}
	}
}

if (browser) {
	console.info("Session manager registered with the tab id", tabID);
	window.onpagehide = unregisterTabID;
	window.onbeforeunload = unregisterTabID;
}

export let TAB_BLOCK = writable(false);
let oldest_tab = 999999999999999;

let ctm_channel_sync = "crosstab_management_oh";
let ctm_close_key = -245;

let nt: BroadcastChannel;
if(browser) {
	date_registered = new Date().getTime();
	nt = new BroadcastChannel(ctm_channel_sync);
	nt.postMessage(date_registered); /* send */
	nt.onmessage = function (ev) {
		if(ev.data == ctm_close_key) {
			date_registered = new Date().getTime() + 9999999;
		}
		if(ev.data != date_registered){
			console.log("CTM sync", ev, date_registered);
			if(date_registered < ev.data) {
				console.log("We are the best!");
				nt.postMessage(date_registered);
				console.log("Tab lock ought to be removed...");
				/* if(get(TAB_BLOCK)) {
					location.reload();
				} */
			}
			else {
				TAB_BLOCK.set(true);
				console.log("Blocking this tab...");
			}
			oldest_tab = Math.min(oldest_tab, ev.data);
		}
	}
}

export async function take_ownership() {
	nt.postMessage(ctm_close_key);
	location.reload();
}