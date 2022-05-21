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
  default: () => Debug
});
module.exports = __toCommonJS(stdin_exports);
var import_index_40eddd98 = require("../../chunks/index-40eddd98.js");
var debug_svelte_svelte_type_style_lang = "";
const css = {
  code: "html, body{margin:0;padding:0;font-family:monospace;color-scheme:dark}main.svelte-1ls4co8{height:100%;background:#1e1e1e;color:#ddd!important;display:flex;flex-direction:column}.orng.svelte-1ls4co8{color:orange}.tablec.svelte-1ls4co8{overflow-x:auto}table.svelte-1ls4co8{flex:1}.key.svelte-1ls4co8{color:#94d0f1}.value.svelte-1ls4co8{color:#ce9178}",
  map: null
};
const Debug = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<main class="${"svelte-1ls4co8"}"><p>T\xE4m\xE4 sivu on tarkoitettu sovelluksen teknisen virheenkorjausdatan l\xE4hett\xE4miselle sen kehitt\xE4jille. <br>N\xE4iden tietojen jakaminen muille voi vaarantaa oispahalla-suorituksesi. <br><span class="${"orng svelte-1ls4co8"}">\xC4l\xE4 jaa n\xE4it\xE4 tietoja ulkopuolisille.</span></p>
    ${`<div><button>Ymm\xE4rr\xE4n.</button></div>`}
</main>`;
});
