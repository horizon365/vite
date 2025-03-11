# オプションを構築します

記載されていない限り、このセクションのオプションはビルドにのみ適用されます。

## build.target

- **タイプ:** `文字列 | 文字列[] `
- **デフォルト:** `'modules'`
- **関連:**[ブラウザの互換性](/ja/guide/build#browser-compatibility)

最終バンドルのブラウザ互換性ターゲット。デフォルト値は、[ネイティブESモジュール](https://caniuse.com/es6-module)、[ネイティブESMの動的インポート](https://caniuse.com/es6-module-dynamic-import)、 [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta)サポートを備えたブラウザをターゲットにするVite Special Value `'modules'`です。 Viteは`'modules'` `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`置き換えます

別の特別な値は`'esnext'`です。これは、ネイティブの動的輸入サポートを想定しており、最小限の輸送のみを実行します。

変換はesbuildで実行され、値は有効な[esbuildターゲットオプション](https://esbuild.github.io/api/#target)である必要があります。カスタムターゲットは、ESバージョン（EG `es2015` ）、バージョンを備えたブラウザ（ `chrome58` ）、または複数のターゲット文字列の配列のいずれかです。

注コードがEsbuildで安全に輸送できない機能が含まれている場合、ビルドが失敗することに注意してください。詳細については、 [esbuild docs](https://esbuild.github.io/content-types/#javascript)を参照してください。

## build.modulePreload

- **タイプ:** `Boolean | {polyfill？:boolean、resolvedependencies？:ResolvemodulePreloAddependenciesfn} `
- **デフォルト:** `{ polyfill: true }`

デフォルトでは、[モジュールのプリロードポリフィルが](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill)自動的に注入されます。ポリフィルは、各`index.html`エントリのプロキシモジュールに自動注入されます。ビルドが`build.rollupOptions.input`介して非HTMLカスタムエントリを使用するように構成されている場合、カスタムエントリでポリフィルを手動でインポートする必要があります。

```js
import 'vite/modulepreload-polyfill'
```

注:ポリフィルは[ライブラリモード](/ja/guide/build#library-mode)には適用され**ません**。ネイティブの動的インポートなしでブラウザをサポートする必要がある場合は、おそらくライブラリで使用を避ける必要があります。

ポリフィルは`{ polyfill: false }`を使用して無効にすることができます。

各動的インポートのプリロードへのチャンクのリストは、Viteによって計算されます。デフォルトでは、これらの依存関係をロードするときに`base`を含む絶対パスが使用されます。 `base`が相対（ `''`または`'./'` ）の場合、実行時に`import.meta.url`使用され、最終展開されたベースに依存する絶対パスを回避します。

`resolveDependencies`関数を使用して、依存関係リストとそれらのパスに対する細かい粒子制御を実験的にサポートしています。[フィードバックを与えます](https://github.com/vitejs/vite/discussions/13841)。タイプ`ResolveModulePreloadDependenciesFn`の関数を期待しています:

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    hostId: string
    hostType: 'html' | 'js'
  },
) => string[]
```

`resolveDependencies`関数は、それが依存するチャンクのリストを使用して各動的インポートに対して呼び出され、エントリHTMLファイルにインポートされた各チャンクに対しても呼び出されます。これらのフィルタリングされた依存関係またはより多くの依存関係を挿入し、それらのパスを変更して、新しい依存関係配列を返すことができます。 `deps`パスは`build.outDir`に関連しています。返品値は`build.outDir`への相対的なパスである必要があります。

```js twoslash
/** @type {import（ 'vite'）。userconfig} */
const config = {
  // きれいなイグノア
  build: {
    // ---カット前---
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        return deps.filter(condition)
      },
    },
    // ---カット後---
  },
}
```

分解された依存関係パスは、 [`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options)を使用してさらに変更できます。

## build.polyfillModulePreload

- **タイプ:** `boolean`
- **デフォルト:** `true`
- 代わりに非**推奨**使用`build.modulePreload.polyfill`

[モジュールのプリロードポリフィル](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill)を自動的に挿入するかどうか。

## build.outDir

- **タイプ:** `string`
- **デフォルト:** `dist`

出力ディレクトリを指定します（[プロジェクトルート](/ja/guide/#index-html-and-project-root)に関連して）。

## build.assetsDir

- **タイプ:** `string`
- **デフォルト:** `assets`

下のネスト生成資産にディレクトリを指定します（ `build.outDir`に比べて。これは[ライブラリモード](/ja/guide/build#library-mode)では使用されません）。

## build.assetsInlineLimit

- **タイプ:** `number` | `（（filepath:string、content:buffer）=> boolean | 未定義） `
- **デフォルト:** `4096` （4キブ）

このしきい値よりも小さいインポートまたは参照された資産は、追加のHTTP要求を避けるためにBase64 URLとしてインラードされます。 `0`に設定して、インラインを完全に無効にします。

コールバックが渡された場合、ブール値を返してオプトインまたはオプトアウトします。何も返されない場合、デフォルトのロジックが適用されます。

GIT LFSプレースホルダーは、表すファイルのコンテンツが含まれていないため、インラインから自動的に除外されます。

::: tip Note
`build.lib`指定した場合、 `build.assetsInlineLimit`無視され、ファイルサイズやGit LFSプレースホルダーであることに関係なく、常に資産がインラキングされます。
:::

## build.cssCodeSplit

- **タイプ:** `boolean`
- **デフォルト:** `true`

CSSコードの分割を有効/無効にします。有効にすると、Async JSチャンクにインポートされたCSSは、チャンクとして保存され、チャンクがフェッチされると一緒にフェッチします。

無効になっている場合、プロジェクト全体のすべてのCSSが単一のCSSファイルに抽出されます。

::: tip Note
`build.lib`指定した場合、 `build.cssCodeSplit`デフォルトとして`false`になります。
:::

## build.cssTarget

- **タイプ:** `文字列 | 文字列[] `
- **デフォルト:** [`build.target`](#build-target)と同じ

このオプションを使用すると、ユーザーはJavaScriptトランスピレーションに使用されているものからCSSの模倣の別のブラウザターゲットを設定できます。

非メインストリームブラウザをターゲットにしている場合にのみ使用する必要があります。
1つの例は、Android Wechat WebViewです。これは、ほとんどの最新のJavaScript機能をサポートしていますが、 [CSSの`#RGBA`ヘクサデシマルカラー表記を](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb_colors)サポートしていません。
この場合、Viteが`rgba()`色を`#RGBA`進表に変換するのを防ぐために、 `build.cssTarget` `chrome61`設定する必要があります。

## build.cssMinify

- **タイプ:** `Boolean | 「esbuild」 | 「lightningcss」
- **デフォルト:**クライアントの[`build.minify`](#build-minify)と同じ、SSRの場合は`'esbuild'`

このオプションを使用すると、ユーザーは`build.minify`ではなくCSSの模倣をオーバーライドすることができるため、JSとCSSの模倣を個別に構成できます。 Viteはデフォルトで`esbuild`使用してCSSを削除します。代わりに[稲妻CSS](https://lightningcss.dev/minification.html)を使用するには、オプションを`'lightningcss'`に設定します。選択した場合、 [`css.lightningcss`](./shared-options.md#css-lightningcss)使用して構成できます。

## build.sourcemap

- **タイプ:** `Boolean | '列をなして' | 「隠されています」
- **デフォルト:** `false`

生産ソースマップを生成します。 `true`の場合、個別のSourceMapファイルが作成されます。 `'inline'`場合、sourcemapは結果の出力ファイルにデータURIとして追加されます。バンドルされたファイルの対応するSourceMapコメントが抑制されていることを除いて、 `true`ように`'hidden'`動作があります。

## build.rollupOptions

- **タイプ:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

基礎となるロールアップバンドルを直接カスタマイズします。これは、ロールアップ構成ファイルからエクスポートできるオプションと同じで、Viteの内部ロールアップオプションと融合します。詳細については、[ロールアップオプションドキュメント](https://rollupjs.org/configuration-options/)を参照してください。

## build.commonjsOptions

- **タイプ:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

[@rollup/Plugin-Commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs)に渡すオプション。

## build.dynamicImportVarsOptions

- **タイプ:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)
- **関連:**[動的インポート](/ja/guide/features#dynamic-import)

[@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars)に渡すオプション。

## build.lib

- **タイプ:** `{entry:string | 弦[] | {[entrealias:string]:string}、name？:string、formats？:（ 'es' | 「CJS」 | 「umd」 | 'iife'）[]、filename？:文字列 | （（フォーマット:moduleformat、entryName:string）=> string）、cssfileName？:string} `
- **関連:**[ライブラリモード](/ja/guide/build#library-mode)

ライブラリとして構築します。ライブラリはEntryとしてHTMLを使用できないため、 `entry`必要です。 `name`露出したグローバル変数であり、 `formats` `'umd'`または`'iife'`含む場合に必要です。複数のエントリが使用される場合、デフォルト`formats` `['es', 'umd']`または`['es', 'cjs']`です。

`fileName`はパッケージファイル出力の名前で、デフォルトは`package.json`分の`"name"`になります。また、 `format`と`entryName`引数として取得し、ファイル名を返す関数として定義することもできます。

パッケージがCSSをインポートする場合、 `cssFileName`使用してCSSファイル出力の名前を指定できます。文字列を設定している場合、デフォルトは`fileName`と同じ値になります。そうしないと、 `package.json`分の`"name"`にも戻ります。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/main.js'],
      fileName: (format, entryName) => `my-lib-${entryName}.${format}.js`,
      cssFileName: 'my-lib-style',
    },
  },
})
```

## build.manifest

- **タイプ:** `Boolean | string`
- **デフォルト:** `false`
- **関連:**[バックエンド統合](/ja/guide/backend-integration)

ハッシュされたバージョンへの非ハッシュされたアセットファイル名のマッピングを含むマニフェストファイルを生成するかどうか。これをサーバーフレームワークで使用して、正しいアセットリンクをレンダリングすることができます。

値が文字列の場合、 `build.outDir`に対するマニフェストファイルパスとして使用されます。 `true`に設定すると、パスは`.vite/manifest.json`なります。

## build.ssrManifest

- **タイプ:** `Boolean | string`
- **デフォルト:** `false`
- **関連:**[サーバー側のレンダリング](/ja/guide/ssr)

スタイルリンクを決定するためのSSRマニフェストファイルを生成するかどうか、および生産におけるアセットプリロードディレクティブを決定します。

値が文字列の場合、 `build.outDir`に対するマニフェストファイルパスとして使用されます。 `true`に設定すると、パスは`.vite/ssr-manifest.json`なります。

## build.ssr

- **タイプ:** `Boolean | string`
- **デフォルト:** `false`
- **関連:**[サーバー側のレンダリング](/ja/guide/ssr)

SSR指向のビルドを生成します。値は、SSRエントリを直接指定する文字列`true`ある可能性があります`rollupOptions.input`

## build.emitAssets

- **タイプ:** `boolean`
- **デフォルト:** `false`

非クライアントビルド中、クライアントビルドの一部として放出されると想定されるため、静的資産は放出されません。このオプションにより、フレームワークは他の環境ビルドでそれらを強制的に放出できます。資産をポストビルドステップと統合することは、フレームワークの責任です。

## build.ssrEmitAssets

- **タイプ:** `boolean`
- **デフォルト:** `false`

SSRビルド中、クライアントビルドの一部として放出されると想定されるため、静的資産は放出されません。このオプションにより、フレームワークはクライアントとSSRビルドの両方でそれらを強制的に放出できます。資産をポストビルドステップと統合することは、フレームワークの責任です。このオプションは、環境APIが安定すると`build.emitAssets`に置き換えられます。

## build.minify

- **タイプ:** `Boolean | 「テルサー」 | 「esbuild」
- **デフォルト:**クライアントビルドの場合は`'esbuild'` 、SSRビルドの`false`

`false`に設定して、削除を無効にするか、使用するミニファイアを指定します。デフォルトは、Terserより20〜40倍高速で、圧縮が1〜2％しか速い[esbuild](https://github.com/evanw/esbuild)です。[ベンチマーク](https://github.com/privatenumber/minification-benchmarks)

`build.minify`オプションは、純粋な注釈を削除してツリーシェーキングを破壊するため、LIBモードで`'es'`形式を使用するときに、Whitespacesを縮小しないことに注意してください。

`'terser'`に設定されている場合は、Terserをインストールする必要があります。

```sh
npm add -D terser
```

## build.terserOptions

- **タイプ:** `TerserOptions`

Terserに渡すための追加の[マイニフィスオプション](https://terser.org/docs/api-reference#minify-options)。

さらに、 `maxWorkers: number`オプションを渡して、最大数の労働者を指定してスポーンすることもできます。デフォルトはCPUマイナス1の数です。

## build.write

- **タイプ:** `boolean`
- **デフォルト:** `true`

`false`に設定して、バンドルをディスクに書き込むことを無効にします。これは主に[プログラマティック`build()`コール](/ja/guide/api-javascript#build)で使用され、ディスクに書き込む前にバンドルのさらなる後処理が必要です。

## build.emptyOutDir

- **タイプ:** `boolean`
- **デフォルト:** `outDir`が`root`の場合は`true`

デフォルトでは、Viteがプロジェクトルート内にある場合、ビルドで`outDir`を空にします。重要なファイルが誤って削除されないように、 `outDir`ルートの外側にある場合、警告が発生します。このオプションを明示的に設定して、警告を抑制できます。これは、コマンドラインから`--emptyOutDir`としても利用できます。

## build.copyPublicDir

- **タイプ:** `boolean`
- **デフォルト:** `true`

デフォルトでは、Viteはビルドの`publicDir`から`outDir`にファイルをコピーします。これを無効にするために`false`に設定します。

## build.reportCompressedSize

- **タイプ:** `boolean`
- **デフォルト:** `true`

GZIP圧縮サイズのレポートを有効/無効にします。大規模な出力ファイルを圧縮すると遅くなる可能性があるため、これを無効にすると、大規模なプロジェクトのビルドパフォーマンスが向上する可能性があります。

## build.chunkSizeWarningLimit

- **タイプ:** `number`
- **デフォルト:** `500`

チャンクサイズの警告の制限（KB）。 [JavaScriptサイズ自体が実行時間に関連している](https://v8.dev/blog/cost-of-javascript-2019)ため、非圧縮チャンクサイズと比較されます。

## build.watch

- **タイプ:** [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) `| null`
- **デフォルト:** `null`

ロールアップウォッチャーを有効にするには、 `{}`に設定します。これは、主にビルドのみのプラグインまたは統合プロセスを含む場合に使用されます。

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

ファイルシステムがWSL2で動作しない場合があります。
詳細については、 [`server.watch`](./server-options.md#server-watch)参照してください。

:::
