# microCMS モデル案

このサイトで想定している API は `posts` `researchers` `methodologies` `reports` の 4 本です。  
松笠研究所の公開サイトと管理画面がそのまま噛み合うようにしてあります。

## API 種別

- リスト形式
- Endpoint:
  - `posts`
  - `researchers`
  - `methodologies`
  - `reports`

## posts

1. `format`
   - 種別: セレクトフィールド
   - 必須
   - 値: `調査報告` / `短報` / `データノート`
2. `title`
   - 種別: テキストフィールド
   - 必須
3. `slug`
   - 種別: テキストフィールド
   - 必須
   - 一意制約推奨
4. `excerpt`
   - 種別: テキストエリア
   - 必須
5. `category`
   - 種別: テキストフィールド
   - 必須
   - 例: `政治・公共` `家族・ジェンダー` `地域社会`
6. `region`
   - 種別: テキストフィールド
   - 必須
   - 例: `全国` `地方都市` `三大都市圏`
7. `authorName`
   - 種別: テキストフィールド
   - 必須
8. `publishedDate`
   - 種別: 日時
   - 必須
9. `coverImage`
   - 種別: 画像
   - 任意
10. `keyFindings`
    - 種別: テキストエリア
    - 必須
    - 1行に1つずつ主要ポイントを書く
11. `methodologySummary`
    - 種別: テキストエリア
    - 必須
12. `topicsText`
    - 種別: テキストエリア
    - 任意
    - 1行に1トピック
13. `researcherSlugsText`
    - 種別: テキストエリア
    - 任意
14. `methodologySlugsText`
    - 種別: テキストエリア
    - 任意
15. `sourceBasis`
    - 種別: テキストエリア
    - 必須
16. `updatedNote`
    - 種別: テキストエリア
    - 必須
17. `sourceLinksText`
    - 種別: テキストエリア
    - 任意
    - `ラベル | URL` 形式
18. `body`
    - 種別: テキストエリア
    - 必須

## researchers

1. `name`
2. `slug`
3. `role`
4. `team`
5. `summary`
6. `bio`
7. `portraitImage`
8. `portraitImageUrl`
9. `focusTopicsText`
10. `methodologySlugsText`
11. `updatedDate`
12. `email`
13. `sourceBasis`

## methodologies

1. `title`
2. `slug`
3. `summary`
4. `updatedDate`
5. `reviewer`
6. `focusTopicsText`
7. `goodForText`
8. `limitsText`
9. `sourceBasis`
10. `body`

## reports

1. `title`
2. `slug`
3. `summary`
4. `publishedDate`
5. `updatedDate`
6. `reportType`
7. `region`
8. `topicNamesText`
9. `researcherSlugsText`
10. `methodologySlugsText`
11. `coverImage`
12. `coverImageUrl`
13. `pdfUrl`
14. `figuresText`
    - `図表名 | URL` 形式
15. `sourceLinksText`
    - `ラベル | URL` 形式
16. `sourceBasis`
17. `body`

## この構成にしている理由

- 記事、研究員、方法論、報告書を一元管理しやすい
- 日本語の長文をそのまま入力しやすい
- PDF や図表を報告書に付けやすい
- 公開ページで出典、更新日、基準を見せやすい
