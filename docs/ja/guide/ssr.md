# サーバー側のレンダリング（SSR）

:::tip Note
SSRは、node.jsで同じアプリケーションの実行をサポートし、それをHTMLに事前にレンダリングし、最終的にクライアントに水分補給するフロントエンドフレームワーク（React、Preact、Vue、Svelteなど）を特に指します。従来のサーバー側のフレームワークとの統合を探している場合は、代わりに[バックエンド統合ガイド](./backend-integration)をご覧ください。

また、次のガイドでは、選択したフレームワークでSSRを使用した以前の経験も想定しており、Vite固有の統合の詳細にのみ焦点を当てます。
:::

:::warning Low-level API
これは、ライブラリおよびフレームワークの著者向けの低レベルAPIです。目標がアプリケーションを作成することである場合は、最初に[Awesome Vite SSRセクション](https://github.com/vitejs/awesome-vite#ssr)で高レベルのSSRプラグインとツールをチェックしてください。とはいえ、多くのアプリケーションは、Viteのネイティブ低レベルAPIの上に直接構築されています。

現在、Viteは[環境API](https://github.com/vitejs/vite/discussions/16358)を使用して改良されたSSR APIに取り組んでいます。詳細については、リンクをご覧ください。
:::

## プロジェクトの例

Viteは、サーバー側のレンダリング（SSR）の組み込みサポートを提供します。 [`create-vite-extra`](https://github.com/bluwy/create-vite-extra)このガイドの参照として使用できるSSRセットアップの例が含まれています。

- [バニラ](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [反応します](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [プアクト](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [svelte](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [固体](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

これらのプロジェクトをローカルで実行して、 [`create-vite`を実行して](./index.md#scaffolding-your-first-vite-project)、フレームワークオプションで`Others > create-vite-extra`選択することもできます。

## ソース構造

典型的なSSRアプリケーションには、次のソースファイル構造があります。

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

`index.html`は`entry-client.js`参照し、サーバーレンダリングされたマークアップを挿入する必要があるプレースホルダーを含める必要があります。

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

正確に置き換えることができる限り、 `<!--ssr-outlet-->`の代わりに希望するプレースホルダーを使用できます。

## 条件付きロジック

SSR対クライアントに基づいて条件付きロジックを実行する必要がある場合は、使用できます

```js twoslash
import 'vite/client'
//  - -カット - -
if (import.meta.env.SSR) {
  // ...サーバーのみロジック
}
```

これは、ビルド中に静的に置き換えられるため、未使用の枝のツリーを揺るぎます。

## 開発サーバーのセットアップ

SSRアプリを構築するときは、メインサーバーを完全に制御し、生産環境からViteを分離することをお勧めします。したがって、ミドルウェアモードでViteを使用することをお勧めします。 [Express](https://expressjs.com/) （V4）の例は次のとおりです。

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

ここで`vite`は[vitedevserver](./api-javascript#vitedevserver)のインスタンスです。 `vite.middlewares` 、Connect互換node.jsフレームワークでミドルウェアとして使用できる[接続](https://github.com/senchalabs/connect)インスタンスです。

次のステップは、サーバーレンダリングHTMLを提供するために`*`ハンドラーを実装することです。

```js twoslash [server.js]
// @noErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @Type {Import（ 'Express'）。Express} */
var app
/** @type {import（ 'vite'）。vitedevserver}  */
var vite

//  - -カット - -
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. index.htmlを読み取ります
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. Vite HTML変換を適用します。これにより、Vite HMRクライアントが注入されます。
    //    また、ViteプラグインからのHTML変換も適用します。グローバル
    //    @vitejs/プラグイン反応からのプリアンブル
    template = await vite.transformIndexHtml(url, template)

    // 3.サーバーエントリをロードします。 SSRLoadModuleは自動的に変換されます
    //    node.jsで使用できるESMソースコード！バンドルはありません
    //    必須であり、HMRと同様の効率的な無効化を提供します。
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4.アプリHTMLをレンダリングします。これは、Entry-Server.jsのエクスポートを想定しています
    //     `render`関数は適切なフレームワークSSR APIを呼び出します、
    //    例えばReactdomserver.rendertostring（）
    const appHtml = await render(url)

    // 5.アプリレンダリングされたHTMLをテンプレートに挿入します。
    const html = template.replace(`<!--ssr-outlet-->`, () => appHtml)

    // 6.レンダリングされたHTMLを送信します。
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // エラーが発生した場合は、viteがスタックトレースを修正して、マップして戻します。
    // 実際のソースコードに。
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

代わりにサーバースクリプトを使用するには、 `package.json`の`dev`スクリプトも変更する必要があります。

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## 生産のための建物

生産のためにSSRプロジェクトを出荷するには、次のことが必要です。

1. 通常どおりクライアントビルドを作成します。
2. SSRビルドを生成します。これは、 `import()`で直接ロードできるため、Viteの`ssrLoadModule`を通過する必要はありません。

`package.json`のスクリプトは次のようになります:

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

これがSSRビルドであることを示す`--ssr`フラグに注意してください。また、SSRエントリを指定する必要があります。

次に、 `server.js`で`process.env.NODE_ENV`チェックして、いくつかの生産固有のロジックを追加する必要があります。

- ルート`index.html`読み取る代わりに、 `dist/client/index.html`テンプレートとして使用します。クライアントビルドへの正しいアセットリンクが含まれているためです。

- `await vite.ssrLoadModule('/src/entry-server.js')`の代わりに、 `import('./dist/server/entry-server.js')`使用します（このファイルはSSRビルドの結果です）。

- DEVのみの条件付きブランチの背後にある`vite` DEVサーバーの作成とすべての使用を移動し、 `dist/client`からファイルを提供するためにMiddleWaresを提供する静的ファイルを追加します。

ワーキングセットアップの[プロジェクトのサンプル](#example-projects)を参照してください。

## プリロードディレクティブの生成

`vite build`ビルド出力ディレクトリで`.vite/ssr-manifest.json`フラグを生成する`--ssrManifest`フラグをサポートします。

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

上記のスクリプトは、クライアントビルド用に`dist/client/.vite/ssr-manifest.json`生成します（はい、SSRマニフェストは、モジュールIDをクライアントファイルにマッピングするため、クライアントビルドから生成されます）。マニフェストには、関連するチャンクおよびアセットファイルへのモジュールIDのマッピングが含まれています。

マニフェストを活用するために、フレームワークは、サーバーレンダリング呼び出し中に使用されたコンポーネントのモジュールIDを収集する方法を提供する必要があります。

`@vitejs/plugin-vue`これを箱から出してサポートし、使用されたコンポーネントモジュールIDを関連するVUE SSRコンテキストに自動的に登録します。

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modulesは、レンダリング中に使用されたモジュールIDのセットになりました
```

`server.js`の生産ブランチでは、マニフェストを読み取り、 `src/entry-server.js`がエクスポートした`render`関数に渡す必要があります。これにより、Asyncルートで使用されるファイルのプリロードディレクティブをレンダリングするのに十分な情報が提供されます！完全な例については、[デモソース](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js)を参照してください。この情報を[103の初期ヒント](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103)に使用することもできます。

## プレレンダリング / SSG

特定のルートに必要なルートとデータが事前に知られている場合、これらのルートをProduction SSRと同じロジックを使用して静的HTMLに事前にレンダリングできます。これは、静的サイト生成の形式（SSG）と見なすこともできます。動作の例については[、デモの事前レンダースクリプトを](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/prerender.js)参照してください。

## SSR外部

依存関係は、SSRを実行するときにデフォルトでViteのSSR変換モジュールシステムから「外部化」されます。これにより、開発とビルドの両方が高速化されます。

たとえば、Viteのパイプラインによって依存関係を変換する必要がある場合、Vite機能はそれらに翻訳されていないために使用されるため、 [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal)に追加できます。

リンクされた依存関係の場合、デフォルトではViteのHMRを利用するために外部化されません。たとえば、依存関係をリンクしていないかのようにテストするためにこれが望まれていない場合は、 [`ssr.external`](../config/ssr-options.md#ssr-external)に追加できます。

:::warning Working with Aliases
1つのパッケージを別のパッケージにリダイレクトするエイリアスを構成した場合、SSR外部依存関係のために機能させるために、実際の`node_modules`パッケージを代わりにエイリアスすることをお勧めします。 [YARN](https://classic.yarnpkg.com/ja/docs/cli/add/#toc-yarn-add-alias)と[PNPMの](https://pnpm.io/aliases/)両方が、 `npm:`プレフィックスを介してエイリアシングをサポートします。
:::

## SSR固有のプラグインロジック

VueやSvelteコンパントなどの一部のフレームワークは、クライアントとSSRに基づいてコンポーネントをさまざまな形式にします。条件付き変換をサポートするために、Viteは次のプラグインフックの`options`オブジェクトに追加の`ssr`プロパティを渡します。

- `resolveId`
- `load`
- `transform`

**例:**

```js twoslash
/** @Type {（）=> Import（ 'Vite'）。プラグイン} */
//  - -カット - -
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // SSR固有の変換を実行します...
      }
    },
  }
}
```

`load`と`transform`のオプションオブジェクトはオプションであり、ロールアップは現在このオブジェクトを使用していませんが、これらのフックを将来追加のメタデータで拡張する場合があります。

:::tip Note
Vite 2.7の前に、これは`options`オブジェクトを使用する代わりに、位置`ssr` PARAMでプラグインフックを通知されました。すべての主要なフレームワークとプラグインが更新されますが、以前のAPIを使用して時代遅れの投稿を見つけることができます。
:::

## SSRターゲット

SSRビルドのデフォルトのターゲットはノード環境ですが、Webワーカーでサーバーを実行することもできます。パッケージのエントリ解像度は、プラットフォームごとに異なります。 `'webworker'`に設定された`ssr.target`を使用して、ターゲットをWebワーカーに設定できます。

## SSRバンドル

場合によっては、 `webworker`ランタイムなど、SSRビルドを単一のJavaScriptファイルにバンドルすることをお勧めします。 `ssr.noExternal` `true`設定することで、この動作を有効にすることができます。これは2つのことを行います。

- すべての依存関係を`noExternal`として扱います
- node.jsビルトインがインポートされている場合は、エラーを投げます

## SSRは条件を解決します

デフォルトでは、パッケージエントリ解像度は、SSRビルドに[`resolve.conditions`](../config/shared-options.md#resolve-conditions)に設定された条件を使用します。 [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions)と[`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions)使用して、この動作をカスタマイズできます。

## Vite Cli

CLIコマンド`$ vite dev`および`$ vite preview` 、SSRアプリにも使用できます。 SSRミドルウェアを[`configureServer`](/ja/guide/api-plugin#configureserver)の開発サーバーに、 [`configurePreviewServer`](/ja/guide/api-plugin#configurepreviewserver)でプレビューサーバーに追加できます。

:::tip Note
SSRミドルウェアがViteのMiddlewares*の後に*実行されるように、ポストフックを使用します。
:::
