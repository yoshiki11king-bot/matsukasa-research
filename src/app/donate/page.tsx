import type { Metadata } from "next";
import { DonationPanel } from "@/components/donation-panel";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import { formatDate } from "@/lib/formatters";
import {
  getMethodologies,
  getPostsPage,
  getReports,
  getResearchers,
  getTopics,
} from "@/lib/microcms";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "寄付",
  description:
    "松笠研究所の統計調査と無料公開を支えるための寄付ページです。支援の使い道と運営原則をまとめています。",
  path: "/donate",
  keywords: ["寄付", "支援", "統計調査", "独立系シンクタンク"],
});

export default async function DonatePage() {
  const [postsPage, reports, topics, researchers, methodologies] = await Promise.all([
    getPostsPage({ page: 1, limit: 1 }),
    getReports(),
    getTopics(),
    getResearchers(),
    getMethodologies(),
  ]);

  const lastUpdated = [
    ...reports.map((report) => report.updatedDate),
    ...researchers.map((researcher) => researcher.updatedDate),
    ...methodologies.map((entry) => entry.updatedDate),
    ...postsPage.contents.map((post) => post.updatedAt ?? post.publishedDate),
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  const structuredData = [
    buildWebPageJsonLd({
      name: "寄付",
      description: "松笠研究所の統計調査と無料公開を支えるための寄付ページです。",
      path: "/donate",
      dateModified: lastUpdated,
    }),
    buildBreadcrumbJsonLd([{ name: "寄付", path: "/donate" }]),
  ];

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <StructuredData data={structuredData} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] space-y-20 px-5 py-8 lg:px-8 lg:py-10">
        <section className="grid gap-8 border-b border-[color:var(--color-border)] pb-12 lg:grid-cols-[minmax(0,1.05fr)_380px] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--color-muted)]">寄付</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--color-primary)] sm:text-[3.5rem]">
                無料公開を続けるための支援
              </h1>
              <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">
                結論ありきではなく、統計調査の設計と集計の前提を公開しながら、誰もが参照できる知見を積み上げていくための支援です。調査設計、回収、報告書整備、図表制作に充てます。
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">公開の前提</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">
                  広告やタイアップの都合より、読み手に必要な情報を優先して公開します。
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">支援の反映先</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">
                  調査設計、回収、図表の整備、本文編集、更新の継続にそのまま充てます。
                </p>
              </div>
            </div>
          </div>

          <DonationPanel contactEmail={siteConfig.contactEmail} />
        </section>

        <section className="space-y-8">
          <SectionHeading
            eyebrow="使い道"
            title="支援はこの3つに使います"
            description="調査の質と公開の読みやすさを落とさず続けるために使います。"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "調査設計と回収",
                body: "問いの設計、回答回収、補正の確認までを独立して進めるための費用です。",
              },
              {
                title: "報告書と図表整備",
                body: "報告書の本文整理、図表制作、PDF整備、更新反映に使います。",
              },
              {
                title: "地域取材と編集",
                body: "現地の聞き取り、移動、録音整理、編集の時間を確保するために使います。",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-[var(--shadow-soft)]"
              >
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-[color:var(--color-primary)]">{item.title}</p>
                  <p className="text-sm leading-7 text-[color:var(--color-text)]">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="support-principles" className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
            <div className="space-y-4">
              <SectionHeading
                eyebrow="なぜ支援が必要か"
                title="広告に依存しない公開のため"
                description="読むべき内容より目立つ内容が優先される構造から距離を取り、独立した公開を保つためです。"
              />
              <p className="text-[1.02rem] leading-9 text-[color:var(--color-text)]">
                松笠研究所は、短い注目だけを狙う運営ではなく、調査の条件、更新の履歴、解釈の限界まで含めて公開する形を続けたいと考えています。支援は、その地味だけれど大事な作業時間を支えます。
              </p>
            </div>
          </article>

          <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-6 py-7 shadow-[var(--shadow-soft)]">
            <div className="space-y-5">
              <SectionHeading eyebrow="運営原則" title="独立 / 公開 / 方法の明示 / 更新日明記" />
              <div className="grid gap-3">
                {[
                  ["独立", "特定の広告都合に寄せずに編集します。"],
                  ["公開", "報告書と記事を日本語で読みやすく出します。"],
                  ["方法の明示", "どう調べたかを本文の手前で示します。"],
                  ["更新日明記", "直した日付と更新理由を残します。"],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-4">
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-text)]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="space-y-8">
          <SectionHeading eyebrow="実績" title="いま公開している内容" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "記事数", value: `${postsPage.totalCount}` },
              { label: "報告書数", value: `${reports.length}` },
              { label: "調査領域", value: `${topics.length}` },
              { label: "最終更新日", value: lastUpdated ? formatDate(lastUpdated) : "未設定" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]"
              >
                <p className="text-sm font-medium text-[color:var(--color-muted)]">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
