<script lang="ts">
	import { enable_multiplayer } from "$lib/config";
</script>

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
