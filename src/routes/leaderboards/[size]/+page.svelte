<script lang="ts">
	import Header from "../header.svelte";
	import type { PageData } from "./$types";
	import { auth } from "$lib/Auth/authstore";
	export let data: PageData;
	$: ({ leaderboard_data, size } = data);
	$: scores = leaderboard_data.scores.sort((a, b) => b.score - a.score);
</script>

<Header>
	<h3 slot="size">{size}x{size}</h3>
</Header>
<table>
	<tr>
		<th>Sija</th>
		<th>Pisteet</th>
		<th>Nimi</th>
	</tr>
	{#each scores as score, index}
		<tr class:me={$auth && $auth.uid === score.user.uid}>
			<td>{index + 1}.</td>
			<td>{score.score}</td>
			<td>{score.user.screenName}</td>
		</tr>
	{/each}
</table>

<style>
	table {
		width: 100%;
		background-color: var(--container-background);

		box-shadow: 0.25em 0.25em 0.1em var(--color);
		border-radius: 0.25rem;
		overflow: hidden;
	}
	table,
	th,
	td {
		border-collapse: collapse;
	}
	td,
	th {
		border: 1px solid;
		padding: 0.25em 0.5em;
	}
	tr.me {
		font-weight: bold;
	}
</style>
