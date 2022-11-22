import { sveltekit } from "@sveltejs/kit/vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// Expose git version to the app
import child_process from "child_process";
const commitHash = child_process.execSync("git rev-parse --short HEAD").toString().trim();
console.log("Latest commit:", commitHash);
const branch = child_process.execSync("git rev-parse --symbolic-full-name --abbrev-ref HEAD").toString().trim();
console.log("Branch:", branch);

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), wasm({}), topLevelAwait()],
	optimizeDeps: {
		exclude: ["twothousand-forty-eight"]
	},

	define: {
		__APP_VERSION__: JSON.stringify(commitHash),
		__APP_BRANCH__: JSON.stringify(branch)
	}
};

export default config;
