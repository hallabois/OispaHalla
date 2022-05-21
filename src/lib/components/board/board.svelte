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
    import { generate_previous_positions } from "$lib/legacy/utils";

    let board;
    let GameManagerInstance: GameManager;
    let HTMLActuatorInstance: html_actuator;
    let KIM: KeyboardInputManager;
    let LSM: LocalStorageManager;

    function initcomponents() {
        if(GameManagerInstance) {
            GameManagerInstance = null;
        }
        HTMLActuatorInstance = new html_actuator(board);
        KIM = new KeyboardInputManager(board, enableKIM);
        LSM = new LocalStorageManager(enableLSM);
        GameManagerInstance = new GameManager(4, KIM, HTMLActuatorInstance, LSM, board, grid, false);
    }

    let prevGrid;
    $: if(board && grid && grid != null) {
        if(prevGrid) {
            grid = generate_previous_positions(grid, prevGrid);
        }
        if(JSON.stringify(prevGrid) != JSON.stringify(grid)) {
            // reinitcomponents();
            HTMLActuatorInstance.actuate(grid, {
                "score": 0,
                "terminated": false,
                "palautukset": 0
            });
            GameManagerInstance.grid = grid;
            prevGrid = grid;
        }
    }

    $: if(KIM && enableKIM != KIM.enabled) {
        KIM = new KeyboardInputManager(board, enableKIM);
        GameManagerInstance.inputManager = KIM;
    }

    onMount(()=>{
        initcomponents();
    });
</script>

<main bind:this={board}>
    <Board />
</main>

<style>

</style>