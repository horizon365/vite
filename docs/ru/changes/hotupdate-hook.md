# HMR `hotUpdate` плагин крюк

::: tip Feedback
Дайте нам отзыв в [Обсуждении от обратной связи API Environment](https://github.com/vitejs/vite/discussions/16358)
:::

Мы планируем осуществить крюк с плагином `handleHotUpdate` в пользу [`hotUpdate` крючка](/en/guide/api-environment#the-hotupdate-hook) , чтобы стать [API Environment API](/en/guide/api-environment.md) , и обрабатывать дополнительные часы с `create` и `delete` .

Затронутая область действия: `Vite Plugin Authors`

::: warning Future Deprecation
`hotUpdate` был впервые введен в `v6.0` . Унимок `handleHotUpdate` запланирована на `v7.0` . Мы еще не рекомендуем уходить из `handleHotUpdate` . Если вы `"warn"` `future.removePluginHookHandleHotUpdate` конфигурации Vite.
:::

## Мотивация

[Крюк `handleHotUpdate`](/en/guide/api-plugin.md#handlehotupdate) позволяет выполнять пользовательскую обработку обновлений HMR. Список модулей, которые должны быть обновлены, передается в `HmrContext`

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

Этот крюк вызывается один раз для всех сред, а пропущенные модули имеют смешанную информацию только из среды клиента и SSR. Как только фреймворки перемещаются в пользовательские среды, необходим новый крючок, который требуется для каждого из них.

Новый крюк `hotUpdate` работает так же, как `handleHotUpdate` , но он требуется для каждой среды и получает новый экземпляр `HotUpdateOptions` :

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

Текущая среда Dev может быть доступна, как в других крючках плагина с `this.environment` . Список `modules` теперь будет узлами модуля только из текущей среды. Каждое обновление среды может определять различные стратегии обновления.

Этот крючок также теперь требуется для дополнительных наблюдений за наблюдением и не только для `'update'` . Используйте `type` чтобы различить их.

## Миграционный Гид

Отфильтруйте и сузите список пораженных модулей, чтобы HMR был более точным.

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// Мигрировать:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

Верните пустой массив и выполните полную перезагрузку:

```js
handleHotUpdate({ server, modules, timestamp }) {
  // Недейть модулей вручную
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

// Мигрировать:

hotUpdate({ modules, timestamp }) {
  // Недейть модулей вручную
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

Верните пустой массив и выполните полную пользовательскую обработку HMR, отправив пользовательские события клиенту:

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// Мигрировать в ...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
