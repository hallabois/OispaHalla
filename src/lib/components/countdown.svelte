<script lang="ts">
	import { countdown, countdown_message } from "$lib/config";
	import { browser, dev } from "$app/environment";
	import { blur } from "svelte/transition";

	function getSeconds(date: Date) {
		return Math.round(date.getTime() / 1000);
	}
	function displayTime(n: number) {
		if (n < 0) return "00:00:00";
		let hours = Math.floor(n / 3600);
		let minutes = Math.floor((n % 3600) / 60);
		let seconds = Math.floor((n % 3600) % 60);
		let hours_str = hours < 10 ? "0" + hours : hours;
		let minutes_str = minutes < 10 ? "0" + minutes : minutes;
		let seconds_str = seconds < 10 ? "0" + seconds : seconds;
		return `${hours_str}:${minutes_str}:${seconds_str}`;
	}

	let date = new Date();
	let timeToLaunch = 1; // seconds
	$: time_str = displayTime(timeToLaunch);
	$: if (countdown && date) {
		timeToLaunch = getSeconds(countdown) - getSeconds(date);
	}
	let launch_override = false;
	let launch_transition_length = 5000;
	$: launched = !countdown || timeToLaunch < 0 || launch_override;

	$: if (browser && countdown) console.log("Time to launch:", timeToLaunch);

	if (countdown) {
		setInterval(() => {
			if (!launched) {
				date = new Date();
			}
		}, 1000);
	}
</script>

{#if !launched}
	<div class="countdown-div blurry-bg" out:blur={{ duration: launch_transition_length }}>
		<h1>{countdown_message}</h1>
		<span class="countdown">{time_str}</span>
		{#if dev}
			<button
				on:click={() => {
					console.info("Launch override");
					launch_override = true;
				}}>test launch</button
			>
		{/if}
	</div>
{:else}
	<slot />
{/if}

<style>
	.countdown {
		text-align: center;
		font-size: 2.5em;
	}
	.countdown-div {
		position: absolute;
		z-index: 100;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 2em;
	}
	h1 {
		color: var(--title-color);
		font-weight: bold;
	}
</style>
