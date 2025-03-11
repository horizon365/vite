# HMR `hotUpdate`プラグインフック

::: tip Feedback
[環境APIフィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)でフィードバックを提供してください
:::

::: warning Future Deprecation
`hotUpdate` was first introduced in `v6.0` . `handleHotUpdate`の非推奨は`v7.0`で計画されています。 We don't yet recommend moving away from `handleHotUpdate` yet. If you want to experiment and give us feedback, you can use the `future.removePluginHookHandleHotUpdate` to `"warn"` in your vite config.
:::

## モチベーション

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

This hook is called once for all environments, and the passed modules have mixed information from the Client and SSR environments only. Once frameworks move to custom environments, a new hook that is called for each of them is needed.

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

## 移行ガイド

HMRがより正確になるように、影響を受けるモジュールリストをフィルターして絞り込みます。

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// Migrate to:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

空の配列を返し、完全なリロードを実行します。

```js
handleHotUpdate({ server, modules, timestamp }) {
  // モジュールを手動で無効にします
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

// Migrate to:

hotUpdate({ modules, timestamp }) {
  // モジュールを手動で無効にします
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

空の配列を返し、クライアントにカスタムイベントを送信して、完全なカスタムHMR処理を実行します。

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// Migrate to...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
