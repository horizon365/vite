# Рендеринг на стороне сервера (SSR)

:::tip Note
SSR, в частности, относится к фронтальным каркасам (например, React, Preact, Vue и Svelte), которые поддерживают запуск того же приложения в node.js, предварительное воспитание его в HTML и, наконец, увлажняют его на клиенте. Если вы ищете интеграцию с традиционными серверными фреймворками, вместо этого ознакомьтесь с [руководством по интеграции Backend](./backend-integration) .

Следующее руководство также предполагает, что предыдущий опыт работы с SSR в выбранной основе и будет сосредоточено только на деталях интеграции, специфичной для VITE.
:::

:::warning Low-level API
Это API низкого уровня, предназначенный для авторов библиотеки и фреймворта. Если ваша цель состоит в том, чтобы создать приложение, обязательно ознакомьтесь с плагинами и инструментами SSR более высокого уровня в [разделе SSR Awesome Vite](https://github.com/vitejs/awesome-vite#ssr) . Тем не менее, многие приложения успешно строятся непосредственно на вершине родного API низкого уровня Vite.

В настоящее время Vite работает над улучшенным API SSR с [API окружающей среды](https://github.com/vitejs/vite/discussions/16358) . Проверьте ссылку для получения более подробной информации.
:::

## Пример Проектов

Vite обеспечивает встроенную поддержку для рендеринга на стороне сервера (SSR). [`create-vite-extra`](https://github.com/bluwy/create-vite-extra) содержит примеры настройки SSR, которые вы можете использовать в качестве ссылок для этого руководства:

- [Ваниль](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [Vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [Реагировать](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [Предварительный](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [Стройный](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [Твердый](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

Вы также можете использовать эти проекты локально, [запустив `create-vite`](./index.md#scaffolding-your-first-vite-project) и выбрать `Others > create-vite-extra` под параметром Framework.

## Структура Источника

Типичное приложение SSR будет иметь следующую структуру исходного файла:

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

`index.html` необходимо будет ссылаться на `entry-client.js` и включить заполнителя, в который должна быть введена награда с Редкотированным сервером:

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Вы можете использовать любого заполнителя, которого вы предпочитаете вместо `<!--ssr-outlet-->` , если он может быть точно заменен.

## Условная Логика

Если вам нужно выполнить условную логику на основе SSR против клиента, вы можете использовать

```js twoslash
import 'vite/client'
// ---резать---
if (import.meta.env.SSR) {
  // ... только сервер логика
}
```

Это статически заменяется во время сборки, поэтому он позволит смириться с деревьями неиспользованных ветвей.

## Настройка Dev Server

При создании приложения SSR вы, вероятно, хотите иметь полный контроль над своим основным сервером и отделить VITE из производственной среды. Поэтому рекомендуется использовать VITE в режиме промежуточного программного обеспечения. Вот пример с [Express](https://expressjs.com/) (V4):

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

Здесь `vite` является экземпляром [VitedEvServer](./api-javascript#vitedevserver) . `vite.middlewares` -это экземпляр [подключения](https://github.com/senchalabs/connect) , который можно использовать в качестве промежуточного программного обеспечения в любом Connect-совместимых структуре Node.js.

Следующим шагом является реализация обработчика `*` для обслуживания HTML-сервера:

```js twoslash [server.js]
// @noErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import ('Express'). Express} */
var app
/** @type {import ('vite'). vitedevserver}  */
var vite

// ---резать---
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Читать index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. Примените Vite HTML преобразования. Это вводит клиент Vite HMR,
    //    а также применяет HTML -преобразования из плагинов VITE, например, глобальный
    //    Преамбл от @vitejs/plagin-react
    template = await vite.transformIndexHtml(url, template)

    // 3. Загрузите запись сервера. SSRLoadModule автоматически преобразует
    //    Исходный код ESM можно использовать в node.js! Там нет объединения
    //    Требуется и обеспечивает эффективное признание, аналогичное HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. рендеринг приложения html. Это предполагает экспортируемый entry-server.js
    //     `render` Функция вызывает соответствующую структуру SSR API,
    //    например ReactdomServer.RenderToString ()
    const appHtml = await render(url)

    // 5. Введите HTML-приложение в шаблон.
    const html = template.replace(`<!--ssr-outlet-->`, () => appHtml)

    // 6. Отправьте рендерированный HTML обратно.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // Если ошибка поймана, дайте Vite исправить трассировку стека, так что она отображает обратно
    // к вашему фактическому исходному коду.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

Сценарий `dev` в `package.json` также должен быть изменен, чтобы использовать сценарий сервера:

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Здание для производства

Чтобы отправить проект SSR для производства, нам нужно:

1. Производить клиентскую сборку как обычно;
2. Создать сборку SSR, которая может быть напрямую загружена через `import()` , чтобы нам не приходилось проходить через `ssrLoadModule` VITE;

Наши сценарии в `package.json` будут выглядеть так:

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

Обратите внимание на флаг `--ssr` , который указывает, что это сборка SSR. Он также должен указать запись SSR.

Затем в `server.js` нам нужно добавить некоторую специфическую производственную логику, проверив `process.env.NODE_ENV` :

- Вместо того, чтобы читать корень `index.html` , используйте `dist/client/index.html` в качестве шаблона, поскольку он содержит правильные ссылки на активы на сборку клиента.

- Вместо `await vite.ssrLoadModule('/src/entry-server.js')` используйте `import('./dist/server/entry-server.js')` (этот файл является результатом сборки SSR).

- Переместите создание и все использование сервера `vite` dev, стоящих за условными ветвями только для DEV, затем добавьте статический файл, обслуживающий средние войны для обслуживания файлов из `dist/client` .

Обратитесь к [примеру проектов](#example-projects) для рабочей настройки.

## Генерирование Директив Предварительной Нагрузки

`vite build` поддерживает `--ssrManifest` флаг, который будет генерировать `.vite/ssr-manifest.json` в каталоге вывода сборки:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

Приведенный выше скрипт теперь будет генерировать `dist/client/.vite/ssr-manifest.json` для сборки клиента (да, манифест SSR генерируется из сборки клиента, потому что мы хотим отображать идентификаторы модулей с клиентскими файлами). Манифест содержит отображения идентификаторов модулей с связанными кусками и файлами активов.

Чтобы использовать манифест, фреймворки должны предоставить способ собрать идентификаторы модулей компонентов, которые использовались во время вызова сервера.

`@vitejs/plugin-vue` поддерживает это из коробки и автоматически регистрирует используемые идентификаторы модуля компонента в соответствующий контекст VUE SSR:

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// CTX.Modules теперь является набором идентификаторов модулей, которые использовались во время рендеринга
```

В производственной отрасли `server.js` нам нужно прочитать и передать манифест `render` функции, экспортируемой на `src/entry-server.js` . Это предоставит нам достаточно информации, чтобы отобразить директивы предварительной нагрузки для файлов, используемых асинхровыми маршрутами! Смотрите [демо -источник](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js) для полного примера. Вы также можете использовать эту информацию для [103 ранних подсказок](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103) .

## Предварительное использование / SSG

Если маршруты и данные, необходимые для определенных маршрутов, известны заранее, мы можем предварительно распространять эти маршруты в статический HTML, используя ту же логику, что и производственный SSR. Это также можно считать формой генерации статического сайта (SSG). См. [Демонстрационный сценарий](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/prerender.js) для рабочего примера.

## Внешние виды SSR

Зависимости «внешние» из системы модулей преобразования SSR VITE по умолчанию при запуске SSR. Это ускоряет как Dev, так и наращивание.

Например, если зависимость должна быть преобразована с помощью трубопровода Vite, поскольку в них используются функции VITE, их можно добавить в [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal) .

Для связанных зависимостей они не являются внешними по умолчанию, чтобы воспользоваться HMR VITE. Если это не желательно, например, для тестирования зависимостей, как если бы они не связаны, вы можете добавить ее в [`ssr.external`](../config/ssr-options.md#ssr-external) .

:::warning Working with Aliases
Если вы настроили псевдонимы, которые перенаправляют один пакет на другой, вы можете помириться с фактическими `node_modules` пакетами, чтобы заставить его работать для внешних зависимостей SSR. Как [пряжа](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) , так и [PNPM](https://pnpm.io/aliases/) поддерживают псевдоним через `npm:` префикс.
:::

## SSR-Специфическая Логика Плагина

Некоторые структуры, такие как компиляция VUE или Svelte Comple в различные форматы на основе клиента против SSR. Чтобы поддержать условные преобразования, Vite проходит дополнительное `ssr` свойство в `options` объекте следующих крючков плагина:

- `resolveId`
- `load`
- `transform`

**Пример:**

```js twoslash
/** @type {() => import ('vite'). плагин} */
// ---резать---
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // Выполните SSR-специфический преобразование ...
      }
    },
  }
}
```

Объект параметров в `load` и `transform` является необязательным, в настоящее время забросы не используют этот объект, но в будущем может расширить эти крючки с помощью дополнительных метаданных.

:::tip Note
Перед VITE 2.7 это было проинформировано о крючках плагинов с позиционным параметром `ssr` вместо использования `options` объекта. Все основные фреймворки и плагины обновляются, но вы можете найти устаревшие сообщения, используя предыдущий API.
:::

## SSR -цель

Целью по умолчанию для сборки SSR является среда узла, но вы также можете запустить сервер в веб -работнике. Разрешение ввода пакетов отличается для каждой платформы. Вы можете настроить цель в качестве веб -работника, используя `ssr.target` настройки `'webworker'` .

## SSR -пакет

В некоторых случаях, например, `webworker` времени, вы можете объединить свою сборку SSR в один файл JavaScript. Вы можете включить это поведение `true` установив `ssr.noExternal` . Это сделает две вещи:

- Обращаться со всеми зависимостями как `noExternal`
- Бросьте ошибку, если какие-либо встроенные встроенные серии.

## Условия разрешения SSR

По умолчанию разрешение пакета будет использовать условия, установленные в [`resolve.conditions`](../config/shared-options.md#resolve-conditions) для сборки SSR. Вы можете использовать [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions) и [`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions) для настройки этого поведения.

## Vite Cli

Команды CLI `$ vite dev` и `$ vite preview` также могут использоваться для приложений SSR. Вы можете добавить свои SSR Middlewares на сервер разработки с [`configureServer`](/en/guide/api-plugin#configureserver) и на сервер предварительного просмотра с [`configurePreviewServer`](/en/guide/api-plugin#configurepreviewserver) .

:::tip Note
Используйте крючок Post, чтобы ваше промежуточное программное обеспечение SSR работало _после_ средних волн Vite.
:::
