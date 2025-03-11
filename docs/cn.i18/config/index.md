---
title: 配置 Vite
---

# 配置 Vite

当从命令行运行 `vite` 时，Vite 会自动尝试解析位于 [项目根](/en/guide/#index-html-and-project-root) 目录内的名为 `vite.config.js` 的配置文件(也支持其他 JS 和 TS 扩展)。

最基本的配置文件如下所示:

```js [vite.config.js]
export default {
  // 配置选项
}
```

```bash
vite --config my-config.js
```

::: tip CONFIG LOADING
默认情况下，Vite 使用 `esbuild` 将配置捆绑到临时文件中并加载。这可能会在导入 TypeScript 文件的单库项目中引起问题。如果您遇到任何问题，可以指定 `--configLoader runner` 以使用 [模块运行器](/en/guide/api-environment-runtimes.html#modulerunner) ，这不会创建临时配置文件，而是会即时转换任何文件。请注意，模块运行器不支持配置文件中的 CJS，但外部 CJS 包应照常工作。

或者，如果您使用的是支持 TypeScript 的环境(例如 `node --experimental-strip-types`)，或者仅编写纯 JavaScript，可以指定 `--configLoader native` 以使用环境的原生运行时来加载配置文件。请注意，配置文件导入的模块更新未被检测到，因此不会自动重启 Vite 服务器。
:::

## 配置智能感知

由于 Vite 配备了 TypeScript 类型定义，您可以利用 IDE 的智能感知功能，并使用 jsdoc 类型提示:

```js
/** @type {import('vite').UserConfig} */
export default {
  // ...
}
```

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite 还支持 TypeScript 配置文件。您可以使用 `vite.config.ts` 并结合上述 `defineConfig` 辅助函数，或者使用 `satisfies` 运算符:

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## 条件配置

如果配置需要根据命令(`serve` 或 `build`)、使用的 [模式](/en/guide/env-and-mode#modes)、是否为 SSR 构建(`isSsrBuild`)或是否预览构建(`isPreview`)来有条件地确定选项，可以导出一个函数:

```js twoslash
import { defineConfig } from 'vite'
//  - -切 - -
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // 开发专用配置
    }
  } else {
    // command === 'build'
    return {
      // 构建专用配置
    }
  }
})
```

重要的是要注意，在Vite的API中， `command`值是DEV期间的`serve` (在CLI [`vite`](/en/guide/cli#vite)和`vite serve` `vite dev`别名)，而在构建生产时为`build` ( [`vite build`](/en/guide/cli#vite-build) )。

## 异步配置

如果配置需要调用异步函数，可以导出一个异步函数。该异步函数也可以通过 `defineConfig` 传递，以提高智能感知支持:

```js twoslash
import { defineConfig } from 'vite'
//  - -切 - -
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // Vite 配置
  }
})
```

## 在配置中使用环境变量

环境变量可以像往常一样从 `process.env` 获取。

请注意，默认情况下，Vite 不会加载 `.env` 文件，因为要加载的文件只能在评估 Vite 配置后确定，例如，`root` 和 `envDir` 选项会影响加载行为。但是，如果需要，您可以使用导出的 `loadEnv` 辅助函数加载特定的 `.env` 文件。

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 env 文件。
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_`前缀。
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
