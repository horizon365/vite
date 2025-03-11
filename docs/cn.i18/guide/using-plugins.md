# 使用插件

Vite 可以通过插件进行扩展，这些插件基于 Rollup 设计良好的插件接口，并添加了一些特定于 Vite 的选项。这意味着 Vite 用户可以依赖 Rollup 插件的成熟生态系统，同时还可以根据需要扩展开发服务器和 SSR 功能。

## 添加插件

要使用插件，需要将其添加到项目的 `devDependencies` 中，并将其包含在 `vite.config.js` 配置文件中的 `plugins` 数组中。例如，为了支持旧版浏览器，可以使用官方的 [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy):

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

`plugins` 还接受包含多个插件作为单个元素的预设。这对于使用多个插件实现的复杂功能(如框架集成)非常有用。数组将在内部被展平。

无效的插件将被忽略，这可以用来轻松激活或停用插件。

## 查找插件

:::tip NOTE
Vite 旨在为常见的 Web 开发模式提供开箱即用的支持。在搜索 Vite 或兼容的 Rollup 插件之前，请查看 [功能指南](../guide/features.md)。许多在 Rollup 项目中需要插件的情况已经在 Vite 中得到了覆盖。
:::

请查看 [插件部分](../plugins/) 以获取有关官方插件的信息。社区插件列在 [awesome-vite](https://github.com/vitejs/awesome-vite#plugins) 中。

您还可以使用[NPM搜索Vite-Plugin的VITE插件](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity)或[NPM搜索汇总](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity)插件的NPM搜索，以遵循[推荐约定的](/0)插件。

## 强制插件顺序

为了与某些 Rollup 插件兼容，可能需要强制插件的顺序或仅在构建时应用。这应该是 Vite 插件的实现细节。您可以使用 `enforce` 修饰符来强制插件的位置:

- `pre`: 在 Vite 核心插件之前调用插件
- 默认:在 Vite 核心插件之后调用插件
- `post`: 在 Vite 构建插件之后调用插件

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

请查看 [插件 API 指南](./api-plugin.md#plugin-ordering) 以获取详细信息。

## 条件应用

默认情况下，插件在服务和构建时都会被调用。如果需要在服务或构建过程中有条件地应用插件，可以使用 `apply` 属性在 `'build'` 或 `'serve'` 期间调用它们:

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## 构建插件

请查看 [插件 API 指南](./api-plugin.md) 以获取有关创建插件的文档。
