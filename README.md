# 松笠研究所

Next.js + microCMS + Vercel で構成した、日本語向けの研究所サイトです。

記事、研究員、方法論、調査報告書、寄付案内を公開側に持ち、`/admin` から一元管理できます。microCMS が未接続の間もデモデータで見た目と導線を確認できます。

## プロジェクトの場所

- `/Users/hiroseyoshiki/next-contentful-blog`

## できること

- note.com を参考にした記事一覧レイアウト
- 複数トピックの掛け合わせ検索
- 研究員ページ、方法論ページ、報告書ページ、About、寄付ページ
- 報告書への PDF 添付、図表画像添付
- 右サイドバーでの研究員 / 方法論 / 報告書導線
- 出典、更新日、基準を目立たせた詳細ページ
- microCMS 未接続時のデモ表示
- `/admin` からの管理者ログイン
- 記事、研究員、方法論、報告書の新規作成、編集、公開、下書き化、削除
- 画像アップロード、PDF アップロード
- sitemap / robots

## まずローカルで開く

```bash
export PATH=/Users/hiroseyoshiki/.local/node-v24.11.0-darwin-arm64/bin:$PATH
cd /Users/hiroseyoshiki/next-contentful-blog
pnpm dev
```

開く URL:

- 公開サイト: `http://127.0.0.1:3000`
- 管理画面: `http://127.0.0.1:3000/admin`

## 管理者ログイン

ログイン情報は `.env.local` に入っています。

- [`.env.local`](/Users/hiroseyoshiki/next-contentful-blog/.env.local)

必要なら `ADMIN_PASSWORD` を好きなものに変えてください。

## microCMS の設定

この 2 つを見れば、そのまま進められます。

- [microCMS セットアップ手順](/Users/hiroseyoshiki/next-contentful-blog/docs/microcms-setup.md)
- [microCMS API スキーマ案](/Users/hiroseyoshiki/next-contentful-blog/docs/microcms-model.md)

`.env.local` で埋めるのは主にここです。

```bash
MICROCMS_SERVICE_DOMAIN=
MICROCMS_API_KEY=
MICROCMS_ENDPOINT=posts
MICROCMS_POSTS_ENDPOINT=posts
MICROCMS_RESEARCHERS_ENDPOINT=researchers
MICROCMS_METHODOLOGIES_ENDPOINT=methodologies
MICROCMS_REPORTS_ENDPOINT=reports
```

## 必要な microCMS 側の権限

このアプリの管理画面をフルで使う場合、API キーには次の権限が必要です。

- コンテンツの取得
- コンテンツの作成
- コンテンツの更新
- コンテンツの削除
- マネジメントAPIのコンテンツ取得
- マネジメントAPIのステータス更新
- マネジメントAPIのメディアアップロード

## Vercel デプロイ

1. GitHub に push
2. Vercel で Import Project
3. Environment Variables に `.env.local` と同じ値を入れる
4. Deploy

本番 URL が決まったら `NEXT_PUBLIC_SITE_URL` を更新します。

## 主なファイル

- `src/lib/microcms.ts`: microCMS 連携
- `src/app/page.tsx`: 記事トップ
- `src/app/researchers/[slug]/page.tsx`: 研究員詳細
- `src/app/methodologies/[slug]/page.tsx`: 方法論詳細
- `src/app/reports/[slug]/page.tsx`: 報告書詳細
- `src/app/admin/page.tsx`: 管理ダッシュボード
- `src/components/admin-content-form.tsx`: 統合管理フォーム
- `src/components/public-shell.tsx`: 本文 + サイドバーの公開レイアウト

## 次に伸ばしやすいもの

- microCMS Webhook による再デプロイ自動化
- 予約投稿 UI
- OGP 画像の自動生成
- 複数管理者ロール
- 寄付フォームの外部決済連携
