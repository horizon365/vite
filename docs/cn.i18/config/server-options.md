# 服务器选项

除非指出，否则本节中的选项仅适用于开发人员。

## server.host

- |
- **默认值:** `'localhost'`

指定服务器应监听的IP地址。

::: tip NOTE

在某些情况下，其他服务器可能会响应而不是 Vite。

第一种情况是使用`localhost`时。 v17下的node.js默认情况下将DNS分辨地址的结果重新定位。访问`localhost`时，浏览器使用DNS解决地址，该地址可能与Vite正在听的地址有所不同。 Vite在不同时打印了解决的地址。

您可以设置[`dns.setDefaultResultOrder('verbatim')`](/0)以禁用重新排序行为。然后，Vite将将地址打印为`localhost` 。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // 忽略
})
```

第二种情况是使用通配符主机（例如`0.0.0.0` ）。这是因为在非Wildcard主机上聆听的服务器优先于在通配符主机上聆听的服务器。

:::

::: tip Accessing the server on WSL2 from your LAN

在WSL2上运行VITE时，不足以设置`host: true`来从LAN访问服务器。
有关更多详细信息，请参见[WSL文档](/0)。

:::

## server.allowedHosts

- **类型:** `字符串[] |
- **默认值:** `[]`

Vite 允许响应的主机名。
默认情况下，允许`localhost`和`.localhost`下的域，所有IP地址均被允许。
使用HTTPS时，此检查会跳过。

如果字符串以`.`开头，则它将允许在没有`.`和所有子域的主机名中的主机名。例如， `.example.com`将允许`example.com`和`foo.bar.example.com` `foo.example.com`如果设置为`true` ，则允许服务器响应任何主机的请求。

::: details What hosts are safe to be added?

您可以控制他们解决的IP地址的主机可以安全地添加到允许的主机列表中。

例如，如果您拥有一个域`vite.dev` ，则可以在列表中添加`vite.dev`和`.vite.dev` 。如果您不拥有该域，并且不能信任该域的所有者，则不应添加它。

特别是，您绝对不应在列表中添加像`.com`类的顶级域。这是因为任何人都可以购买像`example.com`这样的域并控制其解决的IP地址。

:::

::: danger

设置`server.allowedHosts`到`true`允许任何网站通过DNS重新启动攻击将请求发送到您的开发服务器，从而可以下载您的源代码和内容。我们建议始终使用允许主机的明确列表。有关更多详细信息，请参见[GHSA-VG6X-RCGG-RJX6](/0) 。

:::

::: details Configure via environment variable
您可以设置环境变量`__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`以添加额外的主机。
:::

## server.port

-
- **默认值:** `5173`

指定服务器端口。请注意，如果端口已被占用，Vite 将自动尝试下一个可用的端口，因此这可能不是服务器最终监听的实际端口。

## server.strictPort

-

## server.https

-

启用TLS + HTTP/2。请注意，仅当还使用[`server.proxy`选项](/0)时，此降级仅在TLS。

需要有效的证书。对于基本设置，您可以在项目插件中添加[@vitejs/plugin-basic-ssl](/0) ，该插件将自动创建和缓存自签名的证书。但是我们建议创建自己的证书。

## server.open

- |

**示例:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- |

为开发服务器配置自定义代理规则。期望一个对象为`{ key: options }`对。任何请求路径启动的请求都将代理该指定目标。如果钥匙以`^`开头，则将其解释为`RegExp` 。 `configure`选项可用于访问代理实例。如果请求与任何配置的代理规则匹配，则该请求不会通过Vite进行转换。

请注意，如果您使用的是非相关性[`base`](/0) ，则必须使用该键前缀为`base` 。

扩展[`http-proxy`](/0) 。其他选项在[这里](/1)。

在某些情况下，您可能还需要配置基础开发服务器（例如，将自定义中间件添加到内部[连接](/0)应用程序中）。为此，您需要编写自己的[插件](/1)并使用[Configureserver](/2)函数。

**示例:**

```js
export default defineConfig({
  server: {
    proxy: {
      // 字符串速记:
      // http:// localhost:5173/foo
      //   - > [http:// localhost:4567/foo](http://localhost:4567/foo)
      '/foo': 'http://localhost:4567',
      // 带有选项:
      // http:// localhost:5173/api/bar
      //   - > [http://jsonplaceholder.typicode.com/bar](http://jsonplaceholder.typicode.com/bar)
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // 与REGEXP:
      // http:// localhost:5173/flastback/
      //   - > [http://jsonplaceholder.typicode.com/](http://jsonplaceholder.typicode.com/)
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // 使用代理实例
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // 代理将是“ http-proxy”的实例
        },
      },
      // 代理Websockets或socket.io:
      // ws:// localhost:5173/socket.io
      //   - > ws:// localhost:5174/socket.io
      // 谨慎使用`rewriteWsOrigin` ，因为它可以离开
      // 代表CSRF攻击开放。
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- |
- **默认值:** `{arount:/^https?://(？:（？:…emangemed.plocalhost|127\.0\.0\.1|[:: 1]）（？:: \ d+）？$/}  127.0.0.1  :: 1`）

为开发服务器配置CORS。传递[选项对象](/0)以微调行为或`true`以允许任何原点。

::: danger

设置`server.cors`到`true`允许任何网站将请求发送到您的开发服务器并下载您的源代码和内容。我们建议始终使用允许起源的明确列表。

:::

## server.headers

-

指定服务器响应头。

## server.hmr

- | {协议？:字符串，主机？:字符串，端口？:数字，路径？:字符串，超时？:number，覆盖？

禁用或配置HMR连接（如果HMR Websocket必须使用与HTTP服务器不同的地址）。

设置`server.hmr.overlay`到`false`以禁用服务器错误覆盖。

`protocol`设置用于HMR连接的Websocket协议: `ws` （WebSocket）或`wss` （WebSocket Secure）。

`clientPort`是一个高级选项，仅在客户端覆盖端口，使您可以在与客户端代码寻求的不同端口上使用Websocket。

定义`server.hmr.server`时，Vite将通过提供的服务器处理HMR连接请求。如果不是处于中间件模式，Vite将尝试通过现有服务器处理HMR连接请求。当使用自签名证书或要通过单个端口上的网络公开VITE时，这可能会有所帮助。

查看[`vite-setup-catalogue`](/0)以获取一些示例。

::: tip NOTE

使用默认配置，VITE前面的反向代理有望支持代理Websocket。如果VITE HMR客户端无法连接Websocket，则客户端将落后于将Websocket直接连接到Vite HMR服务器，绕过反向代理:

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

浏览器中出现后回来时出现的错误可以忽略。为了通过直接绕过反向代理来避免错误，您可以:

- 也将反向代理配置为代理Websocket
- 设置[`server.strictPort = true`](/0)并将`server.hmr.clientPort`设置为相同的值`server.port`
- 将`server.hmr.port`设置为与[`server.port`](/0)不同的值

:::

## server.warmup

- **类型:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **相关:**[热身经常使用的文件](/0)

热身文件可以提前转换和缓存结果。这可以改善服务器启动期间的初始页面负载，并防止转化瀑布。

`clientFiles`是仅在客户端中使用的文件，而`ssrFiles`是仅在SSR中使用的文件。他们接受相对于`root`的文件路径或[`tinyglobby`](/0)模式。

确保仅添加经常在启动上不超载Vite Dev Server超载的文件。

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **类型:** `对象 | null`

文件系统观察器选项将传递给[Chokidar](/0) 。

默认情况下`node_modules/` Vite Server Watcher观看`root` ，并跳过`.git/`和Vite的`cacheDir`和`build.outDir`目录。更新观察文件时，Vite将应用HMR并仅在需要时更新页面。

如果设置为`null` ，则不会观看任何文件。 `server.watcher`将提供兼容的事件发射器，但致电`add`或`unwatch`将无效。

::: warning Watching files in `node_modules`

目前无法在`node_modules`中观看文件和软件包。对于进一步的进度和解决方法，您可以关注[第8619期](/0)。

:::

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

在WSL2上运行VITE时，当Windows应用程序编辑文件（non-WSL2进程）时，文件系统观看不起作用。这是由于[WSL2限制](/0)。这也适用于使用WSL2后端在Docker上运行。

要修复它，您可以:

- **建议**:使用WSL2应用程序编辑您的文件。
  - 还建议将项目文件夹移到Windows文件系统之外。从WSL2访问Windows文件系统很慢。删除开销将提高性能。
- 设置`{ usePolling: true }` 。
  - 请注意， [`usePolling`导致高CPU利用率](/0)。

:::

## server.middlewareMode

-
- **默认值:** `false`

在中间件模式下创建Vite服务器。

- **相关:** [AppType](/0) ， [SSR-设置Dev Server](/1)

- **示例:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // 在中间件模式下创建Vite服务器
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // 不要包括Vite的默认HTML处理中间Wares
    appType: 'custom',
  })
  // 使用Vite的连接实例作为中间件
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // 由于`appType`是`'custom'` ，因此应在此处提供回应。
    // 注意:如果`appType`是`'spa'`或`'mpa'` ，则VITE包括中间。
    // 处理HTML请求和404s，以便应添加用户中间件
    // 在Vite的中间Wares生效之前
  })
}

createServer()
```

## server.fs.strict

-
- **默认值:** `true` （默认为Vite 2.7以来启用）

限制工作空间根部之外的文件。

## server.fs.allow

-

限制可以通过`/@fs/`提供的文件。当设置为`server.fs.strict` `true` ，该目录列表之外未从允许文件导入的文件将导致403。

可以提供目录和文件。

Vite将搜索潜在工作空间的根，并将其用作默认设置。有效的工作空间满足以下条件，否则将落回[项目根](/0)。

- 在`package.json`中包含`workspaces`字段
- 包含以下文件之一
  - `lerna.json`
  - `pnpm-workspace.yaml`

接受指定自定义工作区根的路径。可能是相对于[项目根的](/0)绝对路径或路径。例如:

```js
export default defineConfig({
  server: {
    fs: {
      // 允许将文件从一个级别到项目root
      allow: ['..'],
    },
  },
})
```

指定`server.fs.allow`时，将禁用自动工作区根检测。为了扩展原始行为，公用事业`searchForWorkspaceRoot`暴露了:

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // 搜索工作区根
        searchForWorkspaceRoot(process.cwd()),
        // 您的自定义规则
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

-
- **默认值:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

敏感文件的集体列表仅限于Vite Dev Server提供。这将具有高于[`server.fs.allow`](/0)的优先级。支持[Picomatch模式](/1)。

## server.origin

- **类型:** `string`

定义开发过程中生成的资产URL的起源。

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **类型:** `false | （sourcepath:string，sourcemappath:string）=> boolean`
- **默认值:** `(sourcePath) => sourcePath.includes('node_modules')`

是否忽略服务器源中的源文件，用于填充[`x_google_ignoreList`源地图扩展名](/0)。

`server.sourcemapIgnoreList`是开发服务器的[`build.rollupOptions.output.sourcemapIgnoreList`](/0)等效。两个配置选项之间的区别在于，汇总函数用`sourcePath`的相对路径调用，而`server.sourcemapIgnoreList`则以绝对路径为单位。在开发过程中，大多数模块在同一文件夹中具有地图和源，因此`sourcePath`的相对路径是文件名本身。在这些情况下，绝对路径可以方便地使用。

默认情况下，它不包括包含`node_modules`的所有路径。您可以传递`false`以禁用此行为，或者为了完全控制，可以采用源路径和Sourcemap路径并返回是否忽略源路径。

```js
export default defineConfig({
  server: {
    // 这是默认值，将添加所有文件
    // 在他们通往忽略列表的道路上。
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Note
[`server.sourcemapIgnoreList`](/0)和[`build.rollupOptions.output.sourcemapIgnoreList`](/1)需要独立设置。 `server.sourcemapIgnoreList`是服务器仅配置，并且不会从定义的汇总选项中获取其默认值。
:::
