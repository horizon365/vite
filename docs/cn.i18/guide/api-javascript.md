# JavaScript API

Vite的JavaScript API已完全键入，建议使用Typescript或在VS代码中启用JS类型检查以利用Intellisense和验证。

## `createServer`

**类型签名:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**示例用法:**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // 任何有效的用户配置选项，加`mode`和`configFile`
  configFile: false,
  root: __dirname,
  server: {
    port: 1337,
  },
})
await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })
```

::: tip NOTE
当在同一node.js进程中使用`createServer`和`build` ，两个函数都依赖于`process.env.NODE_ENV`来正常工作，这也取决于`mode`配置选项。为了防止冲突的行为，将两个API中的`process.env.NODE_ENV`或`mode`个设置为`development` 。否则，您可以产生子过程分别运行API。
:::

::: tip NOTE
当使用[中间件模式](/0)与[Websocket的代理配置](/1)结合使用时，应在`middlewareMode`中提供父http服务器以正确绑定代理。

<details><summary>例子</summary><pre><code class="language-ts">import http from 'http' import { createServer } from 'vite' const parentServer = http.createServer() // or express, koa, etc. const vite = await createServer({ server: { // Enable middleware mode middlewareMode: { // Provide the parent http server for proxy WebSocket server: parentServer, }, proxy: { '/ws': { target: 'ws://localhost:3000', // Proxying WebSocket ws: true, }, }, }, }) // @noErrors: 2339 parentServer.use(vite.middlewares)</code></pre></details>
:::

## `InlineConfig`

`InlineConfig`接口扩展了`UserConfig`属性:

- `configFile` :指定要使用的配置文件。如果未设置，Vite将尝试自动从项目根中解析一个。设置为`false`以禁用自动解析。
- `envFile` :设置为`false`禁用`.env`文件。

## `ResolvedConfig`

`ResolvedConfig`接口具有`UserConfig`的所有相同属性，除了大多数属性是解决和未定义的。它还包含类似的公用事业:

- `config.assetsInclude` :检查`id`资产的函数。
- `config.logger` :Vite的内部记录器对象。

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * 已解决的Vite配置对象。
   */
  config: ResolvedConfig
  /**
   * 连接应用程序实例
   *  - 可用于将自定义中间件连接到开发服务器。
   *  - 也可以用作自定义HTTP服务器的处理程序功能
   *   或作为任何连接式node.js框架中的中间件。
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * 本机节点HTTP服务器实例。
   * 将在中间件模式下为null。
   */
  httpServer: http.Server | null
  /**
   * Chokidar Watcher实例。如果设置`null` `config.server.watch`
   * 它不会观看任何文件，呼叫`add`或`unwatch`将无效。
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * 使用`send(payload)`方法的Web插座服务器。
   */
  ws: WebSocketServer
  /**
   * 可以在给定文件上运行插件挂钩的滚动插件容器。
   */
  pluginContainer: PluginContainer
  /**
   * 跟踪导入关系的模块图，url要文件映射
   * 和HMR状态。
   */
  moduleGraph: ModuleGraph
  /**
   * 已解决的URL Vite在CLI上打印（URL编码）。返回`null`
   * 在中间软件模式下，或者服务器未在任何端口上收听。
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * 通过编程方式解决，加载和转换URL并获得结果
   * 无需浏览HTTP请求管道。
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * 应用Vite内置的HTML变换和任何插件HTML变换。
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * 加载给定的URL作为SSR的实例化模块。
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * 修复SSR错误stackTrace。
   */
  ssrFixStacktrace(e: Error): void
  /**
   * 触发模块图中的模块的HMR。您可以使用`server.moduleGraph`
   * API检索要重新加载的模块。如果`hmr`是错误的，则是一个no-op。
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * 启动服务器。
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * 重新启动服务器。
   *
   * @Param ForcePtimize-强制优化器重新束缚，与 -  Force CLI标志相同
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * 停止服务器。
   */
  close(): Promise<void>
  /**
   * 结合CLI快捷方式
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * 呼叫`await server.waitForRequestsIdle(id)`将等到所有静态进口
   * 已处理。如果从负载或转换插件钩中调用，则ID需要为
   * 作为参数传递以避免僵局。第一个呼叫此功能
   * 已处理模块图的静态导入部分将立即解决。
   * @entimentiment
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle`被用作逃生舱口，以改善DX的DX，以遵循Vite Dev服务器的按需性质实现的功能。可以在启动期间使用诸如Tailwind之类的工具来使用它来延迟生成应用CSS类，直到看到应用程序代码为止，避免了样式更改的闪光。当在负载或变换钩中使用此功能并使用默认的HTTP1服务器时，将阻止六个HTTP通道之一，直到服务器处理所有静态导入为止。 Vite的依赖性优化器当前使用此功能来避免通过延迟预捆绑依赖项的加载，直到从静态导入的来源收集到所有导入的依赖关系，以避免对缺失依赖的全页重新加载。 Vite可能会在未来的主要版本中切换到不同的策略，默认情况下设定`optimizeDeps.crawlUntilStaticImports: false` ，以避免在冷启动过程中大量应用中的性能命中。
:::

## `build`

**类型签名:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**示例用法:**

```ts twoslash [vite.config.js]
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await build({
  root: path.resolve(__dirname, './project'),
  base: '/foo/',
  build: {
    rollupOptions: {
      // ...
    },
  },
})
```

## `preview`

**类型签名:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**示例用法:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // 任何有效的用户配置选项，加`mode`和`configFile`
  preview: {
    port: 8080,
    open: true,
  },
})

previewServer.printUrls()
previewServer.bindCLIShortcuts({ print: true })
```

## `PreviewServer`

```ts
interface PreviewServer {
  /**
   * 已解决的Vite配置对象
   */
  config: ResolvedConfig
  /**
   * 连接应用程序实例。
   *  - 可用于将自定义中间件附加到预览服务器上。
   *  - 也可以用作自定义HTTP服务器的处理程序功能
   *   或作为任何连接式node.js框架中的中间件
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * 本机节点http服务器实例
   */
  httpServer: http.Server
  /**
   * 已解决的URL Vite在CLI上打印（URL编码）。返回`null`
   * 如果服务器未在任何端口上收听。
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * 打印服务器URL
   */
  printUrls(): void
  /**
   * 结合CLI快捷方式
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**类型签名:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

`command`值是开发和预览中的`serve` ，而构建中的`build` 。

## `mergeConfig`

**类型签名:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

深层合并两个Vite配置。 `isRoot`代表正在合并的Vite配置中的级别。例如，如果您要合并两个`build`选项，请设置`false`

::: tip NOTE
`mergeConfig`仅接受对象形式的配置。如果您有回调表格的配置，则应在传递到`mergeConfig`之前将其调用。

您可以使用`defineConfig`助手将回调表格中的配置与另一个配置合并:

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

//  - -切 - -
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**类型签名:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**相关:** [server.fs.allow](/0)

如果符合以下条件，请搜索潜在工作空间的根部，否则会退回到`root` :

- 在`package.json`中包含`workspaces`字段
- 包含以下文件之一
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**类型签名:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**相关:** [`.env`文件](/0)

在`envDir`中加载`.env`文件。默认情况下，除非更改`prefixes` ，否则仅加载了带有`VITE_`前缀的ENV变量。

## `normalizePath`

**类型签名:**

```ts
function normalizePath(id: string): string
```

**相关:**[路径归一化](/0)

使在VITE插件之间互操作的路径归一条路径。

## `transformWithEsbuild`

**类型签名:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

用Esbuild转换JavaScript或打字稿。对于更喜欢匹配Vite的内部Esbuild变换的插件很有用。

## `loadConfigFromFile`

**类型签名:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  customLogger?: Logger,
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

用Esbuild手动加载Vite配置文件。

## `preprocessCSS`

- **实验:**[给予反馈](/0)

**类型签名:**

```ts
async function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig,
): Promise<PreprocessCSSResult>

interface PreprocessCSSResult {
  code: string
  map?: SourceMapInput
  modules?: Record<string, string>
  deps?: Set<string>
}
```

预处理`.css`和`.styl` `.stylus` `.sass`到普通CSS `.scss` `.less`可以在浏览器中使用或通过其他工具解析。与[内置的CSS预处理支持](/0)类似，如果使用时，必须安装相应的预处理器。

从`filename`扩展程序推断使用的前处理器。如果`filename`以`.module.{ext}`结束，则将其推断为[CSS模块](/0)，并且返回的结果将包括一个`modules`对象，将原始类名映射到转换后的名称。

请注意，预处理不会在`url()`或`image-set()`中解析URL。
