# JavaScript API

API VITE JavaScript полностью напечатаны, и рекомендуется использовать TypeScript или включить проверку типа JS в коде VS для использования Intellisense и проверки.

## `createServer`

**Тип подпись:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Пример использования:**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // Любые действительные параметры конфигурации пользователя, плюс `mode` и `configFile`
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
При использовании `createServer` и `build` в одном и том же процессе node.js обе функции полагаются на `process.env.NODE_ENV` для правильной работы, что также зависит от опции `mode` конфигурации. Чтобы предотвратить противоречивое поведение, установите `process.env.NODE_ENV` или `mode` из двух API до `development` . В противном случае вы можете породить дочерний процесс, чтобы запустить API отдельно.
:::

::: tip NOTE
При использовании [режима промежуточного программного обеспечения](/en/config/server-options.html#server-middlewaremode) в сочетании с [Proxy Config для WebSocket](/en/config/server-options.html#server-proxy) , родительский HTTP -сервер должен быть предоставлен в `middlewareMode` , чтобы правильно привязать прокси.

<details><summary>Пример</summary><pre> <code class="language-ts">import http from 'http' import { createServer } from 'vite' const parentServer = http.createServer() // or express, koa, etc. const vite = await createServer({ server: { // Enable middleware mode middlewareMode: { // Provide the parent http server for proxy WebSocket server: parentServer, }, proxy: { '/ws': { target: 'ws://localhost:3000', // Proxying WebSocket ws: true, }, }, }, }) // @noErrors: 2339 parentServer.use(vite.middlewares)</code></pre></details>
:::

## `InlineConfig`

Интерфейс `InlineConfig` расширяется `UserConfig` с дополнительными свойствами:

- `configFile` : Укажите файл конфигурации для использования. Если не установить, Vite попытается автоматически разрешить один из Project Root. Установите `false` , чтобы отключить автозарешение.
- `envFile` : установите на `false` , чтобы отключить `.env` файла.

## `ResolvedConfig`

Интерфейс `ResolvedConfig` имеет все те же свойства `UserConfig` , за исключением того, что большинство свойств разрешены и не определены. Он также содержит такие коммунальные услуги, как:

- `config.assetsInclude` : функция, чтобы проверить, считается ли `id` активом.
- `config.logger` : Внутренний объект VITE.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * Разрешенный объект конфигурации Vite.
   */
  config: ResolvedConfig
  /**
   * Экземпляр приложения Connect
   * - Можно использовать для прикрепления пользовательских средних войнов к серверу DEV.
   * - Также можно использовать в качестве функции обработчика пользовательского HTTP -сервера
   *   или в качестве промежуточного программного обеспечения в любом узле Connect-Style.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Настоящий узл http -сервер.
   * Будет нулевым в режиме промежуточного программного обеспечения.
   */
  httpServer: http.Server | null
  /**
   * Чекидар наблюдатель экземпляр. Если `config.server.watch` установлено на `null` ,
   * Он не будет смотреть никаких файлов, и вызов `add` или `unwatch` не окажет никакого эффекта.
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * Сервер веб -сокетов с `send(payload)` методом.
   */
  ws: WebSocketServer
  /**
   * Контейнер плагина ROLLUP, который может запускать плагины крючков в данном файле.
   */
  pluginContainer: PluginContainer
  /**
   * График модуля, который отслеживает отношения импорта, URL -адреса карты файлов
   * и HMR State.
   */
  moduleGraph: ModuleGraph
  /**
   * Разрешенные URL-адреса выпуска на CLI (кодируемый URL). Возвращает `null`
   * в режиме промежуточного программного обеспечения или если сервер не слушает ни на каком порте.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Программно разрешать, загружать и преобразовать URL и получить результат
   * Не проходя через конвейер HTTP -запроса.
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Примените встроенные преобразования HTML VITE и любые плагины HTML-преобразования.
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * Загрузите заданный URL как созданный модуль для SSR.
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * Исправить ошибку SSR Stacktrace.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Триггеры HMR для модуля на графике модуля. Вы можете использовать `server.moduleGraph`
   * API, чтобы получить модуль для перезагрузки. Если `hmr` неверно, это неоперация.
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * Запустить сервер.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Перезагрузите сервер.
   *
   * @param sistoptimize -заставьте оптимизатор для повторного сбора, так же, как -Force Cli Flag
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * Остановите сервер.
   */
  close(): Promise<void>
  /**
   * Связывать ярлыки CLI
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * Звонок `await server.waitForRequestsIdle(id)` будет подождать, пока все статические импорты
   * обрабатываются. При вызове из плагина нагрузки или преобразования, идентификатор должен быть
   * Прошел как параметр, чтобы избежать тупиков. Вызов этой функции после первой
   * Статический раздел импорта на графике модуля был обработан немедленно.
   * @Experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` предназначен для использования в качестве люка Escape для улучшения DX для функций, которые не могут быть реализованы после характера Vite Dev Server. Его можно использовать во время запуска с помощью таких инструментов, как Tailwind, чтобы отложить генерирование классов CSS приложения до тех пор, пока не будет замечен код приложения, избегая вспышек изменений в стиле. Когда эта функция используется в крючке нагрузки или преобразования, а используется сервер HTTP1 по умолчанию, один из шести каналов HTTP будет заблокирован до тех пор, пока сервер не будет обрабатывать все статические импорты. В настоящее время оптимизатор зависимости VITE использует эту функцию, чтобы избежать полной перезагрузки на недостающих зависимостях путем задержки загрузки предварительно связанных зависимостей, пока все импортируемые зависимости не будут собраны из статических импортированных источников. VITE может переключиться на другую стратегию в будущем крупном выпуске, установив `optimizeDeps.crawlUntilStaticImports: false` по умолчанию, чтобы избежать достижения производительности в больших приложениях во время холодного запуска.
:::

## `build`

**Тип подпись:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**Пример использования:**

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

**Тип подпись:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**Пример использования:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // Любые действительные параметры конфигурации пользователя, плюс `mode` и `configFile`
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
   * Решенный объект конфигурации Vite
   */
  config: ResolvedConfig
  /**
   * Экземпляр приложения Connect.
   * - Можно использовать для прикрепления пользовательских средних войнов к серверу предварительного просмотра.
   * - Также можно использовать в качестве функции обработчика пользовательского HTTP -сервера
   *   или в качестве промежуточного программного обеспечения в любом узле Connect-Style.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Настоящий узловый экземпляр сервера HTTP
   */
  httpServer: http.Server
  /**
   * Разрешенные URL-адреса выпуска на CLI (кодируемый URL). Возвращает `null`
   * Если сервер не слушает ни на каком порте.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Печатные URL -адреса сервера
   */
  printUrls(): void
  /**
   * Связывать ярлыки CLI
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**Тип подпись:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

Значение `command` составляет `serve` в разработке и предварительный просмотр и `build` в сборке.

## `mergeConfig`

**Тип подпись:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

Глубоко объедините два конфигурации. `isRoot` представляет уровень в конфигурации Vite, который объединяется. Например, установите `false` если вы объединяете два `build` параметра.

::: tip NOTE
`mergeConfig` принимает только конфигурацию в форме объекта. Если у вас есть конфигурация в форме обратного вызова, вы должны позвонить в нее перед прохождением в `mergeConfig` .

Вы можете использовать помощник `defineConfig` для объединения конфигурации в форме обратного вызова с другой конфигурацией:

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

// ---резать---
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**Тип подпись:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**Связанный:** [server.fs.allow](/en/config/server-options.md#server-fs-allow)

Поиск корня потенциального рабочего пространства, если он соответствует следующим условиям, в противном случае он будет отстранен на `root` :

- содержит `workspaces` поле в `package.json`
- содержит один из следующих файлов
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**Тип подпись:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**Связанный:** [`.env` файлов](./env-and-mode.md#env-files)

Загрузите `.env` файлов в `envDir` . По умолчанию только переменные ENV, префиксированные `VITE_` загружаются, если `prefixes` не изменяются.

## `normalizePath`

**Тип подпись:**

```ts
function normalizePath(id: string): string
```

**Связанный:** [нормализация пути](./api-plugin.md#path-normalization)

Нормализует путь к взаимодействию между плагинами VITE.

## `transformWithEsbuild`

**Тип подпись:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

Преобразовать JavaScript или TypeScript с помощью ESBUILD. Полезно для плагинов, которые предпочитают внутреннее преобразование ESBUILD от VITE.

## `loadConfigFromFile`

**Тип подпись:**

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

Загрузите файл конфигурации Vite вручную с помощью Esbuild.

## `preprocessCSS`

- **Экспериментальный:** [дайте обратную связь](https://github.com/vitejs/vite/discussions/13815)

**Тип подпись:**

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

Предварительные обработки `.css` , `.scss` , `.sass` , `.less` , `.styl` и `.stylus` файлов на простые CSS, чтобы его можно было использовать в браузерах или анализируется другими инструментами. Подобно [встроенной поддержке предварительной обработки CSS](/en/guide/features#css-pre-processors) , при использовании соответствующий прецессор должен быть установлен.

Используемый предварительный процесс выведен из расширения `filename` . Если `filename` заканчивается с `.module.{ext}` , он выведен в качестве [модуля CSS](https://github.com/css-modules/css-modules) , и возвращенный результат будет включать в себя `modules` объектно, отображающий исходные имена классов с преобразованными.

Обратите внимание, что предварительная обработка не будет разрешать URL-адреса в `url()` или `image-set()` .
