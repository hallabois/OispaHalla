
<script lang="ts">
    import { marked } from 'marked';
    import { onMount } from "svelte";

    import Leaderboards from "./components/leaderboard.svelte";

    let app_name = "";
    let app_description = "";
    $: if(mounted && base_path != null && base_path != ""){
      fetch(base_path + "/manifest.json")
        .then(response => response.json())
        .then( data=>{
          app_name = data.name;
          app_description = data.subtitle;
          }
        ).catch( () =>{
            app_name = "Oispa Halla";
            app_description = "Yhdistä opettajat ja saavuta **Halla!**";
          }
        )
    }
    else{
      app_name = "Oispa Halla";
      app_description = "Yhdistä opettajat ja saavuta **Halla!**";
    }

    let mounted = false;
    onMount( ()=>{
        if(onInitDone != null){
            onInitDone();
        }
        mounted = true;
        const size = localStorage.HAC_size;
        if(size != null && localStorage["HAC_best_history" + size] != null){
            if( localStorage["last_saved" + size] == null && localStorage["bestGameFinished" + size] == null || (localStorage["HAC_best_history" + size] !== localStorage["last_saved" + size] && localStorage["bestGameFinished" + size] == "true") ){
                lbInstance.show_for_post();
            }
        }
    } );

    let lbInstance;
    // import "./pwa_promoter.js";
</script>

<svelte:head>
  <title>{app_name}</title>
</svelte:head>

<main>
  <div class="container">
    <Leaderboards bind:this={lbInstance} />
    <div class="new-above-game">
      <div class="above-game-left">
        <a href="https://hallabois.github.io/invite/" target="_blank">
          <h1 class="title">{app_name}</h1>
        </a>
        <p class="game-intro">{@html marked.parse(app_description)}</p>
      </div>
      <div class="above-game-right">
        <div class="HAC-container" title="HAC:n tila" style="display:none;">
          <div class="HAC-status">...</div>
        </div>
        <div class="score-container">0</div>
        <div class="best-container">0</div>
        <a class="restart-button">
          <div class="uusi-jakso">Uusi Jakso</div>
          <div class="size-selector">
            <button>&lt;</button>
            <button class="restart-3x3">3x3</button>
            <button class="restart-4x4">4x4</button>
          </div>
        </a>
      </div>
    </div>
    <!-- <div class="heading">
      <a href="https://discord.gg/7x25Jxrkvr" target="_blank">
        <h1 class="title">Oispa Halla</h1>
      </a>
      <div class="scores-container">
      	<div class="HAC-container" title="HAC:n tila" style="display:none;">
          <div class="HAC-status">...</div>
        </div>
        <div class="score-container">0</div>
        <div class="best-container">0</div>
      </div>
    </div>

    <div class="above-game">
      <p class="game-intro">Yhdistä opettajat ja saavuta <strong>Halla!</strong></p>
      <a class="restart-button">
        <div class="uusi-jakso">Uusi Jakso</div>
        <div class="size-selector">
          <button>&lt;</button>
          <button class="restart-3x3">3x3</button>
          <button class="restart-4x4">4x4</button>
        </div>
      </a>
    </div> -->

    <div class="game-container">
      <div class="kurin-palautus-viesti"></div>
      <div class="game-message">
        <p class="tilanne"></p>
        <p class="kurinpalautukset"></p>
        <div class="lower">
	        <a class="keep-playing-button">Jatka pelaamista</a>
          <a class="retry-button">Yritä uudelleen</a>
        </div>
      </div>

      <div class="grid-container">
        <!-- Standard 4x4 -->
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <!-- In case we need more -->
        <!-- 5x5 -->
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <!-- 6x6 -->
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
      </div>

      <div class="tile-container">

      </div>
    </div>
    <div class="underbar-container">
      <div class="kurin-palautus-container">
        <button class="kurin-palautus kurin-palautus-color">
          <a class="parin-kulautus" title="Vai parin kulautus? Lahjot opettajia pois ruudulta, mutta menetät arvosanojasi! Voit lahjoa opettajia vain kolme kertaa ennen kun Halla saa kuulla tilanteesta.">KURINPALAUTUS</a>
        </button>
      </div>
      <div class="button-container">
        <div class="lb-container">
          <a on:click={ ()=>{lbInstance.show()}} id="lb-button" class="color-button" title="Leaderboards">
            <img src="img/svg/leaderboard.svg">
          </a>
        </div>
        <div class="event-container">
          <a class="event-button" title="Toggle Dark Theme">
            <!-- <img src="./img/no_snow.svg" id="event-icon"> -->
            <p id="darkmode-icon">🔆</p>
          </a>
        </div>
      </div>
    </div>
    <div class="pwa-container" style="width: 100%;z-index: 500;display: flex;justify-content: center;margin-top: 30px;margin-bottom: -50px;">
      <button class="pwa-add-button" style="display: none;border: none;margin: .5em;cursor: pointer;">Asenna sovelluksena</button>
    </div>
    <div class="disclaimer">
      <p>
        <strong>HUOMIO:</strong> Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu minkäänlaiseen paremmuusjärjestykseen. Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.
      </p>
      <p>
        Alkuperäisen projektin <a href="https://github.com/gabrielecirulli/2048" target="_blank">2048</a> on tehnyt <a href="http://gabrielecirulli.com" target="_blank">Gabriele Cirulli.</a>
      </p>
      <p>
        Made by <a href="https://hallabois.github.io/invite">Hallabois</a>
      </p>
      <p>
        <a href="https://simpleanalytics.com/oispahalla.com" target="_blank">Simpleanalytics</a>
      </p>
    </div>
    <div class="preload-container"></div>
  </div>
</main>