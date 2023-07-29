<script lang="ts">
	import { browser } from "$app/environment";
	import ThemeChooser from "$lib/components/common/theme-chooser/themeChooser.svelte";
	import { storage_loaded } from "$lib/stores/storage";
	import { init, wasm } from "$lib/wasm/twothousand_forty_eight";
	import { onMount } from "svelte";
	import { theme_index } from "$lib/stores/themestore";
	import "../../../style/board.scss";
	import type { Board, Direction, Tile, Tiles } from "twothousand-forty-eight";
	import { blur, fade, scale, slide } from "svelte/transition";
	import { cubicInOut, linear } from "svelte/easing";
	import * as hilbertCurve from "hilbert-curve";
	import { open_popups } from "$lib/stores/popupstore";
	import { swipe } from "svelte-gestures";
	import { complete_tiles } from "$lib/gamelogic/new";
	export let enable_theme_chooser = true;

	export let swipeHandler: { (event: CustomEvent): void } = (event) => {};
	export let restart: { (force: boolean): boolean } = (force) => false;
	export let aknowledgeWinScreen: { (): void } = () => {};

	export let tiles: Tile[];
	export let last_move_tiles: Tile[] | null;
	export let last_move_direction: Direction | null;
	export let loading: boolean = false;
	export let size: number;
	$: tiles_visible = complete_tiles(tiles, last_move_tiles, last_move_direction);

	export let won: boolean = false;
	export let win_screen_shown: boolean = false;
	export let game_over: boolean = false;
	export let break_count: number = 0;
</script>

<div
	class="game-container"
	class:first-move={last_move_direction == null}
	style:--grid-size={size}
	use:swipe
	on:swipe={swipeHandler}
>
	<div class="kurin-palautus-viesti" />
	{#if (won && !win_screen_shown) || game_over}
		<div
			class="game-message"
			class:game-won={won}
			class:game-over={game_over}
			out:fade={{ duration: 200 }}
		>
			<p class="tilanne">
				{#if won}
					HALLA!
				{:else if game_over}
					Improbatur...
				{/if}
			</p>
			<p class="kurinpalautukset">
				{break_count} kurinpalautusta käytetty
			</p>
			<div class="lower">
				{#if game_over}
					<button
						class="button action-btn retry-button"
						on:click={() => {
							restart(true);
						}}><span>Yritä uudelleen</span></button
					>
				{:else}
					<button class="button action-btn keep-playing-button" on:click={aknowledgeWinScreen}
						><span>Jatka pelaamista</span></button
					>
				{/if}
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

	{#if tiles_visible}
		{#key size}
			<div class="tile-container" in:blur={{ delay: 250 }}>
				{#each tiles_visible as tile (tile.id)}
					{@const merged = "merged" in tile ? tile.merged : false}
					{#key tile.id}
						<div
							id={`tile-${tile.id}`}
							class="tile"
							class:tile-new={last_move_direction == "BREAK"
								? false
								: tile.new && !tile.merged_from}
							class:tile-merged={last_move_direction == "BREAK" ? false : tile.merged_from != null}
							class:tile-merged-from={merged}
							style:--x={tile.x}
							style:--y={tile.y}
						>
							<div
								class="tile-inner"
								out:scale={{ duration: 100 }}
								style:--img={`url(/img/theme-${$theme_index}/${tile.value}.webp)`}
							/>
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
		transition: var(--transition-speed) top ease-in-out 0ms,
			var(--transition-speed) left ease-in-out 0ms;
		--xpos: calc(calc(var(--tile-size) + var(--grid-gap)) * calc(var(--x)));
		--ypos: calc(calc(var(--tile-size) + var(--grid-gap)) * calc(var(--y)));
		top: var(--ypos);
		left: var(--xpos);
	}
	.first-move .tile {
		--speed: calc(var(--transition-speed) * 2);
		transition: var(--speed) left ease-in-out 0ms, var(--speed) top ease-in-out var(--speed);
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
