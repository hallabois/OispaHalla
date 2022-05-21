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
  B: () => Board_1
});
module.exports = __toCommonJS(stdin_exports);
var import_index_40eddd98 = require("./index-40eddd98.js");
var template_svelte_svelte_type_style_lang = "";
const css = {
  code: ".game-container.svelte-yuy89w{margin:0}",
  map: null
};
const Template = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div class="${"game-container svelte-yuy89w"}"><div class="${"kurin-palautus-viesti"}"></div>
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

    <div class="${"tile-container"}"></div>
</div>`;
});
const Board_1 = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  let { enableKIM = false } = $$props;
  let { enableLSM = false } = $$props;
  let { grid = null } = $$props;
  let board;
  if ($$props.enableKIM === void 0 && $$bindings.enableKIM && enableKIM !== void 0)
    $$bindings.enableKIM(enableKIM);
  if ($$props.enableLSM === void 0 && $$bindings.enableLSM && enableLSM !== void 0)
    $$bindings.enableLSM(enableLSM);
  if ($$props.grid === void 0 && $$bindings.grid && grid !== void 0)
    $$bindings.grid(grid);
  return `<main${(0, import_index_40eddd98.a)("this", board, 0)}>${(0, import_index_40eddd98.v)(Template, "Board").$$render($$result, {}, {}, {})}
</main>`;
});
