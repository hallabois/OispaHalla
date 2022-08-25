<main>
	<div class="positioner">
		<div style="display: flex;">
			<h1 class="title">OispaHalla</h1>
			<h2 style="opacity:0.8;">Leaderboards</h2>
			<h3>4x4</h3>
		</div>
		<div>
			<a href="/">Takaisin OispaHallaan</a>
			<a href="/leaderboards/3">3x3</a>
			<a href="/leaderboards/4">4x4</a>
		</div>
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
