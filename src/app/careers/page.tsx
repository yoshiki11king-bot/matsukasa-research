import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { getSidebarSnapshot } from "@/lib/microcms";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "採用",
  description:
    "松笠研究所の採用ページです。調査研究、集計、編集を支える役割の募集と応募方法をまとめています。",
  path: "/careers",
  keywords: ["採用", "募集", "研究助手", "リサーチアシスタント", "Googleフォーム"],
});

export default async function CareersPage() {
  const sidebar = await getSidebarSnapshot();
  const hasRecruitForm = Boolean(siteConfig.recruitFormUrl);
  const structuredData = [
    buildWebPageJsonLd({
      name: "採用",
      description: "松笠研究所の採用ページです。調査研究、集計、編集を支える役割の募集と応募方法をまとめています。",
      path: "/careers",
    }),
    buildBreadcrumbJsonLd([{ name: "採用", path: "/careers" }]),
  ];

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
    >
      <StructuredData data={structuredData} />
      <div className="space-y-10">
        <section className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">採用</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">一緒に調べる人を探しています</h1>
          <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">
            松笠研究所では、統計調査、資料整理、図表整備、編集を一緒に進める仲間を募集しています。応募は Google
            フォームで受け付ける形にしています。
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: "リサーチアシスタント",
              body: "文献整理、基礎集計、図表確認、調査補助を担当します。社会科学の読み書きに慣れている方を想定しています。",
            },
            {
              title: "編集・公開補助",
              body: "記事や報告書の見出し整理、公開前チェック、更新履歴の整備を担います。日本語の可読性を大切にできる方を歓迎します。",
            },
            {
              title: "データ整理補助",
              body: "回答データの確認、コードブック整理、単純集計の確認などを進めます。丁寧さと再現性を重視します。",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]"
            >
              <p className="text-lg font-semibold text-[color:var(--color-primary)]">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="見ていること"
                title="こんな姿勢の方と相性がいいです"
                description="派手な断定より、手元の根拠を丁寧に扱う仕事です。"
              />
              <div className="grid gap-3">
                {[
                  "数字を見たあとに、前提や限界も一緒に確認できる",
                  "読者が読みやすい形まで含めて整えるのが苦ではない",
                  "結論を急がず、途中の確認作業を丁寧に進められる",
                  "政治や社会を扱うときに、営利や党派性から距離を取りたい",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="space-y-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-6 py-7 shadow-[var(--shadow-card)]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">応募方法</p>
              <p className="text-sm leading-7 text-[color:var(--color-text)]">
                氏名、連絡先、関心領域、これまでの経験、簡単な志望理由を Google フォームで受け付けます。
              </p>
            </div>

            {hasRecruitForm ? (
              <a
                href={siteConfig.recruitFormUrl}
                target="_blank"
                rel="noreferrer"
                className="ui-button ui-button-primary h-11 w-full justify-center text-sm"
              >
                Googleフォームで応募する
              </a>
            ) : (
              <div className="space-y-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-4">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">応募フォーム準備中</p>
                <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                  GoogleフォームのURLを設定すると、この場所からそのまま応募できるようになります。
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              <p>応募後は内容確認のうえ、必要に応じてオンラインで面談をご案内します。</p>
            </div>
          </aside>
        </section>

        <section className="space-y-5">
          <SectionHeading eyebrow="流れ" title="応募から参加まで" />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["1. 応募", "Googleフォームから基本情報と関心領域を送っていただきます。"],
              ["2. 確認", "内容を確認し、必要に応じて追加質問や面談日程をご連絡します。"],
              ["3. 参加", "担当する領域と作業内容をすり合わせたうえで、参加の形を決めます。"],
            ].map(([title, body]) => (
              <article
                key={title}
                className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]"
              >
                <p className="text-base font-semibold text-[color:var(--color-primary)]">{title}</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="関連ページ"
              title="先に読んでおくと雰囲気が分かるページ"
            />
            <div className="flex flex-wrap gap-3">
              <Link href="/about" className="ui-button ui-button-secondary h-10 px-4 text-sm">
                私たちについて
              </Link>
              <Link href="/methodologies" className="ui-button ui-button-secondary h-10 px-4 text-sm">
                方法論
              </Link>
              <Link href="/researchers" className="ui-button ui-button-secondary h-10 px-4 text-sm">
                研究員
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
