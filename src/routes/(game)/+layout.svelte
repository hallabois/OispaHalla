<script lang="ts">
	import { TAB_BLOCK, take_ownership, initCTMBlock, destroyCTMBlock } from "$lib/session_manager";

	import "../../style/base.scss";
	import "../../style/game.scss";
	import "$lib/devtools";
	import PopupScrolllock from "$lib/components/common/popup/popup_scrolllock.svelte";
	import LoadingIndicator from "$lib/components/common/loading-indicator/LoadingIndicator.svelte";
	import { storage_version } from "$lib/stores/storage";
	import Analytics from "$lib/components/analytics/analytics.svelte";
	import Pwa from "$lib/components/common/pwa.svelte";
	import ChromiumCachePreventer from "$lib/components/common/chromium-cache-preventer.svelte";
	import { onDestroy, onMount } from "svelte";
	import Seo from "$lib/components/seo.svelte";

	onMount(() => {
		initCTMBlock();
	});

	onDestroy(() => {
		destroyCTMBlock();
	});
</script>

<Seo />

<Pwa />
<ChromiumCachePreventer />
<LoadingIndicator />
<PopupScrolllock />

{#if $TAB_BLOCK}
	<div class="ctmblock-div blurry-bg">
		<h1>Sulje muut välilehdet</h1>
		<p style="padding-bottom:1em;text-align:center;">
			OispaHallaa voi pelata vain yhdessä välilehdessä kerrallaan.
		</p>
		<button class="button action-btn" on:click={take_ownership}>Pelaa tässä</button>
	</div>
{:else}
	{#key $storage_version}
		<slot />
	{/key}
{/if}

<Analytics />

<style lang="scss">
	.ctmblock-div {
		min-height: 100vh;
		min-height: 100svh;
		background-attachment: fixed;

		display: flex;
		justify-content: center;
		text-align: center;
		align-items: center;
		flex-direction: column;

		* {
			margin: 0;
		}
	}
</style>
