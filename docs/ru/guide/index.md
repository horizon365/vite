# Начиная

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## Обзор

Vite (French word for "quick", pronounced `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>, like "veet") is a build tool that aims to provide a faster and leaner development experience for modern web projects. It consists of two major parts:

- DEV -сервер, который обеспечивает [богатые улучшения функций](./features) по сравнению с [нативными модулями ES](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) , например, чрезвычайно быстрой [заменой горячих модулей (HMR)](./features#hot-module-replacement) .

- Команда сборки, которая объединяет ваш код с помощью [подключения](https://rollupjs.org) , предварительно сконфигурированной для вывода высоко оптимизированных статических активов для производства.

Vite является самоуверенными и поставляется с разумными значениями по умолчанию из коробки. Прочитайте о том, что возможно в [руководстве по функциям](./features) . Поддержка фреймворков или интеграции с другими инструментами возможна через [плагины](./using-plugins) . [Раздел конфигурации](../config/) объясняет, как адаптировать Veite к вашему проекту, если это необходимо.

VITE также очень расширяется с помощью [API плагина](./api-plugin) и [API JavaScript](./api-javascript) с полной поддержкой печати.

Вы можете узнать больше о обосновании проекта в разделе [«Почему VITE»](./why) .

## Поддержка Браузера

Во время разработки VITE набирает [`esnext` в качестве цели преобразования](https://esbuild.github.io/api/#target) , потому что мы предполагаем, что используется современный браузер, и он поддерживает все последние функции JavaScript и CSS. Это предотвращает снижение синтаксиса, позволяя Vite служить модулям как можно ближе к исходному исходному коду.

Для производственной сборки, по умолчанию, Vite Targets Browsers, которые поддерживают современный JavaScript, такие как [Native ES -модули](https://caniuse.com/es6-module) , [Native ESM Dynamic Import](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [Nullish Coalescing](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) и [Bigint](https://caniuse.com/bigint) . Унаследованные браузеры можно поддерживать через официальный [@vitejs/плагин-лежачность](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) . Смотрите раздел [«Здание для производства»](./build) для получения более подробной информации.

## Попробуйте Vite Online

Вы можете попробовать Vite Online на [Stackblitz](https://vite.new/) . Он запускает настройку сборки на основе VITE непосредственно в браузере, поэтому она почти идентична локальной настройке, но не требует установки на вашем компьютере. Вы можете перейти к `vite.new/{template}` , чтобы выбрать, какую структуру использовать.

Поддерживаемые предустановки шаблона:

|                 JavaScript                 |                  Машинопись                   |
| :----------------------------------------: | :-------------------------------------------: |
|     [ваниль](https://vite.new/vanilla)     |     [ваниль](https://vite.new/vanilla-ts)     |
|        [Vue](https://vite.new/vue)         |       [Vue-ts](https://vite.new/vue-ts)       |
|   [реагировать](https://vite.new/react)    |     [React-ts](https://vite.new/react-ts)     |
| [предварительный](https://vite.new/preact) |    [Preact-ts](https://vite.new/preact-ts)    |
|       [горит](https://vite.new/lit)        |       [горит](https://vite.new/lit-ts)        |
|    [стройный](https://vite.new/svelte)     |       [стр](https://vite.new/svelte-ts)       |
|     [твердый](https://vite.new/solid)      | [твердые значения](https://vite.new/solid-ts) |
|       [Qwik](https://vite.new/qwik)        |      [qwik-ts](https://vite.new/qwik-ts)      |

## Сборка Вашего Первого Проекта Vite

::: tip Compatibility Note
Vite требует [node.js](https://nodejs.org/en/) версии 18+ или 20+. Тем не менее, некоторые шаблоны требуют более высокой версии Node.js для работы, пожалуйста, обновите, если ваш менеджер пакетов предупреждает об этом.
:::

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

Затем следуйте подсказкам!

Вы также можете напрямую указать имя проекта и шаблон, который вы хотите использовать с помощью дополнительных параметров командной строки. Например, чтобы понять проект Vite + Vue, запустите:

::: code-group

```bash [npm]
# NPM 7+, требуется дополнительный двойной промежуток:
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

См. [Create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) для более подробной информации о каждом поддерживаемом шаблоне: `vanilla` , `vanilla-ts` , `vue` , `vue-ts` , `react` , `react-ts` , `react-swc` , `react-swc-ts` , `preact` , `preact-ts` , `lit` , `lit-ts` , `svelte` , `svelte-ts` , `solid` , `solid-ts` , `qwik` , `qwik-ts`

Вы можете использовать `.` для названия проекта для каркасов в текущем каталоге.

## Шаблоны Сообщества

Create-Vite-это инструмент для быстрого запуска проекта из базового шаблона для популярных рамок. Проверьте Awesome Vite для [поддержанных шаблонов сообщества](https://github.com/vitejs/awesome-vite#templates) , которые включают другие инструменты или нацелены на различные рамки.

Для шаблона на `https://github.com/user/project` вы можете попробовать его в Интернете, используя `https://github.stackblitz.com/user/project` (добавление `.stackblitz` после `github` к URL -адресу проекта).

Вы также можете использовать инструмент, подобный [Degit](https://github.com/Rich-Harris/degit) , чтобы использовать свой проект одним из шаблонов. Предполагая, что проект находится на GitHub и использует `main` в качестве филиала по умолчанию, вы можете создать локальную копию, используя:

```bash
npx degit user/project#Главный мой проект
cd my-project

npm install
npm run dev
```

## Ручная Установка

В вашем проекте вы можете установить `vite` CLI, используя:

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

И создайте `index.html` файла, как это:

```html
<p>Hello Vite!</p>
```

Затем запустите соответствующую команду CLI в вашем терминале:

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

:::

`index.html` будет подано на `http://localhost:5173` .

## `index.html` и проект root

Одна вещь, которую вы, возможно, заметили, это то, что в проекте Vite `index.html` спереди и центрально, вместо того, чтобы быть спрятанным внутри `public` . Это преднамеренное: во время разработки Vite - это сервер, а `index.html` - точка входа в ваше приложение.

Vite обрабатывает `index.html` как исходный код и часть графика модуля. Он разрешает `<script type="module" src="...">` , который ссылается на ваш исходный код JavaScript. Даже inline `<script type="module">` и CSS, упомянутые через `<link href>` также наслаждаются специфическими функциями. Кроме того, URL -адреса внутри `index.html` автоматически перерываются, поэтому нет необходимости в специальных `%PUBLIC_URL%` заполнителях.

Подобно статическим http -серверам, Vite имеет концепцию «корневого каталога», из которой обслуживаются ваши файлы. Вы увидите, что это ссылается как `<root>` по всей остальной части документов. Абсолютные URL -адреса в вашем исходном коде будут разрешены с использованием корневого проекта в качестве базы, поэтому вы можете писать код, как если бы вы работали с обычным статическим файловым сервером (за исключением гораздо более мощного!). VITE также способен обрабатывать зависимости, которые разрешаются в отдельных местах файловых систем, что делает его пригодным для использования даже в настройке на основе MonorePo.

VITE также поддерживает [многостраничные приложения](./build#multi-page-app) с несколькими точками входа `.html` .

#### Указание Альтернативного Корня

Запуск `vite` запускает сервер Dev, используя текущий рабочий каталог в качестве root. Вы можете указать альтернативный корень с `vite serve some/sub/dir` .
Обратите внимание, что VITE также разрешит [свой файл конфигурации (т.е. `vite.config.js` )](/en/config/#configuring-vite) внутри корня проекта, поэтому вам нужно переместить его, если корень будет изменен.

## Интерфейс Командной Строки

В проекте, в котором установлен VITE, вы можете использовать `vite` файл в своих сценариях NPM или запустить его напрямую с `npx vite` . Вот сценарии NPM по умолчанию в проекте Scaffolded Vite:

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

Вы можете указать дополнительные параметры CLI, такие как `--port` или `--open` . Чтобы получить полный список вариантов CLI, запустите `npx vite --help` в вашем проекте.

Узнайте больше о [интерфейсе командной строки](./cli.md)

## Используя Неизданные Коммиты

Если вы не можете дождаться нового релиза, чтобы проверить последние функции, вы можете установить конкретный коммит Vite с https://pkg.pr.new:

::: code-group

```bash [npm]
$ npm install -D https://pkg.pr.new/vite@SHA
```

```bash [Yarn]
$ yarn add -D https://pkg.pr.new/vite@SHA
```

```bash [pnpm]
$ pnpm add -D https://pkg.pr.new/vite@SHA
```

```bash [Bun]
$ bun add -D https://pkg.pr.new/vite@SHA
```

:::

Замените `SHA` на любой из [коммита Seite Shas](https://github.com/vitejs/vite/commits/main/) . Обратите внимание, что только в течение последнего месяца будут работать, так как старые выпуски коммита будут очищены.

В качестве альтернативы, вы также можете клонировать [репозицию](https://github.com/vitejs/vite) на локальную машину, а затем построить и связать его сами (требуется [PNPM](https://pnpm.io/) ):

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # Используйте предпочтительный менеджер пакетов для этого шага
```

Затем перейдите в свой проект на основе Vite и запустите `pnpm link --global vite` (или менеджер пакетов, который вы использовали для ссылки `vite` по всему миру). Теперь перезапустите сервер разработки, чтобы ездить на краю кровотечения!

::: tip Dependencies using Vite
Чтобы заменить версию VITE, используемую зависимостями, необходимо использовать [переопределения NPM](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides) или [переопределения PNPM](https://pnpm.io/package_json#pnpmoverrides) .
:::

## Сообщество

Если у вас есть вопросы или нужна помощь, обратитесь к сообществу в [дискордических](https://chat.vite.dev) и [GitHub](https://github.com/vitejs/vite/discussions) .
