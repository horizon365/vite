# 프로젝트 철학

## 린 확장 가능한 코어

Vite는 모든 사용자의 모든 사용 사례를 다루는 것은 아닙니다. Vite는 가장 일반적인 패턴을 지원하기 위해 가장 일반적인 패턴을 지원하는 것을 목표로합니다. 웹 앱을 기본으로 구축하는 것을 목표로하지만 [Vite Core는](https://github.com/vitejs/vite) 프로젝트를 장기적으로 유지할 수 있도록 작은 API 표면으로 린 상태를 유지해야합니다. [Vite의 롤업 기반 플러그인 시스템](./api-plugin.md) 덕분 에이 목표는 가능합니다. 외부 플러그인으로 구현할 수있는 기능은 일반적으로 Vite Core에 추가되지 않습니다. [Vite-Plugin-PWA는](https://vite-pwa-org.netlify.app/) Vite Core에서 달성 할 수있는 것의 훌륭한 예이며, 귀하의 요구를 충족시키기위한 [잘 관리 된 플러그인이](https://github.com/vitejs/awesome-vite#plugins) 많이 있습니다. Vite는 롤업 프로젝트와 긴밀히 협력하여 가능한 한 Plain Rollup 및 Vite 프로젝트에서 플러그인을 사용할 수 있도록하여 가능한 한 플러그인 API에 필요한 확장을 푸시하려고합니다.

## 현대 웹을 추진합니다

Vite는 현대 코드를 작성하는 의견이 많은 기능을 제공합니다. 예를 들어:

- 소스 코드는 ESM으로만 작성할 수 있으며, 이곳에서 비 ESM 종속성은 작동하기 위해 [ESM으로 사전 구매](./dep-pre-bundling) 해야합니다.
- 웹 작업자는 현대 표준을 준수하기 위해 [`new Worker` 구문](./features#web-workers) 으로 작성하도록 권장됩니다.
- 브라우저에서는 node.js 모듈을 사용할 수 없습니다.

새로운 기능을 추가 할 때 이러한 패턴을 따라 향후 방지 API를 만들어 다른 빌드 도구와 항상 호환되지 않을 수 있습니다.

## 성능에 대한 실용적인 접근

Vite는 [기원](./why.md) 이후 성능에 중점을 두었습니다. DEV 서버 아키텍처를 통해 프로젝트 규모로 빠르게 유지되는 HMR을 허용합니다. Vite는 [Esbuild](https://esbuild.github.io/) 및 [SWC](https://github.com/vitejs/vite-plugin-react-swc) 와 같은 기본 도구를 사용하여 집중 작업을 구현하지만 JS의 나머지 코드를 유지하여 속도와 유연성을 균형을 유지합니다. 필요한 경우 프레임 워크 플러그인이 [바벨](https://babeljs.io/) 을 탭하여 사용자 코드를 컴파일합니다. 그리고 빌드 시간 동안 Vite는 현재 롤업 크기와 넓은 플러그인 생태계에 액세스 할 수있는 [롤업을](https://rollupjs.org/) 사용합니다. Vite는 API를 안정적으로 유지하면서 DX를 개선하는 것으로 보이는 새 라이브러리를 사용하여 내부적으로 계속 발전 할 것입니다.

## Vite 위에 프레임 워크를 구축합니다

Vite는 사용자가 직접 사용할 수 있지만 프레임 워크를 만드는 도구로 빛납니다. vite core는 프레임 워크의 무자비하지만 각 UI 프레임 워크에 대한 연마 된 플러그인이 있습니다. [JS API](./api-javascript.md) 를 통해 앱 프레임 워크 저자는 Vite 기능을 사용하여 사용자를위한 맞춤형 경험을 만들 수 있습니다. Vite에는 일반적으로 높은 수준의 도구에 존재하지만 현대적인 웹 프레임 워크를 구축하는 데 기본적인 [SSR 프리미티브](./ssr.md) 에 대한 지원이 포함되어 있습니다. Vite 플러그인은 프레임 워크간에 공유 할 수있는 방법을 제공하여 그림을 완성합니다. Vite는 또한 [Ruby](https://vite-ruby.netlify.app/) 및 [Laravel](https://laravel.com/docs/10.x/vite) 과 같은 [백엔드 프레임 워크](./backend-integration.md) 와 쌍을 이룰 때도 적합합니다.

## 활발한 생태계

Vite Evolution은 프레임 워크와 플러그인 관리자, 사용자 및 Vite 팀 간의 협력입니다. 프로젝트가 Vite를 채택한 후 Vite의 핵심 개발에 적극적으로 참여할 것을 권장합니다. 우리는 생태계의 주요 프로젝트와 긴밀히 협력하여 [Vite-Ecosystem-CI](https://github.com/vitejs/vite-ecosystem-ci) 와 같은 도구를 통해 각 릴리스의 회귀를 최소화합니다. 이를 통해 선택된 PRS에서 VITE를 사용하여 주요 프로젝트의 CI를 실행할 수 있으며 생태계가 릴리스에 어떻게 반응하는지 명확하게 설명합니다. 우리는 사용자를 때리기 전에 회귀 분석을 수정하고 프로젝트가 출시 되 자마자 다음 버전으로 업데이트하도록 허용합니다. Vite와 함께 일하는 경우 [Vite의 불화](https://chat.vite.dev) 에 가입하여 프로젝트에 참여하도록 초대합니다.
