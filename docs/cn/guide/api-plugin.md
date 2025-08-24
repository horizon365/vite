# 插件API

Vite插件通过一些额外的Vite特定选项扩展了Rollup精心设计的插件接口。结果，您可以编写一次Vite插件，并可以为开发和构建使用它。

**建议在阅读以下各节之前先浏览[Rollup的插件文档](https://rollupjs.org/plugin-development/)。**

## 创作插件

Vite努力提供固定的图案开箱即用，因此在创建新插件之前，请确保您检查[功能指南](https://vite.dev/guide/features)以查看是否涵盖了您的需求。还以[兼容的汇总插件](https://github.com/rollup/awesome)和[特定的特定插件](https://github.com/vitejs/awesome-vite#plugins)的形式查看可用的社区插件

创建插件时，您可以将其内联`vite.config.js` 。无需为其创建一个新软件包。一旦看到插件对您的项目很有用，请考虑共享该插件以帮助[生态系统中的](https://chat.vite.dev)其他人。

::: tip
在学习，调试或创作插件时，我们建议您在您的项目中包括[Vite-Plugin-himexs](https://github.com/antfu/vite-plugin-inspect) 。它允许您检查Vite插件的中间状态。安装后，您可以访问`localhost:5173/__inspect/`检查项目的模块和转换堆栈。在[Vite-Plugin-Provect文档](https://github.com/antfu/vite-plugin-inspect)中查看安装说明。
![VITE-PLUGIN-PRESSING](/images/vite-plugin-inspect.png)
:::

## 会议

如果该插件不使用特定的钩子，可以作为[兼容的汇总插件](#rollup-plugin-compatibility)实现，则建议使用[“汇总插件”命名约定](https://rollupjs.org/plugin-development/#conventions)。

- Rollup插件应具有`rollup-plugin-`前缀的清晰名称。
- 在package.json中包括`rollup-plugin`和`vite-plugin`关键字。

这将使插件也用于纯汇总或基于WMR的项目

仅Vite插件

- Vite插件应具有`vite-plugin-`前缀的清晰名称。
- 在package.json中包含`vite-plugin`关键字。
- 在插件文档中包含一个部分，详细说明为什么它是仅Vite插件(例如，它使用Vite特定的插件钩)。

如果您的插件仅适用于特定框架，则应将其名称作为前缀的一部分包含

- `vite-plugin-vue-` VUE插件的前缀
- `vite-plugin-react-` REECT插件的前缀
- `vite-plugin-svelte-` Svelte插件的前缀

另请参见[虚拟模块约定](#virtual-modules-convention)。

## 插件配置

用户将在项目`devDependencies`中添加插件，并使用`plugins`数组选项对其进行配置。

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

无效的插件将被忽略，这可以用来轻松激活或停用插件。

`plugins` 还接受包含多个插件作为单个元素的预设。这对于使用多个插件实现的复杂功能(如框架集成)非常有用。数组将在内部被展平。

```js
// 框架 - 拼图
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## 简单的例子

:::tip
为返回实际插件对象的出厂功能，撰写Vite/lollup插件是常见的惯例。该功能可以接受该选项，该选项允许用户自定义插件的行为。
:::

### 转换自定义文件类型

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // 如果可用，请提供源图
        }
      }
    },
  }
}
```

### 导入虚拟文件

请参阅[下一节](#virtual-modules-convention)中的示例。

## 虚拟模块约定

虚拟模块是一个有用的方案，它允许您使用普通的ESM导入语法将构建时间信息传递给源文件。

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // 需要，会出现在警告和错误中
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

这允许在JavaScript中导入模块:

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

通过约定将Vite（和lollup）中的虚拟模块以0的前缀为`virtual:` 。如果可能的话，应将插件名称用作名称空间，以避免与生态系统中其他插件发生碰撞。例如， `vite-plugin-posts`可以要求用户导入`virtual:posts`或`virtual:posts/helpers`虚拟模块以获取构建时间信息。在内部，使用虚拟模块的插件应在解析ID时将模块ID（即汇总生态系统的约定）前缀为`\0` 。这样可以防止其他插件尝试处理ID（例如节点分辨率），而诸如Sourcemaps之类的核心功能可以使用此信息来区分虚拟模块和常规文件。 `\0`不是导入URL中允许的字符，因此我们必须在进口分析期间替换它们。一个`\0{id}`虚拟ID最终在浏览器中的DEV期间编码为`/@id/__x00__{id}` 。 ID将在输入插件管道之前将其解码，因此插件挂钩代码不会看到这一点。

请注意，直接从真实文件派生的模块，例如单个文件组件中的脚本模块(例如.vue或.svelte sfc)无需遵循此公约。经过处理时，SFC通常会生成一组子模型，但可以将其映射到文件系统中。使用`\0`用于这些子模型将阻止Sourcemaps正确工作。

## 通用钩

在开发过程中，Vite Dev服务器创建了一个插件容器，该插件容器以相同的方式调用[汇总构建挂钩](https://rollupjs.org/plugin-development/#build-hooks)。

在服务器启动时，以下挂钩被调用一次:

- [`options`](/0)
- [`buildStart`](/0)

每个传入模块请求都调用以下钩子:

- [`resolveId`](/0)
- [`load`](/0)
- [`transform`](/0)

这些钩子还具有扩展的`options`参数，具有其他Vite特异性属性。您可以在[SSR文档](/en/guide/ssr#ssr-specific-plugin-logic)中阅读更多内容。

大约`resolveId`调用' `importer`值可能是root上通用`index.html`的绝对路径，因为由于Vite的未捆绑开发服务器模式，并非总是可以得出实际进口商。对于在Vite的Resolve Pipeline中处理的导入，可以在进口分析阶段跟踪进口商，提供正确的`importer`值。

当服务器关闭时，请调用以下钩子:

- [`buildEnd`](/0)
- [`closeBundle`](/0)

请注意，在开发过程中**未**调用[`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed)挂钩，因为Vite避免了完整的AST解析以获得更好的性能。

在开发过程中**未**调用[输出生成钩](https://rollupjs.org/plugin-development/#output-generation-hooks)(除`closeBundle` )。您可以将Vite的Dev服务器视为仅调用`rollup.rollup()`情况下，而无需致电`bundle.generate()` 。

## 特定的钩子

Vite插件还可以提供可用于特定于Vite特定目的的钩子。这些钩子被汇总忽略了。

### `config`

- **类型:** `(config:userconfig，env:{mode:string，命令:string})=> userconfig | 无效的 | 无效
- `sequential` **:** `async`

  修改Vite配置在解决之前。挂钩接收RAW用户配置(与配置文件合并的CLI选项)和当前的配置ENV，该ENV揭示了所使用的`mode`和`command` 。它可以返回将深入合并到现有配置中的部分配置对象，也可以直接突变配置(如果默认合并无法实现所需的结果)。

  **示例:**

  ```js
  // 返回部分配置(建议)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // 直接突变配置(仅在合并不起作用时使用)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning Note
  在运行此挂钩之前，请先解决用户插件，因此将其他插件注入`config`钩中的其他插件将无效。
  :::

### `configResolved`

- **类型:** `(config:resolvedConfig)=> void | 承诺<void>`
- `parallel` **:** `async`

  在解决VITE配置后调用。使用此挂钩读取和存储最终解决的配置。当插件需要根据正在运行的命令进行不同的操作时，它也很有用。

  **示例:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // 存储已解决的配置
        config = resolvedConfig
      },

      // 在其他挂钩中使用存储的配置
      transform(code, id) {
        if (config.command === 'serve') {
          // 开发人员:Dev Server调用的插件
        } else {
          // 构建:插件由lollup调用
        }
      },
    }
  }
  ```

  请注意，0中`command`值是DEV中的`serve` (在CLI `vite`和`vite serve`中是别倚) `vite dev`

### `configureServer`

- **类型:** `（服务器:vitedevserver）=>（（（）=> void） | 空白 | 承诺<(()=> void) | void>`
- `sequential` **:** `async`
- **另请参阅:** [Vitedevserver](./api-javascript#vitedevserver)

  用于配置开发服务器的挂钩。最常见的用例是将自定义中间件添加到内部[连接](https://github.com/senchalabs/connect)应用程序:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 自定义处理请求...
      })
    },
  })
  ```

  **注射帖子中间件**

  在安装内部中间Wares之前，请调用`configureServer`挂钩，因此默认情况下，自定义中间件将在内部中间Wares之前运行。如果要在内部中间件**后**注入中间软件，则可以从`configureServer`返回一个功能，该功能将在安装内部中间Wares之后被调用:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // 在内部中间货物后返回一个被调用的挂钩
      // 安装
      return () => {
        server.middlewares.use((req, res, next) => {
          // 自定义处理请求...
        })
      }
    },
  })
  ```

  **存储服务器访问**

  在某些情况下，其他插件挂钩可能需要访问Dev Server实例(例如，访问Web套接字服务器，文件系统观察器或模块图)。此钩子还可以用来存储服务器实例以访问其他挂钩:

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // 使用服务器...
        }
      },
    }
  }
  ```

  在运行生产构建时，未调用注意力`configureServer` ，因此您的其他钩子需要防止其缺席。

### `configurePreviewServer`

- **类型:** `(服务器:PreviewServer)=>(()=> void) | 空白 | 承诺<(()=> void) | void>`
- `sequential` **:** `async`
- **另请参阅:** [PreviewServer](./api-javascript#previewserver)

  与[`configureServer`](/en/guide/api-plugin.html#configureserver)相同，但对于预览服务器。与`configureServer`类似，在安装其他中间件之前，将调用`configurePreviewServer`钩子。如果您想在其他中间件**后**注入中间件，则可以从`configurePreviewServer`中返回一个函数，该功能将在安装内部中间Wares之后被调用:

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // 返回另一个中间件之后被称为的帖子
      // 安装
      return () => {
        server.middlewares.use((req, res, next) => {
          // 自定义处理请求...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **类型:** `indexhtmltransformhook | {订单？:'pre' | 'post'，处理程序:indexhtmltransformhook}'
- `sequential` **:** `async`

  用于转换HTML入口点文件（例如`index.html`的专用挂钩。挂钩接收当前的HTML字符串和转换上下文。上下文在开发过程中公开了[`ViteDevServer`](./api-javascript#vitedevserver)实例，并在构建过程中暴露了汇总输出捆绑包。

  钩子可以是异步的，可以返回以下一个:

  - 转换的HTML字符串
  - 标记描述符对象( `{ tag, attrs, children }` )的数组将其注入现有HTML。每个标签还可以指定应注入何处(默认为`<head>` )
  - 包含两个为`{ html, tags }`对象

  默认情况下， `order`为`undefined` ，在HTML转换后使用此钩子。为了注入应该通过Vite插件管道的脚本， `order: 'pre'`将在处理HTML之前应用钩子。在应用`order`未定义的所有钩子后， `order: 'post'`施加钩子。

  **基本示例:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`,
        )
      },
    }
  }
  ```

  **完整的挂钩签名:**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * 默认值:“头部prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

  ::: warning Note
  如果您使用的是具有定制输入文件(例如[Sveltekit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145) )的框架，则不会调用此挂钩。
  :::

### `handleHotUpdate`

- **类型:** `(ctx:hmrcontext)=> array<ModuleNode> | 空白 | 承诺<数组<ModuleNode> | void>`
- **另请参阅:** [HMR API](./api-hmr)

  执行自定义HMR更新处理。钩子接收一个具有以下签名的上下文对象:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules`是由更改文件影响的模块数组。这是一个数组，因为一个文件可以映射到多个服务模块(例如VUE SFC)。

  - `read`是返回文件内容的异步读取函数。之所以提供此信息，是因为在某些系统上，文件更改回调可能会在编辑器完成更新文件之前触发太快，而直接`fs.readFile`将返回空内容。读取功能通过以归一化的行为。

  钩子可以选择:

  - 过滤并缩小受影响的模块列表，以使 HMR 更准确。

  - 返回一个空数组并执行完整重新加载:

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
    ```

  - 返回一个空数组，并通过向客户端发送自定义事件执行完整的自定义 HMR 处理:

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    客户端代码应使用[HMR API](./api-hmr)注册对应处理程序(这可以由同一插件的`transform`挂钩注入):

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // 执行自定义更新
      })
    }
    ```

## 插件

Vite插件还可以指定`enforce`属性(类似于WebPack加载程序)来调整其应用程序订单。 `enforce`的值可以是`"pre"`或`"post"` 。已解决的插件将按以下顺序:

- 别名
- 用户插件与`enforce: 'pre'`
- Vite Core插件
- 没有强制性值的用户插件
- Vite构建插件
- 用户插件与`enforce: 'post'`
- Vite Post Build插件(缩小，清单，报告)

请注意，这与挂钩排序是分开的，这些[钩子仍然像往常](https://rollupjs.org/plugin-development/#build-hooks)一样符合其`order`属性。

## 条件应用

默认情况下，为服务和构建提供了调用插件。如果仅在服务或构建过程中需要有条件应用插件，则使用`apply`属性在`'build'`或`'serve'`期间仅调用它们:

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // 或“服务”
  }
}
```

功能也可以用于更精确的控制:

```js
apply(config, { command }) {
  // 仅应用于构建，但不适用于SSR
  return command === 'build' && !config.build.ssr
}
```

## 滚动插件兼容性

相当数量的Rollup插件可以直接用作Vite插件(例如 `@rollup/plugin-alias` 或 `@rollup/plugin-json`)，但并非所有插件都适用，因为某些插件钩子在未捆绑的开发服务器上下文中没有意义。

通常，只要Rollup插件符合以下标准，它就应该能直接用作Vite插件:

- 它不使用 [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) 钩子。
- 它在打包阶段的钩子和输出阶段的钩子之间没有强耦合。

如果一个Rollup插件仅在构建阶段有意义，则可以在 `build.rollupOptions.plugins` 下指定。它的工作方式与带有 `enforce: 'post'` 和 `apply: 'build'` 的Vite插件相同。

您还可以为现有的Rollup插件添加仅Vite特有的属性:

```js [vite.config.js]
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

## 路径规范化

Vite在解析ID时将路径规范化为使用POSIX分隔符(/)，同时保留Windows中的卷。另一方面，默认情况下，Rollup保持已解析路径不变，因此在Windows中已解析的ID具有Win32分隔符(\)。然而，Rollup插件内部使用 `@rollup/pluginutils` 中的 [`normalizePath` 实用函数](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath)，该函数在进行比较之前将分隔符转换为POSIX。这意味着，当这些插件用于Vite时，针对已解析ID的 `include` 和 `exclude` 配置模式以及其他类似的路径比较都能正确工作。

因此，对于Vite插件，在将路径与已解析的ID进行比较时，首先将路径规范化为使用POSIX分隔符非常重要。`vite` 模块导出了一个等效的 `normalizePath` 实用函数。

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```

## 过滤、包含/排除模式

Vite 公开了 [`@rollup/pluginutils` 的 `createFilter`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter) 函数，以鼓励特定于 Vite 的插件和集成使用标准的包含/排除过滤模式，这一模式也用于 Vite 核心本身。

## 客户端-服务器通信

自Vite 2.9以来，我们为插件提供了一些实用程序，以帮助处理与客户端的通信。

### 服务器到客户端

在插件方面，我们可以使用 `server.ws.send` 向客户端广播事件:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: tip NOTE
我们建议 **始终为您的事件名称添加前缀** 以避免与其他插件发生冲突。
:::

在客户端，使用 [`hot.on`](/en/guide/api-hmr.html#hot-on-event-cb) 监听事件:

```ts twoslash
import 'vite/client'
//  - -切 - -
// 客户端
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // 你好
  })
}
```

### 客户端到服务器

要从客户端向服务器发送事件，我们可以使用 [`hot.send`](/en/guide/api-hmr.html#hot-send-event-payload):

```ts
// 客户端
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

然后使用 `server.ws.on` 并在服务器端监听事件:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // 嘿！
          // 仅回复客户端(如果需要)
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### 自定义事件的TypeScript类型

在内部，Vite从 `CustomEventMap` 接口中推断有效负载的类型，可以通过扩展该接口来为自定义事件添加类型:

:::tip Note
确保在指定TypeScript声明文件时包含 `.d.ts` 扩展名。否则，TypeScript可能不知道模块正在尝试扩展哪个文件。
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // 'event-key': 有效载荷
  }
}
```

此接口扩展由 `InferCustomEventPayload<T>` 用于推断事件 `T` 的有效负载类型。有关此接口如何使用的更多信息，请参阅 [HMR API文档](./api-hmr#hmr-api)。

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
//  - -切 - -
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // 有效负载的类型将是 { msg: string }
})
import.meta.hot?.on('unknown:event', (payload) => {
  // 有效负载的类型将是 any
})
```
