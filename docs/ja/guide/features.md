# 特徴

非常に基本的なレベルでは、Viteを使用して開発することは、静的ファイルサーバーの使用とそれほど違いはありません。ただし、Viteは、バンドラーベースのセットアップで一般的に見られるさまざまな機能をサポートするために、ネイティブESMのインポートに関する多くの機能強化を提供します。

## NPM依存関係解決と事前バンドル

ネイティブESの輸入は、次のような裸のモジュールのインポートをサポートしていません。

```js
import { someMethod } from 'my-dep'
```

上記は、ブラウザにエラーが発生します。 Viteは、提供されるすべてのソースファイルでこのようなベアモジュールのインポートを検出し、以下を実行します。

1. ページの読み込み速度を改善し、CommonJS / UMDモジュールをESMに変換するために、それらを[事前にバンドルします](./dep-pre-bundling)。事前バンドルステップは[EsBuild](http://esbuild.github.io/)で実行され、Viteの寒い開始時間は、JavaScriptベースのバンドラーよりも大幅に速くなります。

2. ブラウザが適切にインポートできるように、 `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd`ような有効なURLにインポートを書き換えます。

**依存関係は強くキャッシュされています**

httpヘッダーを介してVite Cachesの依存関係要求が要求されるため、依存関係をローカルに編集/デバッグする場合は、[こちらの](./dep-pre-bundling#browser-cache)手順に従ってください。

## ホットモジュールの交換

Viteは、ネイティブESMよりも[HMR API](./api-hmr)を提供します。 HMR機能を備えたフレームワークは、APIを活用して、ページをリロードしたり、アプリケーション状態を吹き飛ばすことなく、即座に正確な更新を提供できます。 Viteは[、VUEシングルファイルコンポーネント](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)のファーストパーティHMR統合を提供し、[迅速にリフレッシュします](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)。また、 [@freath/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite)を介して事前に統合されている公式統合もあります。

これらを手動でセットアップする必要はないことに注意してください - [`create-vite`を介してアプリを作成する](./)とき、選択したテンプレートはすでにあなたのために事前に構成されています。

## タイプスクリプト

Viteは、箱から出して`.ts`ファイルをインポートすることをサポートしています。

### 透過剤のみ

Viteは`.ts`ファイルでのみトランスピレーションを実行し、タイプチェックを実行**しない**ことに注意してください。タイプチェックがIDEおよびビルドプロセスによって処理されると仮定します。

Viteが変換プロセスの一部としてタイプチェックを実行しない理由は、2つのジョブが根本的に異なって機能するためです。輸送はファイルごとに動作し、Viteのオンデマンドコンパイルモデルと完全に整合します。それに比べて、タイプチェックには、モジュールグラフ全体の知識が必要です。 Viteの変換パイプラインにチェックする靴馬のタイプは、必然的にViteのスピードメリットを妥協します。

Viteの仕事は、ソースモジュールをブラウザでできるだけ早く実行できるフォームにすることです。そのために、Viteの変換パイプラインから静的分析チェックを分離することをお勧めします。この原則は、ESLINTなどの他の静的分析チェックに適用されます。

- 生産ビルドの場合、Viteのビルドコマンドに加えて`tsc --noEmit`実行できます。

- 開発中、IDE以上のヒントが必要な場合は、別のプロセスで`tsc --noEmit --watch`実行するか、ブラウザで直接報告されたタイプエラーを好む場合は[Vite-Plugin-Checker](https://github.com/fi3ework/vite-plugin-checker)を使用することをお勧めします。

Viteは[ESBUILD](https://github.com/evanw/esbuild)を使用してTypeScriptをjavaScriptに伝達します。これはVanilla `tsc`よりも約20倍高速で、HMRの更新は50ms未満のブラウザで反映できます。

[タイプのみのインポートとエクスポート](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)構文を使用して、タイプのみのインポートが誤ってバンドルされているなどの潜在的な問題を回避します。

```ts
import type { T } from 'only/types'
export type { T }
```

### タイプスクリプトコンパイラオプション

`tsconfig.json`の`compilerOptions`未満の構成フィールドの一部は、特に注意が必要です。

#### `isolatedModules`

- [タイプスクリプトドキュメント](https://www.typescriptlang.org/tsconfig#isolatedModules)

`true`に設定する必要があります。

これは、 `esbuild`タイプ情報なしでトランスピレーションのみを実行するため、const enumや暗黙のタイプのみのインポートなどの特定の機能をサポートしていないためです。

TSが孤立した輸送で動作しない機能に対してあなたに警告するように、 `tsconfig.json`に`"isolatedModules": true` `compilerOptions`に設定する必要があります。

依存関係が`"isolatedModules": true`でうまく機能しない場合。 `"skipLibCheck": true`使用して、上流に固定されるまでエラーを一時的に抑制できます。

#### `useDefineForClassFields`

- [タイプスクリプトドキュメント](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

タイプスクリプトターゲットが`ESNext`を含む`ES2022`または新しい場合、デフォルト値は`true`になります。[タイプスクリプト4.3.2+の動作](https://github.com/microsoft/TypeScript/pull/42663)と一致しています。
他のタイプスクリプトターゲットはデフォルトで`false`になります。

`true`は、標準のECMAScriptランタイム動作です。

クラスフィールドに大きく依存しているライブラリを使用している場合は、ライブラリの意図した使用法に注意してください。
ほとんどのライブラリは`"useDefineForClassFields": true`予想していますが、ライブラリがサポートしていない場合は、明示的に`useDefineForClassFields` `false`設定できます。

#### `target`

- [タイプスクリプトドキュメント](https://www.typescriptlang.org/tsconfig#target)

Viteは、 `esbuild`と同じ動作に続いて、 `tsconfig.json`の`target`値を無視します。

DEVでターゲットを指定するには、 [`esbuild.target`](/ja/config/shared-options.html#esbuild)オプションを使用できます。これは、最小限の輸送に対してデフォルトで`esnext`になります。ビルドでは、 [`build.target`](/ja/config/build-options.html#build-target)オプションは`esbuild.target`よりも優先度が高く、必要に応じて設定することもできます。

::: warning `useDefineForClassFields`

`tsconfig.json`の`target` `esnext` `ESNext` `ES2022`以下ではない場合、または`tsconfig.json`ファイルがない`esbuild.target` 、 `useDefineForClassFields`デフォルトで`false`になります。ブラウザではサポートされていない[静的初期化ブロック](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks#browser_compatibility)に透過する場合があります。

そのため、 `tsconfig.json`構成するときに`target`から`ESNext`または`ES2022`以降を設定するか、 `useDefineForClassFields` `true`明示的に設定することをお勧めします。
:::

#### ビルド結果に影響するその他のコンパイラオプション

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)
- [`alwaysStrict`](https://www.typescriptlang.org/tsconfig#alwaysStrict)

::: tip `skipLibCheck`
Vite Starterテンプレートには、タイプチェック依存関係を避けるためにデフォルトで`"skipLibCheck": "true"`があります。これは、特定のバージョンとTypeScriptの構成のみをサポートすることを選択できます。 [Vuejs/Vue-Cli＃5688](https://github.com/vuejs/vue-cli/pull/5688)で詳細をご覧ください。
:::

### クライアントタイプ

Viteのデフォルトタイプは、node.js API用です。 Viteアプリケーションでクライアントサイドコードの環境をシムするには、 `d.ts`宣言ファイルを追加します。

```typescript
///<reference types="vite/client">
```

::: details Using `compilerOptions.types`

または、 `tsconfig.json`内に`vite/client` `compilerOptions.types`追加できます。

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client", "some-other-global-lib"]
  }
}
```

[`compilerOptions.types`](https://www.typescriptlang.org/tsconfig#types)が指定されている場合、これらのパッケージのみがグローバルスコープに含まれることに注意してください（すべての表示可能な「@Types」パッケージの代わりに）。

:::

`vite/client`次のタイプシムを提供します。

- 資産のインポート（ `.svg`ファイルのインポートなど）
- `import.meta.env`のVite注入[定数](./env-and-mode#env-variables)のタイプ
- `import.meta.hot`の[HMR API](./api-hmr)のタイプ

::: tip
デフォルトのタイピングをオーバーライドするには、タイピングを含むタイプ定義ファイルを追加します。次に、 `vite/client`前にタイプ参照を追加します。

たとえば、 `*.svg`のデフォルトインポートを反応コンポーネントにするには:

- `vite-env-override.d.ts` （タイピングを含むファイル）:
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- `vite/client`への参照を含むファイル:
  ```ts
  ///<reference types="./vite-env-override.d.ts">
  ///<reference types="vite/client">
  ```

:::

## HTML

HTMLファイルは、Viteプロジェクトの[最前線と中心に](/ja/guide/#index-html-and-project-root)立っており、アプリケーションのエントリポイントとして機能し、シングルページおよび[マルチページアプリケーションを](/ja/guide/build.html#multi-page-app)簡単に構築できます。

プロジェクトルート内のHTMLファイルは、それぞれのディレクトリパスで直接アクセスできます。

- `<root>/index.html` > `http://localhost:5173/`
- `<root>/about.html` > `http://localhost:5173/about.html`
- `<root>/blog/index.html` > `http://localhost:5173/blog/index.html`

`<script type="module" src>`や`<link href>`などのHTML要素によって参照される資産は、アプリの一部として処理され、バンドルされます。サポートされている要素の完全なリストは次のとおりです。

- `<audio src>`
- `<embed src>`
- `<img src>`および`<img srcset>`
- `<image src>`
- `<input src>`
- `<link href>`および`<link imagesrcset>`
- `<object data>`
- `<script type="module" src>`
- `<source src>`および`<source srcset>`
- `<track src>`
- `<use href>`および`<use xlink:href>`
- `<video src>`および`<video poster>`
- `<meta content>`
  - `name`属性`msapplication-square150x150logo` `msapplication-tileimage` `msapplication-config`または`twitter:image` `msapplication-square70x70logo` `msapplication-wide310x150logo` `msapplication-square310x310logo`のみ
  - または、 `property`属性`og:image:secure_url` `og:image` `og:video`または`og:video:secure_url` `og:image:url` `og:audio` `og:audio:secure_url`のみ

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

特定の要素でHTML処理をオプトアウトするには、外部資産またはCDNを参照する場合に役立つ要素に`vite-ignore`属性を追加できます。

## フレームワーク

すべての最新のフレームワークは、Viteとの統合を維持しています。ほとんどのフレームワークプラグインは、Vite組織で維持されている公式のVueおよびReact Viteプラグインを除き、各フレームワークチームによって維持されています。

- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)経由のVueサポート
- Vue JSXサポート[@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- [@vitejs/プラグインの反応を介してサポートを反応します](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
- [@Vitejs/Plugin-React-SWC](https://github.com/vitejs/vite-plugin-react-swc)を介してSWCサポートを使用して反応します

詳細については、[プラグインガイド](https://vite.dev/plugins)をご覧ください。

## JSX

`.jsx`および`.tsx`ファイルも箱から出してサポートされています。 JSXトランスピレーションも[Esbuild](https://esbuild.github.io)を介して処理されます。

選択したフレームワークは、既にJSXをボックスから構成しています（たとえば、VUEユーザーは、HMR、グローバルコンポーネント、ディレクティブ、スロットなどのVUE 3つの特定の機能を提供する公式[@ViteJS/Plugin-Vue-JSX](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)プラグインを使用する必要があります）。

独自のフレームワークでJSXを使用する場合、 [`esbuild`オプション](/ja/config/shared-options.md#esbuild)を使用してカスタム`jsxFactory`と`jsxFragment`構成できます。たとえば、PREACTプラグインは以下を使用します。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

[Esbuild Docs](https://esbuild.github.io/content-types/#jsx)の詳細。

`jsxInject` （Viteのみのオプションである）を使用してJSXヘルパーを注入して、手動での輸入を避けることができます。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

`.css`ファイルをインポートすると、HMRサポートを備えた`<style>`タグを介してコンテンツをページに挿入します。

### `@import`インラインとリベッシング

Viteは、 `postcss-import`介してCSS `@import`インラインをサポートするために事前に構成されています。 CSS `@import`については、Viteエイリアスも尊重されます。さらに、インポートされたファイルが異なるディレクトリにある場合でも、すべてのCSS `url()`参照は、正確性を確保するために常に自動的にリベースされます。

`@import`エイリアスとURLのリベッシングもSASSおよび少ないファイルでサポートされています（ [CSS Pre-Precessors](#css-pre-processors)を参照）。

### postcss

プロジェクトに有効なPostCSS構成（ [PostCSS-Load-Config](https://github.com/postcss/postcss-load-config) （Eg `postcss.config.js` ）がサポートする任意のフォーマット）が含まれている場合、すべてのインポートされたCSSに自動的に適用されます。

CSSの模倣はPostCSSの後に実行され、 [`build.cssTarget`](/ja/config/build-options.md#build-csstarget)オプションを使用することに注意してください。

### CSSモジュール

`.module.css`で終了するCSSファイルは[、CSSモジュールファイル](https://github.com/css-modules/css-modules)と見なされます。このようなファイルをインポートすると、対応するモジュールオブジェクトが返されます。

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
//  - -カット - -
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

CSSモジュールの動作は[、 `css.modules`オプション](/ja/config/shared-options.md#css-modules)で構成できます。

`css.modules.localsConvention` CamelCaseの地元の人を有効にするように設定されている場合（例: `localsConvention: 'camelCaseOnly'` ）、名前付きインポートを使用することもできます。

```js twoslash
import 'vite/client'
//  - -カット - -
// .Apply -Color-> ApplyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS前処理者

Viteは最新のブラウザのみをターゲットにしているため、CSSWGドラフト（ [PostCSS-Nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting)など）を実装するPostCSSプラグインを使用して、ネイティブCSS変数を使用し、著者プレーンで将来のスタンダードに準拠したCSSを使用することをお勧めします。

とはいえ、Viteは`.scss` 、および`.styl` `.sass` `.stylus`組み込みサポートを提供します`.less` Vite固有のプラグインをインストールする必要はありませんが、対応するPreprocessor自体をインストールする必要があります。

```bash
# .scss and .sass
npm add -D sass-embedded # またはサス

# 。少ない
npm add -D less

# .styl and .stylus
npm add -D stylus
```

VUEシングルファイルコンポーネントを使用している場合、これにより`<style lang="sass">` et alが自動的に有効になります。

ViteはSASSの解決`@import`改善し、Viteエイリアスも尊重されるように改善します。さらに、ルートファイルとは異なるディレクトリにあるインポートされたSASS/LESS FILES内の相対`url()`参照も、正しさを確保するために自動的に反論します。

`@import`エイリアスとURLのリベッシングは、APIの制約により、スタイラスではサポートされていません。

たとえば、 `style.module.scss`ファイル拡張子に`.module`準備することにより、前処理者と組み合わせたCSSモジュールを使用することもできます。

### ページへのCSSインジェクションを無効にします

CSSコンテンツの自動噴射は、 `?inline`クエリパラメーターを介してオフにすることができます。この場合、処理されたCSS文字列は通常どおりモジュールのデフォルトエクスポートとして返されますが、スタイルはページに注入されません。

```js twoslash
import 'vite/client'
//  - -カット - -
import './foo.css' // ページに注入されます
import otherStyles from './bar.css?inline' // 注入されません
```

::: tip NOTE
CSSファイルからのデフォルトと名前付きインポート（ `import style from './foo.css'` ）は、Vite 5以降削除されます。代わりに`?inline`クエリを使用します。
:::

### Lightning CSS

Vite 4.4から始めて、 [Lightning CSS](https://lightningcss.dev/)の実験的サポートがあります。構成ファイルに[`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer)を追加してオプションの[`lightningcss`](https://www.npmjs.com/package/lightningcss)依存関係をインストールして、それをオプトニングできます。

```bash
npm add -D lightningcss
```

有効にすると、CSSファイルはPostCSSの代わりにLightning CSSによって処理されます。構成するには、Lightning CSSオプションを[`css.lightningcss`](../config/shared-options.md#css-lightningcss)構成オプションに渡すことができます。

CSSモジュールを構成するには、 [`css.modules`](../config/shared-options.md#css-modules)代わりに[`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html)使用します（PostCSSがCSSモジュールを処理する方法を構成します）。

デフォルトでは、ViteはESBUILDを使用してCSSを模倣します。 Lightning CSSは、 [`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify)のCSSミニファイアとしても使用できます。

::: tip NOTE
稲妻CSSを使用する場合、 [CSSの前処理は](#css-pre-processors)サポートされていません。
:::

## 静的資産

静的資産をインポートすると、解決されたパブリックURLが提供されたときに返されます。

```js twoslash
import 'vite/client'
//  - -カット - -
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

特別なクエリは、資産のロード方法を変更できます。

```js twoslash
import 'vite/client'
//  - -カット - -
// AssetsをURLとして明示的にロードします
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
//  - -カット - -
// 文字列として資産をロードします
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
//  - -カット - -
// Webワーカーをロードします
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
//  - -カット - -
// ビルド時にbase64文字列としてインラードされたWebワーカー
import InlineWorker from './worker.js?worker&inline'
```

[静的資産処理](./assets)の詳細。

## JSON

JSONファイルは直接インポートできます - 名前付きインポートもサポートされています。

```js twoslash
import 'vite/client'
//  - -カット - -
// オブジェクト全体をインポートします
import json from './example.json'
// 輸出と呼ばれるルートフィールドをインポート - ツリーシェーキングに役立ちます！
import { field } from './example.json'
```

## グローブインポート

Viteは、特別な`import.meta.glob`関数を介してファイルシステムから複数のモジュールをインポートすることをサポートしています。

```js twoslash
import 'vite/client'
//  - -カット - -
const modules = import.meta.glob('./dir/*.js')
```

上記は次のように変換されます。

```js
// Viteによって作成されたコード
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

次に、 `modules`オブジェクトのキーを反復して、対応するモジュールにアクセスできます。

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

一致したファイルは、デフォルトで動的インポートを介してレイジーロードされ、ビルド中に個別のチャンクに分割されます。すべてのモジュールを直接インポートしたい場合（例えば、これらのモジュールの副作用に依存して最初に適用する場合）、2番目の引数として`{ eager: true }`渡すことができます。

```js twoslash
import 'vite/client'
//  - -カット - -
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

上記は次のように変換されます。

```js
// Viteによって作成されたコード
import * as __vite_glob_0_0 from './dir/bar.js'
import * as __vite_glob_0_1 from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

### 複数のパターン

最初の議論は、たとえばグローブの配列である可能性があります

```js twoslash
import 'vite/client'
//  - -カット - -
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### ネガティブパターン

負のグローブパターンもサポートされています（ `!`が付いています）。結果からいくつかのファイルを無視するには、最初の引数にGLOBパターンを除外することを追加できます。

```js twoslash
import 'vite/client'
//  - -カット - -
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// Viteによって作成されたコード
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### 名前付きインポート

`import`オプションでモジュールの一部のみをインポートすることができます。

```ts twoslash
import 'vite/client'
//  - -カット - -
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// Viteによって作成されたコード
const modules = {
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
}
```

`eager`と組み合わせると、これらのモジュールにツリーシャッキングを有効にすることができます。

```ts twoslash
import 'vite/client'
//  - -カット - -
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// Viteによって作成されたコード:
import { setup as __vite_glob_0_0 } from './dir/bar.js'
import { setup as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

デフォルトのエクスポートをインポートするには、 `import`から`default`設定します。

```ts twoslash
import 'vite/client'
//  - -カット - -
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// Viteによって作成されたコード:
import { default as __vite_glob_0_0 } from './dir/bar.js'
import { default as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

#### カスタムクエリ

`query`オプションを使用して、たとえば、[文字列](https://vite.dev/guide/assets.html#importing-asset-as-string)または[URLとして](https://vite.dev/guide/assets.html#importing-asset-as-url)資産をインポートするなど、インポートにクエリを提供することもできます。

```ts twoslash
import 'vite/client'
//  - -カット - -
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// Viteによって作成されたコード:
const moduleStrings = {
  './dir/bar.svg': () => import('./dir/bar.svg?raw').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/bar.svg': () => import('./dir/bar.svg?url').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?url').then((m) => m['default']),
}
```

他のプラグインが消費するカスタムクエリを提供することもできます。

```ts twoslash
import 'vite/client'
//  - -カット - -
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

### グローブインポート警告

ご了承ください:

- これはViteのみの機能であり、WebまたはES標準ではありません。
- GLOBパターンは、インポート仕様のように扱われます。相対（ `./`で開始）または絶対（ `/`で開始、プロジェクトルートに対して解決された）またはエイリアスパス（ [`resolve.alias`オプション](/ja/config/shared-options.md#resolve-alias)を参照）のいずれかでなければなりません。
- グローブマッチングは[`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby)で行われます。
- また、 `import.meta.glob`のすべての引数**をリテラルとして渡す**必要があることに注意する必要があります。変数や式には使用できません。

## 動的インポート

[GLOBのインポート](#glob-import)と同様に、Viteは変数を使用した動的なインポートもサポートしています。

```ts
const module = await import(`./dir/${file}.js`)
```

変数は、ファイル名のみを表していることに注意してください。 `file`が`'foo/bar'`の場合、インポートは失敗します。より高度な使用のために、 [GLOBインポート](#glob-import)機能を使用できます。

## WebAssembly

事前にコンパイルされた`.wasm`ファイルは、 `?init`でインポートできます。
デフォルトのエクスポートは、 [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance)の約束を返す初期化関数です。

```js twoslash
import 'vite/client'
//  - -カット - -
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

init関数は、2番目の引数として[`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate)に渡されるimportObjectを取得することもできます。

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
//  - -カット - -
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

生産ビルドでは、 `assetInlineLimit`より小さい`.wasm`がBase64文字列としてインラリングされます。それ以外の場合、それらは[静的資産](./assets)として扱われ、オンデマンドを取得します。

::: tip NOTE
[WebAssemblyのESモジュール統合提案は](https://github.com/WebAssembly/esm-integration)現在サポートされていません。
[`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm)または他のコミュニティプラグインを使用してこれを処理します。
:::

### WebAssemblyモジュールへのアクセス

たとえば、それを複数回インスタンス化するために、 `Module`オブジェクトにアクセスする必要がある場合は、[明示的なURLインポート](./assets#explicit-url-imports)を使用して資産を解決し、インスタンス化を実行します。

```js twoslash
import 'vite/client'
//  - -カット - -
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### node.jsでモジュールを取得します

SSRでは、 `?init`インポートの一部として発生する`fetch()`は、 `TypeError: Invalid URL`で失敗する可能性があります。
[SSRの問題サポートWASM](https://github.com/vitejs/vite/issues/8882)を参照してください。

プロジェクトベースが現在のディレクトリであると仮定して、以下に代替案があります。

```js twoslash
import 'vite/client'
//  - -カット - -
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## ウェブワーカー

### コンストラクターを使用してインポートします

Webワーカースクリプトは、 [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)と[`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker)使用してインポートできます。ワーカーの接尾辞と比較して、この構文は標準に近づき、労働者を作成するための**推奨される**方法です。

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

ワーカーコンストラクターもオプションを受け入れます。オプションは、「モジュール」ワーカーを作成するために使用できます。

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

ワーカーの検出は、 `new URL()`コンストラクターが`new Worker()`宣言内で直接使用される場合にのみ機能します。さらに、すべてのオプションパラメーターは静的値（つまり文字列リテラル）でなければなりません。

### クエリの接尾辞を使用してインポートします

Webワーカースクリプトは、インポートリクエストに`?worker`または`?sharedworker`追加することで直接インポートできます。デフォルトのエクスポートは、カスタムワーカーコンストラクターになります。

```js twoslash
import 'vite/client'
//  - -カット - -
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

ワーカースクリプトは、 `importScripts()`代わりにESM `import`ステートメントを使用することもできます。**注**:開発中、これは[ブラウザのネイティブサポート](https://caniuse.com/?search=module%20worker)に依存していますが、生産ビルドでは編集されます。

デフォルトでは、ワーカースクリプトは、生産ビルドで別のチャンクとして放出されます。ワーカーをbase64文字列としてインライン化する場合は、 `inline`クエリを追加します。

```js twoslash
import 'vite/client'
//  - -カット - -
import MyWorker from './worker?worker&inline'
```

ワーカーをURLとして取得する場合は、 `url`クエリを追加します。

```js twoslash
import 'vite/client'
//  - -カット - -
import MyWorker from './worker?worker&url'
```

すべての労働者のバンドルの構成に関する詳細については、[労働者のオプション](/ja/config/worker-options.md)を参照してください。

## コンテンツセキュリティポリシー（CSP）

CSPを展開するには、Viteの内部のために特定のディレクティブまたは構成を設定する必要があります。

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

[`html.cspNonce`](/ja/config/shared-options#html-cspnonce)設定されている場合、Viteは、指定された値を任意の`<script>`タグと`<style>`タグに、StyleSheetsとModule Preloadingの`<link>`タグにnonce属性を追加します。さらに、このオプションが設定されている場合、Viteはメタタグ（ `<meta property="csp-nonce" nonce="PLACEHOLDER" />` ）を注入します。

`property="csp-nonce"`のメタタグのNonCE値は、DEVとビルド後の両方で必要な場合はViteによって使用されます。

:::warning
各リクエストの一意の値にプレースホルダーを置き換えることを確認してください。これは、リソースのポリシーをバイパスするのを防ぐために重要です。
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

デフォルトでは、ビルド中、Viteはデータurisとして小さな資産を導入します。 [`font-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src)するディレクティブ（例えば[`img-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src) ）に`data:`許可するか、設定[`build.assetsInlineLimit: 0`](/ja/config/build-options#build-assetsinlinelimit)で無効にすることが必要です。

:::warning
[`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)に`data:`許可しないでください。任意のスクリプトの注入を可能にします。
:::

## 最適化を構築します

> 以下にリストされている機能は、ビルドプロセスの一部として自動的に適用され、無効にしない限り、明示的な構成は必要ありません。

### CSSコードの分割

Viteは、モジュールで使用されているCSSをAsync Chunkで自動的に抽出し、そのための個別のファイルを生成します。 CSSファイルは、関連するASYNCチャンクがロードされたときに`<link>`タグで自動的にロードされ、Asyncチャンクは、 [Foucを](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.)避けるためにCSSをロードした後にのみ評価されることが保証されます。

すべてのCSSを単一のファイルに抽出したい場合は、 [`build.cssCodeSplit`](/ja/config/build-options.md#build-csscodesplit) `false`設定してCSSコード分割を無効にすることができます。

### プリロードディレクティブ生成

Viteは、エントリーチャンクの`<link rel="modulepreload">`ディレクティブと、構築されたHTMLでの直接輸入を自動的に生成します。

### Async Chunk Loadingの最適化

現実世界のアプリケーションでは、ロールアップはしばしば「一般的な」チャンク - 他の2つ以上のチャンク間で共有されるコードを生成します。動的なインポートと組み合わせることで、次のシナリオを持つことが非常に一般的です。

<script setup>
import graphSvg from '../../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

最適化されていないシナリオでは、Async Chunk `A`がインポートされる場合、ブラウザは共通チャンク`C`も必要であることがわかる前に`A`要求して解析する必要があります。これにより、追加のネットワーク往復が発生します。

```
Entry ---> A ---> C
```

Viteは、Preloadステップでコードスプリットの動的インポートコールを自動的に書き換えて、 `A`が要求されると、 `C`**並列に**取得されるようになります。

```
Entry ---> (A + C)
```

`C`さらなる輸入品を持つ可能性があり、その結果、最適化されていないシナリオでさらに往復が発生します。 Viteの最適化により、すべての直接輸入がトレースされ、輸入深度に関係なく往復が完全に排除されます。
