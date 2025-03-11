# Плагин API

VITE Plugins Extends хорошо разработанный интерфейс плагинов Rollup с несколькими дополнительными параметрами, специфичными для VITE. В результате вы можете один раз написать плагин VITE и заставить его работать как для DEV, так и для сборки.

**Рекомендуется сначала пройти [документацию Rollup's Plugin,](https://rollupjs.org/plugin-development/) прежде чем читать разделы ниже.**

## Автор плагина

VITE стремится предложить установленные шаблоны из коробки, поэтому перед созданием нового плагина убедитесь, что вы проверяете [руководство по функциям,](https://vite.dev/guide/features) чтобы увидеть, покрыта ли вам необходимость. Также просмотрите доступные плагины сообщества, как в виде [совместимого плагина ROLLUP](https://github.com/rollup/awesome) , так и [плагинов Spective Spe.](https://github.com/vitejs/awesome-vite#plugins)

При создании плагина вы можете внедрить его в своем `vite.config.js` . Нет необходимости создавать для него новый пакет. Как только вы увидите, что плагин был полезен в ваших проектах, рассмотрите возможность поделиться им, чтобы помочь другим [в экосистеме](https://chat.vite.dev) .

::: tip
При обучении, отладке или авторизации плагинов мы предлагаем включить [Vite-Plugin-Inspect](https://github.com/antfu/vite-plugin-inspect) в ваш проект. Это позволяет вам проверять промежуточное состояние плагинов Vite. После установки вы можете посетить `localhost:5173/__inspect/` , чтобы осмотреть модули и стек преобразования вашего проекта. Проверьте инструкции по установке в [документах Vite-Plugin-Inspect](https://github.com/antfu/vite-plugin-inspect) .
![Vite-Plugin-Inspect](/images/vite-plugin-inspect.png)
:::

## Конвенции

Если плагин не использует конкретные крючки Vite и может быть реализован в качестве [совместимого плагина Rollup](#rollup-plugin-compatibility) , то рекомендуется использовать [соглашения об именах плагинов Rollup](https://rollupjs.org/plugin-development/#conventions) .

- Плагины Rollup должны иметь четкое имя с `rollup-plugin-` префиксом.
- Включите ключевые слова `rollup-plugin` и `vite-plugin` в package.json.

Это обнаруживает плагин, который также используется в проектах Pure Rollup или WMR на основе WMR

Только для плагинов Vite

- Плагины VITE должны иметь четкое имя с `vite-plugin-` префиксом.
- Включите `vite-plugin` ключевого слова в package.json.
- Включите раздел в документах плагина, в котором подробно описывается, почему это плагин только для выселения (например, он использует специфические крючки плагина VITE).

Если ваш плагин будет работать только для определенной структуры, его имя должно быть включено как часть префикса

- `vite-plugin-vue-` Префикс для плагинов VUE
- `vite-plugin-react-` Префикс для плагинов React
- `vite-plugin-svelte-` Префикс для плагинов для стр.

См. Также [Конвенция виртуальных модулей](#virtual-modules-convention) .

## Плагины конфигурация

Пользователи добавят плагины в проект `devDependencies` и настраивают их с помощью параметра `plugins` массива.

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

Фалисовые плагины будут игнорироваться, которые можно использовать для легкости активации или деактивации плагинов.

`plugins` также принимает пресеты, включая несколько плагинов в качестве одного элемента. Это полезно для сложных функций (например, интеграция Framework), которые реализованы с использованием нескольких плагинов. Массив будет сплющен внутри.

```js
// Framework-Plugin
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## Простые Примеры

:::tip
Обычным соглашением является автором плагина Vite/Rollup в качестве заводской функции, которая возвращает фактический объект плагина. Функция может принимать параметры, которые позволяют пользователям настраивать поведение плагина.
:::

### Преобразование Пользовательских Типов Файлов

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // Предоставьте карту источника, если доступно
        }
      }
    },
  }
}
```

### Импорт Виртуального Файла

См. Пример в [следующем разделе](#virtual-modules-convention) .

## Конвенция Виртуальных Модулей

Виртуальные модули - это полезная схема, которая позволяет передавать информацию о времени сборки в исходные файлы, используя обычный синтаксис импорта ESM.

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // Требуется, будет отображаться в предупреждениях и ошибках
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

Что позволяет импортировать модуль в JavaScript:

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Виртуальные модули в Vite (и Rollup) префикс с помощью `virtual:` для пути, обращенного пользователем по соглашению. Если возможно, имя плагина следует использовать в качестве пространства имен, чтобы избежать столкновений с другими плагинами в экосистеме. Например, `vite-plugin-posts` может попросить пользователей импортировать `virtual:posts` или `virtual:posts/helpers` виртуальных модулей, чтобы получить информацию о времени сборки. Внутренне плагины, которые используют виртуальные модули, должны префикс идентификатор модуля с `\0` при разрешении идентификатора, соглашения из экосистемы подключения. Это мешает другим плагинам попытаться обработать идентификатор (например, разрешение узлов), и основные функции, такие как Sourcemaps, могут использовать эту информацию для дифференциации виртуальных модулей и обычных файлов. `\0` не является разрешенным символом в импортных URL -адресах, поэтому мы должны заменить их во время анализа импорта. `\0{id}` виртуальный идентификатор в конечном итоге кодируется как `/@id/__x00__{id}` во время разработчика в браузере. Идентификатор будет декодирован обратно перед входом в трубопровод плагинов, поэтому его не видно кодом плагинов.

Обратите внимание, что модули, непосредственно полученные из реального файла, как в случае модуля сценария в одном компоненте файла (например, .vue или .svelte sfc) не нужно следовать этому соглашению. SFC, как правило, генерируют набор подмодулей при обработке, но код в них может быть сопоставлен обратно в файловую систему. Использование `\0` для этих подмодулей не позволит Sourcemaps правильно работать.

## Универсальные Крючки

Во время DEV сервер VITE Dev создает контейнер плагина, который вызывает [крючки с разворачиванием,](https://rollupjs.org/plugin-development/#build-hooks) так же, как и RULLUP.

Следующие крючки вызываются один раз при запуске сервера:

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

Следующие крючки вызываются по каждому запросу входящего модуля:

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

Эти крючки также имеют расширенный параметр `options` с дополнительными специфическими свойствами. Вы можете прочитать больше в [документации SSR](/en/guide/ssr#ssr-specific-plugin-logic) .

Некоторые `resolveId` вызовов `importer` значение может быть абсолютным путем для общего `index.html` в корне, поскольку не всегда возможно получить фактический импортер из -за непредвиденного шаблона Dev Vite. Для импорта, обрабатываемого в рамках резолюции Vite, импортер можно отслеживать на этапе анализа импорта, обеспечивая правильное значение `importer` .

Следующие крючки вызываются, когда сервер закрыт:

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

Обратите внимание, что крюк [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) **не** называется во время DEV, потому что VITE избегает полных анализов AST для лучшей производительности.

[Выходные крючки](https://rollupjs.org/plugin-development/#output-generation-hooks) (кроме `closeBundle` ) **не** вызываются во время разработки. Вы можете думать о Dev Server ViTe как о вызове `rollup.rollup()` без вызова `bundle.generate()` .

## Проверьте Конкретные Крючки

Плагины VITE также могут предоставлять крючки, которые служат специфичными для выселения целей. Эти крючки игнорируются в результате ROLLUP.

### `config`

- **Тип:** `(config: userconfig, env: {mode: string, команда: string}) => userconfig | нулевой | void`
- **Вид:** `async` , `sequential`

  Измените конфигурацию VITE, прежде чем он будет разрешен. Крюк получает необработанную конфигурацию пользователя (параметры CLI, объединенные с файлом конфигурации) и текущий конфигуратор Env, который раскрывает используемые `mode` и `command` . Он может вернуть частичный объект конфигурации, который будет глубоко объединен в существующую конфигурацию или непосредственно изменять конфигурацию (если слияние по умолчанию не может достичь желаемого результата).

  **Пример:**

  ```js
  // вернуть частичную конфигурацию (рекомендуется)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // Прямо измените конфигурацию (используйте только при слиянии, не работает)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning Note
  Пользовательские плагины разрешаются перед запуском этого крючка, поэтому инъекция других плагинов внутри `config` крюка не будет иметь никакого эффекта.
  :::

### `configResolved`

- **Тип:** `(config: ResolvedConfig) => void | Обещать<Void> `
- **Вид:** `async` , `parallel`

  Вызовов после разрешения конфигурации Vite. Используйте этот крючок, чтобы прочитать и сохранить окончательный разрешенный конфигурация. Это также полезно, когда плагин должен сделать что -то другое, основываясь на запусках команды.

  **Пример:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // сохранить разрешенную конфигурацию
        config = resolvedConfig
      },

      // Используйте сохраненную конфигурацию в других крючках
      transform(code, id) {
        if (config.command === 'serve') {
          // Dev: плагин, вызванный Dev Server
        } else {
          // Сборка: плагин, вызванный Rollup
        }
      },
    }
  }
  ```

  Обратите внимание, что значение `command` составляет `serve` в разработке (в CLI `vite` , `vite dev` и `vite serve` - псевдонимы).

### `configureServer`

- **Тип:** `(Сервер: VitedEvServer) => (() => void) | пустота | Обещание <(() => void) | void> `
- **Вид:** `async` , `sequential`
- **См. Также:** [Vitedevserver](./api-javascript#vitedevserver)

  Крюк для настройки сервера Dev. Наиболее распространенным вариантом использования является добавление пользовательских среднихворных средств к приложению Internal [Connect](https://github.com/senchalabs/connect) :

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Пользовательский запрос на ручку ...
      })
    },
  })
  ```

  **Инъекция промежуточного программного обеспечения**

  Крюк `configureServer` вызывается до установки внутренних среднеквадратичных, поэтому пользовательские средние войны будут работать перед внутренними среднимисточками по умолчанию. Если вы хотите ввести промежуточное программное обеспечение **после** внутренних средних волн, вы можете вернуть функцию из `configureServer` , которая будет вызвана после установки внутренних средних волн:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // вернуть крюк с поста, который называется после внутренних средних волн
      // установлен
      return () => {
        server.middlewares.use((req, res, next) => {
          // Пользовательский запрос на ручку ...
        })
      }
    },
  })
  ```

  **Хранение доступа к серверу**

  В некоторых случаях другие подключаемые крючки могут потребовать доступа к экземпляру сервера Dev (например, доступ к серверу веб -сокетов, наблюдателю файловой системы или графику модуля). Этот крюк также можно использовать для хранения экземпляра сервера для доступа в других крючках:

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // Используйте сервер ...
        }
      },
    }
  }
  ```

  Примечание `configureServer` не вызывается при запуске производственной сборки, поэтому ваши другие крючки должны защищаться от его отсутствия.

### `configurePreviewServer`

- **Тип:** `(Сервер: PreviewServer) => (() => void) | пустота | Обещание <(() => void) | void> `
- **Вид:** `async` , `sequential`
- **Смотрите также:** [PreviewServer](./api-javascript#previewserver)

  То же, что и [`configureServer`](/en/guide/api-plugin.html#configureserver) но для предварительного просмотра сервера. Как и в `configureServer` , `configurePreviewServer` крюка вызывается перед установленными другими средним уровнем. Если вы хотите ввести промежуточное программное обеспечение **после** других средних волн, вы можете вернуть функцию из `configurePreviewServer` , которая будет вызвана после установки внутренних средних волн:

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // вернуть крюк с поста, который называется после других средних волн
      // установлен
      return () => {
        server.middlewares.use((req, res, next) => {
          // Пользовательский запрос на ручку ...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **Тип:** `indexhtmltransformhook | {Порядок?: 'pre' | 'post', Handler: indexhtmltransformhook} `
- **Вид:** `async` , `sequential`

  Выделенный крючок для преобразования файлов точек входа HTML, таких как `index.html` . Крюк получает текущую строку HTML и контекст преобразования. Контекст обнажает [`ViteDevServer`](./api-javascript#vitedevserver) экземпляр во время DEV и обнажает выходной пакет подключения во время сборки.

  Крюк может быть асинхронным и может вернуть одно из следующих:

  - Преобразованная строка HTML
  - Массив объектов дескриптора TAG ( `{ tag, attrs, children }` ) для инъекции в существующий HTML. Каждый тег также может указать, куда он должен быть введен (по умолчанию готовится к `<head>` )
  - Объект, содержащий оба как `{ html, tags }`

  По умолчанию `order` составляет `undefined` , с этим крюком применяется после того, как HTML был преобразован. Чтобы ввести сценарий, который должен пройти через трубопровод плагинов Vite, `order: 'pre'` применит крюк перед обработкой HTML. `order: 'post'` применяет крючок после всех крючков с `order` неопределенными.

  **Основной пример:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`,
        )
      },
    }
  }
  ```

  **Полная подпись крюка:**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * по умолчанию: 'Prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

  ::: warning Note
  Этот крючок не будет вызван, если вы используете структуру, которая имеет пользовательскую обработку файлов ввода (например, [Sveltekit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145) ).
  :::

### `handleHotUpdate`

- **Тип:** `(ctx: hmrContext) => массив<ModuleNode> | пустота | Обещание <Массив<ModuleNode> | void> `
- **Смотрите также:** [HMR API](./api-hmr)

  Выполните пользовательскую обработку обновлений HMR. Крюк получает объект контекста со следующей подписью:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` - это массив модулей, которые влияют на измененный файл. Это массив, потому что один файл может отображать несколько обслуживаемых модулей (например, VUE SFCS).

  - `read` - это асинхронная функция чтения, которая возвращает содержимое файла. Это предусмотрено, потому что в некоторых системах обратный вызов изменения файла может слишком быстро стрелять, прежде чем редактор завершит обновление файла, а Direct `fs.readFile` вернет пустой контент. Функция чтения передается в нормализации этого поведения.

  Крюк может выбрать:

  - Отфильтруйте и сузите список пораженных модулей, чтобы HMR был более точным.

  - Верните пустой массив и выполните полную перезагрузку:

    ```js
    handleHotUpdate({ server, modules, timestamp }) {
      // Недейть модулей вручную
      const invalidatedModules = new Set()
      for (const mod of modules) {
        server.moduleGraph.invalidateModule(
          mod,
          invalidatedModules,
          timestamp,
          true
        )
      }
      server.ws.send({ type: 'full-reload' })
      return []
    }
    ```

  - Верните пустой массив и выполните полную пользовательскую обработку HMR, отправив пользовательские события клиенту:

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    Клиентский код должен зарегистрировать соответствующий обработчик, используя [API HMR](./api-hmr) (это может быть введено с помощью одного и того же плагина `transform` крюка):

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // Выполните пользовательское обновление
      })
    }
    ```

## Заказ Плагина

Плагин VITE может дополнительно указать свойство `enforce` (аналогично погрузчикам WebPack), чтобы настроить заказ приложения. Значение `enforce` может быть `"pre"` или `"post"` . Решенные плагины будут в следующем порядке:

- Псевдоним
- Пользовательские плагины с `enforce: 'pre'`
- Плагины Vite Core
- Пользовательские плагины без значения соблюдения
- Выглядеть плагины сборки
- Пользовательские плагины с `enforce: 'post'`
- Проверьте плагины после сборки (Minify, Manifest, Reporting)

Обратите внимание, что это отдельно от заказа крючков, они по -прежнему отдельно подвержены их `order` атрибуту [, как обычно, для подкатровки](https://rollupjs.org/plugin-development/#build-hooks) .

## Условное Применение

Плагины по умолчанию вызываются как для подачи, так и для сборки. В тех случаях, когда плагин должен применяться только во время подачи или строительства, используйте свойство `apply` , чтобы вызвать их только в течение `'build'` или `'serve'` :

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // или «служить»
  }
}
```

Функция также может быть использована для более точного управления:

```js
apply(config, { command }) {
  // применить только на сборку, но не для SSR
  return command === 'build' && !config.build.ssr
}
```

## Совместимость Плагинов ROLLUP

Чрезмерное количество плагинов ROLLUP будет работать непосредственно в виде плагина VITE (например, `@rollup/plugin-alias` или `@rollup/plugin-json` ), но не все из них, поскольку некоторые крючки плагинов не имеют смысла в разделе Dev -сервера.

В целом, если плагин Rollup соответствует следующим критериям, он должен работать просто как плагин Vite:

- Он не использует крюк [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) .
- Он не имеет сильной связи между крючками с патронами и крючками для вывода.

Если плагин Rollup имеет смысл только для фазы сборки, то он может быть указан под `build.rollupOptions.plugins` . Он будет работать так же, как и плагин Vite с `enforce: 'post'` и `apply: 'build'` .

Вы также можете увеличить существующий плагин Rollup с помощью только Vite Properties:

```js [vite.config.js]
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

## Нормализация Пути

VITE нормализует пути при разрешении идентификаторов для использования сепараторов POSIX ( /) при сохранении громкости в окнах. С другой стороны, Rollup сохраняет разрешенные пути нетронутыми по умолчанию, поэтому разрешенные идентификаторы имеют разделители Win32 (\) в Windows. Тем не менее, плагины Rollup используют [функцию утилиты `normalizePath`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) из `@rollup/pluginutils` внутренне, которая преобразует разделители в POSIX перед выполнением сравнений. Это означает, что когда эти плагины используются в VITE, шаблон конфигурации `include` и `exclude` и другие аналогичные пути с разрешенными сравнениями идентификаторов работают правильно.

Таким образом, для плагинов VITE при сравнении путей с разрешенными идентификаторами важно сначала нормализовать пути для использования сепараторов POSIX. Эквивалентная функция утилиты `normalizePath` экспортируется из `vite` модуля.

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```

## Фильтрация, включите/исключайте шаблон

VITE раскрывает функцию [`@rollup/pluginutils` с `createFilter`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter) , чтобы поощрять специфические плагины и интеграции для использования стандарта, включающего/исключить шаблон фильтрации, который также используется в самом ядре VITE.

## Клиент-Серверная Связь

С момента VITE 2.9 мы предоставляем некоторые утилиты для плагинов, чтобы помочь справиться с клиентами.

### Сервер к клиенту

Что касается плагина, мы могли бы использовать `server.ws.send` для трансляции событий для клиента:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: tip NOTE
Мы рекомендуем **всегда префикс** имена ваших мероприятий, чтобы избежать столкновений с другими плагинами.
:::

На стороне клиента используйте [`hot.on`](/en/guide/api-hmr.html#hot-on-event-cb) , чтобы прослушать события:

```ts twoslash
import 'vite/client'
// ---резать---
// Клиентская сторона
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // привет
  })
}
```

### Клиент на сервер

Чтобы отправить события от клиента на сервер, мы можем использовать [`hot.send`](/en/guide/api-hmr.html#hot-send-event-payload) :

```ts
// Клиентская сторона
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

Затем используйте `server.ws.on` и прослушайте события на стороне сервера:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // Привет!
          // Ответьте только клиенту (при необходимости)
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### TypeScript Для Пользовательских Событий

Внутренне Vite позволяет типу полезной нагрузки из интерфейса `CustomEventMap` , можно ввести пользовательские события, расширяя интерфейс:

:::tip Note
Обязательно включите расширение `.d.ts` при указании файлов объявления TypeScript. В противном случае TypeScript может не знать, на какой файл модуль пытается расширить.
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // «Ключ событий»: полезная нагрузка
  }
}
```

Это расширение интерфейса используется на `InferCustomEventPayload<T>` , чтобы вывести тип полезной нагрузки для события `T` . Для получения дополнительной информации о том, как используется этот интерфейс, обратитесь к [документации HMR API](./api-hmr#hmr-api) .

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
// ---резать---
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // Тип полезной нагрузки будет {msg: string}
})
import.meta.hot?.on('unknown:event', (payload) => {
  // Тип полезной нагрузки будет любой
})
```
