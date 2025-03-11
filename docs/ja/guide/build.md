# 生産のための建物

生産用にアプリを展開する時が来たら、 `vite build`コマンドを実行するだけです。デフォルトでは、ビルドエントリポイントとして`<root>/index.html`使用し、静的ホスティングサービスで提供するのに適したアプリケーションバンドルを生成します。人気のあるサービスに関するガイド用の[静的サイトの展開](./static-deploy)をご覧ください。

## ブラウザの互換性

デフォルトでは、生産バンドルは、[ネイティブESモジュール](https://caniuse.com/es6-module)、[ネイティブESMダイナミックインポート](https://caniuse.com/es6-module-dynamic-import)、 [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) 、 [Nullish Coalescing](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) 、 [Bigint](https://caniuse.com/bigint)などの最新のJavaScriptのサポートを想定しています。デフォルトのブラウザサポート範囲は次のとおりです。

<!-- Search for the `ESBUILD_MODULES_TARGET` constant for more information -->

- Chrome> = 87
- Firefox> = 78
- Safari> = 14
- エッジ> = 88

最低[`build.target`](/ja/config/build-options.md#build-target)は`es2015`です。より低い[`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta)が設定されている場合、Viteは[、ネイティブESMの動的インポート](https://caniuse.com/es6-module-dynamic-import)に依存しているため、これらの最小ブラウザサポート範囲を必要とします。

<!-- Search for the `defaultEsbuildSupported` constant for more information -->

- Chrome> = 64
- Firefox> = 67
- Safari> = 11.1
- エッジ> = 79

デフォルトでは、Viteは構文変換のみを処理し、**ポリフィルをカバーしていない**ことに注意してください。ユーザーのブラウザユーザーエージェント文字列に基づいてポリフィルバンドルを自動的に生成する[https://cdnjs.cloudflare.com/polyfill/を](https://cdnjs.cloudflare.com/polyfill/)ご覧ください。

レガシーブラウザーは、 [@Vitejs/Plugin-Legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)を介してサポートできます。これにより、レガシーチャンクと対応するES言語機能ポリフィルが自動的に生成されます。レガシーチャンクは、ネイティブのESMサポートがないブラウザでのみ条件付きでロードされます。

## パブリックベースパス

- 関連:[資産処理](./assets)

ネストされたパブリックパスの下でプロジェクトを展開する場合は、 [`base`構成オプション](/ja/config/shared-options.md#base)を指定するだけで、それに応じてすべてのアセットパスが書き換えられます。このオプションは、コマンドラインフラグ（例`vite build --base=/my/public/path/`として指定することもできます。

JS- `.html`ファイルのJSに輸入されたアセットURL、CSS `url()`参照、およびアセット参照はすべて、ビルド中にこのオプションを尊重するために自動的に調整されます。

例外は、その場でURLを動的に連結する必要がある場合です。この場合、パブリックベースパスになるグローバルに注入された`import.meta.env.BASE_URL`変数を使用できます。この変数は、ビルド中に静的に置き換えられているため、正確にそのまま表示する必要があります（ `import.meta.env['BASE_URL']` 、動作しません）。

高度なベースパス制御については、[高度なベースオプション](#advanced-base-options)をご覧ください。

### 相対的なベース

事前にベースパスがわからない場合は、 `"base": "./"`または`"base": ""`で相対的なベースパスを設定できます。これにより、生成されたすべてのURLが各ファイルに関連するようになります。

:::warning Support for older browsers when using relative bases

相対ベースには`import.meta`サポートが必要です。 [`import.meta`サポートしていないブラウザを](https://caniuse.com/mdn-javascript_operators_import_meta)サポートする必要がある場合は、 [`legacy`プラグイン](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)を使用できます。

:::

## ビルドのカスタマイズ

ビルドは、さまざまな[ビルド構成オプション](/ja/config/build-options.md)を介してカスタマイズできます。具体的には、 `build.rollupOptions`を介して基礎となる[ロールアップオプション](https://rollupjs.org/configuration-options/)を直接調整できます。

```js [vite.config.js]
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

たとえば、ビルド中にのみ適用されるプラグインを使用して複数のロールアップ出力を指定できます。

## チャンク戦略

チャンクが`build.rollupOptions.output.manualChunks`を使用して分割する方法を構成できます（[ロールアップドキュメント](https://rollupjs.org/configuration-options/#output-manualchunks)を参照）。フレームワークを使用する場合は、チャンクの分割方法を構成するためのドキュメントを参照してください。

## ロードエラー処理

Viteは、動的なインポートのロードに失敗したときに`vite:preloadError`イベントを発します。 `event.payload`は元のインポートエラーが含まれています。 `event.preventDefault()`電話すると、エラーはスローされません。

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // たとえば、ページを更新します
})
```

新しい展開が発生すると、ホスティングサービスは以前の展開からアセットを削除する場合があります。その結果、新しい展開の前にサイトにアクセスしたユーザーは、インポートエラーに遭遇する可能性があります。このエラーは、そのユーザーのデバイスで実行されているアセットが時代遅れであり、削除される対応する古いチャンクをインポートしようとするために発生します。このイベントは、この状況に対処するのに役立ちます。

## ファイルの変更を再構築します

`vite build --watch`でロールアップウォッチャーを有効にすることができます。または、基礎[`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) `build.watch`で直接調整できます。

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

`--watch`フラグが有効になっていると、バンドルするファイルと同様に`vite.config.js`の変更が変更されると、再構築がトリガーされます。

## マルチページアプリ

次のソースコード構造があるとします。

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

開発中は、単にナビゲートするか、 `/nested/`にリンクします。通常の静的ファイルサーバーのように、予想通りに機能します。

ビルド中、必要なのは、複数の`.html`ファイルをエントリポイントとして指定することだけです。

```js twoslash [vite.config.js]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

別のルートを指定する場合、入力パスを解決するときに`__dirname` vite.config.jsファイルのフォルダーであることを忘れないでください。したがって、 `resolve`引数に`root`エントリを追加する必要があります。

HTMLファイルの場合、Viteは`rollupOptions.input`オブジェクトのエントリに与えられた名前を無視し、代わりにDISTフォルダーでHTMLアセットを生成するときにファイルの解決されたIDを尊重することに注意してください。これにより、DEVサーバーの仕組みと一貫した構造が保証されます。

## ライブラリモード

ブラウザ指向のライブラリを開発している場合、実際のライブラリをインポートするテスト/デモページにほとんどの時間を費やしている可能性があります。 Viteを使用すると、その目的のために`index.html`使用して、スムーズな開発エクスペリエンスを得ることができます。

配布のためにライブラリをバンドルする時が来たら、 [`build.lib`構成オプション](/ja/config/build-options.md#build-lib)を使用します。また、ライブラリにバンドルしたくない依存関係を外部化してください。例: `vue`または`react` :

::: code-group

```js twoslash [vite.config.js (single entry)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // 適切な拡張機能が追加されます
      fileName: 'my-lib',
    },
    rollupOptions: {
      // バンドルしてはならないDEPSを外部化するようにしてください
      // あなたの図書館に
      external: ['vue'],
      output: {
        // UMDビルドで使用するグローバル変数を提供します
        // 外部化されたdepsの場合
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (multiple entries)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        secondary: resolve(__dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rollupOptions: {
      // バンドルしてはならないDEPSを外部化するようにしてください
      // あなたの図書館に
      external: ['vue'],
      output: {
        // UMDビルドで使用するグローバル変数を提供します
        // 外部化されたdepsの場合
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

エントリファイルには、パッケージのユーザーがインポートできるエクスポートが含まれます。

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

この構成で`vite build`実行すると、配送ライブラリに向けられ、2つのバンドル形式を作成するロールアッププリセットが使用されます。

- `es`および`umd` （シングルエントリ用）
- `es`および`cjs` （複数のエントリの場合）

形式は、 [`build.lib.formats`](/ja/config/build-options.md#build-lib)オプションで構成できます。

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

あなたのlibに推奨される`package.json` :

::: code-group

```json [package.json (single entry)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (multiple entries)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### CSSサポート

ライブラリがCSSをインポートする場合、構築されたJSファイル（ `dist/my-lib.css` ）以外の単一のCSSファイルとしてバンドルされます。名前は`build.lib.fileName`ですが、 [`build.lib.cssFileName`](/ja/config/build-options.md#build-lib)で変更することもできます。

ユーザーがインポートするために、 `package.json`のCSSファイルをエクスポートできます。

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip File Extensions
`package.json`に`"type": "module"`が含まれていない場合、Viteはnode.js互換性の異なるファイル拡張子を生成します。 `.js` `.mjs`なり、 `.cjs` `.js`になります。
:::

::: tip Environment Variables
ライブラリモードでは、生産用の構築時に[`import.meta.env.*`](./env-and-mode.md)使用量すべてが静的に置き換えられます。ただし、 `process.env.*`使用法はそうではないため、ライブラリの消費者は動的に変更できます。これが望ましくない場合は、 `define: { 'process.env.NODE_ENV': '"production"' }`使用して静的に置き換えるか、バンドラーとランタイムとのより良い互換性のために[`esm-env`](https://github.com/benmccann/esm-env)使用できます。
:::

::: warning Advanced Usage
ライブラリモードには、ブラウザ指向およびJSフレームワークライブラリ用のシンプルで意見のある構成が含まれています。非ブラウザーライブラリを構築している場合、または高度なビルドフローが必要な場合は、[ロールアップ](https://rollupjs.org)または[esbuildを](https://esbuild.github.io)直接使用できます。
:::

## 高度なベースオプション

::: warning
この機能は実験的です。[フィードバックを与えます](https://github.com/vitejs/vite/discussions/13834)。
:::

高度なユースケースの場合、展開された資産とパブリックファイルは、異なるキャッシュ戦略を使用するなど、異なるパスにある場合があります。
ユーザーは、3つの異なるパスで展開することを選択できます。

- 生成されたエントリHTMLファイル（SSR中に処理される場合があります）
- 生成されたハッシュアセット（JS、CSS、および画像などのその他のファイルタイプ）
- コピーされた[パブリックファイル](assets.md#the-public-directory)

これらのシナリオでは、単一の静的[ベースで](#public-base-path)は十分ではありません。 Viteは、 `experimental.renderBuiltUrl`を使用して、ビルド中の高度なベースオプションの実験的サポートを提供します。

```ts twoslash
import type { UserConfig } from 'vite'
// きれいなイグノア
const config: UserConfig = {
  // ---カット前---
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      } else {
        return { relative: true }
      }
    },
  },
  // ---カット後---
}
```

ハッシュされたアセットとパブリックファイルが一緒に展開されていない場合、各グループのオプションは、関数に与えられた`context`番目のパラマーに含まれるAsset `type`を使用して独立して定義できます。

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// きれいなイグノア
const config: UserConfig = {
  // ---カット前---
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      } else if (path.extname(hostId) === '.js') {
        return {
          runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
        }
      } else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    },
  },
  // ---カット後---
}
```

渡された`filename`はデコードされたURLであり、関数がURL文字列を返す場合、デコードする必要があることに注意してください。 Viteは、URLをレンダリングするときに自動的にエンコードを処理します。 `runtime`のオブジェクトが返される場合、ランタイムコードがそのままレンダリングされるため、必要な場合にエンコードを処理する必要があります。
