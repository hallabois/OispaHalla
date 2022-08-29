<script lang="ts">
	import "$lib/devtools";

	import type { LayoutData } from "./$types";
	export let data: LayoutData;
	$: ({ theme_override } = data);

	import "../app.scss";
	import PopupScrolllock from "$lib/components/common/popup/popup_scrolllock.svelte";
	import { theme_index } from "$lib/stores/themestore";
	import { enable_countdown } from "../features";
	import { browser } from "$app/environment";
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

	$: if (browser) console.log("Time to launch:", timeToLaunch);

	setInterval(() => {
		if (!launched) {
			date = new Date();
		} else {
			
		}
	}, 1000);
</script>

{#if !launched}
	<div class="countdown-div">
		<h1 class="title" style="color:#e6d2bf">OispaHalla</h1>
		<span class="countdown">{dateToLaunch}</span>
	</div>
{:else}
	<PopupScrolllock />
	<slot />
{/if}

<style lang="scss" global>
</style>
