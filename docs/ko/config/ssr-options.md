# SSR Options

Unless noted, the options in this section are applied to both dev and build.

## ssr.external

- **유형 :** `String [] | 진실
-

Externalize the given dependencies and their transitive dependencies for SSR. By default, all dependencies are externalized except for linked dependencies (for HMR). If you prefer to externalize the linked dependency, you can pass its name to this option.

## ssr.noExternal

- **유형 :** `문자열 | RegExp | (끈 | | 진실
-

If `true` , no dependencies are externalized. However, dependencies explicitly listed in `ssr.external` (using `string[]` type) can take priority and still be externalized. `ssr.target: 'node'` 설정되면 Node.js 내장도 기본적으로 외부화됩니다.

`ssr.noExternal: true` 과 `ssr.external: true` 모두 구성되면 `ssr.noExternal` 우선 순위를 정하고 종속성이 외부화되지 않습니다.

## ssr.target

- |
- **기본값 :** `node`

Build target for the SSR server.

## ssr.resolve.conditions

- **유형 :** `string[]`
- **기본값 :** `[ 'module', 'node', '개발||
-

## ssr.resolve.externalConditions

- **유형 :** `string[]`
- **기본값 :** `['node']`

:::tip

이 옵션을 사용할 때는 DEV에서 동일한 값을 가진 [`--conditions` 플래그](https://nodejs.org/docs/latest/api/cli.html#-c-condition---conditionscondition) 로 노드를 실행하고 일관된 동작을 얻으려면 빌드하십시오.

:::

### ssr.resolve.mainFields

- **유형 :** `string[]`
- **기본값 :** `['module', 'jsnext:main', 'jsnext']`

패키지의 진입 점을 해결할 때 시도 할 `package.json` 의 필드 목록. 참고 이것은 `exports` 필드에서 해결 된 조건부 수출보다 우선 순위가 낮습니다. `exports` 에서 진입 점이 성공적으로 해결되면 메인 필드는 무시됩니다. 이 설정은 비 저전방 종속성에만 영향을 미칩니다.
