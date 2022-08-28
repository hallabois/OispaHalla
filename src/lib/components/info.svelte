<script lang="ts">
	import Popup from "./common/popup/popup.svelte";
	import type Announcer from "./tournaments/announcer.svelte";

	let open = false;
	export function show() {
		open = true;
	}

	export let announcer: Announcer | null = null;
</script>

<Popup bind:open>
	<span slot="title">OispaHallasta</span>
	<div slot="content" class="content">
		<div class="section notice">
			<p>
				Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu
				minkäänlaiseen paremmuusjärjestykseen.
			</p>
			<p>Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.</p>
		</div>
		<div class="section credits">
			<p>Alkuperäiset teemat ovat tehneet Vinski Lång, Aarni </p>
			<p>
				Alkuperäisen projektin <a href="https://github.com/gabrielecirulli/2048" target="_blank"
					>2048</a
				>
				on tehnyt <a href="http://gabrielecirulli.com" target="_blank">Gabriele Cirulli.</a>
			</p>
			<p>
				Projektin perustana toimii <a href="https://kit.svelte.dev/" target="_blank">Sveltekit</a>.
			</p>
			<p>
				Made by <a target="_blank" href="https://hallabois.github.io/invite">Hallabois</a>
			</p>
			<!--
                TODO: lisää lisää
            -->
		</div>
		<div>
			<a href="https://github.com/hallabois/OispaHalla" target="_blank">Lähdekoodi</a>
			<a href="https://simpleanalytics.com/oispahalla.com" target="_blank">Simpleanalytics</a>
		</div>
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
	.notice {
		text-align: center;
	}
	.credits {
		text-align: center;
	}
</style>
