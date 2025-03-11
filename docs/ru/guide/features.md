# Функции

На самом базовом уровне разработка с использованием VITE ничем не отличается от использования статического файлового сервера. Тем не менее, VITE обеспечивает множество улучшений по сравнению с нативным импортом ESM для поддержки различных функций, которые обычно наблюдаются в настройках на основе Bundler.

## NPM-зависимость разрешения и предварительного сжигания

Импорт Native ES не поддерживает импорт модулей голый, как следующее:

```js
import { someMethod } from 'my-dep'
```

Выше приведет ошибку в браузере. VITE обнаружит такой импорт модуля во всех обслуживаемых исходных файлах и выполнит следующее:

1. [Предварительно побудить](./dep-pre-bundling) их, чтобы улучшить скорость загрузки страницы и преобразовать модули CommonJS / UMD в ESM. Предварительный шаг выполняется с помощью [ESBUILD](http://esbuild.github.io/) и делает холодное время VITE значительно быстрее, чем любой пакет на основе JavaScript.

2. Перепишите импорт в действительные URL -адреса, такие как `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd` , чтобы браузер мог импортировать их должным образом.

**Зависимости сильно кэшируются**

Проверьте запросы на зависимость кэша через заголовки HTTP, поэтому, если вы хотите локально редактировать/отлаживать зависимость, выполните шаги [здесь](./dep-pre-bundling#browser-cache) .

## Замена Горячего Модуля

VITE предоставляет [HMR API](./api-hmr) над Native ESM. Фреймворки с возможностями HMR могут использовать API для предоставления мгновенных, точных обновлений без перезагрузки страницы или выдувания состояния приложения. VITE предоставляет первоклассные интеграции HMR для [компонентов однофабрикования VUE](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) и [реагировать быстрое обновление](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) . Есть также официальные интеграции для Preact через [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite) .

ПРИМЕЧАНИЕ, вам не нужно вручную настраивать их - когда вы [создаете приложение через `create-vite`](./) , выбранные шаблоны уже будут предварительно настроены для вас.

## Машинопись

VITE поддерживает импорт `.ts` файлов из коробки.

### Транспили Только

Обратите внимание, что VITE выполняет только транспиляцию в `.ts` файлах и **не** выполняет проверку типов. Предполагается, что проверка типов заботится о вашей IDE и процессе сборки.

Причина, по которой Vite не выполняет проверку типов как часть процесса преобразования, заключается в том, что две работы работают в основном по -разному. Транспиляция может работать на основе для каждого файла и прекрасно соответствовать модели компиляции Vite по требованию. Для сравнения, проверка типов требует знания всего графа модуля. Проверка типа обуви в конвейер Vite's Transform неизбежно пойдет на компромисс скорости Veite.

Работа Veite состоит в том, чтобы привлечь ваши исходные модули в форму, которая может работать в браузере как можно быстрее. Для этого мы рекомендуем отделить проверки статического анализа от конвейера VITE. Этот принцип применяется к другим проверкам статического анализа, таких как Eslint.

- Для производства вы можете запустить `tsc --noEmit` в дополнение к команде сборки Vite.

- Во время разработки, если вам нужно больше, чем намеки на IDE, мы рекомендуем запустить `tsc --noEmit --watch` в отдельном процессе или использовать [проверку Vite-Plugin,](https://github.com/fi3ework/vite-plugin-checker) если вы предпочитаете, чтобы ошибки типа были непосредственно сообщены в браузере.

Vite использует [Esbuild](https://github.com/evanw/esbuild) для транспилированной типовойписа в JavaScript, который примерно в 20 ~ 30 раза быстрее, чем Vanilla `tsc` , а обновления HMR могут отражаться в браузере менее чем за 50 мс.

Используйте [импорт только для типов и синтаксис экспорта,](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) чтобы избежать потенциальных проблем, таких как импорт только для типов, например:

```ts
import type { T } from 'only/types'
export type { T }
```

### Параметры Компилятора TypeScript

Некоторые поля конфигурации до `compilerOptions` в `tsconfig.json` требуют особого внимания.

#### `isolatedModules`

- [Типовая документация](https://www.typescriptlang.org/tsconfig#isolatedModules)

Должен быть установлен на `true` .

Это связано с тем, что `esbuild` выполняет транспиляцию без информации типа, она не поддерживает определенные функции, такие как Const enum и неявный импорт только типа.

Вы должны установить `"isolatedModules": true` в своем `tsconfig.json` до `compilerOptions` , чтобы TS предупредил вас о функциях, которые не работают с изолированной транспиляцией.

Если зависимость не работает хорошо с `"isolatedModules": true` . Вы можете использовать `"skipLibCheck": true` , чтобы временно подавить ошибки до тех пор, пока они не будут зафиксированы вверх по течению.

#### `useDefineForClassFields`

- [Типовая документация](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

Значение по умолчанию будет `true` , если цель TypeScript составляет `ES2022` или новее, включая `ESNext` . Это согласуется с [поведением TypeScript 4.3.2+](https://github.com/microsoft/TypeScript/pull/42663) .
Другие цели TypeScript будут по умолчанию до `false` .

`true` - стандартное поведение времени выполнения Ecmascript.

Если вы используете библиотеку, которая в значительной степени полагается на поля классов, пожалуйста, будьте осторожны с предполагаемым использованием библиотеки.
Хотя большинство библиотек ожидают `"useDefineForClassFields": true` , вы можете явно установить `useDefineForClassFields` `false` если ваша библиотека не поддерживает ее.

#### `target`

- [Типовая документация](https://www.typescriptlang.org/tsconfig#target)

VITE игнорирует значение `target` в `tsconfig.json` , следуя тому же поведению, что и `esbuild` .

Чтобы указать цель в DEV, можно использовать опцию [`esbuild.target`](/en/config/shared-options.html#esbuild) , что по умолчанию по `esnext` для минимальной транспиляции. В сборниках [`build.target`](/en/config/build-options.html#build-target) вариант занимает более высокий приоритет более `esbuild.target` , а также может быть установлен при необходимости.

::: warning `useDefineForClassFields`

Если `target` в `tsconfig.json` не `ESNext` или `ES2022` или более новее, или если нет `tsconfig.json` файла, `useDefineForClassFields` по умолчанию по умолчанию `false` , что может быть проблематичным с значением `esbuild.target` по умолчанию `esnext` . Он может перенести в [блоки статической инициализации](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks#browser_compatibility) , которые не могут быть поддержаны в вашем браузере.

Таким образом, рекомендуется установить `target` до `ESNext` или `ES2022` или более новым, или установить `useDefineForClassFields` до `true` явно при настройке `tsconfig.json` .
:::

#### Другие Варианты Компилятора, Влияющие На Результат Сборки

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)
- [`alwaysStrict`](https://www.typescriptlang.org/tsconfig#alwaysStrict)

::: tip `skipLibCheck`
Шаблоны стартовых вызовов имеют `"skipLibCheck": "true"` по умолчанию, чтобы избежать зависимостей TypeChecking, так как они могут выбрать только для поддержки конкретных версий и конфигураций TypeScript. Вы можете узнать больше на [Vuejs/Vue-Cli#5688](https://github.com/vuejs/vue-cli/pull/5688) .
:::

### Типы Клиентов

Типы по умолчанию Vite предназначены для его API node.js. Чтобы ограничить среду кода клиента в приложении Vite, добавьте файл объявления `d.ts` :

```typescript
///<reference types="vite/client">
```

::: details Using `compilerOptions.types`

В качестве альтернативы, вы можете добавить `vite/client` до `compilerOptions.types` внутри `tsconfig.json` :

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client", "some-other-global-lib"]
  }
}
```

Обратите внимание, что если [`compilerOptions.types`](https://www.typescriptlang.org/tsconfig#types) указан, только эти пакеты будут включены в глобальную область (вместо всех видимых пакетов @types »).

:::

`vite/client` предоставляет следующие типы:

- Импорт активов (например, импорт `.svg` файла)
- Типы для [константы](./env-and-mode#env-variables) , инъецированных Vite, на `import.meta.env`
- Типы для [HMR API](./api-hmr) на `import.meta.hot`

::: tip
Чтобы переопределить типирование по умолчанию, добавьте файл определения типа, который содержит ваши типы. Затем добавьте ссылку типа до `vite/client` .

Например, чтобы сделать импорт по умолчанию `*.svg` A -React Component:

- `vite-env-override.d.ts` (файл, который содержит ваши типы):
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- Файл, содержащий ссылку на `vite/client` :
  ```ts
  ///<reference types="./vite-env-override.d.ts">
  ///<reference types="vite/client">
  ```

:::

## HTML

Файлы HTML стоят [спереди и центром](/en/guide/#index-html-and-project-root) проекта VITE, служащим в качестве точек входа для вашего приложения, что позволяет создавать одностраничные и [многостраничные приложения](/en/guide/build.html#multi-page-app) .

Любые HTML -файлы в корне проекта могут быть непосредственно доступны по соответствующему пути каталога:

- `<root>/index.html` -> `http://localhost:5173/`
- `<root>/about.html` -> `http://localhost:5173/about.html`
- `<root>/blog/index.html` -> `http://localhost:5173/blog/index.html`

Активы, на которые ссылаются элементы HTML, такие как `<script type="module" src>` и `<link href>` обрабатываются и объединяются как часть приложения. Полный список поддерживаемых элементов, как показано ниже:

- `<audio src>`
- `<embed src>`
- `<img src>` и `<img srcset>`
- `<image src>`
- `<input src>`
- `<link href>` и `<link imagesrcset>`
- `<object data>`
- `<script type="module" src>`
- `<source src>` и `<source srcset>`
- `<track src>`
- `<use href>` и `<use xlink:href>`
- `<video src>` и `<video poster>`
- `<meta content>`
  - Только если `name` атрибут соответствует `msapplication-tileimage` , `msapplication-square70x70logo` , `msapplication-square150x150logo` , `msapplication-wide310x150logo` , `msapplication-square310x310logo` , `msapplication-config` или `twitter:image`
  - Или только если `property` атрибут соответствует `og:image` , `og:image:url` , `og:image:secure_url` , `og:audio` , `og:audio:secure_url` , `og:video` или `og:video:secure_url`

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Чтобы отказаться от обработки HTML по определенным элементам, вы можете добавить атрибут `vite-ignore` в элемент, который может быть полезен при ссылке на внешние активы или CDN.

## Рамки

Все современные рамки поддерживают интеграцию с VITE. Большинство плагинов фреймворта поддерживаются каждой каркасной командой, за исключением официальных плагинов VUE и React VITE, которые поддерживаются в Vite Org:

- Поддержка VUE через [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- Vue JSX поддержка через [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- React Support через [@vitejs/плагин -реакция](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
- React с использованием поддержки SWC через [@vitejs/plagin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

Проверьте [руководство плагинов](https://vite.dev/plugins) для получения дополнительной информации.

## JSX

`.jsx` и `.tsx` файлы также поддерживаются из коробки. Транспиляция JSX также обрабатывается через [Esbuild](https://esbuild.github.io) .

Ваша фреймворк уже настроит JSX из коробки (например, пользователи VUE должны использовать официальный плагин [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx) , который предоставляет специфические функции VUE 3, включая HMR, разрешение глобального компонента, директивы и слоты).

При использовании JSX с вашей собственной структурой, Custom `jsxFactory` и `jsxFragment` могут быть настроены с помощью [параметра `esbuild`](/en/config/shared-options.md#esbuild) . Например, плагин Preact будет использовать:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Более подробная информация в [документах Esbuild](https://esbuild.github.io/content-types/#jsx) .

Вы можете внедрить помощников JSX, используя `jsxInject` (который является вариантом только для Vite), чтобы избежать ручного импорта:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

Импорт `.css` файлов внедрит свой контент на страницу с помощью `<style>` тега с поддержкой HMR.

### `@import` Внедрение и перебаз

Vite предварительно настроен для поддержки CSS `@import` , внедренного через `postcss-import` . Псевдонимы также уважаются для CSS `@import` . Кроме того, все ссылки CSS `url()` , даже если импортируемые файлы находятся в разных каталогах, всегда автоматически контролируются, чтобы обеспечить правильность.

`@import` псевдонимов и URL-перебаза также поддерживаются для SASS и меньше файлов (см. [Предварительные процессоры CSS](#css-pre-processors) ).

### Postcss

Если проект содержит допустимую конфигурацию PostCSS (любой формат, поддерживаемый [PostCSS-Load-Config](https://github.com/postcss/postcss-load-config) , например, `postcss.config.js` ), он будет автоматически применяться ко всем импортированным CSS.

Обратите внимание, что MINIFICE CSS будет работать после PostCSS и будет использовать опцию [`build.cssTarget`](/en/config/build-options.md#build-csstarget) .

### CSS -модули

Любой файл CSS, заканчивающийся `.module.css` считается [файлом модулей CSS](https://github.com/css-modules/css-modules) . Импорт такого файла вернет соответствующий объект модуля:

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
// ---резать---
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

Поведение модулей CSS может быть настроено с помощью [опции `css.modules`](/en/config/shared-options.md#css-modules) .

Если `css.modules.localsConvention` установлено для включения местных жителей Camelcase (например, `localsConvention: 'camelCaseOnly'` ), вы также можете использовать название импорт:

```js twoslash
import 'vite/client'
// ---резать---
// .Apply -Color -> ApplyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS Pre-Processors

Поскольку Vite нацелены только на современные браузеры, рекомендуется использовать собственные переменные CSS с плагинами PostCSS, которые реализуют проекты CSSWG (например, [PostCSS-Nest](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting) ) и автора простых, соответствующих будущим стандартам CSS.

Тем не менее, VITE обеспечивает встроенную поддержку для файлов `.scss` , `.sass` , `.less` , `.styl` и `.stylus` . Нет необходимости устанавливать для них плагины, специфичные для выселения, но должен быть установлен соответствующий прецессор:

```bash
# .scss и .sass
npm add -D sass-embedded # или sass

# .меньше
npm add -D less

# .styl и .stylus
npm add -D stylus
```

При использовании компонентов Vue Single File это также автоматически позволяет `<style lang="sass">` et al.

VITE улучшает `@import` разрешение для SASS и меньше, чтобы также уважались псевдонимы VITE. Кроме того, относительные `url()` ссылки на импортируемые файлы SASS/меньше, которые находятся в разных каталогах из корневого файла, также автоматически контролируются, чтобы обеспечить правильность.

`@import` псевдоним и URL -повторение не поддерживаются для стилуса из -за его ограничений API.

Вы также можете использовать CSS-модули в сочетании с прецессорами, добавив `.module` к расширению файла, например, `style.module.scss` .

### Отключение инъекции CSS в страницу

Автоматическое введение содержания CSS может быть отключено через параметр `?inline` запроса. В этом случае обработанная строка CSS возвращается как экспорт модуля по умолчанию, как обычно, но стили не вводят на страницу.

```js twoslash
import 'vite/client'
// ---резать---
import './foo.css' // будет введен в страницу
import otherStyles from './bar.css?inline' // не будет введен
```

::: tip NOTE
По умолчанию и названные импорты из файлов CSS (например, `import style from './foo.css'` ) удаляются с момента VITE 5. Вместо этого используйте `?inline` запрос.
:::

### Молния CSS

Начиная с VITE 4.4, существует экспериментальная поддержка [Lightning CSS](https://lightningcss.dev/) . Вы можете выбрать его, добавив [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer) в файл конфигурации и установив дополнительную зависимость [`lightningcss`](https://www.npmjs.com/package/lightningcss) :

```bash
npm add -D lightningcss
```

В случае включения файлы CSS будут обрабатываться Lightning CSS вместо PostCSS. Чтобы настроить его, вы можете передать опции Lightning CSS в опцию конфигурации [`css.lightningcss`](../config/shared-options.md#css-lightningcss) .

Чтобы настроить модули CSS, вы используете [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) вместо [`css.modules`](../config/shared-options.md#css-modules) (что настраивает способ обрабатывает модули CSS PostCSS).

По умолчанию Vite использует Esbuild для министерства CSS. Lightning CSS также может использоваться в качестве минивердирования CSS с [`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify) .

::: tip NOTE
[Предварительные процессоры CSS](#css-pre-processors) не поддерживаются при использовании Lightning CSS.
:::

## Статические Активы

Импорт статического актива вернет разрешенный публичный URL, когда он будет обслуживаться:

```js twoslash
import 'vite/client'
// ---резать---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Специальные запросы могут изменить, как загружаются активы:

```js twoslash
import 'vite/client'
// ---резать---
// Явно загружает активы в качестве URL
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
// ---резать---
// Загрузочные активы в виде струн
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
// ---резать---
// Загрузите Веб -Работники
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
// ---резать---
// Веб -работники индивидуальны как строки Base64 во время сборки
import InlineWorker from './worker.js?worker&inline'
```

Более подробная информация в [обработке статических активов](./assets) .

## JSON

Файлы JSON могут быть непосредственно импортированы - также поддерживается импорт:

```js twoslash
import 'vite/client'
// ---резать---
// импортировать весь объект
import json from './example.json'
// Импортируйте корневое поле как называемый экспорт - помогает с утолением деревьев!
import { field } from './example.json'
```

## Импорт Глобуса

VITE поддерживает импорт нескольких модулей из файловой системы через специальную функцию `import.meta.glob` :

```js twoslash
import 'vite/client'
// ---резать---
const modules = import.meta.glob('./dir/*.js')
```

Вышеуказанное будет преобразовано в следующее:

```js
// Код, созданный VITE
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

Затем вы можете перевернуть ключи объекта `modules` , чтобы получить доступ к соответствующим модулям:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

Соответствующие файлы по умолчанию ленивы с помощью динамического импорта и будут разделены на отдельные куски во время сборки. Если вы предпочитаете импортировать все модули напрямую (например, полагаясь на побочные эффекты в этих модулях, которые должны быть применены в первую очередь), вы можете передать `{ eager: true }` в качестве второго аргумента:

```js twoslash
import 'vite/client'
// ---резать---
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

Вышеуказанное будет преобразовано в следующее:

```js
// Код, созданный VITE
import * as __vite_glob_0_0 from './dir/bar.js'
import * as __vite_glob_0_1 from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

### Несколько Шаблонов

Первым аргументом может быть множество глобусов, например,

```js twoslash
import 'vite/client'
// ---резать---
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### Негативные Закономерности

Также поддерживаются отрицательные шаблоны глобуса (префикс с `!` ). Чтобы игнорировать некоторые файлы из результата, вы можете добавить исключение шаблонов глобуса в первый аргумент:

```js twoslash
import 'vite/client'
// ---резать---
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// Код, созданный VITE
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### Названный Импорт

Можно импортировать только части модулей с `import` парами.

```ts twoslash
import 'vite/client'
// ---резать---
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// Код, созданный VITE
const modules = {
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
}
```

В сочетании с `eager` даже возможно, что для этих модулей включено, что для устранения деревьев.

```ts twoslash
import 'vite/client'
// ---резать---
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// Код, созданный VITE:
import { setup as __vite_glob_0_0 } from './dir/bar.js'
import { setup as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

Установите `import` до `default` для импорта экспорта по умолчанию.

```ts twoslash
import 'vite/client'
// ---резать---
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// Код, созданный VITE:
import { default as __vite_glob_0_0 } from './dir/bar.js'
import { default as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

#### Пользовательские Запросы

Вы также можете использовать опцию `query` , чтобы предоставить запросы импорта, например, импортировать активы [в качестве строки](https://vite.dev/guide/assets.html#importing-asset-as-string) или [в качестве URL](https://vite.dev/guide/assets.html#importing-asset-as-url) :

```ts twoslash
import 'vite/client'
// ---резать---
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// Код, созданный VITE:
const moduleStrings = {
  './dir/bar.svg': () => import('./dir/bar.svg?raw').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/bar.svg': () => import('./dir/bar.svg?url').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?url').then((m) => m['default']),
}
```

Вы также можете предоставить пользовательские запросы для других плагинов:

```ts twoslash
import 'vite/client'
// ---резать---
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

### Глобус Импорт

Обратите внимание, что:

- Это функция только для Vite, а не стандарт Web или ES.
- Паттерны глобального обрабатываются как спецификаторы импорта: они должны быть либо относительными (начинать с `./` ), либо абсолютные (начинать с `/` , разрешенных относительно корня проекта), либо путем псевдонима (см. [Вариант `resolve.alias`](/en/config/shared-options.md#resolve-alias) ).
- Сопоставление глобуса выполняется через [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) .
- Вы также должны знать, что все аргументы в `import.meta.glob` должны быть **приняты в качестве литералов** . Вы не можете использовать в них переменные или выражения.

## Динамический Импорт

Подобно [импорту глобуса](#glob-import) , VITE также поддерживает динамический импорт с переменными.

```ts
const module = await import(`./dir/${file}.js`)
```

Обратите внимание, что переменные представляют только имена файлов только на один уровень глубиной. Если `file` составляет `'foo/bar'` , импорт потерпит неудачу. Для более продвинутого использования вы можете использовать функцию [импорта глобуса](#glob-import) .

## Webassembly

Предварительно скомпилированные `.wasm` файлов могут быть импортированы с `?init` .
Экспорт по умолчанию будет функцией инициализации, которая возвращает обещание [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance) :

```js twoslash
import 'vite/client'
// ---резать---
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

Функция init также может принимать [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate) , который передается в качестве второго аргумента:

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
// ---резать---
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

В производственной сборке `.wasm` файлов меньше, чем `assetInlineLimit` будут вставлены в виде строк Base64. В противном случае они будут рассматриваться как [статический актив](./assets) и получить по требованию.

::: tip NOTE
[Предложение по интеграции модуля для Webassembly](https://github.com/WebAssembly/esm-integration) в настоящее время не поддерживается.
Используйте [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) или другие плагины сообщества, чтобы справиться с этим.
:::

### Доступ К Модулю Webassembly

Если вам нужен доступ к объекту `Module` , например, для его экземпляра несколько раз, используйте [явный импорт URL](./assets#explicit-url-imports) для разрешения актива, а затем выполните экземпляр:

```js twoslash
import 'vite/client'
// ---резать---
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### Привлечение модуля в node.js

В SSR `fetch()` , происходящее как часть `?init` импорта, может потерпеть неудачу с `TypeError: Invalid URL` .
Смотрите [поддержку проблемы WASM в SSR](https://github.com/vitejs/vite/issues/8882) .

Вот альтернатива, предполагая, что база проекта является текущим каталогом:

```js twoslash
import 'vite/client'
// ---резать---
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## Веб -Работники

### Импорт с конструкторами

Сценарий веб -работника может быть импортирован с помощью [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) и [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker) . По сравнению с суффиксами работников этот синтаксис наклоняется ближе к стандартам и является **рекомендуемым** способом создания работников.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

Рабочий конструктор также принимает варианты, которые можно использовать для создания работников «модуля»:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

Обнаружение работника будет работать только в том случае, если `new URL()` конструктор используется непосредственно внутри `new Worker()` объявления. Кроме того, все параметры параметров должны быть статическими значениями (т.е. литералы String).

### Импорт С Суффиксами Запроса

Сценарий веб -работника может быть непосредственно импортирован путем добавления `?worker` или `?sharedworker` в запрос на импорт. Экспорт по умолчанию будет пользовательским работником -конструктором:

```js twoslash
import 'vite/client'
// ---резать---
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Рабочий скрипт также может использовать операторы ESM `import` вместо `importScripts()` . **Примечание** . Во время разработки это опирается на [поддержку нативного браузера](https://caniuse.com/?search=module%20worker) , но для производства он составлен.

По умолчанию сценарий работника будет излучен как отдельный кусок в производственной сборке. Если вы хотите внедрить работника в виде струн Base64, добавьте `inline` запрос:

```js twoslash
import 'vite/client'
// ---резать---
import MyWorker from './worker?worker&inline'
```

Если вы хотите получить работника в качестве URL, добавьте `url` запрос:

```js twoslash
import 'vite/client'
// ---резать---
import MyWorker from './worker?worker&url'
```

Смотрите [варианты работников](/en/config/worker-options.md) для получения подробной информации о настройке объединения всех работников.

## Политика Безопасности Контента (Csp)

Для развертывания CSP должны быть установлены определенные директивы или конфигурации из -за внутренних участников VITE.

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

Когда [`html.cspNonce`](/en/config/shared-options#html-cspnonce) установлено, Vite добавляет атрибут Nonce с указанным значением к любым тегам `<script>` и `<style>` , а также `<link>` тега для таблиц стилей и предварительной загрузки модуля. Кроме того, когда эта опция будет установлен, Vite внедрит метатеги ( `<meta property="csp-nonce" nonce="PLACEHOLDER" />` ).

Значение нера метага с `property="csp-nonce"` будет использоваться VITE, когда это необходимо как во время DEV, так и после сборки.

:::warning
Убедитесь, что вы замените заполнителя на уникальное значение для каждого запроса. Это важно, чтобы предотвратить обход политики ресурса, которую в противном случае можно легко сделать.
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

По умолчанию, во время сборки VITE вкладывает небольшие активы в качестве данных URI. Разрешение `data:` для соответствующих директив (например, [`img-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src) , [`font-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src) ), или отключение его путем настройки [`build.assetsInlineLimit: 0`](/en/config/build-options#build-assetsinlinelimit) необходимо.

:::warning
Не допускайте `data:` для [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) . Это позволит инъекция произвольных сценариев.
:::

## Построить Оптимизацию

> Функции, перечисленные ниже, автоматически применяются как часть процесса сборки, и нет необходимости в явной конфигурации, если вы не хотите их отключить.

### CSS -код расщепление

VITE автоматически извлекает CSS, используемые модулями в асинхронном кусок, и генерирует отдельный файл для него. Файл CSS автоматически загружается с помощью тега `<link>` при загрузке связанного асинхрового куска, а асинхровый кусок гарантированно оценивается только после того, как CSS загружается, чтобы избежать [FUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.) .

Если вы предпочитаете, чтобы все CSS были извлечены в один файл, вы можете отключить разделение кода CSS, установив от [`build.cssCodeSplit`](/en/config/build-options.md#build-csscodesplit) на `false` .

### Предварительная Нагрузка. Поколение

VITE автоматически генерирует `<link rel="modulepreload">` директив для въездных кусков и их прямой импорт в построенном HTML.

### Оптимизация Загрузки Асинхронного Чанка

В реальных приложениях Rollup часто генерирует «общие» куски - код, который разделяется между двумя или более другими кусками. В сочетании с динамическим импортом довольно часто есть следующий сценарий:

<script setup>
import graphSvg from '../../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

В неоптимизированных сценариях, когда асинхронная чанка `A` импортируется, браузер должен будет запросить и анализировать `A` прежде чем он сможет выяснить, что ему также нужен общий кусок `C` . Это приводит к дополнительной сетевой обработке:

```
Entry ---> A ---> C
```

VITE автоматически переписывает динамические импортные вызовы динамического импорта с кодом с шагом предварительной нагрузки, чтобы, когда `A` запрашивалось, `C` был получен **параллельно** :

```
Entry ---> (A + C)
```

Для `C` может иметь дальнейший импорт, что приведет к еще большему обратном посадкам в нептимизированном сценарии. Оптимизация VITE будет отслеживать все прямые импорты, чтобы полностью устранить обработки, независимо от глубины импорта.
