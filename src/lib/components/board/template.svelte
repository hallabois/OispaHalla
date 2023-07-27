<script lang="ts">
	import ThemeChooser from "$lib/components/common/theme-chooser/themeChooser.svelte";
	import "../../../style/board.scss";
	export let enable_theme_chooser = true;
</script>

<div class="game-container">
	<div class="kurin-palautus-viesti" />
	<div class="game-message">
		<p class="tilanne" />
		<p class="kurinpalautukset" />
		<div class="lower">
			<button class="button action-btn keep-playing-button">Jatka pelaamista</button>
			<button class="button action-btn discourage retry-button"><span>Yritä uudelleen</span></button
			>
		</div>
	</div>

	<div class="grid-container">
		{#each new Array(16 + 9).fill(0) as _, i}
			<div class="grid-cell" style:--animation-offset={`${i * 10}ms`} />
		{/each}
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
