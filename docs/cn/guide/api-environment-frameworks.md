# Environment API for Frameworks

:::warning Experimental
Environment API is experimental. We'll keep the APIs stable during Vite 6 to let the ecosystem experiment and build on top of it. We're planning to stabilize these new APIs with potential breaking changes in Vite 7.

资源:

-
-

Please share your feedback with us.
:::

## 环境和框架

默认情况下，隐式`ssr`环境和其他非客户端环境在开发过程中使用`RunnableDevEnvironment`。尽管这需要运行时与Vite 服务器正在运行的运行时相同，但这与`ssrLoadModule`类似，并允许框架迁移并启用其SSR开发故事中的HMR。您可以使用`isRunnableDevEnvironment`函数来保护任何可运行的环境。

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * URL to execute.
   * Accepts file path, server path, or id relative to the root.
   * Returns an instantiated module (same as in ssrLoadModule)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * Other ModuleRunner methods...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
第一次访问时，请热切地评估`runner` 。当心VITE启用源地图支持时通过调用`runner`创建`process.setSourceMapsEnabled`或覆盖`Error.prepareStackTrace`源地图支持。
:::

## 默认的`RunnableDevEnvironment`

给定按照[SSR设置指南](/en/guide/ssr#setting-up-the-dev-server)所述配置的Vite 服务器，让我们使用环境API实现SSR中间件。错误处理将被省略。

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // 默认情况下，模块在与Vite 服务器相同的进程中运行
    },
  },
})

// You might need to cast this to RunnableDevEnvironment in TypeScript or
// use isRunnableDevEnvironment to guard the access to the runner
const environment = server.environments.node

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. Read index.html
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
  //    and also applies HTML transforms from Vite plugins, e.g.全球的
  //    preambles from @vitejs/plugin-react
  template = await server.transformIndexHtml(url, template)

  // 3. Load the server entry. import(url) automatically transforms
  //    ESM source code to be usable in Node.js! There is no bundling
  //    并提供完整的HMR支持。
  const { render } = await environment.runner.import('/src/entry-server.js')

  // 4. render the app HTML. This assumes entry-server.js's exported
  //
  //    例如ReactDOMServer.renderToString()
  const appHtml = await render(url)

  // 5. Inject the app-rendered HTML into the template.
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. Send the rendered HTML back.
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

## 运行时无关的SSR

由于`RunnableDevEnvironment`只能用于在与Vite 服务器相同的运行时中运行代码，因此它需要一个可以运行Vite 服务器的运行时(与Node.js兼容的运行时)。这意味着您需要使用原始的`DevEnvironment`来使其运行时无关。

:::info `FetchableDevEnvironment` proposal

最初的提案在`DevEnvironment`类上有一个`run`方法，该方法允许消费者通过使用`transport`选项在运行者端调用导入。在测试过程中，我们发现该API不够通用，无法开始推荐。目前，我们正在征求有关[`FetchableDevEnvironment`提案](https://github.com/vitejs/vite/discussions/18191)的反馈。

:::

`RunnableDevEnvironment`有一个`runner.import`函数，该函数返回模块的值。但是，此函数在原始的`DevEnvironment`中不可用，并且需要使用Vite 的API和用户模块的代码解耦。

例如，以下示例使用了来自使用Vite 的API的代码中的用户模块的值:

```ts
// 使用Vite 的API的代码
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entry.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

如果您的代码可以在与用户模块相同的运行时中运行(即，不依赖于Node.js特定的API)，则可以使用虚拟模块。这种方法消除了从使用Vite 的API的代码中访问值的需要。

```ts
// 使用Vite 的API的代码
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // 处理`virtual:entrypoint`的插件
    {
      name: 'virtual-module',
      /* 插件实现 */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// 使用每个环境工厂运行的代码暴露的函数
// 检查每个环境工厂提供的内容
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

例如，要调用用户模块中的`transformIndexHtml`，可以使用以下插件:

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

如果您的代码需要Node.js API，可以使用`hot.send`从用户模块中使用Vite 的API的代码进行通信。但是，请注意，这种方法在构建过程后可能不会以相同的方式工作。

```ts
// 使用Vite 的API的代码
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // 处理`virtual:entrypoint`的插件
    {
      name: 'virtual-module',
      /* 插件实现 */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// 使用每个环境工厂运行的代码暴露的函数
// 检查每个环境工厂提供的内容
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## 构建期间的环境

在CLI中，调用`vite build`和`vite build --ssr`仍将仅构建客户端和SSR环境，以保持向后兼容。

当`builder`不为`undefined`(或调用`vite build --app`时)，`vite build`将选择构建整个应用程序。这将在未来的主版本中成为默认行为。将创建一个`ViteBuilder`实例(构建时等同于`ViteDevServer`)，以构建所有配置的生产环境。默认情况下，环境的构建是按`environments`记录的顺序依次进行的。框架或用户可以进一步配置环境的构建方式:

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

## 环境无关的代码

大多数情况下，当前的`environment`实例将作为正在运行的代码上下文的一部分可用，因此通过`server.environments`访问它们的需求很少。例如，在插件钩子内部，环境作为`PluginContext`的一部分暴露，因此可以使用`this.environment`访问它。请参阅[插件的环境API](./api-environment-plugins.md)，了解如何构建环境感知插件。
