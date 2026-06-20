# Matsukasa Local Press 編集者セットアップ

松笠研究所の記事、報告書、方法論、図表は Local Press で作成します。
Local Press は共有CMSではなく、各編集者のPCで原稿ファイルを作り、GitHubへ送って公開する仕組みです。

## 編集者に必要なもの

- GitHub アカウント
- GitHub Desktop
- Node.js
- このリポジトリへの collaborator 権限

## 初回セットアップ

1. GitHub Desktop を開く
2. `matsukasa-research` を clone する
3. リポジトリのフォルダを開く
4. GitHub Desktop の `Repository` > `Open in Terminal` でターミナルを開く
5. ターミナルで次を実行する

```sh
npm install
ENABLE_LOCAL_PRESS=true npm run dev
```

6. ブラウザで `http://localhost:3000/local-press` を開く

Mac の場合は、`scripts/start-local-press.command` をダブルクリックして起動できます。

## 通常の投稿手順

1. GitHub Desktop で `Fetch origin` / `Pull` を押す
2. `scripts/start-local-press.command` を開く
3. `http://localhost:3000/local-press` を開く
4. `新しく書く` から種類を選ぶ
5. タイトルと本文を書く
6. 必要なら画像、図表、引用、注釈を入れる
7. 詳細設定で `slug` と `status` を確認する
8. 公開する場合は `status` を `published` にする
9. `ローカル保存` を押す
10. GitHub Desktop で差分を確認する
11. branch を作って commit する
12. `Push origin` を押す
13. Pull Request を作る
14. 管理者が確認して merge する
15. Vercel の本番反映を確認する

## 直接 main に push してよい場合

管理者が明示した軽微な修正だけです。
通常の新規記事、報告書、図表、画像追加は Pull Request 経由にしてください。

## 保存される場所

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
| 画像 | `public/local-press/uploads/{file}` |

## 公開前チェック

- タイトルが意図どおり
- `slug` が英小文字、数字、ハイフンだけ
- `status` が `published`
- 画像が表示されている
- 図表が表示されている
- 出典、脚注、方法論メモが必要な場所にある
- GitHub Desktop の差分を読んだ
- Pull Request の画面で余計なファイルが入っていない

## よくあるトラブル

### Local Press が 404 になる

`ENABLE_LOCAL_PRESS=true` を付けずに起動しています。

```sh
ENABLE_LOCAL_PRESS=true npm run dev
```

### 保存で 403 になる

保存APIも `ENABLE_LOCAL_PRESS=true` が必要です。
開発サーバを止めて、環境変数付きで起動し直してください。

### Another next dev server is already running と出る

すでにサーバが動いています。
まず `http://localhost:3000/local-press` を開いてください。
開けない場合だけ、表示された PID を止めます。

```sh
kill {PID}
ENABLE_LOCAL_PRESS=true npm run dev
```

### GitHub Desktop に差分が出ない

次を確認します。

- 正しいリポジトリを開いているか
- `ローカル保存` を押したか
- 保存先が `content/` または `public/local-press/uploads/` か
- `status` ではなくファイル自体が保存されているか

ターミナルでは次を実行します。

```sh
git status -sb
```

### Push で競合した

他の編集者が先に更新しています。
GitHub Desktop で `Fetch origin` / `Pull` を行い、競合を確認してください。
不安な場合はそのまま管理者に相談してください。

## 管理者が編集者を追加する手順

1. GitHub のリポジトリ設定を開く
2. Collaborators に編集者の GitHub アカウントを追加する
3. まずは Pull Request 運用にする
4. このファイルを渡す
5. 初回だけ一緒に Local Press 起動と保存を確認する
