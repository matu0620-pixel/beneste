import React, { useState, useEffect, useRef } from "react";

// ============ モックデータ ============
const CATEGORIES = [
  { id: "travel", name: "旅行・宿泊", en: "Travel & Stay", icon: "✈" },
  { id: "gourmet", name: "グルメ", en: "Gourmet", icon: "◆" },
  { id: "leisure", name: "レジャー", en: "Leisure", icon: "✦" },
  { id: "beauty", name: "ビューティー", en: "Beauty & Health", icon: "❀" },
  { id: "shopping", name: "ショッピング", en: "Shopping", icon: "♢" },
  { id: "learning", name: "学び・資格", en: "Learning", icon: "✎" },
  { id: "family", name: "育児・介護", en: "Family Care", icon: "❤" },
  { id: "life", name: "暮らしのサポート", en: "Lifestyle", icon: "▲" },
];

const QUESTION_FLOWS = {
  travel: [
    { q: "今回はどんな旅をイメージしてる？", opts: ["温泉でゆっくり", "観光をたくさん", "ビジネス出張", "ご家族と一緒に"] },
    { q: "ご予算は1泊あたりどれくらい？", opts: ["〜1万円", "1〜2万円", "2〜4万円", "4万円以上"] },
    { q: "行き先はもう決まってる？", opts: ["関東近郊", "関西方面", "九州・沖縄", "まだ迷ってる"] },
  ],
  gourmet: [
    { q: "どんなシチュエーションで使う予定？", opts: ["家族でランチ", "デート・記念日", "友人との飲み会", "一人ご褒美"] },
    { q: "気分はどっち？", opts: ["和食", "洋食", "中華・エスニック", "なんでもOK"] },
    { q: "予算感は？", opts: ["〜3,000円", "3,000〜6,000円", "6,000〜1万円", "1万円以上"] },
  ],
  leisure: [
    { q: "誰と一緒に行く予定？", opts: ["お子さんと", "パートナーと", "友人と", "ひとりで"] },
    { q: "アクティブ派？まったり派？", opts: ["体を動かしたい", "ゆっくり観たい", "学びたい", "刺激がほしい"] },
    { q: "移動できる範囲は？", opts: ["近所", "都内・市内", "日帰り遠出", "泊まりがけOK"] },
  ],
  beauty: [
    { q: "今日のお悩みは？", opts: ["疲れがとれない", "肩こり・腰痛", "リフレッシュしたい", "美容のメンテ"] },
    { q: "施術時間はどれくらい取れる？", opts: ["30分以内", "1時間ほど", "2時間以上", "丸一日"] },
    { q: "予算は？", opts: ["〜3,000円", "3,000〜6,000円", "6,000〜1万円", "1万円以上"] },
  ],
  shopping: [
    { q: "何を探してる？", opts: ["日用品", "ファッション", "家電・ガジェット", "ギフト"] },
    { q: "重視するポイントは？", opts: ["とにかく安く", "品質重視", "話題のもの", "限定・特別感"] },
    { q: "予算は？", opts: ["〜5,000円", "5,000〜2万円", "2〜5万円", "5万円以上"] },
  ],
  learning: [
    { q: "学びたいジャンルは？", opts: ["ビジネススキル", "語学", "資格取得", "趣味・教養"] },
    { q: "学習スタイルは？", opts: ["動画で隙間時間", "じっくりスクール", "本で独学", "コミュニティ参加"] },
    { q: "投資できる金額は？", opts: ["無料〜数千円", "1〜3万円", "3〜10万円", "10万円以上"] },
  ],
  family: [
    { q: "今、一番サポートが欲しいのは？", opts: ["保育・ベビーシッター", "知育・教育", "介護サービス", "家事代行"] },
    { q: "利用頻度は？", opts: ["単発でOK", "月数回", "週1回ペース", "毎日のように"] },
    { q: "予算感は？", opts: ["できるだけ抑えたい", "標準でOK", "質を優先したい", "最高クラスを"] },
  ],
  life: [
    { q: "どんなお困りごと？", opts: ["引っ越し", "ハウスクリーニング", "車・自転車関連", "公共料金・通信"] },
    { q: "急ぎ度は？", opts: ["今すぐ", "今月中", "数ヶ月以内", "情報収集中"] },
    { q: "予算は？", opts: ["最安重視", "コスパ重視", "品質重視", "プレミアム"] },
  ],
};

const MOCK_SUGGESTIONS = {
  travel: [
    { name: "箱根 湯の宿 雪月花", tag: "温泉・露天風呂付", price: "¥24,800 → ¥18,200", match: 94, reason: "ご希望の温泉×ご家族向けで会員特価率がもっとも高い宿でした。" },
    { name: "リゾートトラスト全国優待", tag: "ハイクラス会員価格", price: "通常価格より最大40%OFF", match: 87, reason: "ご予算ゾーンにフィットする上に、お子様歓迎プランがあります。" },
    { name: "JTB 季節のおすすめツアー", tag: "新幹線+宿パック", price: "ベネ会員 ¥5,000割引", match: 81, reason: "観光メインで動きやすい構成で、まだ行き先が決まっていない方に向いています。" },
  ],
  gourmet: [
    { name: "ひらまつレストラン優待", tag: "記念日プラン", price: "コース20%OFF + シャンパン", match: 91, reason: "デート・記念日のシチュエーションで会員満足度が非常に高い選択です。" },
    { name: "焼肉トラジ 全店優待", tag: "ファミリー利用◎", price: "10%OFF + ドリンク1杯無料", match: 84, reason: "和食寄りでご家族利用に向き、予算感もぴったりです。" },
    { name: "アサヒビール園 食べ放題", tag: "団体・グループ向け", price: "¥4,950 → ¥3,960", match: 76, reason: "友人との飲み会で人気のメニューです。" },
  ],
  leisure: [
    { name: "東京ディズニーリゾート", tag: "1デーパスポート", price: "¥9,400 → ¥8,900", match: 92, reason: "お子さまと泊まりがけでも楽しめる、定番の人気No.1優待です。" },
    { name: "ラウンドワン 全店優待", tag: "ボウリング+カラオケ", price: "ゲーム代 最大30%OFF", match: 80, reason: "近所で気軽に体を動かしたい方に最適です。" },
    { name: "国立美術館 招待券", tag: "特別展含む", price: "無料（年4回まで）", match: 73, reason: "ゆっくり観たい派にぴったりの落ち着いた選択肢です。" },
  ],
  beauty: [
    { name: "リラクゼーション ラフィネ", tag: "もみほぐし60分", price: "¥6,600 → ¥4,950", match: 89, reason: "肩こり・腰痛のお悩みに対して会員リピート率が高い施術です。" },
    { name: "ティップネス 全店", tag: "都度利用", price: "1回 ¥3,300 → ¥1,650", match: 82, reason: "リフレッシュ目的で1時間ほどの利用に向いています。" },
    { name: "TBC エステティック", tag: "フェイシャル体験", price: "初回 ¥1,000（90分）", match: 75, reason: "美容メンテで時間をしっかり取れる方に。" },
  ],
  shopping: [
    { name: "ビックカメラ.com", tag: "家電全般", price: "ポイント還元+5%", match: 88, reason: "家電・ガジェット系で品質と価格のバランスが良いストアです。" },
    { name: "高島屋オンライン 優待", tag: "ギフト対応", price: "送料無料+ラッピング無料", match: 81, reason: "ギフト用途で限定感のある選択肢として評価が高いです。" },
    { name: "Amazonギフト券優待", tag: "汎用", price: "額面の97%で購入可能", match: 70, reason: "とにかく安く、を重視する場合の定番ルートです。" },
  ],
  learning: [
    { name: "Udemyビジネス 法人プラン", tag: "動画学習", price: "ベネ会員 25%OFF", match: 93, reason: "隙間時間×ビジネススキルで満足度が非常に高い選択です。" },
    { name: "ECC外語学院", tag: "語学スクール", price: "入学金無料+授業料5%OFF", match: 84, reason: "じっくりスクール派の語学学習で人気です。" },
    { name: "TAC 資格講座", tag: "資格取得支援", price: "受講料 最大15%OFF", match: 79, reason: "資格取得を本気で目指す方に向いています。" },
  ],
  family: [
    { name: "ポピンズシッターサービス", tag: "ベビーシッター", price: "1時間 ¥1,000割引", match: 90, reason: "保育・ベビーシッター用途で補助金との併用がしやすいです。" },
    { name: "学研教室", tag: "知育・教育", price: "入会金無料+月謝5%OFF", match: 83, reason: "週1ペースで学ばせたいご家庭に向いています。" },
    { name: "ニチイ介護サービス", tag: "訪問介護", price: "利用料 ベネ会員特価", match: 78, reason: "介護用途で全国対応の安心感がポイントです。" },
  ],
  life: [
    { name: "サカイ引越センター", tag: "引っ越し", price: "ベネ会員 最大30%OFF", match: 92, reason: "急ぎ目の引っ越しでコスパが最も良い選択肢です。" },
    { name: "ダスキン ハウスクリーニング", tag: "エアコン・水回り", price: "5%OFF + 追加サービス", match: 85, reason: "今月中の対応希望で品質重視ならここが鉄板です。" },
    { name: "ソフトバンク光", tag: "通信費", price: "月額 ¥1,000割引", match: 73, reason: "通信費の見直しで長期的な節約になります。" },
  ],
};

// ============ ぶさにゃん（ふてにゃん風キャラ）SVG ============
function BusaNyan({ size = 280, mood = "default" }) {
  return (
    <svg
      viewBox="0 0 320 340"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* 影 */}
      <ellipse cx="160" cy="320" rx="85" ry="8" fill="rgba(31, 58, 95, 0.18)" className="bn-shadow" />

      {/* 全体グループ */}
      <g className="bn-body-group">

        {/* しっぽ */}
        <g className="bn-tail">
          <path
            d="M 235 240 Q 275 250 285 220 Q 290 200 275 195"
            fill="#E89858"
            stroke="#C77834"
            strokeWidth="2"
          />
          <path
            d="M 240 235 Q 275 245 282 220"
            fill="#F4B27F"
          />
        </g>

        {/* 体（ぽっちゃり胴体） */}
        <ellipse cx="160" cy="240" rx="90" ry="65" fill="#E89858" />
        <ellipse cx="160" cy="245" rx="86" ry="60" fill="#F4B27F" opacity="0.4" />

        {/* お腹（白） */}
        <ellipse cx="160" cy="255" rx="55" ry="50" fill="#FAF3E8" />

        {/* お腹のロゴ風プリント */}
        <circle cx="160" cy="255" r="14" fill="#fff" stroke="#1F3A5F" strokeWidth="1.5" />
        <text x="160" y="260" textAnchor="middle" fontSize="9" fill="#1F3A5F" fontWeight="700" fontFamily="serif">BS</text>

        {/* 足 */}
        <ellipse cx="125" cy="298" rx="18" ry="14" fill="#E89858" />
        <ellipse cx="195" cy="298" rx="18" ry="14" fill="#E89858" />
        <ellipse cx="125" cy="296" rx="14" ry="9" fill="#FAF3E8" />
        <ellipse cx="195" cy="296" rx="14" ry="9" fill="#FAF3E8" />
        {/* 肉球 */}
        <circle cx="121" cy="296" r="1.5" fill="#E89898" />
        <circle cx="129" cy="296" r="1.5" fill="#E89898" />
        <circle cx="125" cy="299" r="2" fill="#E89898" />
        <circle cx="191" cy="296" r="1.5" fill="#E89898" />
        <circle cx="199" cy="296" r="1.5" fill="#E89898" />
        <circle cx="195" cy="299" r="2" fill="#E89898" />

        {/* 頭（おっきめ） */}
        <ellipse cx="160" cy="155" rx="100" ry="92" fill="#E89858" />

        {/* 顔の白い部分（V字に） */}
        <path
          d="M 160 95 Q 95 130 95 175 Q 100 215 160 230 Q 220 215 225 175 Q 225 130 160 95 Z"
          fill="#FAF3E8"
        />

        {/* オレンジ縞模様（頭頂） */}
        <path d="M 130 80 Q 135 100 130 115" stroke="#C77834" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 160 70 Q 162 95 158 110" stroke="#C77834" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 190 80 Q 188 100 192 115" stroke="#C77834" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />

        {/* 耳 - 左 */}
        <path d="M 70 105 L 80 50 L 130 95 Z" fill="#E89858" />
        <path d="M 78 100 L 87 65 L 122 92 Z" fill="#C77834" opacity="0.4" />
        <path d="M 88 92 L 95 75 L 115 90 Z" fill="#F4D8B5" />

        {/* 耳 - 右 */}
        <path d="M 250 105 L 240 50 L 190 95 Z" fill="#E89858" />
        <path d="M 242 100 L 233 65 L 198 92 Z" fill="#C77834" opacity="0.4" />
        <path d="M 232 92 L 225 75 L 205 90 Z" fill="#F4D8B5" />

        {/* 眉毛（怒り眉） */}
        <path d="M 105 140 Q 120 132 138 138" stroke="#1F3A5F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M 215 140 Q 200 132 182 138" stroke="#1F3A5F" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* 目 - 左（半目・じとっと） */}
        <g className="bn-eye-left">
          {/* 目の上の影/まぶた */}
          <path d="M 110 158 Q 125 152 140 158" stroke="#1F3A5F" strokeWidth="3" fill="#1F3A5F" strokeLinecap="round" />
          {/* 目玉 */}
          <ellipse cx="125" cy="165" rx="9" ry="6" fill="#FAF3E8" />
          {/* 黒目（小さい） */}
          <ellipse cx="125" cy="167" rx="4.5" ry="4" fill="#1F3A5F" />
          {/* ハイライト */}
          <circle cx="127" cy="165" r="1.5" fill="#fff" />
          {/* 下まつげ的な線 */}
          <path d="M 113 172 Q 125 175 138 172" stroke="#1F3A5F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
        </g>

        {/* 目 - 右 */}
        <g className="bn-eye-right">
          <path d="M 210 158 Q 195 152 180 158" stroke="#1F3A5F" strokeWidth="3" fill="#1F3A5F" strokeLinecap="round" />
          <ellipse cx="195" cy="165" rx="9" ry="6" fill="#FAF3E8" />
          <ellipse cx="195" cy="167" rx="4.5" ry="4" fill="#1F3A5F" />
          <circle cx="197" cy="165" r="1.5" fill="#fff" />
          <path d="M 207 172 Q 195 175 182 172" stroke="#1F3A5F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
        </g>

        {/* ほっぺ（ほんのり） */}
        <ellipse cx="100" cy="190" rx="14" ry="8" fill="#E89898" opacity="0.3" />
        <ellipse cx="220" cy="190" rx="14" ry="8" fill="#E89898" opacity="0.3" />

        {/* 鼻 */}
        <path d="M 153 188 L 167 188 L 160 196 Z" fill="#1F3A5F" />

        {/* 口（へのへの→へ） */}
        <path
          d="M 148 207 L 160 200 L 172 207"
          stroke="#1F3A5F"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* 不機嫌な口 */}
        <path
          d="M 152 215 Q 160 211 168 215"
          stroke="#1F3A5F"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* ひげ */}
        <line x1="55" y1="190" x2="90" y2="195" stroke="#1F3A5F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="55" y1="200" x2="90" y2="200" stroke="#1F3A5F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="265" y1="190" x2="230" y2="195" stroke="#1F3A5F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="265" y1="200" x2="230" y2="200" stroke="#1F3A5F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

      </g>
    </svg>
  );
}

// ============ メインアプリ ============
export default function App() {
  const [view, setView] = useState("home");
  const [activeCat, setActiveCat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [profile, setProfile] = useState({
    notes: ["まだメモはありません"],
    likes: [],
    dislikes: [],
  });
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startCategory = (cat) => {
    setActiveCat(cat);
    setView("chat");
    setStep(0);
    setAnswers([]);
    const greeting = profile.notes[0] !== "まだメモはありません"
      ? `…おかえり。「${cat.name}」だな。前のお前の好み、ちゃんと覚えてるぞ。`
      : `…ふん、「${cat.name}」か。仕方ないから手伝ってやる。いくつか質問するぞ。`;
    setMessages([
      { from: "bot", text: greeting },
      { from: "bot", text: QUESTION_FLOWS[cat.id][0].q, opts: QUESTION_FLOWS[cat.id][0].opts },
    ]);
  };

  const pickAnswer = (opt) => {
    const newAnswers = [...answers, opt];
    setAnswers(newAnswers);
    const userMsg = { from: "user", text: opt };
    const nextStep = step + 1;
    const flow = QUESTION_FLOWS[activeCat.id];

    if (nextStep < flow.length) {
      setMessages((m) => [
        ...m,
        userMsg,
        { from: "bot", text: flow[nextStep].q, opts: flow[nextStep].opts },
      ]);
      setStep(nextStep);
    } else {
      setMessages((m) => [
        ...m,
        userMsg,
        { from: "bot", text: "…ま、わかった。お前にぴったりの3件、選んでおいた。感謝しろよ。" },
      ]);

      const newNote = `[${activeCat.name}] ${newAnswers.join(" / ")}`;
      setProfile((p) => ({
        ...p,
        notes: p.notes[0] === "まだメモはありません" ? [newNote] : [newNote, ...p.notes].slice(0, 6),
      }));

      setTimeout(() => setView("result"), 1200);
    }
  };

  const giveFeedback = (item, kind) => {
    setProfile((p) => {
      const next = { ...p };
      if (kind === "like") {
        next.likes = [...new Set([item.name, ...p.likes])].slice(0, 5);
        next.notes = [`「${item.tag}」系がお気に入りらしい`, ...p.notes.filter(n => n !== "まだメモはありません")].slice(0, 6);
      } else {
        next.dislikes = [...new Set([item.name, ...p.dislikes])].slice(0, 5);
        next.notes = [`「${item.tag}」は好みじゃないようだ`, ...p.notes.filter(n => n !== "まだメモはありません")].slice(0, 6);
      }
      return next;
    });
  };

  const goHome = () => {
    setView("home");
    setActiveCat(null);
    setStep(0);
    setAnswers([]);
    setMessages([]);
  };

  return (
    <div className="bs-app">
      <style>{globalCSS}</style>

      <header className="bs-header">
        <div className="bs-brand" onClick={goHome}>
          <div className="bs-logo-mark">
            <svg viewBox="0 0 40 40" width="32" height="32">
              <rect x="2" y="2" width="36" height="36" rx="2" fill="#1F3A5F" />
              <text x="20" y="27" textAnchor="middle" fontSize="18" fill="#fff" fontFamily="'Bodoni Moda', serif" fontWeight="700">B</text>
            </svg>
          </div>
          <div className="bs-brand-text">
            <div className="bs-brand-name">ベネステ<span className="bs-brand-name-en">AI検索</span></div>
            <div className="bs-brand-sub">BENE-STATION AI SEARCH</div>
          </div>
        </div>
        <nav className="bs-nav">
          <button className="bs-nav-link" onClick={goHome}>ホーム</button>
          <button className="bs-nav-link">カテゴリー</button>
          <button className="bs-nav-link">利用履歴</button>
          <button className="bs-nav-link">ヘルプ</button>
          <button className="bs-account-btn">
            <span className="bs-account-icon">●</span>
            ゲストさん
          </button>
        </nav>
      </header>

      <main className="bs-main">
        {view === "home" && <HomeView categories={CATEGORIES} onPick={startCategory} hasMemo={profile.notes[0] !== "まだメモはありません"} />}
        {view === "chat" && (
          <ChatView
            category={activeCat}
            messages={messages}
            onPick={pickAnswer}
            chatEndRef={chatEndRef}
            onBack={goHome}
          />
        )}
        {view === "result" && (
          <ResultView
            category={activeCat}
            answers={answers}
            suggestions={MOCK_SUGGESTIONS[activeCat.id]}
            onFeedback={giveFeedback}
            onBack={goHome}
          />
        )}
      </main>

      {view !== "home" && <MemoPanel profile={profile} />}

      <footer className="bs-footer">
        <div className="bs-footer-inner">
          <div className="bs-footer-brand">
            <div className="bs-brand-name" style={{ fontSize: 18 }}>ベネステ<span className="bs-brand-name-en">AI検索</span></div>
            <div style={{ fontSize: 12, color: "#7a8194", marginTop: 8 }}>
              福利厚生をAIがあなただけのために選び抜く
            </div>
          </div>
          <div className="bs-footer-cols">
            <div>
              <div className="bs-footer-head">サービス</div>
              <div className="bs-footer-link">機能紹介</div>
              <div className="bs-footer-link">料金プラン</div>
              <div className="bs-footer-link">よくある質問</div>
            </div>
            <div>
              <div className="bs-footer-head">サポート</div>
              <div className="bs-footer-link">お問い合わせ</div>
              <div className="bs-footer-link">ご利用ガイド</div>
              <div className="bs-footer-link">プライバシー</div>
            </div>
          </div>
        </div>
        <div className="bs-footer-base">
          © 2026 BENE-STATION AI SEARCH. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

// ============ ホーム画面 ============
function HomeView({ categories, onPick, hasMemo }) {
  return (
    <div className="bs-home fade-in">
      {/* HERO */}
      <section className="bs-hero">
        <div className="bs-hero-content">
          <div className="bs-hero-eyebrow">
            <span className="bs-line" /> AI WELFARE CONCIERGE
          </div>
          <h1 className="bs-hero-title">
            <span>あなたの福利厚生を、</span>
            <span>AIが選び抜く。</span>
          </h1>
          <p className="bs-hero-lead">
            140万件のメニューから、今日のあなたに本当に合う3件だけを。<br/>
            ベネ太郎が、あなたの好みを覚えながらサジェストします。
          </p>
          <div className="bs-hero-actions">
            <button className="bs-btn-primary" onClick={() => document.getElementById("categories").scrollIntoView({ behavior: "smooth" })}>
              カテゴリーから探す <span style={{ marginLeft: 6 }}>→</span>
            </button>
            <button className="bs-btn-secondary">
              使い方を見る
            </button>
          </div>
        </div>
        <div className="bs-hero-cat">
          <div className="bs-cat-stage">
            <div className="bs-cat-bg" />
            <BusaNyan size={340} />
            <div className="bs-speech">
              <div className="bs-speech-text">
                {hasMemo ? "…おかえり、何にする？" : "…仕方ない、選んでやるよ。"}
              </div>
            </div>
          </div>
          <div className="bs-cat-name">
            <div className="bs-cat-name-jp">ベネ太郎</div>
            <div className="bs-cat-name-en">Bene-Taro / AIキャラクター</div>
          </div>
        </div>
      </section>

      {/* スタッツ */}
      <section className="bs-stats">
        <div className="bs-stat">
          <div className="bs-stat-num">1.4<span className="bs-stat-unit">M+</span></div>
          <div className="bs-stat-label">掲載メニュー数</div>
        </div>
        <div className="bs-stat-divider" />
        <div className="bs-stat">
          <div className="bs-stat-num">8<span className="bs-stat-unit">.</span></div>
          <div className="bs-stat-label">カテゴリー</div>
        </div>
        <div className="bs-stat-divider" />
        <div className="bs-stat">
          <div className="bs-stat-num">3<span className="bs-stat-unit">問</span></div>
          <div className="bs-stat-label">最短ヒアリング</div>
        </div>
        <div className="bs-stat-divider" />
        <div className="bs-stat">
          <div className="bs-stat-num">∞<span className="bs-stat-unit">.</span></div>
          <div className="bs-stat-label">学習し続ける</div>
        </div>
      </section>

      {/* カテゴリー */}
      <section id="categories" className="bs-categories">
        <div className="bs-section-head">
          <div>
            <div className="bs-section-num">01 <span className="bs-section-line" /></div>
            <h2 className="bs-section-title">カテゴリーから探す</h2>
            <p className="bs-section-sub">気分やシチュエーションに合わせて、まずはカテゴリーを選んでください</p>
          </div>
        </div>

        <div className="bs-cat-grid">
          {categories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onPick(c)}
              className="bs-cat-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="bs-cat-card-inner">
                <div className="bs-cat-card-num">0{i + 1}</div>
                <div className="bs-cat-card-icon">{c.icon}</div>
                <div className="bs-cat-card-en">{c.en}</div>
                <h3 className="bs-cat-card-name">{c.name}</h3>
                <div className="bs-cat-card-arrow">
                  <span className="bs-arrow-line" />
                  <span>選ぶ</span>
                  <span>→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* どう使う？ */}
      <section className="bs-how">
        <div className="bs-section-head">
          <div>
            <div className="bs-section-num">02 <span className="bs-section-line" /></div>
            <h2 className="bs-section-title">使い方は、3ステップ。</h2>
            <p className="bs-section-sub">難しい操作はありません。ベネ太郎との会話だけで完結します</p>
          </div>
        </div>

        <div className="bs-how-steps">
          <div className="bs-step">
            <div className="bs-step-num">STEP / 01</div>
            <div className="bs-step-icon">①</div>
            <h3 className="bs-step-title">カテゴリーを選ぶ</h3>
            <p className="bs-step-text">旅行、グルメ、レジャーなど、気になるカテゴリーをひとつ選びます。</p>
          </div>
          <div className="bs-step">
            <div className="bs-step-num">STEP / 02</div>
            <div className="bs-step-icon">②</div>
            <h3 className="bs-step-title">3つの質問に答える</h3>
            <p className="bs-step-text">ベネ太郎からの質問に答えるだけ。ボタンを選ぶだけなので簡単です。</p>
          </div>
          <div className="bs-step">
            <div className="bs-step-num">STEP / 03</div>
            <div className="bs-step-icon">③</div>
            <h3 className="bs-step-title">結果を受け取る</h3>
            <p className="bs-step-text">あなたにマッチした3件のメニューを、推薦理由つきでお届けします。</p>
          </div>
        </div>
      </section>

      {/* 学習について */}
      <section className="bs-learn">
        <div className="bs-learn-cat">
          <BusaNyan size={200} />
        </div>
        <div className="bs-learn-text">
          <div className="bs-section-num" style={{ marginBottom: 8 }}>03 <span className="bs-section-line" /></div>
          <h2 className="bs-section-title">使うほど、賢くなる。</h2>
          <p className="bs-learn-lead">
            ベネ太郎は、あなたの選択や「いいね／微妙」のフィードバックを<br/>
            メモとして覚えていきます。次回以降のサジェスト精度が上がり、<br/>
            あなただけのコンシェルジュに育っていきます。
          </p>
          <div className="bs-learn-points">
            <div className="bs-learn-point">
              <div className="bs-learn-point-icon">✓</div>
              <div>会話の内容を構造化メモとして自動保存</div>
            </div>
            <div className="bs-learn-point">
              <div className="bs-learn-point-icon">✓</div>
              <div>フィードバックから好み傾向を自動分析</div>
            </div>
            <div className="bs-learn-point">
              <div className="bs-learn-point-icon">✓</div>
              <div>サジェストの除外条件・優先条件として反映</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ チャット画面 ============
function ChatView({ category, messages, onPick, chatEndRef, onBack }) {
  const lastBot = [...messages].reverse().find((m) => m.from === "bot" && m.opts);

  return (
    <div className="bs-chat-page fade-in">
      <div className="bs-page-head">
        <button className="bs-back-btn" onClick={onBack}>← 戻る</button>
        <div className="bs-breadcrumb">
          <span>ホーム</span>
          <span className="bs-crumb-sep">/</span>
          <span>カテゴリー</span>
          <span className="bs-crumb-sep">/</span>
          <span className="bs-crumb-current">{category.name}</span>
        </div>
      </div>

      <div className="bs-chat-head">
        <div>
          <div className="bs-section-num">{category.en}</div>
          <h2 className="bs-section-title" style={{ fontSize: 36 }}>{category.name}</h2>
        </div>
      </div>

      <div className="bs-chat-container">
        <aside className="bs-chat-side">
          <div className="bs-chat-cat">
            <BusaNyan size={180} />
          </div>
          <div className="bs-chat-name">ベネ太郎</div>
          <div className="bs-chat-status">
            <span className="bs-status-dot" />
            ヒアリング中
          </div>
          <p className="bs-chat-side-note">
            ボタンから選ぶだけ。<br/>
            だいたい3問で終わるから安心しろよ。
          </p>
        </aside>

        <div className="bs-chat-main">
          <div className="bs-chat-area">
            {messages.map((m, i) =>
              m.from === "bot" ? (
                <div key={i} className="bs-msg-row bot fade-in">
                  <div className="bs-msg-avatar">
                    <BusaNyan size={36} />
                  </div>
                  <div className="bs-msg-bubble bot">{m.text}</div>
                </div>
              ) : (
                <div key={i} className="bs-msg-row user fade-in">
                  <div className="bs-msg-bubble user">{m.text}</div>
                </div>
              )
            )}
            <div ref={chatEndRef} />
          </div>

          {lastBot && lastBot.opts && (
            <div className="bs-opt-wrap">
              {lastBot.opts.map((o, i) => (
                <button
                  key={o + i}
                  onClick={() => onPick(o)}
                  className="bs-opt-btn"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span className="bs-opt-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="bs-opt-text">{o}</span>
                  <span className="bs-opt-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ 結果画面 ============
function ResultView({ category, answers, suggestions, onFeedback, onBack }) {
  const [feedback, setFeedback] = useState({});

  const handle = (item, kind) => {
    setFeedback((f) => ({ ...f, [item.name]: kind }));
    onFeedback(item, kind);
  };

  return (
    <div className="bs-result-page fade-in">
      <div className="bs-page-head">
        <button className="bs-back-btn" onClick={onBack}>← 戻る</button>
        <div className="bs-breadcrumb">
          <span>ホーム</span>
          <span className="bs-crumb-sep">/</span>
          <span>{category.name}</span>
          <span className="bs-crumb-sep">/</span>
          <span className="bs-crumb-current">サジェスト結果</span>
        </div>
      </div>

      <div className="bs-result-head">
        <div className="bs-result-cat-mini">
          <BusaNyan size={120} />
        </div>
        <div>
          <div className="bs-section-num">CURATED FOR YOU</div>
          <h2 className="bs-result-title">あなたの今日にぴったりの3件</h2>
          <div className="bs-answer-summary">
            <span className="bs-answer-label">選んだ条件:</span>
            {answers.map((a, i) => (
              <span key={i} className="bs-answer-chip">{a}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bs-result-list">
        {suggestions.map((s, i) => (
          <article
            key={s.name}
            className="bs-result-card"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="bs-result-rank">
              <div className="bs-result-rank-num">0{i + 1}</div>
              <div className="bs-result-rank-label">RANK</div>
            </div>

            <div className="bs-result-body">
              <div className="bs-result-tag-row">
                <span className="bs-result-tag">{s.tag}</span>
                <div className="bs-result-match-mini">
                  <span className="bs-result-match-num">{s.match}</span>
                  <span className="bs-result-match-of">/100</span>
                  <span className="bs-result-match-label-mini">MATCH</span>
                </div>
              </div>
              <h3 className="bs-result-name">{s.name}</h3>
              <div className="bs-result-price">{s.price}</div>

              <div className="bs-result-bar">
                <div className="bs-result-bar-fill" style={{ width: `${s.match}%` }} />
              </div>

              <div className="bs-result-reason">
                <div className="bs-reason-label">ベネ太郎の推薦理由</div>
                <div className="bs-reason-text">{s.reason}</div>
              </div>

              <div className="bs-feedback-row">
                <button
                  onClick={() => handle(s, "like")}
                  className={`bs-fb-btn ${feedback[s.name] === "like" ? "active like" : ""}`}
                >
                  <span style={{ marginRight: 6 }}>♥</span> いいね
                </button>
                <button
                  onClick={() => handle(s, "dislike")}
                  className={`bs-fb-btn ${feedback[s.name] === "dislike" ? "active dislike" : ""}`}
                >
                  <span style={{ marginRight: 6 }}>×</span> 微妙
                </button>
                <button className="bs-detail-btn">
                  詳細を見る <span style={{ marginLeft: 6 }}>→</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="bs-learn-hint">
        <div className="bs-learn-hint-icon">📓</div>
        <div>
          <div className="bs-learn-hint-title">フィードバックは記憶されます</div>
          <div className="bs-learn-hint-text">「いいね／微妙」は右下のメモに反映され、次回以降のサジェスト精度向上に使われます。</div>
        </div>
      </div>
    </div>
  );
}

// ============ メモパネル ============
function MemoPanel({ profile }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={`bs-memo-toggle ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
        <span className="bs-memo-toggle-icon">📓</span>
        <span>ベネ太郎メモ</span>
      </button>
      <div className={`bs-memo-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <div className={`bs-memo-panel ${open ? "open" : ""}`}>
        <div className="bs-memo-head">
          <div>
            <div className="bs-memo-eyebrow">BENE-TARO MEMO</div>
            <div className="bs-memo-title">ベネ太郎の記録帳</div>
          </div>
          <button className="bs-memo-close" onClick={() => setOpen(false)}>×</button>
        </div>
        <p className="bs-memo-desc">
          会話やフィードバックから自動で更新されます。次回のサジェストで参照されます。
        </p>

        <div className="bs-memo-section">
          <div className="bs-memo-section-title">最近のメモ</div>
          {profile.notes.map((n, i) => (
            <div key={i} className="bs-memo-item">
              <span className="bs-memo-bullet" />
              <span>{n}</span>
            </div>
          ))}
        </div>

        {profile.likes.length > 0 && (
          <div className="bs-memo-section">
            <div className="bs-memo-section-title">気に入ったもの</div>
            <div className="bs-memo-tags">
              {profile.likes.map((l, i) => (
                <span key={i} className="bs-memo-tag like">♥ {l}</span>
              ))}
            </div>
          </div>
        )}

        {profile.dislikes.length > 0 && (
          <div className="bs-memo-section">
            <div className="bs-memo-section-title">好みじゃなかったもの</div>
            <div className="bs-memo-tags">
              {profile.dislikes.map((l, i) => (
                <span key={i} className="bs-memo-tag dislike">× {l}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ============ スタイル ============
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&family=Bodoni+Moda:wght@400;500;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.bs-app {
  font-family: 'Noto Sans JP', sans-serif;
  background: #FAFAF7;
  min-height: 100vh;
  color: #1F3A5F;
  -webkit-font-smoothing: antialiased;
}

button { font-family: inherit; }

/* === ヘッダー === */
.bs-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 48px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #E8E5DD;
}
.bs-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.bs-logo-mark { display: flex; align-items: center; }
.bs-brand-name {
  font-family: 'Shippori Mincho', serif;
  font-size: 20px;
  font-weight: 700;
  color: #1F3A5F;
  letter-spacing: 0.04em;
}
.bs-brand-name-en {
  font-family: 'Bodoni Moda', serif;
  font-weight: 500;
  color: #C49A4D;
  margin-left: 4px;
  font-style: italic;
}
.bs-brand-sub {
  font-family: 'Bodoni Moda', serif;
  font-size: 9px;
  letter-spacing: 0.3em;
  color: #7a8194;
  margin-top: 2px;
}
.bs-nav { display: flex; align-items: center; gap: 32px; }
.bs-nav-link {
  background: none;
  border: none;
  color: #1F3A5F;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  position: relative;
  padding: 4px 0;
}
.bs-nav-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: #C49A4D;
  transition: width 0.3s ease;
}
.bs-nav-link:hover::after { width: 100%; }
.bs-account-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1F3A5F;
  border: none;
  color: #fff;
  font-size: 12px;
  padding: 10px 18px;
  border-radius: 2px;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: background 0.2s;
}
.bs-account-btn:hover { background: #15294a; }
.bs-account-icon { font-size: 6px; color: #C49A4D; }

/* === メイン === */
.bs-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
}

/* === HERO === */
.bs-hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 80px 0 40px;
  min-height: 70vh;
}
.bs-hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Bodoni Moda', serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #C49A4D;
  margin-bottom: 32px;
}
.bs-line {
  display: inline-block;
  width: 40px;
  height: 1px;
  background: #C49A4D;
}
.bs-hero-title {
  font-family: 'Shippori Mincho', serif;
  font-size: 60px;
  line-height: 1.3;
  font-weight: 700;
  color: #1F3A5F;
  margin-bottom: 32px;
  letter-spacing: 0.02em;
}
.bs-hero-title span { display: block; }
.bs-hero-lead {
  font-size: 15px;
  line-height: 2;
  color: #4a5568;
  margin-bottom: 40px;
  max-width: 480px;
}
.bs-hero-actions { display: flex; gap: 14px; }
.bs-btn-primary {
  background: #1F3A5F;
  color: #fff;
  border: none;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.25s;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
}
.bs-btn-primary:hover { background: #15294a; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(31, 58, 95, 0.25); }
.bs-btn-secondary {
  background: transparent;
  color: #1F3A5F;
  border: 1px solid #1F3A5F;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.25s;
}
.bs-btn-secondary:hover { background: #1F3A5F; color: #fff; }

.bs-hero-cat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bs-cat-stage {
  position: relative;
  width: 420px;
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bs-cat-bg {
  position: absolute;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(196, 154, 77, 0.15) 0%, rgba(196, 154, 77, 0) 70%);
  border-radius: 50%;
  animation: bgPulse 4s ease-in-out infinite;
}
@keyframes bgPulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.08); opacity: 1; } }

.bs-speech {
  position: absolute;
  top: 30px;
  left: -10px;
  background: #fff;
  border: 1px solid #E8E5DD;
  padding: 14px 20px;
  border-radius: 20px 20px 4px 20px;
  font-family: 'Shippori Mincho', serif;
  font-size: 14px;
  font-weight: 600;
  color: #1F3A5F;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(31, 58, 95, 0.12);
  animation: speechFloat 4s ease-in-out infinite, speechIn 0.6s cubic-bezier(.34,1.56,.64,1) both 0.3s;
  white-space: nowrap;
}
@keyframes speechFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes speechIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

.bs-cat-name {
  margin-top: 12px;
  text-align: center;
}
.bs-cat-name-jp {
  font-family: 'Shippori Mincho', serif;
  font-size: 18px;
  font-weight: 700;
  color: #1F3A5F;
  letter-spacing: 0.1em;
}
.bs-cat-name-en {
  font-family: 'Bodoni Moda', serif;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: #7a8194;
  margin-top: 4px;
}

/* === キャラクターアニメ === */
.bn-shadow { animation: shadowPulse 4s ease-in-out infinite; }
@keyframes shadowPulse { 0%, 100% { transform: scaleX(1); opacity: 0.18; } 50% { transform: scaleX(0.88); opacity: 0.12; } }

.bn-body-group { animation: bodyFloat 4s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes bodyFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

.bn-tail { animation: tailWag 3s ease-in-out infinite; transform-origin: 235px 240px; }
@keyframes tailWag { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-6deg); } }

.bn-eye-left, .bn-eye-right { animation: blink 5s infinite; transform-origin: center; transform-box: fill-box; }
@keyframes blink {
  0%, 92%, 96%, 100% { transform: scaleY(1); }
  94% { transform: scaleY(0.1); }
}

/* === スタッツ === */
.bs-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 0;
  border-top: 1px solid #E8E5DD;
  border-bottom: 1px solid #E8E5DD;
  margin-bottom: 100px;
}
.bs-stat { text-align: center; flex: 1; }
.bs-stat-num {
  font-family: 'Bodoni Moda', serif;
  font-size: 48px;
  line-height: 1;
  color: #1F3A5F;
  font-weight: 500;
}
.bs-stat-unit {
  font-size: 24px;
  color: #C49A4D;
  margin-left: 2px;
}
.bs-stat-label {
  font-size: 11px;
  color: #7a8194;
  margin-top: 12px;
  letter-spacing: 0.15em;
}
.bs-stat-divider {
  width: 1px;
  height: 50px;
  background: #E8E5DD;
}

/* === セクションヘッド === */
.bs-section-head {
  margin-bottom: 60px;
}
.bs-section-num {
  font-family: 'Bodoni Moda', serif;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: #C49A4D;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.bs-section-line {
  display: inline-block;
  width: 60px;
  height: 1px;
  background: #C49A4D;
}
.bs-section-title {
  font-family: 'Shippori Mincho', serif;
  font-size: 42px;
  font-weight: 700;
  color: #1F3A5F;
  letter-spacing: 0.02em;
  line-height: 1.4;
  margin-bottom: 12px;
}
.bs-section-sub {
  font-size: 14px;
  color: #7a8194;
  letter-spacing: 0.05em;
}

/* === カテゴリーグリッド === */
.bs-categories { padding: 80px 0; }
.bs-cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.bs-cat-card {
  background: #fff;
  border: 1px solid #E8E5DD;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  padding: 0;
  border-radius: 2px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardSlideIn 0.5s ease both;
  overflow: hidden;
  position: relative;
}
@keyframes cardSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.bs-cat-card::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #C49A4D;
  transition: width 0.4s ease;
}
.bs-cat-card:hover { transform: translateY(-6px); box-shadow: 0 14px 36px rgba(31, 58, 95, 0.1); border-color: #1F3A5F; }
.bs-cat-card:hover::before { width: 100%; }

.bs-cat-card-inner {
  padding: 28px 24px 24px;
  position: relative;
  min-height: 200px;
}
.bs-cat-card-num {
  font-family: 'Bodoni Moda', serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #C49A4D;
  margin-bottom: 18px;
}
.bs-cat-card-icon {
  font-size: 32px;
  color: #1F3A5F;
  margin-bottom: 14px;
}
.bs-cat-card-en {
  font-family: 'Bodoni Moda', serif;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #7a8194;
  margin-bottom: 4px;
}
.bs-cat-card-name {
  font-family: 'Shippori Mincho', serif;
  font-size: 20px;
  font-weight: 700;
  color: #1F3A5F;
  margin-bottom: 24px;
}
.bs-cat-card-arrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #1F3A5F;
  letter-spacing: 0.1em;
  font-weight: 500;
}
.bs-arrow-line {
  display: inline-block;
  width: 24px;
  height: 1px;
  background: #1F3A5F;
  transition: width 0.3s;
}
.bs-cat-card:hover .bs-arrow-line { width: 40px; background: #C49A4D; }

/* === 使い方 === */
.bs-how { padding: 80px 0; }
.bs-how-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.bs-step {
  background: #fff;
  border: 1px solid #E8E5DD;
  padding: 36px 32px;
  border-radius: 2px;
  position: relative;
}
.bs-step-num {
  font-family: 'Bodoni Moda', serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #C49A4D;
  margin-bottom: 20px;
}
.bs-step-icon {
  font-family: 'Shippori Mincho', serif;
  font-size: 56px;
  color: #1F3A5F;
  margin-bottom: 16px;
  line-height: 1;
}
.bs-step-title {
  font-family: 'Shippori Mincho', serif;
  font-size: 22px;
  color: #1F3A5F;
  margin-bottom: 12px;
}
.bs-step-text {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.9;
}

/* === 学習セクション === */
.bs-learn {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 60px;
  align-items: center;
  padding: 80px 60px;
  background: linear-gradient(135deg, #1F3A5F 0%, #2a4a78 100%);
  border-radius: 4px;
  margin-bottom: 100px;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.bs-learn::before {
  content: "";
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(196, 154, 77, 0.2) 0%, transparent 70%);
}
.bs-learn-cat {
  background: #FAFAF7;
  border-radius: 50%;
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}
.bs-learn-text { position: relative; z-index: 2; }
.bs-learn-text .bs-section-num { color: #C49A4D; }
.bs-learn-text .bs-section-line { background: #C49A4D; }
.bs-learn-text .bs-section-title { color: #fff; }
.bs-learn-lead {
  font-size: 14px;
  line-height: 2;
  color: rgba(255,255,255,0.85);
  margin: 24px 0 32px;
}
.bs-learn-points { display: flex; flex-direction: column; gap: 14px; }
.bs-learn-point {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: rgba(255,255,255,0.95);
}
.bs-learn-point-icon {
  width: 26px;
  height: 26px;
  background: #C49A4D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1F3A5F;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

/* === ページヘッド（チャット/結果共通） === */
.bs-page-head {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 32px;
  margin-bottom: 40px;
}
.bs-back-btn {
  background: transparent;
  border: 1px solid #E8E5DD;
  color: #1F3A5F;
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
}
.bs-back-btn:hover { background: #1F3A5F; color: #fff; border-color: #1F3A5F; }
.bs-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #7a8194;
}
.bs-crumb-sep { color: #C49A4D; }
.bs-crumb-current { color: #1F3A5F; font-weight: 500; }

/* === チャット === */
.bs-chat-head {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #E8E5DD;
}
.bs-chat-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  align-items: start;
  margin-bottom: 80px;
}
.bs-chat-side {
  position: sticky;
  top: 100px;
  background: #fff;
  border: 1px solid #E8E5DD;
  padding: 28px 20px;
  border-radius: 2px;
  text-align: center;
}
.bs-chat-cat { display: flex; justify-content: center; margin-bottom: 12px; }
.bs-chat-name {
  font-family: 'Shippori Mincho', serif;
  font-size: 18px;
  font-weight: 700;
  color: #1F3A5F;
  margin-bottom: 8px;
}
.bs-chat-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #7a8194;
  letter-spacing: 0.1em;
  padding: 4px 12px;
  background: #FAFAF7;
  border-radius: 100px;
  margin-bottom: 18px;
}
.bs-status-dot {
  width: 6px;
  height: 6px;
  background: #4a9d6a;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.bs-chat-side-note {
  font-size: 12px;
  line-height: 1.9;
  color: #4a5568;
  padding-top: 16px;
  border-top: 1px solid #E8E5DD;
}

.bs-chat-area {
  background: #fff;
  border: 1px solid #E8E5DD;
  padding: 28px;
  border-radius: 2px;
  min-height: 360px;
  max-height: 480px;
  overflow-y: auto;
  margin-bottom: 20px;
}
.bs-chat-area::-webkit-scrollbar { width: 4px; }
.bs-chat-area::-webkit-scrollbar-thumb { background: #E8E5DD; border-radius: 2px; }

.bs-msg-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.bs-msg-row.bot { justify-content: flex-start; }
.bs-msg-row.user { justify-content: flex-end; }
.bs-msg-avatar {
  width: 40px;
  height: 40px;
  background: #FAFAF7;
  border: 1px solid #E8E5DD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.bs-msg-avatar svg { transform: scale(1.3) translateY(2px); }

.bs-msg-bubble {
  max-width: 75%;
  padding: 14px 20px;
  font-size: 14px;
  line-height: 1.8;
  border-radius: 4px;
}
.bs-msg-bubble.bot {
  background: #FAFAF7;
  color: #1F3A5F;
  border: 1px solid #E8E5DD;
  border-radius: 4px 16px 16px 16px;
}
.bs-msg-bubble.user {
  background: #1F3A5F;
  color: #fff;
  border-radius: 16px 4px 16px 16px;
}

.bs-opt-wrap {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.bs-opt-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #E8E5DD;
  color: #1F3A5F;
  padding: 18px 22px;
  border-radius: 2px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.25s;
  animation: cardSlideIn 0.4s ease both;
}
.bs-opt-btn:hover {
  background: #1F3A5F;
  color: #fff;
  border-color: #1F3A5F;
  transform: translateX(4px);
}
.bs-opt-btn:hover .bs-opt-num { color: #C49A4D; }
.bs-opt-btn:hover .bs-opt-arrow { transform: translateX(6px); }
.bs-opt-num {
  font-family: 'Bodoni Moda', serif;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: #C49A4D;
  transition: color 0.25s;
}
.bs-opt-text { flex: 1; font-weight: 500; }
.bs-opt-arrow { transition: transform 0.25s; }

/* === 結果ページ === */
.bs-result-head {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 32px;
  align-items: center;
  padding: 32px;
  background: #fff;
  border: 1px solid #E8E5DD;
  border-radius: 2px;
  margin-bottom: 40px;
}
.bs-result-cat-mini {
  width: 140px;
  height: 140px;
  background: #FAFAF7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bs-result-title {
  font-family: 'Shippori Mincho', serif;
  font-size: 36px;
  font-weight: 700;
  color: #1F3A5F;
  margin: 8px 0 16px;
}
.bs-answer-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.bs-answer-label {
  font-size: 11px;
  color: #7a8194;
  margin-right: 4px;
  letter-spacing: 0.1em;
}
.bs-answer-chip {
  font-size: 11px;
  padding: 5px 12px;
  background: #FAFAF7;
  border: 1px solid #E8E5DD;
  border-radius: 2px;
  color: #1F3A5F;
}

.bs-result-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 60px;
}
.bs-result-card {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 32px;
  background: #fff;
  border: 1px solid #E8E5DD;
  border-radius: 2px;
  padding: 32px;
  animation: cardSlideIn 0.5s ease both;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.bs-result-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #C49A4D;
  opacity: 0;
  transition: opacity 0.3s;
}
.bs-result-card:hover { box-shadow: 0 14px 36px rgba(31, 58, 95, 0.08); }
.bs-result-card:hover::before { opacity: 1; }

.bs-result-rank { text-align: center; }
.bs-result-rank-num {
  font-family: 'Bodoni Moda', serif;
  font-size: 64px;
  line-height: 1;
  color: #1F3A5F;
  font-style: italic;
  font-weight: 500;
}
.bs-result-rank-label {
  font-family: 'Bodoni Moda', serif;
  font-size: 10px;
  letter-spacing: 0.4em;
  color: #C49A4D;
  margin-top: 8px;
}

.bs-result-tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.bs-result-tag {
  display: inline-block;
  font-size: 10px;
  padding: 5px 12px;
  background: #1F3A5F;
  color: #fff;
  border-radius: 2px;
  letter-spacing: 0.15em;
}
.bs-result-match-mini { display: flex; align-items: baseline; gap: 4px; }
.bs-result-match-num {
  font-family: 'Bodoni Moda', serif;
  font-size: 28px;
  color: #C49A4D;
  font-weight: 700;
  line-height: 1;
}
.bs-result-match-of {
  font-size: 12px;
  color: #7a8194;
}
.bs-result-match-label-mini {
  font-family: 'Bodoni Moda', serif;
  font-size: 9px;
  letter-spacing: 0.3em;
  color: #7a8194;
  margin-left: 8px;
}

.bs-result-name {
  font-family: 'Shippori Mincho', serif;
  font-size: 24px;
  font-weight: 700;
  color: #1F3A5F;
  margin-bottom: 8px;
}
.bs-result-price {
  font-family: 'Bodoni Moda', serif;
  font-size: 16px;
  color: #C49A4D;
  margin-bottom: 16px;
  letter-spacing: 0.03em;
}
.bs-result-bar {
  height: 3px;
  background: #E8E5DD;
  border-radius: 2px;
  margin-bottom: 18px;
  overflow: hidden;
}
.bs-result-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #C49A4D, #1F3A5F);
  border-radius: 2px;
  transition: width 1s ease-out;
}
.bs-result-reason {
  background: #FAFAF7;
  border-left: 3px solid #C49A4D;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.bs-reason-label {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #C49A4D;
  font-weight: 700;
  margin-bottom: 6px;
}
.bs-reason-text {
  font-size: 13px;
  color: #1F3A5F;
  line-height: 1.8;
}

.bs-feedback-row { display: flex; align-items: center; gap: 10px; }
.bs-fb-btn {
  background: #fff;
  border: 1px solid #E8E5DD;
  color: #4a5568;
  padding: 9px 18px;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.bs-fb-btn:hover { border-color: #1F3A5F; }
.bs-fb-btn.active.like {
  background: #4a9d6a;
  border-color: #4a9d6a;
  color: #fff;
}
.bs-fb-btn.active.dislike {
  background: #b85c5c;
  border-color: #b85c5c;
  color: #fff;
}
.bs-detail-btn {
  margin-left: auto;
  background: #1F3A5F;
  border: none;
  color: #fff;
  padding: 11px 24px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.bs-detail-btn:hover { background: #15294a; transform: translateY(-1px); }

.bs-learn-hint {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #FAFAF7, #fff);
  border: 1px solid #E8E5DD;
  border-radius: 2px;
  margin-bottom: 80px;
}
.bs-learn-hint-icon { font-size: 28px; }
.bs-learn-hint-title {
  font-family: 'Shippori Mincho', serif;
  font-size: 16px;
  color: #1F3A5F;
  font-weight: 700;
  margin-bottom: 4px;
}
.bs-learn-hint-text {
  font-size: 12px;
  color: #4a5568;
  line-height: 1.7;
}

/* === メモパネル === */
.bs-memo-toggle {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 200;
  background: #1F3A5F;
  color: #fff;
  border: none;
  padding: 14px 22px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 14px 30px rgba(31, 58, 95, 0.3);
  transition: all 0.25s;
}
.bs-memo-toggle:hover { transform: translateY(-2px); }
.bs-memo-toggle.open { background: #C49A4D; }
.bs-memo-toggle-icon { font-size: 16px; }

.bs-memo-overlay {
  position: fixed;
  inset: 0;
  background: rgba(31, 58, 95, 0.4);
  backdrop-filter: blur(4px);
  z-index: 150;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
.bs-memo-overlay.open { opacity: 1; pointer-events: auto; }

.bs-memo-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: #fff;
  z-index: 160;
  padding: 36px 32px;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
  overflow-y: auto;
  border-left: 1px solid #E8E5DD;
}
.bs-memo-panel.open { transform: translateX(0); }
.bs-memo-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid #E8E5DD;
  margin-bottom: 20px;
}
.bs-memo-eyebrow {
  font-family: 'Bodoni Moda', serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #C49A4D;
  margin-bottom: 6px;
}
.bs-memo-title {
  font-family: 'Shippori Mincho', serif;
  font-size: 22px;
  font-weight: 700;
  color: #1F3A5F;
}
.bs-memo-close {
  background: none;
  border: none;
  color: #7a8194;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}
.bs-memo-desc {
  font-size: 12px;
  color: #7a8194;
  line-height: 1.8;
  margin-bottom: 28px;
}
.bs-memo-section { margin-bottom: 28px; }
.bs-memo-section-title {
  font-family: 'Bodoni Moda', serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #C49A4D;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E8E5DD;
  text-transform: uppercase;
}
.bs-memo-item {
  display: flex;
  gap: 12px;
  font-size: 13px;
  line-height: 1.8;
  color: #1F3A5F;
  padding: 8px 0;
}
.bs-memo-bullet {
  width: 4px;
  height: 4px;
  background: #C49A4D;
  border-radius: 50%;
  margin-top: 9px;
  flex-shrink: 0;
}
.bs-memo-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.bs-memo-tag {
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 2px;
  letter-spacing: 0.05em;
}
.bs-memo-tag.like {
  background: #e8f5ed;
  color: #2a6e44;
  border: 1px solid #c5e0d0;
}
.bs-memo-tag.dislike {
  background: #f5e8e8;
  color: #8a3c3c;
  border: 1px solid #e0c5c5;
}

/* === フッター === */
.bs-footer {
  background: #fff;
  border-top: 1px solid #E8E5DD;
  margin-top: 80px;
}
.bs-footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px 48px 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 60px;
}
.bs-footer-cols { display: flex; gap: 60px; }
.bs-footer-head {
  font-family: 'Bodoni Moda', serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #C49A4D;
  margin-bottom: 16px;
}
.bs-footer-link {
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.2s;
}
.bs-footer-link:hover { color: #1F3A5F; }
.bs-footer-base {
  border-top: 1px solid #E8E5DD;
  padding: 20px 48px;
  text-align: center;
  font-size: 11px;
  color: #7a8194;
  letter-spacing: 0.1em;
}

/* === ユーティリティ === */
.fade-in { animation: fadeIn 0.5s ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* === レスポンシブ === */
@media (max-width: 1024px) {
  .bs-hero { grid-template-columns: 1fr; }
  .bs-cat-grid { grid-template-columns: repeat(2, 1fr); }
  .bs-chat-container { grid-template-columns: 1fr; }
  .bs-chat-side { display: none; }
  .bs-how-steps { grid-template-columns: 1fr; }
  .bs-learn { grid-template-columns: 1fr; padding: 40px; }
  .bs-stats { flex-wrap: wrap; gap: 20px; }
  .bs-stat-divider { display: none; }
  .bs-hero-title { font-size: 40px; }
  .bs-section-title { font-size: 30px; }
  .bs-main { padding: 0 24px; }
  .bs-header { padding: 14px 24px; }
  .bs-nav { gap: 16px; }
  .bs-result-head { grid-template-columns: 1fr; }
  .bs-result-cat-mini { margin: 0 auto; }
  .bs-footer-inner { grid-template-columns: 1fr; padding: 40px 24px; }
}
`;
