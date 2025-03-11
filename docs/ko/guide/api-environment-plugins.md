# 플러그인의 환경 API

:::warning Experimental
환경 API는 실험적입니다. 우리는 Vite 6 동안 API를 안정적으로 유지하여 생태계를 실험하고 그 위에 구축 할 수 있도록 우리는 우리는 우리는 Vite 7의 잠재적 파괴 변화 로이 새로운 API를 안정화시킬 계획입니다.

자원:

- 우리가 새로운 API에 대한 피드백을 수집하는 [피드백 토론](https://github.com/vitejs/vite/discussions/16358) .
- 새로운 API가 구현되고 검토 된 [환경 API PR](https://github.com/vitejs/vite/pull/16471) .

귀하의 의견을 저희와 공유하십시오.
:::

## 후크에서 현재 환경에 액세스합니다

Vite 6 ( `client` 및 `ssr` )까지 두 개의 환경이 있다는 점을 감안할 때, `ssr` 부울은 Vite API의 현재 환경을 식별하기에 충분했습니다. 플러그인 후크는 마지막 옵션 매개 변수에서 `ssr` 부울을 수신했으며, 여러 API는 모듈을 올바른 환경 (예 : `server.moduleGraph.getModuleByUrl(url, { ssr })` )에 올바르게 연결할 수있는 마지막 `ssr` 매개 변수를 예상했습니다.

구성 가능한 환경의 출현으로 이제 플러그인에서 옵션 및 인스턴스에 액세스 할 수있는 균일 한 방법이 있습니다. 플러그인 후크는 이제 컨텍스트에서 `this.environment` 노출 시키며, 이전에 예상 한 API는 이제 적절한 환경 (예 `environment.moduleGraph.getModuleByUrl(url)` `ssr` 에 스코핑되었습니다.

Vite 서버에는 공유 플러그인 파이프 라인이 있지만 모듈이 처리되면 항상 주어진 환경의 맥락에서 수행됩니다. `environment` 인스턴스는 플러그인 컨텍스트에서 사용할 수 있습니다.

플러그인은 `environment` 인스턴스를 사용하여 환경 구성 ( `environment.config` 사용하여 액세스 할 수 있음)에 따라 모듈 처리 방법을 변경할 수 있습니다.

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

## 후크를 사용하여 새로운 환경 등록

플러그인은 `config` 후크에 새로운 환경을 추가 할 수 있습니다 (예 : [RSC](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components) 용 별도의 모듈 그래프가 있습니다).

```ts
  config(config: UserConfig) {
    config.environments.rsc ??= {}
  }
```

빈 객체는 환경을 등록하기에 충분합니다. 루트 레벨 환경 구성의 기본값은 기본값입니다.

## 후크를 사용한 환경 구성

`config` 후크가 실행되는 동안 전체 환경 목록은 아직 알려지지 않았으며 환경은 루트 레벨 환경 구성의 기본값 또는 `config.environments` 레코드를 통해 명시 적으로 영향을받을 수 있습니다.
플러그인은 `config` 후크를 사용하여 기본값을 설정해야합니다. 각 환경을 구성하려면 새로운 `configEnvironment` 후크를 사용할 수 있습니다. 이 후크는 최종 기본값의 해상도를 포함하여 부분적으로 해결 된 구성으로 각 환경마다 호출됩니다.

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    if (name === 'rsc') {
      options.resolve.conditions = // ...
```

## `hotUpdate` 후크

- **유형 :** `(this : {환경 : devenvironment}, 옵션 : hotupdateoptions) => 배열<EnvironmentModuleNode> | 무효의 | 약속 <배열<EnvironmentModuleNode> | void>`
- [HMR API](./api-hmr) **도 참조하십시오**

`hotUpdate` 후크를 사용하면 플러그인을 사용하면 주어진 환경에 대한 사용자 정의 HMR 업데이트 처리를 수행 할 수 있습니다. 파일이 변경되면 `server.environments` 의 순서에 따라 각 환경에 대해 HMR 알고리즘이 직렬로 실행되므로 `hotUpdate` 후크는 여러 번 호출됩니다. 후크는 다음 서명이있는 컨텍스트 객체를 수신합니다.

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

- `this.environment` 은 파일 업데이트가 현재 처리중인 모듈 실행 환경입니다.

- `modules` 환경에서 변경된 파일의 영향을받는 모듈 배열입니다. 단일 파일이 여러 서비스 모듈 (예 : VUE SFC)에 매핑 될 수 있기 때문에 배열입니다.

- `read` 파일의 내용을 반환하는 비동기 판독 함수입니다. 일부 시스템에서는 편집기가 파일 업데이트를 마치기 전에 파일 변경 콜백이 너무 빨리 발생할 수 있고 Direct `fs.readFile` 빈 콘텐츠를 반환하기 때문에 제공됩니다. 전달 된 읽기 기능은이 동작을 정상화합니다.

후크는 다음을 선택할 수 있습니다.

- HMR이 더 정확하도록 영향을받는 모듈 목록을 필터링하고 좁 힙니다.

- 빈 배열을 반환하고 전체 재 장전을 수행하십시오.

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

    // 수동으로 무효화 모듈
    const invalidatedModules = new Set()
    for (const mod of modules) {
      this.environment.moduleGraph.invalidateModule(
        mod,
        invalidatedModules,
        timestamp,
        true
      )
    }
    this.environment.hot.send({ type: 'full-reload' })
    return []
  }
  ```

- 빈 배열을 반환하고 클라이언트에 사용자 정의 이벤트를 보내서 완전한 사용자 정의 HMR 처리를 수행하십시오.

  ```js
  hotUpdate() {
    if (this.environment.name !== 'client')
      return

    this.environment.hot.send({
      type: 'custom',
      event: 'special-update',
      data: {}
    })
    return []
  }
  ```

  클라이언트 코드는 [HMR API를](./api-hmr) 사용하여 해당 핸들러를 등록해야합니다 (동일한 플러그인의 `transform` 후크로 주입 할 수 있음).

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // 사용자 정의 업데이트를 수행하십시오
    })
  }
  ```

## 환경 당 플러그인

플러그인은 `applyToEnvironment` 기능으로 적용 해야하는 환경을 정의 할 수 있습니다.

```js
const UnoCssPlugin = () => {
  // 공유 글로벌 주
  return {
    buildStart() {
      // 약점 <환경, 데이터>가있는 환경당 시작 상태
      // 이를 사용하여 환경
    },
    configureServer() {
      // 일반적으로 글로벌 후크를 사용하십시오
    },
    applyToEnvironment(environment) {
      // 이 플러그인 이이 환경에서 활성화되면 true를 반환합니다.
      // 또는 새 플러그인을 반환하여 교체하십시오.
      // 후크를 사용하지 않으면 플러그인이 모든 환경에서 활성화됩니다.
    },
    resolveId(id, importer) {
      // 이 플러그인이 적용되는 환경에만 요청되었습니다
    },
  }
}
```

플러그인이 환경을 인식하지 못하고 현재 환경에 키가 표시되지 않은 상태가있는 경우 `applyToEnvironment` 후크를 사용하면 환경별로 쉽게 만들 수 있습니다.

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

Vite는 다른 후크가 필요하지 않은 경우 이러한 경우를 단순화하기 위해 `perEnvironmentPlugin` 도우미를 내 보냅니다.

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

## 빌드 후크의 환경

DEV와 같은 방식으로 플러그인 후크는 빌드 중에 환경 인스턴스를 수신하여 `ssr` 부울을 대체합니다.
이것은 또한 `renderChunk` , `generateBundle` 및 기타 빌드 만 고리에 대해서도 작동합니다.

## 빌드 중 공유 플러그인

Vite 6 이전에 플러그인 파이프 라인은 Dev 및 Build에서 다른 방식으로 작동했습니다.

- **개발 중 :** 플러그인이 공유됩니다
- **빌드 중 :** 플러그인은 각 환경마다 분리됩니다 (다른 프로세스 : `vite build` 그 다음 `vite build --ssr` ).

이 프레임 워크는 파일 시스템에 작성된 Manifest 파일을 통해 `client` 빌드와 `ssr` 빌드간에 상태를 공유해야했습니다. Vite 6에서는 이제 단일 프로세스에서 모든 환경을 구축하여 플러그인 파이프 라인 및 환경 간 통신이 Dev와 정렬 될 수있는 방식입니다.

향후 전공 (Vite 7 또는 8)에서 우리는 완전한 정렬을 목표로합니다.

- **Dev 및 Build :** 플러그인이 공유되며 [환경 별 필터링](#per-environment-plugins) 과 함께 공유됩니다.

빌드 중에 공유되는 단일 `ResolvedConfig` 인스턴스가있을 것이며, 전체 앱 빌드 프로세스 수준에서 DEV 동안 `WeakMap<ResolvedConfig, CachedData>` 과 동일한 방식으로 캐싱 할 수 있습니다.

Vite 6의 경우, 우리는 뒤로 호환성을 유지하기 위해 더 작은 단계를 수행해야합니다. Ecosystem 플러그인은 현재 구성에 액세스하기 위해 `environment.config.build` 대신 `config.build` 사용하고 있으므로 기본적으로 새로운 `ResolvedConfig` 환경당을 만들어야합니다. 프로젝트는 전체 구성 및 플러그인 파이프 라인 설정을 `builder.sharedConfigBuild` ~ `true` 공유하는 데 선택할 수 있습니다.

이 옵션은 처음에는 작은 프로젝트의 작은 부분 집합에서만 작동하므로 `sharedDuringBuild` 를 `true` 로 설정하여 특정 플러그인을 공유 할 수 있도록 플러그인 저자는 옵트 인 할 수 있습니다. 이를 통해 일반 플러그인에 대한 상태를 쉽게 공유 할 수 있습니다.

```js
function myPlugin() {
  // Dev 및 Build의 모든 환경 중 상태를 공유하십시오
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // 모든 환경에 대한 단일 인스턴스로 선택합니다
    sharedDuringBuild: true,
  }
}
```
