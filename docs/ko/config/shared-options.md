# 공유 옵션

언급되지 않는 한,이 섹션의 옵션은 모든 개발자, 빌드 및 미리보기에 적용됩니다.

## 뿌리

- **유형 :** `string`
- **기본값 :** `process.cwd()`

프로젝트 루트 디렉토리 ( `index.html` 이 위치). 절대 경로 또는 현재 작업 디렉토리와 관련된 경로 일 수 있습니다.

자세한 내용은 [프로젝트 루트를](/ko/guide/#index-html-and-project-root) 참조하십시오.

## 베이스

- **유형 :** `string`
- **기본값 :** `/`
- **관련 :** [`server.origin`](/ko/config/server-options.md#server-origin)

개발 또는 생산에서 복무 할 때 기본 공개 경로. 유효한 값은 다음과 같습니다.

- 절대 URL PathName, 예를 들어 `/foo/`
- Full URL, 예를 들어 `https://bar.com/foo/` (원점 부분은 개발에 사용되지 않으므로 값은 `/foo/` 과 동일합니다)
- 빈 문자열 또는 `./` (내장 배포의 경우)

자세한 내용은 [공공 기반 경로를](/ko/guide/build#public-base-path) 참조하십시오.

## 방법

- **유형 :** `string`
- **기본값 :** 서브의 `'development'` , 빌드의 경우 `'production'`

구성에서이를 지정하면 **서빙 및 빌드 모두** 에 대한 기본 모드를 대체합니다. 이 값은 명령 줄 `--mode` 옵션을 통해 재정의 할 수 있습니다.

자세한 내용은 [ENV 변수 및 모드를](/ko/guide/env-and-mode) 참조하십시오.

## 정의하다

- **유형 :** `Record<string, any>`

글로벌 상수 교체를 정의하십시오. 항목은 DEV 동안 글로벌로 정의되며 빌드 중에 정적으로 교체됩니다.

Vite는 [Esbuild 정의를](https://esbuild.github.io/api/#define) 사용하여 교체를 수행하므로 값 표현식은 JSON-Serializable 값 (NULL, 부울, 번호, 문자열, 배열 또는 객체) 또는 단일 식별자를 포함하는 문자열이어야합니다. 비 스트링 값의 경우 Vite는 자동으로 `JSON.stringify` 있는 문자열로 변환합니다.

**예:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip NOTE
TypeScript 사용자의 경우 `env.d.ts` 또는 `vite-env.d.ts` 파일에 유형 선언을 추가하여 유형 확인 및 IntellISense를 얻으십시오.

예:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## 플러그인

- **유형 :** `(플러그인 | 플러그인 [] | 약속 <플러그인 | 플러그인 []>) []`

사용할 플러그인 배열. 허위 플러그인은 무시되고 플러그인 배열이 평평 해집니다. 약속이 반환되면 달리기 전에 해결됩니다. Vite 플러그인에 대한 자세한 내용은 [플러그인 API를](/ko/guide/api-plugin) 참조하십시오.

## 공개 디어

- **유형 :** `문자열 | 거짓
- **기본값 :** `"public"`

일반 정적 자산 역할을하는 디렉토리. 이 디렉토리의 파일은 DEV 기간 동안 `/` 으로 제공되며 빌드 중에 `outDir` 의 루트로 복사되며 항상 변환없이 제공되거나 복사됩니다. 값은 절대 파일 시스템 경로이거나 프로젝트 루트에 대한 경로 일 수 있습니다.

`false` 으로 `publicDir` 정의하면이 기능이 비활성화됩니다.

자세한 내용은 [`public` 디렉토리를](/ko/guide/assets#the-public-directory) 참조하십시오.

## 캐시 디르

- **유형 :** `string`
- **기본값 :** `"node_modules/.vite"`

캐시 파일을 저장하기위한 디렉토리. 이 디렉토리의 파일은 사전 구매 된 DEP 또는 VITE에서 생성 한 다른 캐시 파일로 성능을 향상시킬 수 있습니다. `--force` 플래그를 사용하거나 디렉토리를 수동으로 삭제하여 캐시 파일을 재생할 수 있습니다. 값은 절대 파일 시스템 경로이거나 프로젝트 루트에 대한 경로 일 수 있습니다. package.json이 감지되지 않은 경우 기본값 `.vite` .

## resolve.alias

- **유형:**
  `record <string, string> | 배열 <{찾기 : 문자열 | Regexp, 교체 : 문자열, CustomResolver? : Resolverfunction | resolverobject}>`

[항목 옵션](https://github.com/rollup/plugins/tree/master/packages/alias#entries) 으로 `@rollup/plugin-alias` 으로 전달됩니다. 객체 또는 `{ find, replacement, customResolver }` 쌍의 배열 일 수 있습니다.

파일 시스템 경로를 별칭 할 때는 항상 절대 경로를 사용하십시오. 상대 별칭 값은 AS-IS로 사용되며 파일 시스템 경로로 해결되지 않습니다.

[플러그인](/ko/guide/api-plugin) 을 통해보다 고급 사용자 정의 해상도를 달성 할 수 있습니다.

::: warning Using with SSR
[SSR 외부화 된 종속성](/ko/guide/ssr.md#ssr-externals) 에 대한 별명을 구성한 경우 실제 `node_modules` 패키지를 별칭으로 만들 수 있습니다. [원사](https://classic.yarnpkg.com/ko/docs/cli/add/#toc-yarn-add-alias) 와 [PNPM은](https://pnpm.io/aliases/) 모두 `npm:` 접두사를 통해 별칭을 지원합니다.
:::

## resolve.dedupe

- **유형 :** `string[]`

앱에서 동일한 의존성의 복제 된 사본이 복제 된 경우 (Monorepos의 포장 또는 연결된 패키지로 인해)이 옵션을 사용하여 Vite를 강제로 사용하여 나열된 종속성을 동일한 사본 (Project Root)으로 항상 해결하십시오.

:::warning SSR + ESM
SSR 빌드의 경우 중복 제거는 `build.rollupOptions.output` 에서 구성된 ESM 빌드 출력에 대해 작동하지 않습니다. 해결 방법은 ESM이 모듈로드에 대한 플러그인 지원이 향상 될 때까지 CJS 빌드 출력을 사용하는 것입니다.
:::

## resolve.conditions

- **유형 :** `string[]`
- **기본값 :** `[ 'Module', 'Browser', 'Development|프로덕션 '] ` (` DefaultClientConditions`)

패키지에서 [조건부 내보내기를](https://nodejs.org/api/packages.html#packages_conditional_exports) 해결할 때 추가 허용 조건.

조건부 내보내기가있는 패키지는 `package.json` 에 다음 `exports` 필드를 가질 수 있습니다.

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

여기서 `import` 과 `require` "조건"입니다. 조건은 중첩 될 수 있으며 가장 구체적으로 가장 구체적으로 지정해야합니다.

`개발|생산 `is a special value that is replaced with`생산`or`개발`depending on the value of`프로세스 .env.node_env`. It is replaced with `생산`when`프로세스 .env.node_env === '제작'`and` 개발 '그렇지 않으면.

요구 사항이 충족되면 `import` , `require` , `default` 조건이 항상 적용됩니다.

:::warning Resolving subpath exports
"/"로 끝나는 내보내기 키는 노드로 더 이상 사용되지 않으며 잘 작동하지 않을 수 있습니다. 패키지 작성자에게 문의하여 대신 [`*` 하위 경로 패턴을](https://nodejs.org/api/packages.html#package-entry-points) 사용하십시오.
:::

## resolve.mainFields

- **유형 :** `string[]`
- **기본값 :** `['browser', 'module', 'jsnext:main', 'jsnext']` ( `defaultClientMainFields` )

패키지의 진입 점을 해결할 때 시도 할 `package.json` 의 필드 목록. 참고 이것은 `exports` 필드에서 해결 된 조건부 수출보다 우선 순위가 낮습니다. `exports` 에서 진입 점이 성공적으로 해결되면 메인 필드는 무시됩니다.

## resolve.extensions

- **유형 :** `string[]`
- **기본값 :** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

확장을 생략하는 가져 오기를 시도 할 파일 확장 목록. 참고 IDE 및 유형 지원을 방해 할 수 있으므로 사용자 정의 가져 오기 유형 (예 : `.vue` )의 확장을 생략하는 것이 **좋습니다** .

## resolve.preserveSymlinks

- **유형 :** `boolean`
- **기본값 :** `false`

이 설정을 활성화하면 Vite가 실제 파일 경로 (즉, Symlinks를 따른 후 경로) 대신 원본 파일 경로 (즉, Symlinks를 따르는 경로)로 파일 ID를 결정하게됩니다.

- **관련 :** [esbuild#preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks) , [Webpack#resolve.symlinks
  ] ( [https://webpack.js.org/configuration/resolve/#resolvesymlinks](https://webpack.js.org/configuration/resolve/#resolvesymlinks) )

## html.cspNonce

- **유형 :** `string`
- **관련 :** [콘텐츠 보안 정책 (CSP)](/ko/guide/features#content-security-policy-csp)

스크립트 / 스타일 태그를 생성 할 때 사용될 Nonce Value 자리 표시 자. 이 값을 설정하면 Nonce 값의 메타 태그도 생성됩니다.

## css.modules

- **유형:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * 기본값 : 정의되지 않았습니다
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

CSS 모듈 동작을 구성하십시오. 옵션은 [Postcs-Modules](https://github.com/css-modules/postcss-modules) 로 전달됩니다.

이 옵션은 [Lightning CSS를](../guide/features.md#lightning-css) 사용할 때 아무런 영향을 미치지 않습니다. 활성화 된 경우 [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) 대신 사용해야합니다.

## css.postcss

- **유형 :** `문자열 | (postcss.processoptions & {플러그인? : postcss.acceptedplugin []})`

Inline Postcss 구성 또는 Custom Directory를 검색하여 PostCSS 구성을 검색합니다 (기본값은 Project Root).

인라인 PostCSS 구성의 경우 `postcss.config.js` 과 동일한 형식을 기대합니다. 그러나 `plugins` 속성의 경우 [배열 형식](https://github.com/postcss/postcss-load-config/blob/main/README.md#array) 만 사용할 수 있습니다.

검색은 [PostCSS-Load-Config를](https://github.com/postcss/postcss-load-config) 사용하여 수행되며 지원되는 구성 파일 이름 만로드됩니다. 작업 공간 루트 외부의 구성 파일 (또는 작업 영역이없는 경우 [프로젝트 루트](/ko/guide/#index-html-and-project-root) )은 기본적으로 검색되지 않습니다. 루트 외부의 사용자 정의 경로를 지정하여 필요한 경우 특정 구성 파일을로드 할 수 있습니다.

참고 인라인 구성이 제공되면 VITE는 다른 PostCSS 구성 소스를 검색하지 않습니다.

## css.preprocessorOptions

- **유형 :** `Record<string, object>`

CSS 프리 프로세서로 전달할 옵션을 지정하십시오. 파일 확장자는 옵션의 키로 사용됩니다. 각 사전 처리기의 지원되는 옵션은 해당 문서에서 찾을 수 있습니다.

- `sass` / `scss` :
  - `API : "Modern-Compiler"와 함께 사용할 SASS API를 선택하십시오. | "현대의" | "레거시" `(default`"Modern-Compiler"`if`Sass-embedded`is installed, otherwise`"Modern"`). For the best performance, it's recommended to use `API : "Modern-Compiler"`with the`Sass-embeded`package. The` "Legacy"`API는 비이트 7에서 제거됩니다.
  - [옵션 (현대)](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
  - [옵션 (레거시)](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions) .
- `less` : [옵션](https://lesscss.org/usage/#less-options) .
- `styl` / `stylus` : 단지 [`define`](https://stylus-lang.com/docs/js.html#define-name-node) 만 지원되며 객체로 전달 될 수 있습니다.

**예:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // 또는 "현대", "레거시"
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **유형 :** `문자열 | ((출처 : String, filename : String) => (String | {내용 : 문자열; 지도? : sourcemap}))`

이 옵션은 각 스타일 컨텐츠에 대한 추가 코드를 주입하는 데 사용될 수 있습니다. 변수뿐만 아니라 실제 스타일을 포함하는 경우 해당 스타일은 최종 번들에 복제됩니다.

**예:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

## css.preprocessorMaxWorkers

- **실험 :** [피드백을 제공합니다](https://github.com/vitejs/vite/discussions/15835)
- **유형 :** `숫자 | 진실
- **기본값 :** `0` (근로자를 생성하지 않고 기본 스레드에서 실행)

이 옵션이 설정되면 CSS 전 처리기는 가능한 경우 작업자에서 실행됩니다. `true` CPU 마이너스 1을 의미합니다.

## css.devSourcemap

- **실험 :** [피드백을 제공합니다](https://github.com/vitejs/vite/discussions/13845)
- **유형 :** `boolean`
- **기본값 :** `false`

개발 중에 SourceMaps를 활성화할지 여부.

## css.transformer

- **실험 :** [피드백을 제공합니다](https://github.com/vitejs/vite/discussions/13835)
- **유형 :** ` 'Postcss' | 'lightningcs'
- **기본값 :** `'postcss'`

CSS 처리에 사용되는 엔진을 선택합니다. 자세한 내용은 [Lightning CSS를](../guide/features.md#lightning-css) 확인하십시오.

::: info Duplicate `@import`s
PostCSS (PostCSS-Import)는 브라우저에서 중복 된 `@import` 과 다른 동작이 다릅니다. [PostCSS/PostCSS-Import#462를](https://github.com/postcss/postcss-import/issues/462) 참조하십시오.
:::

## css.lightningcss

- **실험 :** [피드백을 제공합니다](https://github.com/vitejs/vite/discussions/13835)
- **유형:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

번개 CS를 구성합니다. 전체 변환 옵션은 [Lightning CSS Repo](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts) 에서 찾을 수 있습니다.

## json.namedExports

- **유형 :** `boolean`
- **기본값 :** `true`

`.json` 파일에서 명명 된 가져 오기를 지원할 것인지

## json.stringify

- **유형 :** `부울 | 'Auto'
- **기본값 :** `'auto'`

`true` 으로 설정하면 가져 오른 JSON은 `export default JSON.parse("...")` 로 변환되며, 특히 JSON 파일이 클 때 객체 리터럴보다 훨씬 성능이 좋습니다.

`'auto'` 으로 설정하면 데이터 [가 10KB보다 큰](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger) 경우에만 데이터가 문을 닫습니다.

## Esbuild

- **유형 :** `esbuildoptions | 거짓

`ESBuildOptions` [Esbuild의 자체 변환 옵션을](https://esbuild.github.io/api/#transform) 확장합니다. 가장 일반적인 사용 사례는 JSX를 사용자 정의하는 것입니다.

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

기본적으로 Esbuild는 `ts` , `jsx` 및 `tsx` 파일에 적용됩니다. `esbuild.include` 과 `esbuild.exclude` 로이를 사용자 정의 할 수 있습니다. 3과 4, 이는 Regex, [Picomatch](https://github.com/micromatch/picomatch#globbing-features) 패턴 또는 배열 일 수 있습니다.

또한 `esbuild.jsxInject` 사용하여 Esbuild가 변환 한 모든 파일에 대해 JSX 도우미 가져 오기를 자동으로 주입 할 수도 있습니다.

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

[`build.minify`](./build-options.md#build-minify) 이 `true` 이면 모든 최적화 최적화가 기본적으로 적용됩니다. 그것의 [특정 측면을](https://esbuild.github.io/api/#minify) 비활성화하려면 `esbuild.minifyIdentifiers` , `esbuild.minifySyntax` 또는 `esbuild.minifyWhitespace` 옵션 중 하나를 `false` 로 설정하십시오. 참고 `esbuild.minify` 옵션은 `build.minify` 재정의하는 데 사용할 수 없습니다.

Esbuild 변환을 비활성화하려면 `false` 으로 설정하십시오.

## AssetSinclude

- **유형 :** `문자열 | Regexp | (끈 | regexp) []`
- **관련 :** [정적 자산 처리](/ko/guide/assets)

정적 자산으로 취급 할 추가 [Picomatch 패턴을](https://github.com/micromatch/picomatch#globbing-features) 지정하여 다음과 같이 지정하십시오.

- HTML에서 참조하거나 `fetch` 또는 XHR 이상 직접 요청하면 플러그인 변환 파이프 라인에서 제외됩니다.

- JS에서 가져 오면 분해 된 URL 문자열을 반환합니다 (자산 유형을 다르게 처리 할 수있는 플러그인이 `enforce: 'pre'` 인 경우 덮어 쓸 수 있습니다).

내장 자산 유형 목록은 [여기에서](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts) 찾을 수 있습니다.

**예:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## 로그 레벨

- **유형 :** ` '정보' | '경고하다' | '오류' | '사일런트'

콘솔 출력 진화를 조정하십시오. 기본값은 `'info'` 입니다.

## CustomLogger

- **유형:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

사용자 정의 로거를 사용하여 메시지를 기록하십시오. Vite의 `createLogger` API를 사용하여 기본 로거를 가져와 메시지를 변경하거나 특정 경고를 필터링하도록 사용자 정의 할 수 있습니다.

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // 빈 CSS 파일 경고를 무시하십시오
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## 클리어 스크린

- **유형 :** `boolean`
- **기본값 :** `true`

특정 메시지를 기록 할 때 Vite가 터미널 화면이 지우지 않도록 `false` 으로 설정하십시오. 명령 줄을 통해 사용 `--clearScreen false` .

## Envdir

- **유형 :** `string`
- **기본값 :** `root`

`.env` 파일이로드되는 디렉토리. 절대 경로 또는 프로젝트 루트와 관련된 경로 일 수 있습니다.

환경 파일에 대한 자세한 내용은 [여기를](/ko/guide/env-and-mode#env-files) 참조하십시오.

## EnvpRefix

- **유형 :** `문자열 | 문자열 []`
- **기본값 :** `VITE_`

`envPrefix` 으로 시작하는 ENV 변수는 import.meta.env를 통해 클라이언트 소스 코드에 노출됩니다.

:::warning SECURITY NOTES
`envPrefix` `''` 으로 설정되어서는 안되며, 모든 ENV 변수를 노출시키고 민감한 정보의 예기치 않은 누출을 유발합니다. Vite는 `''` 감지 할 때 오류가 발생합니다.

refix되지 않은 변수를 노출하려면 [Define을](#define) 사용하여 노출 할 수 있습니다.

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## apptype

- **유형 :** ` '스파' | 'MPA' | 'custom'
- **기본값 :** `'spa'`

응용 프로그램이 단일 페이지 애플리케이션 (SPA), [멀티 페이지 응용 프로그램 (MPA)](../guide/build#multi-page-app) 또는 사용자 정의 응용 프로그램 (사용자 정의 HTML 처리 기능이 포함 된 프레임 워크)인지 여부 :

- `'spa'` : HTML 중간 전쟁을 포함시키고 스파 폴백을 사용하십시오. 미리보기 `single: true` 으로 [SIRV를](https://github.com/lukeed/sirv) 구성하십시오
- `'mpa'` : HTML Middlewares를 포함하십시오
- `'custom'` : HTML 중간 전쟁을 포함하지 마십시오

Vite의 [SSR 가이드](/ko/guide/ssr#vite-cli) 에서 자세히 알아보십시오. 관련 : [`server.middlewareMode`](./server-options#server-middlewaremode) .

## 미래

- **유형 :** `record <string, 'warn' | 정의되지 않은>`
- **관련 :** [변화를 중단합니다](/ko/changes/)

향후 중단 변경을 통해 다음 주요 버전의 Vite로의 원활한 마이그레이션을 준비하십시오. 새로운 기능이 개발 될 때 언제든지 목록이 업데이트, 추가 또는 제거 될 수 있습니다.

가능한 옵션에 대한 자세한 내용은 [Breaking Change](/ko/changes/) 페이지를 참조하십시오.
