<script>
	import { page } from "$app/stores";
</script>

<main class="blurry-bg">
	<div class="container">
		<div style="display: flex;align-items: center;flex-wrap: wrap;justify-content: space-between;">
			<h1>Virhe</h1>
			<h2>{$page.status}: {$page.error.message}</h2>
		</div>
		<a href="/">Takaisin OispaHallaan</a>
		<br />
		<code
			style="display:block;max-width: min(500px, 95vw);word-wrap: anywhere;white-space: pre-wrap;"
			>{JSON.stringify($page, null, 2)}</code
		>
	</div>
</main>

<style>
	* {
		margin: 0;
	}
	main {
		display: flex;
		min-height: 100vh;
		justify-content: center;
		align-items: center;
		background-attachment: fixed;
	}
	div.container {
		background: var(--container-background);
		padding: 1em;
		border-radius: 0.75rem;
	}
</style>
