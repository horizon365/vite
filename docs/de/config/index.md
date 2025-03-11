---
title: Vite Konfigurieren
---

# Vite Konfigurieren

Beim Ausführen von `vite` aus der Befehlszeile versucht VITE automatisch, eine Konfigurationsdatei mit dem Namen `vite.config.js` in [Project Root](/de/guide/#index-html-and-project-root) zu beheben (andere JS- und TS -Erweiterungen werden ebenfalls unterstützt).

Die grundlegendste Konfigurationsdatei sieht so aus:

```js [vite.config.js]
export default {
  // Konfigurationsoptionen
}
```

Hinweis vite unterstützt die Verwendung der ES -Module -Syntax in der Konfigurationsdatei, auch wenn das Projekt nicht den nativen Knoten -ESM verwendet, z. B. `type: "module"` in `package.json` . In diesem Fall ist die Konfigurationsdatei vor dem Laden automatisch vorverarbeitet.

Sie können auch explizit eine Konfigurationsdatei angeben, die mit der `--config` CLI -Option verwendet werden soll (relativ zu `cwd` aufgelöst):

```bash
vite --config my-config.js
```

::: tip CONFIG LOADING
Standardmäßig verwendet Vite `esbuild` , um die Konfiguration in eine temporäre Datei zu bündeln und zu laden. Dies kann beim Importieren von Typscript -Dateien in einem Monorepo Probleme verursachen. Wenn Sie Probleme mit diesem Ansatz begegnen, können Sie `--configLoader runner` angeben, um stattdessen den [Modulläufer](/de/guide/api-environment-runtimes.html#modulerunner) zu verwenden, der keine temporäre Konfiguration erstellt und alle Dateien im laufenden Fliegen transformiert. Beachten Sie, dass Modulläufer CJs in Konfigurationsdateien nicht unterstützt, aber externe CJS -Pakete sollten wie gewohnt funktionieren.

Wenn Sie eine Umgebung verwenden, die TypeScript (z. B. `node --experimental-strip-types` ) unterstützt, oder wenn Sie nur ein einfaches JavaScript schreiben, können Sie `--configLoader native` angeben, um die native Laufzeit der Umgebung zum Laden der Konfigurationsdatei zu verwenden. Beachten Sie, dass Aktualisierungen zu Modulen, die von der Konfigurationsdatei importiert wurden, nicht erkannt werden und daher den Vite-Server nicht automatisch anbieten.
:::

## Config IntelliSense

Da Vite mit Typen mit Typenschriften versandt, können Sie die IntelliSense Ihrer Ideen mit JSDOC -Typ -Tipps nutzen:

```js
/** @type {import ('vite'). userconfig} */
export default {
  // ...
}
```

Alternativ können Sie den `defineConfig` -Helfer verwenden, der IntelliSense ohne JSDOC -Anmerkungen liefern sollte:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite unterstützt auch TypeScript -Konfigurationsdateien. Sie können `vite.config.ts` mit der `defineConfig` -Helfer -Funktion oben oder mit dem `satisfies` -Operator verwenden:

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## Bedingte Konfiguration

Wenn die Konfiguration die Optionen basierend auf dem Befehl ( `serve` oder `build` ), dem verwendeten [Modus](/de/guide/env-and-mode#modes) , konditionell bestimmen muss, wenn es sich um einen SSR -Build ( `isSsrBuild` ) handelt oder um den Build ( `isPreview` ) voranzutreiben, kann sie stattdessen eine Funktion exportieren:

```js twoslash
import { defineConfig } from 'vite'
// ---schneiden---
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // devspezifische Konfiguration
    }
  } else {
    // Befehl === 'Build'
    return {
      // spezielle Konfiguration erstellen
    }
  }
})
```

Es ist wichtig zu beachten, dass der `command` -Wert in Vite's API `serve` während Dev (in der CLI [`vite`](/de/guide/cli#vite) , `vite dev` und `vite serve` sind Aliase) und `build` beim Bau von Produktion ( [`vite build`](/de/guide/cli#vite-build) ).

`isSsrBuild` und `isPreview` sind zusätzliche optionale Flags, um die Art von `build` bzw. `serve` Befehlen zu unterscheiden. Einige Tools, die die VITE -Konfiguration laden, unterstützen diese Flags möglicherweise nicht und passieren stattdessen `undefined` . Daher wird empfohlen, einen expliziten Vergleich mit `true` und `false` zu verwenden.

## Asynchrische Konfiguration

Wenn die Konfiguration asynchronisierte Funktionen aufrufen muss, kann sie stattdessen eine asynchronisierende Funktion exportieren. Und diese asynchronisierte Funktion kann auch `defineConfig` für eine verbesserte IntelliSense -Unterstützung übergeben werden:

```js twoslash
import { defineConfig } from 'vite'
// ---schneiden---
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // vite config
  }
})
```

## Verwenden Von Umgebungsvariablen in Der Konfiguration

Umgebungsvariablen können wie gewohnt aus `process.env` erhalten werden.

Beachten Sie, dass Vite `.env` -Dateien standardmäßig nicht lädt, da die zu laden laden Dateien erst nach der Bewertung der VITE -Konfiguration ermittelt werden können, beispielsweise die `root` und `envDir` Optionen auf das Ladeverhalten beeinflussen. Sie können jedoch den exportierten `loadEnv` -Helfer verwenden, um die spezifische `.env` -Datei bei Bedarf zu laden.

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Laden Sie die Env -Datei basierend auf `mode` im aktuellen Arbeitsverzeichnis.
  // Setzen Sie den dritten Parameter auf "", um alle Umwelt unabhängig von dem zu laden
  // `VITE_` Präfix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
