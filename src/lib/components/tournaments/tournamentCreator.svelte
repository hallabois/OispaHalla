<script lang="ts">
	import { token } from "$lib/Auth/authstore";

	import {
		gamemode_0_goals,
		gamemode_0_names,
		create,
		enabled_sizes
	} from "$lib/stores/tournamentstore";
	let name: string;
	let create_public = true;
	let size: number = 3;
	let max_clients = 4;
	let password: string | null;
	let gamemode: number;

	let gamemode_0_goal: number = 128;

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
	{#if $token}
		<div class="creator">
			<h4>Asetukset</h4>
			<div class="input-section">
				<label for="ispublic">Julkinen</label>
				<input type="checkbox" id="ispublic" bind:checked={create_public} />
			</div>
			<div class="input-section">
				<label type="text" for="name">Pelin nimi</label>
				<input id="name" bind:value={name} />
			</div>
			<div class="input-section">
				<label type="text" for="size">Pelin koko</label>
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
	}
</style>
