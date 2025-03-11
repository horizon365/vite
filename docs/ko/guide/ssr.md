# 서버 측 렌더링 (SSR)

:::tip Note
SSR은 구체적으로 Node.js에서 동일한 응용 프로그램을 실행하고 HTML로 사전 렌더링하고 마지막으로 클라이언트에서 수화하는 것을 지원하는 프론트 엔드 프레임 워크 (예 : React, Preact, Vue 및 Svelte)를 지칭합니다. 기존 서버 측 프레임 워크와의 통합을 찾고 있다면 대신 [백엔드 통합 안내서를](./backend-integration) 확인하십시오.

다음 안내서는 또한 선택 프레임 워크에서 SSR과의 작업 경험을 가정하며 Vite 별 통합 세부 사항에만 중점을 둘 것입니다.
:::

:::warning Low-level API
이것은 라이브러리 및 프레임 워크 저자를위한 저수준 API입니다. 목표가 애플리케이션을 작성하는 것이라면 [Awesome Vite SSR 섹션](https://github.com/vitejs/awesome-vite#ssr) 에서 먼저 상위 수준의 SSR 플러그인 및 도구를 확인하십시오. 즉, 많은 응용 프로그램이 Vite의 기본 저수준 API 위에 직접 구축됩니다.

현재 Vite는 [Environment API를](https://github.com/vitejs/vite/discussions/16358) 사용하여 개선 된 SSR API를 작업하고 있습니다. 자세한 내용은 링크를 확인하십시오.
:::

## 예제 프로젝트

Vite는 서버 측 렌더링 (SSR)에 대한 내장 지원을 제공합니다. [`create-vite-extra`](https://github.com/bluwy/create-vite-extra) 이 안내서에 대한 참조로 사용할 수있는 SSR 설정 예제가 포함되어 있습니다.

- [바닐라](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [반응](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [preact](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [날씬한](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [단단한](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

또한 [`create-vite` 실행](./index.md#scaffolding-your-first-vite-project) 하여 로컬 로이 프로젝트를 발판하고 프레임 워크 옵션에서 `Others > create-vite-extra` 선택할 수 있습니다.

## 소스 구조

일반적인 SSR 애플리케이션에는 다음과 같은 소스 파일 구조가 있습니다.

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

`index.html` 은 `entry-client.js` 참조해야하며 서버 렌더링 된 마크 업을 주입 해야하는 자리 표시자를 포함시킵니다.

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

정확하게 교체 할 수있는 한 `<!--ssr-outlet-->` 대신 선호하는 자리 표시자를 사용할 수 있습니다.

## 조건부 논리

SSR 대 클라이언트를 기반으로 조건부 논리를 수행 해야하는 경우 사용할 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
if (import.meta.env.SSR) {
  // ... 서버 전용 로직
}
```

이것은 빌드 중에 정적으로 교체되므로 사용하지 않은 가지의 나무를 흔들어 줄 수 있습니다.

## 개발자 서버 설정

SSR 앱을 구축 할 때는 기본 서버를 완전히 제어하고 프로덕션 환경에서 Vite를 해체하려고합니다. 따라서 미들웨어 모드에서 Vite를 사용하는 것이 좋습니다. 다음은 [Express](https://expressjs.com/) (v4)의 예입니다.

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

여기 `vite` [Vitedevserver](./api-javascript#vitedevserver) 의 인스턴스입니다. `vite.middlewares` Connect-Compative Node.js 프레임 워크에서 미들웨어로 사용할 수있는 [Connect](https://github.com/senchalabs/connect) 인스턴스입니다.

다음 단계는 서버 렌더링 된 HTML을 제공하기 위해 `*` 핸들러를 구현하는 것입니다.

```js twoslash [server.js]
// @noErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import ( 'Express'). Express} */
var app
/** @type {import ( 'vite'). vitedevserver}  */
var vite

// ---자르다---
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. index.html을 읽습니다
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. vite html 변환을 적용하십시오. 이것은 Vite HMR 클라이언트를 주입합니다.
    //    또한 Vite 플러그인에서 HTML 변환을 적용합니다 (예 : 글로벌
    //    @vitejs/plugin-react의 프리앰블
    template = await vite.transformIndexHtml(url, template)

    // 3. 서버 항목을로드하십시오. ssrloadmodule이 자동으로 변환됩니다
    //    node.js에서 사용할 수있는 ESM 소스 코드! 번들링이 없습니다
    //    HMR과 유사한 효율적인 무효화를 제공합니다.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. 앱 HTML 렌더링. 이것은 Entry-Server.js의 내보내기를 가정합니다
    //     `render` 함수는 적절한 프레임 워크 SSR API를 호출합니다.
    //    예를 들어 ReactDomserver.renderToString ()
    const appHtml = await render(url)

    // 5. 앱 렌더링 된 HTML을 템플릿에 주입하십시오.
    const html = template.replace(`<!--ssr-outlet-->`, () => appHtml)

    // 6. 렌더링 된 HTML을 다시 보내십시오.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // 오류가 잡히면 Vite가 스택 추적을 수정하여 뒤로 매핑합니다.
    // 실제 소스 코드에.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

`package.json` 인의 `dev` 스크립트도 대신 서버 스크립트를 사용하도록 변경해야합니다.

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## 생산을위한 건축

생산을위한 SSR 프로젝트를 배송하려면 다음을 수행해야합니다.

1. 정상적으로 클라이언트 빌드를 생성합니다.
2. Vite의 `ssrLoadModule` 통과 할 필요가 없도록 `import()` 통해 직접로드 할 수있는 SSR 빌드를 생성합니다.

`package.json` 의 스크립트는 다음과 같습니다.

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

참고 SSR 빌드임을 나타내는 `--ssr` 플래그. 또한 SSR 항목도 지정해야합니다.

그런 다음 `server.js` 에서 `process.env.NODE_ENV` 확인하여 생산 특정 논리를 추가해야합니다.

- 루트 `index.html` 읽는 대신 `dist/client/index.html` 템플릿으로 사용하십시오. 클라이언트 빌드에 대한 올바른 자산 링크가 포함되어 있으므로.

- `await vite.ssrLoadModule('/src/entry-server.js')` 대신 `import('./dist/server/entry-server.js')` 사용합니다 (이 파일은 SSR 빌드의 결과입니다).

- DEV 전용 조건부 분기 뒤에 `vite` Dev 서버의 생성 및 모든 사용을 이동 한 다음 `dist/client` 의 파일을 제공하기 위해 중간 전위를 제공하는 정적 파일을 추가하십시오.

작업 설정에 대한 [예제 프로젝트를](#example-projects) 참조하십시오.

## 예압 지시서 생성

`vite build` 빌드 출력 디렉토리에서 `.vite/ssr-manifest.json` 생성하는 `--ssrManifest` 플래그를 지원합니다.

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

위의 스크립트는 이제 클라이언트 빌드에 대해 `dist/client/.vite/ssr-manifest.json` 생성합니다 (예, SSR Manifest는 모듈 ID를 클라이언트 파일에 매핑하려면 클라이언트 빌드에서 생성됩니다). 매니페스트에는 모듈 ID의 매핑이 관련 청크 및 자산 파일에 포함됩니다.

매니페스트를 활용하기 위해 프레임 워크는 서버 렌더링 호출 중에 사용 된 구성 요소의 모듈 ID를 수집하는 방법을 제공해야합니다.

`@vitejs/plugin-vue` 상자 밖으로이를 지원하고 사용 된 구성 요소 모듈 ID를 연관된 VUE SSR 컨텍스트에 자동으로 등록합니다.

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules는 이제 렌더링 중에 사용 된 모듈 ID 세트입니다.
```

`server.js` 의 생산 지점에서 우리는 매니페스트를 `src/entry-server.js` 로 내보낸 `render` 기능으로 읽고 전달해야합니다. 이를 통해 비동기 경로에서 사용하는 파일에 대한 예압 지시를 렌더링 할 수있는 충분한 정보가 제공됩니다! 전체 예제는 [데모 소스를](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js) 참조하십시오. 이 정보를 [103 초기 힌트](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103) 에 사용할 수도 있습니다.

## 사전 렌더링 / SSG

특정 경로에 필요한 경로와 데이터가 미리 알려진 경우 프로덕션 SSR과 동일한 논리를 사용하여 이러한 경로를 정적 HTML로 사전 렌더링 할 수 있습니다. 이것은 또한 정적 사이트 생성 (SSG)의 형태로 간주 될 수 있습니다. 작업 예제는 [데모 프리 렌더 스크립트를](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/prerender.js) 참조하십시오.

## SSR 외부

종속성은 SSR을 실행할 때 기본적으로 Vite의 SSR 변환 모듈 시스템에서 "외부화"됩니다. 이것은 Dev와 Build의 속도를 높입니다.

예를 들어 Vite의 파이프 라인에 의해 의존성을 변환 해야하는 경우, Vite 기능이 트랜스 필드되지 않은 경우 사용되므로 [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal) 에 추가 할 수 있습니다.

연결된 종속성의 경우 Vite의 HMR을 활용하기 위해 기본적으로 외부화되지 않습니다. 예를 들어 링크되지 않은 것처럼 종속성을 테스트하는 것이 바람직하지 않은 경우 [`ssr.external`](../config/ssr-options.md#ssr-external) 에 추가 할 수 있습니다.

:::warning Working with Aliases
하나의 패키지를 다른 패키지로 리디렉션하는 별명을 구성한 경우 SSR 외부화 종속성에 대해 작동하도록 실제 `node_modules` 패키지를 별칭으로 만들 수 있습니다. [원사](https://classic.yarnpkg.com/ko/docs/cli/add/#toc-yarn-add-alias) 와 [PNPM은](https://pnpm.io/aliases/) 모두 `npm:` 접두사를 통해 별칭을 지원합니다.
:::

## SSR 특정 플러그인 로직

VUE 또는 Svelte 컴파일 컴파일 구성 요소와 같은 일부 프레임 워크는 클라이언트 대 SSR을 기반으로 다른 형식으로 구성됩니다. 조건부 변환을 지원하기 위해 Vite는 다음 플러그인 후크의 `options` 객체에 추가 `ssr` 속성을 전달합니다.

- `resolveId`
- `load`
- `transform`

**예:**

```js twoslash
/** @type {() => import ( 'vite'). 플러그인} */
// ---자르다---
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // SSR 특이 적 변환을 수행 ...
      }
    },
  }
}
```

`load` 과 `transform` 의 옵션 객체는 선택 사항이며 롤업은 현재이 객체를 사용하고 있지 않지만 향후 추가 메타 데이터로 이러한 후크를 확장 할 수 있습니다.

:::tip Note
vite 2.7 이전에 이것은 `options` 객체를 사용하는 대신 위치 `ssr` 매개 변수가있는 플러그인 후크에 알려졌습니다. 모든 주요 프레임 워크 및 플러그인이 업데이트되었지만 이전 API를 사용하여 구식 게시물을 찾을 수 있습니다.
:::

## SSR 대상

SSR 빌드의 기본 대상은 노드 환경이지만 웹 작업자에서 서버를 실행할 수도 있습니다. 패키지 입력 해상도는 각 플랫폼마다 다릅니다. `ssr.target` 세트를 `'webworker'` 로 사용하여 대상을 웹 워커로 구성 할 수 있습니다.

## SSR 번들

`webworker` Runtimes와 같은 경우 SSR 빌드를 단일 JavaScript 파일에 번들로 만들 수 있습니다. `ssr.noExternal` ~ `true` 설정 하여이 동작을 활성화 할 수 있습니다. 이것은 두 가지 일을 할 것입니다.

- 모든 종속성을 `noExternal` 으로 취급하십시오
- Node.js 내장이 가져 오면 오류를 던지십시오

## SSR은 조건을 해결합니다

기본적으로 패키지 입력 해상도는 SSR 빌드에 [`resolve.conditions`](../config/shared-options.md#resolve-conditions) 으로 설정된 조건을 사용합니다. [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions) 과 [`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions) 사용 하여이 동작을 사용자 정의 할 수 있습니다.

## Vite Cli

CLI 명령 `$ vite dev` 과 `$ vite preview` SSR 앱에도 사용할 수 있습니다. SSR 중간wares를 개발 서버와 [`configureServer`](/ko/guide/api-plugin#configureserver) 로, 미리보기 서버에 [`configurePreviewServer`](/ko/guide/api-plugin#configurepreviewserver) 으로 추가 할 수 있습니다.

:::tip Note
SSR 미들웨어가 Vite의 중간 전쟁 _후에_ 실행되도록 포스트 후크를 사용하십시오.
:::
