# Gancho de plug -in HMR `hotUpdate`

::: tip Feedback
Dê -nos feedback na [discussão sobre feedback da API ambiente](https://github.com/vitejs/vite/discussions/16358)
:::

Planejamos depreciar o gancho de plug -in `handleHotUpdate` em favor de [`hotUpdate` gancho](/pt/guide/api-environment#the-hotupdate-hook) para estar ciente [do ambiente](/pt/guide/api-environment.md) e lidar com eventos de relógio adicionais com `create` e `delete` .

Escopo afetado: `Vite Plugin Authors`

::: warning Future Deprecation
`hotUpdate` foi introduzido pela primeira vez em `v6.0` . A depreciação de `handleHotUpdate` está planejada para `v7.0` . Ainda não recomendamos me afastar de `handleHotUpdate` ainda. Se você deseja experimentar e nos dar feedback, pode usar os `future.removePluginHookHandleHotUpdate` a `"warn"` na sua configuração Vite.
:::

## Motivação

O [gancho `handleHotUpdate`](/pt/guide/api-plugin.md#handlehotupdate) permite executar o manuseio de atualização HMR personalizado. Uma lista de módulos a serem atualizados é passada no `HmrContext`

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

Esse gancho é chamado uma vez para todos os ambientes, e os módulos passados possuem informações mistas apenas dos ambientes cliente e SSR. Depois que as estruturas se movem para ambientes personalizados, é necessário um novo gancho que seja necessário para cada um deles.

O novo gancho `hotUpdate` funciona da mesma maneira que `handleHotUpdate` mas é chamado para cada ambiente e recebe uma nova instância `HotUpdateOptions` :

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

O ambiente de desenvolvimento atual pode ser acessado como em outros ganchos de plug -in com `this.environment` . A `modules` Lista agora serão nós do módulo apenas do ambiente atual. Cada atualização do ambiente pode definir diferentes estratégias de atualização.

Este gancho também agora é solicitado a eventos de relógio adicionais e não apenas para `'update'` . Use `type` para diferenciar entre eles.

## Guia De Migração

Filtre e restrinja a lista de módulos afetados para que o HMR seja mais preciso.

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// Migrar para:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

Retorne uma matriz vazia e execute uma recarga completa:

```js
handleHotUpdate({ server, modules, timestamp }) {
  // Invalidar módulos manualmente
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

// Migrar para:

hotUpdate({ modules, timestamp }) {
  // Invalidar módulos manualmente
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

Retorne uma matriz vazia e execute o manuseio completo de HMR personalizado enviando eventos personalizados para o cliente:

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// Migrar para ...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
