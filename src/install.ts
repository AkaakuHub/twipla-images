import BOOKMARKLET_CODE from "virtual:bookmarklet";

function element<T extends HTMLElement>(id: string, type: { new (): T }): T {
	const node = document.getElementById(id);
	if (!(node instanceof type)) throw new Error(id);
	return node;
}
const form = element("setup", HTMLFormElement);
const key = element("key", HTMLInputElement);
const keyError = element("key-error", HTMLElement);
const registration = element("registration", HTMLElement);
const bookmark = element("bookmark", HTMLAnchorElement);
const code = element("code", HTMLTextAreaElement);
const status = element("status", HTMLElement);
key.oninput = () => {
	keyError.hidden = true;
	keyError.textContent = "";
	key.removeAttribute("aria-invalid");
	registration.hidden = true;
	bookmark.removeAttribute("href");
	code.value = "";
	status.textContent = "";
};
form.onsubmit = (event) => {
	event.preventDefault();
	const apiKey = key.value.trim();
	const length = Array.from(apiKey).length;
	const error =
		length !== 32
			? `APIキーは32文字で入力してください（現在${length}文字）。`
			: !/^[a-fA-F0-9]{32}$/.test(apiKey)
				? "APIキーは半角の0〜9・a〜f・A〜Fで入力してください。"
				: "";
	if (error) {
		keyError.textContent = error;
		keyError.hidden = false;
		key.setAttribute("aria-invalid", "true");
		key.focus();
		return;
	}
	const script = `${BOOKMARKLET_CODE};try{TwiPlaImages.start(${JSON.stringify(apiKey)})}catch(e){alert(e instanceof Error?e.message:String(e))}`;
	code.value = `javascript:${encodeURIComponent(script)}`;
	bookmark.href = code.value;
	registration.hidden = false;
	registration.scrollIntoView({ behavior: "smooth", block: "start" });
};
bookmark.onclick = (event) => {
	event.preventDefault();
	status.textContent =
		"パソコンではリンクをブックマークバーへドラッグしてください。スマートフォンではコードをコピーして登録します。";
};
element("copy", HTMLButtonElement).onclick = async () => {
	try {
		await navigator.clipboard.writeText(code.value);
		status.textContent = "コピーしました。下の登録手順へ進んでください。";
	} catch {
		code.focus();
		code.select();
		code.setSelectionRange(0, code.value.length);
		status.textContent =
			"コードを長押しして、すべて選択してコピーしてください。";
	}
};
