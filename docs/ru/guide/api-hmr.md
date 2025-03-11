# HMR API

:::tip Note
Это клиент HMR API. Для обработки обновления HMR в плагинах см. [Handlehotupdate](./api-plugin#handlehotupdate) .

Ручной API HMR в основном предназначен для авторов фреймворков и инструментов. Как конечный пользователь, HMR, вероятно, уже обрабатывается для вас в шаблонах, конкретных стартовых, стартовых шаблонов.
:::

VITE разоблачает свой ручный HMR API через специальную объект `import.meta.hot` :

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'

// ---резать---
interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  off<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}
```

## Требуется Условная Гвардия

Прежде всего, обязательно охраняйте все использование API HMR с условным блоком, чтобы код мог быть раздутым деревьями в производстве:

```js
if (import.meta.hot) {
  // HMR -код
}
```

## Intellisense для TypeScript

Vite предоставляет определения типа для `import.meta.hot` в [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) . Вы можете создать `env.d.ts` в каталоге `src` , чтобы TypeScript выбирает определения типа:

```ts
///<reference types="vite/client">
```

## `hot.accept(cb)`

Для модуля для самостоятельного приема используйте `import.meta.hot.accept` с обратным вызовом, который получает обновленный модуль:

```js twoslash
import 'vite/client'
// ---резать---
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // newmodule не определен, когда произошел синтаксисерсор
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

Модуль, который «принимает» горячие обновления, считается **границей HMR** .

HMR VITE на самом деле не обменяется первоначально импортированным модулем: если реэкспорт модуля HMR реэкспортирует из DEP, то он отвечает за обновление этих реэкспортов (и эти экспорты должны использовать `let` ). Кроме того, импортеры вверх по цепочке из пограничного модуля не будут уведомлены об изменении. Эта упрощенная реализация HMR достаточна для большинства случаев использования DEV, одновременно позволяя нам пропустить дорогую работу по созданию прокси -модулей.

Vite требует, чтобы вызов этой функции появлялся как `import.meta.hot.accept(` (чувствительный к пробелу) в исходном коде, чтобы модуль принял обновление. Это является требованием статического анализа, который VITE делает, чтобы обеспечить поддержку HMR для модуля.

## `hot.accept(deps, cb)`

Модуль также может принять обновления от прямых зависимостей без перезагрузки:

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
// ---резать---
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // обратный вызов получает обновленный модуль ./foo.js '
    newFoo?.foo()
  })

  // Также может принять массив модулей DEP:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // Обратный вызов получает массив, где только обновленный модуль
      // не ноль. Если обновление не было успешным (синтаксическая ошибка для Ex.),
      // массив пуст
    },
  )
}
```

## `hot.dispose(cb)`

Модуль самостоятельного приема или модуль, который ожидает, что другие могут использовать `hot.dispose` для очистки любых постоянных побочных эффектов, созданных ее обновленной копией:

```js twoslash
import 'vite/client'
// ---резать---
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // Очистка побочного эффекта
  })
}
```

## `hot.prune(cb)`

Зарегистрируйте обратный вызов, который будет звонить, когда модуль больше не будет импортирован на странице. По сравнению с `hot.dispose` , это можно использовать, если исходный код сам по себе очищает побочные эффекты по обновлениям, и вам нужно очистить только при удалении со страницы. В настоящее время Vite использует это для `.css` импорта.

```js twoslash
import 'vite/client'
// ---резать---
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // Очистка побочного эффекта
  })
}
```

## `hot.data`

Объект `import.meta.hot.data` сохраняется в разных случаях одного и того же обновленного модуля. Его можно использовать для передачи информации из предыдущей версии модуля к следующей.

Обратите внимание, что повторное распределение самого `data` не поддерживается. Вместо этого вы должны мутировать свойства `data` объекта, чтобы сохранить информацию, добавленную от других обработчиков.

```js twoslash
import 'vite/client'
// ---резать---
// хорошо
import.meta.hot.data.someValue = 'hello'

// не поддерживается
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

В настоящее время это поход и есть для обратной совместимости. Это может измениться в будущем, если для него появится новое использование. Чтобы указать, что модуль не является горячим, используйте `hot.invalidate()` .

## `hot.invalidate(message?: string)`

Модуль самостоятельного вставления может осознать во время выполнения, что он не может обрабатывать обновление HMR, и поэтому обновление должно быть насильственно распространяться на импортеры. Позвонив `import.meta.hot.invalidate()` , сервер HMR будет недействительным к импортерам вызывающего абонента, как если бы вызывающий не был самостоятельно. Это зарегистрирует сообщение как в консоли браузера, так и в терминале. Вы можете передать сообщение, чтобы дать какой -то контекст о том, почему произошла недействительная.

Обратите внимание, что вы всегда должны позвонить `import.meta.hot.accept` даже если вы планируете позвонить `invalidate` сразу после этого, иначе клиент HMR не будет слушать будущие изменения в модуле самостоятельного восприятия. Чтобы четко сообщить о ваших намерениях, мы рекомендуем позвонить `invalidate` в рамках `accept` обратного вызова, как SO:

```js twoslash
import 'vite/client'
// ---резать---
import.meta.hot.accept((module) => {
  // Вы можете использовать новый экземпляр модуля, чтобы решить, не согласиться ли.
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

Слушайте событие HMR.

Следующие события HMR отправляются автоматически VITE:

- `'vite:beforeUpdate'` Когда будет применено обновление (например, модуль будет заменен)
- `'vite:afterUpdate'` Когда только что было применено (например, модуль был заменен)
- `'vite:beforeFullReload'` , когда произойдет полная перезагрузка
- `'vite:beforePrune'` Когда модули, которые больше не нужны
- `'vite:invalidate'` когда модуль недействителен с `import.meta.hot.invalidate()`
- `'vite:error'` , когда возникает ошибка (например, синтаксическая ошибка)
- `'vite:ws:disconnect'` Когда соединение WebSocket потеряно
- `'vite:ws:connect'` Когда соединение WebSocket будет установлено (повторно)

Пользовательские события HMR также могут быть отправлены из плагинов. Смотрите [Handlehotupdate](./api-plugin#handlehotupdate) для получения более подробной информации.

## `hot.off(event, cb)`

Удалить обратный вызов от слушателей событий.

## `hot.send(event, data)`

Отправьте пользовательские события обратно на сервер Dev Vite.

При вызове до подключения данные будут буферизованы и отправлены после установки соединения.

См. [Client-Server Communication](/en/guide/api-plugin.html#client-server-communication) для получения более подробной информации, включая раздел о [печати пользовательских событий](/en/guide/api-plugin.html#typescript-for-custom-events) .

## Дальнейшее Чтение

Если вы хотите узнать больше о том, как использовать HMR API и как он работает под капюшоном. Проверьте эти ресурсы:

- [Замена горячего модуля проста](https://bjornlu.com/blog/hot-module-replacement-is-easy)
