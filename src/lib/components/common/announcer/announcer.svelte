<script lang="ts">
	import Message from "./announcerMessage.svelte";

	type announcement = {
		msg: string;
		time: Date;
	};
	let announcements: announcement[] = [];

	export function announce(msg: string) {
		console.info("ANNOUNCER announcing", msg);
		announcements.push({
			msg: msg,
			time: new Date()
		});
		announcements = announcements;
		setTimeout(() => {
			announcements.shift();
			announcements = announcements;
		}, 3550);
	}
</script>

<div class="main">
	{#each announcements as announcement (announcement.time)}
		<Message {...announcement} />
	{/each}
</div>

<style>
	.main {
		z-index: 217;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;

		display: flex;
		gap: 0.1em;
		flex-direction: column;
	}
</style>
