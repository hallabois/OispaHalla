<script lang="ts">
	import { draw } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	export let d: string | null = null;
	export let show_stroke = false;
	export let stroke = "none";
	export let stroke_width = "0.5";
	export let fill = "var(--color)";
	export let fill_opacity = "1.0";
	export let animation_length = 1500;
	export let viewBox = "0 0 24 24";

	export let text: string | null = null;
	export let text_id = "";

	export let upper_text: string | null = null;
</script>

<div
	class="main"
	style="--duration:{animation_length / 10}ms;--s-width:{stroke_width}px;{upper_text
		? `--u-text:'${upper_text}';`
		: ''}"
>
	{#if d != null}
		<svg xmlns="http://www.w3.org/2000/svg" height="1em" {viewBox}>
			<path
				transition:draw|local={{ duration: animation_length, easing: quintOut }}
				{d}
				{fill}
				fill-opacity={fill_opacity}
				stroke="none"
			/>
			{#if show_stroke}
				<path
					transition:draw|local={{ duration: animation_length, easing: quintOut }}
					{d}
					fill="none"
					{stroke}
					stroke-width={stroke_width + "px"}
				/>
			{/if}
		</svg>
	{/if}
	{#if text != null}
		<span id={text_id}>{text}</span>
	{/if}
</div>

<style>
	.main {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	.main::after {
		content: var(--u-text);
		position: absolute;
		transform: translate(10px, -10px);
		background: var(--button-background);
		color: var(--action-btn-color);
		width: 20px;
		height: 20px;
		font-size: 15px;
		border-radius: 100%;
		line-height: 20px;
	}
	path {
		transition: fill-opacity var(--duration), stroke-width var(--duration);
		stroke-width: var(--s-width);
	}
</style>
