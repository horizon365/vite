# 服务器端渲染（SSR）

:::tip Note
SSR专门指的是前端框架（例如React，preeact，Vue和Svelte），该框架支持在Node.js中运行相同应用程序的前端框架，并将其预先呈现给HTML，最后在客户端上进行水合。如果您正在寻找与传统服务器端框架集成，请查看“[后端集成指南”](/0) 。

以下指南还假定您选择的框架中与SSR合作的事先经验，并且只会关注特定于Vite的集成细节。
:::

:::warning Low-level API
这是用于图书馆和框架作者的低级API。如果您的目标是创建一个应用程序，请确保首先查看[Awesome Vite SSR部分](/0)的高级SSR插件和工具。也就是说，许多应用程序是成功直接建立在Vite的本地低级API之上的。

目前，Vite正在使用[环境API](/0)进行改进的SSR API。查看链接以获取更多详细信息。
:::

## 示例项目

Vite为服务器端渲染（SSR）提供了内置支持。 [`create-vite-extra`](/0)包含示例SSR设置，您可以用作本指南的参考:

- [香草](/0)
- [Vue](/0)
- [反应](/0)
- [预先反应](/0)
- [苗条](/0)
- [坚硬的](/0)

您还可以通过[运行`create-vite`](/0)并在框架选项下选择`Others > create-vite-extra`在本地脚克式这些项目。

## 来源结构

典型的SSR应用程序将具有以下源文件结构:

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

`index.html`将需要参考`entry-client.js` ，并包括一个应注入服务器渲染的标记的占位符:

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

您可以使用您喜欢的任何占位持有人而不是`<!--ssr-outlet-->` ，只要可以精确替换。

## 条件逻辑

如果您需要基于SSR与客户端执行有条件的逻辑，则可以使用

```js twoslash
import 'vite/client'
//  - -切 - -
if (import.meta.env.SSR) {
  // ...仅服务器逻辑
}
```

在构建过程中，这将在静态上替换，因此它可以使未使用的分支震惊。

## 设置开发服务器

构建SSR应用程序时，您可能希望完全控制主服务器，并将Vite与生产环境中分离。因此，建议在中间件模式下使用VITE。这是[Express](/0) （V4）的示例:

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

这里`vite`是[Vitedevserver](/0)的实例。 `vite.middlewares`是一个[连接](/1)实例，可以用作任何连接兼容的node.js框架中的中间件。

下一步是实现`*`处理程序以服务服务器渲染的HTML:

```js twoslash [server.js]
// @NoErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @Type {import（'express'）。express} */
var app
/** @Type {import（'vite'）。vitedevserver}  */
var vite

//  - -切 - -
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Read index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. 应用Vite HTML转换。这会注入Vite HMR客户端，
    //    and also applies HTML transforms from Vite plugins, e.g.全球的
    //    preambles from @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3。加载服务器条目。 SSRLOADMODULE自动转换
    //    ESM源代码转换为可在Node.js中使用的代码！无需捆绑，
    //    需要，并提供类似于HMR的有效无效。
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. render the app HTML. This assumes entry-server.js's exported
    //     `render`函数调用了适当的框架SSR API，
    //    例如ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. 将应用渲染的HTML注入模板。
    const html = template.replace(`<!--ssr-outlet-->`, () => appHtml)

    // 6. 发送渲染后的HTML。
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // 如果捕获错误，请让Vite修复堆栈跟踪，以便将其映射
    // 到您的实际源代码。
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

还应更改`package.json`中的`dev`脚本以使用服务器脚本:

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## 建造生产

要运送SSR项目进行生产，我们需要:

1. 产生客户的构建正常；
2. 产生一个可以直接通过`import()`加载的SSR构建，因此我们不必经过Vite的`ssrLoadModule` ；

我们的脚本在`package.json`中看起来像这样:

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

注意指示这是SSR构建的`--ssr`标志。它还应指定SSR条目。

然后，在`server.js`中，我们需要通过检查`process.env.NODE_ENV` :

- 而不是读取root `index.html` ，而是将`dist/client/index.html`用作模板，因为它包含了与客户端构建的正确资产链接。

- 而不是`await vite.ssrLoadModule('/src/entry-server.js')`使用`import('./dist/server/entry-server.js')` （此文件是SSR构建的结果）。

- 将`vite` dev服务器的创建和所有用法移动在仅开发的条件分支后面，然后添加静态文件中的中间用水中的静态文件以从`dist/client`中提供文件。

请参阅[示例项目](/0)以进行工作设置。

## 生成预紧力指令

`vite build`支持将在构建输出目录中生成`.vite/ssr-manifest.json` `--ssrManifest`标志:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

现在，上面的脚本将为客户端构建生成`dist/client/.vite/ssr-manifest.json` （是的，SSR清单是从客户端构建生成的，因为我们想将模块ID映射到客户端文件）。清单中包含模块ID的映射到其关联的块和资产文件。

为了利用清单，框架需要提供一种方法来收集服务器渲染调用过程中使用的组件的模块ID。

`@vitejs/plugin-vue`支持此功能，并自动将使用组件模块ID寄给关联的VUE SSR上下文:

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// CTX.Modules现在是一组渲染过程中使用的模块ID
```

在`server.js`的生产分支中，我们需要读取并将清单传递给由`src/entry-server.js`导出的`render`函数。这将为我们提供足够的信息来渲染针对异步路线使用的文件的预紧指令！有关完整示例，请参见[演示源](/0)。您也可以将此信息用于[103个早期提示](/1)。

## 预渲染 / SSG

如果提前知道某些路由所需的路由和数据，我们可以使用与生产SSR相同的逻辑将这些路由预渲染到静态HTML中。这也可以被视为一种静态位点产生（SSG）的形式。有关工作示例，请参见[演示预渲染脚本](/0)。

## SSR外部

依赖性在运行SSR时默认情况下从Vite的SSR变换模块系统中“外部化”。这加快了开发和构建。

例如，如果需要通过Vite的管道来转换依赖关系，因为在其中未转移的Vite特征，则可以将其添加到[`ssr.noExternal`](/0) 。

对于链接的依赖关系，默认情况下，它们不被外部化以利用Vite的HMR。例如，如果不需要，例如测试依赖项，就好像未链接一样，您可以将其添加到[`ssr.external`](/0) 。

:::warning Working with Aliases
如果您配置了将一个软件包重定向到另一个软件包的别名，则可能需要使实际的`node_modules`软件包别名，以使其适用于SSR外部化依赖关系。[纱线](/0)和[PNPM](/1)都通过`npm:`前缀支持混叠。
:::

## SSR特异性插件逻辑

基于客户端与SSR，一些框架（例如VUE或Svelte编译组件）成不同的格式。为了支持有条件的变换，Vite在以下插件钩的`options`对象中传递了一个额外的`ssr`属性:

- `resolveId`
- `load`
- `transform`

**示例:**

```js twoslash
/** @Type {（）=> import（'vite'）。插件} */
//  - -切 - -
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // 执行特定于SSR的转换...
      }
    },
  }
}
```

`load`和`transform`中的选件对象是可选的，汇总当前不使用此对象，但将来可能会使用其他元数据扩展这些钩子。

:::tip Note
在Vite 2.7之前，它被告知使用位置`ssr` param而不是使用`options`对象的插件钩。所有主要的框架和插件都将更新，但您可能会使用以前的API找到过时的帖子。
:::

## SSR目标

SSR构建的默认目标是节点环境，但是您也可以在Web Worker中运行服务器。每个平台的包装输入分辨率都不同。您可以使用`ssr.target`设置为`'webworker'`目标将目标配置为Web Worker。

## SSR捆绑包

在某些情况下，例如`webworker`运行时间，您可能需要将SSR构建捆绑到一个JavaScript文件中。您可以通过设置`ssr.noExternal`到`true`来启用此行为。这将做两件事:

- 将所有依赖性视为`noExternal`
- 如果导入任何node.js indin-ins，就会丢下错误

## SSR解决条件

默认情况下，软件包输入分辨率将使用SSR构建[`resolve.conditions`](/0)中设置的条件。您可以使用[`ssr.resolve.conditions`](/1)和[`ssr.resolve.externalConditions`](/2)自定义此行为。

## Vite CLI

CLI命令`$ vite dev`和`$ vite preview`也可以用于SSR应用程序。您可以[`configureServer`](/0) SSR MiddleWares添加到开发服务器中，并使用[`configurePreviewServer`](/1)添加到预览服务器中。

:::tip Note
使用帖子挂钩，以便您的SSR中间件在Vite的中间Wares*之后*运行。
:::
