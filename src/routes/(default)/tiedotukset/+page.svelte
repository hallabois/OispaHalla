<script lang="ts">
	import { marked } from "marked";
	import { get_user_db, PSA } from "$lib/Firestore/db";
	import { auth } from "$lib/Auth/authstore";
	import { dev } from "$app/environment";
	let user_db = null;
	let userdata = null;
	$: if ($auth) {
		user_db = get_user_db($auth.uid);
	}
	$: if ($user_db != null) {
		userdata = $user_db.data();
		console.log("userdata:", userdata);
	}

	import type { PageData } from "../../tiedotukset/$types";
	export let data: PageData;
	$: content = data.content;
</script>

<main class="blurry-bg">
	<div class="paper">
		<h1 class="pagetitle">
			<span class="title" style="float: none;font-size: 45px;">OispaHalla</span>-kehityshistoria &
			tiedotukset
		</h1>
		<a href="/">Takaisin OispaHallaan</a>
		{#if content != null}
			{#if Object.keys(content).length == 0}
				<div class="psa">
					<p>Ei tiedotuksia.</p>
				</div>
			{/if}
			{#each Object.keys(content).reverse() as psa_key}
				{@const psa = content[psa_key]}
				{#if !(psa.devonly && !dev)}
					<div class="psa">
						{#if psa.title && psa.bread}
							<h1>{psa.title}</h1>
							{#if psa.date}
								<h2>{psa.date}</h2>
							{/if}
							<div class="bread">
								{@html marked.parseInline(psa.bread, { breaks: true })}
							</div>
						{:else}
							<p>Virheellinen tiedotus</p>
						{/if}
					</div>
				{/if}
			{/each}
		{:else}
			<div class="psa">
				<p>Virhe tiedotuksia haettaessa.</p>
			</div>
		{/if}
	</div>
</main>

<style>
	main {
		min-height: calc(100vh - 2em);
		padding-top: 2em;
		overflow: auto;
		background-attachment: fixed;
	}

	.paper {
		max-width: 700px;
		margin: 0px auto;
	}

	.psa {
		background-color: var(--container-background, var(--background));
		padding: 0.66em 1em;
		box-sizing: border-box;
		border-radius: 0.25rem;

		margin-bottom: 1em;
	}

	.pagetitle {
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	h1 {
		font-size: 24px;
		margin: 0;
	}

	h2 {
		margin-top: 0;
		font-size: 16px;
	}

	p {
		margin: 0;
	}
</style>
