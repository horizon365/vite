# 왜 vite

## 문제

ES 모듈이 브라우저에서 제공되기 전에 개발자는 모듈화 된 방식으로 JavaScript를 작성하기위한 기본 메커니즘이 없었습니다. 그렇기 때문에 우리는 "번들링"이라는 개념에 익숙한 이유입니다. 소스 모듈을 브라우저에서 실행할 수있는 파일로 크롤링, 처리 및 연결하는 도구를 사용합니다.

시간이 지남에 따라 우리는 [Webpack](https://webpack.js.org/) , [Rollup](https://rollupjs.org) 및 [Parcel](https://parceljs.org/) 과 같은 도구를 보았으며, 이는 프론트 엔드 개발자의 개발 경험을 크게 향상 시켰습니다.

그러나 점점 더 야심 찬 응용 프로그램을 구축함에 따라 우리가 다루고있는 JavaScript의 양도 극적으로 증가하고 있습니다. 대규모 프로젝트에 수천 개의 모듈을 포함하는 것은 드문 일이 아닙니다. 우리는 JavaScript 기반 툴링의 성능 병목 현상을 시작하고 있습니다. Dev 서버를 회전시키는 데 부당하게 대기 시간 (때로는 몇 분까지)이 걸리고 핫 모듈 교체 (HMR)를 사용하더라도 파일 편집은 브라우저에 반영하는 데 몇 초가 걸릴 수 있습니다. 느린 피드백 루프는 개발자의 생산성과 행복에 큰 영향을 줄 수 있습니다.

Vite는 생태계의 새로운 발전을 활용하여 이러한 문제를 해결하는 것을 목표로합니다. 브라우저의 기본 ES 모듈의 가용성 및 Compile-to Native 언어로 작성된 JavaScript 도구의 상승.

### 서버 시작 느린 시작

개발자 서버를 콜드 스타트하면 번들 기반 빌드 설정은 제공되기 전에 응용 프로그램 전체를 간절히 크롤링하고 구축해야합니다.

vite는 먼저 응용 프로그램의 모듈을 응용 프로그램 **의 종속성** 및 **소스 코드의** 두 가지 범주로 나누어 Dev 서버 시작 시간을 향상시킵니다.

- **종속성은** 대부분 개발 중에 자주 변하지 않는 평범한 JavaScript입니다. 일부 대규모 의존성 (예 : 수백 개의 모듈이있는 구성 요소 라이브러리)도 처리 비용이 많이 듭니다. 종속성은 다양한 모듈 형식 (예 : ESM 또는 CommonJS)으로 배송 될 수도 있습니다.

  [Esbuild를](https://esbuild.github.io/) 사용한 Vite [Pre-Bundles 종속성](./dep-pre-bundling.md) . Esbuild는 JavaScript 기반 Bundlers보다 Go 및 Pre-Bundles Dependencies 10-100 배 빠릅니다.

- **소스 코드** 에는 종종 변환이 필요한 비정형 JavaScript (예 : JSX, CSS 또는 VUE/Svelte 구성 요소)가 포함되어 있으며 매우 자주 편집됩니다. 또한 모든 소스 코드를 동시에로드 할 필요는 없습니다 (예 : 경로 기반 코드 분할 포함).

  Vite는 [기본 ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) 을 통해 소스 코드를 제공합니다. 이는 본질적으로 브라우저가 번들링 작업에 참여하게 할 수 있습니다. Vite는 브라우저가 요청대로 소스 코드를 변환하고 제공하면됩니다. 조건부 동적 가져 오기 뒤에있는 코드는 현재 화면에서 실제로 사용되는 경우에만 처리됩니다.

<script setup>
import bundlerSvg from '../../images/bundler.svg?raw'
import esmSvg from '../../images/esm.svg?raw'
</script>
<svg-image :svg="bundlerSvg" />
<svg-image :svg="esmSvg" />

### 느린 업데이트

번들러 기반 빌드 설정에서 파일을 편집하면 명백한 이유로 전체 번들을 재구성하는 것이 비효율적입니다. 업데이트 속도는 앱의 크기로 선형으로 저하됩니다.

일부 번들링에서 Dev 서버는 묶음을 메모리에서 실행하여 파일이 변경 될 때 모듈 그래프의 일부만 무효화해야하지만 여전히 전체 번들을 다시 구성하고 웹 페이지를 다시로드해야합니다. 번들을 재구성하는 데 비용이 많이들 수 있으며 페이지를 다시로드하면 응용 프로그램의 현재 상태가 날아갑니다. 그렇기 때문에 일부 Bundlers는 HMR (Hot Module Replacement)을 지원하는 이유입니다. 모듈이 나머지 페이지에 영향을 미치지 않고 "핫 교체"자체를 허용합니다. 이것은 DX를 크게 향상시킵니다. 그러나 실제로 우리는 응용 프로그램의 크기가 커짐에 따라 HMR 업데이트 속도조차도 크게 악화된다는 것을 발견했습니다.

Vite에서 HMR은 기본 ESM을 통해 수행됩니다. 파일이 편집되면 Vite는 편집 된 모듈과 가장 가까운 HMR 경계 (대부분 모듈 자체 만) 사이의 체인을 정확하게 무효화하기 만하면 응용 프로그램의 크기에 관계없이 HMR 업데이트가 일관되게 빠르게 만들어집니다.

Vite는 또한 HTTP 헤더를 활용하여 전체 페이지 재 장전 속도를 높이기 위해 (다시 브라우저가 더 많은 작업을 수행하도록하십시오) : 소스 코드 모듈 요청은 `304 Not Modified` 통해 조건부로 이루어지고 종속성 모듈 요청은 `Cache-Control: max-age=31536000,immutable` 통해 강력하게 캐싱되므로 일단 서버를 다시 치지 않습니다.

일단 Vite가 얼마나 빠른지를 경험하면, 우리는 당신이 번들로운 개발을 기꺼이 참을 것이라는 것을 의심합니다.

## 생산을위한 번들

기본 ESM이 현재 널리 지원 되더라도 중첩 된 수입으로 인한 추가 네트워크 라운드 트립으로 인해 생산에서 배송되지 않은 ESM이 여전히 비효율적입니다 (HTTP/2). 생산에서 최적의 로딩 성능을 얻으려면 여전히 코드를 트리 쉐이킹, 게으른로드 및 일반적인 청크 분할 (더 나은 캐싱)으로 묶는 것이 좋습니다.

Dev 서버와 생산 빌드 사이의 최적의 출력과 행동 일관성을 보장하는 것은 쉽지 않습니다. 이것이 바로 Vite가 상자 밖에서 많은 [성능 최적화](./features.md#build-optimizations) 에서 굽는 사전 구성된 [빌드 명령을](./build.md) 제공하는 이유입니다.

## Esbuild와 함께 번들이 아닌 이유는 무엇입니까?

Vite는 Esbuild를 활용하여 [Dev의 일부 의존성을 사전 번들](./dep-pre-bundling.md) 로 비추는 반면 Vite는 Esbuild를 생산 빌드를위한 번들로 사용하지 않습니다.

Vite의 현재 플러그인 API는 Bundler로 `esbuild` 사용하는 것과 호환되지 않습니다. `esbuild` 더 빠르지 않았음에도 불구하고 Vite는 롤업의 유연한 플러그인 API 및 인프라를 채택하면 생태계에서의 성공에 크게 기여했습니다. 당분간, 우리는 롤업이 더 나은 성능 -VS- 융통성 트레이드 오프를 제공한다고 생각합니다.

롤업은 또한 성능 향상을 위해 노력하여 [파서를 V4의 SWC로 전환했습니다](https://github.com/rollup/rollup/pull/5073) . 그리고 롤 다운이라는 롤업의 녹스 포트를 구축하려는 지속적인 노력이 있습니다. 롤 다운이 준비되면 Vite의 롤업과 Esbuild를 모두 교체하여 빌드 성능을 크게 향상시키고 개발과 빌드 사이의 불일치를 제거 할 수 있습니다. [자세한 내용은 Evan의 Viteconf 2023 기조 연설을](https://youtu.be/hrdwQHoAp0M) 볼 수 있습니다.

## Vite는 다른 Unbundled 빌드 도구와 어떤 관련이 있습니까?

PreAct 팀의 [WMR은](https://github.com/preactjs/wmr) 유사한 기능 세트를 제공하려고했습니다. Vite의 Dev and Build 용 Vite의 범용 롤업 플러그인 API는 영감을 받았습니다. WMR은 더 이상 유지되지 않습니다. PreAct 팀은 이제 [@preactjs/preset-vite를](https://github.com/preactjs/preset-vite) 사용하여 Vite를 추천합니다.

[Snowpack](https://www.snowpack.dev/) 은 또한 Bundle Native ESM Dev 서버로 Vite와 매우 유사했습니다. Vite의 의존성 프리 묶음은 또한 Snowpack V1 (현재 [`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall) )에서 영감을 얻었습니다. 스노우 팩은 더 이상 유지되지 않습니다. Snowpack 팀은 현재 Vite가 구동하는 정적 사이트 빌더 인 [Astro](https://astro.build/) 에서 작업하고 있습니다.

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/) (이전 `es-dev-server` )는 훌륭한 프로젝트이며 Vite 1.0의 KOA 기반 서버 설정은 영감을 받았습니다. `@web` 우산 프로젝트는 적극적으로 유지 관리되며 Vite 사용자에게도 도움이 될 수있는 많은 우수한 도구가 포함되어 있습니다.
