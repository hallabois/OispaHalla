<!-- Explain what global variables are to typescript -->
<script context="module" lang="ts">
    declare var setImageTheme: Function;
</script>
<!-- / -->
<script lang="ts">
    import { scale } from "svelte/transition";
    import { browser } from "$app/env";
    class theme {
        index!: number
        icon_url!: string
        style!: string
    }
    let available_themes: theme[] = [
        {
            index: 0,
            icon_url: "/img/raksahalla_192.png",
            style: "background: black;"
        },
        {
            index: 1,
            icon_url: "/img/raksahalla_192.png",
            style: "background: white;"
        },
    ];


    $: if(browser && localStorage && localStorage.getItem("hasWon")) {
        available_themes.push({
            index: 14,
            icon_url: "/img/theme-14/2.png",
            style: ""
        });
        available_themes = available_themes;
    }
</script>

<main>
    {#each available_themes as theme, index}
        <!-- svelte-ignore missing-declaration -->
        <button on:click={()=>{setImageTheme(theme.index)}} transition:scale={{delay: index*50}}>
            <img src={theme.icon_url} width="50px" alt="" style={theme.style} />
        </button>
    {/each}
</main>

<style>
    main {
        position: relative;
        left: 500px;
        width: 0;
        bottom: 0;

        display: flex;
        flex-wrap: wrap;
        gap: 1em;
    }
</style>