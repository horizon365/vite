# `this.environment` в крючках

::: tip Feedback
Дайте нам отзыв в [Обсуждении от обратной связи API Environment](https://github.com/vitejs/vite/discussions/16358)
:::

Перед Vite 6 были доступны только две среды: `client` и `ssr` . `options.ssr` аргумент крючков с плагином в `resolveId` , `load` и `transform` позволил авторам плагина дифференцировать эти две среды при обработке модулей в крючках плагина. В Vite 6 приложение Vite может определить любое количество именованных среда по мере необходимости. Мы представляем `this.environment` в контексте плагина, чтобы взаимодействовать с средой текущего модуля в крючках.

Влияние сфера действия: `Vite Plugin Authors`

::: warning Future Deprecation
`this.environment` был введен в `v6.0` . Унимок `options.ssr` запланирована на `v7.0` . В этот момент мы начнем рекомендовать мигрирование ваших плагинов, чтобы использовать новый API. Чтобы идентифицировать ваше использование, установите `future.removePluginHookSsrArgument` до `"warn"` в конфигурации.
:::

## Мотивация

`this.environment` не только позволяет реализации плагина крючка знать текущее имя среды, но и дает доступ к параметрам конфигурации среды, информации о графе модуля и преобразовании трубопровода ( `environment.config` , `environment.moduleGraph` , `environment.transformRequest()` ). Наличие экземпляра среды в контексте позволяет авторам плагинов избегать зависимости всего сервера Dev (обычно кэшируется при запуске через `configureServer` крючка).

## Миграционный Гид

Чтобы существующий плагин выполнял быструю миграцию, замените аргумент `options.ssr` на `this.environment.name !== 'client'` в `resolveId` , `load` и `transform` крючках:

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [! Код -]
      const isSSR = this.environment.name !== 'client' // [! Code ++]

      if (isSSR) {
        // SSR -специфическая логика
      } else {
        // Конкретная логика клиента
      }
    },
  }
}
```

Для более надежной долгосрочной реализации плагин крюк должен обрабатывать для [нескольких сред,](/en/guide/api-environment.html#accessing-the-current-environment-in-hooks) используя мелкозернистые опции среды, а не полагаться на имя среды.
