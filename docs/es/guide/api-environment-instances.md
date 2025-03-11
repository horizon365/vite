# Usando `Environment` instancias

:::warning Experimental
El medio ambiente API es experimental. Mantendremos las API estables durante Vite 6 para dejar que el ecosistema experimente y construir sobre ella. Estamos planeando estabilizar estas nuevas API con posibles cambios de ruptura en Vite 7.

Recursos:

- [Discusión de comentarios](https://github.com/vitejs/vite/discussions/16358) Cuando estamos recopilando comentarios sobre las nuevas API.
- [API ambiental PR](https://github.com/vitejs/vite/pull/16471) donde se implementó y revisó la nueva API.

Comparta sus comentarios con nosotros.
:::

## Acceder a los entornos

Durante el desarrollo, se puede acceder a los entornos disponibles en un servidor de desarrollo utilizando `server.environments` :

```js
// Crear el servidor o obtenerlo desde Configurserver Hook
const server = await createServer(/* opción */)

const environment = server.environments.client
environment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

También puede acceder al entorno actual desde los complementos. Consulte la [API de entorno para complementos](./api-environment-plugins.md#accessing-the-current-environment-in-hooks) para obtener más detalles.

## `DevEnvironment` clase

Durante el desarrollo, cada entorno es una instancia de la clase `DevEnvironment` :

```ts
class DevEnvironment {
  /**
   * Identificador único para el entorno en un servidor VITE.
   * Por defecto, VITE expone entornos 'cliente' y 'SSR'.
   */
  name: string
  /**
   * Canal de comunicación para enviar y recibir mensajes del
   * Runner de módulo asociado en el tiempo de ejecución de destino.
   */
  hot: NormalizedHotChannel
  /**
   * Gráfico de nodos de módulo, con la relación importada entre
   * módulos procesados y el resultado almacenado en caché del código procesado.
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * Complementos resueltos para este entorno, incluidos los
   * creado usando el gancho de 0 porambre `create`
   */
  plugins: Plugin[]
  /**
   * Permite resolver, cargar y transformar código a través del
   * tubería de complementos de entorno
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * Opciones de configuración resueltas para este entorno. Opciones en el servidor
   * El alcance global se toma como valores predeterminados para todos los entornos, y puede
   * estar anulado (resolver condiciones, externos, optimizedDeps)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * Resuelva la URL a una ID, cargue y procese el código utilizando el
   * Tubería de complementos. El gráfico del módulo también se actualiza.
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * Registre una solicitud para ser procesada con baja prioridad. Esto es útil
   * para evitar cascadas. El servidor VITE tiene información sobre el
   * módulos importados por otras solicitudes, por lo que puede calentar el gráfico del módulo
   * Entonces, los módulos ya están procesados cuando se solicitan.
   */
  async warmupRequest(url: string): Promise<void>
}
```

Con `DevEnvironmentContext` ser:

```ts
interface DevEnvironmentContext {
  hot: boolean
  transport?: HotChannel | WebSocketServer
  options?: EnvironmentOptions
  remoteRunner?: {
    inlineSourceMap?: boolean
  }
  depsOptimizer?: DepsOptimizer
}
```

y con `TransformResult` ser:

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Una instancia de entorno en el servidor VITE le permite procesar una URL utilizando el método `environment.transformRequest(url)` . Esta función utilizará la tubería de complementos para resolver el `url` a un módulo `id` , cargarlo (leer el archivo desde el sistema de archivos o mediante un complemento que implementa un módulo virtual) y luego transforma el código. Al transformar el módulo, las importaciones y otros metadatos se registrarán en el gráfico del módulo de entorno creando o actualizando el nodo del módulo correspondiente. Cuando se realiza el procesamiento, el resultado de la transformación también se almacena en el módulo.

:::info transformRequest naming
Estamos utilizando `transformRequest(url)` y `warmupRequest(url)` en la versión actual de esta propuesta, por lo que es más fácil discutir y comprender para los usuarios utilizados para la API actual de Vite. Antes de lanzar, también podemos aprovechar la oportunidad para revisar estos nombres. Por ejemplo, podría llamarse `environment.processModule(url)` o `environment.loadModule(url)` tomando una página de los `context.load(id)` en los ganchos de complemento de Rollup. Por el momento, creemos que mantener los nombres actuales y retrasar esta discusión es mejor.
:::

## Gráficos De Módulos Separados

Cada entorno tiene un gráfico de módulo aislado. Todos los gráficos de módulos tienen la misma firma, por lo que se pueden implementar algoritmos genéricos para rastrear o consultar el gráfico sin depender del entorno. `hotUpdate` es un buen ejemplo. Cuando se modifica un archivo, el gráfico del módulo de cada entorno se utilizará para descubrir los módulos afectados y realizar HMR para cada entorno de forma independiente.

::: info
VITE V5 tenía un cliente mixto y un gráfico de módulos SSR. Dado un nodo no procesado o invalidado, no es posible saber si corresponde al cliente, SSR o ambos entornos. Los nodos de módulos tienen algunas propiedades prefijadas, como `clientImportedModules` y `ssrImportedModules` (y `importedModules` que devuelven la unión de ambos). `importers` contiene todos los importadores del entorno del cliente y SSR para cada nodo del módulo. Un nodo de módulo también tiene `transformResult` y `ssrTransformResult` . Una capa de compatibilidad hacia atrás permite que el ecosistema migre desde los `server.moduleGraph` en desuso.
:::

Cada módulo está representado por una instancia `EnvironmentModuleNode` . Los módulos pueden registrarse en el gráfico sin ser procesados ( `transformResult` sería `null` en ese caso). `importers` y `importedModules` también se actualizan después de procesar el módulo.

```ts
class EnvironmentModuleNode {
  environment: string

  url: string
  id: string | null = null
  file: string | null = null

  type: 'js' | 'css'

  importers = new Set<EnvironmentModuleNode>()
  importedModules = new Set<EnvironmentModuleNode>()
  importedBindings: Map<string, Set<string>> | null = null

  info?: ModuleInfo
  meta?: Record<string, any>
  transformResult: TransformResult | null = null

  acceptedHmrDeps = new Set<EnvironmentModuleNode>()
  acceptedHmrExports: Set<string> | null = null
  isSelfAccepting?: boolean
  lastHMRTimestamp = 0
  lastInvalidationTimestamp = 0
}
```

`environment.moduleGraph` es una instancia de `EnvironmentModuleGraph` :

```ts
export class EnvironmentModuleGraph {
  environment: string

  urlToModuleMap = new Map<string, EnvironmentModuleNode>()
  idToModuleMap = new Map<string, EnvironmentModuleNode>()
  etagToModuleMap = new Map<string, EnvironmentModuleNode>()
  fileToModulesMap = new Map<string, Set<EnvironmentModuleNode>>()

  constructor(
    environment: string,
    resolveId: (url: string) => Promise<PartialResolvedId | null>,
  )

  async getModuleByUrl(
    rawUrl: string,
  ): Promise<EnvironmentModuleNode | undefined>

  getModuleById(id: string): EnvironmentModuleNode | undefined

  getModulesByFile(file: string): Set<EnvironmentModuleNode> | undefined

  onFileChange(file: string): void

  onFileDelete(file: string): void

  invalidateModule(
    mod: EnvironmentModuleNode,
    seen: Set<EnvironmentModuleNode> = new Set(),
    timestamp: number = Date.now(),
    isHmr: boolean = false,
  ): void

  invalidateAll(): void

  async ensureEntryFromUrl(
    rawUrl: string,
    setIsSelfAccepting = true,
  ): Promise<EnvironmentModuleNode>

  createFileOnlyEntry(file: string): EnvironmentModuleNode

  async resolveUrl(url: string): Promise<ResolvedUrl>

  updateModuleTransformResult(
    mod: EnvironmentModuleNode,
    result: TransformResult | null,
  ): void

  getModuleByEtag(etag: string): EnvironmentModuleNode | undefined
}
```
