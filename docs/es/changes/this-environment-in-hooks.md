# `this.environment` en ganchos

::: tip Feedback
Danos comentarios en [la discusión de comentarios de la API ambiental](https://github.com/vitejs/vite/discussions/16358)
:::

Antes de Vite 6, solo estaban disponibles dos entornos: `client` y `ssr` . Un solo argumento de gancho de complemento `options.ssr` en `resolveId` , `load` y `transform` permitieron a los autores de complementos diferenciar entre estos dos entornos al procesar módulos en ganchos de complementos. En Vite 6, una aplicación VITE puede definir cualquier número de entornos con nombre según sea necesario. Estamos presentando `this.environment` en el contexto del complemento para interactuar con el entorno del módulo actual en ganchos.

Afectar el alcance: `Vite Plugin Authors`

::: warning Future Deprecation
`this.environment` se introdujo en `v6.0` . La deprecación de `options.ssr` está prevista para `v7.0` . En ese punto, comenzaremos a recomendar migrar sus complementos para usar la nueva API. Para identificar su uso, establezca `future.removePluginHookSsrArgument` a `"warn"` en su configuración VITE.
:::

## Motivación

`this.environment` no solo permite que la implementación del gancho del complemento conozca el nombre actual del entorno, sino que también brinda acceso a las opciones de configuración del entorno, la información del gráfico del módulo y la tubería de transformación ( `environment.config` , `environment.moduleGraph` , `environment.transformRequest()` ). Tener la instancia del entorno disponible en el contexto permite a los autores de complementos evitar la dependencia de todo el servidor de desarrollo (generalmente almacenado en caché al inicio a través del gancho `configureServer` ).

## Guía De Migración

Para que el complemento existente haga una migración rápida, reemplace el argumento `options.ssr` con `this.environment.name !== 'client'` en los `resolveId` , `load` y `transform` ganchos:

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [! Código -]
      const isSSR = this.environment.name !== 'client' // [! Código ++]

      if (isSSR) {
        // Lógica específica de SSR
      } else {
        // Lógica específica del cliente
      }
    },
  }
}
```

Para una implementación a largo plazo más robusta, el gancho de complemento debe manejar para [múltiples entornos](/es/guide/api-environment.html#accessing-the-current-environment-in-hooks) que utilizan opciones de entorno de grano fino en lugar de confiar en el nombre del entorno.
