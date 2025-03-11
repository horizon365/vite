# 静态资源处理

-
-

## 作为 URL 导入资源

导入静态资源时，将返回其解析后的公共 URL:

```js twoslash
import 'vite/client'
//  - -切 - -
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

例如，`imgUrl` 在开发过程中将为 `/src/img.png`，在生产构建中将变为 `/assets/img.2d8efhg.png`。

该行为类似于 Webpack 的 `file-loader`。不同之处在于，该导入可以使用绝对公共路径(基于开发过程中的项目根)或相对路径。

- CSS 中的 `url()` 引用以相同的方式处理。

- 如果使用 Vue 插件，Vue 单文件组件模板中的资源引用将自动转换为导入。

- 常见的图像、媒体和字体文件类型会被自动检测为资源。您可以使用 [`assetsInclude` 选项](/en/config/shared-options.md#assetsinclude) 扩展内部列表。

- 引用的资源将作为构建资源图的一部分，将获得带有哈希的文件名，并且可以由插件进行优化处理。

- 小于 [`assetsInlineLimit` 选项](/en/config/build-options.md#build-assetsinlinelimit) 的资源将以 base64 数据 URL 的形式内联。

- Git LFS 占位符会自动排除内联，因为它们不包含所代表文件的内容。要实现内联，请确保在构建前通过 Git LFS 下载文件内容。

- 默认情况下，TypeScript 不会将静态资源导入识别为有效模块。要解决此问题，请包含 [`vite/client`](./features#client-types)。

::: tip Inlining SVGs through `url()`
当通过 JS 手动构造 `url()` 传递 SVG 的 URL 时，该变量应包裹在双引号中。

```js twoslash
import 'vite/client'
//  - -切 - -
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### 显式 URL 导入

未包含在内部列表或 `assetsInclude` 中的资源可以使用 `?url` 后缀显式导入为 URL。例如，这对于导入 [Houdini Paint Worklets](https://developer.mozilla.org/en-US/docs/Web/API/CSS/paintWorklet_static) 非常有用。

```js twoslash
import 'vite/client'
//  - -切 - -
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### 显式内联处理

资源可以分别使用 `?inline` 或 `?no-inline` 后缀显式导入为内联或非内联。

```js twoslash
import 'vite/client'
//  - -切 - -
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### 作为字符串导入资源

资源可以使用 `?raw` 后缀导入为字符串。

```js twoslash
import 'vite/client'
//  - -切 - -
import shaderString from './shader.glsl?raw'
```

### 作为 Worker 导入脚本

脚本可以使用 `?worker` 或 `?sharedworker` 后缀作为 Web Worker 导入。

```js twoslash
import 'vite/client'
//  - -切 - -
// 在生产构建中单独打包
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
//  - -切 - -
// sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
//  - -切 - -
// 作为 base64 字符串内联
import InlineWorker from './shader.js?worker&inline'
```

更多详细信息请参阅 [Web Worker 部分](./features.md#web-workers)。

## `public` 目录

如果您有以下资源:

- 从未在源代码中引用(例如 `robots.txt`)
- 必须保留完全相同的文件名(不带哈希)
- ...或者您只是不想为了获取其 URL 而先导入资源

该目录默认为 `<root>/public`，但可以通过 [`publicDir` 选项](/en/config/shared-options.md#publicdir) 进行配置。

请注意，您应始终使用根绝对路径引用 `public` 目录中的资源 - 例如，`public/icon.png` 应在源代码中引用为 `/icon.png`。

## new URL(url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) 是一个原生 ESM 特性，用于暴露当前模块的 URL。将其与原生 [URL 构造函数](https://developer.mozilla.org/en-US/docs/Web/API/URL) 结合使用，我们可以通过 JavaScript 模块的相对路径获得静态资源的完整解析 URL:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

这在现代浏览器中是原生支持的 - 事实上，Vite 在开发过程中根本不需要处理这段代码！

此模式还支持通过模板字符串生成动态 URL:

```js
function getImageUrl(name) {
  // 请注意，这不包括子目录中的文件
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

在生产构建过程中，Vite 将执行必要的转换，以确保即使在捆绑和资源哈希之后，URL 仍指向正确的位置。但是，URL 字符串必须是静态的，以便可以进行分析，否则代码将保持原样，如果 `build.target` 不支持 `import.meta.url`，则可能会导致运行时错误

```js
// Vite 不会转换此代码
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details How it works

Vite 将 `getImageUrl` 函数转换为:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Does not work with SSR
如果您使用 Vite 进行服务器端渲染，此模式将不起作用，因为 `import.meta.url` 在浏览器和 Node.js 中具有不同的语义。服务器端打包也无法提前确定客户端主机 URL。
:::
