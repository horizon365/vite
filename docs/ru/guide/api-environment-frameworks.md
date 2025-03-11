# API окружающей среды для рамок

:::warning Experimental
API окружающей среды экспериментально. Во время Vite 6 мы сохраним конюшню APIS, чтобы позволить экосистеме экспериментировать и построить на ней. Мы планируем стабилизировать эти новые API с потенциальными нарушающими изменениями в Vite 7.

Ресурсы:

- [Обсуждение обратной связи,](https://github.com/vitejs/vite/discussions/16358) где мы собираем отзывы о новых API.
- [Environment API PR](https://github.com/vitejs/vite/pull/16471) , где новый API был реализован и рассмотрен.

Пожалуйста, поделитесь с нами своими отзывами.
:::

## Среда и рамки

Неявная среда `ssr` и другие не клиентные среды используют `RunnableDevEnvironment` по умолчанию во время разработки. Хотя это требует, чтобы время выполнения была одинаковой с той, которая работает сервер VITE, это работает так же с `ssrLoadModule` и позволяет фреймворкам мигрировать и включать HMR для своей истории SSR DEV. Вы можете охранять любую запутанную среду с помощью `isRunnableDevEnvironment` функции.

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * URL для выполнения.
   * Принимает путь к файлу, путь сервера или идентификатор относительно корня.
   * Возвращает созданный модуль (такой же, как в SSRLoadModule)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * Другие методы модулероннера ...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
`runner` с нетерпением оценивается, когда к нему доступ к ним впервые. Остерегайтесь, что VITE обеспечивает поддержку исходной карты, когда `runner` создается вызовом `process.setSourceMapsEnabled` или переопределив `Error.prepareStackTrace` если он недоступен.
:::

## По умолчанию `RunnableDevEnvironment`

Учитывая сервер VITE, настроенный в режиме промежуточного программного обеспечения, как описано в [Руководстве по настройке SSR](/en/guide/ssr#setting-up-the-dev-server) , давайте реализуем промежуточное программное обеспечение SSR с использованием API среды. Обработка ошибок опущена.

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // По умолчанию модули запускаются в том же процессе, что и сервер VITE
    },
  },
})

// Вам может потребоваться бросить это в RunnableDevenVironment в TypeScript или
// Используйте isrunnabledevenvironment, чтобы охранять доступ к бегуну
const environment = server.environments.node

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. Читать index.html
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Примените Vite HTML преобразования. Это вводит клиент Vite HMR,
  //    а также применяет HTML -преобразования из плагинов VITE, например, глобальный
  //    Преамбл от @vitejs/plagin-react
  template = await server.transformIndexHtml(url, template)

  // 3. Загрузите запись сервера. Импорт (URL) автоматически преобразует
  //    Исходный код ESM можно использовать в node.js! Там нет объединения
  //    требуется и обеспечивает полную поддержку HMR.
  const { render } = await environment.runner.import('/src/entry-server.js')

  // 4. рендеринг приложения html. Это предполагает экспортируемый entry-server.js
  //     `render` Функция вызывает соответствующую структуру SSR API,
  //    например ReactdomServer.RenderToString ()
  const appHtml = await render(url)

  // 5. Введите HTML-приложение в шаблон.
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. Отправьте рендерированный HTML обратно.
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

## Время выполнения агностики SSR

Поскольку `RunnableDevEnvironment` может использоваться только для запуска кода в том же времени выполнения, что и сервер Vite, для этого требуется время выполнения, которое может запустить сервер VITE (время выполнения, совместимое с Node.js). Это означает, что вам нужно будет использовать Raw `DevEnvironment` , чтобы сделать его агностиком.

:::info `FetchableDevEnvironment` proposal

Первоначальное предложение имело метод `run` в классе `DevEnvironment` , который позволил бы потребителям вызвать импорт на стороне бегуна, используя вариант `transport` . Во время нашего тестирования мы обнаружили, что API не был достаточно универсальным, чтобы начать рекомендовать его. На данный момент мы ищем отзывы о [`FetchableDevEnvironment` предложении](https://github.com/vitejs/vite/discussions/18191) .

:::

`RunnableDevEnvironment` имеет `runner.import` функцию, которая возвращает значение модуля. Но эта функция недоступна в Raw `DevEnvironment` и требует, чтобы код с использованием API -интерфейсов Vite и пользовательских модулей был разделен.

Например, в следующем примере используется значение пользовательского модуля из кода, используя API Vite:

```ts
// Код с использованием API Vite
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entry.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// ---------------------------------
// ./Entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Если ваш код может работать в то же время выполнения, что и пользовательские модули (то есть он не зависит от API-интерфейсов Node.js), вы можете использовать виртуальный модуль. Этот подход устраняет необходимость доступа к значению из кода, используя API Vite.

```ts
// Код с использованием API Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // плагин, который обрабатывает `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* Реализация плагина */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// Используйте открытые функции на каждой фабриках среды, которые запускают код
// Проверьте на каждую фабрики окружающей среды, что они предоставляют
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// ---------------------------------
// Виртуальная: входная точка
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// ---------------------------------
// ./Entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Например, для вызова `transformIndexHtml` в пользовательском модуле можно использовать следующий плагин:

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

Если ваш код требует API node.js, вы можете использовать `hot.send` для связи с кодом, который использует API VITE из пользовательских модулей. Тем не менее, имейте в виду, что этот подход может работать не так же, как и после процесса сборки.

```ts
// Код с использованием API Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // плагин, который обрабатывает `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* Реализация плагина */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// Используйте открытые функции на каждой фабриках среды, которые запускают код
// Проверьте на каждую фабрики окружающей среды, что они предоставляют
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// ---------------------------------
// Виртуальная: входная точка
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('/'))

// ---------------------------------
// ./Entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## Среда Во Время Сборки

В CLI вызовы `vite build` и `vite build --ssr` все еще будут строить только клиент, и только среды SSR для обратной совместимости.

Когда `builder` не будет `undefined` (или при вызове `vite build --app` ), `vite build` вместо этого зарегистрируется построить все приложение. Позже это станет дефолтом в будущем. Будет создан `ViteBuilder` экземпляра (время сборки `ViteDevServer` ) для создания всех настроенных средств для производства. По умолчанию строительство среда запускается последовательно, касающаяся порядка `environments` записей. Структура или пользователь могут дополнительно настроить, как встроены среды с помощью:

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

## Окружающая Среда Агностический Код

В большинстве случаев текущий экземпляр `environment` будет доступен как часть контекста запуска кода, поэтому необходимость доступа к ним через `server.environments` должна быть редкой. Например, внутренние подключаемые крючки. Окружающая среда выставлена как часть `PluginContext` , поэтому к ней можно получить доступ с помощью `this.environment` . См. [API Environment API для плагинов,](./api-environment-plugins.md) чтобы узнать о том, как создавать плагины, осведомленные об окружающей среде.
