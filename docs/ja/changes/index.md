# 変化を破る

APIの非推奨、撤回、および変更を含むViteの破壊変化のリスト。以下の変更のほとんどは、Vite構成の[`future`オプション](/ja/config/shared-options.html#future)を使用してオプトインできます。

## 計画

これらの変更は、Viteの次のメジャーバージョンで計画されています。非推奨または使用警告は、可能な限りあなたを導き、フレームワーク、プラグインの著者、ユーザーにこれらの変更を適用するために手を差し伸べています。

- _まだ計画された変更はありません_

## 検討しています

これらの変更は考慮されており、多くの場合、現在の使用パターンを改善する予定の実験的APIです。すべての変更がここにリストされているわけではないため、完全なリストについては[、Vite Githubディスカッションの実験ラベル](https://github.com/vitejs/vite/discussions/categories/feedback?discussions_q=label%3Aexperimental+category%3AFeedback)をご覧ください。

これらのAPIに切り替えることはまだお勧めしません。彼らは私たちがフィードバックを収集するのを助けるためにViteに含まれています。これらの提案を確認し、リンクされたGithubディスカッションで使用するケースでそれらがどのように機能するかをお知らせください。

- [フックで`this.environment`](/ja/changes/this-environment-in-hooks)
- [HMR `hotUpdate`プラグインフック](/ja/changes/hotupdate-hook)
- [環境ごとのAPIに移動します](/ja/changes/per-environment-apis)
- [`ModuleRunner` APIを使用したSSR](/ja/changes/ssr-using-modulerunner)
- [ビルド中の共有プラグイン](/ja/changes/shared-plugins-during-build)

## 過去

以下の変更は行われたか戻ってきました。それらは、現在のメジャーバージョンではもはや関連していません。

- _過去の変更はまだありません_
