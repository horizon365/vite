#

:::warning Experimental
Environment API 是实验性的。在 Vite 6 期间，我们将保持这些 API 的稳定性，以便生态系统可以进行实验并在此基础上构建。我们计划在 Vite 7 中通过可能的破坏性更改来稳定这些新 API。

资源:

- [反馈讨论](https://github.com/vitejs/vite/discussions/16358) 我们正在此处收集有关新 API 的反馈。
- [环境 API PR](https://github.com/vitejs/vite/pull/16471) 在此实现了和审查了新的 API。

请与我们分享您的反馈。
:::

## 访问环境

```js
// create the server, or get it from the configureServer hook
const server = await createServer(/* 选项 */)

const environment = server.environments.client
environment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

## `DevEnvironment` 类

在开发过程中，每个环境都是 `DevEnvironment` 类的实例:

```ts
class DevEnvironment {
  /**
   * 在 Vite 服务器中的环境的唯一标识符。
   * 默认情况下，Vite 暴露了 'client' 和 'ssr' 环境。
   */
  name: string
  /**
   * Communication channel to send and receive messages from the
   * 模块节点图，显示模块之间的导入关系。
   */
  hot: NormalizedHotChannel
  /**
   * Graph of module nodes, with the imported relationship between
   * 允许通过环境插件管道解析、加载和转换代码。
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * 允许通过环境插件管道解析、加载和转换代码
   * 使用环境`create`钩创建
   */
  plugins: Plugin[]
  /**
   * Allows to resolve, load, and transform code through the
   * environment plugins pipeline
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * Resolved config options for this environment. Options at the server
   * global scope are taken as defaults for all environments, and can
   * be overridden (resolve conditions, external, optimizedDeps)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * Resolve the URL to an id, load it, and process the code using the
   * 独立的模块图
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * Register a request to be processed with low priority. This is useful
   * to avoid waterfalls. The Vite server has information about the
   * imported modules by other requests, so it can warmup the module graph
   * so the modules are already processed when they are requested.
   */
  async warmupRequest(url: string): Promise<void>
}
```

`DevEnvironmentContext`是:

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

而`TransformResult`是:

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Vite服务器中的环境实例可让您使用`environment.transformRequest(url)`方法处理URL。此功能将使用插件管道将`url`分解为模块`id` ，加载它(从文件系统或通过实现虚拟模块的插件读取文件)，然后更改代码。在转换模块时，通过创建或更新相应的模块节点，将在“环境模块”图中记录导入和其他元数据。处理处理后，转换结果也存储在模块中。

:::info transformRequest naming
我们在此提案的当前版本中使用了`transformRequest(url)`和`warmupRequest(url)` ，因此对于用户用于Vite当前API的用户来说，讨论和理解更容易。在发布之前，我们也可以借此机会查看这些名称。例如，它可以命名为`environment.processModule(url)`或`environment.loadModule(url)` ，从插件挂钩中的汇总`context.load(id)`中获取页面。目前，我们认为保留当前名称并延迟此讨论会更好。
:::

## Separate Module Graphs

每个环境都有一个孤立的模块图。所有模块图都具有相同的签名，因此可以实现通用算法以爬网或查询图，而无需依赖环境。 `hotUpdate`是一个很好的例子。修改文件时，每个环境的模块图将用于发现受影响的模块并独立执行每个环境的HMR。

::: info
Vite V5具有混合客户端和SSR模块图。给定一个未加工或无效的节点，不可能知道它是否与客户端，SSR或两个环境相对应。模块节点具有一些前缀的属性，例如`clientImportedModules`和`ssrImportedModules` (返回`importedModules`的联合)。 `importers`包含每个模块节点的客户端和SSR环境中的所有进口商。模块节点也有`transformResult`和`ssrTransformResult` 。向后兼容性层允许生态系统从未弃用的`server.moduleGraph`中迁移。
:::

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

`environment.moduleGraph`是`EnvironmentModuleGraph` :

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
