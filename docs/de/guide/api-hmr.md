# HMR API

:::tip Note
Dies ist die Client -HMR -API. Weitere Informationen zum HMR -Update in Plugins finden Sie in [Handleiter](./api-plugin#handlehotupdate) .

Die manuelle HMR -API ist in erster Linie für Autoren von Framework und Werkzeugen vorgesehen. Als Endbenutzer wird HMR wahrscheinlich bereits für Sie in den Framework -spezifischen Startervorlagen behandelt.
:::

Vite enthält seine manuelle HMR -API über das spezielle `import.meta.hot` -Objekt:

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'

// ---schneiden---
interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  off<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}
```

## Erforderliche Bedingte Wache

Stellen Sie zunächst sicher, dass Sie die gesamte HMR-API-Verwendung mit einem bedingten Block bewachen, damit der Code in der Produktion baumschreibt werden kann:

```js
if (import.meta.hot) {
  // HMR -Code
}
```

## IntelliSense für Typenkript

VITE bietet Typdefinitionen für `import.meta.hot` in [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) . Sie können im `src` -Verzeichnis eine `env.d.ts` erstellen, damit TypeScript die Typdefinitionen aufnimmt:

```ts
///<reference types="vite/client">
```

## `hot.accept(cb)`

Verwenden Sie `import.meta.hot.accept` mit einem Rückruf, der das aktualisierte Modul empfängt:

```js twoslash
import 'vite/client'
// ---schneiden---
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // Newmodule ist undefiniert, als SyntaxEerror passiert ist
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

Ein Modul, das heiße Updates "akzeptiert", wird als **HMR -Grenze** angesehen.

Das HMR von Vite tauscht das ursprünglich importierte Modul nicht tatsächlich aus: Wenn ein HMR-Grenzmodul importiert, ist es für die Aktualisierung dieser Wiederexports verantwortlich (und diese Exporte müssen `let` verwenden). Darüber hinaus werden Importeure die Kette vom Grenzmodul nicht über die Änderung benachrichtigt. Diese vereinfachte HMR -Implementierung reicht für die meisten Entwickler -Anwendungsfälle aus und ermöglicht es uns, die teure Arbeit der Generierung von Proxy -Modulen zu überspringen.

Vite verlangt, dass der Aufruf dieser Funktion im Quellcode als `import.meta.hot.accept(` (Whitespace-sensitiv) angezeigt wird, damit das Modul Aktualisierung akzeptiert. Dies ist eine Voraussetzung für die statische Analyse, die Vite durchführt, um die HMR -Unterstützung für ein Modul zu ermöglichen.

## `hot.accept(deps, cb)`

Ein Modul kann auch Aktualisierungen von direkten Abhängigkeiten akzeptieren, ohne sich selbst neu zu laden:

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
// ---schneiden---
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // Der Rückruf empfängt das Modul "Aktualisiert" ./foo.js "
    newFoo?.foo()
  })

  // Kann auch eine Reihe von DEP -Modulen akzeptieren:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // Der Rückruf empfängt ein Array, in dem sich nur das aktualisierte Modul befindet
      // Non Null. Wenn das Update nicht erfolgreich war (Syntaxfehler für Ex.),
      // Das Array ist leer
    },
  )
}
```

## `hot.dispose(cb)`

Ein selbstakzeptierendes Modul oder ein Modul, das erwartet, von anderen akzeptiert zu werden, kann `hot.dispose` verwenden, um alle anhaltenden Nebenwirkungen aufzuräumen, die durch seine aktualisierte Kopie erstellt wurden:

```js twoslash
import 'vite/client'
// ---schneiden---
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // Aufräumwirkung
  })
}
```

## `hot.prune(cb)`

Registrieren Sie einen Rückruf, der aufgerufen wird, wenn das Modul nicht mehr auf der Seite importiert wird. Im Vergleich zu `hot.dispose` kann dies verwendet werden, wenn der Quellcode bei Updates die Nebenwirkungen selbst aufräumt und Sie nur aufräumen müssen, wenn er von der Seite entfernt wird. Vite verwendet dies derzeit für `.css` Importe.

```js twoslash
import 'vite/client'
// ---schneiden---
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // Aufräumwirkung
  })
}
```

## `hot.data`

Das `import.meta.hot.data` -Objekt wird über verschiedene Fälle desselben aktualisierten Moduls hinweg bestehen. Es kann verwendet werden, um Informationen von einer früheren Version des Moduls an die nächste weiterzugeben.

Beachten Sie, dass die Neuzuordnung von `data` selbst nicht unterstützt wird. Stattdessen sollten Sie Eigenschaften des `data` -Objekts mutieren, damit Informationen von anderen Handlern erhalten bleiben.

```js twoslash
import 'vite/client'
// ---schneiden---
// OK
import.meta.hot.data.someValue = 'hello'

// nicht unterstützt
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

Dies ist derzeit eine Noop und ist für die Rückwärtskompatibilität da. Dies könnte sich in Zukunft ändern, wenn es eine neue Verwendung dafür gibt. Verwenden Sie `hot.invalidate()` , um anzuzeigen, dass das Modul nicht heiß ist.

## `hot.invalidate(message?: string)`

Ein selbstakzeptierendes Modul kann während der Laufzeit erkennen, dass es ein HMR-Update nicht verarbeiten kann. Daher muss das Update gewaltsam an Importeure verbreitet werden. Durch die Aufruf `import.meta.hot.invalidate()` wird der HMR-Server die Importeure des Anrufers ungültig machen, als ob der Anrufer nicht selbstakzeptabel wäre. Dadurch protokolliert eine Nachricht sowohl in der Browserkonsole als auch im Terminal. Sie können eine Nachricht übergeben, um einen Kontext darüber zu geben, warum die Ungültigmachung geschehen ist.

Beachten Sie, dass Sie immer `import.meta.hot.accept` anrufen sollten, auch wenn Sie vorhaben, `invalidate` danach anzurufen, oder der HMR-Client wird nicht auf zukünftige Änderungen des selbstakzeptanten Moduls hören. Um Ihre Absicht klar zu kommunizieren, empfehlen wir, `invalidate` innerhalb des `accept` -Rückrufs wie SO anzurufen:

```js twoslash
import 'vite/client'
// ---schneiden---
import.meta.hot.accept((module) => {
  // Sie können die neue Modulinstanz verwenden, um zu entscheiden, ob Sie ungültig machen möchten.
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

Hören Sie sich ein HMR -Event an.

Die folgenden HMR -Ereignisse werden von VITE automatisch entsandt:

- `'vite:beforeUpdate'` Wenn ein Update angewendet wird (z. B. wird ein Modul ersetzt)
- `'vite:afterUpdate'` Wenn gerade ein Update angewendet wurde (z. B. wurde ein Modul ersetzt)
- `'vite:beforeFullReload'` Wenn eine vollständige Nachlade auftreten wird
- `'vite:beforePrune'` Wenn Module, die nicht mehr benötigt werden, beschnitten werden müssen
- `'vite:invalidate'` Wenn ein Modul mit `import.meta.hot.invalidate()` ungültig ist
- `'vite:error'` Wenn ein Fehler auftritt (EG -Syntaxfehler)
- `'vite:ws:disconnect'` Wenn die Websocket -Verbindung verloren geht
- `'vite:ws:connect'` Wenn die WebSocket-Verbindung (neu) festgelegt ist

Benutzerdefinierte HMR -Ereignisse können auch aus Plugins gesendet werden. Weitere Informationen finden Sie unter [dem Handleatupdate](./api-plugin#handlehotupdate) .

## `hot.off(event, cb)`

Entfernen Sie den Rückruf von den Event -Hörern.

## `hot.send(event, data)`

Senden Sie benutzerdefinierte Ereignisse zurück an den Dev Server von Vite.

Wenn die Daten vor dem Anschließen angerufen werden, werden die Daten gepuffert und gesendet, sobald die Verbindung hergestellt ist.

Weitere Informationen finden Sie in [der Kunden-Server-Kommunikation](/de/guide/api-plugin.html#client-server-communication) , einschließlich eines Abschnitts zum [Eingeben von benutzerdefinierten Ereignissen](/de/guide/api-plugin.html#typescript-for-custom-events) .

## Weitere Lesen

Wenn Sie mehr darüber erfahren möchten, wie Sie die HMR-API verwenden und wie sie unter dem Haus funktioniert. Überprüfen Sie die folgenden Ressourcen:

- [Heißmodulersatz ist einfach](https://bjornlu.com/blog/hot-module-replacement-is-easy)
