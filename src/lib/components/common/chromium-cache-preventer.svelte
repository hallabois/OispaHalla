<script lang="ts">
	import { browser } from "$app/environment";
	import { storage_loaded, update_storage_from_localstorage } from "$lib/stores/storage";

	if ($storage_loaded && browser && "performance" in window) {
		const navigationLastEntry = performance.getEntriesByType("navigation").pop() as
			| PerformanceNavigationTiming
			| undefined;

		if (
			navigationLastEntry &&
			navigationLastEntry.type === "back_forward" &&
			navigationLastEntry.unloadEventStart === 0
		) {
			console.warn("detected a load from cache, trying to reload data from localstorage...");
			update_storage_from_localstorage();
		}
	}
</script>

<div />
