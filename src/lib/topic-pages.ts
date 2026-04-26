import type { InstituteTopic } from "@/lib/types";

type TopicPageDefinition = {
  name: string;
  slug: string;
  imageUrl: string;
  strapline: string;
  summary: string;
};

export const topicPageDefinitions: TopicPageDefinition[] = [
  {
    name: "ケア",
    slug: "care",
    imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=80",
    strapline: "暮らしの負担を見える形に",
    summary: "家事、育児、介護の負担がどこに集まりやすいかを、統計と現場の声で追います。",
  },
  {
    name: "メディア",
    slug: "media",
    imageUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1600&q=80",
    strapline: "報道と配信の変化をたどる",
    summary: "ニュースや配信の接触経路が、社会の理解や判断にどう影響するかを見ます。",
  },
  {
    name: "教育",
    slug: "education",
    imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80",
    strapline: "学びと移行の詰まりを見る",
    summary: "学校から社会への移行、学び直し、地域差の現れ方を丁寧に整理します。",
  },
  {
    name: "雇用",
    slug: "employment",
    imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80",
    strapline: "働き方の変化を定点で追う",
    summary: "賃金、評価、不安定就業、技術導入の影響を継続的に観察します。",
  },
  {
    name: "宗教",
    slug: "religion",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1600&q=80",
    strapline: "価値観と社会参加の接点を扱う",
    summary: "信仰、組織、価値観が社会参加や公共空間とどう結びつくかを見ていきます。",
  },
  {
    name: "情報環境",
    slug: "information-environment",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    strapline: "受け取り方の変化を調べる",
    summary: "ニュース接触、SNS、生成AIが認識や判断に与える影響を追います。",
  },
  {
    name: "世論",
    slug: "public-opinion",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
    strapline: "社会の空気の動きを読む",
    summary: "態度変化、争点認識、支持や不安の動き方を調査から読み解きます。",
  },
  {
    name: "政治参加",
    slug: "political-participation",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80",
    strapline: "参加しやすさの条件を探る",
    summary: "制度への距離感、争点の見え方、参加のしやすさを生活の側から見ます。",
  },
  {
    name: "地域社会",
    slug: "local-community",
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",
    strapline: "つながりと孤立を見つめる",
    summary: "都市と地方の孤立、自治、支え合いの変化を長い目で読み解きます。",
  },
];

export const methodologyFeature = {
  title: "方法論",
  href: "/methodologies",
  imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80",
  strapline: "どう調べているかを先に読む",
  summary: "調査設計、限界、レビュー体制をまとめた方法論ページへ進めます。",
};

export function getTopicDefinitionByName(name: string) {
  return topicPageDefinitions.find((topic) => topic.name === name);
}

export function getTopicDefinitionBySlug(slug: string) {
  return topicPageDefinitions.find((topic) => topic.slug === slug);
}

export function getTopicSlug(name: string) {
  return getTopicDefinitionByName(name)?.slug ?? encodeURIComponent(name);
}

export function getTopicHref(name: string) {
  return `/topics/${getTopicSlug(name)}`;
}

export function getTopicImageUrl(name: string) {
  return (
    getTopicDefinitionByName(name)?.imageUrl ??
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80"
  );
}

export function getTopicPageCopy(topic: InstituteTopic) {
  const definition = getTopicDefinitionByName(topic.name);

  return {
    imageUrl: definition?.imageUrl ?? getTopicImageUrl(topic.name),
    strapline: definition?.strapline ?? `${topic.name}を調べる`,
    summary: definition?.summary ?? topic.description,
  };
}
