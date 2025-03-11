# 项目理念

## 精益可扩展的核心

Vite 并不打算为每个用户覆盖所有用例。Vite 的目标是支持开箱即用的最常见模式以构建 Web 应用程序，但 [Vite 核心](https://github.com/vitejs/vite) 必须保持精简，拥有较小的 API 表面，以确保项目长期可维护。得益于 [Vite 的基于 Rollup 的插件系统](./api-plugin.md)，这一目标是可能实现的。可以实现为外部插件的功能通常不会添加到 Vite 核心。[vite-plugin-pwa](https://vite-pwa-org.netlify.app/) 是一个很好的例子，展示了 Vite 核心之外可以实现的功能，而且有很多 [维护良好的插件](https://github.com/vitejs/awesome-vite#plugins) 可以满足您的需求。Vite 与 Rollup 项目紧密合作，以确保尽可能多地将插件用于纯 Rollup 和 Vite 项目，并在可能的情况下将所需的扩展推送到插件 API 上游。

## 推动现代网络

Vite 提供了推动编写现代代码的自信功能。例如:

-
-
- Node.js 模块不能在浏览器中使用。

在添加新功能时，遵循这些模式以创建一个面向未来的 API，这可能并不总是与其他构建工具兼容。

## 务实的性能方法

自其 [起源](./why.md) 以来，Vite 一直专注于性能。其开发服务器架构允许 HMR 随着项目规模的扩大而保持快速。Vite 使用 [esbuild](https://esbuild.github.io/) 和 [SWC](https://github.com/vitejs/vite-plugin-react-swc) 等原生工具来执行密集任务，但将其他代码保留在 JS 中，以平衡速度与灵活性。在需要时，框架插件将使用 [Babel](https://babeljs.io/) 编译用户代码。在构建过程中，Vite 当前使用 [Rollup](https://rollupjs.org/)，因为捆绑大小和访问广泛的插件生态系统比原始速度更为重要。Vite 将继续在内部发展，使用新库来改善开发体验，同时保持其 API 稳定。

## 在 Vite 上构建框架

尽管用户可以直接使用Vite，但作为创建框架的工具，Vite更加出色。Vite核心是框架不可知的，但每个UI框架都有经过打磨的插件。它的[JS API](./api-javascript.md)允许应用程序框架作者使用Vite的功能为用户创建量身定制的体验。Vite包括对[SSR原语](./ssr.md)的支持，这些原语通常出现在高级工具中，但对于构建现代Web框架至关重要。Vite插件通过提供在框架之间共享的方法来完善这一生态系统。当与[Ruby](https://vite-ruby.netlify.app/)和[Laravel](https://laravel.com/docs/10.x/vite)等[后端框架](./backend-integration.md)结合使用时，Vite也非常合适。

## 活跃的生态系统

Vite 的发展是框架和插件维护者、用户和 Vite 团队之间的合作。一旦项目采用 Vite，我们鼓励积极参与 Vite 核心的开发。我们与生态系统中的主要项目紧密合作，以尽量减少每次发布的回归，借助 [vite-ecosystem-ci](https://github.com/vitejs/vite-ecosystem-ci) 等工具。它使我们能够在选定的 PR 上使用 Vite 运行主要项目的 CI，并使我们能够清楚地了解生态系统对发布的反应。我们努力在问题影响用户之前修复回归，并允许项目在发布后立即更新到新版本。如果您正在使用 Vite，我们邀请您加入 [Vite 的 Discord](https://chat.vite.dev) 并参与项目。
