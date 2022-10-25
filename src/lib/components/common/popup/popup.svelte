<script lang="ts">
	import { browser } from "$app/environment";
	import { open_popups } from "$lib/stores/popupstore";
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	export let open = false;

	let my_key = {}; // All objects are unique
	$: if (open && browser) {
		if (!$open_popups.includes(my_key)) {
			open_popups.set([...$open_popups, my_key]);
		}
	} else if (browser) {
		if ($open_popups.includes(my_key)) {
			open_popups.set($open_popups.filter((x) => x !== my_key));
		}
	}

	let mounted = false;
	onMount(() => {
		false;
		mounted = true;
	});
	onDestroy(() => {
		if (!$open_popups.includes(my_key)) {
			open_popups.set([...$open_popups, my_key]);
		}
	});
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<main
		class="lb-popup"
		on:click={() => {
			open = false;
		}}
		out:fade
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="lb-popup-container"
			on:click={(e) => {
				e.stopPropagation();
			}}
		>
			<div class="popup">
				<div class="lb-header">
					<h2 class="lb-title">
						<slot name="title">This is a generic popup.</slot>
					</h2>
					<div class="lb-buttons">
						<slot name="buttons">
							<button
								title="Sulje ikkuna"
								class="button background-none color-button"
								on:click={() => {
									open = false;
								}}>×</button
							>
						</slot>
					</div>
				</div>
				<div class="lb-content">
					<slot name="content">
						<p>Please fill me with content.</p>
					</slot>
				</div>
			</div>
		</div>
	</main>
{/if}

<style lang="scss">
	.popup {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
	}
	.lb-content {
		overflow-y: auto;
	}

	h2.lb-title {
		margin-bottom: 0;
	}
	button {
		color: var(--color);
	}

	@media (max-width: 600px) {
		.lb-popup-container {
			height: 100vh !important;
			width: 100vw !important;
			margin: 0 !important;
		}
		.popup {
			flex-direction: column-reverse;
			height: 100%;
		}
		.lb-header {
			margin-bottom: 3em;
		}
	}
</style>
