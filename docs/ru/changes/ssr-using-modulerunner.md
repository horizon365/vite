# SSR с использованием `ModuleRunner` API

::: tip Feedback
Дайте нам отзыв в [Обсуждении от обратной связи API Environment](https://github.com/vitejs/vite/discussions/16358)
:::

`server.ssrLoadModule` был заменен импортом с [модуля бегуна](/en/guide/api-environment#modulerunner) .

Влияние сфера действия: `Vite Plugin Authors`

::: warning Future Deprecation
`ModuleRunner` был впервые введен в `v6.0` . Унимок `server.ssrLoadModule` запланирована для будущего майора. Чтобы идентифицировать ваше использование, установите `future.removeSsrLoadModule` до `"warn"` в конфигурации Vite.
:::

## Мотивация

`server.ssrLoadModule(url)` позволяет только импортировать модули в среде `ssr` и может выполнять модули только в том же процессе, что и сервер Vite Dev. Для приложений с пользовательскими средами каждый связан с `ModuleRunner` , которые могут работать в отдельном потоке или процессе. Чтобы импортировать модули, теперь у нас есть `moduleRunner.import(url)` .

## Миграционный Гид

Проверьте [API Environment API для Руководства Frameworks](../guide/api-environment-frameworks.md) .
