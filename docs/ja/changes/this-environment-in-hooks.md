# フックで`this.environment`

::: tip Feedback
[環境APIフィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)でフィードバックを提供してください
:::

Vite 6の前に、2つの環境のみが利用可能でした: `client`と`ssr` 。 `resolveId` 、および`transform`単一の`options.ssr`プラグインフック引数により、プラグインの著者は`load`プラグインフックのモジュールを処理するときに、これら2つの環境を区別することができました。 Vite 6では、Viteアプリケーションは、必要に応じて、任意の数の指定環境を定義できます。プラグインコンテキストに`this.environment`導入して、フック内の現在のモジュールの環境と対話します。

影響範囲: `Vite Plugin Authors`

::: warning Future Deprecation
`this.environment` `v6.0`に導入されました。 `options.ssr`の非推奨は`v7.0`で計画されています。その時点で、新しいAPIを使用するようにプラグインを移行することを推奨し始めます。使用法を識別するには、Vite Configで`future.removePluginHookSsrArgument` `"warn"`設定します。
:::

## モチベーション

`this.environment`プラグインフックの実装が現在の環境名を知るだけでなく、環境設定オプション、モジュールグラフ情報、パイプ`environment.transformRequest()` `environment.moduleGraph`変換（ `environment.config` ）へのアクセスも提供します。コンテキストで環境インスタンスを使用できるようにすることで、プラグインの著者は開発者全体の依存関係を回避できます（通常、 `configureServer`フックを介して起動時にキャッシュされます）。

## 移行ガイド

既存のプラグインが迅速な移行を行うには、 `options.ssr`引数を`resolveId` 、および`transform`フックの`this.environment.name !== 'client'`に置き換えます`load`

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [！code-]
      const isSSR = this.environment.name !== 'client' // [！code ++]

      if (isSSR) {
        // SSR固有のロジック
      } else {
        // クライアント固有のロジック
      }
    },
  }
}
```

より堅牢な長期的な実装のために、プラグインフックは、環境名に依存する代わりに、きめ細かい環境オプションを使用して[複数の環境](/ja/guide/api-environment.html#accessing-the-current-environment-in-hooks)に対処する必要があります。
