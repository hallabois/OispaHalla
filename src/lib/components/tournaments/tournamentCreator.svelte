<script lang="ts">
	import { token } from "$lib/Auth/authstore";
	import {
		gamemode_0_goals,
		gamemode_0_names,
		create,
		enabled_sizes
	} from "$lib/stores/tournamentstore";

	import { BarLoader } from "svelte-loading-spinners";

	let busy = false;

	let name: string;
	let create_public = true;
	let size = 3;
	let max_clients = 4;
	let password: string | null;
	let gamemode: number;

	let gamemode_0_goal = 128;

	$: t_valid =
		create_public != null &&
		name != null &&
		name.length > 0 &&
		max_clients != null &&
		max_clients > 0;

	function createT() {
		if ($token == null) {
			alert("Virheellinen sisäänkirjautuminen");
			return;
		}
		busy = true;
		create({
			name,
			size,
			gamemode: {
				mode: gamemode,
				goal: gamemode_0_goal
			},
			maxclients: max_clients,
			public: create_public,
			joinpassword: password
		});
	}
</script>

<div>
	{#if busy}
		<div class="busy">
			<h2>Luodaan peliä...</h2>
			<BarLoader size="60" color="var(--button-background)" unit="px" duration="2s" />
			<button
				class="button action-btn discouradge"
				on:click={() => {
					busy = false;
				}}>peruuta</button
			>
		</div>
	{:else if $token}
		<div class="creator">
			<h4>Asetukset</h4>
			<label for="name">Pelin nimi</label>
			<input
				class="full-input"
				id="name"
				type="text"
				placeholder="Fysiikan abikurssi"
				bind:value={name}
			/>
			<div class="input-section">
				<label for="size">Pelin koko</label>
				<select id="size" bind:value={size}>
					{#each enabled_sizes as size}
						<option>{size}</option>
					{/each}
				</select>
			</div>
			<div class="input-section">
				<label for="max_clients">Pelaajien enimmäismäärä</label>
				<input type="number" id="max_clients" bind:value={max_clients} />
			</div>
			<div class="input-section">
				<label for="pswd">Salasana</label>
				<input
					type="password"
					id="pswd"
					bind:value={password}
					placeholder="Voit jättää salasanan tyhjäksi"
				/>
			</div>
			<div class="input-section">
				<label for="ispublic">Julkinen</label>
				<input type="checkbox" id="ispublic" bind:checked={create_public} />
			</div>
			<h4>Säännöt</h4>
			<div class="input-section">
				<label for="gamemode">Pelimuoto</label>
				<select id="gamemode" bind:value={gamemode}>
					<option value={0}>Ensimmäinen maalissa</option>
					<option value={null} disabled>Coming Soon™</option>
				</select>
			</div>
			{#if gamemode == 0}
				<div class="input-section">
					<label for="goal">Maali</label>
					<select id="goal" bind:value={gamemode_0_goal}>
						{#each gamemode_0_goals as num}
							<option value={num}>{gamemode_0_names[num]}</option>
						{/each}
					</select>
				</div>
			{/if}
			<button disabled={!t_valid} on:click={createT} class="button action-btn">Luo</button>
		</div>
	{:else}
		<p>Ladataan kirjautumistietoja...</p>
	{/if}
</div>

<style>
	h4 {
		margin-top: 0.5em;
		margin-bottom: 0;
		text-align: center;
	}
	.busy {
		min-height: 10em;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 0.5em;
	}
	.creator {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
	.input-section {
		display: flex;
		align-items: center;
	}
	.input-section * {
		flex: 1;
		padding: 0.25em 0.5em;
	}
	.full-input {
		width: 100%;
		padding: 0.25em 0.5em;
		font-size: 1em;
	}
</style>
