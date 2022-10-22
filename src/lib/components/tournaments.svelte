<script lang="ts">
	import { onMount } from "svelte";

	import { auth } from "$lib/Auth/authstore";

	import Popup from "$lib/components/common/popup/popup.svelte";

	import Content from "$lib/components/tournaments/menu.svelte";

	import { connected, connect, joined_game_id } from "$lib/stores/tournamentstore";
	import TournamentCreator from "./tournaments/tournamentCreator.svelte";
	import TournamentBrowser from "./tournaments/tournamentBrowser.svelte";
	import Lobby from "./tournaments/lobby.svelte";
	import TournamentJoiner from "./tournaments/tournamentJoiner.svelte";
	import type Announcer from "./tournaments/announcer.svelte";

	export let open = false;
	export function show() {
		open = true;
	}

	export let announcer: Announcer | null = null;

	$: if ($joined_game_id != null && !window.location.href.endsWith("/moninpeli")) {
		console.log("Moving to multiplayer...");
		window.location.href = `/moninpeli`;
	}

	let activeTab = 0;
</script>

<Popup bind:open>
	<span slot="title">Moninpeli</span>
	<div slot="content">
		<Content {announcer} />
	</div>
</Popup>

<style>
</style>
