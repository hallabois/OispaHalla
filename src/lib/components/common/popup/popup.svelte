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
		if ($open_popups.includes(my_key)) {
			open_popups.set($open_popups.filter((x) => x !== my_key));
		}
	});
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "Escape" && $open_popups.at(-1) === my_key) {
			open = false;
			e.preventDefault();
			e.stopPropagation();
		}
	}}
/>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<popup
		class="lb-popup"
		on:click={() => {
			open = false;
		}}
		aria-hidden="true"
		out:fade|local
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="lb-popup-container"
			on:click={(e) => {
				e.stopPropagation();
			}}
			aria-hidden="true"
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
								aria-label="Sulje ikkuna"
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
	</popup>
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
			/* for mobile */
			height: 100svh !important;
			width: 100vw !important;
			margin: 0 !important;
		}
		.popup {
			flex-direction: column-reverse;
			height: 100%;
		}
		.lb-header {
			margin-bottom: 0.75em;
		}
	}

	@keyframes popdown {
		from {
			margin-top: -50vh;
			opacity: 0;
		}
		to {
			margin-top: 0;
			opacity: 1;
		}
	}

	@keyframes darken {
		from {
			opacity: 0;
			/* backdrop-filter: blur(0px); */
		}
		to {
			opacity: 1;
			/* backdrop-filter: blur(2px); */
		}
	}

	.lb-popup {
		/* backdrop-filter: blur(2px); */
		background-color: rgba(0, 0, 0, 0.4);
		z-index: 200;
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		animation-name: darken;
		animation-duration: 0.4s;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.lb-popup-container {
		background-color: var(--dialog-background);
		min-width: min(450px, 100vw);
		margin: 0;
		animation-name: popdown;
		animation-duration: 0.4s;
		border-radius: 6px;
	}

	.lb-header {
		padding: 0 20px;
		padding-top: 10px;
		display: -webkit-flex;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.lb-buttons {
		display: -webkit-flex;
		display: flex;

		* {
			text-decoration: none;
			font-size: 30px;
		}

		img {
			padding: 10px 10px 0 0;
			width: 30px;
			height: 30px;
		}
	}

	.lb-content {
		margin: 0;
		padding: 0 20px 20px;
	}
</style>
