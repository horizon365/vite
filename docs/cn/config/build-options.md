# 构建选项

除非指出，否则本节中的选项仅适用于构建。

## build.target

- **类型:** `字符串 | 字符串[]`
- **默认值:** `'modules'`
- **相关:**[浏览器兼容性](/en/guide/build#browser-compatibility)

最终捆绑包的浏览器兼容性目标。默认值是Vite特殊值`'modules'` ，它针对具有[本机ES模块]()，[本机ESM Dynamic Import]()和[`import.meta`]()支持的浏览器。 Vite将取代`'modules'`到`['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`

另一个特殊值是`'esnext'`假设天然动态导入支持，并且只会执行最小的换击。

转换是用Esbuild执行的，该值应该是有效的[Esbuild目标选项]()。自定义目标可以是ES版本（例如`es2015` ），具有版本（例如`chrome58` ）的浏览器，也可以是多个目标字符串的数组。

请注意，如果代码包含无法安全转移的特征，则构建将失败。有关更多详细信息，请参见[Esbuild文档]()。

## build.modulePreload

- **类型:** `布尔 | {polyfill？:布尔值，分解依赖性？:resolvemoduleprepreloaddependencenciesfn}`}`}`}
- **默认值:** `{ polyfill: true }`

默认情况下，自动注入[模块预紧式多填充]()。将多文件自动注入每个`index.html`条目的代理模块中。如果将构建配置为使用`build.rollupOptions.input`通过1的非HTML自定义条目，则有必要在您的自定义条目中手动导入polyfill:

```js
import 'vite/modulepreload-polyfill'
```

注意:多文件**不适**用于[库模式]()。如果您需要在没有本机动态导入的情况下支持浏览器，则可能应避免在库中使用它。

可以使用`{ polyfill: false }`禁用多填充。

每次动态导入的预加载块列表是通过Vite计算的。默认情况下，加载这些依赖项时将使用包括`base`在内的绝对路径。如果`base`是相对（ `''`或`'./'` ），则在运行时使用`import.meta.url` ，以避免取决于最终部署基础的绝对路径。

使用`resolveDependencies`函数对依赖项列表及其路径的细粒度控制有实验支持。[给予反馈]()。它期望类型`ResolveModulePreloadDependenciesFn`的功能:

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    hostId: string
    hostType: 'html' | 'js'
  },
) => string[]
```

每个动态导入都将调用`resolveDependencies`功能，并在其依赖的块列表中列出，并且还将为输入HTML文件中导入的每个块调用它。可以通过这些过滤或更多的注入依赖项返回新的依赖项数组，并修改了其路径。 `deps`路径相对于`build.outDir`路径。返回值应该是`build.outDir`相对路径。

```js twoslash
/** @Type {import（'vite'）。userconfig} */
const config = {
  // 漂亮的尼古尔
  build: {
    // ---在----
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        return deps.filter(condition)
      },
    },
    // ---切割---
  },
}
```

可以使用[`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options)进一步修改已解决的依赖性路径。

## build.polyfillModulePreload

- **类型:** `boolean`
- **默认值:** `true`
- **弃用**使用`build.modulePreload.polyfill`代替

是否要自动注入[模块预紧填充物]()。

## build.outDir

- **类型:** `string`
- **默认值:** `dist`

指定输出目录（相对于[项目根](/en/guide/#index-html-and-project-root)）。

## build.assetsDir

- **类型:** `string`
- **默认值:** `assets`

指定目录到嵌套生成的资产（相对于`build.outDir`这是在[库模式](/en/guide/build#library-mode)中使用的）。

## build.assetsInlineLimit

- | `（（filepath:string，content:buffer）=>布尔值 | 未定义）`
- **默认值:** `4096` （4 KIB）

小于此阈值的导入或引用的资产将以base64 URL的形式夹住，以避免额外的HTTP请求。设置为`0`以完全禁用内联。

如果通过回调，则可以将布尔值返回到选择退出或退出。如果什么都没有返回，则适用默认逻辑。

git LFS占位符自动被排除在内线之外，因为他们不包含其代表的文件的内容。

::: tip Note
如果您指定`build.lib` ，则将忽略`build.assetsInlineLimit` ，并且无论文件大小或git lfs占位符，资产将始终被内衬。
:::

## build.cssCodeSplit

- **类型:** `boolean`
- **默认值:** `true`

启用/禁用CSS代码分裂。启用后，在异步JS块中导入的CSS将被保存为块，并在获取块时一起被取出。

如果禁用，将将整个项目中的所有CSS提取到一个CSS文件中。

::: tip Note
如果指定`build.lib` ，则为`build.cssCodeSplit`为`false`为默认值。
:::

## build.cssTarget

- **类型:** `字符串 | 字符串[]`
- **默认:**与[`build.target`](#build-target)相同

此选项允许用户从用于JavaScript转卸的一个方面设置CSS缩小的不同浏览器目标。

仅当您定位非主流浏览器时才能使用它。
一个示例是Android微信WebView，它支持大多数现代的JavaScript功能，但不支持[CSS中的`#RGBA`六核颜色符号]()。
在这种情况下，您需要设置`build.cssTarget`到`chrome61` ，以防止VITE将`rgba()`颜色转换为`#RGBA`十六进制符号。

## build.cssMinify

- **类型:** `布尔 | 'esbuild' | 'Lightningcss'`
- **默认值:**与客户端[`build.minify`](#build-minify) ，SSR为`'esbuild'`

此选项允许用户专门覆盖CSS缩小，而不是默认为`build.minify` ，因此您可以分别配置JS和CSS的缩影。 Vite默认情况下使用`esbuild`使用CSS。将选项设置为`'lightningcss'`使用[闪电CSS]() 。如果选择，则可以使用[`css.lightningcss`]()进行配置。

## build.sourcemap

- **类型:** `布尔 | '排队' | “隐藏”
- **默认值:** `false`

生成生产源图。如果`true` ，将创建一个单独的Sourcemap文件。如果`'inline'` ，则作为数据UI，SourceMap将附加到结果输出文件上。 `'hidden'`作品像`true`一样，除了捆绑文件中相应的Sourcemap注释被抑制了。

## build.rollupOptions

-

直接自定义基础汇总捆绑包。这与可以从汇编配置文件导出的选项相同，并将与Vite的内部汇总选项合并。有关更多详细信息，请参见[汇总选项文档]()。

## build.commonjsOptions

- **类型:** [`RollupCommonJSOptions`]()

传递到[@lollup/plugin-commonjs的]()选项。

## build.dynamicImportVarsOptions

- **类型:** [`RollupDynamicImportVarsOptions`]()
- **相关:**[动态导入](/en/guide/features#dynamic-import)

传递到[@lollup/plugin-dynamic-import-vars的]()选项。

## build.lib

- **类型:** `{条目:字符串 | 细绳[] | {[Entryalias:string]:string}，名称？:字符串，格式？:（'es' | 'CJS' | 'umd' | 'iife'）[]，文件名？:字符串 | （（格式:moduleformat，entryname:string）=> string），cssfilename？:string}`}
- **相关:**[库模式](/en/guide/build#library-mode)

构建为图书馆。需要`entry` ，因为库不能将HTML用作条目。 `name`是暴露的全局变量，当`formats`包括`'umd'`或`'iife'` ，需要。如果使用多个条目，则默认为`formats`或`['es', 'cjs']` `['es', 'umd']`

`fileName`是软件包文件输出的名称，默认为`package.json`中的`"name"` 。它也可以定义为以`format`和`entryName`为参数并返回文件名的函数。

如果您的软件包导入CSS，则可以使用`cssFileName`来指定CSS文件输出的名称。如果设置一个字符串，则默认值为与`fileName`相同的值，否则它也落后于`package.json`中的`"name"` 。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/main.js'],
      fileName: (format, entryName) => `my-lib-${entryName}.${format}.js`,
      cssFileName: 'my-lib-style',
    },
  },
})
```

## build.manifest

- **类型:** `布尔 |
- **默认值:** `false`
- **相关:**[后端集成](/en/guide/backend-integration)

是否要生成一个清单文件，该文件包含非障碍资产文件名映射到其Hashed版本中，然后可以由服务器框架使用该文件来呈现正确的资产链接。

当值是字符串时，将其用作相对于`build.outDir`的清单文件路径。设置为`true`时，路径为`.vite/manifest.json` 。

## build.ssrManifest

- **类型:** `布尔 |
- **默认值:** `false`
- **相关:**[服务器端渲染](/en/guide/ssr)

是否生成用于确定生产中样式链接和资产预付指令的SSR清单文件。

当值是字符串时，将其用作相对于`build.outDir`的清单文件路径。设置为`true`时，路径为`.vite/ssr-manifest.json` 。

## build.ssr

- **类型:** `布尔 |
- **默认值:** `false`
- **相关:**[服务器端渲染](/en/guide/ssr)

产生面向SSR的构建。该值可以是直接`true` SSR条目的字符串，或者需要通过`rollupOptions.input`指定SSR条目。

## build.emitAssets

- **类型:** `boolean`
- **默认值:** `false`

在非客户构建过程中，不会发出静态资产，因为假设它们将被作为客户端构建的一部分排放。此选项允许框架在其他环境中迫使它们发射。该框架有责任将资产与后建立步骤合并。

## build.ssrEmitAssets

- **类型:** `boolean`
- **默认值:** `false`

在SSR构建过程中，静态资产不会发出，因为假设它们将被作为客户端构建的一部分发射。此选项允许框架强制在客户端和SSR构建中发射它们。该框架有责任将资产与后建立步骤合并。一旦环境API稳定，该选项将被`build.emitAssets`替换。

## build.minify

- **类型:** `布尔 | “ Terser” | 'esbuild'
- **默认值:** `'esbuild'`用于客户端， `false`用于SSR构建

设置为`false`以禁用缩小，或指定要使用的缩影。默认值是[Esbuild]() ，比Terser快20〜40倍，压缩速度仅为1〜2％。[基准]()

请注意， `build.minify`选项在LIB模式下使用`'es'`格式时不会缩小空格，因为它可以去除纯净的注释并破坏树木的震动。

将TERSER设置为`'terser'`时，必须安装Terser。

```sh
npm add -D terser
```

## build.terserOptions

- **类型:** `TerserOptions`

额外[缩小选项]()将其传递给Terser。

此外，您还可以通过`maxWorkers: number`选项来指定要产生的最大工人数量。默认为CPU减1的数量。

## build.write

- **类型:** `boolean`
- **默认值:** `true`

设置为`false`以禁用将捆绑包写入磁盘。这主要用于[编程`build()`调用，](/en/guide/api-javascript#build)其中在写入磁盘之前需要对捆绑包进行进一步的处理。

## build.emptyOutDir

- **类型:** `boolean`
- **默认值:** `true`如果`outDir`在`root`中

默认情况下，如果Vite在项目根内，Vite将清空构建的`outDir` 。如果`outDir`不在根本之外，则会发出警告，以免意外删除重要文件。您可以明确设置此选项以抑制警告。这也可以通过命令行AS `--emptyOutDir`获得。

## build.copyPublicDir

- **类型:** `boolean`
- **默认值:** `true`

默认情况下，Vite将将文件从`publicDir`复制到构建上的`outDir` 。设置为`false`以禁用此功能。

## build.reportCompressedSize

- **类型:** `boolean`
- **默认值:** `true`

启用/禁用GZIP压缩尺寸报告。压缩大型输出文件可能会很慢，因此禁用这可能会增加大型项目的构建性能。

## build.chunkSizeWarningLimit

-
- **默认值:** `500`

块大小警告的限制（以KB为单位）。将其与未压缩的块大小进行比较，因为[JavaScript大小本身与执行时间有关]()。

## build.watch

- **类型:** [`WatcherOptions`]()| null`
- **默认值:** `null`

设置为`{}`启用滚动观察者。这主要用于涉及仅构建插件或集成过程的情况。

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

在某些情况下，观看文件系统与WSL2不起作用。
有关更多详细信息，请参见[`server.watch`](./server-options.md#server-watch) 。

:::
