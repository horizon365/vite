# 고리에 `this.environment`

::: tip Feedback
[환경 API 피드백 토론](https://github.com/vitejs/vite/discussions/16358) 에서 피드백을 제공하십시오
:::

Vite 6 이전에는 `client` 과 `ssr` 두 가지 환경 만 사용할 수있었습니다. `resolveId` , `load` 및 `transform` 의 단일 `options.ssr` 플러그인 후크 인수를 통해 플러그인 후크에서 모듈을 처리 할 때 플러그인 저자 가이 두 환경을 구별 할 수있었습니다. Vite 6에서 Vite 응용 프로그램은 필요에 따라 수의 명명 된 환경을 정의 할 수 있습니다. 우리는 플러그인 컨텍스트에 `this.environment` 도입하여 후크에서 현재 모듈의 환경과 상호 작용합니다.

범위에 영향을 미칩니다 : `Vite Plugin Authors`

::: warning Future Deprecation
`this.environment` `v6.0` 에 도입되었습니다. `options.ssr` 의 감가 상각은 `v7.0` 대해 계획됩니다. 이 시점에서 새로운 API를 사용하기 위해 플러그인 마이그레이션을 권장합니다. 사용량을 식별하려면 Vite 구성에서 `future.removePluginHookSsrArgument` `"warn"` 설정하십시오.
:::

## 동기 부여

`this.environment` 플러그인 후크 구현이 현재 환경 이름을 알 수있을뿐만 아니라 환경 구성 옵션, 모듈 그래프 정보 및 변환 파이프 라인 ( `environment.config` , `environment.moduleGraph` , `environment.transformRequest()` )에 액세스 할 수 있습니다. 컨텍스트에서 환경 인스턴스를 사용할 수있게되면 플러그인 저자는 전체 개발자 서버의 종속성을 피할 수 있습니다 (일반적으로 `configureServer` 후크를 통해 시작시 캐싱).

## 마이그레이션 가이드

기존 플러그인이 빠른 마이그레이션을 수행하려면 `options.ssr` 인수를 `resolveId` , `load` 및 `transform` 후크에서 `this.environment.name !== 'client'` 으로 바꾸십시오.

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [! 코드 -]
      const isSSR = this.environment.name !== 'client' // [! 코드 ++]

      if (isSSR) {
        // SSR 특정 논리
      } else {
        // 클라이언트 특정 논리
      }
    },
  }
}
```

보다 강력한 장기 구현을 위해 플러그인 후크는 환경 이름에 의존하는 대신 세밀한 환경 옵션을 사용하여 [여러 환경을](/ko/guide/api-environment.html#accessing-the-current-environment-in-hooks) 처리해야합니다.
