# Serveroptionen

Sofern nicht angegeben, werden die Optionen in diesem Abschnitt nur auf Dev angewendet.

## server.host

- **Typ:** `String | boolean`
- **Standard:** `'localhost'`

Geben Sie an, welche IP -Adressen der Server anhören soll.
Legen Sie dies auf `0.0.0.0` oder `true` ein, um alle Adressen, einschließlich LAN- und öffentlichen Adressen, zuzuhören.

Dies kann über die CLI mit `--host 0.0.0.0` oder `--host` eingestellt werden.

::: tip NOTE

Es gibt Fälle, in denen andere Server anstelle von VITE reagieren könnten.

Der erste Fall ist, wenn `localhost` verwendet wird. Node.js unter v17 leistet das Ergebnis standardmäßig von DNS-aufgelöste Adressen an. Beim Zugriff `localhost` verwenden Browser DNS, um die Adresse zu beheben, und diese Adresse kann sich von der Adresse unterscheiden, die VITE anhört. VITE druckt die gelöste Adresse, wenn sie sich unterscheidet.

Sie können [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order) festlegen, um das Nachbestellverhalten zu deaktivieren. Vite druckt dann die Adresse als `localhost` aus.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // auslassen
})
```

Der zweite Fall ist, wenn Wildcard -Hosts (z. B. `0.0.0.0` ) verwendet werden. Dies liegt daran, dass Server, die auf Nicht-Wild-Kard-Hosts hören, Vorrang vor den Hören von Wildcard-Hosts haben.

:::

::: tip Accessing the server on WSL2 from your LAN

Wenn Sie VITE auf WSL2 ausführen, reicht es nicht aus, um `host: true` zu setzen, um auf den Server von Ihrem LAN aus zuzugreifen.
Weitere Informationen finden Sie [im WSL -Dokument](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan) .

:::

## server.allowedHosts

- **Typ:** `String [] | wahr "
- **Standard:** `[]`

Die Hostnamen, auf die Vite reagieren dürfen.
`localhost` und Domänen unter `.localhost` und alle IP -Adressen sind standardmäßig zulässig.
Bei der Verwendung von HTTPS wird diese Prüfung übersprungen.

Wenn eine Zeichenfolge mit `.` beginnt, lässt sie diesen Hostnamen ohne die `.` und alle Subdomains unter dem Hostnamen zu. Zum Beispiel erlaubt `.example.com` `example.com` , `foo.example.com` und `foo.bar.example.com` . Wenn der Server auf `true` festgelegt ist, darf er auf Anfragen für Hosts antworten.

::: details What hosts are safe to be added?

Hosts, die die Kontrolle darüber haben, welche IP -Adressen sie lösen, sind sicher, um die Liste der zulässigen Hosts hinzuzufügen.

Wenn Sie beispielsweise eine Domain `vite.dev` besitzen, können Sie der Liste `vite.dev` und `.vite.dev` hinzufügen. Wenn Sie diese Domain nicht besitzen und dem Eigentümer dieser Domain nicht vertrauen können, sollten Sie sie nicht hinzufügen.

Insbesondere sollten Sie niemals Top-Level-Domänen wie `.com` zur Liste hinzufügen. Dies liegt daran, dass jeder eine Domain wie `example.com` kaufen und die IP -Adresse steuern kann, die er behebt.

:::

::: danger

Durch das Einstellen `server.allowedHosts` bis `true` kann jede Website Anfragen über DNS -Rebinding -Angriffe an Ihren Dev -Server senden, sodass sie Ihren Quellcode und Ihren Inhalt herunterladen können. Wir empfehlen immer, eine explizite Liste der zulässigen Hosts zu verwenden. Weitere Informationen finden Sie unter [GHSA-VG6X-RCGG-RJX6](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6) .

:::

::: details Configure via environment variable
Sie können die Umgebungsvariable `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` festlegen, um einen zusätzlichen zulässigen Host hinzuzufügen.
:::

## server.port

- **Typ:** `number`
- **Standard:** `5173`

Serverport angeben. Hinweis Wenn der Port bereits verwendet wird, wird VITE automatisch den nächsten verfügbaren Port aus versucht, sodass dies möglicherweise nicht der tatsächliche Port ist, den der Server am Ende hört.

## server.strictPort

- **Typ:** `boolean`

Setzen Sie auf `true` um zu beenden, wenn der Port bereits verwendet wird, anstatt den nächsten verfügbaren Port automatisch zu versuchen.

## server.https

- **Typ:** `https.ServerOptions`

Aktivieren Sie TLS + HTTP/2. Beachten Sie, dass diese Heruntergrades nur dann auf TLS herabstreift, wenn auch die [`server.proxy` -Option](#server-proxy) verwendet wird.

Der Wert kann auch ein [Optionsobjekt](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) sein, das an `https.createServer()` übergeben wurde.

Ein gültiges Zertifikat ist erforderlich. Für ein grundlegendes Setup können Sie den Projekt-Plugins [@viteJS/Plugin-Basic-SSL](https://github.com/vitejs/vite-plugin-basic-ssl) hinzufügen, die automatisch ein selbstsigniertes Zertifikat erstellen und zwischenspeichern. Wir empfehlen jedoch, eigene Zertifikate zu erstellen.

## server.open

- **Typ:** `boolean | String`

Öffnen Sie die App automatisch im Browser auf dem Serverstart. Wenn der Wert eine Zeichenfolge ist, wird er als Pfadname der URL verwendet. Wenn Sie den Server in einem bestimmten Browser öffnen möchten, können Sie die Env `process.env.BROWSER` festlegen (z. B. `firefox` ). Sie können auch `process.env.BROWSER_ARGS` festlegen, um zusätzliche Argumente zu verabschieden (z. B. `--incognito` ).

`BROWSER` und `BROWSER_ARGS` sind auch spezielle Umgebungsvariablen, die Sie in der `.env` -Datei festlegen können, um sie zu konfigurieren. Weitere Informationen finden Sie [im `open` -Paket](https://github.com/sindresorhus/open#app) .

**Beispiel:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **Typ:** `record <String, String | Proxyoptionen> `

Konfigurieren Sie benutzerdefinierte Proxy -Regeln für den Dev -Server. Erwartet ein Objekt von `{ key: options }` Paaren. Alle Anforderungen, die mit diesem Schlüssel beginnt, werden an diesem angegebenen Ziel verteilt. Wenn der Schlüssel mit `^` beginnt, wird er als `RegExp` interpretiert. Die `configure` -Option kann verwendet werden, um auf die Proxy -Instanz zuzugreifen. Wenn eine Anforderung einer der konfigurierten Proxy -Regeln entspricht, wird die Anfrage nicht per VITE transformiert.

Beachten Sie, dass Sie, wenn Sie nicht-relative [`base`](/de/config/shared-options.md#base) verwenden, jeden Schlüssel mit dieser `base` Präfix.

Erstreckt sich [`http-proxy`](https://github.com/http-party/node-http-proxy#options) . Zusätzliche Optionen sind [da](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13) .

In einigen Fällen möchten Sie möglicherweise auch den zugrunde liegenden Dev -Server konfigurieren (z. B. um der internen [Verbindungs](https://github.com/senchalabs/connect) -App benutzerdefinierte Middlewares hinzuzufügen). Um dies zu tun, müssen Sie Ihr eigenes [Plugin](/de/guide/using-plugins.html) schreiben und [Konfiguriererver](/de/guide/api-plugin.html#configureserver) -Funktion verwenden.

**Beispiel:**

```js
export default defineConfig({
  server: {
    proxy: {
      // String ShortHand:
      // http: // localhost: 5173/foo
      //   -> [http: // localhost: 4567/foo](http://localhost:4567/foo)
      '/foo': 'http://localhost:4567',
      // mit Optionen:
      // http: // localhost: 5173/api/bar
      //   -> [http://jsonplaceholder.typicode.com/bar](http://jsonplaceholder.typicode.com/bar)
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // mit Regexp:
      // http: // localhost: 5173/Fallback/
      //   -> [http://jsonplaceholder.typicode.com/](http://jsonplaceholder.typicode.com/)
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // Verwenden der Proxy -Instanz
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Proxy wird eine Instanz von 'http-proxy' sein
        },
      },
      // Proxying Websockets oder Socket.io:
      // WS: // localhost: 5173/socket.io
      //   -> WS: // localhost: 5174/socket.io
      // Vorsicht wenden Sie mit `rewriteWsOrigin` , da es das verlassen kann
      // Stellvertretung für CSRF -Angriffe.
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

- **Typ:** `boolean | Corsoptions '
- **Standard:** `{Origin: /^https?://(?:(?:;|127\.0\.0\.1|[:: 1]) (? :: \ d+)? $/}  127.0.0.1  :: 1`)

Konfigurieren Sie CORs für den Dev -Server. Geben Sie ein [Optionsobjekt](https://github.com/expressjs/cors#configuration-options) über, um das Verhalten oder `true` zu beenden, um Ursprungs zuzulassen.

::: danger

Durch das Einstellen `server.cors` bis `true` kann jede Website Anforderungen an Ihren Dev -Server senden und Ihren Quellcode und Ihren Inhalt herunterladen. Wir empfehlen immer, eine explizite Liste der zulässigen Ursprünge zu verwenden.

:::

## server.headers

- **Typ:** `OutgoingHttpHeaders`

Geben Sie Server -Antwort -Header an.

## server.hmr

- **Typ:** `boolean | {Protocol ?: String, Host ?: String, Port ?: Number, Pfad ?: String, Timeout ?: Number, Overlay ?: Boolean, ClientPort?

Deaktivieren oder konfigurieren Sie die HMR -Verbindung (in Fällen, in denen das HMR WebSocket eine andere Adresse als HTTP -Server verwenden muss).

Legen Sie `server.hmr.overlay` auf `false` ein, um das Serverfehler -Overlay zu deaktivieren.

`protocol` Legt das für die HMR -Verbindung verwendete WebSocket -Protokoll fest: `ws` (WebSocket) oder `wss` (WebSocket Secure).

`clientPort` ist eine erweiterte Option, die den Port nur auf der Client -Seite überschreibt, sodass Sie das WebSocket auf einem anderen Port bedienen können, als der Clientcode dafür sucht.

Wenn `server.hmr.server` definiert ist, verarbeitet VITE die HMR -Verbindungsanforderungen über den bereitgestellten Server. Wenn nicht im Middleware -Modus, versucht VITE, HMR -Verbindungsanforderungen über den vorhandenen Server zu verarbeiten. Dies kann hilfreich sein, wenn Sie selbstsignierte Zertifikate verwenden oder wenn Sie VITE über ein Netzwerk in einem einzigen Port aufdecken möchten.

Schauen Sie sich [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue) für einige Beispiele an.

::: tip NOTE

Bei der Standardkonfiguration wird erwartet, dass Reverse Proxies vor Vite Proxying -Websocket unterstützen. Wenn der Vite -HMR -Client WebSocket nicht verbindet, greift der Client zurück, um das WebSocket direkt an den Vite -HMR -Server zu verbinden und die Reverse Proxies zu umgehen:

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

Der Fehler, der im Browser erscheint, wenn der Fallback stattfindet, kann ignoriert werden. Um den Fehler zu vermeiden, indem Sie direkt umgekehrte Proxys umgehen, können Sie entweder:

- Konfigurieren Sie auch den Reverse -Proxy auf Proxy Websocket
- Setzen Sie [`server.strictPort = true`](#server-strictport) und setzen Sie `server.hmr.clientPort` auf denselben Wert mit `server.port`
- Setzen Sie `server.hmr.port` auf einen anderen Wert als [`server.port`](#server-port)

:::

## server.warmup

- **Typ:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **Verwandte:** [Aufwärmen häufig verwendete Dateien aufwärmen](/de/guide/performance.html#warm-up-frequently-used-files)

Warmen Dateien aufwärmen, um die Ergebnisse im Voraus zu transformieren und zwischenzuspeichern. Dies verbessert die anfängliche Seitenlast während des Serverstarts und verhindert Transformation Wasserfälle.

`clientFiles` sind Dateien, die nur im Client verwendet werden, während `ssrFiles` Dateien nur in SSR verwendet werden. Sie akzeptieren eine Reihe von Dateipfaden oder [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) Muster in Bezug auf die `root` .

Stellen Sie sicher, dass nur Dateien hinzugefügt werden, die häufig verwendet werden, um den Vite Dev -Server beim Start nicht zu überladen.

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

- **Typ:** `Objekt | null`

Dateisystem -Beobachteroptionen zum Weitergeben an [Chokidar](https://github.com/paulmillr/chokidar/tree/3.6.0#api) .

Der Vite -Server -Beobachter beobachtet die `root` und überspringt standardmäßig die `cacheDir` und `build.outDir` -Verzeichnisse von `.git/` , `node_modules/` und Vite. Bei der Aktualisierung einer angesehenen Datei wendet Vite HMR an und aktualisiert die Seite nur bei Bedarf.

Wenn auf `null` gesetzt, werden keine Dateien angesehen. `server.watcher` liefert einen kompatiblen Ereignisemitter, aber die Rufnummer `add` oder `unwatch` hat keinen Einfluss.

::: warning Watching files in `node_modules`

Derzeit ist es nicht möglich, Dateien und Pakete in `node_modules` anzusehen. Für weitere Fortschritte und Problemumgehungen können Sie [Ausgabe Nr. 8619](https://github.com/vitejs/vite/issues/8619) befolgen.

:::

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

Beim Ausführen von Vite auf WSL2 funktioniert das Dateisystembeobachten nicht, wenn eine Datei von Windows-Anwendungen bearbeitet wird (Nicht-WSL2-Prozess). Dies ist auf [eine WSL2 -Einschränkung](https://github.com/microsoft/WSL/issues/4739) zurückzuführen. Dies gilt auch für das Laufen auf Docker mit einem WSL2 -Backend.

Um es zu beheben, könnten Sie entweder:

- **Empfohlen** : Verwenden Sie WSL2 -Anwendungen, um Ihre Dateien zu bearbeiten.
  - Es wird auch empfohlen, den Projektordner außerhalb eines Windows -Dateisystems zu verschieben. Der Zugriff auf Windows -Dateisystem von WSL2 ist langsam. Das Entfernen dieses Gemeinkostens verbessert die Leistung.
- SET `{ usePolling: true }` .
  - Beachten Sie, dass [`usePolling` zu einer hohen CPU -Nutzung führt](https://github.com/paulmillr/chokidar/tree/3.6.0#performance) .

:::

## server.middlewareMode

- **Typ:** `boolean`
- **Standard:** `false`

Erstellen Sie Vite Server im Middleware -Modus.

- **Verwandte:** [AppType](./shared-options#apptype) , [SSR - Einrichten des Dev -Servers einrichten](/de/guide/ssr#setting-up-the-dev-server)

- **Beispiel:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // Erstellen Sie Vite Server im Middleware -Modus
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // Fügen Sie nicht Vite's Standard HTML -Handling Middlewares mit
    appType: 'custom',
  })
  // Verwenden Sie die Connect -Instanz von Vite als Middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Da `appType` `'custom'` ist, sollte hier eine Antwort dienen.
    // Hinweis: Wenn `appType` `'spa'` oder `'mpa'` ist, enthält vite Middlewares
    // Um HTML -Anfragen und 404s zu bearbeiten, sollten die Middlewares der Benutzer hinzugefügt werden
    // vor Vite's Middlewares, stattdessen wirksam zu werden
  })
}

createServer()
```

## server.fs.strict

- **Typ:** `boolean`
- **Standard:** `true` (standardmäßig aktiviert seit Vite 2.7)

Beschränken Sie die Servierdateien außerhalb des Arbeitsbereichs Root.

## server.fs.allow

- **Typ:** `string[]`

Beschränken Sie Dateien, die über `/@fs/` bedient werden könnten. Wenn `server.fs.strict` auf `true` gesetzt ist, greift der Zugriff auf Dateien außerhalb dieser Verzeichnisliste, die nicht aus einer zulässigen Datei importiert werden, zu einem 403.

Sowohl Verzeichnisse als auch Dateien können bereitgestellt werden.

VITE sucht nach dem Stamm des potenziellen Arbeitsbereichs und verwendet ihn standardmäßig. Ein gültiger Arbeitsbereich erfüllte die folgenden Bedingungen, ansonsten fällt auf die [Projektwurzel](/de/guide/#index-html-and-project-root) zurück.

- Enthält `workspaces` Feld in `package.json`
- Enthält eine der folgenden Dateien
  - `lerna.json`
  - `pnpm-workspace.yaml`

Akzeptiert einen Pfad, um das benutzerdefinierte Arbeitsbereich aufzugeben. Könnte ein absoluter Weg oder ein Pfad relativ zur [Projektwurzel](/de/guide/#index-html-and-project-root) sein. Zum Beispiel:

```js
export default defineConfig({
  server: {
    fs: {
      // Ermöglichen Sie das Servieren von Dateien von einer Stufe bis zum Projektstamm
      allow: ['..'],
    },
  },
})
```

Wenn `server.fs.allow` angegeben ist, wird die Root -Erkennung des Auto -Arbeitsbereichs deaktiviert. Um das ursprüngliche Verhalten zu erweitern, wird ein Dienstprogramm `searchForWorkspaceRoot` freigelegt:

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // Suchen Sie nach Arbeitsbereichswurzel
        searchForWorkspaceRoot(process.cwd()),
        // Ihre benutzerdefinierten Regeln
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **Typ:** `string[]`
- **Standard:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

Blockliste für sensible Dateien, die von Vite Dev Server bedient werden. Dies hat eine höhere Priorität als [`server.fs.allow`](#server-fs-allow) . [Picomatch -Muster](https://github.com/micromatch/picomatch#globbing-features) werden unterstützt.

## server.origin

- **Typ:** `string`

Definiert den Ursprung der erzeugten Asset -URLs während der Entwicklung.

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **Typ:** `false | (SourcePath: String, SourcemAppath: String) => boolean``
- **Standard:** `(sourcePath) => sourcePath.includes('node_modules')`

Ob Sie die Quelldateien in der Server -Sourcemap ignorieren oder nicht, um die [Erweiterung der `x_google_ignoreList` Quellkarte](https://developer.chrome.com/articles/x-google-ignore-list/) zu füllen.

`server.sourcemapIgnoreList` ist das Äquivalent von [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) für den Dev -Server. Ein Unterschied zwischen den beiden Konfigurationsoptionen besteht darin, dass die Rollup -Funktion mit einem relativen Pfad für `sourcePath` aufgerufen wird, während `server.sourcemapIgnoreList` mit einem absoluten Pfad aufgerufen wird. Während des Devs haben die meisten Module die Karte und die Quelle im selben Ordner, sodass der relative Pfad für `sourcePath` der Dateiname selbst ist. In diesen Fällen macht es absolute Pfade bequem, stattdessen verwendet zu werden.

Standardmäßig schließt es alle Pfade mit `node_modules` aus. Sie können `false` übergeben, um dieses Verhalten zu deaktivieren, oder um eine vollständige Funktion zu erhalten, die den Quellpfad und den Sourcemap -Pfad übernimmt und zurückgibt, ob der Quellpfad ignoriert werden soll.

```js
export default defineConfig({
  server: {
    // Dies ist der Standardwert und fügt alle Dateien mit node_modules hinzu
    // auf ihren Wegen zur Ignorierliste.
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Note
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist) und [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) müssen unabhängig eingestellt werden. `server.sourcemapIgnoreList` ist nur eine Serverkonfiguration und erhält seinen Standardwert nicht von den definierten Rollup -Optionen.
:::
