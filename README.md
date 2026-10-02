# AP Study

応用情報技術者試験(AP)の午前問題を演習する Web アプリです。

## 機能

- 分野(テクノロジ系 / マネジメント系 / ストラテジ系)・中分類を選んで出題
- 出題対象: すべて / 苦手な問題(前回不正解) / 未解答
- 1 問ごとに正誤と解説を表示(キーボード 1〜4 で解答、Enter で次へ)
- 結果画面で分野別正答率と間違えた問題の復習、解き直し
- 学習記録(問題ごとの解答回数・正答数)をブラウザの localStorage に保存

## 開発

```bash
npm install
npm run dev      # 開発サーバ
npm test         # テスト (Vitest)
npm run build    # 型チェック + 本番ビルド (dist/)
```

`dist/` は相対パスで出力されるため、GitHub Pages などの静的ホスティングにそのまま配置できます。

## 問題の追加

問題は `src/data/questions.ts` に定義します。

```ts
{
  id: 't-nw-004',           // 一意な ID(学習記録のキーなので変更しない)
  field: 'technology',      // technology | management | strategy
  category: 'ネットワーク',  // 中分類
  question: '問題文',
  choices: ['ア', 'イ', 'ウ', 'エ'],
  answer: 1,                // 正解のインデックス (0=ア 〜 3=エ)
  explanation: '解説',
}
```

`npm test` で ID の重複や選択肢の不備をチェックできます。

収録問題は試験形式に倣ったオリジナル問題です。IPA の過去問題を収録する場合は、IPA の利用条件を確認し、出典(年度・期・問番号)を明記してください。
