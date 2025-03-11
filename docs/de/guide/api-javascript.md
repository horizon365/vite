# JavaScript -API

Die JavaScript -APIs von Vite sind vollständig eingegeben. Es wird empfohlen, TypeScript oder JS -Typ zu verwenden, um das Intellisense und die Validierung zu nutzen.

## `createServer`

**Typ Signatur:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Beispiel Verwendung:**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // Alle gültigen Benutzerkonfigurationsoptionen plus `mode` und `configFile`
  configFile: false,
  root: __dirname,
  server: {
    port: 1337,
  },
})
await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })
```

::: tip NOTE
Bei Verwendung `createServer` und `build` im selben Knoten.JS -Prozess stützen sich beide Funktionen auf `process.env.NODE_ENV` , um ordnungsgemäß zu funktionieren, was auch von der `mode` -Konfigurationsoption abhängt. Um widersprüchliches Verhalten zu verhindern, set `process.env.NODE_ENV` oder die `mode` der beiden APIs bis `development` . Andernfalls können Sie einen Kinderprozess hervorbringen, um die APIs separat auszuführen.
:::

::: tip NOTE
Bei Verwendung [des Middleware -Modus](/de/config/server-options.html#server-middlewaremode) in Kombination mit [Proxy -Konfiguration für WebSocket](/de/config/server-options.html#server-proxy) sollte der übergeordnete HTTP -Server in `middlewareMode` bereitgestellt werden, um den Proxy korrekt zu binden.

<details><summary>Beispiel</summary><pre> <code class="language-ts">import http from 'http' import { createServer } from 'vite' const parentServer = http.createServer() // or express, koa, etc. const vite = await createServer({ server: { // Enable middleware mode middlewareMode: { // Provide the parent http server for proxy WebSocket server: parentServer, }, proxy: { '/ws': { target: 'ws://localhost:3000', // Proxying WebSocket ws: true, }, }, }, }) // @noErrors: 2339 parentServer.use(vite.middlewares)</code></pre></details>
:::

## `InlineConfig`

Die `InlineConfig` -Schnittstelle erstreckt sich `UserConfig` mit zusätzlichen Eigenschaften:

- `configFile` : Geben Sie die zu verwendende Konfigurationsdatei an. Wenn nicht festgelegt, versucht VITE, eine automatisch aus dem Projektroot zu beheben. Legen Sie auf `false` ein, um die automatische Auflösung zu deaktivieren.
- `envFile` : Auf `false` auf `.env` Dateien einstellen.

## `ResolvedConfig`

Die `ResolvedConfig` Schnittstelle hat die gleichen Eigenschaften einer `UserConfig` , außer dass die meisten Eigenschaften gelöst und nicht definiert werden. Es enthält auch Dienstprogramme wie:

- `config.assetsInclude` : Eine Funktion zum Überprüfen, ob ein `id` als Vermögenswert betrachtet wird.
- `config.logger` : Das interne Logger -Objekt von Vite.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * Das aufgelöste VITE -Konfigurationsobjekt.
   */
  config: ResolvedConfig
  /**
   * Eine Connect -App -Instanz
   * - Kann verwendet werden, um benutzerdefinierte Middlewares an den Dev -Server anzuhängen.
   * - Kann auch als Handlerfunktion eines benutzerdefinierten HTTP -Servers verwendet werden
   *   oder als Middleware in jedem Connect-Style-Node.js-Frameworks.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Native Node HTTP Server -Instanz.
   * Wird im Middleware -Modus null sein.
   */
  httpServer: http.Server | null
  /**
   * Chokidar Watcher Instance. Wenn `config.server.watch` auf `null` eingestellt ist,
   * Es wird keine Dateien ansehen, und das Aufrufen `add` oder `unwatch` hat keinen Einfluss.
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * Web -Socket -Server mit `send(payload)` Methode.
   */
  ws: WebSocketServer
  /**
   * Rollup -Plugin -Container, mit dem Plugin -Hooks in einer bestimmten Datei ausgeführt werden können.
   */
  pluginContainer: PluginContainer
  /**
   * Moduldiagramm, mit dem die Importbeziehungen und die URL zu Dateizuordnung verfolgt werden
   * und HMR -Staat.
   */
  moduleGraph: ModuleGraph
  /**
   * Die aufgelösten URLs-Vite-Drucke auf der CLI (URL-codiert). Gibt `null` zurück
   * Im Middleware -Modus oder wenn der Server keinen Port hört.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Programmatisch eine URL auflösen, laden und transformieren und das Ergebnis erhalten
   * Ohne die HTTP -Anfrage -Pipeline zu durchlaufen.
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Wenden Sie vite integrierte HTML-Transformationen und alle Plugin-HTML-Transformationen an.
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * Laden Sie eine bestimmte URL als instanziiertes Modul für SSR.
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * Beheben Sie SSR -Fehler Stacktrace.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Löst HMR für ein Modul im Moduldiagramm aus. Sie können die `server.moduleGraph` verwenden
   * API, um das neu geladene Modul abzurufen. Wenn `hmr` falsch ist, ist dies ein No-op.
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * Starten Sie den Server.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Starten Sie den Server neu.
   *
   * @param forceoptimize -den Optimierer zum Neuzufall erzwingen wie -Force Cli Flag
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * Stoppen Sie den Server.
   */
  close(): Promise<void>
  /**
   * Binden Sie CLI -Verknüpfungen
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * Anrufen `await server.waitForRequestsIdle(id)` wird bis alle statischen Importe warten
   * werden verarbeitet. Wenn Sie aus einem Last- oder Transformations -Plugin -Haken aufgerufen werden, muss die ID sein
   * als Parameter bestanden, um Deadlocks zu vermeiden. Aufrufen dieser Funktion nach dem ersten
   * Der statische Importabschnitt des Moduldiagramms wurde verarbeitet.
   * @Experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` soll als Fluchtschlüssel verwendet werden, um DX für Funktionen zu verbessern, die nach der On-Demand-Art des Vite Dev Servers nicht implementiert werden können. Es kann während des Starts von Tools wie Tailwind verwendet werden, um das Generieren der App -CSS -Klassen zu verzögern, bis der App -Code gesehen wurde, wodurch die Änderungen der Stiländerungen vermieden werden. Wenn diese Funktion in einem Last- oder Transformationshaken verwendet wird und der Standard -HTTP1 -Server verwendet wird, wird einer der sechs HTTP -Kanäle blockiert, bis der Server alle statischen Importe verarbeitet. Der Abhängigkeitsoptimierer von Vite verwendet diese Funktion derzeit, um die vollständigen Nachladen von fehlenden Abhängigkeiten zu vermeiden, indem die Belastung vorbündeter Abhängigkeiten verzögert wird, bis alle importierten Abhängigkeiten aus statischen importierten Quellen erfasst wurden. VITE kann in einer zukünftigen Hauptveröffentlichung zu einer anderen Strategie wechseln und standardmäßig `optimizeDeps.crawlUntilStaticImports: false` festlegen, um die Leistung in großen Anwendungen während des Kaltstarts zu vermeiden.
:::

## `build`

**Typ Signatur:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**Beispiel Verwendung:**

```ts twoslash [vite.config.js]
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await build({
  root: path.resolve(__dirname, './project'),
  base: '/foo/',
  build: {
    rollupOptions: {
      // ...
    },
  },
})
```

## `preview`

**Typ Signatur:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**Beispiel Verwendung:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // Alle gültigen Benutzerkonfigurationsoptionen plus `mode` und `configFile`
  preview: {
    port: 8080,
    open: true,
  },
})

previewServer.printUrls()
previewServer.bindCLIShortcuts({ print: true })
```

## `PreviewServer`

```ts
interface PreviewServer {
  /**
   * Das aufgelöste VITE -Konfigurationsobjekt
   */
  config: ResolvedConfig
  /**
   * Eine Connect App -Instanz.
   * - Kann verwendet werden, um benutzerdefinierte Middlewares an den Vorschau -Server anzuhängen.
   * - Kann auch als Handlerfunktion eines benutzerdefinierten HTTP -Servers verwendet werden
   *   oder als Middleware in einem Connect-Style-Node.js-Frameworks
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Native Node HTTP Serverinstanz
   */
  httpServer: http.Server
  /**
   * Die aufgelösten URLs-Vite-Drucke auf der CLI (URL-codiert). Gibt `null` zurück
   * Wenn der Server nicht auf einen Port hört.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Server -URLs drucken
   */
  printUrls(): void
  /**
   * Binden Sie CLI -Verknüpfungen
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**Typ Signatur:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

Der `command` -Wert beträgt `serve` in Dev und Preview und `build` in Build.

## `mergeConfig`

**Typ Signatur:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

Ganze zwei vite -Konfigurationen verschmelzen. `isRoot` repräsentiert die Ebene innerhalb der vite -Konfiguration, die zusammengeführt wird. Stellen Sie beispielsweise `false` , wenn Sie zwei `build` Optionen zusammenführen.

::: tip NOTE
`mergeConfig` akzeptiert nur Konfiguration in Objektform. Wenn Sie eine Konfiguration im Callback -Formular haben, sollten Sie sie anrufen, bevor Sie in `mergeConfig` übergeben.

Sie können den `defineConfig` -Helfer verwenden, um eine Konfiguration im Rückrufformular mit einer anderen Konfiguration zusammenzuführen:

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

// ---schneiden---
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**Typ Signatur:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**Verwandte:** [server.fs.allow](/de/config/server-options.md#server-fs-allow)

Suchen Sie nach der Wurzel des potenziellen Arbeitsbereichs, wenn er die folgenden Bedingungen erfüllt, andernfalls würde er auf `root` zurückfallen:

- Enthält `workspaces` Feld in `package.json`
- Enthält eine der folgenden Dateien
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**Typ Signatur:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**Verwandte:** [`.env` Dateien](./env-and-mode.md#env-files)

Laden Sie `.env` Dateien innerhalb der `envDir` . Standardmäßig werden nur mit `VITE_` vorangestellte Env -Variablen geladen, es sei denn, `prefixes` werden geändert.

## `normalizePath`

**Typ Signatur:**

```ts
function normalizePath(id: string): string
```

**Verwandte:** [Pfadnormalisierung](./api-plugin.md#path-normalization)

Normalisiert einen Pfad, um zwischen VITE -Plugins zu interoperieren.

## `transformWithEsbuild`

**Typ Signatur:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

Transformieren Sie JavaScript oder TypeScript mit Esbuild. Nützlich für Plugins, die es vorziehen, die interne Esbuild -Transformation von Vite zu entsprechen.

## `loadConfigFromFile`

**Typ Signatur:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  customLogger?: Logger,
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

Laden Sie eine Vite -Konfigurationsdatei manuell mit Esbuild.

## `preprocessCSS`

- **Experimentell:** [Feedback geben](https://github.com/vitejs/vite/discussions/13815)

**Typ Signatur:**

```ts
async function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig,
): Promise<PreprocessCSSResult>

interface PreprocessCSSResult {
  code: string
  map?: SourceMapInput
  modules?: Record<string, string>
  deps?: Set<string>
}
```

Vorprozesse `.css` , `.scss` , `.sass` , `.less` , `.styl` und `.stylus` Dateien zu einfachem CSS, damit es in Browsern verwendet oder von anderen Tools analysiert werden kann. Ähnlich wie bei der [integrierten CSS-Unterstützung für Vorverarbeitung](/de/guide/features#css-pre-processors) muss der entsprechende Pre-Processor bei Verwendung installiert werden.

Der verwendete Pre-Processor wird aus der `filename` Erweiterung abgeleitet. Wenn die `filename` mit `.module.{ext}` endet, wird es als [CSS -Modul](https://github.com/css-modules/css-modules) abgeleitet und das zurückgegebene Ergebnis enthält eine `modules` -Objekt -Zuordnung der ursprünglichen Klassennamen auf die transformierten.

Beachten Sie, dass die Vorverarbeitung keine URLs in `url()` oder `image-set()` auflöst.
