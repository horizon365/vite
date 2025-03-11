#

::: tip Feedback
请在 [环境API反馈讨论](https://github.com/vitejs/vite/discussions/16358) 中给我们反馈
:::

与模块图和模块转换相关的多个`ViteDevServer` API已移至`DevEnvironment`实例。

影响范围:`Vite 插件作者`

::: warning Future Deprecation
`Environment`实例首次在`v6.0`中引入。`server.moduleGraph`和其他现在位于环境中的方法的弃用计划在`v7.0`中进行。我们目前不建议从服务器方法迁移。要识别您的使用情况，请在Vite配置中设置以下内容。

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## 动机

在Vite v5及之前版本中，单个Vite开发服务器始终有两个环境(`client`和`ssr`)。`server.moduleGraph`包含了来自这两个环境的混合模块。节点通过`clientImportedModules`和`ssrImportedModules`列表连接(但每个列表都维护了一个单独的`importers`列表)。一个转换后的模块由一个`id`和一个`ssr`布尔值表示。这个布尔值需要传递给API，例如`server.moduleGraph.getModuleByUrl(url, ssr)`和`server.transformRequest(url, { ssr })`。

在Vite v6中，现在可以创建任意数量的自定义环境(如`client`、`ssr`、`edge`等)。单个`ssr`布尔值不再足够。我们没有将这些API更改为`server.transformRequest(url, { environment })`的形式，而是将这些方法移到了环境实例中，允许它们在没有Vite开发服务器的情况下调用。

## 迁移指南

- `server.moduleGraph` > [`environment.moduleGraph`](/en/guide/api-environment#separate-module-graphs)
- `server.transformRequest(url, ssr)` > `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` > `environment.warmupRequest(url)`
