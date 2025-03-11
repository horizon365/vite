# 특징

매우 기본적인 수준에서 Vite를 사용하여 개발하는 것은 정적 파일 서버 사용과 다르지 않습니다. 그러나 Vite는 일반적으로 Bundler 기반 설정에서 볼 수있는 다양한 기능을 지원하기 위해 기본 ESM 가져 오기에 비해 많은 개선 사항을 제공합니다.

## NPM 의존성 해결 및 사전 묶음

기본 ES 가져 오기는 다음과 같은 베어 모듈 가져 오기를 지원하지 않습니다.

```js
import { someMethod } from 'my-dep'
```

위의 내용은 브라우저에 오류가 발생합니다. Vite는 모든 서비스 소스 파일에서 이러한 베어 모듈 가져 오기를 감지하고 다음을 수행합니다.

1. 페이지로드 속도를 향상시키고 CommonJS / UMD 모듈을 ESM으로 변환하도록 [사전 번들](./dep-pre-bundling) . 사전 묶음 단계는 [Esbuild](http://esbuild.github.io/) 로 수행되며 Vite의 냉장 시작 시간이 JavaScript 기반 Bundler보다 훨씬 빠릅니다.

2. 브라우저가 올바르게 가져올 수 있도록 가져 오기를 `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd` 같은 유효한 URL로 다시 작성하십시오.

**종속성은 강력하게 캐시됩니다**

Vite는 HTTP 헤더를 통한 종속성 요청을 캐시하므로 종속성을 로컬로 편집/디버그하려면 [여기에서](./dep-pre-bundling#browser-cache) 단계를 따르십시오.

## 핫 모듈 교체

Vite는 기본 ESM에 대한 [HMR API를](./api-hmr) 제공합니다. HMR 기능을 갖춘 프레임 워크는 API를 활용하여 페이지를 다시로드하거나 응용 프로그램 상태를 날려 버리지 않고 즉각적이고 정확한 업데이트를 제공 할 수 있습니다. VITE는 [VUE 단일 파일 구성 요소에](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) 대한 첫 번째 파티 HMR 통합을 제공하고 [빠른 새로 고침을 반응합니다](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) . [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite) 를 통해 PREACT를위한 공식 통합도 있습니다.

참고 수동으로 설정할 필요가 없습니다. [`create-vite` 통해 앱을 생성 할](./) 때 선택한 템플릿은 이미 미리 구성되어 있습니다.

## TypeScript

Vite는 상자에서 `.ts` 파일을 가져 오는 것을 지원합니다.

### 트랜스 파일 만

VITE는 `.ts` 파일에서만 트랜스 파일 만 수행하며 유형 확인을 수행하지 **않습니다** . IDE 및 빌드 프로세스에서 유형 검사를 처리한다고 가정합니다.

Vite가 변환 프로세스의 일부로 유형 검사를 수행하지 않는 이유는 두 작업이 근본적으로 다르게 작동하기 때문입니다. 변환은 파일별로 작동 할 수 있으며 Vite의 주문형 컴파일 모델과 완벽하게 정렬됩니다. 이에 비해 유형 확인에는 전체 모듈 그래프에 대한 지식이 필요합니다. Vite의 변환 파이프 라인에 대한 신발 호흡 유형 확인은 필연적으로 Vite의 속도 이점을 손상시킵니다.

Vite의 임무는 소스 모듈을 최대한 빨리 브라우저에서 실행할 수있는 양식으로 가져 오는 것입니다. 이를 위해 Vite의 변환 파이프 라인에서 정적 분석 검사를 분리하는 것이 좋습니다. 이 원칙은 ESLINT와 같은 다른 정적 분석 검사에 적용됩니다.

- 생산 빌드의 경우 Vite의 빌드 명령 외에 `tsc --noEmit` 실행할 수 있습니다.

- 개발 중에 IDE 힌트 이상이 필요한 경우 별도의 프로세스에서 `tsc --noEmit --watch` 실행하거나 브라우저에서 직접보고 된 유형 오류가있는 경우 [Vite-Plugin-Checker를](https://github.com/fi3ework/vite-plugin-checker) 사용하는 것이 좋습니다.

Vite는 [Esbuild를](https://github.com/evanw/esbuild) 사용하여 Vanilla `tsc` 보다 약 20 ~ 30 배 빠른 JavaScript로 Transpile TypeScript를 트랜스 파일로 사용하며 HMR 업데이트는 50ms 미만의 브라우저에 반영 할 수 있습니다.

[유형 전용 가져 오기 및 내보내기](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) 구문을 사용하여 유형 전용 가져 오기와 같은 잠재적 문제를 피하십시오.

```ts
import type { T } from 'only/types'
export type { T }
```

### TypeScript 컴파일러 옵션

`tsconfig.json` 에서 `compilerOptions` 미만의 일부 구성 필드에는 특별한주의가 필요합니다.

#### `isolatedModules`

- [TypeScript 문서](https://www.typescriptlang.org/tsconfig#isolatedModules)

`true` 으로 설정해야합니다.

`esbuild` 유형 정보없이 변환 만 수행하기 때문에 Const Enum 및 암시 적 유형 전용 가져 오기와 같은 특정 기능을 지원하지 않습니다.

TS는 격리 된 변환과 함께 작동하지 않는 기능에 대해 경고 할 수 있도록 `tsconfig.json` `compilerOptions` 으로 `"isolatedModules": true` 설정해야합니다.

종속성이 `"isolatedModules": true` 과 잘 작동하지 않는 경우. 상류가 고정 될 때까지 `"skipLibCheck": true` 사용하여 일시적으로 오류를 억제 할 수 있습니다.

#### `useDefineForClassFields`

- [TypeScript 문서](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

TypeScript 대상이 `ES2022` 이거나 `ESNext` 포함하여 최신 인 경우 기본값은 `true` 됩니다. [TypeScript 4.3.2+의 동작](https://github.com/microsoft/TypeScript/pull/42663) 과 일치합니다.
다른 TypeScript 대상은 기본값이 `false` 입니다.

`true` 은 표준 ecmascript 런타임 동작입니다.

클래스 필드에 크게 의존하는 라이브러리를 사용하는 경우 라이브러리의 의도 된 사용법에주의하십시오.
대부분의 라이브러리는 `"useDefineForClassFields": true` 기대하지만 라이브러리가 지원하지 않으면 `useDefineForClassFields` ~ `false` 명시 적으로 설정할 수 있습니다.

#### `target`

- [TypeScript 문서](https://www.typescriptlang.org/tsconfig#target)

Vite는 `esbuild` 와 동일한 동작에 따라 `tsconfig.json` 의 `target` 값을 무시합니다.

Dev에서 대상을 지정하기 위해 [`esbuild.target`](/ko/config/shared-options.html#esbuild) 옵션을 사용할 수 있으며, 최소한의 변환을 위해 기본값이 `esnext` 으로 표시됩니다. 빌드에서 [`build.target`](/ko/config/build-options.html#build-target) 옵션은 `esbuild.target` 보다 우선 순위가 높으며 필요한 경우 설정할 수도 있습니다.

::: warning `useDefineForClassFields`

`target` in `tsconfig.json` `ESNext` 또는 `ES2022` 이상이 아니거나 `tsconfig.json` 파일이없는 경우 기본값은 기본 `esbuild.target` 값 `esnext` 에 문제가 될 수있는 기본값 `useDefineForClassFields` `false` 기본값을받습니다. 브라우저에서 지원되지 않을 수있는 [정적 초기화 블록](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks#browser_compatibility) 으로 변환 될 수 있습니다.

따라서 `target` 에서 `ESNext` 또는 `ES2022` 또는 새로 설정하거나 `tsconfig.json` 구성 할 때 명시 적으로 `useDefineForClassFields` ~ `true` 설정하는 것이 좋습니다.
:::

#### 빌드 결과에 영향을 미치는 다른 컴파일러 옵션

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)
- [`alwaysStrict`](https://www.typescriptlang.org/tsconfig#alwaysStrict)

::: tip `skipLibCheck`
Vite Starter Template는 기본적으로 `"skipLibCheck": "true"` 가지지 않으며 TypeChecking 종속성을 피하십시오. 특정 버전 및 TypeScript의 구성 만 지원할 수 있으므로 선택할 수 있습니다. [vuejs/vue-cli#5688](https://github.com/vuejs/vue-cli/pull/5688) 에서 더 많은 것을 배울 수 있습니다.
:::

### 클라이언트 유형

Vite의 기본 유형은 Node.js API 용입니다. Vite 응용 프로그램에서 클라이언트 측 코드의 환경을 확인하려면 `d.ts` 선언 파일을 추가하십시오.

```typescript
///<reference types="vite/client">
```

::: details Using `compilerOptions.types`

또는 내부 `tsconfig.json` : 0에서 `vite/client` `compilerOptions.types` 추가 할 수 있습니다.

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client", "some-other-global-lib"]
  }
}
```

[`compilerOptions.types`](https://www.typescriptlang.org/tsconfig#types) 지정되면이 패키지만이 전체적으로 "@types"패키지 대신 글로벌 범위에 포함됩니다.

:::

`vite/client` 다음 유형의 심을 제공합니다.

- 자산 가져 오기 (예 : `.svg` 파일 가져 오기)
- `import.meta.env` 의 vite- 주입 [상수](./env-and-mode#env-variables) 의 유형
- `import.meta.hot` 의 [HMR API](./api-hmr) 유형

::: tip
기본 유형을 무시하려면 타이핑이 포함 된 유형 정의 파일을 추가하십시오. 그런 다음 `vite/client` 전에 유형 참조를 추가하십시오.

예를 들어, 기본 가져 오기 `*.svg` 의 반응 구성 요소를 만들려면 :

- `vite-env-override.d.ts` (타이핑이 포함 된 파일) :
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- `vite/client` 에 대한 참조를 포함하는 파일 :
  ```ts
  ///<reference types="./vite-env-override.d.ts">
  ///<reference types="vite/client">
  ```

:::

## HTML

HTML 파일은 Vite 프로젝트의 [전면 및 중심에](/ko/guide/#index-html-and-project-root) 서서 응용 프로그램의 진입 지점 역할을하므로 단일 페이지 및 [다중 페이지 응용 프로그램을](/ko/guide/build.html#multi-page-app) 간단하게 구축 할 수 있습니다.

프로젝트 루트의 모든 HTML 파일은 해당 디렉토리 경로에서 직접 액세스 할 수 있습니다.

- `<root>/index.html` > `http://localhost:5173/`
- `<root>/about.html` > `http://localhost:5173/about.html`
- `<root>/blog/index.html` > `http://localhost:5173/blog/index.html`

`<script type="module" src>` 및 `<link href>` 과 같은 HTML 요소에 의해 언급 된 자산은 앱의 일부로 처리 및 번들로 제공됩니다. 지원되는 요소의 전체 목록은 다음과 같습니다.

- `<audio src>`
- `<embed src>`
- `<img src>` 과 `<img srcset>`
- `<image src>`
- `<input src>`
- `<link href>` 과 `<link imagesrcset>`
- `<object data>`
- `<script type="module" src>`
- `<source src>` 과 `<source srcset>`
- `<track src>`
- `<use href>` 과 `<use xlink:href>`
- `<video src>` 과 `<video poster>`
- `<meta content>`
  - `name` 속성이 `msapplication-tileimage` , `msapplication-square70x70logo` , `msapplication-square150x150logo` , `msapplication-wide310x150logo` , `msapplication-square310x310logo` , `msapplication-config` 또는 `twitter:image` 과 일치하는 경우에만
  - 또는 `property` 속성이 `og:image` , `og:image:url` , `og:image:secure_url` , `og:audio` , `og:audio:secure_url` , `og:video` 또는 `og:video:secure_url` 과 일치하는 경우에만

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

특정 요소에서 HTML 처리를 거부하려면 요소에 `vite-ignore` 속성을 추가 할 수 있으며 외부 자산 또는 CDN을 참조 할 때 유용 할 수 있습니다.

## 프레임 워크

모든 현대 프레임 워크는 Vite와의 통합을 유지합니다. 대부분의 프레임 워크 플러그인은 Vite org에서 유지되는 공식 VUE 및 React Vite 플러그인을 제외하고 각 프레임 워크 팀이 유지 관리합니다.

- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) 를 통해 VUE 지원
- [@vitejs/plugin-vue-jsx를](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx) 통해 vue jsx 지원
- [@vitejs/plugin-react를](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) 통해 지원을 반응합니다
- [@vitejs/plugin-react-swc를](https://github.com/vitejs/vite-plugin-react-swc) 통해 SWC 지원을 사용하여 반응합니다

자세한 내용은 [플러그인 안내서를](https://vite.dev/plugins) 확인하십시오.

## JSX

`.jsx` 및 `.tsx` 파일도 상자에서 지원됩니다. JSX 변환은 [Esbuild를](https://esbuild.github.io) 통해 처리됩니다.

선택 프레임 워크는 이미 JSX를 상자에서 구성합니다 (예 : VUE 사용자는 HMR, 글로벌 구성 요소 해결, 지침 및 슬롯을 포함한 VUE 3 특정 기능을 제공하는 공식 [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx) 플러그인을 사용해야합니다.

자체 프레임 워크와 함께 JSX를 사용하는 경우 [`esbuild` 옵션을](/ko/config/shared-options.md#esbuild) 사용하여 사용자 정의 `jsxFactory` 및 `jsxFragment` 구성 할 수 있습니다. 예를 들어, PreAct 플러그인은 다음을 사용합니다.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

[Esbuild Docs](https://esbuild.github.io/content-types/#jsx) 에 대한 자세한 내용.

수동 가져 오기를 피하기 위해 `jsxInject` (Vite 전용 옵션)을 사용하여 JSX 도우미를 주입 할 수 있습니다.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

`.css` 파일을 가져 오면 HMR 지원이있는 `<style>` 태그를 통해 컨텐츠가 페이지에 주입됩니다.

### `@import` 인라인 및 레바 싱

Vite는 `postcss-import` 통해 CSS `@import` 인라인을 지원하기 위해 사전 구성됩니다. VITE 별칭은 CSS `@import` 에 대해서도 존중됩니다. 또한, 가져온 파일이 다른 디렉토리에 있더라도 모든 CSS `url()` 참조는 항상 자동으로 재조정되어 정확성을 보장합니다.

`@import` 별칭 및 URL Rebasing도 SASS 및 적은 파일에 대해 지원됩니다 ( [CSS 프리 프로세서](#css-pre-processors) 참조).

### Postcss

프로젝트에 유효한 PostCSS 구성 ( [PostCSS-Load-Config](https://github.com/postcss/postcss-load-config) , EG `postcss.config.js` 이 지원하는 모든 형식)이 포함 된 경우, 모든 가져 오기 CSS에 자동으로 적용됩니다.

CSS Minification은 PostCSS 이후에 실행되며 [`build.cssTarget`](/ko/config/build-options.md#build-csstarget) 옵션을 사용합니다.

### CSS 모듈

`.module.css` 으로 끝나는 모든 CSS 파일은 [CSS 모듈 파일](https://github.com/css-modules/css-modules) 로 간주됩니다. 해당 파일을 가져 오면 해당 모듈 개체를 반환합니다.

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
// ---자르다---
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

CSS 모듈 동작은 [`css.modules` 옵션을](/ko/config/shared-options.md#css-modules) 통해 구성 할 수 있습니다.

`css.modules.localsConvention` Camelcase Locals (예 : `localsConvention: 'camelCaseOnly'` )를 활성화하도록 설정된 경우 이름이 지정된 imports를 사용할 수도 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
// .Apply -Color-> ApplyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS 사전 프로세서

Vite는 최신 브라우저를 대상으로하기 때문에 CSSWG 드래프트 (예 : [PostCSS-Nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting) ) 및 저자 평범한 미래의 대표준 CSS를 구현하는 PostCSS 플러그인과 함께 기본 CSS 변수를 사용하는 것이 좋습니다.

즉, Vite는 `.scss` , `.sass` , `.less` , `.styl` 및 `.stylus` 파일에 대한 내장 지원을 제공합니다. Vite 특이 적 플러그인을 설치할 필요는 없지만 해당 프리 프로세서 자체를 설치해야합니다.

```bash
# .Scss 및 .Sass
npm add -D sass-embedded # 또는 Sass

# .더 적은
npm add -D less

# .Styl 및 .stylus
npm add -D stylus
```

VUE 단일 파일 구성 요소를 사용하는 경우 `<style lang="sass">` et al.

Vite는 SASS에 대한 해결 `@import` 개선하고 vite 별칭도 존중되도록 개선합니다. 또한 루트 파일의 다른 디렉토리에있는 가져 오기 SASS/Less Files 내부의 상대 `url()` 참조도 자동으로 재조정되어 정확성을 보장합니다.

`@import` 별칭 및 URL Rebasing은 API 제약으로 인해 스타일러스에 대해 지원되지 않습니다.

또한 파일 확장자 (예 : `style.module.scss` 에 `.module` 선물하여 프리 프로세서와 결합 된 CSS 모듈을 사용할 수도 있습니다 (예 : 1).

### 페이지에 CSS 주입을 비활성화합니다

`?inline` 쿼리 매개 변수를 통해 CSS 내용의 자동 분사를 꺼질 수 있습니다. 이 경우 처리 된 CSS 문자열은 평소와 같이 모듈의 기본 내보내기로 반환되지만 스타일은 페이지에 주입되지 않습니다.

```js twoslash
import 'vite/client'
// ---자르다---
import './foo.css' // 페이지에 주입됩니다
import otherStyles from './bar.css?inline' // 주입되지 않습니다
```

::: tip NOTE
Vite 5 이후 CSS 파일 (예 : `import style from './foo.css'` )의 기본 및 명명 된 가져 오기가 제거됩니다. 대신 `?inline` 쿼리를 사용하십시오.
:::

### 번개 CSS

Vite 4.4에서 시작하여 [번개 CS](https://lightningcss.dev/) 에 대한 실험적 지원이 있습니다. 구성 파일에 [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer) 추가하여 선택 사항 [`lightningcss`](https://www.npmjs.com/package/lightningcss) 종속성을 설치하여 선택할 수 있습니다.

```bash
npm add -D lightningcss
```

활성화 된 경우 CSS 파일은 PostCS 대신 Lightning CSS로 처리됩니다. 이를 구성하려면 Lightning CSS 옵션을 [`css.lightningcss`](../config/shared-options.md#css-lightningcss) 구성 옵션으로 전달할 수 있습니다.

CSS 모듈을 구성하려면 [`css.modules`](../config/shared-options.md#css-modules) 대신 [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) 사용합니다 (PostCSS가 CSS 모듈을 처리하는 방식을 구성).

기본적으로 Vite는 Esbuild를 사용하여 CSS를 조정합니다. Lightning CSS는 [`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify) 있는 CSS 미니 파이어로도 사용할 수 있습니다.

::: tip NOTE
Lightning CSS를 사용할 때 [CSS 사전 프로세서는](#css-pre-processors) 지원되지 않습니다.
:::

## 정적 자산

정적 자산을 가져 오면 해결 된 공개 URL이 제공되면 다음과 같습니다.

```js twoslash
import 'vite/client'
// ---자르다---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

특수 쿼리는 자산을로드하는 방법을 수정할 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
// 명시 적으로 자산을 URL로로드합니다
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
// ---자르다---
// 자산을 문자열로로드하십시오
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
// ---자르다---
// 웹 작업자를로드하십시오
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
// ---자르다---
// 웹 작업자는 빌드 타임에 Base64 문자열로 인쇄되었습니다
import InlineWorker from './worker.js?worker&inline'
```

[정적 자산 처리](./assets) 에 대한 자세한 내용.

## JSON

JSON 파일을 직접 가져올 수 있습니다. 이름이 지정된 가져 오기도 지원됩니다.

```js twoslash
import 'vite/client'
// ---자르다---
// 전체 객체를 가져옵니다
import json from './example.json'
// 루트 필드를 지명 된 수출로 가져 오십시오 - 나무 흔들림에 도움이됩니다!
import { field } from './example.json'
```

## 글로벌 수입

Vite는 특수 `import.meta.glob` 기능을 통해 파일 시스템에서 여러 모듈을 가져 오는 것을 지원합니다.

```js twoslash
import 'vite/client'
// ---자르다---
const modules = import.meta.glob('./dir/*.js')
```

위는 다음으로 변환됩니다.

```js
// Vite가 생성 한 코드
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

그런 다음 `modules` 개체의 키를 반대하여 해당 모듈에 액세스 할 수 있습니다.

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

일치하는 파일은 기본적으로 동적 가져 오기를 통해 Lazy-Loaded이며 빌드 중에 별도의 청크로 분할됩니다. 오히려 모든 모듈을 직접 가져 오려면 (예 : 먼저 적용 할이 모듈의 부작용에 의존하는 경우) 두 번째 인수로 `{ eager: true }` 전달할 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

위는 다음으로 변환됩니다.

```js
// Vite가 생성 한 코드
import * as __vite_glob_0_0 from './dir/bar.js'
import * as __vite_glob_0_1 from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

### 여러 패턴

첫 번째 인수는 예를 들어 많은 글로이 일 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### 부정적인 패턴

음의 글로벌 패턴도지지됩니다 ( `!` 으로 접두사). 결과에서 일부 파일을 무시하려면 첫 번째 인수에 글로벌 패턴 제외를 추가 할 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// Vite가 생성 한 코드
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### 수입 명명

`import` 옵션으로 모듈의 일부만 가져올 수 있습니다.

```ts twoslash
import 'vite/client'
// ---자르다---
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// Vite가 생성 한 코드
const modules = {
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
}
```

`eager` 과 결합하면 해당 모듈에 대해 트리 쉐이킹을 가능하게 할 수도 있습니다.

```ts twoslash
import 'vite/client'
// ---자르다---
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// Vite에서 생성 된 코드 :
import { setup as __vite_glob_0_0 } from './dir/bar.js'
import { setup as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

기본 내보내기를 가져 오려면 `import` 에서 `default` 까지 설정합니다.

```ts twoslash
import 'vite/client'
// ---자르다---
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// Vite에서 생성 된 코드 :
import { default as __vite_glob_0_0 } from './dir/bar.js'
import { default as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

#### 사용자 정의 쿼리

예를 들어 자산을 [문자열](https://vite.dev/guide/assets.html#importing-asset-as-string) 또는 [URL로](https://vite.dev/guide/assets.html#importing-asset-as-url) 가져 오기 위해 `query` 옵션을 사용하여 가져 오기에 쿼리를 제공 할 수도 있습니다.

```ts twoslash
import 'vite/client'
// ---자르다---
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// Vite에서 생성 된 코드 :
const moduleStrings = {
  './dir/bar.svg': () => import('./dir/bar.svg?raw').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/bar.svg': () => import('./dir/bar.svg?url').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?url').then((m) => m['default']),
}
```

다른 플러그인에 대한 사용자 정의 쿼리를 제공 할 수도 있습니다.

```ts twoslash
import 'vite/client'
// ---자르다---
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

### 글로벌 수입 경고

주목하십시오 :

- 이것은 vite 전용 기능이며 웹 또는 ES 표준이 아닙니다.
- 글로벌 패턴은 가져 오기 지정자처럼 취급됩니다. 상대적 ( `./` 부터 시작)이거나 절대 ( `/` 로 시작, 프로젝트 루트에 비해 해결) 또는 별명 경로 ( [`resolve.alias` 옵션](/ko/config/shared-options.md#resolve-alias) 참조) 여야합니다.
- 글로벌 매칭은 [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) 통해 이루어집니다.
- 또한 `import.meta.glob` 의 모든 인수는 **리터럴로 전달** 되어야한다는 것을 알고 있어야합니다. 변수 나 표현을 사용할 수 없습니다.

## 동적 수입

[Glob Inmport](#glob-import) 와 마찬가지로 Vite는 변수와 함께 동적 가져 오기를 지원합니다.

```ts
const module = await import(`./dir/${file}.js`)
```

변수는 파일 이름 만 하나의 수준 깊이를 나타냅니다. `file` 이 `'foo/bar'` 이면 가져 오기가 실패합니다. 보다 고급 사용을 위해 [Glob 가져 오기](#glob-import) 기능을 사용할 수 있습니다.

## webassembly

사전 컴파일 된 `.wasm` 파일은 `?init` 로 가져올 수 있습니다.
기본 내보내기는 [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance) 의 약속을 반환하는 초기화 함수입니다.

```js twoslash
import 'vite/client'
// ---자르다---
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

INT 함수는 또한 두 번째 인수로 [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate) 으로 전달되는 importObject를 취할 수 있습니다.

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
// ---자르다---
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

프로덕션 빌드에서 `assetInlineLimit` 보다 작은 `.wasm` 파일은 Base64 문자열로 인쇄됩니다. 그렇지 않으면, 그들은 [정적 자산](./assets) 으로 취급되고 주문형을 가져옵니다.

::: tip NOTE
[WebAssembly에 대한 ES 모듈 통합 제안은](https://github.com/WebAssembly/esm-integration) 현재 지원되지 않습니다.
이를 처리하려면 [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) 또는 다른 커뮤니티 플러그인을 사용하십시오.
:::

### WebAssembly 모듈에 액세스합니다

`Module` 객체에 액세스 해야하는 경우, 예를 들어 여러 번 인스턴스화하려면 [명시 적 URL 가져 오기를](./assets#explicit-url-imports) 사용하여 자산을 해결 한 다음 인스턴스화를 수행하십시오.

```js twoslash
import 'vite/client'
// ---자르다---
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### node.js에서 모듈 가져 오기

SSR에서 `?init` 가져 오기의 일부로 발생하는 `fetch()` 은 `TypeError: Invalid URL` 로 실패 할 수 있습니다.
[SSR의 문제 지원 WASM을](https://github.com/vitejs/vite/issues/8882) 참조하십시오.

프로젝트 기반이 현재 디렉토리라고 가정하는 대안은 다음과 같습니다.

```js twoslash
import 'vite/client'
// ---자르다---
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## 웹 직원

### 생성자로 가져 오기

웹 워커 스크립트는 [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) 과 [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker) 사용하여 가져올 수 있습니다. 작업자 접미사에 비해이 구문은 표준에 가까워지고 작업자를 만드는 것이 **권장되는** 방법입니다.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

작업자 생성자는 또한 "모듈"작업자를 만드는 데 사용할 수있는 옵션을 수락합니다.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

작업자 탐지는 `new URL()` 생성자가 `new Worker()` 선언 내에서 직접 사용되는 경우에만 작동합니다. 또한 모든 옵션 매개 변수는 정적 값 (예 : 문자열 리터럴)이어야합니다.

### 쿼리 접미사로 가져옵니다

웹 워커 스크립트는 가져 오기 요청에 `?worker` 또는 `?sharedworker` 추가하여 직접 가져올 수 있습니다. 기본 내보내기는 사용자 정의 작업자 생성자가됩니다.

```js twoslash
import 'vite/client'
// ---자르다---
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

작업자 스크립트는 `importScripts()` 대신 ESM `import` 문을 사용할 수도 있습니다. **참고** : 개발 중에 이것은 [브라우저 네이티브 지원](https://caniuse.com/?search=module%20worker) 에 의존하지만 생산 빌드의 경우 컴파일됩니다.

기본적으로 작업자 스크립트는 프로덕션 빌드에서 별도의 청크로 방출됩니다. 작업자를 Base64 문자열로 인라인하려면 `inline` 쿼리를 추가하십시오.

```js twoslash
import 'vite/client'
// ---자르다---
import MyWorker from './worker?worker&inline'
```

작업자를 URL로 검색하려면 `url` 쿼리를 추가하십시오.

```js twoslash
import 'vite/client'
// ---자르다---
import MyWorker from './worker?worker&url'
```

모든 근로자의 번들링 구성에 대한 자세한 내용은 [작업자 옵션을](/ko/config/worker-options.md) 참조하십시오.

## 컨텐츠 보안 정책 (CSP)

CSP를 배포하려면 Vite의 내부로 인해 특정 지침 또는 구성을 설정해야합니다.

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

[`html.cspNonce`](/ko/config/shared-options#html-cspnonce) 설정되면 Vite는 `<script>` 및 `<style>` 태그에 지정된 값의 비 세상 속성을 추가하고 스타일 시트 및 모듈 사전 로딩의 `<link>` 태그를 추가합니다. 또한이 옵션이 설정되면 Vite는 메타 태그 ( `<meta property="csp-nonce" nonce="PLACEHOLDER" />` )를 주입합니다.

`property="csp-nonce"` 인 메타 태그의 Nonce 값은 개발 중 및 빌드 후에 필요할 때마다 Vite에 의해 사용됩니다.

:::warning
자리 표시자를 각 요청마다 고유 한 값으로 교체해야합니다. 이는 자원의 정책을 우회하는 것을 방지하는 데 중요합니다. 그렇지 않으면 쉽게 수행 할 수 있습니다.
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

기본적으로 빌드 중에 Vite는 작은 자산을 데이터 URI로 인출합니다. 관련 지시문 (예 : [`img-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src) , [`font-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src) )에 `data:` 허용하거나 [`build.assetsInlineLimit: 0`](/ko/config/build-options#build-assetsinlinelimit) 설정하여 비활성화해야합니다.

:::warning
[`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) 에 `data:` 허용하지 마십시오. 임의의 스크립트를 주입 할 수 있습니다.
:::

## 최적화를 구축하십시오

> 아래에 나열된 기능은 빌드 프로세스의 일부로 자동으로 적용되며 비활성화하려고하지 않는 한 명시적인 구성이 필요하지 않습니다.

### CSS 코드 분할

Vite는 Async 청크에서 모듈에서 사용하는 CSS를 자동으로 추출하고 별도의 파일을 생성합니다. 관련 비동기 청크가로드 될 때 CSS 파일은 `<link>` 태그를 통해 자동으로로드되며 Async 청크는 CSS가 [FOUC를](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.) 피하기 위해로드 된 후에 만 평가되도록 보장됩니다.

모든 CSS를 단일 파일로 추출하려면 [`build.cssCodeSplit`](/ko/config/build-options.md#build-csscodesplit) `false` 설정하여 CSS 코드 분할을 비활성화 할 수 있습니다.

### 예압 지시서 세대

Vite는 입력 청크 및 구축 된 HTML에서 직접 가져 오기에 대한 `<link rel="modulepreload">` 지침을 자동으로 생성합니다.

### 비동기 청크 로딩 최적화

실제 응용 프로그램에서 롤업은 종종 두 개 이상의 다른 덩어리간에 공유되는 "공통"청크를 생성합니다. 동적 수입과 결합하여 다음 시나리오를 갖는 것이 일반적입니다.

<script setup>
import graphSvg from '../../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

최적화되지 않은 시나리오에서, 비동기 청크 `A` 가져 오면 브라우저는 공통 청크 `C` 필요하다는 것을 알아 내기 전에 `A` 요청하고 매개해야합니다. 이로 인해 추가 네트워크 왕복이 발생합니다.

```
Entry ---> A ---> C
```

vite는 `A` 요청되면 `C` **병렬로** 가져 오도록 예압 단계로 코드 스플릿 동적 가져 오기 호출을 자동으로 재 작성합니다.

```
Entry ---> (A + C)
```

`C` 추가 수입을 가질 수 있으므로 최적화되지 않은 시나리오에서 더 많은 왕복이 발생할 수 있습니다. Vite의 최적화는 모든 직접 가져 오기를 추적하여 가져 오기 깊이에 관계없이 왕복을 완전히 제거합니다.
