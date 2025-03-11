# 环境API用于运行时间

:::warning Experimental
环境API是实验性的。我们将在Vite 6期间保持API的稳定性，以便生态系统可以进行实验并在此基础上构建。我们计划在Vite 7中通过可能的破坏性变更来稳定这些新API。

资源:

- [反馈讨论](https://github.com/vitejs/vite/discussions/16358) 我们正在收集有关新API的反馈。
- [环境API PR](https://github.com/vitejs/vite/pull/16471) 在这里实现了新的API并进行了审查。

请与我们分享您的反馈。
:::

## 环境工厂

环境工厂旨在由Cloudflare等环境提供商实施，而不是由最终用户实施。环境工厂为使用目标运行时和构建环境使用目标运行时返回`EnvironmentOptions` 。还可以设置默认环境选项，以便用户不需要执行此操作。

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

然后，配置文件可以写为:

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

框架可以使用Workerd运行时使用环境来使用以下方式进行SSR:

```js
const ssrEnvironment = server.environments.ssr
```

## 创建一个新的环境工厂

Vite Dev服务器默认情况下曝光了两个环境: `client`环境和`ssr`环境。默认情况下，客户端环境是浏览器环境，并且通过将虚拟模块`/@vite/client`导入客户端应用程序来实现模块Runner。默认情况下，SSR环境在与Vite Server的相同节点运行时运行，并允许在具有完整HMR支持的DEV期间使用应用程序服务器来渲染请求。

转换后的源代码称为模块，并且在每个环境中处理的模块之间的关系都保存在模块图中。这些模块的转换代码发送到与要执行的每个环境关联的运行时间。当在运行时评估模块时，将请求其导入的模块触发模块图的一节处理。

Vite模块Runner允许首先使用Vite插件处理任何代码。它与`server.ssrLoadModule`不同，因为Runner实现与服务器分离。这使库和框架作者可以在Vite Server和Runner之间实现其通信层。浏览器使用服务器Web套接字和HTTP请求与其相应的环境进行通信。节点模块Runner可以在同一进程中运行时直接进行函数调用来处理模块。其他环境可以运行连接到JS运行时的模块，例如Workerd或Worker线程，就像Vitest一样。

此功能的目标之一是提供可自定义的API来处理和运行代码。用户可以使用裸露的原始图创建新的环境工厂。

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

模块跑步者在目标运行时进行了实例化。除非另有说明，否则下一节中的所有API将从`vite/module-runner`导入。此导出入口点尽可能轻巧，仅导出创建模块跑步者所需的最小值。

**类型签名:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * 要执行的URL。
   * 接受文件路径、服务器路径或相对于根目录的ID。
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * 清除包括HMR听众在内的所有缓存。
   */
  public clearCache(): void
  /**
   * 清除所有缓存，删除所有HMR侦听器，重置Sourcemap支持。
   * 此方法不会停止HMR连接。
   */
  public async close(): Promise<void>
  /**
   * 返回`true`如果跑步者通过致电`close()`关闭。
   */
  public isClosed(): boolean
}
```

`ModuleRunner`中的模块评估器负责执行代码。 Vite Exports `ESModulesEvaluator`开箱即用，它使用`new AsyncFunction`来评估代码。如果您的JavaScript运行时不支持不安全的评估，则可以提供自己的实现。

模块Runner公开`import`方法。当Vite服务器触发`full-reload` HMR事件时，所有受影响的模块将被重新执行。请注意，当发生这种情况时，模块Runner不会更新`exports`对象（它覆盖它），如果您依靠最新的`exports`对象，则需要运行`import`或从`evaluatedModules`中获取模块。

**示例用法:**

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
/** 见下文 */
type ModuleRunnerTransport = unknown

//  - -切 - -
interface ModuleRunnerOptions {
  /**
   * 一组与服务器通信的方法。
   */
  transport: ModuleRunnerTransport
  /**
   * 配置如何解决源地图。
   * 如果有`process.setSourceMapsEnabled`可用，则更喜欢`node` 。
   * 否则，它将使用`prepareStackTrace`默认情况下覆盖
   * `Error.prepareStackTrace`方法。
   * 您可以提供一个对象来配置文件内容和
   * 源地图已解决用于未通过Vite处理的文件。
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * 禁用HMR或配置HMR选项。
   *
   * @default true
   */
  hmr?: boolean | ModuleRunnerHmr
  /**
   * 自定义模块缓存。如果未提供，它将创建一个单独的模块
   * 每个模块Runner实例的缓存。
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**类型签名:**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

//  - -切 - -
export interface ModuleEvaluator {
  /**
   * 转换的代码中的前缀线数。
   */
  startOffset?: number
  /**
   * 评估由Vite转换的代码。
   * @param上下文功能上下文
   * @Param代码转换代码
   * @Param ID ID用于获取模块
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * 评估外部化模块。
   * @Param文件文件URL到外部模块
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite导出`ESModulesEvaluator`默认情况下实现此接口。它使用`new AsyncFunction`评估代码，因此，如果代码已内衬源图，则应包含[2行的偏移](/0)，以适应添加的新行。这是由`ESModulesEvaluator`自动完成的。自定义评估者不会添加其他行。

## `ModuleRunnerTransport`

**类型签名:**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** 一个对象 */
type HotPayload = unknown
//  - -切 - -
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

通过RPC或直接调用该功能与环境通信的传输对象。当未实现`invoke`方法时，需要实现`send`方法和`connect`方法。 Vite将在内部构建`invoke` 。

您需要将其与服务器上的`HotChannel`实例进行搭配，就像在此示例中一样，在Worker线程中创建模块Runner:

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @Type {import（'Vite/Module-Runner'）。Modulerunnertransport} */
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

使用HTTP请求的另一个示例在跑步者和服务器之间进行通信:

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
    hmr: false, // 禁用HMR，因为HMR需要运输。连接
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

在这种情况下，可以使用`NormalizedHotChannel`中的`handleInvoke`方法:

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

但是请注意，对于HMR支持，需要`send`和`connect`方法。触发自定义事件时通常调用`send`方法（例如， `import.meta.hot.send("my-event")` ）。

Vite从主入口点出口`createServerHotChannel`以支持Vite SSR期间的HMR。
