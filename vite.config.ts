import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

// Expose git version to the app
import child_process from "child_process";
const commitHash = child_process.execSync("git rev-parse --short HEAD").toString().trim();
console.log("Latest commit:", commitHash);
const branch =
	process.env.HEAD ||
	child_process.execSync("git rev-parse --symbolic-full-name --abbrev-ref HEAD").toString().trim();
console.log("Branch:", branch);

const config: UserConfig = {
	logLevel: "info",
	plugins: [
		sveltekit(),
		wasm(),
		topLevelAwait(),
		SvelteKitPWA({
			srcDir: "./src",
			scope: "/",
			base: "/",
			strategies: "generateSW",
			/* devOptions: {
				enabled: true,
				type: "module",
				navigateFallback: "/"
			}, */
			workbox: {
				globPatterns: ["client/**/*.{js,css,ico,png,svg,webp,woff,woff2,html}"],
				maximumFileSizeToCacheInBytes: 13000000 // 13mb
			}
		})
	],
	optimizeDeps: {
		exclude: ["twothousand-forty-eight"]
	},

	define: {
		__APP_VERSION__: JSON.stringify(commitHash),
		__APP_BRANCH__: JSON.stringify(branch)
	}
};

export default config;
