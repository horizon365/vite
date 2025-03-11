# Vorschauoptionen

Sofern nicht angegeben, werden die Optionen in diesem Abschnitt nur auf die Vorschau angewendet.

## preview.host

- **Typ:** `String | boolean`
- **Standard:** [`server.host`](./server-options#server-host)

Geben Sie an, welche IP -Adressen der Server anhören soll.
Legen Sie dies auf `0.0.0.0` oder `true` ein, um alle Adressen, einschließlich LAN- und öffentlichen Adressen, zuzuhören.

Dies kann über die CLI mit `--host 0.0.0.0` oder `--host` eingestellt werden.

::: tip NOTE

Es gibt Fälle, in denen andere Server anstelle von VITE reagieren könnten.
Weitere Informationen finden Sie unter [`server.host`](./server-options#server-host) .

:::

## preview.allowedHosts

- **Typ:** `String | wahr "
- **Standard:** [`server.allowedHosts`](./server-options#server-allowedhosts)

Die Hostnamen, auf die Vite reagieren dürfen.

Weitere Informationen finden Sie unter [`server.allowedHosts`](./server-options#server-allowedhosts) .

## preview.port

- **Typ:** `number`
- **Standard:** `4173`

Serverport angeben. Hinweis Wenn der Port bereits verwendet wird, wird VITE automatisch den nächsten verfügbaren Port aus versucht, sodass dies möglicherweise nicht der tatsächliche Port ist, den der Server am Ende hört.

**Beispiel:**

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

- **Typ:** `boolean`
- **Standard:** [`server.strictPort`](./server-options#server-strictport)

Setzen Sie auf `true` um zu beenden, wenn der Port bereits verwendet wird, anstatt den nächsten verfügbaren Port automatisch zu versuchen.

## preview.https

- **Typ:** `https.ServerOptions`
- **Standard:** [`server.https`](./server-options#server-https)

Aktivieren Sie TLS + HTTP/2. Beachten Sie, dass diese Heruntergrades nur dann auf TLS herabstreift, wenn auch die [`server.proxy` -Option](./server-options#server-proxy) verwendet wird.

Der Wert kann auch ein [Optionsobjekt](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) sein, das an `https.createServer()` übergeben wurde.

## preview.open

- **Typ:** `boolean | String`
- **Standard:** [`server.open`](./server-options#server-open)

Öffnen Sie die App automatisch im Browser auf dem Serverstart. Wenn der Wert eine Zeichenfolge ist, wird er als Pfadname der URL verwendet. Wenn Sie den Server in einem bestimmten Browser öffnen möchten, können Sie die Env `process.env.BROWSER` festlegen (z. B. `firefox` ). Sie können auch `process.env.BROWSER_ARGS` festlegen, um zusätzliche Argumente zu verabschieden (z. B. `--incognito` ).

`BROWSER` und `BROWSER_ARGS` sind auch spezielle Umgebungsvariablen, die Sie in der `.env` -Datei festlegen können, um sie zu konfigurieren. Weitere Informationen finden Sie [im `open` -Paket](https://github.com/sindresorhus/open#app) .

## preview.proxy

- **Typ:** `record <String, String | Proxyoptionen> `
- **Standard:** [`server.proxy`](./server-options#server-proxy)

Konfigurieren Sie benutzerdefinierte Proxy -Regeln für den Vorschau -Server. Erwartet ein Objekt von `{ key: options }` Paaren. Wenn der Schlüssel mit `^` beginnt, wird er als `RegExp` interpretiert. Die `configure` -Option kann verwendet werden, um auf die Proxy -Instanz zuzugreifen.

Verwendet [`http-proxy`](https://github.com/http-party/node-http-proxy) . Vollständige Optionen [hier](https://github.com/http-party/node-http-proxy#options) .

## preview.cors

- **Typ:** `boolean | Corsoptions '
- **Standard:** [`server.cors`](./server-options#server-cors)

Konfigurieren Sie CORs für den Vorschau -Server.

Weitere Informationen finden Sie unter [`server.cors`](./server-options#server-cors) .

## preview.headers

- **Typ:** `OutgoingHttpHeaders`

Geben Sie Server -Antwort -Header an.
