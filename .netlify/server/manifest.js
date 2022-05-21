var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  manifest: () => manifest
});
module.exports = __toCommonJS(stdin_exports);
const manifest = {
  appDir: "_app",
  assets: /* @__PURE__ */ new Set(["favicon.png", "img/OispaHallaTausta2_dark.webp", "img/favicon.ico", "img/mobiilitausta.webp", "img/parinkulautus.png", "img/raksahalla_192.png", "img/raksahalla_512.png", "img/svg/HAC.svg", "img/svg/HAC_small.svg", "img/svg/cloud.svg", "img/svg/edit.svg", "img/svg/help.svg", "img/svg/leaderboard.svg", "img/svg/loading.svg", "img/svg/no_pumpkin.svg", "img/svg/no_snow.svg", "img/svg/pumpkin.svg", "img/svg/refresh.svg", "img/svg/snow.svg", "img/theme-0/1024.png", "img/theme-0/128.png", "img/theme-0/16.png", "img/theme-0/16384.png", "img/theme-0/2.png", "img/theme-0/2048.png", "img/theme-0/256.png", "img/theme-0/32.png", "img/theme-0/32768.png", "img/theme-0/4.png", "img/theme-0/4096.png", "img/theme-0/512.png", "img/theme-0/64.png", "img/theme-0/8.png", "img/theme-0/8192.png", "img/theme-0/OispaHallaTausta.webp", "img/theme-0/OispaHallaTausta2.png", "img/theme-0/OispaHallaTausta_light.webp", "img/theme-0.zip", "img/theme-1/1024.png", "img/theme-1/128.png", "img/theme-1/16.png", "img/theme-1/16384.png", "img/theme-1/2.png", "img/theme-1/2048.png", "img/theme-1/256.png", "img/theme-1/32.png", "img/theme-1/32768.png", "img/theme-1/4.png", "img/theme-1/4096.png", "img/theme-1/512.png", "img/theme-1/64.png", "img/theme-1/8.png", "img/theme-1/8192.png", "img/theme-1/OispaHallaTausta.webp", "img/theme-13/1024.png", "img/theme-13/128.png", "img/theme-13/16.png", "img/theme-13/16384.png", "img/theme-13/2.png", "img/theme-13/2048.png", "img/theme-13/256.png", "img/theme-13/32.png", "img/theme-13/32768.png", "img/theme-13/4.png", "img/theme-13/4096.png", "img/theme-13/512.png", "img/theme-13/64.png", "img/theme-13/8.png", "img/theme-13/8192.png", "img/theme-13/OispaHallaTausta.webp", "img/theme-13/munkki.gif", "img/theme-14/1024.png", "img/theme-14/128.png", "img/theme-14/16.png", "img/theme-14/16384.png", "img/theme-14/2.png", "img/theme-14/2048.png", "img/theme-14/256.png", "img/theme-14/32.png", "img/theme-14/32768.png", "img/theme-14/4.png", "img/theme-14/4096.png", "img/theme-14/512.png", "img/theme-14/64.png", "img/theme-14/64_alternative.png", "img/theme-14/8.png", "img/theme-14/8192.png", "img/theme-14/8_alternative.png", "img/theme-14/OispaHallaTausta.webp", "img/theme-2/1024.png", "img/theme-2/128.png", "img/theme-2/16.png", "img/theme-2/2.png", "img/theme-2/2048.png", "img/theme-2/256.png", "img/theme-2/32.png", "img/theme-2/4.png", "img/theme-2/4096.png", "img/theme-2/512.png", "img/theme-2/64.png", "img/theme-2/8.png", "img/theme-2/8192.png", "img/theme-2/OispaHallaTausta.webp", "img/theme-3/1024.png", "img/theme-3/128.png", "img/theme-3/16.png", "img/theme-3/16384.png", "img/theme-3/2.png", "img/theme-3/2048.png", "img/theme-3/256.png", "img/theme-3/32.png", "img/theme-3/4.png", "img/theme-3/4096.png", "img/theme-3/512.png", "img/theme-3/64.png", "img/theme-3/8.png", "img/theme-3/8192.png", "img/theme-3/OispaHallaTausta.webp", "img/theme-9/1024.png", "img/theme-9/128.png", "img/theme-9/16.png", "img/theme-9/2.png", "img/theme-9/2048.png", "img/theme-9/256.png", "img/theme-9/32.png", "img/theme-9/4.png", "img/theme-9/512.png", "img/theme-9/64.png", "img/theme-9/8.png", "img/theme-9/OispaHallaTausta.webp", "img/tile_unknown.png", "js/HAC.js", "js/animframe_polyfill.js", "js/application.js", "js/bind_polyfill.js", "js/classlist_polyfill.js", "js/game_manager.js", "js/grid.js", "js/html_actuator.js", "js/keyboard_input_manager.js", "js/leaderboard.js", "js/local_storage_manager.js", "js/tile.js", "manifest.json", "pwa_promoter.js", "sw.js"]),
  mimeTypes: { ".png": "image/png", ".webp": "image/webp", ".ico": "image/vnd.microsoft.icon", ".svg": "image/svg+xml", ".zip": "application/zip", ".gif": "image/gif", ".js": "application/javascript", ".json": "application/json" },
  _: {
    entry: { "file": "start-c78ebf80.js", "js": ["start-c78ebf80.js", "chunks/index-593d27cc.js", "chunks/index-8e7ff2fe.js"], "css": [] },
    nodes: [
      () => Promise.resolve().then(() => __toESM(require("./nodes/0.js"))),
      () => Promise.resolve().then(() => __toESM(require("./nodes/1.js"))),
      () => Promise.resolve().then(() => __toESM(require("./nodes/3.js"))),
      () => Promise.resolve().then(() => __toESM(require("./nodes/2.js"))),
      () => Promise.resolve().then(() => __toESM(require("./nodes/4.js"))),
      () => Promise.resolve().then(() => __toESM(require("./nodes/5.js")))
    ],
    routes: [
      {
        type: "page",
        id: "",
        pattern: /^\/$/,
        names: [],
        types: [],
        path: "/",
        shadow: null,
        a: [0, 2],
        b: [1]
      },
      {
        type: "page",
        id: "debug",
        pattern: /^\/debug\/?$/,
        names: [],
        types: [],
        path: "/debug",
        shadow: null,
        a: [0, 3],
        b: [1]
      },
      {
        type: "page",
        id: "moninpeli",
        pattern: /^\/moninpeli\/?$/,
        names: [],
        types: [],
        path: "/moninpeli",
        shadow: null,
        a: [0, 4],
        b: [1]
      },
      {
        type: "page",
        id: "nuboard",
        pattern: /^\/nuboard\/?$/,
        names: [],
        types: [],
        path: "/nuboard",
        shadow: null,
        a: [0, 5],
        b: [1]
      }
    ],
    matchers: async () => {
      return {};
    }
  }
};
