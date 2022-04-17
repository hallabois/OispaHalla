<script lang="ts">
    import Popup from "$lib/components/common/popup/popup.svelte";
    export let open = false;
    export function show() {
        open = true;
    }
</script>

<Popup bind:open>
    <span slot="title">Tournaments</span>
</Popup>

<style>

</style>