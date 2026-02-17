import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from 'svelte-adapter-bun'

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '@/*': './path/to/lib/*',
    },
  },
}
