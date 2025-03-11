# Здание для производства

Когда пришло время развернуть ваше приложение для производства, просто запустите команду `vite build` . По умолчанию он использует `<root>/index.html` в качестве точки ввода сборки и производит пакет приложений, который подходит для обслуживания статического хостинга. Проверьте [развертывание статического сайта](./static-deploy) для руководств по популярным услугам.

## Совместимость Браузера

По умолчанию производственный пакет предполагает поддержку современного JavaScript, таких как [Native ES -модули](https://caniuse.com/es6-module) , [Native ESM Dynamic Import](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [Nullish Coalescing](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) и [Bigint](https://caniuse.com/bigint) . Диапазон поддержки браузера по умолчанию:

<!-- Search for the `ESBUILD_MODULES_TARGET` constant for more information -->

- Chrome> = 87
- Firefox> = 78
- Сафари> = 14
- Край> = 88

Вы можете указать пользовательские цели с помощью [опции `build.target` конфигурации](/en/config/build-options.md#build-target) , где самая низкая цель составляет `es2015` . Если установлена более низкая цель, VITE по -прежнему потребует этих минимальных диапазонов поддержки браузеров, поскольку он полагается на [естественный динамический импорт ESM](https://caniuse.com/es6-module-dynamic-import) , и [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) :

<!-- Search for the `defaultEsbuildSupported` constant for more information -->

- Chrome> = 64
- Firefox> = 67
- Сафари> = 11,1
- Край> = 79

Обратите внимание, что по умолчанию Vite обрабатывает только синтаксические преобразования и **не покрывает многофиллы** . Вы можете проверить [https://cdnjs.cloudflare.com/polyfill/](https://cdnjs.cloudflare.com/polyfill/) , которые автоматически генерируют полифильные пакеты на основе строки пользователя пользователя.

Наследие браузеры могут быть поддержаны через [@vitejs/плагин-leagcy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) , который автоматически генерирует устаревшие куски и соответствующие полифиллы ES языка. Наследие кусочки условно загружаются только в браузерах, которые не имеют собственной поддержки ESM.

## Общественный Базовый Путь

- Связанный: [обработка активов](./assets)

Если вы развертываете свой проект по вложенному общественному пути, просто укажите [опцию `base` конфигурации](/en/config/shared-options.md#base) , и все пути активов будут соответственно переписаны. Эта опция также может быть указана как флаг командной строки, например, `vite build --base=/my/public/path/` .

У URL-адреса активов JS-импорта, ссылки на CSS `url()` и ссылки на активы в ваших `.html` файлах автоматически регулируются для уважения этой опции во время сборки.

Исключение - когда вам нужно динамически объединять URL -адреса на лету. В этом случае вы можете использовать переменную, введенную в глобально введении `import.meta.env.BASE_URL` , которая станет общедоступным базовым путем. Примечание. Эта переменная статически заменяется во время сборки, поэтому она должна появляться точно так же, как (т.е. `import.meta.env['BASE_URL']` не будет работать).

Для управления расширенным базовым путем ознакомьтесь с [расширенными базовыми параметрами](#advanced-base-options) .

### Относительная база

Если вы не знаете базовый путь заранее, вы можете установить относительный базовый путь с `"base": "./"` или `"base": ""` . Это сделает все сгенерированные URL -адреса относительно каждого файла.

:::warning Support for older browsers when using relative bases

`import.meta` Поддержка требуется для относительных баз. Если вам нужно поддерживать [браузеры, которые не поддерживают `import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , вы можете использовать [`legacy` плагина](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) .

:::

## Настройка сборки

Сборка может быть настроена с помощью различных [параметров конфигурации сборки](/en/config/build-options.md) . В частности, вы можете напрямую отрегулировать базовые [параметры обмолота](https://rollupjs.org/configuration-options/) через `build.rollupOptions` :

```js [vite.config.js]
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

Например, вы можете указать несколько выходов на зачтении с плагинами, которые применяются только во время сборки.

## Стратегия Поднятия

Вы можете настроить, как разбиты куски с помощью `build.rollupOptions.output.manualChunks` (см. [Dollup Docs](https://rollupjs.org/configuration-options/#output-manualchunks) ). Если вы используете структуру, обратитесь к их документации для настройки того, как разделены куски.

## Обработка Ошибок Загрузки

VITE издает `vite:preloadError` события, когда он не загружает динамический импорт. `event.payload` содержит исходную ошибку импорта. Если вы позвоните `event.preventDefault()` , ошибка не будет выброшена.

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // Например, обновить страницу
})
```

Когда происходит новое развертывание, служба хостинга может удалить активы из предыдущих развертываний. В результате пользователь, который посетил ваш сайт до того, как новое развертывание может столкнуться с ошибкой импорта. Эта ошибка происходит потому, что активы, работающие на устройстве этого пользователя, устарели, и она пытается импортировать соответствующий старый кусок, который удаляется. Это событие полезно для решения этой ситуации.

## Восстановление Изменений В Файлах

Вы можете включить Watcher Watcher с `vite build --watch` . Или вы можете напрямую отрегулировать базовый [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) через `build.watch` :

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

С включенным флагом `--watch` , изменения в `vite.config.js` , а также любые файлы, которые должны быть связаны, запускают восстановление.

## Многостраничное Приложение

Предположим, у вас есть следующая структура исходного кода:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Во время DEV просто перейдите или ссылку на `/nested/` - он работает как ожидалось, как и для обычного статического файлового сервера.

Во время сборки все, что вам нужно сделать, это указать несколько файлов `.html` в качестве точек входа:

```js twoslash [vite.config.js]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

Если вы указали другой корень, помните, что `__dirname` все равно будет папкой вашего файла Vite.config.js при разрешении входных путей. Поэтому вам нужно будет добавить свою `root` запись в аргументы за `resolve` .

Обратите внимание, что для файлов HTML VITE игнорирует имя, приведенное в запись в объекте `rollupOptions.input` и вместо этого уважает разрешенный идентификатор файла при генерации актива HTML в папке Dist. Это обеспечивает постоянную структуру с тем, как работает Dev Server.

## Библиотечный Режим

Когда вы разрабатываете библиотеку, ориентированную на браузер, вы, вероятно, тратите большую часть времени на странице тестирования/демонстрации, которая импортирует вашу реальную библиотеку. С помощью Vite вы можете использовать свой `index.html` для этой цели, чтобы получить плавную разработку.

Когда пришло время объединить библиотеку для распространения, используйте [параметр `build.lib` конфигурации](/en/config/build-options.md#build-lib) . Убедитесь, что также выводите все зависимости, которые вы не хотите вмешиваться в свою библиотеку, например, `vue` или `react` :

::: code-group

```js twoslash [vite.config.js (single entry)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // Правильные расширения будут добавлены
      fileName: 'my-lib',
    },
    rollupOptions: {
      // Обязательно вытекайте DEPS, которые не должны быть связаны
      // в вашу библиотеку
      external: ['vue'],
      output: {
        // Предоставьте глобальные переменные для использования в сборке UMD
        // Для внешних деп
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (multiple entries)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        secondary: resolve(__dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rollupOptions: {
      // Обязательно вытекайте DEPS, которые не должны быть связаны
      // в вашу библиотеку
      external: ['vue'],
      output: {
        // Предоставьте глобальные переменные для использования в сборке UMD
        // Для внешних деп
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

Файл входа будет содержать экспорт, который может быть импортирован пользователями вашего пакета:

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

Запуск `vite build` с помощью этой конфигурации использует предварительную установку в ролике, которая ориентирована на доставку библиотек и создает два формата пакета:

- `es` и `umd` (для одиночной записи)
- `es` и `cjs` (для нескольких записей)

Форматы могут быть настроены с опцией [`build.lib.formats`](/en/config/build-options.md#build-lib) .

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

Рекомендуется `package.json` для вашей LIB:

::: code-group

```json [package.json (single entry)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (multiple entries)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### Поддержка CSS

Если ваша библиотека импортирует какие -либо CSS, она будет в комплекте как один файл CSS, помимо встроенных файлов JS, например, `dist/my-lib.css` . Название по умолчанию на `build.lib.fileName` , но также может быть изменено с [`build.lib.cssFileName`](/en/config/build-options.md#build-lib) .

Вы можете экспортировать файл CSS в вашем `package.json` , который будет импортирован пользователями:

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip File Extensions
Если `package.json` не содержит `"type": "module"` , VITE будет генерировать различные расширения файлов для совместимости Node.js. `.js` станет `.mjs` , а `.cjs` станут `.js` .
:::

::: tip Environment Variables
В библиотечном режиме все [`import.meta.env.*`](./env-and-mode.md) использования статически заменены при создании для производства. Тем не менее, `process.env.*` использование не является, так что потребители вашей библиотеки могут динамически изменить его. Если это нежелательно, вы можете использовать `define: { 'process.env.NODE_ENV': '"production"' }` например, для статической замены их или использовать [`esm-env`](https://github.com/benmccann/esm-env) для лучшей совместимости с бундлерами и время забега.
:::

::: warning Advanced Usage
Библиотечный режим включает в себя простую и самоуверенную конфигурацию для библиотек, ориентированных на браузер и JS Framework. Если вы создаете библиотеки без браузера или требуют расширенных потоков сборки, вы можете напрямую использовать [Rollup](https://rollupjs.org) или [Esbuild](https://esbuild.github.io) .
:::

## Расширенные Базовые Варианты

::: warning
Эта функция экспериментальная. [Дайте обратную связь](https://github.com/vitejs/vite/discussions/13834) .
:::

Для расширенных вариантов использования развернутые активы и публичные файлы могут находиться в разных путях, например, для использования различных стратегий кэша.
Пользователь может выбрать развертывание в трех разных путях:

- Сгенерированные файлы HTML ввода (которые могут быть обработаны во время SSR)
- Сгенерированные хэшируемые активы (JS, CSS и другие типы файлов, такие как изображения)
- Скопированные [публичные файлы](assets.md#the-public-directory)

Единственной статической [базы](#public-base-path) недостаточно в этих сценариях. VITE обеспечивает экспериментальную поддержку для расширенных базовых опций во время сборки, используя `experimental.renderBuiltUrl` .

```ts twoslash
import type { UserConfig } from 'vite'
// Краттей-юнор
const config: UserConfig = {
  // --- Раньше ---
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      } else {
        return { relative: true }
      }
    },
  },
  // --- Резать после ---
}
```

Если хешированные активы и общедоступные файлы не развернуты вместе, параметры для каждой группы могут быть определены независимо, используя активы `type` включенный во второй `context` параметров, данного функции.

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// Краттей-юнор
const config: UserConfig = {
  // --- Раньше ---
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      } else if (path.extname(hostId) === '.js') {
        return {
          runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
        }
      } else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    },
  },
  // --- Резать после ---
}
```

Обратите внимание, что пройденное `filename` представляет собой декодированный URL, и если функция возвращает строку URL, она также должна быть декодирована. VITE будет автоматически обрабатывать кодирование при рендеринге URL -адреса. Если объект с `runtime` возвращается, кодирование следует обрабатывать самостоятельно, где это необходимо, поскольку код времени выполнения будет отображаться как есть.
