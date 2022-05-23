<!-- Explain what global variables are to typescript -->
<script context="module" lang="ts">
    declare var setImageTheme: Function;
    declare var currentTheme: number;
</script>
<!-- / -->
<script lang="ts">
    import { slide } from "svelte/transition";
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

    let menu_open = false;

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
    <!-- svelte-ignore missing-declaration -->
    {#if typeof currentTheme !== "undefined"}
        {#each available_themes as theme, index}
            <!-- svelte-ignore missing-declaration -->
            {#if currentTheme == theme.index || menu_open}
                <!-- svelte-ignore missing-declaration -->
                <button
                    on:click={()=>{
                        if(menu_open) {
                            setImageTheme(theme.index)
                        }
                        menu_open = !menu_open;
                    }}
                    on:touchend={()=>{
                        if(menu_open) {
                            setImageTheme(theme.index)
                        }
                        menu_open = !menu_open;
                    }}
                    transition:slide={{delay: index*50}}
                >
                    <img src={theme.icon_url} width="50px" height="50px" alt="" style={theme.style} />
                </button>
            {/if}
        {/each}
    {/if}
</main>

<style>
    main {
        position: relative;
        left: var(--field-width, 500px);

        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        /* we'll use margin-bottom instead, as it works better with slide */
        /* gap: 1em; */

        width: 0;

        transition: left 200ms;
    }
    button {
        padding: 0;
        line-height: 0;
        margin: 0;
        margin-bottom: 1em;

        border-width: 1px;
        cursor: pointer;

        width: 52px;
        height: 52px;
        display: flex;
        justify-content: center;
        align-items: center;

        transition: transform 200ms;
    }
    button, img {
        border-radius: .25rem;
    }
</style>