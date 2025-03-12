# 命令行接口

## 开发服务器

### `vite`

在当前目录中启动Vite Dev Server。 `vite dev`和`vite serve`是`vite`的别名。

#### 用法

```bash
vite [root]
```

#### 选项

| 选项                      |                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | 指定主机名（ `string` ）                                                                                                           |
| `--port <port>`           | 指定端口（ `number` ）                                                                                                             |
| `--open [path]`           | 在启动上打开浏览器（`boolean \| 字符串`）                                                                                          |
| `--cors`                  | 启用CORS（ `boolean` ）                                                                                                            |
| `--strictPort`            | 退出如果指定的端口已经使用（ `boolean` ）                                                                                          |
| `--force`                 | 强迫优化器忽略缓存并重新包裹（ `boolean` ）                                                                                        |
| `-c, --config <file>`     | 使用指定的配置文件（ `string` ）                                                                                                   |
| `--base <path>`           | 公共基本路径（默认值: `/` ）（ `string` ）                                                                                         |
| `-l, --logLevel <level>`  | 信息\| 警告\| 错误 \| 沉默（ `string` ）                                                                                           |
| `--clearScreen`           | 记录时允许/禁用清晰的屏幕（ `boolean` ）                                                                                           |
| `--configLoader <loader>` | 使用`bundle`将配置与Esbuild或`runner` （实验）将其捆绑在一起，或使用本机运行时（默认: `bundle` ）进行加载`native` （实验）（实验） |
| `--profile`               | 启动内置Node.js Inspector（检查[性能瓶颈]/en/guide/troubleshooting#performance-bottlenecks)）                                      |
| `-d, --debug [feat]`      | 显示调试日志（`字符串\| 布尔值                                                                                                     |
| `-f, --filter <filter>`   | 过滤器调试日志（ `string` ）                                                                                                       |
| `-m, --mode <mode>`       | 设置env模式（ `string` ）                                                                                                          |
| `-h, --help`              | 显示可用的CLI选项                                                                                                                  |
| `-v, --version`           | 显示版本号                                                                                                                         |

## 建造

### `vite build`

建造生产。

#### 用法

```bash
vite build [root]
```

#### 选项

| 选项                           |                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `--target <target>`            | 变形目标（默认值: `"modules"` ）（ `string` ）                                                            |
| `--outDir <dir>`               | 输出目录（默认值: `dist` ）（ `string` ）                                                                 |
| `--assetsDir <dir>`            | Outdir下的目录将资产放置在（默认值: `"assets"` ）（ `string` ）中                                         |
| `--assetsInlineLimit <number>` | 静态资产基本64字节中的内联阈值（默认值: `4096` ）（ `number` ）                                           |
| `--ssr [entry]`                | 构建服务器端渲染的指定条目（ `string` ）                                                                  |
| `--sourcemap [output]`         | 构建的输出源地图（默认值: `false` ）（`boolean \| “排队” \| “隐藏”`）                                     |
| `--minify [minifier]`          | 启用/禁用降低，或指定使用的缩影（默认值: `"esbuild"` ）（boolean \ boolean \| “ Terser” \| “ esbuild”``） |
| `--manifest [name]`            | 发射构建清单JSON（布尔\| 字符串`）                                                                        |
| `--ssrManifest [name]`         | 发射ssr sust json（布尔\| 字符串`）                                                                       |
| `--emptyOutDir`                | 当它在根部之外（ `boolean` ）                                                                             |
| `-w, --watch`                  | 当模块在磁盘上更改（ `boolean` ）时重建                                                                   |
| `-c, --config <file>`          | 使用指定的配置文件（ `string` ）                                                                          |
| `--base <path>`                | 公共基本路径（默认值: `/` ）（ `string` ）                                                                |
| `-l, --logLevel <level>`       | 信息\| 警告\| 错误 \| 沉默（ `string` ）                                                                  |
| `--clearScreen`                | 记录时允许/禁用清晰的屏幕（ `boolean` ）                                                                  |
| `--configLoader <loader>`      | 使用`bundle`将配置与Esbuild或`runner` （实验）将其捆绑在一起（默认: `bundle` ）                           |
| `--profile`                    | 启动内置Node.js Inspector（检查[性能瓶颈](/en/guide/troubleshooting#performance-bottlenecks)）            |
| `-d, --debug [feat]`           | 显示调试日志（`字符串\| 布尔值                                                                            |
| `-f, --filter <filter>`        | 过滤器调试日志（ `string` ）                                                                              |
| `-m, --mode <mode>`            | 设置env模式（ `string` ）                                                                                 |
| `-h, --help`                   | 显示可用的CLI选项                                                                                         |
| `--app`                        | 构建所有环境，与`builder: {}` （ `boolean` ，实验）相同                                                   |

## 其他的

### `vite optimize`

束前依赖性。

**弃用**:预捆式过程自动运行，无需调用。

#### 用法

```bash
vite optimize [root]
```

#### 选项

| 选项                      |                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------- |
| `--force`                 | 强迫优化器忽略缓存并重新包裹（ `boolean` ）                                     |
| `-c, --config <file>`     | 使用指定的配置文件（ `string` ）                                                |
| `--base <path>`           | 公共基本路径（默认值: `/` ）（ `string` ）                                      |
| `-l, --logLevel <level>`  | 信息\| 警告\| 错误 \| 沉默（ `string` ）                                        |
| `--clearScreen`           | 记录时允许/禁用清晰的屏幕（ `boolean` ）                                        |
| `--configLoader <loader>` | 使用`bundle`将配置与Esbuild或`runner` （实验）将其捆绑在一起（默认: `bundle` ） |
| `-d, --debug [feat]`      | 显示调试日志（`字符串\| 布尔值                                                  |
| `-f, --filter <filter>`   | 过滤器调试日志（ `string` ）                                                    |
| `-m, --mode <mode>`       | 设置env模式（ `string` ）                                                       |
| `-h, --help`              | 显示可用的CLI选项                                                               |

### `vite preview`

本地预览生产构建。不要将其用作生产服务器，因为它不是为其设计的。

#### 用法

```bash
vite preview [root]
```

#### 选项

| 选项                      |                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------- |
| `--host [host]`           | 指定主机名（ `string` ）                                                        |
| `--port <port>`           | 指定端口（ `number` ）                                                          |
| `--strictPort`            | 退出如果指定的端口已经使用（ `boolean` ）                                       |
| `--open [path]`           | 在启动上打开浏览器（`boolean \| 字符串`）                                       |
| `--outDir <dir>`          | 输出目录（默认值: `dist` ）（ `string` ）                                       |
| `-c, --config <file>`     | 使用指定的配置文件（ `string` ）                                                |
| `--base <path>`           | 公共基本路径（默认值: `/` ）（ `string` ）                                      |
| `-l, --logLevel <level>`  | 信息\| 警告\| 错误 \| 沉默（ `string` ）                                        |
| `--clearScreen`           | 记录时允许/禁用清晰的屏幕（ `boolean` ）                                        |
| `--configLoader <loader>` | 使用`bundle`将配置与Esbuild或`runner` （实验）将其捆绑在一起（默认: `bundle` ） |
| `-d, --debug [feat]`      | 显示调试日志（`字符串\| 布尔值                                                  |
| `-f, --filter <filter>`   | 过滤器调试日志（ `string` ）                                                    |
| `-m, --mode <mode>`       | 设置env模式（ `string` ）                                                       |
| `-h, --help`              | 显示可用的CLI选项                                                               |
