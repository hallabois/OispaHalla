<script lang="ts">
	import { navigating } from "$app/stores";
</script>

{#if $navigating}
	{#key $navigating.to}
		<div />
	{/key}
{/if}

<style>
	@keyframes load {
		0% {
			height: 2.5px;
			transform: translateX(-100%);
		}
		100% {
			height: 2.5px;
			transform: translateX(0);
		}
	}
	div {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;

		background-color: var(--button-background);
		animation: 5s load;
		animation-fill-mode: forwards;
		animation-delay: 0.5s;
	}
</style>
