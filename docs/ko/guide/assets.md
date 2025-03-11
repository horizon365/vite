# 정적 자산 처리

- 관련 : [공공 기지 경로](./build#public-base-path)
- 관련 : [`assetsInclude` 구성 옵션](/ko/config/shared-options.md#assetsinclude)

## 자산 가져 오기 URL

정적 자산을 가져 오면 해결 된 공개 URL이 제공되면 다음과 같습니다.

```js twoslash
import 'vite/client'
// ---자르다---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

예를 들어, 개발 중에 `imgUrl` 은 `/src/img.png` 이고 생산 빌드에서 `/assets/img.2d8efhg.png` 됩니다.

동작은 WebPack의 `file-loader` 과 유사합니다. 차이점은 가져 오기가 절대적인 공개 경로 (DEV 기간 동안 프로젝트 루트 기반) 또는 상대 경로를 사용하는 것입니다.

- CSS의 `url()` 참조는 같은 방식으로 처리됩니다.

- VUE 플러그인을 사용하는 경우 VUE SFC 템플릿의 자산 참조는 자동으로 가져 오기로 변환됩니다.

- 일반적인 이미지, 미디어 및 글꼴 필레 타입은 자동으로 자산으로 감지됩니다. [`assetsInclude` 옵션을](/ko/config/shared-options.md#assetsinclude) 사용하여 내부 목록을 확장 할 수 있습니다.

- 참조 자산은 빌드 자산 그래프의 일부로 포함되며 해시 파일 이름을 얻을 수 있으며 최적화를 위해 플러그인으로 처리 할 수 있습니다.

- [`assetsInlineLimit` 옵션](/ko/config/build-options.md#build-assetsinlinelimit) 보다 바이트가 작은 자산은 Base64 Data URL로 인쇄됩니다.

- Git LFS 자리 표시자는 그들이 나타내는 파일의 내용을 포함하지 않기 때문에 인라인에서 자동으로 제외됩니다. 인라인을 얻으려면 구축하기 전에 GIT LFS를 통해 파일 내용을 다운로드하십시오.

- 기본적으로 TypeScript는 정적 자산 수입을 유효한 모듈로 인식하지 못합니다. 이 문제를 해결하려면 [`vite/client`](./features#client-types) 포함하십시오.

::: tip Inlining SVGs through `url()`
SVG의 URL을 JS에 의해 수동으로 구성된 `url()` 으로 전달할 때 변수는 이중 인용문 내에 래핑해야합니다.

```js twoslash
import 'vite/client'
// ---자르다---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### 명시적인 URL 가져 오기

내부 목록이나 `assetsInclude` 에 포함되지 않은 자산은 `?url` 접미사를 사용하여 URL로 명시 적으로 가져올 수 있습니다. 예를 들어 [Houdini Paint Worklet을](https://developer.mozilla.org/en-US/docs/Web/API/CSS/paintWorklet_static) 가져 오는 데 유용합니다.

```js twoslash
import 'vite/client'
// ---자르다---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### 명백한 인라인 취급

자산은 각각 `?inline` 또는 `?no-inline` 접미사를 사용하여 인라인 또는 인라인이없는 것으로 명시 적으로 가져올 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### 자산을 문자열로 가져옵니다

자산은 `?raw` 접미사를 사용하여 문자열로 가져올 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
import shaderString from './shader.glsl?raw'
```

### 작업자로서 스크립트 가져 오기

스크립트는 `?worker` 또는 `?sharedworker` 접미사를 가진 웹 작업자로 가져올 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
// 생산 빌드에서 별도의 덩어리
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---자르다---
// 공유 작업자
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---자르다---
// Base64 줄로 내려옵니다
import InlineWorker from './shader.js?worker&inline'
```

자세한 내용은 [웹 워커 섹션](./features.md#web-workers) 에서 확인하십시오.

## `public` 디렉토리

자산이있는 경우 :

- 소스 코드에서 참조되지 않았습니다 (예 : `robots.txt` )
- 정확히 동일한 파일 이름을 유지해야합니다 (해싱없이)
- ... 또는 URL을 얻기 위해 먼저 자산을 가져오고 싶지 않습니다.

그런 다음 자산을 프로젝트 루트 아래에 특수 `public` 디렉토리에 배치 할 수 있습니다. 이 디렉토리의 자산은 Dev 동안 루트 경로 `/` 에서 제공되며 Dist Directory의 루트에 복사됩니다.

디렉토리는 기본값이 `<root>/public` 으로 표시되지만 [`publicDir` 옵션을](/ko/config/shared-options.md#publicdir) 통해 구성 할 수 있습니다.

루트 절대 경로를 사용하여 항상 `public` 자산을 참조해야합니다. 예를 들어, `public/icon.png` 소스 코드에서 `/icon.png` 로 참조해야합니다.

## New URL (url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) 은 현재 모듈의 URL을 노출시키는 기본 ESM 기능입니다. 이를 기본 [URL 생성자](https://developer.mozilla.org/en-US/docs/Web/API/URL) 와 결합하면 JavaScript 모듈에서 상대 경로를 사용하여 정적 자산의 전체 고정 URL을 얻을 수 있습니다.

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

이것은 현대식 브라우저에서 기본적으로 작동합니다. 실제로 Vite는 개발 중에이 코드를 전혀 처리 할 필요가 없습니다!

이 패턴은 템플릿 리터럴을 통해 동적 URL을 지원합니다.

```js
function getImageUrl(name) {
  // 여기에는 하위 디렉토리에 파일이 포함되어 있지 않습니다
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

생산 빌드 중에 Vite는 필요한 변환을 수행하여 URL이 번들링 및 자산 해싱 후에도 올바른 위치를 가리 키도록합니다. 그러나 URL 문자열은 정적이어야하므로 분석 할 수 있어야합니다. 그렇지 않으면 코드가 그대로 남아 있으므로 `build.target` `import.meta.url` 하지 않으면 런타임 오류가 발생할 수 있습니다.

```js
// vite는 이것을 변형시키지 않습니다
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details How it works

Vite는 `getImageUrl` 기능을 다음과 같이 변환합니다.

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Does not work with SSR
서버 측 렌더링에 Vite를 사용하는 경우이 패턴은 작동하지 않습니다. `import.meta.url` 브라우저와 node.js에 시맨틱이 다르기 때문입니다. 서버 번들은 또한 클라이언트 호스트 URL을 미리 결정할 수 없습니다.
:::
