<script lang="ts">
	import { enable_multiplayer } from "../../features";
</script>

{#if enable_multiplayer}
	<slot />
{:else}
	<div class="blurry-bg coming-soon">
		<img src="lmao.png" alt="LMAO -taulukot" />
		<p>Isoja Juttuja Tulossa™</p>
	</div>
{/if}

<style>
	.coming-soon {
		min-height: 100vh;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
