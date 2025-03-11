# 共享选项

除非特别指出，本节中的选项将应用于所有开发、构建和预览。

## 根

- **类型:** `string`
- **默认值:** `process.cwd()`

项目root目录(其中`index.html`位置)。可以是绝对路径，也可以是相对于当前工作目录的路径。

有关更多详细信息，请参见[项目根](/en/guide/#index-html-and-project-root)。

## 根据

- **类型:** `string`
- **默认值:** `/`
- **相关:** [`server.origin`](/en/config/server-options.md#server-origin)

在开发或生产中服务时的基本公共道路。有效值包括:

- 绝对URL路径名，例如`/foo/`
- 完整URL，例如`https://bar.com/foo/` (原点部分不会在开发中使用，因此值与`/foo/`相同)
- 空字符串或`./` (用于嵌入式部署)

有关更多详细信息，请参见[公共基本路径](/en/guide/build#public-base-path)。

## 模式

- **类型:** `string`
- **默认值:** `'development'`用于服务， `'production'`用于构建

在配置中指定此功能将覆盖**服务和构建**的默认模式。该值也可以通过命令行`--mode`选项覆盖。

有关更多详细信息，请参见[ENV变量和模式](/en/guide/env-and-mode)。

## 定义

- **类型:** `Record<string, any>`

定义全局恒定替换。条目将定义为DEV期间的全球，并在构建过程中静态替换。

Vite使用[Esbuild定义](https://esbuild.github.io/api/#define)执行替换，因此值表达式必须是包含JSON serializable值(null，Boolean，Number，Number，Number，String，Array或Object)或单个标识符的字符串。对于非弦值值，Vite将自动将其转换为具有`JSON.stringify`的字符串。

**示例:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip NOTE
对于打字稿用户，请确保在`env.d.ts`或`vite-env.d.ts`文件中添加类型声明以获取类型检查和Intellisense。

例子:

```ts
// Vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## 插件

- **类型:** `(插件 | 插件[] | Promise <插件 | 插件[]>)[]`

要使用的插件数组。虚假的插件被忽略，并且插件数组被扁平。如果返回承诺，则将在运行前解决。有关VITE插件的更多详细信息，请参见[插件API](/en/guide/api-plugin) 。

## publicdir

- | false
- **默认值:** `"public"`

目录作为普通静态资产。该目录中的文件在DEV期间为`/`提供，并在构建过程中复制为`outDir`的根，并且始终将其提供或复制，而无需转换。该值可以是绝对文件系统路径，也可以是相对于项目root的路径。

定义`publicDir`为`false`禁用此功能。

有关更多详细信息，请参见[`public`目录](/en/guide/assets#the-public-directory)。

## 缓存

- **类型:** `string`
- **默认值:** `"node_modules/.vite"`

目录保存缓存文件。此目录中的文件是预捆绑的DEP或VITE生成的其他一些缓存文件，可以改善性能。您可以使用`--force`标志或手动删除目录以再生缓存文件。该值可以是绝对文件系统路径，也可以是相对于项目root的路径。默认为`.vite`时未检测到json。

## resolve.alias

- **类型:**
  `记录<字符串，字符串> | 数组<{find:string | REGEXP，替换:字符串，CustomResolver？:ResolverFunction | ResolverObject}>`

将传递给`@rollup/plugin-alias`作为[条目选项](https://github.com/rollup/plugins/tree/master/packages/alias#entries)。可以是一个对象，也可以是`{ find, replacement, customResolver }`对的数组。

当使其归档系统路径时，请始终使用绝对路径。相对别名值将被用作IS，并且不会解决到文件系统路径中。

可以通过[插件](/en/guide/api-plugin)实现更高级的自定义分辨率。

::: warning Using with SSR
如果您为[SSR外部化依赖项](/en/guide/ssr.md#ssr-externals)配置了别名，则可能需要别名实际的`node_modules`软件包。[纱线](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias)和[PNPM](https://pnpm.io/aliases/)都通过`npm:`前缀支持混叠。
:::

## resolve.dedupe

-

如果您在应用程序中具有相同依赖关系的重复副本(可能是由于MonorePos中的提升或链接软件包引起的)，请使用此选项迫使VITE始终将列出的依赖项解析为同一副本(来自Project root)。

:::warning SSR + ESM
对于SSR构建，重复数据删除不适用于从`build.rollupOptions.output`配置的ESM构建输出。解决方法是使用CJS构建输出，直到ESM对模块加载具有更好的插件支持为止。
:::

## resolve.conditions

-
- **默认值:** `['模块'，'浏览器'，'开发|生产'] ` (` defaultClientConditions）

从包装中解决[有条件的出口](https://nodejs.org/api/packages.html#packages_conditional_exports)时，其他允许的条件。

带有条件出口的软件包在其`package.json`中可能具有以下`exports`字段:

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

在这里， `import`和`require`是“条件”。条件可以嵌套，应从最特定至最小特定的情况下指定。

`发展|生产`is a special value that is replaced with`生产`or`开发`depending on the value of`process.env.node_env`. It is replaced with `生产`when`process.env.node_env ==='生产'`and`开发'否则。

请注意，如果满足要求`default`始终应用`import` `require` 。

:::warning Resolving subpath exports
以“/”结尾的导出键被节点弃用，并且可能无法正常工作。请联系包裹作者，以使用[`*`个子路模式](https://nodejs.org/api/packages.html#package-entry-points)。
:::

## resolve.mainFields

-
- **默认值:** `['browser', 'module', 'jsnext:main', 'jsnext']` ( `defaultClientMainFields` )

在解决程序包的入口点时，在`package.json`中的字段列表。请注意，这比从`exports`字段解决的条件导出要低的优先级:如果从`exports`成功解决了一个入口点，则将忽略主场。

## resolve.extensions

-
- **默认值:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

文件扩展名列表，以尝试省略扩展的导入。请注意，**不**建议省略自定义导入类型(例如`.vue` )的扩展，因为它会干扰IDE和类型支持。

## resolve.preserveSymlinks

-
- **默认值:** `false`

启用此设置会导致VITE通过原始文件路径(即无需符合符号链接的路径)而不是真实的文件路径(即在symLinks之后的路径)确定文件身份。

- **相关:** [Esbuild＃保存 - 链接](https://esbuild.github.io/api/#preserve-symlinks)，[webpack＃resolve.symlinks
  ]（ [https://webpack.js.org/configuration/resolve/#resolvesymlinks](/0) ）

## html.cspNonce

- **类型:** `string`
- **相关:**[内容安全策略(CSP)](/en/guide/features#content-security-policy-csp)

在生成脚本 /样式标签时将使用的Nonce值占位持有人。设置此值还将生成具有非CE值的元标记。

## css.modules

- **类型:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * 默认值:未定义
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

配置CSS模块行为。这些选项将传递给[PostCSS模型](https://github.com/css-modules/postcss-modules)。

使用[Lightning CSS](../guide/features.md#lightning-css)时，此选项没有任何效果。如果启用，则应使用[`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) 。

## css.postcss

- | （Postcss.processoptions＆{插件？:Postcss.acceptedplugin []}）``

内联PostCSS配置或自定义目录从搜索postcss config(默认为项目root)。

对于Inline PostCSS Config，它期望与`postcss.config.js`相同的格式。但是对于`plugins`属性，只能使用[数组格式](https://github.com/postcss/postcss-load-config/blob/main/README.md#array)。

搜索是使用[PostCSS-Load-Config](https://github.com/postcss/postcss-load-config)完成的，并且仅加载了支持的配置文件名。默认情况下，未搜索工作空间root之外的配置文件(如果找不到[工作空间](/en/guide/#index-html-and-project-root)，则没有找到工作区)。您可以在根外指定自定义路径，以便在需要时加载特定的配置文件。

请注意，如果提供了内联配置，Vite将不会搜索其他PostCSS配置源。

## css.preprocessorOptions

- **类型:** `Record<string, object>`

指定将选项传递给CSS预处理器。文件扩展名用作选项的键。每个预处理器的支持选项都可以在其各自的文档中找到:

- `sass` / `scss` :
  - 选择与`api一起使用的SASS API:“ Modern-Compiler” | “现代的” | “遗产” `(default`“现代犯罪者”`if` sass卷成`is installed, otherwise`“现代”`). For the best performance, it's recommended to use `API:“现代兼容器”`with the` Sass插入`package. The` “ Legacy”'API被弃用，并将在Vite 7中删除。
  - [选项(现代)](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
  - [选项(遗产)](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions) 。
- `less` :[选项](https://lesscss.org/usage/#less-options)。
- `styl` / `stylus` :仅支持[`define`](https://stylus-lang.com/docs/js.html#define-name-node) ，可以作为对象传递。

**示例:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // 或“现代”，“遗产”
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- | ((源:字符串，文件名:字符串)=>(字符串 | {content:string;地图？:sourcemap}))`

此选项可用于为每个样式内容注入额外的代码。请注意，如果您包含实际样式，而不仅仅是变量，那么这些样式将在最终捆绑包中重复。

**示例:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

## css.preprocessorMaxWorkers

- **实验:**[给予反馈](https://github.com/vitejs/vite/discussions/15835)
- **类型:** `编号 |
- **默认值:** `0` (不创建任何工人并在主线程中运行)

如果设置了此选项，则CSS预处理器将在可能的情况下在工人中运行。 `true`表示CPU减1。

## css.devSourcemap

- **实验:**[给予反馈](https://github.com/vitejs/vite/discussions/13845)
-
- **默认值:** `false`

是否在开发过程中启用sourcemaps。

## css.transformer

- **实验:**[给予反馈](https://github.com/vitejs/vite/discussions/13835)
- **类型:** `'PostCSS' | 'Lightningcss'`
- **默认值:** `'postcss'`

选择用于CSS处理的引擎。查看[Lightning CSS](../guide/features.md#lightning-css)以获取更多信息。

::: info Duplicate `@import`s
请注意，PostCSS(PostCSS-Import)的行为不同，浏览器重复`@import` 。请参阅[PostCSS/Postcss-Import＃462](https://github.com/postcss/postcss-import/issues/462) 。
:::

## css.lightningcss

- **实验:**[给予反馈](https://github.com/vitejs/vite/discussions/13835)
- **类型:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

配置闪电CSS。完整的转换选项可以在[Lightning CSS存储库](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts)中找到。

## json.namedExports

-
-

是否支持从`.json`文件中命名的导入。

## json.stringify

- | '自动
- **默认值:** `'auto'`

如果设置为`true` ，则导入的JSON将被转换为`export default JSON.parse("...")` ，其性能要比对象文字要高得多，尤其是在JSON文件大的情况下。

如果设置为`'auto'` ，则仅当[数据大于10KB时，](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger)数据才会被串制。

## Esbuild

- **类型:** `EsbuildOptions | false

`ESBuildOptions`扩展了[Esbuild自己的转换选项](https://esbuild.github.io/api/#transform)。最常见的用例是自定义JSX:

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

默认情况下，Esbuild应用于`ts`和`tsx`文件`jsx`您可以使用`esbuild.include`和`esbuild.exclude`自定义此功能，这可以是正则是REGEX， [PICOMATCH](https://github.com/micromatch/picomatch#globbing-features)模式或任何一个数组。

此外，您还可以使用`esbuild.jsxInject`自动为Esbuild转换的每个文件自动注入JSX Helper进口:

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

当[`build.minify`](./build-options.md#build-minify)为`true` ，默认情况下将应用所有缩放优化。为了禁用其[某些方面](https://esbuild.github.io/api/#minify)，将`esbuild.minifyIdentifiers`或`esbuild.minifyWhitespace` `esbuild.minifySyntax`中的任何一个设置为`false` 。注意`esbuild.minify`选项不能用于覆盖`build.minify` 。

设置为`false`以禁用Esbuild变换。

## 资产包括

- | REGEXP | (细绳 | REGEXP)[]`
- **相关:**[静态资产处理](/en/guide/assets)

指定要视为静态资产的其他[PICOMATCH模式](https://github.com/micromatch/picomatch#globbing-features)，以便:

- 当从HTML引用或直接在`fetch`或XHR上引用时，将将它们排除在插件变换管道之外。

- 从JS导入它们将返回其已解决的URL字符串(如果您有`enforce: 'pre'`插件以不同的方式处理资产类型，则可以覆盖它)。

内置资产类型列表可以[在此处](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts)找到。

**示例:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## loglevel

- **类型:** `'信息' | '警告' | '错误' | '沉默'

调整控制台输出的冗长。默认值为`'info'` 。

## CustomLogger

- **类型:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

使用自定义记录仪进行日志消息。您可以使用Vite的`createLogger` API获取默认记录器并将其自定义为例如更改消息或过滤某些警告。

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // 忽略空的CSS文件警告
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## 透明屏幕

-
-

设置为`false`以防止Vite在记录某些消息时清除终端屏幕。通过命令行，使用`--clearScreen false` 。

## envdir

- **类型:** `string`
- **默认值:** `root`

加载 `.env` 文件的目录。可以是绝对路径，也可以是相对于项目根目录的路径。

有关环境文件的更多信息，请参见[此处](/en/guide/env-and-mode#env-files)。

## envprefix

- |
- **默认值:** `VITE_`

以`envPrefix`开头的ENV变量将通过import.meta.env暴露于您的客户量源代码。

:::warning SECURITY NOTES
`envPrefix` 不应设置为 `''`，这将暴露所有环境变量并导致敏感信息的意外泄漏。Vite 在检测到 `''` 时会抛出错误。

如果您想暴露未带前缀的变量，可以使用 [define](#define) 来暴露它:

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## AppType

- **类型:** `'spa' | 'mpa' | '自定义
- **默认值:** `'spa'`

您的应用程序是单页应用程序(SPA)，[多页应用程序(MPA)](../guide/build#multi-page-app)还是自定义应用程序(具有自定义HTML处理的SSR和框架):

- `'spa'` :包括HTML Middlewares，并使用水疗后备。在预览中使用`single: true`配置[SIRV](https://github.com/lukeed/sirv)
- `'mpa'` :包括HTML中间Wares
- `'custom'` :不要包括HTML中间Wares

在Vite的[SSR指南](/en/guide/ssr#vite-cli)中了解更多信息。相关: [`server.middlewareMode`](./server-options#server-middlewaremode) 。

## 未来

- **类型:** `记录<字符串，'警告' | 未定义>`
- **相关:**[破裂变化](/en/changes/)

启用未来的破裂变化，以准备平稳迁移到下一个主要版本的Vite。随着新功能的开发，可以随时更新，添加或删除列表。

有关可能的选项的详细信息，请参见[“断开更改”](/en/changes/)页面。
