# JavaScript API

ViteのJavaScript APIは完全に入力されており、TypeScriptを使用するか、JSタイプのチェックを使用してIntelliSenseと検証を活用することをお勧めします。

## `createServer`

**タイプ署名:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**使用例:**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // 有効なユーザー構成オプションに加えて、 `mode`および`configFile`
  configFile: false,
  root: __dirname,
  server: {
    port: 1337,
  },
})
await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })
```

::: tip NOTE
同じnode.jsプロセスで`createServer`と`build`使用する場合、両方の関数は`process.env.NODE_ENV`に依存して適切に動作します。これは`mode` configオプションにも依存します。矛盾する動作を防ぐために、 `process.env.NODE_ENV`または2つのAPIのうち`mode`を`development`に設定します。それ以外の場合は、子どものプロセスを生成してAPIを個別に実行できます。
:::

::: tip NOTE
[ミドルウェアモード](/ja/config/server-options.html#server-middlewaremode)を使用して[WebSockingのプロキシ構成](/ja/config/server-options.html#server-proxy)を組み合わせた場合、親HTTPサーバーを`middlewareMode`に提供して、プロキシを正しく結合する必要があります。

<details><summary>例</summary><pre><code class="language-ts">import http from 'http' import { createServer } from 'vite' const parentServer = http.createServer() // or express, koa, etc. const vite = await createServer({ server: { // Enable middleware mode middlewareMode: { // Provide the parent http server for proxy WebSocket server: parentServer, }, proxy: { '/ws': { target: 'ws://localhost:3000', // Proxying WebSocket ws: true, }, }, }, }) // @noErrors: 2339 parentServer.use(vite.middlewares)</code></pre></details>
:::

## `InlineConfig`

`InlineConfig`インターフェイスは、追加のプロパティで`UserConfig`拡張します。

- `configFile` :使用する構成ファイルを指定します。設定されていない場合、ViteはProject Rootから1つを自動的に解決しようとします。自動解像度を無効にするために`false`に設定します。
- `envFile` : `false`に設定して`.env`ファイルを無効にします。

## `ResolvedConfig`

`ResolvedConfig`インターフェイスには、ほとんどのプロパティが解決され、非不定であることを除いて、 `UserConfig`のすべての同じプロパティがあります。次のようなユーティリティも含まれています。

- `config.assetsInclude` : `id`が資産と見なされるかどうかを確認する関数。
- `config.logger` :Viteの内部ロガーオブジェクト。

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * 解決されたVite構成オブジェクト。
   */
  config: ResolvedConfig
  /**
   * 接続アプリインスタンス
   *  - カスタムミドルウェアを開発サーバーに接続するために使用できます。
   *  - カスタムHTTPサーバーのハンドラー関数としても使用できます
   *   または、任意のConnectスタイルのnode.jsフレームワークのミドルウェアとして。
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * ネイティブノードHTTPサーバーインスタンス。
   * ミドルウェアモードでヌルになります。
   */
  httpServer: http.Server | null
  /**
   * Chokidarウォッチャーインスタンス。 `config.server.watch` `null`に設定されている場合、
   * ファイルは視聴せず、 `add`または`unwatch`呼び出すことは効果がありません。
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * `send(payload)`メソッドを備えたWebソケットサーバー。
   */
  ws: WebSocketServer
  /**
   * 特定のファイルでプラグインフックを実行できるロールアッププラグインコンテナ。
   */
  pluginContainer: PluginContainer
  /**
   * インポート関係を追跡するモジュールグラフ、ファイルマッピングへのURL
   * およびHMR状態。
   */
  moduleGraph: ModuleGraph
  /**
   * 解決されたURLSは、CLI（URLエンコード）に印刷されています。 `null`を返します
   * ミドルウェアモードで、またはサーバーがポートで聞いていない場合。
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * プログラム的に解決、ロード、変換され、結果を取得します
   * HTTPリクエストパイプラインを通過することなく。
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * vite内蔵のHTML変換と任意のプラグインHTML変換を適用します。
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * 特定のURLをSSRのインスタンス化モジュールとしてロードします。
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * SSRエラースタックトレースを修正します。
   */
  ssrFixStacktrace(e: Error): void
  /**
   * モジュールグラフのモジュールのHMRをトリガーします。 `server.moduleGraph`を使用できます
   * リロードするモジュールを取得するAPI。 `hmr`が偽の場合、これはopです。
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * サーバーを起動します。
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * サーバーを再起動します。
   *
   * @param forcoptimize-オプティマイザーに再びバンドルを強制します -   - フォースCLIフラグ
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * サーバーを停止します。
   */
  close(): Promise<void>
  /**
   * CLIショートカットをバインドします
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * 呼び出し`await server.waitForRequestsIdle(id)`は、すべての静的インポートがすべて待機されます
   * 処理されています。ロードまたは変換プラグインフックから呼び出された場合、IDは
   * デッドロックを避けるためにパラメーターとして渡されました。この関数を最初から呼び出します
   * モジュールグラフの静的インポートセクションが処理され、すぐに解決されます。
   * @experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` 、Vite Devサーバーのオンデマンドの性質に従って実装できない機能のDXを改善するためのエスケープハッチとして使用することを目的としています。スタートアップ中にTailwindなどのツールで使用して、アプリコードが表示されるまでアプリCSSクラスの生成を遅らせ、スタイルの変更のフラッシュを回避できます。この関数が負荷または変換フックで使用され、デフォルトのHTTP1サーバーが使用されると、6つのHTTPチャネルの1つがすべての静的インポートを処理するまでブロックされます。現在、Viteの依存関係者は、この関数を使用して、すべてのインポートされた依存関係が静的なインポートされたソースから収集されるまで、事前にバンドルされた依存関係の負荷を遅らせることにより、欠落依存関係のフルページのリロードを回避しています。 Viteは、将来の主要なリリースで異なる戦略に切り替えることができ、デフォルトで`optimizeDeps.crawlUntilStaticImports: false`設定して、コールドスタート中の大規模なアプリケーションでのパフォーマンスのヒットを回避します。
:::

## `build`

**タイプ署名:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**使用例:**

```ts twoslash [vite.config.js]
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await build({
  root: path.resolve(__dirname, './project'),
  base: '/foo/',
  build: {
    rollupOptions: {
      // ...
    },
  },
})
```

## `preview`

**タイプ署名:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**使用例:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // 有効なユーザー構成オプションに加えて、 `mode`および`configFile`
  preview: {
    port: 8080,
    open: true,
  },
})

previewServer.printUrls()
previewServer.bindCLIShortcuts({ print: true })
```

## `PreviewServer`

```ts
interface PreviewServer {
  /**
   * 解決されたVite構成オブジェクト
   */
  config: ResolvedConfig
  /**
   * 接続アプリインスタンス。
   * -Previewサーバーにカスタムミドルウェアを添付するために使用できます。
   *  - カスタムHTTPサーバーのハンドラー関数としても使用できます
   *   または、任意のConnectスタイルのnode.jsフレームワークのミドルウェアとして
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * ネイティブノードHTTPサーバーインスタンス
   */
  httpServer: http.Server
  /**
   * 解決されたURLSは、CLI（URLエンコード）に印刷されています。 `null`を返します
   * サーバーがポートで聞いていない場合。
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * サーバーURLを印刷します
   */
  printUrls(): void
  /**
   * CLIショートカットをバインドします
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**タイプ署名:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

`command`値はDEVとプレビューで`serve` 、ビルドで`build` 。

## `mergeConfig`

**タイプ署名:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

2つのVite構成を深くマージします。 `isRoot` 、マージされているVite構成内のレベルを表します。たとえば、2つの`build`オプションをマージしている場合は、 `false`設定します。

::: tip NOTE
`mergeConfig`オブジェクトフォームの構成のみを受け入れます。コールバックフォームの構成がある場合は、 `mergeConfig`に渡す前に呼び出す必要があります。

`defineConfig`ヘルパーを使用して、コールバックフォームの構成を別の構成とマージできます。

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

//  - -カット - -
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**タイプ署名:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**関連:** [server.fs.allow](/ja/config/server-options.md#server-fs-allow)

次の条件を満たしている場合は、潜在的なワークスペースのルートを検索します。そうしないと、 `root`にフォールバックします。

- `package.json`に`workspaces`フィールドが含まれます
- 次のファイルのいずれかが含まれています
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**タイプ署名:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**関連:** [`.env`ファイル](./env-and-mode.md#env-files)

`envDir`内に`.env`ファイルをロードします。デフォルトでは、 `prefixes`変更されていない限り、 `VITE_`で付けられたENV変数のみがロードされます。

## `normalizePath`

**タイプ署名:**

```ts
function normalizePath(id: string): string
```

**関連:**[パス正規化](./api-plugin.md#path-normalization)

Viteプラグイン間の相互運用へのパスを正規化します。

## `transformWithEsbuild`

**タイプ署名:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

esbuildを使用してJavaScriptまたはTypeScriptを変換します。 Viteの内部Esbuild変換を一致させることを好むプラグインに役立ちます。

## `loadConfigFromFile`

**タイプ署名:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  customLogger?: Logger,
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

esbuildでVite構成ファイルを手動でロードします。

## `preprocessCSS`

- **実験:**[フィードバックを与える](https://github.com/vitejs/vite/discussions/13815)

**タイプ署名:**

```ts
async function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig,
): Promise<PreprocessCSSResult>

interface PreprocessCSSResult {
  code: string
  map?: SourceMapInput
  modules?: Record<string, string>
  deps?: Set<string>
}
```

プリプロセス`.css` `.sass` `.stylus` CSSにファイルを`.scss` `.styl`て、ブラウザーで使用したり、他の`.less`で解析したりできます。[組み込みのCSS前処理サポート](/ja/guide/features#css-pre-processors)と同様に、使用する場合は、対応するプリプロセッサをインストールする必要があります。

使用される前プロセッサは、 `filename`拡張子から推測されます。 `filename` `.module.{ext}`で終了する場合、 [CSSモジュール](https://github.com/css-modules/css-modules)として推測され、返された結果には、元のクラス名を変換された名前にマッピングする`modules`オブジェクトが含まれます。

前処理は`url()`または`image-set()`でURLを解決しないことに注意してください。
