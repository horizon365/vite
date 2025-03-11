# Gemeinsame Optionen

Sofern nicht angegeben, werden die Optionen in diesem Abschnitt auf alle Entwickler, Erstellen und Vorschau angewendet.

## Wurzel

- **Typ:** `string`
- **Standard:** `process.cwd()`

Projekt Root Directory (wo sich `index.html` befindet). Kann ein absoluter Weg oder ein Pfad relativ zum aktuellen Arbeitsverzeichnis sein.

Weitere Details finden Sie unter [den Projekt Root](/de/guide/#index-html-and-project-root) .

## Base

- **Typ:** `string`
- **Standard:** `/`
- **Verwandte:** [`server.origin`](/de/config/server-options.md#server-origin)

Basis öffentlicher Weg, wenn es in der Entwicklung oder Produktion bedient wird. Gültige Werte umfassen:

- Absolute URL -Pfadname, z. B. `/foo/`
- Vollständige URL, zB `https://bar.com/foo/` (der Ursprungsteil wird in der Entwicklung nicht verwendet, daher ist der Wert der gleiche wie `/foo/` )
- Leere Zeichenfolge oder `./` (für eingebettete Bereitstellung)

Weitere Informationen finden Sie in [öffentlicher Basispfad](/de/guide/build#public-base-path) .

## Modus

- **Typ:** `string`
- **Standardeinstellung:** `'development'` für den Servieren, `'production'` für Build

Wenn Sie dies in der Konfiguration angeben, überschreiben Sie den Standardmodus **sowohl für Servic als auch für Build** . Dieser Wert kann auch über die Befehlszeile `--mode` überschrieben werden.

Weitere Informationen finden Sie unter [den Env -Variablen und -Modi](/de/guide/env-and-mode) .

## definieren

- **Typ:** `Record<string, any>`

Definieren Sie den globalen konstanten Ersatz. Einträge werden während des Entwicklers als Globale definiert und während des Builds statisch ersetzt.

Vite verwendet [esbuild](https://esbuild.github.io/api/#define) , um Ersatz auszuführen. Wertausdrücke müssen also eine Zeichenfolge sein, die einen JSON-serialisierbaren Wert (null, boolean, nummer, Zeichenfolge, Array oder Objekt) oder eine einzelne Kennung enthält. Bei Nicht-String-Werten konvertiert VITE es automatisch in eine Zeichenfolge mit `JSON.stringify` .

**Beispiel:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip NOTE
Stellen Sie für Typscript -Benutzer sicher, dass die Typ -Deklarationen in der Datei `env.d.ts` oder `vite-env.d.ts` hinzugefügt werden, um Typprüfungen und IntelliSense zu erhalten.

Beispiel:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## Plugins

- **Typ:** `(Plugin | Plugin [] | Versprechen <Plugin | Plugin []>) [] `

Zu verwendende Plugins. Falsy -Plugins werden ignoriert und Plugins -Arrays werden abgeflacht. Wenn ein Versprechen zurückgegeben wird, würde es vor dem Laufen gelöst. Weitere Informationen zu vite -Plugins finden Sie [unter Plugin -API](/de/guide/api-plugin) .

## Publicdir

- **Typ:** `String | false`
- **Standard:** `"public"`

Verzeichnis, um als einfaches statisches Vermögen zu dienen. Dateien in diesem Verzeichnis werden während des Entwicklers bei `/` serviert und während des Builds an die Wurzel von `outDir` kopiert und immer als IS ohne Transformation bedient oder kopiert. Der Wert kann entweder ein absoluter Dateisystempfad oder ein Pfad relativ zum Projektroot sein.

Definieren `publicDir` als `false` deaktiviert diese Funktion.

Weitere Informationen finden Sie [im Verzeichnis `public`](/de/guide/assets#the-public-directory) .

## Cachedir

- **Typ:** `string`
- **Standard:** `"node_modules/.vite"`

Verzeichnis zum Speichern von Cache -Dateien. Dateien in diesem Verzeichnis sind vorbündelte DEPs oder einige andere von VITE generierte Cache-Dateien, die die Leistung verbessern können. Sie können `--force` -Flag verwenden oder das Verzeichnis manuell löschen, um die Cache -Dateien zu regenerieren. Der Wert kann entweder ein absoluter Dateisystempfad oder ein Pfad relativ zum Projektroot sein. Standard zu `.vite` wenn kein Paket.json erkannt wird.

## resolve.alias

- **Typ:**
  `Record <String, String> | Array <{Find: String | Regexp, Ersatz: String, CustomResolver ?: ResolverFunction | ResolverObject}> `

Wird als [Einträge](https://github.com/rollup/plugins/tree/master/packages/alias#entries) an `@rollup/plugin-alias` übergeben. Kann entweder ein Objekt oder ein Array von `{ find, replacement, customResolver }` Paaren sein.

Verwenden Sie beim Aliasing auf Datei -Systempfade immer absolute Pfade. Relative Alias-Werte werden als IS verwendet und werden nicht in Dateisystempfade aufgelöst.

Eine fortgeschrittenere benutzerdefinierte Auflösung kann durch [Plugins](/de/guide/api-plugin) erreicht werden.

::: warning Using with SSR
Wenn Sie Aliase für [externalisierte SSR -Abhängigkeiten](/de/guide/ssr.md#ssr-externals) konfiguriert haben, möchten Sie möglicherweise die tatsächlichen `node_modules` -Pakete Alias. Sowohl [Garn](https://classic.yarnpkg.com/de/docs/cli/add/#toc-yarn-add-alias) als auch [PNPM](https://pnpm.io/aliases/) unterstützen Aliasing über das `npm:` -Präfix.
:::

## resolve.dedupe

- **Typ:** `string[]`

Wenn Sie Kopien derselben Abhängigkeit in Ihrer App doppelte Kopien haben (wahrscheinlich aufgrund von Heizen oder verknüpften Paketen in Monorepos), verwenden Sie diese Option, um VITE zu zwingen, die gelisteten Abhängigkeiten immer zu derselben Kopie zu beheben (aus dem Projektrouch).

:::warning SSR + ESM
Bei SSR -Builds funktioniert die Deduplizierung nicht für ESM -Build -Ausgänge, die von `build.rollupOptions.output` konfiguriert sind. Eine Problemumgehung besteht darin, CJS -Build -Ausgänge zu verwenden, bis ESM eine bessere Plugin -Unterstützung für das Laden des Moduls hat.
:::

## resolve.conditions

- **Typ:** `string[]`
- **Standard:** "[" Modul "," Browser "," Entwicklung "|Produktion '] ` (` defaultClientConditions`)

Zusätzliche Bedingungen bei der Lösung [bedingter Exporte](https://nodejs.org/api/packages.html#packages_conditional_exports) aus einem Paket.

Ein Paket mit bedingten Exporten kann das folgende `exports` -Feld in seinem `package.json` enthalten:

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

Hier sind `import` und `require` "Bedingungen". Die Bedingungen können verschachtelt werden und sollten vom spezifischsten bis am wenigsten spezifischen angegeben werden.

`Entwicklung|Produktion `is a special value that is replaced with`Produktion`or`Entwicklung`depending on the value of`Prozess.Env.Node_env`. It is replaced with `Produktion`when`Prozess.Env.Node_env === 'Produktion'`and` Development` Ansonsten.

Beachten Sie, dass `import` , `require` , `default` Bedingungen immer angewendet werden, wenn die Anforderungen erfüllt sind.

:::warning Resolving subpath exports
Exporttasten, die mit "/" enden, werden vom Knoten veraltet und funktionieren möglicherweise nicht gut. Bitte kontaktieren Sie den Paketautor, um stattdessen [`*` Subpath -Muster](https://nodejs.org/api/packages.html#package-entry-points) zu verwenden.
:::

## resolve.mainFields

- **Typ:** `string[]`
- **Standard:** `['browser', 'module', 'jsnext:main', 'jsnext']` ( `defaultClientMainFields` )

Liste der Felder in `package.json` um es zu versuchen, wenn Sie den Einstiegspunkt eines Pakets auflösen. Beachten Sie, dass dies eine geringere Vorrangszeit hat als die bedingten Exporte, die aus dem Feld `exports` aufgelöst werden: Wenn ein Einstiegspunkt erfolgreich von `exports` aufgelöst wird, wird das Hauptfeld ignoriert.

## resolve.extensions

- **Typ:** `string[]`
- **Standard:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

Liste der Dateierweiterungen, um Importe zu versuchen, die Erweiterungen weglassen. Beachten Sie, dass es **nicht** empfohlen wird, Erweiterungen für benutzerdefinierte Importtypen (z. B. `.vue` ) wegzulassen, da es die IDE und die Typ -Unterstützung beeinträchtigen kann.

## resolve.preserveSymlinks

- **Typ:** `boolean`
- **Standard:** `false`

Durch Aktivieren dieser Einstellung wird die Dateiidentität durch den ursprünglichen Dateipfad (d. H. Der Pfad ohne Symlinks) anstelle des realen Dateipfads (d. H. Der Pfad nach den folgenden Symlinks) bestimmen.

- **Verwandte:** [Esbuild#Preserve-Symlinks](https://esbuild.github.io/api/#preserve-symlinks) , [Webpack#Resolve.SymLinks
  ] ( [https://webpack.js.org/configuration/resolve/#resolvesymlinks](https://webpack.js.org/configuration/resolve/#resolvesymlinks) )

## html.cspNonce

- **Typ:** `string`
- **Verwandte:** [Inhaltssicherheitsrichtlinie (CSP)](/de/guide/features#content-security-policy-csp)

Ein Nonce Value -Platzhalter, der beim Generieren von Skript- / Stil -Tags verwendet wird. Das Festlegen dieses Wertes generiert auch ein Meta -Tag mit Nonce -Wert.

## css.modules

- **Typ:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * Standard: undefiniert
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

Konfigurieren Sie das Verhalten von CSS -Modulen. Die Optionen werden an [Postcss-Modules](https://github.com/css-modules/postcss-modules) weitergegeben.

Diese Option hat keinen Einfluss bei der Verwendung von [Lightning CSS](../guide/features.md#lightning-css) . Wenn aktiviert, sollte stattdessen [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) verwendet werden.

## css.postcss

- **Typ:** `String | (postcsss.Processopions & {Plugins ?: postcsss.acceptedplugin []}) `

INLINE POSTCSS -Konfiguration oder ein benutzerdefiniertes Verzeichnis zur Suche nach PostCSS -Konfiguration von (Standard ist Projektroot).

Für die Inline -PostCSS -Konfiguration erwartet sie das gleiche Format wie `postcss.config.js` . Für `plugins` Eigenschaft kann jedoch nur [Array -Format](https://github.com/postcss/postcss-load-config/blob/main/README.md#array) verwendet werden.

Die Suche erfolgt mit [postcss-load-config](https://github.com/postcss/postcss-load-config) und nur die unterstützten Konfigurationsdateinamen werden geladen. Konfigurationsdateien außerhalb des Arbeitsbereichs Root (oder dem [Projektstamm,](/de/guide/#index-html-and-project-root) wenn kein Arbeitsbereich gefunden wird) werden standardmäßig nicht durchsucht. Sie können einen benutzerdefinierten Pfad außerhalb des Stammes angeben, um die spezifische Konfigurationsdatei bei Bedarf stattdessen zu laden.

Hinweis Wenn eine Inline -Konfiguration bereitgestellt wird, sucht VITE nicht nach anderen POSTCSS -Konfigurationsquellen.

## css.preprocessorOptions

- **Typ:** `Record<string, object>`

Geben Sie die Optionen an, um an CSS-Vorverarbeitungspunkte weiterzugeben. Die Dateierweiterungen werden als Schlüssel für die Optionen verwendet. Die unterstützten Optionen für jeden Präprozessor finden Sie in ihrer jeweiligen Dokumentation:

- `sass` / `scss` :
  - Wählen Sie die SASS-API mit "API:" Modern-Compiler "aus, um sie zu verwenden. | "modern" | "Legacy" `(default` "Modern-Compiler" `if` Sass-eingebettet `is installed, otherwise` "Modern" `). For the best performance, it's recommended to use ` API: "Modern-Compiler" `with the` Sass-eingebettete `package. The` "Erbe" `api wird veraltet und wird in Vite 7 entfernt.
  - [Optionen (modern)](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
  - [Optionen (Erbe)](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions) .
- `less` : [Optionen](https://lesscss.org/usage/#less-options) .
- `styl` : Nur `stylus` [`define`](https://stylus-lang.com/docs/js.html#define-name-node) unterstützt, was als Objekt übergeben werden kann.

**Beispiel:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // oder "modern", "Vermächtnis"
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **Typ:** `String | ((Quelle: String, Dateiname: String) => (String | {Inhalt: String; Karte ?: Sourcemap})) `

Diese Option kann verwendet werden, um zusätzlichen Code für jeden Stilinhalt zu injizieren. Beachten Sie, dass diese Stile im endgültigen Bündel dupliziert werden, wenn Sie tatsächliche Stile und nicht nur Variablen einfügen.

**Beispiel:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

## css.preprocessorMaxWorkers

- **Experimentell:** [Feedback geben](https://github.com/vitejs/vite/discussions/15835)
- **Typ:** `Nummer | wahr "
- **Standard:** `0` (erstellt keine Arbeiter und läuft im Haupt -Thread)

Wenn diese Option festgelegt ist, werden CSS -Präprozessoren nach Möglichkeit in Arbeitern ausgeführt. `true` bedeutet die Anzahl der CPUs minus 1.

## css.devSourcemap

- **Experimentell:** [Feedback geben](https://github.com/vitejs/vite/discussions/13845)
- **Typ:** `boolean`
- **Standard:** `false`

Ob Sourcemaps während Dev.

## css.transformer

- **Experimentell:** [Feedback geben](https://github.com/vitejs/vite/discussions/13835)
- **Typ:** `'postcss' ' | 'lightningcss''`
- **Standard:** `'postcss'`

Wählt die für die CSS -Verarbeitung verwendete Engine aus. Weitere Informationen finden Sie unter [Lightning CSS](../guide/features.md#lightning-css) .

::: info Duplicate `@import`s
Beachten Sie, dass Postcss (postCSS-Import) ein anderes Verhalten mit doppelten `@import` von Browsern hat. Siehe [Postcss/Postcss-Import#462](https://github.com/postcss/postcss-import/issues/462) .
:::

## css.lightningcss

- **Experimentell:** [Feedback geben](https://github.com/vitejs/vite/discussions/13835)
- **Typ:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Konfigurieren von Lightning CSS. Vollständige Transformationsoptionen finden Sie im [Lightning CSS -Repo](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts) .

## json.namedExports

- **Typ:** `boolean`
- **Standard:** `true`

Ob Sie benannte Importe aus `.json` Dateien unterstützen.

## json.stringify

- **Typ:** `boolean | 'auto'`
- **Standard:** `'auto'`

Wenn auf `true` gesetzt, wird importiert JSON in `export default JSON.parse("...")` umgewandelt, was wesentlich leistungsfähiger ist als Objektliterale, insbesondere wenn die JSON -Datei groß ist.

Wenn die Daten auf `'auto'` festgelegt werden, werden die Daten nur angezeigt, wenn [die Daten größer als 10 KB sind](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger) .

## Esbuild

- **Typ:** `EsbuildOptions | false`

`ESBuildOptions` erweitert [die eigenen Transformationsoptionen von Esbuild](https://esbuild.github.io/api/#transform) . Der häufigste Anwendungsfall ist das Anpassen von JSX:

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Standardmäßig wird ESBuild auf `ts` , `jsx` und `tsx` Dateien angewendet. Sie können dies mit `esbuild.include` und `esbuild.exclude` anpassen, was ein Regex, ein [Picomatch](https://github.com/micromatch/picomatch#globbing-features) -Muster oder eine Reihe von beiden sein kann.

Darüber hinaus können Sie `esbuild.jsxInject` verwenden, um JSX -Helfer -Importe automatisch für jede von ESBUILD verwandelte Datei zu injizieren:

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

Wenn [`build.minify`](./build-options.md#build-minify) `true` ist, werden alle Minimifikationen standardmäßig angewendet. Um [bestimmte Aspekte](https://esbuild.github.io/api/#minify) davon zu deaktivieren, setzen Sie eine von `esbuild.minifyIdentifiers` , `esbuild.minifySyntax` oder `esbuild.minifyWhitespace` Optionen auf `false` . Beachten Sie, dass die `esbuild.minify` -Option nicht verwendet werden kann, um `build.minify` zu überschreiben.

Setzen Sie auf `false` um esbuild -Transformationen zu deaktivieren.

## Assetssincclude

- **Typ:** `String | Regexp | (String | Regexp) [] `
- **Verwandte:** [statische Vermögensbearbeitung](/de/guide/assets)

Geben Sie zusätzliche [Picomatch -Muster](https://github.com/micromatch/picomatch#globbing-features) an, die als statische Vermögenswerte behandelt werden sollen, damit:

- Sie werden von der Plugin -Transformationspipeline ausgeschlossen, wenn sie von HTML verwiesen oder direkt über `fetch` oder xhr angefordert werden.

- Wenn Sie sie aus JS importieren, gibt es ihre gelöstliche URL -Zeichenfolge zurück (dies kann überschrieben werden, wenn Sie ein `enforce: 'pre'` -Plugin haben, um den Vermögenstyp unterschiedlich zu verarbeiten).

Die integrierte Liste der Vermögenswerte finden Sie [hier](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts) .

**Beispiel:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## Loglevel

- **Typ:** `'Info' | 'warnen' | 'Fehler' | 'still'

Passen Sie die Ausgangsausgangsausgabe ein. Standard ist `'info'` .

## CustomLogger

- **Typ:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

Verwenden Sie einen benutzerdefinierten Protokoll, um Nachrichten zu protokollieren. Sie können die `createLogger` -API von Vite verwenden, um den Standardprotokoll zu erhalten und sie beispielsweise an die Nachricht zu ändern oder bestimmte Warnungen herauszufiltern.

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // Ignorieren Sie leere CSS -Dateien Warnung
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## Clearscreen

- **Typ:** `boolean`
- **Standard:** `true`

Setzen Sie auf `false` um zu verhindern, dass VITE den Terminalbildschirm bei der Protokollierung bestimmter Nachrichten löscht. Über Befehlszeile verwenden Sie `--clearScreen false` .

## envdir

- **Typ:** `string`
- **Standard:** `root`

Das Verzeichnis, aus dem `.env` Dateien geladen werden. Kann ein absoluter Weg oder ein Pfad relativ zur Projektwurzel sein.

Weitere Informationen zu Umgebungsdateien finden Sie [hier](/de/guide/env-and-mode#env-files) .

## Envprefix

- **Typ:** `String | String [] `
- **Standard:** `VITE_`

Env -Variablen beginnen mit `envPrefix` über import.meta.env Ihrem Client -Quellcode ausgesetzt.

:::warning SECURITY NOTES
`envPrefix` sollte nicht als `''` festgelegt werden, wodurch alle Ihre Umweltvariablen freigelegt werden und eine unerwartete Einführung sensibler Informationen verursachen. Vite wirft einen Fehler beim Erkennen von `''` .

Wenn Sie eine nichtfixierte Variable freilegen möchten, können Sie [definieren](#define) , um sie aufzudecken:

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## AppType

- **Typ:** `'Spa' | "MPA" | 'Custom'`
- **Standard:** `'spa'`

Unabhängig davon, ob Ihre Anwendung eine einzelne Seitenanwendung (SPA), eine [Multi -Page -Anwendung (MPA)](../guide/build#multi-page-app) oder eine benutzerdefinierte Anwendung (SSR und Frameworks mit benutzerdefiniertem HTML -Handling) ist:

- `'spa'` : Fügen Sie HTML Middlewares ein und verwenden Sie Spa Fallback. Konfigurieren Sie [SIRV](https://github.com/lukeed/sirv) mit `single: true` in der Vorschau
- `'mpa'` : HTML Middlewares einschließen
- `'custom'` : Nicht HTML Middlewares eingeben

Erfahren Sie mehr in Vite's [SSR Guide](/de/guide/ssr#vite-cli) . Verwandte: [`server.middlewareMode`](./server-options#server-middlewaremode) .

## Zukunft

- **Typ:** `record <string, 'warn' | undefiniert> `
- **Verwandte:** [Veränderungen brechen](/de/changes/)

Aktivieren Sie zukünftige Veränderungen, um sich auf eine reibungslose Migration zur nächsten Hauptversion von VITE vorzubereiten. Die Liste kann jederzeit aktualisiert, hinzugefügt oder entfernt werden, wenn neue Funktionen entwickelt werden.

Weitere Informationen zu den möglichen Optionen finden Sie auf der Seite " [Breaking Change"](/de/changes/) .
