# `Environment` 인스턴스 사용

:::warning Experimental
환경 API는 실험적입니다. 우리는 Vite 6 동안 API를 안정적으로 유지하여 생태계를 실험하고 그 위에 구축 할 수 있도록 우리는 우리는 우리는 Vite 7의 잠재적 파괴 변화 로이 새로운 API를 안정화시킬 계획입니다.

자원:

- 우리가 새로운 API에 대한 피드백을 수집하는 [피드백 토론](https://github.com/vitejs/vite/discussions/16358) .
- 새로운 API가 구현되고 검토 된 [환경 API PR](https://github.com/vitejs/vite/pull/16471) .

귀하의 의견을 저희와 공유하십시오.
:::

## 환경에 액세스

DEV 동안 DEV 서버의 사용 가능한 환경은 `server.environments` 사용하여 액세스 할 수 있습니다.

```js
// 서버를 만들거나 configureserver hook에서 가져옵니다.
const server = await createServer(/* 옵션 */)

const environment = server.environments.client
environment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

플러그인에서 현재 환경에 액세스 할 수도 있습니다. 자세한 내용은 [플러그인의 환경 API를](./api-environment-plugins.md#accessing-the-current-environment-in-hooks) 참조하십시오.

## `DevEnvironment` 클래스

개발 중 각 환경은 `DevEnvironment` 클래스의 인스턴스입니다.

```ts
class DevEnvironment {
  /**
   * Vite 서버의 환경에 대한 고유 식별자.
   * 기본적으로 Vite는 '클라이언트'및 'SSR'환경을 노출시킵니다.
   */
  name: string
  /**
   * 통신 채널을 보내고받을 수 있습니다
   * 대상 런타임의 관련 모듈 러너.
   */
  hot: NormalizedHotChannel
  /**
   * 수입 된 관계가있는 모듈 노드의 그래프
   * 처리 된 모듈 및 처리 된 코드의 캐시 결과.
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * 이 환경을 포함 하여이 환경을 위해 해결 된 플러그인
   * 환경당 `create` 후크를 사용하여 생성되었습니다
   */
  plugins: Plugin[]
  /**
   * 코드를 해결,로드 및 변환 할 수 있습니다
   * 환경 플러그인 파이프 라인
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * 이 환경을위한 해결 된 구성 옵션. 서버의 옵션
   * 글로벌 범위는 모든 환경에 대한 기본값으로 간주되며
   * 재정의 (조건, 외부, 최적화)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * URL을 ID로 해결하고로드 한 후 코드를 처리합니다.
   * 플러그인 파이프 라인. 모듈 그래프도 업데이트됩니다.
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * 우선 순위가 낮은 처리 요청을 등록하십시오. 이것은 유용합니다
   * 폭포를 피하기 위해. Vite 서버에는 다음에 대한 정보가 있습니다
   * 다른 요청으로 가져온 모듈이므로 모듈 그래프를 예열 할 수 있습니다.
   * 따라서 모듈은 요청 될 때 이미 처리되었습니다.
   */
  async warmupRequest(url: string): Promise<void>
}
```

`DevEnvironmentContext` 은 :

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

그리고 `TransformResult` 은 다음과 같습니다.

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Vite 서버의 환경 인스턴스를 사용하면 `environment.transformRequest(url)` 메소드를 사용하여 URL을 처리 할 수 있습니다. 이 기능은 플러그인 파이프 라인을 사용하여 `url` 모듈 `id` 로 해결하고 (파일 시스템에서 파일을 읽거나 가상 모듈을 구현하는 플러그인을 통해)로드 한 다음 코드를 변환합니다. 모듈을 변환하는 동안 해당 모듈 노드를 작성하거나 업데이트하여 가져 오기 및 기타 메타 데이터가 환경 모듈 그래프에 기록됩니다. 처리가 완료되면 변환 결과도 모듈에 저장됩니다.

:::info transformRequest naming
우리는이 제안의 현재 버전에서 `transformRequest(url)` 과 `warmupRequest(url)` 사용하고 있으므로 Vite의 현재 API에 사용 된 사용자가 논의하고 이해하기가 더 쉽습니다. 출시되기 전에이 이름도 검토 할 수있는 기회를 얻을 수 있습니다. 예를 들어, 플러그인 후크의 롤업 `context.load(id)` 에서 페이지를 찍는 `environment.processModule(url)` 또는 `environment.loadModule(url)` 명명 될 수 있습니다. 현재 우리는 현재 이름을 유지 하고이 토론을 지연시키는 것이 더 좋습니다.
:::

## 별도의 모듈 그래프

각 환경에는 분리 된 모듈 그래프가 있습니다. 모든 모듈 그래프는 동일한 시그니처를 가지므로 환경에 따라 그래프를 크롤링하거나 쿼리하기 위해 일반 알고리즘을 구현할 수 있습니다. `hotUpdate` 좋은 예입니다. 파일이 수정되면 각 환경의 모듈 그래프는 영향을받는 모듈을 발견하고 각 환경에 대해 독립적으로 HMR을 수행하는 데 사용됩니다.

::: info
Vite V5에는 혼합 클라이언트 및 SSR 모듈 그래프가있었습니다. 처리되지 않았거나 무효화 된 노드가 주어지면 클라이언트, SSR 또는 두 환경 모두에 해당하는지 알 수 없습니다. 모듈 노드에는 `clientImportedModules` 및 `ssrImportedModules` (및 2의 결합을 반환하는 `importedModules` )와 같은 일부 속성이 접두사를 가지고 있습니다. `importers` 각 모듈 노드에 대한 클라이언트 및 SSR 환경의 모든 수입업자가 포함되어 있습니다. 모듈 노드에는 `transformResult` 및 `ssrTransformResult` 있습니다. 뒤로 호환성 레이어를 사용하면 생태계가 더 이상 사용되지 않은 `server.moduleGraph` 에서 마이그레이션 할 수 있습니다.
:::

각 모듈은 `EnvironmentModuleNode` 인스턴스로 표시됩니다. 모듈은 아직 처리되지 않고 그래프에 등록 될 수 있습니다 (이 경우 `transformResult` `null` 될 것입니다). 모듈이 처리 된 후 `importers` 과 `importedModules` 도 업데이트됩니다.

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

`environment.moduleGraph` `EnvironmentModuleGraph` 의 인스턴스입니다.

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
