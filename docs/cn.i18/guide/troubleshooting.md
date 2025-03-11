# 故障排除

有关更多信息，请参见[Rollup的故障排除指南](/0)。

如果这里的建议不起作用，请尝试在[GitHub讨论](/0)或[Vite Land Cornord](/1)的`#help`频道中发布问题。

## CJS

### Vite CJS节点API弃用

Vite节点API的CJ构建已弃用，并将在Vite 6中删除。有关更多上下文，请参见[GitHub讨论](/0)。您应该更新文件或框架，以导入VITE的ESM构建。

在基本的Vite项目中，请确保:

1. `vite.config.js`文件内容使用ESM语法。
2. 最接近的`package.json`文件具有`"type": "module"` ，或使用`.mjs` `.mts`名，例如`vite.config.mjs`或`vite.config.mts` 。

对于其他项目，还有一些一般的方法:

- **将ESM配置为默认值，如果需要，请选择进入CJS:**在项目`package.json`中添加`"type": "module"` 。现在，所有`*.js`文件都被解释为ESM，需要使用ESM语法。您可以重命名带有`.cjs`扩展名的文件，以继续使用CJS。
- **将CJ保留为默认值，如果需要，请选择进入ESM:**如果项目`package.json`没有`"type": "module"` ，则将所有`*.js`文件解释为CJ。您可以将带有`.mjs`扩展名的文件重命名以使用ESM。
- **动态导入VITE:**如果您需要继续使用CJ，则可以使用`import('vite')`代替动态导入VITE。这需要您的代码在`async`上下文中编写，但由于Vite的API大多是同步的，因此仍然可以管理。

如果您不确定警告来自何处，则可以使用`VITE_CJS_TRACE=true`标志运行脚本来记录堆栈跟踪:

```bash
VITE_CJS_TRACE=true vite dev
```

如果您想暂时忽略警告，则可以使用`VITE_CJS_IGNORE_WARNING=true`标志运行脚本:

```bash
VITE_CJS_IGNORE_WARNING=true vite dev
```

请注意，PostCSS配置文件不支持ESM + Typescript（ `"type": "module"`中的`.mts`或`.ts` ）。如果您的PostCSS配置具有`.ts` ，并将`"type": "module"`添加到软件包。JSON，您还需要重命名PostCSS配置以使用`.cts` 。

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

您的项目文件夹的路径可能包括`&` ，该路径在Windows上与`npm`不起作用（ [NPM/CMD-SHIM＃45](/0) ）。

您将需要任何一个:

- 切换到另一个软件包管理器`yarn` `pnpm`
- 从项目的路径中删除`&`

## config

### 此软件包仅是ESM

在以`require`导入ESM的软件包时，会发生以下错误。

> 无法解决“ foo”。该软件包仅是ESM，但尝试将其加载为`require` 。

> 错误[err_require_esm]:来自/path/path/to/to/vite.config.js不支持的ES模块/path/path/path/path/path/path/path的requive（）。
> 而是将/path/path/path/to/vite.config.js中的index.js的要求更改为所有commonjs模块中可用的动态import（）。

在node.js <= 22中，默认情况下，ESM文件不能由[`require`](/0)加载。

虽然它可以使用[`--experimental-require-module`](/0)或node.js> 22或在其他运行时工作，但我们仍然建议将您的配置转换为ESM:

- 将`"type": "module"`添加到最近的`package.json`
- 重命名`vite.config.js` / `vite.config.ts`至`vite.config.mjs` / `vite.config.mts`

### `failed to load config from '/path/to/config*/vite.config.js'`

> 无法从'/path/to/config\*/vite.config.js'加载配置
> 启动开发服务器时的错误:
> 错误:构建失败，有1个错误:
> 错误:当有多个输入文件时，必须使用“ OUTDIR”

如果您的项目文件夹的路径包含`*` ，则可能会发生上述错误，而Esbuild将其视为地球。您将需要重命名您的目录才能删除`*` 。

## 开发服务器

### 请求永远停滞不前

如果您使用的是Linux，则文件描述符限制和插入限制可能会导致问题。由于Vite不会捆绑大多数文件，因此浏览器可能会要求许多需要许多文件描述符的文件，这些文件超出了限制。

解决这个问题:

- 将文件描述符限制增加`ulimit`

  ```shell
  # 检查当前限制
  $ ulimit -Sn
  # 更改限制（临时）
  $ ulimit -Sn 10000 # 您可能还需要更改硬限制
  # 重新启动您的浏览器
  ```

- 将以下识别相关限制增加`sysctl`

  ```shell
  # 检查当前限制
  $ sysctl fs.inotify
  # 更改限制（临时）
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

如果以上步骤不起作用，则可以尝试将`DefaultLimitNOFILE=65536`作为未注重配置添加到以下文件:

- /etc/systemd/system.conf
- /etc/systemd/user.conf

对于Ubuntu Linux，您可能需要将行`* - nofile 65536`添加到文件`/etc/security/limits.conf`中，而不是更新SystemD配置文件。

请注意，这些设置持续存在，但**需要重新启动**。

另外，如果服务器在VS代码DevContainer内部运行，则该请求似乎会停滞不前。要解决此问题，请参阅
[开发容器 / VS代码端口转发](/0)。

### 网络请求停止加载

使用自签名的SSL证书时，Chrome忽略了所有缓存指令并重新加载内容。 Vite依靠这些缓存指令。

为了解决问题，请使用受信任的SSL证书。

请参阅:[缓存问题](/0)，[镀铬问题](/1)

#### macos

您可以使用此命令通过CLI安装受信任的证书:

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

或者，通过将其导入到钥匙扣访问应用程序中，并将证书的信任更新以“始终信任”。

### 431请求标题字段太大

当服务器 / WebSocket服务器接收大型HTTP标头时，将删除请求，并显示以下警告。

> 服务器使用状态代码431响应。请参阅[https://vite.dev/guide/troubleshooting.html#\_431-request-header-field-fields-too-large](https://vite.dev/guide/troubleshooting.html#_431-request-header-fields-too-large) 。

这是因为Node.js限制请求标头大小以减轻[CVE-2018-12121](/0) 。

为了避免这种情况，请尝试减少您的请求标题尺寸。例如，如果cookie长，请删除它。或者，您可以使用[`--max-http-header-size`](/0)来更改最大标头大小。

### 开发容器 / VS代码端口转发

如果您在VS代码中使用DEV容器或端口转发功能，则可能需要将[`server.host`](/0)选项设置为配置中的`127.0.0.1`选项以使其正常工作。

这是因为[VS代码中的端口转发功能不支持IPv6](/0) 。

有关更多详细信息，请参见[＃16522](/0) 。

## HMR

### Vite检测文件更改，但HMR不起作用

您可能正在导入具有不同情况的文件。例如，存在`src/foo.js` ，其中`src/bar.js`包含:

```js
import './Foo.js' // 应该是'./foo.js'
```

相关问题: [＃964](/0)

### Vite不会检测到文件更改

如果您使用WSL2运行Vite，Vite将无法在某些情况下观看文件更改。请参阅[`server.watch`选项](/0)。

### 全面重新加载而不是HMR

如果没有通过Vite或插件来处理HMR，则将进行完整的重新加载，因为它是刷新状态的唯一方法。

如果处理HMR，但它在循环依赖性范围内，则还将恢复执行令。要解决这个问题，请尝试打破循环。如果文件更改触发，则可以运行`vite --debug hmr`以记录循环依赖路径。

## 建造

### 构建文件由于CORS错误而行不通

如果使用`file`协议打开HTML文件输出，则脚本不会在以下错误中运行。

> 从原始'null'中访问'file:///foo/bar.js'的脚本已被CORS策略阻止:跨原点请求仅支持协议方案:http，数据，数据，隔离应用，应用程序，chrome-extension，chrome，chrome，chrome，https，https，https，chrome nothted。

> 交叉原始请求被阻止:相同的原始策略删除在file:///foo/bar.js上读取远程资源。 （原因:CORS请求不是HTTP）。

请参阅[原因:CORS请求不是HTTP -HTTP | MDN]（ [https://developer.mozilla.org/en-us/docs/web/http/cors/errors/corsrequestnothttp](/0) ）有关此原因发生的更多信息。

您将需要使用`http`协议访问文件。实现此目标的最简单方法是运行`npx vite preview` 。

## 优化的依赖项

### 链接到本地软件包时过时的预捆扎DEP

用于优化依赖项无效的哈希密钥取决于软件包锁定内容，应用于依赖项的补丁以及影响节点模块捆绑的Vite配置文件中的选项。这意味着Vite将使用功能作为[NPM覆盖的](/0)功能检测依赖性何时被覆盖，并将您对下一个服务器启动的依赖关系重新包裹。当您使用诸如[NPM链接](/1)之类的功能时，Vite不会使依赖关系无效。如果您链接或取消链接依赖关系，则需要在下一个服务器上强迫重新优化，从使用`vite --force`开始。我们建议使用覆盖，现在每个软件包管理器都支持它（另请参见[PNPM覆盖](/2)和[纱线分辨率](/3)）。

## 性能瓶颈

如果您遭受任何应用程序性能瓶颈，导致加载时间缓慢，则可以使用Vite Dev Server或构建应用程序以创建CPU配置文件时启动内置Node.js Inspector:

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite Dev Server
在浏览器中打开应用程序后，只需等待完成加载它，然后返回终端并按`p`键（将停止Node.js Inspector），然后按`q`键停止Dev Server。
:::

Node.js Inspector将在根文件夹中生成`vite-profile-0.cpuprofile` ，转到[https://www.speedscope.app/](https://www.speedscope.app/) ，并使用`BROWSE`按钮上传CPU配置文件以检查结果。

您可以安装[vite-plugin-insporce](/0) ，它使您可以检查Vite插件的中间状态，还可以帮助您确定应用程序中哪些插件或中间Wares是瓶颈。该插件可以在DEV和构建模式中使用。检查读数文件以获取更多详细信息。

## 其他的

### 用于浏览器兼容性的模块外部化

当您在浏览器中使用Node.js模块时，Vite将输出以下警告。

> 模块“ FS”已被外部化，以供浏览器兼容。无法在客户端代码中访问“ fs.ReadFile”。

这是因为Vite不会自动polyfill node.js模块。

我们建议避免使用浏览器代码的Node.js模块以减小捆绑尺寸，尽管您可以手动添加polyfills。如果该模块是从第三方库导入的（该图书馆要在浏览器中使用），建议将问题报告给相应的库。

### 语法错误 /类型错误发生

Vite无法处理，并且不支持仅在非图案模式（马虎模式）上运行的代码。这是因为Vite使用ESM，并且它始终是ESM内部的[严格模式](/0)。

例如，您可能会看到这些错误。

> [错误]与语句有关，由于严格模式，无法与“ ESM”输出格式使用

> TypeError:无法在布尔值'false上创建属性“ foo”

如果这些代码在依赖项内使用，则可以使用[`patch-package`](/0) （或[`yarn patch`](/1)或[`pnpm patch`](/2) ）进行逃生舱口。

### 浏览器扩展

某些浏览器扩展名（例如广告街区）可能会阻止Vite客户端向Vite Dev Server发送请求。在这种情况下，您可能会看到一个没有记录错误的白色屏幕。如果有此问题，请尝试禁用扩展。

### Windows上的交叉驱动链接

如果您在Windows上的项目中有一个交叉驱动器链接，则VITE可能无法正常工作。

交叉驱动器链接的一个示例是:

- 由`subst`命令链接到文件夹的虚拟驱动器
- 通过`mklink`命令（例如YARN Global Cache）到另一个驱动器的符号链接/交界处

相关问题: [＃10802](/0)
