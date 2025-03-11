# 성능

Vite는 기본적으로 빠르지 만 프로젝트 요구 사항이 증가함에 따라 성능 문제가 발생할 수 있습니다. 이 안내서는 다음과 같은 일반적인 성능 문제를 식별하고 수정하는 데 도움이됩니다.

- 느린 서버가 시작됩니다
- 느린 페이지로드
- 느린 빌드

## 브라우저 설정을 검토하십시오

일부 브라우저 확장은 특히 브라우저 DEV 도구를 사용할 때 요청을 방해하고 대형 앱의 시작 및 재 장전 시간을 느리게 할 수 있습니다. 이 경우 Vite의 Dev Server를 사용하면서 확장없이 DEV 전용 프로파일을 작성하거나 시크릿 모드로 전환하는 것이 좋습니다. 시크릿 모드는 확장이없는 일반 프로파일보다 빠르야합니다.

Vite Dev 서버는 사전 구매 종속성을 하드 캐싱하며 소스 코드에 대한 304 응답을 구현합니다. 브라우저 데브 도구가 열려있는 동안 캐시 비활성화는 시작 및 전체 페이지 재 장전 시간에 큰 영향을 줄 수 있습니다. Vite 서버에서 작업하는 동안 "캐시 비활성화"가 활성화되지 않은지 확인하십시오.

## 구성된 Vite 플러그인을 감사합니다

Vite의 내부 및 공식 플러그인은 더 넓은 생태계와 호환성을 제공하면서 가능한 최소한의 작업을 수행하도록 최적화되었습니다. 예를 들어, 코드 변환은 Dev에서 Regex를 사용하지만 정확성을 보장하기 위해 빌드에서 완전한 구문 분석을 수행합니다.

그러나 커뮤니티 플러그인의 성능은 Vite의 제어에서 벗어나 개발자 경험에 영향을 줄 수 있습니다. 다음은 추가 Vite 플러그인을 사용할 때 찾을 수있는 몇 가지 사항입니다.

1. Node.js 시작 시간을 줄이기 위해 특정 경우에만 사용되는 대규모 의존성을 동적으로 가져와야합니다. 예제 Refactors : [Vite-Plugin-React#212](https://github.com/vitejs/vite-plugin-react/pull/212) 및 [Vite-Plugin-PWA#224](https://github.com/vite-pwa/vite-plugin-pwa/pull/244) .

2. `buildStart` , `config` 및 `configResolved` 후크는 길고 광범위한 작업을 실행해서는 안됩니다. 이 후크는 Dev Server 스타트 업 동안 기다리고 있으며 브라우저에서 사이트에 액세스 할 수있는 경우 지연됩니다.

3. `resolveId` , `load` 및 `transform` 후크로 인해 일부 파일이 다른 파일보다 느리게로드 될 수 있습니다. 때로는 피할 수 없지만 가능한 영역이 최적화 할 수 있는지 확인하는 것이 좋습니다. 예를 들어, `code` 에 특정 키워드가 포함되어 있는지 확인하면 전체 변환을 수행하기 전에 `id` 특정 확장자와 일치합니다.

   파일을 변환하는 데 시간이 오래 걸리면 브라우저에 사이트를로드 할 때 요청 폭포가 더 중요합니다.

   `vite --debug plugin-transform` 또는 [Vite-Plugin-Inspect를](https://github.com/antfu/vite-plugin-inspect) 사용하여 파일을 변환하는 데 걸리는 시간을 검사 할 수 있습니다. 비동기 작업은 부정확 한 타이밍을 제공하는 경향이 있으므로 숫자를 대략적인 추정치로 취급해야하지만 여전히 더 비싼 작업을 드러내야합니다.

::: tip Profiling
`vite --profile` 실행하고 사이트를 방문하고 터미널에서 `p + enter` 눌러 `.cpuprofile` 기록 할 수 있습니다. 그런 다음 [SpeedScope](https://www.speedscope.app) 와 같은 도구를 사용하여 프로파일을 검사하고 병목 현상을 식별 할 수 있습니다. 성능 문제를 식별 할 수 있도록 Vite 팀과 [프로파일을 공유](https://chat.vite.dev) 할 수도 있습니다.
:::

## 해결 작업을 줄입니다

최악의 경우를 자주 치면 수입 경로를 해결하는 것은 비용이 많이 드는 작업이 될 수 있습니다. 예를 들어, Vite는 [`resolve.extensions`](/ko/config/shared-options.md#resolve-extensions) 옵션을 갖는 "추측"가져 오기 경로를 지원하며, 기본값은 `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']` 로 기본값을 제공합니다.

`import './Component'` 으로 `./Component.jsx` 가져 오려면 Vite는이 단계를 해결하기 위해이 단계를 실행합니다.

1. `./Component` 있는지 확인하십시오.
2. `./Component.mjs` 있는지 확인하십시오.
3. `./Component.js` 있는지 확인하십시오.
4. `./Component.mts` 있는지 확인하십시오.
5. `./Component.ts` 있는지 확인하십시오.
6. `./Component.jsx` 존재하는지 확인하십시오.

도시 된 바와 같이, 가져 오기 경로를 해결하려면 총 6 개의 파일 시스템 검사가 필요하다. 당신이 가지고있는 내재 수입이 많을수록 경로를 해결하기 위해 더 많은 시간을 더합니다.

따라서 일반적으로 가져 오기 경로 (예 : `import './Component.jsx'` )에 명시적인 것이 낫습니다. 일반 파일 시스템 검사를 줄이려면 `resolve.extensions` 의 목록을 좁힐 수도 있지만 파일이 `node_modules` 에서 작동하는지 확인해야합니다.

플러그인 저자 인 경우 위의 수표 수를 줄이기 위해 필요한 경우 [`this.resolve`](https://rollupjs.org/plugin-development/#this-resolve) 만 전화하십시오.

::: tip TypeScript
TypeScript를 사용하는 경우 `tsconfig.json` 의 `compilerOptions` 에서 `"moduleResolution": "bundler"` 과 `"allowImportingTsExtensions": true` 활성화하여 코드에서 직접 `.ts` 및 `.tsx` 확장을 사용하십시오.
:::

## 배럴 파일을 피하십시오

배럴 파일은 동일한 디렉토리에서 다른 파일의 API를 다시 수출하는 파일입니다. 예를 들어:

```js [src/utils/index.js]
export * from './color.js'
export * from './dom.js'
export * from './slash.js'
```

개별 API (예 : `import { slash } from './utils'` ) 만 가져 오면 해당 배럴 파일의 모든 파일을 `slash` API를 포함 할 수 있으므로 초기화시 실행되는 부작용을 포함 할 수도 있으므로 해당 배럴 파일의 모든 파일을 가져와 변환해야합니다. 즉, 초기 페이지로드에서 필요한 것보다 더 많은 파일을로드하여 페이지로드가 느려집니다.

가능하면 배럴 파일을 피하고 개별 API를 직접 가져와야합니다 (예 : `import { slash } from './utils/slash.js'` ). 자세한 내용은 [이슈 #8237을](https://github.com/vitejs/vite/issues/8237) 읽을 수 있습니다.

## 자주 사용되는 파일을 예열합니다

Vite Dev 서버는 브라우저에서 요청한대로 파일 만 변환하여 빠르게 시작하고 중고 파일에 대한 변환 만 적용 할 수 있습니다. 특정 파일이 곧 요청 될 것으로 예상되는 경우 파일을 사전 변환 할 수 있습니다. 그러나 일부 파일이 다른 파일보다 변환하는 데 시간이 오래 걸리면 Waterfall이 여전히 발생할 수 있습니다. 예를 들어:

왼쪽 파일이 오른쪽 파일을 가져 오는 가져 오기 그래프가 주어졌습니다.

```
main.js -> BigComponent.vue -> big-utils.js -> large-data.json
```

가져 오기 관계는 파일이 변환 된 후에 만 알 수 있습니다. `BigComponent.vue` 변환하는 데 시간이 걸리면 `big-utils.js` 차례를 기다려야합니다. 이로 인해 사전 변형이 내장되어 있어도 내부 폭포가 발생합니다.

Vite를 사용하면 [`server.warmup`](/ko/config/server-options.md#server-warmup) `big-utils.js` 을 사용하여 자주 사용하는 파일을 워밍업 할 수 있습니다. 이 방법 `big-utils.js` 요청 될 때 즉시 제공 될 준비가되고 캐시됩니다.

`vite --debug transform` 실행하여 자주 사용하는 파일을 찾고 로그를 검사 할 수 있습니다.

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
```

```js [vite.config.js]
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

시작시 Vite Dev 서버를 과부하시키지 않는 데 자주 사용되는 파일 만 워밍업해야합니다. 자세한 내용은 [`server.warmup`](/ko/config/server-options.md#server-warmup) 옵션을 확인하십시오.

[`--open` 또는 `server.open`](/ko/config/server-options.html#server-open) 사용하면 vite가 앱의 진입 점을 자동으로 워밍업하거나 제공 할 수있는 URL을 열 수 있으므로 성능 향상도 제공합니다.

## 덜 또는 기본 툴링을 사용하십시오

성장하는 코드베이스로 Vite를 빠르게 유지하는 것은 소스 파일 (JS/TS/CSS)의 작업량을 줄이는 것입니다.

더 적은 작업을 수행하는 예 :

- 가능한 경우 SASS/LESS/Stylus 대신 CSS를 사용하십시오 (Nesting은 PostCS에서 처리 할 수 있음).
- SVG를 UI 프레임 워크 구성 요소 (React, Vue 등)로 변환하지 마십시오. 대신 문자열 또는 URL로 가져옵니다.
- `@vitejs/plugin-react` 사용하는 경우 Babel 옵션 구성을 피하면 빌드 중 변환을 건너 뜁니다 (Esbuild 만 사용됩니다).

기본 툴링 사용의 예 :

기본 툴링을 사용하면 종종 더 큰 설치 크기가 제공되며 새 Vite 프로젝트를 시작할 때 기본값이 아닙니다. 그러나 더 큰 응용 프로그램의 비용은 가치가있을 수 있습니다.

- [LightningCSS](https://github.com/vitejs/vite/discussions/13835) 에 대한 실험 지원을 시도하십시오
- `@vitejs/plugin-react` 대신 [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc) 사용하십시오.
