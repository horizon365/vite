# SSR 选项

除非特别指出，本节中的选项将同时应用于开发和构建。

## ssr.external

- **类型:** `字符串[] | 是的
- **相关:** [SSR 外部依赖](/en/guide/ssr#ssr-externals)

将给定的依赖项及其传递依赖项进行外部化，以便用于 SSR。默认情况下，除了链接的依赖项(用于 HMR)外，所有依赖项都会被外部化。如果您希望将链接的依赖项也外部化，可以将该依赖项的名称传递给此选项。

如果设置为 `true`，则所有依赖项，包括链接的依赖项，都会被外部化。

请注意，显式列出的依赖项(使用 `string[]` 类型)将始终优先于 `ssr.noExternal`(使用任何类型)中列出的依赖项。

## ssr.noExternal

- **类型:** `字符串 | REGEXP | (细绳 | REGEXP)[] | 是的
- **相关:** [SSR 外部依赖](/en/guide/ssr#ssr-externals)

防止列出的依赖项在 SSR 中被外部化，这些依赖项将在构建时被捆绑。默认情况下，只有链接的依赖项不会被外部化(用于 HMR)。如果您希望将链接的依赖项外部化，可以将该依赖项的名称传递给 `ssr.external` 选项。

如果设置为 `true`，则没有任何依赖项会被外部化。但是，在 `ssr.external`(使用 `string[]` 类型)中明确列出的依赖项可以优先考虑并仍然被外部化。如果设置了 `ssr.target: 'node'`，则 Node.js 内置模块也会默认被外部化。

请注意，如果同时配置了 `ssr.noExternal: true` 和 `ssr.external: true`，则 `ssr.noExternal` 优先，没有任何依赖项会被外部化。

## ssr.target

- **类型:** `'节点' | 'Webworker'
- **默认值:** `node`

SSR 服务器的构建目标。

## ssr.resolve.conditions

- **类型:** `string[]`
- **默认值:** `['模块'，'node'，'开发|生产'] ` (`默认情况下`) (`['模块'，'浏览器'，“开发”|生产']` (`defaultClientConditions`) for ` ssr.target ==='webworker'`)
- **相关:** [解析条件](./shared-options.md#resolve-conditions)

这些条件用于插件管道中，仅影响SSR构建过程中的非外部化依赖。使用 `ssr.resolve.externalConditions` 来影响外部化导入。

## ssr.resolve.externalConditions

- **类型:** `string[]`
- **默认值:** `['node']`

在SSR导入(包括 `ssrLoadModule`)外部直接依赖(由 Vite 导入的外部依赖)时使用的条件。

:::tip

使用此选项时，请确保在dev中以相同的值和构建中的相同值运行[`--conditions`](https://nodejs.org/docs/latest/api/cli.html#-c-condition---conditionscondition) ，以获得一致的行为。

例如，当设置 `['node', 'custom']` 时，您应该在开发中运行 `NODE_OPTIONS='--conditions custom' vite`，在构建后运行 `NODE_OPTIONS="--conditions custom" node ./dist/server.js`。

:::

### ssr.resolve.mainFields

- **类型:** `string[]`
- **默认值:** `['module', 'jsnext:main', 'jsnext']`

在解析包的入口点时尝试的 `package.json` 中的字段列表。请注意，这比从 `exports` 字段解析的条件导出具有更低的优先级:如果从 `exports` 成功解析了一个入口点，则主字段将被忽略。此设置仅影响非外部化依赖。
