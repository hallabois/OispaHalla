<script lang="ts">
	import { auth } from "$lib/Auth/authstore";

	import Popup from "./common/popup/popup.svelte";
	import ThemeChooser from "./common/theme-chooser/themeChooser.svelte";
	// import type Announcer from "./tournaments/announcer.svelte";

	let open = false;
	export function show() {
		open = true;
	}

	// export let announcer: Announcer | null = null;
</script>

<Popup bind:open>
	<span slot="title">Asetukset</span>
	<div slot="content" class="content">
		<h3>Teema</h3>
		<div class="section">
			<div style="height: 55px;">
				<ThemeChooser relative={false} expandY={false} expandX={true} />
			</div>
		</div>
		<h3>Tili</h3>
		<div class="section">
			{#if $auth}
				<p>Kirjautuneena sisään: <b>{$auth.displayName || $auth.email}</b></p>
				<p>Käyttäjätunnus: <b>{$auth.uid}</b></p>
				<a href="/auth" style="text-align: center;display: block;padding: 0.75em;"
					>Hallinnoi kirjautumista</a
				>
			{:else if $auth === undefined}
				<p style="text-align: center;display: block;padding: 0.75em;">Tarkistetaan tietoja</p>
			{:else}
				<button
					on:click={() => {
						window.location.href = "/auth";
					}}
					class="button action-btn"
					style="width: 100%;">Kirjaudu sisään</button
				>
			{/if}
		</div>
	</div>
</Popup>

<style>
	h3 {
		margin: 0;
		border-bottom: 1px solid var(--color);
	}
	a,
	p {
		margin: 0;
	}
	.section {
		margin-top: 0.25em;
		max-width: 550px;
	}
</style>
