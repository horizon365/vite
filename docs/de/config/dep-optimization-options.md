# DEP -Optimierungsoptionen

- **Verwandte:** [Abhängigkeit Vorbündelung](/de/guide/dep-pre-bundling)

Sofern nicht angegeben, werden die Optionen in diesem Abschnitt nur auf den Abhängigkeitsoptimierer angewendet, der nur in Dev verwendet wird.

## optimizeDeps.entries

- **Typ:** `String | String [] `

Standardmäßig kriecht Vite alle Ihre `.html` Dateien, um Abhängigkeiten zu erkennen, die vorbündelt werden müssen (ignoriert `node_modules` , `build.outDir` , `__tests__` und `coverage` ). Wenn `build.rollupOptions.input` angegeben ist, kriecht Vite stattdessen diese Einstiegspunkte.

Wenn keiner dieser Anforderungen zu Ihren Anforderungen entspricht, können Sie benutzerdefinierte Einträge mit dieser Option angeben. Der Wert sollte ein [`tinyglobby` -Muster](https://github.com/SuperchupuDev/tinyglobby) oder ein Array von Mustern sein, die von Vite Project Root relativ sind. Dadurch wird die Standardeinträge inferenz überschreiben. Nur `node_modules` und `build.outDir` Ordner werden standardmäßig ignoriert, wenn `optimizeDeps.entries` explizit definiert ist. Wenn andere Ordner ignoriert werden müssen, können Sie ein Ignoriermuster als Teil der Einträge mit einer anfänglichen `!` verwenden. Wenn Sie `node_modules` und `build.outDir` nicht ignorieren möchten, können Sie stattdessen die wörtlichen Saitenpfade (ohne `tinyglobby` Muster) angeben.

## optimizeDeps.exclude

- **Typ:** `string[]`

Abhängigkeiten von der Vorbündung ausschließen.

:::warning CommonJS
CommonJS -Abhängigkeiten sollten nicht von der Optimierung ausgeschlossen werden. Wenn eine ESM -Abhängigkeit von der Optimierung ausgeschlossen ist, jedoch eine verschachtelte CommonJS -Abhängigkeit aufweist, sollte die CommonJS -Abhängigkeit zu `optimizeDeps.include` hinzugefügt werden. Beispiel:

```js twoslash
import { defineConfig } from 'vite'
// ---schneiden---
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include

- **Typ:** `string[]`

Standardmäßig sind verknüpfte Pakete nicht innerhalb von `node_modules` nicht vorbündelt. Verwenden Sie diese Option, um ein verknüpftes Paket zu erzwingen, um vorbündelt zu werden.

**Experimental:** Wenn Sie eine Bibliothek mit vielen tiefen Importen verwenden, können Sie auch ein nachfolgendes GLOB-Muster angeben, um alle tiefen Importe gleichzeitig vorzubereiten. Dadurch wird es immer wieder vorbündeln, wenn ein neuer tiefer Import verwendet wird. [Feedback geben](https://github.com/vitejs/vite/discussions/15833) . Zum Beispiel:

```js twoslash
import { defineConfig } from 'vite'
// ---schneiden---
export default defineConfig({
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
})
```

## optimizeDeps.esbuildOptions

- **Typ:** [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) `<` [`EsbuildBuildOptions`](https://esbuild.github.io/api/#general-options) `,
| 'bündeln'
| "Einstiegspunkte"
| "extern"
| 'schreiben'
| 'betrachten'
| 'Outdir' '
| "Outfile"
| "Ausbruch"
| "Outextension"
| 'metafile'> `

Optionen, die Sie während des DEP -Scans und -Optimierungen an ESBuild übergeben können.

Bestimmte Optionen werden weggelassen, da das Ändern nicht mit der DEP -Optimierung von Vite kompatibel wäre.

- `external` wird ebenfalls weggelassen, verwenden Sie `optimizeDeps.exclude` Option von Vite 1
- `plugins` werden mit dem DEP -Plugin von Vite zusammengeführt

## optimizeDeps.force

- **Typ:** `boolean`

Auf `true` eingestellt, um die Abhängigkeit vor dem Bündeln zu erzwingen und zuvor zwischengespeicherte optimierte Abhängigkeiten zu ignorieren.

## optimizeDeps.holdUntilCrawlEnd

- **Experimentell:** [Feedback geben](https://github.com/vitejs/vite/discussions/15834)
- **Typ:** `boolean`
- **Standard:** `true`

Wenn es aktiviert ist, werden die ersten optimierten DEPS -Ergebnisse gehalten, bis alle statischen Importe auf Kaltstart gekrabbt werden. Dies vermeidet die Notwendigkeit von ganzseitigen Nachladen, wenn neue Abhängigkeiten entdeckt werden und die Erzeugung neuer gemeinsamer Stücke auslösen. Wenn alle Abhängigkeiten vom Scanner und den explizit definierten in `include` festgestellt werden, ist es besser, diese Option zu deaktivieren, damit der Browser mehr Anforderungen parallel bearbeiten kann.

## optimizeDeps.disabled

- **Veraltet**
- **Experimentell:** [Feedback geben](https://github.com/vitejs/vite/discussions/13839)
- **Typ:** `boolean | 'bauen' | 'Dev'`
- **Standard:** `'build'`

Diese Option ist veraltet. Ab VITE 5.1 wurde die Voraussetzung von Abhängigkeiten während des Bauwerks entfernt. Durch das Einstellen von `optimizeDeps.disabled` bis `true` oder `'dev'` wird der Optimierer deaktiviert und auf `false` oder `'build'` konfiguriert. Den Optimierer während der Dev aktiviert.

Um den Optimierer vollständig zu deaktivieren, verwenden Sie `optimizeDeps.noDiscovery: true` , um die automatische Entdeckung von Abhängigkeiten zu verringern und `optimizeDeps.include` undefined oder leer zu lassen.

:::warning
Die Optimierung der Abhängigkeiten während der Bauzeit war ein **experimentelles** Merkmal. Projekte, die diese Strategie ausprobieren, wurden auch mit `@rollup/plugin-commonjs` mit `build.commonjsOptions: { include: [] }` entfernt. Wenn Sie dies getan haben, werden Sie eine Warnung veranlasst, es erneut zu unterstützen, um CJS nur Pakete beim Bündeln zu unterstützen.
:::

## optimizeDeps.needsInterop

- **Experimental**
- **Typ:** `string[]`

Erzwingt die ESM -Interop, wenn Sie diese Abhängigkeiten importieren. VITE ist in der Lage, ordnungsgemäß zu erkennen, wann eine Abhängigkeit interop benötigt, sodass diese Option im Allgemeinen nicht benötigt wird. Unterschiedliche Abhängigkeiten können jedoch dazu führen, dass einige von ihnen unterschiedlich eingesperrt werden. Das Hinzufügen dieser Pakete zu `needsInterop` kann den kalten Start beschleunigen, indem sie ganzseitige Nachladen vermieden werden. Sie erhalten eine Warnung, wenn dies für eine Ihrer Abhängigkeiten der Fall ist, und schlägt vor, den Paketamen diesem Array in Ihrer Konfiguration hinzuzufügen.
