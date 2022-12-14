<script>
	import { dev } from "$app/environment";
	import Sentry from "./Sentry.svelte";
</script>

{#if !dev}
	<Sentry />
{/if}
