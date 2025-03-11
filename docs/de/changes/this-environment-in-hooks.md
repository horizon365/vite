# `this.environment` in Haken

::: tip Feedback
Geben Sie uns Feedback bei [der Umwelt -API -Feedback -Diskussion](https://github.com/vitejs/vite/discussions/16358)
:::

Vor Vite 6 waren nur zwei Umgebungen erhältlich: `client` und `ssr` . Ein einzelnes `options.ssr` -Plugin -Hook -Argument in `resolveId` , `load` und `transform` ermöglichte es Plugin -Autoren, diese beiden Umgebungen bei der Verarbeitung von Modulen in Plugin -Haken zu unterscheiden. In Vite 6 kann eine vite -Anwendung eine beliebige Anzahl genannter Umgebungen nach Bedarf definieren. Wir führen `this.environment` im Plugin -Kontext ein, um mit der Umgebung des aktuellen Moduls in Haken zu interagieren.

Umfang beeinflussen: `Vite Plugin Authors`

::: warning Future Deprecation
`this.environment` wurde in `v6.0` eingeführt. Die Abwertung von `options.ssr` ist für `v7.0` geplant. Zu diesem Zeitpunkt empfehlen wir die Migration Ihrer Plugins, um die neue API zu verwenden. Um Ihre Verwendung zu identifizieren, setzen Sie `future.removePluginHookSsrArgument` bis `"warn"` in Ihrer Vite -Konfiguration fest.
:::

## Motivation

`this.environment` Erlauben Sie nicht nur, dass die Plugin -Hook -Implementierung den aktuellen Umgebungsnamen auch ermöglicht, sondern auch Zugriff auf die Umgebungskonfigurationsoptionen, die Moduldiagramminformationen und die Transformationspipeline ( `environment.config` , `environment.moduleGraph` , `environment.transformRequest()` ). Durch die verfügbare Umgebungsinstanz im Kontext können Plugin -Autoren die Abhängigkeit des gesamten Entwicklerservers vermeiden (normalerweise beim Start über den `configureServer` -Haken zwischengespeichert).

## Migrationsleitfaden

Damit das vorhandene Plugin eine schnelle Migration durchführt, ersetzen Sie das Argument `options.ssr` durch `this.environment.name !== 'client'` in den `resolveId` , `load` und `transform` Haken:

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [! Code -]
      const isSSR = this.environment.name !== 'client' // [! Code ++]

      if (isSSR) {
        // SSR -spezifische Logik
      } else {
        // Clientspezifische Logik
      }
    },
  }
}
```

Für eine robustere langfristigere Implementierung sollte der Plugin-Hook für [mehrere Umgebungen](/de/guide/api-environment.html#accessing-the-current-environment-in-hooks) mit feinkörnigen Umgebungsoptionen verarbeiten, anstatt sich auf den Umgebungsnamen zu verlassen.
