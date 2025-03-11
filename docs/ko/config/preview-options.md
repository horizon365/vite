# 미리보기 옵션

언급되지 않는 한,이 섹션의 옵션은 미리보기에만 적용됩니다.

## preview.host

- **유형 :** `문자열 | 부울
- **기본값 :** [`server.host`](./server-options#server-host)

서버가 청취해야 할 IP 주소를 지정하십시오.
LAN 및 공개 주소를 포함한 모든 주소에서 듣기 위해 이것을 `0.0.0.0` 또는 `true` 로 설정하십시오.

이것은 `--host 0.0.0.0` 또는 `--host` 사용하여 CLI를 통해 설정할 수 있습니다.

::: tip NOTE

다른 서버가 vite 대신 응답 할 수있는 경우가 있습니다.
자세한 내용은 [`server.host`](./server-options#server-host) 참조하십시오.

:::

## preview.allowedHosts

- **유형 :** `문자열 | 진실
- **기본값 :** [`server.allowedHosts`](./server-options#server-allowedhosts)

Vite가 응답 할 수있는 호스트 이름.

자세한 내용은 [`server.allowedHosts`](./server-options#server-allowedhosts) 참조하십시오.

## preview.port

- **유형 :** `number`
- **기본값 :** `4173`

서버 포트를 지정합니다. 참고 포트가 이미 사용중인 경우 Vite는 다음 사용 가능한 포트를 자동으로 시도하므로 서버가 청취하는 실제 포트가 아닐 수 있습니다.

**예:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

- **유형 :** `boolean`
- **기본값 :** [`server.strictPort`](./server-options#server-strictport)

다음 사용 가능한 포트를 자동으로 시도하는 대신 포트가 이미 사용중인 경우 종료하도록 `true` 으로 설정하십시오.

## preview.https

- **유형 :** `https.ServerOptions`
- **기본값 :** [`server.https`](./server-options#server-https)

TLS + HTTP/2를 활성화합니다. 이 다운 그레이드는 [`server.proxy` 옵션](./server-options#server-proxy) 도 사용될 때만 TLS 로의 다운 그레이드에 유의하십시오.

값은 또한 [옵션 객체가](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) `https.createServer()` 으로 전달 될 수 있습니다.

## preview.open

- **유형 :** `부울 | 문자열 '
- **기본값 :** [`server.open`](./server-options#server-open)

서버 시작의 브라우저에서 앱을 자동으로 엽니 다. 값이 문자열 인 경우 URL의 PathName으로 사용됩니다. 원하는 특정 브라우저에서 서버를 열려면 ENG `process.env.BROWSER` (예 : `firefox` )을 설정할 수 있습니다. 추가 인수를 전달하기 위해 `process.env.BROWSER_ARGS` 설정할 수도 있습니다 (예 : `--incognito` ).

`BROWSER` 과 `BROWSER_ARGS` 또한 `.env` 파일로 설정하여 구성 할 수있는 특수 환경 변수입니다. 자세한 내용은 [`open` 패키지를](https://github.com/sindresorhus/open#app) 참조하십시오.

## preview.proxy

- **유형 :** `record <string, String | proxyoptions>`
- **기본값 :** [`server.proxy`](./server-options#server-proxy)

미리보기 서버의 사용자 정의 프록시 규칙을 구성하십시오. `{ key: options }` 쌍의 객체를 기대합니다. 키가 `^` 으로 시작하면 `RegExp` 로 해석됩니다. `configure` 옵션을 사용하여 프록시 인스턴스에 액세스 할 수 있습니다.

사용 [`http-proxy`](https://github.com/http-party/node-http-proxy) . [여기에서](https://github.com/http-party/node-http-proxy#options) 전체 옵션.

## preview.cors

- **유형 :** `부울 | Corsoptions`
- **기본값 :** [`server.cors`](./server-options#server-cors)

미리보기 서버의 CORS를 구성하십시오.

자세한 내용은 [`server.cors`](./server-options#server-cors) 참조하십시오.

## preview.headers

- **유형 :** `OutgoingHttpHeaders`

서버 응답 헤더를 지정합니다.
