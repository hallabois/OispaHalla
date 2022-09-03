<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    let mounted = false;
    onMount(()=>{
        mounted = true;
    })
</script>

<slot />