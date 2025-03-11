# 시작하기

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## 개요

Vite (French word for "quick", pronounced `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>, like "veet") is a build tool that aims to provide a faster and leaner development experience for modern web projects. It consists of two major parts:

- [기본 ES 모듈](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (예 [: HMR)과 같은 기본 ES 모듈](./features#hot-module-replacement) 에 대한 [풍부한 기능 향상을](./features) 제공하는 개발자 서버.

- 생산을 위해 고도로 최적화 된 정적 자산을 출력하도록 사전 구성된 [롤업](https://rollupjs.org) 과 함께 코드를 묶는 빌드 명령.

Vite는 의견이 있으며 상자 밖에서 현명한 기본값이 제공됩니다. [기능 가이드](./features) 에서 가능한 것에 대해 읽으십시오. [플러그인을](./using-plugins) 통해 프레임 워크 지원 또는 다른 도구와의 통합이 가능합니다. [구성 섹션은](../config/) 필요한 경우 프로젝트에 Vite를 조정하는 방법을 설명합니다.

Vite는 [플러그인 API](./api-plugin) 및 [JavaScript API](./api-javascript) 를 통해 전체 타이핑 지원을 통해 확장 가능합니다.

[Why Vite](./why) Section에서 프로젝트의 이론적 근거에 대해 자세히 알아볼 수 있습니다.

## 브라우저 지원

개발 중에 Vite는 최신 브라우저가 사용되었다고 가정하고 모든 최신 JavaScript 및 CSS 기능을 지원하기 때문에 [`esnext` 변환 대상으로](https://esbuild.github.io/api/#target) 설정합니다. 이로 인해 구문이 낮아지면 Vite가 원래 소스 코드에 최대한 가깝게 모듈을 제공 할 수 있습니다.

생산 빌드의 경우 기본적으로 Vite는 [기본 ES 모듈](https://caniuse.com/es6-module) , [기본 ESM Dynamic Import](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [Nullish Coalescing](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) 및 [Bigint](https://caniuse.com/bigint) 와 같은 최신 JavaScript를 지원하는 브라우저를 대상으로합니다. 레거시 브라우저는 공식 [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) 를 통해 지원할 수 있습니다. 자세한 내용은 [생산 섹션의 건물을](./build) 참조하십시오.

## 온라인으로 Vite를 시도합니다

[Stackblitz](https://vite.new/) 에서 Vite Online을 사용해 볼 수 있습니다. 브라우저에서 Vite 기반 빌드 설정을 직접 실행하므로 로컬 설정과 거의 동일하지만 컴퓨터에 아무것도 설치할 필요가 없습니다. `vite.new/{template}` 으로 이동하여 사용할 프레임 워크를 선택할 수 있습니다.

지원되는 템플릿 사전 설정은 다음과 같습니다.

|           자바 스크립트            |                TypeScript                 |
| :--------------------------------: | :---------------------------------------: |
| [바닐라](https://vite.new/vanilla) | [바닐라 -ts](https://vite.new/vanilla-ts) |
|    [vue](https://vite.new/vue)     |     [vue-ts](https://vite.new/vue-ts)     |
|   [반응](https://vite.new/react)   |   [React-ts](https://vite.new/react-ts)   |
| [preact](https://vite.new/preact)  |  [preact-ts](https://vite.new/preact-ts)  |
|    [문학](https://vite.new/lit)    |     [lit-ts](https://vite.new/lit-ts)     |
| [날씬한](https://vite.new/svelte)  |  [svelte-ts](https://vite.new/svelte-ts)  |
|  [단단한](https://vite.new/solid)  |     [고체](https://vite.new/solid-ts)     |
|   [QWIK](https://vite.new/qwik)    |    [QWIK-TS](https://vite.new/qwik-ts)    |

## 첫 번째 vite 프로젝트 스캐 폴딩

::: tip Compatibility Note
Vite에는 [Node.js](https://nodejs.org/ko/) 버전 18+ 또는 20+가 필요합니다. 그러나 일부 템플릿은 작동하려면 더 높은 Node.js 버전이 필요합니다. 패키지 관리자가 경고하면 업그레이드하십시오.
:::

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

그런 다음 프롬프트를 따르십시오!

추가 명령 줄 옵션을 통해 사용하려는 프로젝트 이름과 템플릿을 직접 지정할 수도 있습니다. 예를 들어, Vite + Vue 프로젝트를 발판하려면 실행하십시오.

::: code-group

```bash [npm]
# NPM 7+, 추가 이중계가 필요합니다.
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

각 지원되는 각 템플릿에 대한 자세한 내용은 [생성 VITE를](https://github.com/vitejs/vite/tree/main/packages/create-vite) 참조하십시오 : `vanilla` , `vanilla-ts` , `vue` , `vue-ts` , `react` , `react-ts` , `react-swc` , `react-swc-ts` , `preact` , `preact-ts` , `lit` , `lit-ts` , `svelte` , `svelte-ts` , `solid` , `solid-ts` , `qwik` , `qwik-ts`

현재 디렉토리에서 프로젝트 이름의 스캐 폴드에 `.` 사용할 수 있습니다.

## 커뮤니티 템플릿

Create-Vite는 인기있는 프레임 워크를위한 기본 템플릿에서 프로젝트를 신속하게 시작하는 도구입니다. 다른 도구 또는 다른 프레임 워크를 포함하는 [커뮤니티 유지 관리 템플릿을](https://github.com/vitejs/awesome-vite#templates) 위한 멋진 Vite를 확인하십시오.

`https://github.com/user/project` 의 템플릿의 경우 `https://github.stackblitz.com/user/project` (프로젝트의 URL에 `github` 후 `.stackblitz` 추가)을 사용하여 온라인으로 시도해 볼 수 있습니다.

[Degit과](https://github.com/Rich-Harris/degit) 같은 도구를 사용하여 템플릿 중 하나를 사용하여 프로젝트를 발판 할 수 있습니다. 프로젝트가 github에 있고 기본 분기로 `main` 사용한다고 가정하면 다음을 사용하여 로컬 사본을 만들 수 있습니다.

```bash
npx degit user/project#메인 내 프로젝트
cd my-project

npm install
npm run dev
```

## 수동 설치

프로젝트에서 다음을 사용하여 `vite` CLI를 설치할 수 있습니다.

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

다음과 같은 `index.html` 파일을 만듭니다.

```html
<p>Hello Vite!</p>
```

그런 다음 터미널에서 적절한 CLI 명령을 실행하십시오.

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

:::

`index.html` `http://localhost:5173` 에 제공됩니다.

## `index.html` 및 프로젝트 루트

당신이 알아 차린 한 가지는 Vite 프로젝트에서 `index.html` `public` 내부에 집어 넣는 대신 앞면 중앙이라는 것입니다. 이것은 의도적입니다 : 개발 중에 Vite는 서버이고 `index.html` 응용 프로그램의 진입 점입니다.

Vite는 `index.html` 소스 코드 및 모듈 그래프의 일부로 취급합니다. JavaScript 소스 코드를 참조하는 `<script type="module" src="...">` 해결합니다. `<link href>` 통해 참조 된 Inline `<script type="module">` 와 CSS조차도 Vite 특유의 기능을 즐깁니다. 또한 `index.html` 내부의 URL은 자동으로 재조정되므로 특별 `%PUBLIC_URL%` 자리 표시자가 필요하지 않습니다.

정적 HTTP 서버와 유사하게 Vite는 파일이 제공되는 "루트 디렉토리"개념을 가지고 있습니다. 당신은 그것이 문서의 나머지 부분에서 `<root>` 으로 참조 할 것입니다. 소스 코드의 절대 URL은 프로젝트 루트를 기본으로 사용하여 해결되므로 일반적인 정적 파일 서버로 작업하는 것처럼 코드를 작성할 수 있습니다 (더 강력한 방법을 제외하고). Vite는 또한 root 외부 파일 시스템 위치로 해결되는 종속성을 처리 할 수 있으므로 Monorepo 기반 설정에서도 사용할 수 있습니다.

Vite는 또한 여러 `.html` 입력 지점이있는 [다중 페이지 앱](./build#multi-page-app) 도 지원합니다.

#### 대체 루트 지정

실행 `vite` 현재 작업 디렉토리를 루트로 사용하여 개발 서버를 시작합니다. `vite serve some/sub/dir` 으로 대체 루트를 지정할 수 있습니다.
VITE는 프로젝트 루트 내부 [의 구성 파일 (예 : `vite.config.js` )을](/ko/config/#configuring-vite) 해결하므로 루트가 변경되면 이동해야합니다.

## 명령 줄 인터페이스

Vite가 설치된 프로젝트에서는 NPM 스크립트에서 `vite` 바이너리를 사용하거나 `npx vite` 으로 직접 실행할 수 있습니다. 다음은 스캐 폴드 Vite 프로젝트의 기본 NPM 스크립트입니다.

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

`--port` 또는 `--open` 같은 추가 CLI 옵션을 지정할 수 있습니다. CLI 옵션의 전체 목록을 보려면 프로젝트에서 `npx vite --help` 실행하십시오.

[명령 줄 인터페이스](./cli.md) 에 대해 자세히 알아보십시오

## 미공개 커밋을 사용합니다

최신 기능을 테스트하기 위해 새 릴리스가 기다릴 수 없다면 https://pkg.pr.new를 사용하여 특정 Vite 커밋을 설치할 수 있습니다.

::: code-group

```bash [npm]
$ npm install -D https://pkg.pr.new/vite@SHA
```

```bash [Yarn]
$ yarn add -D https://pkg.pr.new/vite@SHA
```

```bash [pnpm]
$ pnpm add -D https://pkg.pr.new/vite@SHA
```

```bash [Bun]
$ bun add -D https://pkg.pr.new/vite@SHA
```

:::

[Vite의 Commit Shas](https://github.com/vitejs/vite/commits/main/) 로 `SHA` 교체하십시오. 오래된 커밋 릴리스가 제거되므로 지난 달에 커밋 만 작동합니다.

또는 [Vite Repo를](https://github.com/vitejs/vite) 로컬 컴퓨터로 복제 한 다음 직접 빌드하여 연결할 수도 있습니다 ( [PNPM](https://pnpm.io/) 이 필요함).

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # 이 단계에서 선호하는 패키지 관리자를 사용하십시오
```

그런 다음 Vite 기반 프로젝트로 이동하여 `pnpm link --global vite` (또는 전 세계적으로 `vite` 연결하는 데 사용한 패키지 관리자)을 실행하십시오. 이제 개발 서버를 다시 시작하여 출혈 가장자리를 타십시오!

::: tip Dependencies using Vite
종속성에서 사용하는 VITE 버전을 전환 적으로 교체하려면 [NPM 재정의](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides) 또는 [PNPM 재정의](https://pnpm.io/package_json#pnpmoverrides) 사용을 사용해야합니다.
:::

## 지역 사회

질문이 있거나 도움이 필요한 경우 [Discord](https://chat.vite.dev) 및 [Github 토론](https://github.com/vitejs/vite/discussions) 에서 커뮤니티에 연락하십시오.
