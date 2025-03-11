# 環境ごとのAPIに移動します

::: tip Feedback
[環境APIフィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)でフィードバックを提供してください
:::

モジュールグラフとモジュール変換に関連する`ViteDevServer`からの複数のAPIが`DevEnvironment`インスタンスに移動されました。

影響範囲: `Vite Plugin Authors`

::: warning Future Deprecation
`Environment`インスタンスは最初に`v6.0`で導入されました。現在環境にある`server.moduleGraph`方法とその他の方法の非推奨が`v7.0`計画されています。サーバーメソッドから離れることはまだお勧めしません。使用法を識別するには、これらをvite構成に設定します。

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## モチベーション

Vite V5以前には、単一のVite Devサーバーには常に2つの環境（ `client`と`ssr` ）がありました。 `server.moduleGraph`は、これらの両方の環境から混合モジュールがありました。ノードは`clientImportedModules`つと`ssrImportedModules`リストを介して接続されていました（ただし、それぞれに1つの`importers`リストが維持されました）。変換されたモジュールは、 `id`および`ssr`ブールで表されました。このブール波は、たとえば`server.moduleGraph.getModuleByUrl(url, ssr)`と`server.transformRequest(url, { ssr })` 、APIに渡す必要がありました。

Vite V6では、現在`ssr`任意の数のカスタム環境（ `client`など）を作成できるようになりまし`edge` 。単一の`ssr`ブール値だけでは不十分です。 APIをフォーム`server.transformRequest(url, { environment })`に変更する代わりに、これらのメソッドを環境インスタンスに移動し、Vite Devサーバーなしで呼び出すことができます。

## 移行ガイド

- `server.moduleGraph` > [`environment.moduleGraph`](/ja/guide/api-environment#separate-module-graphs)
- `server.transformRequest(url, ssr)` > `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` > `environment.warmupRequest(url)`
