# 插件

:::tip NOTE
Vite 旨在为常见的 Web 开发模式提供开箱即用的支持。在搜索 Vite 或兼容的 Rollup 插件之前，请查看[功能指南](../guide/features.md)。许多在 Rollup 项目中需要插件的情况已经在 Vite 中得到了覆盖。
:::

## 官方插件

### [@vitejs/plugin-vue](/0)

- 提供 Vue 3 单文件组件支持。

### [@vitejs/plugin-vue-jsx](/0)

-

### [@vitejs/plugin-vue2](/0)

- 提供 Vue 2.7 单文件组件支持。

### [@vitejs/plugin-vue2-jsx](/0)

- 提供 Vue 2.7 JSX 支持(通过[专用的 Babel 变换](https://github.com/vuejs/jsx-vue2/))。

### [@vitejs/plugin-react](/0)

- 使用 esbuild 和 Babel，实现快速的 HMR，具有较小的包体积，并且能够使用 Babel 变换管道。如果没有额外的 Babel 插件，在构建过程中仅使用 esbuild。

### [@vitejs/plugin-react-swc](/0)

- 在开发过程中用 SWC 替换 Babel。在生产构建中，使用插件时使用 SWC+esbuild，否则仅使用 esbuild。对于不需要非标准 React 扩展的大型项目，冷启动和热模块替换(HMR)可以显著加快。

### [@vitejs/插件 - 法律](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- 为生产构建提供对旧版浏览器的支持。

## 社区插件

请查看 [awesome-vite](https://github.com/vitejs/awesome-vite#plugins) - 您也可以提交 PR 以在此处列出您的插件。

## Rollup 插件

[Vite 插件](../guide/api-plugin) 是 Rollup 插件接口的扩展。请参阅[Rollup 插件兼容性部分](../guide/api-plugin#rollup-plugin-compatibility)以获取更多信息。
