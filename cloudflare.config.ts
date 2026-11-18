import { defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "twipla-images",
		compatibilityDate: "2026-11-18",
		domains: ["twipla-images.akaaku.net"],
	},
});
