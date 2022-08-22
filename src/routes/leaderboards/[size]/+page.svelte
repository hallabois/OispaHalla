<script lang="ts">
    import type { PageData } from '../../../../.svelte-kit/types/src/routes/leaderboards./../../../.svelte-kit/types/src/routes/leaderboards/$types';
    export let data: PageData;
    $: ({ leaderboard_data } = data);
    $: scores = leaderboard_data.scores.sort((a,b)=>b.score-a.score);
</script>


<table>
    <tr>
        <th>Sija</th>
        <th>Pisteet</th>
        <th>Nimi</th>
    </tr>
    {#each scores as score, index}
        <tr>
            <td>{index+1}.</td>
            <td>{score.score}</td>
            <td>{score.user.screenName}</td>
        </tr>
    {/each}
</table>

<style>
    table {
        width: 100%;
        background-color: var(--background);

        box-shadow: .25em .25em .1em var(--color);
        border-radius: .25rem;
        overflow: hidden;
    }
    table, th, td {
        border-collapse: collapse;
    }
    td, th {
        border: 1px solid;
        padding: .25em .5em;
    }
</style>