# Mit Plugins

VITE kann mit Plugins erweitert werden, die auf der gut gestalteten Plugin-Schnittstelle von Rollup mit einigen zusätzlichen vite-spezifischen Optionen basieren. Dies bedeutet, dass VITE -Benutzer sich auf das ausgereifte Ökosystem von Rollup -Plugins verlassen können und gleichzeitig die Dev -Server- und SSR -Funktionalität nach Bedarf erweitern können.

## Hinzufügen eines Plugins

Um ein Plugin zu verwenden, muss es der `devDependencies` des Projekts hinzugefügt und im `plugins` -Array in der `vite.config.js` Konfigurationsdatei enthalten sein. Zum Beispiel kann der offizielle [@vitejs/Plugin-Legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) verwendet werden, um Legacy-Browser zu unterstützen:

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

`plugins` akzeptiert auch Voreinstellungen, einschließlich mehrerer Plugins als einzelnes Element. Dies ist nützlich für komplexe Funktionen (z. B. Framework -Integration), die mit mehreren Plugins implementiert werden. Das Array wird intern abgeflacht.

Falsy -Plugins werden ignoriert, mit denen Plugins einfach aktiviert oder deaktiviert werden können.

## Plugins Finden

:::tip NOTE
VITE zielt darauf ab, außergewöhnliche Unterstützung für gemeinsame Webentwicklungsmuster zu unterstützen. Bevor Sie nach einem vite- oder kompatiblen Rollup -Plugin suchen, lesen Sie die [Features -Handbuch](../guide/features.md) . Viele der Fälle, in denen ein Plugin in einem Rollup -Projekt benötigt wird, sind bereits in vite behandelt.
:::

Weitere Informationen zu offiziellen Plugins finden Sie im [Abschnitt Plugins](../plugins/) . Community-Plugins sind in [Awesome-Vite](https://github.com/vitejs/awesome-vite#plugins) aufgeführt.

Sie können auch Plugins finden, die den [empfohlenen Konventionen](./api-plugin.md#conventions) mit einer [NPM-Suche nach Vite-Plugin](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity) für Vite-Plugins oder einer [NPM-Suche nach Rollup-Plugin](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) für Rollup-Plugins folgen.

## Durchsetzung Der Plugin -Bestellung

Für die Kompatibilität mit einigen Rollup -Plugins ist möglicherweise erforderlich, um die Reihenfolge des Plugins durchzusetzen oder nur zum Bauzeit zu bewerben. Dies sollte ein Implementierungsdetail für vite -Plugins sein. Sie können die Position eines Plugins mit dem `enforce` -Modifikator durchsetzen:

- `pre` : Rufen Sie Plugin vor vite Core -Plugins auf
- Standardeinstellung: Rufen Sie Plugin nach vite Core -Plugins auf
- `post` : Ruf Plugin nach vite Build -Plugins auf

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

Weitere Informationen finden Sie unter [dem Plugins -API -Handbuch](./api-plugin.md#plugin-ordering) .

## Bedingte Anwendung

Standardmäßig werden Plugins sowohl für den Servieren als auch für den Build aufgerufen. In Fällen, in denen ein Plugin nur während des Aufschlags oder des Builds bedingt angewendet werden muss, verwenden Sie die `apply` -Eigenschaft, um sie nur während `'build'` oder `'serve'` aufzurufen:

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## Gebäude -Plugins

In der [Plugins -API -Handbuch](./api-plugin.md) zum Erstellen von Plugins finden Sie die Plugins -API -Handbuch.
