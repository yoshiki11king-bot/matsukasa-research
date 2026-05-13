import type {
  BlogPost,
  DirectorPageContent,
  FinancePageContent,
  FinancialStatement,
  InstituteTopic,
  MethodologyEntry,
  ResearchReport,
  ResearcherProfile,
} from "@/lib/types";

export const demoTopics: InstituteTopic[] = [
  {
    name: "政治参加",
    description: "制度への距離感、争点の見え方、参加のしやすさを見ます。",
  },
  {
    name: "世論",
    description: "態度変化、争点認識、社会の空気の動きを追います。",
  },
  {
    name: "ケア",
    description: "家事、育児、介護の負担がどこに集まりやすいかを追います。",
  },
  {
    name: "雇用",
    description: "賃金、評価、不安定就業、職場の変化を定点で見ます。",
  },
  {
    name: "地域社会",
    description: "都市と地方の孤立、自治、つながりの変化を読み解きます。",
  },
  {
    name: "情報環境",
    description: "ニュース接触、SNS、生成AIの受け止め方を扱います。",
  },
  {
    name: "メディア",
    description: "報道、配信、接触経路の変化が判断にどう影響するかを見ます。",
  },
  {
    name: "宗教",
    description: "信仰、組織、価値観と社会参加の関係を丁寧に扱います。",
  },
  {
    name: "教育",
    description: "学校から社会への移行、学び直し、地域差を調べます。",
  },
];

export const demoResearchers: ResearcherProfile[] = [
  {
    id: "researcher-sugita",
    slug: "emi-sugita",
    name: "杉田 絵美",
    role: "主任研究員",
    team: "政治・公共ユニット",
    summary: "若年層の政治参加、自治体広報、争点形成の研究を担当。",
    bio:
      "自治体調査、選挙広報、若年層インタビューを横断して、参加のしにくさがどこで生まれるかを見ています。数字だけで結論を急がず、現場で何が分かりにくいのかを拾うことを重視しています。",
    portraitImage: {
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      width: 800,
      height: 1000,
      alt: "Portrait of Emi Sugita",
    },
    focusTopics: ["政治参加", "地域社会", "情報環境"],
    methodologySlugs: ["national-survey", "issue-mapping-interviews"],
    updatedDate: "2026-04-05",
    email: "emi.sugita@example.jp",
    sourceBasis: "研究経歴、既発表の論考、直近の現地調査テーマをもとに整理。",
    isDemo: true,
  },
  {
    id: "researcher-kasai",
    slug: "yuta-kasai",
    name: "笠井 祐太",
    role: "研究員",
    team: "家族・ケアユニット",
    summary: "家事・育児・介護の時間配分と、働き方の変化を研究。",
    bio:
      "家庭内の役割分担を『見える作業』だけでなく、段取りや調整責任まで含めて測る調査を設計しています。数量調査と聞き取りをつなぐ設計が得意です。",
    portraitImage: {
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      width: 800,
      height: 1000,
      alt: "Portrait of Yuta Kasai",
    },
    focusTopics: ["ケア", "雇用", "教育"],
    methodologySlugs: ["time-use-diary", "regional-hearing"],
    updatedDate: "2026-04-06",
    email: "yuta.kasai@example.jp",
    sourceBasis: "研究計画、最近の共同調査、講演資料から再構成。",
    isDemo: true,
  },
  {
    id: "researcher-matsuda",
    slug: "rina-matsuda",
    name: "松田 里奈",
    role: "客員研究員",
    team: "テクノロジー・メディア班",
    summary: "生成AI、ニュース接触、職場の評価基準の変化を研究。",
    bio:
      "職場への技術導入が不安や期待をどう変えるかを調べています。自由回答の整理と小規模事業所の聞き取りから、制度設計に返せる形へ翻訳する役割を担っています。",
    portraitImage: {
      url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
      width: 800,
      height: 1000,
      alt: "Portrait of Rina Matsuda",
    },
    focusTopics: ["情報環境", "雇用"],
    methodologySlugs: ["national-survey", "free-response-coding"],
    updatedDate: "2026-04-07",
    email: "rina.matsuda@example.jp",
    sourceBasis: "講演資料、共同研究ノート、研究紹介文をもとに作成。",
    isDemo: true,
  },
];

export const demoMethodologies: MethodologyEntry[] = [
  {
    id: "method-national-survey",
    slug: "national-survey",
    title: "全国意識調査",
    summary: "全国の傾向差を見るための標準的な調査設計です。",
    updatedDate: "2026-04-02",
    reviewer: "杉田 絵美",
    focusTopics: ["政治参加", "雇用", "情報環境"],
    goodFor: [
      "全国傾向を比較したいとき",
      "世代差や地域差を安定して見たいとき",
      "継続的な定点観測をしたいとき",
    ],
    limits: [
      "小地域の細かな差は拾いにくい",
      "背景事情の厚みは聞き取りで補う必要がある",
    ],
    sourceBasis:
      "標本抽出、回収補正、設問順の管理を明示し、比較可能性を優先する方法です。",
    body:
      "全国意識調査では、傾向を大きく見誤らないことを最優先にしています。設問文は短く、選択肢の順番は偏りを生みにくい形にそろえ、地域・年齢・性別の構成比を補正したうえで解釈します。\n\nただし、全国調査だけでは『なぜそう答えたのか』の厚みは十分に拾えません。松笠研究所では、自由回答や地域聞き取りを必ずセットで見て、数字の背景を置き去りにしないようにしています。",
    isDemo: true,
  },
  {
    id: "method-regional-hearing",
    slug: "regional-hearing",
    title: "地域ヒアリング",
    summary: "自治体、支援団体、住民の声をつないで地域課題の詰まりを探る聞き取りです。",
    updatedDate: "2026-04-03",
    reviewer: "笠井 祐太",
    focusTopics: ["ケア", "地域社会", "教育"],
    goodFor: [
      "制度はあるのに届かない理由を見たいとき",
      "支援の入り口がどこで切れているかを知りたいとき",
      "地域差の背景事情を補いたいとき",
    ],
    limits: [
      "件数が限られるため、傾向の一般化には向かない",
      "聞き手の整理の仕方で論点の見え方が変わりやすい",
    ],
    sourceBasis:
      "自治体担当者、学校、NPO、当事者の語りを時系列で並べ、制度の手前で起きる詰まりを整理する方法です。",
    body:
      "地域ヒアリングでは、制度の有無だけでなく、実際に誰が最初の相談先になっているのかを見ます。行政、学校、支援団体、家族のあいだで情報がどう渡っているかを追うことで、数字だけでは見えにくい詰まりどころが見えてきます。\n\n一方で、この方法は代表性を持つものではありません。松笠研究所では、住民アンケートや既存統計と突き合わせて、語りだけで結論を広げすぎないようにしています。",
    isDemo: true,
  },
  {
    id: "method-time-use-diary",
    slug: "time-use-diary",
    title: "時間配分ダイアリー",
    summary: "家事、育児、通勤、休息の配分を細かく測る方法です。",
    updatedDate: "2026-03-28",
    reviewer: "笠井 祐太",
    focusTopics: ["ケア", "雇用"],
    goodFor: [
      "平日の負担差を測りたいとき",
      "短時間に分散する作業を見落としたくないとき",
    ],
    limits: [
      "回答負担が高く、回収率が下がりやすい",
      "申告精度を保つための設問設計が難しい",
    ],
    sourceBasis: "15分単位の行動記録と補助設問を組み合わせ、段取り作業も可視化します。",
    body:
      "見えやすい家事だけを聞くと、分担の偏りは軽く見えてしまいます。時間配分ダイアリーでは、送り迎え、翌日の準備、連絡調整のような短く分散する作業を拾うことで、日常の拘束感を可視化します。\n\n一方で、この方法は回答負担が高いので、対象者の生活に合わせた導入説明と、記録しやすい入力画面が欠かせません。",
    isDemo: true,
  },
  {
    id: "method-free-response-coding",
    slug: "free-response-coding",
    title: "自由回答コード化",
    summary: "自由記述の語りを分類し、期待と不安の向き先を見極める整理法です。",
    updatedDate: "2026-04-04",
    reviewer: "松田 里奈",
    focusTopics: ["情報環境", "雇用"],
    goodFor: [
      "選択式ではこぼれる不安や違和感を拾いたいとき",
      "導入期待と懸念が同時に語られるテーマを整理したいとき",
    ],
    limits: [
      "分類基準が曖昧だと結果がぶれやすい",
      "短い回答文では背景事情まで十分に取れないことがある",
    ],
    sourceBasis:
      "自由回答を複数人で仮分類し、判断ルールをそろえてから再集計することで、言葉の揺れを抑えます。",
    body:
      "自由回答コード化は、数値では見えにくい戸惑いや期待の向き先を整理するための方法です。松笠研究所では、まず少数サンプルで分類案を作り、似た表現をどこまで同じ意味として扱うかを確認してから本集計に進みます。\n\nこの方法だけで全体傾向を断定することはしませんが、選択肢設計の見直しや、追加で聞くべき論点を見つけるうえで役に立ちます。",
    isDemo: true,
  },
  {
    id: "method-issue-mapping-interviews",
    slug: "issue-mapping-interviews",
    title: "争点マッピング聞き取り",
    summary: "制度の論点が生活の言葉にどう翻訳されるかを追う聞き取りです。",
    updatedDate: "2026-04-01",
    reviewer: "松田 里奈",
    focusTopics: ["政治参加", "地域社会", "情報環境"],
    goodFor: [
      "争点の伝わりにくさを見たいとき",
      "制度や政策が生活者にどう理解されるかを知りたいとき",
    ],
    limits: [
      "件数は少なく、代表性は持たない",
      "質問順と聞き手の姿勢で結果が揺れやすい",
    ],
    sourceBasis: "候補者比較、地域課題、ニュース接触の語りを時系列で整理する聞き取り法です。",
    body:
      "『投票に行かない』という行動だけを見ても、なぜ距離が生まれるのかは見えてきません。争点マッピング聞き取りでは、ニュース、生活課題、候補者像がどう頭の中でつながっているかを、順を追って聞きます。\n\nこの方法は代表性を持つものではありませんが、全国調査では見えにくい詰まりどころを発見するのに向いています。",
    isDemo: true,
  },
];

export const demoReports: ResearchReport[] = [
  {
    id: "report-local-election-briefing",
    slug: "local-election-information-briefing-2026",
    title: "地方選挙の情報接触に関するブリーフィング",
    summary:
      "候補者情報の届き方と、若年層の判断材料不足を整理した図表付きブリーフィングです。",
    publishedDate: "2026-04-08",
    updatedDate: "2026-04-09",
    reportType: "ブリーフィング",
    region: "全国",
    topicNames: ["政治参加", "情報環境"],
    researcherSlugs: ["emi-sugita"],
    methodologySlugs: ["national-survey", "issue-mapping-interviews"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80",
      width: 1600,
      height: 1000,
      alt: "People in a public meeting hall",
    },
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    figures: [
      {
        title: "候補者情報の不足感",
        url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "争点理解と投票意向",
        url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    sourceLinks: [
      { label: "調査票サマリー" },
      { label: "自由回答分類メモ" },
    ],
    sourceBasis: "全国調査 2,400件と半構造化聞き取り 18件を突合した整理です。",
    body:
      "このブリーフィングでは、若年層が『投票に意味がない』と考えているという単純な見方を取りません。実際には、候補者比較に必要な情報が届いていないこと、生活課題と争点のつながりが見えないことが大きな壁になっていました。\n\n図表では、候補者情報の不足感、地域課題の理解度、投票意向を並べて見られるようにしています。PDF は会議資料向けに短くまとめ、図表はプレゼンテーション転用しやすい比率に整えました。",
    contentBlocks: [],
    isDemo: true,
  },
  {
    id: "report-care-time-gaps",
    slug: "care-time-gap-report-2026",
    title: "共働き世帯のケア時間格差レポート",
    summary:
      "平日の時間配分をもとに、家事・育児・段取り負担の偏りを整理した報告書です。",
    publishedDate: "2026-04-03",
    updatedDate: "2026-04-04",
    reportType: "年次レポート",
    region: "三大都市圏",
    topicNames: ["ケア", "雇用"],
    researcherSlugs: ["yuta-kasai"],
    methodologySlugs: ["time-use-diary"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1600&q=80",
      width: 1600,
      height: 1000,
      alt: "Family preparing for the day",
    },
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    figures: [
      {
        title: "家事・育児時間の平均差",
        url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    sourceLinks: [{ label: "時間配分ダイアリー設計書" }],
    sourceBasis: "三大都市圏の既婚就業者 1,800人の時間記録と聞き取りメモをもとに作成。",
    body:
      "家事や育児の総時間だけでなく、送り迎え、翌日の準備、保育園や学校との連絡のような短時間タスクを重ねて見ると、偏りはなお大きく残っています。\n\nこのレポートは、図表と短い解説で、実務者や政策担当者が会議資料として使いやすい形を目指しました。",
    contentBlocks: [],
    isDemo: true,
  },
];

export const demoDirectorPages: DirectorPageContent[] = [
  {
    id: "director-page-2026-04",
    slug: "director",
    title: "所長から",
    summary:
      "松笠研究所は、結論を急いで並べる場ではなく、どう調べたかと、どこまで言えるかを読み手と共有する場でありたいと考えています。",
    body:
      "名前や肩書きを大きく出すより、どの基準で公開しているかが先に伝わることを重視しています。編集方針、更新の優先順位、公開の線引きに責任を持つのが所長の役割です。",
    effectiveDate: "2026-04-12T00:00:00.000Z",
    updatedDate: "2026-04-12T00:00:00.000Z",
    roleCards: [
      {
        title: "役割",
        body: "編集方針、公開基準、更新の優先順位を最終確認する役割を担います。",
      },
      {
        title: "見ている領域",
        body: "選挙、ケア、雇用、地域社会、情報環境を横断して、公開の軸がぶれないように見ます。",
      },
      {
        title: "先に示すもの",
        body: "更新日、方法、どこまで言えるかの線引きを、結論より先に読める形に整えます。",
      },
    ],
    stanceTitle: "判断の速さより、公開の筋を重視します",
    stanceDescription:
      "読んだ直後の勢いより、あとから見返したときにも判断材料が残る公開を目指しています。",
    stanceCards: [
      {
        title: "名前より判断基準を前に出します",
        body: "個人の肩書きを大きく見せるより、どんな基準で公開しているかが分かることを優先しています。",
      },
      {
        title: "断定を急がない運営を続けます",
        body: "一度の調査や一つの数字だけで社会全体を言い切らず、更新の余地を残したまま公開します。",
      },
      {
        title: "読み手の時間を無駄にしません",
        body: "関係の薄い前置きを減らし、判断に必要な情報へ早く届ける構成を選びます。",
      },
    ],
    relatedSummary:
      "研究所全体の説明は私たちについてへ、運営費の公開方針は財務情報ページへまとめています。",
    isDemo: true,
  },
];

export const demoFinancePages: FinancePageContent[] = [
  {
    id: "finance-page-2026-04",
    slug: "finance",
    title: "財務情報の公開",
    summary:
      "松笠研究所では、支援や運営費がどこへ向かうかを、読み手が追える形で順次公開します。数字だけを並べるのではなく、使い道と更新の基準が分かることを重視します。",
    body:
      "このページでは、財務情報の公開方針と決算資料の履歴をまとめます。未確定の数字は見込みで出さず、確定したものだけを更新日付きで反映します。",
    effectiveDate: "2026-04-12T00:00:00.000Z",
    updatedDate: "2026-04-12T00:00:00.000Z",
    disclosureItems: [
      {
        title: "収入",
        body: "個人寄付、助成金、受託制作など、運営に入る資金の区分をこのページで公開します。",
      },
      {
        title: "支出",
        body: "調査設計、回収、取材、編集、図表制作、システム運用などの使途をまとめて示します。",
      },
      {
        title: "更新",
        body: "少なくとも年度ごとに見直し、大きな変更があったときはその都度更新します。",
      },
    ],
    disclosureTable: [
      {
        title: "個人寄付",
        body: "月次または四半期の合計額を公開します。",
      },
      {
        title: "助成・協力金",
        body: "名称、期間、使途の概要を公開します。",
      },
      {
        title: "調査関連支出",
        body: "設計、回収、取材、編集、図表制作の区分を公開します。",
      },
      {
        title: "管理運営費",
        body: "システム、ドメイン、事務などの費用をまとめて公開します。",
      },
    ],
    policyItems: [
      {
        title: "金額は分類とセットで示します",
        body: "合計額だけでなく、どの活動のための支出かが分かる区分と一緒に公開します。",
      },
      {
        title: "個人情報は公開しません",
        body: "寄付者名や個別の連絡先など、個人が特定される情報は掲載しません。",
      },
      {
        title: "未確定の数字は混ぜません",
        body: "精査が済んでいない金額は見込みで出さず、確定後に更新日付きで反映します。",
      },
      {
        title: "変更履歴を残します",
        body: "公開後に修正した場合は、修正日と理由が分かる形で残します。",
      },
    ],
    contactText:
      "公開項目の希望や確認したい点がある場合は、今後整備するお問い合わせ導線で受け付けます。運営の透明性に関わる内容は、このページに反映していきます。",
    isDemo: true,
  },
];

export const demoFinancialStatements: FinancialStatement[] = [
  {
    id: "financial-statement-2025",
    slug: "fiscal-year-2025",
    title: "2025年度 決算資料",
    fiscalYear: "2025年度",
    summary:
      "寄付収入、調査関連支出、管理運営費の区分をまとめた決算資料です。PDF で全文を確認できます。",
    publishedDate: "2026-04-12T00:00:00.000Z",
    updatedDate: "2026-04-12T00:00:00.000Z",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    sourceBasis: "会計記録と支出整理表を突合し、公開用に区分を整理したものです。",
    highlights: [
      "個人寄付と小口支援を合算した年間収入を掲載。",
      "調査関連支出と管理運営費を分けて記載。",
      "更新日と修正履歴を明記。",
    ],
    body:
      "この決算資料では、年間の収入と支出を大づかみに示すだけでなく、調査と公開に直接関わる費用がどこにかかったかを確認できるようにしています。",
    isDemo: true,
  },
];

export const demoPosts: BlogPost[] = [
  {
    id: "demo-youth-local-election",
    slug: "young-voters-local-election-distance",
    title: "20代の地方選挙参加はなぜ伸びにくいのか",
    excerpt:
      "若年層の政治参加が低いと言われる一方で、関心がまったくないわけではありません。地方選挙との距離がどこで生まれているのかを整理しました。",
    format: "調査報告",
    category: "政治・公共",
    region: "全国",
    publishedDate: "2026-04-09",
    authorName: "杉田 絵美",
    coverImage: {
      url: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
      width: 1600,
      height: 1100,
      alt: "People crossing a city street in Tokyo",
    },
    topics: ["政治参加", "情報環境"],
    researcherSlugs: ["emi-sugita"],
    methodologySlugs: ["national-survey", "issue-mapping-interviews"],
    methodologySummary:
      "2026年2月に18歳から29歳の全国2,400人を対象にオンライン調査を実施。自由回答と聞き取り18件で補足。",
    sourceBasis: "全国調査の回収補正と半構造化聞き取りを併用。",
    updatedNote: "2026年4月9日更新。本文中の自治体事例を追加。",
    sourceLinks: [
      { label: "調査票サマリー" },
      { label: "自治体広報の比較メモ" },
    ],
    keyFindings: [
      "20代の62%が地方選挙を『生活に影響する』と答えた一方、候補者情報が足りないと感じる人は71%だった。",
      "政党よりも、地域課題と候補者の実績を比較したいという回答が過半数だった。",
      "投票所の距離よりも、争点のわかりにくさが参加の障壁として大きかった。",
    ],
    body:
      "地方選挙について若年層へ聞くと、政治そのものへの嫌悪感よりも、候補者と論点が見えにくいことへの戸惑いが先に語られます。選挙公報を開いても差が読み取りにくく、地域の課題が自分の生活へどうつながるかが見えにくいという声が目立ちました。\n\n今回の調査では、投票経験の有無よりも『誰に投票すべきか判断する材料が不足している』感覚が参加意欲を左右していました。とくに初回投票層では、学校教育やニュースから選挙の仕組みは学んでいても、候補者比較の仕方までは身についていない傾向があります。\n\n地域メディア、自治体、候補者自身の情報発信が、政策比較よりもお知らせ型に寄りすぎていることも背景にあります。争点を生活課題の言葉で並べ、候補者差を見える形で伝えることが、参加の入口になりそうです。",
    contentBlocks: [],
    isDemo: true,
  },
  {
    id: "demo-dual-income-care",
    slug: "dual-income-households-care-time-gap",
    title: "共働き世帯で残るケア時間の偏り",
    excerpt:
      "家事や育児の分担は前進しているように見えても、日々の時間配分にはなお偏りが残っています。共働き世帯の平日を見ました。",
    format: "データノート",
    category: "家族・ジェンダー",
    region: "三大都市圏",
    publishedDate: "2026-04-04",
    authorName: "笠井 祐太",
    coverImage: {
      url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80",
      width: 1600,
      height: 1100,
      alt: "Family walking together in an urban neighborhood",
    },
    topics: ["ケア", "雇用"],
    researcherSlugs: ["yuta-kasai"],
    methodologySlugs: ["time-use-diary"],
    methodologySummary:
      "首都圏・中京圏・関西圏の25歳から49歳の共働き既婚者1,800人を対象に、平日の時間配分を15分単位で記録。",
    sourceBasis: "時間配分ダイアリーと短い追跡インタビューを併用。",
    updatedNote: "2026年4月4日更新。補足図表を追加。",
    sourceLinks: [{ label: "時間記録の集計メモ" }],
    keyFindings: [
      "育児がある平日、女性は平均3.8時間、男性は平均2.1時間を家事・育児に使っていた。",
      "男性の在宅勤務日は家事参加が増えるが、育児の主担当が切り替わるわけではなかった。",
      "夕方の送り迎えと翌日の段取りは、依然として女性に集中しやすい。",
    ],
    body:
      "共働き世帯では、男性の家事参加が増えているという認識が広がっています。実際、調査票で『以前より分担している』と答える男性は多く、女性側も完全なワンオペではないと答えています。ただし時間配分を細かく見ると、偏りはなお大きく残っています。\n\nとくに差が大きいのは、子どもの支度、連絡帳や持ち物確認、保育・学童まわりの調整といった細かな段取りです。これらは短時間の作業に分散しているため、本人も負担として数えにくい一方で、毎日の拘束感につながっています。\n\n時間の総量だけでなく、誰が調整責任を負っているかを見る必要があります。家事分担の議論を進めるには、見える作業だけでなく、予定管理や気配りの負担を調査対象に含めることが欠かせません。",
    contentBlocks: [],
    isDemo: true,
  },
  {
    id: "demo-ai-workplace-anxiety",
    slug: "generative-ai-workplace-anxiety-japan",
    title: "生成AI導入で、職場の不安は何に向かうのか",
    excerpt:
      "効率化への期待と雇用不安は同時に存在しています。日本の職場で、生成AIがどう受け止められているかを職種別に見ました。",
    format: "短報",
    category: "雇用・テクノロジー",
    region: "全国",
    publishedDate: "2026-03-29",
    authorName: "松田 里奈",
    coverImage: {
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
      width: 1600,
      height: 1100,
      alt: "People working with laptops in an office",
    },
    topics: ["情報環境", "雇用"],
    researcherSlugs: ["rina-matsuda"],
    methodologySlugs: ["national-survey"],
    methodologySummary:
      "民間企業で働く20歳から64歳の2,100人を対象にオンライン調査を実施し、自由回答を内容分類した。",
    sourceBasis: "全国調査と自由回答のコード化を併用。",
    updatedNote: "2026年3月29日公開。初版。",
    sourceLinks: [{ label: "自由回答分類ルール" }],
    keyFindings: [
      "生成AIに期待する人は58%だが、仕事の評価基準が曖昧になる不安も47%にのぼった。",
      "事務・企画職では効率化期待が高く、対人サービス職では品質低下への懸念が強かった。",
      "研修や利用ルールがある職場ほど、不安の程度は低かった。",
    ],
    body:
      "生成AIの導入が進む職場では、『業務が速くなる』期待と『自分の仕事がどう評価されるかわからなくなる』不安が同時に語られます。とくに文章要約、議事録整理、問い合わせ対応など、成果が見えやすい業務ほど、効率化の恩恵と代替への警戒が並びます。\n\n今回の自由回答分析では、雇用そのものの喪失よりも、評価の透明性や責任の所在が曖昧になることへの不安が目立ちました。ミスが起きたときに誰が説明責任を負うのか、AI利用の前提知識がチーム内で共有されているかが、安心感に直結しています。\n\n技術導入の議論は、生産性向上だけでなく、職場の信頼や裁量の設計とセットで行う必要があります。導入ルールが明確な職場では、不安が期待に変わりやすいという傾向も見られました。",
    contentBlocks: [],
    isDemo: true,
  },
  {
    id: "demo-local-isolation",
    slug: "urban-rural-isolation-support-networks",
    title: "孤立感は都市だけの問題か 地方都市の支援ネットワークをみる",
    excerpt:
      "一人暮らしの高齢者や若年単身層の孤立は、都市部だけでなく地方都市でも深まっています。地域のつながり方を比較しました。",
    format: "調査報告",
    category: "地域社会",
    region: "地方都市",
    publishedDate: "2026-03-18",
    authorName: "杉田 絵美",
    coverImage: {
      url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",
      width: 1600,
      height: 1100,
      alt: "Residential street in a Japanese town",
    },
    topics: ["地域社会", "ケア"],
    researcherSlugs: ["emi-sugita", "yuta-kasai"],
    methodologySlugs: ["issue-mapping-interviews"],
    methodologySummary:
      "地方中核市4地域で聞き取り調査と住民アンケートを組み合わせ、自治体や支援団体へのインタビュー36件を実施。",
    sourceBasis: "地域聞き取りと住民アンケートの突合。",
    updatedNote: "2026年3月20日更新。支援窓口事例を追加。",
    sourceLinks: [{ label: "聞き取り対象一覧" }],
    keyFindings: [
      "日常的なあいさつは残っていても、困りごとを相談できる関係は細っていた。",
      "支援制度の有無よりも、地域で最初に声をかける窓口の見えやすさが利用率を左右していた。",
      "若年単身層では、オンラインのつながりが孤立感を完全には埋めていなかった。",
    ],
    body:
      "地方都市では、近所づきあいがあるから孤立は起こりにくいと見られがちです。しかし実際には、軽い接点はあっても、困ったときに頼れる相手がいるとは限りません。調査地では『顔は知っているが相談はしづらい』という声が多く聞かれました。\n\n高齢者支援では制度が用意されていても、最初の相談先が見えないため利用につながらない例がありました。若年単身層では、仕事や転勤で地元外から流入した人ほど地域ネットワークに入りづらく、オンライン上のつながりで孤立感をやり過ごしている実態も見えました。\n\n孤立対策では、制度の数を増やすだけでなく、誰が最初の接点になるのかを明確にする必要があります。地域包括支援センターや学校、企業、NPO が分かれず、生活者から見て一本の入口に見える設計が重要です。",
    contentBlocks: [],
    isDemo: true,
  },
];
