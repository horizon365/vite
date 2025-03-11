# ランタイムの環境API

:::warning Experimental
環境APIは実験的です。 Vite 6の間、APIを安定させて、生態系を実験し、その上に構築します。 Vite 7の潜在的な破壊変化を伴うこれらの新しいAPIを安定させることを計画しています。

リソース:

- 新しいAPIに関するフィードバックを収集している[フィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)。
- 新しいAPIが実装およびレビューされた[環境API PR](https://github.com/vitejs/vite/pull/16471) 。

フィードバックを私たちと共有してください。
:::

## 環境工場

環境工場は、エンドユーザーではなく、CloudFlareなどの環境プロバイダーによって実装されることを目的としています。環境工場は、開発環境とビルド環境の両方にターゲットランタイムを使用する最も一般的なケースの場合、 `EnvironmentOptions`を返します。デフォルトの環境オプションも設定できるため、ユーザーはそれを行う必要がありません。

```ts
function createWorkerdEnvironment(
  userConfig: EnvironmentOptions,
): EnvironmentOptions {
  return mergeConfig(
    {
      resolve: {
        conditions: [
          /*...*/
        ],
      },
      dev: {
        createEnvironment(name, config) {
          return createWorkerdDevEnvironment(name, config, {
            hot: true,
            transport: customHotChannel(),
          })
        },
      },
      build: {
        createEnvironment(name, config) {
          return createWorkerdBuildEnvironment(name, config)
        },
      },
    },
    userConfig,
  )
}
```

次に、構成ファイルを次のように記述できます。

```js
import { createWorkerdEnvironment } from 'vite-environment-workerd'

export default {
  environments: {
    ssr: createWorkerdEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
    rsc: createWorkerdEnvironment({
      build: {
        outDir: '/dist/rsc',
      },
    }),
  },
}
```

また、Frameworksは、WorkerDランタイムで環境を使用して、以下を使用してSSRを実行できます。

```js
const ssrEnvironment = server.environments.ssr
```

## 新しい環境工場の作成

Vite Dev Serverは、デフォルトで2つの環境を公開します: `client`環境と`ssr`環境。クライアント環境はデフォルトでブラウザ環境であり、モジュールランナーは仮想モジュール`/@vite/client`クライアントアプリにインポートすることにより実装されます。 SSR環境は、デフォルトでViteサーバーと同じノードランタイムで実行され、HMRサポートを完全にサポートするDEV中にアプリケーションサーバーを使用できるようにします。

変換されたソースコードはモジュールと呼ばれ、各環境で処理されたモジュール間の関係はモジュールグラフに保持されます。これらのモジュールの変換されたコードは、実行される各環境に関連付けられたランタイムに送信されます。ランタイムでモジュールが評価されると、モジュールグラフのセクションの処理をトリガーするインポートされたモジュールが要求されます。

Viteモジュールランナーは、最初にViteプラグインを使用してコードを処理して、任意のコードを実行できます。ランナーの実装がサーバーから分離されているため、 `server.ssrLoadModule`とは異なります。これにより、ライブラリとフレームワークの著者は、Viteサーバーとランナー間の通信層を実装できます。ブラウザは、サーバーWebソケットを使用してHTTPリクエストを使用して、対応する環境と通信します。ノードモジュールランナーは、同じプロセスで実行されているため、モジュールを処理するための関数呼び出しを直接実行できます。他の環境は、WorkerDのようなJSランタイムに接続して、VitestのようにWorkerスレッドに接続するモジュールを実行できます。

この機能の目標の1つは、コードを処理および実行するためのカスタマイズ可能なAPIを提供することです。ユーザーは、露出したプリミティブを使用して新しい環境工場を作成できます。

```ts
import { DevEnvironment, HotChannel } from 'vite'

function createWorkerdDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context: DevEnvironmentContext
) {
  const connection = /* ... */
  const transport: HotChannel = {
    on: (listener) => { connection.on('message', listener) },
    send: (data) => connection.send(data),
  }

  const workerdDevEnvironment = new DevEnvironment(name, config, {
    options: {
      resolve: { conditions: ['custom'] },
      ...context.options,
    },
    hot: true,
    transport,
  })
  return workerdDevEnvironment
}
```

## `ModuleRunner`

モジュールランナーは、ターゲットランタイムにインスタンス化されます。次のセクションのすべてのAPIは、特に明記しない限り、 `vite/module-runner`からインポートされます。このエクスポートエントリポイントは、可能な限り軽量に保持され、モジュールランナーの作成に必要な最小限のエクスポートのみをエクスポートします。

**タイプ署名:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * 実行するURL。
   * ルートに対するファイルパス、サーバーパス、またはIDを受け入れます。
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * HMRリスナーを含むすべてのキャッシュをクリアします。
   */
  public clearCache(): void
  /**
   * すべてのキャッシュをクリアし、すべてのHMRリスナーを削除し、SourceMapサポートをリセットします。
   * このメソッドはHMR接続を停止しません。
   */
  public async close(): Promise<void>
  /**
   * `close()`呼び出してランナーが閉じられている場合は`true`返します。
   */
  public isClosed(): boolean
}
```

`ModuleRunner`のモジュール評価者は、コードの実行を担当します。 Viteは1つの箱から`ESModulesEvaluator`エクスポートし、 `new AsyncFunction`使用してコードを評価します。 JavaScriptランタイムが危険な評価をサポートしていない場合、独自の実装を提供できます。

モジュールランナーは`import`メソッドを公開します。 Vite Serverが`full-reload` HMRイベントをトリガーすると、影響を受けるすべてのモジュールが再実行されます。モジュールランナーは、これが発生したときに`exports`オブジェクトを更新しない（オーバーライド）、最新の`exports`オブジェクトを使用することに依存している場合は、 `import`実行するか、 `evaluatedModules`からモジュールを取得する必要があることに注意してください。

**使用例:**

```js
import { ModuleRunner, ESModulesEvaluator } from 'vite/module-runner'
import { transport } from './rpc-implementation.js'

const moduleRunner = new ModuleRunner(
  {
    transport,
  },
  new ESModulesEvaluator(),
)

await moduleRunner.import('/src/entry-point.js')
```

## `ModuleRunnerOptions`

```ts twoslash
import type {
  InterceptorOptions as InterceptorOptionsRaw,
  ModuleRunnerHmr as ModuleRunnerHmrRaw,
  EvaluatedModules,
} from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type InterceptorOptions = Debug<InterceptorOptionsRaw>
type ModuleRunnerHmr = Debug<ModuleRunnerHmrRaw>
/** 以下を参照してください */
type ModuleRunnerTransport = unknown

//  - -カット - -
interface ModuleRunnerOptions {
  /**
   * サーバーと通信する一連のメソッド。
   */
  transport: ModuleRunnerTransport
  /**
   * ソースマップの解決方法を構成します。
   * `process.setSourceMapsEnabled`利用可能な場合は`node`好みます。
   * それ以外の場合は、デフォルトでオーバーライドする`prepareStackTrace`使用します
   * `Error.prepareStackTrace`メソッド。
   * ファイルコンテンツを構成するオブジェクトを提供できます。
   * ソースマップは、Viteによって処理されなかったファイルに対して解決されます。
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * HMRを無効にするか、HMRオプションを構成します。
   *
   * @Default True
   */
  hmr?: boolean | ModuleRunnerHmr
  /**
   * カスタムモジュールキャッシュ。提供されていない場合は、個別のモジュールを作成します
   * 各モジュールランナーインスタンスのキャッシュ。
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**タイプ署名:**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

//  - -カット - -
export interface ModuleEvaluator {
  /**
   * 変換されたコードのプレフィックス行の数。
   */
  startOffset?: number
  /**
   * Viteによって変換されたコードを評価します。
   * @paramコンテキスト関数コンテキスト
   * @paramコード変換コード
   * モジュールを取得するために使用された@param ID ID
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * 外部化されたモジュールを評価します。
   * @paramファイルファイルURL外部モジュールへ
   */
  runExternalModule(file: string): Promise<any>
}
```

このインターフェイスをデフォルトで実装するVite Exports `ESModulesEvaluator` 。 `new AsyncFunction`使用してコードを評価するため、コードにソースマップがインラリングされている場合は、新しい行に対応するために[2行のオフセット](https://tc39.es/ecma262/#sec-createdynamicfunction)を含める必要があります。これは`ESModulesEvaluator`によって自動的に行われます。カスタム評価者は追加の行を追加しません。

## `ModuleRunnerTransport`

**タイプ署名:**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** オブジェクト */
type HotPayload = unknown
//  - -カット - -
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

RPCを介して環境と通信するか、関数を直接呼び出すことにより、オブジェクトを輸送します。 `invoke`メソッドが実装されていない場合、 `send`メソッドと`connect`メソッドを実装する必要があります。 Viteは`invoke`内部的に構築します。

マジュールランナーがワーカースレッドで作成されるこの例のように、サーバー上の`HotChannel`インスタンスと組み合わせる必要があります。

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @Type {Import（ 'Vite/Module-Runner'）。modulerunnertransport} */
const transport = {
  connect({ onMessage, onDisconnection }) {
    parentPort.on('message', onMessage)
    parentPort.on('close', onDisconnection)
  },
  send(data) {
    parentPort.postMessage(data)
  },
}

const runner = new ModuleRunner(
  {
    transport,
  },
  new ESModulesEvaluator(),
)
```

```js [server.js]
import { BroadcastChannel } from 'node:worker_threads'
import { createServer, RemoteEnvironmentTransport, DevEnvironment } from 'vite'

function createWorkerEnvironment(name, config, context) {
  const worker = new Worker('./worker.js')
  const handlerToWorkerListener = new WeakMap()

  const workerHotChannel = {
    send: (data) => worker.postMessage(data),
    on: (event, handler) => {
      if (event === 'connection') return

      const listener = (value) => {
        if (value.type === 'custom' && value.event === event) {
          const client = {
            send(payload) {
              worker.postMessage(payload)
            },
          }
          handler(value.data, client)
        }
      }
      handlerToWorkerListener.set(handler, listener)
      worker.on('message', listener)
    },
    off: (event, handler) => {
      if (event === 'connection') return
      const listener = handlerToWorkerListener.get(handler)
      if (listener) {
        worker.off('message', listener)
        handlerToWorkerListener.delete(handler)
      }
    },
  }

  return new DevEnvironment(name, config, {
    transport: workerHotChannel,
  })
}

await createServer({
  environments: {
    worker: {
      dev: {
        createEnvironment: createWorkerEnvironment,
      },
    },
  },
})
```

:::

HTTP要求を使用してランナーとサーバー間で通信する別の例:

```ts
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

export const runner = new ModuleRunner(
  {
    transport: {
      async invoke(data) {
        const response = await fetch(`http://my-vite-server/invoke`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return response.json()
      },
    },
    hmr: false, // HMRはTransport.Connectを必要とするため、HMRを無効にします
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

この場合、 `NormalizedHotChannel`の`handleInvoke`メソッドを使用できます。

```ts
const customEnvironment = new DevEnvironment(name, config, context)

server.onRequest((request: Request) => {
  const url = new URL(request.url)
  if (url.pathname === '/invoke') {
    const payload = (await request.json()) as HotPayload
    const result = customEnvironment.hot.handleInvoke(payload)
    return new Response(JSON.stringify(result))
  }
  return Response.error()
})
```

ただし、HMRサポートには、 `send`および`connect`メソッドが必要であることに注意してください。通常、 `send`方法は、カスタムイベントがトリガーされたときに呼び出されます（ `import.meta.hot.send("my-event")`など）。

Vite SSR中のHMRをサポートするために、メインエントリポイントからvite Exports `createServerHotChannel` 。
