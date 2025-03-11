# 环境API

:::warning Experimental
环境API是实验性的。我们将在Vite 6期间保持API的稳定性，以便生态系统可以进行实验并在此基础上构建。我们计划在Vite 7中通过可能的破坏性变更来稳定这些新API。

资源:

- [反馈讨论](https://github.com/vitejs/vite/discussions/16358) 我们正在收集有关新API的反馈。
- [环境API PR](https://github.com/vitejs/vite/pull/16471) 在这里实现了新的API并进行了审查。

请与我们分享您的反馈。
:::

## 形式化环境

Vite 6正式化了环境的概念。在Vite 5之前，有两个隐式环境（ `client` ，可选为`ssr` ）。新的环境API允许用户和框架作者根据需要创建尽可能多的环境，以绘制其应用程序在生产中的工作方式。这种新功能需要大量的内部重构，但是在向后兼容方面已大量精力。 Vite 6的最初目标是尽可能顺利地将生态系统移至新专业，从而延迟这些新的实验API，直到足够的用户迁移，框架和插件作者已经验证了新设计。

## 缩小构建与开发人员之间的差距

对于简单的SPA/MPA，环境周围没有新的API暴露于配置。在内部，Vite将把选项应用于`client`环境，但是在配置Vite时不必知道此概念。 Vite 5的配置和行为应在此处无缝工作。

当我们转到典型的服务器端渲染（SSR）应用程序时，我们将有两个环境:

- `client` :在浏览器中运行应用程序。
- `server` :在将页面发送到浏览器之前，在节点（或其他服务器运行时间）中运行该应用程序。

在DEV中，Vite在与Vite Dev Server相同的节点进程中执行服务器代码，并与生产环境近似。但是，服务器也可以在其他JS运行时运行，例如[CloudFlare的Workerd](/0)具有不同的约束。现代应用程序也可以在两个以上的环境中运行，例如浏览器，节点服务器和边缘服务器。 Vite 5不允许正确表示这些环境。

Vite 6允许用户在构建和开发过程中配置其应用程序，以映射其所有环境。在开发过程中，现在可以使用单个Vite Dev服务器在多个不同的环境中同时运行代码。 App源代码仍由Vite Dev Server转换。在共享的HTTP服务器，中间Wares，已解决的配置和插件管道之上，Vite Dev Server现在具有一组独立的DEV环境。每个人都配置为尽可能匹配生产环境，并连接到执行代码的开发运行时（对于Workerd，服务器代码现在可以在本地运行）。在客户端中，浏览器导入并执行代码。在其他环境中，模块跑步者获取并评估转换后的代码。

![Vite环境](/0)

## 环境配置

对于SPA/MPA，该配置看起来与Vite 5相似。在内部，这些选项用于配置`client`环境。

```js
export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
})
```

这很重要，因为我们想保持Vite的平易近人，并避免将新概念暴露在需要之前。

如果应用程序由多种环境组成，则可以使用`environments`配置选项明确配置这些环境。

```js
export default {
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
}
```

如果未明确记录，环境将继承配置的顶级配置选项（例如，新的`server`和`edge`环境将继承`build.sourcemap: false`选项）。少数顶级选项（例如`optimizeDeps` ）仅适用于`client`环境，因为当将其应用于服务器环境中时，它们的运行不佳。 `client`环境也可以从`environments.client`到6进行明确配置，但是我们建议使用顶级选项进行操作，以便添加新环境时客户端配置保持不变。

`EnvironmentOptions`接口揭示了所有环境选项。有环境选项适用于`build`和`dev` ，例如`resolve` 。开发人员有`DevEnvironmentOptions`和`BuildEnvironmentOptions` ，并建立特定的选项（例如`dev.warmup`或`build.outDir` ）。像`optimizeDeps`这样的一些选项仅适用于开发人员，但作为最高水平而不是嵌套在`dev`中以进行向后兼容。

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

`UserConfig`接口从`EnvironmentOptions`接口延伸，允许配置通过`environments`选项配置的其他环境的客户端和默认值。在开发过程中，始终存在`client`名为`ssr`的服务器环境。这允许向后兼容`server.ssrLoadModule(url)`和`server.moduleGraph` 。在构建过程中，始终存在`client`环境，并且只有在明确配置的情况下才存在`ssr`环境（使用`environments.ssr`或向后兼容`build.ssr` ）。一个应用不需要为其SSR环境使用`ssr`名称，例如，它可以命名`server`

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // 其他选项
}
```

请注意，一旦环境API稳定，将弃用`ssr`顶级属性。此选项具有与`environments`相同的角色，但对于默认`ssr`环境，仅允许配置一小部分选项。

## 自定义环境实例

可提供低级配置API，因此运行时提供商可以为其运行时提供适当的默认值。这些环境还可以催生其他过程或线程，以在开发过程中运行模块，以靠近生产环境。

```js
import { customEnvironment } from 'vite-environment-provider'

export default {
  build: {
    outDir: '/dist/client',
  },
  environments: {
    ssr: customEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
  },
}
```

## 向后兼容

当前的Vite Server API尚未弃用，并且与Vite 5兼容。新环境API是实验性的。

`server.moduleGraph`返回客户端和SSR模块图的混合视图。向后兼容的混合模块节点将从其所有方法中返回。用于传递到`handleHotUpdate`模块节点使用相同的方案。

我们不建议您改用环境API。我们的目标是在用户群中有很大一部分在使用Vite 6之前采用Vite 6，因此插件无需维护两个版本。查看未来的破坏变化部分，以获取有关未来折旧和升级路径的信息:

-
- [HMR `hotUpdate` 插件钩](/en/changes/hotupdate-hook)
-
-
- [构建过程中共享插件](/en/changes/shared-plugins-during-build)

## 目标用户

本指南为最终用户提供了有关环境的基本概念。

插件作者具有更一致的API，可与当前环境配置进行交互。如果您要在Vite之上构建，则[环境API插件指南](/0)指南介绍了用于支持多个自定义环境的扩展插件API。

框架可以决定在不同层面上揭露环境。如果您是框架作者，请继续阅读《[环境API框架指南》](/0) ，以了解环境API编程方面。

对于运行时提供商，[环境API Runtimes指南](/0)说明了如何提供框架和用户消费的自定义环境。
