# ベネステAI検索

福利厚生をAIがあなただけのために選び抜く、AI検索Webアプリのプロトタイプです。

ベネ太郎（AIキャラクター）がカテゴリーごとにヒアリングを行い、好みを学習しながらサジェスト精度を上げていく仕組みのデモ実装。Vite + React で構築され、Vercel に1クリックでデプロイできます。

---

## 動作環境

- Node.js 18 以上
- npm または yarn または pnpm

---

## ローカルで動かす

```bash
# 依存関係のインストール
npm install

# 開発サーバ起動（http://localhost:5173 で開きます）
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## GitHub に push する手順

### 1. GitHub で新規リポジトリを作成

[github.com/new](https://github.com/new) で新しいリポジトリを作ります。リポジトリ名は `beneste-ai-search` など任意で構いません。**README, .gitignore, license は追加しないでください**（既にローカル側にあるため）。

### 2. ローカルから push

このフォルダの中で次のコマンドを実行してください。`YOUR_USERNAME` と `REPO_NAME` は自分のものに置き換えてください。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

---

## Vercel にデプロイする手順

### 方法 A: Vercel ダッシュボードから（最も簡単）

1. [vercel.com](https://vercel.com/) にログインします（GitHub アカウントでログインするのが楽です）
2. ダッシュボードの **Add New → Project** をクリック
3. 先ほど push したリポジトリの **Import** ボタンを押す
4. 設定はそのまま（Vite が自動検出されます）で **Deploy** をクリック
5. 1〜2分でビルドが完了し、`https://[プロジェクト名].vercel.app` のURLが発行されます

### 方法 B: Vercel CLI から

```bash
# Vercel CLI をインストール
npm i -g vercel

# デプロイ（初回はログイン・プロジェクト設定の対話があります）
vercel

# 本番デプロイ
vercel --prod
```

### 自動デプロイ

Vercel に接続後は、GitHub の `main` ブランチに push するたびに自動でデプロイされます。プルリクエストごとに preview URL も自動発行されるので、開発フローとしてもそのまま使えます。

---

## ファイル構成

```
beneste-ai-search/
├── index.html              # HTMLエントリーポイント（titleタグなど）
├── package.json
├── vite.config.js
├── vercel.json             # Vercel SPA設定
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # Reactのマウントポイント
    ├── App.jsx             # アプリ本体（全コード・全スタイル含む）
    └── index.css           # グローバルリセット
```

`src/App.jsx` がアプリ本体で、データ・スタイル・キャラクターSVG・3画面（ホーム/チャット/結果）の全ロジックがこの1ファイルに含まれています。

---

## 機能

- **8カテゴリーのモック搭載**: 旅行・グルメ・レジャー・ビューティー・ショッピング・学び・育児介護・暮らし
- **キャラクター対話**: ベネ太郎が3問ヒアリングしてサジェスト
- **マッチ度可視化**: 各サジェストにマッチ度（％）を表示
- **フィードバック学習**: 「いいね／微妙」が右下のメモに反映され、次回のサジェストに使われる
- **メモパネル**: 蓄積された嗜好情報をいつでも確認可能
- **完全レスポンシブ**: モバイル・タブレット・デスクトップ対応

---

## 本番展開する場合のカスタマイズ

現状のサジェストデータはモック（`MOCK_SUGGESTIONS`）です。実運用では以下が必要になります。

1. **ベネフィットステーション側のデータ取得**: 公式提携・API連携 / ブラウザ拡張 / 手動マスタ整備のいずれか
2. **LLM API の接続**: ヒアリング応答とサジェスト生成を Claude API などに置き換え
3. **永続化**: ユーザープロファイルとメモをサーバーサイドDB（Supabase, PlanetScale など）に保存
4. **認証**: 会員IDでのログイン機構（Auth0, Clerk, NextAuth など）

---

## ライセンス

このコードは社内検証用プロトタイプとして自由に改変・利用してください。
