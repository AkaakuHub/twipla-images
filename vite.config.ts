import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import { bookmarklet } from "./tooling/bookmarklet";

export default defineConfig({
	root: "web",
	resolve: {
		alias: { "/src": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	plugins: [bookmarklet()],
	server: { port: 8787 },
	build: { outDir: "../dist", emptyOutDir: true },
});
