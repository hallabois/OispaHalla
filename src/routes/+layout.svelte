<script lang="ts">
	import "../style/base.scss";
	import "$lib/devtools";
	import PopupScrolllock from "$lib/components/common/popup/popup_scrolllock.svelte";
	import LoadingIndicator from "$lib/components/common/loading-indicator/LoadingIndicator.svelte";
	import { storage_version } from "$lib/stores/storage";
	import { theme_index } from "$lib/stores/themestore";
	import { enable_countdown } from "../features";
	import { browser } from "$app/environment";
	import Analytics from "$lib/components/analytics/analytics.svelte";
	import Pwa from "$lib/components/common/pwa.svelte";

	import type { LayoutData } from "./$types";
	export let data: LayoutData;
	$: ({ theme_override } = data);

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
			}
		}, 1000);
	}
</script>

<Pwa />
<LoadingIndicator />
<PopupScrolllock />

{#if !launched}
	<div class="countdown-div">
		<h1 class="title" style="color:#e6d2bf">OispaHalla</h1>
		<span class="countdown">{dateToLaunch}</span>
	</div>
{:else}
	{#key $storage_version}
		<slot />
	{/key}
{/if}

<Analytics />
