<script lang="ts">
	import { browser } from "$app/environment";
	import ThemeChooser from "$lib/components/common/theme-chooser/themeChooser.svelte";
	import { storage_loaded } from "$lib/stores/storage";
	import { init, wasm } from "$lib/wasm/twothousand_forty_eight";
	import { onMount } from "svelte";
	import { theme_index } from "$lib/stores/themestore";
	import "../../../style/board.scss";
	import { active_size, gamestate, tiles_with_merged_from } from "$lib/gamelogic/new";
	import type { Direction } from "twothousand-forty-eight";
	import { blur, fade, scale, slide } from "svelte/transition";
	import { linear } from "svelte/easing";
	import * as hilbertCurve from "hilbert-curve";
	import { open_popups } from "$lib/stores/popupstore";
	import { swipe } from "svelte-gestures";
	export let enable_theme_chooser = true;

	$: loading = !browser || !$wasm || !storage_loaded || !gamestate;
	$: size = $active_size || 4;

	export let move: { (direction: Direction): boolean } = (direction: Direction) => {
		if ($open_popups.length > 0) return false;
		if ($gamestate) {
			$gamestate.move(direction);
			return true;
		}
		return false;
	};
	function swipeHandler(event: CustomEvent) {
		const direction_map: {
			[key: string]: Direction;
		} = {
			top: "UP",
			right: "RIGHT",
			bottom: "DOWN",
			left: "LEFT"
		};
		const direction = event.detail.direction;
		const direction_mapped = direction_map[direction];
		move(direction_mapped);
	}

	export let restart: { (force: boolean): boolean } = (force) => {
		if ($open_popups.length > 0) return false;
		if ($gamestate) {
			$gamestate.restart(force);
			return true;
		}
		return false;
	};

	onMount(async () => {
		await init();
	});
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "ArrowUp" || e.key === "w") {
			if (!move("UP")) return;
		} else if (e.key === "ArrowDown" || e.key === "s") {
			if (!move("DOWN")) return;
		} else if (e.key === "ArrowLeft" || e.key === "a") {
			if (!move("LEFT")) return;
		} else if (e.key === "ArrowRight" || e.key === "d") {
			if (!move("RIGHT")) return;
		} else if (e.key === "r") {
			if (e.ctrlKey || e.metaKey) {
				return;
			}
			if (!restart(false)) return;
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

<div class="game-container" style:--grid-size={size} use:swipe on:swipe={swipeHandler}>
	<div class="kurin-palautus-viesti" />
	{#if $gamestate?.state.won || $gamestate?.state.over}
		<div
			class="game-message"
			class:game-won={$gamestate?.state.won}
			class:game-over={$gamestate?.state.over}
		>
			<p class="tilanne">
				{#if $gamestate?.state.won}
					HALLA!
				{:else if $gamestate?.state.over}
					Improbatur...
				{/if}
			</p>
			<p class="kurinpalautukset">
				{$gamestate?.state?.breaks || 0} kurinpalautusta käytetty
			</p>
			<div class="lower">
				<button class="button action-btn keep-playing-button">Jatka pelaamista</button>
				<button
					class="button action-btn discourage retry-button"
					on:click={() => {
						restart(true);
					}}><span>Yritä uudelleen</span></button
				>
			</div>
		</div>
	{/if}

	<div class="grid-container" class:loading>
		{#each { length: size * size } as _, i ([i % size, Math.floor(i / size)])}
			{@const x = i % size}
			{@const y = Math.floor(i / size)}
			{@const delay =
				hilbertCurve.pointToIndex({ x, y }, Math.ceil(Math.sqrt(size))) % (size * size)}
			<div
				class="grid-cell"
				style:--animation-offset={`${delay * 50}ms`}
				style:--i={delay}
				style:--x={x}
				style:--y={y}
				in:slide={{ delay: delay * 10, axis: (x + y) % 2 == 0 ? "x" : "y" }}
			/>
		{/each}
	</div>

	{#if $tiles_with_merged_from && browser}
		{#key size}
			<div class="tile-container" in:blur={{ delay: 250 }}>
				{#each $tiles_with_merged_from as tile (tile.id)}
					{#key tile.id}
						<div
							id={`tile-${tile.id}`}
							class="tile"
							class:tile-new={tile.new && !tile.merged_from}
							class:tile-merged={tile.merged_from != null}
							class:tile-merged-from={tile.merged}
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
