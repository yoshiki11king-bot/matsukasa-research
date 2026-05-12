import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RudbeckiaIntro } from "@/components/rudbeckia-intro";
import { buildPageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Project: Rudbeckia",
  description:
    "Project: Rudbeckia は、若者発の社会調査と可視化を公共のために組み立てる松笠研究所の創設準備プロジェクトです。",
  path: "/projects/rudbeckia",
  keywords: ["Project Rudbeckia", "Rudbeckia", "社会調査", "統計", "可視化", "若者発", "松笠研究所"],
});

const routeCards = [
  ["01", "答える", "調査に協力", "#survey"],
  ["02", "広める", "知人に紹介", "#survey"],
  ["03", "つくる", "設計を手伝う", "#join"],
  ["04", "読む", "公開後に確認", "#roadmap"],
];

const surveyFacts = [
  ["対象", "小中学校教員"],
  ["形式", "匿名オンライン調査"],
  ["時間", "5〜8分"],
  ["状態", "設計中"],
];

const roadmap = [
  ["00", "準備"],
  ["01", "調査"],
  ["02", "公開"],
  ["03", "継続"],
  ["04", "研究所へ"],
];

const rudbeckiaPageUrl = `${getSiteUrl()}/projects/rudbeckia`;
const teacherSurveyShareHref = `mailto:?subject=${encodeURIComponent(
  "Project Rudbeckiaの教員調査",
)}&body=${encodeURIComponent(rudbeckiaPageUrl)}`;

export default function RudbeckiaProjectPage() {
  return (
    <div className="rudbeckia-page min-h-screen overflow-hidden bg-[#FFF8E7] text-[#171717]">
      <RudbeckiaIntro />
      <header className="rudbeckia-header">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 px-5 py-6 md:grid md:grid-cols-[1fr_auto_1fr] md:px-8">
          <Link href="/projects/rudbeckia" className="relative block w-[310px] max-w-[88vw] md:col-start-2 md:w-[430px]">
            <Image
              src="/projects/rudbeckia/title-logo.svg"
              alt="Project: Rudbeckia"
              width={1200}
              height={360}
              priority
              unoptimized
              sizes="(min-width: 768px) 430px, 88vw"
              className="h-auto w-full object-contain mix-blend-multiply"
            />
          </Link>
          <Link href="/" aria-label="松笠研究所へ戻る" className="rudbeckia-return md:justify-self-end">
            <span>松笠研究所へ</span>
          </Link>
        </div>
      </header>

      <main>
        <section id="project" className="rudbeckia-hero">
          <div className="rudbeckia-hero-copy">
            <h1>
              まだ数えられていない社会を、
              <span>見に行こう。</span>
            </h1>
            <p className="rudbeckia-lead">
              若い研究者、学生、読者が参加する社会調査プロジェクトです。
            </p>
            <div className="rudbeckia-actions">
              <Link
                href="mailto:hello@matsukasa-research.org?subject=Project%20Rudbeckia%20%E3%81%AB%E5%8D%94%E5%8A%9B%E3%81%97%E3%81%9F%E3%81%84"
                className="rudbeckia-button rudbeckia-button-primary"
              >
                仲間になる
              </Link>
            </div>
          </div>
        </section>

        <section className="rudbeckia-pathway" aria-label="Project Rudbeckia の進み方">
          <div className="rudbeckia-pathway-heading">
            <span>Start Route</span>
            <strong>できるところから参加する。</strong>
          </div>
          <div className="rudbeckia-pathway-track">
            {routeCards.map(([number, title, body, href]) => (
              <Link key={title} href={href} className="rudbeckia-route-card">
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{body}</small>
              </Link>
            ))}
          </div>
        </section>

        <section id="survey" className="rudbeckia-section rudbeckia-survey-section">
          <div className="rudbeckia-section-heading">
            <p>First Research</p>
            <h2>最初の調査を準備中。</h2>
          </div>
          <div className="rudbeckia-survey-layout">
            <div className="rudbeckia-survey-copy">
              <p>小中学校教員の実感から、見えにくい差を測ります。</p>
              <div className="rudbeckia-actions">
                <Link
                  href="mailto:hello@matsukasa-research.org?subject=Project%20Rudbeckia%20%E7%AC%AC1%E5%9B%9E%E8%AA%BF%E6%9F%BB%E3%81%AB%E5%8D%94%E5%8A%9B%E3%81%97%E3%81%9F%E3%81%84"
                  className="rudbeckia-button rudbeckia-button-yellow"
                >
                  調査に協力する
                </Link>
                <Link
                  href={teacherSurveyShareHref}
                  className="rudbeckia-button rudbeckia-button-secondary"
                >
                  紹介する
                </Link>
              </div>
            </div>
            <div className="rudbeckia-console">
              <div className="rudbeckia-console-top">
                <span>Research Console</span>
                <em>設計中</em>
              </div>
              <div className="rudbeckia-console-grid">
                {surveyFacts.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="rudbeckia-console-bars" aria-hidden="true">
                {[44, 72, 58, 84, 40, 68].map((height, index) => (
                  <span key={index} style={{ height }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="rudbeckia-section rudbeckia-roadmap-section">
          <div className="rudbeckia-section-heading">
            <p>Roadmap</p>
            <h2>小さく始めて、公開する。</h2>
          </div>
          <div className="rudbeckia-phase-map">
            {roadmap.map(([number, title]) => (
              <article key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
              </article>
            ))}
          </div>
        </section>

        <section id="join" className="rudbeckia-final-panel">
          <div>
            <p>Join</p>
            <h2>参加は、ひとこと相談から。</h2>
            <span>調査に答える。紹介する。設計を手伝う。できる形で入れます。</span>
          </div>
          <Link
            href="mailto:hello@matsukasa-research.org?subject=Project%20Rudbeckia%E3%81%AB%E5%8F%82%E5%8A%A0%E3%81%97%E3%81%9F%E3%81%84"
            className="rudbeckia-button rudbeckia-button-dark"
          >
            参加の相談をする
          </Link>
        </section>
      </main>
    </div>
  );
}
