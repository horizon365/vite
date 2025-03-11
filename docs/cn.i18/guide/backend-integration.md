# 后端集成

:::tip Note
如果您想使用传统的后端(例如 Rails、Laravel)来提供 HTML，但使用 Vite 来提供资源，请检查 [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) 中列出的现有集成。

如果您需要自定义集成，则可以按照本指南中的步骤手动配置
:::

1. 在您的 Vite 配置中，配置入口并启用构建清单:

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   //  - -切 - -
   export default defineConfig({
     server: {
       cors: {
         // 您将通过浏览器访问的源
         origin: 'http://my-backend.example.com',
       },
     },
     build: {
       // 在Outdir中生成。
       manifest: true,
       rollupOptions: {
         // 覆盖默认.html条目
         input: '/path/to/main.js',
       },
     },
   })
   ```

   如果您尚未禁用 [模块预加载 polyfill](/en/config/build-options.md#build-polyfillmodulepreload)，则还需要在您的入口文件中导入 polyfill

   ```js
   // 添加到应用程序入口文件的开头
   import 'vite/modulepreload-polyfill'
   ```

2. 为了开发，请在服务器的 HTML 模板中注入以下内容(用 Vite 运行的本地 URL 替换 `http://localhost:5173`):

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   为了正确提供资源，您有两个选择:

   - 确保服务器配置为将静态资源请求代理到 Vite 服务器
   - 设置 [`server.origin`](/en/config/server-options.md#server-origin)，以便生成的资源 URL 将使用后端服务器 URL 而不是相对路径来解析

   这对于图像等资源正确加载是必需的。

   注意，如果您使用的是 React 并且使用了 `@vitejs/plugin-react`，则还需要在上述脚本之前添加以下内容，因为该插件无法修改您提供的 HTML(用 Vite 运行的本地 URL 替换 `http://localhost:5173`):

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. 对于生产:运行 `vite build` 后，将与其他资源文件一起生成 `.vite/manifest.json` 文件。示例清单文件如下所示:

   ```json [.vite/manifest.json]
   {
     "_shared-B7PI925R.js": {
       "file": "assets/shared-B7PI925R.js",
       "name": "shared",
       "css": ["assets/shared-ChJ_j-JJ.css"]
     },
     "_shared-ChJ_j-JJ.css": {
       "file": "assets/shared-ChJ_j-JJ.css",
       "src": "_shared-ChJ_j-JJ.css"
     },
     "baz.js": {
       "file": "assets/baz-B2H3sXNv.js",
       "name": "baz",
       "src": "baz.js",
       "isDynamicEntry": true
     },
     "views/bar.js": {
       "file": "assets/bar-gkvgaI9m.js",
       "name": "bar",
       "src": "views/bar.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "dynamicImports": ["baz.js"]
     },
     "views/foo.js": {
       "file": "assets/foo-BRBmoGS9.js",
       "name": "foo",
       "src": "views/foo.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "css": ["assets/foo-5UjPuW-k.css"]
     }
   }
   ```

   - 清单具有 `Record<name, chunk>` 结构
   - 对于入口或动态入口块，键是项目根目录的相对源路径。
   - 对于非入口块，键是生成文件的基本名称，前缀为 `_`。
   - 对于当 [`build.cssCodeSplit`](/en/config/build-options.md#build-csscodesplit) 为 `false` 时生成的 CSS 文件，键为 `style.css`。
   - 块将包含有关其静态和动态导入的信息(两者都是映射到清单中相应块的键)，以及其相应的 CSS 和资源文件(如果有)。

4. 您可以使用此文件来渲染带有哈希文件名的链接或预加载指令。

   这是一个示例HTML模板，用于呈现正确的链接。这里的语法是
   仅说明，用您的服务器模板语言代替。 `importedChunks`
   功能是用于插图的，而不是Vite提供的。

   ```html
   <!-- if production -->

   <!-- for cssFile of manifest[name].css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <!-- for chunk of importedChunks(manifest, name) -->
   <!-- for cssFile of chunk.css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <script type="module" src="/{{ manifest[name].file }}"></script>

   <!-- for chunk of importedChunks(manifest, name) -->
   <link rel="modulepreload" href="/{{ chunk.file }}" />
   ```

   具体而言，后端生成HTML应包括以下标签给定的标签
   文件和一个入口点:

   - 在入口点块`css`列表中的每个文件的`<link rel="stylesheet">`标签
   - 递归地遵循入口点`imports`列表中的所有块，并包括一个
     每个导入块的每个CSS文件的`<link rel="stylesheet">` 。
   - 入口点块`file`键的标签( `<script type="module">` javaScript，1
     或CSS `<link rel="stylesheet">` )
   - 可选，每个导入的JavaScript中的`file`标签`<link rel="modulepreload">`
     块，再次递归遵循从入口点开始的进口。

   遵循上述示例表明，对于入口点`views/foo.js`以下标签应包含在生产中:

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   虽然应包括针对入口点`views/bar.js`以下内容:

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details Pseudo implementation of `importedChunks`
   一个示例在打字稿中的`importedChunks`的伪实现(这将
   需要适应您的编程语言和模板语言):

   ```ts
   import type { Manifest, ManifestChunk } from 'vite'

   export default function importedChunks(
     manifest: Manifest,
     name: string,
   ): ManifestChunk[] {
     const seen = new Set<string>()

     function getImportedChunks(chunk: ManifestChunk): ManifestChunk[] {
       const chunks: ManifestChunk[] = []
       for (const file of chunk.imports ?? []) {
         const importee = manifest[file]
         if (seen.has(file)) {
           continue
         }
         seen.add(file)

         chunks.push(...getImportedChunks(importee))
         chunks.push(importee)
       }

       return chunks
     }

     return getImportedChunks(manifest[name])
   }
   ```

   :::
