<!-- Explain what global variables are to typescript -->
<script context="module" lang="ts">
    declare var GameManagerInstance: any;
    declare var base_path: string;
  </script>
  <!-- / -->
<script lang="ts">
    import { onMount } from "svelte";
    import { fly, slide, fade } from "svelte/transition";
    import NameInput from "./nameInput.svelte";
    let numOfScores = 10;
    let urls = ["https://localhost:5000", "http://localhost:5000", "https://oispahallalb.herokuapp.com", "http://oispahallalb.herokuapp.com"];
    let url = "";
    let connected = false;
    let size = 4;
    
    let display_name = "";
    $: if(mounted && display_name != null){
        localStorage.display_name = display_name;
    }
    let correct_name = "";
    let id = "";
    $: if(mounted && id != null){
        localStorage.id = id;
    }

    let mounted = false;
    export let editing_name = false;
    export let editing_upload = false;
    let upload_error = false;
    let upload_history: string = null;
    let visible = false;
    let score_submitting = false;
    let id_hidden = true;
    let input_enabled = true; // tän vois siirtää inputManageriin
    $: if(mounted && window != null && visible != null){
        (window as any).isLeaderboardOpen = visible;
        if(GameManagerInstance != null){
            if(visible && input_enabled == true){
                GameManagerInstance.inputManager.removeKeydownHandler()
                input_enabled = false;
            }
            else if(!visible && input_enabled == false){
                GameManagerInstance.inputManager.addKeydownHandler();
                input_enabled = true;
            }
        }
    }
    export function toggle(){
        visible = !visible;
    }
    export function show(withSize: number = null){
        if( hasUnsavedScore() != null ){
            editing_upload = true;
        }
        visible = true;
        if(withSize == null){
            size = (mounted && GameManagerInstance != null) ? GameManagerInstance.size : 4;
        }
        else{
            size = withSize;
        }
        refresh();
    }
    export function hide(){
        visible = false;
        editing_name = false;
        editing_upload = false;
        upload_error = false;
        score_submitting = false;
        id_hidden = true;
        upload_history = null;
    }
    export function game_ended_with_best_score(e){
        editing_upload = true;
        show(JSON.parse(localStorage["HAC_size"]));
    }

    export function hasUnsavedScore(){
        const size = localStorage.HAC_size;
        if(size != null && localStorage["HAC_best_history" + size] != null){
            if( localStorage["last_saved" + size] == null && localStorage["bestGameFinished" + size] == null || (localStorage["HAC_best_history" + size] !== localStorage["last_saved" + size] && localStorage["bestGameFinished" + size] == "true") ){
                return size;
            }
        }
        return null;
    }
    
    onMount( async () => {

        // Load data from localstorage, we don't care if it fails or does not exist.
        try{display_name = localStorage.display_name}catch{};
        try{id = localStorage.id}catch{}

        window.addEventListener("game_ended_with_best_score", game_ended_with_best_score);

        // lbNameForm.onsubmit = (event) => {
        //     localStorage.screenName = lbName.value;
        //     event.preventDefault();
        // };

        // lbSyncForm.onsubmit = (event) => {
        //     event.preventDefault();
        //     fetch(url + "/verifyid/" + lbUid.value)
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data)
        //         if(data.valid) {
        //         localStorage.id = lbUid.value;
        //         } else {
        //         syncError.innerHTML = "Epävalidi synkronointikoodi!"
        //         }
        //     });
        // };

        // postScoreButton.onclick = () => {
        //     const lol = JSON.parse(localStorage.gameState);
        //     postScore({ history: JSON.parse(localStorage.HAC_history), palautukset: lol.palautukset, score: lol.score, size: lol.size });
        // };
        await selectURL();
        refresh();
        mounted = true;
    });


    async function selectURL() {
        for (let i in urls) {
            console.log("Trying " + urls[i]);
            const status = await connectivityCheck(urls[i]);
            console.log(`Status for ${urls[i]}: ${status}`);
            if(status) {
                console.log("Connected to: " + urls[i]);
                connected = true;
                url = urls[i];
                return;
            }
        }
        connected = false;
    }

    async function connectivityCheck(url) {
        let out = false;
        try {
            await fetch(url + "/alive")
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.alive){
                    console.log(`${url} is alive!`);
                    out = true;
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
        catch(err) {
            return false;
        }
        return out;
    }
    let refreshPromise;
    async function refreshLeaderboard(size) {
        const res = await fetch(`${url}/scores/size/${size}/fetchboard/${numOfScores}/${localStorage.id ? localStorage.id : ""}`);

        if (res.ok) {
            const data = await res.json();
            console.log("Got: ", data);
            return data;
        } else {
            if(localStorage.id){
                const res2 = await fetch(`${url}/scores/size/${size}/fetchboard/${numOfScores}/`); // Get score without our id
                if(res2.ok){
                    const data = await res2.json();
                    console.log("Got (second try): ", data);
                    return data;
                }
                else{
                    throw new Error(res2.statusText);
                }
            }
            throw new Error(res.statusText);
        }
    }
    async function postScore(game) {
        upload_history = null;
        score_submitting = true;
        upload_error = false;
        if(display_name === undefined) {
            editing_name = true;
            return;
        }
        if(!game.history && !game.palautukset == undefined && !game.score) {
            console.log(game);
            return;
        }
        const parsedHistory = game.size + "x" + game.size + "S" + game.history.join(":");
        const user = {
            id: null || id,
            screenName: correct_name || display_name
        };
        await fetch(url + "/scores/size/" + game.size, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: user,
                score: game.score,
                breaks: game.palautukset,
                history: parsedHistory
            })
        })
        .then(response => {
            console.log(response);
            if(response.ok || response.status == 403) {
                return response.json();
            }
            console.log("Unexpected status code on POST: " + response.status, response.json());
            score_submitting = false;
            upload_error = true;
            localStorage.best_score_submitted = false;
        })
        .then(data => {
            console.log(data);
            if(data.message !== "Score already exists"){ // If the score already works, do nothing becouse:
                id = data.createdScore.user._id;         // data.createdScore would be null (causing an error)
            }
            refresh();
            score_submitting = false;
            editing_upload = false;
            localStorage.best_score_submitted = true;
            localStorage["last_saved" + game.size] = JSON.stringify(game.history);
        }).catch( (err) => {
            console.log(err);
            score_submitting = false;
            upload_error = true;
            localStorage.best_score_submitted = false;
        });
    }
    function refresh(){
        if(!connected){
            refreshPromise = null; // Tän vois jossain vaihees korvata jollain järkevämmällä
            selectURL().then( ()=>{
                refreshPromise = refreshLeaderboard(GameManagerInstance.size);
            } );
        }
        else if(GameManagerInstance){
            refreshPromise = refreshLeaderboard(GameManagerInstance.size);
        }
    }
    function edit(){
        editing_name = !editing_name;
    }
    function post(){
        const lol = GameManagerInstance;
        const size = localStorage.HAC_size;
        const history = localStorage["HAC_best_history" + size];
        const scores = JSON.parse(localStorage.bestScores);
        const score = scores[size]
        postScore({ history: JSON.parse(history), palautukset: lol.palautukset, score: score, size: size });
    }
</script>
<main>
    {#if visible}
        <div on:click={hide} class="lb-popup" out:fade>
            <div class="lb-popup-container" in:fly="{{ y: 200, duration: 200 }}">
                <div on:click={(e)=>{e.stopPropagation()}} class="leaderboard-popup">
                    <div class="lb-header">
                        <h2 class="lb-title"
                            title={url ? `Yhdistetty palvelimeen ${url}` : "Ei yhteyttä palvelimeen."}
                        >Leaderboards {size}x{size}</h2>
                        <div class="lb-buttons">
                            <a on:click={refresh} id="lb-refresh" class="color-button" title="Päivitä Leaderboardit">
                                <img src="img/svg/refresh.svg" alt="Refresh">
                            </a>
                            {#if connected}
                                <a on:click={edit} id="lb-edit" class="color-button" title="Muuta Käyttäjänimeäsi tai Synkronointikoodiasi">
                                    <img src="img/svg/edit.svg" alt="Edit">
                                </a>
                            {/if}
                            <a on:click={hide} id="lb-close" title="Sulje Leaderboardit">&times;</a>
                        </div>
                    </div>
                    <div class="lb-content">
                        {#if editing_name}
                            <div transition:slide class="form-container" style="display: block;">
                                <hr>
                                <NameInput bind:display_name bind:correct_name />
                                <div class="sync-form-container">
                                    <div class="form-title-container">
                                        <h4 class="name-form-title">Muuta Synkronointikoodiasi: (24 merkkiä)</h4>
                                        <div class="tooltip">
                                            <span class="tooltiptext">Voit kopioida synkronointikoodisi tästä, ja käyttää sitä eri laitteella synkronoidaksesi "tilisi" ja paikkasi Leaderboardeilla™</span>
                                            <div class="color-button">
                                                <img src="img/svg/help.svg" alt="?">
                                            </div>
                                        </div>
                                    </div>
                                    <div id="lb-sync-form" class="name-form">
                                        <div class="name-form-div">
                                        <label for="lb-uid">Koodi: </label>
                                        {#if id_hidden}
                                            <input type="password" id="lb-uid" placeholder="Synkronointikoodi" minlength="24" maxlength="24" disabled value={id} />
                                        {:else}
                                            <input type="text" id="lb-uid" placeholder="Synkronointikoodi" minlength="24" maxlength="24" bind:value={id} />
                                        {/if}
                                        </div>
                                        <button on:click={ ()=>{id_hidden = !id_hidden} }>{id_hidden ? "näytä" : "piilota"}</button>
                                        <button id="lb-save">Tallenna</button>
                                    </div>
                                    <p id="sync-error" class="lb-error"></p>
                                </div>
                                <hr class="closerhr">
                            </div>
                        {/if}
                        {#if editing_upload}
                            <h3>Lähetä aikaisemmin pelattu score {size}</h3>
                            <NameInput bind:display_name bind:correct_name show_title={false} />
                            <br />
                            {#if upload_error}
                                Virhe lähetettäessä scorea palvelimelle.
                                <br />
                            {/if}
                            {#if !score_submitting}
                                {#if correct_name != null && correct_name != ""}
                                    <button on:click={post} id="post-score">Post Score</button>
                                {/if}
                            {:else}
                                Lähetetään dataa...
                            {/if}
                        {:else}
                            <ol class="lb-stats">
                                {#if refreshPromise}
                                    {#await refreshPromise}
                                        Otetaan yhteyttä palvelimeen...
                                    {:then data} 
                                        <!-- {JSON.stringify(data)} -->
                                        <br />
                                        {#if data.topBoard}
                                            <div class="topboard-container">
                                                <div class="item head">
                                                    <div class="screenName">name</div>
                                                    <div class="score">score</div>
                                                </div>
                                                <div class="items">
                                                    {#each data.topBoard as item, index (item.user)}
                                                        <div class="item" in:fade={{delay: index*50}}>
                                                            <div class="screenName">{item.user.screenName}</div>
                                                            <div class="score">{item.score}</div>
                                                        </div>
                                                        <hr />
                                                    {/each}
                                                </div>
                                            </div>
                                        {:else}
                                            Virheellinen vastaus palvelimelta.
                                        {/if}
                                    {:catch err}
                                        Virhe: {err}
                                    {/await}
                                {/if}
                            </ol>
                        {/if}
                        <div class="lb-disclaimer">
                            <p><strong>HUOMIO:</strong> Leaderboardien vapaan nimenvalinnan väärinkäyttö johtaa banniin!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</main>

<style lang="scss">
    h2 {
        margin-bottom: 0;
    }
    hr{
        margin: 0;
        opacity: .75;
    }
    .items {
        max-height: 200px;
        overflow-y: scroll;
    }
    .item.head{
        background: rgba(255, 255, 255, .1);
    }
    .item.head {
        font-weight: bold;
    }
    .item {
        display: flex;
        padding: .1em .5em;
    }
    .screenName {
        flex: 1;
    }
    .score {
        flex: 1;
    }

    .leaderboard-popup {
        display: flex;
        flex-direction: column;
    }

    @media (max-width: 600px) {
        .lb-popup-container{
            height: 100vh !important;
            width: 100vw !important;
            margin: 0 !important;
        }
        .leaderboard-popup{
            flex-direction: column-reverse;
            height: 100%;
        }
        .lb-header {
            margin-bottom: .75em;
        }
    }

</style>