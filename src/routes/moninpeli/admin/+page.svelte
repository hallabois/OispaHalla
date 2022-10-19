<script lang="ts">
	import {
		connected,
		user_details,
		connect_with_token,
		disconnect,
		game_index,
		request_index,
		try_autoconnect,
		game_details,
		request_game_details
	} from "$lib/stores/tournamentstore";
	import { token } from "$lib/Auth/authstore";
	try_autoconnect.set(false);
	let refreshKey = {};
	let admin_token: string;

	let action_status: null | boolean = null; // Null: Clear, true: OK, false: Error

	function confirm_action() {
		let answer = prompt("Please retype your token");
		return answer === admin_token;
	}

	let selected_game: number | null;
</script>

<svelte:head>
	<title>OHTS Admin Panel</title>
</svelte:head>

<main>
	{#if action_status != null}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="action"
			on:click={() => {
				action_status = null;
			}}
		>
			{#if action_status}
				<p class="success">Action successful!</p>
			{:else}
				<p class="error">Error completing action, check the console for details.</p>
			{/if}
		</div>
	{/if}
	<div class="header">
		<div class="header-bar">
			<h1>OispaHalla™ Multiplayer Admin Panel</h1>
		</div>
		{#if $connected}
			<div class="actions">
				{#if $user_details}
					<p>Logged in as <b>{$user_details.name}</b></p>
					{#if $user_details.admin}
						<button on:click={() => {}}>Delete ALL Games</button>
					{/if}
					<button
						on:click={() => {
							admin_token = "";
							disconnect();
						}}>Log Out</button
					>
					<button
						on:click={() => {
							refreshKey = {};
						}}>Refresh data</button
					>
				{/if}
			</div>
		{/if}
		<hr />
	</div>
	{#if $connected}
		{#key refreshKey}
			{#if $game_index}
				{@const data = $game_index}
				{#if data.joinable_games && data.joinable_games.length > 0}
					{@const games = data.joinable_games}
					<div class="data-view">
						<div class="games">
							<table>
								<thead>
									<tr class="head">
										{#each Object.keys(games[0]) as key}
											<th>{key}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each games as game}
										<tr
											class="game"
											on:click={() => {
												selected_game = game.id;
											}}
											class:selected={selected_game === game.id}
										>
											{#each Object.keys(game) as key}
												<td>{game[key]}</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if selected_game != null}
							<div class="game-inspector">
								{#if $game_details[selected_game] == null}
									<p class="message">Loading game {selected_game}</p>
									{@const _ = request_game_details(selected_game)}
								{:else}
									{@const game_data = $game_details[selected_game]}
									<div style="display: flex;gap: .5em;align-items: center;">
										<button
											on:click={() => {
												selected_game = null;
											}}>×</button
										>
										<h3>Game {selected_game}: "{game_data.name}"</h3>
									</div>
									<div>
										<button
											on:click={() => {
												deleteGame(selected_game || "");
											}}>Delete</button
										>
										{#if !game_data.active}
											<button
												on:click={() => {
													startGame(selected_game || "");
												}}>Start</button
											>
										{/if}
									</div>
									<table>
										{#each Object.keys(game_data) as game_key}
											<tr>
												<td>{game_key}</td>
												<td>{JSON.stringify(game_data[game_key])}</td>
											</tr>
										{/each}
									</table>
								{/if}
							</div>
						{/if}
					</div>
				{:else}
					<div class="content">
						<p>No games atm</p>
					</div>
				{/if}
			{:else}
				{@const _ = request_index()}
			{/if}
		{/key}
	{:else}
		<div class="content sign-in">
			<label for="admin_token">Please sign in</label>
			<!-- svelte-ignore a11y-autofocus -->
			<input id="admin_token" type="password" bind:value={admin_token} autofocus />
			<div>
				{#if token}
					<button
						on:click={() => {
							admin_token = $token;
						}}
					>
						Use your own token
					</button>
				{/if}
				<button
					on:click={() => {
						connect_with_token(admin_token);
					}}
				>
					Connect
				</button>
			</div>
		</div>
	{/if}
</main>

<style>
	:global(html, body) {
		color-scheme: dark;
		background: #222 !important;
		color: #ddd !important;
	}
	.action {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		text-align: center;
		padding-block: 0.5em;

		cursor: pointer;
	}
	.action .success {
		color: #4d4;
	}
	.action .error {
		color: #d44;
	}
	main {
		height: 100vh;
		--header-height: 100px;

		color: #e6d2bf;
	}
	.header {
		height: var(--header-height);
	}
	.header-bar {
		display: flex;
		flex-wrap: wrap;
		padding: 0.5em;
		padding-bottom: 0;
		margin: 0;
		align-items: center;
		justify-content: space-between;
	}
	.actions {
		margin: 0.5em;
		margin-top: 0;

		display: flex;
		gap: 0.5em;
		align-items: center;
	}
	.content {
		flex: 1;
		height: calc(100vh - var(--header-height));

		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.5em;
	}

	.data-view {
		height: calc(100vh - var(--header-height));

		display: flex;
		flex-direction: column;
		/* flex-wrap: wrap; */
	}

	.games {
		flex: 1;
		overflow-x: scroll;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	tbody {
		overflow-y: scroll;
	}
	td,
	th {
		border: 1px solid #e6d2bf22;
		text-align: left;
		padding: 8px;

		overflow: scroll;
	}
	tr:nth-child(even) {
		background-color: #e6d2bf22;
	}
	tr.game {
		cursor: pointer;
	}
	tr.game:hover,
	tr.game.selected {
		background-color: #e6d2bf55;
	}

	.game-inspector {
		flex: 1;

		padding: 1em;
		display: flex;
		flex-direction: column;
		/* flex-wrap: wrap; */

		overflow-y: scroll;

		border-top: 1px solid;
	}
	.game-inspector p.message {
		flex: 1;

		height: 100%;
		width: 100%;

		display: flex;
		justify-content: center;
		align-items: center;

		border-top: 1px solid;
	}

	h1,
	h2,
	h3 {
		margin: 0;
	}
	hr {
		margin: 0;
	}
	p {
		margin: 0;
		line-height: 1;
	}
</style>
