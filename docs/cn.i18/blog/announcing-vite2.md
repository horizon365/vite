---
title: 宣布VITE 2.0
author:
  - name: The Vite Team
sidebar: false
date: 2021-02-16
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Announcing Vite 2.0
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite2
  - - meta
    - property: og:description
      content: Vite 2 Release Announcement
---

# 宣布VITE 2.0

_2021年2月16日_- 查看[Vite 3.0公告](/0)

<p id="!">
  <img id="#">
</p>

今天，我们很高兴宣布Vite 2.0的正式发布！

Vite（“快速”的法语单词，发音为`/vit/` ）是一种用于前端Web开发的新型构建工具。想想预配置的开发服务器 +捆绑组合组合，但更苗条，更快。它利用浏览器的[本机ES模块](/0)支持和用诸如[Esbuild](/1)这样的编译到本地语言编写的工具来提供活泼且现代的开发体验。

要了解Vite的速度，请查看[此视频比较](/0)，以在Repl上启动React应用程序。它使用Vite vs. `create-react-app` （CRA）。

如果您以前从未听说过Vite，并且很想了解有关它的更多信息，请查看[项目背后的理由](/0)。如果您对Vite与其他类似工具的不同感兴趣，请查看[比较](/1)。

## 2.0中的新功能

由于我们决定在1.0退出RC之前完全重构内部元素，因此这实际上是Vite的第一个稳定版本。也就是说，Vite 2.0对其先前的化身进行了许多重大改进:

### 框架不可知的核心

Vite的最初想法始于一个[骇客原型，该原型可在本机ESM上使用VUE单文件组件](/0)。 VITE 1是该想法的延续，而HMR最高实施。

Vite 2.0采用了我们在此过程中学到的知识，并通过更强大的内部体系结构从头开始重新设计。现在，它完全是框架不可知论，并且将所有特定于框架的支持都委派给插件。现在有[一些官方模板用于VUE，REACT，PREACT，LIT元素](/0)以及持续的Svelte整合社区努力。

### 新插件格式和API

受[WMR](/0)的启发，新插件系统扩展了Rollup的插件接口，并[与包装盒的许多滚动插件兼容](/1)。插件可以使用与汇总兼容的钩子，并带有其他Vite特异性钩子和属性来调整仅Vite的行为（例如区分开发人员与HMR的构建或自定义处理）。

[程序化API](/0)也得到了极大的改进，以促进在Vite顶部建造的更高级别的工具 /框架。

### Esbuild Powered Dep Predbondling

由于VITE是本机ESM DEV服务器，因此它预先捆绑依赖项以减少浏览器请求并处理ESM转换的COMMON。先前Vite使用汇总进行了此操作，在2.0中，它使用`esbuild` ，从而导致10-100倍的依赖关系预捆绑更快。作为参考，以先前在M1驱动的MacBook Pro上花费了28秒的重量依赖性的测试应用，现在需要约1.5秒。如果您从传统的基于捆绑的设置进行切换，可以期待类似的改进。

### 一流的CSS支持

Vite将CSS视为模块图的一流公民，并支持以下范围:

- **分辨率增强**:通过Vite的解析器增强CSS中的`@import`和`url()`路径，以尊重别名和NPM依赖性。
- **URL重新打击**:无论文件的进口位置如何，都会自动重新列出`url()`路径。
- **CSS代码拆分**:一个代码分解的JS块还发出了相应的CSS文件，该文件会在要求时自动与JS块并行加载。

### 服务器端渲染（SSR）支持

Vite 2.0船并具有[实验性SSR支持](/0)。 Vite提供了在开发过程中在Node.js中有效加载和更新基于ESM的源代码的API（几乎像服务器端HMR），并自动将commonjs兼容的依赖性外部化，以改善开发和SSR构建速度。可以将生产服务器完全与Vite脱钩，并且可以轻松适应同一设置以执行预渲染 / SSG。

Vite SSR作为低级功能提供，我们希望看到更高级别的框架在引擎盖下利用它。

### 选择加入传统浏览器支持

VITE默认情况下，Vite对现代浏览器进行了现代浏览器，但您还可以选择通过官方[@vitejs/plugin-legacy](/0)来支持旧版浏览器。该插件会自动生成双现代/旧式捆绑包，并根据浏览器功能检测提供正确的捆绑包，从而确保在支持它们的现代浏览器中更有效的代码。

## 尝试一下！

这是很多功能，但是从Vite开始很简单！您可以在一分钟内从字面上旋转一个vite-power的应用程序，从以下命令开始（请确保您的node.js> = 12）:

```bash
npm init @vitejs/app
```

然后，查看[指南](/0)，以查看Vite提供的内容。您还可以在[GitHub](/1)上查看源代码，关注[Twitter](/2)上的更新，或在我们的[Discord Chat Server](/3)上与其他Vite用户一起讨论。
