# Statische Vermögensverhandlung

- Verwandte: [öffentliche Basispfad](./build#Public-Base-Path)
- Verwandte: [`assetsInclude` Konfigurationsoption](/de/config/shared-options.md#assetsinclude)

## Vermögenswerte als URL importieren

Wenn Sie einen statischen Vermögenswert importieren, wird die gelöste öffentliche URL zurückgeführt, wenn sie bedient wird:

```js twoslash
import 'vite/client'
// ---schneiden---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Zum Beispiel wird `imgUrl` während der Entwicklung `/src/img.png` sein und `/assets/img.2d8efhg.png` im Produktionsbau 2 werden.

Das Verhalten ähnelt dem von WebPack `file-loader` . Der Unterschied besteht darin, dass der Import entweder absolute öffentliche Pfade (basierend auf Projektwurzel während Dev) oder relative Pfade verwenden kann.

- `url()` Referenzen in CSS werden auf die gleiche Weise behandelt.

- Wenn Sie das VUE -Plugin verwenden, werden Asset -Referenzen in VUE -SFC -Vorlagen automatisch in Importe umgewandelt.

- Häufige Bild-, Medien- und Schriftfiletypen werden automatisch als Vermögenswerte erkannt. Sie können die interne Liste mit der [`assetsInclude` -Option](/de/config/shared-options.md#assetsinclude) erweitern.

- Referenzierte Vermögenswerte sind Teil des Build -Assets -Diagramms, erhalten Hashed -Dateinamen und können mit Plugins zur Optimierung verarbeitet werden.

- Vermögenswerte, die in Bytes als die [`assetsInlineLimit` -Option](/de/config/build-options.md#build-assetsinlinelimit) kleiner sind, werden als Base64 -Daten -URLs eingeführt.

- GIT -LFS -Platzhalter werden automatisch von der Inline -Inline ausgeschlossen, da sie nicht den Inhalt der von ihnen dargelegten Datei enthalten. Stellen Sie vor dem Erstellen den Dateiinhalt über Git LFS herunter.

- Typscript erkennt standardmäßig keine statischen Asset -Importe als gültige Module. Um dies zu beheben, schließen Sie [`vite/client`](./features#client-types) ein.

::: tip Inlining SVGs through `url()`
Wenn Sie eine URL von SVG an eine manuell konstruierte `url()` von JS übergeben, sollte die Variable in doppelte Zitate eingewickelt werden.

```js twoslash
import 'vite/client'
// ---schneiden---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### Explizite URL -Importe

Vermögenswerte, die nicht in der internen Liste oder in `assetsInclude` enthalten sind, können mit dem `?url` -Suffix explizit als URL importiert werden. Dies ist beispielsweise nützlich, um [Houdini -Farb -Worklups](https://developer.mozilla.org/en-US/docs/Web/API/CSS/paintWorklet_static) zu importieren.

```js twoslash
import 'vite/client'
// ---schneiden---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Explizite Inline -Handhabung

Vermögenswerte können explizit mit Einbeziehung oder keinem Einbau mit dem Suffix von `?inline` bzw. `?no-inline` importiert werden.

```js twoslash
import 'vite/client'
// ---schneiden---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### Asset Als Zeichenfolge Importieren

Vermögenswerte können mit dem `?raw` -Suffix als Zeichenfolgen importiert werden.

```js twoslash
import 'vite/client'
// ---schneiden---
import shaderString from './shader.glsl?raw'
```

### Skript als Arbeiter importieren

Skripte können als Webarbeiter mit dem Suffix von `?worker` oder `?sharedworker` importiert werden.

```js twoslash
import 'vite/client'
// ---schneiden---
// Separates Stück in der Produktion Build
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---schneiden---
// Sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---schneiden---
// Als Base64 -Saiten eingegeben
import InlineWorker from './shader.js?worker&inline'
```

Weitere Informationen finden Sie im [Bereich Web Worker](./features.md#web-workers) .

## Das `public` Verzeichnis

Wenn Sie Vermögenswerte haben, die sind:

- Nie in Quellcode verwiesen (z. B. `robots.txt` )
- Muss genau denselben Dateinamen behalten (ohne Hashing)
- ... oder Sie möchten einfach nicht zuerst ein Vermögenswert importieren müssen, nur um seine URL zu bekommen

Anschließend können Sie das Vermögenswert in ein spezielles `public` -Verzeichnis unter Ihre Projektwurzel platzieren. Die Vermögenswerte in diesem Verzeichnis werden während des Wurzelpfades `/` während des Entwicklers serviert und zur Wurzel des DIST-Verzeichnisses als IS kopiert.

Das Verzeichnis standardmäßig auf `<root>/public` , kann jedoch über die [`publicDir` -Option](/de/config/shared-options.md#publicdir) konfiguriert werden.

Beachten Sie, dass Sie immer mit `public` Assets mit dem Absolute -Pfad von Root verweisen sollten - beispielsweise `public/icon.png` sollte im Quellcode als `/icon.png` verwiesen werden.

## Neue URL (URL, Import.meta.url)

[Import.meta.Url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) ist eine native ESM -Funktion, die die URL des aktuellen Moduls enthüllt. Wenn wir es mit dem nativen [URL -Konstruktor](https://developer.mozilla.org/en-US/docs/Web/API/URL) kombinieren, können wir die vollständige, aufgelöste URL eines statischen Vermögenswerts unter Verwendung eines relativen Pfades aus einem JavaScript -Modul erhalten:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

Dies funktioniert nativ in modernen Browsern - tatsächlich muss Vite diesen Code während der Entwicklung überhaupt nicht verarbeiten!

Dieses Muster unterstützt auch dynamische URLs über Vorlagenliterale:

```js
function getImageUrl(name) {
  // Beachten Sie, dass dies keine Dateien in Unterverzeichnisse enthält
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Während des Produktionsbaues führt VITE die notwendigen Transformationen durch, so dass die URLs auch nach Bündelung und Asset -Hashing auf den richtigen Ort verweisen. Die URL -Zeichenfolge muss jedoch statisch sein, sodass sie `import.meta.url` werden `build.target`

```js
// Vite wird dies nicht verändern
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details How it works

Vite transformiert die `getImageUrl` -Funktion in:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Does not work with SSR
Dieses Muster funktioniert nicht, wenn Sie VITE für das Server-Seiten-Rendering verwenden, da `import.meta.url` in Browsern unterschiedliche Semantik als node.js. Das Serverpaket kann auch die URL des Client -Hosts im Voraus nicht bestimmen.
:::
