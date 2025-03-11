# Umwelt -API für Laufzeiten

:::warning Experimental
Umwelt -API ist experimentell. Wir werden die APIs während von VITE 6 stabil halten, damit das Ökosystem experimentieren und darüber aufbaut. Wir planen, diese neuen APIs mit potenziellen Veränderungen in Vite 7 zu stabilisieren.

Ressourcen:

- [Feedback -Diskussion,](https://github.com/vitejs/vite/discussions/16358) bei der wir Feedback zu den neuen APIs sammeln.
- [Umwelt -API -PR,](https://github.com/vitejs/vite/pull/16471) bei der die neue API implementiert und überprüft wurde.

Bitte teilen Sie uns Ihr Feedback mit.
:::

## Umweltfabriken

Umgebungsfabriken sollen von Umgebungsanbietern wie CloudFlare und nicht von Endbenutzern implementiert werden. Umgebungsfabriken geben eine `EnvironmentOptions` für den häufigsten Fall zurück, in dem die Ziellaufzeit sowohl für Dev- als auch für Build -Umgebungen verwendet wird. Die Standard -Umgebungsoptionen können auch festgelegt werden, sodass der Benutzer dies nicht tun muss.

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

Dann kann die Konfigurationsdatei als:

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

und Frameworks können eine Umgebung mit der Workerd -Laufzeit nutzen, um SSR zu erstellen:

```js
const ssrEnvironment = server.environments.ssr
```

## Erstellen Einer Neuen Umgebungsfabrik

Ein Vite Dev Server enthält standardmäßig zwei Umgebungen: eine `client` -Umgebung und eine `ssr` -Umgebung. Die Client -Umgebung ist standardmäßig eine Browserumgebung, und der Modulläufer wird durch Importieren des virtuellen Moduls `/@vite/client` in Client -Apps implementiert. Die SSR -Umgebung wird standardmäßig in derselben Knoten -Laufzeit wie der Vite -Server ausgeführt und es können Anwendungsserver verwendet werden, um Anforderungen während des Dev -Supports zu rendern.

Der transformierte Quellcode wird als Modul bezeichnet, und die Beziehungen zwischen den in jeder Umgebung verarbeiteten Modulen werden in einem Moduldiagramm aufbewahrt. Der transformierte Code für diese Module wird an die mit jeder Umgebung verbundenen Laufzeiten gesendet. Wenn in der Laufzeit ein Modul bewertet wird, werden seine importierten Module angefordert, um die Verarbeitung eines Abschnitts des Moduldiagramms auszulösen.

Ein Vite -Modulläufer ermöglicht das Ausführen eines jeden Codes, indem er zuerst mit vite -Plugins verarbeitet wird. Es unterscheidet sich von `server.ssrLoadModule` , weil die Implementierung der Läufer vom Server entkoppelt ist. Auf diese Weise können Bibliotheks- und Framework -Autoren ihre Kommunikationsebene zwischen dem Vite -Server und dem Läufer implementieren. Der Browser kommuniziert mit seiner entsprechenden Umgebung über den Server -Web -Socket und über HTTP -Anforderungen. Der Knotenmodulläufer kann Funktionsaufrufe direkt durchführen, um Module zu verarbeiten, sobald er im gleichen Prozess ausgeführt wird. Andere Umgebungen können Module ausführen, die mit einer JS -Laufzeit wie Workerd oder einem Arbeiterfaden wie Vitest verbunden sind.

Eines der Ziele dieser Funktion ist es, eine anpassbare API zur Verarbeitung und Ausführung von Code bereitzustellen. Benutzer können mit den exponierten Primitiven neue Umgebungsfabriken erstellen.

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

Ein Modulläufer wird in der Ziellaufzeit instanziiert. Alle APIs im nächsten Abschnitt werden aus `vite/module-runner` importiert, sofern nicht anders angegeben. Dieser Exporteintrittspunkt wird so leicht wie möglich gehalten und exportiert nur die minimalen, die zum Erstellen von Modulläufern benötigt werden.

**Typ Signatur:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * URL auszuführen.
   * Akzeptiert den Dateipfad, der Serverpfad oder die ID relativ zum Stamm.
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * Löschen Sie alle Caches, einschließlich HMR -Zuhörer.
   */
  public clearCache(): void
  /**
   * Löschen Sie alle Caches, entfernen Sie alle HMR -Hörer und setzen Sie die Sourcemap -Unterstützung zurück.
   * Diese Methode stoppt nicht die HMR -Verbindung.
   */
  public async close(): Promise<void>
  /**
   * Gibt `true` zurück, wenn der Läufer unter der Telefonnummer `close()` geschlossen wurde.
   */
  public isClosed(): boolean
}
```

Der Modul -Evaluator in `ModuleRunner` ist für die Ausführung des Codes verantwortlich. VITE -Exporte `ESModulesEvaluator` Aus der Box werden `new AsyncFunction` verwendet, um den Code zu bewerten. Sie können Ihre eigene Implementierung bereitstellen, wenn Ihre JavaScript -Laufzeit keine unsichere Bewertung unterstützt.

Modulläufer enthält `import` Methode. Wenn Vite Server `full-reload` HMR-Ereignis auslöst, werden alle betroffenen Module erneut ausgezeichnet. Beachten Sie, dass der Modulläufer `exports` -Objekt nicht aktualisiert, wenn dies geschieht (es überschreibt es). Sie müssten `import` ausführen oder das Modul erneut von `evaluatedModules` abrufen, wenn Sie sich darauf verlassen, dass das neueste `exports` -Objekt ist.

**Beispiel Verwendung:**

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
/** Siehe unten */
type ModuleRunnerTransport = unknown

// ---schneiden---
interface ModuleRunnerOptions {
  /**
   * Eine Reihe von Methoden zur Kommunikation mit dem Server.
   */
  transport: ModuleRunnerTransport
  /**
   * Konfigurieren Sie, wie Quellkarten behoben sind.
   * Bevorzugt `node` , wenn `process.setSourceMapsEnabled` verfügbar ist.
   * Andernfalls wird standardmäßig `prepareStackTrace` verwendet, die überschrieben
   * `Error.prepareStackTrace` Methode.
   * Sie können ein Objekt bereitstellen, um zu konfigurieren, wie Dateiinhalte und
   * Quellkarten werden für Dateien behoben, die nicht von VITE verarbeitet wurden.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * Deaktivieren Sie HMR oder konfigurieren Sie HMR -Optionen.
   *
   * @default true
   */
  hmr?: boolean | ModuleRunnerHmr
  /**
   * Benutzerdefinierte Modul -Cache. Wenn nicht bereitgestellt, werden ein separates Modul erstellt
   * Cache für jede Modulläuferinstanz.
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**Typ Signatur:**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

// ---schneiden---
export interface ModuleEvaluator {
  /**
   * Anzahl der vorangestellten Zeilen im transformierten Code.
   */
  startOffset?: number
  /**
   * Code bewerten, der durch VITE transformiert wurde.
   * @param Context -Funktionskontext
   * @param codes transformierter Code
   * @Param ID -ID, mit der das Modul abgerufen wurde
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * Bewerten Sie das externalisierte Modul.
   * @param Datei -Datei -URL zum externen Modul
   */
  runExternalModule(file: string): Promise<any>
}
```

VITE Exports `ESModulesEvaluator` , die diese Schnittstelle standardmäßig implementiert. Es wird `new AsyncFunction` zum Bewerten von Code verwendet. Wenn der Code also eingeleitet hat, sollte er einen [Offset von 2 Zeilen](https://tc39.es/ecma262/#sec-createdynamicfunction) enthalten, die für neue hinzugefügte Zeilen berücksichtigt werden sollen. Dies geschieht automatisch von den `ESModulesEvaluator` . Benutzerdefinierte Evaluatoren fügen keine zusätzlichen Zeilen hinzu.

## `ModuleRunnerTransport`

**Typ Signatur:**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** ein Objekt */
type HotPayload = unknown
// ---schneiden---
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

Transportobjekt, das über ein RPC mit der Umgebung kommuniziert oder die Funktion direkt aufruft. Wenn `invoke` Methode implementiert ist, muss die `send` -Methode und `connect` -Methode implementiert werden. Vite baut die `invoke` intern.

Sie müssen es mit der `HotChannel` -Instanz auf dem Server koppeln, wie in diesem Beispiel, in dem Modulläufer im Worker -Thread erstellt wird:

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @type {import ('vite/modul-runner'). modulerunnerTransport} */
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

Ein anderes Beispiel unter Verwendung einer HTTP -Anfrage zur Kommunikation zwischen dem Läufer und dem Server:

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
    hmr: false, // Deaktivieren Sie HMR, da HMR Transport benötigt.Connect
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

In diesem Fall kann die `handleInvoke` -Methode in der `NormalizedHotChannel` verwendet werden:

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

Beachten Sie jedoch, dass für die HMR -Unterstützung `send` und `connect` Methoden erforderlich sind. Die `send` -Methode wird normalerweise aufgerufen, wenn das benutzerdefinierte Ereignis ausgelöst wird (wie, `import.meta.hot.send("my-event")` ).

VITE -Exporte `createServerHotChannel` vom Haupteintrittspunkt zur Unterstützung von HMR während der vite SSR.
