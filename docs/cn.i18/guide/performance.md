# 表现

尽管Vite默认情况下是快速的，但随着项目需求的增长，性能问题可能会蔓延。本指南旨在帮助您识别和解决常见的绩效问题，例如:

- 慢速服务器启动
- 缓慢的页面加载
- 缓慢的构建

## 查看您的浏览器设置

一些浏览器扩展可能会干扰请求，并减慢启动时间和重新加载时间，尤其是在使用浏览器开发工具时。我们建议在这些情况下使用Vite的Dev Server时，创建一个无开发的配置文件，或切换到隐身模式。隐身模式也应比没有扩展的常规轮廓要快。

Vite Dev Server对预捆绑依赖项进行了艰苦的缓存，并为源代码实现了Fast 304响应。在打开浏览器开发工具时禁用缓存可能会对启动和全页重新加载时间产生重大影响。请检查使用Vite服务器时未启用“禁用缓存”。

## 审核配置的Vite插件

Vite的内部和官方插件经过优化，可以在提供与更广泛的生态系统的兼容性的同时，进行最少的工作。例如，代码转换使用DEV中的正则态度，但在构建中进行完整的解析以确保正确性。

但是，社区插件的性能超出了Vite的控制，这可能会影响开发人员的体验。以下是使用其他Vite插件时可以注意的几件事:

1. 仅在某些情况下使用的大依赖项应动态导入以减少node.js启动时间。示例重构: [Vite-Plugin-React＃212](/0)和[Vite-Plugin-PWA＃224](/1) 。

2. `buildStart`和`configResolved` `config`不应长时间进行漫长而广泛的操作。这些挂钩在开发服务器启动期间正在等待，这会延迟您可以访问浏览器中的站点时。

3. `resolveId`和`transform`钩可能会导致某些文件`load`加载比其他文件慢。虽然有时是不可避免的，但仍然值得检查可能的优化领域。例如，在进行完整转换之前，检查`code`是否包含特定关键字，或者`id`匹配特定的扩展名。

   转换文件所需的时间越长，在将站点加载到浏览器中时，瀑布的请求就越大。

   您可以使用`vite --debug plugin-transform`或[Vite-Plugin-provelsect](/0)进行转换文件所需的持续时间。请注意，由于异步操作倾向于提供不准确的时机，因此您应该将数字视为粗略的估计，但是它仍然应该揭示更昂贵的操作。

::: tip Profiling
您可以运行`vite --profile` ，访问网站，然后在终端中按`p + enter`记录`.cpuprofile` 。然后可以使用[SpeedScope](/0)之类的工具来检查配置文件并识别瓶颈。您还可以与Vite团队[共享个人资料](/1)，以帮助我们确定绩效问题。
:::

## 减少解决操作

经常击中其最坏情况时，解决进口路径可能是一个昂贵的操作。例如，Vite支持使用[`resolve.extensions`](/0)选项的“猜测”导入路径，默认为`['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']` 。

当您尝试用`import './Component'`导入`./Component.jsx` ，Vite将运行以下步骤来解决它:

1. 检查是否存在`./Component` ，否。
2. 检查是否存在`./Component.mjs` ，否。
3. 检查是否存在`./Component.js` ，否。
4. 检查是否存在`./Component.mts` ，否。
5. 检查是否存在`./Component.ts` ，否。
6. 检查`./Component.jsx`存在，是的！

如图所示，总共需要6个文件系统检查来解决导入路径。您拥有的越隐性导入，它加起来可以解决路径的时间越多。

因此，通常最好使用您的导入路径，例如`import './Component.jsx'` 。您也可以将列表缩小为`resolve.extensions`列表以减少一般文件系统检查，但是您必须确保它也适用于`node_modules`中的文件。

如果您是插件作者，请确保在需要时仅致电[`this.resolve`](/0) ，以减少上面的支票数。

::: tip TypeScript
如果您使用的是打字稿，请在`tsconfig.json` 's `compilerOptions`中启用`"moduleResolution": "bundler"`和`"allowImportingTsExtensions": true`以直接在代码中使用`.ts`和`.tsx`扩展。
:::

## 避免桶文件

桶文件是在同一目录中重新删除其他文件的API的文件。例如:

```js [src/utils/index.js]
export * from './color.js'
export * from './dom.js'
export * from './slash.js'
```

当您仅导入单个API时，例如`import { slash } from './utils'` ，该桶文件中的所有文件都需要获取和转换，因为它们可能包含`slash` API，并且还可能包含在初始化时运行的副作用。这意味着您在初始页面加载上加载的文件多于要求，从而导致页面加载较慢。

如果可能的话，您应该避免桶文件并直接导入单个API，例如`import { slash } from './utils/slash.js'` 。有关更多信息，您可以阅读[第8237号问题](/0)。

## 热身经常使用的文件

Vite Dev Server仅根据浏览器的要求转换文件，该文件允许其快速启动，并且仅对二手文件应用转换。如果预计将很快请求某些文件，它也可以预先传输文件。但是，如果某些文件比其他文件需要更长的变换，请求瀑布仍可能发生。例如:

给定一个导入图，其中左文件导入正确的文件:

```
main.js -> BigComponent.vue -> big-utils.js -> large-data.json
```

只有在文件转换后才能知道导入关系。如果`BigComponent.vue`花费一些时间进行变换， `big-utils.js`必须等待转弯，依此类推。即使内置了预先转化，这也会导致内部瀑布。

Vite允许您使用[`server.warmup`](/0)选项热身，例如经常使用的文件，例如`big-utils.js` 。这样， `big-utils.js`将准备好并缓存，以便在要求时立即提供。

您可以找到运行`vite --debug transform`并检查日志经常使用的文件:

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
```

```js [vite.config.js]
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

请注意，您只能在启动时只能热身文件，以免用来不超载Vite Dev服务器。检查[`server.warmup`](/0)选项以获取更多信息。

使用[`--open`或`server.open`](/0)还提供了性能提升，因为Vite将自动为您的应用程序的入口点或所提供的URL热身。

## 使用较少或本地工具

通过增长的代码库快速保持Vite是关于减少源文件（JS/TS/CSS）的工作量。

减少工作的示例:

- 在可能的情况下，使用CSS代替SASS/LINS/手写笔（可以通过Postcs来处理嵌套）
- 不要将SVG转换为UI框架组件（React，Vue等）。将它们作为字符串或URL导入。
- 使用`@vitejs/plugin-react`时，请避免配置Babel选项，因此它会在构建过程中跳过转换（仅使用Esbuild）。

使用本机工具的示例:

使用本机工具通常会带来更大的安装大小，因此在启动新的Vite项目时默认不是默认设置。但是对于更大的应用程序来说，这可能是值得的。

- 试用[LightningCSS](/0)的实验支持
- 使用[`@vitejs/plugin-react-swc`](/0)代替`@vitejs/plugin-react` 。
