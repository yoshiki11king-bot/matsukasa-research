import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import {
  getMethodologies,
  getPostsPage,
  getReports,
  getResearchers,
  getSidebarSnapshot,
} from "@/lib/microcms";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "私たちについて",
  description:
    "統計調査を主軸にした独立系シンクタンクとしての松笠研究所の目的、公開の約束、やらないことをまとめています。",
  path: "/about",
  keywords: ["私たちについて", "研究所概要", "公開方針", "統計調査", "シンクタンク"],
});

export default async function AboutPage() {
  const [sidebar, postsPage, reports, methodologies, researchers] = await Promise.all([
    getSidebarSnapshot(),
    getPostsPage({ page: 1, limit: 1 }),
    getReports(),
    getMethodologies(),
    getResearchers(),
  ]);

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
    >
      <div className="space-y-10">
        <section className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">私たちについて</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">松笠研究所について</h1>
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-5">
            <SectionHeading
              eyebrow="研究所の目的"
              title="統計調査を主軸に、方法と根拠を公開しながら知見を社会に届けます"
            />
            <div className="max-w-4xl space-y-4 text-[1.02rem] leading-9 text-[color:var(--color-text)]">
              {siteConfig.aboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["記事", `${postsPage.totalCount}本`, "日々の変化を読み始める入口です。"],
            ["報告書", `${reports.length}本`, "図表やPDFを含む、少し厚めの記録です。"],
            ["方法論", `${methodologies.length}件`, "どう調べたかを公開しています。"],
            ["研究員", `${researchers.length}人`, "誰がどの領域を見ているかが分かります。"],
          ].map(([title, count, body]) => (
            <article
              key={title}
              className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]"
            >
              <p className="text-sm font-medium text-[color:var(--color-muted)]">{title}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{count}</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="公開の約束"
              title="更新日、方法、前提をできるだけ先に示します"
              description="記事の見た目だけで判断を急がず、読者が前提をつかんでから読める形を続けます。"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["更新日を先に書きます", "いつの調査か、どこを直したかを見失わないようにします。"],
                ["方法を隠しません", "回収条件や聞き取りの前提を、結論の後ろに追いやりません。"],
                ["断定を急ぎません", "言い切れないところは、言い切れないまま残します。"],
              ].map(([title, body]) => (
                <article
                  key={title}
                  className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5"
                >
                  <p className="text-base font-semibold text-[color:var(--color-primary)]">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-soft)]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">作った理由</p>
              <p className="text-[1.02rem] leading-9 text-[color:var(--color-text)]">{siteConfig.aboutReason}</p>
            </div>
          </article>
          <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-soft)]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">名前に込めたこと</p>
              <p className="text-[1.02rem] leading-9 text-[color:var(--color-text)]">{siteConfig.aboutNameOrigin}</p>
            </div>
          </article>
          <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-soft)]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">やらないこと</p>
              <ul className="space-y-2 text-[1.02rem] leading-9 text-[color:var(--color-text)]">
                {siteConfig.aboutNotDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="関連ページ"
            title="運営の顔と公開方針"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <p className="text-base font-semibold text-[color:var(--color-primary)]">憲章</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">
                基本原則と公開方針をまとめるためのページです。PDF版は後日掲載します。
              </p>
              <div className="mt-4">
                <Link href="/about/charter" className="ui-button ui-button-secondary h-10 px-4 text-sm">
                  憲章ページへ
                </Link>
              </div>
            </article>

            <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <p className="text-base font-semibold text-[color:var(--color-primary)]">所長</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">
                何を基準に公開し、どこに責任を置くかをまとめています。
              </p>
              <div className="mt-4">
                <Link href="/director" className="ui-button ui-button-secondary h-10 px-4 text-sm">
                  所長ページへ
                </Link>
              </div>
            </article>

            <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <p className="text-base font-semibold text-[color:var(--color-primary)]">財務情報</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">
                何をどの粒度で公開するか、更新の基準は何かをまとめています。
              </p>
              <div className="mt-4">
                <Link href="/finance" className="ui-button ui-button-secondary h-10 px-4 text-sm">
                  財務情報へ
                </Link>
              </div>
            </article>
          </div>
        </section>

      </div>
    </PublicShell>
  );
}
