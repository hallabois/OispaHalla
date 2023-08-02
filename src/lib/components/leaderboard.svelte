<script lang="ts">
	import { auth, token } from "$lib/Auth/authstore";

	import Popup from "./common/popup/popup.svelte";
	import NameChanger from "./leaderboard/nameChanger.svelte";
	import type Announcer from "$lib/components/common/announcer/announcer.svelte";
	import {
		lb_screenName,
		check_server_alive,
		personal_leaderboards,
		refresh_key,
		server_alive
	} from "$lib/stores/leaderboard";
	import { scale } from "svelte/transition";
	import { browser } from "$app/environment";
	import Actions from "./leaderboard/actions.svelte";
	import { storage, storage_loaded } from "$lib/stores/storage";
	import Icon from "./common/icon/icon.svelte";
	import { shareIconData } from "./common/icon/iconData";
	import {
		set_active_size,
		type GameSize,
		active_size,
		active_size_safe,
		gamestate,
		highscore
	} from "$lib/gamelogic/new";
	import Busy from "./common/loading-indicator/Busy.svelte";

	$: can_submit_now = $token != null && $lb_screenName != null;
	let enabled_sizes: GameSize[] = [3, 4];
	let submit_in_progress = false;
	async function submit() {
		if (!$active_size) {
			return;
		}
		submit_in_progress = true;
		// TODO: Rewrite
		refresh();
	}
	$: if (can_submit_now && $highscore) {
		if (!$highscore.submitted && $highscore.game_over) {
			submit();
		}
	}

	export let open = false;
	export let submitting = false;
	export function show() {
		open = true;
	}

	function editScreenName() {
		NameChangerInstance.show();
	}

	function refresh() {
		refresh_key.set({});
	}

	$: share_enabled = browser && (navigator.share || navigator.clipboard);
	async function shareScore() {
		if (!share_enabled || !$auth || !$auth.uid || !$active_size) {
			if (announcer) {
				announcer.announce("Linkkiä ei voitu luoda :(");
			}
			return;
		}
		let link = `${window.location.origin}/user/${$auth.uid}?size=${$active_size}`;
		let share_data: ShareData = {
			url: link
		};
		if (navigator.share && navigator.canShare(share_data)) {
			await navigator.share(share_data);
		} else if (navigator.clipboard) {
			await navigator.clipboard.writeText(link);
			if (announcer) {
				announcer.announce("Linkki kopioitu leikepöydälle!");
			}
		}
	}

	export let announcer: Announcer | null = null;
	let NameChangerInstance: NameChanger;
	let ActionsInstance: Actions;
</script>

<Popup bind:open>
	<span slot="title">Leaderboards</span>
	<div slot="content" class="content">
		{#await $server_alive}
			<Busy>
				<p>Otetaan yhteyttä palvelimeen</p>
			</Busy>
		{:then alive}
			{#if alive}
				{#if submitting}
					<p>Tallennetaas sun tulos!</p>
					{#if can_submit_now}
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
					<div class="size-selection">
						{#each enabled_sizes as s}
							<button
								class="tab"
								class:active={s == $active_size}
								on:click={() => {
									set_active_size(s);
								}}
							>
								{s}×{s}
							</button>
						{/each}
					</div>
					<div>
						<table>
							<thead>
								<tr>
									<th>Sija</th>
									<th>Pisteet</th>
									<th>Nimi</th>
								</tr>
							</thead>
							<tbody>
								{#if $personal_leaderboards != null}
									{#await $personal_leaderboards}
										{#each new Array(10) as index}
											<tr>
												<td>...</td>
												<td>......</td>
												<td>..............</td>
											</tr>
										{/each}
									{:then scores}
										{#if scores && "topBoard" in scores}
											{#each scores.topBoard as score, index}
												<tr in:scale={{ delay: 100 * index }}>
													<td>{index + 1}.</td>
													<td>{score.score}</td>
													<td>
														<a
															class="player"
															href={`/user/${score.user.uid}?size=${$active_size_safe}`}
														>
															{score.user ? score.user.screenName : "[Virheellinen nimi]"}
														</a>
													</td>
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
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a
							href="javascript:void(0);"
							on:click={() => {
								refresh();
							}}
						>
							Päivitä
						</a>
						<a href="/leaderboards/{$active_size_safe}">Näytä kaikki</a>
					</div>
					{#if $personal_leaderboards != null}
						{#await $personal_leaderboards}
							<Busy>
								<p>Ladataan tuloksiasi...</p>
							</Busy>
						{:then result}
							{#if !result.success || !("score" in result)}
								<p>Et ole tallentanut yhtäkään tulosta sarjaan "{$active_size_safe}"</p>
							{:else}
								<div class="my-results">
									<table>
										{#each [{ rank: result?.rank, score: result?.score?.score, name: result?.score?.user?.screenName, me: true, uid: result?.score?.user?.uid }, ...Object.keys(result.rivals || {}).map( (r) => {
													return { rank: r, score: result?.rivals[r]?.score, name: result?.rivals[r]?.user.screenName, me: false, uid: result?.rivals[r]?.user.uid };
												} )].sort((a, b) => a.rank - b.rank) as subjectiveResult}
											<tr class:me={subjectiveResult.me}>
												<td>{subjectiveResult.rank}.</td>
												<td>{subjectiveResult.score}</td>
												<td
													><a
														class="player"
														href={`/user/${subjectiveResult.uid}?size=${$active_size_safe}`}
														>{subjectiveResult.name}</a
													></td
												>
											</tr>
										{/each}
									</table>
								</div>
							{/if}
						{/await}
					{/if}
				{/if}
				<div>
					{#if $auth}
						<div class="actions">
							<button
								class="button action-btn"
								on:click={() => {
									ActionsInstance.show();
								}}
							>
								⫶
							</button>
							{#if $lb_screenName}
								<button on:click={editScreenName} class="button action-btn" style="flex:1;"
									>Muuta nimimerkkiä "{$lb_screenName}"</button
								>
							{:else}
								<button on:click={editScreenName} class="button action-btn" style="flex:1;"
									>Lisää nimimerkki</button
								>
							{/if}
							{#if share_enabled}
								<button
									class="button action-btn"
									on:click={() => {
										shareScore();
									}}
								>
									<Icon fill="var(--button-color)" viewBox="0 0 48 48" d={shareIconData} />
								</button>
							{/if}
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
				<button
					class="button action-btn"
					on:click={() => {
						refresh();
					}}>Yritä uudelleen</button
				>
			{/if}
		{/await}
	</div>
</Popup>
<NameChanger bind:this={NameChangerInstance} {announcer} />
<Actions
	bind:this={ActionsInstance}
	markAsSubmitted={(s) => {
		markAsSubmitted(s);
	}}
	startSubmitting={(s) => {
		startSubmitting(s);
	}}
/>

<style>
	.size-selection {
		display: flex;
		gap: 0.2em;
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
		border-color: var(--game-container-background);
		border-color: color-mix(in srgb, var(--game-container-background) 95%, var(--color) 5%);
	}
	tr.me {
		font-weight: bold;
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
	}
	.actions {
		display: flex;
		gap: 0.25em;
	}
	.player {
		font-weight: inherit;
		color: inherit;
		text-decoration: inherit;
	}
</style>
