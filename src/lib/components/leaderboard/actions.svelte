<script lang="ts">
	import { auth } from "$lib/Auth/authstore";

	import Popup from "$lib/components/common/popup/popup.svelte";
	import type Announcer from "$lib/components/tournaments/announcer.svelte";
	import { setItem, getItem } from "$lib/stores/storage";

	export let open = false;

	export function show() {
		open = true;
	}

	function forceSend() {
		console.info("forcesend");
		open = false;
		startSubmitting(current_size);
	}

	function forceForget() {
		console.info("forceforget");
		markAsSubmitted(current_size);
	}

	function forceForgetLocalHAC() {
		console.info("start resetting local hac score");
		setItem(`HAC_best_score${current_size}`, 0);
	}

	function forceForgetLocalScore() {
		console.info("start resetting local score");
		if (!confirm("Oletko varma?")) {
			alert("Muutoksia ei tehty.");
			return;
		}
		setItem(`HAC_best_score${current_size}`, 0);
		setItem(`bestScores`, {
			...(getItem("bestScores") || {}),
			[current_size]: 0
		});
		setItem(`lb_submitted`, {
			...(getItem("lb_submitted") || {}),
			[current_size]: 0
		})
		console.info("local score reset");
		alert("Paikalliset pisteet poistettu!");
		location.reload();
	}

	function restoreBackup() {
		console.info("start restoring localstorage");
	}

	export let markAsSubmitted = (s: number) => {};
	export let startSubmitting = (s: number) => {};
	export let sizes: number[];
	export let current_size: number;

	export let announcer: Announcer | null = null;
</script>

<Popup bind:open>
	<span slot="title">Lisäasetukset</span>
	<div slot="content" class="content">
		<div>
			<p>Käytä näitä nappeja vain tarvittaessa!</p>
			<p>Niiden toimintaa ei ole välttämättä tarkastettu läpikotaisin.</p>
			<p>Vaikutat tällä hetkellä koon {current_size} tuloksiin.</p>
		</div>
		<button
			class="button action-btn"
			on:click={() => {
				forceSend();
			}}>Yritä pakottaa pisteiden lähettäminen</button
		>
		<button
			class="button action-btn"
			on:click={() => {
				forceForget();
			}}>Merkitse pisteet lähetetyiksi</button
		>
		<button
			class="button action-btn"
			on:click={() => {
				forceForgetLocalScore();
			}}>Poista paikalliset pisteet</button
		>
	</div>
</Popup>

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
	p {
		margin: 0;
	}
</style>
