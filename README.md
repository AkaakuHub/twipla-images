# TwiPla外部画像アップロード

開発にはpnpmとVite+を使用します。

```sh
pnpm install
vp dev
```

`pnpm check`で型検査し、`vp build`で`dist`に公開用ファイルを生成します。`pnpm deploy`で公開します。

HEIC・HEIFはImgBBへ直接送信します。HEICのAPIアップロードを確認し、AVIFの画像URLが返ることを確認しています。

GitHub Actionsは`main`へのpushで型検査・ビルド・Cloudflareへの公開を実行します。手動実行にも対応します。

[リポジトリのActions secrets](https://github.com/AkaakuHub/twipla-images/settings/secrets/actions)に`CLOUDFLARE_API_TOKEN`と`CLOUDFLARE_ACCOUNT_ID`を登録してください。APIトークンには、対象アカウントのWorkersへのデプロイとCustom Domainの設定に必要な権限を付けます。
