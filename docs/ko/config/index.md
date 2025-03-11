---
title: Vite 구성
---

# Vite 구성

명령 줄에서 `vite` 실행할 때 Vite는 자동으로 [프로젝트 루트](/ko/guide/#index-html-and-project-root) 내부 `vite.config.js` 이라는 구성 파일을 해결하려고 시도합니다 (기타 JS 및 TS 확장 기능도 지원됩니다).

가장 기본적인 구성 파일은 다음과 같습니다.

```js [vite.config.js]
export default {
  // 구성 옵션
}
```

참고 vite는 프로젝트가 기본 노드 ESM을 사용하지 않는 `type: "module"` 에도 `package.json` 파일에서 ES 모듈 구문을 사용하여 지원합니다. 이 경우 구성 파일은로드 전에 자동 사전 처리됩니다.

또한 `--config` CLI 옵션 ( `cwd` 에 따라 해결됨)과 함께 사용할 구성 파일을 명시 적으로 지정할 수도 있습니다.

```bash
vite --config my-config.js
```

::: tip CONFIG LOADING
기본적으로 Vite는 `esbuild` 사용하여 구성을 임시 파일에 번들로 묶고로드합니다. 이로 인해 Monorepo에서 TypeScript 파일을 가져올 때 문제가 발생할 수 있습니다. 이 접근법과 관련된 문제가 발생하면 `--configLoader runner` 지정하여 [모듈 러너를](/ko/guide/api-environment-runtimes.html#modulerunner) 대신 사용하도록 지정할 수 있습니다. 이는 임시 구성을 생성하지 않고 즉시 파일을 변환합니다. 모듈 러너는 구성 파일에서 CJS를 지원하지 않지만 외부 CJS 패키지는 평소와 같이 작동해야합니다.

또는 TypeScript (예 : `node --experimental-strip-types` )를 지원하는 환경을 사용하거나 일반 JavaScript 만 작성하는 경우 환경의 기본 런타임을 사용하여 구성 파일을로드하도록 `--configLoader native` 지정할 수 있습니다. 구성 파일로 가져온 모듈에 대한 업데이트는 감지되지 않으므로 Vite 서버를 자동으로 평가하지 않습니다.
:::

## Intellisense를 구성하십시오

Vite는 TypeScript 타이핑이있는 선박이므로 JSDOC 유형 힌트로 IDE의 Intellisense를 활용할 수 있습니다.

```js
/** @Type {import ( 'vite'). UserConfig} */
export default {
  // ...
}
```

또는 JSDOC 주석이 없어도 Intellisense를 제공 해야하는 `defineConfig` 도우미를 사용할 수 있습니다.

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite는 또한 TypeScript 구성 파일을 지원합니다. 위의 `defineConfig` 도우미 함수와 함께 `vite.config.ts` 사용하거나 `satisfies` 연산자와 함께 사용할 수 있습니다.

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## 조건부 구성

구성이 명령 ( `serve` 또는 `build` )에 따라 조건부로 옵션을 결정 해야하는 경우 사용중인 [모드가](/ko/guide/env-and-mode#modes) SSR 빌드 ( `isSsrBuild` )이거나 빌드 ( `isPreview` )를 미리 보는 경우 대신 함수를 내보낼 수 있습니다.

```js twoslash
import { defineConfig } from 'vite'
// ---자르다---
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // DEV 특정 구성
    }
  } else {
    // 명령 === '빌드'
    return {
      // 특정 구성을 빌드하십시오
    }
  }
})
```

Vite의 API에서 `command` 값은 개발 중 1 값이 `serve` 이고 (CLI [`vite`](/ko/guide/cli#vite) , `vite dev` 및 `vite serve` 에서는 별칭), 생산을위한 건물 ( [`vite build`](/ko/guide/cli#vite-build) )은 `build` .

`isSsrBuild` 과 `isPreview` 각각 `build` 및 `serve` 명령의 종류를 구별하기위한 추가 옵션 플래그입니다. VITE 구성을로드하는 일부 도구는 이러한 플래그를 지원하지 않을 수 있으며 대신 `undefined` 통과합니다. 따라서 `true` 와 `false` 에 대한 명시 적 비교를 사용하는 것이 좋습니다.

## 비동기 구성

구성이 비동기 함수를 호출 해야하는 경우 대신 비동기 기능을 내보낼 수 있습니다. 그리고이 비동기 기능은 개선 된 Intellisense 지원을 위해 `defineConfig` 통과 할 수 있습니다.

```js twoslash
import { defineConfig } from 'vite'
// ---자르다---
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // vite config
  }
})
```

## 구성에서 환경 변수 사용

환경 변수는 평소와 같이 `process.env` 에서 얻을 수 있습니다.

VITE는 기본적으로 `.env` 파일을로드하지 않습니다.로드 할 파일은 vite 구성을 평가 한 후에 만 결정할 수 있습니다 (예 : `root` 및 `envDir` 옵션은 로딩 동작에 영향을 미칩니다. 그러나 내보내는 `loadEnv` 도우미를 사용하여 필요한 경우 특정 `.env` 파일을로드 할 수 있습니다.

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // 현재 작업 디렉토리에서 `mode` 기준으로 ENV 파일을로드하십시오.
  // 세 번째 매개 변수를 ''로 설정하여
  // `VITE_` 접두사.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
