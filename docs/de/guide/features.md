# Merkmale

Auf der grundlegenden Ebene unterscheidet sich die Entwicklung der Verwendung von VITE nicht so von der Verwendung eines statischen Dateiservers. VITE bietet jedoch viele Verbesserungen gegenüber nativen ESM-Importen, um verschiedene Funktionen zu unterstützen, die in der Regel in Bundler-basierten Setups zu sehen sind.

## NPM-Abhängigkeit Auflösung und Vorbündelung

Native ES -Importe unterstützen keine Bare -Modul -Importe wie die folgenden:

```js
import { someMethod } from 'my-dep'
```

Das obige wirft einen Fehler in den Browser. VITE erfasst solche bloßen Modulimporte in allen diente Quelldateien und führt Folgendes aus:

1. [Vorbereiten Sie](./dep-pre-bundling) sie, um die Seitenladegeschwindigkeit zu verbessern und CommonJS / UMD-Module in ESM zu konvertieren. Der Schritt vor der Bündelung wird mit [Esbuild](http://esbuild.github.io/) durchgeführt und macht Vite's Cold Startzeit erheblich schneller als jeder auf JavaScript-basierte Bundler.

2. Schreiben Sie die Importe in gültige URLs wie `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd` , damit der Browser sie ordnungsgemäß importieren kann.

**Abhängigkeiten sind stark zwischengespeichert**

Vite Caches -Abhängigkeitsanforderungen über HTTP -Header. Wenn Sie also eine Abhängigkeit lokal bearbeiten/debuggen möchten, befolgen Sie die Schritte [hier](./dep-pre-bundling#browser-cache) .

## Heißmodulersatz

VITE liefert eine [HMR -API](./api-hmr) über native ESM. Frameworks mit HMR -Funktionen können die API nutzen, um sofortige, genaue Updates bereitzustellen, ohne die Seite neu zu laden oder den Anwendungszustand wegzublasen. VITE bietet HMR-Integrationen von First-Anbietern für [VUE-Einzeldateikomponenten](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) und [reagiert schnell Aktualisierung](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) . Es gibt auch offizielle Integrationen für Preact über [@Prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite) .

Beachten Sie, dass Sie diese nicht manuell einrichten müssen. Wenn Sie [eine App über `create-vite` erstellen](./) , haben die ausgewählten Vorlagen diese bereits vorkonfiguriert.

## Typoskript

VITE unterstützt das Importieren von `.ts` Dateien aus der Box.

### Nur Umträgen

Beachten Sie, dass VITE nur Transpilation auf `.ts` Dateien durchführt und **keine** Typprüfung durchführt. Es wird davon ausgegangen, dass die Typ -Überprüfung durch Ihre IDE- und Erstellungsprozesse erledigt wird.

Der Grund, warum Vite im Rahmen des Transformationsprozesses keine Typprüfung durchführt, liegt darin, dass die beiden Jobs grundsätzlich unterschiedlich funktionieren. Die Transpilation kann pro Dateibasis funktionieren und passt perfekt mit dem On-Demand-Kompilierungsmodell von Vite überein. Im Vergleich dazu erfordert die Typüberprüfung die Kenntnis des gesamten Moduldiagramms. Die Schuhzeithöre in Vite's Transform-Pipeline wird zwangsläufig die Geschwindigkeitsvorteile von Vite beeinträchtigen.

Die Aufgabe von Vite ist es, Ihre Quellmodule in ein Formular zu bringen, das so schnell wie möglich im Browser ausgeführt werden kann. Zu diesem Zweck empfehlen wir, statische Analyseprüfungen von der Transformationspipeline von Vite zu trennen. Dieses Prinzip gilt für andere statische Analyseprüfungen wie Eslint.

- Für Produktionsbaufe können Sie zusätzlich zum Gebäudebefehl von Vite `tsc --noEmit` ausführen.

- Wenn Sie während der Entwicklung mehr als IDE-Hinweise benötigen, empfehlen wir, `tsc --noEmit --watch` in einem separaten Prozess auszuführen, oder verwenden Sie [Vite-Plugin-Checker,](https://github.com/fi3ework/vite-plugin-checker) wenn Sie es vorziehen, Typ Fehler direkt im Browser gemeldet zu haben.

VITE verwendet [ESBuild](https://github.com/evanw/esbuild) , um TypeScript in JavaScript zu transpilieren, das etwa 20 bis 30x schneller ist als Vanille `tsc` , und HMR -Updates können im Browser in weniger als 50 ms widerspiegeln.

Verwenden Sie die [Nur-Typ-Importe und Exportsyntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) , um potenzielle Probleme zu vermeiden, wie beispielsweise fälschlicherweise gebündelt werden, beispielsweise:

```ts
import type { T } from 'only/types'
export type { T }
```

### Typscript -Compiler -Optionen

Einige Konfigurationsfelder unter `compilerOptions` in `tsconfig.json` erfordern besondere Aufmerksamkeit.

#### `isolatedModules`

- [Typscript -Dokumentation](https://www.typescriptlang.org/tsconfig#isolatedModules)

Sollte auf `true` gesetzt werden.

Dies liegt daran, dass `esbuild` nur Transpilation ohne Typinformationen durchführt und bestimmte Funktionen wie const enum und implizite Nur-Typ-Importe unterstützt.

Sie müssen `"isolatedModules": true` in Ihrem `tsconfig.json` unter `compilerOptions` einstellen, damit TS Sie vor den Merkmalen warnen, die nicht mit isolierter Transpilation funktionieren.

Wenn eine Abhängigkeit mit `"isolatedModules": true` nicht gut funktioniert. Sie können `"skipLibCheck": true` verwenden, um die Fehler vorübergehend zu unterdrücken, bis sie stromaufwärts behoben sind.

#### `useDefineForClassFields`

- [Typscript -Dokumentation](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

Der Standardwert beträgt `true` , wenn das TypeScript -Ziel `ES2022` oder neuer ist, einschließlich `ESNext` . Es steht im Einklang mit dem [Verhalten von TypeScript 4.3.2+](https://github.com/microsoft/TypeScript/pull/42663) .
Andere Typscript -Ziele werden standardmäßig `false` .

`true` ist das Standard -ECMAScript -Laufzeitverhalten.

Wenn Sie eine Bibliothek verwenden, die stark auf Klassenfelder angewiesen ist, achten Sie bitte vorsichtig mit der beabsichtigten Verwendung der Bibliothek.
Während die meisten Bibliotheken `"useDefineForClassFields": true` erwarten, können Sie explizit `useDefineForClassFields` auf `false` festlegen, wenn Ihre Bibliothek es nicht unterstützt.

#### `target`

- [Typscript -Dokumentation](https://www.typescriptlang.org/tsconfig#target)

Vite ignoriert den `target` -Wert im `tsconfig.json` , der dem gleichen Verhalten wie `esbuild` folgt.

Um das Ziel in Dev anzugeben, kann die [`esbuild.target`](/de/config/shared-options.html#esbuild) -Option verwendet werden, die für eine minimale Transpilation standardmäßig `esnext` ist. In Builds hat die [`build.target`](/de/config/build-options.html#build-target) Option eine höhere Priorität über `esbuild.target` und kann bei Bedarf auch festgelegt werden.

::: warning `useDefineForClassFields`

Wenn `target` in `tsconfig.json` nicht `ESNext` oder `ES2022` oder neuer ist oder wenn es keine `tsconfig.json` `false` gibt, kann `useDefineForClassFields` mit dem `esbuild.target` von `esnext` problematisch problematisch sein. Es kann zu [statischen Initialisierungsblöcken](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks#browser_compatibility) umgehen, die in Ihrem Browser möglicherweise nicht unterstützt werden.

Daher wird empfohlen, `target` bis `ESNext` oder `ES2022` oder neuer einzustellen oder `useDefineForClassFields` bis `true` ausdrücklich bei `tsconfig.json` ausdrücklich einzustellen.
:::

#### Andere Compiler -Optionen, Die Das Build -Ergebnis Beeinflussen

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)
- [`alwaysStrict`](https://www.typescriptlang.org/tsconfig#alwaysStrict)

::: tip `skipLibCheck`
VITE -Startervorlagen haben `"skipLibCheck": "true"` standardmäßig 0, um typeckende Abhängigkeiten zu vermeiden, da sie möglicherweise nur bestimmte Versionen und Konfigurationen von TypeScript unterstützen. Sie können mehr unter [Vuejs/Vue-Cli#5688](https://github.com/vuejs/vue-cli/pull/5688) erfahren.
:::

### Kundentypen

Die Standardtypen von Vite sind für seine Node.js -API. Fügen Sie eine `d.ts` Deklarationsdatei hinzu, um die Umgebung des Client -Seitencode in einer vite -Anwendung zu senken:

```typescript
///<reference types="vite/client">
```

::: details Using `compilerOptions.types`

Alternativ können Sie `vite/client` bis `compilerOptions.types` in `tsconfig.json` hinzufügen:

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client", "some-other-global-lib"]
  }
}
```

Beachten Sie, dass wenn [`compilerOptions.types`](https://www.typescriptlang.org/tsconfig#types) angegeben ist, nur diese Pakete im globalen Bereich enthalten sind (anstelle aller sichtbaren "@types" -Pakete).

:::

`vite/client` Bietet die folgenden Scheiben:

- Asset Importe (zB importieren einer `.svg` -Datei)
- Typen für die VITE-injizierten [Konstanten](./env-and-mode#env-variables) unter `import.meta.env`
- Typen für die [HMR -API](./api-hmr) auf `import.meta.hot`

::: tip
Fügen Sie um die Standard -Typisierung eine Typ -Definitionsdatei hinzu, die Ihre Tipps enthält. Fügen Sie dann die Typreferenz vor `vite/client` hinzu.

Zum Beispiel, um den Standardimport von `*.svg` eine React -Komponente zu machen:

- `vite-env-override.d.ts` (die Datei, die Ihre Typen enthält):
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- Die Datei, die den Verweis auf `vite/client` enthält:
  ```ts
  ///<reference types="./vite-env-override.d.ts">
  ///<reference types="vite/client">
  ```

:::

## HTML

HTML-Dateien stehen [vorne und in der Mitte](/de/guide/#index-html-and-project-root) eines vite-Projekts und dienen als Einstiegspunkte für Ihre Anwendung und erleichtern es einfach, einseitige und [mehrseitige Anwendungen](/de/guide/build.html#multi-page-app) zu erstellen.

Alle HTML -Dateien in Ihrem Projektroot können direkt über den jeweiligen Verzeichnispfad zugegriffen werden:

- `<root>/index.html` -> `http://localhost:5173/`
- `<root>/about.html` -> `http://localhost:5173/about.html`
- `<root>/blog/index.html` -> `http://localhost:5173/blog/index.html`

Vermögenswerte, auf die HTML -Elemente wie `<script type="module" src>` und `<link href>` verwiesen werden, werden als Teil der App verarbeitet und gebündelt. Die vollständige Liste der unterstützten Elemente finden Sie unten:

- `<audio src>`
- `<embed src>`
- `<img src>` und `<img srcset>`
- `<image src>`
- `<input src>`
- `<link href>` und `<link imagesrcset>`
- `<object data>`
- `<script type="module" src>`
- `<source src>` und `<source srcset>`
- `<track src>`
- `<use href>` und `<use xlink:href>`
- `<video src>` und `<video poster>`
- `<meta content>`
  - Nur wenn `name` Attribut mit `msapplication-tileimage` , `msapplication-square70x70logo` , `msapplication-square150x150logo` , `msapplication-wide310x150logo` , `msapplication-square310x310logo` , `msapplication-config` oder `twitter:image` übereinstimmt
  - Oder nur wenn `property` Attribut `og:image` , `og:image:url` , `og:image:secure_url` , `og:audio` , `og:audio:secure_url` , `og:video` oder `og:video:secure_url` übereinstimmt

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Um die HTML-Verarbeitung für bestimmte Elemente abzuschalten, können Sie das `vite-ignore` Attribut für das Element hinzufügen, das bei Bezug auf externe Vermögenswerte oder CDN nützlich sein kann.

## Frameworks

Alle modernen Frameworks halten Integrationen mit vite. Die meisten Framework -Plugins werden von jedem Framework -Team mit Ausnahme des offiziellen Vue- und React -VITE -Plugins aufrechterhalten, die in der vite org aufbewahrt werden:

- VUE-Support über [@vitejs/Plugin-View](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- VUE JSX-Support über [@vitejs/Plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- Reagieren Sie die Unterstützung über [@vitejs/Plugin-React](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
- Reagieren Sie mit SWC-Unterstützung über [@vitejs/Plugin-React-SWC](https://github.com/vitejs/vite-plugin-react-swc)

Weitere Informationen finden Sie im [Plugins -Handbuch](https://vite.dev/plugins) .

## JSX

`.jsx` und `.tsx` Dateien werden ebenfalls außerhalb der Box unterstützt. Die JSX -Transpilation wird ebenfalls über [Esbuild](https://esbuild.github.io) behandelt.

Ihr Framework of Choice konfiguriert JSX bereits aus dem Feld (beispielsweise sollten VUE-Benutzer das offizielle [@viteJS/Plugin-VUE-JSX-](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx) Plugin verwenden, das VUE 3 spezifische Funktionen wie HMR, Global Component-Auflösung, Anweisungen und Slots bietet).

Wenn Sie JSX mit Ihrem eigenen Framework verwenden, können benutzerdefinierte `jsxFactory` und `jsxFragment` mit der [`esbuild` -Option](/de/config/shared-options.md#esbuild) konfiguriert werden. Zum Beispiel würde das Preact -Plugin verwenden:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Weitere Details in [Esbuild -Dokumenten](https://esbuild.github.io/content-types/#jsx) .

Sie können die JSX-Helper mit `jsxInject` (was nur vite Option ist) injizieren, um manuelle Importe zu vermeiden:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

Wenn Sie `.css` Dateien importieren, wird der Inhalt über ein `<style>` -Tag mit HMR -Unterstützung in die Seite injiziert.

### `@import` Einbeziehung und Wiedergeburt

VITE ist vorkonfiguriert, um CSS `@import` zu unterstützen, die über `postcss-import` inliniert. VITE -Aliase werden auch für CSS `@import` respektiert. Darüber hinaus werden alle CSS `url()` -Referenzen, auch wenn sich die importierten Dateien in verschiedenen Verzeichnissen befinden, immer automatisch wiederhergestellt, um die Korrektheit zu gewährleisten.

`@import` Aliase und URL-Wiedergebäude werden auch für SASS- und weniger Dateien unterstützt (siehe [CSS-Vorverarbeitungsträger](#css-pre-processors) ).

### Postcss

Wenn das Projekt eine gültige PostCSS-Konfiguration enthält (jedes Format, das von [postcss-load-config](https://github.com/postcss/postcss-load-config) unterstützt wird, z. B. `postcss.config.js` ), wird es automatisch auf alle importierten CSS angewendet.

Beachten Sie, dass die CSS -Minifikation nach Postcs ausgeführt wird und [`build.cssTarget`](/de/config/build-options.md#build-csstarget) Option verwendet.

### CSS -Module

Jede CSS -Datei, die mit `.module.css` endet, wird als [CSS -Moduldatei](https://github.com/css-modules/css-modules) angesehen. Wenn Sie eine solche Datei importieren, gibt das entsprechende Modulobjekt zurück:

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
// ---schneiden---
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

Das Verhalten von CSS -Modulen kann über die [`css.modules` -Option](/de/config/shared-options.md#css-modules) konfiguriert werden.

Wenn `css.modules.localsConvention` so eingestellt ist, dass Camelcase -Einheimische (z. B. `localsConvention: 'camelCaseOnly'` ) aktiviert sind, können Sie auch benannte Importe verwenden:

```js twoslash
import 'vite/client'
// ---schneiden---
// .Apply -color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS-Pre-Processoren

Da Vite nur auf moderne Browser abzielt, wird empfohlen, native CSS-Variablen mit Postcss-Plugins zu verwenden, die CSSWG [-](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting) Entwürfe (z.

Trotzdem bietet Vite integrierte Unterstützung für `.scss` , `.sass` , `.less` , `.styl` und `.stylus` Dateien. Es müssen keine vite-spezifischen Plugins für sie installiert werden, aber der entsprechende Vorprozessor selbst muss installiert werden:

```bash
# .Scss und .sass
npm add -D sass-embedded # oder Sass

# .weniger
npm add -D less

# .Styl und .stylus
npm add -D stylus
```

Bei Verwendung von Vue -Einzeldateikomponenten ermöglicht dies auch automatisch `<style lang="sass">` et al.

VITE verbessert die Auflösung `@import` für SASS und weniger, so dass auch vite Aliase respektiert werden. Darüber hinaus werden relative `url()` Referenzen in importierten SASS/LEWER -Dateien, die sich in verschiedenen Verzeichnissen aus der Stammdatei befinden, automatisch wiederhergestellt, um die Korrektheit sicherzustellen.

`@import` Alias und URL -Wiedergeburt werden aufgrund seiner API -Einschränkungen nicht für Styls unterstützt.

Sie können auch CSS-Module in Kombination mit Vorprozessoren verwenden, indem Sie `.module` für die Dateierweiterung, z. B. `style.module.scss` , vorbereiten.

### Deaktivieren der CSS -Injektion in die Seite

Die automatische Injektion des CSS -Inhalts kann über den `?inline` -Abfrageparameter ausgeschaltet werden. In diesem Fall wird die verarbeitete CSS -Zeichenfolge wie gewohnt als Standardsexport des Moduls zurückgegeben, die Stile werden jedoch nicht auf die Seite eingebracht.

```js twoslash
import 'vite/client'
// ---schneiden---
import './foo.css' // wird in die Seite injiziert
import otherStyles from './bar.css?inline' // wird nicht injiziert
```

::: tip NOTE
Standard- und benannte Importe aus CSS -Dateien (z. B. `import style from './foo.css'` ) werden entfernt, da VITE 5. stattdessen die `?inline` -Abfrage verwenden.
:::

### Lightning CSS

Ab VITE 4.4 wird experimentelle Unterstützung für [Lightning CSS](https://lightningcss.dev/) unterstützt. Sie können sich dafür entscheiden, indem Sie Ihre Konfigurationsdatei [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer) hinzufügen und die optionale [`lightningcss`](https://www.npmjs.com/package/lightningcss) -Abhängigkeit installieren:

```bash
npm add -D lightningcss
```

Wenn dies aktiviert ist, werden CSS -Dateien von Lightning CSS anstelle von Postcs verarbeitet. Um es zu konfigurieren, können Sie Lightning CSS -Optionen an die [`css.lightningcss`](../config/shared-options.md#css-lightningcss) -Konfigurationsoption übergeben.

Um CSS -Module zu konfigurieren, verwenden Sie [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) anstelle von [`css.modules`](../config/shared-options.md#css-modules) (was die Art und Weise konfiguriert, wie Postcss mit CSS -Modulen umgeht).

Standardmäßig verwendet VITE ESBUILD, um CSS zu minifizieren. Lightning CSS kann auch als CSS -Minifikator mit [`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify) verwendet werden.

::: tip NOTE
[CSS-Pre-Processoren](#css-pre-processors) werden bei der Verwendung von Lightning CSS nicht unterstützt.
:::

## Statische Vermögenswerte

Wenn Sie einen statischen Vermögenswert importieren, wird die gelöste öffentliche URL zurückgeführt, wenn sie bedient wird:

```js twoslash
import 'vite/client'
// ---schneiden---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Spezielle Abfragen können ändern, wie Vermögenswerte geladen werden:

```js twoslash
import 'vite/client'
// ---schneiden---
// Lasten Sie explizit Vermögenswerte als URL
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
// ---schneiden---
// Lastanlagen als Saiten laden
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
// ---schneiden---
// Laden Sie Webarbeiter
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
// ---schneiden---
// Webarbeiter als Basis64 -Saiten zum Bauzeit eingelegt
import InlineWorker from './worker.js?worker&inline'
```

Weitere Details im [statischen Vermögensverfahren](./assets) .

## JSON

JSON -Dateien können direkt importiert werden - benannte Importe werden ebenfalls unterstützt:

```js twoslash
import 'vite/client'
// ---schneiden---
// im gesamten Objekt importieren
import json from './example.json'
// Importieren Sie ein Wurzelfeld als genannte Exporte - hilft beim Baumschütteln!
import { field } from './example.json'
```

## Glob -Import

VITE unterstützt das Importieren mehrerer Module aus dem Dateisystem über die spezielle `import.meta.glob` -Funktion:

```js twoslash
import 'vite/client'
// ---schneiden---
const modules = import.meta.glob('./dir/*.js')
```

Das obige wird in Folgendes umgewandelt:

```js
// Code von Vite erzeugt
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

Sie können dann über die Schlüssel des `modules` -Objekts iterieren, um auf die entsprechenden Module zuzugreifen:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

Übereinstimmende Dateien werden standardmäßig über einen dynamischen Import faul beladen und werden während des Builds in separate Teile aufgeteilt. Wenn Sie lieber alle Module direkt importieren möchten (z. B. wenn Sie sich auf Nebenwirkungen in diesen Modulen verlassen, müssen Sie zuerst angewendet werden), können Sie `{ eager: true }` als zweites Argument bestehen:

```js twoslash
import 'vite/client'
// ---schneiden---
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

Das obige wird in Folgendes umgewandelt:

```js
// Code von Vite erzeugt
import * as __vite_glob_0_0 from './dir/bar.js'
import * as __vite_glob_0_1 from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

### Mehrere Muster

Das erste Argument kann zum Beispiel eine Reihe von Globs sein

```js twoslash
import 'vite/client'
// ---schneiden---
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### Negative Muster

Negative Glob -Muster werden ebenfalls unterstützt (mit `!` vorangestellt). Um einige Dateien aus dem Ergebnis zu ignorieren, können Sie dem ersten Argument ausschließenden Glob -Muster hinzufügen:

```js twoslash
import 'vite/client'
// ---schneiden---
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// Code von Vite erzeugt
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### Genannte Importe

Es ist möglich, nur Teile der Module mit den `import` Optionen zu importieren.

```ts twoslash
import 'vite/client'
// ---schneiden---
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// Code von Vite erzeugt
const modules = {
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
}
```

In Kombination mit `eager` ist es sogar möglich, dass Baumschütteln für diese Module aktiviert werden.

```ts twoslash
import 'vite/client'
// ---schneiden---
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// Code erzeugt von VITE:
import { setup as __vite_glob_0_0 } from './dir/bar.js'
import { setup as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

Setzen Sie `import` auf `default` , um den Standard -Export zu importieren.

```ts twoslash
import 'vite/client'
// ---schneiden---
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// Code erzeugt von VITE:
import { default as __vite_glob_0_0 } from './dir/bar.js'
import { default as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

#### Benutzerdefinierte Abfragen

Sie können auch die `query` -Option verwenden, um Abfragen zum Importieren von Importieren anzugeben, um beispielsweise Assets [als Zeichenfolge](https://vite.dev/guide/assets.html#importing-asset-as-string) oder [als URL](https://vite.dev/guide/assets.html#importing-asset-as-url) zu importieren:

```ts twoslash
import 'vite/client'
// ---schneiden---
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// Code erzeugt von VITE:
const moduleStrings = {
  './dir/bar.svg': () => import('./dir/bar.svg?raw').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/bar.svg': () => import('./dir/bar.svg?url').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?url').then((m) => m['default']),
}
```

Sie können auch benutzerdefinierte Abfragen für andere Plugins zur Verfügung stellen:

```ts twoslash
import 'vite/client'
// ---schneiden---
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

### GLOB -Importbehälter

Beachten Sie, dass:

- Dies ist eine Nur-VITE-Funktion und kein Web- oder ES-Standard.
- Die Glob -Muster werden wie Import -Spezifizierer behandelt: Sie müssen entweder relativ (mit `./` beginnen) oder absolut (beginnen mit `/` , relativ zur Projektwurzel aufgelöst) oder einem Alias -Pfad (siehe [`resolve.alias` Option](/de/config/shared-options.md#resolve-alias) ).
- Die GLIbin -Matching erfolgt über [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) .
- Sie sollten sich auch bewusst sein, dass alle Argumente in der `import.meta.glob` **als Literale bestanden** werden müssen. Sie können keine Variablen oder Ausdrücke verwenden.

## Dynamischer Import

Ähnlich wie beim [Glob -Import](#glob-import) unterstützt Vite auch den dynamischen Import mit Variablen.

```ts
const module = await import(`./dir/${file}.js`)
```

Beachten Sie, dass Variablen nur Dateinamen eine Ebene tief darstellen. Wenn `file` `'foo/bar'` ist, würde der Import fehlschlagen. Für fortgeschrittene Nutzung können Sie die [Glob -Importfunktion](#glob-import) verwenden.

## WebAssembly

Vorkompilierte `.wasm` Dateien können mit `?init` importiert werden.
Der Standard -Export ist eine Initialisierungsfunktion, die ein Versprechen der [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance) zurückgibt:

```js twoslash
import 'vite/client'
// ---schneiden---
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

Die Init -Funktion kann auch ein Importobjekt annehmen, das als zweites Argument an [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate) übergeben wird:

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
// ---schneiden---
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

Im Produktionsaufbau werden `.wasm` Dateien kleiner als `assetInlineLimit` als Base64 -Zeichenfolgen eingeführt. Andernfalls werden sie als [statisches Vermögenswert](./assets) behandelt und On-Demand abgerufen.

::: tip NOTE
[Der Vorschlag für die Integrationsmodul -Integration für WebAssembly](https://github.com/WebAssembly/esm-integration) wird derzeit nicht unterstützt.
Verwenden Sie, um [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) zu tun, um dies zu bewältigen.
:::

### Zugriff Auf Das WebAssembly -Modul

Wenn Sie Zugriff auf das `Module` -Objekt benötigen, z. B. um es mehrmals zu instanziieren, verwenden Sie einen [expliziten URL -Import,](./assets#explicit-url-imports) um das Vermögenswert zu beheben, und führen Sie dann die Instanziierung durch:

```js twoslash
import 'vite/client'
// ---schneiden---
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### Abrufen des Moduls in node.js

In SSR kann die `fetch()` , die als Teil des `?init` -Imports stattfindet, mit `TypeError: Invalid URL` fehlschlagen.
Sehen Sie sich das Problem an [, die WASM in SSR unterstützen](https://github.com/vitejs/vite/issues/8882) .

Hier ist eine Alternative unter der Annahme, dass die Projektbasis das aktuelle Verzeichnis ist:

```js twoslash
import 'vite/client'
// ---schneiden---
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## Webarbeiter

### Importieren mit Konstruktoren

Ein Web -Worker -Skript kann mit [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) und [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker) importiert werden. Im Vergleich zu den Arbeiter -Suffixen nähert sich diese Syntax näher an die Standards und ist die **empfohlene** Möglichkeit, Arbeitnehmer zu schaffen.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

Der Worker Constructor akzeptiert auch Optionen, mit denen "Modul" -Anarbeitern erstellt werden können:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

Die Erkennung der Arbeiter funktioniert nur, wenn der `new URL()` -Konstruktor direkt in der `new Worker()` -Deklaration verwendet wird. Zusätzlich müssen alle Optionenparameter statische Werte sein (dh String -Literale).

### Importieren Mit Abfrage -Suffixen

Ein Web -Worker -Skript kann direkt importiert werden, indem `?worker` oder `?sharedworker` an die Importanforderung angehängt wird. Der Standard -Export ist ein benutzerdefinierter Arbeiterkonstruktor:

```js twoslash
import 'vite/client'
// ---schneiden---
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Das Arbeitskript kann auch ESM `import` -Anweisungen anstelle von `importScripts()` verwenden. **HINWEIS** : Während der Entwicklung stützt sich dies auf der [nativen Unterstützung von Browser](https://caniuse.com/?search=module%20worker) , aber für den Produktionsbau wird sie abgebaut.

Standardmäßig wird das Worker -Skript als separates Stück im Produktionsbau ausgestrahlt. Wenn Sie den Arbeiter als Basis64 -Zeichenfolgen einfügen möchten, fügen Sie die `inline` -Abfrage hinzu:

```js twoslash
import 'vite/client'
// ---schneiden---
import MyWorker from './worker?worker&inline'
```

Wenn Sie den Arbeiter als URL abrufen möchten, fügen Sie die `url` -Abfrage hinzu:

```js twoslash
import 'vite/client'
// ---schneiden---
import MyWorker from './worker?worker&url'
```

Weitere Informationen zum Konfigurieren der Bündelung aller Arbeitnehmer finden Sie unter [Worker -Optionen](/de/config/worker-options.md) .

## Inhaltssicherheitsrichtlinie (Csp)

Um CSP bereitzustellen, müssen bestimmte Direktiven oder Konfigurationen aufgrund der Interna von Vite festgelegt werden.

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

Wenn [`html.cspNonce`](/de/config/shared-options#html-cspnonce) gesetzt ist, fügt Vite ein Nonce -Attribut mit dem angegebenen Wert zu `<script>` und `<style>` Tags sowie `<link>` Tags für Stylesheets und Modulvorladen hinzu. Wenn diese Option festgelegt ist, injiziert VITE ein Meta -Tag ( `<meta property="csp-nonce" nonce="PLACEHOLDER" />` ).

Der Nonce -Wert eines Meta -Tags mit `property="csp-nonce"` wird von VITE verwendet, wenn es sowohl während des Entwicklers als auch nach dem Bau erforderlich ist.

:::warning
Stellen Sie sicher, dass Sie den Platzhalter durch einen eindeutigen Wert für jede Anfrage ersetzen. Dies ist wichtig, um zu verhindern, dass die Richtlinie einer Ressource umgangen wird, die ansonsten leicht zu tun ist.
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

Standardmäßig findet Vite kleine Vermögenswerte als Daten -URIs ein. Es ist erforderlich, `data:` für verwandte Richtlinien (z. B. [`img-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src) , [`font-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src) ) zuzulassen, oder die Deaktivierung durch Einstellen [`build.assetsInlineLimit: 0`](/de/config/build-options#build-assetsinlinelimit) ist erforderlich.

:::warning
Erlauben Sie nicht `data:` für [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) . Es ermöglicht die Injektion willkürlicher Skripte.
:::

## Optimierungen Bauen

> Die unten aufgeführten Funktionen werden automatisch als Teil des Build -Prozesses angewendet, und es besteht keine explizite Konfiguration, es sei denn, Sie möchten diese deaktivieren.

### CSS -Code -Spaltung

VITE extrahiert automatisch die von Modulen verwendeten CSS in einem asynchronen Teil und generiert eine separate Datei dafür. Die CSS -Datei wird automatisch über ein `<link>` -Tag geladen, wenn der zugehörige asynchronisierte Chunk geladen wird, und der asynchronisierte Stück wird garantiert nur bewertet, nachdem das CSS geladen wurde, um [Fouc](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.) zu vermeiden.

Wenn Sie lieber alle CSS in eine einzelne Datei extrahieren möchten, können Sie die CSS -Code -Aufteilung deaktivieren, indem Sie [`build.cssCodeSplit`](/de/config/build-options.md#build-csscodesplit) bis `false` einstellen.

### Vorladungsrichtlinie Generation

VITE generiert automatisch `<link rel="modulepreload">` Richtlinien für Einstiegsbrocken und deren direkten Importe in der gebauten HTML.

### Async -Chunk -Ladeoptimierung

In realen Anwendungen generiert Rollup häufig "gemeinsame" Brocken - Code, der zwischen zwei oder mehr anderen Teilen geteilt wird. In Kombination mit dynamischen Importen ist es weit verbreitet, das folgende Szenario zu haben:

<script setup>
import graphSvg from '../../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

In den nicht optimierten Szenarien muss der Browser, wenn asynchronen Chunk `A` importiert wird, `A` anfordern und analysieren, bevor er herausfinden kann, dass er auch das gemeinsame Chunk `C` benötigt. Dies führt zu einem zusätzlichen Netzwerk -Roundtrip:

```
Entry ---> A ---> C
```

VITE schreibt automatisch code-split-dynamische Importaufrufe mit einem Vorspannungsschritt um, so dass `C` **parallel** abgerufen wird, wenn `A` angefordert wird:

```
Entry ---> (A + C)
```

Es ist für `C` möglich, weitere Importe zu haben, was im nicht optimierten Szenario noch mehr Roundtrips führt. Die Optimierung von Vite verfolgt alle direkten Importe, um die Roundtrips unabhängig von der Importtiefe vollständig zu beseitigen.
