<script lang="ts">
	import { base_path, theme_index } from "$lib/themestore";
	$: preloadImageUrls = [
		...[...Array(12).keys()].map(x=>`${$base_path || "/img/theme-" + $theme_index}/${2**(x+1)}.webp`),
		"/img/parinkulautus.webp"
	];
</script>

<svelte:head>
	{#each preloadImageUrls as image}
		<link rel="preload" as="image" href={image} />
	{/each}
</svelte:head>