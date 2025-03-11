---
title: Vite 5.0出了！
author:
  name: The Vite Team
date: 2023-11-16
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Announcing Vite 5
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite5.png
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite5
  - - meta
    - property: og:description
      content: Vite 5 Release Announcement
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vite 5.0出了！

_2023年11月16日_

![Vite 5公告封面图像](/0)

Vite 4大约一年前[发布](/0)，它是生态系统的坚实基础。随着项目不断建立共享的基础设施，NPM下载量从250万美元跃升至750万。框架继续进行创新，在[Astro](/1) ， [Nuxt](/2) ， [Sveltekit](/3) ， [Solid Start](/4) ， [Qwik City](/5)的顶部，在其他人之间，我们看到了新的框架加入并使生态系统变得更强大。 [Redwoodjs](/6)和[Remix](/7)切换到Vite为在React生态系统中进一步采用的道路铺平了道路。[维斯特](/8)的增长速度比Vite更快。它的团队一直在努力工作，并将很快[发布Vitest 1.0](/9) 。 Vite与其他工具（例如[Storybook](/10) ， [NX](/11)和[剧作家）](/12)一起使用的故事不断改进，环境也是如此，Vite Dev在[DeNo](/13)和[Bun](/14)中都可以使用。

一个月前，我们由[Stackblitz](/1)主持的第二版[ViteConf](/0) 。像去年一样，生态系统中的大多数项目都聚集在一起分享想法并建立联系以不断扩大公地。我们还看到新作品补充了诸如[Volar](/2)和[Nitro之](/3)类的Meta-Framework工具带。汇总团队在同一天发布了[汇总4](/4) ，这是卢卡斯（Lukas）去年开始的传统。

六个月前，Vite 4.3[发行了](/0)。该版本大大提高了开发服务器的性能。但是，仍然有足够的改进空间。在ViteConf， [Evan您揭示了Vite在Rolldown上工作的长期计划](/1)，Rolldown是与兼容API的Rust-Prolp。一旦准备就绪，我们打算将其用于Vite Core来承担汇总和Esbuild的任务。这将意味着增强构建性能（随着我们将Vite本身的出色部分移动到生锈），并大大减少开发人员和构建之间的不一致之处。 Rolldown目前处于早期阶段，该团队正准备在年底之前开放代码库。敬请关注！

今天，我们在Vite的道路上标记了另一个大里程碑。 VITE[团队](/0)，[贡献者](/1)和生态系统合作伙伴很高兴宣布发行Vite5。Vite现在使用的是[Rollup 4](/2) ，这已经代表了构建性能的巨大提高。而且还有一些新的选项可以改善您的开发服务器性能配置文件。

Vite 5专注于清理API（删除不弃用的功能），并简化了几个功能结束了长期存在的问题，例如切换`define`以使用适当的AST替代品而不是Regexes。我们还继续采取步骤来实现未来的Vite（现在需要Node.js 18+，并且[CJS节点API已弃用](/0)）。

快速链接:

- [文档](/0)
- [迁移指南](/0)
- [ChangElog](/0)

其他语言的文档:

- [简体中文](/0)
- [日本语](/0)
- [Español](/0)
- [葡萄牙](/0)
- [한국어](/0)
- [德意志](/0)（新翻译！）

如果您是Vite的新手，我们建议您先阅读[入门](/0)和[指南](/1)。

我们感谢[Vite Core的850多个贡献者](/0)，以及Vite插件，集成，工具和翻译的维护人员和贡献者，这些插件帮助我们到达了这里。我们鼓励您参与其中，并继续与我们一起改善Vite。您可以在我们的[贡献指南](/1)中了解更多信息。首先，我们建议[您进行分类问题](/2)，[审查PR](/3) ，根据开放问题发送失败的测试PR，并帮助其他人进行[讨论](/4)和Vite Land的[帮助论坛](/5)。您将在此过程中学到很多东西，并为该项目提供进一步的贡献。如果您有疑问，请加入我们的[Discord社区](/6)，并在[#Contributing频道](/7)上打招呼。

要保持最新状态，请在[X](/0)或[Mastodon](/1)上关注我们。

## 快速开始使用Vite 5

使用`pnpm create vite`用您首选的框架脚手架Vite项目，或在线打开一个启动模板，使用Vite 5使用[Vite.new](/0)播放。您还可以运行`pnpm create vite-extra`以从其他框架和运行时（Solid，DeNo，SSR和Library启动器）访问模板。当您在`Others`选项下运行`create vite`时，也可以使用`create vite-extra`模板。

请注意，Vite入门模板旨在用作操场，以通过不同的框架测试VITE。在构建下一个项目时，我们建议您与每个框架推荐的初学者联系。现在，一些框架也将`create vite`重定向到他们的开头（Vue为`create-vue`和`Nuxt 3` ，而Svelte则为`SvelteKit` ）。

## node.js支持

Vite不再支持Node.js 14 / 16/17/19，它达到了EOL。现在需要Node.js 18 / 20+。

## 表现

除了Rollup 4的构建性能改进外，还有一项新指南，可帮助您在[https://vite.dev/guide/performance](/0)上识别和解决常见的性能问题。

Vite 5还介绍了[Server.Warmup](/0) ，这是一项新功能，可改善启动时间。它使您可以定义一个模块列表，该模块应在服务器启动后立即预先转换。使用[`--open`或`server.open`](/1)时，Vite还将自动为您的应用程序的入口点或所提供的URL热身。

## 主要变化

- [VITE现在由汇总提供动力4](/0)
- [CJS节点API已弃用](/0)
- [返工`define`和`import.meta.env.*`替换策略](/0)
- [SSR外部化模块值现在与生产匹配](/0)
- [`worker.plugins`现在是一个函数](/0)
- [允许包含`.`的路径到index.html](/0)
- [对齐开发和预览HTML服务行为](/0)
- [默认情况下，清单文件现在在`.vite`目录中生成](/0)
- [CLI快捷方式需要额外的`Enter`按下](/0)
- [更新`experimentalDecorators`和`useDefineForClassFields`打字稿行为](/0)
- [删除`--https`标志和`https: true`](/0)
- [删除`resolvePackageEntry`和`resolvePackageData` API](/0)
- [删除先前弃用的API](/0)
- [阅读有关影响插件和工具作者的高级更改的更多信息](/0)

## 迁移到Vite 5

我们已经与生态系统合作伙伴合作，以确保对这一新专业的平稳迁移。再次， [Vite-Ecosystem-CI](/0)对于帮助我们进行大胆的更改至关重要，同时避免回归。我们很高兴看到其他生态系统采用类似的计划来改善其项目与下游维护者之间的协作。

对于大多数项目，Vite 5的更新应直接向前。但是，我们建议在升级之前审查[详细的迁移指南](/0)。

在[Vite 5 ChangElog](/0)上可以找到低水平的细分，其中包括Vite Core的完整列表。

## 致谢

Vite 5是我们的贡献者，下游维护者，插件作者和[Vite团队](/0)长时间工作的结果。向[比约恩·卢（Bjorn Lu）](/1)大声喊叫，以领导该专业的发行过程。

我们也感谢个人和公司赞助Vite Development。 [Stackblitz](/0) ， [Nuxt Labs](/1)和[Astro](/2)继续通过雇用Vite团队成员来投资Vite。在[Vite的Github赞助商](/3)， [Vite的开放集体](/4)和[Evan您的Github赞助商](/5)上向赞助商大喊大叫。特别提到[混音](/6)是成为金牌赞助商并在切换到Vite后贡献的。
