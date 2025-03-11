# Используя `Environment` экземпляров

:::warning Experimental
API окружающей среды экспериментально. Во время Vite 6 мы сохраним конюшню APIS, чтобы позволить экосистеме экспериментировать и построить на ней. Мы планируем стабилизировать эти новые API с потенциальными нарушающими изменениями в Vite 7.

Ресурсы:

- [Обсуждение обратной связи,](https://github.com/vitejs/vite/discussions/16358) где мы собираем отзывы о новых API.
- [Environment API PR](https://github.com/vitejs/vite/pull/16471) , где новый API был реализован и рассмотрен.

Пожалуйста, поделитесь с нами своими отзывами.
:::

## Доступ к окружающей среде

Во время DEV доступные среды на сервере DEV можно получить с помощью `server.environments` :

```js
// Создайте сервер или получите его из Hook ConfigureServer
const server = await createServer(/* параметры */)

const environment = server.environments.client
environment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

Вы также можете получить доступ к текущей среде из плагинов. Смотрите [API среды для плагинов](./api-environment-plugins.md#accessing-the-current-environment-in-hooks) для получения более подробной информации.

## `DevEnvironment` класс

Во время разработки каждая среда является экземпляром `DevEnvironment` класса:

```ts
class DevEnvironment {
  /**
   * Уникальный идентификатор для среды на сервере Vite.
   * По умолчанию VITE разоблачает среды «клиента» и «SSR».
   */
  name: string
  /**
   * Канал связи для отправки и получения сообщений из
   * Асвязанный модульный бегун в целевом времени выполнения.
   */
  hot: NormalizedHotChannel
  /**
   * График модульных узлов с импортированной взаимосвязи между
   * Обработанные модули и кэшированный результат обработанного кода.
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * Решенные плагины для этой среды, включая те, которые
   * Создано с использованием крючка для каждой среды `create`
   */
  plugins: Plugin[]
  /**
   * Позволяет разрешать, загружать и преобразовать код через
   * Плагины окружающей среды
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * Решенные параметры конфигурации для этой среды. Параметры на сервере
   * Глобальный объем воспринимается в качестве значения по умолчанию для всех сред и может
   * быть переопределенным (условия разрешения, внешние, оптимизированные модели)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * Разрешить URL до идентификатора, загрузить его и обработать код, используя
   * Плагины трубопровод. График модуля также обновляется.
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * Зарегистрируйте запрос, который будет обработан с низким приоритетом. Это полезно
   * Чтобы избежать водопадов. У сервера Vite есть информация о
   * импортированные модули по другим запросам, поэтому он может прогреть график модуля
   * Таким образом, модули уже обрабатываются, когда их просят.
   */
  async warmupRequest(url: string): Promise<void>
}
```

С `DevEnvironmentContext` существо:

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

и с `TransformResult` будучи:

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Экземпляр среды на сервере Vite позволяет обработать URL -адрес с использованием метода `environment.transformRequest(url)` . Эта функция будет использовать трубопровод плагинов для разрешения `url` на модуль `id` , загрузить его (чтение файла из файловой системы или через плагин, который реализует виртуальный модуль), а затем преобразовывает код. При преобразовании модуля импорт и другие метаданные будут записаны на графике модуля среды путем создания или обновления соответствующего узла модуля. При выполнении обработки результат преобразования также хранится в модуле.

:::info transformRequest naming
Мы используем `transformRequest(url)` и `warmupRequest(url)` в текущей версии этого предложения, поэтому его легче обсудить и понять для пользователей, используемых для текущего API VITE. Прежде чем выпустить, мы можем воспользоваться возможностью, чтобы рассмотреть эти имена тоже. Например, его можно назвать `environment.processModule(url)` или `environment.loadModule(url)` , взяв страницу от Rollup's `context.load(id)` в плагинах. На данный момент мы думаем, что сохранение текущих имен и задержка этого обсуждения лучше.
:::

## Отдельные Графики Модуля

Каждая среда имеет изолированный модульный график. Все графики модулей имеют одинаковую подпись, поэтому могут быть реализованы общие алгоритмы для ползания или запроса графика без в зависимости от среды. `hotUpdate` - хороший пример. Когда файл изменен, модульный график каждой среды будет использоваться для обнаружения затронутых модулей и самостоятельно выполнения HMR для каждой среды.

::: info
Vite V5 имел смешанный клиент и график модуля SSR. Учитывая необработанный или недействующий узел, невозможно узнать, соответствует ли он клиенту, SSR или обеими средами. Узлы модуля имеют некоторые свойства префикс, например, `clientImportedModules` и `ssrImportedModules` (и `importedModules` которые возвращают объединение обоих). `importers` содержит все импортеры из среды клиента и SSR для каждого узла модуля. Узел модуля также имеет `transformResult` и `ssrTransformResult` . Обратный уровень совместимости позволяет экосистеме мигрировать с устаревшего `server.moduleGraph` .
:::

Каждый модуль представлен экземпляром `EnvironmentModuleNode` . Модули могут быть зарегистрированы на графике без обработки ( `transformResult` в этом случае будет `null` ). `importers` и `importedModules` также обновляются после обработки модуля.

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

`environment.moduleGraph` является экземпляром `EnvironmentModuleGraph` :

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
