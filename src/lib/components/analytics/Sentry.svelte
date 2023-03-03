<script lang="ts">
	import * as Sentry from "@sentry/svelte";
	import { BrowserTracing } from "@sentry/tracing";
	import { onDestroy, onMount } from "svelte";
	async function initSentry() {
		Sentry.init({
			dsn: "https://b7328d8038d34d72b707bd9b3e98a9e9@o4503924795244544.ingest.sentry.io/4503924806516736",
			tracesSampleRate: 1.0,
			replaysSessionSampleRate: 1.0,
			replaysOnErrorSampleRate: 1.0,

			integrations: [new BrowserTracing({ tracingOrigins: ["*"] }), new Sentry.Replay()]
		});
	}
	async function initOnlyOneSentry() {
		// Initialize the Sentry SDK here
		try {
			let currentInstance = Sentry.getCurrentHub().getClient();
			if (currentInstance == null) {
				initSentry();
			}
		} catch (e) {
			console.warn("Failed to initialize sentry:", e);
		}
	}
	onMount(() => {
		initOnlyOneSentry();
	});
	onDestroy(() => {});
</script>
