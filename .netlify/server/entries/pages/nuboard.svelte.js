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
  default: () => Nuboard
});
module.exports = __toCommonJS(stdin_exports);
var import_index_40eddd98 = require("../../chunks/index-40eddd98.js");
var import_board_df4c0f27 = require("../../chunks/board-df4c0f27.js");
const Nuboard = (0, import_index_40eddd98.c)(($$result, $$props, $$bindings, slots) => {
  return `<main class="${"theme-0"}">${(0, import_index_40eddd98.v)(import_board_df4c0f27.B, "Board").$$render($$result, { enableKIM: true }, {}, {})}
</main>`;
});
