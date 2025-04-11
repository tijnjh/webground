import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default {
  plugins: [tailwindcss(), svelte()],
};
