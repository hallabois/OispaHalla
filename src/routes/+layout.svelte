<script lang="ts">
	import "../style/base.scss";
	import "$lib/devtools";
	import PopupScrolllock from "$lib/components/common/popup/popup_scrolllock.svelte";
	import LoadingIndicator from "$lib/components/common/loading-indicator/LoadingIndicator.svelte";
	import { storage_version } from "$lib/stores/storage";
	import Countdown from "$lib/components/countdown.svelte";
	import Analytics from "$lib/components/analytics/analytics.svelte";
	import Pwa from "$lib/components/common/pwa.svelte";
</script>

<Pwa />
<LoadingIndicator />
<PopupScrolllock />

<Countdown>
	{#key $storage_version}
		<slot />
	{/key}
</Countdown>

<Analytics />
