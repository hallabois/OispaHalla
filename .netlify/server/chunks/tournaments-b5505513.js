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
  T: () => Tournaments,
  a: () => poll_success,
  b: () => poll_board_string,
  c: () => poll_other_boards_string,
  d: () => poll_send_moves,
  h: () => hac_gamestate_to_grid,
  j: () => joined_game_data,
  p: () => poll_game,
  s: () => server_status
});
module.exports = __toCommonJS(stdin_exports);
var import_index_40eddd98 = require("./index-40eddd98.js");
var import_board_df4c0f27 = require("./board-df4c0f27.js");
var popup_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: ".popup.svelte-lbjdej{display:flex;flex-direction:column}h2.lb-title.svelte-lbjdej{margin-bottom:0}button.svelte-lbjdej{color:var(--color)}@media(max-width: 600px){.lb-popup-container.svelte-lbjdej{height:100vh !important;width:100vw !important;margin:0 !important}.popup.svelte-lbjdej{flex-direction:column-reverse;height:100%}.lb-header.svelte-lbjdej{margin-bottom:0.75em}}",
  map: null
};
const Popup = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let { open = false } = $$props;
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  $$result.css.add(css$2);
  return `




${open ? `<main class="${"lb-popup"}"><div class="${"lb-popup-container svelte-lbjdej"}"><div class="${"popup svelte-lbjdej"}"><div class="${"lb-header svelte-lbjdej"}"><h2 class="${"lb-title svelte-lbjdej"}">${slots.title ? slots.title({}) : `
                            This is a generic popup.
                        `}</h2>
                    <div class="${"lb-buttons"}">${slots.buttons ? slots.buttons({}) : `
                            <button title="${"Close window"}" class="${"button background-none color-button svelte-lbjdej"}">\xD7</button>
                        `}</div></div>
                <div class="${"lb-content"}">${slots.content ? slots.content({}) : `
                        <p>Please fill me with content.</p>
                    `}</div></div></div></main>` : ``}`;
});
const subscriber_queue = [];
function writable(value, start = import_index_40eddd98.n) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if ((0, import_index_40eddd98.d)(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run, invalidate = import_index_40eddd98.n) {
    const subscriber = [run, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || import_index_40eddd98.n;
    }
    run(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
let tournament_endpoint = process.env.NODE_ENV !== "development" ? "https://hac.oispahalla.com:9000/ohts/api" : "https://0.0.0.0:9000/ohts/api";
let server_status = writable(null);
async function checkAlive() {
  try {
    server_status.set(null);
    let resp = await fetch(`${tournament_endpoint}/alive`);
    if (resp.ok) {
      server_status.set(true);
      return true;
    }
  } catch (error) {
    server_status.set(false);
    return false;
  }
  server_status.set(false);
  return false;
}
let joined_game_id = writable(null);
let joined_game_user_id = writable(null);
let joined_game_am_host = writable(false);
let joined_game_host_pswds = {};
let joined_game_data = writable(null);
let joined_game_error = writable(null);
async function poll() {
  let moves = poll_send_moves;
  moves = moves.filter((i, idx) => poll_send_moves[idx - 1] !== i);
  poll_send_moves = [];
  let resp = await fetch(`${tournament_endpoint}/poll/${(0, import_index_40eddd98.g)(joined_game_id)}`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "user_id": (0, import_index_40eddd98.g)(joined_game_user_id),
      "moves": moves
    })
  });
  if (resp.ok) {
    let data = await resp.json();
    return data;
  } else {
    return null;
  }
}
let poll_success = writable(null);
let poll_board_string = writable(null);
let poll_other_boards_string = writable(null);
let poll_game = writable(null);
let poll_index = writable(null);
let poll_send_moves = [];
setInterval(() => {
  if ((0, import_index_40eddd98.g)(joined_game_id) != null) {
    poll().then((polldata) => {
      if (polldata != null) {
        poll_success.set(true);
        poll_board_string.set(polldata.board);
        poll_game.set(polldata.game);
        poll_index.set(polldata.history_index);
        poll_other_boards_string.set(polldata.other_boards);
      } else {
        poll_success.set(false);
      }
    });
  } else {
    poll_success.set(null);
  }
}, 400);
var tournamentCreator_svelte_svelte_type_style_lang = "";
var tournamentBrowser_svelte_svelte_type_style_lang = "";
class Tile {
  constructor(position, value, id = null) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;
    this.id = id;
    this.previousPosition = null;
    this.mergedFrom = null;
  }
  savePosition() {
    this.previousPosition = { x: this.x, y: this.y };
  }
  updatePosition(position) {
    this.x = position.x;
    this.y = position.y;
  }
  serialize() {
    return {
      position: {
        x: this.x,
        y: this.y
      },
      value: this.value
    };
  }
}
class Grid {
  constructor(size, previousState = null) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
  }
  empty() {
    var cells = [];
    for (var x = 0; x < this.size; x++) {
      var row = cells[x] = [];
      for (var y = 0; y < this.size; y++) {
        row.push(null);
      }
    }
    return cells;
  }
  fromState(state) {
    var cells = [];
    for (var x = 0; x < this.size; x++) {
      var row = cells[x] = [];
      for (var y = 0; y < this.size; y++) {
        var tile = state[x][y];
        row.push(tile ? new Tile(tile.position, tile.value) : null);
      }
    }
    return cells;
  }
  randomAvailableCell() {
    var cells = this.availableCells();
    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  }
  availableCells() {
    var cells = [];
    this.eachCell(function(x, y, tile) {
      if (!tile) {
        cells.push({ x, y });
      }
    });
    return cells;
  }
  eachCell(callback) {
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  }
  cellsAvailable() {
    return !!this.availableCells().length;
  }
  cellAvailable(cell) {
    return !this.cellOccupied(cell);
  }
  cellOccupied(cell) {
    return !!this.cellContent(cell);
  }
  cellContent(cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    } else {
      return null;
    }
  }
  insertTile(tile) {
    this.cells[tile.x][tile.y] = tile;
  }
  removeTile(tile) {
    this.cells[tile.x][tile.y] = null;
  }
  withinBounds(position) {
    return position.x >= 0 && position.x < this.size && position.y >= 0 && position.y < this.size;
  }
  serialize() {
    var cellState = [];
    for (var x = 0; x < this.size; x++) {
      var row = cellState[x] = [];
      for (var y = 0; y < this.size; y++) {
        row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
      }
    }
    return {
      size: this.size,
      cells: cellState
    };
  }
  serialize_HAC() {
    var state = [];
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        try {
          if (this.cells[x][y]) {
            state.push(this.cells[x][y].value);
          } else {
            state.push(0);
          }
        } catch {
          state.push(0);
        }
      }
    }
    return state;
  }
  palautaKuri() {
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        if (this.cells[x][y] && this.cells[x][y].value < 16) {
          this.cells[x][y] = null;
        }
      }
    }
  }
}
function hac_gamestate_to_grid(gamestate) {
  let data = JSON.parse(gamestate.replaceAll("SCOREHERE", "0"));
  let size = data.grid.size;
  let cells = data.grid.cells.flat();
  let grid = new Grid(size);
  let newcells = cells.filter((t) => t && t.position).map((t) => new Tile({ x: t.position.y, y: t.position.x }, t.value, t.id)).filter((t) => t.x < size && t.y < size);
  for (let y in grid.cells) {
    for (let x in grid.cells) {
      grid.cells[y][x] = newcells.find((t2) => x == t2.x && y == t2.y) || grid.cells[y][x];
    }
  }
  return grid;
}
var lobby_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".top.svelte-17g0ry5{display:flex;justify-content:space-between}.data.svelte-17g0ry5{display:flex;flex-wrap:wrap;gap:1em}.game-preview.svelte-17g0ry5{--field-width:300px !important;--tile-size:calc(calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) / var(--grid-size));overflow:hidden;display:block;width:300px;height:300px;border-radius:6px}.start.svelte-17g0ry5{margin-top:1em}hr.svelte-17g0ry5{margin-block:.25em}",
  map: null
};
const Lobby = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let $joined_game_error, $$unsubscribe_joined_game_error;
  let $joined_game_am_host, $$unsubscribe_joined_game_am_host;
  let $joined_game_data, $$unsubscribe_joined_game_data;
  let $joined_game_id, $$unsubscribe_joined_game_id;
  let $poll_success, $$unsubscribe_poll_success;
  let $poll_game, $$unsubscribe_poll_game;
  $$unsubscribe_joined_game_error = (0, import_index_40eddd98.f)(joined_game_error, (value) => $joined_game_error = value);
  $$unsubscribe_joined_game_am_host = (0, import_index_40eddd98.f)(joined_game_am_host, (value) => $joined_game_am_host = value);
  $$unsubscribe_joined_game_data = (0, import_index_40eddd98.f)(joined_game_data, (value) => $joined_game_data = value);
  $$unsubscribe_joined_game_id = (0, import_index_40eddd98.f)(joined_game_id, (value) => $joined_game_id = value);
  $$unsubscribe_poll_success = (0, import_index_40eddd98.f)(poll_success, (value) => $poll_success = value);
  $$unsubscribe_poll_game = (0, import_index_40eddd98.f)(poll_game, (value) => $poll_game = value);
  $$result.css.add(css$1);
  $$unsubscribe_joined_game_error();
  $$unsubscribe_joined_game_am_host();
  $$unsubscribe_joined_game_data();
  $$unsubscribe_joined_game_id();
  $$unsubscribe_poll_success();
  $$unsubscribe_poll_game();
  return `<main>${$joined_game_error ? `<p>Virhe pelin tietoja haettaessa: ${(0, import_index_40eddd98.e)($joined_game_error)}</p>
        <button>Yrit\xE4 Uudelleen</button>
        <button>Anna Olla</button>` : `<div class="${"top svelte-17g0ry5"}"><button class="${""}">Poistu Pelist\xE4</button>
            ${$joined_game_am_host ? `J\xE4rjest\xE4j\xE4 \u{1F451}
                <button class="${""}">Poista Peli
                </button>` : ``}</div>
        <hr class="${"svelte-17g0ry5"}">
        ${$joined_game_data ? `<p>Liitytty peliin &quot;${(0, import_index_40eddd98.e)($joined_game_data.name)}&quot;</p>
            <p>Liittymiskoodi on ${(0, import_index_40eddd98.e)($joined_game_id)}</p>
            <div class="${"data svelte-17g0ry5"}"><div><h3>Aloitustilanne</h3>
                    <div class="${"game-preview svelte-17g0ry5"}">${(0, import_index_40eddd98.v)(import_board_df4c0f27.B, "Board").$$render($$result, {
    grid: hac_gamestate_to_grid($joined_game_data.starting_state)
  }, {}, {})}</div></div>
                <div><h3>Pelaajat</h3>
                    <p>${(0, import_index_40eddd98.e)($joined_game_data.clients)} ${(0, import_index_40eddd98.e)($joined_game_data.clients == 1 ? "pelaaja" : "pelaajaa")}</p></div></div>` : `<p>Ladataan pelin tietoja...</p>
            <div class="${"data svelte-17g0ry5"}"><div><h3>...</h3>
                    <div class="${"game-preview svelte-17g0ry5"}"></div></div>
                <div><h3>...</h3></div></div>`}
        ${$joined_game_am_host && $poll_success ? `<div class="${"start svelte-17g0ry5"}"><button class="${"button action-btn"}" ${$poll_game.active ? "disabled" : ""}>Aloita Peli</button></div>` : ``}
        ${!$joined_game_am_host && $poll_success ? `<div class="${"start svelte-17g0ry5"}"><p>Odotetaan pelin alkua...</p></div>` : ``}`}
</main>`;
});
var tournamentJoiner_svelte_svelte_type_style_lang = "";
var tournaments_svelte_svelte_type_style_lang = "";
const css = {
  code: ".action-chooser.svelte-1g3into{display:flex;flex-direction:column;gap:.5em;margin-top:.5em}.back.svelte-1g3into{font-size:.75em}",
  map: null
};
const Tournaments = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let $poll_game, $$unsubscribe_poll_game;
  let $poll_success, $$unsubscribe_poll_success;
  let $joined_game_id, $$unsubscribe_joined_game_id;
  let $joined_game_am_host, $$unsubscribe_joined_game_am_host;
  let $joined_game_user_id, $$unsubscribe_joined_game_user_id;
  $$unsubscribe_poll_game = (0, import_index_40eddd98.f)(poll_game, (value) => $poll_game = value);
  $$unsubscribe_poll_success = (0, import_index_40eddd98.f)(poll_success, (value) => $poll_success = value);
  $$unsubscribe_joined_game_id = (0, import_index_40eddd98.f)(joined_game_id, (value) => $joined_game_id = value);
  $$unsubscribe_joined_game_am_host = (0, import_index_40eddd98.f)(joined_game_am_host, (value) => $joined_game_am_host = value);
  $$unsubscribe_joined_game_user_id = (0, import_index_40eddd98.f)(joined_game_user_id, (value) => $joined_game_user_id = value);
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
  let { open = false } = $$props;
  function show() {
    open = true;
    checkServerAlive();
  }
  let { announcer = null } = $$props;
  let serverAlive;
  function checkServerAlive() {
    return __awaiter(this, void 0, void 0, function* () {
      serverAlive = yield checkAlive();
    });
  }
  let wasActive = false;
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.show === void 0 && $$bindings.show && show !== void 0)
    $$bindings.show(show);
  if ($$props.announcer === void 0 && $$bindings.announcer && announcer !== void 0)
    $$bindings.announcer(announcer);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      if ($joined_game_id != null && !window.location.href.endsWith("/moninpeli")) {
        console.log("Moving to multiplayer...");
        let data = {
          "game_id": $joined_game_id,
          "user_id": $joined_game_user_id,
          "am_host": $joined_game_am_host,
          "host_pswd": joined_game_host_pswds[$joined_game_id]
        };
        localStorage["mp_data"] = JSON.stringify(data);
        window.location.href = `/moninpeli`;
      }
    }
    {
      if ($poll_success && $poll_game) {
        if ($poll_game.active && !wasActive) {
          open = false;
          wasActive = true;
          if (announcer) {
            announcer.announce("Peli on alkanut!");
          }
        } else if (!$poll_game.active) {
          wasActive = false;
        }
      } else {
        wasActive = false;
      }
    }
    $$rendered = `${(0, import_index_40eddd98.v)(Popup, "Popup").$$render($$result, { open }, {
      open: ($$value) => {
        open = $$value;
        $$settled = false;
      }
    }, {
      content: () => {
        return `<div slot="${"content"}">${serverAlive ? `${$joined_game_id != null ? `${(0, import_index_40eddd98.v)(Lobby, "Lobby").$$render($$result, {}, {}, {})}` : `${`<div class="${"action-chooser svelte-1g3into"}"><button class="${"button action-btn"}">Luo Peli</button>
                        <button class="${"button action-btn"}">Liity Peliin Koodilla</button>
                        <button class="${"button action-btn"}">Selaa Julkisia Pelej\xE4</button></div>`}`}` : `${serverAlive == null ? `<h3>Otetaan yhteytt\xE4 palvelimeen...</h3>` : `<h3>Palvelimeen ei saatu yhteytt\xE4.</h3>
            <button>Yrit\xE4 uudelleen</button>`}`}</div>`;
      },
      title: () => {
        return `<span slot="${"title"}">Moninpeli</span>`;
      }
    })}`;
  } while (!$$settled);
  $$unsubscribe_poll_game();
  $$unsubscribe_poll_success();
  $$unsubscribe_joined_game_id();
  $$unsubscribe_joined_game_am_host();
  $$unsubscribe_joined_game_user_id();
  return $$rendered;
});
