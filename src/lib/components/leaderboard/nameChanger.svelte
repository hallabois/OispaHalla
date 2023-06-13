<script lang="ts">
	import { auth, token } from "$lib/Auth/authstore";
	import { lb_screenName, check_name, change_name } from "$lib/stores/leaderboard";

	import Popup from "$lib/components/common/popup/popup.svelte";
	import type Announcer from "$lib/components/common/announcer/announcer.svelte";

	export let open = false;
	let name_in_progress: string | null;

	let checking_name = false;
	let name_valid = false;

	let status: string | null;
	export function show() {
		name_in_progress = $lb_screenName;
		open = true;
	}
	export async function save() {
		if (!name_valid || !$token) {
			return;
		}
		if (name_in_progress === $lb_screenName) {
			if (announcer != null) {
				announcer.announce("Nimimerkki ei muuttunut.");
			}
			open = false;
			return;
		}
		try {
			let resp = await change_name(name_in_progress, $token);
			if (announcer != null) {
				announcer.announce(resp.message);
			}
			lb_screenName.set(name_in_progress);
			open = false;
			callback();
		} catch (e) {
			if (announcer != null) {
				announcer.announce(`Virhe: ${e}`);
			}
		}
	}
	let names_checked = {};
	$: if (
		name_in_progress != null &&
		name_in_progress != "null" &&
		$auth &&
		$auth.uid &&
		$token != null
	) {
		if (!checking_name) {
			if (names_checked[name_in_progress] != null) {
				name_valid = names_checked[name_in_progress];
			} else {
				checking_name = true;
				check_name(name_in_progress, $auth.uid).then((valid) => {
					names_checked[name_in_progress] = valid;
					checking_name = false;
					name_valid = valid;
				});
			}
		}
		status = checking_name ? "Tarkistetaan..." : name_valid ? "Nimi OK" : "Virheellinen nimi";
	}

	$: name_in_progress = name_in_progress?.trim();

	export let callback: () => void = () => {};

	export let announcer: Announcer | null = null;
</script>

<Popup bind:open>
	<span slot="title">Muuta nimimerkkiä</span>
	<div slot="content" class="content">
		{#if $auth && $auth.uid}
			<p>Tahalteen muita loukkaavien nimimerkkien käyttö johtaa porttikieltoon.</p>

			<!-- svelte-ignore a11y-autofocus -->
			<input bind:value={name_in_progress} autofocus />
			<p>{status || ""}</p>
			<div class="buttons">
				<button
					class="button action-btn"
					on:click={() => {
						open = false;
					}}>Peruuta</button
				>
				<button disabled={checking_name || !name_valid} class="button action-btn" on:click={save}
					>Tallenna</button
				>
			</div>
		{:else}
			<p>Ladataan tietoja....</p>
		{/if}
	</div>
</Popup>

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
	.buttons {
		display: flex;
		gap: 1em;
		flex-wrap: wrap;
	}
	.buttons * {
		flex: 1;
	}
	input {
		width: 100%;
		font-size: 1em;
	}
	p {
		margin: 0;
	}
</style>
