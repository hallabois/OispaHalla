<script lang="ts">
	import { auth } from "$lib/Auth/authstore";
	import { get_user_db, type DB } from "$lib/Firestore/db";
	import type GameManager from "$lib/gamelogic/game_manager";

	import Popup from "./common/popup/popup.svelte";
	import ThemeChooser from "./common/theme-chooser/themeChooser.svelte";
	import type Announcer from "./common/announcer/announcer.svelte";
	import Icon from "./common/icon/icon.svelte";
	import { deleteIconData, downloadIconData, uploadIconData } from "./common/icon/iconData";

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
	<span slot="title">Asetukset</span>
	<div slot="content" class="content">
		<h3>Pilvitallennus</h3>
		<div class="section remote">
			{#if $auth}
				{#if $db}
					{@const userdata = $db.data()}
					{#if syncing}
						<p class="cloud-notice">Siirto meneillään...</p>
						<progress />
					{:else if userdata.gamestate != null}
						{@const oldData = JSON.parse(userdata.gamestate)}
						{@const canDownload = GameManagerInstance.score < 100}
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
								class="button action-btn discouradge"
								on:click={() => {
									del();
								}}><Icon d={deleteIconData} viewBox="0 0 48 48" /></button
							>
							{#if canDownload}
								<button
									class="button action-btn"
									on:click={() => {
										download();
									}}
									><Icon
										d={downloadIconData}
										viewBox="0 0 48 48"
										fill="var(--action-btn-color)"
									/></button
								>
							{/if}
						</div>
					{:else}
						<p class="cloud-notice">Pilvestä ei löytynyt pelejä</p>
						<button
							class="button action-btn"
							on:click={() => {
								upload();
							}}><Icon d={uploadIconData} viewBox="0 0 48 48" /></button
						>
					{/if}
				{:else}
					<p class="cloud-notice">Ladataan pilvitallennuksia...</p>
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
</Popup>

<style>
	.content {
		max-width: 45ch;
	}
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
	.cloud-notice {
		text-align: center;
	}
	.remote {
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
</style>
