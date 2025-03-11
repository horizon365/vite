# HMR `hotUpdate` 플러그인 후크

::: tip Feedback
[환경 API 피드백 토론](https://github.com/vitejs/vite/discussions/16358) 에서 피드백을 제공하십시오
:::

우리는 [환경 API](/ko/guide/api-environment.md) 인식을 위해 [`hotUpdate` 후크를](/ko/guide/api-environment#the-hotupdate-hook) 선호하여 `handleHotUpdate` 플러그인 후크를 더 이상 사용하지 않고 `create` 및 `delete` 으로 추가 시계 이벤트를 처리 할 계획입니다.

영향을받는 범위 : `Vite Plugin Authors`

::: warning Future Deprecation
`hotUpdate` `v6.0` 에서 처음 소개되었습니다. `handleHotUpdate` 의 감가 상각은 `v7.0` 대해 계획됩니다. 우리는 아직 `handleHotUpdate` 에서 멀리 이사하는 것이 좋습니다. 실험하고 피드백을 제공하려면 VITE 구성에서 `future.removePluginHookHandleHotUpdate` ~ `"warn"` 사용할 수 있습니다.
:::

## 동기 부여

[`handleHotUpdate` 후크를](/ko/guide/api-plugin.md#handlehotupdate) 사용하면 사용자 정의 HMR 업데이트 처리를 수행 할 수 있습니다. 업데이트 할 모듈 목록은 `HmrContext` 에 전달됩니다.

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

이 후크는 모든 환경에서 한 번 호출되며 전달 된 모듈에는 클라이언트 및 SSR 환경에서만 혼합 된 정보가 있습니다. 프레임 워크가 사용자 정의 환경으로 이동하면 각각의 새로운 후크가 필요합니다.

새로운 `hotUpdate` 후크는 `handleHotUpdate` 과 같은 방식으로 작동하지만 각 환경마다 호출되며 새로운 `HotUpdateOptions` 인스턴스를받습니다.

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

현재 DEV 환경은 `this.environment` 있는 다른 플러그인 후크에서와 같이 액세스 할 수 있습니다. `modules` 목록은 이제 현재 환경의 모듈 노드입니다. 각 환경 업데이트는 다른 업데이트 전략을 정의 할 수 있습니다.

이 후크는 이제 추가 시계 이벤트를 위해 요구됩니다 `'update'` `type` 사용하여 차별화하십시오.

## 마이그레이션 가이드

HMR이 더 정확하도록 영향을받는 모듈 목록을 필터링하고 좁 힙니다.

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// 마이그레이션 :

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

빈 배열을 반환하고 전체 재 장전을 수행하십시오.

```js
handleHotUpdate({ server, modules, timestamp }) {
  // 수동으로 무효화 모듈
  const invalidatedModules = new Set()
  for (const mod of modules) {
    server.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  server.ws.send({ type: 'full-reload' })
  return []
}

// 마이그레이션 :

hotUpdate({ modules, timestamp }) {
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

빈 배열을 반환하고 클라이언트에 사용자 정의 이벤트를 보내서 완전한 사용자 정의 HMR 처리를 수행하십시오.

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// 마이그레이션 ...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
