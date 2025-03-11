# 依赖预捆绑

当您首次运行 `vite` 时，Vite 会在本地加载您的网站之前预捆绑您的项目依赖。此过程默认情况下会自动且透明地完成。

## 为什么

这是 Vite 执行的“依赖预捆绑”。此过程有两个目的:

1. **CommonJS 和 UMD 兼容性:** 在开发过程中，Vite 的开发服务器将所有代码作为原生 ESM 提供。因此，Vite 必须首先将作为 CommonJS 或 UMD 发布的依赖项转换为 ESM。

   在转换 CommonJS 依赖项时，Vite 会执行智能导入分析，以便即使导出是动态分配的，对 CommonJS 模块的命名导入也能按预期工作(例如 React):

   ```js
   // 按预期工作
   import React, { useState } from 'react'
   ```

2. **性能:** Vite 将带有许多内部模块的 ESM 依赖项转换为单个模块，以提高后续页面加载性能。

   某些包将其 ES 模块构建为许多单独的文件相互导入。例如，[`lodash-es` 有超过 600 个内部模块](https://unpkg.com/browse/lodash-es/)! 当我们执行 `import { debounce } from 'lodash-es'` 时，浏览器会同时发出 600 多个 HTTP 请求！虽然服务器可以轻松处理这些请求，但大量请求会在浏览器端造成网络拥塞，导致页面加载明显变慢。

   通过将 `lodash-es` 预捆绑到一个模块中，我们现在只需要一个 HTTP 请求！

::: tip NOTE
依赖预捆绑仅在开发模式下应用，并使用 `esbuild` 将依赖项转换为 ESM。在生产构建中，使用 `@rollup/plugin-commonjs`。
:::

## 自动依赖发现

如果未找到现有的缓存，Vite 会爬取您的源代码并自动发现依赖项导入(即期望从 `node_modules` 解析的“裸导入”)，并将这些发现的导入用作预捆绑的入口点。预捆绑使用 `esbuild` 进行，因此通常非常快。

服务器启动后，如果遇到尚未在缓存中的新依赖项导入，Vite 会重新运行依赖捆绑过程，并在需要时重新加载页面。

## Monorepos 和链接的依赖项

在 Monorepo 设置中，依赖项可能是来自同一仓库的链接包。Vite 会自动检测未从 `node_modules` 解析的依赖项，并将链接的依赖项视为源代码。它不会尝试捆绑链接的依赖项，而是会分析链接的依赖项的依赖列表。

但是，这需要链接的依赖项以 ESM 导出。如果不是，您可以在配置中将依赖项添加到 [`optimizeDeps.include`](/en/config/dep-optimization-options.md#optimizedeps-include) 和 [`build.commonjsOptions.include`](/en/config/build-options.md#build-commonjsoptions)。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
//  - -切 - -
export default defineConfig({
  optimizeDeps: {
    include: ['linked-dep'],
  },
  build: {
    commonjsOptions: {
      include: [/linked-dep/, /node_modules/],
    },
  },
})
```

当对链接的依赖项进行更改时，请使用 `--force` 命令行选项重新启动开发服务器，以使更改生效。

## 自定义行为

默认依赖发现启发式可能并不总是可取的。如果您要明确包含/排除依赖项，请使用[`optimizeDeps`配置选项](/en/config/dep-optimization-options.md)。

`optimizeDeps.include` 或 `optimizeDeps.exclude` 的典型用例是当您有一个在源代码中无法直接发现的导入时。例如，也许导入是由于插件转换而创建的。这意味着 Vite 在初始扫描时无法发现该导入——它只能在浏览器请求文件并进行转换后发现。这将导致服务器在启动后立即重新捆绑。

`include` 和 `exclude` 都可以用于处理这种情况。如果依赖项很大(包含许多内部模块)或为 CommonJS，则应包含它；如果依赖项很小且已经是有效的 ESM，则可以排除它并让浏览器直接加载。

您还可以使用 [`optimizeDeps.esbuildOptions` 选项](/en/config/dep-optimization-options.md#optimizedeps-esbuildoptions) 进一步自定义 esbuild。例如，添加一个 esbuild 插件来处理依赖项中的特殊文件或更改 [构建 `target`](https://esbuild.github.io/api/#target)。

## 缓存

### 文件系统缓存

Vite 在 `node_modules/.vite` 中缓存预捆绑的依赖项。它根据几个来源决定是否需要重新运行预捆绑步骤:

- 包管理器的锁定文件内容，例如 `package-lock.json`、`yarn.lock`、`pnpm-lock.yaml` 或 `bun.lockb`。
- 补丁文件夹的修改时间。
- 如果存在，相关字段在您的 `vite.config.js` 中。
- `NODE_ENV` 值。

只有当上述任何一个发生变化时，才需要重新运行预捆绑步骤。

如果由于某种原因您希望强制 Vite 重新捆绑依赖项，您可以使用 `--force` 命令行选项启动开发服务器，或者手动删除 `node_modules/.vite` 缓存目录。

### 浏览器缓存

已解析的依赖项请求通过 HTTP 标头 `max-age=31536000,immutable` 强制缓存，以提高开发过程中的页面重新加载性能。一旦缓存，这些请求将永远不会再次触及开发服务器。如果安装了不同版本的依赖项(如您的包管理器锁定文件中所反映的)，它们将通过附加的版本查询参数自动失效。如果您想通过进行本地编辑来调试依赖项，可以:

1. 通过浏览器开发者工具的网络选项卡暂时禁用缓存；
2. 使用 `--force` 标志重新启动 Vite 开发服务器以重新捆绑依赖项；
3. 重新加载页面。
