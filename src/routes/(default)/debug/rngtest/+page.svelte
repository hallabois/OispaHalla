<script lang="ts">
	import { init, wasm } from "$lib/wasm/twothousand_forty_eight";
	import { onMount } from "svelte";

	onMount(async () => {
		await init();
	});

	function result(iters: number) {
		if ($wasm) {
			let seed = 0;
			for (let i = 0; i < iters + 1; i++) {
				seed = $wasm.lcg_sane(seed);
			}
			return seed;
		}
	}
</script>

<main class="blurry-bg">
	<h1>RNG test</h1>
	{#if $wasm}
		{#each { length: 100 } as _, index}
			<p>{index}, {result(index)}</p>
		{/each}
	{:else}
		<p>loading...</p>
	{/if}
</main>

<style>
	main {
		background-attachment: fixed;
		min-height: 100vh;
		min-height: 100svh;
	}
</style>
