<script lang="ts">
	import Seo from "$lib/components/seo.svelte";
	import { enable_multiplayer } from "$lib/config";
</script>

<svelte:head>
	<link rel="shortcut icon" href="https://oispahalla.com/img/theme-9/64.webp" />
</svelte:head>

<Seo
	title="OispaHalla: Moninpeli"
	description="Kilpaile kavereitasi vastaan"
	image={{
		url: "https://oispahalla.com/img/theme-9/64.webp",
		width: 200,
		height: 200,
		alt: "TODO"
	}}
/>

{#if enable_multiplayer}
	<slot />
{:else}
	<div class="blurry-bg coming-soon">
		<img src="/lmao.png" alt="LMAO -taulukot" />
		<p>Isoja Juttuja Tulossa™</p>
	</div>
{/if}

<style lang="scss">
	@import "../../../style/helpers.scss";
	.coming-soon {
		min-height: 100vh;
		min-height: 100svh;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
