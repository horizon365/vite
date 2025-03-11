# Параметры Сервера

Если не указано, параметры в этом разделе применяются только к DEV.

## server.host

- **Тип:** `string | логический
- **По умолчанию:** `'localhost'`

Укажите, какие IP -адреса должен слушать сервер.
Установите это на `0.0.0.0` или `true` , чтобы прослушать все адреса, включая LAN и публичные адреса.

Это может быть установлено через CLI, используя `--host 0.0.0.0` или `--host` .

::: tip NOTE

Есть случаи, когда другие серверы могут ответить вместо VITE.

Первый случай - это когда `localhost` используется. Node.js под v17 по умолчанию переоряждается результат адресов DNS-разрешенных по умолчанию. При доступе `localhost` браузеры используют DNS для разрешения адреса, и этот адрес может отличаться от адреса, который слушает Vite. Vite печатает разрешенный адрес, когда он отличается.

Вы можете установить [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order) , чтобы отключить поведение переупорядочения. VITE затем напечатает адрес как `localhost` .

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // пропускать
})
```

Второй случай - это когда используются хосты подстановочных знаков (например, `0.0.0.0` ). Это связано с тем, что серверы, слушающие на хостах без WildCard, принимают приоритет над теми, кто слушает на подстановочных хозяйствах.

:::

::: tip Accessing the server on WSL2 from your LAN

При запуске VITE на WSL2 недостаточно установить `host: true` для доступа к серверу из вашей локальной сети.
Смотрите [документ WSL](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan) для получения более подробной информации.

:::

## server.allowedHosts

- **Тип:** `string [] | правда
- **По умолчанию:** `[]`

Имена хоста, на которые можно ответить.
`localhost` и домены до `.localhost` и все IP -адреса разрешены по умолчанию.
При использовании HTTPS эта проверка пропускается.

Если строка начинается с `.` , она позволит это имя хоста без `.` и всех субдоменов под именем хоста. Например, `.example.com` позволит `example.com` , `foo.example.com` и `foo.bar.example.com` . Если установлено в `true` , сервер разрешается отвечать на запросы на любые хосты.

::: details What hosts are safe to be added?

Хосты, которые у вас есть контроль над тем, какие IP -адреса они решают, безопасны для добавления в список разрешенных хостов.

Например, если у вас есть домен `vite.dev` , вы можете добавить `vite.dev` и `.vite.dev` в список. Если у вас нет этого домена, и вы не можете доверять владельцу этого домена, вы не должны добавлять его.

В частности, вы никогда не должны добавлять домены верхнего уровня, такие как `.com` в список. Это связано с тем, что любой может приобрести домен, подобный `example.com` и управлять IP -адресом, который он разрешает.

:::

::: danger

Установка `server.allowedHosts` до `true` позволяет любому веб -сайту отправлять запросы на ваш Dev Server через DNS -повторные атаки, что позволяет им загружать ваш исходный код и контент. Мы рекомендуем всегда использовать явный список разрешенных хостов. См. [GHSA-VG6X-RCGG-RJX6](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6) для более подробной информации.

:::

::: details Configure via environment variable
Вы можете установить переменную среды `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` , чтобы добавить дополнительный допустимый хост.
:::

## server.port

- **Тип:** `number`
- **По умолчанию:** `5173`

Укажите порт сервера. Примечание Если порт уже используется, Vite автоматически пробует следующий доступный порт, так что это может быть не фактический порт, который сервер заканчивает.

## server.strictPort

- **Тип:** `boolean`

Установите на `true` для выхода, если порт уже используется, вместо того, чтобы автоматически пробовать следующий доступный порт.

## server.https

- **Тип:** `https.ServerOptions`

Включить TLS + http/2. Обратите внимание на это понижение до TLS только при использовании [опции `server.proxy`](#server-proxy) .

Значение также может быть [объектом параметров,](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) передаваемых `https.createServer()` .

Требуется действительный сертификат. Для базовой настройки вы можете добавить [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) в плагины проекта, что автоматически создаст и кэширует самореагированный сертификат. Но мы рекомендуем создать ваши собственные сертификаты.

## server.open

- **Тип:** `Boolean | String`.

Автоматически откройте приложение в браузере при запуске сервера. Когда значение является строкой, оно будет использоваться в качестве пути пути URL. Если вы хотите открыть сервер в конкретном браузере, который вам нравится, вы можете установить Env `process.env.BROWSER` (например, `firefox` ). Вы также можете установить `process.env.BROWSER_ARGS` для передачи дополнительных аргументов (например, `--incognito` ).

`BROWSER` и `BROWSER_ARGS` также являются специальными переменными среды, которые вы можете установить в `.env` файле для его настройки. Смотрите [`open` пакета](https://github.com/sindresorhus/open#app) для более подробной информации.

**Пример:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **Тип:** `record <строка, строка | Проксиопции> `

Настройте пользовательские правила прокси для сервера Dev. Ожидает объект из `{ key: options }` пар. Любые запросы, которые начинается с этого ключа, будут представлены в этой указанной цели. Если ключ начинается с `^` , он будет интерпретироваться как `RegExp` . Вариант `configure` можно использовать для доступа к экземпляру прокси. Если запрос соответствует каким -либо из настроенных правил прокси, запрос не будет преобразован с помощью VITE.

Обратите внимание, что если вы используете не связанный [`base`](/en/config/shared-options.md#base) , вы должны префиксу каждый ключ с этим `base` .

Расширяет [`http-proxy`](https://github.com/http-party/node-http-proxy#options) . Дополнительные варианты [здесь](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13) .

В некоторых случаях вы также можете настроить базовый сервер Dev (например, добавить пользовательские средние стороны в приложение Internal [Connect](https://github.com/senchalabs/connect) ). Чтобы сделать это, вам нужно написать свой собственный [плагин](/en/guide/using-plugins.html) и использовать функцию [Configureserver](/en/guide/api-plugin.html#configureserver) .

**Пример:**

```js
export default defineConfig({
  server: {
    proxy: {
      // Строка стенография:
      // http: // localhost: 5173/foo
      //   -> [http: // localhost: 4567/foo](http://localhost:4567/foo)
      '/foo': 'http://localhost:4567',
      // с вариантами:
      // http: // localhost: 5173/api/bar
      //   -> [http://jsonplaceholder.typicode.com/bar](http://jsonplaceholder.typicode.com/bar)
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // с Regexp:
      // http: // localhost: 5173/swarkback/
      //   -> [http://jsonplaceholder.typicode.com/](http://jsonplaceholder.typicode.com/)
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // Использование экземпляра прокси
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Прокси станет экземпляром «http-proxy»
        },
      },
      // Прокси -вариант или сокетов .IO:
      // ws: // localhost: 5173/socket.io
      //   -> ws: // localhost: 5174/socket.io
      // УПРАЖНЕНИЕ Осторожно, используя `rewriteWsOrigin` так как это может оставить
      // Прокси открывается для атак CSRF.
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **Тип:** `Boolean | Корсопции
- **По умолчанию:** `{Origin: /^https?://(?:(?:® :^+.)?localhost|127\.0\.0\.1|[:: 1]) (? :: \ d+)? $/}  127.0.0.1  :: 1`)

Настройте Cors для сервера Dev. Передайте [объект параметров](https://github.com/expressjs/cors#configuration-options) , чтобы точно настроить поведение или `true` , чтобы разрешить любое происхождение.

::: danger

Установка `server.cors` до `true` позволяет любому веб -сайту отправлять запросы на ваш сервер Dev и загружать ваш исходный код и контент. Мы рекомендуем всегда использовать явный список разрешенных источников.

:::

## server.headers

- **Тип:** `OutgoingHttpHeaders`

Укажите заголовки ответов на сервер.

## server.hmr

- **Тип:** `Boolean | {Протокол?

Отключить или настроить подключение HMR (в тех случаях, когда HMR WebSocket должен использовать другой адрес, от HTTP -сервера).

Установите `server.hmr.overlay` до `false` , чтобы отключить наложение ошибок сервера.

`protocol` Устанавливает протокол WebSocket, используемый для подключения HMR: `ws` (WebSocket) или `wss` (WebSocket Secure).

`clientPort` - это расширенный параметр, который переопределяет порт только на стороне клиента, позволяя вам обслуживать WebSocket в другом порту, чем клиент -код ищет его.

Когда `server.hmr.server` будет определен, VITE обработает запросы подключения HMR через предоставленный сервер. Если не в режиме промежуточного программного обеспечения, Vite попытается обработать запросы подключения HMR через существующий сервер. Это может быть полезным при использовании самоподтвержденных сертификатов или когда вы хотите разоблачить VITE по сети на одном порту.

Проверьте [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue) для некоторых примеров.

::: tip NOTE

Ожидается, что с конфигурацией по умолчанию обратные прокси перед Vite будут поддерживать прокси -сокет. Если клиент Vite HMR не сможет подключить WebSocket, клиент вернется к подключению WebSocket непосредственно к серверу Vite HMR, перепускающему обратные прокси:

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

Ошибка, которая появляется в браузере, когда происходит запасная сторона, может быть проигнорирована. Чтобы избежать ошибки, непосредственно обойдя обратные прокси, вы могли бы либо:

- Настройте обратный прокси на прокси -сокет
- Установите [`server.strictPort = true`](#server-strictport) и установите `server.hmr.clientPort` на то же значение с `server.port`
- Установите `server.hmr.port` на другое значение от [`server.port`](#server-port)

:::

## server.warmup

- **Тип:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **Связанный:** [разминка часто используемые файлы](/en/guide/performance.html#warm-up-frequently-used-files)

Разогрейте файлы, чтобы преобразовать и кэшировать результаты заранее. Это улучшает начальную загрузку страницы во время запуска сервера и предотвращает преобразование водопадов.

`clientFiles` - это файлы, которые используются только в клиенте, а `ssrFiles` - это файлы, которые используются только в SSR. Они принимают массив путей файла или [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) шаблона относительно `root` .

Убедитесь, что добавьте только файлы, которые часто используются, чтобы не перегружать сервер Vite Dev при запуске.

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **Тип:** `Объект | null`

Параметры наблюдателя за файловой системой, чтобы перейти к [Chokidar](https://github.com/paulmillr/chokidar/tree/3.6.0#api) .

Сервер Vite Server Watcher наблюдает за `root` и пропускает каталоги `.git/` , `node_modules/` и Vite `cacheDir` и `build.outDir` по умолчанию. При обновлении просмотренного файла VITE будет применять HMR и обновить страницу только при необходимости.

Если установлено в `null` , файлы не будут смотреть. `server.watcher` предоставит совместимый излучатель событий, но вызов `add` или `unwatch` не окажет никакого эффекта.

::: warning Watching files in `node_modules`

В настоящее время невозможно смотреть файлы и пакеты в `node_modules` . Для дальнейшего прогресса и обходных путей вы можете следовать [проблеме № 8619](https://github.com/vitejs/vite/issues/8619) .

:::

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

При запуске VITE на WSL2 просмотр файловых систем не работает, когда файл редактируется приложениями Windows (процесс без WSL2). Это связано с [ограничением WSL2](https://github.com/microsoft/WSL/issues/4739) . Это также относится к запуску на Docker с бэкэнд WSL2.

Чтобы исправить это, вы могли бы либо:

- **Рекомендуется** : используйте приложения WSL2 для редактирования ваших файлов.
  - Также рекомендуется переместить папку проекта за пределами файловой системы Windows. Доступ к файловой системе Windows от WSL2 медленный. Удаление этого накладных расходов улучшит производительность.
- Установить `{ usePolling: true }` .
  - Обратите внимание, что [`usePolling` приводит к высокой загрузке процессора](https://github.com/paulmillr/chokidar/tree/3.6.0#performance) .

:::

## server.middlewareMode

- **Тип:** `boolean`
- **По умолчанию:** `false`

Создайте сервер VITE в режиме промежуточного программного обеспечения.

- **Связанный:** [Apptype](./shared-options#apptype) , [SSR - Настройка Dev Server](/en/guide/ssr#setting-up-the-dev-server)

- **Пример:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // Создать сервер VITE в режиме промежуточного программного обеспечения
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // Не включайте HTML -обработку HTML по умолчанию Vite
    appType: 'custom',
  })
  // Используйте экземпляр подключения Vite в качестве промежуточного программного обеспечения
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Поскольку `appType` - `'custom'` , должен служить ответу здесь.
    // Примечание. Если `appType` - `'spa'` или `'mpa'` , Vite включает в себя средние стороны
    // Для обработки HTML -запросов и 404 с.
    // Перед Middlewares Vite вступить в силу
  })
}

createServer()
```

## server.fs.strict

- **Тип:** `boolean`
- **По умолчанию:** `true` (включено по умолчанию с момента VITE 2.7)

Ограничить обслуживающие файлы за пределами корня рабочей области.

## server.fs.allow

- **Тип:** `string[]`

Ограничивают файлы, которые могут быть поданы через `/@fs/` . Когда `server.fs.strict` установлен на `true` , доступ к файлам вне этого списка каталогов, которые не импортируются из разрешенного файла, приведет к 403.

Как каталоги, так и файлы могут быть предоставлены.

VITE будет искать корень потенциального рабочего пространства и использовать его в качестве по умолчанию. Действительное рабочее пространство соответствовало следующим условиям, в противном случае вернутся к [корне проекта](/en/guide/#index-html-and-project-root) .

- содержит `workspaces` поле в `package.json`
- содержит один из следующих файлов
  - `lerna.json`
  - `pnpm-workspace.yaml`

Принимает путь, чтобы указать корень на пользовательский рабочее пространство. Может быть абсолютный путь или путь относительно [корня проекта](/en/guide/#index-html-and-project-root) . Например:

```js
export default defineConfig({
  server: {
    fs: {
      // Разрешить обслуживание файлов с одного уровня до корнета проекта
      allow: ['..'],
    },
  },
})
```

Когда будет указано `server.fs.allow` , обнаружение корня автозапрофона будет отключено. Чтобы расширить исходное поведение, выставлена утилита `searchForWorkspaceRoot` :

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // Ищите корень рабочего пространства
        searchForWorkspaceRoot(process.cwd()),
        // Ваши пользовательские правила
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **Тип:** `string[]`
- **По умолчанию:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

BlockList для конфиденциальных файлов, ограниченных для обслуживания Vite Dev Server. Это будет иметь более высокий приоритет, чем [`server.fs.allow`](#server-fs-allow) . [Образец Picomatch](https://github.com/micromatch/picomatch#globbing-features) поддерживаются.

## server.origin

- **Тип:** `string`

Определяет происхождение сгенерированных URL -адресов актива во время разработки.

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **Тип:** `false | (Sourcepatath: String, Sourcemappath: String) => Boolean`
- **По умолчанию:** `(sourcePath) => sourcePath.includes('node_modules')`

Независимо от того, игнорировать исходные файлы в сервере Sourcemap, используемый для заполнения [расширения карты исходной карты `x_google_ignoreList`](https://developer.chrome.com/articles/x-google-ignore-list/) .

`server.sourcemapIgnoreList` - эквивалент [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) для сервера DEV. Разница между двумя параметрами конфигурации заключается в том, что функция подсказования вызывается с относительным путем для `sourcePath` , а `server.sourcemapIgnoreList` вызывается абсолютным путем. Во время DEV большинство модулей имеют карту и источник в одной и той же папке, поэтому относительный путь для `sourcePath` - это имя файла. В этих случаях абсолютные пути делают удобным для использования.

По умолчанию он исключает все пути, содержащие `node_modules` . Вы можете пройти `false` чтобы отключить это поведение или, для полного управления, функцию, которая берет путь исходного пути и пути Sourcemap и возвращает, игнорировать ли путь источника.

```js
export default defineConfig({
  server: {
    // Это значение по умолчанию и добавит все файлы с помощью node_modules
    // на их пути к списку игнорирования.
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Note
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist) и [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) должны быть установлены независимо. `server.sourcemapIgnoreList` - это конфигурация только сервера и не получает его значения по умолчанию из определенных параметров подключения.
:::
