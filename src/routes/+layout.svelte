<script lang="ts">
	import "$lib/devtools";

	import type { LayoutData } from "./$types";
	export let data: LayoutData;
	$: ({ theme_override } = data);

	import { TAB_BLOCK, take_ownership } from "$lib/session_manager";

	import "../app.scss";
	import PopupScrolllock from "$lib/components/common/popup/popup_scrolllock.svelte";
	import LoadingIndicator from "$lib/components/common/loading-indicator/LoadingIndicator.svelte";
	import { storage_version } from "$lib/stores/storage";
	import { theme_index } from "$lib/stores/themestore";
	import { enable_countdown } from "../features";
	import { browser, dev } from "$app/environment";
	//export let theme_override: number | null;
	if (theme_override != null) {
		console.info("Found theme override", theme_override);
		theme_index.set(theme_override);
	}

	let date = new Date();
	let launch = new Date(2022, 8, 29, 13, 33, 0, 0).getTime();
	let timeToLaunch = 1;
	$: if (launch && date) {
		timeToLaunch = new Date(launch - date.getTime()).getTime();
	}
	$: launched = date.getTime() >= launch || !enable_countdown;
	$: dateToLaunch = new Date(timeToLaunch).toLocaleTimeString("en-gb");

	$: if (browser && enable_countdown) console.log("Time to launch:", timeToLaunch);

	if (enable_countdown) {
		setInterval(() => {
			if (!launched) {
				date = new Date();
			} else {
			}
		}, 1000);
	}

	import * as Sentry from "@sentry/svelte";
	import { BrowserTracing } from "@sentry/tracing";
	import Preloader from "$lib/components/common/image-preloader/Preloader.svelte";
	if (browser && !dev) {
		// Initialize the Sentry SDK here
		Sentry.init({
			dsn: "https://b7328d8038d34d72b707bd9b3e98a9e9@o4503924795244544.ingest.sentry.io/4503924806516736",
			integrations: [new BrowserTracing({ tracingOrigins: ["*"] })],
			tracesSampleRate: 0.2
		});
	}
</script>

<LoadingIndicator />

{#if !launched}
	<div class="countdown-div">
		<h1 class="title" style="color:#e6d2bf">OispaHalla</h1>
		<span class="countdown">{dateToLaunch}</span>
	</div>
{:else if $TAB_BLOCK}
	<div class="ctmblock-div blurry-bg">
		<h1>Sulje muut välilehdet</h1>
		<p style="padding-bottom:1em;">OispaHallaa voi pelata vain yhdessä välilehdessä kerrallaan.</p>
		<button class="button action-btn" on:click={take_ownership}>Pelaa tässä</button>
	</div>
{:else}
	<PopupScrolllock />
	{#key $storage_version}
		<slot />
	{/key}
{/if}

<style lang="scss">
	.ctmblock-div {
		min-height: 100vh;
		background-attachment: fixed;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		* {
			margin: 0;
		}
	}
</style>
