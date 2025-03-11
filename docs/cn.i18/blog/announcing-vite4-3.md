---
title: Vite 4.3 发布了！
author:
  name: The Vite Team
date: 2023-04-20
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Announcing Vite 4.3
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite4-3.png
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite4-3
  - - meta
    - property: og:description
      content: Vite 4.3 Release Announcement
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vite 4.3 发布了！

_2023年4月20日_

![Vite 4.3 公告封面](/og-image-announcing-vite4-3.png)

快速链接:

- 文档: [英语](/en/), [简体中文](https://cn.vite.dev/), [日本语](https://ja.vite.dev/), [Español](https://es.vite.dev/), [Português](https://pt.vite.dev/)
- [Vite 4.3 更新日志](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#430-2023-04-20)

## 性能改进

在这个小版本中，我们专注于提高开发服务器的性能。解析逻辑得到了简化，热路径得到了优化，并实现了更智能的缓存，用于查找 `package.json`、TS 配置文件和已解析的 URL。

您可以阅读 Vite 贡献者在博客文章中详细介绍了 Vite 4.3 的性能改进工作:[我们如何让 Vite 4.3 变得更快 🚀](https://sun0day.github.io/blog/vite/why-vite4_3-is-faster.html)。

与 Vite 4.2 相比，这次冲刺带来了全面的速度提升。

以下是 [sapphi-red/performance-compare](https://github.com/sapphi-red/performance-compare) 测量的性能改进，该工具测试了包含 1000 个 React 组件的应用在冷启动和热启动开发服务器时的启动时间以及根组件和叶组件的 HMR 时间:

| **Vite (Babel)** |  Vite 4.2 | Vite 4.3 |   改进 |
| :--------------- | --------: | -------: | -----: |
| **开发冷启动**   | 17249.0ms | 5132.4ms | -70.2% |
| **开发热启动**   |  6027.8ms | 4536.1ms | -24.7% |
| **根 HMR**       |    46.8ms |   26.7ms | -42.9% |
| **叶 HMR**       |    27.0ms |   12.9ms | -52.2% |

| **Vite (SWC)** |  Vite 4.2 | Vite 4.3 |   改进 |
| :------------- | --------: | -------: | -----: |
| **开发冷启动** | 13552.5ms | 3201.0ms | -76.4% |
| **开发热启动** |  4625.5ms | 2834.4ms | -38.7% |
| **根 HMR**     |    30.5ms |   24.0ms | -21.3% |
| **叶 HMR**     |    16.9ms |   10.0ms | -40.8% |

![Vite 4.3 与 4.2 启动时间对比](/vite4-3-startup-time.png)

![Vite 4.3 与 4.2 HMR 时间对比](/vite4-3-hmr-time.png)

您可以[在此处](https://gist.github.com/sapphi-red/25be97327ee64a3c1dce793444afdf6e)阅读更多关于基准测试的信息。此次性能测试的规格和版本如下:

- CPU: Ryzen 9 5900X，内存: DDR4-3600 32GB，SSD: WD Blue SN550 NVME SSD
- Windows 10 Pro 21H2 19044.2846
- Node.js 18.16.0
- Vite 和 React 插件版本
  - Vite 4.2 (Babel): Vite 4.2.1 + plugin-react 3.1.0
  - Vite 4.3 (Babel): Vite 4.3.0 + plugin-react 4.0.0-beta.1
  - Vite 4.2 (SWC): Vite 4.2.1 + plugin-react-swc 3.2.0
  - Vite 4.3 (SWC): Vite 4.3.0 + plugin-react-swc 3.3.0

早期采用者在测试 Vite 4.3 beta 时报告称，实际应用的开发启动时间提高了 1.5 倍到 2 倍。我们非常希望了解您的应用在这方面的表现。

## 性能分析

我们将继续优化 Vite 的性能。我们正在开发一个官方的 [基准测试工具](https://github.com/vitejs/vite-benchmark)，以便为每个 Pull Request 获取性能指标。

[vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) 现在增加了更多与性能相关的功能，帮助您识别哪些插件或中间件是应用的瓶颈。

使用 `vite --profile`(页面加载后按 `p`)将保存开发服务器启动的 CPU 配置文件。您可以在 [Speedscope](https://www.speedscope.app/) 中打开这些文件，以识别性能问题。您可以在 [讨论](https://github.com/vitejs/vite/discussions) 或 [Vite 的 Discord](https://chat.vite.dev) 中与 Vite 团队分享您的发现。

## 下一步

我们决定今年仅进行一次 Vite 主要版本更新，与 [Node.js 16 的 EOL](https://endoflife.date/nodejs) 保持一致，在 9 月同时放弃对 Node.js 14 和 16 的支持。如果您希望参与其中，我们已启动了 [Vite 5 讨论](https://github.com/vitejs/vite/discussions/12466)，以收集早期反馈。
