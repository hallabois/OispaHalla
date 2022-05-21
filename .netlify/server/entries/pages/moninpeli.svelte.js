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
  default: () => Moninpeli
});
module.exports = __toCommonJS(stdin_exports);
var import_index_40eddd98 = require("../../chunks/index-40eddd98.js");
var import_marked = require("marked");
var import_tournaments_b5505513 = require("../../chunks/tournaments-b5505513.js");
var import_board_df4c0f27 = require("../../chunks/board-df4c0f27.js");
class KeyboardInputManager {
  constructor(documentRoot, enabled = true) {
    this.enabled = enabled;
    if (!enabled) {
      return;
    }
    this.documentRoot = documentRoot;
    this.events = {};
    this.eventTouchstart = "touchstart";
    this.eventTouchmove = "touchmove";
    this.eventTouchend = "touchend";
    this.map = {
      38: 0,
      39: 1,
      40: 2,
      37: 3,
      75: 0,
      76: 1,
      74: 2,
      72: 3,
      87: 0,
      68: 1,
      83: 2,
      65: 3
    };
    this.boundKeyDownHandler = this.keydownHandler.bind(this);
    this.addKeydownHandler = () => {
      document.addEventListener("keydown", this.boundKeyDownHandler);
    };
    this.removeKeydownHandler = () => {
      document.removeEventListener("keydown", this.boundKeyDownHandler);
    };
    this.listen();
  }
  on(event, callback) {
    if (!this.enabled) {
      return;
    }
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  emit(event, data) {
    if (!this.enabled) {
      return;
    }
    var callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(function(callback) {
        callback(data);
      });
    }
  }
  listen() {
    if (!this.enabled) {
      return;
    }
    var self = this;
    this.addKeydownHandler();
    this.bindButtonPress(".retry-button", this.restart);
    this.bindButtonPress(".keep-playing-button", this.keepPlaying);
    this.bindButtonPress(".kurin-palautus", this.paritaKuli);
    this.bindButtonPress(".event-button", this.toggleDarkMode);
    var touchStartClientX, touchStartClientY;
    var gameContainer = this.documentRoot.getElementsByClassName("game-container")[0];
    gameContainer.addEventListener(this.eventTouchstart, function(event) {
      if (event.touches.length > 1 || event.targetTouches.length > 1) {
        return;
      }
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
      event.preventDefault();
    });
    gameContainer.addEventListener(this.eventTouchmove, function(event) {
      event.preventDefault();
    });
    gameContainer.addEventListener(this.eventTouchend, function(event) {
      if (event.touches.length > 0 || event.targetTouches.length > 0) {
        return;
      }
      var touchEndClientX, touchEndClientY;
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
      var dx = touchEndClientX - touchStartClientX;
      var absDx = Math.abs(dx);
      var dy = touchEndClientY - touchStartClientY;
      var absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) > 10) {
        self.emit("move", absDx > absDy ? dx > 0 ? 1 : 3 : dy > 0 ? 2 : 0);
      }
    });
  }
  keydownHandler(event) {
    if (!this.enabled) {
      return;
    }
    var modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
    var mapped = this.map[event.which];
    if (!modifiers) {
      if (mapped !== void 0) {
        event.preventDefault();
        this.emit("move", mapped);
      }
    }
    if (!modifiers && event.which === 82) {
      this.restart.call(this, event);
    }
  }
  restart(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("restart", null);
  }
  restartplus(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("restartplus", null);
    event.stopPropagation();
  }
  keepPlaying(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("keepPlaying", null);
  }
  bindButtonPress(selector, fn) {
    if (!this.enabled) {
      return;
    }
    var button = this.documentRoot.querySelector(selector);
    if (button) {
      button.addEventListener("click", fn.bind(this));
      button.addEventListener(this.eventTouchend, fn.bind(this));
    }
  }
  bindContextPress(selector, fn) {
    if (!this.enabled) {
      return;
    }
    var button = this.documentRoot.querySelector(selector);
    if (button) {
      button.addEventListener("contextmenu", fn.bind(this));
    }
  }
  paritaKuli(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("paritaKuli", null);
    event.stopPropagation();
  }
  toggleEvent(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("toggleEvent", null);
    event.stopPropagation();
  }
  toggleDarkMode(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("toggleDarkMode", null);
    event.stopPropagation();
  }
}
var announcer_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "main.svelte-p9516l.svelte-p9516l{z-index:2;position:absolute;top:0;left:0;right:0;display:flex;flex-direction:column}main.svelte-p9516l p.svelte-p9516l{text-align:center;background-color:var(--color);color:var(--background);margin:0}",
  map: null
};
const Announcer = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let announcements = [];
  function announce(msg) {
    console.info("ANNOUNCER announcing", msg);
    announcements.push({ msg, "time": new Date() });
    announcements = announcements;
    setTimeout(() => {
      announcements.shift();
      announcements = announcements;
    }, 2e3);
  }
  if ($$props.announce === void 0 && $$bindings.announce && announce !== void 0)
    $$bindings.announce(announce);
  $$result.css.add(css$1);
  return `<main class="${"svelte-p9516l"}">${(0, import_index_40eddd98.b)(announcements, (announcement, index) => {
    return `<p class="${"svelte-p9516l"}">${(0, import_index_40eddd98.e)(announcement.msg)}</p>`;
  })}
</main>`;
});
var moninpeli_svelte_svelte_type_style_lang = "";
const css = {
  code: "main.svelte-1g6vu52{min-height:100vh;display:grid;place-items:center}.err.svelte-1g6vu52{background-color:red;color:black;text-align:center;position:absolute;top:0;left:0;right:0}.board-container.svelte-1g6vu52{display:grid;place-items:center}.mini-container.svelte-1g6vu52{--field-width:calc(500px / 4) !important;--grid-gap:calc(15px / 4);--tile-size:calc(calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) / var(--grid-size));display:flex;gap:.5em}.mini-grid.svelte-1g6vu52{width:var(--field-width);height:var(--field-width);overflow:hidden}.mini-container .tile-inner{animation:none !important;-moz-animation:none !important;-webkit-animation:none !important}.patches.svelte-1g6vu52{height:0;width:0}",
  map: null
};
const Moninpeli = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let $poll_game, $$unsubscribe_poll_game;
  let $poll_success, $$unsubscribe_poll_success;
  let $joined_game_data, $$unsubscribe_joined_game_data;
  let $poll_board_string, $$unsubscribe_poll_board_string;
  let $server_status, $$unsubscribe_server_status;
  let $poll_other_boards_string, $$unsubscribe_poll_other_boards_string;
  $$unsubscribe_poll_game = (0, import_index_40eddd98.f)(import_tournaments_b5505513.p, (value) => $poll_game = value);
  $$unsubscribe_poll_success = (0, import_index_40eddd98.f)(import_tournaments_b5505513.a, (value) => $poll_success = value);
  $$unsubscribe_joined_game_data = (0, import_index_40eddd98.f)(import_tournaments_b5505513.j, (value) => $joined_game_data = value);
  $$unsubscribe_poll_board_string = (0, import_index_40eddd98.f)(import_tournaments_b5505513.b, (value) => $poll_board_string = value);
  $$unsubscribe_server_status = (0, import_index_40eddd98.f)(import_tournaments_b5505513.s, (value) => $server_status = value);
  $$unsubscribe_poll_other_boards_string = (0, import_index_40eddd98.f)(import_tournaments_b5505513.c, (value) => $poll_other_boards_string = value);
  let enableKIM = false;
  let grid = null;
  function move(direction) {
    import_tournaments_b5505513.d.push(direction);
  }
  let inputManager;
  let inputRoot;
  let TtInstance;
  let AnnouncerInstance;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      if ($poll_board_string) {
        grid = (0, import_tournaments_b5505513.h)($poll_board_string);
        enableKIM = true;
      } else if ($joined_game_data) {
        grid = (0, import_tournaments_b5505513.h)($joined_game_data.starting_state);
        enableKIM = false;
      } else {
        enableKIM = false;
      }
    }
    {
      if ($poll_success && $poll_game.active) {
        inputManager = new KeyboardInputManager(inputRoot);
        inputManager.on("move", move);
      } else {
        inputManager = null;
      }
    }
    $$rendered = `




<main class="${"svelte-1g6vu52"}"${(0, import_index_40eddd98.a)("this", inputRoot, 0)}>${(0, import_index_40eddd98.v)(import_tournaments_b5505513.T, "Tournaments").$$render($$result, {
      announcer: AnnouncerInstance,
      this: TtInstance
    }, {
      this: ($$value) => {
        TtInstance = $$value;
        $$settled = false;
      }
    }, {})}
    ${(0, import_index_40eddd98.v)(Announcer, "Announcer").$$render($$result, { this: AnnouncerInstance }, {
      this: ($$value) => {
        AnnouncerInstance = $$value;
        $$settled = false;
      }
    }, {})}
    ${$poll_success == false ? `<p class="${"err svelte-1g6vu52"}">Virhe pelitietoja haettaessa!</p>` : ``}
    ${$server_status == false ? `<p class="${"err svelte-1g6vu52"}">Palvelimeen ei saada yhteytt\xE4. <button>Yrit\xE4 uudelleen</button></p>` : ``}
    <div class="${"board-container svelte-1g6vu52"}">${(0, import_index_40eddd98.v)(import_board_df4c0f27.B, "Board").$$render($$result, { enableKIM, grid }, {}, {})}
        <button class="${"button background-none color-button"}" title="${"Tournament Mode"}">\u2694
        </button>
        ${$poll_success ? `<div class="${"mini-container svelte-1g6vu52"}">${(0, import_index_40eddd98.b)($poll_other_boards_string, (board_string, index) => {
      return `<div class="${"mini-grid svelte-1g6vu52"}">${(0, import_index_40eddd98.v)(import_board_df4c0f27.B, "Board").$$render($$result, {
        grid: (0, import_tournaments_b5505513.h)(board_string)
      }, {}, {})}
                    </div>`;
    })}</div>` : ``}</div></main>



<div class="${"patches svelte-1g6vu52"}"><script src="${"js/application.js"}"><\/script>
    <div class="${"preload-container"}"></div></div>`;
  } while (!$$settled);
  $$unsubscribe_poll_game();
  $$unsubscribe_poll_success();
  $$unsubscribe_joined_game_data();
  $$unsubscribe_poll_board_string();
  $$unsubscribe_server_status();
  $$unsubscribe_poll_other_boards_string();
  return $$rendered;
});
