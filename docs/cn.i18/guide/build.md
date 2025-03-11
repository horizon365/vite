# 建造生产

当该将应用程序部署用于生产时，只需运行`vite build`命令即可。默认情况下，它将`<root>/index.html`用作构建入口点，并生产适合在静态托管服务上提供的应用程序捆绑包。查看[部署静态站点的](/0)有关流行服务的指南。

## 浏览器兼容性

默认情况下，生产捆绑包为现代JavaScript的支持，例如[本机ES模块](/0)，[本机ESM Dynamic Import](/1) ， [`import.meta`](/2) ，[无效的合并](/3)和[Bigint](/4) 。默认浏览器支持范围是:

<!-- Search for the `ESBUILD_MODULES_TARGET` constant for more information -->

- Chrome> = 87
- Firefox> = 78
- Safari> = 14
- 边缘> = 88

您可以通过[`build.target`配置选项](/0)指定自定义目标，其中最低目标为`es2015` 。如果设定了较低的目标，则VITE仍然需要这些最小浏览器支持范围，因为它依赖于[本机ESM动态导入](/1)，而[`import.meta`](/2) :

<!-- Search for the `defaultEsbuildSupported` constant for more information -->

- Chrome> = 64
- Firefox> = 67
- Safari> = 11.1
- 边缘> = 79

请注意，默认情况下，Vite仅处理语法会转换，并且**不涵盖多填充**。您可以查看[https://cdnjs.cloudflare.com/polyfill/](https://cdnjs.cloudflare.com/polyfill/) ，它会根据用户的浏览器UserAgent String自动生成polyfill捆绑包。

可以通过[@vitejs/plugin-legacy](/0)支持传统浏览器，该浏览器将自动生成旧版块和相应的ES语言功能polyfills。传统块有条件地仅在没有本机ESM支持的浏览器中加载。

## 公共基本道路

- 相关:[资产处理](/0)

如果您将项目部署在嵌套的公共路径下，只需指定[`base`配置选项](/0)，所有资产路径将相应地重写。此选项也可以指定为命令行标志，例如`vite build --base=/my/public/path/` 。

JS Imported Asset URL，CSS `url()`参考和您的`.html`文件中的资产引用均自动调整以尊重构建过程中的此选项。

例外是当您需要动态连接URL时。在这种情况下，您可以使用全球注入的`import.meta.env.BASE_URL`变量，这将是公共基本路径。请注意，该变量在构建过程中被静态替换，因此必须完全显示为IS（即`import.meta.env['BASE_URL']`不起作用）。

对于高级基本路径控制，请查看[高级基本选项](/0)。

### 相对基础

如果您不提前知道基本路径，则可以用`"base": "./"`或`"base": ""`设置相对基本路径。这将使所有生成的URL与每个文件相对。

:::warning Support for older browsers when using relative bases

`import.meta`相对基础需要支撑。如果您需要支持[不支持`import.meta`浏览器](/0)，则可以使用[`legacy`插件](/1)。

:::

## 自定义构建

可以通过各种[构建配置选项](/0)自定义构建。具体来说，您可以直接[通过](/1)`build.rollupOptions` :

```js [vite.config.js]
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

例如，您可以使用仅在构建过程中应用的插件指定多个汇总输出。

## 分块策略

您可以使用`build.rollupOptions.output.manualChunks`来配置如何拆分块的方式（请参阅[汇总文档](/0)）。如果您使用框架，请参阅其文档以配置如何拆分块。

## 负载错误处理

Vite发射`vite:preloadError`事件未能加载动态导入。 `event.payload`包含原始导入错误。如果您致电`event.preventDefault()` ，则不会抛出错误。

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // 例如，刷新页面
})
```

当发生新的部署时，托管服务可以从以前的部署中删除资产。结果，在新部署之前访问您的网站的用户可能会遇到导入错误。发生此错误是因为该用户设备上运行的资产已过时，并且试图导入已删除的相应旧块。此事件对于解决这种情况很有用。

## 重建文件更改

您可以使用`vite build --watch`启用汇总观察器。或者，您可以直接调整[`WatcherOptions`](/0)通过`build.watch` :

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

启用了`--watch`标志后，更改`vite.config.js` ，以及要捆绑的任何文件，都会触发重建。

## 多页应用

假设您具有以下源代码结构:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

在DEV期间，只需导航或链接到`/nested/`它可以按预期工作，就像普通的静态文件服务器一样。

在构建过程中，您需要做的就是将多个`.html`文件指定为入口点:

```js twoslash [vite.config.js]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

如果指定不同的根，请记住，在解决输入路径时， `__dirname`仍然是vite.config.js文件的文件夹。因此，您需要将您的`root`条目添加到`resolve`参数中。

请注意，对于HTML文件，VITE忽略了`rollupOptions.input`对象中条目的名称，而是尊重文件的已解决的ID时，在DIST文件夹中生成HTML资产时。这确保了开发服务器的工作方式一致的结构。

## 库模式

当您开发面向浏览器的库时，您可能会大部分时间都在导入实际库的测试/演示页面上。使用Vite，您可以使用`index.html`来获得平稳的开发体验。

是时候捆绑库进行分发时，请使用[`build.lib` config选项](/0)。确保还将您不想捆绑到库中的所有依赖项外部化，例如`vue`或`react` :

::: code-group

```js twoslash [vite.config.js (single entry)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // 将添加适当的扩展名
      fileName: 'my-lib',
    },
    rollupOptions: {
      // 确保外部化不应该捆绑的dep
      // 进入您的图书馆
      external: ['vue'],
      output: {
        // 提供用于UMD构建中的全局变量
        // 用于外部底部
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (multiple entries)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        secondary: resolve(__dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rollupOptions: {
      // 确保外部化不应该捆绑的dep
      // 进入您的图书馆
      external: ['vue'],
      output: {
        // 提供用于UMD构建中的全局变量
        // 用于外部底部
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

输入文件将包含包装用户可以导入的导出:

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

使用此配置运行`vite build`使用汇总预设，该预设面向运输库，并产生两种捆绑格式:

- `es`和`umd` （用于单个条目）
- `es`和`cjs` （对于多个条目）

格式可以使用[`build.lib.formats`](/0)选项配置。

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

建议您的lib `package.json` :

::: code-group

```json [package.json (single entry)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (multiple entries)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### CSS支持

如果您的库导入任何CSS，则它将被捆绑为单个CSS文件，除了已构建的JS文件，例如`dist/my-lib.css` 。名称默认为`build.lib.fileName` ，但也可以使用[`build.lib.cssFileName`](/0)更改。

您可以在`package.json`中导出CSS文件以由用户导入:

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip File Extensions
如果`package.json`不包含`"type": "module"` ，则VITE将生成Node.js兼容性的不同文件扩展。 `.js`将变成`.mjs`和`.cjs`将变为`.js` 。
:::

::: tip Environment Variables
在图书馆模式下，在构建生产时，所有[`import.meta.env.*`](/0)使用都将静态替换。但是，没有`process.env.*`用法，因此您的库消费者可以动态地更改它。如果这是不可取的，则可以使用`define: { 'process.env.NODE_ENV': '"production"' }`来静态替换它们，或者使用[`esm-env`](/1)以更好地与捆绑器和运行时间兼容。
:::

::: warning Advanced Usage
库模式包括针对面向浏览器和JS框架库的简单且自明的配置。如果要构建非浏览器库，或需要高级构建流，则可以直接使用[汇总](/0)或[Esbuild](/1) 。
:::

## 高级基本选项

::: warning
此功能是实验性的。[给予反馈](/0)。
:::

对于高级用例，部署的资产和公共文件可能处于不同的路径，例如使用不同的缓存策略。
用户可以选择在三个不同的路径中部署:

- 生成的条目HTML文件（可以在SSR期间处理）
- 生成的哈希资产（JS，CSS和其他文件类型（如图像））
- 复制的[公共文件](/0)

在这些情况下，单个静态[基础](/0)是不够的。 Vite使用`experimental.renderBuiltUrl`为构建过程中的高级基本选项提供了实验支持。

```ts twoslash
import type { UserConfig } from 'vite'
// 漂亮的尼古尔
const config: UserConfig = {
  // ---在----
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      } else {
        return { relative: true }
      }
    },
  },
  // ---切割---
}
```

如果没有将哈希资产和公共文件部署在一起，则可以使用给出该功能的第二个`context`参数中包含的资产`type`独立定义每个组的选项。

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// 漂亮的尼古尔
const config: UserConfig = {
  // ---在----
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      } else if (path.extname(hostId) === '.js') {
        return {
          runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
        }
      } else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    },
  },
  // ---切割---
}
```

请注意，传递的`filename`是一个解码的URL，如果函数返回URL字符串，也应将其解码。渲染URL时，Vite将自动处理编码。如果返回具有`runtime`对象，则应在需要的地方处理编码，因为运行时代码将按原样渲染。
