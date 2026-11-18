export interface UploadedImage {
	name: string;
	link: string;
	deleteUrl: string;
}

function record(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export async function upload(
	file: File,
	apiKey: string,
): Promise<UploadedImage> {
	const heic =
		/^image\/hei[cf](-sequence)?$/.test(file.type) || /\.hei[cf]$/i.test(file.name);
	if (!heic && !/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
		throw new Error("JPEG・PNG・GIF・WebP・HEIC・HEIFを選んでください。");
	}
	if (file.size > 32 * 1024 * 1024)
		throw new Error("画像は32MB以内にしてください。");
	const body = new FormData();
	body.append("key", apiKey);
	body.append("image", file, file.name);
	const response = await fetch("https://api.imgbb.com/1/upload", {
		method: "POST",
		credentials: "omit",
		body,
	});
	const result: unknown = await response.json();
	if (!record(result) || !record(result.data))
		throw new Error(
			`ImgBBの応答を確認できませんでした（${response.status}）。`,
		);
	if (!response.ok || result.success !== true) {
		throw new Error(
			typeof result.data.error === "string"
				? result.data.error
				: `ImgBB: HTTP ${response.status}`,
		);
	}
	const { url: link, delete_url: deleteUrl } = result.data;
	if (typeof link !== "string" || typeof deleteUrl !== "string")
		throw new Error("ImgBBの画像URLを取得できませんでした。");
	const url = new URL(link);
	if (url.protocol !== "https:" || url.hostname !== "i.ibb.co")
		throw new Error("ImgBB以外の画像URLが返されました。");
	return { name: file.name, link: url.href, deleteUrl };
}
