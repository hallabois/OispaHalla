<main class="blurry-bg">
	<div class="positioner">
		<slot />
	</div>
</main>

<style>
	main {
		background-attachment: fixed;
		min-height: 100vh;
	}
	.positioner {
		width: min(500px, 90vw);

		margin: 0 auto;
		padding-block: 30vh;
	}
</style>
