# サーバーオプション

記載されていない限り、このセクションのオプションはDEVにのみ適用されます。

## server.host

- **タイプ:** `文字列 | boolean`
- **デフォルト:** `'localhost'`

サーバーをリッスンするIPアドレスを指定します。
これを`0.0.0.0`または`true`に設定して、LANやパブリックアドレスを含むすべてのアドレスで聞く。

これは、 `--host 0.0.0.0`または`--host`を使用してCLIを介して設定できます。

::: tip NOTE

他のサーバーがViteの代わりに応答する場合がある場合があります。

最初のケースは、 `localhost`が使用される場合です。 v17の下のnode.jsは、デフォルトでDNS分解アドレスの結果を再発行します。 `localhost`アクセスするとき、ブラウザはDNSを使用してアドレスを解決し、そのアドレスはViteが聞いているアドレスと異なる場合があります。 Viteは、解決されたアドレスが異なるときに印刷します。

[`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order)設定して、並べ替えの動作を無効にできます。 Viteはアドレスを`localhost`として印刷します。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // 省略します
})
```

2番目のケースは、ワイルドカードホスト（ `0.0.0.0` ）が使用されるときです。これは、ワイルドカードのホストではないサーバーがワイルドカードホストを聴く人よりも優先されるためです。

:::

::: tip Accessing the server on WSL2 from your LAN

WSL2でViteを実行する場合、LANからサーバーにアクセスするために`host: true`設定するだけでは不十分です。
詳細については、 [WSLドキュメント](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan)を参照してください。

:::

## server.allowedHosts

- **タイプ:** `string [] | true`
- **デフォルト:** `[]`

Viteが応答することが許可されているホスト名。
`localhost`および`.localhost`未満のドメインとすべてのIPアドレスはデフォルトで許可されます。
HTTPSを使用する場合、このチェックはスキップされます。

文字列が`.`から始まる場合、ホスト名の下にある`.`とすべてのサブドメインなしでそのホスト名が許可されます。たとえば、 `.example.com` `example.com` 、および`foo.bar.example.com` `foo.example.com`します。 `true`に設定すると、サーバーはホストのリクエストに応答することが許可されます。

::: details What hosts are safe to be added?

ホストは、彼らが決意するIPアドレスを制御していることを、許可されたホストのリストに安全に追加できます。

たとえば、ドメイン`vite.dev`を所有している場合、リストに`vite.dev`と`.vite.dev`追加できます。そのドメインを所有しておらず、そのドメインの所有者を信頼できない場合は、追加しないでください。

特に、 `.com`ようなトップレベルのドメインをリストに追加しないでください。これは、誰でも`example.com`ようなドメインを購入し、解決するIPアドレスを制御できるためです。

:::

::: danger

`server.allowedHosts`から`true`設定により、WebサイトはDNSのリバインド攻撃を介して開発者サーバーにリクエストを送信できるようになり、ソースコードとコンテンツをダウンロードできます。許可されているホストの明示的なリストを常に使用することをお勧めします。詳細については[、GHSA-VG6X-RCGG-RJX6](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6)を参照してください。

:::

::: details Configure via environment variable
環境変数`__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`を設定して、追加の許可ホストを追加できます。
:::

## server.port

- **タイプ:** `number`
- **デフォルト:** `5173`

サーバーポートを指定します。ポートが既に使用されている場合、Viteは次の使用可能なポートを自動的に試してみるので、これがサーバーがリッスンする実際のポートではない可能性があります。

## server.strictPort

- **タイプ:** `boolean`

次の利用可能なポートを自動的に試す代わりに、ポートが既に使用されている場合は、 `true`に設定します。

## server.https

- **タイプ:** `https.ServerOptions`

TLS + HTTP/2を有効にします。注意は、 [`server.proxy`オプション](#server-proxy)も使用されている場合にのみTLSにダウングレードします。

値は、 `https.createServer()`に渡される[オプションオブジェクト](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)でもあります。

有効な証明書が必要です。基本的なセットアップの場合、 [@Vitejs/Plugin-Basic-SSLを](https://github.com/vitejs/vite-plugin-basic-ssl)プロジェクトプラグインに追加できます。これにより、自己署名証明書が自動的に作成およびキャッシュされます。ただし、独自の証明書を作成することをお勧めします。

## server.open

- **タイプ:** `Boolean | string`

サーバー開始のブラウザでアプリを自動的に開きます。値が文字列の場合、URLのパス名として使用されます。好きな特定のブラウザでサーバーを開きたい場合は、env `process.env.BROWSER` （例えば`firefox` ）を設定できます。 `process.env.BROWSER_ARGS`設定して追加の引数を渡すこともできます（例: `--incognito` ）。

`BROWSER`と`BROWSER_ARGS` 、 `.env`ファイルに設定して設定できる特別な環境変数でもあります。詳細については、 [`open`パッケージ](https://github.com/sindresorhus/open#app)を参照してください。

**例:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **タイプ:** `レコード<文字列、文字列 | プロキシオプティオン> `

開発サーバーのカスタムプロキシルールを構成します。 `{ key: options }`ペアのオブジェクトが期待されます。要求パスがそのキーから始まる要求は、その指定されたターゲットにプロキシ化されます。キーが`^`で始まる場合、それは`RegExp`として解釈されます。 `configure`オプションを使用して、プロキシインスタンスにアクセスできます。リクエストが構成されたプロキシルールのいずれかと一致する場合、リクエストはViteによって変換されません。

非相対的な[`base`](/ja/config/shared-options.md#base)使用している場合、各キーをその`base`にプレフィックスする必要があることに注意してください。

[`http-proxy`](https://github.com/http-party/node-http-proxy#options)を拡張します。追加のオプションは[こちら](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13)です。

場合によっては、基礎となるDEVサーバーを構成することもできます（たとえば、内部[接続](https://github.com/senchalabs/connect)アプリにカスタムミドルウェアを追加するため）。それを行うには、独自の[プラグイン](/ja/guide/using-plugins.html)を作成し、 [configureServer](/ja/guide/api-plugin.html#configureserver)関数を使用する必要があります。

**例:**

```js
export default defineConfig({
  server: {
    proxy: {
      // String Shorthand:
      // http:// localhost:5173/foo
      //   - > [http:// localhost:4567/foo](http://localhost:4567/foo)
      '/foo': 'http://localhost:4567',
      // オプション付き:
      // http:// localhost:5173/api/bar
      //   - > [http://jsonplaceholder.typicode.com/bar](http://jsonplaceholder.typicode.com/bar)
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // regexpで:
      // http:// localhost:5173/fallback/
      //   - > [http://jsonplaceholder.typicode.com/](http://jsonplaceholder.typicode.com/)
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // プロキシインスタンスを使用します
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // プロキシは「http-proxy」のインスタンスになります
        },
      },
      // WebSocketsまたはsocket.ioのプロキシ:
      // ws:// localhost:5173/socket.io
      //   - > ws:// localhost:5174/socket.io
      // 0を離れる可能性があるため、 `rewriteWsOrigin`を使用して注意を払ってください
      // CSRF攻撃に開かれたプロキシ。
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **タイプ:** `Boolean | corsoptions`
- **デフォルト:** `{origin:/^https?://(？:(？:[^:]（+.)？localhost|127\.0\.0\.1|[:: 1]）（？:: \ d+）？$/}  127.0.0.1  :: 1`を許可）

開発サーバー用のCORを構成します。[オプションオブジェクト](https://github.com/expressjs/cors#configuration-options)を渡して、動作を微調整して、起源を許可し`true` 。

::: danger

`server.cors`から`true`設定により、任意のWebサイトが開発者サーバーにリクエストを送信し、ソースコードとコンテンツをダウンロードできます。許可された起源の明示的なリストを常に使用することをお勧めします。

:::

## server.headers

- **タイプ:** `OutgoingHttpHeaders`

サーバー応答ヘッダーを指定します。

## server.hmr

- **タイプ:** `Boolean | {protocol？:string、host？:string、port？:number、path？:string、timeout？:number、overlay？:boolean、clientport？:number、server？:server} `

HMR接続を無効または構成します（HMR WebsocketがHTTPサーバーとは異なるアドレスを使用する必要がある場合）。

`server.hmr.overlay`から`false`を設定して、サーバーエラーオーバーレイを無効にします。

`protocol` HMR接続に使用されるWebSocketプロトコルを設定します: `ws` （WebSocket）または`wss` （WebSocket Secure）。

`clientPort`は、クライアント側のポートのみをオーバーライドする高度なオプションであり、クライアントコードが検索するのとは異なるポートでWebSocketを提供できるようにします。

`server.hmr.server`が定義されると、Viteは提供されたサーバーを介してHMR接続要求を処理します。ミドルウェアモードではない場合、Viteは既存のサーバーを介してHMR接続要求を処理しようとします。これは、自己署名証明書を使用する場合、または単一のポート上のネットワーク上でViteを公開する場合に役立ちます。

いくつかの例については、 [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue)をチェックしてください。

::: tip NOTE

デフォルトの構成を使用すると、Viteの前の逆プロキシがWebSockingのプロキシをサポートすることが期待されています。 Vite HMRクライアントがWebSocketを接続できない場合、クライアントはWebSocketをVite HMRサーバーに直接接続することに戻り、逆プロキシをバイパスします。

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

フォールバックが発生したときにブラウザに表示されるエラーは無視できます。逆プロキシを直接バイパスしてエラーを回避するには、次のことをすることができます。

- Proxy WebSocxeに逆プロキシを構成します
- [`server.strictPort = true`](#server-strictport)を設定し、 `server.hmr.clientPort` `server.port`同じ値に設定します
- `server.hmr.port` [`server.port`](#server-port)から異なる値に設定します

:::

## server.warmup

- **タイプ:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **関連:**[頻繁に使用されるファイルをウォームアップします](/ja/guide/performance.html#warm-up-frequently-used-files)

ファイルをウォームアップして、結果を事前に変換およびキャッシュします。これにより、サーバーの起動中の初期ページのロードが改善され、滝の変換が防止されます。

`clientFiles`クライアントでのみ使用されるファイルであり、 `ssrFiles` SSRでのみ使用されるファイルです。彼らは、 `root`に対するファイルパスまたは[`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby)パターンの配列を受け入れます。

起動時にVite Devサーバーを過負荷にしないように頻繁に使用されるファイルのみを追加してください。

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **タイプ:** `オブジェクト | null`

[Chokidar](https://github.com/paulmillr/chokidar/tree/3.6.0#api)に渡すためのファイルシステムウォッチャーオプション。

Vite Server Watcherは`root`監視し、デフォルトで`.git/` `node_modules/`およびViteの`cacheDir`および`build.outDir`ディレクトリをスキップします。監視されたファイルを更新するとき、ViteはHMRを適用し、必要な場合にのみページを更新します。

`null`に設定すると、ファイルは視聴されません。 `server.watcher`互換性のあるイベントエミッターを提供しますが、 `add`または`unwatch`呼び出すことは効果がありません。

::: warning Watching files in `node_modules`

現在、 `node_modules`でファイルやパッケージを視聴することはできません。さらなる進捗と回避策のために、[問題＃8619](https://github.com/vitejs/vite/issues/8619)に従うことができます。

:::

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

WSL2でViteを実行する場合、ファイルシステムがWindowsアプリケーション（Non-WSL2プロセス）によって編集されている場合、ファイルシステム監視は機能しません。これは[、WSL2の制限](https://github.com/microsoft/WSL/issues/4739)によるものです。これは、WSL2バックエンドでDockerでの実行にも適用されます。

それを修正するために、あなたはどちらもできます:

- **推奨**:WSL2アプリケーションを使用して、ファイルを編集します。
  - また、プロジェクトフォルダーをWindowsファイルシステムの外に移動することもお勧めします。 WSL2からWindowsファイルシステムへのアクセスは遅いです。そのオーバーヘッドを削除すると、パフォーマンスが向上します。
- 設定`{ usePolling: true }` 。
  - [`usePolling`高いCPU利用につながることに](https://github.com/paulmillr/chokidar/tree/3.6.0#performance)注意してください。

:::

## server.middlewareMode

- **タイプ:** `boolean`
- **デフォルト:** `false`

ミドルウェアモードでViteサーバーを作成します。

- **関連:** [AppType](./shared-options#apptype) 、 [SSR-開発サーバーのセットアップ](/ja/guide/ssr#setting-up-the-dev-server)

- **例:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // ミドルウェアモードでViteサーバーを作成します
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // ViteのデフォルトのHTMLハンドリングミドルウェアを含めないでください
    appType: 'custom',
  })
  // viteの接続インスタンスをミドルウェアとして使用します
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // `appType`は`'custom'`であるため、ここで応答する必要があります。
    // 注: `appType`が`'spa'`または`'mpa'`場合、ViteにはMiddleWaresが含まれます
    // HTMLリクエストと404を処理するために、ユーザーミドルウェアを追加する必要があります
    // 代わりにViteのMiddlewaresが効果を発揮する前に
  })
}

createServer()
```

## server.fs.strict

- **タイプ:** `boolean`
- **デフォルト:** `true` （vite2.7以降のデフォルトで有効）

ワークスペースルートの外側のサービングファイルを制限します。

## server.fs.allow

- **タイプ:** `string[]`

`/@fs/`で提供できるファイルを制限します。 `server.fs.strict` `true`に設定されている場合、許可されたファイルからインポートされていないこのディレクトリリストの外部のファイルにアクセスすると、403になります。

ディレクトリとファイルの両方を提供できます。

Viteは、潜在的なワークスペースのルートを検索し、デフォルトとして使用します。有効なワークスペースが次の条件を満たし、それ以外の場合は[プロジェクトルート](/ja/guide/#index-html-and-project-root)に戻ります。

- `package.json`に`workspaces`フィールドが含まれます
- 次のファイルのいずれかが含まれています
  - `lerna.json`
  - `pnpm-workspace.yaml`

カスタムワークスペースルートを指定するパスを受け入れます。[プロジェクトルート](/ja/guide/#index-html-and-project-root)に対する絶対的なパスまたはパスである可能性があります。例えば:

```js
export default defineConfig({
  server: {
    fs: {
      // 1つのレベルからプロジェクトルートまでのファイルを提供する
      allow: ['..'],
    },
  },
})
```

`server.fs.allow`が指定されると、自動ワークスペースのルート検出が無効になります。元の動作を拡張するために、ユーティリティ`searchForWorkspaceRoot`が公開されます。

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // ワークスペースルートを検索します
        searchForWorkspaceRoot(process.cwd()),
        // カスタムルール
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **タイプ:** `string[]`
- **デフォルト:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

Vite Dev Serverによって提供されるように制限されている機密ファイルのブロックリスト。これは[`server.fs.allow`](#server-fs-allow)よりも優先度が高くなります。 [Picomatchパターン](https://github.com/micromatch/picomatch#globbing-features)がサポートされています。

## server.origin

- **タイプ:** `string`

開発中に生成された資産URLの起源を定義します。

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **タイプ:** `false | （SourcePath:string、sourcemappath:string）=> boolean`
- **デフォルト:** `(sourcePath) => sourcePath.includes('node_modules')`

[`x_google_ignoreList`ソースマップ拡張機能](https://developer.chrome.com/articles/x-google-ignore-list/)を埋めるために使用されるサーバーSourceMap内のソースファイルを無視するかどうか。

`server.sourcemapIgnoreList`は、DEVサーバーの[`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist)に相当します。 2つの構成オプションの違いは、 `sourcePath`の相対パスでロールアップ関数が呼び出され、 `server.sourcemapIgnoreList`絶対パスで呼び出されることです。開発中、ほとんどのモジュールには同じフォルダーにマップとソースがあるため、 `sourcePath`の相対パスはファイル名自体です。これらの場合、絶対パスは代わりに使用するのが便利です。

デフォルトでは、 `node_modules`を含むすべてのパスを除外します。 `false`渡してこの動作を無効にするか、完全な制御のために、ソースパスとSourceMapパスを取得し、ソースパスを無視するかどうかを返す関数です。

```js
export default defineConfig({
  server: {
    // これはデフォルト値であり、node_modulesを備えたすべてのファイルを追加します
    // 無視リストへのパスで。
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Note
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist)と[`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist)独立して設定する必要があります。 `server.sourcemapIgnoreList`サーバーのみの構成であり、定義されたロールアップオプションからデフォルト値を取得しません。
:::
