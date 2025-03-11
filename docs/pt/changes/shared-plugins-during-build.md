# Plugins Compartilhados Durante a Construção

::: tip Feedback
Dê -nos feedback na [discussão sobre feedback da API ambiente](https://github.com/vitejs/vite/discussions/16358)
:::

Veja [plugins compartilhados durante a construção](/pt/guide/api-environment.md#shared-plugins-during-build) .

AFETO ACENDE: `Vite Plugin Authors`

::: warning Future Default Change
`builder.sharedConfigBuild` foi introduzido pela primeira vez em `v6.0` . Você pode defini -lo true para verificar como seus plugins funcionam com uma configuração compartilhada. Estamos procurando feedback sobre como alterar o padrão em um futuro major, assim que o ecossistema de plug -in estiver pronto.
:::

## Motivação

Alinhe os pipelines de plug -in dev e construa.

## Guia De Migração

Para poder compartilhar plugins entre ambientes, o estado do plug -in deve ser digitado pelo ambiente atual. Um plug -in do formulário a seguir contará o número de módulos transformados em todos os ambientes.

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

Se quisermos contar o número de módulos transformados para cada ambiente, precisamos manter um mapa:

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

Para simplificar esse padrão, vite exporta um auxiliar `perEnvironmentState` :

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
