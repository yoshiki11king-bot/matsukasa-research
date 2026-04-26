# microCMS セットアップ手順

## 1. サービスを作る

1. [microCMS](https://app.microcms.io/) にログイン
2. 右上の `+ 追加`
3. `サービス`
4. サービス名を入力して作成

公式ドキュメント:

- [サービスの作成](https://document.microcms.io/manual/create-service)

## 2. API を 4 つ作る

すべて `リスト形式` で作成します。

1. `Posts`
   - Endpoint: `posts`
2. `Researchers`
   - Endpoint: `researchers`
3. `Methodologies`
   - Endpoint: `methodologies`
4. `Reports`
   - Endpoint: `reports`

## 3. フィールドを追加する

モデル定義はここにまとめています。

- [microCMS モデル案](/Users/hiroseyoshiki/next-contentful-blog/docs/microcms-model.md)

## 4. API キーを作る

1. `API設定`
2. `APIキー`
3. 新しいキーを作成

必要な権限:

- コンテンツの取得
- コンテンツの作成
- コンテンツの更新
- コンテンツの削除
- マネジメントAPIのコンテンツ取得
- マネジメントAPIのステータス更新
- マネジメントAPIのメディアアップロード

## 5. .env.local に入れる

開くファイル:

- [`.env.local`](/Users/hiroseyoshiki/next-contentful-blog/.env.local)

埋める項目:

```bash
MICROCMS_SERVICE_DOMAIN=your-service-id
MICROCMS_API_KEY=your-api-key
MICROCMS_ENDPOINT=posts
MICROCMS_POSTS_ENDPOINT=posts
MICROCMS_RESEARCHERS_ENDPOINT=researchers
MICROCMS_METHODOLOGIES_ENDPOINT=methodologies
MICROCMS_REPORTS_ENDPOINT=reports
```

## 6. 管理画面で運用する

管理画面のログイン先:

- `http://127.0.0.1:3000/admin`

ここから次をまとめて管理できます。

- 記事
- 研究員
- 方法論
- 報告書

報告書では PDF と図表画像を添付できます。公開後は一覧と詳細に反映されます。

## 7. Vercel 連携

microCMS には Vercel 向けの Webhook テンプレートがあります。

公式ドキュメント:

- [コンテンツのWebhookを設定](https://document.microcms.io/manual/webhook-setting)

Vercel にデプロイしたら、microCMS 側の Webhook で再デプロイをつなぐと更新がきれいです。
