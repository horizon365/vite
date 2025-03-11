# Общие Плагины Во Время Сборки

::: tip Feedback
Дайте нам отзыв в [Обсуждении от обратной связи API Environment](https://github.com/vitejs/vite/discussions/16358)
:::

Смотрите [общие плагины во время сборки](/en/guide/api-environment.md#shared-plugins-during-build) .

Влияние сфера действия: `Vite Plugin Authors`

::: warning Future Default Change
`builder.sharedConfigBuild` был впервые введен в `v6.0` . Вы можете установить его истину, чтобы проверить, как работают ваши плагины с общей конфигурацией. Мы ищем отзывы о изменении по умолчанию в будущем майоре, как только экосистема плагина будет готова.
:::

## Мотивация

Выровняйте Dev и строить трубопроводы плагинов.

## Миграционный Гид

Чтобы иметь возможность делиться плагинами в разных средах, состояние плагинов должно быть включено в текущей среде. Плагин следующей формы будет подсчитывать количество преобразованных модулей во всех средах.

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

Если мы вместо этого хотим подсчитать количество преобразованных модулей для каждой среды, мы должны сохранить карту:

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

Чтобы упростить этот шаблон, выписывает экспорт помощника `perEnvironmentState` :

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
