# Статическая Обработка Активов

- Связанный: [общедоступный Базовый Путь](./build#Public-Base-Path)
- Связанный: [`assetsInclude` опция конфигурации](/en/config/shared-options.md#assetsinclude)

## Импорт актива в качестве URL

Импорт статического актива вернет разрешенный публичный URL, когда он будет обслуживаться:

```js twoslash
import 'vite/client'
// ---резать---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Например, `imgUrl` будет `/src/img.png` во время разработки и станет `/assets/img.2d8efhg.png` в производственной сборке.

Поведение похоже на `file-loader` . Разница состоит в том, что импорт может использовать либо абсолютные общественные пути (на основе корня проекта во время DEV), либо относительных путей.

- `url()` Ссылки в CSS обрабатываются одинаково.

- При использовании плагина VUE, ссылки на активы в шаблонах VUE SFC автоматически преобразуются в импорт.

- Общие изображения, носителя и филетипы шрифта обнаруживаются в виде активов автоматически. Вы можете расширить внутренний список, используя [опцию `assetsInclude`](/en/config/shared-options.md#assetsinclude) .

- Ссылка на активы включены как часть графика активов сборки, будут получать имена файлов хеширования и могут обрабатываться плагинами для оптимизации.

- Активы меньше в байтах, чем [опция `assetsInlineLimit` ,](/en/config/build-options.md#build-assetsinlinelimit) будут вставлены в качестве URL -адреса данных Base64.

- Заполнители GIT LFS автоматически исключаются из INLINGING, поскольку они не содержат содержания файла, который они представляют. Чтобы получить внедрение, обязательно загрузите содержимое файла через GIT LFS перед строительством.

- TypeScript, по умолчанию, не распознает импорт статического актива в качестве действительных модулей. Чтобы исправить это, включите [`vite/client`](./features#client-types) .

::: tip Inlining SVGs through `url()`
При передаче URL -адреса SVG построению вручную `url()` от JS переменная должна быть завернута в двойные кавычки.

```js twoslash
import 'vite/client'
// ---резать---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### Явный импорт URL

Активы, которые не включены во внутренний список или в `assetsInclude` , могут быть явно импортированы в виде URL с использованием `?url` суффикс. Это полезно, например, для импорта [работников краски Houdini](https://developer.mozilla.org/en-US/docs/Web/API/CSS/paintWorklet_static) .

```js twoslash
import 'vite/client'
// ---резать---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Явная Встроенная Обработка

Активы могут быть явно импортированы с помощью внедрения или отсутствия внедрения, используя суффикс `?inline` или `?no-inline` соответственно.

```js twoslash
import 'vite/client'
// ---резать---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### Импорт Актива В Качестве Строки

Активы могут быть импортированы в виде строк, используя суффикс `?raw` .

```js twoslash
import 'vite/client'
// ---резать---
import shaderString from './shader.glsl?raw'
```

### Импорт сценария как работника

Сценарии могут быть импортированы в качестве веб -работников с суффиксом `?worker` или `?sharedworker` .

```js twoslash
import 'vite/client'
// ---резать---
// Отдельный кусок в производственной сборке
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---резать---
// Sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---резать---
// Вставлен как строки base64
import InlineWorker from './shader.js?worker&inline'
```

Проверьте [раздел веб -работника](./features.md#web-workers) для получения более подробной информации.

## `public` каталог 0

Если у вас есть активы:

- Никогда не упоминался в исходном коде (например, `robots.txt` )
- Необходимо сохранить точно такое же имя файла (без хэширования)
- ... или вы просто не хотите сначала импортировать актив, чтобы получить его URL

Затем вы можете поместить актив в специальном каталоге `public` под вашим проектом root. Активы в этом каталоге будут обслуживаться на корневом пути `/` во время разработки и скопированы в корень дистанционного каталога как есть.

Каталог по умолчанию до `<root>/public` , но может быть настроен с помощью [`publicDir` опции](/en/config/shared-options.md#publicdir) .

Обратите внимание, что вы всегда должны ссылаться на `public` активов с использованием корневого абсолютного пути - Например, `public/icon.png` должен ссылаться в исходном коде как `/icon.png` .

## новый URL (url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) - это собственная функция ESM, которая разоблачает URL текущего модуля. Сочетая его с нативным [конструктором URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) , мы можем получить полный разрешенный URL -адрес статического актива, используя относительный путь от модуля JavaScript:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

Это работает и изначально в современных браузерах - на самом деле, Vite не нужно обрабатывать этот код во время разработки!

Этот шаблон также поддерживает динамические URL -адреса с помощью литералов Template:

```js
function getImageUrl(name) {
  // Обратите внимание, что это не включает файлы в подкатализации
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Во время производственной сборки VITE выполнит необходимые преобразования, чтобы URL -адреса все еще указывали на правильное место, даже после комплектации и хэширования активов. Тем не менее, строка URL должна быть статичной, чтобы ее можно было проанализировать, иначе код останется как есть, что может вызвать ошибки времени выполнения, если `build.target` не поддерживает `import.meta.url`

```js
// VITE не преобразует это
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details How it works

VITE преобразует функцию `getImageUrl` в:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Does not work with SSR
Этот шаблон не работает, если вы используете VITE для рендеринга на стороне сервера, потому что `import.meta.url` имеют различную семантику в браузерах против Node.js. Серверный пакет также не может определить URL -адрес хоста клиента заранее.
:::
