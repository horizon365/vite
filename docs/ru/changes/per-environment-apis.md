# Перейти к API-интерфейсам для каждого окружающей среды

::: tip Feedback
Дайте нам отзыв в [Обсуждении от обратной связи API Environment](https://github.com/vitejs/vite/discussions/16358)
:::

Множественные API -интерфейсы от `ViteDevServer` , связанные с графиком модуля и модулями преобразования, были перемещены в `DevEnvironment` экземпляры.

Влияние сфера действия: `Vite Plugin Authors`

::: warning Future Deprecation
Экземпляр `Environment` был впервые введен в `v6.0` . Унимок `server.moduleGraph` и других методов, которые сейчас находятся в среде, запланировано на `v7.0` . Мы еще не рекомендуем уходить от методов сервера. Чтобы определить ваше использование, установите их в конфигурации Vite.

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## Мотивация

В VITE V5 и ранее у одного сервера Vite Dev всегда было две среды ( `client` и `ssr` ). У `server.moduleGraph` были смешанные модули из обеих этих сред. Узлы были подключены через `clientImportedModules` и `ssrImportedModules` списка (но для каждого из них поддерживался один список `importers` ). Трансформированный модуль был представлен `id` и `ssr` логическим. Это логическое нужно было перенести в API, например, `server.moduleGraph.getModuleByUrl(url, ssr)` и `server.transformRequest(url, { ssr })` .

В VITE V6 теперь можно создать любое количество пользовательских сред ( `client` , `ssr` , `edge` и т. Д.). Единого `ssr` логины больше недостаточно. Вместо того, чтобы изменить API, чтобы соответствовать форме `server.transformRequest(url, { environment })` , мы перенесли эти методы в экземпляр среды, позволяя их вызвать без сервера Vite Dev.

## Миграционный Гид

- `server.moduleGraph` -> [`environment.moduleGraph`](/en/guide/api-environment#separate-module-graphs)
- `server.transformRequest(url, ssr)` -> `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` -> `environment.warmupRequest(url)`
