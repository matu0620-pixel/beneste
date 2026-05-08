# ベネステ行動ログ解析プロンプト

このプロンプトは、Claudeに `data/raw/` 内のJSON（拡張機能エクスポート）を渡して、`data/insights.json` を生成・更新してもらうためのものです。

## あなた（Claude）への指示

`data/raw/` フォルダ内の最新JSONファイルを読み込み、ユーザーの行動から好み傾向を抽出して、`data/insights.json` を以下の構造で**上書き**してください。

### 入力データの読み方

`data/raw/YYYY-MM-DD.json` に格納されている各ページ閲覧記録は次のフィールドを持ちます。

- `url` / `title` / `category` / `price` / `tags`: そのページの内容
- `visitCount`: 同じページを訪れた回数（高いほど興味強い）
- `dwellSeconds`: そのページに滞在した合計秒数（30秒以上で「読んだ」、180秒以上で「熟読」）
- `scrollDepth`: 0.0〜1.0、ページのどこまでスクロールしたか（0.7以上で「最後まで読んだ」）
- `clickCount` / `clicks`: クリックしたボタン・リンク（強い興味のシグナル）
- `firstVisitedAtISO` / `lastVisitedAtISO`: 期間がわかる

### 出力形式（厳守）

`data/insights.json` を以下のJSONスキーマで生成してください。

```json
{
  "schemaVersion": 1,
  "analyzedAt": "ISO8601タイムスタンプ（解析した時刻）",
  "rawDataSource": "data/raw/YYYY-MM-DD.json（参照したファイルパス）",
  "profile": {
    "preferences": {
      "categories": [
        { "name": "旅行・宿泊", "interest": 0.85, "reason": "全23件中9件で滞在も長い" }
      ],
      "priceRange": "1万〜2万円",
      "lifestyle": ["温泉好き", "週末利用", "家族と"],
      "avoidances": ["デート向け", "5万円超のプラン"]
    },
    "recentBehavior": "1〜2文の自然言語要約（ベネ太郎が口に出して言える長さ）"
  },
  "suggestions": {
    "travel": [
      {
        "rank": 1,
        "name": "サービス名",
        "tag": "短いタグ",
        "price": "¥xx,xxx",
        "match": 94,
        "reason": "ベネ太郎の推薦理由（1文）",
        "speakers": {
          "beneTaro": "…悪くない選択だな（ツンデレ短文）",
          "beneKichi": "ご家族でも楽しめますよ！（明るく短文）",
          "beneMaru": "間違いなき宿でござる（侍口調短文）"
        }
      }
    ],
    "gourmet": [...],
    "leisure": [...],
    "beauty": [...],
    "shopping": [...],
    "learning": [...],
    "family": [...],
    "life": [...]
  },
  "comments": {
    "beneTaro": "ホーム画面に出すコメント（ツンデレ口調・1〜2文）",
    "beneKichi": "ホーム画面に出すコメント（明るく前向き・1〜2文）",
    "beneMaru": "ホーム画面に出すコメント（古風な侍口調・1〜2文）"
  }
}
```

### 解析方針

1. **興味スコアの判定**
   - `dwellSeconds * scrollDepth + clickCount * 30 + visitCount * 60` を仮の興味スコアとして使う
   - カテゴリ別に合計し、上位カテゴリほど `interest` を高く設定

2. **価格帯の抽出**
   - 閲覧した `price` を集計し、よく見ている価格帯を1つの文字列で表現

3. **ライフスタイルタグ**
   - タイトル・タグ・カテゴリから「温泉」「家族」「ビジネス」「一人」など状況を表すキーワードを抽出
   - 3〜6個まで

4. **suggestions の生成**
   - 8カテゴリ全てに対して上位3件まで生成
   - 該当するページが少ないカテゴリは推測でも良いが、「あなたの傾向から」根拠を書く
   - `match` スコアは興味スコアと近接度から0〜100で算出

5. **キャラクターの口調を厳守**
   - **ベネ太郎**: ツンデレ猫、短く、皮肉と本音が混じる。「…ふん」「お前」「悪くない」
   - **ベネ吉**: 明るく前向きな子犬、応援系。「！」が多め。「〜ですね」「〜ですよ」
   - **ベネ丸**: 侍猫、古風口調。「〜でござる」「〜と申す」「〜なり」「お主」

6. **データが少ない場合**
   - ページ数が5件未満なら、「もう少し閲覧してください」というニュアンスをコメントに含めてOK

### 解析後の作業

1. `data/insights.json` を上書き保存
2. （任意）`data/history.json` の `entries` 配列に今回の概要を1件追加し時系列ログとして残す

```json
{
  "date": "2026-05-06",
  "topCategory": "旅行・宿泊",
  "topInterest": "温泉",
  "totalPages": 23,
  "rawDataSource": "data/raw/2026-05-06.json"
}
```

3. `git commit -m "Update insights from raw 2026-05-06"` してリポジトリにpushしてください
