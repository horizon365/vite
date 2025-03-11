# Complementos Compartidos Durante La Compilación

::: tip Feedback
Danos comentarios en [la discusión de comentarios de la API ambiental](https://github.com/vitejs/vite/discussions/16358)
:::

Ver [complementos compartidos durante la compilación](/es/guide/api-environment.md#shared-plugins-during-build) .

Afectar el alcance: `Vite Plugin Authors`

::: warning Future Default Change
`builder.sharedConfigBuild` se introdujo primero en `v6.0` . Puede configurarlo verdadero para verificar cómo funcionan sus complementos con una configuración compartida. Estamos buscando comentarios sobre cómo cambiar el valor predeterminado en un futuro futuro una vez que el ecosistema del complemento esté listo.
:::

## Motivación

Alinee el desarrollo y construya tuberías de complementos.

## Guía De Migración

Para poder compartir complementos en todos los entornos, el estado de complemento debe estar conectado por el entorno actual. Un complemento de la siguiente forma contará el número de módulos transformados en todos los entornos.

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

Si en su lugar queremos contar el número de módulos transformados para cada entorno, necesitamos mantener un mapa:

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

Para simplificar este patrón, Vite exporta un Helper `perEnvironmentState` :

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
