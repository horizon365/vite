# Umwelt -API

:::warning Experimental
Umwelt -API ist experimentell. Wir werden die APIs während von VITE 6 stabil halten, damit das Ökosystem experimentieren und darüber aufbaut. Wir planen, diese neuen APIs mit potenziellen Veränderungen in Vite 7 zu stabilisieren.

Ressourcen:

- [Feedback -Diskussion,](https://github.com/vitejs/vite/discussions/16358) bei der wir Feedback zu den neuen APIs sammeln.
- [Umwelt -API -PR,](https://github.com/vitejs/vite/pull/16471) bei der die neue API implementiert und überprüft wurde.

Bitte teilen Sie uns Ihr Feedback mit.
:::

## Formalisierende Umgebungen

Vite 6 formalisiert das Konzept der Umgebungen. Bis Vite 5 gab es zwei implizite Umgebungen ( `client` und optional `ssr` ). Mit der neuen Umgebung API können Benutzer und Frameworkautoren so viele Umgebungen erstellen, wie dies erforderlich ist, um die Art und Weise, wie ihre Apps in der Produktion funktionieren, abzubilden. Diese neue Fähigkeit erforderte ein großes internes Refactoring, aber es wurde viel Aufwand auf die Rückwärtskompatibilität gestellt. Das ursprüngliche Ziel von Vite 6 ist es, das Ökosystem so reibungslos wie möglich in das neue Hauptfach zu bringen und die Einführung dieser neuen experimentellen APIs zu verzögern, bis genügend Benutzer migriert und Rahmenbedingungen und Plugin -Autoren das neue Design validiert haben.

## Schließen Sie Die Lücke Zwischen Build Und Dev

Für ein einfaches SPA/MPA sind der Konfiguration keine neuen APIs um Umgebungen ausgesetzt. Innen wird Vite die Optionen auf eine `client` -Umgebung anwenden, es ist jedoch nicht erforderlich, dieses Konzept bei der Konfiguration von VITE zu kennen. Die Konfiguration und das Verhalten von Vite 5 sollten hier nahtlos funktionieren.

Wenn wir zu einer typischen Server-Side-App (SSR) -P-App wechseln, haben wir zwei Umgebungen:

- `client` : Leitet die App im Browser.
- `server` : führt die App im Knoten (oder in anderen Server -Laufzeiten) aus, die Seiten rendern, bevor sie an den Browser gesendet werden.

In Dev führt Vite den Servercode im selben Knotenprozess wie der Vite Dev Server aus, der eine genaue Annäherung an die Produktionsumgebung bietet. Server können jedoch auch in anderen JS -Laufzeiten wie [Cloudflares Workerd](https://github.com/cloudflare/workerd) mit unterschiedlichen Einschränkungen ausgeführt werden. Moderne Apps können auch in mehr als zwei Umgebungen ausgeführt werden, z. B. einem Browser, einem Knotenserver und einem Edge -Server. Vite 5 ließ diese Umgebungen nicht richtig dargestellt.

Mit Vite 6 können Benutzer ihre App während des Builds konfigurieren und Entwickler alle Umgebungen abbilden. Während Dev kann ein einzelner Vite -Dev -Server jetzt verwendet werden, um Code in mehreren verschiedenen Umgebungen gleichzeitig auszuführen. Der App -Quellcode wird weiterhin von Vite Dev Server transformiert. Neben dem gemeinsam genutzten HTTP -Server, Middlewares, gelöstes Konfiguration und Plugins -Pipeline verfügt der Vite Dev Server nun über eine Reihe unabhängiger Entwicklungsumgebungen. Jede von ihnen ist so konfiguriert, dass sie der Produktionsumgebung so genau wie möglich entspricht, und ist mit einer Dev -Laufzeit verbunden, in der der Code ausgeführt wird (für WorkerD kann der Servercode jetzt in Miniflare lokal ausgeführt werden). Im Client importiert und führt der Browser den Code aus und führt sie aus. In anderen Umgebungen holt ein Modulläufer den transformierten Code ab und bewertet sie.

![Vite Umgebungen](../../images/vite-environments.svg)

## Umgebungskonfiguration

Für ein SPA/MPA sieht die Konfiguration ähnlich aus wie Vite 5. Intern werden diese Optionen zur Konfiguration der `client` -Umgebung verwendet.

```js
export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
})
```

Dies ist wichtig, da wir VITE zugänglich halten und vermeiden möchten, neue Konzepte aufzudecken, bis sie benötigt werden.

Wenn die App aus mehreren Umgebungen besteht, können diese Umgebungen mit der `environments` -Konfigurationsoption explizit konfiguriert werden.

```js
export default {
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
}
```

Wenn die Umgebung nicht explizit dokumentiert wird, erbt die Umgebung die konfigurierten Konfigurationsoptionen auf höchstem Niveau (beispielsweise erben die neuen `server` und `edge` Umgebungen die `build.sourcemap: false` Option). Eine kleine Anzahl von Optionen auf höchstem Niveau, wie `optimizeDeps` , gelten nur für die `client` Umgebung, da sie nicht gut funktionieren, wenn sie als Standardeinstellung auf Serverumgebungen angewendet werden. Die `client` Umgebung kann auch explizit über `environments.client` konfiguriert werden. Wir empfehlen jedoch, dies mit den obersten Optionen zu tun, damit die Client-Konfiguration beim Hinzufügen neuer Umgebungen unverändert bleibt.

Die `EnvironmentOptions` Schnittstelle enthält alle Optionen pro Umwelt. Es gibt Umgebungsoptionen, die sowohl für `build` als auch für `dev` gelten, z. B. `resolve` . Und es gibt `DevEnvironmentOptions` und `BuildEnvironmentOptions` für Entwickler und erstellen bestimmte Optionen (wie `dev.warmup` oder `build.outDir` ). Einige Optionen wie `optimizeDeps` gilt nur für Dev, werden jedoch in `dev` als oberste Ebene für die Rückwärtskompatibilität als oberste Ebene gehalten.

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

Die `UserConfig` -Schnittstelle erstreckt sich von der `EnvironmentOptions` -Schnittstelle und ermöglicht es, den Client und die Standardeinstellungen für andere Umgebungen zu konfigurieren, die über die `environments` -Option konfiguriert sind. Die `client` und eine Serverumgebung namens `ssr` sind während Dev immer vorhanden. Dies ermöglicht die Rückwärtskompatibilität mit `server.ssrLoadModule(url)` und `server.moduleGraph` . Während des Builds ist die `client` -Umgebung immer vorhanden, und die `ssr` -Umgebung ist nur vorhanden, wenn sie explizit konfiguriert ist (mit `environments.ssr` oder für die Abwärtskompatibilität `build.ssr` ). Eine App muss den `ssr` -Namen nicht für seine SSR -Umgebung verwenden, sie kann beispielsweise `server` benennen.

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // Andere Optionen
}
```

Beachten Sie, dass die `ssr` oberste Eigenschaft veraltet wird, sobald die Umwelt-API stabil ist. Diese Option spielt die gleiche Rolle wie `environments` , aber für die Standardumgebung `ssr` und ermöglichte nur eine kleine Reihe von Optionen.

## Benutzerdefinierte Umgebungsinstanzen

APIs mit niedriger Ebene sind zur Verfügung, sodass Laufzeitanbieter Umgebungen für ihre Laufzeiten mit ordnungsgemäßen Standardeinstellungen bereitstellen können. Diese Umgebungen können auch andere Prozesse oder Threads hervorbringen, um die Module während des Entwicklers in einer engeren Laufzeit für die Produktionsumgebung auszuführen.

```js
import { customEnvironment } from 'vite-environment-provider'

export default {
  build: {
    outDir: '/dist/client',
  },
  environments: {
    ssr: customEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
  },
}
```

## Rückwärtskompatibilität

Die aktuelle Vite -Server -API ist noch nicht veraltet und ist mit Vite 5 rückwärts kompatibel. Die neue Umgebungs -API ist experimentell.

Die `server.moduleGraph` gibt eine gemischte Ansicht der Client- und SSR -Moduldiagramme zurück. Rückwärts kompatible gemischte Modulknoten werden aus allen Methoden zurückgegeben. Das gleiche Schema wird für die Modulknoten verwendet, die an `handleHotUpdate` übergeben wurden.

Wir empfehlen noch nicht, zur API um Umgebungs -API zu wechseln. Wir streben einen guten Teil der Benutzerbasis an, um Vite 6 vorzunehmen, sodass Plugins nicht zwei Versionen verwalten müssen. Checkout the Future Break -Änderungen für Informationen zu zukünftigen Abschreibungen und Upgrade -Pfad:

- [`this.environment` in Haken](/de/changes/this-environment-in-hooks)
- [HMR `hotUpdate` Plugin -Haken](/de/changes/hotupdate-hook)
- [Wechseln Sie zu APIs pro Umwelt](/de/changes/per-environment-apis)
- [SSR mit `ModuleRunner` API](/de/changes/ssr-using-modulerunner)
- [Gemeinsame Plugins während des Builds](/de/changes/shared-plugins-during-build)

## Zielbenutzer

Dieser Leitfaden enthält die grundlegenden Konzepte zu Umgebungen für Endbenutzer.

Plugin -Autoren verfügen über eine konsistentere API, um mit der aktuellen Umgebungskonfiguration zu interagieren. Wenn Sie sich auf VITE aufbauen, beschreibt der [Umgebungs -API -Plugins](./api-environment-plugins.md) -Handbuch die Art und Weise, wie erweiterte Plugin -APIs zur Unterstützung mehrerer benutzerdefinierter Umgebungen verfügbar sind.

Frameworks könnten sich entscheiden, Umgebungen auf verschiedenen Ebenen aufzudecken. Wenn Sie ein Framework -Autor sind, lesen Sie die [Umwelt -API -Frameworks -Handbuch](./api-environment-frameworks) weiter, um die programmatische Seite der Umwelt -API zu erfahren.

Für Laufzeitanbieter erläutert die [Umwelt -API -Runtimes -Leitfaden](./api-environment-runtimes.md) , wie man benutzerdefinierte Umgebungen bietet, die von Frameworks und Benutzern konsumiert werden können.
