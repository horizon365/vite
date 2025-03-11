# 프레임 워크를위한 환경 API

:::warning Experimental
환경 API는 실험적입니다. 우리는 Vite 6 동안 API를 안정적으로 유지하여 생태계를 실험하고 그 위에 구축 할 수 있도록 우리는 우리는 우리는 Vite 7의 잠재적 파괴 변화 로이 새로운 API를 안정화시킬 계획입니다.

자원:

- 우리가 새로운 API에 대한 피드백을 수집하는 [피드백 토론](https://github.com/vitejs/vite/discussions/16358) .
- 새로운 API가 구현되고 검토 된 [환경 API PR](https://github.com/vitejs/vite/pull/16471) .

귀하의 의견을 저희와 공유하십시오.
:::

## 환경 및 프레임 워크

암시 적 `ssr` 환경 및 기타 비 클리어 환경은 DEV 동안 기본적으로 `RunnableDevEnvironment` 사용합니다. Vite 서버가 실행중인 런타임과 동일해야하지만 `ssrLoadModule` 와 유사하게 작동하며 프레임 워크가 SSR DEV 스토리를 위해 HMR을 마이그레이션하고 활성화 할 수 있습니다. `isRunnableDevEnvironment` 기능으로 달리는 환경을 보호 할 수 있습니다.

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * 실행할 URL.
   * 루트와 관련하여 파일 경로, 서버 경로 또는 ID를 허용합니다.
   * 인스턴스화 된 모듈을 반환합니다 (ssrloadModule과 동일)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * 기타 변조 주자 방법 ...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
`runner` 처음으로 액세스 할 때 열심히 평가됩니다. Vite는 `process.setSourceMapsEnabled` 호출하거나 사용할 수없는 경우 `Error.prepareStackTrace` 재정의하여 `runner` 생성 할 때 소스 맵 지원을 활성화합니다.
:::

## 기본 `RunnableDevEnvironment`

[SSR 설정 안내서](/ko/guide/ssr#setting-up-the-dev-server) 에 설명 된 미들웨어 모드로 구성된 VITE 서버가 주어지면 환경 API를 사용하여 SSR 미들웨어를 구현하겠습니다. 오류 처리는 생략됩니다.

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // 기본적으로 모듈은 Vite 서버와 동일한 프로세스에서 실행됩니다.
    },
  },
})

// 이것을 typecript에서 runnabledevenvironment로 캐스팅해야 할 수도 있습니다.
// iSrunnableDevenvironment를 사용하여 러너에 대한 액세스를 보호하십시오
const environment = server.environments.node

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. index.html을 읽습니다
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. vite html 변환을 적용하십시오. 이것은 Vite HMR 클라이언트를 주입합니다.
  //    또한 Vite 플러그인에서 HTML 변환을 적용합니다 (예 : 글로벌
  //    @vitejs/plugin-react의 프리앰블
  template = await server.transformIndexHtml(url, template)

  // 3. 서버 항목을로드하십시오. 가져 오기 (URL)가 자동으로 변환됩니다
  //    node.js에서 사용할 수있는 ESM 소스 코드! 번들링이 없습니다
  //    필수 및 완전한 HMR 지원을 제공합니다.
  const { render } = await environment.runner.import('/src/entry-server.js')

  // 4. 앱 HTML 렌더링. 이것은 Entry-Server.js의 내보내기를 가정합니다
  //     `render` 함수는 적절한 프레임 워크 SSR API를 호출합니다.
  //    예를 들어 ReactDomserver.renderToString ()
  const appHtml = await render(url)

  // 5. 앱 렌더링 된 HTML을 템플릿에 주입하십시오.
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. 렌더링 된 HTML을 다시 보내십시오.
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

## 런타임 Agnostic SSR

`RunnableDevEnvironment` 은 vite 서버와 동일한 런타임에서 코드를 실행하는 데만 사용될 수 있으므로 vite 서버 (node.js와 호환되는 런타임)를 실행할 수있는 런타임이 필요합니다. 즉, 원시 `DevEnvironment` 사용하여 런타임을 불가분하게 만들어야합니다.

:::info `FetchableDevEnvironment` proposal

초기 제안에는 `DevEnvironment` 클래스의 `run` 메소드가있어서 소비자가 `transport` 옵션을 사용하여 러너 측에서 가져 오기를 호출 할 수있었습니다. 우리의 테스트 중에 우리는 API가 권장하기에 충분히 보편적이지 않다는 것을 알았습니다. 현재 우리는 [`FetchableDevEnvironment` 제안](https://github.com/vitejs/vite/discussions/18191) 에 대한 피드백을 찾고 있습니다.

:::

`RunnableDevEnvironment` 에는 모듈 값을 반환하는 `runner.import` 기능이 있습니다. 그러나이 기능은 RAW `DevEnvironment` 에서 사용할 수 없으며 Vite의 API와 사용자 모듈을 사용하여 코드를 분리해야합니다.

예를 들어, 다음 예제는 vite의 API를 사용하여 코드에서 사용자 모듈의 값을 사용합니다.

```ts
// Vite의 API를 사용한 코드
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entry.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// ------------------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

사용자 모듈과 동일한 런타임에 코드가 실행될 수있는 경우 (즉, Node.js-specific API에 의존하지 않음) 가상 모듈을 사용할 수 있습니다. 이 접근법은 Vite의 API를 사용하여 코드에서 값에 액세스 할 필요가 없습니다.

```ts
// Vite의 API를 사용한 코드
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // `virtual:entrypoint` 처리하는 플러그인
    {
      name: 'virtual-module',
      /* 플러그인 구현 */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// 코드를 실행하는 각 환경 공장에서 노출 된 기능을 사용하십시오.
// 각 환경 공장이 제공 한 내용을 확인하십시오
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// ------------------------------------------------
// 가상 : EntryPoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// ------------------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

예를 들어, 사용자 모듈에서 `transformIndexHtml` 호출하려면 다음 플러그인을 사용할 수 있습니다.

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

코드에 node.js apis가 필요한 경우 `hot.send` 사용하여 사용자 모듈에서 Vite의 API를 사용하는 코드와 통신 할 수 있습니다. 그러나이 접근법은 빌드 프로세스 이후에 같은 방식으로 작동하지 않을 수 있습니다.

```ts
// Vite의 API를 사용한 코드
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // `virtual:entrypoint` 처리하는 플러그인
    {
      name: 'virtual-module',
      /* 플러그인 구현 */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// 코드를 실행하는 각 환경 공장에서 노출 된 기능을 사용하십시오.
// 각 환경 공장이 제공 한 내용을 확인하십시오
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// ------------------------------------------------
// 가상 : EntryPoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('/'))

// ------------------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## 빌드 중 환경

CLI에서 `vite build` 과 `vite build --ssr` 호출하면 여전히 클라이언트 전용 및 SSR 환경 만 뒤로 호환됩니다.

`builder` `undefined` 아닌 경우 (또는 `vite build --app` 호출 할 때) `vite build` 대신 전체 앱을 빌드하는 데 옵트 인됩니다. 이것은 나중에 미래의 전공에서 채무 불이행이 될 것입니다. 구성을위한 모든 구성된 환경을 구축하기 위해 `ViteBuilder` 인스턴스가 생성됩니다 ( `ViteDevServer` 에 해당). 기본적으로 환경 빌드는 `environments` 레코드의 순서와 관련하여 직렬로 실행됩니다. 프레임 워크 또는 사용자는 다음을 사용하여 환경을 구축하는 방법을 추가로 구성 할 수 있습니다.

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

## 환경 아가스트 코드

대부분의 경우, 현재 `environment` 인스턴스는 코드를 실행중인 컨텍스트의 일부로 사용할 수 있으므로 `server.environments` 통해 액세스해야 할 필요성은 드물어야합니다. 예를 들어, 내부 플러그인 후크 환경은 `PluginContext` 의 일부로 노출되므로 `this.environment` 사용하여 액세스 할 수 있습니다. [플러그인의 환경 API를](./api-environment-plugins.md) 참조하여 환경 인식 플러그인을 구축하는 방법에 대해 알아보십시오.
