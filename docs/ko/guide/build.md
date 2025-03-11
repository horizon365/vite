# 생산을위한 건축

생산을 위해 앱을 배포 할 때가되면 `vite build` 명령을 실행하십시오. 기본적으로 `<root>/index.html` 빌드 엔트리 포인트로 사용하고 정적 호스팅 서비스를 통해 제공되기에 적합한 응용 프로그램 번들을 생성합니다. 인기있는 서비스에 대한 가이드에 대한 [정적 사이트 배포를](./static-deploy) 확인하십시오.

## 브라우저 호환성

기본적으로, 프로덕션 번들은 [기본 ES 모듈](https://caniuse.com/es6-module) , [기본 ESM Dynamic Import](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [Nullish Coalescing](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) 및 [Bigint](https://caniuse.com/bigint) 와 같은 최신 JavaScript를 지원한다고 가정합니다. 기본 브라우저 지원 범위는 다음과 같습니다.

<!-- Search for the `ESBUILD_MODULES_TARGET` constant for more information -->

- 크롬> = 87
- Firefox> = 78
- 사파리> = 14
- 가장자리> = 88

[`build.target` 구성 옵션을](/ko/config/build-options.md#build-target) 통해 사용자 정의 대상을 지정할 수 있습니다. 여기서 가장 낮은 대상은 `es2015` 입니다. 더 낮은 대상이 설정되면 Vite는 [기본 ESM 동적 가져 오기](https://caniuse.com/es6-module-dynamic-import) 에 의존하므로 이러한 최소 브라우저 지원 범위와 [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) :

<!-- Search for the `defaultEsbuildSupported` constant for more information -->

- 크롬> = 64
- Firefox> = 67
- 사파리> = 11.1
- 가장자리> = 79

기본적으로 Vite는 구문 변환을 처리하고 **다료를 다루지 않습니다** . [https://cdnjs.cloudflare.com/polyfill/를](https://cdnjs.cloudflare.com/polyfill/) 확인할 수 있으며 사용자의 브라우저 Useragent String을 기반으로 PolyFill 번들을 자동으로 생성합니다.

레거시 브라우저는 [@vitejs/plugin legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) 를 통해 지원할 수 있으며,이 유산 청크 및 해당 ES 언어 기능 폴리 플릴을 자동으로 생성합니다. 레거시 청크는 조건부로로드되어 기본 ESM 지원이없는 브라우저에서만로드됩니다.

## 공공 기지 경로

- 관련 : [자산 처리](./assets)

중첩 된 공개 경로에서 프로젝트를 배포하는 경우 [`base` 구성 옵션을](/ko/config/shared-options.md#base) 지정하면 모든 자산 경로가 그에 따라 다시 작성됩니다. 이 옵션은 명령 줄 플래그 (예 : `vite build --base=/my/public/path/` 로 지정할 수도 있습니다.

JS- 임박한 자산 URL, CSS `url()` 참조 및 `.html` 파일의 자산 참조는 빌드 중에이 옵션을 존중하도록 자동으로 조정됩니다.

URL을 즉시 동적으로 연결 해야하는 경우는 예외입니다. 이 경우 공공 기지 경로가 될 전 세계 주입 된 `import.meta.env.BASE_URL` 변수를 사용할 수 있습니다. 참고이 변수는 빌드 중에 정적으로 교체되므로 정확히 AS-IS로 나타나야합니다 (예 : `import.meta.env['BASE_URL']` 작동하지 않습니다).

고급 기본 경로 제어는 [고급 기본 옵션을](#advanced-base-options) 확인하십시오.

### 상대 기반

기본 경로를 미리 알지 못하면 `"base": "./"` 또는 `"base": ""` 의 상대 기본 경로를 설정할 수 있습니다. 이렇게하면 생성 된 모든 URL이 각 파일과 관련이 있습니다.

:::warning Support for older browsers when using relative bases

상대 기지에는 `import.meta` 지원이 필요합니다. [`import.meta` 하지 않는 브라우저를](https://caniuse.com/mdn-javascript_operators_import_meta) 지원 해야하는 경우 [`legacy` 플러그인을](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) 사용할 수 있습니다.

:::

## 빌드 사용자 정의

빌드는 다양한 [빌드 구성 옵션을](/ko/config/build-options.md) 통해 사용자 정의 할 수 있습니다. 특히 `build.rollupOptions` 통해 기본 [롤업 옵션을](https://rollupjs.org/configuration-options/) 직접 조정할 수 있습니다.

```js [vite.config.js]
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

예를 들어, 빌드 중에만 적용되는 플러그인으로 여러 롤업 출력을 지정할 수 있습니다.

## 청킹 전략

청크가 `build.rollupOptions.output.manualChunks` 사용하여 분할되는 방법을 구성 할 수 있습니다 ( [롤업 문서](https://rollupjs.org/configuration-options/#output-manualchunks) 참조). 프레임 워크를 사용하는 경우 청크 분할 방법을 구성하려면 문서를 참조하십시오.

## 로드 오류 처리

Vite는 동적 가져 오기를로드하지 않으면 `vite:preloadError` 이벤트를 방출합니다. `event.payload` 원래 가져 오기 오류가 포함되어 있습니다. `event.preventDefault()` 호출하면 오류가 발생하지 않습니다.

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // 예를 들어 페이지를 새로 고치십시오
})
```

새 배포가 발생하면 호스팅 서비스가 이전 배포에서 자산을 삭제할 수 있습니다. 결과적으로 새 배포 전에 사이트를 방문한 사용자가 가져 오기 오류가 발생할 수 있습니다. 이 오류는 해당 사용자의 장치에서 실행되는 자산이 구식이며 해당 이전 청크를 가져 오려고 시도하여 삭제됩니다. 이 이벤트는이 상황을 해결하는 데 유용합니다.

## 파일 변경에 대한 재 구축

`vite build --watch` 으로 롤업 감시자를 활성화 할 수 있습니다. 또는 `build.watch` 통해 기본 [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) 직접 조정할 수 있습니다.

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

`--watch` 플래그가 활성화되면 `vite.config.js` 의 변경 사항과 번들로 연결되는 파일이 변경되면 재 구축이 트리거됩니다.

## 다중 페이지 앱

다음과 같은 소스 코드 구조가 있다고 가정합니다.

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Dev 동안 단순히 `/nested/` 으로 탐색하거나 링크합니다. 일반적인 정적 파일 서버와 마찬가지로 예상대로 작동합니다.

빌드 중에 여러 `.html` 파일을 진입 지점으로 지정하면됩니다.

```js twoslash [vite.config.js]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

다른 루트를 지정하면 입력 경로를 해결할 때 `__dirname` 여전히 vite.config.js 파일의 폴더가 될 것임을 기억하십시오. 따라서 `resolve` 에 대한 인수에 `root` 항목을 추가해야합니다.

HTML 파일의 경우 Vite는 `rollupOptions.input` 개체의 항목에 주어진 이름을 무시하고 Dist 폴더에서 HTML 자산을 생성 할 때 파일의 해결 된 ID를 존중합니다. 이를 통해 DEV 서버의 작동 방식과 일관된 구조를 보장합니다.

## 라이브러리 모드

브라우저 지향 라이브러리를 개발할 때는 실제 라이브러리를 가져 오는 테스트/데모 페이지에서 대부분의 시간을 소비 할 수 있습니다. Vite를 사용하면 해당 목적으로 `index.html` 을 사용하여 원활한 개발 경험을 얻을 수 있습니다.

배포를 위해 라이브러리를 묶을 시간이되면 [`build.lib` 구성 옵션을](/ko/config/build-options.md#build-lib) 사용하십시오. 도서관에 번들로 묶고 싶지 않은 종속성을 외부화하십시오 (예 : `vue` 또는 `react` ).

::: code-group

```js twoslash [vite.config.js (single entry)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // 적절한 연장이 추가됩니다
      fileName: 'my-lib',
    },
    rollupOptions: {
      // 번들로 사용해서는 안되는 DEP를 외부화해야합니다
      // 도서관으로
      external: ['vue'],
      output: {
        // UMD 빌드에 사용할 전역 변수를 제공하십시오
        // 외부화 된 dep
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (multiple entries)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        secondary: resolve(__dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rollupOptions: {
      // 번들로 사용해서는 안되는 DEP를 외부화해야합니다
      // 도서관으로
      external: ['vue'],
      output: {
        // UMD 빌드에 사용할 전역 변수를 제공하십시오
        // 외부화 된 dep
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

항목 파일에는 패키지 사용자가 가져올 수있는 내보내기가 포함됩니다.

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

이 구성으로 `vite build` 실행하면 라이브러리를 배송하는 롤업 사전 설정을 사용하고 두 개의 번들 형식을 생성합니다.

- `es` 및 `umd` (단일 항목의 경우)
- `es` 및 `cjs` (여러 항목의 경우)

형식은 [`build.lib.formats`](/ko/config/build-options.md#build-lib) 옵션으로 구성 할 수 있습니다.

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

귀하의 LIB에 `package.json` :

::: code-group

```json [package.json (single entry)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (multiple entries)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### CSS 지원

라이브러리가 CSS를 가져 오면 빌드 된 JS 파일 외에 단일 CSS 파일 (예 : `dist/my-lib.css` 으로 번들로 연결됩니다. 이름은 기본값이 `build.lib.fileName` 으로 표시되지만 [`build.lib.cssFileName`](/ko/config/build-options.md#build-lib) 로 변경할 수도 있습니다.

`package.json` 에서 CSS 파일을 내보내려면 사용자가 가져올 수 있습니다.

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip File Extensions
`package.json` 에 `"type": "module"` 포함되지 않으면 Vite는 node.js 호환성에 대해 다른 파일 확장을 생성합니다. `.js` 는 `.mjs` 되고 `.cjs` `.js` 됩니다.
:::

::: tip Environment Variables
라이브러리 모드에서는 생산을 위해 구축 할 때 모든 [`import.meta.env.*`](./env-and-mode.md) 사용이 정적으로 대체됩니다. 그러나 `process.env.*` 사용량이 아니므로 도서관의 소비자가 동적으로 변경할 수 있습니다. 이것이 바람직하지 않은 경우 `define: { 'process.env.NODE_ENV': '"production"' }` 와 같은 2를 사용하여 정적으로 교체하거나 [`esm-env`](https://github.com/benmccann/esm-env) 사용하여 번들과 런타임과 더 나은 호환성을 위해 사용할 수 있습니다.
:::

::: warning Advanced Usage
라이브러리 모드에는 브라우저 지향 및 JS 프레임 워크 라이브러리에 대한 간단하고 의견이 많은 구성이 포함되어 있습니다. 브라우저가 아닌 라이브러리를 구축하거나 고급 빌드 흐름이 필요한 경우 [롤업](https://rollupjs.org) 또는 [Esbuild를](https://esbuild.github.io) 직접 사용할 수 있습니다.
:::

## 고급 기본 옵션

::: warning
이 기능은 실험적입니다. [피드백을 제공하십시오](https://github.com/vitejs/vite/discussions/13834) .
:::

고급 사용 사례의 경우 배포 된 자산 및 공개 파일은 다른 경로에있을 수 있습니다 (예 : 다른 캐시 전략).
사용자는 세 가지 경로로 배포하도록 선택할 수 있습니다.

- 생성 된 항목 HTML 파일 (SSR 동안 처리 될 수 있음)
- 생성 된 해시 자산 (JS, CSS 및 이미지와 같은 기타 파일 유형)
- 복사 된 [공개 파일](assets.md#the-public-directory)

이 시나리오에서는 단일 정적 [베이스로는](#public-base-path) 충분하지 않습니다. Vite는 `experimental.renderBuiltUrl` 사용하여 빌드 중 고급 기본 옵션에 대한 실험적 지원을 제공합니다.

```ts twoslash
import type { UserConfig } from 'vite'
// 더 예쁘다
const config: UserConfig = {
  // --- 전기 ---
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      } else {
        return { relative: true }
      }
    },
  },
  // --- Cut-after ---
}
```

해시 자산과 공개 파일이 함께 배포되지 않으면 각 그룹의 옵션은 기능에 주어진 두 번째 `context` 매개 변수에 포함 된 자산 `type` 사용하여 독립적으로 정의 할 수 있습니다.

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// 더 예쁘다
const config: UserConfig = {
  // --- 전기 ---
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      } else if (path.extname(hostId) === '.js') {
        return {
          runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
        }
      } else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    },
  },
  // --- Cut-after ---
}
```

전달 된 `filename` 은 디코딩 된 URL이며 함수가 URL 문자열을 반환하면 디코딩해야합니다. Vite는 URL을 렌더링 할 때 인코딩을 자동으로 처리합니다. 1이 `runtime` 인 객체를 반환하면 런타임 코드가있는대로 필요한 경우 인코딩을 직접 처리해야합니다.
