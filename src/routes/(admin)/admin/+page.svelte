<script lang="ts">
	import "../../../style/utility-classes.scss";
	import { multiplayerIconData } from "$lib/components/common/icon/iconData";
	import Icon from "$lib/components/common/icon/icon.svelte";
</script>

<svelte:head>
	<title>OispaHalla Admin Dashboard</title>
</svelte:head>

<main>
	<h1>OispaHalla Admin Dashboard</h1>
	<a href="/admin/multiplayer" class="button action-btn">
		<Icon stroke="var(--color)" viewBox="0 0 48 48" d={multiplayerIconData} />
		multiplayer
	</a>
</main>

<style>
	:root {
		--button-background: #3c3c3c;
	}
	main {
		display: flex;
		flex-direction: column;

		justify-content: center;
		align-items: center;
		text-align: center;

		min-height: 100vh;
	}
</style>
