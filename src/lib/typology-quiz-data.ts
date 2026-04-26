export type TypologyQuizOption = {
  id: string;
  label: string;
  points: Record<string, number>;
};

export type TypologyQuizQuestion = {
  id: string;
  prompt: string;
  options: TypologyQuizOption[];
};

export type TypologyQuizResult = {
  id: string;
  title: string;
  summary: string;
  body: string;
  traits: string[];
};

export type TypologyQuizDefinition = {
  id: string;
  label: string;
  title: string;
  description: string;
  caution: string;
  questions: TypologyQuizQuestion[];
  results: TypologyQuizResult[];
};

export const typologyQuizzes: TypologyQuizDefinition[] = [
  {
    id: "group",
    label: "グループ類型",
    title: "グループ類型クイズ",
    description: "地域、職場、オンラインなど、人とのつながり方の傾向を見ます。",
    caution: "集団への向き合い方を見るための試作版です。個人情報は保存しません。",
    questions: [
      {
        id: "group-entry",
        prompt: "新しい活動に参加するとき、いちばん入りやすい形はどれですか。",
        options: [
          { id: "local-role", label: "役割や当番がはっきりしている場", points: { local: 2, civic: 1 } },
          { id: "task-goal", label: "目的と成果が分かりやすいプロジェクト", points: { task: 2, civic: 1 } },
          { id: "loose-entry", label: "来られる時だけ参加できるゆるい場", points: { loose: 2, individual: 1 } },
          { id: "online-entry", label: "オンラインで様子を見てから参加できる場", points: { online: 2, loose: 1 } },
        ],
      },
      {
        id: "group-local",
        prompt: "町内会、PTA、自治会のような地域組織をどう見ますか。",
        options: [
          { id: "local-necessary", label: "地域を維持するために必要だと思う", points: { local: 2 } },
          { id: "local-reform", label: "必要だが、運営の見直しがいると思う", points: { civic: 2, task: 1 } },
          { id: "local-distance", label: "負担が重いので距離を置きたい", points: { individual: 2, loose: 1 } },
          { id: "local-digital", label: "オンライン連絡や任意参加なら関わりやすい", points: { online: 2, loose: 1 } },
        ],
      },
      {
        id: "group-decision",
        prompt: "グループで物事を決めるとき、納得しやすい進め方はどれですか。",
        options: [
          { id: "decision-consensus", label: "時間をかけて合意形成する", points: { local: 2, civic: 1 } },
          { id: "decision-data", label: "目的、数字、根拠を先に確認する", points: { task: 2 } },
          { id: "decision-small", label: "小さく試してから続けるか決める", points: { loose: 2, task: 1 } },
          { id: "decision-autonomy", label: "個人の判断をできるだけ残す", points: { individual: 2 } },
        ],
      },
      {
        id: "group-help",
        prompt: "社会課題への関わり方として近いものはどれですか。",
        options: [
          { id: "help-neighbor", label: "身近な地域でできることから動く", points: { local: 2 } },
          { id: "help-project", label: "寄付、調査、企画など目的別に参加する", points: { task: 2 } },
          { id: "help-share", label: "情報共有や呼びかけで支える", points: { online: 2 } },
          { id: "help-watch", label: "無理に参加せず、必要な時に見る", points: { individual: 2, loose: 1 } },
        ],
      },
      {
        id: "group-identity",
        prompt: "集団の一員であることについて、近い感覚はどれですか。",
        options: [
          { id: "identity-belonging", label: "所属している安心感は大事だと思う", points: { local: 2 } },
          { id: "identity-purpose", label: "所属よりも、取り組む目的を重視する", points: { task: 2 } },
          { id: "identity-multiple", label: "複数のゆるい居場所を持ちたい", points: { loose: 2 } },
          { id: "identity-private", label: "所属を強く求められると疲れる", points: { individual: 2 } },
        ],
      },
      {
        id: "group-contact",
        prompt: "人との連絡頻度は、どのくらいがちょうどよいですか。",
        options: [
          { id: "contact-regular", label: "定例の集まりがある方が続きやすい", points: { local: 2 } },
          { id: "contact-milestone", label: "節目ごとに集まれば十分", points: { task: 2, loose: 1 } },
          { id: "contact-chat", label: "チャットやSNSで軽くつながるくらい", points: { online: 2, loose: 1 } },
          { id: "contact-minimal", label: "必要な時だけでよい", points: { individual: 2 } },
        ],
      },
    ],
    results: [
      {
        id: "local",
        title: "地域定着型",
        summary: "顔の見える関係や継続的な役割に安心を置くタイプです。",
        body: "身近な場所で少しずつ信頼を積み上げることを重視します。地域活動や小さな共同作業との相性がよい傾向があります。",
        traits: ["定例性を好む", "役割が見えると動きやすい", "地域や生活圏を重視"],
      },
      {
        id: "task",
        title: "目的参加型",
        summary: "所属よりも、目的や成果が見える活動に入りやすいタイプです。",
        body: "何のために集まるのか、どこまでやるのかが明確だと力を出しやすい傾向があります。",
        traits: ["目的志向", "期限や成果を重視", "プロジェクト参加に強い"],
      },
      {
        id: "civic",
        title: "公共参加型",
        summary: "地域や制度をただ受け身で見るのではなく、よりよく整えることに関心を置くタイプです。",
        body: "負担や古い慣習には距離を取りつつ、合意形成や運営改善には関わりたいという傾向があります。",
        traits: ["運営改善に関心", "合意形成を重視", "公共的な役割を意識"],
      },
      {
        id: "loose",
        title: "ゆるいつながり型",
        summary: "強い所属よりも、出入りしやすい関係を好むタイプです。",
        body: "負担が固定されすぎない場で、無理なく関係を続けることを重視します。",
        traits: ["任意参加を好む", "複数の居場所を持ちやすい", "小さく試す"],
      },
      {
        id: "online",
        title: "オンライン拡張型",
        summary: "対面だけでなく、情報共有やオンライン接続から関わるタイプです。",
        body: "距離や時間の制約を越えて、関心を同じくする人とつながることに向いています。",
        traits: ["情報共有が得意", "オンラインで様子を見る", "広く浅いつながり"],
      },
      {
        id: "individual",
        title: "個人自律型",
        summary: "集団に巻き込まれすぎず、自分の判断と距離感を大事にするタイプです。",
        body: "必要な時に関わり、そうでない時は静かに距離を取ることで、長く関心を保ちやすい傾向があります。",
        traits: ["距離感を重視", "個人の裁量を好む", "過度な同調を避ける"],
      },
    ],
  },
  {
    id: "political",
    label: "政治タイプ",
    title: "政治タイプ類型クイズ",
    description: "政府、地域、参加、自由、再分配への考え方から傾向を見ます。",
    caution: "政党支持や投票先を推定するものではありません。価値観の近い方向を見る試作版です。",
    questions: [
      {
        id: "politics-government",
        prompt: "社会保障や公共サービスについて、近い考えはどれですか。",
        options: [
          { id: "government-expand", label: "負担が増えても、公的支援を厚くしたい", points: { welfare: 2, reform: 1 } },
          { id: "government-target", label: "本当に必要な層に絞って支援したい", points: { pragmatic: 2 } },
          { id: "government-local", label: "国よりも自治体や地域の判断を重視したい", points: { localist: 2 } },
          { id: "government-limit", label: "行政の役割はできるだけ小さくしたい", points: { liberty: 2 } },
        ],
      },
      {
        id: "politics-economy",
        prompt: "経済政策で優先したいものはどれですか。",
        options: [
          { id: "economy-redistribute", label: "格差を縮める再分配", points: { welfare: 2 } },
          { id: "economy-growth", label: "成長と雇用を増やす制度設計", points: { pragmatic: 2 } },
          { id: "economy-innovation", label: "起業や技術導入の自由度", points: { liberty: 2, reform: 1 } },
          { id: "economy-region", label: "地方産業と生活圏の維持", points: { localist: 2 } },
        ],
      },
      {
        id: "politics-diversity",
        prompt: "多様な家族、性、国籍、働き方への制度対応についてどう考えますか。",
        options: [
          { id: "diversity-strong", label: "制度の側が積極的に変わるべき", points: { reform: 2, welfare: 1 } },
          { id: "diversity-step", label: "社会の納得を見ながら段階的に進めたい", points: { pragmatic: 2 } },
          { id: "diversity-local", label: "地域や現場ごとの事情を尊重したい", points: { localist: 2 } },
          { id: "diversity-private", label: "個人の自由として、行政は深入りしすぎない方がよい", points: { liberty: 2 } },
        ],
      },
      {
        id: "politics-security",
        prompt: "安全保障や外交について近い考えはどれですか。",
        options: [
          { id: "security-alliance", label: "現実的な同盟と抑止を重視する", points: { pragmatic: 2 } },
          { id: "security-peace", label: "軍事より外交と人道支援を重視する", points: { welfare: 1, reform: 2 } },
          { id: "security-local-impact", label: "基地や地域負担の議論を重視する", points: { localist: 2 } },
          { id: "security-transparency", label: "政府判断への監視と情報公開を重視する", points: { liberty: 2, reform: 1 } },
        ],
      },
      {
        id: "politics-climate",
        prompt: "気候変動対策と生活コストがぶつかる時、どう考えますか。",
        options: [
          { id: "climate-justice", label: "低所得層への補助と脱炭素を同時に進める", points: { welfare: 2, reform: 1 } },
          { id: "climate-tech", label: "技術投資と市場の工夫で進める", points: { pragmatic: 1, liberty: 2 } },
          { id: "climate-region", label: "地域産業への影響を丁寧に見たい", points: { localist: 2 } },
          { id: "climate-rapid", label: "遅らせず制度を大きく変えるべき", points: { reform: 2 } },
        ],
      },
      {
        id: "politics-trust",
        prompt: "政治への関わり方として近いものはどれですか。",
        options: [
          { id: "trust-policy", label: "政策の中身を比較して判断したい", points: { pragmatic: 2 } },
          { id: "trust-movement", label: "署名、デモ、SNSなどで声を上げたい", points: { reform: 2 } },
          { id: "trust-community", label: "身近な自治体や地域の課題から関わりたい", points: { localist: 2 } },
          { id: "trust-watchdog", label: "権力監視と個人の自由を守ることを重視したい", points: { liberty: 2 } },
        ],
      },
      {
        id: "politics-information",
        prompt: "政治情報を見る時、特に気になるものはどれですか。",
        options: [
          { id: "info-impact", label: "生活への影響と支援の届き方", points: { welfare: 2 } },
          { id: "info-evidence", label: "数字、制度設計、実現可能性", points: { pragmatic: 2 } },
          { id: "info-rights", label: "個人の権利や表現の自由への影響", points: { liberty: 2 } },
          { id: "info-place", label: "地域差や現場の声が拾われているか", points: { localist: 2 } },
        ],
      },
    ],
    results: [
      {
        id: "welfare",
        title: "生活保障重視型",
        summary: "公共サービスや再分配を通じて、生活の土台を厚くすることを重視します。",
        body: "格差、福祉、教育、ケアなどの領域で、制度が人を支える役割に期待を置きやすいタイプです。",
        traits: ["再分配を重視", "生活課題に敏感", "支援の届き方を見る"],
      },
      {
        id: "pragmatic",
        title: "制度実務型",
        summary: "理想だけでなく、実現可能性と制度設計を見ながら判断します。",
        body: "政策の目的、費用、実施主体、効果測定を確認してから態度を決める傾向があります。",
        traits: ["実現可能性を重視", "データを見る", "段階的な改革を好む"],
      },
      {
        id: "localist",
        title: "地域実感型",
        summary: "国全体の議論だけでなく、地域や現場への影響を重視します。",
        body: "生活圏、自治体、地方産業、地域負担のような具体的な場所から政策を見ます。",
        traits: ["地域差を見る", "現場感覚を重視", "自治体への関心"],
      },
      {
        id: "liberty",
        title: "自由監視型",
        summary: "行政や多数派が個人の自由を狭めないかを重視します。",
        body: "表現、プライバシー、経済活動、権力監視の観点から政策を点検する傾向があります。",
        traits: ["個人の裁量を重視", "権力監視", "過剰規制に慎重"],
      },
      {
        id: "reform",
        title: "改革参加型",
        summary: "制度や慣行を変えるために、声を上げることを重視します。",
        body: "多様性、気候、平等、情報公開などで、変化を先送りしない姿勢を取りやすいタイプです。",
        traits: ["社会運動に親和的", "変化を重視", "透明性を求める"],
      },
    ],
  },
  {
    id: "religion",
    label: "宗教タイプ",
    title: "宗教タイプ類型クイズ",
    description: "信仰、儀礼、スピリチュアリティ、公共性への距離感を見ます。",
    caution: "宗教の優劣や正しさを判定するものではありません。日本の生活文化を意識した試作版です。",
    questions: [
      {
        id: "religion-ritual",
        prompt: "初詣、墓参り、法事、祭りなどの儀礼について近い感覚はどれですか。",
        options: [
          { id: "ritual-family", label: "家族や地域のつながりとして大切にしたい", points: { ritual: 2, communal: 1 } },
          { id: "ritual-faith", label: "信仰や祈りの実践として大切にしたい", points: { devout: 2 } },
          { id: "ritual-culture", label: "文化として関わることはある", points: { cultural: 2 } },
          { id: "ritual-distance", label: "必要がなければあまり関わらない", points: { secular: 2 } },
        ],
      },
      {
        id: "religion-morality",
        prompt: "よい生き方や道徳に、宗教はどのくらい必要だと思いますか。",
        options: [
          { id: "morality-needed", label: "宗教的な教えはかなり大事だと思う", points: { devout: 2 } },
          { id: "morality-helpful", label: "必要ではないが、支えになることはある", points: { ritual: 1, spiritual: 2 } },
          { id: "morality-social", label: "道徳は社会や教育の中で育つと思う", points: { cultural: 2, secular: 1 } },
          { id: "morality-private", label: "個人の判断に委ねるべきだと思う", points: { secular: 2 } },
        ],
      },
      {
        id: "religion-nature",
        prompt: "自然、祖先、見えないものへの感覚として近いものはどれですか。",
        options: [
          { id: "nature-spirit", label: "自然や場所に精神的な力を感じることがある", points: { spiritual: 2, ritual: 1 } },
          { id: "nature-memory", label: "祖先や故人を思う時間は大切だと思う", points: { ritual: 2 } },
          { id: "nature-beauty", label: "美しさや落ち着きは感じるが、信仰とは別", points: { cultural: 2 } },
          { id: "nature-science", label: "基本的には自然現象として理解したい", points: { secular: 2 } },
        ],
      },
      {
        id: "religion-organization",
        prompt: "宗教団体や寺社・教会などの社会的役割についてどう見ますか。",
        options: [
          { id: "org-good", label: "共同体や支援の担い手として大事だと思う", points: { communal: 2, devout: 1 } },
          { id: "org-watch", label: "役割はあるが、透明性と説明責任が必要", points: { cultural: 2, secular: 1 } },
          { id: "org-private", label: "公共領域とは距離を置く方がよい", points: { secular: 2 } },
          { id: "org-personal", label: "組織より個人の内面的な実践を重視したい", points: { spiritual: 2 } },
        ],
      },
      {
        id: "religion-practice",
        prompt: "祈り、瞑想、読経、礼拝などの実践に近いものはありますか。",
        options: [
          { id: "practice-regular", label: "日常的、または定期的にある", points: { devout: 2 } },
          { id: "practice-occasion", label: "節目や困った時に行うことがある", points: { ritual: 2 } },
          { id: "practice-meditation", label: "瞑想や内省のような形なら近い", points: { spiritual: 2 } },
          { id: "practice-none", label: "ほとんどない", points: { secular: 2 } },
        ],
      },
      {
        id: "religion-public",
        prompt: "政治や教育の場で宗教的価値観が語られることについて、近い考えはどれですか。",
        options: [
          { id: "public-values", label: "公共倫理の一部として語られてよい", points: { communal: 2, devout: 1 } },
          { id: "public-literacy", label: "知識や教養として扱うのは大切", points: { cultural: 2 } },
          { id: "public-careful", label: "少数者への配慮を前提に慎重に扱うべき", points: { spiritual: 1, secular: 2 } },
          { id: "public-separate", label: "政治や公教育とは分けるべき", points: { secular: 2 } },
        ],
      },
      {
        id: "religion-identity",
        prompt: "自分の宗教的・文化的な立ち位置を聞かれたら、どう答えやすいですか。",
        options: [
          { id: "identity-faith", label: "信仰しているものがある", points: { devout: 2 } },
          { id: "identity-custom", label: "家や地域の慣習には関わっている", points: { ritual: 2, communal: 1 } },
          { id: "identity-spiritual", label: "宗教名より、精神性や感覚の方が近い", points: { spiritual: 2 } },
          { id: "identity-none", label: "特に宗教的な立場はない", points: { secular: 2 } },
        ],
      },
    ],
    results: [
      {
        id: "devout",
        title: "信仰実践型",
        summary: "信仰や祈りを、生活の支えとして比較的はっきり持つタイプです。",
        body: "儀礼や教えを個人的な意味だけでなく、日々の判断や安心の源として捉えやすい傾向があります。",
        traits: ["定期的な実践", "教えへの信頼", "祈りや共同体を重視"],
      },
      {
        id: "ritual",
        title: "生活儀礼型",
        summary: "墓参り、初詣、法事など、生活の節目として宗教文化に関わるタイプです。",
        body: "強い信仰表明よりも、家族、祖先、地域の記憶として儀礼を大切にしやすい傾向があります。",
        traits: ["節目を重視", "家族や祖先との結びつき", "慣習に親和的"],
      },
      {
        id: "spiritual",
        title: "個人内面型",
        summary: "組織宗教よりも、内省、自然、精神性に意味を見いだすタイプです。",
        body: "特定の宗教名に強く結びつかなくても、自分なりの実践や感覚を大事にします。",
        traits: ["内省を重視", "自然や場所への感覚", "組織とは距離を取る"],
      },
      {
        id: "communal",
        title: "共同体倫理型",
        summary: "宗教や儀礼を、地域や社会を支える仕組みとして見やすいタイプです。",
        body: "信仰そのものだけでなく、支援、教育、共同体形成の面に注目する傾向があります。",
        traits: ["社会的役割を見る", "共同体志向", "公共倫理への関心"],
      },
      {
        id: "cultural",
        title: "文化理解型",
        summary: "宗教を信仰対象というより、文化や歴史として理解するタイプです。",
        body: "寺社、祭り、宗教知識を、社会を読むための文化資源として扱いやすい傾向があります。",
        traits: ["文化として見る", "知識や教養を重視", "距離を保った関心"],
      },
      {
        id: "secular",
        title: "距離保持型",
        summary: "宗教とは一定の距離を置き、個人の自由や公共性を重視するタイプです。",
        body: "宗教的実践を否定するというより、政治や教育、集団圧力との距離を保つことを大切にします。",
        traits: ["政教分離に敏感", "個人の自由を重視", "過度な同調を避ける"],
      },
    ],
  },
];
