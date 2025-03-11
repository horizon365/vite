# Umgebungs -API für Plugins

:::warning Experimental
Umwelt -API ist experimentell. Wir werden die APIs während von VITE 6 stabil halten, damit das Ökosystem experimentieren und darüber aufbaut. Wir planen, diese neuen APIs mit potenziellen Veränderungen in Vite 7 zu stabilisieren.

Ressourcen:

- [Feedback -Diskussion,](https://github.com/vitejs/vite/discussions/16358) bei der wir Feedback zu den neuen APIs sammeln.
- [Umwelt -API -PR,](https://github.com/vitejs/vite/pull/16471) bei der die neue API implementiert und überprüft wurde.

Bitte teilen Sie uns Ihr Feedback mit.
:::

## Zugriff auf die aktuelle Umgebung in Hooks

Da es nur zwei Umgebungen gab, bis VITE 6 ( `client` und `ssr` ), reichte ein `ssr` Boolescher Zeit aus, um die aktuelle Umgebung in VITE -APIs zu identifizieren. Die Plugin -Hooks erhielten einen `ssr` Booleschen Parameter des letzten Optionen, und mehrere APIs erwarteten, dass ein optionaler Parameter der letzten `ssr` Module ordnungsgemäß mit der richtigen Umgebung assoziieren, um ordnungsgemäß mit der richtigen Umgebung zu assoziieren (z. B. `server.moduleGraph.getModuleByUrl(url, { ssr })` ).

Mit dem Aufkommen konfigurierbarer Umgebungen haben wir jetzt eine einheitliche Möglichkeit, auf ihre Optionen und Instanz in Plugins zuzugreifen. Plugin -Hooks setzen jetzt `this.environment` in ihrem Kontext aus, und APIs, die zuvor erwartet hatten, dass ein `ssr` Boolescher Wert jetzt in die richtige Umgebung abgebaut ist (z. B. für `environment.moduleGraph.getModuleByUrl(url)` ).

Der Vite -Server verfügt über eine gemeinsam genutzte Plugin -Pipeline, aber wenn ein Modul verarbeitet wird, erfolgt dies immer im Kontext einer bestimmten Umgebung. Die `environment` -Instanz ist im Plugin -Kontext erhältlich.

Ein Plugin könnte die `environment` -Instanz verwenden, um die Art und Weise zu ändern, wie ein Modul abhängig von der Konfiguration für die Umgebung verarbeitet wird (auf die mit `environment.config` zugegriffen werden kann).

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

## Registrieren Neuer Umgebungen Mithilfe Von Hooks

Plugins können neue Umgebungen in den `config` -Haken hinzufügen (z. B. ein separates Moduldiagramm für [RSC](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components) ):

```ts
  config(config: UserConfig) {
    config.environments.rsc ??= {}
  }
```

Ein leeres Objekt reicht aus, um die Umgebung zu registrieren, Standardwerte über die Konfiguration der Root -Level -Umgebungskonfiguration.

## Konfigurieren Der Umgebung Mithilfe Von Hooks

Während der `config` -Hook ausgeführt wird, ist die vollständige Liste der Umgebungen noch nicht bekannt, und die Umgebungen können sowohl durch die Standardwerte der Root -Level -Umgebungskonfiguration als auch durch den `config.environments` -Datensatz ausdrücklich beeinflusst werden.
Plugins sollten Standardwerte mit dem `config` -Hook festlegen. Um jede Umgebung zu konfigurieren, können sie den neuen `configEnvironment` -Haken verwenden. Dieser Haken ist für jede Umgebung mit seiner teilweise aufgelösten Konfiguration aufgefordert, einschließlich der Auflösung der endgültigen Standardeinstellungen.

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    if (name === 'rsc') {
      options.resolve.conditions = // ...
```

## Der `hotUpdate` Haken

- **Typ:** `(this: {Umgebung: Devenvironment}, Optionen: HotupdateOptions) => Array<EnvironmentModuleNode> | Leere | Versprechen <Array<EnvironmentModuleNode> | void> `
- **Siehe auch:** [HMR API](./api-hmr)

Mit dem `hotUpdate` -Hook können Plugins eine benutzerdefinierte HMR -Aktualisierungsbehandlung für eine bestimmte Umgebung durchführen. Wenn sich eine Datei ändert, wird der HMR -Algorithmus für jede Umgebung in Serie gemäß der Reihenfolge in `server.environments` ausgeführt, sodass der `hotUpdate` Haken mehrmals aufgerufen wird. Der Haken empfängt ein Kontextobjekt mit der folgenden Signatur:

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

- `this.environment` ist die Modulausführungsumgebung, in der derzeit eine Dateiaktualisierung verarbeitet wird.

- `modules` ist eine Reihe von Modulen in dieser Umgebung, die von der geänderten Datei betroffen sind. Es handelt sich um ein Array, da eine einzelne Datei mehrere servierte Module (z. B. SFCs) zuordnen kann.

- `read` ist eine asynchronisierende Lesfunktion, die den Inhalt der Datei zurückgibt. Dies wird bereitgestellt, da in einigen Systemen der Rückruf von Dateiänderungen zu schnell abfeuert werden kann, bevor der Editor die Aktualisierung der Datei beendet, und Direct `fs.readFile` gibt leere Inhalte zurück. Die in der Lektüre übergebene Lesfunktion normalisiert dieses Verhalten.

Der Haken kann wählen:

- Filtern Sie die betroffene Modulliste und beschränken Sie, dass die HMR genauer ist.

- Geben Sie ein leeres Array zurück und führen Sie eine vollständige Reload durch:

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

    // Module manuell ungültig
    const invalidatedModules = new Set()
    for (const mod of modules) {
      this.environment.moduleGraph.invalidateModule(
        mod,
        invalidatedModules,
        timestamp,
        true
      )
    }
    this.environment.hot.send({ type: 'full-reload' })
    return []
  }
  ```

- Geben Sie ein leeres Array zurück und führen Sie eine vollständige benutzerdefinierte HMR -Handhabung durch, indem Sie benutzerdefinierte Ereignisse an den Client senden:

  ```js
  hotUpdate() {
    if (this.environment.name !== 'client')
      return

    this.environment.hot.send({
      type: 'custom',
      event: 'special-update',
      data: {}
    })
    return []
  }
  ```

  Der Client -Code sollte den entsprechenden Handler mit der [HMR -API](./api-hmr) registrieren (dies könnte durch den `transform` -Hook desselben Plugins injiziert werden):

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // Benutzerdefinierte Update durchführen
    })
  }
  ```

## Plugins Pro Umwelt

Ein Plugin kann definieren, in welchen Umgebungen es mit der `applyToEnvironment` -Funktion gelten sollte.

```js
const UnoCssPlugin = () => {
  // gemeinsamer globaler Staat
  return {
    buildStart() {
      // Init pro-Umweltzustand mit Schwächen <umgebung, Daten>
      // mit dieser Umgebung
    },
    configureServer() {
      // Verwenden Sie normalerweise globale Haken
    },
    applyToEnvironment(environment) {
      // Rückgabe true, wenn dieses Plugin in dieser Umgebung aktiv sein sollte.
      // Oder geben Sie ein neues Plugin zurück, um es zu ersetzen.
      // Wenn der Haken nicht verwendet wird, ist das Plugin in allen Umgebungen aktiv
    },
    resolveId(id, importer) {
      // fordert nur Umgebungen, die dieses Plugin anwendet
    },
  }
}
```

Wenn sich ein Plugin nicht bewusst ist und einen Zustand hat, der in der aktuellen Umgebung nicht ausgestattet ist, ermöglicht der `applyToEnvironment` Haken, es problemlos in der Umgebung zu schaffen.

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

Vite exportiert einen Helfer `perEnvironmentPlugin` um diese Fälle zu vereinfachen, in denen keine anderen Haken erforderlich sind:

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

## Umgebung in Bauhaken

Auf die gleiche Weise wie bei Dev erhalten Plugin -Hooks auch die Umgebungsinstanz während des Builds und ersetzen den `ssr` Booleschen.
Dies funktioniert auch für `renderChunk` , `generateBundle` und andere Build -Haken.

## Gemeinsame Plugins Während Des Builds

Vor Vite 6 funktionierten die Plugins -Pipelines während des Entwicklers und Build auf andere Weise:

- **Während Dev:** Plugins werden gemeinsam genutzt
- **Während des Builds:** Plugins sind für jede Umgebung isoliert (in verschiedenen Prozessen: `vite build` dann `vite build --ssr` ).

Dies zwang Frameworks, den Status zwischen dem `client` -Build und dem `ssr` -Build durch Manifestdateien zu teilen, die in das Dateisystem geschrieben wurden. In Vite 6 bauen wir jetzt alle Umgebungen in einem einzigen Prozess auf, sodass die Art und Weise, wie die Plugins-Pipeline und die Kommunikation zwischen Umwelt, mit Dev ausgerichtet werden können.

In einem zukünftigen Major (Vite 7 oder 8) wollen wir eine vollständige Ausrichtung haben:

- **Sowohl Dev als auch Build:** Plugins werden gemeinsam genutzt, mit [Filterung pro Umwelt](#per-environment-plugins)

Es wird auch eine einzelne `ResolvedConfig` -Instanz geben, die während des Builds geteilt wird und das Caching auf dem gesamten App -Erstellungsprozessniveau auf die gleiche Weise wie bei `WeakMap<ResolvedConfig, CachedData>` während des Devels ermöglicht.

Für Vite 6 müssen wir einen kleineren Schritt durchführen, um die Rückwärtskompatibilität beizubehalten. Ökosystem-Plugins verwenden derzeit `config.build` anstelle von `environment.config.build` , um auf die Konfiguration zuzugreifen. Daher müssen wir standardmäßig eine neue `ResolvedConfig` pro Umgebung erstellen. Ein Projekt kann sich in die gemeinsame Nutzung der vollständigen Konfigurations- und Plugins-Pipeline-Einstellung `builder.sharedConfigBuild` bis `true` entscheiden.

Diese Option würde zunächst nur einer kleinen Teilmenge von Projekten funktionieren, sodass Plugin-Autoren sich dafür entscheiden können, dass ein bestimmtes Plugin durch Einstellen des `sharedDuringBuild` Flags auf `true` freigegeben wird. Dies ermöglicht den einfachen Austausch von Status beide für reguläre Plugins:

```js
function myPlugin() {
  // Teilen Sie den Zustand in allen Umgebungen in Dev und Build auf
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // Melden Sie sich für alle Umgebungen in eine einzelne Instanz ein
    sharedDuringBuild: true,
  }
}
```
