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
      <ellipse cx="160" cy="328" rx="85" ry="6" fill="rgba(0, 63, 142, 0.18)" className="bn-shadow" />

      {/* 全体グループ */}
      <g className="bn-body-group">

        {/* バブル（背景） */}
        <circle cx="55" cy="80" r="7" fill="none" stroke="#7BA8D6" strokeWidth="2" opacity="0.55" className="bn-bubble-1" />
        <circle cx="42" cy="125" r="4" fill="none" stroke="#7BA8D6" strokeWidth="1.5" opacity="0.45" className="bn-bubble-2" />
        <circle cx="270" cy="95" r="6" fill="none" stroke="#7BA8D6" strokeWidth="2" opacity="0.55" className="bn-bubble-3" />
        <circle cx="282" cy="155" r="3" fill="none" stroke="#7BA8D6" strokeWidth="1.5" opacity="0.5" className="bn-bubble-4" />

        {/* 尾びれ（体の下から覗く） */}
        <path d="M 130 270 L 95 318 L 225 318 L 190 270 Z" fill="#003F8E" />
        <path d="M 138 285 L 130 312" stroke="#002A6E" strokeWidth="1.8" />
        <path d="M 160 290 L 160 314" stroke="#002A6E" strokeWidth="1.8" />
        <path d="M 182 285 L 190 312" stroke="#002A6E" strokeWidth="1.8" />

        {/* 背びれ（頭頂） */}
        <path d="M 138 76 Q 162 28 200 80 Q 175 88 138 76 Z" fill="#1A5CB0" />
        <path d="M 148 70 Q 165 50 180 70" stroke="#003F8E" strokeWidth="1.5" fill="none" />

        {/* 横びれ - 左 */}
        <g className="bn-fin-l">
          <ellipse cx="46" cy="200" rx="32" ry="17" fill="#1A5CB0" transform="rotate(-25 46 200)" />
          <ellipse cx="46" cy="197" rx="22" ry="11" fill="#3A7BC8" transform="rotate(-25 46 197)" />
        </g>

        {/* 横びれ - 右 */}
        <g className="bn-fin-r">
          <ellipse cx="274" cy="200" rx="32" ry="17" fill="#1A5CB0" transform="rotate(25 274 200)" />
          <ellipse cx="274" cy="197" rx="22" ry="11" fill="#3A7BC8" transform="rotate(25 274 197)" />
        </g>

        {/* 体本体（丸っこい青） */}
        <ellipse cx="160" cy="170" rx="115" ry="93" fill="#003F8E" />

        {/* 頭頂のハイライト（艶） */}
        <ellipse cx="160" cy="100" rx="78" ry="16" fill="#1A5CB0" opacity="0.55" />

        {/* お腹（クリーム色） */}
        <ellipse cx="160" cy="200" rx="78" ry="50" fill="#FAF3E8" />

        {/* お腹とボディの境目（ほんのり） */}
        <ellipse cx="160" cy="200" rx="78" ry="50" fill="none" stroke="#7BA8D6" strokeWidth="1.5" opacity="0.4" />

        {/* ピンクほっぺ（おっきめ） */}
        <ellipse className="bn-cheek-l" cx="100" cy="180" rx="20" ry="12" fill="#F4A8A0" opacity="0.7" />
        <ellipse className="bn-cheek-r" cx="220" cy="180" rx="20" ry="12" fill="#F4A8A0" opacity="0.7" />

        {/* 重め眉ライン（こにくらしさ） */}
        <path d="M 110 142 Q 130 134 150 142" stroke="#001a3d" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M 170 142 Q 190 134 210 142" stroke="#001a3d" strokeWidth="4.5" fill="none" strokeLinecap="round" />

        {/* 目 - 左（ジト目） */}
        <g className="bn-eye-left">
          {/* 白目 */}
          <ellipse cx="130" cy="160" rx="14" ry="11" fill="#FAF3E8" />
          {/* 黒目 */}
          <ellipse cx="130" cy="163" rx="6.5" ry="6" fill="#001a3d" />
          {/* ハイライト */}
          <circle cx="133" cy="159" r="2.5" fill="#FAF3E8" />
          {/* 上まぶた（重い） */}
          <path d="M 116 152 Q 130 154 144 152" stroke="#001a3d" strokeWidth="3.5" fill="#001a3d" strokeLinecap="round" />
        </g>

        {/* 目 - 右 */}
        <g className="bn-eye-right">
          <ellipse cx="190" cy="160" rx="14" ry="11" fill="#FAF3E8" />
          <ellipse cx="190" cy="163" rx="6.5" ry="6" fill="#001a3d" />
          <circle cx="193" cy="159" r="2.5" fill="#FAF3E8" />
          <path d="M 176 152 Q 190 154 204 152" stroke="#001a3d" strokeWidth="3.5" fill="#001a3d" strokeLinecap="round" />
        </g>

        {/* 口（小さなしかめ口） */}
        <path d="M 148 212 Q 160 206 172 212" stroke="#001a3d" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 156 213 Q 160 215 164 213" stroke="#001a3d" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* キラキラ装飾 */}
        <text x="40" y="240" fontSize="13" fill="#7BA8D6" opacity="0.7" className="bn-sparkle-1">✦</text>
        <text x="278" y="225" fontSize="11" fill="#F4A8A0" opacity="0.7" className="bn-sparkle-2">✦</text>

      </g>
    </svg>
  );
}

// ============ ベネ吉（白い子犬の相棒キャラ）SVG ============
function BeneKichi({ size = 240 }) {
  return (
    <svg
      viewBox="0 0 320 340"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* 影 */}
      <ellipse cx="160" cy="328" rx="92" ry="6" fill="rgba(0, 26, 61, 0.15)" className="bk-shadow" />

      {/* 全体グループ */}
      <g className="bk-body-group">

        {/* 周辺キラキラ */}
        <text x="46" y="148" fontSize="13" fill="#1A5CB0" opacity="0.6" className="bk-sparkle-1">✦</text>
        <text x="270" y="170" fontSize="11" fill="#F4A8A0" opacity="0.7" className="bk-sparkle-2">✦</text>
        <text x="265" y="100" fontSize="10" fill="#003F8E" opacity="0.5" className="bk-sparkle-3">✦</text>

        {/* くるんとしたしっぽ */}
        <path
          d="M 230 232 Q 268 218 272 192 Q 272 174 255 178 Q 246 184 252 196"
          fill="#FAF3E8"
          stroke="#001a3d"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="bk-tail"
        />

        {/* 体 */}
        <ellipse cx="160" cy="240" rx="72" ry="56" fill="#FAF3E8" stroke="#001a3d" strokeWidth="2.5" />
        <ellipse cx="160" cy="252" rx="44" ry="36" fill="#F5EBD8" />

        {/* 後ろ足 */}
        <ellipse cx="128" cy="295" rx="17" ry="10" fill="#FAF3E8" stroke="#001a3d" strokeWidth="2" />
        <ellipse cx="192" cy="295" rx="17" ry="10" fill="#FAF3E8" stroke="#001a3d" strokeWidth="2" />
        <ellipse cx="128" cy="297" rx="8" ry="3.5" fill="#F4A8A0" />
        <ellipse cx="192" cy="297" rx="8" ry="3.5" fill="#F4A8A0" />

        {/* 紺バンダナ */}
        <path d="M 108 195 Q 160 184 212 195 L 200 220 L 120 220 Z"
              fill="#003F8E" stroke="#001a3d" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 150 220 L 144 244 L 158 234 Z" fill="#003F8E" stroke="#001a3d" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 170 220 L 176 244 L 162 234 Z" fill="#003F8E" stroke="#001a3d" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="138" cy="200" r="2.2" fill="#FAF3E8" opacity="0.85" />
        <circle cx="182" cy="200" r="2.2" fill="#FAF3E8" opacity="0.85" />
        <circle cx="160" cy="208" r="2.2" fill="#FAF3E8" opacity="0.85" />

        {/* 頭 */}
        <circle cx="160" cy="120" r="92" fill="#FAF3E8" stroke="#001a3d" strokeWidth="2.5" />

        {/* 左耳（折れ三角） */}
        <g className="bk-ear-l">
          <path d="M 92 88 Q 68 28 108 32 Q 135 54 132 108 Z"
                fill="#5C6F8E" stroke="#001a3d" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 102 88 Q 92 56 112 46 Q 126 60 124 95 Z" fill="#7E8FAA" opacity="0.55" />
        </g>

        {/* 右耳 */}
        <g className="bk-ear-r">
          <path d="M 228 88 Q 252 28 212 32 Q 185 54 188 108 Z"
                fill="#5C6F8E" stroke="#001a3d" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 218 88 Q 228 56 208 46 Q 194 60 196 95 Z" fill="#7E8FAA" opacity="0.55" />
        </g>

        {/* ピンクほっぺ */}
        <ellipse className="bk-cheek-l" cx="108" cy="152" rx="19" ry="11" fill="#F4A8A0" opacity="0.7" />
        <ellipse className="bk-cheek-r" cx="212" cy="152" rx="19" ry="11" fill="#F4A8A0" opacity="0.7" />

        {/* 優しい眉 */}
        <path d="M 122 102 Q 135 96 148 102" stroke="#001a3d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 172 102 Q 185 96 198 102" stroke="#001a3d" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* 大きな丸い目（キラキラ） */}
        <g className="bk-eye-left">
          <ellipse cx="135" cy="125" rx="11" ry="13" fill="#001a3d" />
          <circle cx="139" cy="120" r="4" fill="#FAF3E8" />
          <circle cx="131" cy="130" r="2" fill="#FAF3E8" opacity="0.7" />
        </g>
        <g className="bk-eye-right">
          <ellipse cx="185" cy="125" rx="11" ry="13" fill="#001a3d" />
          <circle cx="189" cy="120" r="4" fill="#FAF3E8" />
          <circle cx="181" cy="130" r="2" fill="#FAF3E8" opacity="0.7" />
        </g>

        {/* ピンクのハート鼻 */}
        <path d="M 153 154 Q 148 148 153 144 Q 160 142 160 150 Q 160 142 167 144 Q 172 148 167 154 L 160 162 Z"
              fill="#E89898" stroke="#001a3d" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M 160 162 L 160 167" stroke="#001a3d" strokeWidth="1.5" strokeLinecap="round" />

        {/* 笑顔の口・小さな舌 */}
        <path d="M 147 170 Q 153 178 160 175 Q 167 178 173 170"
              stroke="#001a3d" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="160" cy="174" rx="5" ry="3.5" fill="#F4A8A0" />
        <path d="M 160 172 L 160 177" stroke="#E89898" strokeWidth="0.8" />

      </g>
    </svg>
  );
}

// ============ ベネ丸（侍猫キャラ）SVG ============
function BeneMaru({ size = 240 }) {
  return (
    <svg
      viewBox="0 0 320 340"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* 影 */}
      <ellipse cx="160" cy="328" rx="82" ry="6" fill="rgba(0, 26, 61, 0.16)" className="bm-shadow" />

      {/* 全体グループ */}
      <g className="bm-body-group">

        {/* 周辺キラキラ */}
        <text x="50" y="148" fontSize="13" fill="#C73E2E" opacity="0.55" className="bm-sparkle-1">✦</text>
        <text x="270" y="172" fontSize="11" fill="#1A5CB0" opacity="0.65" className="bm-sparkle-2">✦</text>

        {/* くるんとした猫しっぽ */}
        <path
          d="M 230 232 Q 270 218 268 188 Q 264 168 248 175"
          fill="#9CA8B8"
          stroke="#001a3d"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="bm-tail"
        />

        {/* 体（座り姿勢） */}
        <ellipse cx="160" cy="245" rx="68" ry="55" fill="#9CA8B8" stroke="#001a3d" strokeWidth="2.5" />
        <ellipse cx="160" cy="262" rx="42" ry="32" fill="#FAF3E8" />

        {/* 袴・羽織（紺地に家紋） */}
        <path d="M 105 245 L 118 295 L 202 295 L 215 245 Z"
              fill="#003F8E" stroke="#001a3d" strokeWidth="2" strokeLinejoin="round" />
        <line x1="160" y1="247" x2="160" y2="295" stroke="#001a3d" strokeWidth="1.5" />
        {/* 家紋 */}
        <circle cx="160" cy="270" r="9" fill="#FAF3E8" stroke="#001a3d" strokeWidth="1.5" />
        <text x="160" y="274" textAnchor="middle" fontSize="10" fill="#003F8E" fontWeight="700">武</text>

        {/* 前足 */}
        <ellipse cx="132" cy="298" rx="14" ry="9" fill="#9CA8B8" stroke="#001a3d" strokeWidth="2" />
        <ellipse cx="188" cy="298" rx="14" ry="9" fill="#9CA8B8" stroke="#001a3d" strokeWidth="2" />
        <ellipse cx="132" cy="297" rx="9" ry="5" fill="#FAF3E8" />
        <ellipse cx="188" cy="297" rx="9" ry="5" fill="#FAF3E8" />

        {/* 刀（鞘ごと脇に） */}
        <g className="bm-katana">
          <line x1="56" y1="225" x2="105" y2="275" stroke="#001a3d" strokeWidth="4" strokeLinecap="round" />
          <rect x="48" y="220" width="16" height="8" rx="2" fill="#001a3d" />
          <line x1="56" y1="223" x2="62" y2="223" stroke="#FAF3E8" strokeWidth="1.2" />
        </g>

        {/* 頭 */}
        <circle cx="160" cy="130" r="92" fill="#9CA8B8" stroke="#001a3d" strokeWidth="2.5" />

        {/* キジトラ模様 */}
        <path d="M 132 65 Q 135 80 130 95" stroke="#5C6F8E" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M 162 56 Q 162 75 158 92" stroke="#5C6F8E" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M 192 65 Q 188 80 192 95" stroke="#5C6F8E" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />

        {/* 猫耳 */}
        <path d="M 80 78 L 90 28 L 132 82 Z" fill="#9CA8B8" stroke="#001a3d" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 240 78 L 230 28 L 188 82 Z" fill="#9CA8B8" stroke="#001a3d" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 92 73 L 98 50 L 116 78 Z" fill="#F4A8A0" opacity="0.55" />
        <path d="M 228 73 L 222 50 L 204 78 Z" fill="#F4A8A0" opacity="0.55" />

        {/* 鉢巻（赤・日の丸） */}
        <g className="bm-hachimaki">
          <path d="M 78 105 Q 160 92 242 105 L 242 122 Q 160 110 78 122 Z"
                fill="#C73E2E" stroke="#001a3d" strokeWidth="2" />
          {/* 結び目の片端 */}
          <path d="M 240 110 L 282 92 L 282 128 L 240 122 Z"
                fill="#C73E2E" stroke="#001a3d" strokeWidth="2" strokeLinejoin="round"
                className="bm-headband-tail" />
          {/* 日の丸 */}
          <circle cx="160" cy="113" r="7" fill="#FAF3E8" stroke="#C73E2E" strokeWidth="2" />
          <circle cx="160" cy="113" r="3.5" fill="#C73E2E" />
        </g>

        {/* ほっぺ（控えめ・凛々しさのため） */}
        <ellipse cx="100" cy="160" rx="14" ry="9" fill="#F4A8A0" opacity="0.5" />
        <ellipse cx="220" cy="160" rx="14" ry="9" fill="#F4A8A0" opacity="0.5" />

        {/* シャープな眉（決意の表情） */}
        <path d="M 110 140 Q 128 134 148 142" stroke="#001a3d" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 210 140 Q 192 134 172 142" stroke="#001a3d" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* 目（凛とした集中眼差し） */}
        <g className="bm-eye-left">
          <ellipse cx="128" cy="156" rx="9" ry="8" fill="#001a3d" />
          <circle cx="131" cy="153" r="2.5" fill="#FAF3E8" />
        </g>
        <g className="bm-eye-right">
          <ellipse cx="192" cy="156" rx="9" ry="8" fill="#001a3d" />
          <circle cx="195" cy="153" r="2.5" fill="#FAF3E8" />
        </g>

        {/* 鼻 */}
        <path d="M 153 178 L 167 178 L 160 186 Z" fill="#001a3d" />

        {/* 凛々しい口（小さく結ぶ） */}
        <path d="M 160 186 L 160 192" stroke="#001a3d" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 152 196 Q 160 192 168 196" stroke="#001a3d" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* ひげ */}
        <line x1="58" y1="173" x2="92" y2="175" stroke="#001a3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="58" y1="183" x2="92" y2="182" stroke="#001a3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="262" y1="173" x2="228" y2="175" stroke="#001a3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="262" y1="183" x2="228" y2="182" stroke="#001a3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

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
  const [insights, setInsights] = useState(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [memoOpen, setMemoOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Claudeが解析した insights.json を起動時に取得
  useEffect(() => {
    fetch("/data/insights.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setInsights(data); })
      .catch(() => { /* 解析データなし時は無視 */ });
  }, []);

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
            <svg viewBox="0 0 40 40" width="34" height="34">
              <rect x="0" y="0" width="40" height="40" rx="6" fill="#003F8E" />
              <path d="M 12 11 L 12 29 L 22 29 Q 28 29 28 24 Q 28 21 25 20 Q 27 19 27 16 Q 27 11 22 11 Z M 16 14 L 21 14 Q 23 14 23 16 Q 23 18 21 18 L 16 18 Z M 16 22 L 22 22 Q 24 22 24 24 Q 24 26 22 26 L 16 26 Z" fill="#fff" />
            </svg>
          </div>
          <div className="bs-brand-text">
            <div className="bs-brand-name">ベネステ<span className="bs-brand-name-en">AI検索</span></div>
            <div className="bs-brand-sub">YOUR PERSONAL AI AGENT</div>
          </div>
        </div>
        <div className="bs-header-right">
          <div className="bs-status-pill">
            <span className="bs-status-dot-live" />
            <span className="bs-status-text">ベネステ接続中</span>
            <span className="bs-status-count">{insights?.profile?.recentBehavior ? "解析済み" : "未解析"}</span>
          </div>
          <nav className="bs-nav">
            <button className="bs-nav-link" onClick={goHome}>ホーム</button>
            <button className="bs-nav-link" onClick={() => setSyncOpen(true)}>データ同期</button>
            <button className="bs-nav-link" onClick={() => setMemoOpen(true)}>メモ</button>
            <button className="bs-account-btn">
              <span className="bs-account-icon">●</span>
              ゲストさん
            </button>
          </nav>
        </div>
      </header>

      <main className="bs-main">
        {view === "home" && <HomeView categories={CATEGORIES} onPick={startCategory} hasMemo={profile.notes[0] !== "まだメモはありません"} insights={insights} />}
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
            suggestions={insights?.suggestions?.[activeCat.id] || MOCK_SUGGESTIONS[activeCat.id]}
            onFeedback={giveFeedback}
            onBack={goHome}
            insights={insights}
          />
        )}
      </main>

      <SyncPanel open={syncOpen} onClose={() => setSyncOpen(false)} insights={insights} />
      <MemoPanel profile={profile} open={memoOpen} onClose={() => setMemoOpen(false)} />

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
function HomeView({ categories, onPick, hasMemo, insights }) {
  const taroComment = insights?.comments?.beneTaro;
  const kichiComment = insights?.comments?.beneKichi;
  const maruComment = insights?.comments?.beneMaru;
  const recentBehavior = insights?.profile?.recentBehavior;

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
            ベネ太郎たちが、あなたの好みを覚えながらサジェストします。
          </p>

          {recentBehavior && (
            <div className="bs-now-you">
              <div className="bs-now-you-label">今のあなた</div>
              <div className="bs-now-you-text">{recentBehavior}</div>
            </div>
          )}

          <div className="bs-hero-actions">
            <button className="bs-btn-primary" onClick={() => document.getElementById("categories").scrollIntoView({ behavior: "smooth" })}>
              カテゴリーから探す <span style={{ marginLeft: 6 }}>→</span>
            </button>
            <button className="bs-btn-secondary">
              使い方を見る
            </button>
          </div>
        </div>
        <div className="bs-hero-mascots">
          <div className="bs-mascots-greeting">
            <div className="bs-greeting-text">
              {hasMemo ? "おかえりなさい！" : "ようこそ、ベネステAI検索へ。"}
            </div>
            <div className="bs-greeting-sub">
              {insights?.analyzedAt ? "解析済みのおすすめがあります" : "今日は何をお手伝いしましょう？"}
            </div>
          </div>
          <div className="bs-mascot-pair">
            <div className="bs-friendship-particles">
              <span className="bs-particle bs-particle-1">♥</span>
              <span className="bs-particle bs-particle-2">✦</span>
              <span className="bs-particle bs-particle-3">♪</span>
              <span className="bs-particle bs-particle-4">♥</span>
              <span className="bs-particle bs-particle-5">✦</span>
              <span className="bs-particle bs-particle-6">♥</span>
            </div>
            <div className="bs-mascot bs-mascot-1">
              {taroComment && <div className="bs-mascot-bubble bs-bubble-taro">{taroComment}</div>}
              <div className="bs-cat-stage">
                <div className="bs-cat-bg" />
                <BusaNyan size={200} />
              </div>
              <div className="bs-mascot-name">
                <div className="bs-mascot-name-jp">ベネ太郎</div>
                <div className="bs-mascot-name-role">分析家</div>
              </div>
            </div>
            <div className="bs-mascot bs-mascot-2">
              {kichiComment && <div className="bs-mascot-bubble bs-bubble-kichi">{kichiComment}</div>}
              <div className="bs-cat-stage">
                <div className="bs-cat-bg bs-cat-bg-pink" />
                <BeneKichi size={200} />
              </div>
              <div className="bs-mascot-name">
                <div className="bs-mascot-name-jp">ベネ吉</div>
                <div className="bs-mascot-name-role">サポート役</div>
              </div>
            </div>
            <div className="bs-mascot bs-mascot-3">
              {maruComment && <div className="bs-mascot-bubble bs-bubble-maru">{maruComment}</div>}
              <div className="bs-cat-stage">
                <div className="bs-cat-bg bs-cat-bg-red" />
                <BeneMaru size={200} />
              </div>
              <div className="bs-mascot-name">
                <div className="bs-mascot-name-jp">ベネ丸</div>
                <div className="bs-mascot-name-role">守護者</div>
              </div>
            </div>
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
function MemoPanel({ profile, open, onClose }) {
  return (
    <>
      <div className={`bs-memo-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`bs-memo-panel ${open ? "open" : ""}`}>
        <div className="bs-memo-head">
          <div>
            <div className="bs-memo-eyebrow">BENE-TARO MEMO</div>
            <div className="bs-memo-title">ベネ太郎の記録帳</div>
          </div>
          <button className="bs-memo-close" onClick={onClose}>×</button>
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

// ============ データ同期パネル ============
function SyncPanel({ open, onClose, insights }) {
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const isExtension = typeof chrome !== "undefined" && chrome.runtime?.id;

  useEffect(() => {
    if (!open || !isExtension) return;
    chrome.runtime.sendMessage({ type: "GET_STATS" }, (res) => {
      if (res?.stats) setStats(res.stats);
    });
  }, [open, isExtension]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    if (!isExtension) {
      showToast("Chrome拡張機能としてインストールが必要です");
      return;
    }
    setBusy(true);
    chrome.runtime.sendMessage({ type: "EXPORT_DATA" }, (res) => {
      setBusy(false);
      if (!res?.json) {
        showToast("データの取得に失敗しました");
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      const filename = `bs-data-${today}.json`;
      const blob = new Blob([JSON.stringify(res.json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`${filename} をダウンロードしました`);
    });
  };

  const handleClear = () => {
    if (!isExtension) return;
    if (!confirm("収集データを全て削除します。よろしいですか？")) return;
    chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" }, () => {
      setStats({ totalPages: 0, totalVisits: 0, lastCollectedAt: null, topCategories: [] });
      showToast("収集データを削除しました");
    });
  };

  const formatDate = (iso) => {
    if (!iso) return "未収集";
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  return (
    <>
      <div className={`bs-memo-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`bs-sync-panel ${open ? "open" : ""}`}>
        <div className="bs-memo-head">
          <div>
            <div className="bs-memo-eyebrow">DATA SYNC</div>
            <div className="bs-memo-title">データ同期</div>
          </div>
          <button className="bs-memo-close" onClick={onClose}>×</button>
        </div>

        {!isExtension && (
          <div className="bs-sync-warn">
            <strong>Chrome拡張機能モードでのみ動作します。</strong>
            <p>ローカル環境のWebアプリ単体では収集機能は利用できません。READMEの手順に従って拡張機能としてインストールしてください。</p>
          </div>
        )}

        {isExtension && (
          <>
            <p className="bs-memo-desc">
              ベネステで閲覧したページが拡張機能内に蓄積されています。エクスポートしたJSONをGitHubに上げて、Claudeに解析を依頼してください。
            </p>

            <div className="bs-sync-stats">
              <div className="bs-sync-stat">
                <div className="bs-sync-stat-num">{stats?.totalPages ?? "—"}</div>
                <div className="bs-sync-stat-label">認識ページ数</div>
              </div>
              <div className="bs-sync-stat">
                <div className="bs-sync-stat-num">{stats?.totalVisits ?? "—"}</div>
                <div className="bs-sync-stat-label">のべ訪問回数</div>
              </div>
              <div className="bs-sync-stat bs-sync-stat-wide">
                <div className="bs-sync-stat-num-sm">{formatDate(stats?.lastCollectedAt)}</div>
                <div className="bs-sync-stat-label">最終収集日時</div>
              </div>
            </div>

            {stats?.topCategories?.length > 0 && (
              <div className="bs-memo-section">
                <div className="bs-memo-section-title">よく見ているカテゴリ</div>
                {stats.topCategories.map((c, i) => (
                  <div key={i} className="bs-memo-item">
                    <span className="bs-memo-bullet" />
                    <span>{c.name}</span>
                    <span className="bs-sync-cat-count">{c.count}件</span>
                  </div>
                ))}
              </div>
            )}

            <div className="bs-sync-actions">
              <button className="bs-sync-btn-primary" onClick={handleExport} disabled={busy || !stats?.totalPages}>
                {busy ? "処理中…" : "JSONをエクスポート"}
              </button>
              <button className="bs-sync-btn-secondary" onClick={handleClear} disabled={!stats?.totalPages}>
                収集データを削除
              </button>
            </div>

            <div className="bs-memo-section">
              <div className="bs-memo-section-title">使い方</div>
              <ol className="bs-sync-steps">
                <li>ベネステを普通に閲覧（拡張機能が裏で記録）</li>
                <li>このパネルから「JSONをエクスポート」</li>
                <li>ダウンロードしたファイルを <code>data/raw/</code> に置く</li>
                <li>git commit & push</li>
                <li>Claude に <code>prompts/analyze.md</code> の指示で解析依頼</li>
                <li>Claudeが <code>data/insights.json</code> を更新→push</li>
                <li>Webアプリが自動再デプロイされ、結果が反映</li>
              </ol>
            </div>

            <div className="bs-memo-section">
              <div className="bs-memo-section-title">最終解析</div>
              <div className="bs-memo-item">
                <span className="bs-memo-bullet" />
                <span>{insights?.analyzedAt ? formatDate(insights.analyzedAt) : "未解析"}</span>
              </div>
              {insights?.profile?.recentBehavior && (
                <div className="bs-sync-insight-summary">
                  {insights.profile.recentBehavior}
                </div>
              )}
            </div>
          </>
        )}

        {toast && <div className="bs-sync-toast">{toast}</div>}
      </div>
    </>
  );
}

// ============ スタイル ============
const globalCSS = `
/* Meiryo UI ベースのフォントスタック + かわいい丸ゴシック */
@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.bs-app {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', 'Yu Gothic', sans-serif;
  background: #FAFBFD;
  min-height: 100vh;
  color: #003F8E;
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
  padding: 14px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 1px 0 rgba(0, 63, 142, 0.02);
}
.bs-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.bs-logo-mark {
  display: flex;
  align-items: center;
  filter: drop-shadow(0 2px 6px rgba(0, 63, 142, 0.18));
}
.bs-brand-name {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #003F8E;
  letter-spacing: 0.02em;
  line-height: 1.2;
}
.bs-brand-name-en {
  font-weight: 700;
  color: #1A5CB0;
  margin-left: 2px;
}
.bs-brand-sub {
  font-size: 9px;
  letter-spacing: 0.2em;
  color: #94A3B8;
  margin-top: 3px;
  font-weight: 500;
}

/* 右側エリア */
.bs-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* ライブ接続ステータスピル */
.bs-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: linear-gradient(135deg, #E8F7EE 0%, #F0FAF4 100%);
  border: 1px solid #B5DEC4;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  color: #1B5E2E;
  letter-spacing: 0.02em;
}
.bs-status-dot-live {
  width: 7px;
  height: 7px;
  background: #10B981;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: liveBlink 1.8s infinite;
  flex-shrink: 0;
}
@keyframes liveBlink {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
.bs-status-text { font-weight: 700; }
.bs-status-count {
  font-size: 10px;
  color: #4A7256;
  padding-left: 8px;
  border-left: 1px solid #B5DEC4;
  letter-spacing: 0.04em;
}

.bs-nav { display: flex; align-items: center; gap: 24px; }
.bs-nav-link {
  background: none;
  border: none;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  position: relative;
  padding: 6px 2px;
  transition: color 0.2s;
}
.bs-nav-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #003F8E;
  transition: width 0.25s ease;
}
.bs-nav-link:hover { color: #003F8E; }
.bs-nav-link:hover::after { width: 100%; }

.bs-account-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #003F8E;
  border: none;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 6px;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 63, 142, 0.25);
}
.bs-account-btn:hover {
  background: #002A6E;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 63, 142, 0.35);
}
.bs-account-icon { font-size: 6px; color: #66B0FF; }

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
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #1A5CB0;
  margin-bottom: 32px;
}
.bs-line {
  display: inline-block;
  width: 40px;
  height: 1px;
  background: #1A5CB0;
}
.bs-hero-title {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 60px;
  line-height: 1.3;
  font-weight: 700;
  color: #003F8E;
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

.bs-now-you {
  background: linear-gradient(135deg, #F0F7FF 0%, #FFFFFF 100%);
  border: 1px solid #BFD6F0;
  border-left: 3px solid #003F8E;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 24px;
  max-width: 560px;
  animation: cardSlideIn 0.6s ease-out 0.4s both;
}
.bs-now-you-label {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 10px;
  letter-spacing: 0.25em;
  color: #1A5CB0;
  font-weight: 700;
  margin-bottom: 6px;
}
.bs-now-you-text {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 13px;
  line-height: 1.8;
  color: #003F8E;
  font-weight: 500;
}
.bs-btn-primary {
  background: #003F8E;
  color: #fff;
  border: none;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.25s;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
}
.bs-btn-primary:hover { background: #002A6E; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(31, 58, 95, 0.25); }
.bs-btn-secondary {
  background: transparent;
  color: #003F8E;
  border: 1px solid #003F8E;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.25s;
}
.bs-btn-secondary:hover { background: #003F8E; color: #fff; }

/* === デュアルマスコット（ベネ太郎×ベネ吉） === */
.bs-hero-mascots {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.bs-mascots-greeting {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 18px 18px 18px 4px;
  padding: 14px 22px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 63, 142, 0.08);
  position: relative;
  animation: speechIn 0.6s cubic-bezier(.34,1.56,.64,1) both 0.3s, speechFloat 4s ease-in-out infinite 1s;
}
.bs-greeting-text {
  font-family: 'M PLUS Rounded 1c', 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #003F8E;
  margin-bottom: 4px;
  letter-spacing: 0.02em;
}
.bs-greeting-sub {
  font-family: 'M PLUS Rounded 1c', 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-weight: 500;
  font-size: 11px;
  color: #64748B;
  letter-spacing: 0.05em;
}

/* === 今のあなたカード === */
.bs-now-you {
  background: linear-gradient(135deg, #F0F6FF 0%, #FFF5F3 100%);
  border-left: 3px solid #003F8E;
  padding: 14px 18px;
  margin: 18px 0 22px;
  border-radius: 0 8px 8px 0;
  max-width: 520px;
}
.bs-now-you-label {
  font-family: 'M PLUS Rounded 1c', 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #003F8E;
  margin-bottom: 6px;
}
.bs-now-you-text {
  font-family: 'M PLUS Rounded 1c', 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1E293B;
  line-height: 1.8;
}

/* === キャラ別ふきだし === */
.bs-mascot-bubble {
  position: relative;
  background: #fff;
  border: 2px solid #003F8E;
  padding: 10px 14px;
  border-radius: 18px;
  font-family: 'M PLUS Rounded 1c', 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #003F8E;
  line-height: 1.6;
  max-width: 200px;
  margin-bottom: 14px;
  z-index: 6;
  box-shadow: 0 6px 16px rgba(0, 63, 142, 0.12);
  animation: speechIn 0.5s cubic-bezier(.34,1.56,.64,1) both, bubbleBob 4s ease-in-out infinite;
  white-space: normal;
  text-align: center;
  align-self: center;
}
.bs-mascot-bubble::after {
  content: "";
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: #fff;
  border-right: 2px solid #003F8E;
  border-bottom: 2px solid #003F8E;
}
.bs-bubble-taro { color: #003F8E; border-color: #003F8E; }
.bs-bubble-taro::after { border-right-color: #003F8E; border-bottom-color: #003F8E; }
.bs-bubble-kichi { color: #1A5CB0; border-color: #1A5CB0; animation-delay: 0.2s; }
.bs-bubble-kichi::after { border-right-color: #1A5CB0; border-bottom-color: #1A5CB0; }
.bs-bubble-maru { color: #C73E2E; border-color: #C73E2E; animation-delay: 0.4s; }
.bs-bubble-maru::after { border-right-color: #C73E2E; border-bottom-color: #C73E2E; }
@keyframes bubbleBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

.bs-mascot-pair {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  position: relative;
}

/* キャラ間に流れる友情パーティクル */
.bs-friendship-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: visible;
}
.bs-particle {
  position: absolute;
  font-size: 16px;
  opacity: 0;
  animation: particleFloat 5s ease-in-out infinite;
  user-select: none;
}
.bs-particle-1 { left: 26%; bottom: 25%; color: #F4A8A0; animation-delay: 0s; }
.bs-particle-2 { left: 42%; bottom: 18%; color: #1A5CB0; animation-delay: 0.8s; font-size: 14px; }
.bs-particle-3 { left: 58%; bottom: 22%; color: #C73E2E; animation-delay: 1.6s; font-size: 13px; }
.bs-particle-4 { left: 33%; bottom: 32%; color: #003F8E; animation-delay: 2.4s; font-size: 12px; }
.bs-particle-5 { left: 65%; bottom: 30%; color: #F4A8A0; animation-delay: 3.2s; font-size: 14px; }
.bs-particle-6 { left: 50%; bottom: 38%; color: #1A5CB0; animation-delay: 4s; font-size: 11px; }
@keyframes particleFloat {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  15% { opacity: 0.85; }
  60% { opacity: 0.6; }
  100% { transform: translateY(-90px) scale(1); opacity: 0; }
}

.bs-mascot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: transform 0.4s ease;
}
/* 仲良し挙動: たまにお互いに寄り添う */
.bs-mascot-1 { animation: leanRight 7s ease-in-out infinite 1s; }
.bs-mascot-2 { animation: leanCenter 7s ease-in-out infinite 1s; }
.bs-mascot-3 { animation: leanLeft 7s ease-in-out infinite 1s; }
@keyframes leanRight {
  0%, 88%, 100% { transform: translateX(0) rotate(0deg); }
  92% { transform: translateX(4px) rotate(2deg); }
}
@keyframes leanCenter {
  0%, 88%, 100% { transform: translateY(0); }
  92% { transform: translateY(-3px); }
}
@keyframes leanLeft {
  0%, 88%, 100% { transform: translateX(0) rotate(0deg); }
  92% { transform: translateX(-4px) rotate(-2deg); }
}

.bs-cat-stage {
  position: relative;
  width: 230px;
  height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bs-cat-bg {
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(0, 63, 142, 0.12) 0%, rgba(0, 63, 142, 0) 70%);
  border-radius: 50%;
  animation: bgPulse 4s ease-in-out infinite;
}
.bs-cat-bg-pink {
  background: radial-gradient(circle, rgba(244, 168, 160, 0.18) 0%, rgba(244, 168, 160, 0) 70%);
  animation-delay: 1.3s;
}
.bs-cat-bg-red {
  background: radial-gradient(circle, rgba(199, 62, 46, 0.14) 0%, rgba(199, 62, 46, 0) 70%);
  animation-delay: 2.6s;
}
@keyframes bgPulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.08); opacity: 1; } }

.bs-mascot-name {
  text-align: center;
  padding: 7px 18px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 100px;
  min-width: 110px;
  box-shadow: 0 2px 6px rgba(0, 63, 142, 0.06);
}
.bs-mascot-name-jp {
  font-family: 'M PLUS Rounded 1c', 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #003F8E;
  letter-spacing: 0.05em;
  line-height: 1.2;
}
.bs-mascot-name-role {
  font-family: 'M PLUS Rounded 1c', 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #64748B;
  letter-spacing: 0.1em;
  margin-top: 2px;
}

@keyframes speechFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes speechIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

/* 旧bs-speech互換（チャット内などで使用） */
.bs-speech {
  position: absolute;
  top: 30px;
  left: -10px;
  background: #fff;
  border: 1px solid #E2E8F0;
  padding: 14px 20px;
  border-radius: 20px 20px 4px 20px;
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #003F8E;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(31, 58, 95, 0.12);
  animation: speechFloat 4s ease-in-out infinite, speechIn 0.6s cubic-bezier(.34,1.56,.64,1) both 0.3s;
  white-space: nowrap;
}

.bs-cat-name {
  margin-top: 12px;
  text-align: center;
}
.bs-cat-name-jp {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #003F8E;
  letter-spacing: 0.1em;
}
.bs-cat-name-en {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
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

/* === ベネ吉アニメーション === */
.bk-shadow { animation: shadowPulse 4s ease-in-out infinite 1s; }
.bk-body-group { animation: bodyFloat 4.2s ease-in-out infinite 0.5s; transform-origin: 50% 100%; }

.bk-tail { animation: bkTailWag 1.6s ease-in-out infinite; transform-origin: 230px 230px; }
@keyframes bkTailWag {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-15deg); }
}

.bk-eye-left, .bk-eye-right { animation: blink 5.5s infinite 1s; transform-origin: center; transform-box: fill-box; }

.bk-cheek-l, .bk-cheek-r { animation: cheekPulse 3s ease-in-out infinite 0.8s; transform-origin: center; transform-box: fill-box; }

.bk-ear-l, .bk-ear-r { animation: earTwitch 6s ease-in-out infinite; transform-origin: center bottom; transform-box: fill-box; }
.bk-ear-r { animation-delay: 3s; }
@keyframes earTwitch {
  0%, 94%, 100% { transform: rotate(0deg); }
  96% { transform: rotate(-3deg); }
  98% { transform: rotate(2deg); }
}

.bk-sparkle-1, .bk-sparkle-2, .bk-sparkle-3 {
  animation: sparkleTwinkle 2.6s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}
.bk-sparkle-1 { animation-delay: 0.3s; }
.bk-sparkle-2 { animation-delay: 1.1s; }
.bk-sparkle-3 { animation-delay: 1.9s; }

/* === ベネ丸（侍猫）アニメーション === */
.bm-shadow { animation: shadowPulse 4s ease-in-out infinite 1.5s; }
.bm-body-group { animation: bodyFloat 4.4s ease-in-out infinite 1s; transform-origin: 50% 100%; }

.bm-tail { animation: bmTailSway 3.2s ease-in-out infinite; transform-origin: 230px 232px; }
@keyframes bmTailSway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-5deg); }
}

.bm-headband-tail { animation: hbFlutter 1.8s ease-in-out infinite; transform-origin: 240px 110px; }
@keyframes hbFlutter {
  0%, 100% { transform: rotate(0deg) translateX(0); }
  50% { transform: rotate(3deg) translateX(2px); }
}

.bm-katana { animation: katanaGlint 5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
@keyframes katanaGlint {
  0%, 88%, 100% { transform: rotate(0deg); }
  92% { transform: rotate(-2deg); }
}

.bm-eye-left, .bm-eye-right { animation: blink 6s infinite 2s; transform-origin: center; transform-box: fill-box; }

.bm-sparkle-1, .bm-sparkle-2 {
  animation: sparkleTwinkle 2.8s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}
.bm-sparkle-1 { animation-delay: 0.5s; }
.bm-sparkle-2 { animation-delay: 1.7s; }

/* 横びれゆらゆら */
.bn-fin-l, .bn-fin-r { animation: finFlap 2.6s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
.bn-fin-r { animation-delay: 1.3s; }
@keyframes finFlap {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(4deg); }
}

.bn-eye-left, .bn-eye-right { animation: blink 5s infinite; transform-origin: center; transform-box: fill-box; }
@keyframes blink {
  0%, 92%, 96%, 100% { transform: scaleY(1); }
  94% { transform: scaleY(0.1); }
}

/* ほっぺぷくぷく */
.bn-cheek-l, .bn-cheek-r { animation: cheekPulse 2.8s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
@keyframes cheekPulse {
  0%, 100% { opacity: 0.65; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.08); }
}

/* キラキラ */
.bn-sparkle-1, .bn-sparkle-2 {
  animation: sparkleTwinkle 2.4s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}
.bn-sparkle-2 { animation-delay: 0.8s; }
@keyframes sparkleTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* バブル浮遊 */
.bn-bubble-1, .bn-bubble-2, .bn-bubble-3, .bn-bubble-4 {
  animation: bubbleRise 3.6s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}
.bn-bubble-2 { animation-delay: 0.6s; }
.bn-bubble-3 { animation-delay: 1.2s; }
.bn-bubble-4 { animation-delay: 2s; }
@keyframes bubbleRise {
  0% { transform: translateY(10px); opacity: 0; }
  20% { opacity: 0.7; }
  80% { opacity: 0.5; }
  100% { transform: translateY(-18px); opacity: 0; }
}

/* === スタッツ === */
.bs-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 0;
  border-top: 1px solid #E2E8F0;
  border-bottom: 1px solid #E2E8F0;
  margin-bottom: 100px;
}
.bs-stat { text-align: center; flex: 1; }
.bs-stat-num {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 48px;
  line-height: 1;
  color: #003F8E;
  font-weight: 500;
}
.bs-stat-unit {
  font-size: 24px;
  color: #1A5CB0;
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
  background: #E2E8F0;
}

/* === セクションヘッド === */
.bs-section-head {
  margin-bottom: 60px;
}
.bs-section-num {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: #1A5CB0;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.bs-section-line {
  display: inline-block;
  width: 60px;
  height: 1px;
  background: #1A5CB0;
}
.bs-section-title {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 42px;
  font-weight: 700;
  color: #003F8E;
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
  border: 1px solid #E2E8F0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  padding: 0;
  border-radius: 8px;
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
  background: #1A5CB0;
  transition: width 0.4s ease;
}
.bs-cat-card:hover { transform: translateY(-6px); box-shadow: 0 14px 36px rgba(31, 58, 95, 0.1); border-color: #003F8E; }
.bs-cat-card:hover::before { width: 100%; }

.bs-cat-card-inner {
  padding: 28px 24px 24px;
  position: relative;
  min-height: 200px;
}
.bs-cat-card-num {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #1A5CB0;
  margin-bottom: 18px;
}
.bs-cat-card-icon {
  font-size: 32px;
  color: #003F8E;
  margin-bottom: 14px;
}
.bs-cat-card-en {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #7a8194;
  margin-bottom: 4px;
}
.bs-cat-card-name {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #003F8E;
  margin-bottom: 24px;
}
.bs-cat-card-arrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #003F8E;
  letter-spacing: 0.1em;
  font-weight: 500;
}
.bs-arrow-line {
  display: inline-block;
  width: 24px;
  height: 1px;
  background: #003F8E;
  transition: width 0.3s;
}
.bs-cat-card:hover .bs-arrow-line { width: 40px; background: #1A5CB0; }

/* === 使い方 === */
.bs-how { padding: 80px 0; }
.bs-how-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.bs-step {
  background: #fff;
  border: 1px solid #E2E8F0;
  padding: 36px 32px;
  border-radius: 8px;
  position: relative;
}
.bs-step-num {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #1A5CB0;
  margin-bottom: 20px;
}
.bs-step-icon {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 56px;
  color: #003F8E;
  margin-bottom: 16px;
  line-height: 1;
}
.bs-step-title {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 22px;
  color: #003F8E;
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
  background: linear-gradient(135deg, #003F8E 0%, #2a4a78 100%);
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
  background: #FAFBFD;
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
.bs-learn-text .bs-section-num { color: #1A5CB0; }
.bs-learn-text .bs-section-line { background: #1A5CB0; }
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
  background: #1A5CB0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #003F8E;
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
  border: 1px solid #E2E8F0;
  color: #003F8E;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
}
.bs-back-btn:hover { background: #003F8E; color: #fff; border-color: #003F8E; }
.bs-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #7a8194;
}
.bs-crumb-sep { color: #1A5CB0; }
.bs-crumb-current { color: #003F8E; font-weight: 500; }

/* === チャット === */
.bs-chat-head {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #E2E8F0;
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
  border: 1px solid #E2E8F0;
  padding: 28px 20px;
  border-radius: 8px;
  text-align: center;
}
.bs-chat-cat { display: flex; justify-content: center; margin-bottom: 12px; }
.bs-chat-name {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #003F8E;
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
  background: #FAFBFD;
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
  border-top: 1px solid #E2E8F0;
}

.bs-chat-area {
  background: #fff;
  border: 1px solid #E2E8F0;
  padding: 28px;
  border-radius: 8px;
  min-height: 360px;
  max-height: 480px;
  overflow-y: auto;
  margin-bottom: 20px;
}
.bs-chat-area::-webkit-scrollbar { width: 4px; }
.bs-chat-area::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 8px; }

.bs-msg-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.bs-msg-row.bot { justify-content: flex-start; }
.bs-msg-row.user { justify-content: flex-end; }
.bs-msg-avatar {
  width: 40px;
  height: 40px;
  background: #FAFBFD;
  border: 1px solid #E2E8F0;
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
  background: #FAFBFD;
  color: #003F8E;
  border: 1px solid #E2E8F0;
  border-radius: 4px 12px 12px 12px;
}
.bs-msg-bubble.user {
  background: #003F8E;
  color: #fff;
  border-radius: 12px 4px 12px 12px;
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
  border: 1px solid #E2E8F0;
  color: #003F8E;
  padding: 18px 22px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.25s;
  animation: cardSlideIn 0.4s ease both;
}
.bs-opt-btn:hover {
  background: #003F8E;
  color: #fff;
  border-color: #003F8E;
  transform: translateX(4px);
}
.bs-opt-btn:hover .bs-opt-num { color: #1A5CB0; }
.bs-opt-btn:hover .bs-opt-arrow { transform: translateX(6px); }
.bs-opt-num {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: #1A5CB0;
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
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  margin-bottom: 40px;
}
.bs-result-cat-mini {
  width: 140px;
  height: 140px;
  background: #FAFBFD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bs-result-title {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #003F8E;
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
  background: #FAFBFD;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  color: #003F8E;
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
  border: 1px solid #E2E8F0;
  border-radius: 8px;
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
  background: #1A5CB0;
  opacity: 0;
  transition: opacity 0.3s;
}
.bs-result-card:hover { box-shadow: 0 14px 36px rgba(31, 58, 95, 0.08); }
.bs-result-card:hover::before { opacity: 1; }

.bs-result-rank { text-align: center; }
.bs-result-rank-num {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 64px;
  line-height: 1;
  color: #003F8E;
  
  font-weight: 500;
}
.bs-result-rank-label {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 10px;
  letter-spacing: 0.4em;
  color: #1A5CB0;
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
  background: #003F8E;
  color: #fff;
  border-radius: 8px;
  letter-spacing: 0.15em;
}
.bs-result-match-mini { display: flex; align-items: baseline; gap: 4px; }
.bs-result-match-num {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 28px;
  color: #1A5CB0;
  font-weight: 700;
  line-height: 1;
}
.bs-result-match-of {
  font-size: 12px;
  color: #7a8194;
}
.bs-result-match-label-mini {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 9px;
  letter-spacing: 0.3em;
  color: #7a8194;
  margin-left: 8px;
}

.bs-result-name {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #003F8E;
  margin-bottom: 8px;
}
.bs-result-price {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 16px;
  color: #1A5CB0;
  margin-bottom: 16px;
  letter-spacing: 0.03em;
}
.bs-result-bar {
  height: 3px;
  background: #E2E8F0;
  border-radius: 8px;
  margin-bottom: 18px;
  overflow: hidden;
}
.bs-result-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1A5CB0, #003F8E);
  border-radius: 8px;
  transition: width 1s ease-out;
}
.bs-result-reason {
  background: #FAFBFD;
  border-left: 3px solid #1A5CB0;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.bs-reason-label {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #1A5CB0;
  font-weight: 700;
  margin-bottom: 6px;
}
.bs-reason-text {
  font-size: 13px;
  color: #003F8E;
  line-height: 1.8;
}

.bs-feedback-row { display: flex; align-items: center; gap: 10px; }
.bs-fb-btn {
  background: #fff;
  border: 1px solid #E2E8F0;
  color: #4a5568;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.bs-fb-btn:hover { border-color: #003F8E; }
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
  background: #003F8E;
  border: none;
  color: #fff;
  padding: 11px 24px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.bs-detail-btn:hover { background: #002A6E; transform: translateY(-1px); }

.bs-learn-hint {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #FAFBFD, #fff);
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  margin-bottom: 80px;
}
.bs-learn-hint-icon { font-size: 28px; }
.bs-learn-hint-title {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 16px;
  color: #003F8E;
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
  background: #003F8E;
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
.bs-memo-toggle.open { background: #1A5CB0; }
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
  border-left: 1px solid #E2E8F0;
}
.bs-memo-panel.open { transform: translateX(0); }

/* === データ同期パネル === */
.bs-sync-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  height: 100vh;
  background: #fff;
  z-index: 160;
  padding: 36px 32px;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
  overflow-y: auto;
  border-left: 1px solid #E2E8F0;
}
.bs-sync-panel.open { transform: translateX(0); }

.bs-sync-warn {
  background: #FEF6E7;
  border: 1px solid #F4D7A1;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 20px;
  font-size: 12px;
  color: #6B4F1A;
  line-height: 1.6;
}
.bs-sync-warn strong { display: block; color: #003F8E; margin-bottom: 4px; font-size: 13px; }

.bs-sync-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 24px;
}
.bs-sync-stat {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 14px 16px;
}
.bs-sync-stat-wide { grid-column: span 2; }
.bs-sync-stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #003F8E;
  line-height: 1;
  font-feature-settings: "tnum";
}
.bs-sync-stat-num-sm {
  font-size: 14px;
  font-weight: 700;
  color: #003F8E;
  font-feature-settings: "tnum";
}
.bs-sync-stat-label {
  font-size: 11px;
  color: #64748B;
  margin-top: 6px;
  letter-spacing: 0.05em;
}

.bs-sync-cat-count {
  margin-left: auto;
  font-size: 11px;
  color: #1A5CB0;
  font-weight: 600;
}

.bs-sync-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 22px 0;
}
.bs-sync-btn-primary {
  background: #003F8E;
  color: #fff;
  border: none;
  padding: 13px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 63, 142, 0.2);
}
.bs-sync-btn-primary:hover:not(:disabled) {
  background: #002A6E;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 63, 142, 0.3);
}
.bs-sync-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.bs-sync-btn-secondary {
  background: transparent;
  color: #64748B;
  border: 1px solid #E2E8F0;
  padding: 11px 20px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.bs-sync-btn-secondary:hover:not(:disabled) { border-color: #C73E2E; color: #C73E2E; }
.bs-sync-btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

.bs-sync-steps {
  list-style: none;
  counter-reset: step;
  padding: 0;
  margin: 0;
}
.bs-sync-steps li {
  counter-increment: step;
  position: relative;
  padding: 8px 0 8px 32px;
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  border-bottom: 1px dashed #E2E8F0;
}
.bs-sync-steps li:last-child { border-bottom: none; }
.bs-sync-steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 8px;
  width: 22px;
  height: 22px;
  background: #003F8E;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
.bs-sync-steps code {
  background: #F1F5F9;
  padding: 1px 6px;
  border-radius: 3px;
  font-family: 'Menlo', 'Monaco', monospace;
  font-size: 11px;
  color: #003F8E;
}

.bs-sync-insight-summary {
  background: linear-gradient(135deg, #F0F6FF 0%, #FFF5F3 100%);
  border-left: 3px solid #003F8E;
  padding: 12px 14px;
  margin-top: 10px;
  font-size: 12px;
  color: #1E293B;
  line-height: 1.7;
  border-radius: 0 6px 6px 0;
}

.bs-sync-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #003F8E;
  color: #fff;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 63, 142, 0.3);
  animation: toastIn 0.3s ease-out;
}
@keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media (max-width: 768px) {
  .bs-sync-panel { width: 100%; padding: 28px 22px; }
}

/* === Chrome拡張サイドパネル等の狭幅対応（700px以下） === */
@media (max-width: 700px) {
  .bs-header {
    flex-wrap: wrap;
    padding: 10px 14px;
    gap: 8px;
  }
  .bs-brand-sub { display: none; }
  .bs-brand-name { font-size: 15px; }
  .bs-header-right {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .bs-status-pill {
    font-size: 10px;
    padding: 5px 10px;
    gap: 6px;
  }
  .bs-status-count {
    padding-left: 6px;
    font-size: 9px;
  }
  .bs-nav {
    gap: 14px;
    flex-wrap: wrap;
  }
  .bs-nav-link {
    font-size: 11px;
    padding: 4px 0;
  }
  .bs-account-btn {
    padding: 7px 12px;
    font-size: 10px;
    border-radius: 6px;
  }
  .bs-account-btn span:not(.bs-account-icon) { display: none; }
}
.bs-memo-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid #E2E8F0;
  margin-bottom: 20px;
}
.bs-memo-eyebrow {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #1A5CB0;
  margin-bottom: 6px;
}
.bs-memo-title {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #003F8E;
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
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #1A5CB0;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E2E8F0;
  text-transform: uppercase;
}
.bs-memo-item {
  display: flex;
  gap: 12px;
  font-size: 13px;
  line-height: 1.8;
  color: #003F8E;
  padding: 8px 0;
}
.bs-memo-bullet {
  width: 4px;
  height: 4px;
  background: #1A5CB0;
  border-radius: 50%;
  margin-top: 9px;
  flex-shrink: 0;
}
.bs-memo-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.bs-memo-tag {
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 8px;
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

/* === 同期パネル === */
.bs-sync-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 440px;
  max-width: 92vw;
  height: 100vh;
  background: #fff;
  z-index: 160;
  padding: 36px 32px;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
  overflow-y: auto;
  border-left: 1px solid #E2E8F0;
  box-shadow: -8px 0 32px rgba(0, 63, 142, 0.06);
}
.bs-sync-panel.open { transform: translateX(0); }

.bs-sync-warn {
  background: #FFF8E6;
  border: 1px solid #F2D88A;
  color: #7A5A20;
  padding: 16px 18px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 20px;
}
.bs-sync-warn strong { display: block; margin-bottom: 6px; color: #5A3F0E; font-size: 13px; }
.bs-sync-warn p { margin: 0; font-size: 12px; }

.bs-sync-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}
.bs-sync-stat {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 14px 16px;
  text-align: center;
}
.bs-sync-stat-wide { grid-column: 1 / -1; }
.bs-sync-stat-num {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #003F8E;
  line-height: 1;
  margin-bottom: 4px;
}
.bs-sync-stat-num-sm {
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #003F8E;
  margin-bottom: 4px;
}
.bs-sync-stat-label {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: #64748B;
}

.bs-sync-cat-count {
  margin-left: auto;
  font-size: 11px;
  color: #64748B;
  font-weight: 500;
}

.bs-sync-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}
.bs-sync-btn-primary {
  background: #003F8E;
  color: #fff;
  border: none;
  padding: 13px 18px;
  border-radius: 8px;
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(0, 63, 142, 0.2);
}
.bs-sync-btn-primary:hover:not(:disabled) {
  background: #002A6E;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 63, 142, 0.3);
}
.bs-sync-btn-primary:disabled {
  background: #B0B8C4;
  cursor: not-allowed;
  box-shadow: none;
}
.bs-sync-btn-secondary {
  background: transparent;
  color: #94101a;
  border: 1px solid #E2C5C5;
  padding: 11px 18px;
  border-radius: 8px;
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.bs-sync-btn-secondary:hover:not(:disabled) {
  background: #FBEDED;
}
.bs-sync-btn-secondary:disabled {
  color: #B0B8C4;
  border-color: #E2E8F0;
  cursor: not-allowed;
}

.bs-sync-steps {
  list-style: none;
  counter-reset: step;
  padding: 0;
  margin: 0;
}
.bs-sync-steps li {
  counter-increment: step;
  position: relative;
  padding: 8px 0 8px 32px;
  font-size: 12px;
  line-height: 1.8;
  color: #1E293B;
  border-bottom: 1px solid #F0F4F8;
}
.bs-sync-steps li:last-child { border-bottom: none; }
.bs-sync-steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 8px;
  width: 22px;
  height: 22px;
  background: #003F8E;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bs-sync-steps code {
  background: #F0F4F8;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #003F8E;
  font-family: ui-monospace, "SF Mono", Consolas, monospace;
}

.bs-sync-insight-summary {
  margin-top: 12px;
  padding: 12px 14px;
  background: #F0F7FF;
  border-left: 3px solid #003F8E;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.7;
  color: #1E293B;
}

.bs-sync-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #003F8E;
  color: #fff;
  padding: 12px 24px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 63, 142, 0.4);
  animation: toastIn 0.3s ease-out;
}
@keyframes toastIn {
  from { opacity: 0; transform: translate(-50%, 12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

/* === フッター === */
.bs-footer {
  background: #fff;
  border-top: 1px solid #E2E8F0;
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
  font-family: 'Meiryo UI', Meiryo, 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #1A5CB0;
  margin-bottom: 16px;
}
.bs-footer-link {
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.2s;
}
.bs-footer-link:hover { color: #003F8E; }
.bs-footer-base {
  border-top: 1px solid #E2E8F0;
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

/* タブレット */
@media (max-width: 1024px) {
  .bs-main { padding: 0 24px; }
  .bs-header { padding: 14px 24px; }
  .bs-nav { gap: 18px; }

  .bs-hero {
    grid-template-columns: 1fr;
    padding: 60px 0 30px;
    gap: 40px;
    min-height: auto;
    text-align: center;
  }
  .bs-hero-eyebrow { justify-content: center; }
  .bs-hero-lead { margin-left: auto; margin-right: auto; }
  .bs-hero-actions { justify-content: center; }
  .bs-hero-title { font-size: 44px; }

  .bs-cat-grid { grid-template-columns: repeat(2, 1fr); }
  .bs-chat-container { grid-template-columns: 1fr; }
  .bs-chat-side { display: none; }
  .bs-how-steps { grid-template-columns: 1fr; }
  .bs-learn { grid-template-columns: 1fr; padding: 40px; }
  .bs-stats { flex-wrap: wrap; gap: 20px; }
  .bs-stat { flex: 1 1 calc(50% - 10px); }
  .bs-stat-divider { display: none; }
  .bs-section-title { font-size: 32px; }
  .bs-result-head { grid-template-columns: 1fr; text-align: center; gap: 18px; }
  .bs-result-cat-mini { margin: 0 auto; }
  .bs-answer-summary { justify-content: center; }
  .bs-footer-inner { grid-template-columns: 1fr; padding: 40px 24px; gap: 32px; }
}

/* スマートフォン */
@media (max-width: 768px) {
  /* ヘッダー: 簡略化 */
  .bs-header { padding: 12px 16px; }
  .bs-brand-name { font-size: 16px; letter-spacing: 0.02em; }
  .bs-brand-sub { display: none; }
  .bs-logo-mark svg { width: 28px; height: 28px; }
  .bs-nav { gap: 8px; }
  .bs-nav-link { display: none; }
  .bs-account-btn { padding: 7px 12px; font-size: 11px; }

  .bs-main { padding: 0 16px; }

  /* HERO */
  .bs-hero { padding: 32px 0 16px; gap: 24px; }
  .bs-hero-eyebrow { font-size: 10px; margin-bottom: 18px; letter-spacing: 0.2em; }
  .bs-hero-title { font-size: 30px; line-height: 1.4; margin-bottom: 18px; }
  .bs-hero-lead { font-size: 13px; line-height: 1.9; margin-bottom: 24px; }
  .bs-hero-lead br { display: none; }
  .bs-hero-actions { flex-direction: column; gap: 10px; align-items: stretch; }
  .bs-btn-primary, .bs-btn-secondary {
    width: 100%;
    padding: 14px 20px;
    justify-content: center;
    font-size: 13px;
    text-align: center;
  }
  .bs-btn-primary { display: flex; }

  /* キャラクター（3人並列） */
  .bs-mascot-pair { gap: 0; }
  .bs-cat-stage { width: 120px; height: 120px; }
  .bs-cat-stage svg { width: 115px !important; height: 115px !important; }
  .bs-cat-bg { width: 100px; height: 100px; }
  .bs-mascots-greeting { padding: 11px 18px; }
  .bs-greeting-text { font-size: 13px; }
  .bs-greeting-sub { font-size: 10px; }
  .bs-mascot-name { padding: 4px 10px; min-width: 70px; }
  .bs-mascot-name-jp { font-size: 11px; }
  .bs-mascot-name-role { font-size: 8px; }
  .bs-particle { font-size: 12px !important; }
  .bs-speech {
    top: 8px;
    left: -8px;
    padding: 10px 14px;
    font-size: 12px;
    white-space: normal;
    max-width: 160px;
  }
  .bs-cat-name-jp { font-size: 16px; }
  .bs-cat-name-en { font-size: 9px; }

  /* スタッツ */
  .bs-stats {
    padding: 28px 0;
    margin-bottom: 60px;
    gap: 16px;
  }
  .bs-stat-num { font-size: 32px; }
  .bs-stat-unit { font-size: 16px; }
  .bs-stat-label { font-size: 9px; margin-top: 8px; letter-spacing: 0.1em; }

  /* セクション */
  .bs-section-head { margin-bottom: 32px; }
  .bs-section-num { font-size: 11px; letter-spacing: 0.2em; margin-bottom: 12px; }
  .bs-section-line { width: 40px; }
  .bs-section-title { font-size: 24px; line-height: 1.4; }
  .bs-section-sub { font-size: 12px; }
  .bs-categories, .bs-how { padding: 50px 0; }

  /* カテゴリーグリッド */
  .bs-cat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .bs-cat-card-inner { padding: 18px 14px; min-height: 160px; }
  .bs-cat-card-num { margin-bottom: 12px; font-size: 10px; }
  .bs-cat-card-icon { font-size: 24px; margin-bottom: 10px; }
  .bs-cat-card-en { font-size: 9px; letter-spacing: 0.15em; }
  .bs-cat-card-name { font-size: 15px; margin-bottom: 14px; }
  .bs-cat-card-arrow { font-size: 11px; gap: 6px; }
  .bs-arrow-line { width: 16px; }

  /* ステップ */
  .bs-how-steps { gap: 14px; }
  .bs-step { padding: 24px 20px; }
  .bs-step-icon { font-size: 40px; margin-bottom: 12px; }
  .bs-step-title { font-size: 18px; }
  .bs-step-text { font-size: 12px; line-height: 1.8; }

  /* 学習セクション */
  .bs-learn { padding: 32px 24px; gap: 24px; margin-bottom: 60px; }
  .bs-learn-cat { width: 180px; height: 180px; margin: 0 auto; }
  .bs-learn-cat svg { width: 150px !important; height: 150px !important; }
  .bs-learn-lead { font-size: 13px; line-height: 1.9; }
  .bs-learn-lead br { display: none; }
  .bs-learn-point { font-size: 13px; gap: 10px; }
  .bs-learn-point-icon { width: 22px; height: 22px; font-size: 11px; }

  /* ページヘッド */
  .bs-page-head { padding-top: 20px; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
  .bs-back-btn { padding: 7px 14px; font-size: 11px; }
  .bs-breadcrumb { font-size: 11px; gap: 6px; }

  /* チャット */
  .bs-chat-head { margin-bottom: 24px; padding-bottom: 16px; }
  .bs-chat-head .bs-section-title { font-size: 24px !important; }
  .bs-chat-area { padding: 18px; min-height: 280px; max-height: 380px; margin-bottom: 14px; }
  .bs-msg-row { gap: 8px; margin-bottom: 14px; }
  .bs-msg-bubble { font-size: 13px; padding: 12px 14px; max-width: 80%; line-height: 1.7; }
  .bs-msg-avatar { width: 32px; height: 32px; }
  .bs-msg-avatar svg { transform: scale(1.4) translateY(2px); }
  .bs-opt-wrap { grid-template-columns: 1fr; gap: 8px; }
  .bs-opt-btn { padding: 14px 16px; font-size: 13px; gap: 12px; }

  /* 結果ページ */
  .bs-result-head { padding: 22px 18px; gap: 16px; margin-bottom: 28px; }
  .bs-result-cat-mini { width: 90px; height: 90px; }
  .bs-result-cat-mini svg { width: 76px !important; height: 76px !important; }
  .bs-result-title { font-size: 22px; margin: 6px 0 12px; }
  .bs-answer-summary { gap: 6px; }
  .bs-answer-chip { font-size: 10px; padding: 4px 10px; }

  .bs-result-list { gap: 12px; margin-bottom: 40px; }
  .bs-result-card {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 14px;
  }
  .bs-result-rank {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 10px;
    padding-bottom: 12px;
    border-bottom: 1px solid #E2E8F0;
    text-align: left;
  }
  .bs-result-rank-num { font-size: 36px; }
  .bs-result-rank-label { margin-top: 0; font-size: 9px; }

  .bs-result-tag-row { flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
  .bs-result-tag { font-size: 9px; padding: 4px 10px; }
  .bs-result-match-num { font-size: 22px; }
  .bs-result-name { font-size: 17px; line-height: 1.5; margin-bottom: 6px; }
  .bs-result-price { font-size: 13px; margin-bottom: 12px; }
  .bs-result-bar { margin-bottom: 14px; }
  .bs-result-reason { padding: 10px 12px; margin-bottom: 14px; }
  .bs-reason-text { font-size: 12px; line-height: 1.7; }
  .bs-reason-label { font-size: 9px; margin-bottom: 4px; }

  .bs-feedback-row { flex-wrap: wrap; gap: 8px; }
  .bs-fb-btn { padding: 8px 14px; font-size: 11px; flex: 1 1 calc(50% - 4px); text-align: center; }
  .bs-detail-btn {
    margin-left: 0;
    width: 100%;
    padding: 11px 16px;
    font-size: 12px;
    margin-top: 4px;
  }

  .bs-learn-hint { padding: 18px 20px; flex-direction: column; text-align: center; gap: 10px; margin-bottom: 50px; }
  .bs-learn-hint-icon { font-size: 24px; }
  .bs-learn-hint-text { font-size: 11px; }

  /* メモパネル */
  .bs-memo-toggle {
    bottom: 16px;
    right: 16px;
    padding: 12px 18px;
    font-size: 12px;
  }
  .bs-memo-panel {
    width: 100%;
    padding: 24px 20px;
  }
  .bs-memo-eyebrow { font-size: 10px; }
  .bs-memo-title { font-size: 18px; }
  .bs-memo-desc { font-size: 11px; margin-bottom: 20px; }
  .bs-memo-section { margin-bottom: 22px; }
  .bs-memo-item { font-size: 12px; padding: 6px 0; }

  /* フッター */
  .bs-footer-inner { padding: 32px 16px; gap: 24px; }
  .bs-footer-cols { gap: 32px; flex-wrap: wrap; }
  .bs-footer-base { padding: 16px 20px; font-size: 10px; }
}

/* 小型スマートフォン (iPhone SE等) */
@media (max-width: 480px) {
  .bs-hero-title { font-size: 26px; }
  .bs-section-title { font-size: 22px; }
  .bs-cat-stage { width: 100px; height: 100px; }
  .bs-cat-stage svg { width: 95px !important; height: 95px !important; }
  .bs-cat-bg { width: 85px; height: 85px; }
  .bs-mascot-pair { gap: 0; }
  .bs-mascots-greeting { padding: 9px 14px; border-radius: 14px 14px 14px 4px; }
  .bs-greeting-text { font-size: 12px; }
  .bs-greeting-sub { font-size: 9px; }
  .bs-mascot-name { padding: 3px 8px; min-width: 60px; }
  .bs-mascot-name-jp { font-size: 10px; }
  .bs-mascot-name-role { font-size: 8px; }
  .bs-particle { font-size: 10px !important; }
  .bs-stat-num { font-size: 28px; }
  .bs-stat-unit { font-size: 14px; }
  .bs-cat-grid { grid-template-columns: 1fr; }
  .bs-cat-card-inner { min-height: auto; padding: 18px 16px; }
  .bs-result-title { font-size: 20px; }
  .bs-result-name { font-size: 16px; }
  .bs-breadcrumb { font-size: 10px; gap: 4px; }
  .bs-page-head { gap: 8px; }
  .bs-account-btn span:not(.bs-account-icon) { display: none; }
  .bs-account-btn { padding: 7px 10px; }
  .bs-msg-bubble { max-width: 85%; }
}
`;
