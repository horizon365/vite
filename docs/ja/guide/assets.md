# 静的資産処理

- 関連:[パブリックベースパス](./build#public-base-path)
- 関連: [`assetsInclude`構成オプション](/ja/config/shared-options.md#assetsinclude)

## AssetをURLとしてインポートします

静的資産をインポートすると、解決されたパブリックURLが提供されたときに返されます。

```js twoslash
import 'vite/client'
//  - -カット - -
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

たとえば、開発中は`imgUrl` `/src/img.png`になり、生産ビルドで`/assets/img.2d8efhg.png`になります。

動作はWebpackの`file-loader`に似ています。違いは、インポートが絶対パブリックパス（開発中のプロジェクトルートに基づく）または相対パスのいずれかを使用できることです。

- CSSの`url()`参照は同じ方法で処理されます。

- VUEプラグインを使用する場合、VUE SFCテンプレートの資産参照は自動的にインポートに変換されます。

- 一般的な画像、メディア、およびフォントのフィルタイプは、資産として自動的に検出されます。 [`assetsInclude`オプション](/ja/config/shared-options.md#assetsinclude)を使用して内部リストを拡張できます。

- 参照された資産は、ビルドアセットグラフの一部として含まれており、ファイル名をハッシュし、最適化のためにプラグインで処理できます。

- [`assetsInlineLimit`オプション](/ja/config/build-options.md#build-assetsinlinelimit)よりもバイトが小さい資産は、base64データURLとしてインラードされます。

- GIT LFSプレースホルダーは、表すファイルのコンテンツが含まれていないため、インラインから自動的に除外されます。インラインを取得するには、構築する前にgit lfsを介してファイルのコンテンツを必ずダウンロードしてください。

- タイプスクリプトは、デフォルトでは、静的資産のインポートを有効なモジュールとして認識していません。これを修正するには、 [`vite/client`](./features#client-types)を含めます。

::: tip Inlining SVGs through `url()`
SVGのURLをJSによって手動で構築された`url()`に渡す場合、変数は二重引用符にラップする必要があります。

```js twoslash
import 'vite/client'
//  - -カット - -
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### 明示的なURLインポート

内部リストまたは`assetsInclude`に含まれていない資産は、 `?url`接尾辞を使用してURLとして明示的にインポートできます。これは、たとえば、 [Houdiniペイントワークレット](https://developer.mozilla.org/en-US/docs/Web/API/CSS/paintWorklet_static)をインポートするのに役立ちます。

```js twoslash
import 'vite/client'
//  - -カット - -
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### 明示的なインライン処理

資産は、それぞれ`?inline`または`?no-inline`接尾辞を使用して、インラインでインランスを付けて、またはインライン化なしで明示的にインポートできます。

```js twoslash
import 'vite/client'
//  - -カット - -
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### 資産を文字列としてインポートします

資産は、 `?raw`サフィックスを使用して文字列としてインポートできます。

```js twoslash
import 'vite/client'
//  - -カット - -
import shaderString from './shader.glsl?raw'
```

### 労働者としてスクリプトをインポートします

スクリプトは、 `?worker`または`?sharedworker`接尾辞を備えたWebワーカーとしてインポートできます。

```js twoslash
import 'vite/client'
//  - -カット - -
// 生産ビルドでは別々のチャンク
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
//  - -カット - -
// 共有ワーカー
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
//  - -カット - -
// base64文字列としてインラインしています
import InlineWorker from './shader.js?worker&inline'
```

詳細については、 [Webワーカーのセクション](./features.md#web-workers)をご覧ください。

## `public`ディレクトリ

あなたがその資産を持っている場合:

- ソースコードで言及したことはありません（例: `robots.txt` ）
- まったく同じファイル名を保持する必要があります（ハッシュなし）
- ...または、URLを取得するためだけに最初に資産をインポートする必要はありません

次に、プロジェクトルートの下にある特別な`public`ディレクトリに資産を配置できます。このディレクトリのアセットは、開発中にルートパス`/`で提供され、distディレクトリのルートにコピーされます。

ディレクトリは`<root>/public`ですが、 [`publicDir`オプション](/ja/config/shared-options.md#publicdir)で構成できます。

ルート絶対パスを使用して常に`public`アセットを参照する必要があることに注意してください。たとえば、 `public/icon.png`ソースコードで`/icon.png`参照する必要があります。

## new URL（url、import.meta.url）

[import.meta.urlは](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta)、現在のモジュールのURLを公開するネイティブESM機能です。ネイティブ[URLコンストラクター](https://developer.mozilla.org/en-US/docs/Web/API/URL)と組み合わせることで、JavaScriptモジュールからの相対パスを使用して、静的資産の完全で解決されたURLを取得できます。

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

これは最新のブラウザでネイティブに機能します - 実際、Viteは開発中にこのコードをまったく処理する必要はありません！

このパターンは、テンプレートリテラルを介して動的なURLをサポートしています。

```js
function getImageUrl(name) {
  // これには、サブディレクトリにファイルが含まれていないことに注意してください
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

生産ビルド中、Viteは必要な変換を実行するため、URLはバンドリングや資産ハッシュ後でも正しい場所を指します。ただし、URL文字列は静的である必要があるため、分析できます。 `build.target`しないと、コードがそのまま残されます`import.meta.url`

```js
// Viteはこれを変換しません
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details How it works

Viteは`getImageUrl`関数を次のように変換します。

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Does not work with SSR
サーバーサイドレンダリングにViteを使用している場合、このパターンは機能しません。 `import.meta.url`ブラウザとnode.jsに異なるセマンティクスがあるため、サーバーバンドルは、クライアントホストURLを事前に決定することもできません。
:::
