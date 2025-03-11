# `this.environment`在钩子中

::: tip Feedback
请在 [环境API反馈讨论](https://github.com/vitejs/vite/discussions/16358) 中给我们反馈
:::

在 Vite 6 之前，只有两种环境可用:`client` 和 `ssr`。`resolveId`、`load` 和 `transform` 中的一个 `options.ssr` 插件钩子参数允许插件作者在处理模块时区分这两种环境。在 Vite 6 中，Vite 应用程序可以根据需要定义任意数量的命名环境。我们正在插件上下文中引入 `this.environment`，以便在钩子中与当前模块的环境进行交互。

影响范围:`Vite 插件作者`

::: warning Future Deprecation
`this.environment` 在 `v6.0` 中引入。`options.ssr` 的弃用计划在 `v7.0`。从那时起，我们将开始推荐将插件迁移到使用新 API。要识别您的使用情况，请在 Vite 配置中将 `future.removePluginHookSsrArgument` 设置为 `"warn"`。
:::

## 动机

`this.environment` 不仅允许插件钩子实现知道当前环境的名称，还可以访问环境配置选项、模块图信息和转换管道 (`environment.config`、`environment.moduleGraph`、`environment.transformRequest()`)。在上下文中提供环境实例可以允许插件作者避免对整个开发服务器的依赖(通常在启动时通过 `configureServer` 钩子缓存)。

## 迁移指南

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [！代码  - ]
      const isSSR = this.environment.name !== 'client' //

      if (isSSR) {
        // SSR 特定逻辑
      } else {
        // 客户端特定逻辑
      }
    },
  }
}
```

为了实现更强大的长期实现，插件钩子应使用细粒度的环境选项来处理[多个环境](/en/guide/api-environment.html#accessing-the-current-environment-in-hooks)，而不是依赖环境名称。
