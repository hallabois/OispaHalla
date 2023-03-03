<script lang="ts">
	import {
		joined_game_id,
		request_deletion,
		request_leave,
		user_details,
		game_details,
		gamemode_0_names,
		name_cache,
		send_message,
		chat,
		request_start,
		request_kick
	} from "$lib/stores/tournamentstore";
	import Board from "../board/board.svelte";
	import { hac_gamestate_to_grid, ohts_gamestate_to_grid } from "$lib/gamelogic/utils";
	import type Announcer from "./announcer.svelte";
	import { browser } from "$app/environment";
	import Popup from "../common/popup/popup.svelte";

	export let announcer: Announcer | null = null;
	let inputRoot: HTMLElement;

	let message_input: string;
	let player_list_open = false;

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

<div bind:this={inputRoot}>
	{#if $joined_game_id && $user_details}
		{@const game_data = $game_details[$joined_game_id]}
		{#if !game_data}
			<p>Ladataan pelin tietoja...</p>
		{:else}
			{@const am_host = $user_details.admin || $user_details.id === game_data.creator_id}
			{#if game_data.winner_id}
				{@const winner_name = ($name_cache || {})[game_data.winner_id]}
				<h3 style="margin: 0;">Peli "{game_data.name}" on päättynyt</h3>
				<div class="winner-announcement">
					<h2>Voittaja:</h2>
					<h1>{winner_name}</h1>
					<button
						class="button action-btn"
						on:click={() => {
							$joined_game_id = null;
						}}>Takaisin valikkoon</button
					>
				</div>
			{:else}
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
							<Board
								enableLSM={false}
								grid={ohts_gamestate_to_grid(game_data.starting_state)}
								documentRoot={inputRoot}
								enable_theme_chooser={false}
							/>
						</div>
					</div>
					<div>
						<button
							class="button action-btn players"
							on:click={() => {
								player_list_open = true;
							}}
						>
							{game_data.clients.length}/{game_data.max_clients}
							{game_data.clients.length == 1 ? "pelaaja" : "pelaajaa"}
						</button>
						<div class="chat-window">
							<form
								on:submit|preventDefault={() => {
									send_message(message_input);
									message_input = "";
								}}
							>
								<input bind:value={message_input} placeholder="Kirjoita viesti" /><input
									type="submit"
									value="Lähetä"
									disabled={message_input == null || message_input.length < 1}
								/>
							</form>
							<div class="messages">
								{#if $name_cache == null}
									<p>Ladataan nimiä....</p>
								{/if}
								{#if $chat}
									{#each [...$chat].reverse() as msg}
										{@const cached_name = ($name_cache || {})[msg.user_id]}
										{@const name = cached_name
											? cached_name.split(" ")[0]
											: msg.user_id.substring(0, 5)}
										<p>{name}: {msg.content}</p>
									{/each}
								{:else}
									<p>...</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
				{#if am_host}
					<div class="start">
						<button
							style="width:100%;"
							class="button action-btn"
							on:click={() => {
								request_start(game_data.id);
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

			<Popup bind:open={player_list_open}>
				<span slot="title">Liittyneet pelaajat</span>
				<div slot="content" class="player-list">
					{#each game_data.clients as player_id}
						{@const cached_name = ($name_cache || {})[player_id]}
						{@const name = cached_name || player_id}
						<p title={player_id}>
							{name}
							{#if player_id === $user_details.id}
								(sinä)
							{:else if am_host}
								<button
									on:click={() => {
										request_kick(game_data.id, player_id);
									}}>×</button
								>
							{/if}
						</p>
					{/each}
					{#if $name_cache == null}
						<p class="status">Ladataan nimiä...</p>
					{:else}
						<p class="status">Nimet ladattu.</p>
					{/if}
				</div>
			</Popup>
		{/if}
	{:else}
		<p>Ladataan kirjautumistietoja...</p>
	{/if}
</div>

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
			calc(
					var(--field-width, var(--default-field-width)) -
						calc(var(--grid-gap) * calc(var(--grid-size) + 1))
				) / var(--grid-size)
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
	.players {
		margin-block: 0.5em;
	}
	.messages {
		overflow-y: scroll;
	}
	.messages p {
		word-wrap: anywhere;
		max-width: 300px;
		margin: 0;
	}
	.start {
		margin-top: 1em;
	}
	.player-list {
		min-height: 300px;
		display: flex;
		gap: 0.5em;
		flex-wrap: wrap;
		align-items: start;
		flex-direction: column;
		max-height: 75vh;
	}
	.player-list p {
		margin: 0;
	}
	.player-list .status {
		opacity: 0.75;
		place-self: end;

		flex: 1;
		display: flex;
		justify-content: end;
		align-items: end;
	}
	hr {
		margin-block: 0.25em;
	}

	.winner-announcement {
		display: flex;
		flex-direction: column;

		justify-content: center;
		align-items: center;

		min-height: max(75vh, 500px);
	}
	.winner-announcement > * {
		margin: 0;
	}
</style>
