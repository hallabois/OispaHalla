<script lang="ts">
	import { browser, dev } from '$app/env';
	import { auth } from '$lib/Auth/authstore';
	import Popup from "$lib/components/common/popup/popup.svelte";

	let token: string | null;
	$: if($auth) {
		$auth.getIdToken(true).then((t)=>{
			token = t;
		});
	}

	let validation_result: Response | null;
	async function validate() {
		validation_result = null;
		validation_result = await fetch("/auth/validate", {
			method: "POST",
			body: JSON.stringify({
				token: token
			})
		});
	}

	let email_popup_open = false;
	let email: string | null;
	let email_submitting = false;
	$: email_valid = email != null && email.endsWith("@ksyk.fi");

	async function log_in_with_email() {
		if(email && email_valid) {
			email_submitting = true;
			let result = await auth.sendSignInLink(email, window.location.origin);
			email_submitting = false;
			if(result) {
				try{
					window.localStorage.setItem('emailForSignIn', email);
				}catch{};
				alert("Linkki lähetetty!\nMuistathan tarkistaa roskaposti-kansion.\n\nVoit poistua tältä sivulta toistaiseksi.");
			}
			else {
				alert("Virhe.");
			}
		}
	}

	let help_open = false;
</script>

<main>
	{#if browser}
		{#if $auth === undefined}
			<p>Tarkistetaan tietoja...</p>
		{:else}
			{#if $auth === null}
				<Popup bind:open={email_popup_open}>
					<span slot="title">Kirjaudu sisään sähköpostilla</span>
					<div slot="content">
						<small>Toistaiseksi vain ksyk.fi -sähköpostit ovat sallittuja</small>
						<div style="display: flex;gap: .5em;flex-wrap: wrap;">
							<input bind:value={email} placeholder="sähköposti" style="flex:1;font-size: 1em;">
							<button disabled={!email_valid || email_submitting} on:click={log_in_with_email} class="button action-btn" style="width: 100%;">
								{email_submitting ? "Lähetetään" : "Kirjaudu sisään"}
							</button>
						</div>
					</div>
				</Popup>
				<h1>Kirjaudu sisään</h1>
				<div class="actions">
					<button class="button action-btn" on:click={() => auth.signInWith('google')}>Googlella</button>
					<button class="button action-btn" on:click={() => email_popup_open = true}>Sähköpostilla</button>
				</div>
				<a href="#help" on:click={()=>{help_open = true}}>Ongelmia kirjautumisessa?</a>
				<Popup bind:open={help_open}>
					<span slot="title">Kirjautumisesta</span>
					<div slot="content">
						<b>Jos käytät firefoxia, tai muuta selainta jossa evästeet eristetään sivustokohtaisesti</b>
						<p>Laita evästeiden eristys pois päältä.</p>
						<p style="margin: 0;">Firefoxissa:</p>
						<ol style="margin: 0;">
							<li>Paina sivuston osoitteen vasemmalla puolella olevasta kilvestä</li>
							<li>Laita tehostettu seurannan suojaus pois päältä</li>
						</ol>
						<p>Muita ongelmia? <a href="mailto:oispahalla@eliaseskelinen.fi">Ota yhteyttä kehittäjiin</a></p>
					</div>
				</Popup>
			{:else}
				<h1>Hei, {$auth.displayName || $auth.email}</h1>
				{#if $auth.displayName}
					<h3>({$auth.email})</h3>
				{/if}
				<div class="actions">
					<button class="button action-btn" on:click={() => {if(confirm("Oletko varma?")){auth.signOut();}}}>
		             	Kirjaudu Ulos
		            </button>
					{#if dev}
						{#if token}
							<button class="button action-btn" on:click={validate}>Validoi</button>
						{:else}
							<button class="button action-btn" disabled>Ladataan...</button>
						{/if}
					{/if}
	            </div>
	            {#if validation_result}
					{#if validation_result.ok}
						{#await validation_result.json()}
							<p>{validation_result.status}: ladataan dataa...</p>
						{:then data}
							<p>Kaikki OK</p>
						{/await}
					{:else}
						<div style="text-align: center;">
							<p>Virhe.</p>
							{#await validation_result.json()}
								<p>{validation_result.status}: ladataan dataa...</p>
							{:then data}
								<p class="error">{data.message}</p>
							{/await}
						</div>
					{/if}
	            {/if}
			{/if}
		<a href="/">Takaisin OispaHallaan</a>
		{/if}
	{:else}
		<p>Ladataan...</p>
	{/if}
</main>

<style>
	h1 {
		margin: 0;
	}
	h3 {
		margin: 0;
		opacity: .5;
		margin-top: -.5em;
	}
	main {
		background: var(--background);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		padding-inline: .5em;
		gap: .5em;

		min-height: 100vh;
	}

	.error {
		background-color: #111;
		color: red;
		padding: .2em 1em;
		border-radius: .25rem;
	}
</style>