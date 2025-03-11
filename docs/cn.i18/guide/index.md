# 入门

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## 概述

vite（“快速”的法语单词，发音为`/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button> ，例如“ Veet”）是一种构建工具，旨在为现代网络项目提供更快，更精美的开发体验。它由两个主要部分组成:

- 提供与[本机ES模块](/1)相比，提供[丰富功能增强功能的](/0)开发服务器，例如极快的[热模块更换（HMR）](/2) 。

- 将您的代码与[汇总](/0)捆绑在一起的构建命令，并预先配置，以输出高度优化的静态资产进行生产。

Vite是自以为是的，并带有明智的默认设置。阅读[功能指南](/0)中的可能性。通过[插件](/1)可以支持框架或与其他工具集成。 [“配置”部分](/2)说明了如何在需要的情况下将Vite适应您的项目。

Vite也可以通过其[插件API](/0)和[JavaScript API](/1)高度扩展，并具有完整的打字支持。

您可以在[“ Why Vite”](/0)部分中了解有关该项目背后的基本原理的更多信息。

## 浏览器支持

在开发过程中，Vite将[`esnext`设置为转换目标](/0)，因为我们假设使用了现代浏览器，并且它支持所有最新的JavaScript和CSS功能。这样可以防止语法降低，让Vite服务模块尽可能接近原始源代码。

对于生产构建，默认情况下，Vite目标是支持现代JavaScript的浏览器，例如[本机ES模块](/0)，[本机ESM动态导入](/1)， [`import.meta`](/2) ，[无效的合并](/3)和[Bigint](/4) 。可以通过官方[@vitejs/插件 - 胶囊](/5)来支持传统浏览器。有关更多详细信息，请参阅该[建筑物以获取生产](/6)部分。

## 在线尝试VITE

您可以在[Stackblitz](/0)上在线尝试VITE。它直接在浏览器中运行基于Vite的构建设置，因此它几乎与本地设置相同，但不需要在计算机上安装任何内容。您可以导航到`vite.new/{template}`以选择要使用的框架。

支持的模板预设是:

|   JavaScript   |      打字稿      |
| :------------: | :--------------: |
|   [香草](/0)   |  [香草-TS](/0)   |
|   [Vue](/0)    |   [VUE-TS](/0)   |
|   [反应](/0)   |  [React-Ts](/0)  |
| [预先反应](/0) | [preeact-ts](/0) |
|   [点燃](/0)   |   [lit-ts](/0)   |
|   [苗条](/0)   | [Svelte-Ts](/0)  |
|  [坚硬的](/0)  |   [实心TS](/0)   |
|   [Qwik](/0)   |  [QWIK-TS](/0)   |

## 脚手架您的第一个Vite项目

::: tip Compatibility Note
Vite需要[Node.js](/0)版本18+或20+。但是，某些模板需要更高的node.js版本才能正常工作，如果您的软件包管理器警告它，请升级。
:::

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

然后按照提示！

您还可以直接指定要通过其他命令行选项使用的项目名称和模板。例如，要脚手架vite + vue项目，请运行:

::: code-group

```bash [npm]
# NPM 7+，需要额外的双键:
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

有关每个受支持的模板的更多详细信息`preact-ts`请参见[创建](/0): `vanilla` `lit` `react-swc` `react-ts` `react-swc-ts` `preact` b， `lit-ts` ， `svelte` ， `vanilla-ts` `vue` `react` `vue-ts` `solid` ， `solid-ts` `qwik` `qwik-ts` `svelte-ts`

您可以将`.`用于项目名称进行当前目录中的脚手架。

## 社区模板

Create-Vite是一种工具，可以快速从基本模板开始用于流行框架的项目。查看包括其他工具或针对不同框架的[社区维护模板](/0)的真棒Vite。

对于`https://github.com/user/project`处的模板，您可以使用`https://github.stackblitz.com/user/project`在线尝试（在项目的URL `github`后添加`.stackblitz` ）。

您还可以使用[Degit](/0)等工具用其中一个模板来脚克式项目。假设该项目在GitHub上并使用`main`作为默认分支，则可以使用以下方式创建本地副本:

```bash
npx degit user/project#主要的我的项目
cd my-project

npm install
npm run dev
```

## 手动安装

在您`vite`项目中，您可以使用:

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

并创建一个这样的`index.html`文件:

```html
<p>Hello Vite!</p>
```

然后在您的终端中运行适当的CLI命令:

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

:::

`index.html`将在`http://localhost:5173`上提供。

## `index.html`和项目根

您可能注意到的一件事是，在一个Vite项目中， `index.html`是前中央和中央，而不是被藏在`public`中。这是有意的:开发期间Vite是服务器，而`index.html`是您应用程序的切入点。

Vite将`index.html`视为源代码和模块图的一部分。它解决了`<script id="!">`引用您的JavaScript源代码的1。即使通过`<link id="$">`引用的内联`<script id="#">`和CSS也享受特定于Vite的功能。此外， `index.html`内部的URL会自动重新固定，因此不需要`%PUBLIC_URL%`占位符。

与静态HTTP服务器类似，Vite具有您文件提供的“根目录”的概念。您将在其余文档中看到它被称为`<root>` 。源代码中的绝对URL将使用项目根作为基础解决，因此您可以像使用普通的静态文件服务器一样编写代码（除了更强大的方式！）。 Vite还能够处理依赖性的依赖项，这些依赖项可以解决根外文件系统位置，这即使在基于MonorePo的设置中也可以使用。

Vite还支持具有多个`.html`入口点的[多页应用程序](/0)。

#### 指定替代根

运行`vite`使用当前工作目录作为root启动DEV服务器。您可以用`vite serve some/sub/dir`指定替代根。
请注意，VITE还将在项目根中解决[其配置文件（IE `vite.config.js` ）](/0) ，因此，如果更改了根，则需要移动它。

## 命令行接口

在安装Vite的项目中，您可以在NPM脚本中使用`vite`二进制文件，也可以使用`npx vite`直接运行。这是一个脚手架Vite项目中的默认NPM脚本:

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

您可以指定其他CLI选项，例如`--port`或`--open` 。有关CLI选项的完整列表，请在项目中运行`npx vite --help` 。

了解有关[命令行接口的](/0)更多信息

## 使用未发行的提交

如果您迫不及待地想要一个新版本来测试最新功能，则可以使用https://pkg.pr.new:Vite的特定提交:

::: code-group

```bash [npm]
$ npm install -D https://pkg.pr.new/vite@SHA
```

```bash [Yarn]
$ yarn add -D https://pkg.pr.new/vite@SHA
```

```bash [pnpm]
$ pnpm add -D https://pkg.pr.new/vite@SHA
```

```bash [Bun]
$ bun add -D https://pkg.pr.new/vite@SHA
```

:::

用[Vite的任何提交SHA](/0)替换`SHA` 。请注意，只有在上个月内提交，随着较旧的提交版本被清除。

另外，您也可以将[Vite Repo](/0)克隆到本地计算机，然后自己构建和链接它（需要[PNPM](/1) ）:

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # 在此步骤中使用您首选的软件包管理器
```

然后转到您的基于Vite的项目并运行`pnpm link --global vite` （或您用来在全球链接`vite`软件包管理器）。现在，重新启动开发服务器以在出血边缘上行驶！

::: tip Dependencies using Vite
为了替换依赖项使用的VITE版本，您应该使用[NPM替代](/0)或[PNPM替代版本](/1)。
:::

## 社区

如果您有疑问或需要帮助，请在[Discord](/0)和[Github讨论](/1)中与社区联系。
