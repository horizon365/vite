# Gemeinsame Plugins Während Des Builds

::: tip Feedback
Geben Sie uns Feedback bei [der Umwelt -API -Feedback -Diskussion](https://github.com/vitejs/vite/discussions/16358)
:::

Siehe [gemeinsame Plugins während des Builds](/de/guide/api-environment.md#shared-plugins-during-build) .

Umfang beeinflussen: `Vite Plugin Authors`

::: warning Future Default Change
`builder.sharedConfigBuild` wurde zum ersten Mal in `v6.0` eingeführt. Sie können feststellen, wie Ihre Plugins mit einer gemeinsam genutzten Konfiguration funktionieren. Wir suchen Feedback zum Ändern der Standardeinstellung in einem zukünftigen Major, sobald das Plugin -Ökosystem fertig ist.
:::

## Motivation

Ausrichten von Entwickler und Plugin -Pipelines bauen.

## Migrationsleitfaden

Um Plugins über Umgebungen zu teilen, muss der Plugin -Status von der aktuellen Umgebung gekennzeichnet sein. Ein Plugin der folgenden Form zählt die Anzahl der transformierten Module in allen Umgebungen.

```js
function CountTransformedModulesPlugin() {
  let transformedModules
  return {
    name: 'count-transformed-modules',
    buildStart() {
      transformedModules = 0
    },
    transform(id) {
      transformedModules++
    },
    buildEnd() {
      console.log(transformedModules)
    },
  }
}
```

Wenn wir stattdessen die Anzahl der transformierten Module für jede Umgebung zählen möchten, müssen wir eine Karte aufbewahren:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    }
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

Um dieses Muster zu vereinfachen, exportiert Vite einen Helfer `perEnvironmentState` :

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = perEnvironmentState<{ count: number }>(() => ({ count: 0 }))
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state(this).count = 0
    }
    transform(id) {
      state(this).count++
    },
    buildEnd() {
      console.log(this.environment.name, state(this).count)
    }
  }
}
```
