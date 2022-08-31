<script lang="ts">
	import ThemeChooser from "$lib/components/common/theme-chooser/themeChooser.svelte";
	export let enable_theme_chooser = true;
</script>

<div class="game-container">
	<div class="kurin-palautus-viesti" />
	<div class="game-message">
		<p class="tilanne" />
		<p class="kurinpalautukset" />
		<div class="lower">
			<button class="button keep-playing-button">Jatka pelaamista</button>
			<button class="button retry-button">Yritä uudelleen</button>
		</div>
	</div>

	<div class="grid-container">
		<!-- Standard 4x4 -->
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<!-- In case we need more -->
		<!-- 5x5 -->
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
		<div class="grid-cell" />
	</div>

	<div class="tile-container" />
	{#if enable_theme_chooser}
		<ThemeChooser />
	{/if}
</div>

<style>
	.game-container {
		margin: 0;
	}
</style>
