# ENV 변수 및 모드

Vite는 특수 `import.meta.env` 객체 아래에 특정 상수를 노출시킵니다. 이러한 상수는 DEV 동안 글로벌 변수로 정의되며 빌드 시점에 정적으로 교체하여 트리 쉐이킹을 효과적으로 대체합니다.

## 내장 상수

일부 내장 상수는 모든 경우에 사용할 수 있습니다.

- **`import.meta.env.MODE`** : {string} 앱이 실행중인 [모드](#modes) 입니다.

- **`import.meta.env.BASE_URL`** : {string} 앱이 제공되는 기본 URL. 이것은 [`base` 구성 옵션](/ko/config/shared-options.md#base) 에 의해 결정됩니다.

- **`import.meta.env.PROD`** : {boolean} 앱이 생산 중이 있는지 여부 ( `NODE_ENV='production'` 로 개발 서버를 실행하거나 `NODE_ENV='production'` 로 구축 된 앱을 실행).

- **`import.meta.env.DEV`** : {boolean} 앱이 개발 중인지 여부 (항상 `import.meta.env.PROD` )

- **`import.meta.env.SSR`** : {boolean} 앱이 [서버](./ssr.md#conditional-logic) 에서 실행 중인지 여부.

## ENV 변수

vite는 `import.meta.env` 개체 아래에 ENV 변수를 문자열로 노출시킵니다.

실수로 ENV 변수가 클라이언트에 유출되는 것을 방지하기 위해 `VITE_` 으로 접두사 한 변수 만 VITE 처리 코드에 노출됩니다. 예를 들어 다음과 같은 ENV 변수에 대해서는 다음과 같습니다.

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

`VITE_SOME_KEY` 만이 클라이언트 소스 코드에 `import.meta.env.VITE_SOME_KEY` 으로 노출되지만 `DB_PASSWORD` 그렇지 않습니다.

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // 한정되지 않은
```

ENV 변수 접두사를 사용자 정의하려면 [EnvPrefix](/ko/config/shared-options.html#envprefix) 옵션을 참조하십시오.

:::tip Env parsing
위에서 볼 수 있듯이 `VITE_SOME_KEY` 은 숫자이지만 구문 분석하면 문자열을 반환합니다. 부울 ENV 변수에 대해서도 마찬가지입니다. 코드에서 사용할 때 원하는 유형으로 변환하십시오.
:::

### `.env` 파일

Vite는 [dotenv를](https://github.com/motdotla/dotenv) 사용하여 [환경 디렉토리의](/ko/config/shared-options.md#envdir) 다음 파일에서 추가 환경 변수를로드합니다.

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

:::tip Env Loading Priorities

특정 모드 (예 : `.env.production` )의 ENV 파일은 일반적인 모드 (예 : `.env` )보다 우선 순위가 높습니다.

Vite는 모드 별 `.env.[mode]` 파일 외에 항상 `.env` 과 `.env.local` 로드합니다. 모드 별 파일로 선언 된 변수는 일반 파일의 변수보다 우선하지만 `.env` 또는 `.env.local` 로만 정의 된 변수는 여전히 환경에서 사용할 수 있습니다.

또한 VITE가 실행될 때 이미 존재하는 환경 변수는 우선 순위가 가장 높으며 `.env` 파일로 덮어 쓰지 않습니다. 예를 들어, 실행할 때 `VITE_SOME_KEY=123 vite build` .

VITE 시작시 `.env` 파일이로드됩니다. 변경 후 서버를 다시 시작하십시오.

:::

또한 Vite는 [DOTENV-EXPAND를](https://github.com/motdotla/dotenv-expand) 사용하여 상자에서 ENV 파일로 작성된 변수를 확장합니다. 구문에 대한 자세한 내용은 [문서를](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow) 확인하십시오.

환경 값 내부에서 `$` 사용하려면 `\` 로 탈출해야합니다.

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

:::warning SECURITY NOTES

- `.env.*.local` 파일은 로컬 전용이며 민감한 변수를 포함 할 수 있습니다. git에 체크인하지 않도록 `.gitignore` 에 `*.local` 추가해야합니다.

- Vite 소스 코드에 노출 된 변수는 클라이언트 번들에 있으므로 `VITE_*` 변수에는 민감한 정보가 포함되어 있지 _않아야_ 합니다.

:::

::: details Expanding variables in reverse order

VITE는 변수 확장을 역순으로 지원합니다.
예를 들어, 아래 `.env` 은 `VITE_FOO=foobar` , `VITE_BAR=bar` 로 평가됩니다.

```[.env]
VITE_FOO=foo${VITE_BAR}
VITE_BAR=bar
```

이것은 쉘 스크립트 및 `docker-compose` 과 같은 다른 도구에서는 작동하지 않습니다.
즉, Vite는 오랫동안 `dotenv-expand` 으로 지원 되었기 때문에이 동작을 지원하고 JavaScript Ecosystem의 다른 도구는이 동작을 지원하는 이전 버전을 사용합니다.

인터 로프 문제를 피하려면이 동작에 의존하지 않는 것이 좋습니다. Vite는 앞으로이 행동에 대한 경고를 방출하기 시작할 수 있습니다.

:::

## TypeScript에 대한 IntellIsense

기본적으로 Vite는 [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) 에서 `import.meta.env` 에 대한 유형 정의를 제공합니다. `.env.[mode]` 파일에서 더 많은 사용자 정의 ENV 변수를 정의 할 수 있지만 `VITE_` 로 접두사가있는 사용자 정의 ENV 변수에 대해 TypeScript IntellIsense를 얻을 수 있습니다.

이를 달성하려면 `src` 디렉토리에서 0에서 `vite-env.d.ts` 생성 한 다음 다음과 같은 `ImportMetaEnv` 증강시킬 수 있습니다.

```typescript [vite-env.d.ts]
///<reference types="vite/client">

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 더 많은 env 변수 ...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

코드가 [DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) 및 [WebWorker](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts) 와 같은 브라우저 환경의 유형에 의존하는 경우 [LIB](https://www.typescriptlang.org/tsconfig#lib) 필드를 `tsconfig.json` 으로 업데이트 할 수 있습니다.

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Imports will break type augmentation

`ImportMetaEnv` 보강이 작동하지 않으면 `vite-env.d.ts` 에 `import` 명령문이 없는지 확인하십시오. 자세한 내용은 [TypeScript 문서를](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined) 참조하십시오.

:::

## HTML 상수 교체

Vite는 또한 HTML 파일의 상수를 교체하는 것을 지원합니다. `import.meta.env` 의 모든 속성은 특별 `%CONST_NAME%` 구문이있는 HTML 파일에서 사용할 수 있습니다.

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

ENT가 `import.meta.env` , 예를 들어 `%NON_EXISTENT%` 에 존재하지 않으면 `undefined` 으로 교체되는 JS의 `import.meta.env.NON_EXISTENT` 와 달리 무시되고 교체되지 않습니다.

Vite가 많은 프레임 워크에서 사용한다는 점을 감안할 때 조건부와 같은 복잡한 교체에 대해서는 의도적으로 구현되지 않습니다. [기존 사용자 랜드 플러그인](https://github.com/vitejs/awesome-vite#transformers) 또는 [`transformIndexHtml` 후크를](./api-plugin#transformindexhtml) 구현하는 사용자 정의 플러그인을 사용하여 vite를 확장 할 수 있습니다.

## 모드

기본적으로 Dev Server ( `dev` 명령)는 `development` 모드로 실행되고 `build` 명령은 `production` 모드에서 실행됩니다.

이것은 `vite build` 실행할 때 ENV 변수가 1이 있으면 `.env.production` 에서 1에서로드한다는 것을 의미합니다.

```[.env.production]
VITE_APP_TITLE=My App
```

앱에서 `import.meta.env.VITE_APP_TITLE` 사용하여 제목을 렌더링 할 수 있습니다.

경우에 따라 다른 제목을 렌더링하기 위해 다른 모드로 `vite build` 실행할 수 있습니다. `--mode` 옵션 플래그를 전달하여 명령에 사용되는 기본 모드를 덮어 쓸 수 있습니다. 예를 들어, 스테이징 모드를 위해 앱을 구축하려는 경우 :

```bash
vite build --mode staging
```

`.env.staging` 파일을 만듭니다.

```[.env.staging]
VITE_APP_TITLE=My App (staging)
```

`vite build` 은 기본적으로 생산 빌드를 실행하므로 다른 모드와 `.env` 파일 구성을 사용하여이를 변경하고 개발 빌드를 실행할 수 있습니다.

```[.env.testing]
NODE_ENV=development
```

### node_env 및 모드

`NODE_ENV` ( `process.env.NODE_ENV` )과 모드는 두 가지 다른 개념이라는 점에 유의해야합니다. 다른 명령이 `NODE_ENV` 및 모드에 어떤 영향을 미치는지는 다음과 같습니다.

| 명령                                                 | node_env        | 방법            |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

`NODE_ENV` 과 모드의 다른 값은 해당 `import.meta.env` 속성에도 반영됩니다.

| 명령                   | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| 명령                 | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` in `.env` files

`NODE_ENV=...` 명령과 `.env` 파일로 설정할 수 있습니다. `NODE_ENV` `.env.[mode]` 파일로 지정되면 모드를 사용하여 해당 값을 제어 할 수 있습니다. 그러나 `NODE_ENV` 개와 모드는 모두 두 가지 다른 개념으로 남아 있습니다.

명령에서 `NODE_ENV=...` 의 주요 이점은 Vite가 값을 조기에 감지 할 수 있다는 것입니다. 또한 vite가 구성을 평가하면 ENV 파일 만로드 할 수 있으므로 VITE 구성에서 `process.env.NODE_ENV` 읽을 수 있습니다.
:::
