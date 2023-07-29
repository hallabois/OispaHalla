<script lang="ts">
	import { auth } from "$lib/Auth/authstore";
	import { get_user_db, type DB } from "$lib/Firestore/db";
	import type GameManager from "$lib/gamelogic/game_manager";

	import Popup from "./common/popup/popup.svelte";
	import ThemeChooser from "./common/theme-chooser/themeChooser.svelte";
	import type Announcer from "./common/announcer/announcer.svelte";
	import Icon from "./common/icon/icon.svelte";
	import { deleteIconData, downloadIconData, uploadIconData } from "./common/icon/iconData";
	import { dev } from "$app/environment";
	import Busy from "./common/loading-indicator/Busy.svelte";
	import { leaderboard_endpoint, mp_default_endpoint } from "$lib/config";
	import { score } from "$lib/gamelogic/new";

	let open = false;
	export function show() {
		open = true;
	}

	let db: DB;
	$: if ($auth) {
		db = get_user_db($auth.uid);
	}

	let syncing = false;
	async function upload() {
		if (syncing) {
			announcer.announce("Aikaisempi siirto on vielä kesken");
			return;
		}
		if (true || confirm("Kun peli on ladattu pilveen, se poistetaan tältä laitteelta")) {
			syncing = true;
			let serialized = GameManagerInstance.serialize();
			announcer.announce("Siirretään peliä...");
			await db.uploadGame(serialized);
			announcer.announce("Peli siirrettiin pilveen!");
			GameManagerInstance.restart();
			announcer.announce("Paikallinen peli pyyhitty.");
			syncing = false;
		} else {
			announcer.announce("Pelin siirto peruutettu");
		}
	}

	async function download() {
		if (syncing) {
			announcer.announce("Aikaisempi siirto on vielä kesken");
			return;
		}
		if (
			true ||
			confirm("Pilveen tallennettu peli korvaa paikallisen pelin ja peli poistetaan pilvestä")
		) {
			let cloudstate = $db.data().gamestate;
			if (cloudstate) {
				syncing = true;
				announcer.announce("Korvataan paikallista peliä...");
				let parsed = JSON.parse(cloudstate);
				GameManagerInstance.loadPreviousState(parsed);
				GameManagerInstance.actuate();
				announcer.announce("Pyyhitään peliä pilvestä...");
				await db.clearGame();
				announcer.announce("Siirto valmis!");
				syncing = false;
			} else {
				announcer.announce("Peliä ei löytynyt pilvestä?");
			}
		} else {
			announcer.announce("Pelin siirto peruutettu");
		}
	}

	async function del() {
		if (
			confirm("Haluatko varmasti poistaa pilveen tallennetun pelin?") &&
			confirm("Oletko 100% varma? Et saa peliä enää mitään kautta takaisin.")
		) {
			let cloudstate = $db.data().gamestate;
			if (cloudstate) {
				announcer.announce("Pyyhitään peliä pilvestä...");
				await db.clearGame();
				announcer.announce("Tallennettu peli poistettu!");
			} else {
				announcer.announce("Peliä ei löytynyt pilvestä?");
			}
		} else {
			announcer.announce("Pelin poisto peruutettu");
		}
	}

	export let announcer: Announcer;
	export let GameManagerInstance: GameManager;
</script>

<Popup bind:open>
	<span slot="title" class="title">
		<!-- svelte-ignore missing-declaration __APP_VERSION__ should be defined in vite.config.ts -->
		OispaHalla <span class="version">v.{__APP_VERSION__}</span>
		{#if dev}
			<span class="badge">dev</span>
		{/if}
	</span>
	<div slot="content" class="content">
		<div class="settings">
			<h3>Pilvitallennus</h3>
			<div class="section remote">
				{#if $auth}
					{#if $db}
						{@const userdata = $db.data()}
						{#if syncing}
							<p class="cloud-notice">Siirto meneillään...</p>
							<progress />
						{:else if userdata?.gamestate != null}
							{@const oldData = JSON.parse(userdata.gamestate)}
							{@const canDownload = $score || 0 < 100}
							<div class="run-details">
								<p>{oldData.score} pistettä</p>
								<p>{oldData.palautukset} kurinpalautusta</p>
								<p>{oldData.history.length} siirtoa</p>
							</div>
							{#if !canDownload}
								<p class="cloud-notice">
									pelaa nykyinen peli loppuun ennen pelin siirron aloittamista
								</p>
							{/if}
							<div class="actions">
								<button
									class="button action-btn"
									disabled={!canDownload}
									on:click={() => {
										if (canDownload) {
											download();
										}
									}}
									><Icon
										d={downloadIconData}
										viewBox="0 0 48 48"
										fill="var(--button-color)"
									/></button
								>
								<button
									class="button action-btn discourage"
									on:click={() => {
										del();
									}}><Icon d={deleteIconData} viewBox="0 0 48 48" /></button
								>
							</div>
						{:else}
							<p class="cloud-notice">Pilvestä ei löytynyt pelejä</p>
							<button
								class="button action-btn"
								on:click={() => {
									upload();
								}}
								><Icon d={uploadIconData} viewBox="0 0 48 48" fill="var(--button-color)" /></button
							>
						{/if}
					{:else}
						<Busy>
							<p class="cloud-notice">Ladataan pilvitallennuksia...</p>
						</Busy>
					{/if}
				{:else if $auth === undefined}
					<p class="cloud-notice">...</p>
				{:else}
					<p class="cloud-notice">Kirjaudu sisään tallentaaksesi pelejä pilveen</p>
				{/if}
			</div>
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
		<div class="info">
			<details>
				<summary>
					<h3 style="display: inline-block;">Tietoja pelistä</h3>
				</summary>
				<div class="section notice">
					<p>
						Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu
						minkäänlaiseen paremmuusjärjestykseen.
					</p>
					<p>
						Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.
					</p>
				</div>
				<div class="section credits">
					<p>
						Alkuperäisen projektin <a
							href="https://github.com/gabrielecirulli/2048"
							target="_blank"
							rel="noreferrer">2048</a
						>
						on tehnyt
						<a href="http://gabrielecirulli.com" target="_blank" rel="noreferrer"
							>Gabriele Cirulli.</a
						>
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
			</details>
		</div>
		{#if dev}
			<div class="debug">
				<details>
					<summary>
						<h3 style="display: inline-block;">Kehittäjäasetukset</h3>
					</summary>
					<div class="section dev">
						<b>Endpoints</b>
						<div>
							<p>lb: {leaderboard_endpoint}</p>
							<p>mp: {mp_default_endpoint}</p>
						</div>
						<b>Actions</b>
						<div class="actions">
							<button
								class="button action-btn"
								on:click={() => {
									throw new Error("error for testing purposes ;)");
								}}>luo virhe</button
							>
						</div>
					</div>
				</details>
			</div>
		{/if}
	</div>
</Popup>

<style>
	.content {
		max-width: 45ch;
	}
	.actions {
		display: flex;
		gap: 0.75em;
	}
	h3 {
		margin: 0;
		margin-top: 0.5em;
		border-bottom: 1px solid var(--color);
		border-bottom: 1px solid color-mix(in srgb, var(--color) 25%, transparent 75%);
	}
	a,
	p {
		margin: 0;
	}
	.section {
		margin-top: 0.25em;
		max-width: 550px;
	}
	.cloud-notice {
		text-align: center;
	}
	.remote,
	.dev {
		display: flex;
		flex-direction: column;
		gap: 0.5em;

		justify-content: center;
		align-items: center;
	}
	.run-details {
		gap: 1ch;
		display: flex;
		flex-wrap: wrap;

		justify-content: center;
		align-items: center;
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

	summary {
		cursor: pointer;
	}
</style>
