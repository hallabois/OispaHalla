<script lang="ts">
	import {
		joined_game_id,
		request_deletion,
		request_leave,
		user_details,
		game_details,
		gamemode_0_names,
		request_game_details,
		send_message,
		chat
	} from "$lib/stores/tournamentstore";
	import Board from "../board/board.svelte";
	import { hac_gamestate_to_grid, ohts_gamestate_to_grid } from "$lib/gamelogic/utils";
	import { token } from "$lib/Auth/authstore";
	import type Announcer from "./announcer.svelte";
	import { browser } from "$app/environment";

	export let announcer: Announcer | null = null;

	let message_input: string;

	function shareGameID() {
		navigator.share({
			title: "Kutsu OispaHalla -peliin",
			text: `Liity mukaan OispaHalla -peliini koodilla ${$joined_game_id} tai alla olevan linkin kautta.`,
			url: `https://oispahalla.com/moninpeli?game_id=${$joined_game_id}`
		});
	}
	function copyGameID() {
		if (announcer) {
			navigator.clipboard.writeText(
				`${window.location.origin}/moninpeli?game_id=${$joined_game_id}`
			);
			announcer.announce("Liittymislinkki kopioitu!");
		}
	}
</script>

<main>
	{#if $joined_game_id && $user_details}
		{@const game_data = $game_details[$joined_game_id]}
		{#if !game_data}
			{@const _ = request_game_details($joined_game_id)}
			<p>Ladataan pelin tietoja...</p>
		{:else}
			{@const am_host = $user_details.admin || $user_details.user_id == game_data.creator_id}
			<div class="top">
				<button
					class=""
					on:click={() => {
						if ($joined_game_id) request_leave($joined_game_id);
					}}>Poistu Pelistä</button
				>
				{#if am_host}
					Järjestäjä 👑
					<button
						class=""
						on:click={() => {
							if ($joined_game_id) request_deletion($joined_game_id);
						}}
					>
						Poista Peli
					</button>
				{/if}
			</div>
			<hr />
			{#if game_data}
				<p>Liitytty peliin "{game_data.name}"</p>
				<p>
					Liittymiskoodi: <code>{$joined_game_id}</code>
					{#if navigator.clipboard}
						<button on:click={copyGameID}>Kopioi linkki</button>
					{/if}
					{#if browser && navigator.share}
						<button on:click={shareGameID}>Jaa kutsu</button>
					{/if}
				</p>
				{#if game_data.gamemode == 0}
					<p style="max-width:430px;">
						Pelaaja joka saavuttaa ensimmäisenä laatan <b style="white-space: nowrap;"
							>{game_data.gamemode_goal} ({gamemode_0_names[+game_data.gamemode_goal]})</b
						> voittaa.
					</p>
				{/if}
				<div class="data">
					<div>
						<h3>Aloitustilanne</h3>
						<div class="game-preview">
							<Board enableLSM={false} grid={ohts_gamestate_to_grid(game_data.starting_state)} />
						</div>
					</div>
					<div>
						<h4>
							{game_data.clients.length}
							{game_data.clients.length == 1 ? "pelaaja" : "pelaajaa"}
						</h4>
						<div class="chat-window">
							<!-- <div style="max-height:300px;overflow-y: auto;">
								{#each game_data.clients as player_id}
									<p title={player_id}>
										{player_id.substring(0, 5)}
										{#if player_id === $user_details.user_id}
											(sinä)
										{/if}
									</p>
								{/each}
							</div> -->
							<input bind:value={message_input} placeholder="Kirjoita viesti" /><button
								on:click={() => {
									send_message(message_input);
									message_input;
								}}
								disabled={message_input == null || message_input.length < 1}>lähetä</button
							>
							<div class="messages">
								{#each [...$chat].reverse() as msg}
									<p>{msg.sender.substring(0, 5)}: {msg.message}</p>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{:else}
				<p>Ladataan pelin tietoja...</p>
				<div class="data">
					<div>
						<h3>...</h3>
						<div class="game-preview" />
					</div>
					<div>
						<h3>...</h3>
					</div>
				</div>
			{/if}
			{#if am_host}
				<div class="start">
					<button
						style="width:100%;"
						class="button action-btn"
						on:click={() => {
							// Start
						}}
						disabled={game_data.started || game_data.ended}
					>
						{game_data.ended
							? "Peli on päättynyt!"
							: game_data.started
							? "Peli on alkanut!"
							: "Aloita Peli"}
					</button>
				</div>
			{:else}
				<div class="start">
					<p style="width: 100%;text-align:center;">
						{game_data.ended
							? "Peli on päättynyt!"
							: game_data.started
							? "Peli on alkanut!"
							: "Odotetaan pelin alkua..."}
					</p>
				</div>
			{/if}
		{/if}
	{:else}
		<p>Ladataan kirjautumistietoja...</p>
	{/if}
</main>

<style>
	.top {
		display: flex;
		justify-content: space-between;
	}
	.data {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
	}
	.game-preview {
		--field-width: 300px !important;
		--tile-size: calc(
			calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) /
				var(--grid-size)
		);
		overflow: hidden;
		display: block;
		width: 300px;
		height: 300px;
		border-radius: 6px;
	}
	.chat-window {
		max-height: 300px;
		display: flex;
		flex-direction: column;
	}
	.messages {
		overflow-y: scroll;
	}
	.messages p {
		max-width: 10em;
		margin: 0;
	}
	.start {
		margin-top: 1em;
	}
	hr {
		margin-block: 0.25em;
	}
</style>
