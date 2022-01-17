<script lang="ts">
    import { onMount } from "svelte";
    import { fly, slide, fade } from "svelte/transition";
    let numOfScores = 10;
    let urls = ["https://localhost:5000", "http://localhost:5000", "https://oispahallalb.herokuapp.com", "http://oispahallalb.herokuapp.com"];
    let url = "";
    let connected = false;
    
    let display_name = "";
    $: if(mounted && display_name != null){
        localStorage.display_name = display_name;
    }

    let mounted = false;
    let editing_name = false;
    let visible = false;
    let input_enabled = true; // tän vois siirtää inputManageriin
    $: if(mounted && window != null && visible != null){
        window.isLeaderboardOpen = visible;
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
    export function show(){
        visible = true;
    }
    export function hide(){
        visible = false;
        editing_name = false;
    }
    
    onMount( async () => {

        // Load data from localstorage
        display_name = localStorage.display_name;

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
    $: console.log("promise: ", refreshPromise);
    async function refreshLeaderboard(size) {
        const res = await fetch(`${url}/scores/${size}/fetchboard/${numOfScores}/${localStorage.id ? localStorage.id : ""}`);

        if (res.ok) {
            const data = await res.json();
            console.log("Got: ", data);
            return data;
        } else {
            throw new Error(res.statusText);
        }
    }
    async function postScore(game) {
        if(localStorage.screenName === undefined) {
            lbNameForm.style.display = "block";
            return;
        }
        if(!game.history && !game.palautukset == undefined && !game.score) {
            console.log(game);
            return;
        }
        const parsedHistory = game.size + "x" + game.size + "S" + game.history.join(":");
        await fetch(url + "/scores/" + game.size, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            id: null || localStorage.id,
            screenName: localStorage.screenName,
            score: game.score,
            breaks: game.palautukset,
            history: parsedHistory
            })
        })
        .then(response => {
            console.log(response);
            if(response.ok) {
            return response.json();
            }
            console.log("Unexpected status code on POST: " + response.status, response.json());
        })
        .then(data => {
            console.log(data);
            localStorage.id = data.createdScore._id;
            refreshLeaderboard(localStorage.HAC_size);
        });
    }
    function refresh(){
        if(GameManagerInstance){
            refreshPromise = refreshLeaderboard(GameManagerInstance.size);
        }
    }
    function edit(){
        editing_name = !editing_name;
        return;
        lbNameForm.value = "" || localStorage.screenName;
            lbSyncForm.value = "" || localStorage.id;
            lbFormContainer.style.display === "block" ? lbFormContainer.style.display = "none" : lbFormContainer.style.display = "block";
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
                        >Leaderboards</h2>
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
                                <div class="name-form-container">
                                    <h4 class="name-form-title">Muuta Käyttäjänimeäsi:</h4>
                                    <form id="lb-name-form" class="name-form">
                                        <div class="name-form-div">
                                        <label for="lb-name">Nimi:</label>
                                        <input type="text" id="lb-name" placeholder="Käyttäjänimi" minlength="3" maxlength="20" required bind:value={display_name}>
                                        </div>
                                        <button id="lb-save">Tallenna</button>
                                    </form>
                                    <p id="name-error" class="lb-error"></p>
                                </div>
                                <div class="sync-form-container">
                                    <div class="form-title-container">
                                        <h4 class="name-form-title">Muuta Synkronointikoodiasi: (24 merkkiä)</h4>
                                        <div class="tooltip">
                                            <span class="tooltiptext">Voit kopioida synkronointikoodisi tästä, ja käyttää sitä eri laitteella synkronoidaksesi "tilisi" ja paikkasi Leaderboardeilla™</span>
                                            <div class="color-button">
                                                <img src="img/svg/help.svg">
                                            </div>
                                        </div>
                                    </div>
                                    <form id="lb-sync-form" class="name-form">
                                        <div class="name-form-div">
                                        <label for="lb-uid">Koodi: </label>
                                        <input type="password" id="lb-uid" placeholder="Synkronointikoodi" minlength="24" maxlength="24" >
                                        </div>
                                        <button id="lb-save">Tallenna</button>
                                    </form>
                                    <p id="sync-error" class="lb-error"></p>
                                </div>
                                <hr class="closerhr">
                            </div>
                        {/if}
                        <ol class="lb-stats">
                            {#if refreshPromise}
                                {#await refreshPromise}
                                    Otetaan yhteyttä palvelimeen...
                                {:then data} 
                                    {JSON.stringify(data)}
                                {:catch err}
                                    Virhe: {err}
                                {/await}
                            {/if}
                        </ol>
                        <button id="post-score">Post Score</button>
                        <div class="lb-disclaimer">
                            <p><strong>HUOMIO:</strong> Leaderboardien vapaan nimenvalinnan väärinkäyttö johtaa kieltoon niiltä!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</main>