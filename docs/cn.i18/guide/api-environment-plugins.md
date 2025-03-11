# 插件的环境API

:::warning Experimental
环境API是实验性的。我们将在Vite 6期间保持API的稳定性，以便生态系统可以进行实验并在此基础上构建。我们计划在Vite 7中通过可能的破坏性变更来稳定这些新API。

资源:

- [反馈讨论](https://github.com/vitejs/vite/discussions/16358) 我们正在收集有关新API的反馈。
- [环境API PR](https://github.com/vitejs/vite/pull/16471) 在这里实现了新的API并进行了审查。

请与我们分享您的反馈。
:::

## 访问挂钩的当前环境

鉴于只有两个环境直到Vite 6（ `client`和`ssr` ），因此`ssr`布尔值足以识别Vite API中的当前环境。插件挂钩在最后一个选项参数中收到了`ssr`布尔值，并且几个API期望可选的最后`ssr`参数可以将模块正确关联到正确的环境（例如`server.moduleGraph.getModuleByUrl(url, { ssr })` ）。

随着可配置环境的出现，我们现在有一种统一的方法来访问插件中的选项和实例。现在，插件钩在其上下文中公开`this.environment` ，并且以前期望`ssr`布尔值的API现在范围为适当的环境（例如`environment.moduleGraph.getModuleByUrl(url)` ）。

Vite服务器具有共享插件管道，但是当处理模块时，它总是在给定环境的上下文中完成。 `environment`实例可在插件上下文中可用。

插件可以使用`environment`实例来更改模块的处理方式，具体取决于环境的配置（可以使用`environment.config`访问该模块）。

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

## 使用钩子注册新环境

插件可以在`config`挂钩中添加新环境（例如，为[RSC](/0)具有单独的模块图）:

```ts
  config(config: UserConfig) {
    config.environments.rsc ??= {}
  }
```

一个空对象足以注册环境，默认值来自根级环境环境配置。

## 使用钩子配置环境

虽然`config`挂钩正在运行，但尚不清楚环境的完整列表，并且环境可能会受到根级环境配置的默认值的影响，也可以通过`config.environments`记录明确。
插件应使用`config`挂钩设置默认值。要配置每个环境，他们可以使用新的`configEnvironment`钩。对于每个环境，其部分解决的配置都被调用，包括最终默认值的分辨率。

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    if (name === 'rsc') {
      options.resolve.conditions = // ...
```

## `hotUpdate`钩

- **类型:** `（this:{环境:devenvironment}，选项:hotupdateoptions）=> array<EnvironmentModuleNode> | 空白 | 承诺<数组<EnvironmentModuleNode> | void>`
- **另请参阅:** [HMR API](/0)

`hotUpdate`挂钩允许插件为给定环境执行自定义的HMR更新处理。当文件更改时，根据`server.environments`中的顺序为每个环境运行HMR算法，因此`hotUpdate`挂钩将多次调用。钩子接收一个具有以下签名的上下文对象:

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

- `this.environment`是当前正在处理文件更新的模块执行环境。

- `modules`是在此环境中的一个模块数组，受更改的文件影响。这是一个数组，因为一个文件可以映射到多个服务模块（例如VUE SFC）。

- `read`是返回文件内容的异步读取函数。之所以提供这是因为在某些系统上，文件更改回调可能会在编辑器完成更新文件之前发射太快，而直接`fs.readFile`将返回空内容。读取功能通过以归一化的行为。

钩子可以选择:

- 过滤并缩小受影响的模块列表，以使 HMR 更准确。

- 返回一个空数组并执行完整重新加载:

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

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

- 返回一个空数组，并通过向客户端发送自定义事件执行完整的自定义 HMR 处理:

  ```js
  hotUpdate() {
    if (this.environment.name !== 'client')
      return

    this.environment.hot.send({
      type: 'custom',
      event: 'special-update',
      data: {}
    })
    return []
  }
  ```

  客户端代码应使用[HMR API](/0)注册相应的处理程序（这可以由同一插件的`transform`钩注入）:

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // 执行自定义更新
    })
  }
  ```

## 每个环境插件

插件可以定义其应应用于`applyToEnvironment`功能的环境。

```js
const UnoCssPlugin = () => {
  // 共享全球状态
  return {
    buildStart() {
      // 具有虚弱图表<环境，数据>的初始环境状态
      // 使用此环境
    },
    configureServer() {
      // 通常使用全局钩子
    },
    applyToEnvironment(environment) {
      // 如果此插件应在此环境中处于活动状态，请返回true，
      // 或返回新插件以替换它。
      // 如果未使用钩子，则插件在所有环境中都处于活动状态
    },
    resolveId(id, importer) {
      // 仅要求环境这个插件适用于
    },
  }
}
```

如果插件不知道环境，并且具有在当前环境上没有键入的状态，则`applyToEnvironment`挂钩可以轻松地使其每个环境。

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

Vite导出了`perEnvironmentPlugin`个助手，以简化不需要其他钩子的情况:

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

## 建筑钩子中的环境

以与开发期间相同的方式，插件挂钩在构建过程中还会接收环境实例，以取代`ssr`布尔值。
这也适用于`renderChunk`和`generateBundle`构建仅钩子。

## 在构建过程中共享插件

在Vite 6之前，插件管道在开发过程中以不同的方式工作:

- **在开发期间:**插件共享
- **在构建过程中:**为每个环境隔离插件（在不同的过程中: `vite build`然后`vite build --ssr` ）。

这个强制框架可以通过写入文件系统的清单文件之间的`client`构建和`ssr`构建之间共享状态。在Vite 6中，我们现在正在一个过程中构建所有环境，因此插件管道和环境之间的通信可以与DEV对齐。

在未来的专业（Vite 7或8）中，我们的目标是完全一致:

- **在开发和构建过程中:**共享插件，并进行[每个环境过滤](/0)

在构建过程中还将共享一个`ResolvedConfig`个实例，以与我们在开发过程中使用`WeakMap<ResolvedConfig, id="!">`相同的方式在整个应用程序构建过程级别进行缓存。

对于Vite 6，我们需要迈出较小的步骤以保持向后兼容性。生态系统插件当前使用`config.build`而不是`environment.config.build`用于访问配置，因此我们需要默认情况下创建一个新的`ResolvedConfig`每个环境。一个项目可以选择共享完整的配置和插件管道设置`builder.sharedConfigBuild`至`true` 。

此选项首先只能使用一小部分项目，因此插件作者可以通过将`sharedDuringBuild`标志设置为`true`来选择要共享的特定插件。这允许在常规插件中轻松共享状态:

```js
function myPlugin() {
  // 在开发环境中分享状态并建立
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // 选择进入所有环境的实例
    sharedDuringBuild: true,
  }
}
```
