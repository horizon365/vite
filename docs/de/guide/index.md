# Erste Schritte

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## Überblick

Vite (French word for "quick", pronounced `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>, like "veet") is a build tool that aims to provide a faster and leaner development experience for modern web projects. It consists of two major parts:

- Ein Dev -Server, der [umfangreiche Feature -Verbesserungen](./features) gegenüber [nativen ES -Modulen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) bietet, beispielsweise extrem schneller [Hot -Modul -Austausch (HMR)](./features#hot-module-replacement) .

- Ein Build-Befehl, der Ihren Code mit [Rollup](https://rollupjs.org) bündelt, das vorkonfiguriert ist, um hoch optimierte statische Vermögenswerte für die Produktion auszugeben.

Vite ist eins Meinung und verfügt über sinnvolle Standardeinstellungen aus dem Box. Lesen Sie, was im [Features Guide](./features) möglich ist. Die Unterstützung für Frameworks oder Integration mit anderen Tools ist durch [Plugins](./using-plugins) möglich. Der [Konfigurationsabschnitt](../config/) erläutert, wie Sie bei Bedarf vite an Ihr Projekt anpassen.

Vite ist auch über seine [Plugin -API](./api-plugin) und [JavaScript -API](./api-javascript) mit vollem Schreibunterstützung hoch erweiterbar.

Sie können mehr über die Begründung des Projekts im Abschnitt ["Why Vite"](./why) erfahren.

## Browserunterstützung

Während der Entwicklung setzt Vite [`esnext` als Transformation Ziel](https://esbuild.github.io/api/#target) , da wir annehmen, dass ein moderner Browser verwendet wird und alle neuesten JavaScript- und CSS -Funktionen unterstützt. Dies verhindert die Absenkung der Syntax und lässt VITE -Module so nah wie möglich am ursprünglichen Quellcode servieren.

Für den Produktionsaufbau zielt standardmäßig VITE -Ziele, die moderne JavaScript unterstützen, wie [native ES -Module](https://caniuse.com/es6-module) , [natives ESM -Dynamikimport](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [Nullish Coalscing](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) und [Bigint](https://caniuse.com/bigint) . Legacy-Browser können über den offiziellen [@vitejs/Plugin-Legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) unterstützt werden. Weitere Informationen finden Sie im [Bereich "Gebäude" für Produktionsabschnitt](./build) .

## Vite Online Versuchen

Sie können Vite online auf [Stackblitz](https://vite.new/) ausprobieren. Es wird das vite-basierte Build-Setup direkt im Browser ausgeführt, sodass es fast identisch mit dem lokalen Setup ist, aber keine Installation auf Ihrem Computer erfordert. Sie können zu `vite.new/{template}` navigieren, um auszuwählen, welches Framework verwendet werden soll.

Die unterstützten Vorlage sind vorhanden:

|              JavaScript               |                Typoskript                 |
| :-----------------------------------: | :---------------------------------------: |
|  [Vanille](https://vite.new/vanilla)  | [Vanille-ts](https://vite.new/vanilla-ts) |
|      [Vue](https://vite.new/vue)      |     [VUE-TS](https://vite.new/vue-ts)     |
|  [reagieren](https://vite.new/react)  |   [React-ts](https://vite.new/react-ts)   |
| [Vorwirkung](https://vite.new/preact) |  [Preact-Ts](https://vite.new/preact-ts)  |
|  [beleuchtet](https://vite.new/lit)   |     [Lit-Ts](https://vite.new/lit-ts)     |
|   [Sufle](https://vite.new/svelte)    |  [Sufle-ts](https://vite.new/svelte-ts)   |
|   [solide](https://vite.new/solid)    |   [Solid-Ts](https://vite.new/solid-ts)   |
|     [Qwik](https://vite.new/qwik)     |    [Qwik-ts](https://vite.new/qwik-ts)    |

## Gerüste Ihr Erstes Vite -Projekt

::: tip Compatibility Note
VITE benötigt [Node.js](https://nodejs.org/de/) Version 18+ oder 20+. Einige Vorlagen erfordern jedoch eine höhere Node.js -Version, um zu funktionieren. Bitte upgraden Sie, wenn Ihr Paketmanager davor warnt.
:::

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

Dann folgen Sie den Eingabeaufforderungen!

Sie können auch den Projektnamen und die Vorlage, die Sie über zusätzliche Befehlszeilenoptionen verwenden möchten, auch direkt angeben. Um zum Beispiel ein VITE + VUE -Projekt zu sammeln, rennen Sie:

::: code-group

```bash [npm]
# NPM 7+, extra doppelstich erforderlich:
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

Weitere Informationen zu jeder unterstützten Vorlage finden Sie [unter](https://github.com/vitejs/vite/tree/main/packages/create-vite) : `vanilla` , `vanilla-ts` , `vue` , `vue-ts` , `react` , `react-ts` , `react-swc` , `react-swc-ts` , `preact` , `preact-ts` , `lit` , `lit-ts` , `svelte` , `svelte-ts` , `solid` , `solid-ts` , `qwik` , `qwik-ts`

Sie können `.` für den Projektnamen zum Gerüst im aktuellen Verzeichnis verwenden.

## Gemeinschaftsvorlagen

Create-Vite ist ein Tool, um ein Projekt schnell aus einer grundlegenden Vorlage für beliebte Frameworks zu starten. Schauen Sie sich Awesome Vite für [gepflegte Vorlagen für Community -gepflegtes](https://github.com/vitejs/awesome-vite#templates) an, die andere Tools enthalten oder verschiedene Frameworks abzielen.

Für eine Vorlage von `https://github.com/user/project` können Sie sie online mit `https://github.stackblitz.com/user/project` probieren ( `.stackblitz` nach `github` zur URL des Projekts hinzuzufügen).

Sie können auch ein Tool wie [Degit](https://github.com/Rich-Harris/degit) verwenden, um Ihr Projekt mit einem der Vorlagen zu senken. Unter der Annahme, dass das Projekt auf GitHub liegt und `main` als Standardzweig verwendet, können Sie eine lokale Kopie mit:

```bash
npx degit user/project#Haupt-My-Project
cd my-project

npm install
npm run dev
```

## Manuelle Installation

In Ihrem Projekt können Sie die `vite` CLI verwenden, indem Sie:

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

Und erstellen Sie eine `index.html` -Datei wie diese:

```html
<p>Hello Vite!</p>
```

Führen Sie dann den entsprechenden CLI -Befehl in Ihrem Terminal aus:

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

:::

Die `index.html` wird auf `http://localhost:5173` serviert.

## `index.html` und Projektwurzel

Eine Sache, die Sie vielleicht bemerkt haben, ist, dass in einem vite-Projekt `index.html` vorne und zentral ist, anstatt innerhalb von `public` wegzustücken. Dies ist beabsichtigt: Während der Entwicklung ist VITE ein Server und `index.html` ist der Einstiegspunkt für Ihre Anwendung.

Vite behandelt `index.html` als Quellcode und Teil des Moduldiagramms. Es wird `<script type="module" src="...">` gelöst, die Ihren JavaScript -Quellcode verweist. Auch Inline `<script type="module">` und CSS, auf die über `<link href>` verwiesen wird, genießen auch vite-spezifische Funktionen. Darüber hinaus werden URLs in `index.html` automatisch wiederhergestellt, sodass keine besonderen `%PUBLIC_URL%` Platzhalter erforderlich sind.

Ähnlich wie bei statischen HTTP -Servern hat Vite das Konzept eines "Root -Verzeichnisses", aus dem Ihre Dateien bedient werden. Sie sehen, dass es im Rest der Dokumente als `<root>` bezeichnet wird. Absolute URLs in Ihrem Quellcode werden mit dem Projektroot als Basis behoben, sodass Sie Code schreiben können, als würden Sie mit einem normalen statischen Dateiserver arbeiten (außer viel leistungsfähiger!). VITE ist auch in der Lage, Abhängigkeiten zu bearbeiten, die sich für Standorte außerhalb der Wurzeldateien entschließen, was es auch in einem monorepo-basierten Setup verwendbar macht.

Vite unterstützt auch [mehrseitige Apps](./build#multi-page-app) mit mehreren `.html` Einstiegspunkten.

#### Alternative Wurzel Angeben

Das Ausführen `vite` startet den Dev -Server mit dem aktuellen Arbeitsverzeichnis als Root. Sie können eine alternative Wurzel mit `vite serve some/sub/dir` angeben.
Beachten Sie, dass VITE auch [seine Konfigurationsdatei (dh `vite.config.js` )](/de/config/#configuring-vite) im Projektroot auflöst. Sie müssen sie also verschieben, wenn das Stammveränderungen geändert wird.

## Befehlszeilenschnittstelle

In einem Projekt, bei dem Vite installiert ist, können Sie die `vite` -Binärdatoren in Ihren NPM -Skripten verwenden oder es direkt mit `npx vite` ausführen. Hier sind die Standard -NPM -Skripte in einem Gerüstprojekt:

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

Sie können zusätzliche CLI -Optionen wie `--port` oder `--open` angeben. Laufen Sie in Ihrem Projekt `npx vite --help` für eine vollständige Liste der CLI -Optionen.

Erfahren Sie mehr über die [Befehlszeilenschnittstelle](./cli.md)

## Verwenden Unveröffentlichter Commits

Wenn Sie es kaum erwarten können, dass eine neue Version die neuesten Funktionen testen, können Sie ein bestimmtes Komitee von VITE mit https://pkg.pr.new installieren:

::: code-group

```bash [npm]
$ npm install -D https://pkg.pr.new/vite@SHA
```

```bash [Yarn]
$ yarn add -D https://pkg.pr.new/vite@SHA
```

```bash [pnpm]
$ pnpm add -D https://pkg.pr.new/vite@SHA
```

```bash [Bun]
$ bun add -D https://pkg.pr.new/vite@SHA
```

:::

Ersetzen Sie `SHA` durch eine der [Vite's Commit Shas](https://github.com/vitejs/vite/commits/main/) . Beachten Sie, dass sich nur im letzten Monat Commits funktionieren, da ältere Veröffentlichungen für die Commit ausgelöscht werden.

Alternativ können Sie das [vite Repo](https://github.com/vitejs/vite) auch auf Ihre lokale Maschine klonen und dann selbst erstellen und verknüpfen ( [PNPM](https://pnpm.io/) ist erforderlich):

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # Verwenden Sie Ihren bevorzugten Paketmanager für diesen Schritt
```

Gehen Sie dann zu Ihrem vite -basierten Projekt und führen Sie `pnpm link --global vite` aus (oder zu dem Paketmanager, mit dem Sie `vite` global verlinkt haben). Starten Sie nun den Entwicklungsserver neu, um am Blutungsrand zu fahren!

::: tip Dependencies using Vite
Um die vite -Version zu ersetzen, die von Abhängigkeiten transitiv verwendet wird, sollten Sie [NPM -Überschreibungen](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides) oder [PNPM -Überschreibungen](https://pnpm.io/package_json#pnpmoverrides) verwenden.
:::

## Gemeinschaft

Wenn Sie Fragen haben oder Hilfe benötigen, wenden Sie sich an die Community bei [Discord-](https://chat.vite.dev) und [Github -Diskussionen](https://github.com/vitejs/vite/discussions) .
