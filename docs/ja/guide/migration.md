# V5からの移行

## 環境API

新しい実験[環境API](/ja/guide/api-environment.md)の一部として、大きな内部リファクタリングが必要でした。 Vite 6は、ほとんどのプロジェクトが新しいメジャーにすばやくアップグレードできるように、変更を破ることを避けるよう努めています。エコシステムの大部分が安定して新しいAPIの使用を推奨するように移行するまで待ちます。いくつかのエッジケースがあるかもしれませんが、これらはフレームワークとツールによる低レベルの使用にのみ影響するはずです。エコシステムのメンテナーと協力して、リリース前にこれらの違いを軽減しました。回帰を見つけた場合は、[問題を開いて](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml)ください。

Viteの実装の変更により、一部の内部APIは削除されています。そのうちの1つに依存している場合は、[機能リクエスト](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml)を作成してください。

## ViteランタイムAPI

実験的なViteランタイムAPIは、新しい実験[環境API](/ja/guide/api-environment)の一部としてVite 6でリリースされたモジュールランナーAPIに進化しました。この機能が実験的であることを考えると、Vite 5.1で導入された以前のAPIの削除は壊れた変更ではありませんが、ユーザーはVite 6への移行の一部として使用をモジュールランナーに更新する必要があります。

## 一般的な変更

### `resolve.conditions`のデフォルト値

この変更は、 [`resolve.conditions`](/ja/config/shared-options#resolve-conditions) / [`ssr.resolve.conditions`](/ja/config/ssr-options#ssr-resolve-conditions) / [`ssr.resolve.externalConditions`](/ja/config/ssr-options#ssr-resolve-externalconditions)を構成しなかったユーザーには影響しません。

Vite 5では、 `resolve.conditions`のデフォルト値は`[]`で、一部の条件は内部で追加されました。 `ssr.resolve.conditions`のデフォルト値は`resolve.conditions`の値でした。

Vite 6から、一部の条件は内部で追加されなくなり、構成値に含める必要があります。
内部的に追加されなくなった条件

- `resolve.conditions`は「['モジュール」、「ブラウザ」、「開発」です|生産 '] `
- `ssr.resolve.conditions`は「['モジュール」、「ノード」、「開発」です|生産 '] `

これらのオプションのデフォルト値は、対応する値に更新され、 `ssr.resolve.conditions`デフォルト値として`resolve.conditions`使用しなくなります。 「開発」に注意してください|生産`is a special variable that is replaced with`生産`or`開発`depending on the value of` Process.ENV.NODE_ENV `. These default values are exported from ` Vite `as` DefaultClientConditions `and` DefaultServerConditions`。

`resolve.conditions`または`ssr.resolve.conditions`のカスタム値を指定した場合、新しい条件を含めるように更新する必要があります。
たとえば、以前に`resolve.conditions`に対して`['custom']`指定した場合、代わりに`['custom', ...defaultClientConditions]`指定する必要があります。

### json stringify

Vite 5では、 [`json.stringify: true`](/ja/config/shared-options#json-stringify)設定されると、 [`json.namedExports`](/ja/config/shared-options#json-namedexports)無効になりました。

Vite 6から、 `json.stringify: true`設定されている場合でも、 `json.namedExports`無効になり、値は尊重されます。以前の動作を達成したい場合は、 `json.namedExports: false`設定できます。

Vite 6は、 `'auto'`である`json.stringify`の新しいデフォルト値も導入します。この動作を無効にするには、 `json.stringify: false`設定します。

### HTML要素における資産参照の拡張サポート

Vite 5では、 `<link href>`などのViteによって処理およびバンドルされる資産を参照することができました`<img src>`

Vite 6は、サポートをさらに多くのHTML要素に拡張します。完全なリストは[、HTML機能](/ja/guide/features.html#html)ドキュメントにあります。

特定の要素でHTML処理をオプトアウトするには、要素に`vite-ignore`属性を追加できます。

### postcss-load-config

[`postcss-load-config`](https://npmjs.com/package/postcss-load-config) V4からV6に更新されました。 [`tsx`](https://www.npmjs.com/package/tsx)または[`jiti`](https://www.npmjs.com/package/jiti) 、 [`ts-node`](https://www.npmjs.com/package/ts-node)ではなくTypeScript PostCSS構成ファイルをロードするために必要です。また、YAML PostCSS構成ファイルをロードするには[`yaml`](https://www.npmjs.com/package/yaml)必要です。

### SASSは、デフォルトで最新のAPIを使用するようになりました

Vite 5では、レガシーAPIがデフォルトでSASSに使用されました。 Vite 5.4は、最新のAPIのサポートを追加しました。

Vite 6から、最新のAPIはデフォルトでSASSに使用されます。レガシーAPIを使用する場合は、 [`css.preprocessorOptions.sass.api: 'legacy'` / `css.preprocessorOptions.scss.api: 'legacy'`を](/ja/config/shared-options#css-preprocessoroptions)設定できます。ただし、レガシーAPIサポートはVite 7で削除されることに注意してください。

最新のAPIに移行するには、 [SASSドキュメント](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/)を参照してください。

### ライブラリモードでCSS出力ファイル名をカスタマイズします

Vite 5では、ライブラリモードのCSS出力ファイル名は常に`style.css`であり、Vite構成で簡単に変更することはできません。

Vite 6から、デフォルトのファイル名はJS出力ファイルと同様に`package.json`に`"name"`を使用します。 [`build.lib.fileName`](/ja/config/build-options.md#build-lib)文字列で設定されている場合、値はCSS出力ファイル名にも使用されます。別のCSSファイル名を明示的に設定するには、新しい[`build.lib.cssFileName`](/ja/config/build-options.md#build-lib)使用して構成できます。

移行するには、 `style.css`ファイル名に依存していた場合は、パッケージ名に基づいて新しい名前に参照を更新する必要があります。例えば:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

Vite 5のように`style.css`に固執したい場合は、代わりに`build.lib.cssFileName: 'style'`設定できます。

## 高度な

ほとんどのユーザーにのみ影響する他の壊れた変更があります。

- [[＃17922] Fix（CSS）！:SSR DEVでデフォルトインポートを削除します](https://github.com/vitejs/vite/pull/17922)
  - CSSファイルのデフォルトインポートのサポートは[Vite 4で非推奨され](https://v4.vite.dev/guide/migration.html#importing-css-as-a-string)、Vite 5で削除されましたが、SSR Devモードでは意図せずにサポートされていました。このサポートは削除されました。
- [[＃15637] fix！:ssrのデフォルト`build.cssMinify`から`'esbuild'`](https://github.com/vitejs/vite/pull/15637)
  - SSRビルドでも、デフォルトで[`build.cssMinify`](/ja/config/build-options#build-cssminify)有効になるようになりました。
- [[＃18070] feat！:websocketでプロキシバイパス](https://github.com/vitejs/vite/pull/18070)
  - Websocketアップグレード要求の場合は`server.proxy[path].bypass`が呼び出され、その場合、 `res`パラメーターは`undefined`なります。
- [[＃18209]リファクタル！:最小限のテルサーバージョンを5.16.0にバンプします](https://github.com/vitejs/vite/pull/18209)
  - [`build.minify: 'terser'`](/ja/config/build-options#build-minify)の最小限のサポートされているTerserバージョンは、5.4.0から5.16.0にバンプされました。
- [[＃18231] Chore（deps）:依存関係 @rollup/plugin-commonjsをV28に更新します](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires)はデフォルトで`true`なります（前に`'auto'`前）。
    - これにより、バンドルサイズが大きくなる可能性がありますが、より決定的なビルドになります。
    - CommonJSファイルをエントリポイントとして指定している場合は、追加の手順が必要になる場合があります。詳細については、 [CommonJSプラグインのドキュメント](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#using-commonjs-files-as-entry-points)をお読みください。
- [[＃18243]雑用（deps）！: `fast-glob`から`tinyglobby`を移動します](https://github.com/vitejs/vite/pull/18243)
  - 範囲ブレース（ `{01..03}` ）および増分ブレース（ `{2..8..2}` ） `['01', '02', '03']` `['2', '4', '6', '8']`グローブではサポートされなくなりました。
- [[＃18395] feat（resolve）！:条件を削除することを許可します](https://github.com/vitejs/vite/pull/18395)
  - このPRは、上記の「デフォルト値`resolve.conditions`のデフォルト値」として壊れた変化を導入するだけでなく、SSRのエクステルド化されていない依存関係に`resolve.mainFields`されないようになります。 `resolve.mainFields`使用していて、それをSSRの依存関係なしに適用したい場合は、 [`ssr.resolve.mainFields`](/ja/config/ssr-options#ssr-resolve-mainfields)使用できます。
- [[＃18493]リファクタリング！:Fs.CachedChecksオプションを削除します](https://github.com/vitejs/vite/pull/18493)
  - このオプトイン最適化は、キャッシュフォルダーにファイルを書き込み、すぐにインポートするエッジケースにより削除されました。
- ~~[[＃18697] fix（deps）！:依存関係dotenv-expandをv12に更新します](https://github.com/vitejs/vite/pull/18697)~~
  - ~~補間で使用される変数は、補間の前に宣言する必要があります。詳細については、 [`dotenv-expand` Changelogを](https://github.com/motdotla/dotenv-expand/blob/v12.0.1/CHANGELOG.md#1200-2024-11-16)参照してください。~~この壊れた変化は、v6.1.0で戻ってきました。
- [[＃16471] feat:V6-環境API](https://github.com/vitejs/vite/pull/16471)

  - SSRのみのモジュールの更新は、クライアントに完全なページリロードをトリガーしなくなりました。以前の動作に戻るには、カスタムViteプラグインを使用できます。
    <details>
    <summary>クリックして例を展開します</summary>

    ```ts twoslash
    import type { Plugin, EnvironmentModuleNode } from 'vite'

    function hmrReload(): Plugin {
      return {
        name: 'hmr-reload',
        enforce: 'post',
        hotUpdate: {
          order: 'post',
          handler({ modules, server, timestamp }) {
            if (this.environment.name !== 'ssr') return

            let hasSsrOnlyModules = false

            const invalidatedModules = new Set<EnvironmentModuleNode>()
            for (const mod of modules) {
              if (mod.id == null) continue
              const clientModule =
                server.environments.client.moduleGraph.getModuleById(mod.id)
              if (clientModule != null) continue

              this.environment.moduleGraph.invalidateModule(
                mod,
                invalidatedModules,
                timestamp,
                true,
              )
              hasSsrOnlyModules = true
            }

            if (hasSsrOnlyModules) {
              server.ws.send({ type: 'full-reload' })
              return []
            }
          },
        },
      }
    }
    ```

    </details>

## V4からの移行

最初にVite V5ドキュメントの[V4ガイドからの移行](https://v5.vite.dev/guide/migration.html)を確認して、アプリをVite 5に移植するために必要な変更を確認し、このページの変更を続行します。
