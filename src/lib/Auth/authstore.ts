import { get, readable, writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";
import type { Auth, User } from "firebase/auth";
import { generateActionCodeSettings } from "./firebase_config";
import { getItem, setItem, storage_loaded } from "$lib/stores/storage";

const createAuth = () => {
	let auth: Auth;

	const { subscribe } = readable<User>(undefined, (set) => {
		let unsubscribe = () => {};

		async function listen() {
			if (browser) {
				const { app } = await import("./firebase_config");
				const { getAuth, onAuthStateChanged } = await import("firebase/auth");

				auth = getAuth(app);

				unsubscribe = onAuthStateChanged(auth, set);
			} else {
				set(null);
			}
		}

		listen();

		return () => unsubscribe();
	});

	async function providerFor(name: string) {
		const { GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider } = await import(
			"firebase/auth"
		);
		switch (name) {
			case "google":
				return new GoogleAuthProvider();
			case "github":
				return new GithubAuthProvider();
			case "twitter":
				return new TwitterAuthProvider();
			default:
				throw "unknown provider " + name;
		}
	}

	async function signInWith(name: string) {
		const { signInWithPopup } = await import("firebase/auth");
		const provider = await providerFor(name);
		await signInWithPopup(auth, provider);
	}

	async function sendSignInLink(email: string, origin: string) {
		const { sendSignInLinkToEmail } = await import("firebase/auth");
		try {
			await sendSignInLinkToEmail(auth, email, generateActionCodeSettings(origin));
			return true;
		} catch (e) {
			console.warn(e);
		}
		return false;
	}

	async function signInWithLink(email: string, href: string) {
		const { signInWithEmailLink } = await import("firebase/auth");
		try {
			await signInWithEmailLink(auth, email, href);
			return true;
		} catch (e) {
			console.warn(e);
		}
		return false;
	}

	async function signOut() {
		const { signOut } = await import("firebase/auth");
		clearTraces();
		await signOut(auth);
	}

	function clearTraces() {
		console.clear();
		console.info("Signed out, have a good day!");
		token.set(null);
		import("$lib/stores/leaderboardstore").then(({ lb_screenName }) => {
			lb_screenName.set(null);
		});
		// localStorage.clear(); // Not a good idea
	}

	return {
		subscribe,
		signInWith,
		sendSignInLink,
		signInWithLink,
		signOut
	};
};

export const token: Writable<null | string> = writable(null);
let token_refresh_timer: NodeJS.Timeout | null;
async function rewrite_token($auth: User) {
	console.log("Attempting to refresh token...");
	if ($auth != null) {
		const tk = await $auth.getIdToken();
		try {
			const tk_info = await $auth.getIdTokenResult();
			const time_till_exp =
				new Date(tk_info.expirationTime).getTime() - new Date(tk_info.authTime).getTime();
			console.info("time till token expiration", time_till_exp);
			token_refresh_timer = setTimeout(async () => {
				const $auth = get(auth);
				await rewrite_token($auth);
			}, time_till_exp / 100.0);
		} catch (e) {
			console.warn("Failed to set up automatic token refresh:", e);
		}

		token.set(tk);
	}
}
export const auth = createAuth();
if (browser) {
	auth.subscribe(async ($auth) => {
		if ($auth) {
			console.info("user id", $auth.uid);
			if (token_refresh_timer != null) {
				clearTimeout(token_refresh_timer);
			}
			await rewrite_token($auth);
			if (storage_loaded && $auth.uid) {
				const connected_accounts = getItem("connected_accounts") || [];
				if (!connected_accounts.includes($auth.uid)) {
					setItem("connected_accounts", [...connected_accounts, $auth.uid]);
				}
			}
		} else {
			if ($auth === undefined) {
				console.info("loading login details...");
			} else {
				console.info("not signed in");
			}
		}
	});
}
