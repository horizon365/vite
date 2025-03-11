# Wechseln Sie zu APIs pro Umwelt

::: tip Feedback
Geben Sie uns Feedback bei [der Umwelt -API -Feedback -Diskussion](https://github.com/vitejs/vite/discussions/16358)
:::

Mehrere APIs aus `ViteDevServer` , die sich auf Moduldiagramme und Module in Bezug auf Transformationen beziehen, wurden in die `DevEnvironment` Instanzen verschoben.

Umfang beeinflussen: `Vite Plugin Authors`

::: warning Future Deprecation
Die `Environment` -Instanz wurde erstmals bei `v6.0` eingeführt. Die Abwertung von `server.moduleGraph` und anderen Methoden, die sich jetzt in Umgebungen befinden, ist für `v7.0` geplant. Wir empfehlen noch nicht, sich von Servermethoden zu entfernen. Um Ihre Verwendung zu identifizieren, stellen Sie diese in Ihrer Vite -Konfiguration ein.

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## Motivation

In Vite V5 und zuvor hatte ein einzelner Vite -Dev -Server immer zwei Umgebungen ( `client` und `ssr` ). Die `server.moduleGraph` hatten gemischte Module aus diesen beiden Umgebungen. Die Knoten wurden über `clientImportedModules` und `ssrImportedModules` Listen verbunden (aber für jeden wurde eine einzelne `importers` -Liste beibehalten). Ein transformiertes Modul wurde durch einen `id` und einen `ssr` Booleschen dargestellt. Dieser Boolesche musste an APIs übergeben werden, zum Beispiel `server.moduleGraph.getModuleByUrl(url, ssr)` und `server.transformRequest(url, { ssr })` .

In Vite V6 ist es jetzt möglich, eine beliebige Anzahl von benutzerdefinierten Umgebungen ( `client` , `ssr` , `edge` usw.) zu erstellen. Ein einzelner `ssr` Boolean ist nicht mehr aus. Anstatt die APIs aus dem Formular `server.transformRequest(url, { environment })` zu ändern, haben wir diese Methoden in die Umgebungsinstanz verschoben, sodass sie ohne Vite Dev Server aufgerufen werden können.

## Migrationsleitfaden

- `server.moduleGraph` -> [`environment.moduleGraph`](/de/guide/api-environment#separate-module-graphs)
- `server.transformRequest(url, ssr)` -> `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` -> `environment.warmupRequest(url)`
