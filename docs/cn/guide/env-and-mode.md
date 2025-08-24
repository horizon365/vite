# env变量和模式

Vite在特殊`import.meta.env`对象下暴露了某些常数。这些常数被定义为开发过程中的全局变量，并在建造时间静态替换以使树震动。

## 内置常数

在所有情况下，都可以使用一些内置常数:

- **`import.meta.env.MODE`** :{字符串}应用程序正在运行的[模式](/0)。

- **`import.meta.env.BASE_URL`** :{string}基本URL该应用程序正在提供。这是由[`base`配置选项](/0)确定的。

- **`import.meta.env.PROD`** :{boolean}该应用是在生产中运行的（使用`NODE_ENV='production'`运行DEV服务器还是运行使用`NODE_ENV='production'`构建的应用程序）。

- **`import.meta.env.DEV`** :{boolean}应用程序是否在开发中运行（始终与`import.meta.env.PROD`相反）

- **`import.meta.env.SSR`** :{boolean}应用程序是否在[服务器](/0)中运行。

## env变量

Vite自动将ENV变量揭示`import.meta.env`对象下的Env变量。

为了防止意外泄漏到客户端的ENV变量，只有带有`VITE_`前缀的变量暴露于您的Vite加工代码。例如，用于以下ENV变量:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

只有`VITE_SOME_KEY`将其视为`import.meta.env.VITE_SOME_KEY`客户源代码，但`DB_PASSWORD`不会。

```js
console.log(import.meta.env.VITE_SOME_KEY) // “ 123”
console.log(import.meta.env.DB_PASSWORD) // 不明确的
```

如果要自定义ENV变量前缀，请参见[EnvpRefix](/0)选项。

:::tip Env parsing
如上所示， `VITE_SOME_KEY`是一个数字，但解析时返回字符串。布尔值变量也会发生同样的情况。在代码中使用时，请确保将其转换为所需类型。
:::

### `.env`文件

Vite使用[DotEnv](/0)从您的[环境目录](/1)中的以下文件加载其他环境变量:

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

:::tip Env Loading Priorities

特定模式（例如`.env.production` ）的ENV文件将比通用模式更高（例如`.env` ）更高的优先级。

除特定于模式的`.env.[mode]`文件外，Vite将始终加载`.env`和`.env.local` 。在模式特定文件中声明的变量将优先于通用文件中的变量，但是仅在`.env`或`.env.local`中定义的变量仍将在环境中可用。

此外，执行VITE时已经存在的环境变量具有最高优先级，并且不会被`.env`文件覆盖。例如，运行`VITE_SOME_KEY=123 vite build`时。

`.env`文件在VITE的开头加载。更改后重新启动服务器。

:::

此外，Vite使用[Dotenv-Expand](/0)扩展了包装盒中编写的Env文件中写入的变量。要了解有关语法的更多信息，请查看[他们的文档](/1)。

请注意，如果您想在环境价值内使用`$` ，则必须使用`\`逃脱它。

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

:::warning SECURITY NOTES

- `.env.*.local`文件仅本地化，可以包含敏感变量。您应该在`.gitignore`中添加`*.local` ，以避免将它们检查到GIT中。

- 由于暴露于您的Vite源代码的任何变量都将最终出现在您的客户端束中，因此`VITE_*`变量*不应*包含任何敏感信息。

:::

::: details Expanding variables in reverse order

Vite支持以相反顺序扩展变量。
例如，下面的`.env`将评估`VITE_BAR=bar` `VITE_FOO=foobar` 。

```[.env]
VITE_FOO=foo${VITE_BAR}
VITE_BAR=bar
```

这在shell脚本和其他工具等`docker-compose`中不起作用。
也就是说，Vite支持了这种行为，因为很长一段时间以来一直支持`dotenv-expand` ，JavaScript生态系统中的其他工具使用支持此行为的较旧版本。

为了避免互动问题，建议避免依靠这种行为。 Vite将来可能会开始对这种行为发出警告。

:::

## TypeScript的IntelliSense

默认情况下，Vite提供了`import.meta.env`合[`vite/client.d.ts`](/0)中的类型定义。虽然您可以在`.env.[mode]`文件中定义更多自定义的ENV变量，但您可能需要获取带有`VITE_`前缀的用户定义的ENV变量的TypeScript Intellisense。

为了实现这一目标，您可以创建一个`src`中的`vite-env.d.ts`目录，然后按这样的增强`ImportMetaEnv` :

```typescript [vite-env.d.ts]
///<reference types="vite/client">

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 更多的env变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

如果您的代码依赖于浏览器环境（例如[DOM](/0)和[Webworker）](/1)的类型，则可以在`tsconfig.json`中更新[LIB](/2)字段。

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Imports will break type augmentation

如果`ImportMetaEnv`增强不起作用，请确保您在`vite-env.d.ts`中没有任何`import`语句。有关更多信息，请参见[TypeScript文档](/0)。

:::

## html恒定更换

Vite还支持替换HTML文件中的常数。具有特殊`%CONST_NAME%`语法的`import.meta.env`文件中的任何属性都可以使用:

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

如果ENV在`import.meta.env`中不存在，例如`%NON_EXISTENT%` ，它将被忽略和替换，这与JS中的`import.meta.env.NON_EXISTENT`不同，在该JS中被替换为`undefined` 。

鉴于许多框架使用了VITE，因此在有条件等复杂替换方面有意地未经公开。可以使用[现有的Userland插件](/0)或实现[`transformIndexHtml`挂钩](/1)的自定义插件来扩展Vite。

## 模式

默认情况下，Dev Server（ `dev`命令）以`development`模式运行， `build`命令在`production`模式下运行。

这意味着运行`vite build`时，如果有一个，则将从`.env.production`加载env变量:

```[.env.production]
VITE_APP_TITLE=My App
```

在您的应用中，您可以使用`import.meta.env.VITE_APP_TITLE`渲染标题。

在某些情况下，您可能需要以不同的模式运行`vite build`来渲染其他标题。您可以通过传递`--mode`选项标志来覆盖用于命令的默认模式。例如，如果您想为登台模式构建应用程序:

```bash
vite build --mode staging
```

并创建一个`.env.staging`文件:

```[.env.staging]
VITE_APP_TITLE=My App (staging)
```

由于`vite build`默认运行生产构建，您还可以通过使用其他模式和`.env`文件配置来更改此版本并运行开发构建:

```[.env.testing]
NODE_ENV=development
```

### node_env和模式

重要的是要注意， `NODE_ENV` （ `process.env.NODE_ENV` ）和模式是两个不同的概念。以下是不同命令如何影响`NODE_ENV`和模式:

| 命令                                                 | node_env        | 模式            |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

`NODE_ENV`和模式的不同值还反映了其相应的`import.meta.env`属性:

| 命令                   | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| 命令                 | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` in `.env` files

`NODE_ENV=...`可以在命令中以及`.env`文件中设置。如果在`.env.[mode]`文件中指定了`NODE_ENV` ，则该模式可用于控制其值。但是， `NODE_ENV`和模式都作为两个不同的概念。

命令中`NODE_ENV=...`的主要好处是，它允许VITE提早检测值。它还允许您在Vite Config中读取`process.env.NODE_ENV`因为Vite只有在评估配置后才可以加载Env文件。
:::
