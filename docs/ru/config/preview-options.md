# Параметры Предварительного Просмотра

Если не указано, параметры в этом разделе применяются только к предварительному просмотру.

## preview.host

- **Тип:** `string | логический
- **По умолчанию:** [`server.host`](./server-options#server-host)

Укажите, какие IP -адреса должен слушать сервер.
Установите это на `0.0.0.0` или `true` , чтобы прослушать все адреса, включая LAN и публичные адреса.

Это может быть установлено через CLI, используя `--host 0.0.0.0` или `--host` .

::: tip NOTE

Есть случаи, когда другие серверы могут ответить вместо VITE.
Смотрите [`server.host`](./server-options#server-host) для более подробной информации.

:::

## preview.allowedHosts

- **Тип:** `string | правда
- **По умолчанию:** [`server.allowedHosts`](./server-options#server-allowedhosts)

Имена хоста, на которые можно ответить.

Смотрите [`server.allowedHosts`](./server-options#server-allowedhosts) для более подробной информации.

## preview.port

- **Тип:** `number`
- **По умолчанию:** `4173`

Укажите порт сервера. Примечание Если порт уже используется, Vite автоматически пробует следующий доступный порт, так что это может быть не фактический порт, который сервер заканчивает.

**Пример:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

- **Тип:** `boolean`
- **По умолчанию:** [`server.strictPort`](./server-options#server-strictport)

Установите на `true` для выхода, если порт уже используется, вместо того, чтобы автоматически пробовать следующий доступный порт.

## preview.https

- **Тип:** `https.ServerOptions`
- **По умолчанию:** [`server.https`](./server-options#server-https)

Включить TLS + http/2. Обратите внимание на это понижение до TLS только при использовании [опции `server.proxy`](./server-options#server-proxy) .

Значение также может быть [объектом параметров,](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) передаваемых `https.createServer()` .

## preview.open

- **Тип:** `Boolean | String`.
- **По умолчанию:** [`server.open`](./server-options#server-open)

Автоматически откройте приложение в браузере при запуске сервера. Когда значение является строкой, оно будет использоваться в качестве пути пути URL. Если вы хотите открыть сервер в конкретном браузере, который вам нравится, вы можете установить Env `process.env.BROWSER` (например, `firefox` ). Вы также можете установить `process.env.BROWSER_ARGS` для передачи дополнительных аргументов (например, `--incognito` ).

`BROWSER` и `BROWSER_ARGS` также являются специальными переменными среды, которые вы можете установить в `.env` файле для его настройки. Смотрите [`open` пакета](https://github.com/sindresorhus/open#app) для более подробной информации.

## preview.proxy

- **Тип:** `record <строка, строка | Проксиопции> `
- **По умолчанию:** [`server.proxy`](./server-options#server-proxy)

Настройте пользовательские правила прокси для сервера предварительного просмотра. Ожидает объект из `{ key: options }` пар. Если ключ начинается с `^` , он будет интерпретироваться как `RegExp` . Вариант `configure` можно использовать для доступа к экземпляру прокси.

Использует [`http-proxy`](https://github.com/http-party/node-http-proxy) . Полные варианты [здесь](https://github.com/http-party/node-http-proxy#options) .

## preview.cors

- **Тип:** `Boolean | Корсопции
- **По умолчанию:** [`server.cors`](./server-options#server-cors)

Настройте COR для сервера предварительного просмотра.

Смотрите [`server.cors`](./server-options#server-cors) для более подробной информации.

## preview.headers

- **Тип:** `OutgoingHttpHeaders`

Укажите заголовки ответов на сервер.
