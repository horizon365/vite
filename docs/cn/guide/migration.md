# 从V5迁移

## 环境API

作为新的实验[环境API的](/en/guide/api-environment.md)一部分，需要进行大型内部重构。 Vite 6努力避免打破变化，以确保大多数项目可以快速升级到新专业。我们将等到生态系统的很大一部分已移动以稳定并开始建议使用新API。可能有一些边缘情况，但这些情况只能通过框架和工具影响低级使用。我们已经与生态系统中的维护人员合作，以减轻发布之前的差异。如果您发现回归，请[打开问题](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml)。

由于Vite实施的变化，已删除了一些内部API。如果您依靠其中一个，请创建一个[功能请求](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml)。

## Vite运行时API

实验性Vite运行时API演变为模块Runner API，作为新实验[环境API](/en/guide/api-environment)的一部分，以Vite 6发布。鉴于该功能是实验性的，因此删除了Vite 5.1中引入的先前API并不是打破的变化，但是用户需要将其使用到模块跑步者等效的用途，这是迁移到Vite 6的一部分。

## 一般变化

### `resolve.conditions`的默认值

此更改不会影响未配置[`resolve.conditions`](/en/config/shared-options#resolve-conditions) / [`ssr.resolve.conditions`](/1) [`ssr.resolve.externalConditions`](/2)用户。

在Vite 5中， `resolve.conditions`的默认值为`[]` ，内部添加了一些条件。 `ssr.resolve.conditions`的默认值是`resolve.conditions`的值。

从VITE 6中，某些条件不再内部添加，需要包含在配置值中。
内部不再添加的条件

- `resolve.conditions`是`['模块'，'浏览器'，'开发|生产']``
- `ssr.resolve.conditions`是`['模块'，'node'，'开发|生产']``

这些选项的默认值已更新为相应的值，而`ssr.resolve.conditions`不再使用`resolve.conditions`作为默认值。请注意，开发|生产`is a special variable that is replaced with`生产`or`开发`depending on the value of` process.env.node_env `. These default values are exported from ` vite `as` DefaultClientConditions `and` defaultServerConditions`。

如果指定了`resolve.conditions`或`ssr.resolve.conditions`自定义值，则需要对其进行更新以包括新条件。
例如，如果先前指定为`resolve.conditions` `['custom']` ，则需要指定`['custom', ...defaultClientConditions]` 。

### json stringify

在Vite 5中，设置[`json.stringify: true`](/en/config/shared-options#json-stringify)时，禁用[`json.namedExports`](/1) 。

从VITE 6中，即使设置了`json.stringify: true` ，也没有禁用`json.namedExports` ，并尊重该值。如果您想实现先前的行为，则可以设置`json.namedExports: false` 。

Vite 6还引入了一个新的默认值`json.stringify` ，即`'auto'` ，它将仅串制大型JSON文件。要禁用此行为，请集`json.stringify: false` 。

### HTML元素中资产参考的扩展支持

在Vite 5中，只有几个支持的HTML元素能够参考将通过Vite处理和捆绑的资产，例如`<link id="!">` `<img id="#">` 。

Vite 6将支持扩展到更多的HTML元素。完整列表可以在[HTML功能](/en/guide/features.html#html)文档中找到。

要在某些元素上选择退出HTML处理，您可以在元素上添加`vite-ignore`属性。

### Postcss-Load-Config

[`postcss-load-config`](/0)已从V4更新为V6。现在需要[`tsx`](/1)或[`jiti`](/2)加载Typescript Postcss配置文件而不是[`ts-node`](/3) 。现在也需要[`yaml`](/4)加载YAML Postcss配置文件。

### SASS现在默认使用现代API

在Vite 5中，默认情况下使用了遗留API作为SASS。 Vite 5.4增加了对现代API的支持。

从Vite 6中，默认情况下将现代API用于SASS。如果您仍然希望使用旧式API，则可以设置[`css.preprocessorOptions.scss.api: 'legacy'` `css.preprocessorOptions.sass.api: 'legacy'`](/en/config/shared-options#css-preprocessoroptions)但是请注意，将在VITE 7中删除遗产API支持。

要迁移到现代API，请参阅[SASS文档](/0)。

### 在库模式下自定义CSS输出文件名

在VITE 5中，库模式下的CSS输出文件名称始终为`style.css` ，并且无法通过Vite Config轻松更改。

从Vite 6中，默认文件名称现在使用`package.json`中的`"name"`类似于JS输出文件。如果用字符串设置[`build.lib.fileName`](/en/config/build-options.md#build-lib) ，则该值也将用于CSS输出文件名。要明确设置不同的CSS文件名，您可以使用新的[`build.lib.cssFileName`](/en/config/build-options.md#build-lib)来配置它。

要迁移，如果您依赖`style.css`文件名，则应根据包装名称将其更新到新名称。例如:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

如果您喜欢像Vite 5一样坚持使用`style.css` ，则可以设置`build.lib.cssFileName: 'style'` 。

## 先进的

还有其他破裂的变化，只会影响少数用户。

- [[＃17922] fix（CSS）！:删除SSR DEV中的默认导入](/0)
  - 支持CSS文件的默认导入的支持[在VITE 4中被弃用](/0)并在Vite 5中删除，但在SSR Dev模式下仍然是无意间支持的。现在删除了此支持。
- [[＃15637] fix！:SSR的默认值`build.cssMinify`到`'esbuild'`](/0)
  - 现在，即使对于SSR构建，默认情况下还启用了[`build.cssMinify`](/en/config/build-options#build-cssminify) 。
- [[＃18070]壮举！:代理旁路与WebSocket](/0)
  - 现在，呼叫`server.proxy[path].bypass`的Websocket升级请求，在这种情况下， `res`参数为`undefined` 。
- [[＃18209]重构！:凸起最小的Terser版本为5.16.0](/0)
  - 从5.4.0降至5.16.0的最小支持的Terser版本[`build.minify: 'terser'`](/en/config/build-options#build-minify)
- [[＃18231]繁琐（deps）:更新依赖关系 @lollup/plugin-commonjs to V28](/0)
  - [`commonjsOptions.strictRequires`](/0)现在默认为`true` （以前为`'auto'` ）。
    - 这可能会导致更大的捆绑尺寸，但会导致更确定性的构建。
    - 如果将CONCORJS文件指定为入口点，则可能需要其他步骤。阅读[CommonJS插件文档](/0)以获取更多详细信息。
- [[＃18243]繁琐（deps）！:迁移`fast-glob`至`tinyglobby`](/0)
  - `['01', '02', '03']`括号（ `{01..03}` ）和`['2', '4', '6', '8']`牙套（ `{2..8..2}` ）不再在地球仪中支持。
- [[＃18395]壮举（解决）！:允许删除条件](/0)
  - 该公关不仅引入了上述破裂变化为“ `resolve.conditions`的默认值”，而且还使`resolve.mainFields`不用于SSR中的无外部化依赖关系。如果您使用`resolve.mainFields`并希望将其应用于SSR中的无外部依赖项，则可以使用[`ssr.resolve.mainFields`](/0) 。
- [[＃18493]重构！:删除fs.cachedchecks选项](/0)
  - 当在缓存文件夹中编写文件并立即导入文件时，该选择加入优化被删除。
- ~~[[＃18697] fix（deps）！:更新依赖关系dotenv-expand to v12](/0)~~
  - ~~插值中使用的变量应在插值之前声明。有关更多详细信息，请参见[`dotenv-expand` ChangElog](/0) 。~~这种破裂的变化在v6.1.0中恢复了。
- [[＃16471]壮举:V6-环境API](/0)

  - 更新到仅SSR的模块不再触发客户端中的完整页面。要返回以前的行为，可以使用自定义的Vite插件:
    <details>
    <summary>点击扩展示例</summary>

    ```ts twoslash
    import type { Plugin, EnvironmentModuleNode } from 'vite'

    function hmrReload(): Plugin {
      return {
        name: 'hmr-reload',
        enforce: 'post',
        hotUpdate: {
          order: 'post',
          handler({ modules, server, timestamp }) {
            if (this.environment.name !== 'ssr') return

            let hasSsrOnlyModules = false

            const invalidatedModules = new Set<EnvironmentModuleNode>()
            for (const mod of modules) {
              if (mod.id == null) continue
              const clientModule =
                server.environments.client.moduleGraph.getModuleById(mod.id)
              if (clientModule != null) continue

              this.environment.moduleGraph.invalidateModule(
                mod,
                invalidatedModules,
                timestamp,
                true,
              )
              hasSsrOnlyModules = true
            }

            if (hasSsrOnlyModules) {
              server.ws.send({ type: 'full-reload' })
              return []
            }
          },
        },
      }
    }
    ```

    </details>

## 从V4迁移

首先检查VITE V5文档中[V4指南的迁移，](/0)以查看将应用程序移植到Vite 5的所需更改，然后继续此页面上的更改。
