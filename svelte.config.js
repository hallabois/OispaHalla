import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';
import viteImagemin from 'vite-plugin-imagemin'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		prerender: {
			default: true,
			onError: "continue"
		},
		vite: {
			plugins: [
				viteImagemin({
				  verbose: true,
				  filter: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i,
				  gifsicle: {
					optimizationLevel: 7,
					interlaced: false,
				  },
				  optipng: {
					optimizationLevel: 7,
				  },
				  mozjpeg: {
					quality: 20,
				  },
				  pngquant: {
					quality: [0.8, 0.9],
					speed: 4,
				  },
				  svgo: {
					plugins: [
					  {
						name: 'removeViewBox',
					  },
					  {
						name: 'removeEmptyAttrs',
						active: false,
					  },
					],
				  },
				}),
			],  
		}
	}
};

export default config;
