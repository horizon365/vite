# HMR `hotUpdate` 插件钩

::: tip Feedback
请在 [环境API反馈讨论](https://github.com/vitejs/vite/discussions/16358) 中给我们反馈
:::

我们计划弃用 `handleHotUpdate` 插件钩，转而使用对 [环境API](/en/guide/api-environment.md) 有感知的 [`hotUpdate` 钩子](/en/guide/api-environment#the-hotupdate-hook)，并使用 `create` 和 `delete` 处理额外的监视事件。

受影响的范围: `Vite 插件作者`

::: warning Future Deprecation
`hotUpdate` 最初在 `v6.0` 中引入。`handleHotUpdate` 的弃用计划在 `v7.0`。我们目前还不建议从 `handleHotUpdate` 迁移。如果您想尝试并给我们反馈，可以在 Vite 配置中将 `future.removePluginHookHandleHotUpdate` 设置为 `"warn"`。
:::

## 动机

[`handleHotUpdate` 钩子](/en/guide/api-plugin.md#handlehotupdate) 允许执行自定义的 HMR 更新处理。要更新的模块列表在 `HmrContext` 中传递

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

此钩子一次为所有环境调用，传递的模块仅包含客户端和 SSR 环境的混合信息。一旦框架迁移到自定义环境，就需要一个新的钩子，该钩子为每个环境调用。

新的 `hotUpdate` 钩子以与 `handleHotUpdate` 相同的方式工作，但它是为每个环境调用的，并接收一个新的 `HotUpdateOptions` 实例:

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

当前的开发环境可以像其他插件钩子一样通过 `this.environment` 访问。`modules` 列表现在仅包含当前环境中的模块节点。每个环境更新可以定义不同的更新策略。

此钩子现在不仅在 `'update'` 时调用，还用于其他监视事件。使用 `type` 来区分它们。

## 迁移指南

过滤并缩小受影响的模块列表，以使 HMR 更准确。

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// 迁移到:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

返回一个空数组并执行完整重新加载:

```js
handleHotUpdate({ server, modules, timestamp }) {
  // 手动使模块失效
  const invalidatedModules = new Set()
  for (const mod of modules) {
    server.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  server.ws.send({ type: 'full-reload' })
  return []
}

// 迁移到:

hotUpdate({ modules, timestamp }) {
  // 手动使模块失效
  const invalidatedModules = new Set()
  for (const mod of modules) {
    this.environment.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  this.environment.hot.send({ type: 'full-reload' })
  return []
}
```

返回一个空数组，并通过向客户端发送自定义事件执行完整的自定义 HMR 处理:

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// 迁移到...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
