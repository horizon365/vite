# フレームワークの環境API

:::warning Experimental
環境APIは実験的です。 Vite 6の間、APIを安定させて、生態系を実験し、その上に構築します。 Vite 7の潜在的な破壊変化を伴うこれらの新しいAPIを安定させることを計画しています。

リソース:

- 新しいAPIに関するフィードバックを収集している[フィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)。
- 新しいAPIが実装およびレビューされた[環境API PR](https://github.com/vitejs/vite/pull/16471) 。

フィードバックを私たちと共有してください。
:::

## 環境とフレームワーク

暗黙の`ssr`環境およびその他の非クライアント環境は、DEV中にデフォルトで`RunnableDevEnvironment`使用します。これにはランタイムがViteサーバーが実行されているものと同じである必要がありますが、これは同様に`ssrLoadModule`で動作し、SSR DevストーリーのHMRを移行および有効にすることができます。 `isRunnableDevEnvironment`機能で実行可能な環境をガードできます。

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * 実行するURL。
   * ルートに対するファイルパス、サーバーパス、またはIDを受け入れます。
   * インスタンス化されたモジュールを返します（SSRLoadModuleと同じ）
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * その他のモジュールランナーメソッド...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
`runner` 、初めてアクセスすると熱心に評価されます。 Viteは、 `runner`を呼び出して`process.setSourceMapsEnabled`作成した場合、または使用できない場合は`Error.prepareStackTrace`オーバーライドすることにより、ソースマップサポートを有効にすることに注意してください。
:::

## デフォルト`RunnableDevEnvironment`

[SSRセットアップガイド](/ja/guide/ssr#setting-up-the-dev-server)で説明されているミドルウェアモードで構成されたVITEサーバーが与えられた場合、環境APIを使用してSSRミドルウェアを実装しましょう。エラー処理は省略されています。

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // デフォルトでは、モジュールはViteサーバーと同じプロセスで実行されます
    },
  },
})

// TypeScriptまたは
// IsRunNableVenVenvironmentを使用して、ランナーへのアクセスを保護します
const environment = server.environments.node

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. index.htmlを読み取ります
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Vite HTML変換を適用します。これにより、Vite HMRクライアントが注入されます。
  //    また、ViteプラグインからのHTML変換も適用します。グローバル
  //    @vitejs/プラグイン反応からのプリアンブル
  template = await server.transformIndexHtml(url, template)

  // 3.サーバーエントリをロードします。インポート（URL）は自動的に変換されます
  //    node.jsで使用できるESMソースコード！バンドルはありません
  //    必須であり、完全なHMRサポートを提供します。
  const { render } = await environment.runner.import('/src/entry-server.js')

  // 4.アプリHTMLをレンダリングします。これは、Entry-Server.jsのエクスポートを想定しています
  //     `render`関数は適切なフレームワークSSR APIを呼び出します、
  //    例えばReactdomserver.rendertostring（）
  const appHtml = await render(url)

  // 5.アプリレンダリングされたHTMLをテンプレートに挿入します。
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6.レンダリングされたHTMLを送信します。
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

## ランタイムアグノーシスSSR

`RunnableDevEnvironment` Viteサーバーと同じ実行時にコードを実行するためにのみ使用できるため、Viteサーバー（node.jsと互換性のあるランタイム）を実行できるランタイムが必要です。これは、RAW `DevEnvironment`使用してランタイム不可知論者にする必要があることを意味します。

:::info `FetchableDevEnvironment` proposal

最初の提案には、 `DevEnvironment`クラスに`run`メソッドがあり、消費者は`transport`オプションを使用してランナー側にインポートを呼び出すことができます。テスト中、APIが推奨を開始するほど普遍的ではないことがわかりました。現時点では、 [`FetchableDevEnvironment`提案](https://github.com/vitejs/vite/discussions/18191)に関するフィードバックを探しています。

:::

`RunnableDevEnvironment`は、モジュールの値を返す`runner.import`関数があります。ただし、この関数はRAW `DevEnvironment`では使用できず、ViteのAPIとユーザーモジュールを使用してコードを分離する必要があります。

たとえば、次の例では、ViteのAPIを使用してコードからユーザーモジュールの値を使用します。

```ts
// ViteのAPIを使用したコード
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entry.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// ----------------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

コードがユーザーモジュールと同じランタイムで実行できる場合（つまり、node.js固有のAPIに依存しない）、仮想モジュールを使用できます。このアプローチは、ViteのAPIを使用してコードから値にアクセスする必要性を排除します。

```ts
// ViteのAPIを使用したコード
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // `virtual:entrypoint`を処理するプラグイン
    {
      name: 'virtual-module',
      /* プラグインの実装 */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// コードを実行する各環境工場による露出機能を使用する
// それらが提供するものごとに各環境工場を確認してください
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// ----------------------------------------------
// 仮想:エントリポイント
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// ----------------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

たとえば、ユーザーモジュールで`transformIndexHtml`呼び出すには、次のプラグインを使用できます。

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

コードにnode.js APIが必要な場合、 `hot.send`使用して、ユーザーモジュールのViteのAPIを使用するコードと通信できます。ただし、このアプローチはビルドプロセス後も同じように機能しない場合があることに注意してください。

```ts
// ViteのAPIを使用したコード
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // `virtual:entrypoint`を処理するプラグイン
    {
      name: 'virtual-module',
      /* プラグインの実装 */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// コードを実行する各環境工場による露出機能を使用する
// それらが提供するものごとに各環境工場を確認してください
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// ----------------------------------------------
// 仮想:エントリポイント
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('/'))

// ----------------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## ビルド中の環境

CLIでは、 `vite build`と`vite build --ssr`呼び出すと、クライアントのみが構築され、SSRのみの環境が後方互換性のために構築されます。

`builder`が`undefined`でない場合（または`vite build --app`呼び出すとき）、 `vite build`代わりにアプリ全体の構築にオプトインします。これは後に将来の専攻のデフォルトになります。 `ViteBuilder`インスタンスが作成され（ `ViteDevServer`に相当するビルドタイム）、生産用に構成されたすべての環境を構築します。デフォルトでは、環境のビルドは、 `environments`レコードの順序を考慮して直列に実行されます。フレームワークまたはユーザーは、以下を使用して環境の構築方法をさらに構成できます。

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

## 環境不可知論コード

ほとんどの場合、現在の`environment`インスタンスは、コードが実行されているコンテキストの一部として利用可能であるため、 `server.environments`からアクセスする必要があるはずです。たとえば、内部プラグインフックは`PluginContext`の一部として環境が露出しているため、 `this.environment`使用してアクセスできます。[プラグインの環境APIを](./api-environment-plugins.md)参照して、環境認識プラグインを構築する方法について学びます。
