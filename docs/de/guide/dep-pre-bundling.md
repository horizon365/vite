# Abhängigkeit Vorbündelung

Wenn Sie zum ersten Mal `vite` ausgeführt werden, wird Vite Ihre Projektabhängigkeiten vor dem Laden Ihrer Website vor Ort vorgebraucht. Dies erfolgt standardmäßig automatisch und transparent.

## Das Warum

Dies ist vite, das so ausführt, was wir als "Abhängigkeit vor dem Bündeln" bezeichnen. Dieser Prozess dient zwei Zwecken:

1. **CommonJS- und UMD -Kompatibilität:** Während der Entwicklung dient Vite's Dev allen Code als native ESM. Daher muss VITE Abhängigkeiten umwandeln, die zuerst als CommonJs oder UMD in ESM geliefert werden.

   Bei der Konvertierung von CommonJS -Abhängigkeiten führt Vite intelligente Importanalysen durch, so dass benannte Importe in CommonJS -Module wie erwartet funktionieren, selbst wenn die Exporte dynamisch zugeordnet sind (z. B. React):

   ```js
   // funktioniert wie erwartet
   import React, { useState } from 'react'
   ```

2. **Leistung:** Vite wandelt ESM -Abhängigkeiten mit vielen internen Modulen in ein einzelnes Modul um, um die nachfolgende Seitenlastleistung zu verbessern.

   Einige Pakete versenden ihre ES -Module, die so viele separate Dateien erstellen, die sich gegenseitig importieren. Zum Beispiel [hat `lodash-es` über 600 interne Module](https://unpkg.com/browse/lodash-es/) ! Wenn wir `import { debounce } from 'lodash-es'` machen, feuert der Browser gleichzeitig 600 HTTP -Anfragen ab! Obwohl der Server kein Problem damit hat, sie zu bearbeiten, erzeugt die große Menge an Anforderungen eine Netzwerküberlastung auf der Browser -Seite, wodurch die Seite deutlich langsamer lädt.

   Wenn Sie `lodash-es` in ein einzelnes Modul vorbündeln, benötigen wir jetzt nur noch eine HTTP-Anfrage!

::: tip NOTE
Die Abhängigkeitsvorabmessung gilt nur im Entwicklungsmodus und verwendet `esbuild` , um Abhängigkeiten in ESM zu konvertieren. In Produktionsbauten wird stattdessen `@rollup/plugin-commonjs` verwendet.
:::

## Automatische Abhängigkeitserdeckung

Wenn kein vorhandener Cache gefunden wird, kriecht VITE Ihren Quellcode und ermittelt automatisch Abhängigkeitsinporte (dh "bloße Importe", die von `node_modules` aufgelöst werden) und verwenden diese gefundenen Importe als Einstiegspunkte für die Vorkleidung. Die Vorbündelung wird mit `esbuild` durchgeführt, sodass es normalerweise sehr schnell ist.

Nachdem der Server bereits begonnen hat, wird VITE den DEP-Bündelungsprozess erneut ausführen, wenn ein neuer Abhängigkeitsimport auftritt und der nicht bereits im Cache steht, den DEP-Bündelungsprozess und die Seite bei Bedarf neu laden.

## Monorepos Und Verknüpfte Abhängigkeiten

In einem Monorepo -Setup kann eine Abhängigkeit ein verknüpftes Paket aus demselben Repo sein. VITE erkennt automatisch Abhängigkeiten, die nicht aus `node_modules` aufgelöst werden und behandelt den verknüpften DEP als Quellcode. Es wird nicht versucht, die verknüpfte DEP zu bündeln, und analysiert stattdessen die Abhängigkeitsliste der verknüpften DEP.

Dies erfordert jedoch, dass die verknüpfte DEP als ESM exportiert wird. Wenn nicht, können Sie die Abhängigkeit zu [`optimizeDeps.include`](/de/config/dep-optimization-options.md#optimizedeps-include) und [`build.commonjsOptions.include`](/de/config/build-options.md#build-commonjsoptions) in Ihrer Konfiguration hinzufügen.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
// ---schneiden---
export default defineConfig({
  optimizeDeps: {
    include: ['linked-dep'],
  },
  build: {
    commonjsOptions: {
      include: [/linked-dep/, /node_modules/],
    },
  },
})
```

Starten Sie den Dev -Server mit der Befehlszeilenoption `--force` , damit die Änderungen wirksam werden sollen.

## Anpassen des Verhaltens

Die heuristische Entdeckung der Standardabhängigkeit ist möglicherweise nicht immer wünschenswert. In Fällen, in denen Sie Abhängigkeiten aus der Liste explizit aufnehmen/ausschließen möchten, verwenden Sie die [`optimizeDeps` Konfigurationsoptionen](/de/config/dep-optimization-options.md) .

Ein typischer Anwendungsfall für `optimizeDeps.include` oder `optimizeDeps.exclude` ist, wenn Sie einen Import haben, der im Quellcode nicht direkt erfasst werden kann. Zum Beispiel wird der Import möglicherweise als Ergebnis einer Plugin -Transformation erstellt. Dies bedeutet, dass Vite den Import auf dem ersten Scan nicht ermitteln kann. Er kann erst feststellen, nachdem die Datei vom Browser angefordert und transformiert wurde. Dies führt dazu, dass der Server nach dem Start des Servers sofort neu beendet wird.

Sowohl `include` als auch `exclude` können verwendet werden, um damit umzugehen. Wenn die Abhängigkeit groß ist (mit vielen internen Modulen) oder CommonJs ist, sollten Sie sie einbeziehen. Wenn die Abhängigkeit klein ist und bereits gültig ist, können Sie sie ausschließen und den Browser direkt laden lassen.

Sie können ESBuild auch mit der [`optimizeDeps.esbuildOptions` -Option](/de/config/dep-optimization-options.md#optimizedeps-esbuildoptions) weiter anpassen. Zum Beispiel Hinzufügen eines ESBuild -Plugins, um spezielle Dateien in Abhängigkeiten zu verarbeiten oder den [Build `target`](https://esbuild.github.io/api/#target) zu ändern.

## Ausschnitt

### Dateisystem -Cache

Vite ränder die vorbündelten Abhängigkeiten in `node_modules/.vite` . Es bestimmt, ob es den Schritt vor der Bündelung auf der Grundlage einiger Quellen erneut ausführen muss:

- Package Manager Lockfile -Inhalt, z. `package-lock.json` , `yarn.lock` , `pnpm-lock.yaml` oder `bun.lockb` .
- Patches Ordner Änderungszeit.
- Relevante Felder in Ihrer `vite.config.js` , falls vorhanden.
- `NODE_ENV` Wert.

Der Schritt vor der Bündelung muss nur erneut ausgeführt werden, wenn sich einer der oben genannten geändert hat.

Wenn Sie aus irgendeinem Grund VITE dazu zwingen möchten, DEPs neu zu bauen, können Sie den Dev-Server entweder mit der Befehlszeilenoption `--force` starten oder das `node_modules/.vite` Cache-Verzeichnis manuell löschen.

### Browser -Cache

Aufgelöste Abhängigkeitsanforderungen werden mit HTTP -Headern `max-age=31536000,immutable` stark zwischengespeichert, um die Seite "Seiten -Reload -Leistung während Dev" zu verbessern. Sobald diese Anfragen zwischengespeichert werden, werden sie nie wieder auf den Dev -Server klicken. Sie werden von der angehängten Versionsabfrage automatisch ungültig gemacht, wenn eine andere Version installiert ist (wie in Ihrem Paket -Manager -Lockfile angegeben). Wenn Sie Ihre Abhängigkeiten debuggen, indem Sie lokale Änderungen vornehmen, können Sie:

1. Deaktivieren Sie den Cache über die Netzwerk -Registerkarte Ihres Browsers devtools vorübergehend.
2. Starten Sie den Vite Dev Server mit dem `--force` Flag neu, um die DEPS neu zu bauen.
3. Laden Sie die Seite neu.
