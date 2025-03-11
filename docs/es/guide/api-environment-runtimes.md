# API ambiental para tiempos de ejecución

:::warning Experimental
El medio ambiente API es experimental. Mantendremos las API estables durante Vite 6 para dejar que el ecosistema experimente y construir sobre ella. Estamos planeando estabilizar estas nuevas API con posibles cambios de ruptura en Vite 7.

Recursos:

- [Discusión de comentarios](https://github.com/vitejs/vite/discussions/16358) Cuando estamos recopilando comentarios sobre las nuevas API.
- [API ambiental PR](https://github.com/vitejs/vite/pull/16471) donde se implementó y revisó la nueva API.

Comparta sus comentarios con nosotros.
:::

## Fábricas Del Medio Ambiente

Las fábricas de entornos están destinadas a ser implementadas por proveedores de entorno como CloudFlare, y no por usuarios finales. Las fábricas de entorno devuelven un `EnvironmentOptions` para el caso más común de usar el tiempo de ejecución de destino para entornos de desarrollo y compilación. Las opciones de entorno predeterminadas también se pueden configurar para que el usuario no sea necesario hacerlo.

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

Entonces el archivo de configuración se puede escribir como:

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

y los marcos pueden usar un entorno con el tiempo de ejecución de Workerd para hacer SSR usando:

```js
const ssrEnvironment = server.environments.ssr
```

## Creando Una Nueva Fábrica De Entorno

Un servidor Vite Dev expone dos entornos por defecto: un entorno `client` y un entorno `ssr` . El entorno del cliente es un entorno de navegador de forma predeterminada, y el corredor del módulo se implementa importando el módulo virtual `/@vite/client` a las aplicaciones del cliente. El entorno SSR se ejecuta en el mismo tiempo de ejecución del nodo que el servidor VITE de forma predeterminada y permite que los servidores de aplicaciones se usen para representar las solicitudes durante el desarrollo con soporte HMR completo.

El código fuente transformado se llama módulo, y las relaciones entre los módulos procesados en cada entorno se mantienen en un gráfico de módulo. El código transformado para estos módulos se envía a los tiempos de ejecución asociados con cada entorno que se ejecutará. Cuando se evalúa un módulo en el tiempo de ejecución, se solicitará a sus módulos importados que activen el procesamiento de una sección del gráfico del módulo.

Un corredor de módulo VITE permite ejecutar cualquier código procesando primero con complementos VITE. Es diferente de `server.ssrLoadModule` porque la implementación del corredor se desacopla desde el servidor. Esto permite a los autores de biblioteca y marco implementar su capa de comunicación entre el servidor VITE y el corredor. El navegador se comunica con su entorno correspondiente utilizando el socket web del servidor y mediante solicitudes HTTP. El corredor del módulo de nodo puede hacer directamente las llamadas de función para procesar módulos, ya que se ejecuta en el mismo proceso. Otros entornos podrían ejecutar módulos que se conectan a un tiempo de ejecución JS como Workerd, o un hilo de trabajadores como lo hace Vitest.

Uno de los objetivos de esta característica es proporcionar una API personalizable para procesar y ejecutar código. Los usuarios pueden crear nuevas fábricas de entorno utilizando las primitivas expuestas.

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

Un corredor de módulo se instancia en el tiempo de ejecución de destino. Todas las API en la siguiente sección se importan de `vite/module-runner` a menos que se indique lo contrario. Este punto de entrada de exportación se mantiene lo más liviano posible, solo exporta lo mínimo necesario para crear corredores de módulos.

**Tipo de firma:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * URL para ejecutar.
   * Acepta la ruta del archivo, la ruta del servidor o la ID en relación con la raíz.
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * Borre todos los cachés, incluidos los oyentes de HMR.
   */
  public clearCache(): void
  /**
   * Borre todos los cachés, elimine a todos los oyentes de HMR, restablezca el soporte de SourCeMap.
   * Este método no detiene la conexión HMR.
   */
  public async close(): Promise<void>
  /**
   * Devuelve `true` si el corredor ha sido cerrado llamando `close()` .
   */
  public isClosed(): boolean
}
```

El evaluador del módulo en `ModuleRunner` es responsable de ejecutar el código. VITE exporta `ESModulesEvaluator` de la caja, usa `new AsyncFunction` para evaluar el código. Puede proporcionar su propia implementación si su tiempo de ejecución de JavaScript no admite una evaluación insegura.

El corredor del módulo expone el método `import` . Cuando Vite Server desencadena un evento de `full-reload` HMR, todos los módulos afectados se volverán a ejecutarse. Tenga en cuenta que Module Runner no actualiza el objeto `exports` cuando esto sucede (lo anula), deberá ejecutar `import` u obtener el módulo de `evaluatedModules` nuevamente si confía en tener el último objeto `exports` .

**Ejemplo de uso:**

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
/** vea abajo */
type ModuleRunnerTransport = unknown

// ---cortar---
interface ModuleRunnerOptions {
  /**
   * Un conjunto de métodos para comunicarse con el servidor.
   */
  transport: ModuleRunnerTransport
  /**
   * Configure cómo se resuelven los mapas de origen.
   * Prefiere `node` si `process.setSourceMapsEnabled` está disponible.
   * De lo contrario, usará `prepareStackTrace` por defecto que anule
   * `Error.prepareStackTrace` Método.
   * Puede proporcionar un objeto para configurar cómo el contenido del archivo y
   * Los mapas de origen se resuelven para archivos que no fueron procesados por VITE.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * Deshabilite HMR o configure las opciones de HMR.
   *
   * @default verdad
   */
  hmr?: boolean | ModuleRunnerHmr
  /**
   * Cache de módulo personalizado. Si no se proporciona, crea un módulo separado
   * caché para cada instancia de corredor de módulo.
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**Tipo de firma:**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

// ---cortar---
export interface ModuleEvaluator {
  /**
   * Número de líneas prefijadas en el código transformado.
   */
  startOffset?: number
  /**
   * Evaluar el código que fue transformado por VITE.
   * @Param Context Function Context
   * Código de código de param Código transformado
   * @Param ID ID que se usó para obtener el módulo
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * Evaluar el módulo externalizado.
   * URL de archivo de archivo de @param al módulo externo
   */
  runExternalModule(file: string): Promise<any>
}
```

VITE exporta `ESModulesEvaluator` que implementa esta interfaz de forma predeterminada. Utiliza `new AsyncFunction` para evaluar el código, por lo que si el código ha inclinado el mapa fuente, debe contener un [desplazamiento de 2 líneas](https://tc39.es/ecma262/#sec-createdynamicfunction) para acomodar nuevas líneas agregadas. Esto se hace automáticamente por el `ESModulesEvaluator` . Los evaluadores personalizados no agregarán líneas adicionales.

## `ModuleRunnerTransport`

**Tipo de firma:**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** un objeto */
type HotPayload = unknown
// ---cortar---
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

Transporte el objeto que se comunica con el entorno a través de un RPC o llamando directamente a la función. Cuando no se implementa el método `invoke` , se requiere implementar el método `send` y `connect` método. Vite construirá los `invoke` internamente.

Debe acoplarlo con la instancia `HotChannel` en el servidor como en este ejemplo donde el corredor de módulo se crea en el hilo de trabajadores:

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @Type {import ('Vite/Module-Runner'). ModulerUnnerTransport} */
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

Un ejemplo diferente utilizando una solicitud HTTP para comunicarse entre el corredor y el servidor:

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
    hmr: false, // Deshabilitar HMR ya que HMR requiere transporte. Conexión
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

En este caso, se puede usar el método `handleInvoke` en el `NormalizedHotChannel` :

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

Pero tenga en cuenta que para el soporte de HMR, se requieren métodos `send` y `connect` . El método `send` generalmente se llama cuando se activa el evento personalizado (como, `import.meta.hot.send("my-event")` ).

VITE exporta `createServerHotChannel` desde el punto de entrada principal para admitir HMR durante VITE SSR.
