# 문제 해결

자세한 내용은 [롤업의 문제 해결 안내서를](https://rollupjs.org/troubleshooting/) 참조하십시오.

여기서 제안이 작동하지 않으면 [GitHub 토론](https://github.com/vitejs/vite/discussions) 또는 [Vite Land Discord](https://chat.vite.dev) 의 `#help` 채널에 질문을 게시하십시오.

## CJS

### Vite CJS 노드 API가 더 이상 사용되지 않습니다

Vite의 노드 API의 CJS 빌드는 더 이상 사용되지 않으며 Vite 6에서 제거됩니다. 자세한 내용은 [Github 토론을](https://github.com/vitejs/vite/discussions/13928) 참조하십시오. 대신 Vite의 ESM 빌드를 가져 오려면 파일 또는 프레임 워크를 업데이트해야합니다.

기본 vite 프로젝트에서는 다음과 같습니다.

1. `vite.config.js` 파일 컨텐츠는 ESM 구문을 사용하고 있습니다.
2. 가장 가까운 `package.json` 파일에는 `"type": "module"` 이거나 `.mjs` 확장 (예 : `vite.config.mjs` 또는 `vite.config.mts` `.mts` 사용합니다.

다른 프로젝트의 경우 몇 가지 일반적인 접근 방식이 있습니다.

- **필요한 경우 ESM을 기본값으로 구성하고 CJS에서 CJ를 선택하십시오.** 프로젝트 `package.json` 에서 `"type": "module"` 추가하십시오. `*.js` 파일 모두 이제 ESM으로 해석되며 ESM 구문을 사용해야합니다. 대신 CJS를 계속 사용하기 위해 `.cjs` 내선으로 파일 이름을 바꿀 수 있습니다.
- **필요한 경우 CJS를 기본값으로 유지하고 ESM에서 옵트 인으로 유지하십시오.** 프로젝트 `package.json` 에 `"type": "module"` 없는 경우 `*.js` 파일 모두 CJ로 해석됩니다. 대신 ESM을 사용하기 위해 `.mjs` 내선으로 파일의 이름을 바꿀 수 있습니다.
- **동적으로 가져 오기 VITE :** CJS를 계속 사용해야하는 경우 대신 `import('vite')` 사용하여 Vite를 동적으로 가져올 수 있습니다. 이를 위해서는 코드가 `async` 컨텍스트로 작성되어야하지만 Vite의 API가 대부분 비동기식이므로 여전히 관리 할 수 있어야합니다.

경고가 어디에서 오는지 확실하지 않은 경우 `VITE_CJS_TRACE=true` 플래그로 스크립트를 실행하여 스택 추적을 기록 할 수 있습니다.

```bash
VITE_CJS_TRACE=true vite dev
```

경고를 일시적으로 무시하려면 `VITE_CJS_IGNORE_WARNING=true` 플래그로 스크립트를 실행할 수 있습니다.

```bash
VITE_CJS_IGNORE_WARNING=true vite dev
```

PostCSS 구성 파일은 아직 ESM + TypeScript ( `.mts` 또는 `.ts` in `"type": "module"` )를 지원하지 않습니다. Packing.json에 `.ts` 과 `"type": "module"` 추가 한 PostCSS 구성이있는 경우 `.cts` 사용하려면 PostCSS 구성의 이름을 바꿔야합니다.

## 클리

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

프로젝트 폴더의 경로에는 `&` 포함될 수 있으며, 이는 Windows에서 `npm` 에서 작동하지 않습니다 ( [NPM/CMD-SHIM#45](https://github.com/npm/cmd-shim/issues/45) ).

다음 중 하나가 필요합니다.

- 다른 패키지 관리자로 전환하십시오 (예 : `pnpm` , `yarn` )
- 프로젝트 경로에서 `&` 제거하십시오

## 구성

### 이 패키지는 ESM 전용입니다

ESM 전용 패키지를 `require` 으로 가져 오면 다음 오류가 발생합니다.

> "foo"를 해결하지 못했습니다. 이 패키지는 ESM이지만 `require` 만큼로드하려고 시도했습니다.

> Error [err_require_esm] : es ()의 es ()의 es ()의/path/to/vite.config.js에서 지원되지 않음.
> 대신/path/to/vite.config.js에서 index.js의 요구 사항을 모든 CommonJS 모듈에서 사용할 수있는 동적 import ()로 변경하십시오.

node.js <= 22에서는 기본적으로 ESM 파일을 [`require`](https://nodejs.org/docs/latest-v22.x/api/esm.html#require) 으로로드 할 수 없습니다.

[`--experimental-require-module`](https://nodejs.org/docs/latest-v22.x/api/modules.html#loading-ecmascript-modules-using-require) 또는 node.js> 22를 사용하거나 다른 런타임을 사용하여 작동 할 수 있지만 여전히 구성을 ESM으로 변환하는 것이 좋습니다.

- 가장 가까운 `package.json` 에 `"type": "module"` 추가합니다
- `vite.config.js` / `vite.config.ts` ~ `vite.config.mjs` / `vite.config.mts` 의 이름을 바꿉니다

### `failed to load config from '/path/to/config*/vite.config.js'`

> '/path/to/config\*/vite.config.js'에서 구성을로드하지 못했습니다.
> DEV 서버를 시작할 때 오류 :
> 오류 : 1 오류로 빌드가 실패했습니다.
> 오류 : 입력 파일이 여러 개있을 때 "아웃 디르"를 사용해야합니다.

프로젝트 폴더의 경로에 `*` 포함 된 경우 위의 오류가 발생할 수 있으며, 이는 Esbuild가 글로그로 취급합니다. `*` 제거하려면 디렉토리의 이름을 바꿔야합니다.

## DEV 서버

### 요청은 영원히 정체됩니다

Linux를 사용하는 경우 파일 디스크립터 한도와 Inotify 한도가 문제를 일으킬 수 있습니다. VITE는 대부분의 파일을 번들지지 않기 때문에 브라우저는 많은 파일 디스크립터가 필요한 많은 파일을 요청하여 한도를 넘어냅니다.

이것을 해결하려면 :

- 파일 설명자 제한을 `ulimit` 만큼 늘리십시오

  ```shell
  # 현재 한도를 확인하십시오
  $ ulimit -Sn
  # 변경 한도 (임시)
  $ ulimit -Sn 10000 # 하드 제한도 변경해야 할 수도 있습니다
  # 브라우저를 다시 시작하십시오
  ```

- 다음과 비교 관련 제한을 `sysctl` 만큼 증가시킵니다

  ```shell
  # 현재 한도를 확인하십시오
  $ sysctl fs.inotify
  # 변경 한도 (임시)
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

위의 단계가 작동하지 않으면 다음 파일에 `DefaultLimitNOFILE=65536` 사용하지 않은 구성으로 추가 할 수 있습니다.

- /etc/systemd/system.conf
- /etc/systemd/user.conf

Ubuntu Linux의 경우 SystemD 구성 파일을 업데이트하는 대신 파일 `/etc/security/limits.conf` 에 줄 `* - nofile 65536` 추가해야 할 수도 있습니다.

이러한 설정은 지속되지만 **다시 시작해야합니다** .

또는 서버가 A VS Code DevContainer 내에서 실행중인 경우 요청이 정체 된 것으로 보일 수 있습니다. 이 문제를 해결하려면 참조하십시오
[Dev 컨테이너 / 대 코드 포트 전달](#dev-containers-vs-code-port-forwarding) .

### 네트워크 요청은로드를 중지합니다

자체 서명 된 SSL 인증서를 사용하는 경우 Chrome은 모든 캐싱 지침을 무시하고 컨텐츠를 다시로드합니다. Vite는 이러한 캐싱 지침에 의존합니다.

문제를 해결하려면 신뢰할 수있는 SSL 인증서를 사용하십시오.

[캐시 문제](https://helpx.adobe.com/mt/experience-manager/kb/cache-problems-on-chrome-with-SSL-certificate-errors.html) , [크롬 문제를](https://bugs.chromium.org/p/chromium/issues/detail?id=110649#c8) 참조하십시오

#### 마코스

이 명령으로 CLI를 통해 신뢰할 수있는 인증서를 설치할 수 있습니다.

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

또는 Keychain Access 앱으로 가져 와서 "항상 신뢰"로 인증서의 신뢰를 업데이트함으로써.

### 431 요청 헤더 필드가 너무 큽니다

서버 / 웹 소켓 서버가 큰 HTTP 헤더를 수신하면 요청이 삭제되고 다음 경고가 표시됩니다.

> Server는 상태 코드 431로 응답했습니다. [https://vite.dev/guide/troubleshooting.html#\_431-request-header-fields-too-large를](https://vite.dev/guide/troubleshooting.html#_431-request-header-fields-too-large) 참조하십시오.

Node.js가 [CVE-2018-12121을](https://www.cve.org/CVERecord?id=CVE-2018-12121) 완화하기 위해 헤더 크기를 요청하기 때문입니다.

이를 피하려면 요청 헤더 크기를 줄이십시오. 예를 들어 쿠키가 길면 삭제하십시오. 또는 [`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize) 사용하여 최대 헤더 크기를 변경할 수 있습니다.

### Dev 컨테이너 / 대 코드 포트 전달

Code vs Code에서 DEV 컨테이너 또는 포트 전달 기능을 사용하는 경우 구성에서 [`server.host`](/ko/config/server-options.md#server-host) 옵션을 `127.0.0.1` 로 설정하여 작동하도록해야합니다.

이는 [Code의 포트 전달 기능이 IPv6을 지원하지 않기](https://github.com/microsoft/vscode-remote-release/issues/7029) 때문입니다.

자세한 내용은 [#16522를](https://github.com/vitejs/vite/issues/16522) 참조하십시오.

## HMR

### Vite는 파일 변경을 감지하지만 HMR이 작동하지 않습니다.

다른 사례가있는 파일을 가져올 수 있습니다. 예를 들어, `src/foo.js` 존재하고 `src/bar.js` 포함합니다.

```js
import './Foo.js' // './foo.js'
```

관련 문제 : [#964](https://github.com/vitejs/vite/issues/964)

### Vite는 파일 변경을 감지하지 않습니다

WSL2로 Vite를 실행하는 경우 Vite는 일부 조건에서 파일 변경을 볼 수 없습니다. [`server.watch` 옵션을](/ko/config/server-options.md#server-watch) 참조하십시오.

### HMR 대신 전체 재 장전이 발생합니다

HMR이 Vite 또는 플러그인으로 처리되지 않으면 상태를 새로 고칠 수있는 유일한 방법이므로 전체 재 장전이 발생합니다.

HMR이 처리되었지만 원형 의존성 내에있는 경우 전체 재 장전도 실행 순서를 복구합니다. 이것을 해결하려면 루프를 깨십시오. 파일 변경이 트리거되면 원형 의존성 경로를 기록하기 위해 `vite --debug hmr` 실행할 수 있습니다.

## 짓다

### CORS 오류로 인해 내장 파일이 작동하지 않습니다

`file` 프로토콜로 HTML 파일 출력이 열리면 다음 오류로 스크립트가 실행되지 않습니다.

> Origin 'Null'에서 'file : ///foo/bar.js'에서 스크립트에 대한 액세스는 CORS 정책에 의해 차단되었습니다. Cross Origin 요청은 프로토콜 체계에 대해서만 지원됩니다 : HTTP, 데이터, 분리 된 -App, Chrome-extension, Chrome, HTTPS, Chrome-Untrusted.

> 크로스 오리핀 요청 차단 : 동일한 원산지 정책은 파일에서 원격 자원을 읽는다 : ///foo/bar.js. (이유 : HTTP가 아닌 CORS 요청).

[이유 : Cors Request Not HTTP -HTTP를 참조하십시오 | mdn] ( [https://developer.mozilla.org/en-us/web/web/wttp/cors/errors/corsrequestnothttp](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) )이 발생하는 이유에 대한 자세한 내용은.

`http` 프로토콜로 파일에 액세스해야합니다. 이것을 달성하는 가장 쉬운 방법은 `npx vite preview` 실행하는 것입니다.

## 최적화 된 종속성

### 로컬 패키지에 링크 할 때 구식 사전 구금 DEP

최적화 된 종속성을 무효화하는 데 사용되는 해시 키는 패키지 잠금 컨텐츠, 종속성에 적용되는 패치 및 노드 모듈의 번들링에 영향을 미치는 VITE 구성 파일의 옵션에 따라 다릅니다. 즉, VITE는 [NPM을 재정의 할](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) 때 기능을 사용하여 종속성이 재정의 된 시점을 감지하고 다음 서버 시작에 종속성을 다시 연결합니다. Vite는 [NPM 링크](https://docs.npmjs.com/cli/v9/commands/npm-link) 와 같은 기능을 사용하면 종속성을 무효화하지 않습니다. 종속성을 링크하거나 링크하지 않으면 `vite --force` 사용하여 다음 서버 시작에서 다시 최적화해야합니다. 대신 모든 패키지 관리자가 지원하는 Overrides를 사용하는 것이 좋습니다 ( [PNPM 재정의](https://pnpm.io/package_json#pnpmoverrides) 및 [원사 해상도](https://yarnpkg.com/configuration/manifest/#resolutions) 참조).

## 성능 병목 현상

로드 시간이 느리게 발생하는 응용 프로그램 성능 병목 현상이 발생하면 Vite Dev 서버를 사용하여 내장 Node.js Inspector를 시작하거나 응용 프로그램을 구축하여 CPU 프로파일을 작성할 수 있습니다.

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite Dev Server
브라우저에서 애플리케이션이 열리면 마감 처리를 기다린 다음 터미널로 돌아가서 `p` 키 (Node.js Inspector를 중지합니다)를 누른 다음 `q` 키를 누르면 Dev 서버를 중지하십시오.
:::

Node.js Inspector는 루트 폴더에서 `vite-profile-0.cpuprofile` 생성하고 [https://www.speedscope.app/](https://www.speedscope.app/) 로 이동하여 `BROWSE` 버튼을 사용하여 CPU 프로파일을 업로드하여 결과를 검사합니다.

[Vite-Plugin-Inspect를](https://github.com/antfu/vite-plugin-inspect) 설치하여 Vite 플러그인의 중간 상태를 검사 할 수 있으며 응용 프로그램의 병목 현상이 어떤 플러그인 또는 중간 전위인지 식별하는 데 도움이 될 수 있습니다. 플러그인은 DEV 및 빌드 모드 모두에서 사용할 수 있습니다. 자세한 내용은 readme 파일에 확인하십시오.

## 기타

### 브라우저 호환성을 위해 외부화 된 모듈

브라우저에서 node.js 모듈을 사용하면 Vite가 다음 경고를 출력합니다.

> 모듈 "FS"는 브라우저 호환성을 위해 외부화되었습니다. 클라이언트 코드에서 "fs.readfile"에 액세스 할 수 없습니다.

Vite가 Node.js 모듈을 자동으로 PolyFill이 아니기 때문입니다.

폴리 필드를 수동으로 추가 할 수는 있지만 번들 크기를 줄이기 위해 브라우저 코드의 Node.js 모듈을 피하는 것이 좋습니다. 모듈이 타사 라이브러리 (브라우저에서 사용되는)에서 가져 오면 해당 문제를 각 라이브러리에보고하는 것이 좋습니다.

### 구문 오류 / 유형 오류가 발생합니다

Vite는 처리 할 수 없으며 비 스트릭 모드 (슬로피 모드)에서만 실행되는 코드를 지원하지 않습니다. Vite가 ESM을 사용하고 ESM 내부에서 항상 [엄격한 모드](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) 이기 때문입니다.

예를 들어 이러한 오류가 표시 될 수 있습니다.

> [ERROR] Strict 모드로 인해 "ESM"출력 형식과 함께 문을 사용할 수 없습니다.

> TypeError : 부울 'false'에서 'foo'를 만들 수 없습니다.

이러한 코드가 종속성 내에서 사용되는 경우 탈출 해치에 [`patch-package`](https://github.com/ds300/patch-package) (또는 [`yarn patch`](https://yarnpkg.com/cli/patch) 또는 [`pnpm patch`](https://pnpm.io/cli/patch) )을 사용할 수 있습니다.

### 브라우저 확장

일부 브라우저 확장 (Ad-Blockers)은 VITE 클라이언트가 VITE DEV 서버에 요청을 보내지 못하게 할 수 있습니다. 이 경우 로그 오류가없는 흰색 화면이 표시 될 수 있습니다. 이 문제가있는 경우 확장을 비활성화해보십시오.

### 창에서 크로스 드라이브 링크

Windows에 프로젝트에 크로스 드라이브 링크가있는 경우 Vite가 작동하지 않을 수 있습니다.

크로스 드라이브 링크의 예는 다음과 같습니다.

- `subst` 명령에 의해 폴더에 연결된 가상 드라이브
- `mklink` 명령에 의한 다른 드라이브에 대한 Symlink/Junction (예 : 원사 글로벌 캐시)

관련 문제 : [#10802](https://github.com/vitejs/vite/issues/10802)
