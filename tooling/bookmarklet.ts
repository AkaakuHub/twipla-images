import { fileURLToPath } from "node:url";
import { build, type Plugin } from "vite-plus";

const moduleId = "\0virtual:bookmarklet";

export function bookmarklet(): Plugin {
	return {
		name: "bookmarklet",
		resolveId(id) {
			if (id === "virtual:bookmarklet") return moduleId;
		},
		async load(id) {
			if (id !== moduleId) return;
			const result = await build({
				configFile: false,
				logLevel: "silent",
				build: {
					write: false,
					minify: true,
					target: ["safari15", "chrome100", "firefox100"],
					lib: {
						entry: fileURLToPath(new URL("../src/main.ts", import.meta.url)),
						formats: ["iife"],
						name: "TwiPlaImages",
					},
				},
			});
			const output = Array.isArray(result) ? result[0] : result;
			if (!output || !("output" in output))
				throw new Error("ブックマークレットを生成できませんでした。");
			const chunk = output.output.find((item) => item.type === "chunk");
			if (!chunk) throw new Error("ブックマークレットが見つかりません。");
			for (const path of Object.keys(chunk.modules)) this.addWatchFile(path);
			return `export default ${JSON.stringify(chunk.code)};`;
		},
	};
}
