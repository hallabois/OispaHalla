<script lang="ts">
	import Popup from "$lib/components/common/popup/popup.svelte";
	import type Announcer from "$lib/components/common/announcer/announcer.svelte";
	import { setItem, getItem } from "$lib/stores/storage";
	import { type GameSize, active_size_safe } from "$lib/gamelogic/new";

	export let open = false;

	export function show() {
		open = true;
	}

	function forceSend() {
		console.info("forcesend");
		open = false;
		startSubmitting($active_size_safe);
	}

	function forceForget() {
		console.info("forceforget");
		markAsSubmitted($active_size_safe);
	}

	function forceForgetLocalHAC() {
		console.info("start resetting local hac score");
		setItem(`HAC_best_score${$active_size_safe}`, 0);
		console.info("hac score reset");
	}

	function forceForgetLocalScore() {
		console.info("start resetting local score");
		setItem(`HAC_best_score${$active_size_safe}`, 0);
		setItem(`bestScores`, {
			...(getItem("bestScores") || {}),
			[$active_size_safe]: 0
		});
		setItem(`lb_submitted`, {
			...(getItem("lb_submitted") || {}),
			[$active_size_safe]: 0
		});
		console.info("local score reset");
		alert("Paikalliset pisteet poistettu!");
		location.reload();
	}

	function restoreBackup() {
		console.info("start restoring localstorage");
	}

	function forgetAllScores() {
		if (!confirm("Oletko varma?")) {
			alert("Muutoksia ei tehty.");
			return;
		}
		forceForgetLocalScore();
		forceForgetLocalHAC();
	}

	export let markAsSubmitted = (s: GameSize) => {};
	export let startSubmitting = (s: GameSize) => {};

	export const announcer: Announcer | null = null;
</script>

<Popup bind:open>
	<span slot="title">Lisäasetukset</span>
	<div slot="content" class="content">
		<div>
			<p>Käytä näitä nappeja vain tarvittaessa!</p>
			<p>Niiden toimintaa ei ole välttämättä tarkastettu läpikotaisin.</p>
			<p><b>Vaikutat tällä hetkellä koon {$active_size_safe} tuloksiin.</b></p>
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
				forgetAllScores();
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
