export function connectEditor() {
	const editor = document.querySelector<HTMLElement>(
		'.nicEdit-main[contenteditable="true"]',
	);
	const field =
		document.querySelector<HTMLTextAreaElement>("#EventDescription");
	if (!editor || !field)
		throw new Error("TwiPlaのイベント編集画面で実行してください。");
	const editable = editor;
	const textarea = field;
	let selection = document.createRange();
	selection.selectNodeContents(editable);
	selection.collapse(false);
	function remember() {
		const current = window.getSelection();
		if (!current?.rangeCount) return;
		const range = current.getRangeAt(0);
		if (editable.contains(range.commonAncestorContainer))
			selection = range.cloneRange();
	}
	document.addEventListener("selectionchange", remember);
	remember();
	function beginInsertion() {
		const position = selection.cloneRange();
		position.collapse(false);
		return (link: string, name: string) => {
			if (!editable.contains(position.commonAncestorContainer))
				throw new Error("本文をクリックして挿入位置を指定してください。");
			const width = Math.floor(editable.clientWidth);
			if (width <= 0) throw new Error("本文の幅を取得できませんでした。");
			const image = document.createElement("img");
			image.src = link;
			image.alt = name;
			image.width = width;
			image.style.height = "auto";

			position.insertNode(image);
			position.setStartAfter(image);
			position.collapse(true);
			selection = position.cloneRange();
			textarea.value = editable.innerHTML;
			editable.dispatchEvent(new Event("input", { bubbles: true }));
		};
	}
	return {
		beginInsertion,
		insert(link: string, name: string) {
			beginInsertion()(link, name);
		},
		onDrop(receive: (files: File[]) => void) {
			const drag = (event: DragEvent) => {
				if (event.dataTransfer?.types.includes("Files")) {
					event.preventDefault();
					event.stopPropagation();
				}
			};
			const drop = (event: DragEvent) => {
				const files = Array.from(event.dataTransfer?.files ?? []);
				if (!files.length) return;
				event.preventDefault();
				event.stopPropagation();
				const position = document.caretRangeFromPoint(
					event.clientX,
					event.clientY,
				);
				if (!position || !editable.contains(position.commonAncestorContainer))
					return;
				selection = position.cloneRange();
				receive(files);
			};
			editable.addEventListener("dragover", drag, true);
			editable.addEventListener("drop", drop, true);
			return () => {
				editable.removeEventListener("dragover", drag, true);
				editable.removeEventListener("drop", drop, true);
			};
		},
		destroy() {
			document.removeEventListener("selectionchange", remember);
		},
	};
}
