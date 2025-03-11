# 환경당 API로 이동하십시오

::: tip Feedback
[환경 API 피드백 토론](https://github.com/vitejs/vite/discussions/16358) 에서 피드백을 제공하십시오
:::

모듈 그래프와 관련된 `ViteDevServer` 의 여러 API 및 모듈 변환이 `DevEnvironment` 인스턴스로 이동되었습니다.

범위에 영향을 미칩니다 : `Vite Plugin Authors`

::: warning Future Deprecation
`Environment` 인스턴스는 처음 `v6.0` 에 도입되었습니다. `server.moduleGraph` 의 감가 상각 및 현재 환경에있는 다른 방법은 `v7.0` 으로 계획됩니다. 아직 서버 방법에서 벗어나는 것이 좋습니다. 사용량을 식별하려면 Vite 구성에서이를 설정하십시오.

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## 동기 부여

Vite v5와 이전에서 단일 Vite Dev 서버에는 항상 두 개의 환경 ( `client` 및 `ssr` )이있었습니다. `server.moduleGraph` 이 두 환경에서 혼합 된 모듈을 가지고있었습니다. 노드는 `clientImportedModules` 과 `ssrImportedModules` 목록을 통해 연결되었습니다 (그러나 각각 단일 `importers` 목록이 유지되었습니다). 변환 된 모듈은 `id` 및 `ssr` 부울로 표시되었습니다. 이 부울은 API (예 : `server.moduleGraph.getModuleByUrl(url, ssr)` 및 `server.transformRequest(url, { ssr })` 로 전달되어야했습니다.

Vite v6에서는 이제 여러 가지 사용자 정의 환경 ( `client` , `ssr` , `edge` 등)을 만들 수 있습니다. 단일 `ssr` 부울로는 더 이상 충분하지 않습니다. API를 양식 `server.transformRequest(url, { environment })` 로 변경하는 대신 이러한 방법을 환경 인스턴스로 이동하여 Vite Dev 서버없이 호출 할 수 있습니다.

## 마이그레이션 가이드

- `server.moduleGraph` > [`environment.moduleGraph`](/ko/guide/api-environment#separate-module-graphs)
- `server.transformRequest(url, ssr)` > `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` > `environment.warmupRequest(url)`
