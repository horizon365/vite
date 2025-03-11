# Leistung

Während VITE standardmäßig schnell ist, können sich Leistungsprobleme einschalten, wenn die Anforderungen des Projekts wachsen. Dieser Leitfaden soll Ihnen helfen, gemeinsame Leistungsprobleme zu identifizieren und zu beheben, z. B.:

- Langsamer Server startet
- Langsame Seite lädt
- Langsame Builds

## Überprüfen Sie Ihr Browser -Setup

Einige Browser -Erweiterungen können die Anforderungen beeinträchtigen und die Start- und Nachladenzeiten für große Apps verlangsamen, insbesondere bei der Verwendung von Browser -Entwickler -Tools. Wir empfehlen, nur ein Entwicklungsprofil ohne Erweiterungen zu erstellen oder in den Inkognito-Modus zu wechseln, während in diesen Fällen der Dev-Server von Vite verwendet wird. Der Inkognito -Modus sollte auch schneller sein als ein reguläres Profil ohne Erweiterungen.

Der Vite Dev Server zwischen vorbündelte Abhängigkeiten und implementiert schnell 304 Antworten für den Quellcode. Das Deaktivieren des Cache, während die Browser-Entwickler-Tools geöffnet sind, kann einen großen Einfluss auf das Start- und ganzseitige Nachladezeiten haben. Bitte überprüfen Sie, ob "Cache deaktivieren" nicht aktiviert ist, während Sie mit dem Vite -Server arbeiten.

## Audit Konfigurierte VITE -Plugins

Die internen und offiziellen Plugins von Vite sind so optimiert, dass sie die geringste Arbeit erledigen und gleichzeitig die Kompatibilität mit dem breiteren Ökosystem vermitteln. Zum Beispiel verwenden Code -Transformationen Regex in Dev, führen jedoch einen vollständigen Analyse in Build durch, um die Korrektheit zu gewährleisten.

Die Leistung von Community -Plugins ist jedoch nicht die Kontrolle von Vite, was sich auf die Entwicklererfahrung auswirken kann. Hier sind einige Dinge, auf die Sie achten können, wenn Sie zusätzliche vite -Plugins verwenden:

1. Große Abhängigkeiten, die nur in bestimmten Fällen verwendet werden, sollten dynamisch importiert werden, um die Startzeit des Knotens zu verkürzen. Beispielrefaktoren: [Vite-Plugin-React#212](https://github.com/vitejs/vite-plugin-react/pull/212) und [vite-plugin-pwa#224](https://github.com/vite-pwa/vite-plugin-pwa/pull/244) .

2. Die `buildStart` , `config` und `configResolved` Haken sollten nicht lange und umfangreiche Operationen ausführen. Diese Hooks werden beim Dev -Server -Start erwartet, was verzögert, wenn Sie auf die Website im Browser zugreifen können.

3. Die `resolveId` , `load` und `transform` Haken können dazu führen, dass einige Dateien langsamer laden als andere. Obwohl es manchmal unvermeidlich ist, lohnt es sich immer noch, nach möglichen Bereichen zu optimieren. Beispielsweise enthält die Überprüfung, ob der `code` ein bestimmtes Schlüsselwort enthält, oder die `id` enthält eine bestimmte Erweiterung, bevor die vollständige Transformation durchgeführt wird.

   Je länger es dauert, um eine Datei zu transformieren, desto wichtiger ist der Anforderungswasserfall beim Laden der Site im Browser.

   Sie können die Dauer untersuchen, die erforderlich ist, um eine Datei mit `vite --debug plugin-transform` oder [vite-Plugin-Inspektion](https://github.com/antfu/vite-plugin-inspect) zu transformieren. Beachten Sie, dass Sie die Zahlen als grobe Schätzung behandeln sollten, wenn asynchrone Operationen dazu neigen, ungenaue Zeiten zu liefern, aber dennoch die teureren Operationen aufzeigen sollten.

::: tip Profiling
Sie können `vite --profile` ausführen, die Website besuchen und `p + enter` in Ihrem Terminal drücken, um eine `.cpuprofile` zu erfassen. Ein Tool wie [SpeedScope](https://www.speedscope.app) kann dann verwendet werden, um das Profil zu inspizieren und die Engpässe zu identifizieren. Sie können [die Profile auch mit dem vite -Team teilen](https://chat.vite.dev) , um uns bei der Identifizierung von Leistungsproblemen zu helfen.
:::

## Reduzieren Sie Die Auflösungsvorgänge

Das Auflösen von Importpfaden kann ein teurer Betrieb sein, wenn es häufig auf den schlimmsten Fall kommt. Zum Beispiel unterstützt Vite "Raten" -Pewerte mit der [`resolve.extensions`](/de/config/shared-options.md#resolve-extensions) -Option, die standardmäßig `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']` ist.

Wenn Sie versuchen, `./Component.jsx` mit `import './Component'` zu importieren, führt Vite diese Schritte aus, um ihn zu beheben:

1. Überprüfen Sie, ob `./Component` existiert, nein.
2. Überprüfen Sie, ob `./Component.mjs` existiert, nein.
3. Überprüfen Sie, ob `./Component.js` existiert, nein.
4. Überprüfen Sie, ob `./Component.mts` existiert, nein.
5. Überprüfen Sie, ob `./Component.ts` existiert, nein.
6. Überprüfen Sie, ob `./Component.jsx` existiert, ja!

Wie gezeigt, sind insgesamt 6 Dateisystemprüfungen erforderlich, um einen Importpfad zu beheben. Je impliziter Importe Sie haben, desto mehr Zeit summiert sich es, um die Pfade zu lösen.

Daher ist es normalerweise besser, mit Ihren Importpfaden explizit zu sein, z. B. `import './Component.jsx'` . Sie können die Liste auch für `resolve.extensions` eingrenzen, um die allgemeinen Dateisystemprüfungen zu reduzieren. Sie müssen jedoch auch sicherstellen, dass sie auch für Dateien in `node_modules` funktioniert.

Wenn Sie ein Plugin -Autor sind, stellen Sie sicher, dass Sie nur [`this.resolve`](https://rollupjs.org/plugin-development/#this-resolve) anrufen, um die Anzahl der oben genannten Schecks zu reduzieren.

::: tip TypeScript
Wenn Sie TypeScript verwenden, aktivieren Sie `"moduleResolution": "bundler"` und `"allowImportingTsExtensions": true` in Ihren `tsconfig.json` `compilerOptions` , um `.ts` und `.tsx` Erweiterungen direkt in Ihrem Code zu verwenden.
:::

## Vermeiden Sie Fassdateien

Barrel-Dateien sind Dateien, die die APIs anderer Dateien im selben Verzeichnis erneut belegen. Zum Beispiel:

```js [src/utils/index.js]
export * from './color.js'
export * from './dom.js'
export * from './slash.js'
```

Wenn Sie nur eine einzelne API, z. `import { slash } from './utils'` , importieren, müssen alle Dateien in dieser Fass-Datei abgerufen und transformiert werden, da sie möglicherweise die `slash` API enthalten und möglicherweise Nebenwirkungen enthalten, die bei der Initialisierung ausgeführt werden. Dies bedeutet, dass Sie mehr Dateien laden als beim Laden der Anfangsseite, was zu einem langsameren Laden von Seite führt.

Wenn möglich, sollten Sie Barrel -Dateien vermeiden und die einzelnen APIs direkt importieren, z. B. `import { slash } from './utils/slash.js'` . Weitere Informationen finden Sie in [Ausgabe Nr. 8237](https://github.com/vitejs/vite/issues/8237) .

## Wärmen Sie Häufig Verwendete Dateien Auf

Der Vite Dev Server transformiert nur Dateien, wie vom Browser angefordert, so dass er schnell starten und nur Transformationen für gebrauchte Dateien anwendet. Es kann auch Dateien vor der Transformation vorhanden, wenn es in Kürze bestimmte Dateien erwartet. Anfordern von Wasserfällen kann jedoch weiterhin stattfinden, wenn einige Dateien länger dauern, um sich zu transformieren als andere. Zum Beispiel:

Bei einem Importdiagramm, in dem die linke Datei die rechte Datei importiert:

```
main.js -> BigComponent.vue -> big-utils.js -> large-data.json
```

Die Importbeziehung kann erst nach der Transformation der Datei bekannt sein. Wenn `BigComponent.vue` einige Zeit dauert, um sich zu transformieren, muss `big-utils.js` auf seine Kurve warten und so weiter. Dies führt zu einem inneren Wasserfall auch bei eingebautem Vor-Transformation.

Mit vite können Sie Dateien aufwärmen, von denen Sie wissen, dass sie häufig verwendet werden, z `big-utils.js` mit der [`server.warmup`](/de/config/server-options.md#server-warmup) -Option. Auf diese Weise wird `big-utils.js` bereit und zwischengespeichert, um sofort auf Anfrage zu bedienen.

Sie können Dateien finden, die häufig durch Ausführen `vite --debug transform` verwendet werden und die Protokolle inspizieren:

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
```

```js [vite.config.js]
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

Beachten Sie, dass Sie nur Dateien aufwärmen sollten, die häufig verwendet werden, um den Vite Dev Server beim Start nicht zu überladen. Weitere Informationen finden Sie in der Option [`server.warmup`](/de/config/server-options.md#server-warmup) .

Die Verwendung [von `--open` oder `server.open`](/de/config/server-options.html#server-open) bietet auch einen Leistungsschub, da VITE den Einstiegspunkt Ihrer App oder die zur Öffnung bereitgestellte URL automatisch erwärmt.

## Verwenden Sie Weniger Oder Native Werkzeuge

Bei einer wachsenden Codebasis vite schnell zu halten, geht es darum, die Arbeitenmenge für die Quelldateien (JS/TS/CSS) zu reduzieren.

Beispiele für weniger Arbeit:

- Verwenden Sie CSS anstelle von Sass/Less/Stylus, wenn möglich (Nesting kann von postcss behandelt werden)
- Verwandeln Sie SVGs nicht in UI -Framework -Komponenten (reagieren, vue usw.). Importieren Sie sie stattdessen als Zeichenfolgen oder URLs.
- Vermeiden Sie es bei `@vitejs/plugin-react` , die Babel -Optionen zu konfigurieren, damit die Transformation während des Builds überspringt (nur ESBuild wird verwendet).

Beispiele für die Verwendung von nativem Werkzeug:

Die Verwendung von nativen Werkzeugen führt häufig zu einer größeren Installationsgröße und ist bei der Start eines neuen Vite -Projekts nicht die Standardeinstellung. Es kann jedoch die Kosten für größere Anwendungen wert sein.

- Probieren Sie die experimentelle Unterstützung für [LightningCSS](https://github.com/vitejs/vite/discussions/13835) aus
- Verwenden Sie [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc) anstelle von `@vitejs/plugin-react` .
