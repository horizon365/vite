---
title: Vite 4.0出了！
author:
  name: The Vite Team
date: 2022-12-09
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Announcing Vite 4
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite4.png
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite4
  - - meta
    - property: og:description
      content: Vite 4 Release Announcement
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vite 4.0出了！

_2022年12月9日_- 查看[Vite 5.0公告](/0)

Vite 3在五个月前[发布](/0)。从那以后，NPM下载每周从100万下载到250万。生态系统也已经成熟，并继续增长。在今年的[Jamstack Conf调查](/1)中，社区中的用法从14％跃升至32％，同时保持高9.7的满意度得分。我们看到了[Astro 1.0](/2) ， [NUXT 3](/3)的稳定发行版以及其他正在创新和协作的Vite驱动框架: [Sveltekit](/4) ，[稳定的Start](/5) ， [Qwik City](/6) 。 Storybook宣布了对Vite的一流支持，这是其[Storybook 7.0](/7)的主要功能之一。 Deno现在[支持Vite](/8) 。 [Vitest的](/9)采用正在爆炸，它将很快代表Vite NPM下载的一半。 NX还在投资生态系统，并[正式支持VITE](/10) 。

[![Vite 4 Ecosystem]（ [/ecosystem-vite4.png）]（https://viteconf.org/2022/replay](/0) ）

作为增长Vite和相关项目的展示，Vite生态系统于10月11日在[Viteconf 2022](/0)聚集。我们看到了主要网络框架的代表，工具讲述了创新与协作的故事。并以象征性的举动，汇总团队选择了确切的一天以发布[汇总3](/1) 。

如今，在我们的生态系统合作伙伴的帮助下，Vite[团队](/0)很高兴宣布发行了Vite 4，该vite 4在构建期间由Rollup 3提供了动力。我们已经与生态系统合作，以确保这项新专业的平稳升级路径。 Vite现在正在使用[汇总3](/1) ，这使我们能够简化Vite的内部资产处理，并有许多改进。请参阅[此处的汇总3发行说明](/2)。

![Vite 4公告封面图像](/0)

快速链接:

- [文档](/0)
- [迁移指南](/0)
- [ChangElog](/0)

其他语言的文档:

- [简体中文](/0)
- [日本语](/0)
- [Español](/0)

如果您最近开始使用Vite，我们建议阅读[为什么Vite指南](/0)并查看[入门](/1)和[功能指南](/2)。如果您想参与其中， [Github](/3)欢迎捐款。近[700名合作者](/4)为Vite做出了贡献。关注[Twitter](/5)和[Mastodon](/6)上的更新，或与我们的[Discord社区](/7)中的其他人合作。

## 开始玩Vite 4

使用`pnpm create vite`用您的首选框架脚手架Vite项目，或在线打开一个启动模板，使用Vite 4使用[Vite.new](/0)播放。

您还可以运行`pnpm create vite-extra`以从其他框架和运行时间（Solid，DeNo，SSR和Library启动器）中访问模板。当您在`Others`选项下运行`create vite`时，也可以使用`create vite-extra`模板。

请注意，Vite入门模板旨在用作操场，以通过不同的框架测试VITE。在构建下一个项目时，我们建议您与每个框架推荐的初学者联系。现在，一些框架也将`create vite`重定向到他们的开头（Vue为`create-vue`和`Nuxt 3` ，而Svelte则为`SvelteKit` ）。

## 开发过程中使用SWC的新React插件

[SWC](/0)现在已成为[Babel](/1)的成熟替代品，尤其是在React项目的背景下。 SWC的React快速刷新实施速度比Babel快得多，对于某些项目来说，这是一种更好的选择。从Vite 4中，有两个插件可用于具有不同权衡的React项目。我们认为，这两种方法都值得支持，并且我们将来将继续探索两个插件的改进。

### @vitejs/plugin-react

[@vitejs/plugin-reactct](/0)是一个使用Esbuild和Babel的插件，可以通过小包装足迹实现快速的HMR，并具有能够使用Babel Transform Transform Pipeline的灵活性。

### @vitejs/plugin-react-swc（新）

[@vitejs/plugin-react-swc](/0)是一个新的插件，在构建过程中使用Esbuild，但在开发过程中用SWC代替了Babel。对于不需要非标准反应扩展的大型项目，冷启动和热模块更换（HMR）的速度可以更快。

## 浏览器兼容性

现代浏览器构建现在默认情况下以`safari14`为目标。这意味着现代构建现在可以使用[`BigInt`](/0) ，而[无效的合并操作员](/1)不再使用。如果您需要支持较旧的浏览器，则可以照常添加[`@vitejs/plugin-legacy`](/2) 。

## 将CSS导入字符串

在Vite 3中，导入`.css`文件的默认导出可能会引入CSS的双重加载。

```ts
import cssString from './global.css'
```

由于将发出`.css`文件，因此可能会发生这种双重加载，并且CSS字符串可能也将由应用程序代码使用，例如，由Framework运行时注入。从Vite 4中， `.css`默认导出[已被贬低](/0)。在这种情况下，需要使用`?inline`查询后缀修饰符，因为这不会发出导入的`.css`样式。

```ts
import stuff from './global.css?inline'
```

在[《迁移指南》](/0)中了解更多信息。

## 环境变量

Vite现在使用`dotenv` 16和`dotenv-expand` 9（以前为`dotenv` 14和`dotenv-expand` 5）。如果您的价值在内，包括`#`或``````` ，则需要用引号包装它们。

```diff
-VITE_APP=ab#cd`ef
+VITE_APP="ab#cd`ef"
```

有关更多详细信息，请参见[`dotenv`](/0)和[`dotenv-expand` ChangElog](/1) 。

## 其他功能

- CLI快捷方式（在DEV期间按`h` ，以查看它们）（ [＃11228](/0) ）
- 预先捆绑依赖项（ [＃10286](/0) ）时对补丁包的支持（＃10286）
- 清洁器构建日志输出（ [＃10895](/0) ），然后切换到`kB` ，以与浏览器开发工具（ [＃10982](/1) ）对齐
- 改进SSR期间的错误消息（ [＃11156](/0) ）

## 包装尺寸降低

Vite关心其足迹，以加快安装的速度，尤其是在游乐场的用例中进行文档和复制品。再一次，这一主要内容带来了Vite的包装尺寸的改进。 Vite 4安装尺寸比Vite 3.2.5（14.1 MB vs 18.3 MB）小23％。

## 升级到Vite Core

[Vite Core](/0)和[Vite-Ecosystem-CI](/1)继续发展，为维护者和合作者提供更好的体验，并确保Vite开发规模以应对生态系统的增长。

### 框架的框架插件

自Vite的第一个版本以来， [`@vitejs/plugin-vue`](/0)和[`@vitejs/plugin-react`](/1)一直是Vite Core Monorepo的一部分。这有助于我们在更改核心和插件一起进行测试和释放时进行更改时获得了密切的反馈循环。使用[Vite-Ecosystem-CI，](/2)我们可以通过在独立存储库上开发的这些插件获得此反馈，因此从Vite 4中，[它们已从Vite Core MonorePo中移出](/3)。这对于Vite的框架 - 不可思议的故事是有意义的，它将允许我们建立独立的团队来维护每个插件。如果您有要报告的错误或要请求的功能，请在向前发展的新存储库中创建问题: [`vitejs/vite-plugin-vue`](/0)和[`vitejs/vite-plugin-react`](/1) 。

### Vite-ecosystem-CI改进

[Vite-ecosystem-CI](/0)通过提供[有关大多数主要下游项目](/1)CI的按需状态报告来扩展Vite的CI。我们每周对Vite的主要分支机构进行三次Vite-Ecosystem-CI运行，并在引入回归之前及时收到报告。 Vite 4很快将与大多数使用VITE的项目兼容，Vite已经准备好具有所需更改的分支机构，并将在接下来的几天内释放它们。我们还能够在评论中使用`/ecosystem-ci run`在PRS上按需运行vite-ecosystem-ci，从而使我们能够在更改命中之前就知道[变化的效果](/2)。

## 致谢

如果没有Vite贡献者的无数工作时间，其中许多是下游项目和插件的维护者以及[Vite团队](/0)的努力，那么Vite 4将是不可能的。我们所有人都共同努力，再次改善Vite的DX，用于使用它的每个框架和应用程序。我们很高兴能够改善这种充满活力的生态系统的共同基础。

We're also thankful to individuals and companies sponsoring the Vite team, and companies investing directly in Vite's future: [@antfu7](/0) 's work on Vite and the ecosystem is part of his job at [Nuxt Labs](/1) , [Astro](/2) is funding [@bluwyoo](/3) 's' Vite core work, and [StackBlitz](/4) hires [@patak_dev](/5) to work full time on Vite.

## 下一步

我们的直接重点将是分列新开放的问题，以避免因可能的回归而破坏。如果您想参与并帮助我们改善Vite，我们建议您从分类问题开始。加入[我们的不和谐](/0)并在`#contributing`频道上伸出手。抛光我们的`#docs`故事，另外`#help` 。随着Vite的采用不断增长，我们需要继续为下一波用户建立一个有益而热情的社区。

有很多开放的方面可以不断提高选择Vite来为框架提供动力并开发应用程序的每个人的DX。开始！
