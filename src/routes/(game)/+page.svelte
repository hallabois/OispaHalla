<script lang="ts">
	import { marked } from "marked";
	import { onMount } from "svelte";

	import { enable_multiplayer, enable_leaderboards } from "$lib/config";

	import Preloader from "$lib/components/common/asset-preloader/Preloader.svelte";

	import Settings from "$lib/components/settings.svelte";
	import PSA from "$lib/components/psa.svelte";
	import Tournaments from "$lib/components/multiplayer.svelte";
	import Leaderboards from "$lib/components/leaderboard.svelte";

	import Announcer from "$lib/components/common/announcer/announcer.svelte";
	import type GameManager from "$lib/gamelogic/game_manager";
	import Icon from "$lib/components/common/icon/icon.svelte";
	import {
		multiplayerIconData,
		leaderboardIconData,
		settingsIconData,
		notificationIconData,
		activeNotificationIconData
	} from "$lib/components/common/icon/iconData";
	import { base_path } from "$lib/stores/themestore";
	import {
		app_description_default,
		app_name_default,
		app_name_hiscore_default,
		app_name_newgame_default,
		app_name_score_default,
		app_notice_default
	} from "$lib/brand";
	import Game from "$lib/components/board/game.svelte";
	import {
		gamestate,
		score,
		type GameSize,
		highscore,
		active_size,
		set_active_size,
		ENABLED_SIZES,
		gamestates,
		board_to_tile_array,
		highscores
	} from "$lib/gamelogic/new";
	import { blur, fade, scale, slide } from "svelte/transition";
	import GameBoard from "$lib/components/board/gameBoard.svelte";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";

	let app_name = "";
	let app_description = "";
	let app_notice = "";
	let app_name_newgame = "";
	let app_name_score = "";
	let app_name_hiscore = "";

	function setDefaultMetaValues() {
		app_name = app_name_default;
		app_description = app_description_default;
		app_notice = app_notice_default;
		app_name_newgame = app_name_newgame_default;
		app_name_score = app_name_score_default;
		app_name_hiscore = app_name_hiscore_default;
	}

	$: if (mounted && $base_path != null && $base_path != "") {
		fetch($base_path + "/manifest.json")
			.then((response) => response.json())
			.then((data) => {
				app_name = data.name;
				app_description = data.subtitle;
				app_name_score = data.score;
				app_name_hiscore = data.best_score;
				app_name_newgame = data.newgame;
			})
			.catch(() => {
				setDefaultMetaValues();
			})
			.finally(() => {
				app_notice =
					"This is a custom pack and as such is not endorsed in any way by the original team.";
			});
	} else {
		setDefaultMetaValues();
	}

	let mounted = false;
	let GameManagerInstance: GameManager;
	onMount(() => {
		mounted = true;
	});

	let TtInstance: Tournaments;
	let lbInstance: Leaderboards;
	let has_unread_notifications: boolean | null;
	let unread_notification_count: number | null;
	let multiplayer_game_ready: boolean;
	let PSAInstance: PSA;
	let SettingsInstance: Settings;
	let AnnouncerInstance: Announcer;

	let restart_menu_open = false;
	function updateHash(menu_open: boolean) {
		if (menu_open) {
			goto(`#${$active_size}x${$active_size}`);
		} else {
			goto(".");
		}
	}
	$: if (browser && restart_menu_open != null) {
		updateHash(restart_menu_open);
	}
	function restartGame() {
		if ($gamestate) {
			$gamestate.restart();
		}
	}
	function paritaKuli() {
		if ($gamestate) {
			$gamestate.move("BREAK");
		}
		//if (GameManagerInstance != null && confirm("Haluatko käyttää kurinpalautuksen?")) {
		//	GameManagerInstance.paritaKuli();
		//}
	}
</script>

<div class="game-background">
	<div class="container">
		<div class="new-above-game">
			<div class="above-game-left">
				<a href="https://hallabois.github.io/invite/" target="_blank" rel="noreferrer">
					<h1 class="title">{app_name}</h1>
				</a>
				{@html marked.parse(app_description, { mangle: false, headerIds: false })}
			</div>
			<div class="above-game-right">
				<div class="score-container" style="--c:'{app_name_score}'">
					{$score != null ? `${$score}` : "..."}
				</div>
				<div class="best-container" style="--c:'{app_name_hiscore}'">
					{#key $active_size}
						{$highscore != null ? `${$highscore.score}` : "..."}
					{/key}
				</div>
				<div class="restart-menu" class:open={restart_menu_open}>
					<button
						class="button action-btn"
						style="flex-grow: 0;"
						class:fullflex={restart_menu_open}
						class:discourage={restart_menu_open}
						on:click={() => {
							restart_menu_open = !restart_menu_open;
						}}
					>
						{#if restart_menu_open}
							&lt;
						{:else}
							{$active_size}x{$active_size}
						{/if}
					</button>
					{#if !restart_menu_open}
						<button
							class="button action-btn"
							class:discourage={restart_menu_open}
							on:click={() => {
								restartGame();
							}}
						>
							{app_name_newgame}
						</button>
					{/if}
				</div>
			</div>
		</div>
		<div class="disclaimer">
			{#if app_notice && app_notice.length > 0}
				<p>
					{@html marked.parse(app_notice, { mangle: false, headerIds: false })}
				</p>
			{/if}
		</div>
		{#if restart_menu_open && $gamestates != null && $highscores != null}
			<div class="size-selector-grid">
				{#each ENABLED_SIZES as size, i}
					{@const score = $gamestates[size].score_max}
					{@const hiscore = $highscores[size]}
					{@const tiles = board_to_tile_array($gamestates[size].board)}
					<button
						id={`${size}x${size}`}
						class="size-selector-size"
						on:click={() => {
							set_active_size(size);
							restart_menu_open = false;
						}}
						in:scale|global={{ duration: 200, delay: i * 50 }}
					>
						<GameBoard
							enable_theme_chooser={false}
							last_move_tiles={null}
							last_move_direction={null}
							{size}
							{tiles}
						/>
						<div
							style="display: flex; flex-direction: column; justify-content:center; align-items: center;"
						>
							<h2>{size}×{size}</h2>
							<div style="display:flex; gap:1em; justify-content: center;">
								<p>{app_name_score}: {score}</p>
								{#if hiscore}
									<p>{app_name_hiscore}: {hiscore.score}</p>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div class="board-container">
				<Game />
				<div class="underbar-container">
					<div class="button-container-size">
						<div class="button-container panel-frosted">
							<!-- <ThemeChooser relative={false} expandY={false} expandX={true} /> -->
							<button
								class="button background-none color-button icon-button"
								on:click={() => {
									SettingsInstance.show();
								}}
								title="Asetukset"
							>
								<Icon stroke="var(--color)" viewBox="0 0 48 48" d={settingsIconData} />
							</button>
							<button
								class="button background-none color-button icon-button"
								class:attention-grabber={has_unread_notifications}
								on:click={() => {
									PSAInstance.show();
								}}
								title="Tiedotukset"
							>
								<Icon
									stroke="var(--color)"
									viewBox="0 0 48 48"
									d={has_unread_notifications ? activeNotificationIconData : notificationIconData}
									upper_text={has_unread_notifications
										? unread_notification_count + "" || null
										: null}
								/>
							</button>
						</div>
					</div>
					<div class="kurin-palautus-container" style="flex: 1;">
						<button
							class="button kurin-palautus"
							class:allowed={$gamestate?.state.allowed_moves.includes("BREAK")}
							on:click={paritaKuli}
						>
							<span
								class="parin-kulautus"
								title="Vai parin kulautus? Lahjot opettajia pois ruudulta, mutta menetät arvosanojasi! Voit lahjoa opettajia vain kolme kertaa ennen kun Halla saa kuulla tilanteesta."
							>
								Kurinpalautus
								{#if $gamestate?.state?.breaks != null}
									{$gamestate?.state?.breaks}/3
								{/if}
							</span>
						</button>
					</div>
					<div class="button-container-size">
						<div class="button-container panel-frosted">
							{#if enable_multiplayer}
								<button
									class="button background-none color-button"
									class:attention-grabber={multiplayer_game_ready}
									on:click={() => {
										TtInstance.show();
									}}
									title="Moninpeli"
								>
									<Icon
										stroke="var(--color)"
										viewBox="0 0 48 48"
										d={multiplayerIconData}
										upper_text={multiplayer_game_ready ? "1" : ""}
									/>
								</button>
							{/if}
							{#if enable_leaderboards}
								<button
									on:click={() => {
										lbInstance.show();
									}}
									id="lb-button"
									class="color-button button background-none icon-button"
									title="Leaderboards"
									style="display: flex;"
								>
									<Icon stroke="var(--color)" viewBox="0 0 48 48" d={leaderboardIconData} />
									<!-- <img src="img/svg/leaderboard.svg" alt="Leaderboard icon"> -->
								</button>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
<Announcer bind:this={AnnouncerInstance} />
<Settings bind:this={SettingsInstance} announcer={AnnouncerInstance} {GameManagerInstance} />
<Leaderboards bind:this={lbInstance} announcer={AnnouncerInstance} />
<Tournaments
	bind:this={TtInstance}
	announcer={AnnouncerInstance}
	bind:indicator_game_ready={multiplayer_game_ready}
/>
<PSA bind:this={PSAInstance} bind:has_unread_notifications bind:unread_notification_count />

<Preloader />

<style lang="scss">
	@import "../../style/helpers.scss";
	.size-selector-grid {
		--original-field-width: var(--field-width);
		--original-tile-border-radius: var(--tile-border-radius);
		--original-grid-gap: var(--grid-gap);
		--scale-factor: 0.75;
		display: flex;
		justify-content: start;
		align-items: center;
		width: var(--original-field-width);
		height: var(--original-field-width);
		overflow-x: scroll;
		gap: 1em;
		padding-inline: calc(calc(var(--field-width) * calc(1 - var(--scale-factor))) / 2);
		scroll-snap-type: x proximity;
	}
	.size-selector-size {
		scroll-snap-align: center;
		--field-width: calc(var(--original-field-width) * var(--scale-factor));
		--tile-border-radius: calc(var(--original-tile-border-radius) * var(--scale-factor));
		--grid-gap: calc(var(--original-grid-gap) * var(--scale-factor));
	}
	.size-selector-size * {
		margin: 0;
		text-align: center;
	}
	.fullflex {
		flex-grow: 1 !important;
	}
	.restart-menu {
		width: 100%;
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}
	.restart-menu > * {
		flex: 1;
	}
	.board-container {
		display: grid;
		place-items: center;
	}
	.kurin-palautus-container {
		margin-top: 0 !important;
	}
	.underbar-container .button-container {
		padding: 0.5em;
	}
	.underbar-container .button-container > * {
		width: auto !important;
	}
	:global(.mini-container .tile-inner) {
		animation: none !important;
		-moz-animation: none !important;
		-webkit-animation: none !important;
	}

	@include smaller($mobile-threshold) {
		.restart-menu {
			flex-direction: column;
		}
		.restart-menu.open {
			flex-direction: row;
		}
		.restart-menu > * {
			width: 100%;
		}
	}
</style>
