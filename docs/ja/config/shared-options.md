# 共有オプション

記載されていない限り、このセクションのオプションはすべての開発、ビルド、プレビューに適用されます。

## 根

- **タイプ:** `string`
- **デフォルト:** `process.cwd()`

プロジェクトルートディレクトリ（ `index.html`があります）。絶対的なパス、または現在の作業ディレクトリに対するパスにすることができます。

詳細については、 [Project Rootを](/ja/guide/#index-html-and-project-root)参照してください。

## ベース

- **タイプ:** `string`
- **デフォルト:** `/`
- **関連:** [`server.origin`](/ja/config/server-options.md#server-origin)

開発または生産で提供される場合のパブリックパス。有効な値は次のとおりです。

- Absolute URL PathName、Eg `/foo/`
- フルURL、例えば`https://bar.com/foo/` （原点部分は開発では使用されないため、値は`/foo/`と同じです）
- 空の文字列または`./` （埋め込み展開用）

詳細については、[パブリックベースパス](/ja/guide/build#public-base-path)を参照してください。

## モード

- **タイプ:** `string`
- **デフォルト:**サーブ`'development'` 、ビルド用`'production'`

これを構成で指定すると**、サーブとビルドの両方の**デフォルトモードがオーバーライドされます。この値は、コマンドライン`--mode`オプションを介してオーバーライドすることもできます。

詳細については、 [ENV変数とモード](/ja/guide/env-and-mode)を参照してください。

## 定義する

- **タイプ:** `Record<string, any>`

グローバルな定数交換を定義します。エントリは、開発中にグローバルとして定義され、ビルド中に静的に交換されます。

Viteは[Esbuildが定義して](https://esbuild.github.io/api/#define)交換を実行するため、Value式はJSON-Serializable値（Null、Boolean、Number、String、Array、またはオブジェクト）または単一の識別子を含む文字列でなければなりません。非弦の値の場合、Viteは自動的に`JSON.stringify`の文字列に変換します。

**例:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip NOTE
TypeScriptユーザーの場合、タイプチェックとIntelliSenseを取得するには、 `env.d.ts`または`vite-env.d.ts`ファイルにタイプ宣言を追加してください。

例:

```ts
// Vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## プラグイン

- **タイプ:** `（プラグイン | プラグイン[] | 約束<プラグイン | プラグイン[]>）[] `

使用するプラグインの配列。 Falsyプラグインは無視され、プラグインの配列が平らになります。約束が返された場合、実行する前に解決されます。 Viteプラグインの詳細については、[プラグインAPIを](/ja/guide/api-plugin)参照してください。

## publicdir

- **タイプ:** `文字列 | false`
- **デフォルト:** `"public"`

単純な静的資産として機能するディレクトリ。このディレクトリのファイルは、開発中に`/`で提供され、ビルド中に`outDir`のルートにコピーされ、変換なしで常に提供またはコピーされます。値は、絶対ファイルシステムパスまたはプロジェクトルートに対するパスのいずれかです。

`publicDir` `false`として定義すると、この機能は無効になります。

詳細については、 [`public`ディレクトリ](/ja/guide/assets#the-public-directory)を参照してください。

## CACHEDIR

- **タイプ:** `string`
- **デフォルト:** `"node_modules/.vite"`

キャッシュファイルを保存するディレクトリ。このディレクトリのファイルは、事前にバンドルされたDEPまたはViteによって生成されたその他のキャッシュファイルであり、パフォーマンスを改善できます。 `--force`フラグを使用するか、ディレクトリを手動で削除してキャッシュファイルを再生できます。値は、絶対ファイルシステムパスまたはプロジェクトルートに対するパスのいずれかです。 package.jsonが検出されない場合、デフォルト`.vite`にデフォルト。

## resolve.alias

- **タイプ:**
  `record <string、string> | 配列<{find:string | regexp、交換:文字列、CustomResolver？:ResolverFunction | ResolverObject}> `

[エントリオプション](https://github.com/rollup/plugins/tree/master/packages/alias#entries)として`@rollup/plugin-alias`に渡されます。オブジェクトまたは`{ find, replacement, customResolver }`ペアの配列のいずれかにすることができます。

システムパスをファイルするためにエイリアシングするときは、常に絶対パスを使用します。相対的なエイリアス値はAS-ISで使用され、ファイルシステムパスに解決されません。

[プラグイン](/ja/guide/api-plugin)を介して、より高度なカスタム解像度を実現できます。

::: warning Using with SSR
[SSR外部化された依存関係](/ja/guide/ssr.md#ssr-externals)のエイリアスを構成している場合は、実際の`node_modules`パッケージをエイリアスすることができます。 [YARN](https://classic.yarnpkg.com/ja/docs/cli/add/#toc-yarn-add-alias)と[PNPMの](https://pnpm.io/aliases/)両方が、 `npm:`プレフィックスを介してエイリアシングをサポートします。
:::

## resolve.dedupe

- **タイプ:** `string[]`

アプリの同じ依存関係のコピーを複製している場合（おそらくモノレポスの巻き戻しまたはリンクパッケージが原因）、このオプションを使用して、Viteを強制的に（プロジェクトルートから）同じコピーにリストされた依存関係を常に解決します。

:::warning SSR + ESM
SSRビルドの場合、 `build.rollupOptions.output`から構成されたESMビルド出力で重複排除は機能しません。回避策は、ESMがモジュールの読み込みにより良いプラグインサポートがあるまで、CJSビルド出力を使用することです。
:::

## resolve.conditions

- **タイプ:** `string[]`
- **デフォルト:** `['Module'、 'Browser'、 '開発|生産 '] ` (` DefaultClientConditions`）

パッケージから[条件付き輸出](https://nodejs.org/api/packages.html#packages_conditional_exports)を解決する際の追加の条件。

条件付き輸出を備えたパッケージには、 `package.json`に次の`exports`フィールドがある場合があります。

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

ここでは、 `import`と`require`は「条件」です。条件はネストでき、最も特定のものから最も特異的なものに指定する必要があります。

`開発|生産`is a special value that is replaced with`生産`or`開発`depending on the value of`Process.ENV.NODE_ENV`. It is replaced with `生産`when`プロセス。ENV.NODE_ENV=== '生産' `and`開発 `。

要件が満たされている場合、 `import` `require`条件が常に`default`されることに注意してください。

:::warning Resolving subpath exports
「/」で終わるエクスポートキーはノードによって非推奨であり、うまく機能しない場合があります。代わりに、パッケージの著者に連絡して、 [`*`サブパスパターン](https://nodejs.org/api/packages.html#package-entry-points)を使用してください。
:::

## resolve.mainFields

- **タイプ:** `string[]`
- **デフォルト:** `['browser', 'module', 'jsnext:main', 'jsnext']` （ `defaultClientMainFields` ）

パッケージのエントリポイントを解決するときに試してみる`package.json`のフィールドのリスト。注これは、 `exports`フィールドから解決された条件付きエクスポートよりも優先されます。2 `exports`エントリポイントが正常に解決された場合、メインフィールドは無視されます。

## resolve.extensions

- **タイプ:** `string[]`
- **デフォルト:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

拡張機能を省略するインポートを試すファイル拡張子のリスト。 IDEとタイプのサポートに干渉できるため、カスタムインポートタイプの拡張機能を省略することはお勧めし**ません**（例: `.vue` ）。

## resolve.preserveSymlinks

- **タイプ:** `boolean`
- **デフォルト:** `false`

この設定を有効にすると、Viteは、実際のファイルパス（つまり、シンリンク後の後のパス）の代わりに、元のファイルパス（つまり、シンリンクに従わないパス）でファイルIDを決定します。

- **関連:** [esbuild＃preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks) 、[webpack＃resolve.symlinks
  ]（ [https://webpack.js.org/configuration/Resolve/#resolvesymlinks](https://webpack.js.org/configuration/resolve/#resolvesymlinks) ）

## html.cspNonce

- **タイプ:** `string`
- **関連:**[コンテンツセキュリティポリシー（CSP）](/ja/guide/features#content-security-policy-csp)

スクリプト /スタイルのタグを生成するときに使用されるNonCE値プレースホルダー。この値を設定すると、NonCe値のメタタグも生成されます。

## css.modules

- **タイプ:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * デフォルト:未定義
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

CSSモジュールの動作を構成します。オプションは[PostCSSモジュール](https://github.com/css-modules/postcss-modules)に渡されます。

このオプションは[、Lightning CSS](../guide/features.md#lightning-css)を使用する場合、効果はありません。有効にする場合、代わりに[`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html)使用する必要があります。

## css.postcss

- **タイプ:** `文字列 | （postcss.processoptions＆{プラグイン？:postcss.acceptedplugin []}） `

インラインPOSTCSS構成または（デフォルトはProject Root）からPOSTCSS構成を検索するカスタムディレクトリ。

インラインPOSTCSS構成の場合、 `postcss.config.js`と同じ形式が予想されます。ただし、 `plugins`プロパティでは、[配列形式](https://github.com/postcss/postcss-load-config/blob/main/README.md#array)のみを使用できます。

検索は[PostCSS-Load-Config](https://github.com/postcss/postcss-load-config)を使用して行われ、サポートされている構成ファイル名のみがロードされます。ワークスペースルート（またはワークスペースが見つからない場合は[プロジェクトルート](/ja/guide/#index-html-and-project-root)）の外側の構成ファイルは、デフォルトで検索されません。必要に応じて、ルートの外側のカスタムパスを指定して、代わりに特定の構成ファイルを代わりにロードできます。

注インライン構成が提供されている場合、Viteは他のPostCSS構成ソースを検索しません。

## css.preprocessorOptions

- **タイプ:** `Record<string, object>`

CSSの前処理者に渡すオプションを指定します。ファイル拡張機能は、オプションのキーとして使用されます。各プリプロセッサのサポートされているオプションは、それぞれのドキュメントにあります。

- `sass` / `scss` :
  - `API:" Modern-Compiler "で使用するSASS APIを選択します | "モダンな" | 「レガシー」 `(default`「モダンコンパイラ」`if`サス埋め込まれた`is installed, otherwise`「モダン」`). For the best performance, it's recommended to use `API: "Modern-compiler"`with the` Sass-埋め込まれた`package. The`"レガシー"`APIは非推奨で、Vite 7で削除されます。
  - [オプション（モダン）](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
  - [オプション（レガシー）](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions) 。
- `less` :[オプション](https://lesscss.org/usage/#less-options)。
- `styl` / `stylus` :サポートされているのは[`define`](https://stylus-lang.com/docs/js.html#define-name-node)だけで、オブジェクトとして渡すことができます。

**例:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // または「モダン」、「レガシー」
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **タイプ:** `文字列 | （（ソース:string、filename:string）=>（string | {content:string;マップ？:sourcemap}）） `

このオプションは、各スタイルコンテンツに追加のコードを挿入するために使用できます。変数だけでなく実際のスタイルを含める場合、これらのスタイルは最終バンドルで複製されることに注意してください。

**例:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

## css.preprocessorMaxWorkers

- **実験:**[フィードバックを与える](https://github.com/vitejs/vite/discussions/15835)
- **タイプ:** `番号 | true`
- **デフォルト:** `0` （労働者を作成してメインスレッドで実行しません）

このオプションが設定されている場合、CSSプレプロセッサは可能な場合は労働者で実行されます。 `true` 、CPUマイナス1の数を意味します。

## css.devSourcemap

- **実験:**[フィードバックを与える](https://github.com/vitejs/vite/discussions/13845)
- **タイプ:** `boolean`
- **デフォルト:** `false`

開発中にSourcemapsを有効にするかどうか。

## css.transformer

- **実験:**[フィードバックを与える](https://github.com/vitejs/vite/discussions/13835)
- **タイプ:** `'postcss' | 「lightningcss」
- **デフォルト:** `'postcss'`

CSS処理に使用されるエンジンを選択します。詳細については、 [Lightning CSS](../guide/features.md#lightning-css)をご覧ください。

::: info Duplicate `@import`s
PostCSS（PostCSS-Import）は、ブラウザから`@import`複製した異なる動作をしていることに注意してください。 [postcss/postcss-import＃462を](https://github.com/postcss/postcss-import/issues/462)参照してください。
:::

## css.lightningcss

- **実験:**[フィードバックを与える](https://github.com/vitejs/vite/discussions/13835)
- **タイプ:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Lightning CSSを構成します。完全な変換オプションは[、Lightning CSSリポジトリ](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts)にあります。

## json.namedExports

- **タイプ:** `boolean`
- **デフォルト:** `true`

`.json`ファイルからの名前付きインポートをサポートするかどうか。

## json.stringify

- **タイプ:** `Boolean | 'auto' `
- **デフォルト:** `'auto'`

`true`に設定すると、インポートされたJSONは`export default JSON.parse("...")`に変換されます。これは、特にJSONファイルが大きい場合、オブジェクトリテラルよりもはるかにパフォーマンスがあります。

`'auto'`に設定されている場合、データ[が10kbより大きい](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger)場合にのみ、データが描画されます。

## esbuild

- **タイプ:** `esbuildoptions | false`

`ESBuildOptions` [Esbuild自身の変換オプション](https://esbuild.github.io/api/#transform)を拡張します。最も一般的なユースケースは、JSXのカスタマイズです。

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

デフォルトでは、EsBuildは`ts` `jsx`ファイルに適用されます`tsx`これは、 `esbuild.include`と`esbuild.exclude`でカスタマイズできます。これは、正規表現、[ピコマッチ](https://github.com/micromatch/picomatch#globbing-features)パターン、またはどちらの配列でもあります。

さらに、 `esbuild.jsxInject`使用して、esbuildによって変換されたすべてのファイルに対してJSXヘルパーのインポートを自動的に注入することもできます。

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

[`build.minify`](./build-options.md#build-minify)が`true`場合、すべてのマイニル最適化がデフォルトで適用されます。その[特定の側面](https://esbuild.github.io/api/#minify)を無効にするには、 `esbuild.minifyIdentifiers` 、または`esbuild.minifyWhitespace` `esbuild.minifySyntax`を`false`に設定します。注`esbuild.minify`オプションを使用して`build.minify`オーバーライドできません。

`false`に設定して、ESBUILD変換を無効にします。

## AssetsClude

- **タイプ:** `文字列 | regexp | （弦 | regexp）[] `
- **関連:**[静的資産処理](/ja/guide/assets)

静的資産として扱う追加の[Picomatchパターン](https://github.com/micromatch/picomatch#globbing-features)を指定して、次のように指定してください。

- HTMLから参照される場合、または`fetch`またはXHRを超えて直接要求されると、プラグイン変換パイプラインから除外されます。

- JSからそれらをインポートすると、解決されたURL文字列が返されます（アセットタイプを異なる方法で処理するための`enforce: 'pre'`プラグインがある場合、これは上書きできます）。

組み込みの資産タイプリストは[こちらを](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts)ご覧ください。

**例:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## loglevel

- **タイプ:** `'info' | 「警告」 | 'エラー' | 「サイレント」

コンソール出力の冗長性を調整します。デフォルトは`'info'`です。

## CustomLogger

- **タイプ:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

カスタムロガーを使用してメッセージを記録します。 Viteの`createLogger` APIを使用してデフォルトのロガーを取得し、たとえばメッセージを変更したり、特定の警告をフィルタリングしたりするようにカスタマイズできます。

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // 空のCSSファイルの警告を無視します
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## クリアスクリーン

- **タイプ:** `boolean`
- **デフォルト:** `true`

特定のメッセージを記録するときに、Viteが端子画面をクリアするのを防ぐために`false`に設定します。コマンドラインを介して、 `--clearScreen false`使用します。

## envdir

- **タイプ:** `string`
- **デフォルト:** `root`

`.env`ファイルがロードされるディレクトリ。絶対的なパス、またはプロジェクトルートに関連するパスにすることができます。

環境ファイルの詳細については、[こちらを](/ja/guide/env-and-mode#env-files)ご覧ください。

## envprefix

- **タイプ:** `文字列 | 文字列[] `
- **デフォルト:** `VITE_`

`envPrefix`から始まるenv変数は、import.meta.envを介してクライアントソースコードに公開されます。

:::warning SECURITY NOTES
`envPrefix` `''`として設定しないでください。これにより、すべてのENV変数が公開され、機密情報の予期せぬ漏れが発生します。 Viteは`''`検出するときにエラーを投げます。

再固定されていない変数を公開する場合は、[定義](#define)を使用してそれを公開できます。

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## AppType

- **タイプ:** `'スパ' | 「MPA」 | 「カスタム」
- **デフォルト:** `'spa'`

アプリケーションが単一ページアプリケーション（SPA）、[マルチページアプリケーション（MPA）](../guide/build#multi-page-app) 、またはカスタムアプリケーション（カスタムHTML処理を備えたSSRおよびフレームワーク）であるかどうか:

- `'spa'` :HTMLミドルウェアを含め、スパフォールバックを使用します。プレビューで`single: true`で[SIRV](https://github.com/lukeed/sirv)を構成します
- `'mpa'` :HTML MiddleWaresを含めます
- `'custom'` :HTML MiddleWaresを含めないでください

Viteの[SSRガイド](/ja/guide/ssr#vite-cli)で詳細をご覧ください。関連: [`server.middlewareMode`](./server-options#server-middlewaremode) 。

## 未来

- **タイプ:** `レコード<文字列、 '警告' | 未定義> `
- **関連:**[変更を破る](/ja/changes/)

将来の破壊的な変更を有効にして、Viteの次のメジャーバージョンへのスムーズな移行に備えます。リストは、新機能が開発されているため、いつでも更新、追加、または削除することができます。

可能なオプションの詳細については、 [Breaking Change](/ja/changes/)ページを参照してください。
