# 依赖优化选项

-

除非特别指出，本节中的选项仅应用于依赖优化器，该优化器仅在开发模式下使用。

## optimizeDeps.entries

- |

如果这些都不符合您的需求，您可以使用此选项指定自定义条目 - 该值应为一个或多个相对 Vite 项目根目录的 [`tinyglobby` 模式](https://github.com/SuperchupuDev/tinyglobby)。这将覆盖默认的条目推断。当 `optimizeDeps.entries` 明确定义时，默认情况下仅忽略 `node_modules` 和 `build.outDir` 文件夹。如果需要忽略其他文件夹，可以在条目列表中使用以 `!` 开头的忽略模式。如果您不想忽略 `node_modules` 和 `build.outDir`，可以使用字面字符串路径(不使用 `tinyglobby` 模式)来指定。

## optimizeDeps.exclude

-

排除在预打包之外的依赖项。

:::warning CommonJS
不应将 CommonJS 依赖项从优化中排除。如果一个 ESM 依赖项被排除在优化之外，但包含嵌套的 CommonJS 依赖项，则应将 CommonJS 依赖项添加到 `optimizeDeps.include` 中。例如:

```js twoslash
import { defineConfig } from 'vite'
//  - -切 - -
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include

-

**实验:** 如果您使用的是具有许多深层导入的库，还可以指定一个尾随的通配符模式，以一次性预打包所有深层导入。这将避免每次使用新的深层导入时都需要预打包。[提供反馈](https://github.com/vitejs/vite/discussions/15833)。例如:

```js twoslash
import { defineConfig } from 'vite'
//  - -切 - -
export default defineConfig({
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
})
```

## optimizeDeps.esbuildOptions

- | '捆'
  | “入口点”
  | '外部的'
  | '写'
  | '手表'
  | 'Outdir'
  | 'outfile'
  | 'outbase'
  | 'outExtension'
  |

在依赖扫描和优化期间传递给 esbuild 的选项。

某些选项被省略，因为更改它们将与 Vite 的依赖优化不兼容。

-
-

## optimizeDeps.force

-

## optimizeDeps.holdUntilCrawlEnd

-
-
-

启用时，它将在冷启动时保留第一次优化的依赖结果，直到所有静态导入都被爬取。这避免了在发现新依赖项并触发生成新的公共块时需要全页重新加载。如果扫描器加上 `include` 中明确定义的依赖项已经找到所有依赖项，则最好禁用此选项，以使浏览器并行处理更多请求。

## optimizeDeps.disabled

- **已弃用**
-
- | '建造' |
-

:::warning

:::

## optimizeDeps.needsInterop

- **实验**
-
