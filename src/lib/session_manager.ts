import { browser } from "$app/environment";

export let tabID = browser
	? sessionStorage.tabID
		? sessionStorage.tabID
		: (sessionStorage.tabID = Math.random())
	: -1.0;

function unregisterTabID() {
	if (browser) {
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
