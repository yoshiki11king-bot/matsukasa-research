# 松笠研究所サイト 手動作業引き継ぎレポート

作成日: 2026-06-27

この文書は、ここから先に操作者本人の手で行う作業のための引き継ぎです。  
Local Press、content-source、WordPress CMS 移行、公開サイトの現在地をまとめています。

## 1. 現在の結論

松笠研究所サイトは、次の構成へ進んでいます。

```txt
matsukasa-research.org
= Next.js 公開サイト

Local Press
= 現在の投稿・試作・バックアップ用CMS

content-source
= microCMS / Local Press / WordPress を切り替える抽象化層

microCMS
= 旧データと既存公開動作のフォールバック

cms.matsukasa-research.org
= 将来の WordPress CMS 予定地

matsukasa-platform-core
= WordPress 上で松笠研究所専用CMSを作る自作プラグイン
```

今すぐ人間がやるべきことは、コードを書くことではなく、WordPress CMS の実体、GitHub / Vercel / Local Press の運用、共同編集の確認です。

## 2. 直近で手動確認すること

### 2.1 GitHub / Vercel

1. GitHub の `main` が最新であることを確認する
2. Vercel の最新 deployment が成功していることを確認する
3. 本番サイトで主要ページを開く
   - `https://matsukasa-research.org/`
   - `https://matsukasa-research.org/articles`
   - `https://matsukasa-research.org/reports`
   - `https://matsukasa-research.org/methodologies`
   - `https://matsukasa-research.org/researchers`
   - `https://matsukasa-research.org/tools-datasets`
   - `https://matsukasa-research.org/projects/rudbeckia`
   - `https://matsukasa-research.org/sitemap.xml`
4. 404、白画面、表示崩れがないか確認する

### 2.2 Local Press

Local Press はローカル専用です。

```sh
cd /Users/hiroseyoshiki/next-contentful-blog
ENABLE_LOCAL_PRESS=true npm run dev
```

開くURL:

```txt
http://localhost:3000/local-press
```

投稿テストの流れ:

1. GitHub Desktop で `Fetch origin` / `Pull`
2. Local Press を開く
3. `新しく書く`
4. 種類を選ぶ
5. タイトルと本文を書く
6. `status` を `published` にする
7. `ローカル保存`
8. GitHub Desktop に差分が出るか確認
9. commit / push
10. Vercel の自動反映を確認

詳しい手順は `docs/LOCAL_PRESS_SETUP.md` にあります。

### 2.3 WordPress CMS

WordPress はまだ本番運用の投稿元ではありません。次の手動準備が必要です。

1. `cms.matsukasa-research.org` を用意する
2. WordPress をインストールする
3. `wordpress/plugins/matsukasa-platform-core/` を WordPress の plugin として配置する
4. WordPress 管理画面で `Matsukasa Platform Core` を有効化する
5. パーマリンクを更新する
6. REST API が開くか確認する

確認URL:

```txt
https://cms.matsukasa-research.org/wp-json/matsukasa/v1/health
https://cms.matsukasa-research.org/wp-json/matsukasa/v1/posts
https://cms.matsukasa-research.org/wp-json/matsukasa/v1/reports
https://cms.matsukasa-research.org/wp-json/matsukasa/v1/charts
https://cms.matsukasa-research.org/wp-json/matsukasa/v1/datasets
```

WordPress を接続するまでは、本番 Vercel の `CONTENT_SOURCE` は `microcms` のままにしてください。

## 3. 環境変数の現在地

`.env.example` には以下が入っています。

```env
CONTENT_SOURCE=microcms
WORDPRESS_API_BASE_URL=
ENABLE_LOCAL_PRESS=false
```

選択肢:

| 値 | 意味 | 現在の扱い |
| --- | --- | --- |
| `microcms` | 既存の既定値。microCMSとLocal Press fallbackを使う | 本番向け |
| `local` | Local Press の `content/` を主に読む | ローカル検証向け |
| `wordpress` | WordPress REST API を読む | CMS構築後に試験 |

注意:

- `CONTENT_SOURCE=wordpress` は、`WORDPRESS_API_BASE_URL` と WordPress 側の REST API が揃ってから使う
- `ENABLE_LOCAL_PRESS=true` はローカルだけで使う
- 本番で Local Press の保存画面を開放しない

## 4. 実装済みの主なもの

### 4.1 Local Press

実装済み:

- `/local-press`
- `/local-press/new`
- `/local-press/write`
- `/local-press/preview`
- `/local-press/tools/chart-builder`
- `/api/local-press/save`
- `/api/local-press/upload`
- localStorage 下書き保存
- ブロック型エディタの土台
- 画像アップロード
- Chart Builder
- GitHub Desktop 前提の運用案内

保存先:

| 種類 | 保存先 |
| --- | --- |
| 記事 | `content/articles/{slug}.md` |
| 報告書 | `content/reports/{slug}.md` |
| 方法論 | `content/methodologies/{slug}.md` |
| 研究員 | `content/researchers/{slug}.json` |
| 所長ページ | `content/director/index.md` |
| 財務ページ | `content/finance/index.md` |
| 決算資料 | `content/financial-statements/{year}.md` |
| ショート | `content/short-readings/{slug}.md` |
| 図表 | `content/charts/{slug}.json` |
| データセット | `content/datasets/{slug}.md` |

現在 repo 内にある Local Press 実データは、主にデモ記事3件です。

```txt
content/articles/local-press-demo-care-research.md
content/articles/local-press-demo-employment-note.md
content/articles/local-press-demo-media-contact.md
```

### 4.2 content-source

実装済み:

```txt
src/lib/content-source/
├─ types.ts
├─ index.ts
├─ normalize.ts
├─ microcms-adapter.ts
├─ local-press-adapter.ts
└─ wordpress-adapter.ts
```

`ContentSourceName` は次の3つです。

```txt
microcms
local
wordpress
```

`CONTENT_SOURCE` によって選択できる構造まで進んでいます。

### 4.3 Local Press adapter

現在の `local-press-adapter.ts` は、次の主要データを読めます。

- 記事
- 報告書
- 方法論
- 研究員
- トピック
- 所長ページ
- 財務ページ
- 決算資料
- 図表
- データセット
- ショートリーディング
- 訂正
- 編集方針
- funding

添付ロードマップでは `localMethodologyToEntry` と `localResearcherToProfile` の切り出しが次タスクになっていましたが、現行コードではすでに次の場所にあります。

```txt
src/lib/content/methodologies.ts
src/lib/content/researchers.ts
src/lib/content/topics.ts
```

つまり、ロードマップ上の Phase 1 と Phase 2 の大半はすでに進んでいます。

### 4.4 WordPress plugin

雛形はあります。

```txt
wordpress/plugins/matsukasa-platform-core/
```

実装済み:

- custom post type 登録
- taxonomy 登録
- meta field 登録
- REST API 雛形
- collection filter
- Media Library picker
- CSV / TSV / JSON / GeoJSON upload support
- `matsukasa_editor` role

まだ必要:

- 実 WordPress への設置
- 本番CMSとしての入力テスト
- `cms.matsukasa-research.org` 接続
- `CONTENT_SOURCE=wordpress` の本番前検証

### 4.5 公開ページ

content-source 経由に寄せたページが増えています。

重要な公開ページ:

- `/articles`
- `/posts/[slug]`
- `/reports`
- `/reports/[slug]`
- `/methodologies`
- `/methodologies/[slug]`
- `/researchers`
- `/researchers/[slug]`
- `/topics/[slug]`
- `/tools-datasets`
- `/charts/[slug]`
- `/datasets/[slug]`

最新の追加:

- `/charts/[slug]`
- `/datasets/[slug]`
- `/tools-datasets` の公開資料一覧
- sitemap への chart / dataset 追加

## 5. 手動作業者が触るべきもの

### 触ってよい

- GitHub Desktop
- Vercel deployment 確認
- Local Press の試し投稿
- WordPress 管理画面
- WordPress plugin のアップロード / 有効化
- `cms.matsukasa-research.org` のDNS / hosting 設定
- Vercel の環境変数確認

### 慎重に触る

- `CONTENT_SOURCE`
- `WORDPRESS_API_BASE_URL`
- `ADMIN_PASSWORD`
- `ENABLE_LOCAL_PRESS`

### まだ触らない方がよい

- microCMS の削除
- `src/lib/microcms.ts` の大規模削除
- 本番 `CONTENT_SOURCE=wordpress` への切替
- WordPress を唯一の投稿元にする運用

## 6. 次の手動ステップ

最初にやるならこれです。

1. 本番サイトの主要ページをざっと開く
2. Local Press でテスト記事を1件作る
3. GitHub Desktop に差分が出るか確認する
4. commit / push して Vercel 反映を見る
5. WordPress の設置場所を決める
6. `cms.matsukasa-research.org` の用意を始める
7. WordPress に `matsukasa-platform-core` を入れて health endpoint を確認する

## 7. 次の開発ステップ

手動準備が終わったら、次の開発はこの順番が安全です。

1. WordPress plugin を実 WordPress に設置して REST response を確認する
2. `WORDPRESS_API_BASE_URL` をローカル `.env.local` に設定する
3. `CONTENT_SOURCE=wordpress` で `npm run build` を試す
4. chart / dataset から WordPress 取得を試す
5. report / methodology / researcher を順に試す
6. Media Library の画像・PDF・CSV を Next.js 側に表示する
7. 問題なければ Vercel preview で `CONTENT_SOURCE=wordpress` を試す
8. 本番切替は最後に行う

## 8. ここまでの検証状況

直近の検証:

```sh
npm run lint
npm run build
```

どちらも成功しています。

直近の公開用 push:

```txt
09c1772 Add public chart and dataset pages
```

## 9. 重要な判断

いまの方針は、Local Pressを破棄することではありません。

```txt
Local Press
= 松笠研究所CMSの仕様試作・Git保存型バックアップ

WordPress
= 共同編集とメディア管理に強い本番CMS

Next.js
= 公開サイト

content-source
= どのCMSを使っても公開側を壊さないための接続層
```

この構造を守ると、WordPress移行中でもサイトを止めずに進められます。

