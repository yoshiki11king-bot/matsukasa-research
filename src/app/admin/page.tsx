import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";

const storageRows = [
  ["記事", "content/articles/{slug}.md"],
  ["報告書", "content/reports/{slug}.md"],
  ["方法論", "content/methodologies/{slug}.md"],
  ["研究員", "content/researchers/{slug}.json"],
  ["所長ページ", "content/director/index.md"],
  ["財務ページ", "content/finance/index.md"],
  ["決算資料", "content/financial-statements/{year}.md"],
  ["ショートリーディング", "content/short-readings/{slug}.md"],
  ["図表", "content/charts/{slug}.json"],
];

const checklist = [
  "タイトルとslugが一致している",
  "statusをpublishedにする前にプレビューを確認した",
  "出典・基準・更新メモを必要に応じて入れた",
  "図表のslugが本文の :::chart slug=\"...\" と一致している",
  "GitHub Desktopで差分を確認した",
  "push後にVercelのデプロイが成功している",
];

const chartTypeRows = [
  "棒グラフ",
  "折線グラフ",
  "円グラフ",
  "帯グラフ",
  "横棒グラフ",
  "ドーナツグラフ",
  "100%積み上げ棒グラフ",
  "レーダーマップ",
  "ヒストグラム",
  "箱ひげ図",
  "バブルチャート",
  "散布図",
  "統計地図",
  "ローレンツ曲線",
  "絵グラフ",
  "積み上げ面グラフ",
];

export default async function AdminPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Matsukasa Editorial Portal"
      description="投稿・編集・削除はmicroCMSではなく、ローカル投稿環境 Matsukasa Local Press で行います。"
    >
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 rounded-lg border border-[color:var(--color-border)] bg-white px-6 py-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">LOCAL FIRST EDITING</p>
          <h2 className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
            ここは編集者ポータルです。実際の執筆は Local Press で行います。
          </h2>
          <p className="text-base leading-8 text-[color:var(--color-secondary-ink)]">
            旧管理画面のmicroCMS投稿・編集・削除導線は使いません。ローカルでMarkdown / JSONを保存し、GitHubへpushするとVercelが本番へ反映します。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/local-press" className="ui-button ui-button-primary h-11 px-5 text-sm">
              Local Pressを開く
            </Link>
            <Link href="/local-press/new" className="ui-button ui-button-secondary h-11 px-5 text-sm">
              新しく書く
            </Link>
            <Link href="/local-press/tools/chart-builder" className="ui-button ui-button-secondary h-11 px-5 text-sm">
              図表を作る
            </Link>
          </div>
        </div>

        <aside className="space-y-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">起動方法</h3>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--color-primary)] px-4 py-3 text-sm leading-7 text-white">{`npm install
ENABLE_LOCAL_PRESS=true npm run dev`}</pre>
          <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            起動後に http://localhost:3000/local-press を開きます。本番では ENABLE_LOCAL_PRESS=true でない限り表示されません。
          </p>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">GitHub Desktopで公開する</h3>
          <div className="mt-4 space-y-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            <p>1. GitHub Desktopを開く</p>
            <p>2. Fetch / Pull を行う</p>
            <p>3. Local Pressでローカル保存する</p>
            <p>4. 変更内容を確認する</p>
            <p>5. Summaryに「Add content: slug」と入力する</p>
            <p>6. Commit to main を押す</p>
            <p>7. Push origin を押す</p>
            <p>8. Vercelの自動デプロイを確認する</p>
          </div>
        </div>

        <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">gitで公開する</h3>
          <pre className="mt-4 overflow-x-auto rounded-md bg-[color:var(--color-primary)] px-4 py-3 text-sm leading-7 text-white">{`git status
git add content/
git commit -m "Add content: slug"
git push`}</pre>
        </div>
      </section>

      <section className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5">
        <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">保存先一覧</h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-[color:var(--color-border)]">
          {storageRows.map(([label, destination]) => (
            <div key={label} className="grid gap-3 border-b border-[color:var(--color-border)] px-4 py-3 text-sm last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)]">
              <p className="font-semibold text-[color:var(--color-primary)]">{label}</p>
              <code className="text-[color:var(--color-secondary-ink)]">{destination}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">Chart Builder</h3>
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            図表は content/charts にJSONで保存し、本文へ :::chart slug=&quot;...&quot; ::: と書いて挿入します。プレビューと公開確認ページは同じ ChartRenderer を使います。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {chartTypeRows.map((item) => (
              <span key={item} className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-3 py-1 text-xs font-medium text-[color:var(--color-secondary-ink)]">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">図表に入れられる情報</h3>
          <div className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            <p>グラフタイトル、凡例、軸ラベル、目盛り線、データラベルを設定できます。</p>
            <p>脚注、アブストラクト、出典、方法論メモも同じJSONに残せます。</p>
            <p>CSVの列名を使って、色分けキーと名称キーを指定できます。</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">運用ルール</h3>
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            記事・報告書・方法論はまずdraftで保存します。公開確認ページで見たい場合はstatusをpublishedにして保存し、/local/* で確認します。
          </p>
        </div>
        <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">公開前チェック</h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            {checklist.map((item) => (
              <li key={item}>□ {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">トラブルシューティング</h3>
          <div className="mt-3 space-y-3 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            <p>Local Pressが404: ENABLE_LOCAL_PRESS=true で起動してください。</p>
            <p>保存が403: save APIでも同じ環境変数が必要です。</p>
            <p>公開確認が404: statusがpublishedか、slugと保存先を確認してください。</p>
            <p>図表が出ない: content/chartsのslugと本文のslugを合わせてください。</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5">
        <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">確認導線</h3>
        <p className="mt-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
          判断に迷ったら、Local Pressのライブプレビュー、/local/* 確認ページ、GitHub Desktopの差分の順で確認してください。管理者パスワードやAPIキーはこの画面には表示しません。
        </p>
      </section>
    </AdminShell>
  );
}
