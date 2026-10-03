# AP Study

応用情報技術者試験(AP)の午前問題を演習する Web アプリです。

## 機能

| 画面 | URL | 内容 |
|---|---|---|
| ホーム | `#/` | 午前・午後の進捗、最近解いた問題、各機能への入口 |
| 過去問倉庫 | `#/exams` → `#/exams/<試験ID>` | 年度ごとの問題一覧(未解答・不正解・ブックマークで絞り込み)。午前は本番形式で通し演習も可能 |
| 午前の問題 | `#/q/<問題ID>` | 一問一答(4 択)。正誤と解説、前後の問題へ移動、ブックマーク、メモ、これまでの正答率 |
| 午後の問題 | `#/pm/<問題ID>` | 問題冊子のページ画像 + 解答欄ごとの一問一答(記号は選択式、記述は入力して自己採点)。解答用紙モードでまとめて解くことも可能 |
| 分野別 | `#/fields` → `#/fields/<分野>` | 全年度を中分類・出題分野ごとに横断表示 |
| 演習 | `#/practice` | 試験・分野・出題対象(全問/苦手/未解答)・出題順を選んで連続で解く |
| 検索 | `#/search?q=<キーワード>` | 問題文・選択肢・解説から検索 |
| ブックマーク | `#/bookmarks` | ブックマークした問題とメモのある問題 |
| 記録 | `#/stats` | 分野別の正答率、間違えた問題・解答欄の一覧 |
| アカウント | `#/account` | メールのログインコードでログインし、学習記録を端末間で同期 |

学習記録(解答履歴・ブックマーク・メモ)はブラウザの localStorage に保存し、ログイン中は Supabase と自動で同期します。各記録に更新時刻を持たせ、レコード単位で新しい方を採用してマージするので、複数端末で別々に解いた記録も失われません(`src/lib/userData.ts`, `src/lib/sync.ts`)。

## ホーム画面への追加とオフライン

PWA として動く(`vite-plugin-pwa`、設定は `vite.config.ts`)。iPhone は Safari の共有 →「ホーム画面に追加」、Android は Chrome のメニュー →「ホーム画面に追加」で、全画面のアプリとして起動できる。

- アプリ本体と午前の図は、初回に開いたときに Service Worker が保存する(圏外でも解ける)
- 午後の問題冊子のページ画像(全体で約 32MB)は開いたものから保存する。アカウント画面の「すべて保存」でまとめて保存できる(`src/lib/offline.ts`)
- 圏外で解いた記録は localStorage に保存され、通信が戻ると自動で同期する
- 新しいバージョンを公開すると「新しいバージョンがあります」と表示され、「更新」で切り替わる(演習の途中で勝手に再読み込みはしない)

## Supabase の設定(端末間同期)

接続先は `src/lib/supabase.ts` に書いてある(別のプロジェクトを使うときは `.env.local` に `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY` を設定)。プロジェクト側では次を一度だけ行う。

1. **SQL Editor** で `supabase/schema.sql` を実行する(テーブル作成と行レベルセキュリティ)
2. **Authentication → Emails → SMTP Settings** で独自の SMTP(例: Gmail のアプリパスワード)を設定する(標準のメールは本文を編集できないため)
3. **Authentication → Emails** の「Magic link or OTP」と「Confirm sign up」の本文に、ログインコード `{{ .Token }}` を入れる
4. **Authentication → URL Configuration** の Site URL / Redirect URLs に公開先の URL(https://moriq-maker.github.io/AP_Study/)を登録する

## 収録問題

| 試験 | 問題数 | 備考 |
|---|---|---|
| 令和7年度 秋期 午前 | 80 | IPA 公開問題。解説は本アプリ独自 |
| 令和7年度 秋期 午後 | 11 | IPA 公開問題。問題はページ画像で表示、解答例・出題趣旨は IPA 公表のもの |
| 令和6年度 秋期 午前 | 80 | IPA 公開問題。解説は本アプリ独自 |
| 令和6年度 秋期 午後 | 11 | IPA 公開問題。問題はページ画像で表示、解答例・出題趣旨は IPA 公表のもの |
| 令和5年度 秋期 午前 | 80 | IPA 公開問題。解説は本アプリ独自 |
| 令和5年度 秋期 午後 | 11 | IPA 公開問題。問題はページ画像で表示、解答例・出題趣旨は IPA 公表のもの |
| 令和4年度 秋期 午前 | 80 | IPA 公開問題。解説は本アプリ独自 |
| 令和4年度 秋期 午後 | 11 | IPA 公開問題。問題はページ画像で表示、解答例・出題趣旨は IPA 公表のもの |
| 令和3年度 秋期 午前 | 80 | IPA 公開問題。解説は本アプリ独自 |
| 令和3年度 秋期 午後 | 11 | IPA 公開問題。問題はページ画像で表示、解答例・出題趣旨は IPA 公表のもの |
| 令和2年度 秋期 午前 | 80 | IPA 公開問題。解説は本アプリ独自 |
| 令和2年度 秋期 午後 | 11 | IPA 公開問題。問題はページ画像で表示、解答例・出題趣旨は IPA 公表のもの。問題冊子に添付の正誤表も表示 |
| オリジナル問題 | 35 | 試験形式に倣ったオリジナル |

## 開発

```bash
npm install
npm run dev      # 開発サーバ
npm test         # テスト (Vitest)
npm run build    # 型チェック + 本番ビルド (dist/)
```

`dist/` は相対パスで出力されるため、GitHub Pages などの静的ホスティングにそのまま配置できます。

### 公開(GitHub Pages)

デフォルトブランチに push すると、GitHub Actions(`.github/workflows/deploy.yml`)がテストとビルドを行い、https://moriq-maker.github.io/AP_Study/ に公開します。初回だけ、リポジトリの Settings → Pages → Source を「GitHub Actions」にしておく必要があります。

## 試験の追加

1. `src/data/exams/<試験ID>.ts` を作る(例: `r06-spring-am.ts`)。`r07-autumn-am.ts` を雛形にし、`EXAM` に試験名・並び順・出典表記を書く
2. `QUESTIONS` に `q(問番号, 分野, 中分類, 問題文, [ア, イ, ウ, エ], '正解', 解説, { tables, figures, choiceFigure })` で問題を並べる
3. 図は `public/figures/<試験ID>/` に置き、`figures` / `choiceFigure` に `figures/<試験ID>/q10.png` のように指定する
4. `src/data/index.ts` の `MODULES` に登録する
5. `src/data/questions.test.ts` に公式解答例の正解列を追加し、`npm test` で照合する

### 午後試験

1. 問題冊子の各ページを `public/figures/<試験ID>/pNN.webp` として書き出す(例: `pdftoppm -r 150 -gray` → `convert -fuzz 25% -trim -quality 55`)
2. `src/data/exams/r07-autumn-pm.ts` を雛形に、問ごとのページ範囲・出題趣旨・解答欄(`exact` は自動採点、`free` は自己採点)を書く(補助関数は `written-helpers.ts`)
3. `src/data/index.ts` の `PM_MODULES` に登録する

問題 ID(`<試験ID>-<問番号>`)は学習記録のキーなので、一度公開したら変更しないこと。

IPA の過去問題を収録する場合は、IPA の利用条件を確認し、出典を明記してください。
