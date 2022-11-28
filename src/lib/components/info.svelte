<script lang="ts">
	import { dev } from "$app/environment";
	import Popup from "./common/popup/popup.svelte";
	// import type Announcer from "./tournaments/announcer.svelte";

	let open = false;
	export function show() {
		open = true;
	}

	// export let announcer: Announcer | null = null;
</script>

<Popup bind:open>
	<span slot="title" class="title"
		>OispaHalla <span class="version">v.{__APP_VERSION__}</span>
		{#if dev}
			<span class="badge">dev</span>
		{/if}
	</span>
	<div slot="content" class="content">
		<div class="section notice">
			<p>
				Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu
				minkäänlaiseen paremmuusjärjestykseen.
			</p>
			<p>Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.</p>
		</div>
		<div class="section credits">
			<p>
				Alkuperäisen projektin <a
					href="https://github.com/gabrielecirulli/2048"
					target="_blank"
					rel="noreferrer">2048</a
				>
				on tehnyt
				<a href="http://gabrielecirulli.com" target="_blank" rel="noreferrer">Gabriele Cirulli.</a>
			</p>
			<p>
				Projektin perustana toimii <a
					href="https://kit.svelte.dev/"
					target="_blank"
					rel="noreferrer">Sveltekit</a
				>.
			</p>
			<!--
                TODO: lisää lisää
            -->
		</div>
		<div class="links">
			<a href="https://github.com/hallabois/OispaHalla" target="_blank" rel="noreferrer"
				>Lähdekoodi</a
			>
			<a href="https://simpleanalytics.com/oispahalla.com" target="_blank" rel="noreferrer"
				>Simpleanalytics</a
			>
			<a href="https://hallabois.github.io/invite" target="_blank" rel="noreferrer">Discord</a>
		</div>
	</div>
</Popup>

<style>
	.title {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.2em;
	}
	a,
	p {
		margin: 0;
	}
	.section {
		margin-block: 1em;
		max-width: 550px;
	}
	.notice {
		text-align: center;
	}
	.credits {
		text-align: center;
	}
	.links {
		text-align: center;
		display: flex;
		justify-content: space-evenly;
		margin-top: 20px;
	}
	.version {
		opacity: 0.5;
	}
	.badge {
		font-size: 0.75em;
	}
</style>
