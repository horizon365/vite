# 런타임에 대한 환경 API

:::warning Experimental
환경 API는 실험적입니다. 우리는 Vite 6 동안 API를 안정적으로 유지하여 생태계를 실험하고 그 위에 구축 할 수 있도록 우리는 우리는 우리는 Vite 7의 잠재적 파괴 변화 로이 새로운 API를 안정화시킬 계획입니다.

자원:

- 우리가 새로운 API에 대한 피드백을 수집하는 [피드백 토론](https://github.com/vitejs/vite/discussions/16358) .
- 새로운 API가 구현되고 검토 된 [환경 API PR](https://github.com/vitejs/vite/pull/16471) .

귀하의 의견을 저희와 공유하십시오.
:::

## 환경 공장

환경 공장은 최종 사용자가 아닌 CloudFlare와 같은 환경 제공 업체가 구현하기위한 것입니다. 환경 공장은 DEV 및 빌드 환경 모두에서 대상 런타임을 사용하는 가장 일반적인 경우에 `EnvironmentOptions` 반환합니다. 기본 환경 옵션을 설정할 수도 있으므로 사용자가 수행 할 필요가 없습니다.

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

그런 다음 구성 파일을 다음과 같이 작성할 수 있습니다.

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

프레임 워크는 Workerd 런타임이있는 환경을 사용하여 SSR을 사용하여 다음을 수행 할 수 있습니다.

```js
const ssrEnvironment = server.environments.ssr
```

## 새로운 환경 공장 만들기

Vite Dev 서버는 기본적으로 `client` 환경과 `ssr` 환경의 두 가지 환경을 노출시킵니다. 클라이언트 환경은 기본적으로 브라우저 환경이며 모듈 러너는 가상 모듈 `/@vite/client` 클라이언트 앱으로 가져 와서 구현합니다. SSR 환경은 기본적으로 VITE 서버와 동일한 노드 런타임에서 실행되며 Application Server를 사용하여 전체 HMR 지원을 통해 DEV 중에 요청을 렌더링 할 수 있습니다.

변환 된 소스 코드를 모듈이라고하며 각 환경에서 처리 된 모듈 간의 관계는 모듈 그래프에 보관됩니다. 이 모듈에 대한 변환 된 코드는 실행될 각 환경과 관련된 런타임으로 전송됩니다. 런타임에 모듈이 평가되면, 가져 오기 모듈은 모듈 그래프 섹션의 처리를 트리거하도록 요청됩니다.

Vite Module Runner를 사용하면 먼저 Vite 플러그인으로 처리하여 모든 코드를 실행할 수 있습니다. 러너 구현이 서버에서 분리되기 때문에 `server.ssrLoadModule` 과 다릅니다. 이를 통해 라이브러리 및 프레임 워크 저자는 VITE 서버와 러너 사이의 통신 계층을 구현할 수 있습니다. 브라우저는 서버 웹 소켓과 HTTP 요청을 통해 해당 환경과 통신합니다. 노드 모듈 러너는 동일한 프로세스에서 실행될 때 프로세스 모듈을 위해 기능 호출을 직접 수행 할 수 있습니다. 다른 환경에서는 Workerd와 같은 JS 런타임에 연결하는 모듈 또는 Vitest와 같이 작업자 스레드를 실행할 수 있습니다.

이 기능의 목표 중 하나는 코드를 처리하고 실행하기위한 사용자 정의 가능한 API를 제공하는 것입니다. 사용자는 노출 된 프리미티브를 사용하여 새로운 환경 공장을 만들 수 있습니다.

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

모듈 러너는 대상 런타임에 인스턴스화됩니다. 다음 섹션의 모든 API는 달리 명시되지 않는 한 `vite/module-runner` 으로 가져옵니다. 이 내보내기 진입 지점은 가능한 한 가벼운 상태로 유지되며 모듈 러너를 만드는 데 필요한 최소를 내 보냅니다.

**유형 서명 :**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * 실행할 URL.
   * 루트와 관련하여 파일 경로, 서버 경로 또는 ID를 허용합니다.
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * HMR 리스너를 포함한 모든 캐시를 지우십시오.
   */
  public clearCache(): void
  /**
   * 모든 캐시를 지우고 모든 HMR 리스너를 제거하고 Sourcemap 지원을 재설정하십시오.
   * 이 방법은 HMR 연결을 중지하지 않습니다.
   */
  public async close(): Promise<void>
  /**
   * `close()` 호출하여 러너가 닫힌 경우 반환 `true` .
   */
  public isClosed(): boolean
}
```

`ModuleRunner` 의 모듈 평가자는 코드를 실행할 책임이 있습니다. Vite 내보내기 `ESModulesEvaluator` 상자에서 `new AsyncFunction` 사용하여 코드를 평가합니다. JavaScript 런타임이 안전하지 않은 평가를 지원하지 않으면 자체 구현을 제공 할 수 있습니다.

모듈 러너는 `import` 메소드를 노출시킵니다. VITE 서버가 `full-reload` HMR 이벤트를 트리거하면 영향을받는 모든 모듈이 다시 실행됩니다. 모듈 러너는이 경우 발생할 때 `exports` 객체를 업데이트하지 않으며 (재정의), 최신 `exports` 객체에 의존하는 경우 `import` 실행하거나 `evaluatedModules` 에서 다시 모듈을 가져와야합니다.

**예제 사용 :**

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
/** 아래를 참조하십시오 */
type ModuleRunnerTransport = unknown

// ---자르다---
interface ModuleRunnerOptions {
  /**
   * 서버와 통신하는 일련의 방법.
   */
  transport: ModuleRunnerTransport
  /**
   * 소스 맵이 해결되는 방법을 구성하십시오.
   * `process.setSourceMapsEnabled` 사용할 수있는 경우 `node` 선호합니다.
   * 그렇지 않으면 기본적으로 `prepareStackTrace` 사용합니다
   * `Error.prepareStackTrace` 메소드.
   * 파일 내용을 구성하여 객체를 제공 할 수 있습니다.
   * Vite에서 처리하지 않은 파일에 대해 소스 맵이 해결됩니다.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * HMR을 비활성화하거나 HMR 옵션을 구성하십시오.
   *
   * @default true
   */
  hmr?: boolean | ModuleRunnerHmr
  /**
   * 사용자 정의 모듈 캐시. 제공되지 않으면 별도의 모듈을 만듭니다
   * 각 모듈 러너 인스턴스의 캐시.
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**유형 서명 :**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

// ---자르다---
export interface ModuleEvaluator {
  /**
   * 변환 된 코드의 접두사 라인 수.
   */
  startOffset?: number
  /**
   * Vite에 의해 변환 된 코드를 평가하십시오.
   * @param 컨텍스트 기능 컨텍스트
   * @param 코드 변환 코드
   * 모듈을 가져 오는 데 사용 된 @Param ID ID
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * 외부화 된 모듈을 평가합니다.
   * @param 파일 파일 URL 외부 모듈에 대한 URL
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite 내보내기 `ESModulesEvaluator` 은 기본적 으로이 인터페이스를 구현합니다. 코드를 평가하기 위해 `new AsyncFunction` 사용하므로 코드에 소스 맵이 인쇄 된 경우 새 라인이 추가 될 수있는 [2 줄의 오프셋이](https://tc39.es/ecma262/#sec-createdynamicfunction) 포함되어야합니다. 이것은 `ESModulesEvaluator` 에 의해 자동으로 수행됩니다. 사용자 정의 평가자는 추가 라인을 추가하지 않습니다.

## `ModuleRunnerTransport`

**유형 서명 :**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** 물체 */
type HotPayload = unknown
// ---자르다---
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

RPC를 통해 또는 기능을 직접 호출하여 환경과 통신하는 전송 객체. `invoke` 메소드가 구현되지 않으면 `send` 메소드 및 `connect` 메소드가 구현되어야합니다. Vite는 `invoke` 내부적으로 구성합니다.

이 예제에서는 작업자 스레드에서 모듈 러너가 생성되는 서버의 `HotChannel` 인스턴스와 연결해야합니다.

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @Type {import ( 'vite/module-runner'). ModulerUnnerTransport} */
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

러너와 서버간에 통신하기 위해 HTTP 요청을 사용하는 다른 예 :

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
    hmr: false, // HMR에 HMR을 비활성화하십시오
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

이 경우 `NormalizedHotChannel` 의 `handleInvoke` 메소드를 사용할 수 있습니다.

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

그러나 HMR 지원에는 `send` 및 `connect` 방법이 필요합니다. `send` 방법은 일반적으로 사용자 정의 이벤트가 트리거 될 때 호출됩니다 (예 : `import.meta.hot.send("my-event")` ).

Vite SSR 동안 HMR을 지원하기 위해 메인 진입 점에서 `createServerHotChannel` 내보내십시오.
