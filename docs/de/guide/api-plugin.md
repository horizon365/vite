# Plugin -API

VITE-Plugins erweitert die gut gestaltete Plugin-Schnittstelle von Rollup mit einigen zusätzlichen vite-spezifischen Optionen. Infolgedessen können Sie einmal ein vite -Plugin schreiben und es sowohl für Dev als auch für Build funktionieren lassen.

**Es wird empfohlen, zuerst [die Plugin -Dokumentation von Rollup](https://rollupjs.org/plugin-development/) zu durchlaufen, bevor die folgenden Abschnitte gelesen werden.**

## Ein Plugin erstellen

VITE ist bestrebt, festgelegte Muster in der Box anzubieten. Bevor Sie ein neues Plugin erstellen, überprüfen Sie die [Features -Anleitung,](https://vite.dev/guide/features) um festzustellen, ob Ihr Bedarf abgedeckt ist. Überprüfen Sie auch verfügbare Community -Plugins, sowohl in Form eines [kompatiblen Rollup -Plugins](https://github.com/rollup/awesome) als auch [in vite spezifischen Plugins](https://github.com/vitejs/awesome-vite#plugins)

Beim Erstellen eines Plugins können Sie es in Ihre `vite.config.js` einführen. Es ist nicht erforderlich, ein neues Paket dafür zu erstellen. Sobald Sie sehen, dass ein Plugin in Ihren Projekten nützlich war, sollten Sie es teilen, um anderen [im Ökosystem](https://chat.vite.dev) zu helfen.

::: tip
Beim Lernen, Debuggen oder Autoring-Plugins empfehlen wir, in Ihrem Projekt [einen vite-plugin-Inspektiven](https://github.com/antfu/vite-plugin-inspect) in Einklang zu bringen. Sie können den Zwischenzustand von VITE -Plugins inspizieren. Nach der Installation können Sie `localhost:5173/__inspect/` besuchen, um die Module und den Transformationsstapel Ihres Projekts zu inspizieren. In den [VITE-Plugin-Inspect-Dokumenten](https://github.com/antfu/vite-plugin-inspect) finden Sie die Installationsanweisungen.
![Vite-Plugin-Inspektion](/images/vite-plugin-inspect.png)
:::

## Konventionen

Wenn das Plugin keine vite -spezifischen Hooks verwendet und als [kompatibles Rollup -Plugin](#rollup-plugin-compatibility) implementiert werden kann, wird empfohlen, die [Konventionen für Rollup -Plugin](https://rollupjs.org/plugin-development/#conventions) zu verwenden.

- Rollup -Plugins sollte einen klaren Namen mit `rollup-plugin-` Präfix haben.
- Fügen Sie `rollup-plugin` und `vite-plugin` Schlüsselwörter in package.json ein.

Dadurch wird das Plugin enthüllt, das auch in reinen Rollup- oder WMR -basierten Projekten verwendet werden soll

Für vite nur Plugins

- VITE -Plugins sollten einen klaren Namen mit `vite-plugin-` Präfix haben.
- `vite-plugin` Keyword in package.json eingeben.
- Geben Sie einen Abschnitt in die Plugin -Dokumente ein, in der detailliert beschrieben wird, warum es sich um ein nur ein VITE -Plugin handelt (z. B. verwendet es vite -spezifische Plugin -Hooks).

Wenn Ihr Plugin nur für ein bestimmtes Framework funktioniert, sollte sein Name als Teil des Präfixs enthalten sein

- `vite-plugin-vue-` Präfix für Vue -Plugins
- `vite-plugin-react-` Präfix für React -Plugins
- `vite-plugin-svelte-` Präfix für Svelte -Plugins

Siehe auch [Virtual Modules Convention](#virtual-modules-convention) .

## Plugins config

Benutzer fügen dem Projekt `devDependencies` Plugins hinzu und konfigurieren sie mithilfe der `plugins` -Array -Option.

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

Falsy -Plugins werden ignoriert, mit denen Plugins einfach aktiviert oder deaktiviert werden können.

`plugins` akzeptiert auch Voreinstellungen, einschließlich mehrerer Plugins als einzelnes Element. Dies ist nützlich für komplexe Funktionen (z. B. Framework -Integration), die mit mehreren Plugins implementiert werden. Das Array wird intern abgeflacht.

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

## Einfache Beispiele

:::tip
Es ist üblich, ein Vite/Rollup -Plugin als Fabrikfunktion zu erstellen, das das tatsächliche Plugin -Objekt zurückgibt. Die Funktion kann Optionen akzeptieren, mit denen Benutzer das Verhalten des Plugins anpassen können.
:::

### Transformieren Benutzerdefinierte Dateitypen

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // Geben Sie die Quellkarte an, falls verfügbar
        }
      }
    },
  }
}
```

### Importieren Einer Virtuellen Datei

Siehe das Beispiel im [nächsten Abschnitt](#virtual-modules-convention) .

## Virtual Module Convention

Virtuelle Module sind ein nützliches Schema, mit dem Sie mit der normalen ESM -Import -Syntax an die Ausgangsdateien an die Quelldateien weitergeleitet werden können.

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // Erforderlich, wird in Warnungen und Fehlern angezeigt
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

Dies ermöglicht das Importieren des Moduls in JavaScript:

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Virtuelle Module in vite (und rollup) werden mit `virtual:` für den benutzergerichteten Pfad durch die Konvention vorangestellt. Wenn möglich, sollte der Plugin -Name als Namespace verwendet werden, um Kollisionen mit anderen Plugins im Ökosystem zu vermeiden. Beispielsweise könnte ein `vite-plugin-posts` die Benutzer auffordern, `virtual:posts` oder `virtual:posts/helpers` virtuelle Module zu importieren, um Zeitinformationen zu erstellen. Innen sollten Plugins, die virtuelle Module verwenden, die Modul -ID mit `\0` Präfix bei der Auflösung der ID, einer Konvention aus dem Rollup -Ökosystem. Dies verhindert, dass andere Plugins versuchen, die ID zu verarbeiten (z. `\0` ist kein erlaubter SHAR in Import -URLs, daher müssen wir sie während der Importanalyse ersetzen. Eine `\0{id}` virtuelle ID endet als `/@id/__x00__{id}` während Dev im Browser. Die ID wird vor dem Eingeben der Plugins -Pipeline zurückgeschlüsselt, sodass dies nicht durch Plugins -Hooks -Code angezeigt wird.

Beachten Sie, dass Module, die direkt aus einer realen Datei abgeleitet sind, wie im Fall eines Skriptmoduls in einer einzelnen Dateikomponente (wie ein .vue oder .svelte SFC) dieser Konvention nicht folgen müssen. SFCs generieren im Allgemeinen eine Reihe von Submodulen, wenn sie verarbeitet werden, der Code in diesen kann jedoch auf das Dateisystem zurückgeführt werden. Die Verwendung von `\0` für diese Submodule würde verhindern, dass Sourcemaps korrekt funktionieren.

## Universelle Haken

Während Dev erstellt der Vite Dev Server einen Plugin -Container, der [Rollup -Build -Hooks](https://rollupjs.org/plugin-development/#build-hooks) auf die gleiche Weise aufruft.

Die folgenden Haken werden einmal auf dem Serverstart aufgerufen:

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

Die folgenden Haken werden auf jede eingehende Modulanforderung aufgerufen:

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

Diese Haken haben auch einen erweiterten `options` Parameter mit zusätzlichen vite-spezifischen Eigenschaften. Sie können mehr in der [SSR -Dokumentation](/de/guide/ssr#ssr-specific-plugin-logic) lesen.

Einige `resolveId` -Aufrufe ' `importer` Wert können ein absoluter Pfad für ein generisches `index.html` bei Root sein, da der tatsächliche Importeur aufgrund des ungebundenen Entwicklungsmusters von Vite nicht immer möglich ist. Für Importe, die in der Resolve -Pipeline von Vite behandelt wurden, kann der Importeur während der Importanalysephase verfolgt werden, was den richtigen `importer` -Wert bietet.

Die folgenden Haken werden aufgerufen, wenn der Server geschlossen ist:

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

Beachten Sie, dass der [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) -Haken während des Devs **nicht** aufgerufen wird, da VITE volle AST -Parse für eine bessere Leistung vermeidet.

[Die Ausgangsgenerierungshaken](https://rollupjs.org/plugin-development/#output-generation-hooks) (außer `closeBundle` ) werden während Dev **nicht** aufgerufen. Sie können sich Vite's Dev Server als nur anrufen, ohne `rollup.rollup()` anzurufen, ohne `bundle.generate()` anzurufen.

## Vite Spezifische Haken

VITE-Plugins können auch Haken liefern, die vite-spezifische Zwecke dienen. Diese Haken werden durch Rollup ignoriert.

### `config`

- **Typ:** `(config: userconfig, env: {modus: string, command: string}) => userconfig | NULL | void`
- **Art:** `async` , `sequential`

  Ändern Sie die Vite -Konfiguration, bevor es aufgelöst wird. Der Hook empfängt die Rohbenutzerkonfiguration (CLI -Optionen, die mit der Konfigurationsdatei zusammengeführt werden) und die aktuelle Konfiguration, die die verwendete `mode` und `command` enthält. Es kann ein partielles Konfigurationsobjekt zurückgeben, das tief in die vorhandene Konfiguration zusammengefasst oder die Konfiguration direkt mutiert wird (wenn die Standardverschmelzung das gewünschte Ergebnis nicht erzielen kann).

  **Beispiel:**

  ```js
  // Return partielle config (empfohlen)
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

  // Mutieren Sie die Konfiguration direkt (verwenden Sie nur, wenn das Zusammenführen nicht funktioniert).
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
  Benutzer -Plugins werden vor dem Ausführen dieses Hakens behoben, sodass die Injektion anderer Plugins in den `config` -Haken keinen Einfluss hat.
  :::

### `configResolved`

- **Typ:** `(config: regeltedConfig) => void | Versprechen<Void> `
- **Art:** `async` , `parallel`

  Nach dem Auflösung der Vite -Konfiguration gerufen. Verwenden Sie diesen Haken, um die endgültige aufgelöste Konfiguration zu lesen und zu speichern. Es ist auch nützlich, wenn das Plugin basierend auf dem ausgeführten Befehl etwas anderes tun muss.

  **Beispiel:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // Speichern Sie die aufgelöste Konfiguration
        config = resolvedConfig
      },

      // Verwenden Sie die gespeicherte Konfiguration in anderen Hooks
      transform(code, id) {
        if (config.command === 'serve') {
          // Dev: Plugin von Dev Server aufgerufen
        } else {
          // Build: Plugin von Rollup aufgerufen
        }
      },
    }
  }
  ```

  Beachten Sie, dass der `command` -Wert `serve` in Dev beträgt (in der Cli `vite` , `vite dev` und `vite serve` sind Aliase).

### `configureServer`

- **Typ:** `(Server: vitedevServer) => (() => void) | Leere | Versprechen <() => void) | void> `
- **Art:** `async` , `sequential`
- **Siehe auch:** [VitedevServer](./api-javascript#vitedevserver)

  Haken Sie den Dev -Server zum Konfigurieren. Der häufigste Anwendungsfall ist das Hinzufügen von benutzerdefinierten Middlewares in die interne [Konnektions](https://github.com/senchalabs/connect) -App:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Benutzerdefinierte Handlungsanfrage ...
      })
    },
  })
  ```

  **Post Middleware injizieren**

  Der `configureServer` -Haken wird aufgerufen, bevor die internen Middlewares installiert werden, sodass die benutzerdefinierten Middlewares standardmäßig vor den internen Middlewares ausgeführt werden. Wenn Sie **nach** internen Middlewares eine Middleware injizieren möchten, können Sie eine Funktion von `configureServer` zurückgeben, die nach der Installation der internen Middlewares aufgerufen wird:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // Geben Sie einen Post -Haken zurück, der nach internen Middlewares aufgerufen wird
      // installiert
      return () => {
        server.middlewares.use((req, res, next) => {
          // Benutzerdefinierte Handlungsanfrage ...
        })
      }
    },
  })
  ```

  **Speichern von Serverzugriff**

  In einigen Fällen benötigen andere Plugin -Hooks möglicherweise Zugriff auf die Dev -Server -Instanz (z. B. Zugriff auf den Web -Socket -Server, den Dateisystemwächter oder den Moduldiagramm). Dieser Haken kann auch verwendet werden, um die Serverinstanz für den Zugriff in anderen Hooks zu speichern:

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
          // Server verwenden ...
        }
      },
    }
  }
  ```

  Anmerkung `configureServer` wird beim Ausführen des Produktionsbaus nicht aufgerufen, sodass Ihre anderen Hooks vor seiner Abwesenheit schützen müssen.

### `configurePreviewServer`

- **Typ:** `(Server: PreviewServer) => (() => void) | Leere | Versprechen <() => void) | void> `
- **Art:** `async` , `sequential`
- **Siehe auch:** [Previewserver](./api-javascript#previewserver)

  Gleich wie [`configureServer`](/de/guide/api-plugin.html#configureserver) , aber für den Vorschau -Server. Ähnlich wie `configureServer` wird der `configurePreviewServer` Haken aufgerufen, bevor andere Middlewares installiert werden. Wenn Sie **nach** anderen Middlewares eine Middleware injizieren möchten, können Sie eine Funktion von `configurePreviewServer` zurückgeben, die nach der Installation der internen Middlewares aufgerufen wird:

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // Geben Sie einen Post -Haken zurück, der nach anderen Middlewares genannt wird
      // installiert
      return () => {
        server.middlewares.use((req, res, next) => {
          // Benutzerdefinierte Handlungsanfrage ...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **Typ:** `IndexHtmltransformhook | {order ?: 'pre' | 'Post', Handler: IndexHtmltransformhook} `
- **Art:** `async` , `sequential`

  Dedizierter Haken für die Transformation von HTML -Einstiegspunktdateien wie `index.html` . Der Haken empfängt die aktuelle HTML -Zeichenfolge und einen Transformationskontext. Der Kontext enthält die [`ViteDevServer`](./api-javascript#vitedevserver) -Instanz während des Entwicklers und legt das Rollup -Ausgangsbündel während des Builds frei.

  Der Haken kann asynchron sein und einen der folgenden zurückgeben:

  - Transformierte HTML -Zeichenfolge
  - Ein Array von Tag -Deskriptorobjekten ( `{ tag, attrs, children }` ), um dem vorhandenen HTML zu injizieren. Jedes Tag kann auch angeben, wohin es injiziert werden soll (die Standardeinstellung ist auf `<head>` vorzubereiten)
  - Ein Objekt, das beide als `{ html, tags }` enthält

  Standardmäßig ist `order` `undefined` , wobei dieser Haken nach der Transformation der HTML angewendet wurde. Um ein Skript zu injizieren, das die Vite -Plugins -Pipeline durchlaufen sollte, wendet `order: 'pre'` den Haken vor, bevor die HTML verarbeitet wird. `order: 'post'` wendet den Haken an, nachdem alle Haken mit `order` undefinierten Anstellungen angewendet wurden.

  **Grundlegendes Beispiel:**

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

  **Vollständige Hakensignatur:**

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
     * Standard: "Kopfvorbereitungen"
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

  ::: warning Note
  Dieser Haken wird nicht aufgerufen, wenn Sie ein Framework verwenden, das eine benutzerdefinierte Handhabung von Einstiegsdateien aufweist (z. B. [Seltekit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145) ).
  :::

### `handleHotUpdate`

- **Typ:** `(ctx: hmrcontext) => Array<ModuleNode> | Leere | Versprechen <Array<ModuleNode> | void> `
- **Siehe auch:** [HMR API](./api-hmr)

  Führen Sie eine benutzerdefinierte Handhabung des HMR -Update durch. Der Haken empfängt ein Kontextobjekt mit der folgenden Signatur:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` ist eine Reihe von Modulen, die von der geänderten Datei betroffen sind. Es handelt sich um ein Array, da eine einzelne Datei mehrere servierte Module (z. B. SFCs) zuordnen kann.

  - `read` ist eine asynchronisierende Lesfunktion, die den Inhalt der Datei zurückgibt. Dies wird bereitgestellt, da auf einigen Systemen der Rückruf von Dateiänderungen zu schnell abfängt, bevor der Editor die Aktualisierung der Datei beendet und `fs.readFile` Inhalte zurückgibt. Die in der Lektüre übergebene Lesfunktion normalisiert dieses Verhalten.

  Der Haken kann wählen:

  - Filtern Sie die betroffene Modulliste und beschränken Sie, dass die HMR genauer ist.

  - Geben Sie ein leeres Array zurück und führen Sie eine vollständige Reload durch:

    ```js
    handleHotUpdate({ server, modules, timestamp }) {
      // Module manuell ungültig
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

  - Geben Sie ein leeres Array zurück und führen Sie eine vollständige benutzerdefinierte HMR -Handhabung durch, indem Sie benutzerdefinierte Ereignisse an den Client senden:

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

    Der Client -Code sollte den entsprechenden Handler mithilfe der [HMR -API](./api-hmr) registrieren (dies könnte durch den `transform` -Hook desselben Plugins injiziert werden):

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // Benutzerdefinierte Update durchführen
      })
    }
    ```

## Plugin -Bestellung

Ein Vite -Plugin kann zusätzlich eine `enforce` -Eigenschaft (ähnlich wie WebPack -Loader) angeben, um die Anwendungsreihenfolge anzupassen. Der Wert von `enforce` kann entweder `"pre"` oder `"post"` betragen. Die aufgelösten Plugins befinden sich in der folgenden Reihenfolge:

- Alias
- Benutzer -Plugins mit `enforce: 'pre'`
- VITE -Kern -Plugins
- User -Plugins ohne Wert durchsetzen
- VITE -Build -Plugins
- Benutzer -Plugins mit `enforce: 'post'`
- Vite post Build -Plugins (Minify, Manifest, Berichterstattung)

Beachten Sie, dass dies von der Bestellung von Hooks getrennt ist. Diese sind [für Rollup -Haken immer](https://rollupjs.org/plugin-development/#build-hooks) noch separat ihrem `order` -Attribut ausgesetzt.

## Bedingte Anwendung

Standardmäßig werden Plugins sowohl für den Servieren als auch für den Build aufgerufen. In Fällen, in denen ein Plugin nur während des Aufschlags oder des Builds bedingt angewendet werden muss, verwenden Sie die `apply` -Eigenschaft, um sie nur während `'build'` oder `'serve'` aufzurufen:

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // oder "dienen"
  }
}
```

Eine Funktion kann auch für eine genauere Kontrolle verwendet werden:

```js
apply(config, { command }) {
  // Bewerben Sie sich nur auf Build, aber nicht für SSR
  return command === 'build' && !config.build.ssr
}
```

## Rollup -Plugin -Kompatibilität

Eine angemessene Anzahl von Rollup -Plugins funktioniert direkt als Vite -Plugin (z. B. `@rollup/plugin-alias` oder `@rollup/plugin-json` ), jedoch nicht alle, da einige Plugin -Hooks in einem ungebundenen Dev -Server -Kontext keinen Sinn ergeben.

Solange ein Rollup -Plugin die folgenden Kriterien entspricht, sollte es im Allgemeinen einfach als vite -Plugin funktionieren:

- Es verwendet den [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) -Haken nicht.
- Es hat keine starke Kopplung zwischen Bündelphasenhaken und Ausgangsphasenhaken.

Wenn ein Rollup -Plugin nur für die Build -Phase sinnvoll ist, kann es stattdessen unter `build.rollupOptions.plugins` angegeben werden. Es funktioniert genauso wie ein vite -Plugin mit `enforce: 'post'` und `apply: 'build'` .

Sie können auch ein vorhandenes Rollup-Plugin mit nur vite-Eigenschaften erweitern:

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

## Pfadnormalisierung

Vite normalisiert Pfade, während IDs auflösen, um die POSIX -Separatoren ( /) zu verwenden, während das Volumen in Windows erhalten bleibt. Andererseits hält Rollup die aufgelösten Pfade standardmäßig unberührt, sodass aufgelöste IDs Win32 -Separatoren (\) in Fenstern haben. Rollup -Plugins verwenden jedoch eine [`normalizePath` -Versorgungsfunktion](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) von `@rollup/pluginutils` intern, die Separatoren in POSIX umwandelt, bevor Vergleiche durchgeführt werden. Dies bedeutet, dass das `include` und `exclude` -Konfigurationsmuster und andere ähnliche Pfade gegen aufgelöste IDS -Vergleiche korrekt funktionieren, wenn diese Plugins in vite verwendet werden.

Bei VITE -Plugins ist es beim Vergleich der Pfade mit aufgelösten IDs wichtig, zuerst die Pfade für die Verwendung von POSIX -Separatoren zu normalisieren. Eine äquivalente `normalizePath` -Versorgungsfunktion wird aus dem `vite` -Modul exportiert.

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // "Foo/Bar"
normalizePath('foo/bar') // "Foo/Bar"
```

## Filterung, integrieren/ausschließen Muster

Vite enthält [die `createFilter` -Funktion von `@rollup/pluginutils`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter) , um vite -spezifische Plugins und Integrationen zur Verwendung des Standards des Filterungsmusters zu fördern, das auch im Vite -Kern selbst verwendet wird.

## Kunden-Server-Kommunikation

Seit Vite 2.9 bieten wir einige Dienstprogramme für Plugins zur Verfügung, um die Kommunikation mit Kunden zu bewältigen.

### Server zu Client

Auf der Plugin -Seite konnten wir `server.ws.send` verwenden, um Ereignisse an den Client zu übertragen:

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
Wir empfehlen **immer, Ihre Ereignisnamen immer vorzuführen** , um Kollisionen mit anderen Plugins zu vermeiden.
:::

Verwenden Sie auf der Client -Seite [`hot.on`](/de/guide/api-hmr.html#hot-on-event-cb) , um die Ereignisse anzuhören:

```ts twoslash
import 'vite/client'
// ---schneiden---
// Kundenseite
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // Hallo
  })
}
```

### Client zu Server

Um Ereignisse vom Client an den Server zu senden, können wir [`hot.send`](/de/guide/api-hmr.html#hot-send-event-payload) verwenden:

```ts
// Kundenseite
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

Verwenden Sie dann `server.ws.on` und hören Sie sich die Ereignisse auf der Serverseite an:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // Hey!
          // antworten Sie nur auf den Kunden (falls erforderlich)
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### TypeScript Für Benutzerdefinierte Ereignisse

Intern, vite, färbt den Typ einer Nutzlast von der `CustomEventMap` -Schnittstelle. Es ist möglich, benutzerdefinierte Ereignisse durch Erweiterung der Schnittstelle einzugeben:

:::tip Note
Stellen Sie sicher, dass Sie die `.d.ts` -Erweiterung bei der Angabe von Typscript -Deklarationsdateien angeben. Andernfalls kann TypeScript möglicherweise nicht wissen, welche Datei das Modul zu erweitern versucht.
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // "Ereignisschlüssel": Nutzlast
  }
}
```

Diese Schnittstellenerweiterung wird von `InferCustomEventPayload<T>` verwendet, um den Nutzlasttyp für Ereignis `T` zu schließen. Weitere Informationen zur Verwendung dieser Schnittstelle finden Sie in der [HMR -API -Dokumentation](./api-hmr#hmr-api) .

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
// ---schneiden---
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // Die Art der Nutzlast lautet {msg: String}
})
import.meta.hot?.on('unknown:event', (payload) => {
  // Die Art der Nutzlast ist jede
})
```
