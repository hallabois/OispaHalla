<script lang="ts">
	import Popup from "./common/popup/popup.svelte";
	import type Announcer from "./tournaments/announcer.svelte";
	import { PSA } from "$lib/Firestore/db";
	import { slide } from "svelte/transition";
	import { browser, dev } from "$app/environment";
	import { marked } from "marked";
	import { storage, storage_loaded, setItem } from "$lib/stores/storage";

	let open = false;
	export function show() {
		open = true;
	}

	export let announcer: Announcer | null = null;

	let psas: object | null;
	$: psas = $PSA?.data()?.content;
	$: unread_psas = Object.keys(psas || {}).filter(
		(psa) => !(($storage.read_psas || []).includes(psa) || (psas[psa].devonly && !dev))
	);
	$: unread_important_psas = unread_psas.filter((psa) => psas[psa].important);
	$: unread_psas_reverse = [...unread_psas].reverse();

	export let has_unread_notifications: boolean | null = null;
	export let unread_notification_count: number | null = null;
	export let has_unread_important_notifications: boolean | null = null;
	$: has_unread_notifications = unread_psas.length > 0;
	$: unread_notification_count = unread_psas.length;
	$: has_unread_important_notifications = unread_important_psas.length > 0;

	$: if (browser && $storage_loaded && has_unread_important_notifications) {
		show();
	}

	function markRead(psa_key: number | string) {
		let old_values = $storage || {};
		let old_psas_read = old_values.read_psas || [];
		setItem("read_psas", [...old_psas_read, psa_key]);
	}
	function markAllUnread() {
		setItem("read_psas", []);
	}
</script>

<Popup bind:open>
	<span slot="title">Tiedotukset</span>
	<div slot="content" class="content">
		{#if $PSA != null}
			{@const PSA_URL = `${browser ? window.location.href : "oispahalla.com/"}tiedotukset`}
			{#if unread_psas_reverse.length == 0}
				<div class="section">
					<h2 style="margin: 0;">Ei lukemattomia tiedotuksia.</h2>
					{#if dev}
						<button on:click={markAllUnread}>Merkitse kaikki lukemattomiksi (devonly)</button>
					{/if}
				</div>
			{/if}
			{#each unread_psas_reverse as psa_key (psa_key)}
				{@const psa = psas[psa_key]}
				<div class="section" transition:slide|local>
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
					{#if $storage_loaded}
						<button
							class="button action-btn"
							style="width: 100%; margin-top: 1em;"
							on:click={() => {
								markRead(psa_key);
							}}>Merkitse Luetuksi</button
						>
					{:else}
						<p>Ladataan tallennustilaa...</p>
					{/if}
				</div>
			{/each}
			<div class="section">
				<p>
					Aiemmat tiedotukset löydät osoitteesta
					<a style="white-space: nowrap;" href={PSA_URL}>{PSA_URL}</a>
				</p>
			</div>
		{:else}
			<div class="section">
				<p>Ladataan tiedotuksia...</p>
			</div>
		{/if}
	</div>
</Popup>

<style>
	h3 {
		display: inline;
		margin: 0;
		border-bottom: 1px solid var(--color);
	}
	hr {
		margin-block: 0.5em;
	}
	a,
	p {
		margin: 0;
	}
	.section {
		margin-block: 1em;
		max-width: 550px;
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
