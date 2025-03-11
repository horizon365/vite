# Optionen Erstellen

Sofern nicht angegeben, werden die Optionen in diesem Abschnitt nur zum Erstellen angewendet.

## build.target

- **Typ:** `String | String [] `
- **Standard:** `'modules'`
- **Verwandte:** [Browserkompatibilität](/de/guide/build#browser-compatibility)

Browserkompatibilitätsziel für das endgültige Bundle. Der Standardwert ist ein Vite -Sonderwert `'modules'` , der auf Browser mit [nativen ES -Modulen](https://caniuse.com/es6-module) , [nativem Dynamikimport](https://caniuse.com/es6-module-dynamic-import) und [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) -Unterstützung abzielt. Vite ersetzt `'modules'` bis `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`

Ein weiterer besonderer Wert ist `'esnext'` , der native dynamische Importe unterstützt und nur minimale Transporation durchführt.

Die Transformation wird mit ESBuild durchgeführt und der Wert sollte eine gültige [ESBuild -Zieloption](https://esbuild.github.io/api/#target) sein. Benutzerdefinierte Ziele können entweder eine ES -Version (z. B. `es2015` ), ein Browser mit Version (z. B. `chrome58` ) oder ein Array mehrerer Zielzeichenfolgen sein.

Beachten Sie, dass der Build fehlschlägt, wenn der Code Funktionen enthält, die von ESBuild nicht sicher verschoben werden können. Weitere Informationen finden Sie unter [Esbuild -Dokumenten](https://esbuild.github.io/content-types/#javascript) .

## build.modulePreload

- **Typ:** `boolean | {Polyfill ?: boolean, entschlossene Angaben ?: ResolvemodulePreloadDependenciesfn} `
- **Standard:** `{ polyfill: true }`

Standardmäßig wird automatisch ein [Modul -Vorspannungs -Polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) injiziert. Die Polyfill wird automatisch in das Proxy -Modul jedes `index.html` -Eintrags injiziert. Wenn der Build so konfiguriert ist, dass ein Nicht-HTML-benutzerdefinierter Eintrag über `build.rollupOptions.input` verwendet wird, muss die Polyfill in Ihrem benutzerdefinierten Eintrag manuell importiert werden:

```js
import 'vite/modulepreload-polyfill'
```

Hinweis: Die Polyfill gilt **nicht** für [den Bibliotheksmodus](/de/guide/build#library-mode) . Wenn Sie Browser ohne nativen dynamischen Import unterstützen müssen, sollten Sie es wahrscheinlich vermeiden, es in Ihrer Bibliothek zu verwenden.

Die Polyfill kann mit `{ polyfill: false }` deaktiviert werden.

Die Liste der Stücke, die für jeden dynamischen Import vorgeladen werden sollen, wird von VITE berechnet. Standardmäßig wird ein absoluter Pfad einschließlich der `base` verwendet, wenn diese Abhängigkeiten geladen werden. Wenn die `base` relativ ist ( `''` oder `'./'` ), wird `import.meta.url` zur Laufzeit verwendet, um absolute Pfade zu vermeiden, die von der endgültigen bebasigen abhängen.

Es gibt experimentelle Unterstützung für die feinkörnige Kontrolle über die Abhängigkeitsliste und deren Pfade unter Verwendung der `resolveDependencies` -Funktion. [Feedback geben](https://github.com/vitejs/vite/discussions/13841) . Es erwartet eine Funktion von Typ `ResolveModulePreloadDependenciesFn` :

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    hostId: string
    hostType: 'html' | 'js'
  },
) => string[]
```

Die `resolveDependencies` -Funktion wird für jeden dynamischen Import mit einer Liste der Stücke aufgerufen, von der sie abhängt, und sie wird auch für jeden in HTML -Dateien importierten Stück aufgerufen. Ein neues Abhängigkeits -Array kann mit diesen gefilterten oder mehr Abhängigkeiten zurückgegeben werden, die injiziert wurden, und ihre Pfade modifiziert. Die `deps` Pfade sind relativ zum `build.outDir` . Der Rückgabewert sollte ein relativer Weg zum `build.outDir` sein.

```js twoslash
/** @type {import ('vite'). userconfig} */
const config = {
  // hübscher
  build: {
    // --- geschnitten ---
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        return deps.filter(condition)
      },
    },
    // --- Cut-After ---
  },
}
```

Die aufgelösten Abhängigkeitspfade können mit [`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options) weiter geändert werden.

## build.polyfillModulePreload

- **Typ:** `boolean`
- **Standard:** `true`
- **Veraltete** Verwendung stattdessen `build.modulePreload.polyfill`

Ob automatisch ein [Modul -Vorspannungspolyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) injizieren soll.

## build.outDir

- **Typ:** `string`
- **Standard:** `dist`

Geben Sie das Ausgabeverzeichnis an (relativ zur [Projektrohne](/de/guide/#index-html-and-project-root) ).

## build.assetsDir

- **Typ:** `string`
- **Standard:** `assets`

Geben Sie das Verzeichnis für nistgenerierte Vermögenswerte unter (relativ zu `build.outDir` an. Dies wird im [Bibliotheksmodus](/de/guide/build#library-mode) nicht verwendet).

## build.assetsInlineLimit

- **Typ:** `number` | `((Filepath: String, Inhalt: Puffer) => boolean | undefiniert) `
- **Standard:** `4096` (4 kib)

Importierte oder referenzierte Vermögenswerte, die kleiner als dieser Schwellenwert sind, werden als Basis64 -URLs eingeführt, um zusätzliche HTTP -Anforderungen zu vermeiden. Setzen Sie auf `0` um das Inline -Inlining insgesamt zu deaktivieren.

Wenn ein Rückruf weitergegeben wird, kann ein Boolescher zum Opt-in oder zum Opt-out zurückgegeben werden. Wenn nichts zurückgegeben wird, gilt die Standardlogik.

GIT -LFS -Platzhalter werden automatisch von der Inline -Inline ausgeschlossen, da sie nicht den Inhalt der von ihnen dargelegten Datei enthalten.

::: tip Note
Wenn Sie `build.lib` angeben, wird `build.assetsInlineLimit` ignoriert und Vermögenswerte werden immer eingebaut, unabhängig von der Dateigröße oder einem Git -LFS -Platzhalter.
:::

## build.cssCodeSplit

- **Typ:** `boolean`
- **Standard:** `true`

Aktivieren/deaktivieren Sie die CSS -Code -Aufteilung. Wenn CSS in asynchronen JS -Stücken importiert werden, werden CSS als Stücke erhalten und zusammengerufen, wenn der Stück abgerufen wird.

Wenn sie deaktiviert sind, werden alle CSS im gesamten Projekt in eine einzelne CSS -Datei extrahiert.

::: tip Note
Wenn Sie `build.lib` angeben, ist `build.cssCodeSplit` standardmäßig `false` .
:::

## build.cssTarget

- **Typ:** `String | String [] `
- **Standard:** Das gleiche wie [`build.target`](#build-target)

Mit dieser Option können Benutzer ein anderes Browserziel für die CSS -Minifikation als für JavaScript -Transpilation einstellen.

Es sollte nur verwendet werden, wenn Sie auf einen Nicht-Mainstream-Browser abzielen.
Ein Beispiel ist Android Wechat WebView, das die meisten modernen JavaScript -Funktionen unterstützt, jedoch nicht die [`#RGBA` hexadezimale Farbnotation in CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb_colors) .
In diesem Fall müssen Sie `build.cssTarget` auf `chrome61` einstellen, um zu verhindern, dass Vite `rgba()` Farben in `#RGBA` hexadezimale Notationen verwandelt.

## build.cssMinify

- **Typ:** `boolean | "Esbuild" | 'lightningcss''`
- **Standardeinstellung:** Das gleiche wie [`build.minify`](#build-minify) für Client, `'esbuild'` für SSR

Mit dieser Option können Benutzer die CSS -Minifikation speziell anstatt auf `build.minify` überschreiben, sodass Sie die Minifikation für JS und CSS separat konfigurieren können. VITE verwendet `esbuild` standardmäßig, um CSS zu minifizieren. Stellen Sie die Option 2 auf `'lightningcss'` , um stattdessen [Lightning CSS](https://lightningcss.dev/minification.html) zu verwenden. Wenn es ausgewählt ist, kann es mit [`css.lightningcss`](./shared-options.md#css-lightningcss) konfiguriert werden.

## build.sourcemap

- **Typ:** `boolean | 'im Einklang' | 'versteckt
- **Standard:** `false`

Erzeugen Sie Produktionsquellenkarten. Wenn `true` , wird eine separate Sourcemap -Datei erstellt. Wenn `'inline'` , wird das Sourcemap als Daten -URI an die resultierende Ausgabedatei angehängt. `'hidden'` funktioniert wie `true` , außer dass die entsprechenden Sourcemap -Kommentare in den gebündelten Dateien unterdrückt werden.

## build.rollupOptions

- **Typ:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

Passen Sie das zugrunde liegende Rollup -Bundle direkt an. Dies entspricht Optionen, die aus einer Rollup -Konfigurationsdatei exportiert werden können und mit den internen Rollup -Optionen von Vite zusammengeführt werden. Weitere Informationen finden Sie [unter Rollup -Optionen](https://rollupjs.org/configuration-options/) .

## build.commonjsOptions

- **Typ:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

Optionen für [@Rollup/Plugin-Commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) .

## build.dynamicImportVarsOptions

- **Typ:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)
- **Verwandte:** [Dynamischer Import](/de/guide/features#dynamic-import)

Optionen für [@Rollup/Plugin-Dynamic-Import-Vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars) weitergeben.

## build.lib

- **Typ:** `{Eintrag: String | String [] | {[Entryalias: String]: String}, Name ?: String, Formate ?: ('es' ' | "CJS" | 'umd' | 'iife') [], Dateiname ?: String | ((Format: ModuleFormat, Eintragsname: String) => String), CSSFileName ?: String} `
- **Verwandte:** [Bibliotheksmodus](/de/guide/build#library-mode)

Als Bibliothek bauen. `entry` ist erforderlich, da die Bibliothek HTML als Eintrag nicht verwenden kann. `name` ist die freiliegende globale Variable und ist erforderlich, wenn `formats` `'umd'` oder `'iife'` enthalten. Standard `formats` sind `['es', 'umd']` oder `['es', 'cjs']` , wenn mehrere Einträge verwendet werden.

`fileName` ist der Name der Paketdateiausgabe, die standardmäßig `"name"` in `package.json` ist. Es kann auch als eine Funktion definiert werden, die die `format` und `entryName` als Argumente nimmt und den Dateinamen zurückgibt.

Wenn Ihr Paket CSS importiert, kann `cssFileName` verwendet werden, um den Namen der CSS -Dateiausgabe anzugeben. Es ist standardmäßig auf den gleichen Wert wie `fileName` , wenn es eine Zeichenfolge festgelegt hat, ansonsten fällt es auch auf `"name"` in `package.json` zurück.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/main.js'],
      fileName: (format, entryName) => `my-lib-${entryName}.${format}.js`,
      cssFileName: 'my-lib-style',
    },
  },
})
```

## build.manifest

- **Typ:** `boolean | String`
- **Standard:** `false`
- **Verwandte:** [Backend -Integration](/de/guide/backend-integration)

Unabhängig davon, ob eine Manifestdatei generiert werden soll, die eine Zuordnung von nichthaschierten Asset-Dateinamen auf ihre Hashed-Versionen enthält, die dann von einem Server-Framework verwendet werden kann, um die richtigen Asset-Links zu rendern.

Wenn der Wert eine Zeichenfolge ist, wird er als Manifest -Dateipfad relativ zu `build.outDir` verwendet. Wenn der Pfad auf `true` gesetzt ist, wäre `.vite/manifest.json` .

## build.ssrManifest

- **Typ:** `boolean | String`
- **Standard:** `false`
- **Verwandte:** [serverseitiges Rendering](/de/guide/ssr)

Ob Sie eine SSR -Manifestdatei für die Bestimmung von Stilverbindungen und Vorladungsrichtlinien in der Produktion generieren.

Wenn der Wert eine Zeichenfolge ist, wird er als Manifest -Dateipfad relativ zu `build.outDir` verwendet. Wenn der Pfad auf `true` gesetzt ist, wäre `.vite/ssr-manifest.json` .

## build.ssr

- **Typ:** `boolean | String`
- **Standard:** `false`
- **Verwandte:** [serverseitiges Rendering](/de/guide/ssr)

Produktion SSR-orientiertes Build. Der Wert kann eine Zeichenfolge sein, die den SSR -Eintrag oder `true` direkt angeben kann, für die die SSR -Eingabe über `rollupOptions.input` angegeben werden muss.

## build.emitAssets

- **Typ:** `boolean`
- **Standard:** `false`

Bei nicht klientischen Builds werden statische Vermögenswerte nicht abgebildet, da angenommen wird, dass sie als Teil des Kundenbuilds emittiert werden. Mit dieser Option können Frameworks sie erzwingen, sie in anderen Umgebungen zu erstellen. Es liegt in der Verantwortung des Rahmens, das Vermögen mit einem Post -Build -Schritt zu verschmelzen.

## build.ssrEmitAssets

- **Typ:** `boolean`
- **Standard:** `false`

Während des SSR -Builds werden statische Vermögenswerte nicht abgebildet, da angenommen wird, dass sie als Teil des Kundenbuilds emittiert werden. Mit dieser Option können Frameworks sie sowohl im Client- als auch im SSR -Build erzwingen. Es liegt in der Verantwortung des Rahmens, das Vermögen mit einem Post -Build -Schritt zu verschmelzen. Diese Option wird durch `build.emitAssets` ersetzt, sobald die Umgebungs -API stabil ist.

## build.minify

- **Typ:** `boolean | 'Terser' | 'Esbuild'`
- **Standardeinstellung:** `'esbuild'` für Client Build, `false` für SSR Build

Legen Sie auf `false` ein, um die Minifikation zu deaktivieren, oder geben Sie den zu verwendenden Minifikator an. Der Standard ist [esbuild](https://github.com/evanw/esbuild) , das 20 ~ 40x schneller als Terser und nur 1 ~ 2% schlechtere Komprimierung ist. [Benchmarks](https://github.com/privatenumber/minification-benchmarks)

Beachten Sie, dass die `build.minify` Option Whitespaces nicht minimiert, wenn das `'es'` Format im Lib-Modus verwendet wird, da es reine Anmerkungen beseitigt und das Baumschütteln durchbricht.

Terser muss installiert werden, wenn es auf `'terser'` eingestellt ist.

```sh
npm add -D terser
```

## build.terserOptions

- **Typ:** `TerserOptions`

Zusätzliche [Minifik -Optionen](https://terser.org/docs/api-reference#minify-options) für Terser.

Darüber hinaus können Sie auch eine `maxWorkers: number` -Option übergeben, um die maximale Anzahl von Arbeitnehmern zu laichen. Standardeinstellung zur Anzahl der CPUs minus 1.

## build.write

- **Typ:** `boolean`
- **Standard:** `true`

Setzen Sie auf `false` um das Schreiben des Bündels auf die Festplatte zu deaktivieren. Dies wird hauptsächlich in [programmatischen `build()` -Aufrufen](/de/guide/api-javascript#build) verwendet, bei denen vor dem Schreiben auf die Festplatte weitere Nachbearbeitung des Bündels benötigt wird.

## build.emptyOutDir

- **Typ:** `boolean`
- **Standard:** `true` Wenn `outDir` in `root` ist

Standardmäßig leeren VITE die `outDir` beim Build, wenn er sich innerhalb von Projektroot befindet. Es wird eine Warnung ausgehen, wenn `outDir` außerhalb des Roots ist, um nicht versehentlich wichtige Dateien zu entfernen. Sie können diese Option ausdrücklich festlegen, um die Warnung zu unterdrücken. Dies ist auch über die Befehlszeile als `--emptyOutDir` erhältlich.

## build.copyPublicDir

- **Typ:** `boolean`
- **Standard:** `true`

Standardmäßig kopiert VITE Dateien aus der `publicDir` in die `outDir` im Build. Setzen Sie auf `false` um dies zu deaktivieren.

## build.reportCompressedSize

- **Typ:** `boolean`
- **Standard:** `true`

Aktivieren/Deaktivieren von GZIP-komprimierten Größenberichten. Das Komprimieren großer Ausgabedateien kann langsam sein. Daher kann dies die Erstellungsleistung für große Projekte erhöhen.

## build.chunkSizeWarningLimit

- **Typ:** `number`
- **Standard:** `500`

Grenze für die Warnungen der Stückegröße (in KB). Es wird mit der unkomprimierten Chunk -Größe verglichen, da die [JavaScript -Größe selbst mit der Ausführungszeit zusammenhängt](https://v8.dev/blog/cost-of-javascript-2019) .

## build.watch

- **Typ:** [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) `| null`
- **Standard:** `null`

Setzen Sie auf `{}` um den Rollup -Beobachter zu aktivieren. Dies wird hauptsächlich in Fällen verwendet, in denen nur Build-Plugins oder Integrationsprozesse gebildet werden.

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

Es gibt Fälle, in denen das Dateisystembeobachten nicht mit WSL2 funktioniert.
Weitere Informationen finden Sie unter [`server.watch`](./server-options.md#server-watch) .

:::
