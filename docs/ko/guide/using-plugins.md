# 플러그인 사용

Vite는 몇 가지 추가 Vite 특이 적 옵션이있는 롤업의 잘 설계된 플러그인 인터페이스를 기반으로하는 플러그인을 사용하여 확장 할 수 있습니다. 이는 VITE 사용자가 롤업 플러그인의 성숙한 생태계에 의존 할 수 있으며 필요에 따라 DEV 서버 및 SSR 기능을 확장 할 수 있음을 의미합니다.

## 플러그인 추가

플러그인을 사용하려면 프로젝트의 `devDependencies` 에 추가하고 `vite.config.js` 구성 파일의 `plugins` 배열에 포함되어야합니다. 예를 들어, 레거시 브라우저를 지원하기 위해 공식 [@vitejs/플러그인 레지 비나이를](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) 사용할 수 있습니다.

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

`plugins` 여러 플러그인을 포함하여 사전 설정을 단일 요소로 허용합니다. 이는 여러 플러그인을 사용하여 구현되는 복잡한 기능 (프레임 워크 통합)에 유용합니다. 배열은 내부적으로 평평하게됩니다.

허위 플러그인은 무시되며 플러그인을 쉽게 활성화하거나 비활성화하는 데 사용할 수 있습니다.

## 플러그인 찾기

:::tip NOTE
Vite는 일반적인 웹 개발 패턴에 대한 기본 지원을 제공하는 것을 목표로합니다. Vite 또는 호환 롤업 플러그인을 검색하기 전에 [기능 안내서를](../guide/features.md) 확인하십시오. 롤업 프로젝트에서 플러그인이 필요한 많은 경우가 이미 Vite로 덮여 있습니다.
:::

공식 플러그인에 대한 정보는 [플러그인 섹션](../plugins/) 에서 확인하십시오. 커뮤니티 플러그인은 [Awesome-Vite](https://github.com/vitejs/awesome-vite#plugins) 에 나열되어 있습니다.

Vite 플러그인 [용 NPM 검색을](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity) 사용하여 [권장 규칙을](./api-plugin.md#conventions) 따르는 플러그인 또는 롤업 플러그인 용 [Rollup-Plugin 검색을 사용하는](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) 플러그인도 찾을 수 있습니다.

## 플러그인 순서 시행

일부 롤업 플러그인과의 호환성을 위해 플러그인의 순서를 시행하거나 빌드 시간에만 적용해야 할 수도 있습니다. Vite 플러그인의 구현 세부 사항이어야합니다. `enforce` 수정 자로 플러그인의 위치를 시행 할 수 있습니다.

- `pre` : Vite Core 플러그인 전에 플러그인을 호출하십시오
- 기본값 : Vite Core 플러그인 후 플러그인을 호출하십시오
- `post` : Vite 빌드 플러그인 후 플러그인을 호출하십시오

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

자세한 정보는 [플러그인 API 안내서를](./api-plugin.md#plugin-ordering) 확인하십시오.

## 조건부 응용 프로그램

기본적으로 플러그인은 서빙 및 빌드 모두에 대해 호출됩니다. 플러그인을 서브 또는 빌드 중에 만 조건부로 적용 해야하는 경우 `apply` 속성을 사용하여 `'build'` 또는 `'serve'` 동안 만 호출하십시오.

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## 빌딩 플러그인

플러그인 생성에 대한 문서화는 [플러그인 API 안내서를](./api-plugin.md) 확인하십시오.
