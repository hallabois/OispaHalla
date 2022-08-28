<script lang="ts">
	import { fly, slide, fade } from "svelte/transition";
</script>

<main>
	Content
	<slot />
</main>

<style>
	main {
		height: 300px;
		width: 300px;
		box-shadow: inset 0.25em 0.25em 0.5em rgba(0, 0, 0, 0.25);
	}
</style>
