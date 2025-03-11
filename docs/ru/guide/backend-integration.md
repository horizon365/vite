# Бэкэнд Интеграция

:::tip Note
Если вы хотите обслуживать HTML, используя традиционную бэкэнд (например, Rails, Laravel), но используйте Vite для обслуживания активов, проверьте существующие интеграции, перечисленные в [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) .

Если вам нужна пользовательская интеграция, вы можете выполнить шаги в этом руководстве, чтобы настроить ее вручную
:::

1. В конфигурации Vite настройте вход и включите манифест сборки:

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   // ---резать---
   export default defineConfig({
     server: {
       cors: {
         // Происхождение, которое вы будете получать через браузер
         origin: 'http://my-backend.example.com',
       },
     },
     build: {
       // генерировать .vite/manifest.json в Outdir
       manifest: true,
       rollupOptions: {
         // перезаписать дефолт .html entry
         input: '/path/to/main.js',
       },
     },
   })
   ```

   Если вы не отключили [многофилль модуля](/en/config/build-options.md#build-polyfillmodulepreload) , вам также необходимо импортировать полифилл в своем входе

   ```js
   // Добавьте начало записи приложения
   import 'vite/modulepreload-polyfill'
   ```

2. Для разработки, введите следующее в HTML -шаблон вашего сервера (замените `http://localhost:5173` с локальным URL -Vite, который работает на):

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   Чтобы правильно обслуживать активы, у вас есть два варианта:

   - Убедитесь, что сервер настроен на запросы прокси -статических активов на сервер VITE
   - Установите [`server.origin`](/en/config/server-options.md#server-origin) так, чтобы сгенерированные URL-адреса актива будут разрешены с использованием URL-адреса сервера по сравнению

   Это необходимо для активов, таких как изображения для правильной загрузки.

   Примечание, если вы используете React с `@vitejs/plugin-react` , вам также необходимо добавить это перед вышеупомянутыми сценариями, поскольку плагин не может изменить HTML, который вы обслуживаете (замените `http://localhost:5173` с локальным URL Vite.

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. Для производства: после запуска `vite build` файл `.vite/manifest.json` будет сгенерирован вместе с другими файлами активов. Пример манифестного файла выглядит следующим образом:

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

   - Манифест имеет структуру `Record<name, chunk>`
   - Для въезда или динамических кусков входа ключом является относительный путь SRC от Project Root.
   - Для не входных кусков ключ является базовым именем сгенерированного файла, префиксированного `_` .
   - Для файла CSS, сгенерированного, когда [`build.cssCodeSplit`](/en/config/build-options.md#build-csscodesplit) равен `false` , ключ составляет `style.css` .
   - Куски будут содержать информацию о его статическом и динамическом импорте (оба являются ключами, которые отображают соответствующий кусок в манифесте), а также соответствующие файлы CSS и активы (если таковые имеются).

4. Вы можете использовать этот файл для рендеринга ссылок или директив предварительной нагрузки с хешированными именами файлов.

   Вот пример HTML -шаблон, чтобы отобразить правильные ссылки. Синтаксис здесь для
   только объяснение, замените языком шаблона вашего сервера. `importedChunks`
   Функция предназначена для иллюстрации и не предоставлена Vite.

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

   В частности, бэкэнд, генерирующая HTML, должна включать следующие теги, учитывая манифест
   Файл и точка записи:

   - Тег `<link rel="stylesheet">` для каждого файла в списке `css` точки входа.
   - Рекурсивно следить за всеми кусками в списке `imports` и включите
     `<link rel="stylesheet">` тег для каждого файла CSS каждого импортируемого куски.
   - Тег для ключа `file` отчатка точки входа ( `<script type="module">` для JavaScript,
     или `<link rel="stylesheet">` для CSS)
   - Необязательно, `<link rel="modulepreload">` тег для `file` каждого импортированного JavaScript
     кусок, снова рекурсивно после импорта, начиная с чанка точки входа.

   После приведенного выше примера Manifest для точки входа `views/foo.js` Следующие теги должны быть включены в производство:

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   В то время как следующее должно быть включено для точки входа `views/bar.js` :

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details Pseudo implementation of `importedChunks`
   Пример псевдо реализации `importedChunks` в TypeScript (это будет
   Нужно быть адаптировано для вашего языка программирования и языка шаблона):

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
