# HMR API

:::tip Note
클라이언트 HMR API입니다. 플러그인에서 HMR 업데이트를 처리하려면 [handleHotUpdate를](./api-plugin#handlehotupdate) 참조하십시오.

수동 HMR API는 주로 프레임 워크 및 툴링 저자를위한 것입니다. 최종 사용자로서 HMR은 이미 프레임 워크 특정 스타터 템플릿에서 귀하를 위해 처리되었습니다.
:::

Vite는 특수 `import.meta.hot` 개체를 통해 수동 HMR API를 노출시킵니다.

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'

// ---자르다---
interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  off<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}
```

## 필요한 조건부 가드

우선, 모든 HMR API 사용을 조건부 블록으로 보호하여 프로덕션에서 코드를 트리 쉐이크 할 수 있도록하십시오.

```js
if (import.meta.hot) {
  // HMR 코드
}
```

## TypeScript에 대한 IntellIsense

Vite는 [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) 에서 `import.meta.hot` 에 대한 유형 정의를 제공합니다. `src` 디렉토리에서 `env.d.ts` 만들 수 있으므로 TypeScript가 유형 정의를 선택할 수 있습니다.

```ts
///<reference types="vite/client">
```

## `hot.accept(cb)`

모듈이 자체 수용하려면 업데이트 된 모듈을 수신하는 콜백과 함께 `import.meta.hot.accept` 사용하십시오.

```js twoslash
import 'vite/client'
// ---자르다---
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // SyntaxError가 발생했을 때 NewModule은 정의되지 않았습니다
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

"핫 업데이트"를 "수락"하는 모듈은 **HMR 경계** 로 간주됩니다.

Vite의 HMR은 원래 가져온 모듈을 실제로 교체하지 않습니다. HMR 경계 모듈이 DEP에서 가져 오는 경우 해당 재수력을 업데이트해야합니다 (이러한 수출은 `let` 사용해야합니다). 또한, 경계 모듈에서 체인을 올리는 수입업자에게는 변경 사항을 알리지 않습니다. 이 단순화 된 HMR 구현은 대부분의 DEV 사용 사례에 충분하지만 프록시 모듈을 생성하는 비싼 작업을 건너 뛸 수 있습니다.

Vite는 모듈이 업데이트를받을 수 있도록 소스 코드 에서이 함수에 대한 호출이 `import.meta.hot.accept(` (whitespace-enditive)으로 나타나도록 요구합니다. 이는 VITE가 모듈에 대한 HMR 지원을 가능하게하는 정적 분석의 요구 사항입니다.

## `hot.accept(deps, cb)`

모듈은 자체로드하지 않고 직접 종속성의 업데이트를 수락 할 수 있습니다.

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
// ---자르다---
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // 콜백은 업데이트 된 './foo.js'모듈을 수신합니다
    newFoo?.foo()
  })

  // DEP 모듈의 배열도 허용 할 수 있습니다.
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // 콜백은 업데이트 된 모듈 만있는 배열을 수신합니다.
      // 비 널. 업데이트가 성공하지 못한 경우 (Ex.의 구문 오류)
      // 배열이 비어 있습니다
    },
  )
}
```

## `hot.dispose(cb)`

자체 수용 모듈 또는 다른 사람이 수락 할 것으로 예상되는 모듈은 `hot.dispose` 사용하여 업데이트 된 사본으로 생성 된 지속적인 부작용을 정리할 수 있습니다.

```js twoslash
import 'vite/client'
// ---자르다---
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // 청소 부작용
  })
}
```

## `hot.prune(cb)`

모듈이 더 이상 페이지에서 가져 오지 않을 때 호출되는 콜백을 등록하십시오. `hot.dispose` 과 비교하여 소스 코드가 업데이트시 부작용을 정리하고 페이지에서 제거 될 때만 정리하면됩니다. Vite는 현재 `.css` 가져 오기에 이것을 사용합니다.

```js twoslash
import 'vite/client'
// ---자르다---
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // 청소 부작용
  })
}
```

## `hot.data`

`import.meta.hot.data` 객체는 동일한 업데이트 된 모듈의 다른 인스턴스에 따라 지속됩니다. 이전 버전의 모듈에서 다음 모듈로 정보를 전달하는 데 사용할 수 있습니다.

`data` 자체의 재 할당은 지원되지 않습니다. 대신, 다른 핸들러에서 추가 된 정보가 보존되도록 `data` 객체의 특성을 돌려야합니다.

```js twoslash
import 'vite/client'
// ---자르다---
// 좋아요
import.meta.hot.data.someValue = 'hello'

// 지원되지 않습니다
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

이것은 현재 Noop이며 후진 호환성을위한 것입니다. 새로운 사용법이 있으면 미래에 변경 될 수 있습니다. 모듈이 열렬하지 않음을 나타 내려면 `hot.invalidate()` 사용하십시오.

## `hot.invalidate(message?: string)`

자체 수용 모듈은 런타임 중에 HMR 업데이트를 처리 할 수 없다는 것을 인식 할 수 있으므로 업데이트는 수입 업체로 강제로 전파되어야합니다. `import.meta.hot.invalidate()` 호출함으로써 HMR 서버는 발신자가 자체 수용하지 않는 것처럼 발신자의 수입업자를 무효화합니다. 이렇게하면 브라우저 콘솔과 터미널에 메시지를 기록합니다. 무효화가 발생한 이유에 대한 컨텍스트를 제공하기 위해 메시지를 전달할 수 있습니다.

즉시 `invalidate` 에 전화를 걸더라도 항상 `import.meta.hot.accept` 호출해야합니다. 그렇지 않으면 HMR 클라이언트가 자체 수용 모듈의 향후 변경 사항을 듣지 않습니다. 의도를 명확하게 전달하려면 `accept` 콜백 내에서 `invalidate` 호출을하는 것이 좋습니다.

```js twoslash
import 'vite/client'
// ---자르다---
import.meta.hot.accept((module) => {
  // 새 모듈 인스턴스를 사용하여 무효화 여부를 결정할 수 있습니다.
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

HMR 이벤트를 들어보십시오.

다음 HMR 이벤트는 Vite가 자동으로 발송합니다.

- `'vite:beforeUpdate'` 업데이트가 적용될 때 (예 : 모듈이 교체됩니다)
- `'vite:afterUpdate'` 업데이트가 방금 적용된 경우 (예 : 모듈이 교체되었습니다)
- `'vite:beforeFullReload'` 전체 재 장전이 발생할 때
- `'vite:beforePrune'` 더 이상 필요하지 않은 모듈이 가지 치기가 될 때
- `'vite:invalidate'` 모듈이 `import.meta.hot.invalidate()` 로 무효화 된 경우
- `'vite:error'` 오류가 발생한 경우 (예 : 구문 오류)
- `'vite:ws:disconnect'` WebSocket 연결이 손실 된 경우
- `'vite:ws:connect'` WebSocket 연결이 설정된 경우

사용자 정의 HMR 이벤트는 플러그인에서 보낼 수도 있습니다. 자세한 내용은 [handleHotUpdate를](./api-plugin#handlehotupdate) 참조하십시오.

## `hot.off(event, cb)`

이벤트 리스너에서 콜백을 제거하십시오.

## `hot.send(event, data)`

사용자 정의 이벤트를 Vite의 Dev Server로 다시 보냅니다.

연결되기 전에 호출되면 연결이 설정되면 데이터가 버퍼링되고 전송됩니다.

[사용자 정의 이벤트 입력](/ko/guide/api-plugin.html#typescript-for-custom-events) 섹션을 포함하여 자세한 내용은 [클라이언트-서버 커뮤니케이션을](/ko/guide/api-plugin.html#client-server-communication) 참조하십시오.

## 추가 독서

HMR API 사용 방법과 그것이 어떻게 작동하는지에 대해 자세히 알아 보려면. 이러한 리소스를 확인하십시오.

- [핫 모듈 교체가 쉽습니다](https://bjornlu.com/blog/hot-module-replacement-is-easy)
