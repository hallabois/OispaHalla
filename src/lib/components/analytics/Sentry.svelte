<script lang="ts">
	import { browser } from "$app/environment";
	import * as Sentry from "@sentry/svelte";
	import { BrowserTracing } from "@sentry/tracing";
	if (browser) {
		// Initialize the Sentry SDK here
		try {
			Sentry.init({
				dsn: "https://b7328d8038d34d72b707bd9b3e98a9e9@o4503924795244544.ingest.sentry.io/4503924806516736",
				integrations: [new BrowserTracing({ tracingOrigins: ["*"] })],
				tracesSampleRate: 0.2
			});
		} catch (e) {
			console.warn("Failed to initialize sentry:", e);
		}
	}
</script>
