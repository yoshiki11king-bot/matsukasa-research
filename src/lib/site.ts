export const siteConfig = {
  name: "松笠研究所",
  englishName: "Matsukasa Research Center",
  url: "https://matsukasa-research.org",
  description:
    "統計調査を軸に、日本社会を読むためのデータと解説を公開する独立系シンクタンク。",
  mission:
    "調査の設計、集計、解釈の前提を明らかにし、社会を考える材料を日本語で公開します。",
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
    "統計調査を軸に、方法と根拠を示しながら、社会を考える材料を公開する独立系シンクタンクです。",
  aboutParagraphs: [
    "松笠研究所は、統計調査を軸に、日本社会を読むためのデータと解説を公開する独立系シンクタンクです。",
    "結論を先に置かず、調査設計、集計、解釈の前提を明らかにします。営利や党派性に左右されない公開を基本にします。",
    "政治、生活、地域、情報環境などを扱い、数字だけでなく、どこまで言えるのかもあわせて示します。",
    "松笠研究所という名前には、公平なまなざしと、海外の優れた知的実践を日本に根づかせたいという思いを込めています。",
  ],
  aboutReason:
    "社会を考える材料を、方法と根拠ごと公開するために、この研究所をつくりました。",
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
