<script lang="ts">
    import Board from "$lib/components/board/board.svelte";
    import type GameManager from "$lib/gamelogic/game_manager";
    import { hac_gamestate_to_grid } from "$lib/gamelogic/utils";
    import { onMount } from "svelte";
    import init, { get_frames, parse } from "twothousand-forty-eight";

    let ready = false;
    onMount(()=>{
        // @ts-ignore
        init().then(()=>{
            ready = true;
        });
    });

    let selected_frame = 0;
    let input = "4x4S0.0.0.0.0.0.0.0.0.0.0.0.0.0.2.2+2,1.2;1";
    let parsed: any;
    let grid;
    let err: string | null;
    $: if(input.length > 0 && selected_frame != null) {
        try{
            err = null;
            parsed = JSON.parse(get_frames(input));
        }
        catch(e) {
            console.warn(e);
            err = `${e}`;
        }
    }
    let err2: string | null;
    let frame;
    $: if(parsed != null && selected_frame != null) {
        try {
            err2 = null;
            frame = parsed[selected_frame];
            console.log("frame", frame);
            let transformed = hac_gamestate_to_grid(frame);
            console.log("transformed", transformed);
            grid = transformed;
        }
        catch(e) {
            console.warn(e);
            err2 = `${e}`;
        }
    }

    let mounted = false;
	let boardInstance: Board;
    let inputRoot: HTMLElement;
	onMount(() => {
		inputRoot = document.querySelector("html") as HTMLElement;
		mounted = true;
	});
</script>

<main >
    {#if !ready}
        <p>Ladataan...</p>
    {:else}
        <p>WASM Ladattu.</p>
        <input bind:value={input} autofocus />
        <input type="number" bind:value={selected_frame} />
        {#if err || err2}
            <p>Virhe: {err || err2}</p>
        {:else}
            {#key grid}
                <Board
                    bind:this={boardInstance}
                    enableKIM={false}
                    enableLSM={false}
                    documentRoot={inputRoot}
                    enable_theme_chooser={false}
                    initComponentsOnMount={false}
                    {grid}
                />
                <p>{JSON.stringify(frame)}</p>
                <p>{JSON.stringify(grid)}</p>
            {/key}
        {/if}
    {/if}
</main>

<style>

</style>