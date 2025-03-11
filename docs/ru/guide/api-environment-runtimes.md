# API окружающей среды для пробега

:::warning Experimental
API окружающей среды экспериментально. Во время Vite 6 мы сохраним конюшню APIS, чтобы позволить экосистеме экспериментировать и построить на ней. Мы планируем стабилизировать эти новые API с потенциальными нарушающими изменениями в Vite 7.

Ресурсы:

- [Обсуждение обратной связи,](https://github.com/vitejs/vite/discussions/16358) где мы собираем отзывы о новых API.
- [Environment API PR](https://github.com/vitejs/vite/pull/16471) , где новый API был реализован и рассмотрен.

Пожалуйста, поделитесь с нами своими отзывами.
:::

## Окружающие Фабрики

Заводы окружающей среды предназначены для реализации поставщиков окружающей среды, такими как CloudFlare, а не конечными пользователями. Фабрики окружающей среды возвращают `EnvironmentOptions` для наиболее распространенного случая использования целевой среды выполнения как для сред, так и для построения. Параметры среды по умолчанию также могут быть установлены, поэтому пользователю не нужно это делать.

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

Затем файл конфигурации можно записать как:

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

и Frameworks могут использовать среду со временем выполнения рабочих для выполнения SSR с помощью:

```js
const ssrEnvironment = server.environments.ssr
```

## Создание Новой Фабрики Окружающей Среды

Сервер Vite Dev разоблачает две среды по умолчанию: среда `client` и среда `ssr` . Клиентская среда - это среда браузера по умолчанию, а модульный бегун реализуется путем импорта виртуального модуля `/@vite/client` в клиентские приложения. Среда SSR работает в том же времени выполнения узла, что и сервер VITE по умолчанию, и позволяет использовать серверы приложений для отображения запросов во время DEV с полной поддержкой HMR.

Преобразованный исходный код называется модулем, а отношения между модулями, обрабатываемыми в каждой среде, хранятся на графике модуля. Преобразованный код для этих модулей отправляется в время выполнения, связанную с каждой средой, которая должна быть выполнена. Когда модуль оценивается во время выполнения, его импортируемые модули будут запрашиваться, запуская обработку раздела графика модуля.

Бегущий модуля Vite позволяет сначала запустить любой код, обрабатывая его с помощью плагинов Vite. Это отличается от `server.ssrLoadModule` , потому что реализация бегуна отделена от сервера. Это позволяет авторам библиотеки и структуры реализовать свой уровень связи между сервером Vite и бегуном. Браузер связывается с соответствующей средой, используя веб -сокет сервера и через HTTP -запросы. Бегущий модуля узла может напрямую выполнять функции вызовов для обработки модулей, когда он работает в том же процессе. Другие среды могут запускать модули, подходящие со временем выполнения JS, как работник, или рабочая нить, как это делает Vitest.

Одной из целей этой функции является предоставление настраиваемого API для обработки и запуска кода. Пользователи могут создавать новые фабрики среды, используя открытые примитивы.

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

Модульный бегун создан в целевом времени выполнения. Все API в следующем разделе импортируются из `vite/module-runner` , если не указано иное. Эта точка входа экспорта сохраняется как можно более легкой, только экспортируя минимальную необходимую для создания бегунов модулей.

**Тип подпись:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * URL для выполнения.
   * Принимает путь к файлу, путь сервера или идентификатор относительно корня.
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * Очистите все кэши, включая слушателей HMR.
   */
  public clearCache(): void
  /**
   * Очистите все кэши, удалите всех слушателей HMR, Reset Sourcemap Support.
   * Этот метод не останавливает соединение HMR.
   */
  public async close(): Promise<void>
  /**
   * Возвращает `true` , если бегун был закрыт по телефону `close()` .
   */
  public isClosed(): boolean
}
```

Оценчик модуля в `ModuleRunner` отвечает за выполнение кода. Vite Exports `ESModulesEvaluator` из коробки, он использует `new AsyncFunction` для оценки кода. Вы можете предоставить свою собственную реализацию, если ваша среда выполнения JavaScript не поддерживает небезопасную оценку.

Модульный бегун раскрывает `import` метода. Когда Vite Server запускает `full-reload` событие HMR, все затронутые модули будут повторно выполнены. Имейте в виду, что модульный бегун не обновляет объект `exports` , когда это произойдет (он переопределяет его), вам нужно будет запустить `import` или получить модуль из `evaluatedModules` снова, если вы полагаетесь на наличие последних `exports` объектов.

**Пример использования:**

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
/** см. ниже */
type ModuleRunnerTransport = unknown

// ---резать---
interface ModuleRunnerOptions {
  /**
   * Набор методов для связи с сервером.
   */
  transport: ModuleRunnerTransport
  /**
   * Настройте, как разрешены исходные карты.
   * Предпочитает `node` , если `process.setSourceMapsEnabled` доступен.
   * В противном случае он будет использовать `prepareStackTrace` по умолчанию, что переопределяется
   * `Error.prepareStackTrace` Метод.
   * Вы можете предоставить объект для настройки того, как содержание файлов и
   * Расходные карты разрешены для файлов, которые не были обработаны с помощью VITE.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * Отключить HMR или настроить параметры HMR.
   *
   * @default true
   */
  hmr?: boolean | ModuleRunnerHmr
  /**
   * Пользовательский модульный кеш. Если не предоставлено, это создает отдельный модуль
   * Кэш для каждого экземпляра бега модуля.
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**Тип подпись:**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

// ---резать---
export interface ModuleEvaluator {
  /**
   * Количество префиксов в преобразованном коде.
   */
  startOffset?: number
  /**
   * Оцените код, который был преобразован с помощью VITE.
   * @param context function context
   * @param код преобразован
   * идентификатор @param, который использовался для получения модуля
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * Оценить внешний модуль.
   * @param файл файла URL на внешний модуль
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite Exports `ESModulesEvaluator` , который по умолчанию реализует этот интерфейс. Он использует `new AsyncFunction` для оценки кода, поэтому, если у кода есть вставленная карта исходной основы, он должен содержать [смещение из 2 строк](https://tc39.es/ecma262/#sec-createdynamicfunction) для размещения новых добавленных строк. Это делается автоматически `ESModulesEvaluator` . Пользовательские оценщики не будут добавлять дополнительные линии.

## `ModuleRunnerTransport`

**Тип подпись:**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** объект */
type HotPayload = unknown
// ---резать---
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

Транспортный объект, который связывается с окружающей средой через RPC или путем непосредственного вызова функции. Когда метод `invoke` не реализован, метод `send` и `connect` метод 2 необходимо реализовать. Vite будет построить `invoke` внутренне.

Вам нужно связать его с экземпляром `HotChannel` на сервере, как в этом примере, где модульный бегун создан в потоке работников:

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @type {import ('Vite/Module-Runner'). ModuleRunnerTransport} */
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

Другой пример, использующий HTTP -запрос для связи между бегуном и сервером:

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
    hmr: false, // Отключить HMR в качестве HMR требует транспорта. Способствуйте
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

В этом случае можно использовать метод `handleInvoke` в `NormalizedHotChannel` :

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

Но обратите внимание, что для поддержки HMR требуются методы `send` и `connect` . Метод `send` обычно вызывается, когда запускается пользовательское событие (например, `import.meta.hot.send("my-event")` ).

Vite Exports `createServerHotChannel` из основной точки входа для поддержки HMR во время Vite SSR.
