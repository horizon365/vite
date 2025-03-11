# HMR `hotUpdate` Plugin -Haken

::: tip Feedback
Geben Sie uns Feedback bei [der Umwelt -API -Feedback -Diskussion](https://github.com/vitejs/vite/discussions/16358)
:::

Wir planen, den `handleHotUpdate` -Plugin -Haken zugunsten von [`hotUpdate` Hook](/de/guide/api-environment#the-hotupdate-hook) zur [API -API -API](/de/guide/api-environment.md) zu zerlegen und zusätzliche Uhrenveranstaltungen mit `create` und `delete` zu verarbeiten.

Betroffener Umfang: `Vite Plugin Authors`

::: warning Future Deprecation
`hotUpdate` wurde zuerst in `v6.0` eingeführt. Die Abwertung von `handleHotUpdate` ist für `v7.0` geplant. Wir empfehlen noch nicht, sich von `handleHotUpdate` zu entfernen. Wenn Sie experimentieren und uns Feedback geben möchten, können Sie die `future.removePluginHookHandleHotUpdate` bis `"warn"` in Ihrer VITE -Konfiguration verwenden.
:::

## Motivation

Der [`handleHotUpdate` -Hook](/de/guide/api-plugin.md#handlehotupdate) ermöglicht die Durchführung einer benutzerdefinierten HMR -Update. Eine Liste der zu aktualisierenden Module ist in der `HmrContext` übergeben

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

Dieser Haken wird für alle Umgebungen einmal aufgerufen, und die übergebenen Module haben nur gemischte Informationen aus den Kunden- und SSR -Umgebungen. Sobald Frameworks in benutzerdefinierte Umgebungen wechselt, ist ein neuer Haken erforderlich, der für jeden von ihnen verlangt wird.

Der neue `hotUpdate` -Haken funktioniert auf die gleiche Weise wie `handleHotUpdate` , ist jedoch für jede Umgebung gefordert und erhält eine neue `HotUpdateOptions` -Instanz:

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

Die aktuelle Entwicklerumgebung kann wie in anderen Plugin -Haken mit `this.environment` zugegriffen werden. Die `modules` -Liste ist nun nur Modulknoten aus der aktuellen Umgebung. Jedes Umgebungs -Update kann verschiedene Aktualisierungsstrategien definieren.

Dieser Haken ist jetzt auch für zusätzliche Uhrenereignisse und nicht nur für `'update'` gefordert. Verwenden Sie `type` um zwischen ihnen zu unterscheiden.

## Migrationsleitfaden

Filtern Sie die betroffene Modulliste und beschränken Sie, dass die HMR genauer ist.

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// Migrieren zu:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

Geben Sie ein leeres Array zurück und führen Sie eine vollständige Reload durch:

```js
handleHotUpdate({ server, modules, timestamp }) {
  // Module manuell ungültig
  const invalidatedModules = new Set()
  for (const mod of modules) {
    server.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  server.ws.send({ type: 'full-reload' })
  return []
}

// Migrieren zu:

hotUpdate({ modules, timestamp }) {
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

Geben Sie ein leeres Array zurück und führen Sie eine vollständige benutzerdefinierte HMR -Handhabung durch, indem Sie benutzerdefinierte Ereignisse an den Client senden:

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// Migrieren zu ...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
