export const siteConfig = {
  name: "松笠研究所",
  englishName: "Matsukasa Research Center",
  url: "https://matsukasa-research.org",
  description:
    "統計調査を主軸に、日本社会をより正確に理解するための知見を蓄積・公開する独立系シンクタンク。",
  mission:
    "統計調査を主軸に、日本社会をより正確に理解するための知見を蓄積し、公共的な判断の土台となる情報を公開していくことを目指しています。",
  heroLabel: "Matsukasa Research Center",
  headerLabel: "統計調査を主軸とする独立系シンクタンク",
  recruitFormUrl: process.env.NEXT_PUBLIC_RECRUIT_FORM_URL ?? "",
  locale: "ja_JP",
  keywords: [
    "松笠研究所",
    "Matsukasa Research Center",
    "独立系シンクタンク",
    "シンクタンク",
    "統計調査",
    "調査研究",
    "社会調査",
    "世論調査",
    "社会統計",
    "政治分析",
    "方法論",
    "調査報告書",
  ],
  aboutSummary:
    "統計調査を主軸に、結論ありきではなく方法と根拠を公開しながら、誰もが参照できる知見を積み上げていく独立系シンクタンクです。",
  aboutParagraphs: [
    "松笠研究所は、統計調査を主軸に、日本社会をより正確に理解するための知見を蓄積・公開する独立系シンクタンクとして設立されました。",
    "私たちは、結論ありきの調査や、営利・党派性に左右された情報発信ではなく、調査設計、集計、解釈の前提と根拠を公開し、検証に耐える知見を社会に届けることを目指します。",
    "社会と政治、人文・社会科学に関する統計調査と分析を広くひらき、誰もが参照できるかたちで蓄積していくことで、公共的な判断を支える基盤を育てていきます。",
    "松笠研究所という名前には、公平なまなざしと、海外の優れた知的実践を日本に根づかせたいという志を託しています。",
  ],
  aboutReason:
    "統計調査を通じて公共的な判断を支える知見を、方法と根拠ごと開いていくために、この研究所をつくりました。",
  aboutNameOrigin:
    "松笠研究所という名前には、公平なまなざしと、海外の優れた知的実践を日本に根づかせたいという志を込めています。",
  aboutNotDo: [
    "結論ありきで調査を組み立てません。",
    "営利や党派性に引っぱられて結論を曲げません。",
    "方法を伏せたまま結論だけを先に出しません。",
  ],
  donateUses: [
    "継続調査の設計と回収",
    "報告書と図表の公開整備",
    "地域聞き取りの交通費と編集費",
  ],
};

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (vercelUrl) {
    return `https://${vercelUrl}`.replace(/\/+$/, "");
  }

  return siteConfig.url;
}
