# 환경 API

:::warning Experimental
환경 API는 실험적입니다. 우리는 Vite 6 동안 API를 안정적으로 유지하여 생태계를 실험하고 그 위에 구축 할 수 있도록 우리는 우리는 우리는 Vite 7의 잠재적 파괴 변화 로이 새로운 API를 안정화시킬 계획입니다.

자원:

- 우리가 새로운 API에 대한 피드백을 수집하는 [피드백 토론](https://github.com/vitejs/vite/discussions/16358) .
- 새로운 API가 구현되고 검토 된 [환경 API PR](https://github.com/vitejs/vite/pull/16471) .

귀하의 의견을 저희와 공유하십시오.
:::

## 정식 환경

Vite 6은 환경의 개념을 공식화합니다. Vite 5까지, 두 가지 암시 적 환경 ( `client` 및 선택적으로 `ssr` )이있었습니다. 새로운 Environment API를 사용하면 사용자와 프레임 워크 저자가 앱이 제작에서 작동하는 방식을 매핑하는 데 필요한만큼의 환경을 만들 수 있습니다. 이 새로운 기능은 큰 내부 리팩토링이 필요했지만 뒤로 호환성에 대한 많은 노력이 이루어졌습니다. VITE 6의 초기 목표는 생태계를 가능한 한 새로운 전공으로 이동하여 충분한 사용자가 마이그레이션하고 프레임 워크 및 플러그인 저자가 새로운 디자인을 검증 할 때까지 이러한 새로운 실험용 API의 채택을 지연시키는 것입니다.

## Build와 Dev 사이의 간격을 닫습니다

간단한 SPA/MPA의 경우 환경 주변의 새로운 API가 구성에 노출되지 않습니다. 내부적으로 Vite는 옵션을 `client` 환경에 적용하지만 Vite를 구성 할 때이 개념을 알 필요는 없습니다. Vite 5의 구성 및 동작은 여기에서 원활하게 작동해야합니다.

일반적인 서버 측 렌더링 (SSR) 앱으로 이동하면 두 가지 환경이 있습니다.

- `client` : 브라우저에서 앱을 실행합니다.
- `server` : 노드 (또는 다른 서버 런타임)에서 앱을 실행하여 페이지를 브라우저로 전송하기 전에 페이지를 렌더링합니다.

Dev에서 Vite는 Vite Dev 서버와 동일한 노드 프로세스에서 서버 코드를 실행하여 프로덕션 환경에 근사한 근사치를 제공합니다. 그러나 다른 제약 조건을 갖는 [CloudFlare의 Workerd](https://github.com/cloudflare/workerd) 와 같은 다른 JS 런타임에서 서버가 실행할 수도 있습니다. 최신 앱은 브라우저, 노드 서버 및 에지 서버 (예 : 브라우저, 노드 서버) (예 : 두 개 이상의 환경에서 실행될 수 있습니다. Vite 5는 이러한 환경을 제대로 표현할 수 없었습니다.

Vite 6을 사용하면 사용자가 빌드 및 개발 중 앱을 구성하여 모든 환경을 매핑 할 수 있습니다. DEV 동안 단일 VITE DEV 서버를 사용하여 여러 다른 환경에서 동시에 코드를 실행할 수 있습니다. 앱 소스 코드는 여전히 Vite Dev Server에 의해 변환됩니다. 공유 HTTP 서버, Middlewares, Resolved Config 및 Plugins 파이프 라인 외에 Vite Dev 서버에는 이제 독립적 인 DEV 환경이 있습니다. 각각은 생산 환경과 가능한 한 밀접하게 일치하도록 구성되며 코드가 실행되는 DEV 런타임에 연결되어 있습니다 (Workerd의 경우 서버 코드는 이제 미니 플레어에서 로컬로 실행할 수 있음). 클라이언트에서 브라우저는 코드를 가져 와서 실행합니다. 다른 환경에서는 모듈 러너가 변환 된 코드를 가져 와서 평가합니다.

![vite 환경](../../images/vite-environments.svg)

## 환경 구성

SPA/MPA의 경우 구성은 VITE 5와 유사하게 보입니다. 내부적으로 이러한 옵션은 `client` 환경을 구성하는 데 사용됩니다.

```js
export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
})
```

이것은 우리가 Vite를 접근하기 쉽게 유지하고 새로운 개념이 필요할 때까지 노출되지 않기 때문에 중요합니다.

앱이 여러 환경으로 구성되면 이러한 환경을 `environments` 구성 옵션으로 명시 적으로 구성 할 수 있습니다.

```js
export default {
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
}
```

명시 적으로 문서화되지 않으면 환경은 구성된 최상위 구성 옵션을 상속합니다 (예 : 새로운 `server` 및 `edge` 환경은 `build.sourcemap: false` 옵션을 상속합니다). `optimizeDeps` 과 같은 소수의 최상위 옵션은 서버 환경에 기본값으로 적용될 때 잘 작동하지 않기 때문에 `client` 환경에만 적용됩니다. `client` 환경은 `environments.client` 통해 명시 적으로 구성 할 수 있지만 새로운 환경을 추가 할 때 클라이언트 구성이 변경되지 않도록 최상위 옵션으로 수행하는 것이 좋습니다.

`EnvironmentOptions` 인터페이스는 모든 환경 별 옵션을 노출시킵니다. `resolve` 과 같이 `build` 과 `dev` 에 모두 적용되는 환경 옵션이 있습니다. DEV 및 구축 특정 옵션 (예 : `dev.warmup` 또는 `build.outDir` )에는 `DevEnvironmentOptions` 와 `BuildEnvironmentOptions` 있습니다. `optimizeDeps` 같은 일부 옵션은 DEV에만 적용되지만 후진 호환성을 위해 `dev` 에 중첩되지 않고 최상위 레벨로 유지됩니다.

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

`UserConfig` 인터페이스는 `EnvironmentOptions` 인터페이스에서 확장되어 `environments` 옵션을 통해 구성된 다른 환경의 클라이언트 및 기본값을 구성 할 수 있습니다. `ssr` 라는 `client` 과 서버 환경은 Dev 기간 동안 항상 존재합니다. 이것은 `server.ssrLoadModule(url)` 와 `server.moduleGraph` 과의 역 호환성을 허용합니다. 빌드 중에는 `client` 환경이 항상 존재하며 `ssr` 환경은 명시 적으로 구성된 경우에만 존재합니다 ( `environments.ssr` 또는 후진 호환성 `build.ssr` ). 앱은 SSR 환경에 `ssr` 이름을 사용할 필요가 없으며 예를 들어 `server` 라고 할 수 있습니다.

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // 다른 옵션
}
```

환경 API가 안정되면 `ssr` 상위 레벨 속성이 더 이상 사용되지 않습니다. 이 옵션은 `environments` 과 동일한 역할을하지만 기본 `ssr` 환경의 경우 작은 옵션 세트 만 구성 할 수 있습니다.

## 맞춤형 환경 인스턴스

낮은 수준 구성 API를 사용할 수 있으므로 런타임 제공 업체는 런타임에 대한 적절한 기본값을 환경에 제공 할 수 있습니다. 이러한 환경은 또한 다른 프로세스 나 스레드를 생산하여 생산 환경에 가까운 런타임에서 개발 중에 모듈을 실행할 수 있습니다.

```js
import { customEnvironment } from 'vite-environment-provider'

export default {
  build: {
    outDir: '/dist/client',
  },
  environments: {
    ssr: customEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
  },
}
```

## 뒤로 호환성

현재 VITE 서버 API는 아직 더 이상 사용되지 않았으며 Vite 5와 뒤로 호환됩니다. 새로운 환경 API는 실험적입니다.

`server.moduleGraph` 클라이언트 및 SSR 모듈 그래프의 혼합보기를 반환합니다. 역 호환 혼합 모듈 노드는 모든 방법에서 반환됩니다. `handleHotUpdate` 된 모듈 노드에 대해 동일한 체계가 사용됩니다.

아직 환경 API로 전환하는 것이 좋습니다. 우리는 플러그인이 두 버전을 유지할 필요가 없기 전에 Vite 6을 채택하기 위해 사용자 기반의 상당 부분을 목표로하고 있습니다. 향후 감가 상징 및 업그레이드 경로에 대한 정보에 대한 향후 Breaking Changes Section을 확인하십시오.

- [고리에 `this.environment`](/ko/changes/this-environment-in-hooks)
- [HMR `hotUpdate` 플러그인 후크](/ko/changes/hotupdate-hook)
- [환경당 API로 이동하십시오](/ko/changes/per-environment-apis)
- [`ModuleRunner` API를 사용하는 SSR](/ko/changes/ssr-using-modulerunner)
- [빌드 중 공유 플러그인](/ko/changes/shared-plugins-during-build)

## 대상 사용자

이 안내서는 최종 사용자를위한 환경에 대한 기본 개념을 제공합니다.

플러그인 저자는 현재 환경 구성과 상호 작용할 수있는보다 일관된 API를 가지고 있습니다. VITE 위에 구축하는 경우 [Environment API 플러그인 안내서](./api-environment-plugins.md) 안내서는 여러 사용자 정의 환경을 지원할 수있는 확장 플러그인 API를 설명합니다.

프레임 워크는 다른 수준에서 환경을 노출시키기로 결정할 수 있습니다. 프레임 워크 저자 인 경우 [환경 API 프레임 워크 안내서를](./api-environment-frameworks) 계속 읽고 환경 API 프로그램 측면에 대해 알아보십시오.

런타임 제공 업체의 경우 [Environment API Runtimes 가이드는](./api-environment-runtimes.md) 프레임 워크 및 사용자가 소비 할 맞춤형 환경을 제공하는 방법을 설명합니다.
