# Verwendung von `Environment` Instanzen

:::warning Experimental
Umwelt -API ist experimentell. Wir werden die APIs während von VITE 6 stabil halten, damit das Ökosystem experimentieren und darüber aufbaut. Wir planen, diese neuen APIs mit potenziellen Veränderungen in Vite 7 zu stabilisieren.

Ressourcen:

- [Feedback -Diskussion,](https://github.com/vitejs/vite/discussions/16358) bei der wir Feedback zu den neuen APIs sammeln.
- [Umwelt -API -PR,](https://github.com/vitejs/vite/pull/16471) bei der die neue API implementiert und überprüft wurde.

Bitte teilen Sie uns Ihr Feedback mit.
:::

## Zugriff auf die Umgebungen

Während Dev können auf die verfügbaren Umgebungen in einem Dev -Server mit `server.environments` zugegriffen werden:

```js
// Erstellen Sie den Server oder holen Sie ihn vom Konfigurationserver -Hook ab
const server = await createServer(/* Optionen */)

const environment = server.environments.client
environment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

Sie können auch über Plugins auf die aktuelle Umgebung zugreifen. Weitere Informationen finden Sie in der [Umgebungs -API für Plugins](./api-environment-plugins.md#accessing-the-current-environment-in-hooks) .

## `DevEnvironment` Klasse

Während Dev ist jede Umgebung eine Instanz der `DevEnvironment` -Klasse:

```ts
class DevEnvironment {
  /**
   * Eindeutige Kennung für die Umgebung in einem Vite -Server.
   * Standardmäßig enthüllt VITE "Client" und "SSR" -Enumgebungen.
   */
  name: string
  /**
   * Kommunikationskanal zum Senden und Empfangen von Nachrichten von der
   * Assoziiertes Modulläufer in der Ziellaufzeit.
   */
  hot: NormalizedHotChannel
  /**
   * Diagramm von Modulknoten mit der importierten Beziehung zwischen
   * Verarbeitete Module und das zwischengespeicherte Ergebnis des verarbeiteten Code.
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * Aufgelöste Plugins für diese Umgebung, einschließlich derjenigen, die
   * erstellt mit dem pro-umgebenden `create` Hook
   */
  plugins: Plugin[]
  /**
   * Ermöglicht das Auflösen, Laden und Transformieren von Code durch die
   * Umgebungs -Plugins Pipeline
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * Aufgelöste Konfigurationsoptionen für diese Umgebung. Optionen am Server
   * Der globale Umfang wird als Standardeinstellungen für alle Umgebungen genommen und kann
   * überschrieben werden (Auflösungsbedingungen, externe, optimierte DEPS)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * Beheben Sie die URL auf eine ID, laden Sie sie und verarbeiten Sie den Code mit dem
   * Plugins Pipeline. Das Moduldiagramm wird ebenfalls aktualisiert.
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * Registrieren Sie eine Anfrage, die mit niedriger Priorität bearbeitet werden soll. Das ist nützlich
   * Wasserfälle vermeiden. Der Vite -Server hat Informationen über die
   * Importierte Module durch andere Anfragen, damit das Moduldiagramm aufwärmen kann
   * Die Module werden also bereits verarbeitet, wenn sie angefordert werden.
   */
  async warmupRequest(url: string): Promise<void>
}
```

Mit `DevEnvironmentContext` ist:

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

und mit `TransformResult` ist:

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Mit einer Umgebungsinstanz auf dem Vite -Server können Sie eine URL mithilfe der `environment.transformRequest(url)` -Methode verarbeiten. Mit dieser Funktion wird die Plugin -Pipeline verwendet, um das `url` auf ein Modul `id` aufzulösen, sie zu laden (die Datei aus dem Dateisystem oder über ein Plugin lesen, das ein virtuelles Modul implementiert) und dann den Code transformieren. Während der Transformation des Moduls werden Importe und andere Metadaten im Umgebungsmoduldiagramm aufgezeichnet, indem der entsprechende Modulknoten erstellt oder aktualisiert wird. Bei der Verarbeitung wird das Transformationsergebnis auch im Modul gespeichert.

:::info transformRequest naming
Wir verwenden `transformRequest(url)` und `warmupRequest(url)` in der aktuellen Version dieses Vorschlags, sodass es einfacher ist, für Benutzer die aktuelle API von Vite zu besprechen und zu verstehen. Vor der Veröffentlichung können wir auch die Gelegenheit nutzen, diese Namen zu überprüfen. Zum Beispiel könnte es `environment.processModule(url)` oder `environment.loadModule(url)` mit einer Seite von Rollups `context.load(id)` in Plugin -Haken bezeichnet werden. Im Moment denken wir, dass es besser ist, die aktuellen Namen zu behalten und diese Diskussion zu verzögern.
:::

## Separate Moduldiagramme

Jede Umgebung verfügt über ein isoliertes Moduldiagramm. Alle Moduldiagramme haben die gleiche Signatur, sodass generische Algorithmen implementiert werden können, um das Diagramm zu kriechen oder abzufragen, ohne von der Umgebung abhängig zu sein. `hotUpdate` ist ein gutes Beispiel. Wenn eine Datei geändert wird, wird das Moduldiagramm jeder Umgebung verwendet, um die betroffenen Module zu ermitteln und HMR für jede Umgebung unabhängig voneinander auszuführen.

::: info
VITE V5 hatte einen gemischten Client- und SSR -Moduldiagramm. Bei einem unverarbeiteten oder ungültigeren Knoten ist es nicht möglich zu wissen, ob er dem Client, SSR oder beiden Umgebungen entspricht. Modulknoten haben einige Eigenschaften wie `clientImportedModules` und `ssrImportedModules` (und `importedModules` , die die Vereinigung beider zurückgeben). `importers` enthält alle Importeure aus der Client- und SSR -Umgebung für jeden Modulknoten. Ein Modulknoten hat auch `transformResult` und `ssrTransformResult` . Eine Kompatibilitätsschicht nach hinten ermöglicht es dem Ökosystem, aus dem veralteten `server.moduleGraph` zu migrieren.
:::

Jedes Modul wird durch eine `EnvironmentModuleNode` -Instanz dargestellt. Module können im Diagramm registriert werden, ohne noch verarbeitet zu werden ( `transformResult` wäre in diesem Fall `null` ). `importers` und `importedModules` werden ebenfalls aktualisiert, nachdem das Modul verarbeitet wurde.

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

`environment.moduleGraph` ist eine Instanz von `EnvironmentModuleGraph` :

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
