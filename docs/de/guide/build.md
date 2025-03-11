# Gebäude für die Produktion

Wenn es Zeit ist, Ihre App für die Produktion bereitzustellen, führen Sie einfach den Befehl `vite build` aus. Standardmäßig verwendet es `<root>/index.html` als Build -Einstiegspunkt und erzeugt ein Anwendungsbündel, das für einen statischen Hosting -Service geeignet ist. Schauen Sie sich die [Bereitstellung einer statischen Website](./static-deploy) für Führer über beliebte Dienste an.

## Browserkompatibilität

Standardmäßig übernimmt das Produktion Bundle die Unterstützung für moderne JavaScript wie [native ES -Module](https://caniuse.com/es6-module) , [native ESM -Dynamikimport](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [Nullish Coalscing](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) und [Bigint](https://caniuse.com/bigint) . Der Standard -Browser -Support -Bereich lautet:

<!-- Search for the `ESBUILD_MODULES_TARGET` constant for more information -->

- Chrom> = 87
- Firefox> = 78
- Safari> = 14
- Kante> = 88

Sie können benutzerdefinierte Ziele über die [`build.target` -Konfigurationsoption](/de/config/build-options.md#build-target) angeben, wobei das niedrigste Ziel `es2015` ist. Wenn ein niedrigeres Ziel festgelegt ist, erfordert VITE weiterhin diese minimalen Browser -Support -Bereiche, da es sich auf [den nativen dynamischen ESM -Import](https://caniuse.com/es6-module-dynamic-import) stützt, und [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) :

<!-- Search for the `defaultEsbuildSupported` constant for more information -->

- Chrom> = 64
- Firefox> = 67
- Safari> = 11.1
- Kante> = 79

Beachten Sie, dass VITE standardmäßig nur Syntax -Transformationen behandelt und **keine Polyfills abdeckt** . Sie können sich [https://cdnjs.cloudflare.com/polyfill/](https://cdnjs.cloudflare.com/polyfill/) ansehen, die automatisch Polyfill -Bündel basierend auf der Browser -Benutzeragent -Zeichenfolge des Benutzers generiert.

Legacy-Browser können über [@viteJS/Plugin-Legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) unterstützt werden, die automatisch Legacy-Stücke und entsprechende Polyfills für die Sprachfunktion generieren. Die Legacy -Stücke sind nur in Browsern, die keine native ESM -Unterstützung haben, bedingt geladen.

## Öffentlicher Basisweg

- Verwandte: [Vermögensumschlag](./assets)

Wenn Sie Ihr Projekt unter einem verschachtelten öffentlichen Pfad bereitstellen, geben Sie einfach die [`base` -Konfigurationsoption](/de/config/shared-options.md#base) an und alle Anlagenpfade werden entsprechend umgeschrieben. Diese Option kann auch als Befehlszeilenflag angegeben werden, z. B. `vite build --base=/my/public/path/` .

JS-importierte Asset-URLs, CSS `url()` Referenzen und Asset-Referenzen in Ihren `.html` Dateien werden automatisch angepasst, um diese Option während des Builds zu respektieren.

Die Ausnahme ist, wenn Sie URLs im laufenden Betrieb dynamisch verkettet müssen. In diesem Fall können Sie die global injizierte `import.meta.env.BASE_URL` -Variable verwenden, die der öffentliche Basispfad ist. Beachten Sie, dass diese Variable während des Builds statisch ersetzt wird, sodass sie genau wie IS erscheinen muss (dh `import.meta.env['BASE_URL']` funktioniert nicht).

Weitere Informationen zur erweiterten Basispfad finden Sie unter [den erweiterten Basisoptionen](#advanced-base-options) .

### Relative Basis

Wenn Sie den Basispfad nicht im Voraus kennen, können Sie einen relativen Basispfad mit `"base": "./"` oder `"base": ""` festlegen. Dadurch werden alle generierten URLs in Bezug auf jede Datei relativ zu sein.

:::warning Support for older browsers when using relative bases

`import.meta` Unterstützung ist für relative Basen erforderlich. Wenn Sie [Browser unterstützen müssen, die `import.meta` nicht unterstützen](https://caniuse.com/mdn-javascript_operators_import_meta) , können Sie [das `legacy` -Plugin](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) verwenden.

:::

## Anpassen des Builds

Der Build kann über verschiedene [Build -Konfigurationsoptionen](/de/config/build-options.md) angepasst werden. Insbesondere können Sie die zugrunde liegenden [Rollup -Optionen](https://rollupjs.org/configuration-options/) über `build.rollupOptions` direkt anpassen:

```js [vite.config.js]
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

Sie können beispielsweise mehrere Rollup -Ausgänge mit Plugins angeben, die nur während des Builds angewendet werden.

## Chunking -Strategie

Sie können konfigurieren, wie Teile mit `build.rollupOptions.output.manualChunks` aufgeteilt werden (siehe [Rollup -Dokumente](https://rollupjs.org/configuration-options/#output-manualchunks) ). Wenn Sie ein Framework verwenden, finden Sie in der Dokumentation, um die Aufteilung der Teile zu konfigurieren.

## Lastfehlerbehandlung

Vite emitiert `vite:preloadError` Ereignis, wenn es nicht dynamische Importe laden kann. `event.payload` enthält den ursprünglichen Importfehler. Wenn Sie `event.preventDefault()` anrufen, wird der Fehler nicht geworfen.

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // Zum Beispiel die Seite aktualisieren
})
```

Wenn eine neue Bereitstellung auftritt, kann der Hosting -Dienst die Vermögenswerte aus früheren Bereitstellungen löschen. Infolgedessen kann ein Benutzer, der Ihre Website vor der neuen Bereitstellung besucht hat, möglicherweise auf einen Importfehler stoßen. Dieser Fehler tritt auf, da die auf dem Gerät dieses Benutzers ausgeführten Assets veraltet sind und versucht, den entsprechenden alten Chunk zu importieren, der gelöscht wird. Dieses Ereignis ist nützlich, um diese Situation anzugehen.

## Umbau Auf Dateienänderungen Änderungen

Sie können den Rollup -Beobachter mit `vite build --watch` aktivieren. Oder Sie können den zugrunde liegenden [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) über `build.watch` direkt anpassen:

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

Wenn das `--watch` -Flag aktiviert ist, werden Änderungen an der `vite.config.js` sowie alle Dateien, die gebündelt werden, einen Umbau ausgelöst.

## Mehrseitige App

Angenommen, Sie haben die folgende Quellcodestruktur:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Navigieren Sie während des Devs einfach navigieren oder link zu `/nested/` - es funktioniert wie erwartet, genau wie bei einem normalen statischen Dateiserver.

Während des Builds müssen Sie lediglich mehrere `.html` -Dateien als Einstiegspunkte angeben:

```js twoslash [vite.config.js]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

Wenn Sie ein anderes Root angeben, denken Sie daran, dass `__dirname` beim Auflösen der Eingabepfade immer noch der Ordner Ihrer Datei vite.config.js ist. Daher müssen Sie Ihren `root` zu den Argumenten für `resolve` hinzufügen.

Beachten Sie, dass VITE für HTML -Dateien den dem Eintrag im `rollupOptions.input` -Objekt angegebenen Namen ignoriert und stattdessen die aufgelöste ID der Datei beim Generieren des HTML -Asset im DIST -Ordner respektiert. Dies stellt eine konsistente Struktur mit der Funktionsweise des Dev -Servers sicher.

## Bibliotheksmodus

Wenn Sie eine Browser-orientierte Bibliothek entwickeln, verbringen Sie wahrscheinlich die meiste Zeit auf einer Test-/Demo-Seite, auf der Ihre tatsächliche Bibliothek importiert wird. Mit Vite können Sie Ihre `index.html` für diesen Zweck verwenden, um die reibungslose Entwicklungserfahrung zu sammeln.

Wenn es Zeit ist, Ihre Bibliothek für die Verteilung zu bündeln, verwenden Sie die [`build.lib` -Konfigurationsoption](/de/config/build-options.md#build-lib) . Stellen Sie sicher, dass Sie auch Abhängigkeiten externalen, die Sie nicht in Ihre Bibliothek bündeln möchten, z. B. `vue` oder `react` :

::: code-group

```js twoslash [vite.config.js (single entry)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // Die richtigen Erweiterungen werden hinzugefügt
      fileName: 'my-lib',
    },
    rollupOptions: {
      // Stellen Sie sicher, dass Sie DEPs externalisieren, die nicht gebündelt werden sollten
      // in Ihre Bibliothek
      external: ['vue'],
      output: {
        // Stellen Sie globale Variablen zur Verwendung im UMD -Build zur Verfügung
        // für externalisierte DEPs
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (multiple entries)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        secondary: resolve(__dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rollupOptions: {
      // Stellen Sie sicher, dass Sie DEPs externalisieren, die nicht gebündelt werden sollten
      // in Ihre Bibliothek
      external: ['vue'],
      output: {
        // Stellen Sie globale Variablen zur Verwendung im UMD -Build zur Verfügung
        // für externalisierte DEPs
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

Die Eintragsdatei würde Exporte enthalten, die von Benutzern Ihres Pakets importiert werden können:

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

Mit dieser Konfiguration `vite build` verwendet eine Rollup -Voreinstellung, die an Versandbibliotheken ausgerichtet ist und zwei Bundle -Formate erzeugt:

- `es` und `umd` (für einzelne Eintrag)
- `es` und `cjs` (für mehrere Einträge)

Die Formate können mit der [`build.lib.formats`](/de/config/build-options.md#build-lib) -Option konfiguriert werden.

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

Empfohlen `package.json` für Ihre LIB:

::: code-group

```json [package.json (single entry)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (multiple entries)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### CSS -Unterstützung

Wenn Ihre Bibliothek CSS importiert, wird sie neben den erstellten JS -Dateien als einzelne CSS -Datei gebündelt, z. B. `dist/my-lib.css` . Der Name ist standardmäßig `build.lib.fileName` , kann aber auch mit [`build.lib.cssFileName`](/de/config/build-options.md#build-lib) geändert werden.

Sie können die CSS -Datei in Ihre `package.json` exportieren, um von Benutzern importiert zu werden:

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip File Extensions
Wenn die `package.json` nicht `"type": "module"` enthält, generiert VITE verschiedene Dateierweiterungen für die Kompatibilität von Node.js. `.js` wird `.mjs` und `.cjs` werden `.js` .
:::

::: tip Environment Variables
Im Bibliotheksmodus werden alle [`import.meta.env.*`](./env-and-mode.md) -Nutzungen beim Aufbau zur Produktion statisch ersetzt. `process.env.*` Nutzung ist jedoch nicht, so dass Verbraucher Ihrer Bibliothek sie dynamisch ändern können. Wenn dies unerwünscht ist, können Sie `define: { 'process.env.NODE_ENV': '"production"' }` verwenden, um sie statisch zu ersetzen, oder [`esm-env`](https://github.com/benmccann/esm-env) für eine bessere Kompatibilität mit Bundler und Laufzeiten verwenden.
:::

::: warning Advanced Usage
Der Bibliotheksmodus enthält eine einfache und Meinung für die browserorientierte und js Framework-Bibliotheken. Wenn Sie nicht-Browser-Bibliotheken erstellen oder erweiterte Build-Flows benötigen, können Sie [Rollup](https://rollupjs.org) oder [Esbuild](https://esbuild.github.io) direkt verwenden.
:::

## Erweiterte Basisoptionen

::: warning
Diese Funktion ist experimentell. [Feedback geben](https://github.com/vitejs/vite/discussions/13834) .
:::

Für fortgeschrittene Anwendungsfälle können die bereitgestellten Vermögenswerte und öffentlichen Dateien in verschiedenen Pfaden vorliegen, beispielsweise, um verschiedene Cache -Strategien zu verwenden.
Ein Benutzer kann sich für die Bereitstellung auf drei verschiedenen Pfaden entscheiden:

- Die generierten HTML -Dateien für Einträge (die während der SSR verarbeitet werden können)
- Die generierten Hash -Assets (JS, CSS und andere Dateitypen wie Bilder)
- Die kopierten [öffentlichen Dateien](assets.md#the-public-directory)

In diesen Szenarien reicht eine einzelne statische [Basis](#public-base-path) nicht aus. VITE bietet experimentelle Unterstützung für fortschrittliche Basisoptionen während des Builds unter Verwendung von `experimental.renderBuiltUrl` .

```ts twoslash
import type { UserConfig } from 'vite'
// hübscher
const config: UserConfig = {
  // --- geschnitten ---
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      } else {
        return { relative: true }
      }
    },
  },
  // --- Cut-After ---
}
```

Wenn die Hashed -Vermögenswerte und öffentlichen Dateien nicht zusammen bereitgestellt werden, können Optionen für jede Gruppe `context` `type` definiert werden.

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// hübscher
const config: UserConfig = {
  // --- geschnitten ---
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      } else if (path.extname(hostId) === '.js') {
        return {
          runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
        }
      } else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    },
  },
  // --- Cut-After ---
}
```

Beachten Sie, dass es sich bei der Übergabe der `filename` -bestandenen URL handelt, und wenn die Funktion eine URL -Zeichenfolge zurückgibt, sollte sie auch dekodiert werden. VITE wird die Codierung automatisch bei der Rendern der URLs behandelt. Wenn ein Objekt mit `runtime` zurückgegeben wird, sollte die Codierung bei Bedarf gehandhabt werden, wenn der Laufzeitcode so gerendert wird.
