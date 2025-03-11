# 工人选项

除非特别指出，本节中的选项将应用于所有开发、构建和预览。

## worker.format

- | 'iife'
- **默认值:** `'iife'`

工人包的输出格式。

## worker.plugins

- |

适用于工人包的 Vite 插件。请注意，[config.plugins](./shared-options#plugins) 仅适用于开发环境中的工人，应在此处配置以用于构建。
该函数应返回新的插件实例，因为它们用于并行的 Rollup 工人构建。因此，在 `config` 钩子中修改 `config.worker` 选项将被忽略。

## worker.rollupOptions

- **类型:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

Rollup 选项用于构建工人包。
