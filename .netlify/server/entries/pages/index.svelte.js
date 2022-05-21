var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  default: () => Routes
});
module.exports = __toCommonJS(stdin_exports);
var import_index_40eddd98 = require("../../chunks/index-40eddd98.js");
var import_marked = require("marked");
var import_svelte_gestures = require("svelte-gestures");
var import_tournaments_b5505513 = require("../../chunks/tournaments-b5505513.js");
var import_board_df4c0f27 = require("../../chunks/board-df4c0f27.js");
var nameInput_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: ".warn.svelte-ayfjhb{margin-bottom:0;color:#ff6c00;font-size:0.9em}.err.svelte-ayfjhb{margin-bottom:0;color:#ff0000;font-size:0.9em}",
  map: null
};
const NameInput = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let { display_name = "" } = $$props;
  let { show_title = true } = $$props;
  let { correct_name = "" } = $$props;
  if ($$props.display_name === void 0 && $$bindings.display_name && display_name !== void 0)
    $$bindings.display_name(display_name);
  if ($$props.show_title === void 0 && $$bindings.show_title && show_title !== void 0)
    $$bindings.show_title(show_title);
  if ($$props.correct_name === void 0 && $$bindings.correct_name && correct_name !== void 0)
    $$bindings.correct_name(correct_name);
  $$result.css.add(css$2);
  correct_name = display_name ? [...display_name.matchAll(/[\wÅÄÖåäö]{3,20}/g)].join(" ") : "";
  return `<div class="${"name-form-container"}">${show_title ? `<h4 class="${"name-form-title"}">Muuta K\xE4ytt\xE4j\xE4nime\xE4si:</h4>` : ``}
    <form id="${"lb-name-form"}" class="${"name-form"}"><div class="${"name-form-div"}"><label for="${"lb-name"}">Nimi:</label>
            <input type="${"text"}" id="${"lb-name"}" placeholder="${"K\xE4ytt\xE4j\xE4nimi"}" minlength="${"3"}" maxlength="${"20"}" required${(0, import_index_40eddd98.a)("value", display_name, 0)}>
            ${display_name == null || display_name != correct_name || display_name.length == 0 ? `${display_name == null || display_name.length < 3 ? `<p class="${"err svelte-ayfjhb"}">liian lyhyt nimi!</p>` : `${display_name.length > 20 ? `<p class="${"err svelte-ayfjhb"}">liian pitk\xE4 nimi!</p>` : `<p class="${"warn svelte-ayfjhb"}">muokataan muotoon &quot;${(0, import_index_40eddd98.e)(correct_name)}&quot;</p>`}`}` : ``}</div></form>
    <p id="${"name-error"}" class="${"lb-error"}"></p>
</div>`;
});
var icon_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "main.svelte-1cd3gt4{display:flex;align-items:center;justify-content:center;width:100%;height:100%}path.svelte-1cd3gt4{transition:fill-opacity var(--duration), stroke-width var(--duration);stroke-width:var(--s-width)}",
  map: null
};
const Icon = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let { d = null } = $$props;
  let { show_stroke = false } = $$props;
  let { stroke = "none" } = $$props;
  let { stroke_width = "0.5" } = $$props;
  let { fill = "var(--color)" } = $$props;
  let { fill_opacity = "1.0" } = $$props;
  let { animation_length = 1500 } = $$props;
  let { text = null } = $$props;
  let { text_id = "" } = $$props;
  if ($$props.d === void 0 && $$bindings.d && d !== void 0)
    $$bindings.d(d);
  if ($$props.show_stroke === void 0 && $$bindings.show_stroke && show_stroke !== void 0)
    $$bindings.show_stroke(show_stroke);
  if ($$props.stroke === void 0 && $$bindings.stroke && stroke !== void 0)
    $$bindings.stroke(stroke);
  if ($$props.stroke_width === void 0 && $$bindings.stroke_width && stroke_width !== void 0)
    $$bindings.stroke_width(stroke_width);
  if ($$props.fill === void 0 && $$bindings.fill && fill !== void 0)
    $$bindings.fill(fill);
  if ($$props.fill_opacity === void 0 && $$bindings.fill_opacity && fill_opacity !== void 0)
    $$bindings.fill_opacity(fill_opacity);
  if ($$props.animation_length === void 0 && $$bindings.animation_length && animation_length !== void 0)
    $$bindings.animation_length(animation_length);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.text_id === void 0 && $$bindings.text_id && text_id !== void 0)
    $$bindings.text_id(text_id);
  $$result.css.add(css$1);
  return `<main style="${"--duration:" + (0, import_index_40eddd98.e)(animation_length / 10) + "ms;--s-width:" + (0, import_index_40eddd98.e)(stroke_width) + "px"}" class="${"svelte-1cd3gt4"}">${d != null ? `<svg xmlns="${"http://www.w3.org/2000/svg"}" height="${"1em"}" viewBox="${"0 0 24 24"}"><path${(0, import_index_40eddd98.a)("d", d, 0)}${(0, import_index_40eddd98.a)("fill", fill, 0)}${(0, import_index_40eddd98.a)("fill-opacity", fill_opacity, 0)} stroke="${"none"}" class="${"svelte-1cd3gt4"}"></path>${show_stroke ? `<path${(0, import_index_40eddd98.a)("d", d, 0)} fill="${"none"}"${(0, import_index_40eddd98.a)("stroke", stroke, 0)}${(0, import_index_40eddd98.a)("stroke-width", stroke_width + "px", 0)} class="${"svelte-1cd3gt4"}"></path>` : ``}</svg>` : ``}
    ${text != null ? `<span${(0, import_index_40eddd98.a)("id", text_id, 0)}>${(0, import_index_40eddd98.e)(text)}</span>` : ``}
</main>`;
});
let refreshIconData = "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z";
let leaderboardIconData = "M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z";
var leaderboard_svelte_svelte_type_style_lang = "";
const css = {
  code: "h2.svelte-1cjl1vl.svelte-1cjl1vl{margin-bottom:0}hr.svelte-1cjl1vl.svelte-1cjl1vl{margin:0;opacity:0.75}.items.svelte-1cjl1vl.svelte-1cjl1vl{max-height:200px;overflow-y:scroll}.item.head.svelte-1cjl1vl.svelte-1cjl1vl{background:rgba(255, 255, 255, 0.1)}.item.head.svelte-1cjl1vl.svelte-1cjl1vl{font-weight:bold}.item.svelte-1cjl1vl.svelte-1cjl1vl{display:flex;padding:0.1em 0.5em}.item.item-self.svelte-1cjl1vl.svelte-1cjl1vl{font-weight:bold}.screenName.svelte-1cjl1vl.svelte-1cjl1vl{flex:1}.score.svelte-1cjl1vl.svelte-1cjl1vl{flex:1}.leaderboard-popup.svelte-1cjl1vl.svelte-1cjl1vl{display:flex;flex-direction:column}.submit-buttons-container.svelte-1cjl1vl.svelte-1cjl1vl{display:flex}.submit-buttons-container.svelte-1cjl1vl button.svelte-1cjl1vl{flex:1;line-height:2em}@media(max-width: 600px){.lb-popup-container.svelte-1cjl1vl.svelte-1cjl1vl{height:100vh !important;width:100vw !important;margin:0 !important}.leaderboard-popup.svelte-1cjl1vl.svelte-1cjl1vl{flex-direction:column-reverse;height:100%}.lb-header.svelte-1cjl1vl.svelte-1cjl1vl{margin-bottom:0.75em}}",
  map: null
};
globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
let numOfScores = 10;
function hasUnsavedScore() {
  const size = localStorage.HAC_size;
  if (size != null && localStorage["HAC_best_history" + size] != null) {
    if (localStorage["last_saved" + size] == null && localStorage["bestGameFinished" + size] == null || localStorage["HAC_best_history" + size] !== localStorage["last_saved" + size] && localStorage["bestGameFinished" + size] == "true") {
      return size;
    }
  }
  return null;
}
const Leaderboard = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  var __awaiter = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  let urls = ["https://localhost:5000", "http://localhost:5000"];
  let url = "";
  let { connected = false } = $$props;
  let size = 4;
  let display_name = "";
  let correct_name = "";
  let id = "";
  let { editing_name = false } = $$props;
  let { editing_upload = false } = $$props;
  let upload_error = false;
  let visible = false;
  let score_submitting = false;
  let id_hidden = true;
  function toggle() {
    visible = !visible;
  }
  function show(withSize = null) {
    if (hasUnsavedScore() != null) {
      editing_upload = true;
    }
    visible = true;
    if (withSize == null) {
      size = 4;
    } else {
      size = withSize;
    }
    refresh();
  }
  function hide() {
    visible = false;
    editing_name = false;
    editing_upload = false;
    upload_error = false;
    score_submitting = false;
    id_hidden = true;
  }
  function game_ended_with_best_score(e) {
    editing_upload = true;
    show(JSON.parse(localStorage["HAC_size"]));
  }
  function selectURL() {
    return __awaiter(this, void 0, void 0, function* () {
      for (let i in urls) {
        console.log("Trying " + urls[i]);
        const status = yield connectivityCheck(urls[i]);
        console.log(`Status for ${urls[i]}: ${status}`);
        if (status) {
          console.log("Connected to: " + urls[i]);
          connected = true;
          url = urls[i];
          return;
        }
      }
      connected = false;
    });
  }
  function connectivityCheck(url2) {
    return __awaiter(this, void 0, void 0, function* () {
      let out = false;
      try {
        yield fetch(url2 + "/alive").then((response) => response.json()).then((data) => {
          console.log(data);
          if (data.alive) {
            console.log(`${url2} is alive!`);
            out = true;
          }
        }).catch((err) => {
          console.log(err);
        });
      } catch (err) {
        return false;
      }
      return out;
    });
  }
  let refreshPromise;
  function refreshLeaderboard(size2) {
    return __awaiter(this, void 0, void 0, function* () {
      const res = yield fetch(`${url}/scores/size/${size2}/fetchboard/${numOfScores}/${localStorage.id ? localStorage.id : ""}`);
      if (res.ok) {
        const data = yield res.json();
        console.log("Got: ", data);
        return data;
      } else {
        if (res.status == 404) {
          throw new Error("Palvelimeen ei saada yhteytt\xE4.");
        }
        if (localStorage.id) {
          const res2 = yield fetch(`${url}/scores/size/${size2}/fetchboard/${numOfScores}/`);
          if (res2.ok) {
            const data = yield res2.json();
            console.log("Got (second try): ", data);
            return data;
          } else {
            throw new Error(res2.statusText);
          }
        }
        throw new Error(res.statusText);
      }
    });
  }
  function refresh() {
    if (!connected) {
      refreshPromise = null;
      selectURL().then(() => {
        refreshPromise = refreshLeaderboard(GameManagerInstance.size);
      });
    } else if (GameManagerInstance) {
      refreshPromise = refreshLeaderboard(GameManagerInstance.size);
    }
  }
  if ($$props.connected === void 0 && $$bindings.connected && connected !== void 0)
    $$bindings.connected(connected);
  if ($$props.editing_name === void 0 && $$bindings.editing_name && editing_name !== void 0)
    $$bindings.editing_name(editing_name);
  if ($$props.editing_upload === void 0 && $$bindings.editing_upload && editing_upload !== void 0)
    $$bindings.editing_upload(editing_upload);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle !== void 0)
    $$bindings.toggle(toggle);
  if ($$props.show === void 0 && $$bindings.show && show !== void 0)
    $$bindings.show(show);
  if ($$props.hide === void 0 && $$bindings.hide && hide !== void 0)
    $$bindings.hide(hide);
  if ($$props.game_ended_with_best_score === void 0 && $$bindings.game_ended_with_best_score && game_ended_with_best_score !== void 0)
    $$bindings.game_ended_with_best_score(game_ended_with_best_score);
  if ($$props.hasUnsavedScore === void 0 && $$bindings.hasUnsavedScore && hasUnsavedScore !== void 0)
    $$bindings.hasUnsavedScore(hasUnsavedScore);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `

  

<main>${visible ? `<div class="${"lb-popup"}"><div class="${"lb-popup-container svelte-1cjl1vl"}"><div class="${"leaderboard-popup svelte-1cjl1vl"}"><div class="${"lb-header svelte-1cjl1vl"}"><h2 class="${"lb-title svelte-1cjl1vl"}"${(0, import_index_40eddd98.a)("title", url ? `Yhdistetty palvelimeen ${url}` : "Ei yhteytt\xE4 palvelimeen.", 0)}>Leaderboards ${(0, import_index_40eddd98.e)(size)}x${(0, import_index_40eddd98.e)(size)}</h2>
                        <div class="${"lb-buttons"}"><a id="${"lb-refresh"}" class="${"color-button"}" title="${"P\xE4ivit\xE4 Leaderboardit"}">
                                ${(0, import_index_40eddd98.v)(Icon, "Icon").$$render($$result, {
      show_stroke: !refreshPromise,
      stroke: "var(--color)",
      stroke_width: refreshPromise != null ? "0" : "1",
      fill_opacity: refreshPromise ? "1.0" : "0",
      d: refreshIconData
    }, {}, {})}</a>
                            ${connected ? `<a id="${"lb-edit"}" class="${"color-button"}" title="${"Muuta K\xE4ytt\xE4j\xE4nime\xE4si tai Synkronointikoodiasi"}"><img src="${"img/svg/edit.svg"}" alt="${"Edit"}"></a>` : ``}
                            <a id="${"lb-close"}" title="${"Sulje Leaderboardit"}">\xD7</a></div></div>
                    <div class="${"lb-content"}">${editing_name ? `<div class="${"form-container"}" style="${"display: block;"}"><hr class="${"svelte-1cjl1vl"}">
                                ${(0, import_index_40eddd98.v)(NameInput, "NameInput").$$render($$result, { display_name, correct_name }, {
      display_name: ($$value) => {
        display_name = $$value;
        $$settled = false;
      },
      correct_name: ($$value) => {
        correct_name = $$value;
        $$settled = false;
      }
    }, {})}
                                <div class="${"sync-form-container"}"><div class="${"form-title-container"}"><h4 class="${"name-form-title"}">Muuta Synkronointikoodiasi: (24 merkki\xE4)</h4>
                                        <div class="${"tooltip"}"><span class="${"tooltiptext"}">Voit kopioida synkronointikoodisi t\xE4st\xE4, ja k\xE4ytt\xE4\xE4 sit\xE4 eri laitteella synkronoidaksesi &quot;tilisi&quot; ja paikkasi Leaderboardeilla\u2122</span>
                                            <div class="${"color-button"}"><img src="${"img/svg/help.svg"}" alt="${"?"}"></div></div></div>
                                    <div id="${"lb-sync-form"}" class="${"name-form"}"><div class="${"name-form-div"}"><label for="${"lb-uid"}">Koodi: </label>
                                        ${id_hidden ? `<input type="${"password"}" id="${"lb-uid"}" placeholder="${"Synkronointikoodi"}" minlength="${"24"}" maxlength="${"24"}" disabled${(0, import_index_40eddd98.a)("value", id, 0)}>` : `<input type="${"text"}" id="${"lb-uid"}" placeholder="${"Synkronointikoodi"}" minlength="${"24"}" maxlength="${"24"}"${(0, import_index_40eddd98.a)("value", id, 0)}>`}</div>
                                        <button>${(0, import_index_40eddd98.e)(id_hidden ? "n\xE4yt\xE4" : "piilota")}</button>
                                        <button id="${"lb-save"}">Tallenna</button></div>
                                    <p id="${"sync-error"}" class="${"lb-error"}"></p></div>
                                <hr class="${"closerhr svelte-1cjl1vl"}"></div>` : ``}
                        ${editing_upload ? `<h3>L\xE4het\xE4 aikaisemmin pelattu score ${(0, import_index_40eddd98.e)(JSON.parse(localStorage.bestScores)[size])}</h3>
                            ${(0, import_index_40eddd98.v)(NameInput, "NameInput").$$render($$result, {
      show_title: false,
      display_name,
      correct_name
    }, {
      display_name: ($$value) => {
        display_name = $$value;
        $$settled = false;
      },
      correct_name: ($$value) => {
        correct_name = $$value;
        $$settled = false;
      }
    }, {})}
                            <br>
                            ${upload_error ? `Virhe l\xE4hetett\xE4ess\xE4 scorea palvelimelle.
                                <br>` : ``}
                            ${!score_submitting ? `${correct_name != null && correct_name != "" ? `<div class="${"submit-buttons-container svelte-1cjl1vl"}"><button id="${"post-score"}" class="${"svelte-1cjl1vl"}">Post Score</button>
                                        <button id="${"post-score"}" class="${"svelte-1cjl1vl"}">Skip for now</button></div>` : ``}` : `L\xE4hetet\xE4\xE4n dataa...`}` : `<ol class="${"lb-stats"}">${refreshPromise ? `${function(__value) {
      if ((0, import_index_40eddd98.i)(__value)) {
        __value.then(null, import_index_40eddd98.n);
        return `
                                        Otetaan yhteytt\xE4 palvelimeen...
                                    `;
      }
      return function(data) {
        return ` 
                                        
                                        <br>
                                        ${data.topBoard ? `<div class="${"topboard-container"}"><div class="${"item head svelte-1cjl1vl"}"><div class="${"screenName svelte-1cjl1vl"}">name</div>
                                                    <div class="${"score svelte-1cjl1vl"}">score</div></div>
                                                <div class="${"items svelte-1cjl1vl"}">${(0, import_index_40eddd98.b)(data.topBoard, (item, index) => {
          return `<div class="${"item " + (0, import_index_40eddd98.e)(item.user.screenName === display_name ? "item-self" : "") + " svelte-1cjl1vl"}"><div class="${"screenName svelte-1cjl1vl"}">${(0, import_index_40eddd98.e)(item.user.screenName)} ${(0, import_index_40eddd98.e)(item.user.screenName === display_name ? "(sin\xE4)" : "")}</div>
                                                            <div class="${"score svelte-1cjl1vl"}">${(0, import_index_40eddd98.e)(item.score)}</div></div>
                                                        <hr class="${"svelte-1cjl1vl"}">`;
        })}</div></div>` : `Virheellinen vastaus palvelimelta.`}
                                    `;
      }(__value);
    }(refreshPromise)}` : ``}</ol>`}
                        <div class="${"lb-disclaimer"}"><p><strong>HUOMIO:</strong> Leaderboardien vapaan nimenvalinnan v\xE4\xE4rink\xE4ytt\xF6 johtaa banniin!</p></div></div></div></div></div>` : ``}</main>



`;
  } while (!$$settled);
  return $$rendered;
});
var tutorialSlide_svelte_svelte_type_style_lang = "";
var tutorial_svelte_svelte_type_style_lang = "";
let app_name_default = "Oispa Halla";
let app_description_default = "Yhdist\xE4 opettajat ja saavuta **Halla!**";
let app_notice_default = "**HUOMIO**: Pelin lista opettajista on tehty t\xE4ysin sattumanvaraisesti, eik\xE4 opettajia ole laitettu mink\xE4\xE4nlaiseen paremmuusj\xE4rjestykseen. Rakastamme kaikkia opettajia sek\xE4 arvostamme kaikkien heid\xE4n ty\xF6t\xE4ns\xE4 yht\xE4 paljon \u2764\uFE0F.";
let app_name_newgame_default = "Uusi Jakso";
let app_name_score_default = "arvosana";
let app_name_hiscore_default = "paras halla";
const Routes = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let app_name = "";
  let app_description = "";
  let app_notice = "";
  let app_name_newgame = "";
  let app_name_score = "";
  let app_name_hiscore = "";
  function setDefaultMetaValues() {
    app_name = app_name_default;
    app_description = app_description_default;
    app_notice = app_notice_default;
    app_name_newgame = app_name_newgame_default;
    app_name_score = app_name_score_default;
    app_name_hiscore = app_name_hiscore_default;
  }
  let lbInstance;
  let TtInstance;
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      {
        setDefaultMetaValues();
      }
    }
    $$rendered = `




${$$result.head += `${$$result.title = `<title>${(0, import_index_40eddd98.e)(app_name)}</title>`, ""}`, ""}

<main><div class="${"container"}">${(0, import_index_40eddd98.v)(Leaderboard, "Leaderboards").$$render($$result, { this: lbInstance }, {
      this: ($$value) => {
        lbInstance = $$value;
        $$settled = false;
      }
    }, {})}
    ${(0, import_index_40eddd98.v)(import_tournaments_b5505513.T, "Tournaments").$$render($$result, { this: TtInstance }, {
      this: ($$value) => {
        TtInstance = $$value;
        $$settled = false;
      }
    }, {})}
    <div class="${"new-above-game"}"><div class="${"above-game-left"}"><a href="${"https://hallabois.github.io/invite/"}" target="${"_blank"}"><h1 class="${"title"}">${(0, import_index_40eddd98.e)(app_name)}</h1></a>
        <p class="${"game-intro"}"><!-- HTML_TAG_START -->${import_marked.marked.parse(app_description)}<!-- HTML_TAG_END --></p></div>
      <div class="${"above-game-right"}"><div class="${"HAC-container"}" title="${"HAC:n tila"}" style="${"display:none;"}"><div class="${"HAC-status"}">...</div></div>
        <div class="${"score-container"}" style="${"--c:'" + (0, import_index_40eddd98.e)(app_name_score) + "'"}">0</div>
        <div class="${"best-container"}" style="${"--c:'" + (0, import_index_40eddd98.e)(app_name_hiscore) + "'"}">0</div>
        <button class="${"restart-button button"}"><div class="${"uusi-jakso"}">${(0, import_index_40eddd98.e)(app_name_newgame)}</div>
          <div class="${"size-selector"}"><button>&lt;</button>
            <button class="${"restart-3x3"}">3x3</button>
            <button class="${"restart-4x4"}">4x4</button></div></button></div></div>
    

    <div class="${"game-container"}"><div class="${"kurin-palautus-viesti"}"></div>
      <div class="${"game-message"}"><p class="${"tilanne"}"></p>
        <p class="${"kurinpalautukset"}"></p>
        <div class="${"lower"}"><button class="${"button keep-playing-button"}">Jatka pelaamista</button>
          <button class="${"button retry-button"}">Yrit\xE4 uudelleen</button></div></div>

      <div class="${"grid-container"}">
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        
        
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div>
        <div class="${"grid-cell"}"></div></div>

      <div class="${"tile-container"}"></div></div>
    <div class="${"underbar-container"}">
      <button class="${"button background-none color-button"}" title="${"Tournament Mode"}">\u2694
      </button>
      <div class="${"kurin-palautus-container"}"><button class="${"button kurin-palautus kurin-palautus-color"}"><span class="${"parin-kulautus"}" title="${"Vai parin kulautus? Lahjot opettajia pois ruudulta, mutta menet\xE4t arvosanojasi! Voit lahjoa opettajia vain kolme kertaa ennen kun Halla saa kuulla tilanteesta."}">KURINPALAUTUS</span></button></div>
      <div class="${"button-container"}"><div class="${"lb-container"}"><button id="${"lb-button"}" class="${"color-button button background-none icon-button"}" title="${"Leaderboards"}">
            ${(0, import_index_40eddd98.v)(Icon, "Icon").$$render($$result, {
      stroke: "var(--color)",
      d: leaderboardIconData
    }, {}, {})}</button></div>
        <div class="${"event-container"}"> 
          <button class="${"event-button button background-none icon-button"}" style="${"font-size: 1rem;"}" title="${"Toggle Dark Theme"}">
            
            ${(0, import_index_40eddd98.v)(Icon, "Icon").$$render($$result, {
      text_id: "darkmode-icon",
      stroke: "var(--color)",
      text: "\u{1F506}"
    }, {}, {})}</button></div></div></div>
    <div class="${"pwa-container"}" style="${"width: 100%;z-index: 500;display: flex;justify-content: center;margin-top: 30px;margin-bottom: -50px;"}"><button class="${"pwa-add-button"}" style="${"display: none;border: none;margin: .5em;cursor: pointer;"}">Asenna sovelluksena</button></div>
    <div class="${"disclaimer"}"><p><!-- HTML_TAG_START -->${import_marked.marked.parse(app_notice)}<!-- HTML_TAG_END --></p>
      <p>Alkuper\xE4isen projektin <a href="${"https://github.com/gabrielecirulli/2048"}" target="${"_blank"}">2048</a> on tehnyt <a href="${"http://gabrielecirulli.com"}" target="${"_blank"}">Gabriele Cirulli.</a></p>
      <p>Made by <a href="${"https://hallabois.github.io/invite"}">Hallabois</a></p>
      <p><a href="${"https://simpleanalytics.com/oispahalla.com"}" target="${"_blank"}">Simpleanalytics</a></p></div>
    <div class="${"preload-container"}"></div></div>

  <script src="${"/js/local_storage_manager.js"}"><\/script>
	<script src="${"/js/HAC.js"}"><\/script>
	<script src="${"/js/bind_polyfill.js"}"><\/script>
	<script src="${"/js/classlist_polyfill.js"}"><\/script>
	<script src="${"/js/animframe_polyfill.js"}"><\/script>
	<script src="${"/js/keyboard_input_manager.js"}"><\/script>
	<script src="${"/js/html_actuator.js"}"><\/script>
	<script src="${"/js/grid.js"}"><\/script>
	<script src="${"/js/tile.js"}"><\/script>
	<script src="${"/js/game_manager.js"}"><\/script>
	<script src="${"/js/application.js"}"><\/script>
	
	<script src="${"/pwa_promoter.js"}"><\/script></main>`;
  } while (!$$settled);
  return $$rendered;
});
