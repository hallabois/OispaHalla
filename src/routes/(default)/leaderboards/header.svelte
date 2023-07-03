<script lang="ts">
	export let size: number | undefined;
</script>

<div class="header-title">
	<h1 class="title">OispaHalla</h1>
	<h2>Leaderboards</h2>
</div>
<div class="header-actions">
	<a class="rootlink" href="/">Takaisin OispaHallaan</a>
	<a class="tab" class:active={size === 3} href="/leaderboards/3">3x3</a>
	<a class="tab" class:active={size === 4} href="/leaderboards/4">4x4</a>
</div>

<style>
	.header-title {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.header-title > h2 {
		color: color-mix(in srgb, var(--color) 80%, transparent 20%);
	}
	.header-actions {
		display: flex;
		flex-direction: row;
	}
	.header-actions > * {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.rootlink {
		font-weight: normal;
		font-size: 1em;
	}
</style>
