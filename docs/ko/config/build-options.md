# 옵션 빌드

언급되지 않는 한,이 섹션의 옵션은 빌드에만 적용됩니다.

## build.target

- **유형 :** `문자열 | 문자열 []`
- **기본값 :** `'modules'`
- **관련 :** [브라우저 호환성](/ko/guide/build#browser-compatibility)

최종 번들의 브라우저 호환성 대상. 기본값은 [기본 ES 모듈](https://caniuse.com/es6-module) , [기본 ESM 동적 가져 오기](https://caniuse.com/es6-module-dynamic-import) 및 [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) 지원을 갖춘 브라우저를 대상으로하는 Vite Special 값 `'modules'` 입니다. Vite는 `'modules'` ~ `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']` 대체합니다

또 다른 특별 값은 `'esnext'` 입니다. 이는 기본 동적 수입 지원을 가정하고 최소한의 전환 만 수행합니다.

변환은 Esbuild로 수행되며 값은 유효한 [Esbuild 대상 옵션](https://esbuild.github.io/api/#target) 이어야합니다. 사용자 정의 대상은 ES 버전 (예 : `es2015` ), 버전이있는 브라우저 (예 : `chrome58` ) 또는 여러 대상 문자열이 될 수 있습니다.

참고 코드에 Esbuild가 안전하게 변환 할 수없는 기능이 포함되어 있으면 빌드가 실패합니다. 자세한 내용은 [Esbuild 문서를](https://esbuild.github.io/content-types/#javascript) 참조하십시오.

## build.modulePreload

- **유형 :** `부울 | {polyfill? : boolean, resolvedependencies? : resolveModulePreloaddependenciesfn}`
- **기본값 :** `{ polyfill: true }`

기본적으로 [모듈 예압 폴리 필이](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) 자동으로 주입됩니다. 폴리 필은 각각의 `index.html` 항목의 프록시 모듈에 자동 주입됩니다. 빌드가 `build.rollupOptions.input` 통해 비 HTML 사용자 정의 항목을 사용하도록 구성된 경우 사용자 정의 항목에서 PolyFill을 수동으로 가져와야합니다.

```js
import 'vite/modulepreload-polyfill'
```

참고 : 폴리 필은 [라이브러리 모드](/ko/guide/build#library-mode) 에는 적용되지 **않습니다** . 기본 동적 가져 오기없이 브라우저를 지원 해야하는 경우 라이브러리에서 사용하지 않아야합니다.

폴리 필은 `{ polyfill: false }` 사용하여 비활성화 할 수 있습니다.

각 동적 가져 오기에 대해 예압 할 청크 목록은 Vite에 의해 계산됩니다. 기본적으로 이러한 종속성을로드 할 때 `base` 포함한 절대 경로가 사용됩니다. `base` 이 상대 ( `''` 또는 `'./'` ) 인 경우, `import.meta.url` 최종 배포 된베이스에 의존하는 절대 경로를 피하기 위해 런타임에 사용됩니다.

종속성 목록과 `resolveDependencies` 기능을 사용한 경로에 대한 미세한 제어에 대한 실험적 지원이 있습니다. [피드백을 제공하십시오](https://github.com/vitejs/vite/discussions/13841) . 유형 `ResolveModulePreloadDependenciesFn` 의 함수를 기대합니다.

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    hostId: string
    hostType: 'html' | 'js'
  },
) => string[]
```

`resolveDependencies` 함수는 각각의 동적 가져 오기에 따라 달라지며, 청크 목록에 따라 달라지며 Entry HTML 파일에서 가져온 각 청크마다 호출됩니다. 이 필터링 된 또는 더 많은 종속성을 주입하여 새로운 종속성 배열을 반환 할 수 있고 그 경로는 수정 될 수 있습니다. `deps` 경로는 `build.outDir` 와 관련이 있습니다. 반환 값은 `build.outDir` 에 대한 상대 경로 여야합니다.

```js twoslash
/** @Type {import ( 'vite'). UserConfig} */
const config = {
  // 더 예쁘다
  build: {
    // --- 전기 ---
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        return deps.filter(condition)
      },
    },
    // --- Cut-after ---
  },
}
```

해결 된 종속성 경로는 [`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options) 사용하여 추가로 수정 될 수 있습니다.

## build.polyfillModulePreload

- **유형 :** `boolean`
- **기본값 :** `true`
- 대신 더 이상 **사용되지 않은** 사용 `build.modulePreload.polyfill`

[모듈 예압 폴리 필드를](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) 자동으로 주입할지 여부.

## build.outDir

- **유형 :** `string`
- **기본값 :** `dist`

출력 디렉토리를 지정하십시오 ( [프로젝트 루트](/ko/guide/#index-html-and-project-root) 와 관련하여).

## build.assetsDir

- **유형 :** `string`
- **기본값 :** `assets`

아래에서 디렉토리에서 네스트 생성 자산을 지정하십시오 ( `build.outDir` 에 비해, 이것은 [라이브러리 모드](/ko/guide/build#library-mode) 에서 사용되지 않음).

## build.assetsInlineLimit

- **유형 :** `number` | `((FilePath : 문자열, 내용 : 버퍼) => 부울 | 정의되지 않은)`
- **기본값 :** `4096` (4 KIB)

이 임계 값보다 작은 수입 또는 참조 자산은 추가 HTTP 요청을 피하기 위해 Base64 URL로 인쇄됩니다. 인라인을 모두 비활성화하려면 `0` 으로 설정하십시오.

콜백이 통과되면 부울을 옵트 인 또는 옵트 아웃으로 되돌릴 수 있습니다. 아무것도 반환되지 않으면 기본 논리가 적용됩니다.

Git LFS 자리 표시자는 그들이 나타내는 파일의 내용을 포함하지 않기 때문에 인라인에서 자동으로 제외됩니다.

::: tip Note
0을 지정하면 파일 크기 나 GIT LFS 자리 표시 자에 관계없이 `build.lib` , `build.assetsInlineLimit` 무시되고 자산은 항상 상환됩니다.
:::

## build.cssCodeSplit

- **유형 :** `boolean`
- **기본값 :** `true`

CSS 코드 분할 활성화/비활성화. 활성화되면 Async JS 청크로 가져온 CSS는 청크로 보존되고 청크를 가져 오면 함께 가져옵니다.

비활성화 된 경우 전체 프로젝트의 모든 CSS는 단일 CSS 파일로 추출됩니다.

::: tip Note
`build.lib` 지정하면 `build.cssCodeSplit` 기본값으로 `false` 됩니다.
:::

## build.cssTarget

- **유형 :** `문자열 | 문자열 []`
- **기본값 :** [`build.target`](#build-target) 과 동일합니다

이 옵션을 사용하면 사용자가 JavaScript 변환에 사용되는 CSS 미니 화를위한 다른 브라우저 대상을 설정할 수 있습니다.

비 메인 스트림 브라우저를 타겟팅 할 때만 사용해야합니다.
한 가지 예는 대부분의 최신 JavaScript 기능을 지원하지만 [CSS의 `#RGBA` 16 진수 색상 표기법은](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb_colors) 아닙니다.
이 경우 Vite가 `rgba()` `#RGBA` 으로 변환되는 것을 방지하려면 `build.cssTarget` ~ `chrome61` 설정해야합니다.

## build.cssMinify

- **유형 :** `부울 | 'Esbuild' | 'lightningcs'
- **기본값 :** 클라이언트의 경우 [`build.minify`](#build-minify) 과 동일, SSR의 경우 `'esbuild'`

이 옵션을 사용하면 사용자가 `build.minify` 으로 기본값 대신 CSS 미니 화를 구체적으로 재정의 할 수 있으므로 JS 및 CSS의 미니 화를 개별적으로 구성 할 수 있습니다. Vite는 기본적으로 `esbuild` 사용하여 CSS를 조정합니다. 대신 [번개 CSS를](https://lightningcss.dev/minification.html) 사용하려면 옵션을 `'lightningcss'` 로 설정하십시오. 선택한 경우 [`css.lightningcss`](./shared-options.md#css-lightningcss) 사용하여 구성 할 수 있습니다.

## build.sourcemap

- **유형 :** `부울 | '인라인' | 'hidden' '
- **기본값 :** `false`

생산 소스 맵을 생성합니다. `true` 이면 별도의 SourcEmap 파일이 생성됩니다. `'inline'` 이면 Sourcemap은 결과 출력 파일에 데이터 URI로 추가됩니다. `'hidden'` 번들 파일의 해당 Sourcemap 주석을 억제한다는 점을 제외하고 `true` 같이 작동합니다.

## build.rollupOptions

- **유형 :** [`RollupOptions`](https://rollupjs.org/configuration-options/)

기본 롤업 번들을 직접 사용자 정의하십시오. 롤업 구성 파일에서 내보낼 수있는 옵션과 동일하며 Vite의 내부 롤업 옵션과 병합됩니다. 자세한 내용은 [롤업 옵션 문서를](https://rollupjs.org/configuration-options/) 참조하십시오.

## build.commonjsOptions

- **유형 :** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

[@Rollup/Plugin-Commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) 로 전달할 수있는 옵션.

## build.dynamicImportVarsOptions

- **유형 :** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)
- **관련 :** [동적 수입](/ko/guide/features#dynamic-import)

[@Rollup/Plugin-Dynamic-Import-VARS](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars) 로 전달하는 옵션.

## build.lib

- **유형 :** `{Entry : String | 끈[] | {[Entryalias : String] : String}, name? : String, formats? : ( 'es' | 'CJS' | 'umd' | 'iife') [], filename? : 문자열 | ((형식 : moduleformat, enthremname : string) => string), cssfilename? : String}`
- **관련 :** [라이브러리 모드](/ko/guide/build#library-mode)

라이브러리로 구축하십시오. 라이브러리는 HTML을 항목으로 사용할 수 없으므로 `entry` 필요합니다. `name` 노출 된 글로벌 변수이며 `formats` `'umd'` 또는 `'iife'` 포함 할 때 필요합니다. 기본 `formats` 여러 항목을 사용하는 경우 `['es', 'umd']` 또는 `['es', 'cjs']` 입니다.

`fileName` 은 패키지 파일 출력의 이름이며, 이는 `package.json` 에서 `"name"` 에서 기본값을 얻습니다. 또한 `format` 과 `entryName` 인수로 취하고 파일 이름을 반환하는 함수로 정의 할 수 있습니다.

패키지가 CSS를 가져 오면 `cssFileName` 사용하여 CSS 파일 출력의 이름을 지정할 수 있습니다. 문자열을 설정하면 기본값 `fileName` 과 동일한 값으로 기본적으로 1과 동일한 값으로 기본적으로 3 in `package.json` 에서 `"name"` 로 떨어집니다.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/main.js'],
      fileName: (format, entryName) => `my-lib-${entryName}.${format}.js`,
      cssFileName: 'my-lib-style',
    },
  },
})
```

## build.manifest

- **유형 :** `부울 | 문자열 '
- **기본값 :** `false`
- **관련 :** [백엔드 통합](/ko/guide/backend-integration)

호화되지 않은 자산 파일 이름을 해시 버전에 매핑하는 매니페스트 파일을 생성할지 여부는 서버 프레임 워크에서 올바른 자산 링크를 렌더링하는 데 사용할 수 있습니다.

값이 문자열 인 경우 `build.outDir` 에 대한 매니페스트 파일 경로로 사용됩니다. `true` 으로 설정하면 경로는 `.vite/manifest.json` 입니다.

## build.ssrManifest

- **유형 :** `부울 | 문자열 '
- **기본값 :** `false`
- **관련 :** [서버 측 렌더링](/ko/guide/ssr)

스타일 링크를 결정하기 위해 SSR Manifest 파일을 생성할지 제작시 구역 지침을 결정할 것인지 여부.

값이 문자열 인 경우 `build.outDir` 에 대한 매니페스트 파일 경로로 사용됩니다. `true` 으로 설정하면 경로는 `.vite/ssr-manifest.json` 입니다.

## build.ssr

- **유형 :** `부울 | 문자열 '
- **기본값 :** `false`
- **관련 :** [서버 측 렌더링](/ko/guide/ssr)

SSR 지향 빌드를 생산합니다. 값은 `rollupOptions.input` 통해 SSR 항목을 지정 해야하는 SSR 항목을 직접 지정하는 `true` 일 수 있습니다.

## build.emitAssets

- **유형 :** `boolean`
- **기본값 :** `false`

비 클라이언트 빌드 중에는 정적 자산이 클라이언트 빌드의 일부로 방출 될 것으로 가정하여 방출되지 않습니다. 이 옵션을 사용하면 프레임 워크가 다른 환경 구축에서이를 방출 할 수 있습니다. 자산을 포스트 빌드 단계와 병합하는 것은 프레임 워크의 책임입니다.

## build.ssrEmitAssets

- **유형 :** `boolean`
- **기본값 :** `false`

SSR 빌드 중에는 정적 자산이 클라이언트 빌드의 일부로 방출 될 것으로 가정하여 방출되지 않습니다. 이 옵션을 사용하면 프레임 워크가 클라이언트와 SSR 빌드 모두에서이를 방출 할 수 있습니다. 자산을 포스트 빌드 단계와 병합하는 것은 프레임 워크의 책임입니다. 이 옵션은 환경 API가 안정되면 `build.emitAssets` 으로 대체됩니다.

## build.minify

- **유형 :** `부울 | 'Terser' | 'Esbuild'
- **기본값 :** 클라이언트 빌드의 경우 `'esbuild'` , SSR 빌드의 경우 `false`

미니 화를 비활성화하려면 `false` 으로 설정하거나 사용할 미니 파이어를 지정하십시오. 기본값은 Terser보다 20 ~ 40 배 빠르고 압축은 1 ~ 2% 더 나쁜 [Esbuild](https://github.com/evanw/esbuild) 입니다. [벤치 마크](https://github.com/privatenumber/minification-benchmarks)

참고 `build.minify` 옵션은 순수한 주석을 제거하고 나무 흔들림을 깨뜨리기 때문에 LIB 모드에서 `'es'` 형식을 사용할 때 공백을 최소화하지 않습니다.

Terser는 `'terser'` 으로 설정되면 설치해야합니다.

```sh
npm add -D terser
```

## build.terserOptions

- **유형 :** `TerserOptions`

Terser에게 전달할 [옵션을 추가로 최소화합니다](https://terser.org/docs/api-reference#minify-options) .

또한 `maxWorkers: number` 옵션을 전달하여 스폰 할 최대의 작업자 수를 지정할 수도 있습니다. 기본값은 CPU 마이너스 수로 1입니다.

## build.write

- **유형 :** `boolean`
- **기본값 :** `true`

번들을 디스크에 비활성화하려면 `false` 으로 설정하십시오. 이것은 주로 디스크에 쓰기 전에 번들의 추가 포스트 처리가 필요한 [프로그램 `build()` 호출](/ko/guide/api-javascript#build) 에 주로 사용됩니다.

## build.emptyOutDir

- **유형 :** `boolean`
- **기본값 :** `true` 이면 `outDir` 이면 `root` 인 경우 0

기본적으로 Vite는 프로젝트 루트 내부에있는 경우 빌드에서 `outDir` 비 웁니다. 실수로 중요한 파일을 제거하지 않기 위해 `outDir` 루트 외부에 있으면 경고를 방출합니다. 경고를 억제하기 위해이 옵션을 명시 적으로 설정할 수 있습니다. 명령 줄을 통해 `--emptyOutDir` 로 사용할 수 있습니다.

## build.copyPublicDir

- **유형 :** `boolean`
- **기본값 :** `true`

기본적으로 VITE는 `publicDir` 에서 빌드시 `outDir` 로 파일을 복사합니다. 이것을 비활성화하려면 `false` 로 설정하십시오.

## build.reportCompressedSize

- **유형 :** `boolean`
- **기본값 :** `true`

GZIP 압축 크기보고를 활성화/비활성화합니다. 대형 출력 파일을 압축하는 것은 느려질 수 있으므로 비활성화하면 대규모 프로젝트의 빌드 성능이 향상 될 수 있습니다.

## build.chunkSizeWarningLimit

- **유형 :** `number`
- **기본값 :** `500`

청크 크기 경고 제한 (KB). [JavaScript 크기 자체가 실행 시간과 관련이 있으므로](https://v8.dev/blog/cost-of-javascript-2019) 압축되지 않은 청크 크기와 비교됩니다.

## build.watch

- **유형 :** [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch)| NULL`
- **기본값 :** `null`

롤업 감시자를 활성화하려면 `{}` 으로 설정하십시오. 이는 주로 빌드 전용 플러그인 또는 통합 프로세스가 포함 된 경우 주로 사용됩니다.

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

파일 시스템 시청이 WSL2에서 작동하지 않는 경우가 있습니다.
자세한 내용은 [`server.watch`](./server-options.md#server-watch) 참조하십시오.

:::
