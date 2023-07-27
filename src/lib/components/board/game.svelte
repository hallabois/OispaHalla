<script lang="ts">
	import { browser } from "$app/environment";
	import ThemeChooser from "$lib/components/common/theme-chooser/themeChooser.svelte";
	import { storage_loaded } from "$lib/stores/storage";
	import { init, wasm } from "$lib/wasm/twothousand_forty_eight";
	import { onMount } from "svelte";
	import { available_themes, festives_applied, theme_index } from "$lib/stores/themestore";
	import "../../../style/board.scss";
	import {
		active_size,
		active_size_server,
		gamestate,
		tiles_with_merged_from
	} from "$lib/gamelogic/new";
	import type { Direction } from "twothousand-forty-eight";
	import { blur, crossfade, fade, scale } from "svelte/transition";
	import { linear } from "svelte/easing";
	export let enable_theme_chooser = true;

	$: loading = !browser || !$wasm || !storage_loaded || !gamestate;

	export let move: { (direction: Direction): void } = (direction: Direction) => {
		if ($gamestate) {
			console.log("moving", direction);
			$gamestate.move(direction);
		}
	};

	export let restart: { (): void } = () => {
		if ($gamestate) {
			$gamestate.restart();
		}
	};

	onMount(async () => {
		await init();
	});
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "ArrowUp" || e.key === "w") {
			move("UP");
		} else if (e.key === "ArrowDown" || e.key === "s") {
			move("DOWN");
		} else if (e.key === "ArrowLeft" || e.key === "a") {
			move("LEFT");
		} else if (e.key === "ArrowRight" || e.key === "d") {
			move("RIGHT");
		} else if (e.key === "r") {
			if (e.ctrlKey || e.metaKey) {
				return;
			}
			restart();
		} else if (e.key === "e") {
			if (e.ctrlKey || e.metaKey) {
				return;
			}
			if ($gamestate) {
				$gamestate.revertMove();
			}
		} else {
			return;
		}
		// prevent scrolling, etc.
		e.preventDefault();
		e.stopPropagation();
	}}
/>

<div class="game-container" style:--grid-size={$active_size || 4}>
	<div class="kurin-palautus-viesti" />
	<div class="game-message">
		<p class="tilanne" />
		<p class="kurinpalautukset" />
		<div class="lower">
			<button class="button action-btn keep-playing-button">Jatka pelaamista</button>
			<button class="button action-btn discourage retry-button"><span>Yritä uudelleen</span></button
			>
		</div>
	</div>

	<div class="grid-container" class:loading>
		{#each new Array(16 + 9).fill(0) as _, i}
			<div class="grid-cell" style:--animation-offset={`${i * 10}ms`} />
		{/each}
	</div>

	{#if $tiles_with_merged_from && browser}
		{#key $active_size}
			<div class="tile-container" in:blur>
				{#each $tiles_with_merged_from as tile (tile.id)}
					{#key tile.id}
						<div
							id={`tile-${tile.id}`}
							class="tile"
							class:tile-new={tile.new && !tile.merged_from}
							class:tile-merged={tile.merged_from != null}
							style:--x={tile.x}
							style:--y={tile.y}
							out:scale={{ duration: 100 }}
						>
							{#key tile.value}
								<div
									class="tile-inner"
									transition:fade={{ duration: 100, easing: linear }}
									style:--img={`url(/img/theme-${$theme_index}/${tile.value}.webp)`}
								/>
							{/key}
						</div>
					{/key}
				{/each}
			</div>
		{/key}
	{/if}
	{#if enable_theme_chooser}
		<ThemeChooser />
	{/if}
</div>

<style>
	.game-container {
		margin: 0;
		--tile-size: calc(
			calc(
					var(--field-width, --default-field-width) -
						calc(var(--grid-gap) * calc(var(--grid-size) + 1))
				) / var(--grid-size)
		);
	}
	.tile {
		transition: var(--transition-speed) transform ease-in-out;
		--xpos: calc(calc(var(--tile-size) + var(--grid-gap)) * calc(var(--x)));
		--ypos: calc(calc(var(--tile-size) + var(--grid-gap)) * calc(var(--y)));
		transform: translate(var(--xpos), var(--ypos));
	}
	.tile .tile-inner {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: var(--img);
	}
</style>
