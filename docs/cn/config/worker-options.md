# 工人选项

Unless noted, the options in this section are applied to all dev, build, and preview.

## worker.format

- | 'iife'
- **默认值:** `'iife'`

工人包的输出格式。

## worker.plugins

- |

适用于工人包的 Vite 插件。请注意，[config.plugins](./shared-options#plugins) 仅适用于开发环境中的工人，应在此处配置以用于构建。
该函数应返回新的插件实例，因为它们用于并行的 Rollup 工人构建。因此，在 `config` 钩子中修改 `config.worker` 选项将被忽略。

## worker.rollupOptions

-

Rollup 选项用于构建工人包。
