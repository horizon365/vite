# V5에서 마이그레이션

## 환경 API

새로운 실험 [환경 API의](/ko/guide/api-environment.md) 일환으로 큰 내부 리팩토링이 필요했습니다. Vite 6은 대부분의 프로젝트가 새로운 전공으로 빠르게 업그레이드 할 수 있도록 변경 사항을 피하기 위해 노력합니다. 우리는 생태계의 상당 부분이 새로운 API의 사용을 안정화시키고 권장하기 시작할 때까지 기다립니다. 일부 사례가있을 수 있지만 프레임 워크 및 도구에 의해서만 낮은 수준의 사용에 영향을 미칩니다. 우리는 생태계의 관리자와 협력하여 출시 전에 이러한 차이점을 완화했습니다. 회귀를 발견하면 [문제를 열어](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml) 주십시오.

Vite의 구현 변경으로 인해 일부 내부 API가 제거되었습니다. 그 중 하나에 의존하는 경우 [기능 요청을](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml) 작성하십시오.

## vite 런타임 API

실험 VITE 런타임 API는 새로운 실험 [환경 API](/ko/guide/api-environment) 의 일부로 VITE 6에서 출시 된 모듈 러너 API로 발전했습니다. 이 기능이 실험적이라는 점을 감안할 때 VITE 5.1에 도입 된 이전 API의 제거는 깨진 변경이 아니지만 사용자는 VITE 6으로 마이그레이션하는 데 동등한 모듈 러너에 대한 사용을 업데이트해야합니다.

## 일반적인 변화

### `resolve.conditions` 의 기본값

이 변경은 [`resolve.conditions`](/ko/config/shared-options#resolve-conditions) / [`ssr.resolve.conditions`](/ko/config/ssr-options#ssr-resolve-conditions) / [`ssr.resolve.externalConditions`](/ko/config/ssr-options#ssr-resolve-externalconditions) 구성하지 않은 사용자에게 영향을 미치지 않습니다.

Vite 5에서 `resolve.conditions` 의 기본값은 `[]` 이고 일부 조건은 내부적으로 추가되었습니다. `ssr.resolve.conditions` 의 기본값은 `resolve.conditions` 의 값이었습니다.

Vite 6에서 일부 조건은 더 이상 내부적으로 추가되지 않으며 구성 값에 포함되어야합니다.
더 이상 내부적으로 추가되지 않는 조건

- `resolve.conditions` 은`[ 'module', 'browser', 'Development입니다|생산 ']`
- `ssr.resolve.conditions` 은`[ 'module', 'node', 'Development입니다|생산 ']`

해당 옵션의 기본값은 해당 값으로 업데이트되고 `ssr.resolve.conditions` 더 이상 `resolve.conditions` 기본값으로 사용하지 않습니다. `개발|생산 `is a special variable that is replaced with`생산`or`개발`depending on the value of`프로세스 .env.node_env`. These default values are exported from `Vite`as`DefaultClientConditions`and` defaultserverconditions`.

`resolve.conditions` 또는 `ssr.resolve.conditions` 의 사용자 정의 값을 지정하면 새 조건을 포함하도록 업데이트해야합니다.
예를 들어, 이전에 `resolve.conditions` 에 `['custom']` 지정한 경우 대신 `['custom', ...defaultClientConditions]` 지정해야합니다.

### JSON Stringify

Vite 5에서 [`json.stringify: true`](/ko/config/shared-options#json-stringify) 설정되면 [`json.namedExports`](/ko/config/shared-options#json-namedexports) 비활성화되었습니다.

Vite 6에서 `json.stringify: true` 설정 되더라도 `json.namedExports` 비활성화되지 않고 값을 존중합니다. 이전 행동을 달성하려면 `json.namedExports: false` 설정할 수 있습니다.

vite 6은 또한 `'auto'` 인 `json.stringify` 에 대한 새로운 기본값도 소개하며, 이는 큰 JSON 파일만을 stringifl니다. 이 동작을 비활성화하려면 `json.stringify: false` 설정하십시오.

### HTML 요소에서 자산 참조의 확장 된 지원

Vite 5에서는 지원되는 HTML 요소 몇 명만이 `<link href>` , `<img src>` 등과 같이 Vite에 의해 처리되고 번들로 제공 될 자산을 참조 할 수있었습니다.

Vite 6은 지원을 훨씬 더 많은 HTML 요소로 확장합니다. 전체 목록은 [HTML 기능](/ko/guide/features.html#html) 문서에서 찾을 수 있습니다.

특정 요소에서 HTML 처리를 거부하려면 요소에 `vite-ignore` 속성을 추가 할 수 있습니다.

### postcss-load-config

[`postcss-load-config`](https://npmjs.com/package/postcss-load-config) V4에서 V6으로 업데이트되었습니다. [`tsx`](https://www.npmjs.com/package/tsx) 또는 [`jiti`](https://www.npmjs.com/package/jiti) 이제 [`ts-node`](https://www.npmjs.com/package/ts-node) 대신 PostCSS 구성 파일을로드해야합니다. 또한 YAML PostCSS 구성 파일을로드하려면 [`yaml`](https://www.npmjs.com/package/yaml) 필요합니다.

### Sass는 이제 기본적으로 최신 API를 사용합니다

Vite 5에서 레거시 API는 기본적으로 SASS에 사용되었습니다. Vite 5.4 현대 API에 대한 지원이 추가되었습니다.

Vite 6에서 최신 API는 기본적으로 SASS에 사용됩니다. 레거시 API를 여전히 사용하려면 [`css.preprocessorOptions.sass.api: 'legacy'` / `css.preprocessorOptions.scss.api: 'legacy'`](/ko/config/shared-options#css-preprocessoroptions) 설정할 수 있습니다. 그러나 레거시 API 지원은 VITE 7에서 제거됩니다.

현대 API로 마이그레이션하려면 [SASS 문서를](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/) 참조하십시오.

### 라이브러리 모드에서 CSS 출력 파일 이름을 사용자 정의합니다

Vite 5에서 라이브러리 모드의 CSS 출력 파일 이름은 항상 `style.css` 이었으며 VITE 구성을 통해 쉽게 변경할 수 없습니다.

vite 6에서 기본 파일 이름은 이제 JS 출력 파일과 유사하게 `package.json` 에서 `"name"` 사용합니다. [`build.lib.fileName`](/ko/config/build-options.md#build-lib) 문자열로 설정되면 CSS 출력 파일 이름에도 값이 사용됩니다. 다른 CSS 파일 이름을 명시 적으로 설정하려면 새 [`build.lib.cssFileName`](/ko/config/build-options.md#build-lib) 사용하여 구성 할 수 있습니다.

마이그레이션하려면 `style.css` 파일 이름에 의존 한 경우 패키지 이름을 기준으로 참조를 새 이름으로 업데이트해야합니다. 예를 들어:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

Vite 5에서와 같이 `style.css` 고수하는 것을 선호하는 경우 대신 `build.lib.cssFileName: 'style'` 설정할 수 있습니다.

## 고급의

소수의 사용자에게만 영향을 미치는 다른 파손 변경이 있습니다.

- [[#17922] Fix (CSS)! : SSR Dev에서 기본 가져 오기를 제거하십시오](https://github.com/vitejs/vite/pull/17922)
  - CSS 파일의 기본 가져 오기 지원은 [VITE 4에서는 더 이상 사용되지 않았](https://v4.vite.dev/guide/migration.html#importing-css-as-a-string) 으며 VITE 5에서 제거되었지만 여전히 SSR DEV 모드에서도 의도하지 않은 지원을 받았습니다. 이 지원은 이제 제거되었습니다.
- [[#15637] Fix! : SSR의 경우 기본 `build.cssMinify` ~ `'esbuild'`](https://github.com/vitejs/vite/pull/15637)
  - [`build.cssMinify`](/ko/config/build-options#build-cssminify) 은 이제 SSR 빌드의 경우에도 기본적으로 활성화됩니다.
- [[#18070] feat! : WebSocket과 함께 프록시 바이 패스](https://github.com/vitejs/vite/pull/18070)
  - `server.proxy[path].bypass` 은 이제 WebSocket 업그레이드 요청을 요청 하고이 경우 `res` 매개 변수는 `undefined` 입니다.
- [[#18209] Refactor! : 범프 최소 Terser 버전을 5.16.0으로](https://github.com/vitejs/vite/pull/18209)
  - [`build.minify: 'terser'`](/ko/config/build-options#build-minify) 에 대한 최소 지원 Terser 버전은 5.4.0에서 5.16.0으로 충돌했습니다.
- [[#18231] CHORE (DEPS) : rollup/plugin-commonjs에 v28을 업데이트하십시오](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires) 이제 기본적으로 `true` 입니다 (전 `'auto'` ).
    - 이것은 더 큰 번들 크기로 이어질 수 있지만 더 결정적인 빌드를 초래할 수 있습니다.
    - CommonJS 파일을 진입 점으로 지정하는 경우 추가 단계가 필요할 수 있습니다. 자세한 내용은 [CommonJS 플러그인 문서를](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#using-commonjs-files-as-entry-points) 읽으십시오.
- [[#18243] Chore (deps)! : `fast-glob` 에서 `tinyglobby` 까지 마이그레이션합니다](https://github.com/vitejs/vite/pull/18243)
  - 범위 브레이스 ( `{01..03}` ⇒ `['01', '02', '03']` ) 및 증분 버팀대 ( `{2..8..2}` ⇒ `['2', '4', '6', '8']` )는 더 이상 글로브에서 지원되지 않습니다.
- [[#18395] feat (Resolve)! : 조건 제거 허용](https://github.com/vitejs/vite/pull/18395)
  - 이 PR은 위에서 언급 한 변화를 " `resolve.conditions` 에 대한 기본값"으로 도입 할뿐만 아니라 SSR의 비전문화 종속성에 `resolve.mainFields` 되지 않도록합니다. `resolve.mainFields` 사용하고 있고 SSR에서 비전문화 의존성에 적용하려는 경우 [`ssr.resolve.mainFields`](/ko/config/ssr-options#ssr-resolve-mainfields) 사용할 수 있습니다.
- [[#18493] Refactor! : fs.CachedChecks 옵션을 제거하십시오](https://github.com/vitejs/vite/pull/18493)
  - 이 옵트 인 최적화는 캐시 된 폴더에 파일을 작성하고 즉시 가져올 때 에지 케이스로 인해 제거되었습니다.
- ~~[[#18697] FIX (DEPS)! : V12에 대한 Dotenv-Expand의 의존성 업데이트](https://github.com/vitejs/vite/pull/18697)~~
  - ~~보간에 사용 된 변수는 보간 전에 선언해야합니다. 자세한 내용은 [`dotenv-expand` ChangeLog를](https://github.com/motdotla/dotenv-expand/blob/v12.0.1/CHANGELOG.md#1200-2024-11-16) 참조하십시오.~~ 이 파손 변화는 v6.1.0에서 되돌아 갔다.
- [[#16471] feat : v6- 환경 API](https://github.com/vitejs/vite/pull/16471)

  - SSR 전용 모듈에 대한 업데이트는 더 이상 클라이언트의 전체 페이지 재 장전을 트리거하지 않습니다. 이전 동작으로 돌아가려면 사용자 정의 vite 플러그인을 사용할 수 있습니다.
    <details>
    <summary>예제를 확장하려면 클릭하십시오</summary>

    ```ts twoslash
    import type { Plugin, EnvironmentModuleNode } from 'vite'

    function hmrReload(): Plugin {
      return {
        name: 'hmr-reload',
        enforce: 'post',
        hotUpdate: {
          order: 'post',
          handler({ modules, server, timestamp }) {
            if (this.environment.name !== 'ssr') return

            let hasSsrOnlyModules = false

            const invalidatedModules = new Set<EnvironmentModuleNode>()
            for (const mod of modules) {
              if (mod.id == null) continue
              const clientModule =
                server.environments.client.moduleGraph.getModuleById(mod.id)
              if (clientModule != null) continue

              this.environment.moduleGraph.invalidateModule(
                mod,
                invalidatedModules,
                timestamp,
                true,
              )
              hasSsrOnlyModules = true
            }

            if (hasSsrOnlyModules) {
              server.ws.send({ type: 'full-reload' })
              return []
            }
          },
        },
      }
    }
    ```

    </details>

## V4에서 마이그레이션

vite v5 문서 [의 v4 가이드에서 마이그레이션을](https://v5.vite.dev/guide/migration.html) 확인하여 먼저 앱을 Vite 5로 포트하는 데 필요한 변경 사항을 확인한 다음이 페이지의 변경 사항을 진행하십시오.
