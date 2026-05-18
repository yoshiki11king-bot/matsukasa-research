import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";

const launchCommands = `cd /Users/hiroseyoshiki/next-contentful-blog
npm install
ENABLE_LOCAL_PRESS=true npm run dev`;

const directLinks = [
  ["Local Press ホーム", "/local-press", "まずここを開く"],
  ["新しく書く", "/local-press/new", "投稿種類を選ぶ"],
  ["記事を書く", "/local-press/write?type=articles", "通常記事"],
  ["報告書を書く", "/local-press/write?type=reports", "研究報告"],
  ["方法論を書く", "/local-press/write?type=methodologies", "方法論"],
  ["ショートを書く", "/local-press/write?type=short-readings", "短い読み物"],
  ["図表を作る", "/local-press/tools/chart-builder", "Chart Builder"],
];

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
  ["画像", "public/local-press/uploads/{file}"],
];

const publishChecks = [
  "タイトル、slug、概要が意図どおり",
  "statusをpublishedにする前にプレビューで確認済み",
  "本文内の図表slugと content/charts のslugが一致",
  "画像パスが /local-press/uploads/... で始まっている",
  "出典、脚注、方法論メモが必要な場所に入っている",
  "GitHub Desktopまたはgitで差分を見た",
  "push後にVercelデプロイが成功した",
  "本番URLで表示を確認した",
];

const emergencyRows = [
  {
    title: "Another next dev server is already running と出る",
    body: "すでにlocalhost:3000が動いています。ブラウザで開けるならそのまま使えます。止まっている場合だけ、表示されたPIDをkillして起動し直します。",
    command: `kill 40260
ENABLE_LOCAL_PRESS=true npm run dev`,
  },
  {
    title: "Local Pressが404になる",
    body: "ENABLE_LOCAL_PRESS=true を付けずに起動しています。いったんサーバを止めて、環境変数付きで起動し直してください。",
    command: `ENABLE_LOCAL_PRESS=true npm run dev`,
  },
  {
    title: "保存ボタンで403になる",
    body: "保存APIもENABLE_LOCAL_PRESS=trueが必要です。起動コマンドを確認してください。本番環境では基本的に保存できません。",
    command: `ENABLE_LOCAL_PRESS=true npm run dev`,
  },
  {
    title: "3000番ポートが使えない",
    body: "すでに開発サーバが動いていることが多いです。まず http://localhost:3000/local-press を開いてください。開けなければPIDを止めます。",
    command: `lsof -i :3000
kill {PID}`,
  },
  {
    title: "npm install や build が失敗する",
    body: "エラー全文を残してください。直す前に git status を見て、編集中の原稿や差分を消さないことが大事です。",
    command: `git status
npm install
ENABLE_LOCAL_PRESS=true npm run build`,
  },
];

const contentSteps = [
  "http://localhost:3000/local-press を開く",
  "新しく書く を押す",
  "記事、報告書、方法論、ショートなどの種類を選ぶ",
  "大きなタイトル欄にタイトルを書く",
  "本文エリアにそのまま書き始める",
  "+ または / で見出し、引用、画像、図表、注釈を入れる",
  "ブロック左のつまみをドラッグして順番や配置を変える",
  "必要な時だけ詳細設定を開き、slugやstatusを整える",
  "分割表示またはプレビューで公開予定の見た目を確認する",
  "ローカル保存 を押す",
];

const githubDesktopSteps = [
  "GitHub Desktopを開く",
  "Fetch origin / Pull を押して最新版にする",
  "Local Pressで原稿を保存する",
  "GitHub Desktopに出た差分を読む",
  "Summaryに Add content: {slug} と書く",
  "Commit to main を押す",
  "Push origin を押す",
  "VercelのDeploymentsで成功を確認する",
  "本番URLを開いて表示を見る",
];

const localPreviewRows = [
  ["記事", "/local/articles/{slug}"],
  ["報告書", "/local/reports/{slug}"],
  ["方法論", "/local/methodology/{slug}"],
  ["研究員", "/local/researchers/{slug}"],
  ["所長ページ", "/local/director"],
  ["財務ページ", "/local/finance"],
  ["決算資料", "/local/financial-statements/{year}"],
  ["ショート", "/local/shorts/{slug}"],
];

const chartTips = [
  "Chart Builderを開く",
  "種類、タイトル、slugを決める",
  "CSV貼り付け、または表で数値を入れる",
  "色は候補パレットから選ぶ",
  "プレビューで確認する",
  "保存する",
  "表示された :::chart slug=\"...\" ::: を本文に貼る",
];

function SectionCard({
  title,
  children,
  tone = "white",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "white" | "muted" | "dark";
}) {
  const className =
    tone === "dark"
      ? "rounded-lg border border-[color:var(--color-primary)] bg-[color:var(--color-primary)] px-5 py-5 text-white"
      : tone === "muted"
        ? "rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-5"
        : "rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5";

  return (
    <section className={className}>
      <h3 className={tone === "dark" ? "text-lg font-semibold text-white" : "text-lg font-semibold text-[color:var(--color-primary)]"}>
        {title}
      </h3>
      <div className={tone === "dark" ? "mt-4 text-sm leading-7 text-white/85" : "mt-4 text-sm leading-7 text-[color:var(--color-secondary-ink)]"}>
        {children}
      </div>
    </section>
  );
}

function CommandBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-md bg-[color:var(--color-primary)] px-4 py-3 text-sm leading-7 text-white">
      {children}
    </pre>
  );
}

export default async function AdminPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Matsukasa Editorial Portal"
      description="Local Press Maker の開き方、書き方、公開方法、詰まった時の戻り方をまとめた編集者用ガイドです。"
    >
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5 rounded-lg border border-[color:var(--color-border)] bg-white px-6 py-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">LOCAL PRESS MAKER</p>
          <h2 className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
            ここを読めば、ローカルで書いて本番へ出せます。
          </h2>
          <p className="text-base leading-8 text-[color:var(--color-secondary-ink)]">
            松笠研究所の記事、報告書、方法論、図表は、microCMSではなくLocal Pressで作ります。
            ローカルに保存し、GitHubへpushするとVercelが本番サイトへ反映します。
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

        <SectionCard title="まず起動する" tone="muted">
          <p>ターミナルでこの3行を順番に実行します。</p>
          <CommandBlock>{launchCommands}</CommandBlock>
          <p className="mt-3">
            「Ready」と出たら、ブラウザで <code>http://localhost:3000/local-press</code> を開きます。
          </p>
        </SectionCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <SectionCard title="よく使う入口">
          <div className="grid gap-2">
            {directLinks.map(([label, href, note]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-md border border-[color:var(--color-border)] px-3 py-2 text-[color:var(--color-primary)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-[color:var(--color-muted)]">{note}</span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="投稿の作り方">
          <ol className="grid gap-2 md:grid-cols-2">
            {contentSteps.map((step, index) => (
              <li key={step} className="rounded-md border border-[color:var(--color-border)] px-3 py-3">
                <span className="mr-2 font-semibold text-[color:var(--color-accent)]">{String(index + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </SectionCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="書く時の基本操作">
          <div className="space-y-3">
            <p>
              本文はブロック単位です。大見出し、中見出し、小見出し、一般文、引用、注釈、画像、図表を選べます。
            </p>
            <p>
              <strong>+</strong> はブロック追加、<strong>/</strong> はコマンド、左のつまみは移動です。横にドラッグすると2カラム配置も作れます。
            </p>
            <p>
              下書きはブラウザ内に自動保存されます。正式にファイル化する時だけ「ローカル保存」を押します。
            </p>
          </div>
        </SectionCard>

        <SectionCard title="画像と図表">
          <div className="space-y-3">
            <p>
              画像は「写真を挿入」から選びます。保存先は <code>public/local-press/uploads/</code> です。
            </p>
            <p>
              図表はChart Builderで作り、本文には次の形で貼ります。
            </p>
            <CommandBlock>{`:::chart slug="chart-slug"
:::`}</CommandBlock>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard title="図表を作る流れ">
          <ol className="grid gap-2 md:grid-cols-2">
            {chartTips.map((step, index) => (
              <li key={step} className="rounded-md border border-[color:var(--color-border)] px-3 py-3">
                <span className="mr-2 font-semibold text-[color:var(--color-accent)]">{String(index + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard title="図表で迷ったら" tone="muted">
          <p>まずは棒グラフか折線グラフで作ります。</p>
          <p className="mt-2">色はコード入力ではなく、候補パレットから選びます。</p>
          <p className="mt-2">凡例、軸ラベル、タイトル、脚注、アブストラクトは必要なものだけ入れます。</p>
        </SectionCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="GitHub Desktopで本番反映">
          <ol className="space-y-2">
            {githubDesktopSteps.map((step, index) => (
              <li key={step}>
                <span className="mr-2 font-semibold text-[color:var(--color-accent)]">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard title="gitで本番反映">
          <p>ターミナルで公開する場合は、保存されたファイルだけをaddします。</p>
          <CommandBlock>{`git status
git add content/articles/your-slug.md
git commit -m "Add content: your-slug"
git push origin main`}</CommandBlock>
          <p className="mt-3">
            図表や画像も一緒に出す場合は、対応する <code>content/charts/...</code> や <code>public/local-press/uploads/...</code> もaddします。
          </p>
        </SectionCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard title="公開前チェック">
          <ul className="grid gap-2 md:grid-cols-2">
            {publishChecks.map((item) => (
              <li key={item} className="rounded-md border border-[color:var(--color-border)] px-3 py-2">
                □ {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="本番URLで見る">
          <p>
            Vercelのデプロイ成功後、<a href="https://matsukasa-research.org" className="ui-signal-link">matsukasa-research.org</a> を開きます。
          </p>
          <p className="mt-2">反映直後は数十秒から数分待つことがあります。</p>
          <p className="mt-2">404なら、slug、status、保存先、Vercelの成功状態を確認します。</p>
        </SectionCard>
      </section>

      <SectionCard title="開けない時・壊れた時の戻り方" tone="dark">
        <div className="grid gap-4 lg:grid-cols-2">
          {emergencyRows.map((item) => (
            <div key={item.title} className="rounded-md border border-white/15 bg-white/5 px-4 py-4">
              <h4 className="font-semibold text-white">{item.title}</h4>
              <p className="mt-2 text-white/80">{item.body}</p>
              <pre className="mt-3 overflow-x-auto rounded-md bg-black/35 px-3 py-3 text-xs leading-6 text-white">{item.command}</pre>
            </div>
          ))}
        </div>
      </SectionCard>

      <section className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="ローカル確認URL">
          <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)]">
            {localPreviewRows.map(([label, route]) => (
              <div key={route} className="grid gap-3 border-b border-[color:var(--color-border)] px-4 py-3 last:border-b-0 md:grid-cols-[120px_minmax(0,1fr)]">
                <p className="font-semibold text-[color:var(--color-primary)]">{label}</p>
                <code>{route}</code>
              </div>
            ))}
          </div>
          <p className="mt-3">draftは表示されません。確認したい時はstatusをpublishedにします。</p>
        </SectionCard>

        <SectionCard title="保存先一覧">
          <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)]">
            {storageRows.map(([label, destination]) => (
              <div key={label} className="grid gap-3 border-b border-[color:var(--color-border)] px-4 py-3 last:border-b-0 md:grid-cols-[150px_minmax(0,1fr)]">
                <p className="font-semibold text-[color:var(--color-primary)]">{label}</p>
                <code>{destination}</code>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="管理者サイトでやらないこと">
          <p>microCMSへの投稿、編集、削除はここから行いません。</p>
          <p className="mt-2">APIキー、GitHub Token、秘密情報はこの画面に表示しません。</p>
        </SectionCard>

        <SectionCard title="困った時に残す情報">
          <p>見ているURL、押したボタン、エラー全文、git status、スクリーンショットを残します。</p>
          <p className="mt-2">原因不明の時は、むやみに削除せず、そのまま相談します。</p>
        </SectionCard>

        <SectionCard title="最短の合言葉">
          <p>開く: <code>/local-press</code></p>
          <p>書く: <code>/local-press/new</code></p>
          <p>図表: <code>/local-press/tools/chart-builder</code></p>
          <p>公開: GitHub DesktopでCommitしてPush</p>
        </SectionCard>
      </section>
    </AdminShell>
  );
}
