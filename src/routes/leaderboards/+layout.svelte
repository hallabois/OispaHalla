<main>
	<div class="positioner">
		<slot />
	</div>
</main>

<style>
	.positioner {
		width: min(500px, 90vw);

		margin: 0 auto;
		padding-block: 30vh;
	}
</style>
