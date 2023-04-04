<script lang="ts">
	import { BarLoader } from "svelte-loading-spinners";
	export let onCancel: Function | null;
</script>

<div class="busy">
	<slot />
	<BarLoader size="60" color="var(--button-background)" unit="px" duration="2s" />
	{#if onCancel != null}
		<button
			class="button action-btn discouradge"
			on:click={() => {
				onCancel;
			}}>peruuta</button
		>
	{/if}
</div>

<style>
	.busy {
		min-height: 10em;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 0.5em;
	}
</style>
