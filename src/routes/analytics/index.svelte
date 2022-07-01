<script context="module">
    export const router = false;
    export const hydrate = false;
    export const prerender = true;
</script>
<script lang="ts">
    import { browser } from "$app/env";
    import { onMount } from "svelte";
    import csvtojson from "csvtojson";
    const srcFolder = "./analytics_data/";

    let files: any[] = [];
    let filecontents_raw: any[] = [];
    let filecontents: any[] = [];
    let canvases: HTMLCanvasElement[] = [];

    onMount(async ()=>{
        if(!browser) {
            const fs = await import("fs");
            fs.readdirSync(srcFolder).forEach(async (file) => {
                files.push(file);
                let content = fs.readFileSync(`${srcFolder}${file}`, "utf8");
                filecontents_raw.push(content);
            });
            for(let raw of filecontents_raw) {
                csvtojson().fromString(raw).then(
                    (data)=>{
                        console.log(data);
                        filecontents.push(data);
                    }
                );
            }
        }
    });
</script>

<main>
    <div class="page">
        <div class="intro">
            <h1><span class="primary"><b>O</b>ispa<br /><b>H</b>alla<small>™</small></span><br /><span class="secondary"><b>A</b>nalytics</span></h1>
            <p>0.2.1</p>
            {#if !browser}
                <p>Tiedot päivitetty viimeksi {new Date().toLocaleString()}</p>
            {/if}
        </div>
    </div>
    {#each files as file, index}
        <div class="page">
            <p class="intro">{file}</p>
            <canvas bind:this={canvases[index]}></canvas>
            <code>{JSON.stringify(filecontents[index])}</code>
        </div>
    {/each}
</main>

<style>
    :root {
        --bg: #363537;
        --primary: #8F7A66;
        --secondary: #365CA6;
    }
    main, :global(html, body) {
        background: var(--bg) !important;
    }
    .primary {
        color: var(--primary);
    }
    .secondary {
        color: var(--secondary);
    }
    h1 {
        font-weight: 400;
        margin: 0;
        line-height: 1em;
    }
    h1 b {
        filter: saturate(0.85) brightness(1.5);
    }
    .intro {
        color: #ddd;
    }

    .page {
        min-height: 100vh;
        min-width: 25vh;
        max-width: 100vw;
        box-sizing: border-box;
        
        font-size: calc(16px + 1.5vw);

        border: .25em solid var(--primary);
        padding: .25em;
    }
</style>