# `ModuleRunner` APIを使用したSSR

::: tip Feedback
[環境APIフィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)でフィードバックを提供してください
:::

`server.ssrLoadModule` 、[モジュールランナー](/ja/guide/api-environment#modulerunner)からのインポートに置き換えられました。

影響範囲: `Vite Plugin Authors`

::: warning Future Deprecation
`ModuleRunner`は最初に`v6.0`で導入されました。 `server.ssrLoadModule`の非難は、将来の専攻のために計画されています。使用法を識別するには、Vite構成で`future.removeSsrLoadModule` `"warn"`設定します。
:::

## モチベーション

`server.ssrLoadModule(url)`は、 `ssr`環境でモジュールをインポートすることを許可し、Vite Devサーバーと同じプロセスでのみモジュールを実行できます。カスタム環境を持つアプリの場合、それぞれが別のスレッドまたはプロセスで実行される可能性のある`ModuleRunner`に関連付けられています。モジュールをインポートするには、 `moduleRunner.import(url)`になりました。

## 移行ガイド

[Frameworks Guideの環境API](../guide/api-environment-frameworks.md)をご覧ください。
