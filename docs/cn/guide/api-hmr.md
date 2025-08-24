# HMR API

:::tip Note
这是客户端HMR API。有关插件中的HMR更新处理，请参见[handleHotUpdate](./api-plugin#handlehotupdate)。

手动HMR API主要面向框架和工具作者。作为最终用户，HMR可能已经在特定于框架的启动模板中为您处理。
:::

Vite通过特殊的`import.meta.hot`对象暴露其手动HMR API:

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'

//  - -切 - -
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

## 必要的条件保护

首先，确保使用条件块来保护所有HMR API的使用，以便代码可以在生产环境中被树形摇动:

```js
if (import.meta.hot) {
  // HMR代码
}
```

## TypeScript的IntelliSense

Vite在[`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts)中提供了`import.meta.hot`的类型定义。您可以在`src`目录中创建一个`env.d.ts`文件，以便TypeScript能够识别这些类型定义:

```ts
///<reference types="vite/client">
```

## `hot.accept(cb)`

对于一个模块要自我接受更新，使用 `import.meta.hot.accept` 并附带一个接收更新模块的回调函数:

```js twoslash
import 'vite/client'
//  - -切 - -
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // 当发生语法错误时，newModule 为 undefined
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

一个“接受”热更新的模块被视为 **HMR 边界**。

Vite 的 HMR 实际上并不会替换最初导入的模块:如果 HMR 边界模块从依赖项中重新导出导入的内容，那么它有责任更新这些重新导出的内容(并且这些导出必须使用 `let`)。此外，从边界模块向上链的导入者不会被通知到更改。这种简化的 HMR 实现足以满足大多数开发用例，同时允许我们跳过生成代理模块的昂贵工作。

Vite 要求在源代码中调用此函数的形式为 `import.meta.hot.accept(`(对空格敏感)，以便模块能够接受更新。这是 Vite 为模块启用 HMR 支持所进行的静态分析的要求。

## `hot.accept(deps, cb)`

模块还可以在不重新加载自身的情况下接受直接依赖的更新:

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
// ---cut---
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // @filename: /example.js
    newFoo?.foo()
  })

  // 也可以接受一个依赖模块的数组:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // 回调收到一个数组，仅更新的模块是
      // 非空。如果更新未成功(Ex。语法错误)，
      // cut---
    },
  )
}
```

## `hot.dispose(cb)`

自我接受的模块或期望被其他模块接受的模块可以使用`hot.dispose`来清理其更新副本产生的任何持久副作用:

```js twoslash
import 'vite/client'
//  - -切 - -
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // 清理副作用
  })
}
```

## `hot.prune(cb)`

注册一个回调函数，当模块在页面上不再被导入时将被调用。与`hot.dispose`相比，如果源代码在更新时自行清理副作用，那么只有在模块从页面中移除时才需要清理。Vite当前使用此功能处理`.css`导入。

```js twoslash
import 'vite/client'
//  - -切 - -
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // 清理副作用
  })
}
```

## `hot.data`

`import.meta.hot.data`对象在同一个更新模块的不同实例之间保持持久。可以用来从模块的前一个版本传递信息到下一个版本。

请注意，不支持重新分配`data`本身。相反，您应该修改`data`对象的属性，以便保留来自其他处理程序的信息。

```js twoslash
import 'vite/client'
//  - -切 - -
// 好的
import.meta.hot.data.someValue = 'hello'

// 不支持
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

目前这是一个空操作，用于向后兼容。如果将来有新的用途，这可能会改变。要指示模块不可热更新，使用`hot.invalidate()`。

## `hot.invalidate(message?: string)`

自我接受的模块可能在运行时意识到它无法处理HMR更新，因此需要将更新强制传播给导入者。通过调用`import.meta.hot.invalidate()`，HMR服务器将使调用者的导入者无效，就像调用者没有自我接受一样。这将在浏览器控制台和终端中记录一条消息。您可以传递一条消息，以提供一些关于无效化发生原因的上下文。

请注意，即使您计划立即调用`invalidate`，也应该始终调用`import.meta.hot.accept`，否则HMR客户端将不会监听对自我接受模块的未来更改。为了清楚地传达您的意图，我们建议在`accept`回调中调用`invalidate`，如下所示:

```js twoslash
import 'vite/client'
//  - -切 - -
import.meta.hot.accept((module) => {
  // 您可以使用新的模块实例来决定是否无效。
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

监听HMR事件。

以下HMR事件由Vite自动分发:

- `'vite:beforeUpdate'` 当即将应用更新时(例如，一个模块将被替换)
- `'vite:afterUpdate'` 当更新刚刚应用时(例如，一个模块已被替换)
- `'vite:beforeFullReload'` 当即将进行完整重新加载时
- `'vite:beforePrune'` 当即将修剪不再需要的模块时
- `'vite:invalidate'` 当模块通过`import.meta.hot.invalidate()`无效时
- `'vite:error'` 当发生错误时(例如语法错误)
- `'vite:ws:disconnect'` 当WebSocket连接丢失时
- `'vite:ws:connect'` 当WebSocket连接(重新)建立时

自定义HMR事件也可以从插件发送。有关更多详细信息，请参见[handleHotUpdate](./api-plugin#handlehotupdate)。

## `hot.off(event, cb)`

从事件监听器中移除回调。

## `hot.send(event, data)`

将自定义事件发送回Vite的开发服务器。

如果在连接之前调用，数据将被缓冲并在连接建立后发送。

有关更多详细信息，请参见[客户端-服务器通信](/en/guide/api-plugin.html#client-server-communication)，包括[键入自定义事件](/en/guide/api-plugin.html#typescript-for-custom-events)的部分。

## 进一步阅读

如果您想了解更多关于如何使用HMR API及其底层工作原理的信息，请查看以下资源:

- [热模块替换很简单](https://bjornlu.com/blog/hot-module-replacement-is-easy)
