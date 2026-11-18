# TwiPla外部画像アップロード

開発にはpnpmとVite+を使用します。

```sh
pnpm install
vp dev
```

`pnpm check`で型検査し、`vp build`で`dist`に公開用ファイルを生成します。`pnpm deploy`で公開します。

HEIC・HEIFはImgBBへ直接送信します。HEICのAPIアップロードを確認し、AVIFの画像URLが返ることを確認しています。
