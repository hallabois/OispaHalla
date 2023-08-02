<script>
	import { browser, dev } from "$app/environment";
	import Sentry from "./Sentry.svelte";
</script>

{#if browser && !dev}
	<Sentry />
{/if}
