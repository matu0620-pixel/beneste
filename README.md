# ベネステAI検索

ベネフィットステーション専用のAIエージェント型コンシェルジュ。Chrome拡張機能でユーザーの自然な閲覧行動を観察し、Claudeに解析させた結果をWebアプリで「ベネ太郎・ベネ吉・ベネ丸」の3キャラがサジェストする仕組みです。

**AI APIを実装しません**。ユーザーが自分のClaude（チャットUIまたはClaude Code）で解析を行い、結果のJSONをGitHubにpush、Webアプリは静的にそれを読むだけ、というアーキテクチャです。

---

## アーキテクチャ全体図

```
[Chromeでベネステ閲覧]
        ↓ DOM観察
[Chrome拡張機能（content-script + service-worker）]
        ↓ chrome.storage.local に蓄積
[サイドパネルUI（このReactアプリ）]
        ↓ JSONエクスポート
[ローカルファイル（bs-data-YYYY-MM-DD.json）]
        ↓ ユーザーが data/raw/ に置いて push
[GitHubリポジトリ]
        ↓ ユーザーが自分のClaudeに解析依頼
[Claude が data/insights.json を生成・更新 → push]
        ↓ Vercelが自動再デプロイ
[Webアプリ表示（ベネ太郎たちがサジェスト）]
```

API課金ゼロ、ベネステの認証情報はChromeセッションに留まる、データは自分のリポジトリに置かれる、というクリーンな構成です。

---

## クイックスタート

### 1. リポジトリを準備

```bash
git clone <このリポジトリ>
cd beneste-ai-search-app
npm install
npm run build
```

`dist/` フォルダができれば成功です。

### 2. Chrome拡張機能として読み込む

1. Chromeで `chrome://extensions/` を開く
2. 右上の「**デベロッパーモード**」をオン
3. 「**パッケージ化されていない拡張機能を読み込む**」をクリック
4. `dist/` フォルダを選択

ツールバーに「ベネステAI検索」のアイコンが現れます。

### 3. データ収集 → 解析 → 反映のループ

詳しくは下の「データループの使い方」セクションを参照。

---

## ファイル構成

```
beneste-ai-search-app/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── public/
│   ├── manifest.json           ← Chrome拡張マニフェスト
│   ├── content-script.js       ← ベネステ閲覧時に裏で動くデータ収集
│   ├── service-worker.js       ← バックグラウンドで集約・保存
│   └── icons/                  ← 拡張機能アイコン
├── src/
│   ├── main.jsx
│   ├── App.jsx                 ← UI本体（サイドパネル＋Webアプリ兼用）
│   └── index.css
├── data/                       ← Claudeとの共有データ層
│   ├── raw/                    ← 拡張機能エクスポート（行動ログ）
│   │   └── (YYYY-MM-DD.json)
│   ├── insights.json           ← Claudeが生成する解析結果（最新）
│   └── history.json            ← 解析履歴（時系列の傾向変遷）
├── prompts/
│   └── analyze.md              ← Claudeへの解析指示
└── .claude/
    └── commands/               ← (任意) Claude Code用スラッシュコマンド
```

---

## データループの使い方

### Step 1: ベネステを普通に閲覧する

拡張機能を読み込んだ後、ブラウザでベネフィットステーションにいつものようにログインして、興味のあるサービスを見て回ってください。

裏で content-script.js がDOMから次の情報を取得しています:

- ページタイトル・カテゴリ・価格・タグ
- 滞在時間（visibility-API でタブ非アクティブ時は計測停止）
- スクロール深度（どこまで読んだか）
- クリックしたボタン・リンク

これらは chrome.storage.local に蓄積され、拡張アイコンに認識件数バッジが表示されます。

### Step 2: サイドパネルからエクスポート

1. ツールバーの拡張アイコンをクリック → サイドパネル展開
2. ヘッダーの「**データ同期**」ボタンをクリック
3. パネル内の「**JSONをエクスポート**」をクリック
4. `bs-data-YYYY-MM-DD.json` がダウンロードされます

### Step 3: GitHubに上げる

ダウンロードしたJSONをリポジトリの `data/raw/` フォルダに移動:

```bash
mv ~/Downloads/bs-data-2026-05-06.json /path/to/repo/data/raw/
cd /path/to/repo
git add data/raw/
git commit -m "Add raw data 2026-05-06"
git push
```

### Step 4: Claudeに解析依頼

Claudeのチャット（claude.ai）か Claude Code に、以下を伝えるだけです:

> `prompts/analyze.md` の指示に従って、`data/raw/` の最新ファイルを解析して `data/insights.json` を更新して、commit & push してください。

### Step 5: Webアプリに反映

`data/insights.json` が更新されてpushされると、Vercelが自動再デプロイします。Webアプリを開けば、ベネ太郎たちが解析結果を踏まえたコメントとサジェストを返してきます。

---

## Vercelにデプロイ（任意）

```bash
git push
```

[vercel.com](https://vercel.com/) で Add New → Project → リポジトリImport → Deploy。Viteが自動検出されます。

`vercel.json` で `data/*.json` も静的配信されるよう設定済みなので、Webアプリから `fetch('/data/insights.json')` で読めます。

---

## デザイン仕様

- **フォント**: Meiryo UI ベース
- **基調色**: 第一生命グループのコーポレートブルー (#003F8E)
- **キャラクター**: ベネ太郎（青魚・分析家）、ベネ吉（白い子犬・サポート役）、ベネ丸（侍猫・守護者）
- **レイアウト**: B2B SaaS的な落ち着いたトーン

---

## 本番展開時のカスタマイズ

1. **ベネステDOM構造への対応**: `public/content-script.js` の `extractMeta()` 内のセレクタを実際の構造に合わせて調整
2. **拡張アイコンの本番品質化**: `public/icons/` を差し替え
3. **複数ユーザー対応**: 各ユーザーが自分のリポジトリ・自分のClaudeで動かす形が原則

---

## ライセンス

社内検証用プロトタイプとして自由に改変・利用してください。
