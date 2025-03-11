# Общие Варианты

Если не указано, параметры в этом разделе применяются ко всем разработчикам, сборке и предварительному просмотру.

## корень

- **Тип:** `string`
- **По умолчанию:** `process.cwd()`

Проектный корневой каталог (где `index.html` расположено). Может быть абсолютным путем или пути относительно текущего рабочего каталога.

Смотрите [Project Root](/en/guide/#index-html-and-project-root) для получения более подробной информации.

## база

- **Тип:** `string`
- **По умолчанию:** `/`
- **Связанный:** [`server.origin`](/en/config/server-options.md#server-origin)

Базовый общественный путь, когда обслуживается в разработке или производстве. Допустимые значения включают:

- Абсолютный пункт URL -адреса, например, `/foo/`
- Полный URL, например, `https://bar.com/foo/` (начальная часть не будет использоваться в разработке, поэтому значение совпадает с `/foo/` )
- Пустая строка или `./` (для встроенного развертывания)

Смотрите [общественный базовый путь](/en/guide/build#public-base-path) для более подробной информации.

## режим

- **Тип:** `string`
- **По умолчанию:** `'development'` для подачи, `'production'` для сборки

Указание в конфигурации переопределяет режим по умолчанию **как для обслуживания, так и для сборки** . Это значение также может быть переопределено с помощью параметра командной строки `--mode` .

См. [Переменные и режимы ENV](/en/guide/env-and-mode) для получения более подробной информации.

## определять

- **Тип:** `Record<string, any>`

Определите глобальные постоянные замены. Записи будут определены как глобальные ущеры во время разработки и статически заменены во время сборки.

Vite использует [Esbuild определяет](https://esbuild.github.io/api/#define) для выполнения замены, поэтому выражения значений должны быть строкой, которая содержит значения, сериализуемое JSON (нулевое, логическое, число, строка, массив или объект) или один идентификатор. Для не строгих значений VITE автоматически преобразует его в строку с `JSON.stringify` .

**Пример:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip NOTE
Для пользователей TypeScript, обязательно добавьте объявления типа в файл `env.d.ts` или `vite-env.d.ts` , чтобы получить чеки типа и Intellisense.

Пример:

```ts
// Vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## плагины

- **Тип:** `(плагин | Плагин [] | Обещание <Плагин | Плагин []>) [] `

Массив плагинов для использования. Фалисовые плагины игнорируются, а массивы плагинов сплющены. Если обещание будет возвращено, оно будет решено до работы. См. [Plugin API](/en/guide/api-plugin) для получения более подробной информации о плагинах VITE.

## publicdir

- **Тип:** `string | ложно
- **По умолчанию:** `"public"`

Каталог, чтобы служить простыми статическими активами. Файлы в этом каталоге обслуживаются в `/` во время разработки и копируются в корень `outDir` во время сборки, и всегда обслуживаются или копируются как есть без преобразования. Значение может быть либо абсолютным путем файловой системы, либо пути относительно корня проекта.

Определение `publicDir` как `false` отключает эту функцию.

Смотрите [каталог `public`](/en/guide/assets#the-public-directory) для более подробной информации.

## Cachedir

- **Тип:** `string`
- **По умолчанию:** `"node_modules/.vite"`

Каталог для сохранения файлов кеша. Файлы в этом каталоге предварительно связаны DEPS или некоторые другие файлы кэша, сгенерированные VITE, которые могут улучшить производительность. Вы можете использовать `--force` флаг или вручную удалить каталог для восстановления файлов кэша. Значение может быть либо абсолютным путем файловой системы, либо пути относительно корня проекта. По умолчанию до `.vite` когда не обнаруживается пакета.

## resolve.alias

- **Тип:**
  `Запись <строка, строка> | Массив <{Найти: строка | Regexp, замена: строка, CustomReSolver?: ResolverFunction | ResolverObject}> `

Будет передано `@rollup/plugin-alias` в качестве [варианта записи](https://github.com/rollup/plugins/tree/master/packages/alias#entries) . Может быть либо объектом, либо массивом из `{ find, replacement, customResolver }` пар.

При псевдониме для файловых путей системы всегда используйте абсолютные пути. Относительные значения псевдонима будут использоваться как есть и не будут разрешены в пути файловой системы.

Более расширенное пользовательское разрешение может быть достигнуто с помощью [плагинов](/en/guide/api-plugin) .

::: warning Using with SSR
Если вы настроили псевдонимы для [внешних зависимостей SSR](/en/guide/ssr.md#ssr-externals) , вы можете по псевдониме фактических `node_modules` пакетов. Как [пряжа](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) , так и [PNPM](https://pnpm.io/aliases/) поддерживают псевдоним через `npm:` префикс.
:::

## resolve.dedupe

- **Тип:** `string[]`

Если у вас дублированные копии одной и той же зависимости в вашем приложении (вероятно, из -за подъема или связанных пакетов в MonorePos), используйте эту опцию, чтобы заставить VITE всегда разрешать перечисленные зависимости от одной и той же копии (от Project Root).

:::warning SSR + ESM
Для сборки SSR дедупликация не работает для выходов ESM Build, настроенных из `build.rollupOptions.output` . Обходной путь заключается в том, чтобы использовать выходы CJS Build, пока ESM не получит лучшую поддержку плагина для загрузки модулей.
:::

## resolve.conditions

- **Тип:** `string[]`
- **По умолчанию:** `['Модуль',« Браузер »,« Разработка|Производство '] ` (` defaultClientConditions`)

Дополнительные разрешенные условия при разрешении [условного экспорта](https://nodejs.org/api/packages.html#packages_conditional_exports) из упаковки.

Пакет с условным экспортом может иметь следующее `exports` поле в его `package.json` :

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

Здесь `import` и `require` - «условия». Условия могут быть вложены и должны быть указаны из наиболее специфического до наименьшего специфического.

`Развитие|Производство `is a special value that is replaced with`Производство`or`Разработка`depending on the value of`Process.env.Node_env`. It is replaced with `Производство`when`Process.env.Node_env === 'Производство'`and` Разработка 'В противном случае.

Обратите внимание, что `import` , `require` , `default` условия всегда применяются, если требования выполняются.

:::warning Resolving subpath exports
Экспортные клавиши, оканчивающиеся на «/», устанавливаются узлом и могут не работать хорошо. Пожалуйста, свяжитесь с автором пакета, чтобы использовать [`*` шаблонов подлины](https://nodejs.org/api/packages.html#package-entry-points) .
:::

## resolve.mainFields

- **Тип:** `string[]`
- **По умолчанию:** `['browser', 'module', 'jsnext:main', 'jsnext']` ( `defaultClientMainFields` )

Список полей в `package.json` , чтобы попробовать при разрешении точки входа пакета. Обратите внимание, что это требует более низкого приоритета, чем условный экспорт, разрешенный из поля `exports` : если точка входа успешно разрешена из `exports` , основное поле будет проигнорировано.

## resolve.extensions

- **Тип:** `string[]`
- **По умолчанию:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

Список расширений файлов, чтобы попытаться импортировать, которые пропускают расширения. Примечание **не** рекомендуется опускать расширения для пользовательских типов импорта (например, `.vue` ), поскольку он может мешать IDE и поддержке типа.

## resolve.preserveSymlinks

- **Тип:** `boolean`
- **По умолчанию:** `false`

Включение этого настройки заставляет VITE определять идентификацию файла по исходному пути файла (то есть путь без соблюдения символов) вместо реального пути файла (т.е. путь после следующих символов).

- **Связанный:** [Esbuild#Proverve-Symlinks](https://esbuild.github.io/api/#preserve-symlinks) , [webpack#Resivel.symlinks
  ] ( [https://webpack.js.org/configuration/resolve/#resolvesymlinks](https://webpack.js.org/configuration/resolve/#resolvesymlinks) )

## html.cspNonce

- **Тип:** `string`
- **Связанный:** [Политика безопасности контента (CSP)](/en/guide/features#content-security-policy-csp)

Заполнитель, не являющийся значением, который будет использоваться при генерации тегов сценария / стиля. Установка этого значения также будет генерировать метатеги со значением NOCE.

## css.modules

- **Тип:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * по умолчанию: не определен
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

Настройте поведение модулей CSS. Варианты передаются в [модулы PostCSS](https://github.com/css-modules/postcss-modules) .

Эта опция не имеет никакого влияния при использовании [CSS Lightning](../guide/features.md#lightning-css) . Если включено, вместо этого следует использовать [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) .

## css.postcss

- **Тип:** `string | (postcss.processoptions & {плагины?: postcss.acceptedplugin []}) `

Inline postcss config или пользовательский каталог для поиска postcss config из (по умолчанию root Project).

Для конфигурации PostCSS он ожидает того же формата, что и `postcss.config.js` . Но для `plugins` свойства можно использовать только [формат массива](https://github.com/postcss/postcss-load-config/blob/main/README.md#array) .

Поиск выполняется с использованием [PostCSS-Load-Config](https://github.com/postcss/postcss-load-config) , и загружаются только поддерживаемые имена файлов конфигурации. Файлы конфигурации за пределами корневого уровня рабочей области (или [корень проекта](/en/guide/#index-html-and-project-root) , если не найдено рабочего пространства) не выполняются по умолчанию. Вы можете указать пользовательский путь за пределами корня для загрузки конкретного файла конфигурации, если это необходимо.

Примечание Если предоставлена встроенная конфигурация, VITE не будет искать другие источники конфигурации PostCSS.

## css.preprocessorOptions

- **Тип:** `Record<string, object>`

Укажите параметры, которые можно перевести в предварительные процессоры CSS. Расширения файла используются в качестве ключей для параметров. Поддерживаемые варианты для каждого препроцессора можно найти в соответствующей документации:

- `sass` `scss`
  - Выберите SASS API для использования с `API:« Современный компилятор » | "современный" | «Legacy» `(default`«Современный компилятор»`if`, внесенный в т. Д.`is installed, otherwise`«современный»`). For the best performance, it's recommended to use `API: «Современный компилятор»`with the`, внесенный`package. The` «Наследие», «API устарел и будет удален в Vite 7.
  - [Варианты (современный)](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
  - [Варианты (наследие)](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions) .
- `less` : [параметры](https://lesscss.org/usage/#less-options) .
- `styl` : поддерживается только [`define`](https://stylus-lang.com/docs/js.html#define-name-node) , которые могут быть переданы как `stylus` .

**Пример:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // или «современный», «наследие»
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **Тип:** `string | ((источник: String, имя файла: string) => (строка | {Content: String; Карта?: Sourcemap})) `

Эта опция может быть использована для введения дополнительного кода для каждого контента стиля. Обратите внимание, что если вы включите реальные стили, а не только переменные, эти стили будут дублироваться в последнем пакете.

**Пример:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

## css.preprocessorMaxWorkers

- **Экспериментальный:** [дайте обратную связь](https://github.com/vitejs/vite/discussions/15835)
- **Тип:** `номер | правда
- **По умолчанию:** `0` (не создает работников и не работает в основном потоке)

Если эта опция будет установлена, препроцессоры CSS будут работать у работников, когда это возможно. `true` означает количество процессоров минус 1.

## css.devSourcemap

- **Экспериментальный:** [дайте обратную связь](https://github.com/vitejs/vite/discussions/13845)
- **Тип:** `boolean`
- **По умолчанию:** `false`

Сообщите ли Sourcemaps во время разработки.

## css.transformer

- **Экспериментальный:** [дайте обратную связь](https://github.com/vitejs/vite/discussions/13835)
- **Тип:** `'postcss' | 'Lightningcss'
- **По умолчанию:** `'postcss'`

Выбирает двигатель, используемый для обработки CSS. Проверьте [Lightning CSS](../guide/features.md#lightning-css) для получения дополнительной информации.

::: info Duplicate `@import`s
Обратите внимание, что PostCSS (PostCSS-IMPORT) имеет другое поведение с дублированным `@import` из браузеров. См. [PostCSS/PostCSS-IMPORT#462](https://github.com/postcss/postcss-import/issues/462) .
:::

## css.lightningcss

- **Экспериментальный:** [дайте обратную связь](https://github.com/vitejs/vite/discussions/13835)
- **Тип:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Настраивает Lightning CSS. Полные варианты преобразования можно найти в [репо Lightning CSS](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts) .

## json.namedExports

- **Тип:** `boolean`
- **По умолчанию:** `true`

Поддерживать ли названные импорты из `.json` файлов.

## json.stringify

- **Тип:** `Boolean | «Авто»
- **По умолчанию:** `'auto'`

Если установлено в `true` , импортированный JSON будет преобразован в `export default JSON.parse("...")` что значительно более эффективно, чем объектные литералы, особенно когда файл JSON большой.

Если установить на `'auto'` , данные будут строиться только в том случае, если [данные превышают 10 КБ](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger) .

## Esbuild

- **Тип:** `esbuildoptions | ложно

`ESBuildOptions` расширяет [собственные варианты преобразования Esbuild](https://esbuild.github.io/api/#transform) . Наиболее распространенным вариантом использования является настройка JSX:

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

По умолчанию ESBUILD применяется к файлам `ts` , `jsx` и `tsx` . Вы можете настроить это с помощью `esbuild.include` и `esbuild.exclude` , которые могут быть корпорацией, шаблоном [Picomatch](https://github.com/micromatch/picomatch#globbing-features) или массивом любого.

Кроме того, вы также можете использовать `esbuild.jsxInject` для автоматического внедрения импорта JSX Helper для каждого файла, преобразованного Esbuild:

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

Когда [`build.minify`](./build-options.md#build-minify) составляет `true` , все минифические оптимизации применяются по умолчанию. Чтобы отключить [определенные аспекты](https://esbuild.github.io/api/#minify) этого, установите любой из `esbuild.minifyIdentifiers` , `esbuild.minifySyntax` или `esbuild.minifyWhitespace` вариантов на `false` . Примечание. Опция `esbuild.minify` не может быть использован для переопределения `build.minify` .

Установите `false` , чтобы отключить преобразования ESBUILD.

## AssetsInclude

- **Тип:** `string | Regexp | (нить | Regexp) [] `
- **Связанный:** [Статическое обработка активов](/en/guide/assets)

Укажите дополнительные [паттерны Picomatch](https://github.com/micromatch/picomatch#globbing-features) , которые должны рассматриваться как статические активы, чтобы:

- Они будут исключены из трубопровода преобразования плагинов при ссылке из HTML или непосредственно запрашиваны более `fetch` или XHR.

- Импорт их из JS вернет свою разрешенную строку URL -адреса (это может быть перезаписано, если у вас есть плагин `enforce: 'pre'` для по -разному обрабатывать тип актива).

Встроенный список типов активов можно найти [здесь](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts) .

**Пример:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## loglevel

- **Тип:** `'Информация' | 'предупреждать' | 'ошибка' | «Тихо»

Настроить консольную выходную условность. По умолчанию `'info'` .

## CustomLogger

- **Тип:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

Используйте пользовательский журнал для журнала сообщений. Вы можете использовать API Vite `createLogger` , чтобы получить регистратор по умолчанию и настроить его, например, изменить сообщение или отфильтровать определенные предупреждения.

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // Игнорировать пустые файлы CSS
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## чистый экран

- **Тип:** `boolean`
- **По умолчанию:** `true`

Установите на `false` чтобы не допустить очистки экрана терминала при регистрации определенных сообщений. Через командную строку, используйте `--clearScreen false` .

## Envdir

- **Тип:** `string`
- **По умолчанию:** `root`

Каталог, из которого загружаются `.env` файлов. Может быть абсолютным путем или пути относительно корня проекта.

Смотрите [здесь](/en/guide/env-and-mode#env-files) для получения дополнительной информации о файлах окружающей среды.

## envprefix

- **Тип:** `string | String [] `
- **По умолчанию:** `VITE_`

Переменные env, начиная с `envPrefix` будут подвергаться воздействию вашего клиента -исходного кода через import.meta.env.

:::warning SECURITY NOTES
`envPrefix` не следует устанавливать как `''` , что будет обнародовать все ваши переменные ENV и вызывать неожиданную утечку конфиденциальной информации. VITE бросит ошибку при обнаружении `''` .

Если вы хотите разоблачить непреодолимую переменную, вы можете использовать [определение](#define) , чтобы выставить ее:

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## Apptype

- **Тип:** `'Spa' | 'mpa' | 'Custom »
- **По умолчанию:** `'spa'`

Независимо от того, является ли ваше приложение приложением с одной страницей (SPA), [многостраничным приложением (MPA)](../guide/build#multi-page-app) или пользовательским приложением (SSR и Frameworks с пользовательской обработкой HTML):

- `'spa'` : Включите HTML Middlewares и используйте Spa Swarkback. Настройте [SIRV](https://github.com/lukeed/sirv) с `single: true` в предварительном просмотре
- `'mpa'` : Включите HTML Middlewares
- `'custom'` : не включайте HTML Middlewares

Узнайте больше в [Guide SSR](/en/guide/ssr#vite-cli) Vite. Связанный: [`server.middlewareMode`](./server-options#server-middlewaremode) .

## будущее

- **Тип:** `record <String, 'предупреждение' | Неопределенный> `
- **Связанный:** [нарушающие изменения](/en/changes/)

Включить будущие нарушения изменений, чтобы подготовиться к плавной миграции в следующую крупную версию VITE. Список может быть обновлен, добавлен или удален в любое время по мере разработки новых функций.

Смотрите страницу [«Разрывные изменения»](/en/changes/) для получения подробной информации о возможных вариантах.
