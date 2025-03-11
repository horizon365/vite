# 빌드 중 공유 플러그인

::: tip Feedback
[환경 API 피드백 토론](https://github.com/vitejs/vite/discussions/16358) 에서 피드백을 제공하십시오
:::

[빌드 중에 공유 플러그인을](/ko/guide/api-environment.md#shared-plugins-during-build) 참조하십시오.

범위에 영향을 미칩니다 : `Vite Plugin Authors`

::: warning Future Default Change
`builder.sharedConfigBuild` `v6.0` 에서 처음 소개되었습니다. 플러그인이 공유 구성과 함께 작동하는 방법을 확인하도록 설정할 수 있습니다. 플러그인 생태계가 준비되면 향후 전공의 기본값 변경에 대한 피드백을 찾고 있습니다.
:::

## 동기 부여

Dev를 정렬하고 플러그인 파이프 라인을 빌드하십시오.

## 마이그레이션 가이드

환경에서 플러그인을 공유하려면 플러그인 상태를 현재 환경에서 키워야합니다. 다음 양식의 플러그인은 모든 환경에서 변환 된 모듈의 수를 계산합니다.

```js
function CountTransformedModulesPlugin() {
  let transformedModules
  return {
    name: 'count-transformed-modules',
    buildStart() {
      transformedModules = 0
    },
    transform(id) {
      transformedModules++
    },
    buildEnd() {
      console.log(transformedModules)
    },
  }
}
```

대신 각 환경에 대한 변환 된 모듈 수를 계산하려면지도를 유지해야합니다.

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    }
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

이 패턴을 단순화하려면 Vite는 `perEnvironmentState` 도우미를 내보내는 것을 내 보냅니다.

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = perEnvironmentState<{ count: number }>(() => ({ count: 0 }))
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state(this).count = 0
    }
    transform(id) {
      state(this).count++
    },
    buildEnd() {
      console.log(this.environment.name, state(this).count)
    }
  }
}
```
