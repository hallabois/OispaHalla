<script lang="ts">
    import { onMount } from "svelte";
    import { fly, slide } from "svelte/transition";
    let numOfScores = 10;
    let urls = ["https://localhost:5000", "http://localhost:5000", "https://oispahallalb.herokuapp.com", "http://oispahallalb.herokuapp.com"];
    let url = "";
    let connected = false;

    let editing_name = false;
    let visible = true;
    export function toggle(){
        visible = !visible;
    }
    export function show(){
        visible = true;
        console.log(visible);
    }
    export function hide(){
        visible = false;
    }
    
    onMount( () => {

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
        selectURL();
        refreshLeaderboard(localStorage.HAC_size);
    });


    async function selectURL() {
        for (let i in urls) {
            console.log(urls[i]);
            const status = await connectivityCheck(urls[i])
            if(status) {
            console.log("Connected to: " + urls[i]);
            connected = true;
            url = urls[i];
            }
        }
        connected = false;
    }

    async function connectivityCheck(url) {
        try {
            await fetch(url + "/alive")
            .then(response => response.json())
            .then(data => {
            console.log(data);
            if(data.alive) return true;
            })
            .catch(err => {
            console.log(err);
            return false;
            });
        }
        catch(err) {
            return false;
        }
    }
    let refreshPromise;
    function refreshLeaderboard(size) {
        refreshPromise = fetch(`${url}/scores/${size}/fetchboard/${numOfScores}/${localStorage.id ? localStorage.id : ""}`);
        // .then(response => response.json())
        // .then(data => {
        //     lbStats.innerHTML = "";
        //     data.topBoard.forEach(record => {
        //     lbStats.innerHTML += `
        //     <li class="lb-stat">
        //         <div class="lb-stat-label">
        //         ${record.screenName}
        //         </div>
        //         <div class="lb-stat-value">
        //         ${record.score}
        //         </div>
        //     </li>`;
        //     });
        // });
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
            refreshLeaderboard(GameManagerInstance.size);
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
        <div on:click={hide} class="lb-popup" transition:fly>
            <div class="lb-popup-container">
                <div on:click={(e)=>{e.stopPropagation()}} class="leaderboard-popup">
                    <div class="lb-header">
                        <h2 class="lb-title">Leaderboards</h2>
                        <div class="lb-buttons">
                            <a on:click={refresh} id="lb-refresh" class="color-button" title="Päivitä Leaderboardit">
                            <img src="img/svg/refresh.svg" alt="Refresh">
                            </a>
                            <a on:click={edit} id="lb-edit" class="color-button" title="Muuta Käyttäjänimeäsi tai Synkronointikoodiasi">
                            <img src="img/svg/edit.svg" alt="Edit">
                            </a>
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
                                        <input type="text" id="lb-name" placeholder="Käyttäjänimi" minlength="3" maxlength="20" required >
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
                        <ol class="lb-stats"></ol>
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