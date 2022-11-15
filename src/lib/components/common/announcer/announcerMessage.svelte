<script lang="ts">
	import { slide, fade } from "svelte/transition";
	export let msg: string;
	export let time: Date;
</script>

<div class="notification" transition:slide>
	<p>
		{msg}
	</p>
	<div class="timer" />
</div>

<style>
	.notification {
		max-width: 90vw;
		margin-inline: auto;
		overflow: hidden;

		box-sizing: border-box;
		background-color: var(--container-background, var(--background));

		border-radius: 0.25rem;
		border: 1px solid var(--button-background);
	}
	p {
		text-align: center;
		color: var(--color);
		margin: 0;
		padding: 0.2em 1em;
	}
	@keyframes timer {
		0% {
			translate: -100% 0;
		}
		100% {
			translate: 0 0;
		}
	}
	.timer {
		height: 2px;
		background: var(--color);
		translate: -100% 0;
		animation: timer 2s forwards;
	}
</style>
