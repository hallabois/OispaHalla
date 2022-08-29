<script lang="ts">
	import { auth } from "$lib/Auth/authstore";
	import { lb_screenName, check_name } from "$lib/stores/leaderboardstore";

	import Popup from "$lib/components/common/popup/popup.svelte";
	import type Announcer from "$lib/components/tournaments/announcer.svelte";

	export let open = false;
	let name_in_progress: string | null;

	let checking_name = false;
	let name_valid = false;

	let status: string | null;
	export function show() {
		name_in_progress = $lb_screenName;
		open = true;
	}
	export function save() {
		if (!name_valid) {
			return;
		}
		if (name_in_progress === $lb_screenName) {
			announcer.announce("Nimimerkki ei muuttunut.");
			open = false;
			return;
		}
		announcer.announce("Nimimerkki muuttuu seuraavan tallennuksen yhteydessä.");
		lb_screenName.set(name_in_progress);
		open = false;
	}
	let names_checked = {};
	$: if (name_in_progress != null && $auth && $auth.uid) {
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

	export let announcer: Announcer | null = null;
</script>

<Popup bind:open>
	<span slot="title">Muuta nimimerkkiä</span>
	<div slot="content" class="content">
		{#if $auth && $auth.uid}
			<input bind:value={name_in_progress} autofocus />
			<p>{status || ""}</p>
			<button disabled={checking_name || !name_valid} class="button action-btn" on:click={save}
				>Tallenna</button
			>
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
	input {
		width: 100%;
		font-size: 1em;
	}
</style>
