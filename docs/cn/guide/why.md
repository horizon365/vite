# 为什么要使用Vite

## 面临的问题

在浏览器支持ES模块之前，开发人员没有原生的机制来以模块化的方式编写JavaScript。这就是我们熟悉“打包”概念的原因:使用工具来爬取、处理和连接我们的源模块，生成可以在浏览器中运行的文件。

随着时间的推移，我们看到了像[webpack](https://webpack.js.org/)、[Rollup](https://rollupjs.org)和[Parcel](https://parceljs.org/)这样的工具，这些工具极大地改善了前端开发人员的开发体验。

然而，随着我们构建越来越复杂的应用程序，我们处理的JavaScript数量也在急剧增加。大型项目包含数千个模块的情况并不少见。我们开始遇到基于JavaScript的工具的性能瓶颈:启动开发服务器通常需要不合理地长时间等待(有时甚至需要几分钟！)，即使使用热模块替换(HMR)，文件编辑也可能需要几秒钟才能在浏览器中反映出来。缓慢的反馈循环会极大地影响开发人员的生产力和幸福感。

Vite旨在通过利用生态系统中的新进展来解决这些问题:浏览器中原生ES模块的可用性，以及用编译成本地语言编写的JavaScript工具的兴起。

### 慢速服务器启动

在冷启动开发服务器时，基于打包器的构建设置必须急切地爬取并构建整个应用程序，然后才能提供服务。

Vite通过首先将应用程序中的模块分为两类:**依赖项**和**源代码**，从而改善了开发服务器的启动时间。

- Vite使用[esbuild](https://esbuild.github.io/) [预打包依赖项](./dep-pre-bundling.md)。esbuild是用Go编写的，预打包依赖项的速度比基于JavaScript的打包器快10-100倍。

- **源代码**通常包含需要转换的非普通JavaScript(例如JSX、CSS或Vue/Svelte组件)，并且会经常编辑。此外，并非所有源代码都需要同时加载(例如，基于路由的代码拆分)。

  Vite通过[原生ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)提供源代码。这实际上是让浏览器接管打包器的部分工作:Vite只需要按需转换和服务源代码，当浏览器请求时。条件动态导入的代码只有在实际使用时才会被处理。

<script setup>
import bundlerSvg from '../../images/bundler.svg?raw'
import esmSvg from '../../images/esm.svg?raw'
</script>
<svg-image :svg="bundlerSvg" />
<svg-image :svg="esmSvg" />

### 缓慢的更新

在基于打包器的构建设置中编辑文件时，重新构建整个包的效率低下是显而易见的:更新速度会随着应用程序的大小线性下降。

在某些捆绑机中，Dev Server在存储器中运行捆绑，因此当文件更改时，它只需要使其模块图的一部分无效，但是它仍然需要重新构造整个捆绑包并重新加载网页。重建捆绑包可能很昂贵，然后重新加载页面吹走了应用程序的当前状态。这就是为什么一些捆绑器支持热模块更换(HMR)的原因:允许模块“热替换”本身而不会影响页面的其余部分。这大大改善了DX - 但是，实际上，我们发现即使HMR更新速度也随着应用程序的大小的增长而大大恶化。

在Vite中，HMR是通过原生ESM进行的。编辑文件时，Vite只需要精确地使编辑模块及其最近的HMR边界之间的链失效(大多数情况下只是模块本身)，这使得HMR更新始终快速，无论应用程序的大小如何。

Vite还利用HTTP头来加速整页重新加载(再次，让浏览器为我们做更多的工作):源代码模块请求通过`304 Not Modified`进行条件请求，依赖项模块请求通过`Cache-Control: max-age=31536000,immutable`进行强缓存，这样它们一旦被缓存就不会再次请求服务器。

一旦你体验了Vite的速度，我们非常怀疑你是否愿意再次忍受打包的开发体验。

## 为什么在生产中打包

尽管原生ESM现在得到了广泛支持，但在生产中使用未打包的ESM仍然效率低下(即使使用HTTP/2)，因为嵌套导入会导致额外的网络往返。为了在生产中获得最佳的加载性能，最好将代码与摇树、懒加载和公共块拆分(以更好地缓存)一起打包。

确保开发服务器和生产构建之间的最佳输出和行为一致性并不容易。这就是为什么Vite附带了一个预配置的[构建命令](./build.md)，该命令开箱即用地包含了许多[性能优化](./features.md#build-optimizations)。

## 为什么不使用esbuild进行打包？

虽然Vite利用esbuild在开发中[预打包某些依赖项](./dep-pre-bundling.md)，但Vite并不使用esbuild作为生产构建的打包器。

Vite当前的插件API与使用`esbuild`作为打包器不兼容。尽管`esbuild`更快，但Vite采用Rollup的灵活插件API和基础设施在很大程度上促成了其在生态系统中的成功。目前，我们认为Rollup在性能与灵活性之间提供了更好的平衡。

Rollup也在进行性能改进，[在v4中将其解析器切换到SWC](https://github.com/rollup/rollup/pull/5073)。并且正在进行一个名为Rolldown的Rollup的Rust端口项目。一旦Rolldown准备就绪，它可以替代Vite中的Rollup和esbuild，显著提高构建性能并消除开发和构建之间的不一致。你可以观看[Evan You的ViteConf 2023主题演讲以了解更多信息](https://youtu.be/hrdwQHoAp0M)。

## Vite与其他未打包构建工具的关系

由Preact团队开发的[WMR](https://github.com/preactjs/wmr)旨在提供类似的功能集。Vite的通用Rollup插件API用于开发和构建，受到了WMR的启发。WMR不再维护。Preact团队现在推荐使用[@preactjs/preset-vite](https://github.com/preactjs/preset-vite)的Vite。

[Snowpack](https://www.snowpack.dev/)也是一个无打包的原生ESM开发服务器，与Vite的范围非常相似。Vite的依赖项预打包也受到了Snowpack v1(现在是[`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall))的启发。Snowpack不再维护。Snowpack团队现在正在开发由Vite驱动的静态站点生成器[Astro](https://astro.build/)。

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/)(以前是`es-dev-server`)是一个很棒的项目，Vite 1.0的基于Koa的服务器设置受到了它的启发。`@web`伞项目积极维护，并包含许多其他优秀的工具，这些工具也可能使Vite用户受益。
