<script lang="ts">
</script>

<slot />

<style>
	:root {
		--color: #ddd !important;
		--dialog-background: #222 !important;
	}
	:global(*) {
		margin: 0;
		padding: 0;

		box-sizing: border-box;
	}
	:global(html, body) {
		color-scheme: dark;
		background: var(--dialog-background) !important;
		color: var(--color) !important;
	}
</style>
