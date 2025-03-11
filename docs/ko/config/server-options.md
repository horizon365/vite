# 서버 옵션

언급되지 않는 한,이 섹션의 옵션은 Dev에만 적용됩니다.

## server.host

- **유형 :** `문자열 | 부울
- **기본값 :** `'localhost'`

서버가 청취해야 할 IP 주소를 지정하십시오.
LAN 및 공개 주소를 포함한 모든 주소에서 듣기 위해 이것을 `0.0.0.0` 또는 `true` 로 설정하십시오.

이것은 `--host 0.0.0.0` 또는 `--host` 사용하여 CLI를 통해 설정할 수 있습니다.

::: tip NOTE

다른 서버가 vite 대신 응답 할 수있는 경우가 있습니다.

첫 번째 사례는 `localhost` 사용되는 경우입니다. v17에 따른 node.js는 기본적으로 DNS 분해 주소의 결과를 다시 표시합니다. `localhost` 액세스 할 때 브라우저는 DNS를 사용하여 주소를 해결하며 해당 주소는 Vite가 듣는 주소와 다를 수 있습니다. Vite는 해결 된 주소가 다를 때 인쇄합니다.

재주문 동작을 비활성화하려면 [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order) 설정할 수 있습니다. 그런 다음 Vite는 주소를 `localhost` 으로 인쇄합니다.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // 생략
})
```

두 번째 사례는 와일드 카드 호스트 (예 : `0.0.0.0` )가 사용되는 경우입니다. 이는 WildCard 호스트에서 듣는 서버가 WildCard 호스트에서 듣는 사람들보다 우선 순위를 차지하기 때문입니다.

:::

::: tip Accessing the server on WSL2 from your LAN

WSL2에서 VITE를 실행할 때 LAN에서 서버에 액세스하는 데 `host: true` 설정하는 것으로 충분하지 않습니다.
자세한 내용은 [WSL 문서를](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan) 참조하십시오.

:::

## server.allowedHosts

- **유형 :** `String [] | 진실
- **기본값 :** `[]`

Vite가 응답 할 수있는 호스트 이름.
`localhost` 및 `.localhost` 미만의 도메인 및 모든 IP 주소는 기본적으로 허용됩니다.
HTTPS를 사용할 때이 점검이 건너 뜁니다.

문자열이 `.` 으로 시작되면 호스트 이름의 `.` 및 모든 하위 도메인없이 해당 호스트 이름을 허용합니다. 예를 들어, `.example.com` `example.com` , `foo.example.com` 및 `foo.bar.example.com` 허용합니다. `true` 으로 설정된 경우 서버는 호스트의 요청에 응답 할 수 있습니다.

::: details What hosts are safe to be added?

허용 된 호스트 목록에 추가하기에 안전한 IP 주소를 제어 할 수있는 호스트.

예를 들어 도메인 `vite.dev` 소유 한 경우 목록에 `vite.dev` 과 `.vite.dev` 추가 할 수 있습니다. 해당 도메인을 소유하지 않고 해당 도메인의 소유자를 신뢰할 수 없다면 추가해서는 안됩니다.

특히 `.com` 같은 최상위 도메인을 목록에 추가해서는 안됩니다. 누구나 `example.com` 같은 도메인을 구매하고 해결하는 IP 주소를 제어 할 수 있기 때문입니다.

:::

::: danger

`server.allowedHosts` ~ `true` 설정하면 모든 웹 사이트가 DNS Rebinding Attack을 통해 Dev 서버에 요청을 보낼 수 있으므로 소스 코드 및 컨텐츠를 다운로드 할 수 있습니다. 허용 된 호스트의 명시 적 목록을 항상 사용하는 것이 좋습니다. 자세한 내용은 [GHSA-VG6X-RCGG-RJX6을](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6) 참조하십시오.

:::

::: details Configure via environment variable
추가 허용 된 호스트를 추가하기 위해 환경 변수 `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` 설정할 수 있습니다.
:::

## server.port

- **유형 :** `number`
- **기본값 :** `5173`

서버 포트를 지정합니다. 참고 포트가 이미 사용중인 경우 Vite는 다음 사용 가능한 포트를 자동으로 시도하므로 서버가 청취하는 실제 포트가 아닐 수 있습니다.

## server.strictPort

- **유형 :** `boolean`

다음 사용 가능한 포트를 자동으로 시도하는 대신 포트가 이미 사용중인 경우 종료하도록 `true` 으로 설정하십시오.

## server.https

- **유형 :** `https.ServerOptions`

TLS + HTTP/2를 활성화합니다. 이 다운 그레이드는 [`server.proxy` 옵션](#server-proxy) 도 사용될 때만 TLS 로의 다운 그레이드에 유의하십시오.

값은 또한 [옵션 객체가](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) `https.createServer()` 으로 전달 될 수 있습니다.

유효한 인증서가 필요합니다. 기본 설정의 경우 [@vitejs/plugin-basic-ssl을](https://github.com/vitejs/vite-plugin-basic-ssl) 프로젝트 플러그인에 추가하여 자체 서명 된 인증서를 자동으로 작성하고 캐시 할 수 있습니다. 그러나 자신의 인증서를 만드는 것이 좋습니다.

## server.open

- **유형 :** `부울 | 문자열 '

서버 시작의 브라우저에서 앱을 자동으로 엽니 다. 값이 문자열 인 경우 URL의 PathName으로 사용됩니다. 원하는 특정 브라우저에서 서버를 열려면 ENG `process.env.BROWSER` (예 : `firefox` )을 설정할 수 있습니다. 추가 인수를 전달하기 위해 `process.env.BROWSER_ARGS` 설정할 수도 있습니다 (예 : `--incognito` ).

`BROWSER` 과 `BROWSER_ARGS` 또한 `.env` 파일로 설정하여 구성 할 수있는 특수 환경 변수입니다. 자세한 내용은 [`open` 패키지를](https://github.com/sindresorhus/open#app) 참조하십시오.

**예:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **유형 :** `record <string, String | proxyoptions>`

개발자 서버의 사용자 정의 프록시 규칙을 구성하십시오. `{ key: options }` 쌍의 객체를 기대합니다. 요청 경로가 해당 키로 시작하는 모든 요청은 지정된 대상에 프록시됩니다. 키가 `^` 으로 시작하면 `RegExp` 로 해석됩니다. `configure` 옵션을 사용하여 프록시 인스턴스에 액세스 할 수 있습니다. 요청이 구성된 프록시 규칙과 일치하면 Vite에 의해 요청을 변환하지 않습니다.

비 관계형 [`base`](/ko/config/shared-options.md#base) 사용하는 경우 각 키를 해당 `base` 과 접두사해야합니다.

[`http-proxy`](https://github.com/http-party/node-http-proxy#options) 연장합니다. 추가 옵션이 [여기에](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13) 있습니다.

경우에 따라 기본 개발자 서버를 구성 할 수도 있습니다 (예 : 내부 [연결](https://github.com/senchalabs/connect) 앱에 사용자 정의 중간 와어를 추가). 이를 위해서는 자신의 [플러그인을](/ko/guide/using-plugins.html) 작성하고 [configureserver](/ko/guide/api-plugin.html#configureserver) 기능을 사용해야합니다.

**예:**

```js
export default defineConfig({
  server: {
    proxy: {
      // 문자열 속도 :
      // http : // localhost : 5173/foo
      //   -> [http : // localhost : 4567/foo](http://localhost:4567/foo)
      '/foo': 'http://localhost:4567',
      // 옵션 :
      // http : // localhost : 5173/api/bar
      //   -> [http://jsonplaceholder.typicode.com/bar](http://jsonplaceholder.typicode.com/bar)
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // regexp와 함께 :
      // http : // localhost : 5173/폴백/
      //   -> [http://jsonplaceholder.typicode.com/](http://jsonplaceholder.typicode.com/)
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // 프록시 인스턴스 사용
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // 프록시는 'http-proxy'의 인스턴스가 될 것입니다.
        },
      },
      // Websockets 또는 Socket.io를 프록시하는 것 :
      // WS : // localhost : 5173/socket.io
      //   -> ws : // localhost : 5174/socket.io
      // 0을 남길 수 있으므로 `rewriteWsOrigin` 사용하여주의하십시오
      // CSRF 공격에 열린 프록시.
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **유형 :** `부울 | Corsoptions`
- **기본값 :** `{origin : /^https ?://(?: (?:..............))? localhost|127\.0\.0\.1|[:: 1]) (? :: \ d+)? $/}  127.0.0.1  :: 1`를 허용합니다)

DEV 서버의 CORS를 구성하십시오. [옵션 객체를](https://github.com/expressjs/cors#configuration-options) 전달하여 동작을 미세 조정하거나 원점을 허용하려면 `true` 조정하십시오.

::: danger

`server.cors` ~ `true` 설정하면 모든 웹 사이트가 Dev 서버에 요청을 보내고 소스 코드 및 컨텐츠를 다운로드 할 수 있습니다. 허용 된 원산지의 명시 적 목록을 항상 사용하는 것이 좋습니다.

:::

## server.headers

- **유형 :** `OutgoingHttpHeaders`

서버 응답 헤더를 지정합니다.

## server.hmr

- **유형 :** `부울 | {protocol? : String, host? : string, port? : number? : string, timeout? : 숫자, 오버레이? : boolean, clientport? : number, server? : server}`

HMR 연결을 비활성화하거나 구성하십시오 (HMR WebSocket이 HTTP 서버와 다른 주소를 사용해야하는 경우).

서버 오류 오버레이를 비활성화하려면 `server.hmr.overlay` 에서 `false` 까지 설정하십시오.

`protocol` HMR 연결에 사용 된 WebSocket 프로토콜을 설정합니다 : `ws` (WebSocket) 또는 `wss` (WebSocket Secure).

`clientPort` 클라이언트 측에서만 포트를 무시하는 고급 옵션으로 클라이언트 코드가 찾는 것과 다른 포트의 웹 소켓을 제공 할 수 있습니다.

`server.hmr.server` 정의되면 Vite는 제공된 서버를 통해 HMR 연결 요청을 처리합니다. 미들웨어 모드가 아닌 경우 Vite는 기존 서버를 통해 HMR 연결 요청을 처리하려고 시도합니다. 자체 서명 된 인증서를 사용하거나 단일 포트에서 네트워크를 통해 Vite를 노출시킬 때 도움이 될 수 있습니다.

몇 가지 예는 [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue) 확인하십시오.

::: tip NOTE

기본 구성을 사용하면 Vite 앞의 리버스 프록시가 프록시 웹 사이트를 지원할 것으로 예상됩니다. VITE HMR 클라이언트가 WebSocket을 연결하지 못하면 클라이언트는 WebSocket을 Vite HMR 서버에 직접 연결하여 리버스 프록시를 우회합니다.

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

폴백이 발생할 때 브라우저에 나타나는 오류는 무시할 수 있습니다. 리버스 프록시를 직접 우회하여 오류를 피하기 위해 다음 중 하나 일 수 있습니다.

- Proxy WebSocket에 대한 역 프록시도 구성하십시오
- [`server.strictPort = true`](#server-strictport) 설정하고 `server.hmr.clientPort` `server.port` 로 동일한 값으로 설정합니다.
- `server.hmr.port` [`server.port`](#server-port) 과 다른 값으로 설정하십시오

:::

## server.warmup

- **유형 :** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **관련 :** [자주 사용되는 파일을 데우십시오](/ko/guide/performance.html#warm-up-frequently-used-files)

파일을 예열하여 결과를 미리 변환하고 캐시합니다. 이렇게하면 서버가 시작되는 동안 초기 페이지로드가 향상되고 변형 폭포가 방지됩니다.

`clientFiles` 은 클라이언트에서만 사용되는 파일이고 `ssrFiles` SSR에서만 사용되는 파일입니다. 그들은 `root` 에 비해 파일 경로 또는 [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) 패턴을 허용합니다.

시작시 Vite Dev 서버에 과부하하지 않는 데 자주 사용되는 파일 만 추가하십시오.

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **유형 :** `객체 | NULL`

파일 시스템 감시자 옵션 옵션 [Chokidar](https://github.com/paulmillr/chokidar/tree/3.6.0#api) 로 전달합니다.

Vite Server Watcher는 `root` 을보고 `.git/` , `node_modules/` 및 Vite의 `cacheDir` 및 `build.outDir` 디렉토리를 기본적으로 건너 뜁니다. 시청 파일을 업데이트 할 때 Vite는 HMR을 적용하고 필요한 경우에만 페이지를 업데이트합니다.

`null` 으로 설정하면 파일이 보지 않습니다. `server.watcher` 호환 이벤트 이미 터를 제공하지만 `add` 또는 `unwatch` 호출하는 데 영향을 미치지 않습니다.

::: warning Watching files in `node_modules`

현재 `node_modules` 에서 파일과 패키지를 볼 수 없습니다. 추가 진행 상황과 해결 방법은 [문제 #8619를](https://github.com/vitejs/vite/issues/8619) 따를 수 있습니다.

:::

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

WSL2에서 VITE를 실행할 때 파일이 Windows 응용 프로그램 (비 WSL2 프로세스)에서 파일을 편집 할 때 파일 시스템 시청이 작동하지 않습니다. 이것은 [WSL2 제한](https://github.com/microsoft/WSL/issues/4739) 때문입니다. 이것은 WSL2 백엔드로 Docker에서 실행하는데도 적용됩니다.

그것을 고치려면 다음 중 하나 일 수 있습니다.

- **권장** : WSL2 응용 프로그램을 사용하여 파일을 편집하십시오.
  - 또한 Windows 파일 시스템 외부에서 프로젝트 폴더를 이동하는 것이 좋습니다. WSL2에서 Windows 파일 시스템에 액세스하는 데 속도가 느립니다. 오버 헤드를 제거하면 성능이 향상됩니다.
- 설정 `{ usePolling: true }` .
  - [`usePolling` 은 높은 CPU 활용도로 이어집니다](https://github.com/paulmillr/chokidar/tree/3.6.0#performance) .

:::

## server.middlewareMode

- **유형 :** `boolean`
- **기본값 :** `false`

미들웨어 모드에서 Vite 서버를 만듭니다.

- **관련 :** [Apptype](./shared-options#apptype) , [SSR- 개발자 서버 설정](/ko/guide/ssr#setting-up-the-dev-server)

- **예:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // 미들웨어 모드에서 Vite 서버를 만듭니다
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // Vite의 기본 HTML 처리 중간 전야를 포함하지 마십시오
    appType: 'custom',
  })
  // Vite의 Connect 인스턴스를 미들웨어로 사용하십시오
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // `appType` 은 `'custom'` 이므로 여기서 응답을 제공해야합니다.
    // 참고 : `appType` `'spa'` 또는 `'mpa'` 이면 Vite에는 중간 전쟁이 포함됩니다.
    // HTML 요청 및 404S를 처리하려면 사용자 중간 전쟁을 추가해야합니다.
    // Vite의 중간 전쟁 이전에 대신 적용되기 전에
  })
}

createServer()
```

## server.fs.strict

- **유형 :** `boolean`
- **기본값 :** `true` (Vite 2.7 이후 기본적으로 활성화)

작업 공간 루트 외부에서 서빙 파일을 제한합니다.

## server.fs.allow

- **유형 :** `string[]`

`/@fs/` 통해 제공 될 수있는 파일을 제한합니다. `server.fs.strict` `true` 로 설정되면 허용 파일에서 가져 오지 않은이 디렉토리 목록 외부의 파일에 액세스하면 403이됩니다.

디렉토리와 파일이 모두 제공 될 수 있습니다.

Vite는 잠재적 인 작업 공간의 루트를 검색하여 기본값으로 사용합니다. 유효한 작업 공간은 다음 조건을 충족하고 그렇지 않으면 [프로젝트 루트](/ko/guide/#index-html-and-project-root) 로 돌아갑니다.

- `package.json` 에서 `workspaces` 필드를 포함합니다
- 다음 파일 중 하나가 포함되어 있습니다
  - `lerna.json`
  - `pnpm-workspace.yaml`

사용자 정의 작업 공간 루트를 지정하는 경로를 수락합니다. [프로젝트 루트](/ko/guide/#index-html-and-project-root) 와 관련된 절대 경로 또는 경로 일 수 있습니다. 예를 들어:

```js
export default defineConfig({
  server: {
    fs: {
      // 한 레벨에서 프로젝트 루트까지 파일을 서빙 할 수 있습니다.
      allow: ['..'],
    },
  },
})
```

`server.fs.allow` 지정되면 자동 작업 공간 루트 감지가 비활성화됩니다. 원래 동작을 확장하려면 유틸리티 `searchForWorkspaceRoot` 노출됩니다.

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // 작업 공간 루트를 검색하십시오
        searchForWorkspaceRoot(process.cwd()),
        // 귀하의 사용자 정의 규칙
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **유형 :** `string[]`
- **기본값 :** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

Vite Dev Server가 제공하도록 제한되는 민감한 파일에 대한 블록리스트. 이것은 [`server.fs.allow`](#server-fs-allow) 보다 우선 순위가 높습니다. [Picomatch 패턴이](https://github.com/micromatch/picomatch#globbing-features) 지원됩니다.

## server.origin

- **유형 :** `string`

개발 중에 생성 된 자산 URL의 기원을 정의합니다.

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **유형 :** `거짓 | (sourcepath : string, sourcemappath : String) => boolean`
- **기본값 :** `(sourcePath) => sourcePath.includes('node_modules')`

서버 Sourcemap에서 소스 파일을 무시할지 여부는 [`x_google_ignoreList` 소스 맵 확장자를](https://developer.chrome.com/articles/x-google-ignore-list/) 채우는 데 사용됩니다.

`server.sourcemapIgnoreList` DEV 서버의 경우 [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) 입니다. 두 구성 옵션의 차이점은 롤업 함수가 `sourcePath` 의 상대 경로로 호출되고 `server.sourcemapIgnoreList` 절대 경로로 호출된다는 것입니다. DEV 동안 대부분의 모듈에는 동일한 폴더에 맵과 소스가 있으므로 `sourcePath` 의 상대 경로는 파일 이름 자체입니다. 이 경우 절대 경로는 대신 사용하기 편리합니다.

기본적으로 `node_modules` 포함 된 모든 경로를 제외합니다. 이 동작을 비활성화하기 위해 `false` 전달하거나 소스 경로와 Sourcemap 경로를 취하고 소스 경로를 무시하는지 여부를 반환하는 함수.

```js
export default defineConfig({
  server: {
    // 이것은 기본값이며 Node_Modules로 모든 파일을 추가합니다.
    // 무시 목록으로가는 길에.
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Note
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist) 과 [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) 독립적으로 설정해야합니다. `server.sourcemapIgnoreList` 는 서버 전용 구성이며 정의 된 롤업 옵션에서 기본값을 얻지 못합니다.
:::
