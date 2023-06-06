<script lang="ts">
	import { onMount } from "svelte";
	import Popup from "$lib/components/common/popup/popup.svelte";

	import Content from "$lib/components/multiplayer/menu.svelte";

	import { joined_game_id, tournament_announcer } from "$lib/stores/multiplayerstore";
	import type Announcer from "$lib/components/common/announcer/announcer.svelte";

	export let open = false;
	export function show() {
		open = true;
	}
	export let indicator_game_ready: boolean = false;

	export let announcer: Announcer | null = null;

	$: if ($joined_game_id != null && !window.location.href.endsWith("/moninpeli")) {
		if (open) {
			console.log("Moving to multiplayer...");
			window.location.href = `/moninpeli`;
		} else {
			indicator_game_ready = true;
		}
	} else {
		indicator_game_ready = false;
	}
	onMount(() => {
		if (announcer) {
			$tournament_announcer = announcer;
		}
	});
</script>

<Popup bind:open>
	<span slot="title">Moninpeli</span>
	<div slot="content">
		<Content {announcer} />
	</div>
</Popup>

<style>
</style>
