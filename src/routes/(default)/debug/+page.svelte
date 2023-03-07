<script lang="ts">
	import { browser } from "$app/environment";
	import { storage } from "$lib/stores/storage";
	$: data = $storage;

	let show = false;

	function shareData() {
		navigator.share({
			title: "Oispahalla debug dump",
			text: JSON.stringify($storage)
		});
	}
	function copy() {
		navigator.clipboard.writeText(JSON.stringify($storage));
		copytext = "Kopioitu!";
		setTimeout(() => {
			copytext = null;
		}, 500);
	}

	let copytext: string | null;
</script>

<main>
	<p>
		Tämä sivu on tarkoitettu sovelluksen teknisen virheenkorjausdatan lähettämiselle sen
		kehittäjille. <br />Näiden tietojen jakaminen muille voi vaarantaa oispahalla-suorituksesi.
		<br /><span class="orng">Älä jaa näitä tietoja ulkopuolisille.</span>
	</p>
	{#if show}
		{#if browser && navigator.share}
			<button on:click={shareData}>Jaa</button>
		{/if}
		{#if browser && navigator.clipboard}
			<button on:click={copy}>{copytext || "Kopioi leikepöydälle"}</button>
		{/if}
		{#if data && Object.keys(data).length > 0}
			<div class="tablec">
				<table>
					<tr>
						<th />
						<th />
					</tr>
					{#each Object.keys(data) as i, k}
						<tr>
							<td class="key">{i}</td>
							<td class="value">{JSON.stringify(data[i])}</td>
						</tr>
					{/each}
				</table>
			</div>
		{:else}
			<p>Ei näytettävää dataa.</p>
		{/if}
	{:else}
		<div>
			<button
				on:click={() => {
					show = true;
				}}>Ymmärrän.</button
			>
		</div>
	{/if}
</main>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		font-family: monospace;

		color-scheme: dark;
	}
	main {
		height: 100%;
		background: #1e1e1e;
		color: #ddd !important;

		display: flex;
		flex-direction: column;
	}
	.orng {
		color: orange;
	}
	.tablec {
		overflow-x: auto;
	}
	table {
		flex: 1;
	}
	.key {
		color: #94d0f1;
	}
	.value {
		color: #ce9178;
	}
</style>
