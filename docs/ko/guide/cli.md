# 명령 줄 인터페이스

## DEV 서버

### `vite`

현재 디렉토리에서 Vite Dev 서버를 시작하십시오. `vite dev` 과 `vite serve` `vite` 에 대한 별칭입니다.

#### 용법

```bash
vite [root]
```

#### 옵션

| 옵션                      |                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | 호스트 이름 지정 ( `string` )                                                                                                             |
| `--port <port>`           | 포트 지정 ( `number` )                                                                                                                    |
| `--open [path]`           | 스타트 업에서 브라우저 오픈 (`boolean \| 문자열`)                                                                                         |
| `--cors`                  | Cors 활성화 ( `boolean` )                                                                                                                 |
| `--strictPort`            | 지정된 포트가 이미 사용중인 경우 종료 ( `boolean` )                                                                                       |
| `--force`                 | Optimizer가 캐시를 무시하고 다시 번들을 무시하도록 강제 ( `boolean` )                                                                     |
| `-c, --config <file>`     | 지정된 구성 파일 ( `string` ) 사용                                                                                                        |
| `--base <path>`           | 공공 기지 경로 (기본값 : `/` ) ( `string` )                                                                                               |
| `-l, --logLevel <level>`  | 정보 \| 경고하다 \| 오류 \| 침묵 ( `string` )                                                                                             |
| `--clearScreen`           | 로깅 할 때 클리어 화면 허용/비활성화 ( `boolean` )                                                                                        |
| `--configLoader <loader>` | `bundle` 사용하여 Esbuild 또는 `runner` (실험)으로 구성을 묶으려면 기본 런타임 (기본값 : `bundle` )을 사용하여로드하려면 `native` (실험). |
| `--profile`               | 내장 Node.js Inspector ( [성능 병목 현상](/ko/guide/troubleshooting#performance-bottlenecks) 점검) 시작                                   |
| `-d, --debug [feat]`      | 디버그 로그 표시 (`String \| 부울)                                                                                                        |
| `-f, --filter <filter>`   | 필터 디버그 로그 ( `string` )                                                                                                             |
| `-m, --mode <mode>`       | 설정 모드 ( `string` )                                                                                                                    |
| `-h, --help`              | 사용 가능한 CLI 옵션을 표시합니다                                                                                                         |
| `-v, --version`           | 디스플레이 버전 번호                                                                                                                      |

## 짓다

### `vite build`

생산을위한 빌드.

#### 용법

```bash
vite build [root]
```

#### 옵션

| 옵션                           |                                                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `--target <target>`            | 트랜스 파일 대상 (기본값 : `"modules"` ) ( `string` )                                                                      |
| `--outDir <dir>`               | 출력 디렉토리 (기본값 : `dist` ) ( `string` )                                                                              |
| `--assetsDir <dir>`            | 자산을 배치하려는 Outdir의 디렉토리 (기본값 : `"assets"` ) ( `string` )                                                    |
| `--assetsInlineLimit <number>` | 바이트의 정적 자산 Base64 인라인 임계 값 (기본값 : `4096` ) ( `number` )                                                   |
| `--ssr [entry]`                | 서버 측 렌더링 ( `string` )에 대한 지정된 항목 빌드                                                                        |
| `--sourcemap [output]`         | 빌드 용 출력 소스 맵 (기본값 : `false` ) (`부울 \| "인라인"\| "숨겨진"`)                                                   |
| `--minify [minifier]`          | 미니 화 활성화/비활성화 또는 사용할 미니 페이저를 지정하십시오 (기본값 : `"esbuild"` ) (`boolean \| "Terser"\| "Esbuild"`) |
| `--manifest [name]`            | 빌드 빌드 매니페스트 json (`boolean \| 문자열`)                                                                            |
| `--ssrManifest [name]`         | SSR Manifest JSON (`Boolean \| 문자열`)                                                                                    |
| `--emptyOutDir`                | 뿌리 외부에있을 때 비어있는 아웃 디르 ( `boolean` )                                                                        |
| `-w, --watch`                  | 디스크에서 모듈이 변경되었을 때 재 구축 ( `boolean` )                                                                      |
| `-c, --config <file>`          | 지정된 구성 파일 ( `string` ) 사용                                                                                         |
| `--base <path>`                | 공공 기지 경로 (기본값 : `/` ) ( `string` )                                                                                |
| `-l, --logLevel <level>`       | 정보 \| 경고하다 \| 오류 \| 침묵 ( `string` )                                                                              |
| `--clearScreen`                | 로깅 할 때 클리어 화면 허용/비활성화 ( `boolean` )                                                                         |
| `--configLoader <loader>`      | `bundle` 사용하여 Esbuild 또는 `runner` (실험)으로 구성을 묶으려면 즉시 처리합니다 (기본값 : `bundle` ).                   |
| `--profile`                    | 내장 Node.js Inspector ( [성능 병목 현상](/ko/guide/troubleshooting#performance-bottlenecks) 점검) 시작                    |
| `-d, --debug [feat]`           | 디버그 로그 표시 (`String \| 부울)                                                                                         |
| `-f, --filter <filter>`        | 필터 디버그 로그 ( `string` )                                                                                              |
| `-m, --mode <mode>`            | 설정 모드 ( `string` )                                                                                                     |
| `-h, --help`                   | 사용 가능한 CLI 옵션을 표시합니다                                                                                          |
| `--app`                        | `builder: {}` ( `boolean` , 실험)과 같은 모든 환경 구축                                                                    |

## 기타

### `vite optimize`

사전 번들 종속성.

**감가 상각** : 사전 번들 프로세스는 자동으로 실행되며 호출 할 필요가 없습니다.

#### 용법

```bash
vite optimize [root]
```

#### 옵션

| 옵션                      |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--force`                 | Optimizer가 캐시를 무시하고 다시 번들을 무시하도록 강제 ( `boolean` )                                    |
| `-c, --config <file>`     | 지정된 구성 파일 ( `string` ) 사용                                                                       |
| `--base <path>`           | 공공 기지 경로 (기본값 : `/` ) ( `string` )                                                              |
| `-l, --logLevel <level>`  | 정보 \| 경고하다 \| 오류 \| 침묵 ( `string` )                                                            |
| `--clearScreen`           | 로깅 할 때 클리어 화면 허용/비활성화 ( `boolean` )                                                       |
| `--configLoader <loader>` | `bundle` 사용하여 Esbuild 또는 `runner` (실험)으로 구성을 묶으려면 즉시 처리합니다 (기본값 : `bundle` ). |
| `-d, --debug [feat]`      | 디버그 로그 표시 (`String \| 부울)                                                                       |
| `-f, --filter <filter>`   | 필터 디버그 로그 ( `string` )                                                                            |
| `-m, --mode <mode>`       | 설정 모드 ( `string` )                                                                                   |
| `-h, --help`              | 사용 가능한 CLI 옵션을 표시합니다                                                                        |

### `vite preview`

로컬로 생산 빌드를 미리 봅니다. 이를 제작 서버로 사용하지 마십시오.

#### 용법

```bash
vite preview [root]
```

#### 옵션

| 옵션                      |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | 호스트 이름 지정 ( `string` )                                                                            |
| `--port <port>`           | 포트 지정 ( `number` )                                                                                   |
| `--strictPort`            | 지정된 포트가 이미 사용중인 경우 종료 ( `boolean` )                                                      |
| `--open [path]`           | 스타트 업에서 브라우저 오픈 (`boolean \| 문자열`)                                                        |
| `--outDir <dir>`          | 출력 디렉토리 (기본값 : `dist` ) ( `string` )                                                            |
| `-c, --config <file>`     | 지정된 구성 파일 ( `string` ) 사용                                                                       |
| `--base <path>`           | 공공 기지 경로 (기본값 : `/` ) ( `string` )                                                              |
| `-l, --logLevel <level>`  | 정보 \| 경고하다 \| 오류 \| 침묵 ( `string` )                                                            |
| `--clearScreen`           | 로깅 할 때 클리어 화면 허용/비활성화 ( `boolean` )                                                       |
| `--configLoader <loader>` | `bundle` 사용하여 Esbuild 또는 `runner` (실험)으로 구성을 묶으려면 즉시 처리합니다 (기본값 : `bundle` ). |
| `-d, --debug [feat]`      | 디버그 로그 표시 (`String \| 부울)                                                                       |
| `-f, --filter <filter>`   | 필터 디버그 로그 ( `string` )                                                                            |
| `-m, --mode <mode>`       | 설정 모드 ( `string` )                                                                                   |
| `-h, --help`              | 사용 가능한 CLI 옵션을 표시합니다                                                                        |
