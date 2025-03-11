---
title: Vite 6.0出了！
author:
  name: The Vite Team
date: 2024-11-26
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Announcing Vite 6
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite6.png
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite6
  - - meta
    - property: og:description
      content: Vite 6 Release Announcement
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vite 6.0出了！

_2024年11月26日_

![Vite 6公告封面图像](/0)

今天，我们在Vite的故事中迈出了又一步。 Vite[团队](/0)，[贡献者](/1)和生态系统合作伙伴很高兴宣布发布Vite 6。

这是多年的一年。自一年前发行5次Vite以来，VITE的采用量一直在增长，NPM下载量从750万次下载到1700万。 [Vitest](/0)不仅受到用户的青睐，而且还开始形成自己的生态系统。例如， [Storybook](/1)具有由Vitest提供支持的新测试功能。

新框架还加入了Vite生态系统，包括[Tanstack Start](/0) ， [One](/1) ， [Ember](/2)等。网络框架的创新速度越来越快。您可以查看人们在[Astro](/3) ， [Nuxt](/4) ， [Sveltekit](/5) ， [Solid Start](/6) ， [Qwik City](/7) ， [Redwoodjs](/8) ， [React Router的](/9)改进，列表还在继续。

Vite由OpenAI，Google，Apple，Microsoft，NASA，Shopify，Cloudflare，Gitlab，Reddit，Linear等人使用。两个月前，我们开始了[使用Vite的公司](/0)列表。我们很高兴看到许多开发人员向我们发送PR，将他们的公司添加到列表中。自从Vite采取了第一步以来，我们共同建立的生态系统已经发展到了多少。

![Vite Weekly NPM下载](/0)

## 加快Vite生态系统

上个月，社区聚集在第三版的[ViteConf](/0) ，再次由[Stackblitz](/1)主持。这是最大的Vite会议，并广泛地代表了生态系统的建筑商。除其他公告外，Evan You宣布了[Voidzero](/2) ，该公司致力于为JavaScript生态系统建立开源，高性能和统一的开发工具链。 Voidzero落后于[Rolldown](/3)和[OXC](/4) ，他们的团队正取得了长足的进步，使他们迅速准备好被Vite采用。观看埃文（Evan）的主题演讲，以了解有关维特（Vite）生锈未来的下一步步骤的更多信息。

<YouTubeVideo videoId="EKvvptbTx6k?si=EZ-rFJn4pDW3tUvp" />

[Stackblitz](/0)揭示了[Bolt.New](/1) ，一个混合Claude和WebContainers的混音应用程序，可让您提示，编辑，运行和部署全堆栈应用程序。内特·韦纳（Nate Weiner）宣布了[一个](/2)新的Web和本地的新型Vite-Power React框架。 Storybook展示了他们最新的viteest驱动[测试功能](/3)。还有更多。我们鼓励您观看[所有43场演讲](/4)。演讲者付出了巨大的努力，与我们分享每个项目的工作。

Vite还获得了刷新的着陆页和一个干净的域。您应该更新您的URL，以指向新的[Vite.DEV](/0)域前进。新的设计和实施是由Voidzero由制作网站的同一个人完成的。向[Vicente Rodriguez](/1)和[Simon Le Marchant](/2)大喊大叫。

## 下一个Vite专业在这里

Vite 6是自Vite 2以来最重要的重大版本。我们渴望与生态系统合作，通过新的API来扩展我们的共享共享，并且像往常一样，可以建立更加精致的基础。

快速链接:

- [文档](/0)
- 翻译:[简体中文](/0)，[日本语](/1)， [Español](/2) ， [português](/3) ， [한국어](/4) ， [Deutsch](/5)
- [迁移指南](/0)
- [Github ChangElog](/0)

如果您是Vite的新手，我们建议您首先阅读[入门](/0)和[指南](/1)。

我们要感谢[Vite Core的1K贡献者](/0)以及Vite插件，集成，工具和翻译的维护人员和贡献者，这些插件帮助我们制作了这一新专业。我们邀请您参与其中，并帮助我们改善整个生态系统的VITE。在我们的[贡献指南](/1)中了解更多信息。

首先，我们建议帮助[分类问题](/0)，[审查PR](/1) ，根据开放问题发送失败的测试PR，并在[讨论](/2)和Vite Land的[帮助论坛](/3)中为其他人提供支持。如果您想与我们交谈，请加入我们的[Discord社区](/4)，并在[#Contributing频道](/5)上打招呼。

有关Vite生态系统和Vite Core的最新消息，请在[Bluesky](/0) ， [X](/1)或[Mastodon](/2)上关注我们。

## Vite 6入门

您可以使用`pnpm create vite`快速使用首选框架脚手架Vite应用程序，也可以使用[Vite.new](/0)使用Vite 6在线播放。您还可以运行`pnpm create vite-extra`以从其他框架和运行时（Solid，DeNo，SSR和Library启动器）访问模板。当您在`Others`选项下运行`create vite`时，也可以使用`create vite-extra`模板。

Vite入门模板旨在用作操场，以不同的框架测试VITE。构建下一个项目时，您应该与每个框架推荐的入门者联系。 `create vite`还提供了通过某些框架（ `Remix` `create-vue`和`Analog` `Angular`设置适当启动器`Nuxt 3`快捷方式`SvelteKit`

## node.js支持

Vite 6支持Node.js 18、20和22+，类似于Vite5。Node.js21支持已删除。 Vite Drops Node.js在其[EOL](/0)之后支持较旧版本。 Node.js 18 EOL截至2025年4月底，之后我们可能会发布一个新的专业，以颠簸所需的node.js版本。

## 实验环境API

Vite的新环境API变得越来越灵活。这些新的API将允许框架作者提供更接近生产的开发经验，并使生态系统共享新的构建块。如果您正在建造水疗中心，什么都不会改变；当您将VITE与单个客户端环境一起使用时，一切都像以前一样工作。即使对于自定义SSR应用程序，Vite 6也向后兼容。环境API的主要目标受众是框架作者。

对于好奇的最终用户， [Sapphi](/0)写了[《环境API指南》的精彩介绍](/1)。这是一个开始和理解为什么我们试图使Vite更加灵活的好地方。

如果您是框架作者或Vite插件维护器，并且希望利用新的API，则可以在[环境API指南](/0)中了解更多信息。

我们要感谢所有参与定义和实施新API的人。故事始于Vite 2采用[Rich Harris](/0)和[Sveltekit](/1)团队开创的捆绑的SSR开发计划。 Vite的SSR变换然后解锁了[Anthony Fu](/2)和[Pooya Parsa](/3) ，以创建Vite节点并改善[Nuxt的Dev SSR故事](/4)。安东尼（Anthony）使用vite节点来为[vitest](/5)提供动力，而[弗拉基米尔·谢勒姆（Vladimir Sheremet）](/6)一直在维持维持富含的工作的一部分。在2023年初，弗拉基米尔（Vladimir）开始致力于上游Vite节点到Vite Core，并在一年后以5.1的vite发行了它作为运行时API。生态系统合作伙伴（对Cloudflare团队的特别大喊大叫）的反馈促使我们对Vite的环境进行了更雄心勃勃的重做。您可以在[Patak的ViteConf 24演讲](/7)中了解有关故事的更多信息。

Vite团队中的每个人都参与定义新的API，该API与生态系统中许多项目的反馈共同设计。感谢所有参与其中的人！如果您在Vite上构建框架，插件或工具，我们鼓励您参与其中。新的API是实验性的。我们将与生态系统合作，回顾如何使用新的API并稳定下一个专业。如果您想提出问题或给出反馈，[这里进行了开放的GitHub讨论](/0)。

## 主要变化

- [`resolve.conditions`的默认值](/0)
- [json stringify](/0)
- [HTML元素中资产参考的扩展支持](/0)
- [Postcss-Load-Config](/0)
- [SASS现在默认使用现代API](/0)
- [在库模式下自定义CSS输出文件名](/0)
- [还有更多只能影响少数用户的更改](/0)

还有一个新的[破坏更改](/0)页面，列出了Vite中所有计划，考虑和过去的更改。

## 迁移到Vite 6

对于大多数项目，Vite 6的更新应该很简单，但是我们建议在升级之前审查[详细的迁移指南](/0)。

更改的完整列表是在[Vite 6 ChangElog](/0)中。

## 致谢

Vite 6来自我们的贡献者社区，下游维护者，插件作者和[Vite团队](/0)的长时间工作时间。我们感谢个人和公司赞助Vite开发。 Vite是由[Voidzero](/1)带给您的，与[Stackblitz](/2) ， [Nuxt Labs](/3)和[Astro](/4)合作。 [Vite的Github赞助商](/5)和[Vite的开放集体](/6)向赞助商大喊大叫。
