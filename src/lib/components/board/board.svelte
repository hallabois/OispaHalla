<script lang="ts">
    import { onMount } from "svelte";
    import Board from "./template.svelte";

    export let enableKIM = false;
    export let enableLSM = false;
    
    export let grid = null;

    import GameManager from "$lib/legacy/game_manager";
    import html_actuator from "$lib/legacy/html_actuator";
    import LocalStorageManager from "$lib/legacy/local_storage_manager";
    import KeyboardInputManager from "$lib/legacy/keyboard_input_manager";

    let board;

    onMount(()=>{
        console.log("Board:", board);
        let HTMLActuator = new html_actuator(board);
        let KIM = new KeyboardInputManager(board, enableKIM);
        let LSM = new LocalStorageManager(enableLSM);
        let GameManagerInstance = new GameManager(4, KIM, HTMLActuator, LSM, board, grid);
    });
</script>

<main bind:this={board}>
    <Board />
</main>

<style>

</style>