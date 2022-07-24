<script lang="ts">
	import "../app.scss";
    import PopupScrolllock from "$lib/components/common/popup/popup_scrolllock.svelte";
    import { browser } from '$app/env';
    import { fade } from "svelte/transition";
</script>

{#if !browser}
    <div class="loading-screen-bg" />
    <div class="loading-screen">
        <!-- <img src="/img/favicon.ico" alt="OispaHalla -logo" width="128" height="128" style="border-radius: .5rem;"> -->
        <h1 class="title">OispaHalla</h1>
        <p>Ladataan...</p>
    </div>
{:else}
<PopupScrolllock />
<slot />
{/if}

<style>
	
    @keyframes load-anim {
        0% {
            opacity: 0;
        }
        100% {
            opacity: .25;
        }
    }
    .loading-screen-bg {
        background-image: url("/img/ABC/sketch.webp");
        background-size: cover;
        opacity: 0;
        animation: 1500ms load-anim;
        animation-fill-mode: forwards;

        position: fixed;bottom: 0;top: 0;left:0;right: 0;
    }
    .loading-screen {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;

        color-scheme: dark;
        color: #e6d2bf;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        min-height: 100vh;
        gap: 1em;
    }
</style>