# 플러그인 API

Vite 플러그인은 몇 가지 추가 Vite 특정 옵션으로 롤업의 잘 설계된 플러그인 인터페이스를 확장합니다. 결과적으로 Vite 플러그인을 한 번 작성하여 Dev 및 Build에 모두 작동하도록 할 수 있습니다.

**아래 섹션을 읽기 전에 먼저 [롤업의 플러그인 문서를](https://rollupjs.org/plugin-development/) 살펴 보는 것이 좋습니다.**

## 플러그인 작성

Vite는 상자 밖에서 확립 된 패턴을 제공하기 위해 노력하므로 새 플러그인을 만들기 전에 [기능 안내서를](https://vite.dev/guide/features) 확인하여 필요가 있는지 확인하십시오. 또한 [호환 가능한 롤업 플러그인](https://github.com/rollup/awesome) 및 [Vite 특정 플러그인](https://github.com/vitejs/awesome-vite#plugins) 형식으로 사용 가능한 커뮤니티 플러그인을 검토하십시오.

플러그인을 만들 때는 `vite.config.js` 에서 플러그인을 인라인 할 수 있습니다. 새 패키지를 만들 필요가 없습니다. 플러그인이 프로젝트에 유용하다는 것을 알게되면 [생태계의](https://chat.vite.dev) 다른 사람들을 돕기 위해이를 공유하는 것을 고려하십시오.

::: tip
학습, 디버깅 또는 저작 플러그인은 프로젝트에 [Vite-Plugin-Inspect를](https://github.com/antfu/vite-plugin-inspect) 포함시키는 것이 좋습니다. Vite 플러그인의 중간 상태를 검사 할 수 있습니다. 설치 후 `localhost:5173/__inspect/` 방문하여 프로젝트의 모듈 및 변환 스택을 검사 할 수 있습니다. [Vite-Plugin-Inspect Docs](https://github.com/antfu/vite-plugin-inspect) 의 설치 지침을 확인하십시오.
![vite-plugin-inspect](/images/vite-plugin-inspect.png)
:::

## 규칙

플러그인이 Vite 특정 후크를 사용하지 않고 [호환 롤업 플러그인](#rollup-plugin-compatibility) 으로 구현할 수있는 경우 [롤업 플러그인 명명 규칙을](https://rollupjs.org/plugin-development/#conventions) 사용하는 것이 좋습니다.

- 롤업 플러그인에는 `rollup-plugin-` 접두사가있는 명확한 이름이 있어야합니다.
- package.json에 `rollup-plugin` 및 `vite-plugin` 키워드를 포함하십시오.

이것은 순수한 롤업 또는 WMR 기반 프로젝트에도 사용할 플러그인을 노출시킵니다.

Vite 만 플러그인 만 사용합니다

- Vite 플러그인에는 `vite-plugin-` 접두사가있는 명확한 이름이 있어야합니다.
- package.json에 `vite-plugin` 키워드를 포함하십시오.
- 플러그인 문서에 섹션을 포함하여 Vite 전용 플러그인 인 이유를 자세히 설명합니다 (예 : Vite 특정 플러그인 후크를 사용).

플러그인이 특정 프레임 워크에서만 작동하는 경우 이름이 접두사의 일부로 포함되어야합니다.

- VUE 플러그인의 경우 `vite-plugin-vue-` 접두사
- 반응 플러그인의 경우 `vite-plugin-react-` 접두사
- 0 스벨 플러그인의 경우 `vite-plugin-svelte-` 접두사

[가상 모듈 컨벤션](#virtual-modules-convention) 도 참조하십시오.

## 플러그인 구성

사용자는 프로젝트 `devDependencies` 에 플러그인을 추가하고 `plugins` 배열 옵션을 사용하여 구성합니다.

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

허위 플러그인은 무시되며 플러그인을 쉽게 활성화하거나 비활성화하는 데 사용할 수 있습니다.

`plugins` 여러 플러그인을 포함하여 사전 설정을 단일 요소로 허용합니다. 이는 여러 플러그인을 사용하여 구현되는 복잡한 기능 (프레임 워크 통합)에 유용합니다. 배열은 내부적으로 평평하게됩니다.

```js
// 프레임 워크 플루인
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## 간단한 예

:::tip
Vite/Rollup 플러그인을 실제 플러그인 객체를 반환하는 공장 기능으로 작성하는 것이 일반적입니다. 이 기능은 사용자가 플러그인의 동작을 사용자 정의 할 수있는 옵션을 허용 할 수 있습니다.
:::

### 사용자 정의 파일 유형 변환

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // 사용 가능한 경우 소스 맵을 제공합니다
        }
      }
    },
  }
}
```

### 가상 파일 가져 오기

[다음 섹션](#virtual-modules-convention) 의 예를 참조하십시오.

## 가상 모듈 컨벤션

가상 모듈은 일반적인 ESM 가져 오기 구문을 사용하여 빌드 시간 정보를 소스 파일에 전달할 수있는 유용한 체계입니다.

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // 필수, 경고와 오류로 나타납니다
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

JavaScript에서 모듈을 가져올 수 있습니다.

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Vite (및 롤업)의 가상 모듈은 컨벤션별 사용자를 대면 경로를 위해 `virtual:` 으로 접두사를 제공합니다. 가능하면 플러그인 이름은 생태계의 다른 플러그인과의 충돌을 피하기 위해 네임 스페이스로 사용해야합니다. 예를 들어, `vite-plugin-posts` 사용자에게 `virtual:posts` 또는 `virtual:posts/helpers` 가상 모듈을 가져와 시간 정보를 빌드 할 수 있도록 요청할 수 있습니다. 내부적으로 가상 모듈을 사용하는 플러그인은 롤업 생태계의 컨벤션 인 ID를 해결하는 동안 모듈 ID를 `\0` 로 접두사해야합니다. 이렇게하면 다른 플러그인이 ID를 처리하려고 시도하는 것을 방지하지 못하며 (노드 해상도와 같은) SourcEmaps와 같은 핵심 기능은이 정보를 사용하여 가상 모듈과 일반 파일을 구별 할 수 있습니다. `\0` Import URL에서 허용 된 숯이 아니므로 가져 오기 분석 중에 교체해야합니다. `\0{id}` 가상 ID는 브라우저에서 개발 중 `/@id/__x00__{id}` 으로 인코딩됩니다. 플러그인 파이프 라인을 입력하기 전에 ID가 다시 해독되므로 플러그인 후크 코드에서는 표시되지 않습니다.

단일 파일 구성 요소의 스크립트 모듈의 경우 (.Vue 또는 .svelte SFC와 같은)이 컨벤션을 따를 필요는 없습니다. SFC는 일반적으로 처리 될 때 일련의 서브 모듈을 생성하지만 이들의 코드는 파일 시스템에 다시 매핑 될 수 있습니다. 이 서브 모듈에 `\0` 사용하면 Sourcemaps가 올바르게 작동하지 않습니다.

## 보편적 고리

Dev 동안 Vite Dev 서버는 [롤업 빌드 후크를](https://rollupjs.org/plugin-development/#build-hooks) 호출하는 플러그인 컨테이너를 만듭니다.

서버 시작에서 다음 후크가 한 번 호출됩니다.

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

다음 후크는 각 들어오는 모듈 요청에서 호출됩니다.

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

이 후크에는 추가 Vite 특이 적 특성이있는 확장 된 `options` 매개 변수가 있습니다. [SSR 문서](/ko/guide/ssr#ssr-specific-plugin-logic) 에서 자세한 내용을 읽을 수 있습니다.

Vite의 Unbundled Dev 서버 패턴으로 인해 실제 수입업자를 항상 도출 할 수는 없기 때문에 일부 `resolveId` 호출 ' `importer` 값은 루트의 일반 `index.html` 의 절대 경로 일 수 있습니다. Vite의 Resolve Pipeline 내에서 처리 된 수입의 경우 수입업자를 가져 오기 분석 단계에서 추적하여 올바른 `importer` 값을 제공 할 수 있습니다.

서버가 닫힐 때 다음 후크가 호출됩니다.

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

Vite는 더 나은 성능을 위해 완전한 AST 구문 분석을 피하기 때문에 [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) 후크는 호출되지 **않습니다** .

[출력 생성 후크](https://rollupjs.org/plugin-development/#output-generation-hooks) ( `closeBundle` 제외)는 개발 중에 호출되지 **않습니다** . Vite의 Dev Server `bundle.generate()` 호출하지 않고 `rollup.rollup()` 만 호출한다고 생각할 수 있습니다.

## vite 특정 후크

Vite 플러그인은 또한 Vite 특정 목적을 제공하는 후크를 제공 할 수 있습니다. 이 후크는 롤업으로 무시됩니다.

### `config`

- **유형 :** `(config : userconfig, env : {mode : string, command : String}) => UserConfig | 널 | 무효
- **종류 :** `async` , `sequential`

  Vite 구성이 해결되기 전에 수정하십시오. 후크는 원시 사용자 구성 (CLI 옵션이 구성 파일과 병합)과 사용중인 `mode` 과 `command` 노출시키는 현재 구성 ENV를 수신합니다. 기존 구성에 깊이 병합 될 부분 구성 객체를 반환하거나 구성을 직접 돌연변이 할 수 있습니다 (기본 합병이 원하는 결과를 얻을 수없는 경우).

  **예:**

  ```js
  // 부분 구성 반환 (권장)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // 구성을 직접 돌연변이합니다 (병합이 작동하지 않는 경우에만 사용)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning Note
  이 후크를 실행하기 전에 사용자 플러그인이 해결되므로 `config` 후크 내부의 다른 플러그인을 주입하면 효과가 없습니다.
  :::

### `configResolved`

- **유형 :** `(config : resolvedConfig) => void | 약속하다<void> `
- **종류 :** `async` , `parallel`

  VITE 구성이 해결 된 후 호출됩니다. 이 후크를 사용하여 최종 해결 된 구성을 읽고 저장하십시오. 플러그인이 실행중인 명령에 따라 다른 작업을 수행해야 할 때도 유용합니다.

  **예:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // 해결 된 구성을 저장하십시오
        config = resolvedConfig
      },

      // 다른 후크에 저장된 구성을 사용하십시오
      transform(code, id) {
        if (config.command === 'serve') {
          // DEV : Dev Server에서 호출 한 플러그인
        } else {
          // 빌드 : 롤업으로 플러그인이 호출됩니다
        }
      },
    }
  }
  ```

  `command` 값은 DEV에서 `serve` 입니다 (CLI `vite` , `vite dev` 및 `vite serve` 별칭입니다).

### `configureServer`

- **유형 :** `(서버 : vitedevserver) => (() => void) | 무효의 | 약속 <(() => void) | void>`
- **종류 :** `async` , `sequential`
- [Vitedevserver](./api-javascript#vitedevserver) **도 참조하십시오**

  Dev 서버 구성을위한 후크. 가장 일반적인 사용 사례는 내부 [Connect](https://github.com/senchalabs/connect) 앱에 사용자 정의 중간 전쟁을 추가하는 것입니다.

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 사용자 정의 핸들 요청 ...
      })
    },
  })
  ```

  **포스트 미들웨어 주입**

  내부 중간 전쟁이 설치되기 전에 `configureServer` 후크가 호출되므로 사용자 정의 중간계는 기본적으로 내부 중간 전쟁 전에 실행됩니다. 내부 중간 전쟁 **후** 미들웨어를 주입하려면 `configureServer` 에서 함수를 반환 할 수 있으며 내부 중간 전위가 설치된 후 호출됩니다.

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // 내부 중간 전쟁 이후에 호출되는 포스트 후크를 반환합니다.
      // 설치
      return () => {
        server.middlewares.use((req, res, next) => {
          // 사용자 정의 핸들 요청 ...
        })
      }
    },
  })
  ```

  **서버 액세스 저장**

  경우에 따라 다른 플러그인 후크는 DEV 서버 인스턴스에 액세스해야 할 수도 있습니다 (예 : 웹 소켓 서버, 파일 시스템 감시자 또는 모듈 그래프 액세스). 이 후크는 다른 후크에서 액세스 할 수있는 서버 인스턴스를 저장하는 데 사용될 수도 있습니다.

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // 서버 사용 ...
        }
      },
    }
  }
  ```

  참고 `configureServer` 생산 빌드를 실행할 때 호출되지 않으므로 다른 후크가 부재를 방지해야합니다.

### `configurePreviewServer`

- **유형 :** `(서버 : previewserver) => (() => void) | 무효의 | 약속 <(() => void) | void>`
- **종류 :** `async` , `sequential`
- **참조 :** [미리보기 서버](./api-javascript#previewserver)

  [`configureServer`](/ko/guide/api-plugin.html#configureserver) 과 동일하지만 미리보기 서버의 경우. `configureServer` 과 마찬가지로, `configurePreviewServer` 후크는 다른 중간 전쟁이 설치되기 전에 호출됩니다. 다른 중간 전쟁 **후** 미들웨어를 주입하려면 `configurePreviewServer` 에서 함수를 반환 할 수 있으며 내부 중간 전위가 설치된 후 호출됩니다.

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // 다른 중간 전쟁 이후에 호출되는 포스트 후크를 반환합니다.
      // 설치
      return () => {
        server.middlewares.use((req, res, next) => {
          // 사용자 정의 핸들 요청 ...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **유형 :** `indexhtmltransformhook | {order? : 'pre' | 'Post', handler : indexhtmltransformhook}`
- **종류 :** `async` , `sequential`

  `index.html` 과 같은 HTML 진입 점 파일을 변환하기위한 전용 후크. 후크는 현재 HTML 문자열과 변환 컨텍스트를 수신합니다. 컨텍스트는 DEV 동안 [`ViteDevServer`](./api-javascript#vitedevserver) 인스턴스를 노출시키고 빌드 중에 롤업 출력 번들을 노출시킵니다.

  후크는 비동기 일 수 있으며 다음 중 하나를 반환 할 수 있습니다.

  - 변환 된 html 문자열
  - 기존 HTML에 주입하기 위해 태그 설명자 객체 ( `{ tag, attrs, children }` ) 배열. 각 태그는 또한 주입 해야하는 위치를 지정할 수 있습니다 (기본값은 `<head>` 로 선불됩니다).
  - `{ html, tags }` 으로 둘 다 포함하는 객체

  기본적으로 `order` 은 `undefined` 이고,이 후크는 HTML이 변환 된 후에 적용됩니다. Vite 플러그인 파이프 라인을 통과 해야하는 스크립트를 주입하려면 `order: 'pre'` HTML을 처리하기 전에 후크를 적용합니다. `order: 'post'` 정의되지 않은 `order` 후크가 적용된 후 고리를 적용합니다.

  **기본 예 : 예 :**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`,
        )
      },
    }
  }
  ```

  **전체 후크 서명 :**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * 기본값 : '헤드 포드'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

  ::: warning Note
  이 후크는 입력 파일 (예 : [Sveltekit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145) )의 사용자 정의 처리가있는 프레임 워크를 사용하는 경우 호출되지 않습니다.
  :::

### `handleHotUpdate`

- **유형 :** `(ctx : hmrcontext) => 배열<ModuleNode> | 무효의 | 약속 <배열<ModuleNode> | void>`
- [HMR API](./api-hmr) **도 참조하십시오**

  사용자 정의 HMR 업데이트 처리를 수행하십시오. 후크는 다음 서명이있는 컨텍스트 객체를 수신합니다.

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` 변경된 파일의 영향을받는 모듈 배열입니다. 단일 파일이 여러 서비스 모듈 (예 : VUE SFC)에 매핑 될 수 있기 때문에 배열입니다.

  - `read` 파일의 내용을 반환하는 비동기 판독 함수입니다. 일부 시스템에서는 편집기가 파일 업데이트를 마치기 전에 파일 변경 콜백이 너무 빨리 시작될 수 있고 Direct `fs.readFile` 빈 콘텐츠를 반환하기 때문에 제공됩니다. 전달 된 읽기 기능은이 동작을 정상화합니다.

  후크는 다음을 선택할 수 있습니다.

  - HMR이 더 정확하도록 영향을받는 모듈 목록을 필터링하고 좁 힙니다.

  - 빈 배열을 반환하고 전체 재 장전을 수행하십시오.

    ```js
    handleHotUpdate({ server, modules, timestamp }) {
      // 수동으로 무효화 모듈
      const invalidatedModules = new Set()
      for (const mod of modules) {
        server.moduleGraph.invalidateModule(
          mod,
          invalidatedModules,
          timestamp,
          true
        )
      }
      server.ws.send({ type: 'full-reload' })
      return []
    }
    ```

  - 빈 배열을 반환하고 클라이언트에 사용자 정의 이벤트를 보내서 완전한 사용자 정의 HMR 처리를 수행하십시오.

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    클라이언트 코드는 [HMR API를](./api-hmr) 사용하여 해당 처리기를 등록해야합니다 (동일한 플러그인의 `transform` 후크로 주입 할 수 있음).

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // 사용자 정의 업데이트를 수행하십시오
      })
    }
    ```

## 플러그인 순서

Vite 플러그인은 애플리케이션 순서를 조정하기 위해 `enforce` 속성 (웹 팩 로더와 유사)을 추가로 지정할 수 있습니다. `enforce` 의 값은 `"pre"` 또는 `"post"` 수 있습니다. 해결 된 플러그인은 다음 순서입니다.

- 별명
- `enforce: 'pre'` 인 사용자 플러그인
- vite 코어 플러그인
- 값을 시행하지 않은 사용자 플러그인
- Vite 빌드 플러그인
- `enforce: 'post'` 인 사용자 플러그인
- Vite Post 빌드 플러그인 (미니, 매니페스트,보고)

이것은 후크 순서와는 별개이며, [롤업 후크의 경우 평소와 같이](https://rollupjs.org/plugin-development/#build-hooks) 여전히 `order` 속성에 따라 별도의 속성이 적용됩니다.

## 조건부 응용 프로그램

기본적으로 플러그인은 서빙 및 빌드 모두에 대해 호출됩니다. 플러그인을 서브 또는 빌드 중에 만 조건부로 적용 해야하는 경우 `apply` 속성을 사용하여 `'build'` 또는 `'serve'` 동안 만 호출하십시오.

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // 또는 '서빙'
  }
}
```

보다 정확한 제어를 위해 기능을 사용할 수도 있습니다.

```js
apply(config, { command }) {
  // 빌드에서만 적용하지만 SSR에는 적용되지 않습니다
  return command === 'build' && !config.build.ssr
}
```

## 롤업 플러그인 호환성

롤업 플러그인은 vite 플러그인 (예 : `@rollup/plugin-alias` 또는 `@rollup/plugin-json` )으로 직접 작동하지만 일부 플러그인 후크는 Unbundled Dev 서버 컨텍스트에서 의미가 없기 때문에 모든 것이 아닙니다.

일반적으로 롤업 플러그인이 다음 기준에 맞는 한 Vite 플러그인으로만 작동해야합니다.

- [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) 후크를 사용하지 않습니다.
- 번들 위상 후크와 출력 상 후크 사이에 강한 커플 링이 없습니다.

롤업 플러그인이 빌드 단계에만 적합한 경우 대신 `build.rollupOptions.plugins` 에서 지정할 수 있습니다. `enforce: 'post'` 과 `apply: 'build'` 의 Vite 플러그인과 동일하게 작동합니다.

Vite 전용 특성으로 기존 롤업 플러그인을 보강 할 수도 있습니다.

```js [vite.config.js]
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

## 경로 정규화

Vite는 Windows에서 볼륨을 보존하면서 Posix 분리기 ( /)를 사용하도록 ID를 해결하면서 경로를 정규화합니다. 반면에 롤업은 기본적으로 해결되지 않은 해결 된 경로를 유지하므로 해결 된 ID에는 Windows에 Win32 분리기 (\)가 있습니다. 그러나 롤업 플러그인은 내부적으로 `@rollup/pluginutils` 의 [`normalizePath` 유틸리티 기능을](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) 사용하여 비교를 수행하기 전에 분리기를 POSIX로 변환합니다. 즉, 이러한 플러그인이 Vite에서 사용될 때 `include` 및 `exclude` 구성 패턴 및 해결 된 IDS 비교에 대한 기타 유사한 경로가 올바르게 작동 함을 의미합니다.

따라서 Vite 플러그인의 경우, 해결 된 ID에 대한 경로를 비교할 때 먼저 Posix 분리기를 사용하는 경로를 정규화하는 것이 중요합니다. 동등한 `normalizePath` 유틸리티 기능이 `vite` 모듈에서 내보내집니다.

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```

## 필터링, 패턴 포함/제외

Vite는 [`@rollup/pluginutils` 's `createFilter`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter) 기능을 노출하여 Vite 특정 플러그인과 통합을 장려하여 표준 포함/제외 필터링 패턴을 사용하여 Vite Core 자체에서도 사용됩니다.

## 클라이언트 서버 커뮤니케이션

Vite 2.9 이후, 우리는 플러그인을위한 유틸리티를 제공하여 클라이언트와의 커뮤니케이션을 처리하는 데 도움이됩니다.

### 클라이언트에 대한 서버

플러그인 측면에서 `server.ws.send` 사용하여 클라이언트에게 이벤트를 방송 할 수 있습니다.

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: tip NOTE
다른 플러그인과의 충돌을 피하기 위해 **항상 이벤트 이름을 접두사에 접두사하는** 것이 좋습니다.
:::

클라이언트 측에서 [`hot.on`](/ko/guide/api-hmr.html#hot-on-event-cb) 사용하여 이벤트를 들으십시오.

```ts twoslash
import 'vite/client'
// ---자르다---
// 클라이언트 측
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // 안녕하세요
  })
}
```

### 클라이언트 대 서버

클라이언트에서 서버로 이벤트를 보내려면 [`hot.send`](/ko/guide/api-hmr.html#hot-send-event-payload) 사용할 수 있습니다.

```ts
// 클라이언트 측
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

그런 다음 `server.ws.on` 사용하고 서버 측의 이벤트를 듣습니다.

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // 여기요!
          // 고객에게만 답장하십시오 (필요한 경우)
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### 맞춤형 이벤트에 대한 타이프 스크립트

내부적으로 Vite는 `CustomEventMap` 인터페이스에서 페이로드 유형을 유추하여 인터페이스를 확장하여 사용자 정의 이벤트를 입력 할 수 있습니다.

:::tip Note
TypeScript 선언 파일을 지정할 때 `.d.ts` 확장자를 포함시켜야합니다. 그렇지 않으면 TypeScript는 모듈이 확장하려는 파일을 모를 수 있습니다.
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // '이벤트 키': 페이로드
  }
}
```

이 인터페이스 확장은 이벤트 `T` 의 페이로드 유형을 추론하기 위해 `InferCustomEventPayload<T>` 에 의해 사용됩니다. 이 인터페이스의 사용 방법에 대한 자세한 내용은 [HMR API 문서를](./api-hmr#hmr-api) 참조하십시오.

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
// ---자르다---
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // 페이로드 유형은 {msg : string}입니다.
})
import.meta.hot?.on('unknown:event', (payload) => {
  // 페이로드의 유형은 무엇보다 있습니다
})
```
