<script lang="ts">
	import { enable_multiplayer } from "../../features";
</script>

{#if enable_multiplayer}
	<slot />
{:else}
	<div class="blurry-bg coming-soon">
		<p>Tulossa pian™</p>
	</div>
{/if}

<style>
	.coming-soon {
		min-height: 100vh;

		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
