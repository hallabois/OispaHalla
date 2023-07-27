<script lang="ts">
	import { BarLoader } from "svelte-loading-spinners";
	export let onCancel: Function | null = null;
	export let minHeight = "5em";
</script>

<div class="busy" style:--busy-min-h={minHeight}>
	<slot />
	<BarLoader size="60" color="var(--button-background)" unit="px" duration="2s" />
	{#if onCancel != null}
		<button
			class="button action-btn discourage"
			on:click={() => {
				if (onCancel) onCancel();
			}}>peruuta</button
		>
	{/if}
</div>

<style>
	.busy {
		min-height: var(--busy-min-h);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 0.5em;
	}
</style>
