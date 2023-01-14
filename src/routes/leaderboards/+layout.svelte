<div class="blurry-bg">
	<div class="positioner">
		<slot />
	</div>
</div>

<style>
	.blurry-bg {
		background-attachment: fixed;
		min-height: 100vh;
	}
	.positioner {
		width: min(500px, 90vw);

		margin: 0 auto;
		padding-block: 30vh;
	}
</style>
