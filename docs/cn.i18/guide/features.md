# 特征

在非常基本的层面上，使用VITE开发与使用静态文件服务器没有什么不同。但是，Vite提供了对本机ESM导入的许多增强功能，以支持基于Bundler的设置中通常可以看到的各种功能。

## NPM依赖性解决和预捆扎

本机ES导入不支持如下所示的裸机导入:

```js
import { someMethod } from 'my-dep'
```

以上将在浏览器中丢弃错误。 Vite将在所有已服务的源文件中检测到此类裸机导入，并执行以下操作:

1. [预先将它们进行预击](/0)，以提高页面加载速度，并将CommonJ / UMD模块转换为ESM。预捆绑步骤是通过[Esbuild](/1)执行的，并使Vite的冷启动时间明显快于任何基于JavaScript的邦德勒。

2. 将导入的导入重写为`/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd`等有效URL，以便浏览器可以正确导入它们。

**依赖项被强烈缓存**

Vite缓存依赖关系请求通过HTTP标头发出，因此，如果您想在本地编辑/调试依赖项，请[在此处](/0)执行这些步骤。

## 热模块更换

Vite在天然ESM上提供了[HMR API](/0) 。具有HMR功能的框架可以利用API提供即时，精确的更新，而无需重新加载页面或吹走应用程序状态。 Vite为[VUE单文件组件](/1)提供第一方HMR集成，并[快速刷新](/2)。还可以通过[@prefresh/vite](/3)进行官方的预先集成。

请注意，您无需手动设置这些 - 当您[通过`create-vite`创建应用程序](/0)时，所选模板已经为您提供了预配置。

## 打字稿

Vite支持将`.ts`文件导入框。

### 仅移动

请注意，Vite仅在`.ts`文件上执行转滤操作，并且**不**执行类型检查。它假设类型检查是由您的IDE和构建过程负责的。

VITE不作为转换过程的一部分进行类型检查的原因是，这两个作业的工作方式不同。转移可以按照文件为基础，并与Vite的按需编译模型完全一致。相比之下，类型检查需要了解整个模块图。将鞋马类型检查到Vite的转换管道中，不可避免地会损害Vite的速度收益。

Vite的工作是将您的源模块变成一个可以尽快在浏览器中运行的表单。为此，我们建议将静态分析检查与Vite的转换管道分开。该原理适用于其他静态分析检查，例如ESLINT。

- 对于生产构建，除了Vite的构建命令外，您还可以运行`tsc --noEmit` 。

- 在开发过程中，如果您需要超过IDE提示，我们建议在单独的过程中运行`tsc --noEmit --watch` ，或者如果您希望直接在浏览器中报告类型错误，则使用[Vite-Plugin-Checker](/0) 。

VITE使用[Esbuild](/0)将打字稿转换为JavaScript，该标题比Vanilla `tsc`快20〜30倍，HMR更新可以在50ms以下的浏览器中反映出。

使用[仅类型的导入和导出](/0)语法来避免潜在的问题，例如仅类型的导入被错误捆绑在一起，例如:

```ts
import type { T } from 'only/types'
export type { T }
```

### 打字稿编译器选项

`tsconfig.json`中`compilerOptions`以下的某些配置字段需要特别注意。

#### `isolatedModules`

- [打字稿文档](/0)

应该设置为`true` 。

这是因为`esbuild`仅执行没有类型信息的转换，因此它不支持某些功能，例如const枚举和隐式类型仅导入。

您必须在`compilerOptions`以下的`tsconfig.json`下设置0设置`"isolatedModules": true` ，以便TS警告您不适合隔离转递的功能。

如果依赖关系与`"isolatedModules": true`无法正常工作。您可以使用`"skipLibCheck": true`暂时抑制错误，直到将其固定在上游。

#### `useDefineForClassFields`

- [打字稿文档](/0)

如果打字稿目标为`ES2022`或`ESNext` ，默认值将为`true` 。它与[打字稿4.3.2+的行为](/0)一致。
其他打字稿目标默认为`false` 。

`true`是标准的ecmascript运行时行为。

如果您使用的是非常依赖班级字段的库，请谨慎对待图书馆对其的预期用法。
尽管大多数库期望`"useDefineForClassFields": true` ，但如果您的库不支持它，则可以明确设置`useDefineForClassFields`到`false` 。

#### `target`

- [打字稿文档](/0)

Vite忽略了`tsconfig.json`中的`target`值，遵循与`esbuild`相同的行为。

要指定DEV中的目标，可以使用[`esbuild.target`](/0)选项，默认为`esnext` ，以进行最小的转递。在构建中， [`build.target`](/1)选项优先级超过`esbuild.target` ，也可以在需要时设置。

::: warning `useDefineForClassFields`

如果`tsconfig.json`中的`target`不是`ESNext`或`ES2022`或更新，或者没有`tsconfig.json`文件， `useDefineForClassFields`将默认为`false` ，而默认`esbuild.target`值为`esnext` 。它可能会转移到[静态初始化块，](/0)这些块可能在浏览器中不支持。

因此，建议设置`target`到`ESNext`或`ES2022`或更新，或在配置`tsconfig.json`时明确设置`useDefineForClassFields`至`true` 。
:::

#### 其他影响构建结果的编译器选项

- [`extends`](/0)
- [`importsNotUsedAsValues`](/0)
- [`preserveValueImports`](/0)
- [`verbatimModuleSyntax`](/0)
- [`jsx`](/0)
- [`jsxFactory`](/0)
- [`jsxFragmentFactory`](/0)
- [`jsxImportSource`](/0)
- [`experimentalDecorators`](/0)
- [`alwaysStrict`](/0)

::: tip `skipLibCheck`
Vite启动模板默认情况下具有`"skipLibCheck": "true"` ，以避免依赖性依赖性，因为它们可能选择仅支持特定版本和打字稿的配置。您可以在[VUEJS/VUE-CLI＃5688](/0)上了解更多信息。
:::

### 客户类型

Vite的默认类型用于其node.js api。要在VITE应用程序中使用客户端代码的环境，请添加`d.ts`声明文件:

```typescript
///<reference types="vite/client">
```

::: details Using `compilerOptions.types`

另外，您可以在`tsconfig.json`中添加`vite/client`到`compilerOptions.types` :

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client", "some-other-global-lib"]
  }
}
```

请注意，如果指定了[`compilerOptions.types`](/0) ，则仅将这些软件包包含在全局范围中（而不是所有可见的“ @Types”软件包）。

:::

`vite/client`提供以下类型垫片:

- 资产导入（例如导入`.svg`文件）
- [0](/0)的类型在`import.meta.env`
- 在`import.meta.hot`上的[HMR API](/0)类型

::: tip
要覆盖默认打字，请添加一个包含您打字的类型定义文件。然后，在`vite/client`之前添加类型参考。

例如，要使0的默认导入`*.svg` a react组件:

- `vite-env-override.d.ts` （包含您的打字的文件）:
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- 包含对`vite/client`引用的文件:
  ```ts
  ///<reference types="./vite-env-override.d.ts">
  ///<reference types="vite/client">
  ```

:::

## html

HTML文件的[前中心](/0)是Vite项目的前中心，它是您应用程序的入口点，使构建单页和[多页应用程序](/1)变得易于使用。

您的项目根中的任何HTML文件都可以通过其各自目录路径直接访问:

- `<root>/index.html` > `http://localhost:5173/`
- `<root>/about.html` > `http://localhost:5173/about.html`
- `<root>/blog/index.html` > `http://localhost:5173/blog/index.html`

HTML元素（例如`<script id="!">`和`<link id="#">`所引用的资产作为应用程序的一部分进行处理和捆绑。支持元素的完整列表如下:

- `<audio src>`
- `<embed src>`
- `<img id="!">`和`<img id="!"set>`
- `<image src>`
- `<input src>`
- `<link id="!">`和`<link id="#">`
- `<object data>`
- `<script type="module" src>`
- `<source id="!">`和`<source id="!"set>`
- `<track src>`
- `<use id="!">`和`<use xlink:id="!">`
- `<video id="!">`和`<video id="#">`
- `<meta content>`
  - `msapplication-wide310x150logo` `msapplication-square310x310logo` `name` `msapplication-square70x70logo` `msapplication-square150x150logo` `msapplication-tileimage` `twitter:image` `msapplication-config`
  - `og:video:secure_url` `og:audio` `og:audio:secure_url` `property` `og:image:url` `og:image:secure_url` `og:image`或`og:video`

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

要选择在某些元素上的HTML处理，您可以在元素上添加`vite-ignore`属性，在引用外部资产或CDN时，这可能很有用。

## 框架

所有现代框架都保持着与Vite的集成。大多数框架插件都由每个框架团队维护，除了官方VUE和VITE插件外，该插件在Vite org中维护:

- 通过[@vitejs/plugin-vue](/0)提供支持
- VUE JSX通过[@vitejs/plugin-vue-jsx](/0)支持
- 通过[@vitejs/plugin-react的](/0)反应支持
- 通过[@vitejs/plugin-react-swc](/0)使用SWC支持反应

查看[插件指南](/0)以获取更多信息。

## JSX

开箱即用的`.jsx`和`.tsx`文件也受支持。 JSX转卸液也通过[Esbuild](/0)处理。

您选择的框架已经将JSX配置为开箱即用的（例如，Vue用户应使用官方[@vitejs/plugin-vue-jsx](/0)插件，该插件提供了VUE 3特定功能，包括HMR，包括HMR，全局组件解决，指令，指令和插槽）。

如果将JSX与您自己的框架一起使用，则可以使用[`esbuild`选项](/0)配置自定义`jsxFactory`和`jsxFragment` 。例如，提前插件将使用:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

[Esbuild文档](/0)中的更多详细信息。

您可以使用`jsxInject` （仅Vite的选项）注入JSX帮助者，以避免手动导入:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

导入`.css`文件将通过带有HMR支持的`<style>`标签将其内容注入页面。

### `@import`内部和重新饰面

预先配置VITE以支持CSS `@import`通过`postcss-import`内衬里。 CSS `@import`也尊重Vite别名。此外，即使导入的文件在不同目录中，所有CSS `url()`参考文献始终会自动重新重新确保正确性。

还支持`@import` Aliases和URL重新打击SASS和更少的文件（请参阅[CSS预处理程序](/0)）。

### Postcss

如果项目包含有效的PostCSS Config（ [PostCSS-Load-Config](/0)支持的任何格式，例如`postcss.config.js` ），则将自动应用于所有导入的CSS。

请注意，CSS Minification将在PostCSS之后运行，并将使用[`build.cssTarget`](/0)选项。

### CSS模块

任何以`.module.css`结尾的CSS文件都被视为[CSS模块文件](/0)。导入此类文件将返回相应的模块对象:

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
//  - -切 - -
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

CSS模块行为可以通过[`css.modules`选项](/0)进行配置。

如果设置为`css.modules.localsConvention`启用骆驼当地人（例如`localsConvention: 'camelCaseOnly'` ），则也可以使用名为Imports:

```js twoslash
import 'vite/client'
//  - -切 - -
// .apply -color-> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS预处理器

由于Vite仅针对现代浏览器，因此建议使用实现CSSWG草稿（例如[Postcs-nesting](/0) ）和作者普通，未来标准的CSS的本机CSS变量。

也就是说，Vite确实`.stylus` `.scss` `.styl` `.less`内置支持`.sass`无需为它们安装Vite特异性插件，但是必须安装相应的预处理器本身:

```bash
# .scss and .sass
npm add -D sass-embedded # 或萨斯

# 。较少的
npm add -D less

# .Styl和.stylus
npm add -D stylus
```

如果使用vue单文件组件，这也会自动启用`<style id="!">`等。

Vite改善了`@import`解决SASS，更少，因此也尊重Vite别名。此外，还会自动重新重新重新重新使用与根文件不同目录中的导入的SASS/SILLE文件中的相对`url()`参考。

0由于其API限制，因此不支持`@import`个别名和URL重组。

您也可以通过将`.module`预备到文件扩展名来使用CSS模块与预处理器结合使用，例如`style.module.scss` 。

### 将CSS注入到页面中

可以通过`?inline`查询参数关闭CSS内容的自动注入。在这种情况下，处理后的CSS字符串像往常一样返回作为模块的默认导出，但样式未注入页面。

```js twoslash
import 'vite/client'
//  - -切 - -
import './foo.css' // 将注入页面
import otherStyles from './bar.css?inline' // 不会注入
```

::: tip NOTE
自Vite 5以来，删除了CSS文件（例如`import style from './foo.css'` ）的默认值和命名导入。使用`?inline`查询。
:::

### 闪电CSS

从VITE 4.4开始，有针对[闪电CSS的](/0)实验支持。您可以通过在配置文件中添加[`css.transformer: 'lightningcss'`](/1)并安装可选[`lightningcss`](/2)依赖项来选择它:

```bash
npm add -D lightningcss
```

如果启用，CSS文件将通过Lightning CSS而不是PostCS来处理。要配置它，您可以将Lightning CSS选项传递到[`css.lightningcss`](/0)配置选项。

要配置CSS模块，您将使用[`css.lightningcss.cssModules`](/0)而不是[`css.modules`](/1) （它配置了PostCSS处理CSS模块的方式）。

默认情况下，Vite使用Esbuild缩小CSS。 Lightning CSS也可以用作[`build.cssMinify: 'lightningcss'`](/0)的CSS缩影。

::: tip NOTE
使用Lightning CSS时， [CSS预处理](/0)不支持。
:::

## 静态资产

导入静态资源时，将返回其解析后的公共 URL:

```js twoslash
import 'vite/client'
//  - -切 - -
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

特殊查询可以修改资产的加载方式:

```js twoslash
import 'vite/client'
//  - -切 - -
// 明确将资产加载为URL
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
//  - -切 - -
// 负载资产作为字符串
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
//  - -切 - -
// 加载网络工人
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
//  - -切 - -
// 网络工人在构建时间内将base64字符串与Base64字符串相关联
import InlineWorker from './worker.js?worker&inline'
```

[静态资产处理](/0)的更多详细信息。

## JSON

JSON文件可以直接导入 - 还支持命名的导入:

```js twoslash
import 'vite/client'
//  - -切 - -
// 导入整个对象
import json from './example.json'
// 导入一个命名出口的根字段 - 帮助摇摇欲坠！
import { field } from './example.json'
```

## 球导入

Vite支持通过特殊`import.meta.glob`函数从文件系统中导入多个模块:

```js twoslash
import 'vite/client'
//  - -切 - -
const modules = import.meta.glob('./dir/*.js')
```

以上将转换为以下内容:

```js
// Vite制作的代码
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

然后，您可以在`modules`对象的键上迭代以访问相应的模块:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

默认情况下，匹配的文件是通过动态导入的懒惰加载，并将在构建过程中分为单独的块。如果您想直接导入所有模块（例如，依赖于这些模块中的副作用要首先应用），则可以将`{ eager: true }`作为第二个参数传递:

```js twoslash
import 'vite/client'
//  - -切 - -
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

以上将转换为以下内容:

```js
// Vite制作的代码
import * as __vite_glob_0_0 from './dir/bar.js'
import * as __vite_glob_0_1 from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

### 多种模式

例如，第一个参数可以是一个地球群

```js twoslash
import 'vite/client'
//  - -切 - -
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### 负模式

也支持负球模式（前缀为`!` ）。为了忽略结果中的某些文件，您可以在第一个参数中添加不排除网络模式:

```js twoslash
import 'vite/client'
//  - -切 - -
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// Vite制作的代码
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### 命名为导入

只能以`import`选项导入模块的一部分。

```ts twoslash
import 'vite/client'
//  - -切 - -
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// Vite制作的代码
const modules = {
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
}
```

当与`eager`结合使用时，甚至可以为这些模块启用震惊的树木。

```ts twoslash
import 'vite/client'
//  - -切 - -
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// Vite制作的代码:
import { setup as __vite_glob_0_0 } from './dir/bar.js'
import { setup as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

设置`import`到`default`以导入默认导出。

```ts twoslash
import 'vite/client'
//  - -切 - -
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// Vite制作的代码:
import { default as __vite_glob_0_0 } from './dir/bar.js'
import { default as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

#### 自定义查询

您还可以使用`query`选项向导入提供查询，例如，将资产[作为字符串](/0)或[URL](/1)导入:

```ts twoslash
import 'vite/client'
//  - -切 - -
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// Vite制作的代码:
const moduleStrings = {
  './dir/bar.svg': () => import('./dir/bar.svg?raw').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/bar.svg': () => import('./dir/bar.svg?url').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?url').then((m) => m['default']),
}
```

您还可以为其他插件提供自定义查询:

```ts twoslash
import 'vite/client'
//  - -切 - -
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

### 球进口警告

注意:

- 这是仅Vite的功能，不是网络或ES标准。
- 将球模式像导入指定符一样对待:它们必须是相对（以`./` ）或绝对（以`/`为单位，相对于项目根而解决）或一个别名路径（请参见[`resolve.alias`选项](/0)）。
- 全球匹配是通过[`tinyglobby`](/0)完成的。
- 您还应该意识到， `import.meta.glob`中的所有论点都必须**作为文字传递**。您无法使用变量或表达式。

## 动态导入

与[Glob Import](/0)类似，Vite还支持变量的动态导入。

```ts
const module = await import(`./dir/${file}.js`)
```

请注意，变量仅表示文件名一个级别深处。如果`file`是`'foo/bar'` ，则导入将失败。对于更高级的用法，您可以使用[Glob Import](/0)功能。

## WebAssembly

预编译的`.wasm`文件可以用`?init`导入。
默认导出将是一个初始化函数，它返回0: [`WebAssembly.Instance`](/0) :

```js twoslash
import 'vite/client'
//  - -切 - -
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

INIT函数还可以采用一个ImportObject，该函数将其传递至[`WebAssembly.instantiate`](/0)作为其第二个参数:

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
//  - -切 - -
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

在生产构建中，小于`assetInlineLimit`小于1的`.wasm`文件将以base64字符串为单位。否则，它们将被视为[静态资产](/0)并按需获取。

::: tip NOTE
当前不支持[WebAssembly的ES模块集成建议](/0)。
使用[`vite-plugin-wasm`](/0)或其他社区插件来处理此操作。
:::

### 访问WebAssembly模块

如果您需要访问`Module`对象，例如多次实例化，请使用[明确的URL导入](/0)来解决资产，然后执行实例:

```js twoslash
import 'vite/client'
//  - -切 - -
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### 获取node.js中的模块

在SSR中， `fetch()`作为`?init`导入的一部分发生，可能会失败`TypeError: Invalid URL` 。
请参阅[SSR中的问题支持WASM](/0) 。

这是一个替代方案，假设项目基础是当前目录:

```js twoslash
import 'vite/client'
//  - -切 - -
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## 网络工人

### 用构造函数导入

可以使用[`new Worker()`](/0)和[`new SharedWorker()`](/1)导入Web Worker脚本。与工人后缀相比，该语法更靠近标准，这是创建工人的**推荐**方法。

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

工人构造函数还接受选项，可用于创建“模块”工人:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

仅当直接在`new Worker()`声明内使用`new URL()`构造函数时，工人检测才能起作用。此外，所有选项参数必须是静态值（即字符串文字）。

### 用查询后缀导入

可以通过将`?worker`或`?sharedworker`附加到导入请求中直接导入Web Works脚本。默认导出将是一个自定义工人构造函数:

```js twoslash
import 'vite/client'
//  - -切 - -
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Worker脚本还可以使用ESM `import`语句而不是`importScripts()` 。**注意**:在开发过程中，这取决于[浏览器本机支持](/0)，但是对于生产构建，它已被汇编。

默认情况下，工作脚本将在生产构建中发出。如果您想将工人插入base64字符串，请添加`inline`查询:

```js twoslash
import 'vite/client'
//  - -切 - -
import MyWorker from './worker?worker&inline'
```

如果您想将工作人员检索为URL，请添加`url`查询:

```js twoslash
import 'vite/client'
//  - -切 - -
import MyWorker from './worker?worker&url'
```

有关配置所有工人捆绑的详细信息，请参见[工作选择](/0)。

## 内容安全策略（CSP）

要部署CSP，由于Vite的内部设备，必须设置某些指令或配置。

### [`'nonce-{RANDOM}'`](/0)

设置[`html.cspNonce`](/0)时，Vite将指定值的Nonce属性添加到任何`<script>`和`<style>`标签中，以及用于样式表和模块预加载的`<link>`标签。此外，设置此选项时，Vite将注入元标签（ `<meta id="!">` ）。

Vite在DEV和构建后必要时，将使用具有`property="csp-nonce"`的元标记的NONCE值。

:::warning
确保您用每个请求的唯一价值代替占位符。这对于防止绕过资源策略很重要，否则可以轻松完成。
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

默认情况下，在构建过程中，Vite将小资产作为数据URIS嵌入。允许`data:`用于[`font-src`](/1)指令（例如[`img-src`](/0) ），或者必须通过设置[`build.assetsInlineLimit: 0`](/2)禁用它。

:::warning
请勿允许`data:` for [`script-src`](/0) 。它将允许注入任意脚本。
:::

## 建立优化

> 下面列出的功能将自动应用于构建过程的一部分，除非要禁用它们，否则无需明确配置。

### CSS代码拆分

Vite会自动提取模块在异步块中使用的CSS，并为其生成单独的文件。加载关联的异步块时，CSS文件会通过`<link>`标签自动加载，并且保证仅在加载CSS之后才能评估异步块以避免使用[FOUC](/0) 。

如果您希望将所有CSS提取到一个文件中，则可以通过设置[`build.cssCodeSplit`](/0)到`false`禁用CSS代码分裂。

### 预付指令生成

Vite自动生成了`<link id="!">`指令，用于入口块及其在内置HTML中的直接导入。

### 异步块加载优化

在现实世界应用中，汇总通常会生成“常见”块 - 在两个或多个其他块之间共享的代码。结合动态进口，具有以下情况很普遍:

<script setup>
import graphSvg from '../../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

在非优化方案中，当进口异步块`A`时，浏览器将不得不请求并解析`A`然后才能确定它也需要常见的块`C` 。这导致了一个额外的网络往返:

```
Entry ---> A ---> C
```

VITE会使用预加载步骤自动重写代码 - 分解动态导入调用，以便在请求`A`时**并行**获取`C` :

```
Entry ---> (A + C)
```

`C`可能会进一步进口，这将在未优化的情况下导致更多的往返。 Vite的优化将追踪所有直接导入物，以完全消除往返，而不管进口深度如何。
