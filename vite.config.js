import { sveltekit } from '@sveltejs/kit/vite';
import viteImagemin from 'vite-plugin-imagemin';

/** @type {import('vite').UserConfig} */
const config = {
        plugins: [
                sveltekit(),
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
};

export default config;