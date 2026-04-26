import type { InstituteTopic } from "@/lib/types";

export type MapPosition = {
  x: number;
  y: number;
};

export type ExplorerLink = {
  href: string;
  label: string;
  description: string;
};

export type PrimaryNode = {
  id: string;
  label: string;
  description: string;
  kind: "articles" | "links";
  position: MapPosition;
  leafPositions: MapPosition[];
  links: ExplorerLink[];
};

export type TopicBranchGroup = {
  id: string;
  label: string;
  description: string;
  topics: InstituteTopic[];
  position: MapPosition;
  leafPositions: MapPosition[];
};

type TopicBranchBlueprint = {
  id: string;
  label: string;
  description: string;
  topicNames: string[];
  position: MapPosition;
  leafPositions: MapPosition[];
};

export const centerPosition = { x: 50, y: 52 };

export const primaryNodes: PrimaryNode[] = [
  {
    id: "articles",
    label: "記事を探す",
    description: "関心の枝を選ぶと、テーマの特設ページへつながります。",
    kind: "articles",
    position: { x: 31, y: 38 },
    leafPositions: [],
    links: [],
  },
  {
    id: "reports",
    label: "報告書",
    description: "調査報告書と公開資料をまとめてたどれます。",
    kind: "links",
    position: { x: 73, y: 26 },
    leafPositions: [{ x: 87, y: 16 }],
    links: [
      {
        href: "/reports",
        label: "調査報告書",
        description: "公開している報告書の一覧へ進みます。",
      },
    ],
  },
  {
    id: "research",
    label: "研究と方法",
    description: "誰が、どう調べ、何を公開しているかを確かめる入口です。",
    kind: "links",
    position: { x: 77, y: 54 },
    leafPositions: [
      { x: 90, y: 45 },
      { x: 89, y: 64 },
      { x: 91, y: 55 },
    ],
    links: [
      {
        href: "/researchers",
        label: "研究員",
        description: "担当研究員と専門領域を見られます。",
      },
      {
        href: "/methodologies",
        label: "方法論",
        description: "調査設計とレビュー基準を確認できます。",
      },
      {
        href: "/tools-datasets",
        label: "ツールとデータセット",
        description: "調査票や公開データの置き場へ進みます。",
      },
    ],
  },
  {
    id: "institute",
    label: "研究所案内",
    description: "目的、所長、財務情報をひとつづきで見渡せます。",
    kind: "links",
    position: { x: 34, y: 76 },
    leafPositions: [
      { x: 16, y: 66 },
      { x: 14, y: 80 },
      { x: 24, y: 91 },
    ],
    links: [
      {
        href: "/about",
        label: "私たちについて",
        description: "研究所の設立目的と姿勢をまとめています。",
      },
      {
        href: "/director",
        label: "所長",
        description: "所長ページへ進みます。",
      },
      {
        href: "/finance",
        label: "財務情報",
        description: "財務情報と決算資料の公開ページです。",
      },
    ],
  },
  {
    id: "support",
    label: "寄付",
    description: "公開を続けるための支援ページへ進みます。",
    kind: "links",
    position: { x: 68, y: 78 },
    leafPositions: [{ x: 83, y: 88 }],
    links: [
      {
        href: "/donate",
        label: "寄付ページ",
        description: "継続支援の案内へ進みます。",
      },
    ],
  },
];

const branchBlueprints: TopicBranchBlueprint[] = [
  {
    id: "learn-work",
    label: "学びと雇用",
    description: "教育から仕事への移行を見ます",
    topicNames: ["教育", "雇用"],
    position: { x: 17, y: 20 },
    leafPositions: [
      { x: 9, y: 12 },
      { x: 8, y: 29 },
    ],
  },
  {
    id: "info-opinion",
    label: "情報と世論",
    description: "メディア接触と認識の変化を見ます",
    topicNames: ["メディア", "情報環境", "世論"],
    position: { x: 15, y: 43 },
    leafPositions: [
      { x: 7, y: 35 },
      { x: 6, y: 46 },
      { x: 9, y: 57 },
    ],
  },
  {
    id: "care-local",
    label: "暮らしと地域",
    description: "ケア負担と地域の支えを見ます",
    topicNames: ["ケア", "地域社会"],
    position: { x: 24, y: 64 },
    leafPositions: [
      { x: 13, y: 73 },
      { x: 29, y: 82 },
    ],
  },
  {
    id: "belief-participation",
    label: "価値観と参加",
    description: "宗教や制度との距離感を見ます",
    topicNames: ["宗教", "政治参加"],
    position: { x: 45, y: 22 },
    leafPositions: [
      { x: 56, y: 13 },
      { x: 58, y: 29 },
    ],
  },
  {
    id: "other",
    label: "そのほか",
    description: "まだ分岐に置いていない論点です",
    topicNames: [],
    position: { x: 43, y: 47 },
    leafPositions: [
      { x: 56, y: 39 },
      { x: 57, y: 50 },
      { x: 51, y: 62 },
    ],
  },
];

export function anchorStyle(position: MapPosition) {
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: "translate(-50%, -50%)",
  };
}

export function floatingStyle(index: number, duration = 7) {
  return {
    animationDuration: `${duration + index * 0.4}s`,
    animationDelay: `${index * 0.28}s`,
  };
}

export function revealStyle(index: number) {
  return {
    animationDelay: `${index * 12}ms`,
  };
}

export function buildArticleBranches(topics: InstituteTopic[]) {
  const topicMap = new Map(topics.map((topic) => [topic.name, topic]));

  const groups: TopicBranchGroup[] = branchBlueprints
    .map((branch) => ({
      id: branch.id,
      label: branch.label,
      description: branch.description,
      position: branch.position,
      leafPositions: [...branch.leafPositions],
      topics: branch.topicNames
        .map((name) => topicMap.get(name))
        .filter((topic): topic is InstituteTopic => Boolean(topic)),
    }))
    .filter((branch) => branch.id === "other" || branch.topics.length > 0);

  const usedTopics = new Set(groups.flatMap((group) => group.topics.map((topic) => topic.name)));
  const remainingTopics = topics.filter((topic) => !usedTopics.has(topic.name));

  return groups
    .map((group) =>
      group.id === "other"
        ? {
            ...group,
            topics: remainingTopics,
          }
        : group,
    )
    .filter((group) => group.topics.length > 0);
}

export function getPreferredArticleBranchId(groups: TopicBranchGroup[], selectedTopics: string[]) {
  return groups.find((group) => group.topics.some((topic) => selectedTopics.includes(topic.name)))?.id ?? null;
}
