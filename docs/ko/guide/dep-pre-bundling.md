# 의존성 사전 묶음

처음으로 `vite` 실행하면 Vite는 사이트를 로컬로로드하기 전에 프로젝트 종속성을 사전 번에 넣습니다. 기본적으로 자동 및 투명하게 수행됩니다.

## 그 이유

이것은 우리가 "종속성 사전 묶음"이라고 부르는 것을 수행하는 vite입니다. 이 프로세스는 두 가지 목적을 제공합니다.

1. **CommonJS 및 UMD 호환성 :** 개발 중에 Vite의 Dev는 모든 코드를 기본 ESM으로 제공합니다. 따라서 Vite는 CommonJS 또는 UMD로 배송되는 종속성을 먼저 ESM으로 변환해야합니다.

   CommonJS 종속성을 변환 할 때 Vite는 SMART 가져 오기 분석을 수행하여 CommonJS 모듈로 이름이 지정된 수출이 동적으로 지정된 경우에도 예상대로 작동하도록 (예 : REACT) :

   ```js
   // 예상대로 작동합니다
   import React, { useState } from 'react'
   ```

2. **성능 :** Vite는 많은 내부 모듈로 ESM 종속성을 단일 모듈로 변환하여 후속 페이지로드 성능을 향상시킵니다.

   일부 패키지는 ES 모듈을 배송하여 서로를 가져 오는 별도의 파일만큼 구축합니다. 예를 들어, [`lodash-es` 에는 600 개가 넘는 내부 모듈이 있습니다](https://unpkg.com/browse/lodash-es/) ! 우리가 `import { debounce } from 'lodash-es'` 할 때, 브라우저는 600 개 이상의 HTTP 요청을 동시에 발사합니다! 서버가 처리하는 데 아무런 문제가 없지만 많은 양의 요청이 브라우저 측에 네트워크 혼잡을 생성하여 페이지가 눈에 띄게 느려집니다.

   단일 모듈에 `lodash-es` 사전 묶어서 대신 하나의 http 요청 만 필요합니다!

::: tip NOTE
종속성 사전 묶음은 개발 모드에서만 적용되며 `esbuild` 사용하여 종속성을 ESM으로 변환합니다. 생산 빌드에서는 `@rollup/plugin-commonjs` 대신 사용됩니다.
:::

## 자동 의존성 발견

기존 캐시를 찾을 수없는 경우 Vite는 소스 코드를 크롤링하고 자동으로 종속성 가져 오기 (예 : `node_modules` 에서 해결 될 것으로 예상되는 "베어 가져 오기")를 자동으로 발견하고 이러한 발견 된 가져 오기를 사전 번들의 진입 지점으로 사용합니다. 사전 묶음은 `esbuild` 으로 수행되므로 일반적으로 매우 빠릅니다.

서버가 이미 시작된 후, 캐시에 전혀없는 새로운 종속성 가져 오기가 발생하면 Vite는 DEP 번들링 프로세스를 다시 실행하고 필요한 경우 페이지를 다시로드합니다.

## 모노 포도 및 링크 된 종속성

Monorepo 설정에서 의존성은 동일한 리포에서 링크 된 패키지 일 수 있습니다. Vite는 `node_modules` 에서 해결되지 않은 종속성을 자동으로 감지하고 연결된 DEP를 소스 코드로 취급합니다. 링크 된 DEP를 번들로 묶으려고 시도하지 않으며 대신 링크 된 DEP의 종속성 목록을 분석합니다.

그러나이를 위해서는 링크 된 DEP를 ESM으로 내보내야합니다. 그렇지 않은 경우 구성에서 종속성을 [`optimizeDeps.include`](/ko/config/dep-optimization-options.md#optimizedeps-include) 과 [`build.commonjsOptions.include`](/ko/config/build-options.md#build-commonjsoptions) 에 추가 할 수 있습니다.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
// ---자르다---
export default defineConfig({
  optimizeDeps: {
    include: ['linked-dep'],
  },
  build: {
    commonjsOptions: {
      include: [/linked-dep/, /node_modules/],
    },
  },
})
```

링크 된 DEP를 변경할 때는 변경 사항이 적용되도록 `--force` 명령 줄 옵션으로 개발자 서버를 다시 시작하십시오.

## 행동을 사용자 정의합니다

기본 종속성 검색 휴리스틱이 항상 바람직하지는 않습니다. 목록에서 종속성을 명시 적으로 포함/제외하려는 경우 [`optimizeDeps` 구성 옵션을](/ko/config/dep-optimization-options.md) 사용하십시오.

`optimizeDeps.include` 또는 `optimizeDeps.exclude` 의 일반적인 사용 사례는 소스 코드에서 직접 발견 할 수없는 가져 오기가있을 때입니다. 예를 들어, 플러그인 변환의 결과로 가져 오기가 생성 될 수 있습니다. 이는 Vite가 초기 스캔에서 가져 오기를 발견 할 수 없음을 의미합니다. 브라우저에서 파일을 요청하고 변환 한 후에 만 발견 할 수 있습니다. 이로 인해 서버가 시작된 후 서버가 즉시 다시 번들로 연결됩니다.

`include` 과 `exclude` 모두 사용하여이를 처리 할 수 있습니다. 의존성이 크고 (많은 내부 모듈이있는) CommonJS 인 경우 포함해야합니다. 종속성이 작고 이미 유효한 ESM 인 경우,이를 제외하고 브라우저에 직접로드하도록 할 수 있습니다.

[`optimizeDeps.esbuildOptions` 옵션](/ko/config/dep-optimization-options.md#optimizedeps-esbuildoptions) 으로 Esbuild를 추가로 사용자 정의 할 수도 있습니다. 예를 들어, Esbuild 플러그인을 추가하여 종속성에서 특수 파일을 처리하거나 [빌드를 변경합니다 `target`](https://esbuild.github.io/api/#target) .

## 캐싱

### 파일 시스템 캐시

Vite는 사전 구매 의존성을 `node_modules/.vite` 으로 캐시합니다. 몇 가지 소스를 기반으로 사전 구매 단계를 다시 실행 해야하는지 여부를 결정합니다.

- 패키지 관리자 잠금 컨텐츠, 예를 들어 `package-lock.json` , `yarn.lock` , `pnpm-lock.yaml` 또는 `bun.lockb` .
- 패치 폴더 수정 시간.
- 현재 `vite.config.js` 의 관련 필드.
- `NODE_ENV` 값.

사전 묶음 단계는 위의 중 하나가 변경된 경우에만 다시 실행하면됩니다.

어떤 이유로 vite가 DEP를 다시 번들로 재건하도록하려면 `--force` 명령 줄 옵션으로 DEV 서버를 시작하거나 `node_modules/.vite` 캐시 디렉토리를 수동으로 삭제할 수 있습니다.

### 브라우저 캐시

해결 된 종속성 요청은 HTTP 헤더 `max-age=31536000,immutable` 으로 강력하게 캐시되어 DEV 동안 페이지 재 장전 성능을 향상시킵니다. 일단 캐시되면, 이러한 요청은 Dev 서버에 다시는 적용되지 않습니다. 다른 버전이 설치된 경우 (패키지 관리자 Lockfile에 반영됨) 추가 버전 쿼리에 의해 자동 무효화됩니다. 로컬 편집을 통해 종속성을 디버깅하려면 다음을 수행 할 수 있습니다.

1. 브라우저 DevTools의 네트워크 탭을 통해 캐시를 일시적으로 비활성화합니다.
2. `--force` 플래그로 Vite Dev 서버를 다시 시작하여 DEP를 다시 번들로 묶습니다.
3. 페이지를 다시로드하십시오.
