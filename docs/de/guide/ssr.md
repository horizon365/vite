# Serverseitiges Rendering (SSR)

:::tip Note
SSR bezieht sich ausdrücklich auf Front-End-Frameworks (z. B. React, Preact, Vue und Svelte), die unterstützen, die gleiche Anwendung in Node.js auszuführen, sie auf HTML vorzuziehen und schließlich auf den Client zu feuchtigen. Wenn Sie nach Integration in herkömmliche serverseitige Frameworks suchen, lesen Sie stattdessen den [Backend Integration Guide](./backend-integration) .

In der folgenden Anleitung wird auch die früheren Erfahrungen mit SSR in Ihrem Framework Ihrer Wahl übernommen und konzentriert sich nur auf vite-spezifische Integrationsdetails.
:::

:::warning Low-level API
Dies ist eine API auf niedriger Ebene, die für Bibliotheks- und Framework-Autoren bestimmt ist. Wenn Ihr Ziel es ist, eine Anwendung zu erstellen, lesen Sie zuerst die höheren SSR-Plugins und -Tools im [Bereich höherer](https://github.com/vitejs/awesome-vite#ssr) Ebene. Viele Anwendungen werden jedoch erfolgreich direkt auf der nativen API von Vite aufgebaut.

Derzeit arbeitet Vite an einer verbesserten SSR -API mit der [Umwelt -API](https://github.com/vitejs/vite/discussions/16358) . Weitere Informationen finden Sie im Link.
:::

## Beispielprojekte

VITE bietet integrierte Unterstützung für das serverseitige Rendering (SSR). [`create-vite-extra`](https://github.com/bluwy/create-vite-extra) enthält Beispiel -SSR -Setups, die Sie als Referenzen für diesen Handbuch verwenden können:

- [Vanille](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [Vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [Reagieren](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [Vorwirkung](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [Sufle](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [Solide](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

Sie können diese Projekte auch lokal durchführen, indem [Sie `create-vite` ausführen](./index.md#scaffolding-your-first-vite-project) und `Others > create-vite-extra` unter der Option Framework auswählen.

## Quellstruktur

Eine typische SSR -Anwendung hat die folgende Quelldateistruktur:

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

Die `index.html` muss `entry-client.js` verweisen und einen Platzhalter einschließen, in dem das serverbereitete Markup injiziert werden sollte:

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Sie können jeden Platzhalter verwenden, den Sie anstelle von `<!--ssr-outlet-->` bevorzugen, solange er genau ersetzt werden kann.

## Bedingte Logik

Wenn Sie eine bedingte Logik basierend auf SSR vs. Client ausführen müssen, können Sie verwenden

```js twoslash
import 'vite/client'
// ---schneiden---
if (import.meta.env.SSR) {
  // ... nur Logik Server
}
```

Dies wird während des Bauwerks statisch ersetzt, sodass es das Baumschütteln von ungenutzten Zweigen ermöglicht.

## Einrichten Des Dev -Servers

Beim Erstellen einer SSR -App möchten Sie wahrscheinlich die volle Kontrolle über Ihren Hauptserver haben und vite von der Produktionsumgebung entkoppeln. Es wird daher empfohlen, VITE im Middleware -Modus zu verwenden. Hier ist ein Beispiel mit [Express](https://expressjs.com/) (v4):

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

Hier ist `vite` eine Instanz von [VitedevServer](./api-javascript#vitedevserver) . `vite.middlewares` ist eine [Connect-](https://github.com/senchalabs/connect) Instanz, die als Middleware in jedem Connect-kompatiblen Knoten.JS-Framework verwendet werden kann.

Der nächste Schritt ist die Implementierung des `*` Handlers zum Servieren von Server-Rendered HTML:

```js twoslash [server.js]
// @noErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import ('express'). express} */
var app
/** @type {import ('vite'). vitedevServer}  */
var vite

// ---schneiden---
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Read index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. Wenden Sie vite HTML -Transformationen an. Dadurch wird der vite HMR -Client injiziert,
    //    und wendet auch HTML -Transformationen aus vite -Plugins an, z. global
    //    Vorverstärker von @vitejs/Plugin-React
    template = await vite.transformIndexHtml(url, template)

    // 3. Laden Sie den Servereintrag. ssrloadModule transformiert automatisch
    //    ESM -Quellcode, der in Node.js verwendet werden kann! Es gibt keine Bündelung
    //    Erforderlich und liefert eine effiziente Ungültigkeit ähnlich wie HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. Rendern Sie die App HTML. Dies setzt voraus
    //     `render` Funktion Aufrufe geeigneter Framework -SSR -APIs,
    //    z.B. Reactdomserver.rendertoString ()
    const appHtml = await render(url)

    // 5. Injizieren Sie die von App-rendered HTML in die Vorlage.
    const html = template.replace(`<!--ssr-outlet-->`, () => appHtml)

    // 6. Senden Sie das gerenderte HTML zurück.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // Wenn ein Fehler erfasst wird, lassen Sie die Stapelspur so reparieren, damit er zurückbackt
    // zu Ihrem tatsächlichen Quellcode.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

Das `dev` -Skript in `package.json` sollte ebenfalls geändert werden, um stattdessen das Serverskript zu verwenden:

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Gebäude für die Produktion

Um ein SSR -Projekt zur Produktion zu versenden, müssen wir:

1. Produzieren einen Kundenbau wie gewohnt;
2. Erstellen Sie einen SSR -Build, der direkt über `import()` geladen werden kann, damit wir nicht durch Vite's `ssrLoadModule` gehen müssen.

Unsere Skripte in `package.json` werden so aussehen:

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

Beachten Sie das `--ssr` -Flag, das angibt, dass dies ein SSR -Build ist. Es sollte auch den SSR -Eintrag angeben.

In `server.js` müssen wir dann eine produktionsspezifische Logik hinzufügen, indem wir `process.env.NODE_ENV` überprüfen:

- Verwenden Sie anstatt das Root `index.html` zu lesen, die `dist/client/index.html` als Vorlage verwenden, da sie die richtigen Asset -Links zum Client -Build enthält.

- Verwenden Sie anstelle von `await vite.ssrLoadModule('/src/entry-server.js')` `import('./dist/server/entry-server.js')` (diese Datei ist das Ergebnis des SSR -Builds).

- Bewegen Sie die Erstellung und die gesamte Verwendung des `vite` Dev-Servers hinter Devedy Conditional-Zweigen und fügen Sie dann statische Datei hinzu, die Middlewares serviert, um Dateien ab `dist/client` zu servieren.

Siehe [Beispielprojekte](#example-projects) für ein Arbeitsaufbau.

## Vorlastanweisungen Erzeugen

`vite build` unterstützt das `--ssrManifest` -Flag, das `.vite/ssr-manifest.json` im Build Output -Verzeichnis erzeugt:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

Das obige Skript generiert nun `dist/client/.vite/ssr-manifest.json` für den Client -Build (ja, das SSR -Manifest wird aus dem Client -Build generiert, da wir Modul -IDs in Clientdateien abbilden möchten). Das Manifest enthält Zuordnungen von Modul -IDs an ihre zugehörigen Brocken und Asset -Dateien.

Um das Manifest zu nutzen, müssen Frameworks eine Möglichkeit bieten, die Modul -IDs der Komponenten zu sammeln, die während eines Server -Render -Aufrufs verwendet wurden.

`@vitejs/plugin-vue` unterstützt dies außerhalb der Box und registriert automatisch verwendete Komponentenmodul -IDs für den zugehörigen Vue SSR -Kontext:

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules ist jetzt ein Satz von Modul -IDs, die während des Renders verwendet wurden
```

In der Produktionszweig von `server.js` müssen wir das Manifest an die von `src/entry-server.js` exportierte Funktion `render` lesen und übergeben. Dies würde uns genügend Informationen zur Verfügung stellen, um Vorspannungsrichtlinien für Dateien zu rendern, die von asynchronen Routen verwendet werden! Eine [vollständige Beispiele](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js) für ein vollständiges Beispiel. Sie können diese Informationen auch für [103 frühe Hinweise](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103) verwenden.

## Vorrenderung / SSG

Wenn die Routen und Daten, die für bestimmte Routen benötigt werden, im Voraus bekannt sind, können wir diese Routen mit derselben Logik wie Produktions-SSR in statische HTML einstellen. Dies kann auch als Form der statischen Generierung (SSG) angesehen werden. Siehe [Demo Pre-Render-Skript,](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/prerender.js) um Beispiele zu machen.

## SSR -Externale

Die Abhängigkeiten werden vom SSR -Transformationsmodulsystem von Vite standardmäßig beim Ausführen von SSR "externalisiert". Dies beschleunigt sowohl Dev als auch Build.

Wenn beispielsweise eine Abhängigkeit durch Vite -Pipeline transformiert werden muss, da VITE -Merkmale nicht in ihnen verwendet werden, können sie zu [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal) hinzugefügt werden.

Bei verknüpften Abhängigkeiten werden sie standardmäßig nicht externalisiert, um die HMR von Vite zu nutzen. Wenn dies beispielsweise nicht erwünscht ist, um Abhängigkeiten so zu testen, als ob sie nicht verknüpft sind, können Sie es zu [`ssr.external`](../config/ssr-options.md#ssr-external) hinzufügen.

:::warning Working with Aliases
Wenn Sie Aliase konfiguriert haben, die ein Paket auf ein anderes umleiten, möchten Sie möglicherweise die tatsächlichen `node_modules` Pakete, damit es für SSR -externalisierte Abhängigkeiten funktioniert. Sowohl [Garn](https://classic.yarnpkg.com/de/docs/cli/add/#toc-yarn-add-alias) als auch [PNPM](https://pnpm.io/aliases/) unterstützen Aliasing über das `npm:` -Präfix.
:::

## SSR-Spezifische Plugin-Logik

Einige Frameworks wie Vue oder Svelt -Kompilierkomponenten in verschiedenen Formaten basierend auf Client vs. SSR. Um bedingte Transformationen zu unterstützen, gibt Vite eine zusätzliche `ssr` Eigenschaft im `options` -Objekt der folgenden Plugin -Haken über:

- `resolveId`
- `load`
- `transform`

**Beispiel:**

```js twoslash
/** @type {() => import ('vite'). Plugin} */
// ---schneiden---
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // SSR-spezifische Transformation durchführen ...
      }
    },
  }
}
```

Das Optionsobjekt in `load` und `transform` ist optional. Rollup verwendet dieses Objekt derzeit nicht, kann diese Haken in Zukunft mit zusätzlichen Metadaten erweitern.

:::tip Note
Vor VITE 2.7 wurde dies zu Plugin -Haken mit einem Parampfung von Position `ssr` informiert, anstatt das `options` -Objekt zu verwenden. Alle wichtigen Frameworks und Plugins werden aktualisiert. Möglicherweise finden Sie möglicherweise veraltete Beiträge mit der vorherigen API.
:::

## SSR -Ziel

Das Standardziel für den SSR -Build ist eine Knotenumgebung, aber Sie können den Server auch in einem Webarbeiter ausführen. Die Paketeintragsauflösung ist für jede Plattform unterschiedlich. Sie können das Ziel als Web Worker mit dem auf `'webworker'` festgelegten `ssr.target` Konfiguration konfigurieren.

## SSR -Bündel

In einigen Fällen wie `webworker` Laufzeiten möchten Sie Ihr SSR -Build möglicherweise in eine einzelne JavaScript -Datei bündeln. Sie können dieses Verhalten aktivieren, indem Sie `ssr.noExternal` bis `true` einstellen. Dies wird zwei Dinge tun:

- Behandle alle Abhängigkeiten als `noExternal`
- Werfen Sie einen Fehler, wenn irgendwelche Node.js-integrierten Ins importiert werden

## SSR -Auflösungsbedingungen

Standardmäßig werden die in [`resolve.conditions`](../config/shared-options.md#resolve-conditions) für den SSR -Build festgelegten Bedingungen für den Paketeintrag verwendet. Sie können [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions) und [`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions) verwenden, um dieses Verhalten anzupassen.

## Vite Cli

Die CLI -Befehle `$ vite dev` und `$ vite preview` können auch für SSR -Apps verwendet werden. Sie können Ihre SSR -Middlewares mit [`configureServer`](/de/guide/api-plugin#configureserver) und dem Vorschau -Server mit [`configurePreviewServer`](/de/guide/api-plugin#configurepreviewserver) zum Entwicklungsserver hinzufügen.

:::tip Note
Verwenden Sie einen Posthaken, damit Ihre SSR Middleware _nach_ Vite's Middlewares ausgeführt wird.
:::
