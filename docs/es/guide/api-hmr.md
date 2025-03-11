# API HMR

:::tip Note
Esta es la API HMR del cliente. Para manejar la actualización de HMR en complementos, consulte [HandleHotUpdate](./api-plugin#handlehotupdate) .

La API HMR manual está destinada principalmente a los autores marco y herramientas. Como usuario final, es probable que HMR ya esté manejado para usted en las plantillas de inicio específicas del marco.
:::

VITE expone su API HMR manual a través del objeto Special `import.meta.hot` :

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'

// ---cortar---
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

## Guardia Condicional Requerida

En primer lugar, asegúrese de proteger todo el uso de la API HMR con un bloque condicional para que el código pueda ser sacudido en la producción:

```js
if (import.meta.hot) {
  // Código HMR
}
```

## IntelliSense para TypeScript

Vite proporciona definiciones de tipo para `import.meta.hot` en [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) . Puede crear un directorio `env.d.ts` en el directorio `src` para que TypeScript elija las definiciones de tipo:

```ts
///<reference types="vite/client">
```

## `hot.accept(cb)`

Para que un módulo se autoacepte, use `import.meta.hot.accept` con una devolución de llamada que recibe el módulo actualizado:

```js twoslash
import 'vite/client'
// ---cortar---
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // Newmodule no está definido cuando ocurrió sintaxerror
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

Un módulo que "acepta" actualizaciones en caliente se considera un **límite de HMR** .

El HMR de Vite en realidad no cambia el módulo importado originalmente: si un módulo de límite HMR reexporta las importaciones de un DEP, entonces es responsable de actualizar esos reexportaciones (y estas exportaciones deben estar usando `let` ). Además, los importadores en la cadena del módulo límite no serán notificados del cambio. Esta implementación simplificada de HMR es suficiente para la mayoría de los casos de uso de desarrollo, al tiempo que nos permite omitir el costoso trabajo de generar módulos proxy.

VITE requiere que la llamada a esta función aparezca como `import.meta.hot.accept(` (Whitespace-sensible) en el código fuente para que el módulo acepte la actualización. Este es un requisito del análisis estático que Vite hace para habilitar el soporte de HMR para un módulo.

## `hot.accept(deps, cb)`

Un módulo también puede aceptar actualizaciones de dependencias directas sin volver a cargar:

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
// ---cortar---
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // La devolución de llamada recibe el módulo actualizado './foo.js'
    newFoo?.foo()
  })

  // También puede aceptar una matriz de módulos DEP:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // La devolución de llamada recibe una matriz donde solo está el módulo actualizado
      // no nulo. Si la actualización no fue exitosa (error de sintaxis para Ex.),
      // la matriz esta vacía
    },
  )
}
```

## `hot.dispose(cb)`

Un módulo de autoaceptación o un módulo que espera ser aceptado por otros puede usar `hot.dispose` para limpiar cualquier efecto secundario persistente creado por su copia actualizada:

```js twoslash
import 'vite/client'
// ---cortar---
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // efecto secundario de limpieza
  })
}
```

## `hot.prune(cb)`

Registre una devolución de llamada que llamará cuando el módulo ya no se importe en la página. En comparación con `hot.dispose` , esto se puede usar si el código fuente limpia los efectos secundarios por sí solo en las actualizaciones y solo necesita limpiar cuando se elimina de la página. Vite actualmente usa esto para `.css` importaciones.

```js twoslash
import 'vite/client'
// ---cortar---
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // efecto secundario de limpieza
  })
}
```

## `hot.data`

El objeto `import.meta.hot.data` se persiste en diferentes instancias del mismo módulo actualizado. Se puede usar para transmitir información de una versión anterior del módulo al siguiente.

Tenga en cuenta que la reasignación de `data` en sí no es compatible. En cambio, debe mutar propiedades del objeto `data` para que se conserven información agregada desde otros manejadores.

```js twoslash
import 'vite/client'
// ---cortar---
// OK
import.meta.hot.data.someValue = 'hello'

// no compatible
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

Este es actualmente un NOOP y está ahí para la compatibilidad con atraso. Esto podría cambiar en el futuro si hay un nuevo uso para ello. Para indicar que el módulo no es actualizado, use `hot.invalidate()` .

## `hot.invalidate(message?: string)`

Un módulo de autoaceptación puede darse cuenta durante el tiempo de ejecución que no puede manejar una actualización de HMR, por lo que la actualización debe propagarse con fuerza a los importadores. Al llamar a `import.meta.hot.invalidate()` , el servidor HMR invalidará a los importadores de la persona que llama, como si la persona que llame no fuera por sí misma. Esto registrará un mensaje tanto en la consola del navegador como en la terminal. Puede transmitir un mensaje para dar algún contexto sobre por qué ocurrió la invalidación.

Tenga en cuenta que siempre debe llamar `import.meta.hot.accept` incluso si planea llamar `invalidate` inmediatamente después, o de lo contrario, el cliente HMR no escuchará los cambios futuros en el módulo autoaceptado. Para comunicar claramente su intención, recomendamos llamar `invalidate` dentro de la `accept` de llamada como así:

```js twoslash
import 'vite/client'
// ---cortar---
import.meta.hot.accept((module) => {
  // Puede usar la nueva instancia del módulo para decidir si invalidar.
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

Escuche un evento HMR.

VITE envía los siguientes eventos de HMR:

- `'vite:beforeUpdate'` Cuando una actualización está a punto de aplicarse (por ejemplo, se reemplazará un módulo)
- `'vite:afterUpdate'` cuando se acaba de aplicar una actualización (por ejemplo, se ha reemplazado un módulo)
- `'vite:beforeFullReload'` Cuando una recarga completa está a punto de ocurrir
- `'vite:beforePrune'` Cuando los módulos que ya no son necesarios están a punto de ser podados
- `'vite:invalidate'` Cuando un módulo se invalida con `import.meta.hot.invalidate()`
- `'vite:error'` Cuando ocurre un error (por ejemplo, error de sintaxis)
- `'vite:ws:disconnect'` Cuando se pierde la conexión WebSocket
- `'vite:ws:connect'` Cuando la conexión WebSocket está (re) establecida

Los eventos HMR personalizados también se pueden enviar desde complementos. Consulte [HandleHotUpdate](./api-plugin#handlehotupdate) para obtener más detalles.

## `hot.off(event, cb)`

Elimine la devolución de llamada de los oyentes del evento.

## `hot.send(event, data)`

Envíe los eventos personalizados al servidor Dev de Vite.

Si se llama antes conectado, los datos se almacenarán y enviarán una vez que se establezca la conexión.

Consulte [la comunicación cliente-servidor](/es/guide/api-plugin.html#client-server-communication) para obtener más detalles, incluida una sección sobre [la escritura de eventos personalizados](/es/guide/api-plugin.html#typescript-for-custom-events) .

## Lectura Adicional

Si desea obtener más información sobre cómo usar la API HMR y cómo funciona bajo el casco. Mira estos recursos:

- [El reemplazo del módulo caliente es fácil](https://bjornlu.com/blog/hot-module-replacement-is-easy)
