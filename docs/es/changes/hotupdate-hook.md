# Gancho de complemento HMR `hotUpdate`

::: tip Feedback
Danos comentarios en [la discusión de comentarios de la API ambiental](https://github.com/vitejs/vite/discussions/16358)
:::

Estamos planeando desaprobar el gancho de complemento `handleHotUpdate` a favor de [`hotUpdate` gancho](/es/guide/api-environment#the-hotupdate-hook) para estar conscientes [de la API de entorno](/es/guide/api-environment.md) y manejar eventos de reloj adicionales con `create` y `delete` .

Alcance afectado: `Vite Plugin Authors`

::: warning Future Deprecation
`hotUpdate` se introdujo por primera vez en `v6.0` . La deprecación de `handleHotUpdate` está prevista para `v7.0` . Todavía no recomendamos alejarse de `handleHotUpdate` todavía. Si desea experimentar y darnos comentarios, puede usar el `future.removePluginHookHandleHotUpdate` a `"warn"` en su configuración VITE.
:::

## Motivación

El [gancho `handleHotUpdate`](/es/guide/api-plugin.md#handlehotupdate) permite realizar el manejo de actualizaciones de HMR personalizado. Se pasa una lista de módulos a actualizar en el `HmrContext`

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

Este gancho se llama una vez para todos los entornos, y los módulos aprobados tienen información mixta de los entornos del cliente y SSR solamente. Una vez que los marcos se mueven a entornos personalizados, se necesita un nuevo gancho que se requiere para cada uno de ellos.

El nuevo `hotUpdate` Hook funciona de la misma manera que `handleHotUpdate` pero se requiere para cada entorno y recibe una nueva instancia `HotUpdateOptions` :

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

Se puede acceder al entorno de desarrollo actual como en otros ganchos de complementos con `this.environment` . La lista `modules` ahora serán nodos de módulo del entorno actual. Cada actualización del entorno puede definir diferentes estrategias de actualización.

Este gancho ahora también se llama para eventos de reloj adicionales y no solo para `'update'` . Use `type` para diferenciar entre ellos.

## Guía De Migración

Filtre y reduzca la lista de módulos afectados para que el HMR sea más preciso.

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// Migrar a:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

Devuelve una matriz vacía y realiza una recarga completa:

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

// Migrar a:

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

Devuelva una matriz vacía y realice un manejo de HMR personalizado completo enviando eventos personalizados al cliente:

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// Migra a ...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
