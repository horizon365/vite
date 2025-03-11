# DEP 최적화 옵션

- **관련 :** [의존성 사전 묶음](/ko/guide/dep-pre-bundling)

언급되지 않는 한,이 섹션의 옵션은 Dev에서만 사용되는 종속성 최적화에만 적용됩니다.

## optimizeDeps.entries

- **유형 :** `문자열 | 문자열 []`

기본적으로 Vite는 모든 `.html` 파일을 크롤링하여 사전 구매 해야하는 종속성을 감지합니다 ( `node_modules` , `build.outDir` , `__tests__` 및 `coverage` 무시). `build.rollupOptions.input` 지정되면 Vite는 대신 해당 진입 지점을 기어 다닙니다.

이러한 요구에 맞지 않으면이 옵션을 사용하여 사용자 정의 항목을 지정할 수 있습니다. 값은 Vite Project Root의 상대적인 [`tinyglobby` 패턴](https://github.com/SuperchupuDev/tinyglobby) 또는 패턴 배열이어야합니다. 기본 항목 추론을 덮어 씁니다. `optimizeDeps.entries` 명시 적으로 정의되면 기본적으로 `node_modules` 과 `build.outDir` 폴더만이 무시됩니다. 다른 폴더를 무시 해야하는 경우 초기 `!` 로 표시된 항목 목록의 일부로 무시 패턴을 사용할 수 있습니다. `node_modules` 와 `build.outDir` 무시하지 않으려면 대신 문자 그대로 문자열 경로 ( `tinyglobby` 패턴없이)를 사용하여 지정할 수 있습니다.

## optimizeDeps.exclude

- **유형 :** `string[]`

사전 묶음에서 제외 할 의존성.

:::warning CommonJS
CommonJS 종속성은 최적화에서 제외되어서는 안됩니다. ESM 종속성이 최적화에서 제외되지만 중첩 된 CommonJS 종속성을 갖는 경우 CommonJS 의존성을 `optimizeDeps.include` 에 추가해야합니다. 예:

```js twoslash
import { defineConfig } from 'vite'
// ---자르다---
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include

- **유형 :** `string[]`

기본적으로 `node_modules` 이 아닌 링크 된 패키지는 사전 구매되지 않습니다. 이 옵션을 사용하여 링크 된 패키지를 사전 구매하도록 강요하십시오.

**실험 :** 심층 수입이 많은 라이브러리를 사용하는 경우 후행 글로벌 패턴을 지정하여 한 번에 모든 심층 가져 오기를 사전 할 수 있습니다. 이것은 새로운 심층 수입이 사용될 때마다 끊임없이 사전 홀딩을 피할 수 있습니다. [피드백을 제공하십시오](https://github.com/vitejs/vite/discussions/15833) . 예를 들어:

```js twoslash
import { defineConfig } from 'vite'
// ---자르다---
export default defineConfig({
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
})
```

## optimizeDeps.esbuildOptions

- **유형 :** [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) `<` [`EsbuildBuildOptions`](https://esbuild.github.io/api/#general-options) ,
  | '묶음'
  | '입장 포인트'
  | '외부'
  | '쓰다'
  | '보다'
  | '아웃 디르'
  | 'Outfile'
  | '아웃베이스'
  | '외래성'
  | 'metafile'>`

DEP 스캔 및 최적화 중에 Esbuild로 전달할 수있는 옵션.

변경은 Vite의 DEP 최적화와 호환되지 않기 때문에 특정 옵션이 생략됩니다.

- `external` 도 생략되며 Vite의 `optimizeDeps.exclude` 옵션을 사용하십시오
- `plugins` Vite의 DEP 플러그인과 병합됩니다

## optimizeDeps.force

- **유형 :** `boolean`

이전에 캐시 된 최적화 된 종속성을 무시하고 의존성 사전 묶음을 강제하기 위해 `true` 으로 설정하십시오.

## optimizeDeps.holdUntilCrawlEnd

- **실험 :** [피드백을 제공합니다](https://github.com/vitejs/vite/discussions/15834)
- **유형 :** `boolean`
- **기본값 :** `true`

활성화되면 콜드 스타트에서 모든 정적 가져 오기가 크롤링 될 때까지 최초의 최적화 된 DEP 결과를 유지합니다. 이것은 새로운 종속성이 발견되고 새로운 공통 청크의 생성을 유발할 때 전체 페이지 재 장전이 필요하지 않습니다. 스캐너에 대한 모든 종속성과 명시 적으로 정의 된 종속성을 `include` 으로 찾으면 브라우저가 더 많은 요청을 병렬로 처리하도록이 옵션을 비활성화하는 것이 좋습니다.

## optimizeDeps.disabled

- **더 이상 사용되지 않았습니다**
- **실험 :** [피드백을 제공합니다](https://github.com/vitejs/vite/discussions/13839)
- **유형 :** `부울 | '짓다' | 'Dev'
- **기본값 :** `'build'`

이 옵션은 더 이상 사용되지 않습니다. Vite 5.1 기준으로 빌드 중에 의존성 사전 묶음이 제거되었습니다. `optimizeDeps.disabled` ~ `true` 또는 `'dev'` 설정하면 최적화기가 비활성화되고 `false` 또는 `'build'` 로 구성된 Dev 활성화 중 최적화를 남겨 둡니다.

Optimizer를 완전히 비활성화하려면 `optimizeDeps.noDiscovery: true` 사용하여 종속성의 자동 검색을 허용하지 않고 정의되지 않거나 `optimizeDeps.include` 두십시오.

:::warning
빌드 시간 동안 종속성을 최적화하는 것은 **실험적인** 기능이었습니다. 이 전략을 시도한 프로젝트도 `build.commonjsOptions: { include: [] }` 사용하여 `@rollup/plugin-commonjs` 제거했습니다. 그렇게한다면 경고를 통해 번들링하는 동안 CJS 전용 패키지를 지원하도록 다시 활성화 할 수 있습니다.
:::

## optimizeDeps.needsInterop

- **실험**
- **유형 :** `string[]`

이러한 종속성을 가져올 때 ESM Interop을 강제합니다. Vite는 종속성이 인터 로프가 필요한시기를 올바르게 감지 할 수 있으므로이 옵션은 일반적으로 필요하지 않습니다. 그러나 다른 종속성 조합으로 인해 일부 의존성 조합으로 인해 일부는 다르게 사전 번지를 줄 수 있습니다. 이 패키지를 `needsInterop` 에 추가하면 풀 페이지 재 장전을 피함으로써 콜드 스타트 속도를 높일 수 있습니다. 종속성 중 하나의 경우에 경고를받을 수 있으며 구성 의이 배열에 패키지 이름을 추가하라는 제안을합니다.
