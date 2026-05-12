import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { getSidebarSnapshot } from "@/lib/microcms";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "憲章",
  description: "松笠研究所の基本原則をまとめる憲章ページです。PDF版は後日掲載します。",
  path: "/about/charter",
  keywords: ["憲章", "松笠研究所", "公開方針", "独立性", "シンクタンク"],
});

export default async function CharterPage() {
  const sidebar = await getSidebarSnapshot();

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
    >
      <div className="space-y-10">
        <section className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--color-muted)]">
            <Link href="/about" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              私たちについて
            </Link>
            <span>/</span>
            <span>憲章</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
            松笠研究所憲章
          </h1>
          <p className="max-w-3xl text-[1.02rem] leading-8 text-[color:var(--color-text)]">
            正式な憲章PDFを掲載するためのページです。本文の追加は、PDF公開時に合わせて行います。
          </p>
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="CHARTER"
              title="PDF掲載欄"
              description="後日、ここに憲章PDFへのリンクまたは埋め込みを配置します。"
            />
            <div className="rounded-lg border border-dashed border-[color:var(--color-border-stronger)] bg-[color:var(--color-surface-subtle)] px-5 py-8 text-[color:var(--color-text)]">
              <p className="text-base font-semibold text-[color:var(--color-primary)]">憲章PDFは準備中です</p>
              <p className="mt-3 max-w-2xl text-sm leading-7">
                掲載時にPDFファイル、更新日、必要に応じて補足情報を追加します。
              </p>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
