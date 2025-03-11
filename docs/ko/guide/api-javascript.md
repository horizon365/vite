# JavaScript API

Vite의 JavaScript API는 완전히 입력되며 TypeScript를 사용하거나 JS 유형 확인 VS 코드를 활성화하여 IntellIsense 및 검증을 활용하는 것이 좋습니다.

## `createServer`

**유형 서명 :**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**예제 사용 :**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // 모든 유효한 사용자 구성 옵션, `mode` 및 `configFile`
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
동일한 node.js 프로세스에서 `createServer` 과 `build` 사용하는 경우 두 기능 모두 `process.env.NODE_ENV` 에 의존하여 `mode` 구성 옵션에 따라 다릅니다. 상충되는 동작을 방지하려면 2 개의 API 중 `process.env.NODE_ENV` 또는 `mode` `development` 으로 세트하십시오. 그렇지 않으면 API를 개별적으로 실행하기 위해 자식 프로세스를 생성 할 수 있습니다.
:::

::: tip NOTE
[WebSocket의 프록시 구성](/ko/config/server-options.html#server-proxy) 과 결합 된 [미들웨어 모드를](/ko/config/server-options.html#server-middlewaremode) 사용하는 경우, Parxy를 올바르게 바인딩하려면 부모 HTTP 서버를 `middlewareMode` 으로 제공해야합니다.

<details><summary>예</summary><pre> <code class="language-ts">import http from 'http' import { createServer } from 'vite' const parentServer = http.createServer() // or express, koa, etc. const vite = await createServer({ server: { // Enable middleware mode middlewareMode: { // Provide the parent http server for proxy WebSocket server: parentServer, }, proxy: { '/ws': { target: 'ws://localhost:3000', // Proxying WebSocket ws: true, }, }, }, }) // @noErrors: 2339 parentServer.use(vite.middlewares)</code></pre></details>
:::

## `InlineConfig`

`InlineConfig` 인터페이스는 추가 속성으로 `UserConfig` 연장합니다.

- `configFile` : 사용할 구성 파일을 지정하십시오. 설정하지 않으면 Vite는 프로젝트 루트에서 자동으로 자동으로 해결하려고합니다. 자동 해상도를 비활성화하려면 `false` 로 설정하십시오.
- `envFile` : `.env` 파일을 비활성화하려면 `false` 로 설정하십시오.

## `ResolvedConfig`

`ResolvedConfig` 인터페이스는 대부분의 속성이 해결되고 정의되지 않은 경우를 제외하고 `UserConfig` 의 동일한 속성을 모두 갖습니다. 다음과 같은 유틸리티도 포함되어 있습니다.

- `config.assetsInclude` : `id` 이 자산으로 간주되는지 확인하는 기능.
- `config.logger` : Vite의 내부 로거 객체.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * 해결 된 VITE 구성 객체.
   */
  config: ResolvedConfig
  /**
   * 연결 앱 인스턴스
   * - 사용자 정의 중간 전쟁을 개발자 서버에 첨부하는 데 사용할 수 있습니다.
   * - 사용자 정의 HTTP 서버의 처리기 기능으로도 사용할 수 있습니다.
   *   또는 모든 Connecty 스타일 node.js 프레임 워크의 미들웨어로서.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * 기본 노드 HTTP 서버 인스턴스.
   * 미들웨어 모드에서는 null이됩니다.
   */
  httpServer: http.Server | null
  /**
   * Chokidar 감시자 인스턴스. `config.server.watch` `null` 으로 설정되면
   * 파일을 보지 않으며 `add` 또는 `unwatch` 호출하는 것은 영향을 미치지 않습니다.
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * 메소드가 `send(payload)` 인 웹 소켓 서버.
   */
  ws: WebSocketServer
  /**
   * 주어진 파일에서 플러그인 후크를 실행할 수있는 롤업 플러그 컨테이너.
   */
  pluginContainer: PluginContainer
  /**
   * 가져 오기 관계를 추적하는 모듈 그래프, 파일 매핑의 URL
   * 및 HMR 상태.
   */
  moduleGraph: ModuleGraph
  /**
   * 해결 된 URL은 CLI (url-encoded)에 인쇄 된 vite 인쇄물입니다. 반환 `null`
   * 미들웨어 모드에서 또는 서버가 어떤 포트에서도 듣지 않는 경우.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * 프로그래밍 방식으로 URL을 해결,로드 및 변환하고 결과를 얻으십시오.
   * HTTP 요청 파이프 라인을 통과하지 않고.
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Vite 내장 HTML 변환 및 모든 플러그인 HTML 변환을 적용하십시오.
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * 주어진 URL을 SSR의 인스턴스화 모듈로로드하십시오.
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * SSR 오류 스택 트레이스를 수정하십시오.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * 모듈 그래프의 모듈에 대한 HMR을 트리거합니다. `server.moduleGraph` 을 사용할 수 있습니다
   * API는 다시로드 할 모듈을 검색합니다. `hmr` false 인 경우 이것은 NO-OP입니다.
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * 서버를 시작하십시오.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * 서버를 다시 시작하십시오.
   *
   * @Param ForceOptimize- 최적화가 -포스 CLI 플래그와 마찬가지
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * 서버를 중지하십시오.
   */
  close(): Promise<void>
  /**
   * CLI 바로 가기를 바인딩하십시오
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * `await server.waitForRequestsIdle(id)` 호출은 모든 정적 가져 오기까지 기다립니다
   * 처리됩니다. 로드 또는 변환 플러그인 후크에서 호출되면 ID는
   * 교착 상태를 피하기 위해 매개 변수로 전달됩니다. 첫 번째 이후 에이 기능을 호출합니다
   * 모듈 그래프의 정적 가져 오기 섹션이 처리 된 부분이 즉시 해결됩니다.
   * @experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` Vite Dev 서버의 주문형 특성에 따라 구현할 수없는 기능에 대한 DX를 개선하기 위해 탈출 해치로 사용됩니다. Tailwind와 같은 도구로 시작하는 동안 앱 코드가 표시 될 때까지 App CSS 클래스 생성을 지연시켜 스타일 변경의 플래시를 피할 수 있습니다. 이 기능이로드 또는 변환 후크에 사용되고 기본 HTTP1 서버가 사용되면 서버가 모든 정적 가져 오기가 처리 될 때까지 6 개의 HTTP 채널 중 하나가 차단됩니다. Vite의 종속성 Optimizer는 현재이 기능을 사용하여 수입 된 모든 의존성이 정적 수입 소스에서 수집 될 때까지 사전 구매 종속성의로드를 지연시켜 누락 된 종속성에 대한 전체 페이지 재 장전을 피합니다. Vite는 향후 주요 릴리스에서 다른 전략으로 전환 할 수 있으며, 콜드 스타트 중 대규모 응용 프로그램의 성능을 피하기 위해 기본적으로 설정 `optimizeDeps.crawlUntilStaticImports: false` 설정합니다.
:::

## `build`

**유형 서명 :**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**예제 사용 :**

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

**유형 서명 :**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**예제 사용 :**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // 모든 유효한 사용자 구성 옵션, `mode` 및 `configFile`
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
   * 해결 된 VITE 구성 객체
   */
  config: ResolvedConfig
  /**
   * 연결 앱 인스턴스.
   * - 사용자 정의 중간 전고를 미리보기 서버에 첨부하는 데 사용할 수 있습니다.
   * - 사용자 정의 HTTP 서버의 처리기 기능으로도 사용할 수 있습니다.
   *   또는 모든 Connecty 스타일 node.js 프레임 워크의 미들웨어로서
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * 기본 노드 HTTP 서버 인스턴스
   */
  httpServer: http.Server
  /**
   * 해결 된 URL은 CLI (url-encoded)에 인쇄 된 vite 인쇄물입니다. 반환 `null`
   * 서버가 어떤 포트에서도 듣지 않는 경우
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * 서버 URL을 인쇄합니다
   */
  printUrls(): void
  /**
   * CLI 바로 가기를 바인딩하십시오
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**유형 서명 :**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

`command` 값은 Dev and Preview에서 `serve` 이고 `build` .

## `mergeConfig`

**유형 서명 :**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

두 개의 vite 구성을 깊이 병합합니다. `isRoot` 병합되는 VITE 구성 내의 레벨을 나타냅니다. 예를 들어, 두 `build` 옵션을 병합하는 경우 `false` 설정하십시오.

::: tip NOTE
`mergeConfig` 객체 양식에서만 구성을 허용합니다. 콜백 양식의 구성이있는 경우 `mergeConfig` 로 전달하기 전에 호출해야합니다.

`defineConfig` 도우미를 사용하여 다른 구성과 함께 콜백 양식의 구성을 병합 할 수 있습니다.

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

// ---자르다---
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**유형 서명 :**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**관련 :** [Server.fs.alow](/ko/config/server-options.md#server-fs-allow)

다음 조건을 충족하는 경우 잠재적 작업 공간의 루트를 검색하십시오. 그렇지 않으면 `root` 으로 떨어집니다.

- `package.json` 에서 `workspaces` 필드를 포함합니다
- 다음 파일 중 하나가 포함되어 있습니다
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**유형 서명 :**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**관련 :** [`.env` 파일](./env-and-mode.md#env-files)

`envDir` 내에 `.env` 파일을로드합니다. 기본적으로 `prefixes` 변경되지 않는 한 `VITE_` 로 접두사가있는 ENV 변수 만로드됩니다.

## `normalizePath`

**유형 서명 :**

```ts
function normalizePath(id: string): string
```

**관련 :** [경로 정규화](./api-plugin.md#path-normalization)

Vite 플러그인간에 상호 운용하는 경로를 정규화합니다.

## `transformWithEsbuild`

**유형 서명 :**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

Esbuild로 JavaScript 또는 TypeScript를 변환하십시오. Vite의 내부 Esbuild 변환을 선호하는 플러그인에 유용합니다.

## `loadConfigFromFile`

**유형 서명 :**

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

esbuild로 Vite 구성 파일을 수동으로로드하십시오.

## `preprocessCSS`

- **실험 :** [피드백을 제공합니다](https://github.com/vitejs/vite/discussions/13815)

**유형 서명 :**

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

프리 프로세스 `.css` , `.scss` , `.sass` , `.less` , `.styl` 및 `.stylus` 파일은 일반 CSS에 대한 파일을 브라우저에서 사용하거나 다른 도구에서 구문 분석 할 수 있습니다. [내장 CSS 사전 처리 지원](/ko/guide/features#css-pre-processors) 과 유사하게 사용되는 경우 해당 사전 프로세서를 설치해야합니다.

사용 된 사전 프로세서는 `filename` 확장에서 추론됩니다. `filename` `.module.{ext}` 로 끝나면 [CSS 모듈](https://github.com/css-modules/css-modules) 로 추론되며 반환 된 결과에는 원래 클래스 이름을 변환 된 클래스 이름에 매핑하는 `modules` 객체가 포함됩니다.

사전 처리는 `url()` 또는 `image-set()` 에서 URL을 해결하지 못합니다.
