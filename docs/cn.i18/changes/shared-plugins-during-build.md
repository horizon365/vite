# 在构建过程中共享插件

::: tip Feedback
请在 [环境API反馈讨论](https://github.com/vitejs/vite/discussions/16358) 中给我们反馈
:::

请参阅[构建过程中的共享插件](/en/guide/api-environment.md#shared-plugins-during-build)。

影响范围:`Vite 插件作者`

::: warning Future Default Change
`builder.sharedConfigBuild`首先在`v6.0`中引入。您可以将其设置为真实，以检查插件如何使用共享配置工作。一旦插件生态系统准备就绪，我们正在寻找有关更改未来专业默认值的反馈。
:::

## 动机

对齐开发和构建插件管道。

## 迁移指南

为了能够在不同环境中共享插件，插件状态必须根据当前环境进行区分。以下形式的插件将计算所有环境中转换模块的数量。

```js
function CountTransformedModulesPlugin() {
  let transformedModules
  return {
    name: 'count-transformed-modules',
    buildStart() {
      transformedModules = 0
    },
    transform(id) {
      transformedModules++
    },
    buildEnd() {
      console.log(transformedModules)
    },
  }
}
```

如果我们希望计算每个环境中转换模块的数量，我们需要保留一个映射:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    }
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

为了简化这一模式，Vite 导出了一个 `perEnvironmentState` 辅助函数:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = perEnvironmentState<{ count: number }>(() => ({ count: 0 }))
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state(this).count = 0
    }
    transform(id) {
      state(this).count++
    },
    buildEnd() {
      console.log(this.environment.name, state(this).count)
    }
  }
}
```
