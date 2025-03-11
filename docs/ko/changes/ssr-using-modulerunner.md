# `ModuleRunner` API를 사용하는 SSR

::: tip Feedback
[환경 API 피드백 토론](https://github.com/vitejs/vite/discussions/16358) 에서 피드백을 제공하십시오
:::

`server.ssrLoadModule` [모듈 러너](/ko/guide/api-environment#modulerunner) 에서 가져 오면 대체되었습니다.

범위에 영향을 미칩니다 : `Vite Plugin Authors`

::: warning Future Deprecation
`ModuleRunner` `v6.0` 에서 처음 소개되었습니다. `server.ssrLoadModule` 의 감가 상각은 미래 전공을 위해 계획되어 있습니다. 사용량을 식별하려면 vite 구성에서 `future.removeSsrLoadModule` ~ `"warn"` 설정하십시오.
:::

## 동기 부여

`server.ssrLoadModule(url)` 은 `ssr` 환경에서 모듈을 가져올 수 있으며 Vite Dev 서버와 동일한 프로세스에서만 모듈을 실행할 수 있습니다. 사용자 정의 환경이있는 앱의 경우 각각 별도의 스레드 또는 프로세스에서 실행중인 `ModuleRunner` 와 관련이 있습니다. 모듈을 가져 오려면 이제 `moduleRunner.import(url)` 있습니다.

## 마이그레이션 가이드

[Frameworks Guide의 Environment API를](../guide/api-environment-frameworks.md) 확인하십시오.
