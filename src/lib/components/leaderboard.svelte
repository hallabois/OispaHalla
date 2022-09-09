<script lang="ts">
	import { auth, token } from "$lib/Auth/authstore";

	import Popup from "./common/popup/popup.svelte";
	import NameChanger from "./leaderboard/nameChanger.svelte";
	import type Announcer from "./tournaments/announcer.svelte";
	import {
		lb_screenName,
		check_server_alive,
		submit_score,
		get_top_scores,
		fetchboard,
		type Score_response,
		type Fetchboard_response,
		Fetchboard_ok
	} from "$lib/stores/leaderboardstore";
	import { scale } from "svelte/transition";
	import type GameManager from "$lib/gamelogic/game_manager";
	import { dev } from "$app/environment";
	import Actions from "./leaderboard/actions.svelte";
	import { getItem, setItem, storage, storage_loaded } from "$lib/stores/storage";

	export let GameManagerInstance: GameManager | null = null;
	let enabled_sizes = [3, 4];
	function submitUnsubmittedTopScores() {
		if (GameManagerInstance != null) {
			for (let s of enabled_sizes) {
				let top_saved = ($storage.bestScores || {})[s] || -1;
				let top_submitted = ($storage.lb_submitted || {})[s] || -1;
				if (GameManagerInstance?.size == s && GameManagerInstance?.score >= top_saved) {
					// Do nothing, as the top scoring game is not over yet.
				} else if (top_saved > top_submitted) {
					console.info(`Please submit score for size ${s}...`);
					submitting = true;
					size = s;
					show();
					return;
				}
			}
		} else {
			console.warn("GameManagerInstance is null!");
		}
	}
	function startSubmitting(s: number) {
		console.info(`Starting to submit score ${s}...`);
		size = s;
		submitting = true;
	}
	function markAsSubmitted(s: number) {
		setItem("lb_submitted", {
			...(getItem("lb_submitted") || {}),
			[s]: (getItem("bestScores") || {})[s]
		});
		submitting = false;
	}
	function getHACString(run: any[]) {
		return size + "x" + size + "S" + run.join(":");
	}
	let submit_in_progress = false;
	async function submit() {
		submit_in_progress = true;
		let starting_size = size;
		let result = await submit_score(
			starting_size,
			$token,
			$lb_screenName as string,
			(getItem(`HAC_best_score${starting_size}`) ||
				(getItem(`bestScores`) || {})[starting_size]) as number,
			0,
			getHACString(getItem(`HAC_best_history${starting_size}`))
		);
		submit_in_progress = false;
		console.info("submit result", result);
		if (result.message) {
			if (announcer) {
				announcer.announce(result.message);
			}
		}
		if (result.success) {
			markAsSubmitted(starting_size);
		}
		refresh(true);
	}
	let is_server_alive: Promise<boolean> | null = null;
	let was_server_alive: boolean | null = null;
	function submitUnsubmittedTopScoresIfAlive(force = false) {
		if (is_server_alive != null && !force) {
			return;
		}
		is_server_alive = check_server_alive();
		is_server_alive.then((alive) => {
			was_server_alive = alive;
			if (alive) {
				submitUnsubmittedTopScores();
			}
		});
	}
	$: if ($storage_loaded && $storage.bestScores) {
		submitUnsubmittedTopScoresIfAlive();
	}
	let fetchboard_results: { [key: number]: Promise<Fetchboard_response> } = {};
	$: if (refreshKey != null && was_server_alive) {
		for (let s of enabled_sizes) {
			fetchboard_results[s] = fetchboard(s, $token, 10, 1, 1);
		}
	}
	$: if ($token != null) {
		refresh(true);
	}

	export let open = false;
	export let size = 4;
	export let submitting = false;
	export function show() {
		open = true;
		submitUnsubmittedTopScoresIfAlive();
	}

	function editScreenName() {
		NameChangerInstance.show();
	}

	function refresh(full = false) {
		if (full) {
			submitUnsubmittedTopScoresIfAlive(true);
		}
		refreshKey = {};
	}

	export let announcer: Announcer | null = null;
	let NameChangerInstance: NameChanger;
	let ActionsInstance: Actions;
	let refreshKey = {}; // Every {} is unique
</script>

<Popup bind:open>
	<span slot="title">Leaderboards {size}x{size}</span>
	<div slot="content" class="content">
		{#if is_server_alive != null}
			{#await is_server_alive}
				<p>Otetaan yhteyttä palvelimeen...</p>
			{:then alive}
				{#if alive}
					{#if submitting}
						<p>Tallennetaas sun tulos!</p>
						{#if $lb_screenName != null}
							<button
								disabled={submit_in_progress}
								on:click={submit}
								class="button action-btn"
								style="width: 100%;">{submit_in_progress ? "Tallennetaan..." : "Tallenna"}</button
							>
						{/if}
						<button
							on:click={() => {
								submitting = false;
							}}
							class="button"
							style="width: 100%;font-weight: normal !important;padding: 0.75em;"
							>Älä Tallenna Vielä</button
						>
					{:else}
						{#key refreshKey}
							<div class="size-selection">
								{#each enabled_sizes as s}
									<button
										class="button action-btn"
										on:click={() => {
											size = s;
										}}
										disabled={size == s}>{s}</button
									>
								{/each}
							</div>
							<div style="overflow-y: scroll;">
								<table>
									<thead>
										<tr>
											<th>Sija</th>
											<th>Pisteet</th>
											<th>Nimi</th>
										</tr>
									</thead>
									<tbody>
										{#if fetchboard_results[size] != null}
											{#await fetchboard_results[size]}
												{#each new Array(10) as index}
													<tr>
														<td>...</td>
														<td>.....</td>
														<td>.......</td>
													</tr>
												{/each}
											{:then scores}
												{#if scores && "topBoard" in scores}
													{#each scores.topBoard as score, index}
														<tr in:scale={{ delay: 100 * index }}>
															<td>{index + 1}</td>
															<td>{score.score}</td>
															<td>{score.user ? score.user.screenName : "[Virheellinen nimi]"}</td>
														</tr>
													{/each}
												{:else}
													<p>Tapahtui virhe. (Tietoja ei saatavilla)</p>
												{/if}
											{/await}
										{/if}
									</tbody>
								</table>
							</div>
							<div class="actionbar">
								<a href="javascript:;" on:click={refresh}> Päivitä </a>
								<a href="/leaderboards/{size}"> Näytä kaikki </a>
							</div>
							{#if $token != null}
								{#if fetchboard_results[size] != null}
									{#await fetchboard_results[size]}
										<p style="font-size: 0.5em;" />
										<p style="text-align:center;">Ladataan tuloksiasi...</p>
										<p style="font-size: 0.5em;" />
									{:then result}
										{#if !result.success || !("score" in result)}
											<p>Et ole tallentanut yhtäkään tulosta sarjaan "{size}"</p>
										{:else}
											<div class="my-results">
												<table>
													{#each [{ rank: result?.rank, score: result?.score?.score, name: result?.score?.user?.screenName, me: true }, ...Object.keys(result.rivals || {}).map( (r) => {
																return { rank: r, score: result?.rivals[r]?.score, name: result?.rivals[r]?.user.screenName, me: false };
															} )].sort((a, b) => a.rank - b.rank) as subjectiveResult}
														<tr class:me={subjectiveResult.me}>
															<td>{subjectiveResult.rank}.</td>
															<td>{subjectiveResult.score}</td>
															<td>{subjectiveResult.name}</td>
														</tr>
													{/each}
												</table>
											</div>
										{/if}
									{/await}
								{/if}
							{/if}
						{/key}
					{/if}
					<div>
						{#if $auth}
							<div class="actions">
								{#if $lb_screenName}
									<button on:click={editScreenName} class="button action-btn" style="flex:1;"
										>Muuta nimimerkkiä "{$lb_screenName}"</button
									>
								{:else}
									<button on:click={editScreenName} class="button action-btn" style="flex:1;"
										>Lisää nimimerkki</button
									>
								{/if}
								<button
									class="button action-btn"
									on:click={() => {
										ActionsInstance.show();
									}}
								>
									⫶
								</button>
							</div>
							<a href="/auth" style="text-align: center;display: block;padding: 0.75em;"
								>Hallinnoi kirjautumista</a
							>
						{:else if $auth === undefined}
							<p style="text-align: center;display: block;padding: 0.75em;">Tarkistetaan tietoja</p>
						{:else}
							<button
								on:click={() => {
									window.location.href = "/auth";
								}}
								class="button action-btn"
								style="width: 100%;">Kirjaudu sisään</button
							>
						{/if}
					</div>
				{:else}
					<p>Virhe otettaessa yhteyttä palvelimeen.</p>
					<button class="button action-btn" on:click={refresh}>Yritä uudelleen</button>
				{/if}
			{/await}
		{:else}
			{refresh()}
		{/if}
	</div>
</Popup>
<NameChanger bind:this={NameChangerInstance} {announcer} />
<Actions
	bind:this={ActionsInstance}
	{announcer}
	current_size={size}
	markAsSubmitted={(s) => {
		markAsSubmitted(s);
	}}
	startSubmitting={(s) => {
		startSubmitting(s);
	}}
	sizes={enabled_sizes}
/>

<style>
	.size-selection {
		display: flex;
		gap: 0.5em;
		flex-wrap: wrap;
	}
	.size-selection * {
		flex: 1;
	}
	.actionbar {
		display: flex;
		gap: 0.5em;
		flex-wrap: wrap;
		justify-content: end;
	}
	table {
		width: 100%;

		border: 1px solid;
		border-collapse: collapse;

		text-align: left;

		max-height: 200px;
		overflow-y: scroll;
	}
	td,
	th {
		padding: 0.25em 0.5em;
	}
	td {
		border: 1px solid;
	}
	tr.me {
		font-weight: bold;
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
	.actions {
		display: flex;
		gap: 0.25em;
	}
</style>
