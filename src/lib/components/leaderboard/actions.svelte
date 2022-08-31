<script lang="ts">
	import { auth, token } from "$lib/Auth/authstore";
	import { lb_screenName, check_name, change_name } from "$lib/stores/leaderboardstore";

	import Popup from "$lib/components/common/popup/popup.svelte";
	import type Announcer from "$lib/components/tournaments/announcer.svelte";

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
        </div>
		<button class="button action-btn" on:click={()=>{forceSend()}}>Yrittä pakottaa pisteiden lähettäminen</button>
		<button class="button action-btn" on:click={()=>{forceForget()}}>Merkitse pisteet lähetetyiksi</button>
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
