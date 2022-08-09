<script lang="ts">
	import { auth } from "$lib/Auth/authstore";

	import Popup from "./common/popup/popup.svelte";
	import ThemeChooser from "./common/theme-chooser/themeChooser.svelte";
	import type Announcer from "./tournaments/announcer.svelte";

	let open = false;
	export function show() {
        open = true;
    }

	export let announcer: Announcer|null = null;
</script>

<Popup bind:open>
	<span slot="title">Asetukset</span>
	<div slot="content" class="content">
		<h3>Tili</h3>
		<div class="section">
			{#if $auth}
				<p>Kirjautuneena sisään: <b>{$auth.displayName || $auth.email}</b></p>
				<a href="/auth">Hallinnoi kirjautumista</a>
			{:else}
				{#if $auth === undefined}
	                <p style="text-align: center;display: block;padding: 0.75em;">Tarkistetaan tietoja</p>
	            {:else}
	                <button on:click={()=>{window.location.href="/auth"}} class="button action-btn" style="width: 100%;">Kirjaudu sisään</button>
	            {/if}
			{/if}
		</div>
		<h3>Teema</h3>
		<div class="section">
			<div style="height: 55px;">
				<ThemeChooser relative={false} expandY={false} expandX={true} />
			</div>
		</div>
		<h3>
			Huomautus
		</h3>
		<div class="section">
			Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu minkäänlaiseen paremmuusjärjestykseen. Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.
		</div>
		<h3>Käytetyt avoimen lähdekoodin kirjastot ja lopputekstit :)</h3>
		<div class="section credits">
			<p>
				Alkuperäisen projektin <a href="https://github.com/gabrielecirulli/2048" target="_blank">2048</a> on tehnyt <a href="http://gabrielecirulli.com" target="_blank">Gabriele Cirulli.</a>
			</p>
			<p>
				Projektin perustana toimii <a href="https://kit.svelte.dev/">Sveltekit</a>.
			</p>
			<p>
	            Made by <a target="_blank" href="https://hallabois.github.io/invite">Hallabois</a>
			</p>
			<p>
				TODO: lisää lisää
			</p>
		</div>
		<hr />
		<div>
			<a href="https://github.com/hallabois/OispaHalla" target="_blank">Lähdekoodi</a>
            <a href="https://simpleanalytics.com/oispahalla.com" target="_blank">Simpleanalytics</a>
		</div>
	</div>
</Popup>

<style>
	h3 {
		margin: 0;
		border-bottom: 1px solid var(--color);
	}
	a, p {
		margin: 0;
	}
	.section {
		margin-block: 1em;
		max-width: 550px;
	}
	.credits {
		text-align: center;
	}
</style>