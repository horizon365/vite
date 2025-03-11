# Env Variablen Und Modi

VITE enthüllt bestimmte Konstanten im Rahmen des speziellen `import.meta.env` -Objekts. Diese Konstanten werden während des Entwicklers als globale Variablen definiert und statisch zum Bauzeit ersetzt, um Baumschütteln wirksam zu machen.

## Eingebaute Konstanten

Einige eingebaute Konstanten sind in allen Fällen erhältlich:

- **`import.meta.env.MODE`** : {String} Der [Modus](#modes) , in dem die App ausgeführt wird.

- **`import.meta.env.BASE_URL`** : {String} Die Basis -URL Die App wird ausgestellt. Dies wird durch die [`base` -Konfigurationsoption](/de/config/shared-options.md#base) bestimmt.

- **`import.meta.env.PROD`** : {boolean}, ob die App in der Produktion ausgeführt wird (Ausführen des Dev -Servers mit `NODE_ENV='production'` oder mit einer App, die mit `NODE_ENV='production'` erstellt wurde).

- **`import.meta.env.DEV`** : {boolean} Ob die App in der Entwicklung ausgeführt wird (immer das Gegenteil von `import.meta.env.PROD` )

- **`import.meta.env.SSR`** : {boolean} Ob die App im [Server](./ssr.md#conditional-logic) ausgeführt wird.

## Env Variablen

VITE legt Env -Variablen unter `import.meta.env` Objekt als Zeichenfolgen automatisch frei.

Um dem Client versehentlich durch versehentlich durchgende Env-Variablen zu verhindern, sind nur Variablen, die mit `VITE_` vorangestellt sind, Ihrem vite-verarbeiteten Code ausgesetzt. ZB für die folgenden Env -Variablen:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

Nur `VITE_SOME_KEY` wird Ihrem Client -Quellcode als `import.meta.env.VITE_SOME_KEY` ausgesetzt, `DB_PASSWORD` jedoch nicht.

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // undefiniert
```

Wenn Sie das ENV -Variablen -Präfix anpassen möchten, finden Sie in der Option [EnvPrefix](/de/config/shared-options.html#envprefix) .

:::tip Env parsing
Wie oben gezeigt, ist `VITE_SOME_KEY` eine Zahl, gibt jedoch eine Zeichenfolge zurück, wenn sie analysiert werden. Gleiches gilt auch für booleale Env -Variablen. Stellen Sie sicher, dass Sie bei Verwendung in Ihrem Code in den gewünschten Typ konvertieren.
:::

### `.env` Dateien

Vite verwendet [DOTenV](https://github.com/motdotla/dotenv) , um zusätzliche Umgebungsvariablen aus den folgenden Dateien in Ihrem [Umgebungsverzeichnis](/de/config/shared-options.md#envdir) zu laden:

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

:::tip Env Loading Priorities

Eine Env -Datei für einen bestimmten Modus (z. B. `.env.production` ) hat eine höhere Priorität als eine generische (z. B. `.env` ).

VITE lädt immer zusätzlich zur modusspezifischen `.env.[mode]` Datei `.env` und `.env.local` . Variablen `.env.local` die in modusspezifischen Dateien deklariert sind, haben Vorrang vor denjenigen in generischen Dateien. In `.env` Umgebung sind jedoch noch Variablen vorhanden.

Darüber hinaus haben Umgebungsvariablen, die bereits vorhanden sind, wenn VITE ausgeführt wird, die höchste Priorität und wird nicht durch `.env` Dateien überschrieben. Zum Beispiel beim Laufen `VITE_SOME_KEY=123 vite build` .

`.env` Dateien werden zu Beginn von VITE geladen. Starten Sie den Server nach Änderungen neu.

:::

Außerdem verwendet VITE [DOTENV-EXPAND](https://github.com/motdotla/dotenv-expand) , um Variablen zu erweitern, die in Env-Dateien geschrieben wurden. Um mehr über die Syntax zu erfahren, lesen Sie [ihre Dokumente](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow) .

Beachten Sie, dass Sie mit `\` entkommen müssen, wenn Sie `$` in Ihrem Umgebungswert verwenden möchten.

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

:::warning SECURITY NOTES

- `.env.*.local` Dateien sind nur lokal und können sensible Variablen enthalten. Sie sollten `*.local` zu Ihren `.gitignore` hinzufügen, um zu verhindern, dass sie in Git überprüft werden.

- Da alle Vite -Quellcode in Ihrem Client -Bundle ausgesetzt sind, sollten `VITE_*` Variablen _keine_ vertraulichen Informationen enthalten.

:::

::: details Expanding variables in reverse order

VITE unterstützt die Erweiterung von Variablen in umgekehrter Reihenfolge.
Zum Beispiel wird die unten stehende `.env` als `VITE_FOO=foobar` , `VITE_BAR=bar` bewertet.

```[.env]
VITE_FOO=foo${VITE_BAR}
VITE_BAR=bar
```

Dies funktioniert nicht in Shell -Skripten und anderen Tools wie `docker-compose` .
Trotzdem unterstützt Vite dieses Verhalten, da dies seit langem von `dotenv-expand` unterstützt wurde, und andere Tools im JavaScript -Ökosystem verwenden ältere Versionen, die dieses Verhalten unterstützen.

Um Interopop -Probleme zu vermeiden, wird empfohlen, sich auf dieses Verhalten zu verlassen. VITE kann in Zukunft Warnungen für dieses Verhalten abgeben.

:::

## IntelliSense für Typenkript

Standardmäßig liefert Vite Typdefinitionen für `import.meta.env` in [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) . Während Sie mehr benutzerdefinierte Env-Variablen in `.env.[mode]` Dateien definieren können, sollten Sie TypeScript-IntelliSense für benutzerdefinierte Env-Variablen erhalten, die mit `VITE_` vorangestellt sind.

Um dies zu erreichen, können Sie ein `vite-env.d.ts` -in `src` -Verzeichnis erstellen und dann `ImportMetaEnv` wie folgt erweitern:

```typescript [vite-env.d.ts]
///<reference types="vite/client">

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Weitere Env -Variablen ...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Wenn Ihr Code auf Typen aus Browser -Umgebungen wie [DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) und [Webworker](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts) beruht, können Sie das [LIB](https://www.typescriptlang.org/tsconfig#lib) -Feld in `tsconfig.json` aktualisieren.

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Imports will break type augmentation

Wenn die `ImportMetaEnv` -Augmentation nicht funktioniert, stellen Sie sicher, dass Sie in `vite-env.d.ts` keine `import` Aussagen haben. Weitere Informationen finden Sie in der [Typuskript -Dokumentation](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined) .

:::

## HTML Konstante Ersatz

Vite unterstützt auch das Ersetzen von Konstanten in HTML -Dateien. Alle Eigenschaften in `import.meta.env` können in HTML -Dateien mit einer speziellen `%CONST_NAME%` -Syntax verwendet werden:

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

Wenn die Env in `import.meta.env` , z. `%NON_EXISTENT%` , nicht existiert, wird sie ignoriert und nicht ersetzt, im Gegensatz zu `import.meta.env.NON_EXISTENT` in JS, wo es als `undefined` ersetzt wird.

Angesichts der Tatsache, dass VITE von vielen Frameworks verwendet wird, wird es absichtlich nicht öffnen, was komplexe Ersatze wie Konditionsteile hat. VITE kann mit [einem vorhandenen Userland -Plugin](https://github.com/vitejs/awesome-vite#transformers) oder einem benutzerdefinierten Plugin erweitert werden, das den [`transformIndexHtml` -Haken](./api-plugin#transformindexhtml) implementiert.

## Modi

Standardmäßig wird der Dev Server ( `dev` -Befehl) im `development` -Modus ausgeführt und der `build` -Befehl wird im `production` -Modus ausgeführt.

Dies bedeutet, dass beim `vite build` -Ausführen die Env -Variablen von `.env.production` geladen werden, wenn es eines gibt:

```[.env.production]
VITE_APP_TITLE=My App
```

In Ihrer App können Sie den Titel mit `import.meta.env.VITE_APP_TITLE` rendern.

In einigen Fällen möchten Sie möglicherweise `vite build` mit einem anderen Modus ausführen, um einen anderen Titel zu machen. Sie können den Standardmodus für einen Befehl überschreiben, indem Sie das `--mode` -Options -Flag übergeben. Wenn Sie beispielsweise Ihre App für einen Staging -Modus erstellen möchten:

```bash
vite build --mode staging
```

Und erstellen Sie eine `.env.staging` -Datei:

```[.env.staging]
VITE_APP_TITLE=My App (staging)
```

Da `vite build` standardmäßig einen Produktionsbau ausführt, können Sie dies auch ändern und einen Entwicklungsbau mit einem anderen Modus und `.env` -Dateikonfiguration ausführen:

```[.env.testing]
NODE_ENV=development
```

### Node_env und modi

Es ist wichtig zu beachten, dass `NODE_ENV` ( `process.env.NODE_ENV` ) und Modi zwei verschiedene Konzepte sind. So beeinflussen unterschiedliche Befehle die `NODE_ENV` und den Modus:

| Befehl                                               | Node_env        | Modus           |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

Die verschiedenen Werte von `NODE_ENV` und Modus spiegeln auch die entsprechenden `import.meta.env` Eigenschaften wider:

| Befehl                 | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| Befehl               | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` in `.env` files

`NODE_ENV=...` kann im Befehl und auch in Ihrer `.env` -Datei eingestellt werden. Wenn `NODE_ENV` in einer `.env.[mode]` -Datei angegeben ist, kann der Modus verwendet werden, um seinen Wert zu steuern. Sowohl `NODE_ENV` als auch Modi bleiben jedoch zwei verschiedene Konzepte.

Der Hauptvorteil bei `NODE_ENV=...` im Befehl besteht darin, dass VITE den Wert frühzeitig erkennen kann. Außerdem können Sie `process.env.NODE_ENV` in Ihrer vite -Konfiguration lesen, da VITE die Env -Dateien nur dann laden kann, sobald die Konfiguration bewertet wird.
:::
