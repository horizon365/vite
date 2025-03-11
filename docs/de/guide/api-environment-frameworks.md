# Umwelt -API für Frameworks

:::warning Experimental
Umwelt -API ist experimentell. Wir werden die APIs während von VITE 6 stabil halten, damit das Ökosystem experimentieren und darüber aufbaut. Wir planen, diese neuen APIs mit potenziellen Veränderungen in Vite 7 zu stabilisieren.

Ressourcen:

- [Feedback -Diskussion,](https://github.com/vitejs/vite/discussions/16358) bei der wir Feedback zu den neuen APIs sammeln.
- [Umwelt -API -PR,](https://github.com/vitejs/vite/pull/16471) bei der die neue API implementiert und überprüft wurde.

Bitte teilen Sie uns Ihr Feedback mit.
:::

## Umgebungen und Frameworks

Die implizite `ssr` Umgebung und andere nicht klientische Umgebungen verwenden eine `RunnableDevEnvironment` standardmäßig während Dev. Während dies die Laufzeit mit dem, in dem der Vite -Server ausgeführt wird, gleich ist, funktioniert dies ähnlich mit `ssrLoadModule` und ermöglicht es Frameworks, HMR für ihre SSR -Dev -Geschichte zu migrieren und zu aktivieren. Sie können jede runnable Umgebung mit einer `isRunnableDevEnvironment` -Funktion bewachen.

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * URL auszuführen.
   * Akzeptiert den Dateipfad, der Serverpfad oder die ID relativ zum Stamm.
   * Gibt ein sofortiges Modul zurück (wie in SSRLOADMODULE)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * Andere Modulerunner -Methoden ...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
Die `runner` wird eifrig bewertet, wenn er zum ersten Mal zugegriffen wird. Achten Sie darauf, dass VITE die Quell -Map -Unterstützung ermöglicht, wenn die `runner` durch Anruf `process.setSourceMapsEnabled` oder durch Überschreiben `Error.prepareStackTrace` erstellt wird, wenn sie nicht verfügbar ist.
:::

## Standard `RunnableDevEnvironment`

Wenn ein Vite -Server im Middleware -Modus konfiguriert ist, wie im [SSR -Setup -Handbuch](/de/guide/ssr#setting-up-the-dev-server) beschrieben, implementieren wir die SSR Middleware mithilfe der Umgebungs -API. Fehlerbehandlung wird weggelassen.

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // Standardmäßig werden Module im gleichen Prozess wie der Vite -Server ausgeführt
    },
  },
})

// Möglicherweise müssen Sie dies auf eine runnabledEventvironment in TypeScript oder umgeben
// Verwenden Sie die Umgebung mit isRunnabledEventum, um den Zugriff auf den Läufer zu schützen
const environment = server.environments.node

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. Read index.html
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Wenden Sie vite HTML -Transformationen an. Dadurch wird der vite HMR -Client injiziert,
  //    und wendet auch HTML -Transformationen aus vite -Plugins an, z. global
  //    Vorverstärker von @vitejs/Plugin-React
  template = await server.transformIndexHtml(url, template)

  // 3. Laden Sie den Servereintrag. Import (URL) transformiert sich automatisch
  //    ESM -Quellcode, der in Node.js verwendet werden kann! Es gibt keine Bündelung
  //    Erforderlich und bietet vollständige HMR -Unterstützung.
  const { render } = await environment.runner.import('/src/entry-server.js')

  // 4. Rendern Sie die App HTML. Dies setzt voraus
  //     `render` Funktion Aufrufe geeigneter Framework -SSR -APIs,
  //    z.B. Reactdomserver.rendertoString ()
  const appHtml = await render(url)

  // 5. Injizieren Sie die von App-rendered HTML in die Vorlage.
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. Senden Sie das gerenderte HTML zurück.
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

## Laufzeit Agnostische SSR

Da die `RunnableDevEnvironment` nur verwendet werden kann, um den Code in derselben Laufzeit wie der Vite -Server auszuführen, erfordert er eine Laufzeit, mit der der Vite -Server ausgeführt werden kann (eine Laufzeit, die mit Node.js kompatibel ist). Dies bedeutet, dass Sie den RAW `DevEnvironment` verwenden müssen, um die Laufzeit agnostisch zu gestalten.

:::info `FetchableDevEnvironment` proposal

Der erste Vorschlag hatte eine `run` -Methode in der `DevEnvironment` -Klasse, mit der Verbraucher einen Import auf der Läuferseite mithilfe der `transport` -Option aufrufen konnten. Während unserer Tests stellten wir fest, dass die API nicht universell genug war, um sie zu empfehlen. Im Moment suchen wir nach Feedback zum [`FetchableDevEnvironment` -Vorschlag](https://github.com/vitejs/vite/discussions/18191) .

:::

`RunnableDevEnvironment` hat eine `runner.import` -Funktion, die den Wert des Moduls zurückgibt. Diese Funktion ist jedoch nicht im RAW `DevEnvironment` verfügbar und erfordert, dass der Code mit den APIs der Vite und den Benutzermodulen entkoppelt wird.

Beispielsweise verwendet das folgende Beispiel den Wert des Benutzermoduls aus dem Code unter Verwendung der APIs der Vite:

```ts
// Code mithilfe der APIs der Vite
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entry.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./ENTrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Wenn Ihr Code in derselben Laufzeit wie die Benutzermodule ausgeführt werden kann (d. H. Er stützt sich nicht auf Node.js-spezifischen APIs), können Sie ein virtuelles Modul verwenden. Dieser Ansatz beseitigt die Notwendigkeit, mithilfe der APIs von Vite auf den Wert aus dem Code zuzugreifen.

```ts
// Code mithilfe der APIs der Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // ein Plugin, das `virtual:entrypoint` griff
    {
      name: 'virtual-module',
      /* Plugin -Implementierung */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// Verwenden Sie exponierte Funktionen für jede Umgebungsfabriken, die den Code ausführen
// Überprüfen Sie, ob jede Umweltfabriken, was sie bieten
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// -------------------------------------
// Virtual: Einstiegspunkt
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./ENTrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Zum Beispiel kann das folgende Plugin verwendet werden, um `transformIndexHtml` auf dem Benutzermodul aufzurufen:

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

Wenn Ihr Code Node.js -APIs erfordert, können Sie `hot.send` verwenden, um mit dem Code zu kommunizieren, der die APIs von Vite aus den Benutzermodulen verwendet. Beachten Sie jedoch, dass dieser Ansatz nach dem Erstellungsprozess möglicherweise nicht auf die gleiche Weise funktioniert.

```ts
// Code mithilfe der APIs der Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // ein Plugin, das `virtual:entrypoint` griff
    {
      name: 'virtual-module',
      /* Plugin -Implementierung */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// Verwenden Sie exponierte Funktionen für jede Umgebungsfabriken, die den Code ausführen
// Überprüfen Sie, ob jede Umweltfabriken, was sie bieten
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// -------------------------------------
// Virtual: Einstiegspunkt
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('/'))

// -------------------------------------
// ./ENTrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## Umgebungen Während Des Builds

In der CLI erstellt das Aufrufen von `vite build` und `vite build --ssr` den Kunden weiterhin und SSR nur Umgebungen für die Rückwärtskompatibilität.

Wenn `builder` nicht `undefined` ist (oder wenn Sie `vite build --app` anrufen), entscheiden sich `vite build` , stattdessen die gesamte App zu erstellen. Dies würde später in einem zukünftigen Major der Standardeinstellung werden. Eine `ViteBuilder` Instanz wird erstellt (Build-Time-Äquivalent zu `ViteDevServer` ), um alle konfigurierten Umgebungen für die Produktion zu erstellen. Standardmäßig wird der Aufbau von Umgebungen in Serien ausgeführt, die die Reihenfolge des `environments` -Datensatzes respektieren. Ein Framework oder ein Benutzer kann weiter konfigurieren, wie die Umgebungen mit:

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

## Umwelt Agnostischer Code

In den meisten Fällen wird die aktuelle `environment` -Instanz im Rahmen des Kontextes des ausführenden Codes verfügbar sein, sodass die Notwendigkeit, über `server.environments` auf sie zuzugreifen, selten sein sollte. Beispielsweise wird die Umgebung im Inneren Plugin -Haken als Teil der `PluginContext` freigelegt, sodass sie mit `this.environment` zugegriffen werden kann. Sehen Sie sich [die API der Umgebung an, um Plugins zu erhalten,](./api-environment-plugins.md) um zu erfahren, wie Sie Umgebungs -AWE -Plugins aufbauen können.
