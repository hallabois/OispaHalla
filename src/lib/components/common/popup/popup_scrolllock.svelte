<script lang="ts">
	import { browser } from "$app/environment";
	import { open_popups } from "$lib/stores/popupstore";

	$: if (browser && $open_popups.length > 0) {
		document.querySelector("html").style.overflowY = "hidden";
	} else if (browser) {
		document.querySelector("html").style.overflowY = "";
	}
</script>

<div />
