# プラグインAPI

Viteプラグインは、Rollupの適切に設計されたプラグインインターフェイスを、いくつかの追加のVite固有のオプションを拡張します。その結果、Viteプラグインを1回作成して、開発とビルドの両方で機能させることができます。

**以下のセクションを読む前に、まず[ロールアップのプラグインドキュメント](https://rollupjs.org/plugin-development/)を使用することをお勧めします。**

## プラグインの作成

Viteは、箱から出して確立されたパターンを提供するよう努めているため、新しいプラグインを作成する前に、[機能ガイド](https://vite.dev/guide/features)を確認して、ニーズがカバーされているかどうかを確認してください。また、[互換性のあるロールアッププラグイン](https://github.com/rollup/awesome)と[vite固有のプラグイン](https://github.com/vitejs/awesome-vite#plugins)の両方の形で利用可能なコミュニティプラグインを確認します

プラグインを作成するときは、 `vite.config.js`にインラインできるようになります。新しいパッケージを作成する必要はありません。プラグインがプロジェクトで役立つことがわかったら、それを共有して[エコシステムの](https://chat.vite.dev)他の人を助けることを検討してください。

::: tip
プラグインを学習、デバッグ、またはオーサリングするときは、プロジェクトに[Vite-Plugin-Inspect](https://github.com/antfu/vite-plugin-inspect)を含めることをお勧めします。これにより、Viteプラグインの中間状態を検査できます。インストール後、 `localhost:5173/__inspect/`アクセスして、プロジェクトのモジュールと変換スタックを検査できます。 [Vite-Plugin-Enspect Docs](https://github.com/antfu/vite-plugin-inspect)のインストール手順をご覧ください。
![vite-plugin-inspect](/images/vite-plugin-inspect.png)
:::

## 慣習

プラグインがVite固有のフックを使用せず、[互換性のあるロールアッププラグイン](#rollup-plugin-compatibility)として実装できる場合は、[ロールアッププラグインネーミングコンベンション](https://rollupjs.org/plugin-development/#conventions)を使用することをお勧めします。

- ロールアッププラグインには、 `rollup-plugin-`プレフィックスが付いた明確な名前が必要です。
- package.jsonに`rollup-plugin`と`vite-plugin`キーワードを含めます。

これにより、プラグインが純粋なロールアップまたはWMRベースのプロジェクトでも使用されるように公開されます

Viteのみのプラグイン用

- Viteプラグインには、 `vite-plugin-`プレフィックスが付いた明確な名前が必要です。
- package.jsonに`vite-plugin`キーワードを含めます。
- プラグインドキュメントにセクションを含めて、それがViteのみのプラグインである理由を詳述します（たとえば、Vite固有のプラグインフックを使用します）。

プラグインが特定のフレームワークでのみ機能する場合、その名前はプレフィックスの一部として含める必要があります

- `vite-plugin-vue-` Vueプラグイン用のプレフィックス
- `vite-plugin-react-` Reactプラグイン用のプレフィックス
- Svelteプラグイン用の`vite-plugin-svelte-`プレフィックス

[仮想モジュール条約](#virtual-modules-convention)も参照してください。

## プラグイン構成

ユーザーはプロジェクト`devDependencies`にプラグインを追加し、 `plugins`アレイオプションを使用してそれらを構成します。

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

Falsyプラグインは無視され、プラグインを簡単にアクティブ化または非アクティブ化するために使用できます。

`plugins` 、単一の要素としていくつかのプラグインを含むプリセットも受け入れます。これは、複数のプラグインを使用して実装されている複雑な機能（フレームワーク統合など）に役立ちます。配列は内部的に平らになります。

```js
// Framework-Plugin
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## 簡単な例

:::tip
実際のプラグインオブジェクトを返す工場関数として、Vite/Rollupプラグインを作成することは一般的な慣習です。この関数は、ユーザーがプラグインの動作をカスタマイズできるようにするオプションを受け入れることができます。
:::

### カスタムファイルタイプの変換

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // 利用可能な場合はソースマップを提供します
        }
      }
    },
  }
}
```

### 仮想ファイルのインポート

[次のセクション](#virtual-modules-convention)の例を参照してください。

## 仮想モジュール条約

仮想モジュールは、通常のESMインポート構文を使用して、ビルド時間情報をソースファイルに渡すことができる便利なスキームです。

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // 必要になり、警告とエラーに表示されます
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

これにより、JavaScriptでモジュールをインポートできます。

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Vite（およびRollup）の仮想モジュールには、慣習ごとにユーザー向けパスの`virtual:`が付けられています。可能であれば、エコシステム内の他のプラグインとの衝突を避けるために、プラグイン名を名前空間として使用する必要があります。たとえば、 `vite-plugin-posts`ユーザーに`virtual:posts`または`virtual:posts/helpers`仮想モジュールをインポートして、ビルド時間情報を取得するように依頼できます。内部的には、仮想モジュールを使用するプラグインは、ロールアップエコシステムからのコンベンションであるIDを解決しながら、モジュールIDに`\0`を付けてプレフィックスする必要があります。これにより、他のプラグインがID（ノード解像度など）を処理しようとすることを防ぎ、SourceMapsなどのコア機能はこの情報を使用して仮想モジュールと通常のファイルを区別できます。 `\0`インポートURLで許可されたcharではないため、輸入分析中にそれらを置き換える必要があります。ブラウザのDEV中に`\0{id}`仮想IDが`/@id/__x00__{id}`としてエンコードされます。 IDはプラグインパイプラインを入力する前にデコードされるため、これはプラグインフックコードでは表示されません。

単一のファイルコンポーネントのスクリプトモジュールの場合（.vueや.svelte SFCなど）のように、実際のファイルから直接導出されたモジュールは、この規則に従う必要はないことに注意してください。 SFCは通常、処理時にサブモジュールのセットを生成しますが、これらのコードはファイルシステムにマッピングできます。これらのサブモジュールに`\0`使用すると、Sourcemapsが正しく動作しないようにします。

## ユニバーサルフック

開発中、Vite Devサーバーは、ロールアップが行うのと同じ方法で[ロールアップビルドフック](https://rollupjs.org/plugin-development/#build-hooks)を呼び出すプラグインコンテナを作成します。

次のフックは、サーバーで1回呼び出されます。

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

次のフックは、各着信モジュールリクエストで呼び出されます。

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

これらのフックには、追加のVite固有のプロパティを備えた拡張された`options`パラメーターもあります。詳細については、 [SSRドキュメント](/ja/guide/ssr#ssr-specific-plugin-logic)をご覧ください。

' `importer`値は`resolveId` viteのバンドルされていないDEVサーバーパターンのために実際のインポーターを導出することが常に可能ではないため、ルートのジェネリック`index.html`の絶対的なパスである可能性があります。 ViteのResolve Pipeline内で処理される輸入の場合、輸入業者は輸入分析段階で追跡でき、正しい`importer`値を提供します。

サーバーが閉じられているときに、次のフックが呼び出されます。

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

viteはパフォーマンスを向上させるために完全なAST区画を避けるため、 [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed)フックは開発中に呼び出さ**れない**ことに注意してください。

[出力生成フック](https://rollupjs.org/plugin-development/#output-generation-hooks)（ `closeBundle`を除く）は、開発中に呼び出され**ません**。 ViteのDEVサーバーは、 `bundle.generate()`呼び出すことなく`rollup.rollup()`のみを呼び出すと考えることができます。

## vite固有のフック

Viteプラグインは、Vite固有の目的に役立つフックを提供することもできます。これらのフックはロールアップによって無視されます。

### `config`

- **タイプ:** `（config:userconfig、env:{mode:string、command:string}）=> userconfig | ヌル | void`
- `sequential` **:** `async`

  解決する前に、Vite構成を変更します。フックは、RAWユーザー構成（CLIオプションが構成ファイルとマージされた）と、使用されている`mode`と`command`公開する現在のconfig envを受信します。既存の構成に深くマージされる部分構成オブジェクトを返すか、構成を直接変異させることができます（デフォルトのマージが目的の結果を達成できない場合）。

  **例:**

  ```js
  // 部分的な構成を返す（推奨）
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // 構成を直接変異させます（マージが機能しない場合にのみ使用）
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning Note
  このフックを実行する前にユーザープラグインが解決されるため、 `config`フック内に他のプラグインを注入すると効果がありません。
  :::

### `configResolved`

- **タイプ:** `（config:ResolvedConfig）=> void | 約束<void>`
- `parallel` **:** `async`

  Vite構成が解決された後に呼び出されます。このフックを使用して、最終的な解決済み構成を読み取り、保存します。また、プラグインが実行中のコマンドに基づいて何か違うことをする必要がある場合にも役立ちます。

  **例:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // Resolved Configを保存します
        config = resolvedConfig
      },

      // 他のフックに保存された構成を使用します
      transform(code, id) {
        if (config.command === 'serve') {
          // DEV:DEVサーバーによって呼び出されるプラグイン
        } else {
          // ビルド:ロールアップによって呼び出されたプラグイン
        }
      },
    }
  }
  ```

  `command`値はDEVで`serve`あることに注意してください（CLI `vite` 、および`vite serve` `vite dev`です）。

### `configureServer`

- **タイプ:** `（server:vitedevserver）=>（（）=> void） | 空所 | 約束<（（）=> void） | void> `
- `sequential` **:** `async`
- **参照:** [VitedEvServer](./api-javascript#vitedevserver)

  開発サーバーを構成するためのフック。最も一般的なユースケースは、内部[接続](https://github.com/senchalabs/connect)アプリにカスタムミドルウェアを追加することです。

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // カスタムハンドルリクエスト...
      })
    },
  })
  ```

  **ポストミドルウェアを注入します**

  `configureServer`フックは、内部ミドルウェアがインストールされる前に呼び出されるため、カスタムミドルウェアはデフォルトで内部ミドルウェアの前に実行されます。内部ミドルウェア**の後に**ミドルウェアを注入する場合は、 `configureServer`から関数を返すことができます。これは、内部ミドルウェアがインストールされた後に呼び出されます。

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // 内部ミドルウェアの後に呼び出されるポストフックを返します
      // インストール
      return () => {
        server.middlewares.use((req, res, next) => {
          // カスタムハンドルリクエスト...
        })
      }
    },
  })
  ```

  **サーバーアクセスを保存します**

  場合によっては、他のプラグインフックがDev Serverインスタンスにアクセスする必要がある場合があります（たとえば、Web Socket Server、File System Watcher、またはモジュールグラフへのアクセスなど）。このフックは、他のフックにアクセスするためにサーバーインスタンスを保存するためにも使用できます。

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // サーバーを使用してください...
        }
      },
    }
  }
  ```

  注`configureServer` 、生産ビルドを実行するときに呼び出されないため、他のフックがその不在を防ぐ必要があります。

### `configurePreviewServer`

- **タイプ:** `（サーバー:previewserver）=>（（）=> void） | 空所 | 約束<（（）=> void） | void> `
- `sequential` **:** `async`
- **参照:** [PreviewServer](./api-javascript#previewserver)

  [`configureServer`](/ja/guide/api-plugin.html#configureserver)と同じですが、プレビューサーバーの場合。 `configureServer`と同様に、他のミドルウェアがインストールされる前に`configurePreviewServer`フックが呼び出されます。他のミドルウェア**の後に**ミドルウェアを注入する場合は、 `configurePreviewServer`から関数を返すことができます。これは、内部ミドルウェアがインストールされた後に呼び出されます。

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // 他のミドルウェアの後に呼び出されるポストフックを返します
      // インストール
      return () => {
        server.middlewares.use((req, res, next) => {
          // カスタムハンドルリクエスト...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **タイプ:** `indexhtmltransformhook | {注文？:「pre」 | 「投稿」、ハンドラー:indexhtmltransformhook} `
- `sequential` **:** `async`

  `index.html`などのHTMLエントリポイントファイルを変換するための専用フック。フックは、現在のHTML文字列と変換コンテキストを受信します。コンテキストは、開発中に[`ViteDevServer`](./api-javascript#vitedevserver)インスタンスを公開し、ビルド中にロールアップ出力バンドルを公開します。

  フックは非同期であり、次のいずれかを返すことができます。

  - 変換されたHTML文字列
  - 既存のHTMLに注入するタグ記述子オブジェクト（ `{ tag, attrs, children }` ）の配列。各タグは、注入する必要がある場所を指定することもできます（デフォルトは`<head>`に準備されています）
  - 両方の`{ html, tags }`を含むオブジェクト

  デフォルトでは`order`は`undefined`で、HTMLが変換された後にこのフックが適用されます。 Viteプラグインパイプラインを通過するスクリプトを挿入するために、HTMLを処理する前に`order: 'pre'`フックを適用します。 `order: 'post'`未定義の`order`未定義でフックを適用した後、フックを適用します。

  **基本例:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`,
        )
      },
    }
  }
  ```

  **フルフックの署名:**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * デフォルト:「ヘッドプレーズ」
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

  ::: warning Note
  エントリファイル（ [Sveltekit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145)など）のカスタム処理があるフレームワークを使用している場合、このフックは呼び出されません。
  :::

### `handleHotUpdate`

- **タイプ:** `（ctx:hmrcontext）=> array<ModuleNode> | 空所 | 約束<配列<ModuleNode> | void> `
- **参照:** [HMR API](./api-hmr)

  カスタムHMRアップデート処理を実行します。フックは、次の署名を持つコンテキストオブジェクトを受け取ります。

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules`は、変更されたファイルの影響を受けるモジュールの配列です。単一のファイルが複数のサービスモジュール（vue SFCSなど）にマッピングできるため、これは配列です。

  - `read` 、ファイルのコンテンツを返す非同期読み取り関数です。これは、一部のシステムでは、ファイルの変更コールバックがファイルの更新が完了し、Direct `fs.readFile`空のコンテンツを返す前に速すぎる可能性があるためです。渡された読み取り関数は、この動作を正常化します。

  フックは次のことを選択できます。

  - HMRがより正確になるように、影響を受けるモジュールリストをフィルターして絞り込みます。

  - 空の配列を返し、完全なリロードを実行します。

    ```js
    handleHotUpdate({ server, modules, timestamp }) {
      // モジュールを手動で無効にします
      const invalidatedModules = new Set()
      for (const mod of modules) {
        server.moduleGraph.invalidateModule(
          mod,
          invalidatedModules,
          timestamp,
          true
        )
      }
      server.ws.send({ type: 'full-reload' })
      return []
    }
    ```

  - 空の配列を返し、クライアントにカスタムイベントを送信して、完全なカスタムHMR処理を実行します。

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    クライアントコードは、 [HMR API](./api-hmr)を使用して対応するハンドラーを登録する必要があります（これは、同じプラグインの`transform`フックで挿入できます）:

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // カスタムアップデートを実行します
      })
    }
    ```

## プラグインの注文

Viteプラグインは、アプリケーションの順序を調整するために`enforce`プロパティ（Webパックローダーに類似）をさらに指定できます。 `enforce`の値は`"pre"`または`"post"`いずれかです。解決されたプラグインは次の順序で行われます。

- エイリアス
- `enforce: 'pre'`のユーザープラグイン
- Viteコアプラグイン
- 価値のないユーザープラグイン
- Viteビルドプラグイン
- `enforce: 'post'`のユーザープラグイン
- Vite Post Buildプラグイン（Minify、Manifest、Reporting）

これはフックの注文とは別に別のものであり、それらは[ロールアップフックの通常どおり](https://rollupjs.org/plugin-development/#build-hooks)`order`属性を個別に受けます。

## 条件付きアプリケーション

デフォルトでは、プラグインがサーブとビルドの両方に呼び出されます。プラグインをサーブまたはビルド中にのみ条件付きで適用する必要がある場合、 `apply`プロパティを使用して、 `'build'`または`'serve'`間にのみ呼び出します。

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // または「サーブ」
  }
}
```

より正確な制御には、関数を使用することもできます。

```js
apply(config, { command }) {
  // ビルドにのみ適用しますが、SSRには適用しません
  return command === 'build' && !config.build.ssr
}
```

## ロールアッププラグインの互換性

かなりの数のロールアッププラグインは、一部のプラグインフックがバンドルされていないDEVサーバーコンテキストでは意味をなさないため、それらのすべてではありませんが、Viteプラグイン（ `@rollup/plugin-alias`または`@rollup/plugin-json` ）として直接機能します。

一般的に、ロールアッププラグインが次の基準に適合している限り、Viteプラグインとして機能する必要があります。

- [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed)フックを使用しません。
- バンドルフェーズフックと出力フェーズフックの間には強い結合がありません。

ロールアッププラグインがビルドフェーズに対してのみ理にかなっている場合、代わりに`build.rollupOptions.plugins`で指定できます。 `enforce: 'post'`と`apply: 'build'`のViteプラグインと同じように機能します。

また、Viteのみのプロパティを備えた既存のロールアッププラグインを強化することもできます。

```js [vite.config.js]
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

## パス正規化

Viteは、IDを解決しながらパスを正規化して、Windowsのボリュームを保存しながらPOSIX分離器（ /）を使用します。一方、ロールアップはデフォルトで解決されたパスを把握し続けるため、解決されたIDにはwindows32セパレータ（\）があります。ただし、ロールアッププラグインは、内部的に`@rollup/pluginutils`から[`normalizePath`ユーティリティ関数](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath)を使用して、比較を実行する前にセパレータをPOSIXに変換します。これは、これらのプラグインがViteで使用される場合、 `include`および`exclude`構成パターンおよび解決されたIDの比較に対する他の同様のパスが正しく機能することを意味します。

したがって、Viteプラグインの場合、解決されたIDとパスを比較する場合、POSIX分離器を使用するパスを最初に正規化することが重要です。同等の`normalizePath`ユーティリティ関数が`vite`モジュールからエクスポートされます。

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 「foo/bar」
normalizePath('foo/bar') // 「foo/bar」
```

## フィルタリング、パターンを含める/除外

Viteは[`@rollup/pluginutils`の`createFilter`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter)機能を公開して、Vite Core自体でも使用されるフィルタリングパターンを含む/除外された標準を使用するためにVite固有のプラグインと統合を促進します。

## クライアントサーバーコミュニケーション

Vite 2.9以降、クライアントとの通信を処理するのに役立つプラグイン用のユーティリティを提供します。

### サーバーからクライアント

プラグイン側では、 `server.ws.send`を使用してイベントをクライアントにブロードキャストすることができます。

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: tip NOTE
他のプラグインとの衝突を避けるために、**常にイベント名をプレフィックスすること**をお勧めします。
:::

クライアント側では、 [`hot.on`](/ja/guide/api-hmr.html#hot-on-event-cb)を使用してイベントを聴きます。

```ts twoslash
import 'vite/client'
//  - -カット - -
// クライアント側
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // こんにちは
  })
}
```

### クライアントからサーバーへ

クライアントからサーバーにイベントを送信するには、 [`hot.send`](/ja/guide/api-hmr.html#hot-send-event-payload)使用できます。

```ts
// クライアント側
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

次に、 `server.ws.on`を使用して、サーバー側のイベントを聞きます。

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // おい！
          // クライアントにのみ返信します（必要に応じて）
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### カスタムイベントのタイプスクリプト

内部的には、Viteは`CustomEventMap`インターフェイスからペイロードのタイプを推進します。インターフェイスを拡張してカスタムイベントを入力することができます。

:::tip Note
タイプスクリプト宣言ファイルを指定するときは、必ず`.d.ts`拡張子を含めてください。それ以外の場合、TypeScriptは、モジュールがどのファイルを拡張しようとしているのかわからない場合があります。
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // 「イベントキー」:ペイロード
  }
}
```

このインターフェイス拡張機能は`InferCustomEventPayload<T>`で使用され、イベント`T`のペイロードタイプを推測します。このインターフェイスの使用方法の詳細については、 [HMR APIドキュメント](./api-hmr#hmr-api)を参照してください。

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
//  - -カット - -
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // ペイロードのタイプは{msg:string}になります
})
import.meta.hot?.on('unknown:event', (payload) => {
  // ペイロードのタイプは任意のものになります
})
```
