import { connectEditor } from "./editor";
import { type UploadedImage, upload } from "./imgbb";

export function start(apiKey: string) {
	if (
		location.hostname !== "twipla.jp" ||
		!/^\/(add|events\/edit\/\d+)\/?$/.test(location.pathname)
	) {
		alert("TwiPlaのイベント作成・編集画面で実行してください。");
		return;
	}
	if (document.getElementById("twipla-image-upload")) return;
	const editor = connectEditor();
	const host = document.createElement("div");
	host.id = "twipla-image-upload";
	host.style.cssText =
		"position:fixed;right:12px;bottom:12px;z-index:2147483647;width:min(420px,calc(100vw - 24px))";
	const root = host.attachShadow({ mode: "open" });
	root.innerHTML = `<style>
    *{box-sizing:border-box}section{font:14px/1.5 system-ui;color:#171717;background:#fff;border:2px solid #333;border-radius:12px;padding:16px;box-shadow:0 4px 24px #0004;max-height:75vh;overflow:auto}header{display:flex;justify-content:space-between;align-items:center}h2{font-size:18px;margin:0}label{display:block;margin-top:12px}input,textarea{width:100%;font:inherit;padding:8px;border:1px solid #777;border-radius:4px}button{font:inherit;cursor:pointer;padding:7px 10px;margin:6px 4px 0 0}button:disabled{cursor:wait;opacity:.5}#drop{border:2px dashed #777;padding:18px;margin:12px 0;text-align:center}#drop.over{background:#e8f4ff}article{border-top:1px solid #ccc;padding:10px 0;overflow-wrap:anywhere}a{color:#005eb8}p{margin:8px 0}#files{display:none}textarea{height:100px}
    </style><section aria-label="画像アップロード"><header><h2>画像アップロード</h2><button id="close" type="button">閉じる</button></header>
    <div id="drop">画像をドロップ<button id="choose" type="button">画像を選択</button></div><input id="files" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.heic,.heif" multiple>
    <p id="status" role="status" aria-live="polite"></p><div id="results"></div>
    <label>画像URL一覧<textarea id="urls" readonly></textarea></label><button id="copy" type="button">URL一覧をコピー</button><button id="download" type="button">管理データを保存</button></section>`;
	const query = <T extends Element>(selector: string) => {
		const element = root.querySelector<T>(selector);
		if (!element) throw new Error(selector);
		return element;
	};
	const files = query<HTMLInputElement>("#files");
	const choose = query<HTMLButtonElement>("#choose");
	const status = query<HTMLElement>("#status");
	const drop = query<HTMLElement>("#drop");
	const results = query<HTMLElement>("#results");
	const urls = query<HTMLTextAreaElement>("#urls");
	const images: UploadedImage[] = [];
	let busy = false;
	const message = (error: unknown) =>
		error instanceof Error ? error.message : String(error);
	query<HTMLButtonElement>("#close").onclick = () => {
		if (busy) {
			status.textContent = "アップロード完了後に閉じてください。";
			return;
		}
		removeDrop();
		editor.destroy();
		host.remove();
	};
	choose.onmousedown = (event) => event.preventDefault();
	choose.onclick = () => files.click();
	const removeDrop = editor.onDrop((batch) => {
		void process(batch);
	});
	function addImage(
		image: UploadedImage,
		row = document.createElement("article"),
	) {
		results.append(row);
		row.textContent = "";
		images.push(image);
		const link = document.createElement("a");
		link.href = image.link;
		link.textContent = image.name;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		const insert = document.createElement("button");
		insert.type = "button";
		insert.textContent = "カーソル位置へ挿入";
		insert.onmousedown = (event) => event.preventDefault();
		insert.onclick = () => {
			try {
				editor.insert(image.link, image.name);
				status.textContent = `${image.name}を挿入しました。イベントは未保存です。`;
			} catch (error) {
				status.textContent = message(error);
			}
		};
		row.append(link, document.createElement("br"), insert);
		urls.value = images
			.map((image) => `${image.name}\t${image.link}`)
			.join("\n");
	}

	async function process(batch: File[]) {
		if (busy || !batch.length) return;
		busy = true;
		choose.disabled = true;
		const insert = editor.beginInsertion();
		let completed = 0;
		for (const file of batch) {
			const row = document.createElement("article");
			results.append(row);
			row.textContent = `${file.name}：アップロード中`;
			try {
				const image = await upload(file, apiKey);
				addImage(image, row);
				insert(image.link, image.name);
				completed++;
			} catch (error) {
				row.textContent = `${file.name}：${message(error)}`;
			}
			status.textContent = `${batch.length}件中${completed}件アップロード完了`;
		}
		busy = false;
		choose.disabled = false;
		files.value = "";
	}

	files.onchange = () => {
		void process(Array.from(files.files ?? []));
	};
	drop.ondragover = (event) => {
		event.preventDefault();
		drop.classList.add("over");
	};
	drop.ondragleave = () => drop.classList.remove("over");
	drop.ondrop = (event) => {
		event.preventDefault();
		event.stopPropagation();
		drop.classList.remove("over");
		void process(Array.from(event.dataTransfer?.files ?? []));
	};
	query<HTMLButtonElement>("#copy").onclick = async () => {
		try {
			await navigator.clipboard.writeText(urls.value);
			status.textContent = "コピーしました。";
		} catch {
			urls.focus();
			urls.select();
			status.textContent = "選択された一覧をコピーしてください。";
		}
	};
	query<HTMLButtonElement>("#download").onclick = () => {
		const url = URL.createObjectURL(
			new Blob([JSON.stringify(images, null, 2)], { type: "application/json" }),
		);
		const a = document.createElement("a");
		a.href = url;
		a.download = "imgbb-images.json";
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	};
	document.body.append(host);
}
